<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  scan: {
    type: Object,
    required: true,
  },
  initialIssue: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['select-issue']);

// View mode: 'slider' or 'split'
const viewMode = ref('slider');
const sliderPosition = ref(50); // percentage 0 - 100

// Adjustments list with selection state
const adjustments = ref([
  {
    id: 'adj-alt',
    category: 'screen-reader',
    title: 'Inject Descriptive Alt Attributes',
    description: 'Supplies descriptive alternative text to content images and flags decorative elements with alt="".',
    applied: true,
    impact: 'Automated check improved',
    status: 'improved',
  },
  {
    id: 'adj-names',
    category: 'screen-reader',
    title: 'Provide Explicit ARIA Labels for Icon Buttons',
    description: 'Adds aria-label="Search" to button.icon-search so screen readers announce its purpose.',
    applied: true,
    impact: 'Automated check improved',
    status: 'improved',
  },
  {
    id: 'adj-contrast',
    category: 'colour-vision',
    title: 'Optimize Luminosity Contrast to 4.5:1+ (WCAG AA)',
    description: 'Increases text/background color delta on CallToAction buttons from 2.1:1 to 6.8:1.',
    applied: true,
    impact: 'Automated check improved',
    status: 'improved',
  },
  {
    id: 'adj-links',
    category: 'colour-vision',
    title: 'Add Multi-Cue Link Underlines',
    description: 'Ensures body text links do not depend exclusively on color distinction.',
    applied: true,
    impact: 'Visually changed',
    status: 'visual',
  },
  {
    id: 'adj-motion',
    category: 'motion',
    title: 'Enforce Reduced Motion & Slider Pause Hooks',
    description: 'Stops automated carousel transitions and honors prefers-reduced-motion.',
    applied: true,
    impact: 'Automated check improved',
    status: 'improved',
  },
  {
    id: 'adj-modal',
    category: 'screen-reader',
    title: 'Release Keyboard Focus Trap in Dialog',
    description: 'Enables Esc keydown listener and restores prior element focus upon modal exit.',
    applied: false,
    impact: 'Requires manual code refactoring',
    status: 'manual-review',
  },
]);

function toggleAdjustment(adj) {
  adj.applied = !adj.applied;
}

function resetAll() {
  adjustments.value.forEach((a) => (a.applied = true));
}

const appliedCount = computed(
  () => adjustments.value.filter((a) => a.applied).length
);

const improvedCount = computed(
  () => props.scan.issues?.filter((i) => i.fixed).length ?? 0
);

const remainingCount = computed(
  () => props.scan.issues?.filter((i) => !i.fixed).length ?? 0
);

const manualReviewCount = computed(
  () => props.scan.issues?.filter((i) => i.requiresManualReview || !i.fixed).length ?? 0
);
</script>

