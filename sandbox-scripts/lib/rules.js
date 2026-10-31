// The scan's scope. Only these axe rules run, so results cannot drift into other
// accessibility categories. server/scripts/seed-neo4j.js maps the same IDs.
export const AREAS = ['blind', 'colour', 'motion'];

export const AXE_RULES = {
  'aria-command-name': 'blind',
  'aria-input-field-name': 'blind',
  'aria-toggle-field-name': 'blind',
  'area-alt': 'blind',
  'button-name': 'blind',
  'image-alt': 'blind',
  'input-button-name': 'blind',
  'input-image-alt': 'blind',
  label: 'blind',
  'link-name': 'blind',
  'role-img-alt': 'blind',
  'select-name': 'blind',
  'svg-img-alt': 'blind',
  'color-contrast': 'colour',
  'link-in-text-block': 'colour',
  blink: 'motion',
  marquee: 'motion',
};

// Finding types. Motion and colour-only observations must stay distinguishable
// from axe violations, so each finding carries exactly one of these.
export const AUTOMATED_VIOLATION = 'automated_violation';
export const HEURISTIC_OBSERVATION = 'heuristic_observation';
export const MANUAL_REVIEW = 'manual_review';

// Heuristic rule IDs, used as AccessibilityIssue keys in Neo4j alongside axe IDs.
export const HEURISTIC_RULES = {
  'name-may-not-be-meaningful': 'blind',
  'color-only-indicator': 'colour',
  'css-animation-observed': 'motion',
  'js-movement-observed': 'motion',
  'video-playing-observed': 'motion',
  'canvas-changing-observed': 'motion',
  'animated-image-present': 'motion',
};
