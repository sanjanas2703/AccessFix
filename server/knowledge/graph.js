// Curated knowledge seeded into Neo4j by server/scripts/seed-neo4j.js.
//
// A fix with an `adjustmentType` can be previewed by a deterministic function in
// sandbox-scripts/lib/adjustments.js. A null type means a person must do it.
const WCAG = 'https://www.w3.org/WAI/WCAG22/Understanding';

export const GUIDELINES = [
  { id: '1.1.1', title: 'Non-text Content', level: 'A', url: `${WCAG}/non-text-content` },
  { id: '1.3.1', title: 'Info and Relationships', level: 'A', url: `${WCAG}/info-and-relationships` },
  { id: '1.4.1', title: 'Use of Color', level: 'A', url: `${WCAG}/use-of-color` },
  { id: '1.4.3', title: 'Contrast (Minimum)', level: 'AA', url: `${WCAG}/contrast-minimum` },
  { id: '2.2.2', title: 'Pause, Stop, Hide', level: 'A', url: `${WCAG}/pause-stop-hide` },
  { id: '2.3.3', title: 'Animation from Interactions', level: 'AAA', url: `${WCAG}/animation-from-interactions` },
  { id: '2.4.4', title: 'Link Purpose (In Context)', level: 'A', url: `${WCAG}/link-purpose-in-context` },
  { id: '3.3.2', title: 'Labels or Instructions', level: 'A', url: `${WCAG}/labels-or-instructions` },
  { id: '4.1.2', title: 'Name, Role, Value', level: 'A', url: `${WCAG}/name-role-value` },
];

export const USER_NEEDS = [
  {
    id: 'identify-controls',
    area: 'blind',
    name: 'Know what each control does',
    description: 'Screen-reader users hear a control by its accessible name. Without one, it may be announced only as "button" or "link".',
  },
  {
    id: 'understand-images',
    area: 'blind',
    name: 'Get the information carried by images',
    description: 'A screen reader cannot describe an image unless the page provides a text alternative.',
  },
  {
    id: 'meaningful-names',
    area: 'blind',
    name: 'Receive names that are actually useful',
    description: 'Having a name or alternative does not guarantee it is meaningful. "image" or a file name passes automated checks and tells the user nothing.',
  },
  {
    id: 'perceive-without-colour',
    area: 'colour',
    name: 'Understand meaning without relying on colour',
    description: 'People with colour-vision differences may not be able to tell two colours apart, so colour needs a second cue such as text or an icon.',
  },
  {
    id: 'distinguish-links',
    area: 'colour',
    name: 'Find links within text',
    description: 'A link that differs from surrounding text only by colour may be invisible to people who cannot perceive that difference.',
  },
  {
    id: 'read-text',
    area: 'colour',
    name: 'Read text against its background',
    description: 'Contrast is a related visual check, not a colour-blindness test: it measures lightness difference, and helps many people including those with low vision.',
  },
  {
    id: 'limit-motion',
    area: 'motion',
    name: 'Avoid or control moving content',
    description: 'Movement can cause distraction, dizziness or nausea for people with motion sensitivity, so they need a way to reduce or stop it.',
  },
];

export const FIXES = [
  {
    id: 'write-accessible-name',
    need: 'identify-controls',
    title: 'Write an accessible name',
    description: 'A person who knows the purpose of the control should add a name. AccessFix does not guess it.',
    adjustmentType: null,
  },
  {
    id: 'label-from-context',
    need: 'identify-controls',
    title: 'Use the adjacent label as the name',
    description: 'Copies the text of an adjacent, unassociated label into the control. In production, associate the label with the control instead.',
    adjustmentType: 'aria-label-from-context',
  },
  {
    id: 'write-text-alternative',
    need: 'understand-images',
    title: 'Write a text alternative',
    description: 'A person who knows why the image is there should describe it, or mark it as decorative. AccessFix does not invent descriptions.',
    adjustmentType: null,
  },
  {
    id: 'review-name-quality',
    need: 'meaningful-names',
    title: 'Review the existing name',
    description: 'Check that the name describes the purpose of the element in context.',
    adjustmentType: null,
  },
  {
    id: 'add-non-colour-cue',
    need: 'perceive-without-colour',
    title: 'Add a text or icon cue',
    description: 'Add visible text or an icon where the meaning is known, then review whether colour was the only cue.',
    adjustmentType: null,
  },
  {
    id: 'status-text-label',
    need: 'perceive-without-colour',
    title: 'Add a text label to the status',
    description: 'Adds a text label taken from the status name in the page markup.',
    adjustmentType: 'status-text-label',
  },
  {
    id: 'underline-links',
    need: 'distinguish-links',
    title: 'Give links a non-colour cue',
    description: 'Underline links within text, or provide another cue that does not depend on colour.',
    adjustmentType: null,
  },
  {
    id: 'raise-text-contrast',
    need: 'read-text',
    title: 'Raise this text\'s contrast',
    description: 'Moves the text colour the smallest amount needed to reach the required ratio. Does not address colour-only meaning.',
    adjustmentType: 'contrast-color',
  },
  {
    id: 'reduced-motion-preview',
    need: 'limit-motion',
    title: 'Preview with reduced motion',
    description: 'Requests prefers-reduced-motion, shortens CSS animations and transitions, and pauses video and marquee elements. It cannot stop script-driven movement, canvas animation or animated images.',
    adjustmentType: 'reduced-motion',
  },
  {
    id: 'add-pause-control',
    need: 'limit-motion',
    title: 'Add a pause control',
    description: 'Moving content that starts automatically and lasts over five seconds needs a way to pause, stop or hide it. This needs a code change.',
    adjustmentType: null,
  },
  {
    id: 'honour-reduced-motion',
    need: 'limit-motion',
    title: 'Honour prefers-reduced-motion',
    description: 'Check this setting in the site\'s own CSS and scripts, including effects CSS overrides cannot reach.',
    adjustmentType: null,
  },
];

