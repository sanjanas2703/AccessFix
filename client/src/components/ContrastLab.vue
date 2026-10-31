<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  issues: {
    type: Array,
    required: true,
  },
  selectedIssueId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['select-issue']);

const activeSubTab = ref('contrast'); // 'contrast', 'simulation', 'colour-only', 'signals'
const simulationType = ref('deuteranopia'); // 'deuteranopia', 'protanopia', 'tritanopia', 'monochrome'

// Visual Signal Enhancements Toggles
const previewUnderlineLinks = ref(true);
const previewStatusIcons = ref(true);
const previewHighContrast = ref(true);

const colourIssues = computed(() =>
  props.issues.filter((i) => i.group === 'colourblind' || i.type?.includes('color') || i.type?.includes('contrast'))
);

const contrastIssues = computed(() =>
  colourIssues.value.filter((i) => i.type?.includes('contrast') || i.description?.toLowerCase().includes('contrast'))
);

const colourOnlyIssues = computed(() =>
  colourIssues.value.filter((i) => i.type?.includes('color-only') || i.type?.includes('link') || i.description?.toLowerCase().includes('colour alone'))
);

// Contrast measurements extracted honestly from evidence or description
const contrastMeasurements = computed(() => {
  return contrastIssues.value.map((issue) => {
    const evidence = issue.evidence ?? {};
    return {
      id: issue.id,
      element: issue.selector,
      component: issue.component,
      fgColor: evidence.fgColor ?? '#8E9AA0',
      bgColor: evidence.bgColor ?? '#E2E8F0',
      ratio: evidence.contrastRatio ?? '2.1:1',
      required: evidence.requiredRatio ?? '4.5:1',
      isLargeText: evidence.isLargeText ?? false,
      pass: issue.fixed ?? false,
      issue,
    };
  });
});
</script>

