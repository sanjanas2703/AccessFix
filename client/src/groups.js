// Disability groups from the shared data contract, in display order.
export const GROUPS = ['blind', 'colourblind', 'motor', 'deaf', 'cognitive'];

export const GROUP_LABELS = {
  blind: 'Blind / screen reader',
  colourblind: 'Colour blind / low vision',
  motor: 'Keyboard / motor',
  deaf: 'Deaf / hard of hearing',
  cognitive: 'Cognitive & motion',
};

// Short enough to fit around the radar chart at phone width.
export const GROUP_SHORT_LABELS = {
  blind: 'Screen Reader',
  colourblind: 'Colour Vision',
  motor: 'Keyboard/Motor',
  deaf: 'Audio/Video',
  cognitive: 'Motion/Cognitive',
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