// `references` are WCAG criteria. For axe rules they come from axe's own rule tags.
// For heuristics the link is only possible, because an observation is not a verdict.
export const ISSUES = [
  { id: 'image-alt', source: 'axe', area: 'blind', name: 'Image has no text alternative', needs: ['understand-images'], references: ['1.1.1'] },
  { id: 'input-image-alt', source: 'axe', area: 'blind', name: 'Image button has no text alternative', needs: ['identify-controls'], references: ['1.1.1', '4.1.2'] },
  { id: 'area-alt', source: 'axe', area: 'blind', name: 'Image map area has no text alternative', needs: ['understand-images'], references: ['2.4.4', '4.1.2'] },
  { id: 'role-img-alt', source: 'axe', area: 'blind', name: 'Element with role="img" has no text alternative', needs: ['understand-images'], references: ['1.1.1'] },
  { id: 'svg-img-alt', source: 'axe', area: 'blind', name: 'SVG image has no text alternative', needs: ['understand-images'], references: ['1.1.1'] },
  { id: 'button-name', source: 'axe', area: 'blind', name: 'Button has no accessible name', needs: ['identify-controls'], references: ['4.1.2'] },
  { id: 'input-button-name', source: 'axe', area: 'blind', name: 'Input button has no accessible name', needs: ['identify-controls'], references: ['4.1.2'] },
  { id: 'link-name', source: 'axe', area: 'blind', name: 'Link has no accessible name', needs: ['identify-controls'], references: ['2.4.4', '4.1.2'] },
  { id: 'label', source: 'axe', area: 'blind', name: 'Form field has no label', needs: ['identify-controls'], references: ['4.1.2'] },
  { id: 'select-name', source: 'axe', area: 'blind', name: 'Select has no accessible name', needs: ['identify-controls'], references: ['4.1.2'] },
  { id: 'aria-command-name', source: 'axe', area: 'blind', name: 'ARIA button or link has no accessible name', needs: ['identify-controls'], references: ['4.1.2'] },
  { id: 'aria-input-field-name', source: 'axe', area: 'blind', name: 'ARIA input has no accessible name', needs: ['identify-controls'], references: ['4.1.2'] },
  { id: 'aria-toggle-field-name', source: 'axe', area: 'blind', name: 'ARIA toggle has no accessible name', needs: ['identify-controls'], references: ['4.1.2'] },
  { id: 'color-contrast', source: 'axe', area: 'colour', name: 'Text contrast is below the minimum', needs: ['read-text'], references: ['1.4.3'] },
  { id: 'link-in-text-block', source: 'axe', area: 'colour', name: 'Link is distinguished only by colour', needs: ['distinguish-links'], references: ['1.4.1'] },
  { id: 'blink', source: 'axe', area: 'motion', name: 'Blinking element', needs: ['limit-motion'], references: ['2.2.2'] },
  { id: 'marquee', source: 'axe', area: 'motion', name: 'Scrolling marquee element', needs: ['limit-motion'], references: ['2.2.2'] },
  { id: 'name-may-not-be-meaningful', source: 'heuristic', area: 'blind', name: 'Name may not be meaningful', needs: ['meaningful-names'], references: ['1.1.1', '2.4.4'] },
  { id: 'color-only-indicator', source: 'heuristic', area: 'colour', name: 'Colour may be the only cue', needs: ['perceive-without-colour'], references: ['1.4.1'] },
  { id: 'css-animation-observed', source: 'heuristic', area: 'motion', name: 'CSS animation observed', needs: ['limit-motion'], references: ['2.2.2', '2.3.3'] },
  { id: 'js-movement-observed', source: 'heuristic', area: 'motion', name: 'Script-driven movement observed', needs: ['limit-motion'], references: ['2.2.2'] },
  { id: 'video-playing-observed', source: 'heuristic', area: 'motion', name: 'Autoplaying video observed', needs: ['limit-motion'], references: ['2.2.2'] },
  { id: 'canvas-changing-observed', source: 'heuristic', area: 'motion', name: 'Canvas animation observed', needs: ['limit-motion'], references: ['2.2.2'] },
  { id: 'animated-image-present', source: 'heuristic', area: 'motion', name: 'Possibly animated image', needs: ['limit-motion'], references: ['2.2.2'] },
];