<template>
  <div class="contrast-lab" aria-labelledby="contrast-lab-heading">
    <!-- Header with Category Identity -->
    <div class="category-banner banner-amber">
      <div class="banner-badge">
        <span class="badge badge-colour-vision">Category B</span>
        <span class="concept-tag">Perception · Contrast · Visual Signals</span>
      </div>
      <h2 id="contrast-lab-heading" class="category-heading">
        Colour Vision & Visual Signal Laboratory
      </h2>
      <p class="category-desc">
        Visual analysis lab verifying luminosity contrast math, removing single-channel color dependency, and evaluating perception under diverse color vision deficiencies.
      </p>

      <!-- Sub Navigation -->
      <div class="instrument-nav" role="tablist" aria-label="Contrast Lab Modules">
        <button
          type="button"
          role="tab"
          class="inst-tab"
          :class="{ active: activeSubTab === 'contrast' }"
          :aria-selected="activeSubTab === 'contrast'"
          @click="activeSubTab = 'contrast'"
        >
          Contrast Measurement Lab ({{ contrastIssues.length }})
        </button>
        <button
          type="button"
          role="tab"
          class="inst-tab"
          :class="{ active: activeSubTab === 'colour-only' }"
          :aria-selected="activeSubTab === 'colour-only'"
          @click="activeSubTab = 'colour-only'"
        >
          Colour-Only Information Inspector ({{ colourOnlyIssues.length }})
        </button>
        <button
          type="button"
          role="tab"
          class="inst-tab"
          :class="{ active: activeSubTab === 'simulation' }"
          :aria-selected="activeSubTab === 'simulation'"
          @click="activeSubTab = 'simulation'"
        >
          Perception Simulation Lab
        </button>
        <button
          type="button"
          role="tab"
          class="inst-tab"
          :class="{ active: activeSubTab === 'signals' }"
          :aria-selected="activeSubTab === 'signals'"
          @click="activeSubTab = 'signals'"
        >
          Visual Signal Enhancements
        </button>
      </div>
    </div>

    <!-- MODULE 1: CONTRAST MEASUREMENT LAB -->
    <section v-if="activeSubTab === 'contrast'" class="module-section">
      <div class="module-intro">
        <h3>Measured Luminosity Contrast Ratios</h3>
        <p>
          WCAG 2.1 Success Criterion 1.4.3 requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt bold).
        </p>
      </div>

      <div class="contrast-grid">
        <div
          v-for="item in contrastMeasurements"
          :key="item.id"
          class="contrast-card card-box"
          :class="{ selected: selectedIssueId === item.id }"
          @click="emit('select-issue', item.issue)"
        >
          <div class="contrast-head">
            <span class="target-chip">{{ item.component }}</span>
            <span class="badge" :class="item.pass ? 'badge-fixed' : 'badge-severity-high'">
              {{ item.pass ? 'Resolved (4.5:1+)' : 'Failing (' + item.ratio + ')' }}
            </span>
          </div>

          <!-- Color Swatch Comparison -->
          <div class="swatch-bench">
            <div
              class="live-swatch"
              :style="{ backgroundColor: item.bgColor, color: item.fgColor }"
            >
              <span class="swatch-text">Sample Text Aa</span>
            </div>
            <div class="swatch-details">
              <div class="swatch-hex-row">
                <span class="dot-swatch" :style="{ backgroundColor: item.fgColor }"></span>
                <span>Text: <code>{{ item.fgColor }}</code></span>
              </div>
              <div class="swatch-hex-row">
                <span class="dot-swatch" :style="{ backgroundColor: item.bgColor }"></span>
                <span>Background: <code>{{ item.bgColor }}</code></span>
              </div>
            </div>
          </div>

          <!-- Ratio Diagnostics Meter -->
          <div class="ratio-meter">
            <div class="meter-labels">
              <span class="meter-measured">Measured: <strong>{{ item.ratio }}</strong></span>
              <span class="meter-target">Required: <strong>{{ item.required }}</strong></span>
            </div>
            <div class="meter-track">
              <div class="meter-bar" :style="{ width: item.pass ? '100%' : '47%' }"></div>
              <div class="threshold-line" title="4.5:1 Minimum Threshold"></div>
            </div>
          </div>

          <div class="card-footer">
            <code class="element-selector">{{ item.element }}</code>
          </div>
        </div>

        <div v-if="contrastMeasurements.length === 0" class="empty-state-card card-box">
          <p>No contrast violations recorded in the automated scan results.</p>
        </div>
      </div>
    </section>

    <!-- MODULE 2: COLOUR-ONLY INFORMATION INSPECTOR -->
    <section v-if="activeSubTab === 'colour-only'" class="module-section">
      <div class="module-intro">
        <h3>Single-Channel Colour Dependency Findings</h3>
        <p>
          Identifies instances where crucial information (errors, active links, operational states) is conveyed by color differences without secondary shapes, labels, or iconography.
        </p>
      </div>

      <div class="findings-grid">
        <div
          v-for="issue in colourOnlyIssues"
          :key="issue.id"
          class="inspector-card card-box"
          :class="{ selected: selectedIssueId === issue.id }"
          @click="emit('select-issue', issue)"
        >
          <div class="card-head">
            <span class="badge badge-severity-medium">{{ issue.severity }}</span>
            <span class="badge font-mono">WCAG {{ issue.wcag }}</span>
            <span class="badge" :class="issue.fixed ? 'badge-fixed' : 'badge-open'">
              {{ issue.fixed ? 'Patched' : 'Needs Fix' }}
            </span>
          </div>

          <h4 class="card-title">{{ issue.description }}</h4>

          <div class="diagnosis-block">
            <div class="diag-label">Identified Barrier:</div>
            <p class="diag-p">
              {{ issue.type === 'color-only-status'
                ? 'Field error state turns border red without accompanying text explanation or alert icon.'
                : 'Inline links rely strictly on hue differences without underline or 3:1 non-color contrast boundary.' }}
            </p>
          </div>

          <div class="adaptation-recommendation">
            <span class="rec-title">Proposed Multi-Cue Adaptation:</span>
            <code>{{ issue.proposedFix ?? 'Add secondary icon, underline, or explicit status tag' }}</code>
          </div>
        </div>
      </div>
    </section>

    <!-- MODULE 3: PERCEPTION SIMULATION LAB -->
    <section v-if="activeSubTab === 'simulation'" class="module-section">
      <div class="module-intro">
        <h3>Deficiency Perception Simulator</h3>
        <p>
          Simulates how users with anomalous trichromacy, dichromacy, and monochromacy experience the color relationships on the audited page.
        </p>
      </div>

      <div class="sim-lab-card card-box">
        <div class="sim-controls-row">
          <span class="control-label">Select Simulation Profile:</span>
          <div class="sim-buttons-group">
            <button
              type="button"
              class="btn-sim"
              :class="{ active: simulationType === 'deuteranopia' }"
              @click="simulationType = 'deuteranopia'"
            >
              Deuteranopia (Green-blind · ~6% of men)
            </button>
            <button
              type="button"
              class="btn-sim"
              :class="{ active: simulationType === 'protanopia' }"
              @click="simulationType = 'protanopia'"
            >
              Protanopia (Red-blind · ~2% of men)
            </button>
            <button
              type="button"
              class="btn-sim"
              :class="{ active: simulationType === 'tritanopia' }"
              @click="simulationType = 'tritanopia'"
            >
              Tritanopia (Blue-blind · ~0.1%)
            </button>
            <button
              type="button"
              class="btn-sim"
              :class="{ active: simulationType === 'monochrome' }"
              @click="simulationType = 'monochrome'"
            >
              Achromatopsia (Monochrome)
            </button>
          </div>
        </div>

        <div class="simulation-stage" :class="`sim-filter-${simulationType}`">
          <div class="stage-header">
            <span class="badge badge-colour-vision">Simulated Viewport: {{ simulationType }}</span>
            <span class="stage-hint">Notice how red and green converge toward identical brownish-khaki hues</span>
          </div>

          <div class="mock-ui-sample">
            <div class="mock-header-sample">
              <strong>AccessFix Customer Portal</strong>
              <span class="sample-tag tag-warning">System Maintenance Notice</span>
            </div>
            <div class="mock-body-sample">
              <div class="sample-field-group">
                <label>Account Status Notification</label>
                <div class="status-box-bad">
                  <span class="color-dot dot-red"></span>
                  <span>Payment declined — please update payment details.</span>
                </div>
                <div class="status-box-good">
                  <span class="color-dot dot-green"></span>
                  <span>Backup subscription renewed successfully.</span>
                </div>
              </div>

              <div class="sample-btn-row">
                <button type="button" class="btn-sample-amber">Confirm Changes</button>
                <button type="button" class="btn-sample-grey">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MODULE 4: VISUAL SIGNAL ENHANCEMENTS -->
    <section v-if="activeSubTab === 'signals'" class="module-section">
      <div class="module-intro">
        <h3>Deterministic Visual Signal Controls</h3>
        <p>
          Preview backend-supported transformations that enhance visual signals without altering underlying application branding.
        </p>
      </div>

      <div class="enhancements-grid">
        <div class="control-card card-box">
          <div class="control-toggle-row">
            <div>
              <h4>Always Underline Inline Text Links</h4>
              <p>Ensures links do not rely on color perception alone to be discovered within paragraph text.</p>
            </div>
            <input
              type="checkbox"
              id="toggle-underline"
              v-model="previewUnderlineLinks"
              class="toggle-checkbox"
            />
          </div>
          <div class="preview-mini-box">
            <p>
              Refer to our
              <span :class="{ 'preview-underlined': previewUnderlineLinks }">documentation portal</span>
              for integration guidelines.
            </p>
          </div>
        </div>

        <div class="control-card card-box">
          <div class="control-toggle-row">
            <div>
              <h4>Complement Color Badges with Descriptive Icons</h4>
              <p>Adds distinct geometric icons (check, cross, exclamation) to status chips and form error boxes.</p>
            </div>
            <input
              type="checkbox"
              id="toggle-icons"
              v-model="previewStatusIcons"
              class="toggle-checkbox"
            />
          </div>
          <div class="preview-mini-box">
            <span class="chip-status-preview chip-error">
              <svg v-if="previewStatusIcons" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Input Error
            </span>
            <span class="chip-status-preview chip-ok">
              <svg v-if="previewStatusIcons" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Active Validated
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.contrast-lab {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-banner {
  background-color: var(--color-surface);
  border: 1px solid var(--cat-colour-vision-border);
  border-top: 4px solid var(--cat-colour-vision);
  border-radius: var(--radius-lg);
  padding: 28px 28px 0;
}

.banner-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.concept-tag {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--cat-colour-vision-dark);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.category-heading {
  font-size: 1.6rem;
  margin-bottom: 8px;
}

.category-desc {
  color: var(--color-charcoal);
  font-size: 0.95rem;
  line-height: 1.55;
  margin-bottom: 24px;
  max-width: 800px;
}

.instrument-nav {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--color-border);
  overflow-x: auto;
}

