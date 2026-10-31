<script setup>
import { computed } from 'vue';
import ScoreRadar from './ScoreRadar.vue';
import { CORE_CATEGORIES } from '../groups.js';

const props = defineProps({
  scan: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['navigate-category', 'select-issue']);

const screenReaderIssues = computed(() =>
  props.scan?.issues?.filter((i) => i.group === 'blind') ?? []
);

const colourVisionIssues = computed(() =>
  props.scan?.issues?.filter((i) => i.group === 'colourblind') ?? []
);

const motionIssues = computed(() =>
  props.scan?.issues?.filter((i) => i.group === 'cognitive' || i.type?.includes('motion') || i.type?.includes('animation')) ?? []
);

const automatedViolations = computed(() =>
  props.scan?.issues?.filter((i) => !i.requiresManualReview) ?? []
);

const manualReviewItems = computed(() =>
  props.scan?.issues?.filter((i) => i.requiresManualReview || !i.fixed) ?? []
);

const improvedChecks = computed(() =>
  props.scan?.issues?.filter((i) => i.fixed) ?? []
);
</script>

<template>
  <div class="executive-overview" aria-labelledby="overview-title">
    <!-- Top Hero Metric Bar -->
    <div class="overview-hero card-box">
      <div class="hero-left">
        <span class="badge badge-screen-reader">Target Analysis Report</span>
        <h2 id="overview-title" class="overview-title">Executive Accessibility Summary</h2>
        <div class="target-meta-row">
          <span class="url-badge font-mono">{{ scan.url }}</span>
          <span class="dot-separator">·</span>
          <span>Inspected via Daytona Sandbox</span>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Automated Violations</span>
          <span class="kpi-val text-danger">{{ automatedViolations.length }}</span>
          <span class="kpi-sub">Definite standard failures</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Automated Improvements</span>
          <span class="kpi-val text-green">+{{ improvedChecks.length }}</span>
          <span class="kpi-sub">Verified via retest.js</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Requires Human Review</span>
          <span class="kpi-val text-amber">{{ manualReviewItems.length }}</span>
          <span class="kpi-sub">Contextual assessment</span>
        </div>
      </div>
    </div>

    <!-- Category Spotlight Cards -->
    <div class="category-cards-grid">
      <!-- Category A -->
      <div
        class="category-summary-card card-box card-teal"
        @click="emit('navigate-category', 'screen-reader')"
      >
        <div class="card-top">
          <span class="badge badge-screen-reader">Category A</span>
          <span class="issue-counter">{{ screenReaderIssues.length }} Findings</span>
        </div>
        <h3>Screen Reader Accessibility</h3>
        <p>
          Semantic structure tree, missing accessible names on icon buttons, and image alternative text reviews.
        </p>
        <div class="card-footer-action">
          <span>Open Structure Instrument</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>

      <!-- Category B -->
      <div
        class="category-summary-card card-box card-amber"
        @click="emit('navigate-category', 'colour-vision')"
      >
        <div class="card-top">
          <span class="badge badge-colour-vision">Category B</span>
          <span class="issue-counter">{{ colourVisionIssues.length }} Findings</span>
        </div>
        <h3>Colour Vision & Contrast Lab</h3>
        <p>
          Precise luminosity contrast measurements, deficiency perception simulator, and multi-cue signal adjustments.
        </p>
        <div class="card-footer-action">
          <span>Open Contrast Laboratory</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>

      <!-- Category C -->
      <div
        class="category-summary-card card-box card-indigo"
        @click="emit('navigate-category', 'motion')"
      >
        <div class="card-top">
          <span class="badge badge-motion">Category C</span>
          <span class="issue-counter">{{ motionIssues.length }} Findings</span>
        </div>
        <h3>Motion Sensitivity</h3>
        <p>
          Unconstrained carousel animations, missing pause/stop controls, and reversible reduced-motion previews.
        </p>
        <div class="card-footer-action">
          <span>Open Motion Inventory</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>
    </div>

    <!-- Radar Chart & Score Section -->
    <ScoreRadar
      v-if="scan.scoresBefore && scan.scoresAfter"
      :before="scan.scoresBefore"
      :after="scan.scoresAfter"
    />

    <!-- Scientific & Ethical Disclosure Note -->
    <div class="disclosure-banner card-box">
      <div class="disclosure-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <div class="disclosure-text">
        <h4>Methodology & Verification Notice</h4>
        <p>
          AccessFix does not compute an arbitrary universal accessibility score, nor do we certify universal WCAG compliance.
          Automated tooling inspects measurable criteria across <strong>Screen Reader Accessibility</strong>, <strong>Colour Vision</strong>, and <strong>Motion Sensitivity</strong>.
          Authentic accessibility requires continuous involvement of people with lived disabilities and expert human review.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.executive-overview {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.overview-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.overview-title {
  font-size: 1.65rem;
  margin: 6px 0 8px;
}

.target-meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8125rem;
  color: var(--color-muted);
}

.url-badge {
  color: var(--color-obsidian);
  font-weight: 600;
}

.kpi-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.kpi-card {
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 18px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 140px;
}

.kpi-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-muted);
}

.kpi-val {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.2;
}

.kpi-sub {
  font-size: 0.6875rem;
  color: var(--color-muted);
}

.text-danger { color: var(--color-danger); }
.text-green { color: var(--color-success); }
.text-amber { color: var(--color-warning); }

/* Category Cards Grid */
.category-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.category-summary-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 24px;
}

.card-teal {
  border-top: 4px solid var(--cat-screen-reader);
}
.card-teal:hover {
  border-color: var(--cat-screen-reader);
  box-shadow: var(--shadow-md);
}

.card-amber {
  border-top: 4px solid var(--cat-colour-vision);
}
.card-amber:hover {
  border-color: var(--cat-colour-vision);
  box-shadow: var(--shadow-md);
}

.card-indigo {
  border-top: 4px solid var(--cat-motion);
}
.card-indigo:hover {
  border-color: var(--cat-motion);
  box-shadow: var(--shadow-md);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.issue-counter {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-muted);
}

.category-summary-card h3 {
  font-size: 1.15rem;
  margin-bottom: 8px;
}

.category-summary-card p {
  font-size: 0.875rem;
  color: var(--color-charcoal);
  line-height: 1.5;
  margin-bottom: 20px;
}

.card-footer-action {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-obsidian);
  margin-top: auto;
}

/* Disclosure */
.disclosure-banner {
  display: flex;
  gap: 16px;
  background-color: var(--color-surface-sunken);
  border-left: 4px solid var(--color-obsidian);
  padding: 20px 24px;
}

.disclosure-icon {
  color: var(--color-obsidian);
  margin-top: 2px;
}

.disclosure-text h4 {
  font-size: 0.95rem;
  margin-bottom: 6px;
}

.disclosure-text p {
  font-size: 0.8125rem;
  color: var(--color-charcoal);
  line-height: 1.55;
  margin-bottom: 0;
}

@media (max-width: 900px) {
  .category-cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