<template>
  <div class="transformation-studio" aria-labelledby="studio-heading">
    <!-- Studio Header -->
    <div class="studio-header card-box">
      <div class="header-main">
        <span class="badge badge-fixed">Transformation Studio</span>
        <h2 id="studio-heading" class="studio-title">Explore what changed. Understand what improved.</h2>
        <p class="studio-sub">
          Interactive preview environment comparing the original Daytona scan against targeted accessibility adaptations.
        </p>
      </div>

      <div class="header-stats">
        <div class="stat-pill">
          <span class="stat-label">Automated Checks Improved</span>
          <span class="stat-val text-green">+{{ improvedCount }} checks</span>
        </div>
        <div class="stat-pill">
          <span class="stat-label">Requires Human Review</span>
          <span class="stat-val text-amber">{{ manualReviewCount }} items</span>
        </div>
        <div class="stat-pill">
          <span class="stat-label">Active Preview Adjustments</span>
          <span class="stat-val">{{ appliedCount }} / {{ adjustments.length }}</span>
        </div>
      </div>
    </div>

    <!-- Main Workspace: Adjustments (Left) + Visual Inspection (Centre) -->
    <div class="studio-workspace-grid">
      <!-- Left: Supported Adjustments Checklist -->
      <div class="adjustments-panel card-box">
        <div class="panel-top-row">
          <h3>Supported Adjustments</h3>
          <button type="button" class="btn-text" @click="resetAll">Reset All</button>
        </div>
        <p class="panel-hint">Toggle targeted adaptations to see their effect on the comparison preview:</p>

        <ul class="adjustments-list">
          <li
            v-for="adj in adjustments"
            :key="adj.id"
            class="adj-item"
            :class="{ active: adj.applied }"
          >
            <label class="adj-label" :for="adj.id">
              <input
                :id="adj.id"
                type="checkbox"
                :checked="adj.applied"
                class="adj-checkbox"
                @change="toggleAdjustment(adj)"
              />
              <div class="adj-info">
                <div class="adj-header">
                  <span class="adj-title">{{ adj.title }}</span>
                </div>
                <p class="adj-desc">{{ adj.description }}</p>
                <div class="adj-status-row">
                  <span
                    class="badge"
                    :class="{
                      'badge-fixed': adj.status === 'improved',
                      'badge-screen-reader': adj.status === 'visual',
                      'badge-severity-medium': adj.status === 'manual-review',
                    }"
                  >
                    {{ adj.impact }}
                  </span>
                </div>
              </div>
            </label>
          </li>
        </ul>
      </div>

      <!-- Centre: Before and After Visual Inspection Surface -->
      <div class="comparison-surface card-box">
        <div class="surface-controls">
          <div class="view-mode-tabs">
            <button
              type="button"
              class="mode-btn"
              :class="{ active: viewMode === 'slider' }"
              @click="viewMode = 'slider'"
            >
              Interactive Split Slider
            </button>
            <button
              type="button"
              class="mode-btn"
              :class="{ active: viewMode === 'split' }"
              @click="viewMode = 'split'"
            >
              Side-by-Side View
            </button>
          </div>

          <div class="verification-notice" role="note">
            <span class="notice-icon">ℹ</span>
            <span>Screenshots illustrate visual & contrast changes; screen-reader fixes verify through DOM inspection.</span>
          </div>
        </div>

        <!-- 1. SLIDER VIEW MODE -->
        <div v-if="viewMode === 'slider'" class="slider-viewport" aria-label="Interactive Before and After slider">
          <div class="stage-frame">
            <!-- Modified / After Layer (Full Width underneath) -->
            <div class="preview-layer after-layer">
              <div class="layer-badge badge-after">Adapted Experience (With Adjustments)</div>
              <div class="mock-website-ui adapted-site">
                <header class="mock-nav">
                  <div class="mock-logo">AccessFix Portal</div>
                  <nav class="mock-links">
                    <span class="nav-item focus-ring">Documentation</span>
                    <span class="nav-item">Support</span>
                  </nav>
                  <button type="button" class="mock-btn-search fixed-btn" aria-label="Search articles and docs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    Search
                  </button>
                </header>

                <main class="mock-hero-section">
                  <div class="hero-left">
                    <span class="tag-accessible">WCAG 2.1 AA Target</span>
                    <h3>Accessible Customer Knowledge Base</h3>
                    <p class="mock-p">
                      Discover guides, developer documentation, and verified tutorials. Refer to our
                      <a href="#" class="fixed-link">quickstart directory</a> for details.
                    </p>
                    <button type="button" class="mock-btn-primary high-contrast-btn">
                      Get Started (7.2:1 Contrast)
                    </button>
                  </div>
                  <div class="hero-right">
                    <div class="mock-img-placeholder with-alt">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span class="alt-flag">alt="Autumn technology showcase banner"</span>
                    </div>
                  </div>
                </main>
              </div>
            </div>

            <!-- Original / Before Layer (Clipped by slider position) -->
            <div
              class="preview-layer before-layer"
              :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }"
            >
              <div class="layer-badge badge-before">Original Website (Before Fixes)</div>
              <div class="mock-website-ui original-site">
                <header class="mock-nav">
                  <div class="mock-logo">AccessFix Portal</div>
                  <nav class="mock-links">
                    <span class="nav-item">Documentation</span>
                    <span class="nav-item">Support</span>
                  </nav>
                  <button type="button" class="mock-btn-search unlabelled-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </button>
                </header>

                <main class="mock-hero-section">
                  <div class="hero-left">
                    <span class="tag-original">Pre-Scan State</span>
                    <h3>Accessible Customer Knowledge Base</h3>
                    <p class="mock-p">
                      Discover guides, developer documentation, and verified tutorials. Refer to our
                      <a href="#" class="failing-link">quickstart directory</a> for details.
                    </p>
                    <button type="button" class="mock-btn-primary low-contrast-btn">
                      Get Started (2.1:1 Contrast)
                    </button>
                  </div>
                  <div class="hero-right">
                    <div class="mock-img-placeholder missing-alt">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span class="alt-flag text-danger">(Missing alt attribute)</span>
                    </div>
                  </div>
                </main>
              </div>
            </div>

            <!-- Interactive Slider Divider -->
            <div
              class="slider-handle"
              :style="{ left: `${sliderPosition}%` }"
              aria-hidden="true"
            >
              <div class="handle-line"></div>
              <div class="handle-thumb">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="15 18 9 12 15 6"></polyline>
                  <polyline points="9 18 3 12 9 6"></polyline>
                </svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                  <polyline points="15 18 21 12 15 6"></polyline>
                </svg>
              </div>
            </div>

            <!-- Native Range Input for Keyboard & Touch Accessibility -->
            <input
              type="range"
              min="0"
              max="100"
              v-model="sliderPosition"
              class="slider-range-input"
              aria-label="Drag before and after split slider"
            />
          </div>
        </div>

        <!-- 2. SIDE BY SIDE VIEW MODE -->
        <div v-else class="side-by-side-viewport">
          <div class="split-col">
            <span class="badge badge-severity-high">Original State</span>
            <div class="mock-website-ui original-site">
              <h4>Original Issues</h4>
              <ul>
                <li><code>button.icon-search</code> has no accessible text.</li>
                <li><code>a.btn-primary</code> contrast is 2.1:1.</li>
                <li><code>img.hero-banner</code> missing alt text.</li>
                <li>Inline links lack underline cues.</li>
              </ul>
            </div>
          </div>

          <div class="split-col">
            <span class="badge badge-fixed">Patched State</span>
            <div class="mock-website-ui adapted-site">
              <h4>Verified Adaptations</h4>
              <ul>
                <li>Added <code>aria-label="Search articles and docs"</code>.</li>
                <li>Adjusted button contrast to 7.2:1 (Passes AAA).</li>
                <li>Injected descriptive alt text from Vision analysis.</li>
                <li>Added persistent underline decoration to inline links.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom: Issue-by-Issue Verification Matrix -->
    <div class="verification-matrix card-box">
      <div class="matrix-header">
        <h3>Issue Verification Matrix</h3>
        <p>
          Truthful breakdown differentiating automated check improvements from items requiring human review.
        </p>
      </div>

      <table class="matrix-table">
        <thead>
          <tr>
            <th scope="col">Status</th>
            <th scope="col">Category</th>
            <th scope="col">Element Target</th>
            <th scope="col">Finding</th>
            <th scope="col">Verification Method</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="issue in scan.issues"
            :key="issue.id"
            class="matrix-row"
            @click="emit('select-issue', issue)"
          >
            <td>
              <span class="badge" :class="issue.fixed ? 'badge-fixed' : 'badge-open'">
                {{ issue.fixed ? 'Automated Check Improved' : 'Requires Manual Review' }}
              </span>
            </td>
            <td>
              <span
                class="badge"
                :class="{
                  'badge-screen-reader': issue.group === 'blind',
                  'badge-colour-vision': issue.group === 'colourblind',
                  'badge-motion': issue.group === 'cognitive' || issue.group === 'motor',
                }"
              >
                {{ issue.group }}
              </span>
            </td>
            <td>
              <code class="matrix-selector">{{ issue.selector }}</code>
            </td>
            <td>
              <span class="matrix-desc">{{ issue.description }}</span>
            </td>
            <td>
              <span class="matrix-method font-mono">
                {{ issue.fixed ? 'Daytona retest.js DOM check' : 'Human Author Context Needed' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.transformation-studio {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.studio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.studio-title {
  font-size: 1.6rem;
  margin: 6px 0 4px;
}

.studio-sub {
  font-size: 0.9375rem;
  color: var(--color-muted);
  margin-bottom: 0;
}

.header-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-pill {
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-muted);
}

.stat-val {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-obsidian);
}

.text-green { color: var(--color-success); }
.text-amber { color: var(--color-warning); }
.text-danger { color: var(--color-danger); }

/* Workspace Grid */
.studio-workspace-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 24px;
}

