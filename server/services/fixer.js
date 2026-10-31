// Teammate area: graph/AI.

// Mock stand-in for issues that need a human, so scores improve but not to 100.
const NEEDS_HUMAN = ['video-no-captions', 'reading-level'];

export async function proposeFixes(issues) {
  // TODO: Send each issue and its surrounding HTML to the LLM (LLM_API_KEY, or a
  // Nosana-hosted model via NOSANA_API_KEY) and parse the returned code patch.
  // Skip anything the model cannot fix safely, such as writing real captions.
  return issues
    .filter((issue) => !NEEDS_HUMAN.includes(issue.type))
    .map((issue) => ({
      issueId: issue.id,
      selector: issue.selector,
      explanation: `Mock fix for ${issue.type} on ${issue.component}`,
      patch: `/* TODO: LLM-generated patch for ${issue.selector} */`,
    }));
}
