// Runs INSIDE the Daytona sandbox: node colorblind.js <jobDir>
// Writes a colour-vision simulation screenshot, so a person can review the
// colour-only findings. It is a viewing aid: it does not fix or prove anything.
import path from 'node:path';
import { screenshot, withPage } from './lib/browser.js';
import { runJob } from './lib/job.js';

const SIMULATION = 'deuteranopia';

await runJob(async (job, jobDir) =>
  withPage(job, async (page) => {
    const session = await page.context().newCDPSession(page);
    await session.send('Emulation.setEmulatedVisionDeficiency', { type: SIMULATION });
    await screenshot(page, path.join(jobDir, 'simulation.jpg'));
    return { simulation: SIMULATION };
  }),
);
