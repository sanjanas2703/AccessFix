<script setup>
import { ref } from 'vue';
import { CORE_CATEGORIES } from '../groups.js';

const activeCategory = ref('screen-reader');

// Colour vision simulation filter
const colorFilter = ref('normal');

// Motion simulation toggle
const motionPaused = ref(true); // Default to calm/safe state

function setCategory(id) {
  activeCategory.value = id;
}
</script>

<template>
  <section class="showcase-section" aria-labelledby="showcase-heading">
    <div class="showcase-header">
      <span class="badge badge-severity-low">Interactive Capability Showcase</span>
      <h2 id="showcase-heading" class="showcase-title">Three specialized accessibility dimensions</h2>
      <p class="showcase-subtitle">
        Select a category below to explore how AccessFix visualizes structural, perceptual, and vestibular barriers.
      </p>

      <div class="category-tabs" role="tablist" aria-label="Accessibility Showcase Categories">
        <button
          id="tab-screen-reader"
          type="button"
          role="tab"
          class="tab-btn"
          :class="{ active: activeCategory === 'screen-reader' }"
          :aria-selected="activeCategory === 'screen-reader'"
          aria-controls="panel-screen-reader"
          @click="setCategory('screen-reader')"
        >
          <span class="tab-indicator indicator-teal" aria-hidden="true"></span>
          <span class="tab-text">Screen Reader</span>
        </button>

        <button
          id="tab-colour-vision"
          type="button"
          role="tab"
          class="tab-btn"
          :class="{ active: activeCategory === 'colour-vision' }"
          :aria-selected="activeCategory === 'colour-vision'"
          aria-controls="panel-colour-vision"
          @click="setCategory('colour-vision')"
        >
          <span class="tab-indicator indicator-amber" aria-hidden="true"></span>
          <span class="tab-text">Colour Vision & Contrast</span>
        </button>

        <button
          id="tab-motion"
          type="button"
          role="tab"
          class="tab-btn"
          :class="{ active: activeCategory === 'motion' }"
          :aria-selected="activeCategory === 'motion'"
          aria-controls="panel-motion"
          @click="setCategory('motion')"
        >
          <span class="tab-indicator indicator-indigo" aria-hidden="true"></span>
          <span class="tab-text">Motion Sensitivity</span>
        </button>
      </div>
    </div>

    <!-- Active Panel Showcase Display -->
    <div class="showcase-stage card-box">
      <!-- 1. Screen Reader Semantic Map -->
      <div
        v-if="activeCategory === 'screen-reader'"
        id="panel-screen-reader"
        role="tabpanel"
        aria-labelledby="tab-screen-reader"
        class="panel-content screen-reader-panel"
      >
        <div class="panel-meta">
          <div class="panel-meta-header">
            <span class="badge badge-screen-reader">Category A · Structure & Navigation</span>
            <h3>Semantic Structure Map</h3>
          </div>
          <p>
            Screen readers do not see pixels—they build an accessibility tree from semantic landmarks, headings, and accessible names.
          </p>
          <div class="diagnostic-box warning-border">
            <div class="diag-header">
              <span class="status-dot dot-danger" aria-hidden="true"></span>
              <strong>Detected Barrier: Unannounced Interactive Control</strong>
            </div>
            <p class="diag-body">
              <code>button.icon-search</code> contains an SVG graphic but lacks text or an <code>aria-label</code>. Announced by screen readers merely as <em>"button"</em>.
            </p>
          </div>
        </div>

        <div class="panel-visual">
          <div class="tree-frame" aria-label="Visual accessibility tree diagram">
            <div class="tree-node landmark">
              <div class="node-badge">&lt;header role="banner"&gt;</div>
              <div class="tree-children">
                <div class="tree-node">
                  <span class="node-pill pill-ok">&lt;nav aria-label="Main"&gt;</span>
                </div>
                <div class="tree-node node-error">
                  <span class="node-pill pill-err">&lt;button class="icon-search"&gt;</span>
                  <span class="err-tag">Missing accessible name</span>
                </div>
              </div>
            </div>

            <div class="tree-node landmark">
              <div class="node-badge">&lt;main id="content"&gt;</div>
              <div class="tree-children">
                <div class="tree-node">
                  <span class="node-pill pill-ok">&lt;h1&gt; Autumn Release</span>
                </div>
                <div class="tree-node node-error">
                  <span class="node-pill pill-err">&lt;img class="hero-banner"&gt;</span>
                  <span class="err-tag">Missing alt attribute</span>
                </div>
                <div class="tree-node">
                  <span class="node-pill pill-ok">&lt;form aria-labelledby="contact"&gt;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Colour Vision & Contrast Lab -->
      <div
        v-if="activeCategory === 'colour-vision'"
        id="panel-colour-vision"
        role="tabpanel"
        aria-labelledby="tab-colour-vision"
        class="panel-content colour-vision-panel"
      >
        <div class="panel-meta">
          <div class="panel-meta-header">
            <span class="badge badge-colour-vision">Category B · Perception & Contrast</span>
            <h3>Visual Signal & Contrast Lab</h3>
          </div>
          <p>
            Relying solely on green and red colors causes loss of meaning for 1 in 12 men with color vision deficiencies.
          </p>

          <div class="simulation-selector">
            <span class="sim-label">Interactive Simulation:</span>
            <div class="filter-pills">
              <button
                type="button"
                class="sim-pill"
                :class="{ active: colorFilter === 'normal' }"
                @click="colorFilter = 'normal'"
              >
                Normal Vision
              </button>
              <button
                type="button"
                class="sim-pill"
                :class="{ active: colorFilter === 'deuteranopia' }"
                @click="colorFilter = 'deuteranopia'"
              >
                Deuteranopia (Green-weak)
              </button>
              <button
                type="button"
                class="sim-pill"
                :class="{ active: colorFilter === 'protanopia' }"
                @click="colorFilter = 'protanopia'"
              >
                Protanopia (Red-weak)
              </button>
            </div>
          </div>
        </div>

        <div class="panel-visual">
          <div class="comparison-grid" :class="`filter-${colorFilter}`">
            <!-- Ambiguous Example -->
            <div class="example-card example-before">
              <div class="example-tag tag-danger">Ambiguous: Colour Alone</div>
              <div class="sample-form-item">
                <span class="sample-label">Server Status</span>
                <div class="status-indicator-only dot-green"></div>
              </div>
              <div class="sample-form-item">
                <span class="sample-label">Validation Error</span>
                <input type="text" class="sample-input input-red-border" value="user@domain" readonly />
              </div>
              <div class="sample-contrast-fail">
                <button type="button" class="btn-sample btn-low-contrast">Light Blue Button</button>
                <span class="ratio-badge ratio-fail">2.1:1 (Fail)</span>
              </div>
            </div>

            <!-- Adapted Example -->
            <div class="example-card example-after">
              <div class="example-tag tag-success">Adapted: Multi-Cue Clarity</div>
              <div class="sample-form-item">
                <span class="sample-label">Server Status</span>
                <span class="status-chip chip-online">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Operational
                </span>
              </div>
              <div class="sample-form-item">
                <span class="sample-label">Validation Error</span>
                <div class="input-with-message">
                  <input type="text" class="sample-input input-fixed" value="user@domain" readonly />
                  <span class="input-msg-error">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Valid email domain required
                  </span>
                </div>
              </div>
              <div class="sample-contrast-pass">
                <button type="button" class="btn-sample btn-high-contrast">High Contrast Button</button>
                <span class="ratio-badge ratio-pass">7.2:1 (Pass AAA)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Motion Sensitivity Panel -->
      <div
        v-if="activeCategory === 'motion'"
        id="panel-motion"
        role="tabpanel"
        aria-labelledby="tab-motion"
        class="panel-content motion-panel"
      >
        <div class="panel-meta">
          <div class="panel-meta-header">
            <span class="badge badge-motion">Category C · Calm & Control</span>
            <h3>Vestibular Comfort & Motion Neutralization</h3>
          </div>
          <p>
            Autoplaying carousels, parallax scrolls, and animated banners trigger dizziness and nausea for users with vestibular disorders.
          </p>

          <div class="motion-toggle-row">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              @click="motionPaused = !motionPaused"
            >
              <span v-if="motionPaused">▶ Resume Motion Preview</span>
              <span v-else>⏸ Pause & Reduce Motion</span>
            </button>
            <span class="motion-state-text">
              Status: <strong>{{ motionPaused ? 'Motion Neutralized (Safe State)' : 'Autoplaying (Unconstrained)' }}</strong>
            </span>
          </div>
        </div>

        <div class="panel-visual">
          <div class="motion-stage-box">
            <div class="carousel-mock" :class="{ 'carousel-paused': motionPaused }">
              <div class="carousel-slide slide-1">
                <span class="slide-tag">Hero Carousel</span>
                <h4>Featured Product Announcement</h4>
                <p>Gentle static presentation ensures readability without vestibular discomfort.</p>
              </div>
            </div>
            <div class="motion-controls-bar">
              <button
                type="button"
                class="control-pill"
                :class="{ active: motionPaused }"
                @click="motionPaused = true"
              >
                Reduced Motion Active
              </button>
              <span class="wcag-note">WCAG 2.2.2 Pause, Stop, Hide Compliance</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="showcase-footer">
      <span class="footer-note">Illustrative feature previews demonstrating core analysis capabilities.</span>
    </div>
  </section>
