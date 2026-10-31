// Teammate area: sandbox/scanners.
// Everything here is a stub returning mock data. No Daytona calls are made.

const issue = (fields) => ({ fixed: false, ...fields });

// Built per call so each scan gets its own copies to mark as fixed.
function mockScanIssues() {
  return [
    issue({
      id: 'iss-blind-1',
      type: 'image-alt',
      selector: 'img.hero-banner',
      component: 'HeroBanner',
      page: '/',
      wcag: '1.1.1',
      group: 'blind',
      severity: 'high',
      description: 'Hero image has no alt text, so screen readers skip its meaning.',
    }),
    issue({
      id: 'iss-blind-2',
      type: 'button-name',
      selector: 'button.icon-search',
      component: 'SiteHeader',
      page: '/',
      wcag: '4.1.2',
      group: 'blind',
      severity: 'high',
      description: 'Search button has only an icon and no accessible name.',
    }),
    issue({
      id: 'iss-blind-3',
      type: 'label',
      selector: 'input#email',
      component: 'ContactForm',
      page: '/contact',
      wcag: '1.3.1',
      group: 'blind',
      severity: 'medium',
      description: 'Email field relies on placeholder text and has no label.',
    }),
    issue({
      id: 'iss-motor-1',
      type: 'keyboard-trap',
      selector: 'div.modal-newsletter',
      component: 'NewsletterModal',
      page: '/',
      wcag: '2.1.2',
      group: 'motor',
      severity: 'high',
      description: 'Keyboard focus cannot leave the newsletter modal.',
    }),
    issue({
      id: 'iss-motor-2',
      type: 'focus-not-visible',
      selector: 'a.nav-link',
      component: 'SiteHeader',
      page: '/',
      wcag: '2.4.7',
      group: 'motor',
      severity: 'medium',
      description: 'Navigation links show no visible focus indicator.',
    }),
    issue({
      id: 'iss-motor-3',
      type: 'target-size',
      selector: 'a.social-icon',
      component: 'SiteFooter',
      page: '/',
      wcag: '2.5.8',
      group: 'motor',
      severity: 'low',
      description: 'Social links are 16x16px, below the 24x24px minimum target size.',
    }),
    issue({
      id: 'iss-deaf-1',
      type: 'video-no-captions',
      selector: 'video#promo',
      component: 'PromoVideo',
      page: '/',
      wcag: '1.2.2',
      group: 'deaf',
      severity: 'high',
      description: 'Promo video has speech but no captions track.',
    }),
    issue({
      id: 'iss-deaf-2',
      type: 'audio-no-transcript',
      selector: 'audio.podcast-player',
      component: 'PodcastPlayer',
      page: '/blog',
      wcag: '1.2.1',
      group: 'deaf',
      severity: 'medium',
      description: 'Podcast episode has no text transcript.',
    }),
    issue({
      id: 'iss-cognitive-1',
      type: 'autoplay-animation',
      selector: 'div.carousel',
      component: 'HeroCarousel',
      page: '/',
      wcag: '2.2.2',
      group: 'cognitive',
      severity: 'medium',
      description: 'Carousel auto-advances with no pause control.',
    }),
    issue({
      id: 'iss-cognitive-2',
      type: 'document-title',
      selector: 'head > title',
      component: 'PageHead',
      page: '/contact',
      wcag: '2.4.2',
      group: 'cognitive',
      severity: 'low',
      description: 'Page title is "Untitled", which does not describe the page.',
    }),
    issue({
      id: 'iss-cognitive-3',
      type: 'reading-level',
      selector: 'main article',
      component: 'ArticleBody',
      page: '/blog',
      wcag: '3.1.5',
      group: 'cognitive',
      severity: 'low',
      description: 'Article text is written at a college reading level.',
    }),
  ];
}

function mockColorblindIssues() {
  return [
    issue({
      id: 'iss-colourblind-1',
      type: 'color-contrast',
      selector: 'a.btn-primary',
      component: 'CallToAction',
      page: '/',
      wcag: '1.4.3',
      group: 'colourblind',
      severity: 'high',
      description: 'Button text contrast is 2.1:1, below the required 4.5:1.',
    }),
    issue({
      id: 'iss-colourblind-2',
      type: 'link-in-text-block',
      selector: 'main p a',
      component: 'ArticleBody',
      page: '/blog',
      wcag: '1.4.1',
      group: 'colourblind',
      severity: 'medium',
      description: 'Inline links are distinguished from body text by colour alone.',
    }),
    issue({
      id: 'iss-colourblind-3',
      type: 'color-only-status',
      selector: 'span.form-error',
      component: 'ContactForm',
      page: '/contact',
      wcag: '1.4.1',
      group: 'colourblind',
      severity: 'medium',
      description: 'Form errors are shown only by turning the field red.',
    }),
  ];
}

export async function createSandbox(url) {
  // TODO: Create a real sandbox with the Daytona SDK using DAYTONA_API_KEY:
  //   const daytona = new Daytona({ apiKey: process.env.DAYTONA_API_KEY });
  //   const sandbox = await daytona.create();
  // Then install Playwright in it and upload sandbox-scripts/.
  return { id: `mock-sandbox-${Date.now()}`, url };
}

export async function runScript(sandbox, scriptName, args = {}) {
  // TODO: Run sandbox-scripts/<scriptName> inside the sandbox with sandbox.url
  // and args, then parse the JSON it prints. Fail the scan on a non-zero exit.
  switch (scriptName) {
    case 'scan.js':
      return { issues: mockScanIssues() };
    case 'colorblind.js':
      return { issues: mockColorblindIssues(), screenshotPath: '/tmp/mock-homepage.png' };
    case 'retest.js':
      return { passedIssueIds: args.fixes.map((fix) => fix.issueId) };
    default:
      throw new Error(`Unknown sandbox script: ${scriptName}`);
  }
}

export async function destroySandbox(sandbox) {
  // TODO: Delete the real sandbox (sandbox.delete()). This must also run after
  // failures so a crashed scan never leaves a sandbox running.
  return { id: sandbox.id, destroyed: true };
}