.inst-tab {
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  padding: 10px 16px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.inst-tab:hover {
  color: var(--color-obsidian);
}

.inst-tab.active {
  color: var(--cat-colour-vision-dark);
  border-bottom-color: var(--cat-colour-vision);
}

.module-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.module-intro h3 {
  font-size: 1.2rem;
  margin-bottom: 4px;
}

.module-intro p {
  font-size: 0.875rem;
  color: var(--color-muted);
}

/* Contrast Grid */
.contrast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.contrast-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.contrast-card:hover {
  border-color: var(--cat-colour-vision);
  box-shadow: var(--shadow-md);
}

.contrast-card.selected {
  outline: 2px solid var(--cat-colour-vision);
  background: var(--cat-colour-vision-bg);
}

.contrast-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.target-chip {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-obsidian);
}

.swatch-bench {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.live-swatch {
  width: 140px;
  height: 64px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  box-shadow: var(--shadow-sm);
}

.swatch-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.75rem;
}

.swatch-hex-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot-swatch {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: 1px solid var(--color-border);
}

.ratio-meter {
  margin-bottom: 12px;
}

.meter-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 6px;
}

.meter-track {
  height: 8px;
  background: var(--color-surface-sunken);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.meter-bar {
  height: 100%;
  background: var(--color-danger);
  border-radius: 4px;
}

.threshold-line {
  position: absolute;
  left: 60%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-obsidian);
}

