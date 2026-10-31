import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { createSandbox, destroySandbox, runScript } from '../services/daytona.js';
import { proposeFixes } from '../services/fixer.js';
import { saveScan } from '../services/neo4j.js';
import { analyzeScreenshot } from '../services/vision.js';
import { computeScores } from '../scoring.js';

const router = Router();

// In-memory scan state for polling. Lost when the server restarts.
const scans = new Map();

// Pause between mock stages so the UI has visible progress.
// TODO: Remove once the stages do real work and take real time.
const STAGE_DELAY_MS = 1500;

const emptyScores = () => ({
  blind: 0,
  colourblind: 0,
  motor: 0,
  deaf: 0,
  cognitive: 0,
  overall: 0,
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function logEvent(scan, event) {
  scan.sandboxEvents.push({ time: new Date().toISOString(), event });
}

// Runs in the background after POST /api/scan responds, mutating `scan` so
// GET /api/scan/:id sees each stage. Issues are mock data from the stubs.
async function runPipeline(scan) {
  let sandbox;
  try {
    await wait(STAGE_DELAY_MS);
    sandbox = await createSandbox(scan.url);
    logEvent(scan, `Sandbox created (${sandbox.id})`);

    // Scan: page checks, colour-vision checks, then screenshot analysis.
    scan.status = 'scanning';
    logEvent(scan, `Scanning ${scan.url}`);
    await wait(STAGE_DELAY_MS);
    const scanResult = await runScript(sandbox, 'scan.js');
    const colorblindResult = await runScript(sandbox, 'colorblind.js');
    const visionIssues = await analyzeScreenshot(colorblindResult.screenshotPath);
    scan.issues = [...scanResult.issues, ...colorblindResult.issues, ...visionIssues];
    scan.scoresBefore = computeScores(scan.issues);
    logEvent(scan, `Scan finished: ${scan.issues.length} issues found`);

    // Patch: ask the LLM for fixes.
    scan.status = 'patching';
    logEvent(scan, 'Patching: generating and applying fixes');
    await wait(STAGE_DELAY_MS);
    const fixes = await proposeFixes(scan.issues);
    logEvent(scan, `Patching finished: ${fixes.length} fixes applied`);

    // Re-test: only issues that now pass count as fixed.
    scan.status = 'retesting';
    logEvent(scan, 'Re-testing patched site');
    await wait(STAGE_DELAY_MS);
    const { passedIssueIds } = await runScript(sandbox, 'retest.js', { fixes });
    for (const issue of scan.issues) {
      issue.fixed = passedIssueIds.includes(issue.id);
    }
    scan.scoresAfter = computeScores(scan.issues);
    logEvent(scan, `Re-test finished: ${passedIssueIds.length} issues resolved`);

    await saveScan(scan);
    await destroySandbox(sandbox);
    logEvent(scan, 'Sandbox destroyed');
    scan.status = 'done';
  } catch (err) {
    console.error(`Scan ${scan.scanId} failed:`, err);
    logEvent(scan, `Scan failed: ${err.message}`);
    scan.status = 'failed';
    if (sandbox) await destroySandbox(sandbox).catch(() => {});
  }
}

router.post('/', (req, res) => {
  const { url } = req.body ?? {};
  if (typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'A url is required' });
  }

  const scan = {
    scanId: randomUUID(),
    url: url.trim(),
    status: 'queued',
    sandboxEvents: [],
    issues: [],
    scoresBefore: emptyScores(),
    scoresAfter: emptyScores(),
  };
  scans.set(scan.scanId, scan);
  logEvent(scan, 'Scan queued');

  runPipeline(scan); // Not awaited: it handles its own errors.
  res.status(202).json({ scanId: scan.scanId });
});

router.get('/:id', (req, res) => {
  const scan = scans.get(req.params.id);
  if (!scan) {
    return res.status(404).json({ error: 'Scan not found' });
  }
  res.json(scan);
});

export default router;
