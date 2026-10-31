import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { AREAS } from '../../sandbox-scripts/lib/rules.js';
import { parsePublicUrl, resolvePublic } from '../../sandbox-scripts/lib/netguard.js';
import { compareFindings } from '../services/compare.js';
import { connectSandbox, runScript, syncScripts } from '../services/daytona.js';
import { getGuidance } from '../services/neo4j.js';
import { explainFindings } from '../services/nosana.js';
import { enqueue } from '../services/queue.js';
import { buildRecommendations } from '../services/recommendations.js';

const router = Router();

const MAX_STORED_SCANS = 20;
const DEMO_LABEL = 'Bundled demo page (served inside the sandbox)';
const IMAGE_NAMES = new Set(['before.jpg', 'simulation.jpg', 'after.jpg']);

// In-memory scan state for polling. Lost when the server restarts. Screenshots
// are kept apart so that polling responses stay small.
const scans = new Map();
const images = new Map();

function logEvent(scan, event) {
  scan.sandboxEvents.push({ time: new Date().toISOString(), event });
}

function setIntegration(scan, name, status, detail) {
  scan.integrations[name] = { status, detail };
}

function store(scan) {
  scans.set(scan.scanId, scan);
  images.set(scan.scanId, {});
  for (const oldest of scans.keys()) {
    if (scans.size <= MAX_STORED_SCANS) break;
    scans.delete(oldest);
    images.delete(oldest);
  }
}

// What the sandbox should open. A demo job never carries a caller-supplied URL.
const targetOf = (scan) => (scan.demo ? { demo: true } : { url: scan.url });

// Runs inside the queue, mutating `scan` so GET /api/scan/:id sees each stage.
// Daytona is required. Neo4j and Nosana failures are reported, never replaced.
async function runPipeline(scan) {
  try {
    scan.status = 'connecting';
    const sandbox = await connectSandbox();
    await syncScripts(sandbox);
    setIntegration(scan, 'daytona', 'ok', 'Connected to the shared sandbox');
    logEvent(scan, 'Connected to the existing Daytona sandbox');

    scan.status = 'scanning';
    logEvent(scan, `Opening ${scan.url} in Chromium inside the sandbox`);
    const { result, images: shots } = await runScript(sandbox, 'scan.js', targetOf(scan), ['before.jpg']);
    Object.assign(images.get(scan.scanId), shots);

    scan.finalUrl = scan.demo ? DEMO_LABEL : result.finalUrl;
    scan.pageTitle = result.title;
    scan.blockedRequests = result.blockedRequests;
    scan.axeVersion = result.axeVersion;
    scan.reducedMotionQuery = result.reducedMotionQuery;
    scan.findings = result.findings
      .filter((finding) => AREAS.includes(finding.area))
      .map((finding, index) => ({ ...finding, id: `f${index + 1}`, adjustmentIds: [], guidance: null, ai: null }));
    logEvent(scan, `Scan finished: ${scan.findings.length} findings. Browser closed`);

    try {
      const simulation = await runScript(sandbox, 'colorblind.js', targetOf(scan), ['simulation.jpg']);
      Object.assign(images.get(scan.scanId), simulation.images);
      scan.simulation = simulation.result.simulation;
    } catch (err) {
      logEvent(scan, `Colour-vision simulation skipped: ${err.message}`);
    }
    logEvent(scan, 'Temporary sandbox files removed');

    scan.status = 'retrieving';
    try {
      const guidance = await getGuidance([...new Set(scan.findings.map((finding) => finding.ruleId))]);
      Object.assign(scan, buildRecommendations(scan.findings, guidance));
      setIntegration(scan, 'neo4j', 'ok', `Matched ${guidance.size} issue types in the knowledge graph`);
      logEvent(scan, `Neo4j returned guidance for ${guidance.size} issue types`);
    } catch (err) {
      setIntegration(scan, 'neo4j', 'unavailable', err.message);
      logEvent(scan, `Neo4j unavailable: ${err.message}`);
    }

    scan.status = 'explaining';
    if (scan.findings.length === 0) {
      setIntegration(scan, 'nosana', 'skipped', 'No findings to explain');
    } else if (scan.integrations.neo4j.status !== 'ok') {
      setIntegration(scan, 'nosana', 'skipped', 'Explanations need the knowledge graph, which was unavailable');
    } else {
      try {
        const { explanations, model, truncated, failedBatches } = await explainFindings(scan.findings);
        for (const finding of scan.findings) finding.ai = explanations.get(finding.id) ?? null;
        const notes = [
          truncated ? ' Only the first findings were sent.' : '',
          failedBatches ? ` ${failedBatches} batches failed, so some findings have no explanation.` : '',
        ].join('');
        setIntegration(scan, 'nosana', 'ok', `${explanations.size} explanations from ${model}.${notes}`);
        logEvent(scan, `Nosana explained ${explanations.size} findings`);
      } catch (err) {
        setIntegration(scan, 'nosana', 'unavailable', err.message);
        logEvent(scan, `Nosana unavailable: ${err.message}`);
      }
    }

    scan.status = 'done';
  } catch (err) {
    // Log the message only: SDK error objects can carry request headers.
    console.error(`Scan ${scan.scanId} failed: ${err.message}`);
    if (scan.integrations.daytona.status === 'pending') setIntegration(scan, 'daytona', 'unavailable', err.message);
    scan.error = err.message;
    logEvent(scan, `Scan failed: ${err.message}`);
    scan.status = 'failed';
  }
}

