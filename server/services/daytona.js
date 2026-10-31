// Teammate area: sandbox/scanners.
// Connects to the team's existing sandbox. This module never creates, stops or
// deletes a sandbox, and only removes the temporary job folders it created.
import { randomUUID } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Daytona } from '@daytonaio/sdk';
import { rootDir } from '../env.js';

const APP_DIR = '/home/daytona/accessfix';
const JOBS_DIR = '/tmp/accessfix';
const SCRIPTS_DIR = path.join(rootDir, 'sandbox-scripts');
const DEMO_PAGE = path.join(rootDir, 'demo-broken-site', 'index.html');
const SCRIPT_TIMEOUT_SEC = 110;
const SETUP_COMMAND = 'PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --omit=dev --no-audit --no-fund';
const SETUP_HINT = 'Run "npm run sandbox:setup" from the repo root.';

let client;

function getClient() {
  if (!process.env.DAYTONA_API_KEY || !process.env.DAYTONA_SANDBOX_ID) {
    throw new Error('Daytona is not configured: set DAYTONA_API_KEY and DAYTONA_SANDBOX_ID in .env.');
  }
  client ??= new Daytona({ apiKey: process.env.DAYTONA_API_KEY });
  return client;
}

async function getSandbox() {
  try {
    return await getClient().get(process.env.DAYTONA_SANDBOX_ID);
  } catch (err) {
    if (err.message.startsWith('Daytona is not configured')) throw err;
    throw new Error(`The Daytona sandbox is unavailable: ${err.message}`, { cause: err });
  }
}

// Fails clearly rather than starting a shared sandbox behind a teammate's back.
export async function connectSandbox() {
  const sandbox = await getSandbox();
  if (sandbox.state !== 'started') {
    throw new Error(`The Daytona sandbox is ${sandbox.state ?? 'in an unknown state'}, not started. ${SETUP_HINT}`);
  }
  return sandbox;
}

async function isInstalled(sandbox) {
  const { exitCode } = await sandbox.process.executeCommand(
    `test -d ${APP_DIR}/node_modules/playwright && test -d ${APP_DIR}/node_modules/@axe-core/playwright`,
  );
  return exitCode === 0;
}

// Uploads the current scripts, so the sandbox cannot run a stale version.
export async function syncScripts(sandbox) {
  const entries = await readdir(SCRIPTS_DIR, { recursive: true, withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && !entry.parentPath.includes('node_modules'));
  const uploads = await Promise.all(
    files.map(async (entry) => {
      const local = path.join(entry.parentPath, entry.name);
      const relative = path.relative(SCRIPTS_DIR, local).split(path.sep).join('/');
      return { source: await readFile(local), destination: `${APP_DIR}/${relative}` };
    }),
  );
  await sandbox.process.executeCommand(`mkdir -p ${APP_DIR}/lib`);
  await sandbox.fs.uploadFiles(uploads);

  if (!(await isInstalled(sandbox))) {
    throw new Error(`Playwright is not installed in the sandbox. ${SETUP_HINT}`);
  }
}

// Runs one script in its own temp folder and always removes that folder.
// `job` holds { url } or { demo: true } plus script-specific fields.
export async function runScript(sandbox, scriptName, job, imageNames = []) {
  const jobDir = `${JOBS_DIR}/${randomUUID()}`;
  await sandbox.process.executeCommand(`mkdir -p ${jobDir}`);

  try {
    const { demo, ...payload } = job;
    const uploads = [];
    if (demo) {
      payload.demoFile = `${jobDir}/demo.html`;
      uploads.push({ source: await readFile(DEMO_PAGE), destination: payload.demoFile });
    }
    uploads.push({ source: Buffer.from(JSON.stringify(payload)), destination: `${jobDir}/job.json` });
    await sandbox.fs.uploadFiles(uploads);

    // Only generated names reach the shell. Page data stays in job.json.
    const run = await sandbox.process.executeCommand(
      `node ${scriptName} ${jobDir}`,
      APP_DIR,
      undefined,
      SCRIPT_TIMEOUT_SEC,
    );

    let result;
    try {
      result = JSON.parse((await sandbox.fs.downloadFile(`${jobDir}/result.json`)).toString('utf8'));
    } catch {
      throw new Error(`${scriptName} produced no result (exit ${run.exitCode}): ${run.result.slice(-300)}`);
    }
    if (!result.ok) throw new Error(result.error);

    const images = {};
    for (const name of imageNames) {
      images[name] = await sandbox.fs.downloadFile(`${jobDir}/${name}`);
    }
    return { result, images };
  } finally {
    await sandbox.fs.deleteFile(jobDir, true).catch((err) => {
      console.error(`Could not remove ${jobDir}: ${err.message}`);
    });
  }
}

export async function getSandboxStatus() {
  const sandbox = await getSandbox();
  const started = sandbox.state === 'started';
  return { state: sandbox.state, installed: started ? await isInstalled(sandbox) : null };
}

// Explicit, operator-run setup: starts the shared sandbox and installs into APP_DIR.
export async function setupSandbox(log = () => {}) {
  const sandbox = await getSandbox();
  if (sandbox.state !== 'started') {
    log(`Sandbox is ${sandbox.state}. Starting it...`);
    await sandbox.start(120);
  }
  log('Uploading sandbox scripts...');
  await sandbox.process.executeCommand(`mkdir -p ${APP_DIR}/lib`);
  await syncScripts(sandbox).catch((err) => {
    if (!err.message.startsWith('Playwright is not installed')) throw err;
  });

  log('Installing Playwright and axe-core (Chromium is already in the image)...');
  const install = await sandbox.process.executeCommand(SETUP_COMMAND, APP_DIR, undefined, 300);
  if (install.exitCode !== 0) {
    throw new Error(`npm install failed in the sandbox: ${install.result.slice(-300)}`);
  }
  return sandbox;
}
