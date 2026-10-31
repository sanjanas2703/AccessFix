// The only changes AccessFix can make to a page. Each type is a fixed function
// with validated parameters: nothing here executes generated code, and AI output
// never reaches this module. Changes apply to the current page load only.

export const ADJUSTMENT_TYPES = ['reduced-motion', 'contrast-color', 'aria-label-from-context', 'status-text-label'];

const COLOR = /^#[0-9a-f]{6}$/i;
const MAX_SELECTOR = 300;
const MAX_LABEL = 80;

const VALIDATORS = {
  'reduced-motion': () => true,
  'contrast-color': ({ selector, color }) => isSelector(selector) && COLOR.test(color ?? ''),
  'aria-label-from-context': ({ selector, label }) => isSelector(selector) && isLabel(label),
  'status-text-label': ({ selector, label }) => isSelector(selector) && isLabel(label),
};

function isSelector(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_SELECTOR;
}

function isLabel(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_LABEL;
}

export function isValidAdjustment(adjustment) {
  return VALIDATORS[adjustment?.type]?.(adjustment.params ?? {}) ?? false;
}

// True when the page must be opened with prefers-reduced-motion: reduce.
export const wantsReducedMotion = (adjustments) =>
  adjustments.some((adjustment) => adjustment.type === 'reduced-motion');

// Runs in the page. Takes data only; all behaviour is defined below.
function applyInPage(adjustments) {
  const sheet = new CSSStyleSheet();
  const rules = [];

  const handlers = {
    'reduced-motion': () => {
      rules.push(
        `*, *::before, *::after {
          animation-duration: 0.001ms !important;
          animation-delay: 0ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
          transition-delay: 0ms !important;
          scroll-behavior: auto !important;
        }`,
      );
      document.querySelectorAll('video').forEach((video) => video.pause());
      document.querySelectorAll('marquee').forEach((marquee) => marquee.stop());
    },
    'contrast-color': ({ selector, color }) => {
      rules.push(`${selector} { color: ${color} !important; }`);
    },
    'aria-label-from-context': ({ selector, label }, element) => {
      element.setAttribute('aria-label', label);
    },
    'status-text-label': ({ label }, element) => {
      // A text node leaves element positions unchanged, so selectors in the
      // re-test still match the original findings.
      element.after(document.createTextNode(` [${label}]`));
    },
  };

  const results = adjustments.map(({ id, type, params = {} }) => {
    try {
      const element = params.selector ? document.querySelector(params.selector) : null;
      if (params.selector && !element) return { id, type, applied: false, reason: 'Element not found' };
      handlers[type](params, element);
      return { id, type, applied: true };
    } catch (err) {
      return { id, type, applied: false, reason: err.message };
    }
  });

  // adoptedStyleSheets, unlike a <style> tag, is not blocked by the page's CSP.
  sheet.replaceSync(rules.join('\n'));
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  return results;
}

export async function applyAdjustments(page, adjustments) {
  const valid = adjustments.filter(isValidAdjustment);
  const results = await page.evaluate(applyInPage, valid);
  const rejected = adjustments
    .filter((adjustment) => !valid.includes(adjustment))
    .map(({ id, type }) => ({ id, type, applied: false, reason: 'Failed validation' }));
  return [...results, ...rejected];
}
