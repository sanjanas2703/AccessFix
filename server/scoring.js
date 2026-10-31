const GROUPS = ['blind', 'colourblind', 'motor', 'deaf', 'cognitive'];
const PENALTY = { low: 8, medium: 15, high: 25 };

// Each unfixed issue lowers its group's score from 100. Overall is the group mean.
// TODO: Replace the flat penalties with weights agreed by the team.
export function computeScores(issues) {
  const scores = Object.fromEntries(GROUPS.map((group) => [group, 100]));

  for (const issue of issues) {
    if (issue.fixed) continue;
    scores[issue.group] = Math.max(0, scores[issue.group] - PENALTY[issue.severity]);
  }

  const total = GROUPS.reduce((sum, group) => sum + scores[group], 0);
  return { ...scores, overall: Math.round(total / GROUPS.length) };
}