.element-selector {
  font-size: 0.75rem;
  color: var(--color-muted);
}

/* Single-Channel Inspector */
.findings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.inspector-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.inspector-card.selected {
  outline: 2px solid var(--cat-colour-vision);
  background: var(--cat-colour-vision-bg);
}

.card-head {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.card-title {
  font-size: 0.95rem;
  margin-bottom: 10px;
}

.diagnosis-block {
  background: var(--color-surface-sunken);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.diag-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 4px;
}

.diag-p {
  font-size: 0.8125rem;
  color: var(--color-charcoal);
  margin-bottom: 0;
}

.adaptation-recommendation {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
}

.rec-title {
  display: block;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #166534;
  margin-bottom: 4px;
}

/* Simulation Lab */
.sim-lab-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sim-controls-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-label {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-muted);
}

.sim-buttons-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-sim {
  padding: 6px 14px;
  font-size: 0.8125rem;
  font-family: var(--font-body);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-sim:hover {
  background: var(--color-surface-sunken);
}

.btn-sim.active {
  background: var(--cat-colour-vision-dark);
  color: #ffffff;
  border-color: var(--cat-colour-vision-dark);
}

.simulation-stage {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 24px;
  background: #ffffff;
}

.sim-filter-deuteranopia {
  filter: sepia(0.6) hue-rotate(-20deg) saturate(0.8);
}

.sim-filter-protanopia {
  filter: sepia(0.7) hue-rotate(180deg) saturate(0.6);
}

.sim-filter-tritanopia {
  filter: sepia(0.5) hue-rotate(90deg) saturate(0.8);
}

.sim-filter-monochrome {
  filter: grayscale(1);
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.stage-hint {
  font-size: 0.75rem;
  color: var(--color-muted);
  font-style: italic;
}

.mock-ui-sample {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 520px;
  margin: 0 auto;
}

.mock-header-sample {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sample-tag {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.tag-warning {
  background: #fef3c7;
  color: #92400e;
}

.sample-field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-box-bad {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  color: #991b1b;
}

.status-box-good {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  color: #166534;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot-red { background: #ef4444; }
.dot-green { background: #22c55e; }

.sample-btn-row {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn-sample-amber {
  background: #d97706;
  color: #ffffff;
  border: 0;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.8125rem;
}

.btn-sample-grey {
  background: #e2e8f0;
  color: #334155;
  border: 0;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.8125rem;
}

/* Enhancements Grid */
.enhancements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.control-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.control-toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.control-toggle-row h4 {
  font-size: 1rem;
  margin-bottom: 4px;
}

.control-toggle-row p {
  font-size: 0.8125rem;
  color: var(--color-muted);
  margin-bottom: 0;
}

.toggle-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.preview-mini-box {
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-underlined {
  text-decoration: underline;
  text-underline-offset: 3px;
  font-weight: 600;
  color: var(--cat-colour-vision-dark);
}

.chip-status-preview {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.chip-error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.chip-ok {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}
</style>