async function runPreview(scan, adjustments) {
  const preview = scan.preview;
  try {
    preview.status = 'running';
    const sandbox = await connectSandbox();
    await syncScripts(sandbox);
    const { result, images: shots } = await runScript(
      sandbox,
      'retest.js',
      { ...targetOf(scan), adjustments },
      ['after.jpg'],
    );
    Object.assign(images.get(scan.scanId), shots);

    const after = result.findings.filter((finding) => AREAS.includes(finding.area));
    Object.assign(preview, {
      applied: result.applied,
      contrast: result.contrast,
      reducedMotionQuery: result.reducedMotionQuery,
      comparison: compareFindings(scan.findings, after),
      status: 'done',
    });
    logEvent(scan, `Preview finished: ${result.applied.filter((item) => item.applied).length} adjustments applied`);
  } catch (err) {
    console.error(`Preview for ${scan.scanId} failed: ${err.message}`);
    preview.error = err.message;
    preview.status = 'failed';
    logEvent(scan, `Preview failed: ${err.message}`);
  }
}

router.post('/', async (req, res) => {
  const { url, demo } = req.body ?? {};
  const isDemo = demo === true;
  let scanUrl = DEMO_LABEL;

  if (!isDemo) {
    if (typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'A url is required' });
    }
    try {
      const parsed = parsePublicUrl(url.trim());
      await resolvePublic(parsed.hostname);
      scanUrl = parsed.href;
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  const scan = {
    scanId: randomUUID(),
    url: scanUrl,
    demo: isDemo,
    status: 'queued',
    error: null,
    sandboxEvents: [],
    integrations: {
      daytona: { status: 'pending', detail: '' },
      neo4j: { status: 'pending', detail: '' },
      nosana: { status: 'pending', detail: '' },
    },
    findings: [],
    adjustments: [],
    preview: null,
  };

  try {
    enqueue(() => runPipeline(scan)); // Not awaited: it handles its own errors.
  } catch (err) {
    return res.status(429).json({ error: err.message });
  }
  store(scan);
  logEvent(scan, 'Scan queued');
  res.status(202).json({ scanId: scan.scanId });
});

router.get('/:id', (req, res) => {
  const scan = scans.get(req.params.id);
  if (!scan) {
    return res.status(404).json({ error: 'Scan not found' });
  }
  res.json(scan);
});

router.get('/:id/images/:name', (req, res) => {
  const image = IMAGE_NAMES.has(req.params.name) ? images.get(req.params.id)?.[req.params.name] : null;
  if (!image) {
    return res.status(404).json({ error: 'Image not found' });
  }
  res.set('Cache-Control', 'no-store').type('image/jpeg').send(image);
});

// The client sends adjustment IDs only: parameters always come from the stored scan.
router.post('/:id/preview', (req, res) => {
  const scan = scans.get(req.params.id);
  if (!scan) {
    return res.status(404).json({ error: 'Scan not found' });
  }
  if (scan.status !== 'done') {
    return res.status(409).json({ error: 'The scan has not finished' });
  }
  if (['queued', 'running'].includes(scan.preview?.status)) {
    return res.status(409).json({ error: 'A preview is already running' });
  }

  const ids = req.body?.adjustmentIds;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Select at least one adjustment' });
  }
  const selected = scan.adjustments.filter((adjustment) => ids.includes(adjustment.id));
  if (selected.length !== new Set(ids).size) {
    return res.status(400).json({ error: 'Unknown adjustment' });
  }

  const previous = scan.preview;
  scan.preview = { status: 'queued', adjustmentIds: selected.map((adjustment) => adjustment.id), error: null };
  try {
    enqueue(() => runPreview(scan, selected));
  } catch (err) {
    scan.preview = previous;
    return res.status(429).json({ error: err.message });
  }
  res.status(202).json({ status: 'queued' });
});

// Previews never touch the real site, so reverting only discards the result.
router.delete('/:id/preview', (req, res) => {
  const scan = scans.get(req.params.id);
  if (!scan) {
    return res.status(404).json({ error: 'Scan not found' });
  }
  if (['queued', 'running'].includes(scan.preview?.status)) {
    return res.status(409).json({ error: 'A preview is still running' });
  }
  scan.preview = null;
  delete images.get(scan.scanId)['after.jpg'];
  res.status(204).end();
});

export default router;