</template>

<style scoped>
.showcase-section {
  max-width: 1200px;
  margin: 0 auto 64px;
  padding: 0 var(--space-6);
}

.showcase-header {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 36px;
}

.showcase-title {
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  letter-spacing: -0.025em;
  margin-top: 12px;
  margin-bottom: 12px;
}

.showcase-subtitle {
  color: var(--color-muted);
  font-size: 1.05rem;
  line-height: 1.6;
  margin-bottom: 28px;
}

.category-tabs {
  display: inline-flex;
  background-color: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  padding: 5px;
  border-radius: var(--radius-full);
  gap: 4px;
  max-width: 100%;
  overflow-x: auto;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: transparent;
  border: 0;
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-charcoal);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.tab-btn:hover {
  color: var(--color-obsidian);
}

.tab-btn.active {
  background-color: var(--color-surface);
  color: var(--color-obsidian);
  box-shadow: var(--shadow-sm);
}

.tab-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.indicator-teal { background-color: var(--cat-screen-reader); }
.indicator-amber { background-color: var(--cat-colour-vision); }
.indicator-indigo { background-color: var(--cat-motion); }

.showcase-stage {
  padding: 36px;
  background: var(--color-surface);
}

.panel-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  align-items: center;
}

.panel-meta h3 {
  font-size: 1.5rem;
  margin-top: 10px;
  margin-bottom: 12px;
}

