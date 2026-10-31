// Evidence gathering shared by the initial scan and the re-test. Page content is
// untrusted: everything collected here is data, and is truncated before it leaves.
import { AxeBuilder } from '@axe-core/playwright';
import { adjustForegroundToContrast, simulatedDifference } from './contrast.js';
import { AUTOMATED_VIOLATION, AXE_RULES, HEURISTIC_OBSERVATION, MANUAL_REVIEW } from './rules.js';

const MAX_FINDINGS_PER_RULE = 25;
const MAX_HTML = 300;
const MOTION_SAMPLE_MS = 1500;

const truncate = (text, max = MAX_HTML) => {
  const value = String(text ?? '');
  return value.length > max ? `${value.slice(0, max)}…` : value;
};

function finding(fields) {
  const { ruleId, selector } = fields;
  return { key: `${ruleId}|${selector}`, candidateAdjustments: [], evidence: {}, ...fields };
}

// A selector crossing an iframe or shadow root arrives as a nested array. Those
// are reported, but cannot be targeted by a page-level adjustment.
function selectorOf(node) {
  const target = node.target ?? [];
  return { selector: target.flat(Infinity).join(' >> '), simple: target.length === 1 && typeof target[0] === 'string' };
}

function contrastCandidate(node, simple, selector) {
  if (!simple) return [];
  const data = node.any?.[0]?.data ?? {};
  const { fgColor, bgColor, expectedContrastRatio, contrastRatio } = data;
  const target = Number.parseFloat(expectedContrastRatio);
  if (!fgColor || !bgColor || !target) return [];
  try {
    const color = adjustForegroundToContrast(fgColor, bgColor, target + 0.1);
    const params = { selector, color, background: bgColor, ratioBefore: contrastRatio };
    return color ? [{ type: 'contrast-color', params }] : [];
  } catch {
    return [];
  }
}

// Only an adjacent, unassociated <label> or a single sibling caption counts as
// reliable context. No other label is ever generated.
async function labelCandidate(page, selector) {
  const label = await page.evaluate((sel) => {
    const control = document.querySelector(sel);
    const previous = control?.previousElementSibling;
    if (!previous) return null;
    const isOrphanLabel = previous.tagName === 'LABEL' && !previous.control;
    const parentOnlyHasBoth = control.parentElement?.children.length === 2 && previous.tagName === 'SPAN';
    return isOrphanLabel || parentOnlyHasBoth ? previous.textContent.trim() : null;
  }, selector);
  if (!label || label.length > 80) return [];
  return [{ type: 'aria-label-from-context', params: { selector, label }, context: 'Text of the adjacent label' }];
}

export async function runAxe(page) {
  const results = await new AxeBuilder({ page }).withRules(Object.keys(AXE_RULES)).analyze();
  const findings = [];

  for (const violation of results.violations) {
    for (const node of violation.nodes.slice(0, MAX_FINDINGS_PER_RULE)) {
      const { selector, simple } = selectorOf(node);
      const isContrast = violation.id === 'color-contrast';
      const data = isContrast ? (node.any?.[0]?.data ?? {}) : {};
      const canLabel = simple && violation.id === 'label';
      findings.push(
        finding({
          ruleId: violation.id,
          area: AXE_RULES[violation.id],
          findingType: AUTOMATED_VIOLATION,
          selector,
          html: truncate(node.html),
          summary: truncate(violation.help),
          evidence: isContrast
            ? {
                contrastRatio: data.contrastRatio,
                required: Number.parseFloat(data.expectedContrastRatio),
                foreground: data.fgColor,
                background: data.bgColor,
              }
            : {},
          candidateAdjustments: isContrast
            ? contrastCandidate(node, simple, selector)
            : canLabel
              ? await labelCandidate(page, selector)
              : [],
        }),
      );
    }
  }

  // Axe could not decide these, for example text over a background image.
  for (const incomplete of results.incomplete) {
    for (const node of incomplete.nodes.slice(0, MAX_FINDINGS_PER_RULE)) {
      findings.push(
        finding({
          ruleId: incomplete.id,
          area: AXE_RULES[incomplete.id],
          findingType: MANUAL_REVIEW,
          selector: selectorOf(node).selector,
          html: truncate(node.html),
          summary: `Axe could not determine this automatically: ${truncate(incomplete.help)}`,
        }),
      );
    }
  }

  return { findings, axeVersion: results.testEngine?.version };
}

