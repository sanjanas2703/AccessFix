// Teammate area: graph/AI.

export async function analyzeScreenshot(imagePath) {
  // TODO: Send the screenshot at imagePath to a vision model and convert its
  // findings into issues (same shape as the shared contract). Use this for
  // problems DOM checks miss, such as text over a busy image.
  return [
    {
      id: 'iss-vision-1',
      type: 'text-over-busy-image',
      selector: 'img.hero-banner + h1',
      component: 'HeroBanner',
      page: '/',
      wcag: '1.4.3',
      group: 'colourblind',
      severity: 'medium',
      description: 'Headline sits on a busy photo, which makes it hard to read with low vision.',
      fixed: false,
    },
  ];
}
