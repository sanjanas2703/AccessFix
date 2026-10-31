// The accessibility groups and areas across AccessFix
export const GROUPS = ['blind', 'colourblind', 'cognitive', 'motor', 'deaf', 'colour', 'motion'];

export const GROUP_LABELS = {
  blind: 'Blind / screen reader',
  colour: 'Colour blind / low vision',
  colourblind: 'Colour blind / low vision',
  motion: 'Motion sensitivity',
  cognitive: 'Cognitive & motion',
  motor: 'Keyboard / motor',
  deaf: 'Deaf / hard of hearing',
};

// Short enough to fit around the radar chart at phone width.
export const GROUP_SHORT_LABELS = {
  blind: 'Screen Reader',
  colour: 'Colour Vision',
  colourblind: 'Colour Vision',
  motion: 'Motion',
  cognitive: 'Motion/Cognitive',
  motor: 'Keyboard/Motor',
  deaf: 'Audio/Video',
};

export const GROUP_NOTES = {
  blind:
    'Automated checks confirm whether a name or alternative exists, not whether it is meaningful. A person must review the wording.',
  colour:
    'Contrast is a measurable, related visual check, not a colour-blindness test. Findings about colour-only meaning need manual review.',
  colourblind:
    'Contrast is a measurable, related visual check, not a colour-blindness test. Findings about colour-only meaning need manual review.',
  motion:
    'Observed motion is not automatically a violation. It depends on duration, purpose and whether users can pause it.',
  cognitive:
    'Observed motion is not automatically a violation. It depends on duration, purpose and whether users can pause it.',
};

// Finding types, kept visibly separate in the UI.
export const FINDING_TYPE_LABELS = {
  automated_violation: 'Automated violation',
  heuristic_observation: 'Heuristic observation',
  manual_review: 'Manual review needed',
};

// Primary Spotlight Categories for the AccessFix Experience
export const CORE_CATEGORIES = {
  screenReader: {
    id: 'screen-reader',
    groupKey: 'blind',
    name: 'Screen Reader Accessibility',
    shortName: 'Screen Reader',
    concept: 'Structure, clarity and navigation',
    accentColor: '#0F766E', // Deep teal / emerald
    accentBg: '#F0FDF4',
    badgeBorder: '#0F766E',
    icon: 'structure',
    motif: 'Semantic structure trees, connected navigation paths, outlined elements',
    description: 'Surfaces missing labels, unannounced interactive controls, and document hierarchy that screen readers depend on.',
  },
  colourVision: {
    id: 'colour-vision',
    groupKey: 'colourblind',
    name: 'Colour Vision & Contrast Lab',
    shortName: 'Colour Vision',
    concept: 'Perception, contrast and visual signals',
    accentColor: '#C2410C', // Burnt orange / warm amber
    accentBg: '#FFFBEB',
    badgeBorder: '#C2410C',
    icon: 'contrast',
    motif: 'Colour swatches, contrast comparisons, labelled visual signals, side-by-side transforms',
    description: 'Diagnoses low contrast text, color-only statuses, and provides realistic colorblindness simulation.',
  },
  motionSensitivity: {
    id: 'motion-sensitivity',
    groupKey: 'cognitive',
    name: 'Motion Sensitivity & Stability',
    shortName: 'Motion Sensitivity',
    concept: 'Calm, control and stability',
    accentColor: '#4338CA', // Muted indigo / slate blue
    accentBg: '#EEF2FF',
    badgeBorder: '#4338CA',
    icon: 'motion',
    motif: 'Motion timelines, paused states, animation indicators and reduced-motion controls',
    description: 'Identifies auto-playing animations, missing pause triggers, and previews prefers-reduced-motion adaptations.',
  },
};