// A short path of tag, id and nth-of-type. Runs in the page, so it is passed as source.
function cssPath(element) {
  const parts = [];
  for (let el = element; el && el.nodeType === 1 && el !== document.documentElement; el = el.parentElement) {
    if (el.id && /^[A-Za-z][\w-]*$/.test(el.id)) {
      parts.unshift(`#${el.id}`);
      break;
    }
    const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.tagName === el.tagName) : [];
    const position = siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(el) + 1})` : '';
    parts.unshift(`${el.tagName.toLowerCase()}${position}`);
  }
  return parts.join(' > ');
}

const evaluateWithPath = (page, fn, arg) => page.evaluate(`(${fn})(${cssPath}, ${JSON.stringify(arg ?? null)})`);

function collectMotionStart() {
  const rects = new Map();
  const elements = [...document.body.querySelectorAll('*')].slice(0, 1500);
  for (const element of elements) {
    const box = element.getBoundingClientRect();
    if (box.width > 0 && box.height > 0) rects.set(element, [box.x, box.y]);
  }

  const canvases = new Map();
  for (const canvas of document.querySelectorAll('canvas')) {
    try {
      canvases.set(canvas, canvas.toDataURL());
    } catch {
      canvases.set(canvas, null);
    }
  }

  const videos = new Map([...document.querySelectorAll('video')].map((video) => [video, video.currentTime]));
  window.__accessfixMotion = { rects, canvases, videos };
}

function collectMotionEnd(pathOf) {
  const { rects, canvases, videos } = window.__accessfixMotion;
  delete window.__accessfixMotion;

  const animations = [];
  const animatedElements = new Set();
  for (const animation of document.getAnimations()) {
    const element = animation.effect?.target;
    if (!element || animation.playState !== 'running') continue;
    animatedElements.add(element);
    const timing = animation.effect.getComputedTiming();
    animations.push({
      selector: pathOf(element),
      name: String(animation.animationName ?? animation.transitionProperty ?? 'animation').slice(0, 80),
      durationMs: Math.round(Number(timing.duration) || 0),
      infinite: timing.iterations === Infinity,
    });
  }

  // Elements that moved with no CSS animation of their own, keeping only the
  // outermost, because children of a moved element move with it.
  const insideAnimation = (element) => {
    for (let el = element; el; el = el.parentElement) {
      if (animatedElements.has(el)) return true;
    }
    return false;
  };
  const moved = [];
  for (const [element, [x, y]] of rects) {
    if (!element.isConnected || insideAnimation(element)) continue;
    const box = element.getBoundingClientRect();
    const distance = Math.hypot(box.x - x, box.y - y);
    if (distance >= 1) moved.push({ element, distance: Math.round(distance) });
  }
  const movedSet = new Set(moved.map((entry) => entry.element));
  const jsMovement = moved
    .filter((entry) => !movedSet.has(entry.element.parentElement))
    .slice(0, 25)
    .map((entry) => ({ selector: pathOf(entry.element), distancePx: entry.distance }));

  const changingCanvases = [];
  const unreadableCanvases = [];
  for (const [canvas, before] of canvases) {
    if (!canvas.isConnected) continue;
    try {
      if (before === null) unreadableCanvases.push(pathOf(canvas));
      else if (canvas.toDataURL() !== before) changingCanvases.push(pathOf(canvas));
    } catch {
      unreadableCanvases.push(pathOf(canvas));
    }
  }

  const playingVideos = [];
  for (const [video, time] of videos) {
    if (video.isConnected && !video.paused && video.currentTime !== time) {
      playingVideos.push({ selector: pathOf(video), autoplay: video.autoplay, loop: video.loop });
    }
  }

  const animatedImages = [...document.images]
    .filter((image) => /\.(gif|apng)(\?|#|$)/i.test(image.currentSrc))
    .slice(0, 25)
    .map((image) => pathOf(image));

  let reducedMotionQuery = 'not-found';
  for (const sheet of document.styleSheets) {
    try {
      const text = [...sheet.cssRules].map((rule) => rule.cssText).join(' ');
      if (text.includes('prefers-reduced-motion')) reducedMotionQuery = 'found';
    } catch {
      if (reducedMotionQuery === 'not-found') reducedMotionQuery = 'unknown-cross-origin-css';
    }
  }

  return { animations, jsMovement, changingCanvases, unreadableCanvases, playingVideos, animatedImages, reducedMotionQuery };
}

// Motion is observed, not judged: WCAG 2.2.2 depends on duration, context and
// whether a pause control exists, which this check cannot fully establish.
export async function runMotionChecks(page) {
  await evaluateWithPath(page, collectMotionStart);
  await page.waitForTimeout(MOTION_SAMPLE_MS);
  const signals = await evaluateWithPath(page, collectMotionEnd);
  const area = 'motion';
  const findings = [];
  const reducedMotion = { type: 'reduced-motion', params: {} };

  const seen = new Set();
  for (const animation of signals.animations) {
    if (seen.has(animation.selector)) continue;
    seen.add(animation.selector);
    findings.push(
      finding({
        ruleId: 'css-animation-observed',
        area,
        findingType: HEURISTIC_OBSERVATION,
        selector: animation.selector,
        summary: `CSS animation "${animation.name}" was running${animation.infinite ? ' and repeats forever' : ''}.`,
        evidence: animation,
        candidateAdjustments: [reducedMotion],
      }),
    );
  }

  for (const movement of signals.jsMovement) {
    findings.push(
      finding({
        ruleId: 'js-movement-observed',
        area,
        findingType: HEURISTIC_OBSERVATION,
        selector: movement.selector,
        summary: `Element moved ${movement.distancePx}px during sampling without a CSS animation, which suggests script-driven or scroll-linked movement.`,
        evidence: movement,
      }),
    );
  }

  for (const video of signals.playingVideos) {
    findings.push(
      finding({
        ruleId: 'video-playing-observed',
        area,
        findingType: HEURISTIC_OBSERVATION,
        selector: video.selector,
        summary: 'A video was playing without user action.',
        evidence: video,
        candidateAdjustments: [reducedMotion],
      }),
    );
  }

  for (const selector of signals.changingCanvases) {
    findings.push(
      finding({
        ruleId: 'canvas-changing-observed',
        area,
        findingType: HEURISTIC_OBSERVATION,
        selector,
        summary: 'Canvas pixels changed during sampling. CSS cannot stop canvas animation.',
      }),
    );
  }

  for (const selector of signals.unreadableCanvases) {
    findings.push(
      finding({
        ruleId: 'canvas-changing-observed',
        area,
        findingType: MANUAL_REVIEW,
        selector,
        summary: 'A canvas could not be read, so any motion inside it is unknown.',
      }),
    );
  }

  for (const selector of signals.animatedImages) {
    findings.push(
      finding({
        ruleId: 'animated-image-present',
        area,
        findingType: MANUAL_REVIEW,
        selector,
        summary: 'This image format can be animated. Check whether it moves. CSS cannot pause it.',
      }),
    );
  }

  return { findings, reducedMotionQuery: signals.reducedMotionQuery };
}

const STATUS_WORDS = { error: 'Error', danger: 'Error', invalid: 'Error', success: 'Success', warning: 'Warning' };

function collectColourSignals(pathOf, statusWords) {
  const rgb = (value) => {
    const match = value.match(/rgba?\(([^)]+)\)/);
    if (!match) return null;
    const [r, g, b, a = 1] = match[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return a === 0 ? null : [r, g, b];
  };
  const visible = (element) => {
    const box = element.getBoundingClientRect();
    return box.width > 0 && box.height > 0;
  };
  const statusFrom = (element) => {
    const tokens = String(element.className?.baseVal ?? element.className ?? '').toLowerCase().split(/[\s_-]+/);
    return tokens.map((token) => statusWords[token]).find(Boolean) ?? null;
  };
  const alternative = (element) =>
    Boolean(element.textContent.trim() || element.getAttribute('aria-label') || element.getAttribute('title'));

  const indicators = [];

  // Small swatches with no text alternative, compared against similar siblings.
  for (const element of [...document.body.querySelectorAll('span, div, i, li')].slice(0, 3000)) {
    const box = element.getBoundingClientRect();
    const background = rgb(getComputedStyle(element).backgroundColor);
    if (!background || !visible(element) || box.width > 24 || box.height > 24 || alternative(element)) continue;
    const peers = [...(element.parentElement?.parentElement?.querySelectorAll(element.tagName) ?? [])]
      .filter((peer) => peer !== element && peer.getBoundingClientRect().width <= 24)
      .map((peer) => rgb(getComputedStyle(peer).backgroundColor))
      .filter(Boolean);
    const differentPeer = peers.find((peer) => peer.join() !== background.join());
    indicators.push({
      kind: 'swatch',
      selector: pathOf(element),
      html: element.outerHTML,
      color: background,
      peerColor: differentPeer ?? null,
      status: statusFrom(element),
    });
  }

  // Form fields whose only difference from their peers is a coloured border.
  const fields = [...document.querySelectorAll('input:not([type=hidden]), textarea, select')].filter(visible);
  const colourOf = (field) => rgb(getComputedStyle(field).borderTopColor);
  for (const field of fields) {
    const color = colourOf(field);
    const peer = fields.find((other) => other !== field && colourOf(other)?.join() !== color?.join());
    const declaresState = field.getAttribute('aria-invalid') === 'true' || field.hasAttribute('aria-errormessage');
    const status = statusFrom(field);
    if (color && peer && status && !declaresState) {
      indicators.push({
        kind: 'field-border',
        selector: pathOf(field),
        html: field.outerHTML,
        color,
        peerColor: colourOf(peer),
        status,
      });
    }
  }

  return indicators.slice(0, 25);
}

// Always manual review: a script can suspect that colour carries meaning, but
// cannot confirm what the author intended.
export async function runColourChecks(page) {
  const indicators = await evaluateWithPath(page, collectColourSignals, STATUS_WORDS);
  const findings = indicators.map((indicator) => {
    const difference = indicator.peerColor ? simulatedDifference(indicator.color, indicator.peerColor) : null;
    const meaning = indicator.status ? `The class name suggests "${indicator.status}".` : 'Its meaning is unknown.';
    return finding({
      ruleId: 'color-only-indicator',
      area: 'colour',
      findingType: MANUAL_REVIEW,
      selector: indicator.selector,
      html: truncate(indicator.html),
      summary:
        indicator.kind === 'swatch'
          ? `Small coloured element with no text alternative. ${meaning}`
          : `Field differs from others by border colour, with no programmatic error state. ${meaning}`,
      evidence: { kind: indicator.kind, colourDifference: difference },
      candidateAdjustments: indicator.status
        ? [{ type: 'status-text-label', params: { selector: indicator.selector, label: indicator.status } }]
        : [],
    });
  });
  return { findings };
}

const GENERIC_NAMES = /^(image|img|photo|picture|icon|graphic|logo|button|link|click here|here|read more|more|untitled|spacer)$/i;
const FILE_NAME = /\.(png|jpe?g|gif|svg|webp|avif)$/i;

// axe confirms a name exists, not that it helps. These are suspicions for a person.
export async function runNameQualityChecks(page) {
  const named = await evaluateWithPath(page, (pathOf) =>
    [...document.querySelectorAll('img[alt], a[href], button')].slice(0, 2000).map((element) => ({
      selector: pathOf(element),
      html: element.outerHTML,
      name: (element.getAttribute('alt') ?? element.getAttribute('aria-label') ?? element.textContent).trim(),
    })),
  );

  const findings = named
    .filter(({ name }) => name && (GENERIC_NAMES.test(name) || FILE_NAME.test(name)))
    .slice(0, MAX_FINDINGS_PER_RULE)
    .map(({ selector, html, name }) =>
      finding({
        ruleId: 'name-may-not-be-meaningful',
        area: 'blind',
        findingType: MANUAL_REVIEW,
        selector,
        html: truncate(html),
        summary: `Has the name "${truncate(name, 60)}", which may not describe its purpose.`,
      }),
    );
  return { findings };
}

// Every check, in one place, so the scan and the re-test cannot diverge.
export async function runAllChecks(page) {
  const axe = await runAxe(page);
  const names = await runNameQualityChecks(page);
  const colour = await runColourChecks(page);
  const motion = await runMotionChecks(page);
  return {
    findings: [...axe.findings, ...names.findings, ...colour.findings, ...motion.findings],
    axeVersion: axe.axeVersion,
    reducedMotionQuery: motion.reducedMotionQuery,
  };
}
