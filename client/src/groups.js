// The three accessibility areas in this version, in display order.
export const GROUPS = ['blind', 'colour', 'motion'];

export const GROUP_LABELS = {
  blind: 'Blindness / screen-reader support',
  colour: 'Colour blindness (with related contrast checks)',
  motion: 'Motion sensitivity',
};

export const GROUP_NOTES = {
  blind:
    'Automated checks confirm whether a name or alternative exists, not whether it is meaningful. A person must review the wording.',
  colour:
    'Contrast is a measurable, related visual check, not a colour-blindness test. Findings about colour-only meaning need manual review.',
  motion:
    'Observed motion is not automatically a violation. It depends on duration, purpose and whether users can pause it.',
};

// Finding types, kept visibly separate in the UI.
export const FINDING_TYPE_LABELS = {
  automated_violation: 'Automated violation',
  heuristic_observation: 'Heuristic observation',
  manual_review: 'Manual review needed',
};
