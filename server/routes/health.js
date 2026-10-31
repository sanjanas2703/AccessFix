import { Router } from 'express';
import { getSandboxStatus } from '../services/daytona.js';
import { countSeededIssues } from '../services/neo4j.js';
import { verifyNosana } from '../services/nosana.js';

const router = Router();

async function check(fn) {
  try {
    return { status: 'ok', ...(await fn()) };
  } catch (err) {
    return { status: 'unavailable', detail: err.message };
  }
}

export const checkIntegrations = async () => ({
  daytona: await check(async () => {
    const { state, installed } = await getSandboxStatus();
    if (state !== 'started') throw new Error(`Sandbox is ${state}. Run "npm run sandbox:setup".`);
    if (!installed) throw new Error('Sandbox is started, but Playwright is not installed. Run "npm run sandbox:setup".');
    return { detail: 'Sandbox started and Playwright installed' };
  }),
  neo4j: await check(async () => {
    const issues = await countSeededIssues();
    if (issues === 0) throw new Error('Connected, but the graph is empty. Run "npm run seed".');
    return { detail: `${issues} issue types seeded` };
  }),
  nosana: await check(async () => {
    const { model } = await verifyNosana();
    return { detail: `Model ${model} responded` };
  }),
});

router.get('/', async (req, res) => {
  res.json(await checkIntegrations());
});

export default router;
