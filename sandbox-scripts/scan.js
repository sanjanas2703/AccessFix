// Runs INSIDE the Daytona sandbox: node scan.js <jobDir>
// Reads job.json, writes result.json and before.jpg to jobDir.
import path from 'node:path';
import { screenshot, withPage } from './lib/browser.js';
import { runAllChecks } from './lib/checks.js';
import { runJob } from './lib/job.js';

await runJob(async (job, jobDir) =>
  withPage(job, async (page, { url, blockedRequests }) => {
    await screenshot(page, path.join(jobDir, 'before.jpg'));
    const checks = await runAllChecks(page);
    return { finalUrl: url, title: (await page.title()).slice(0, 200), blockedRequests, ...checks };
  }),
);