.adjustments-panel {
  display: flex;
  flex-direction: column;
}

.panel-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.panel-top-row h3 {
  font-size: 1.1rem;
  margin-bottom: 0;
}

.btn-text {
  background: none;
  border: 0;
  color: var(--cat-screen-reader);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
}

.panel-hint {
  font-size: 0.8125rem;
  color: var(--color-muted);
  margin-bottom: 16px;
}

.adjustments-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.adj-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-sunken);
  transition: all var(--transition-fast);
}

.adj-item.active {
  border-color: var(--color-brand);
  background: #ffffff;
  box-shadow: var(--shadow-sm);
}

.adj-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
}

.adj-checkbox {
  margin-top: 3px;
  width: 17px;
  height: 17px;
  cursor: pointer;
}

.adj-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-obsidian);
  line-height: 1.3;
}

.adj-desc {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 4px 0 8px;
  line-height: 1.4;
}

.adj-status-row {
  display: flex;
}

/* Centre: Surface Comparison */
.comparison-surface {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.surface-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.view-mode-tabs {
  display: flex;
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 3px;
  gap: 4px;
}

.mode-btn {
  background: transparent;
  border: 0;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mode-btn.active {
  background: #ffffff;
  color: var(--color-obsidian);
  box-shadow: var(--shadow-sm);
}

.verification-notice {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--color-muted);
}

.notice-icon {
  font-weight: 700;
}

/* Slider Viewport */
.stage-frame {
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  height: 380px;
  background: #ffffff;
  user-select: none;
}

.preview-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: #ffffff;
}

