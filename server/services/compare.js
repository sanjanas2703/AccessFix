import { AUTOMATED_VIOLATION } from '../../sandbox-scripts/lib/rules.js';

const AREAS = ['blind', 'colour', 'motion'];
const TYPES = ['automated_violation', 'heuristic_observation', 'manual_review'];

export function countFindings(findings) {
  return Object.fromEntries(
    AREAS.map((area) => [
      area,
      Object.fromEntries(
        TYPES.map((type) => [
          type,
          findings.filter((finding) => finding.area === area && finding.findingType === type).length,
        ]),
      ),
    ]),
  );
}

const brief = ({ key, ruleId, area, findingType, selector, summary }) => ({
  key,
  ruleId,
  area,
  findingType,
  selector,
  summary,
});

// Compares two check runs by rule and selector. "No longer detected" means this
// run's checks stopped flagging it, not that the underlying problem is solved.
export function compareFindings(before, after) {
  const beforeKeys = new Set(before.map((finding) => finding.key));
  const afterKeys = new Set(after.map((finding) => finding.key));
  const added = after.filter((finding) => !beforeKeys.has(finding.key));

  return {
    countsBefore: countFindings(before),
    countsAfter: countFindings(after),
    noLongerDetected: before.filter((finding) => !afterKeys.has(finding.key)).map(brief),
    remaining: after.filter((finding) => beforeKeys.has(finding.key)).map(brief),
    newViolations: added.filter((finding) => finding.findingType === AUTOMATED_VIOLATION).map(brief),
    newObservations: added.filter((finding) => finding.findingType !== AUTOMATED_VIOLATION).map(brief),
  };
}