.panel-meta p {
  color: var(--color-charcoal);
  line-height: 1.6;
  font-size: 0.95rem;
}

.diagnostic-box {
  background: var(--color-surface-sunken);
  border-left: 4px solid var(--color-warning);
  padding: 14px 18px;
  border-radius: var(--radius-sm);
  margin-top: 20px;
}

.diag-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  margin-bottom: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-danger { background-color: var(--color-danger); }
.dot-green { width: 10px; height: 10px; border-radius: 50%; background-color: #22c55e; }

.diag-body {
  font-size: 0.875rem;
  color: var(--color-charcoal);
  margin-bottom: 0;
}

/* Tree Visualization */
.tree-frame {
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 24px;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
}

.tree-node {
  margin-bottom: 12px;
}

.node-badge {
  color: var(--cat-screen-reader-dark);
  font-weight: 600;
  margin-bottom: 6px;
}

.tree-children {
  margin-left: 20px;
  padding-left: 14px;
  border-left: 2px dashed var(--color-border);
}

.node-pill {
  display: inline-block;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  margin-bottom: 6px;
}

.pill-ok {
  background: #ffffff;
  color: var(--color-charcoal);
  border: 1px solid var(--color-border);
}

.pill-err {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border: 1px solid #fecaca;
  font-weight: 600;
}

.node-error {
  display: flex;
  align-items: center;
  gap: 8px;
}

.err-tag {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--color-danger);
  font-weight: 600;
}

/* Colour Vision Comparison Grid */
.simulation-selector {
  margin-top: 20px;
}

.sim-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-muted);
  margin-bottom: 8px;
}

.filter-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.sim-pill {
  padding: 5px 12px;
  font-size: 0.8125rem;
  font-family: var(--font-body);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sim-pill.active {
  background: var(--cat-colour-vision-dark);
  color: #ffffff;
  border-color: var(--cat-colour-vision-dark);
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* SVG-like color blindness filters via CSS */
.filter-deuteranopia {
  filter: sepia(0.6) hue-rotate(-20deg) saturate(0.8);
}

.filter-protanopia {
  filter: sepia(0.7) hue-rotate(180deg) saturate(0.6);
}

.example-card {
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface-sunken);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.example-tag {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tag-danger { color: var(--color-danger); }
.tag-success { color: var(--color-success); }

.sample-form-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sample-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-muted);
}

.sample-input {
  width: 100%;
  padding: 6px 10px;
  font-size: 0.8125rem;
  border-radius: var(--radius-sm);
  background: #ffffff;
}

.input-red-border {
  border: 1.5px solid #ef4444;
}

.input-fixed {
  border: 1.5px solid var(--color-border);
}

.input-msg-error {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--color-danger);
  font-weight: 600;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.chip-online {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.btn-sample {
  padding: 8px 12px;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: 0;
}

.btn-low-contrast {
  background: #bfdbfe;
  color: #93c5fd;
}

.btn-high-contrast {
  background: #0f172a;
  color: #38bdf8;
}

.ratio-badge {
  font-size: 0.75rem;
  font-weight: 700;
  margin-left: 8px;
}

.ratio-fail { color: var(--color-danger); }
.ratio-pass { color: var(--color-success); }

/* Motion Simulation */
.motion-toggle-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 18px;
  flex-wrap: wrap;
}

.motion-state-text {
  font-size: 0.875rem;
  color: var(--color-charcoal);
}

.motion-stage-box {
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 20px;
}

.carousel-mock {
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.slide-tag {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--cat-motion-dark);
  font-weight: 700;
}

.carousel-mock h4 {
  margin: 6px 0 8px;
  font-size: 1.15rem;
}

.carousel-mock p {
  font-size: 0.875rem;
  color: var(--color-muted);
  margin-bottom: 0;
}

.motion-controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
}

.control-pill {
  background: var(--cat-motion-bg);
  color: var(--cat-motion-dark);
  border: 1px solid var(--cat-motion-border);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.wcag-note {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.showcase-footer {
  text-align: center;
  margin-top: 16px;
}

.footer-note {
  font-size: 0.8125rem;
  color: var(--color-muted-light);
  font-style: italic;
}

@media (max-width: 900px) {
  .panel-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .comparison-grid {
    grid-template-columns: 1fr;
  }
}
</style>