.layer-badge {
  position: absolute;
  top: 12px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  z-index: 10;
}

.badge-after {
  right: 12px;
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.badge-before {
  left: 12px;
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Mock Web UI */
.mock-website-ui {
  padding: 36px 28px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mock-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.mock-logo {
  font-weight: 800;
  font-size: 1.1rem;
}

.mock-links {
  display: flex;
  gap: 16px;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.focus-ring {
  outline: 2px solid var(--cat-screen-reader);
  outline-offset: 3px;
  border-radius: 2px;
}

.mock-btn-search {
  padding: 6px 12px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.8125rem;
}

.unlabelled-btn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #64748b;
}

.fixed-btn {
  background: #0f172a;
  border: 1px solid #0f172a;
  color: #ffffff;
  font-weight: 600;
}

.mock-hero-section {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
  align-items: center;
}

.tag-accessible {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-success);
}

.tag-original {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-danger);
}

.mock-hero-section h3 {
  font-size: 1.25rem;
  margin: 6px 0 8px;
}

.mock-p {
  font-size: 0.8125rem;
  color: var(--color-charcoal);
  margin-bottom: 14px;
}

.failing-link {
  color: #10b981;
  text-decoration: none;
}

.fixed-link {
  color: #047857;
  text-decoration: underline;
  text-underline-offset: 3px;
  font-weight: 600;
}

.mock-btn-primary {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  border: 0;
  font-size: 0.8125rem;
  font-weight: 700;
}

.low-contrast-btn {
  background: #bfdbfe;
  color: #93c5fd;
}

.high-contrast-btn {
  background: #0f172a;
  color: #38bdf8;
}

.mock-img-placeholder {
  height: 140px;
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  padding: 10px;
}

.missing-alt {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  color: #94a3b8;
}

.with-alt {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.alt-flag {
  font-size: 0.6875rem;
  font-weight: 600;
}

/* Slider Bar & Thumb */
.slider-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  z-index: 20;
  pointer-events: none;
}

.handle-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 2px;
  background: var(--color-obsidian);
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
}

.handle-thumb {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--color-obsidian);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.slider-range-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: ew-resize;
  z-index: 25;
}

/* Side by side */
.side-by-side-viewport {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.split-col {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 16px;
  background: var(--color-surface-sunken);
}

.split-col h4 {
  font-size: 0.95rem;
  margin: 10px 0 8px;
}

.split-col ul {
  padding-left: 18px;
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.6;
}

/* Bottom Verification Matrix */
.matrix-header h3 {
  font-size: 1.15rem;
  margin-bottom: 4px;
}

.matrix-header p {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}

.matrix-table th {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 2px solid var(--color-border);
  color: var(--color-muted);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.6875rem;
}

.matrix-row {
  cursor: pointer;
  transition: all var(--transition-fast);
}

.matrix-row:hover {
  background-color: var(--color-surface-sunken);
}

.matrix-row td {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.matrix-selector {
  color: var(--color-brand);
}

.matrix-desc {
  color: var(--color-charcoal);
}

.matrix-method {
  color: var(--color-muted);
  font-size: 0.75rem;
}

@media (max-width: 960px) {
  .studio-workspace-grid {
    grid-template-columns: 1fr;
  }
}
</style>
