// Runs sandbox work one job at a time: the shared sandbox is small, and
// sequential processing is enough for this prototype.
const MAX_PENDING = 5;

let tail = Promise.resolve();
let pending = 0;

export function enqueue(task) {
  if (pending >= MAX_PENDING) {
    throw new Error('Too many scans are waiting. Try again shortly.');
  }
  pending += 1;
  const run = tail.then(task).finally(() => {
    pending -= 1;
  });
  tail = run.catch(() => {});
  return run;
}
