// Turns graph guidance into what the user is offered. An adjustment is offered
// only if the scan found it feasible AND the graph links that issue to a fix of
// that type, so Neo4j decides the recommendations rather than decorating them.
export function buildRecommendations(findings, guidance) {
  const offered = new Map();

  const enriched = findings.map((finding) => {
    const entry = guidance.get(finding.ruleId);
    const adjustmentIds = [];

    for (const candidate of entry ? finding.candidateAdjustments : []) {
      const fix = entry.needs.flatMap((need) => need.fixes).find((item) => item.adjustmentType === candidate.type);
      if (!fix) continue;

      const signature = JSON.stringify([candidate.type, candidate.params]);
      if (!offered.has(signature)) {
        offered.set(signature, {
          id: `adj-${offered.size + 1}`,
          type: candidate.type,
          params: candidate.params,
          title: fix.title,
          description: fix.description,
          context: candidate.context ?? null,
        });
      }
      adjustmentIds.push(offered.get(signature).id);
    }

    return {
      ...finding,
      adjustmentIds,
      guidance: entry ? { needs: entry.needs, guidelines: entry.guidelines } : null,
    };
  });

  return { findings: enriched, adjustments: [...offered.values()] };
}
