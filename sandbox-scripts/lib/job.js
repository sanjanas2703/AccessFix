// Entry-point wrapper: reads the job, enforces a deadline, writes the result.
// The backend passes only a job directory, so no page data reaches a shell.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const JOB_DEADLINE_MS = 100_000;

export async function runJob(handler) {
  const jobDir = process.argv[2];
  const deadline = setTimeout(() => {
    console.error('Job deadline exceeded');
    process.exit(124);
  }, JOB_DEADLINE_MS);

  try {
    const job = JSON.parse(await readFile(path.join(jobDir, 'job.json'), 'utf8'));
    const result = await handler(job, jobDir);
    await writeFile(path.join(jobDir, 'result.json'), JSON.stringify({ ok: true, ...result }));
  } catch (err) {
    await writeFile(path.join(jobDir, 'result.json'), JSON.stringify({ ok: false, error: err.message }));
    process.exitCode = 1;
  } finally {
    clearTimeout(deadline);
  }
}
