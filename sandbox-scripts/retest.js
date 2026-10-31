// Runs INSIDE the Daytona sandbox: node retest.js <jobDir>
// Opens a fresh copy of the page, applies the selected adjustments to that page
// load only, then writes result.json and after.jpg to jobDir.
import path from 'node:path';
import { applyAdjustments, wantsReducedMotion } from './lib/adjustments.js';
import { screenshot, withPage } from './lib/browser.js';
import { runAllChecks } from './lib/checks.js';
import { contrastRatio } from './lib/contrast.js';
import { runJob } from './lib/job.js';

const AFTER_ADJUST_MS = 500;

// Reads the colour the browser actually computed, rather than trusting the input.
async function measureContrast(page, adjustments) {
  const measured = [];
  for (const { id, type, params } of adjustments) {
    if (type !== 'contrast-color') continue;
    const color = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      const channels = element && getComputedStyle(element).color.match(/\d+(\.\d+)?/g);
      return channels ? `#${channels.slice(0, 3).map((c) => Number(c).toString(16).padStart(2, '0')).join('')}` : null;
    }, params.selector);
    measured.push({
      id,
      selector: params.selector,
      ratioBefore: params.ratioBefore,
      ratioAfter: color ? Math.round(contrastRatio(color, params.background) * 100) / 100 : null,
    });
  }
  return measured;
}

await runJob(async (job, jobDir) =>
  withPage({ ...job, reducedMotion: wantsReducedMotion(job.adjustments) }, async (page, { blockedRequests }) => {
    const applied = await applyAdjustments(page, job.adjustments);
    await page.waitForTimeout(AFTER_ADJUST_MS);
    await screenshot(page, path.join(jobDir, 'after.jpg'));
    const contrast = await measureContrast(page, job.adjustments);
    const checks = await runAllChecks(page);
    return { applied, contrast, blockedRequests, ...checks };
  }),
);
