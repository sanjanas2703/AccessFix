// Starts the shared sandbox if it is stopped and installs AccessFix into its own
// folder. Safe to re-run. It never deletes the sandbox.
import '../env.js';
import { getSandboxStatus, setupSandbox } from '../services/daytona.js';

try {
  await setupSandbox(console.log);
  const { state, installed } = await getSandboxStatus();
  console.log(`Sandbox state: ${state}. Playwright installed: ${installed}.`);
} catch (err) {
  console.error(`Sandbox setup failed: ${err.message}`);
  process.exitCode = 1;
}
