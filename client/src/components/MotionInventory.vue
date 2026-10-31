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

const isReducedMotionActive = ref(true); // Default to calm/safe state

const motionIssues = computed(() =>
  props.issues.filter(
    (i) =>
      i.group === 'cognitive' ||
      i.type?.includes('animation') ||
      i.type?.includes('motion') ||
      i.type?.includes('video') ||
      i.selector?.includes('carousel') ||
      i.component?.includes('Carousel') ||
      i.description?.toLowerCase().includes('animation') ||
      i.description?.toLowerCase().includes('carousel') ||
      i.description?.toLowerCase().includes('autoplay')
  )
);
</script>

<template>
  <div class="motion-inventory" aria-labelledby="motion-inventory-heading">
    <!-- Header with Category Identity -->
    <div class="category-banner banner-indigo">
      <div class="banner-badge">
        <span class="badge badge-motion">Category C</span>
        <span class="concept-tag">Calm · Control · Stability</span>
      </div>
      <h2 id="motion-inventory-heading" class="category-heading">
        Motion Sensitivity & Vestibular Comfort
      </h2>
      <p class="category-desc">
        Identifies unconstrained motion, auto-scrolling carousels, and missing pause controls that trigger nausea, vestibular disorientation, and cognitive fatigue.
      </p>

      <!-- Primary Control: Reduced Motion Switch -->
      <div class="preference-control-box">
        <div class="control-text">
          <span class="control-title">Reduced-Motion Adaptation Preview</span>
          <span class="control-sub">
            Reversible toggle applying CSS <code>prefers-reduced-motion: reduce</code> and pause hooks.
          </span>
        </div>
        <button
          type="button"
          class="btn-motion-toggle"
          :class="{ active: isReducedMotionActive }"
          @click="isReducedMotionActive = !isReducedMotionActive"
        >
          <span class="toggle-icon" aria-hidden="true">
            {{ isReducedMotionActive ? '⏸' : '▶' }}
          </span>
          <span>
            {{ isReducedMotionActive ? 'Reduced Motion: ON (Calm)' : 'Original Motion: Active' }}
          </span>
        </button>
      </div>
    </div>

    <!-- FEATURE C1: MOTION INVENTORY -->
    <section class="module-section">
      <div class="module-intro">
        <h3>Observed Motion & Animation Inventory ({{ motionIssues.length }})</h3>
        <p>
          Detected animated components and continuous media requiring pause, stop, or hide capabilities under WCAG 2.2.2.
        </p>
      </div>

      <div class="inventory-grid">
        <div
          v-for="issue in motionIssues"
          :key="issue.id"
          class="motion-item card-box"
          :class="{ selected: selectedIssueId === issue.id }"
          @click="emit('select-issue', issue)"
        >
          <div class="motion-head">
            <span class="badge badge-motion">
              {{ issue.type.includes('autoplay') ? 'Autoplay Animation' : 'Observed Dynamic Behaviour' }}
            </span>
            <span class="badge font-mono">WCAG {{ issue.wcag }}</span>
            <span class="badge" :class="issue.fixed ? 'badge-fixed' : 'badge-open'">
              {{ issue.fixed ? 'Patched' : 'Needs Review' }}
            </span>
          </div>

          <h4 class="item-title">{{ issue.description }}</h4>

          <div class="item-meta-grid">
            <div class="meta-col">
              <span class="label">Target Element</span>
              <code class="val">{{ issue.selector }}</code>
            </div>
            <div class="meta-col">
              <span class="label">Component</span>
              <span class="val">{{ issue.component }}</span>
            </div>
            <div class="meta-col">
              <span class="label">Observed Trigger</span>
              <span class="val">{{ issue.evidence?.motionType ?? 'Automatic timer-driven advance' }}</span>
            </div>
          </div>

          <div class="motion-evidence-box">
            <div class="evidence-row">
              <span class="tag">Evidence:</span>
              <span>
                {{ issue.evidence?.durationMs ? `Duration ${issue.evidence.durationMs}ms per slide` : 'Continuous transformation without user pause trigger' }}
              </span>
            </div>
            <div class="evidence-row">
              <span class="tag tag-fix">Proposed Fix:</span>
              <code>{{ issue.proposedFix ?? 'Add accessible pause/play button and reduced-motion stylesheet' }}</code>
            </div>
          </div>
        </div>

        <div v-if="motionIssues.length === 0" class="empty-state-card card-box">
          <p>No unconstrained animations or auto-playing media detected.</p>
        </div>
      </div>
    </section>

    <!-- FEATURE C3: MOTION COMPARISON -->
    <section class="module-section">
      <div class="module-intro">
        <h3>Two-Panel Behavioral Comparison</h3>
        <p>
          Evaluating the interactive experience between the unconstrained original state and the stabilized reduced-motion adaptation.
        </p>
      </div>

      <div class="comparison-container card-box">
        <div class="comparison-col">
          <div class="col-head">
            <span class="col-tag tag-original">Original Experience</span>
            <span class="col-status">Continuous Animation</span>
          </div>
          <div class="viewport-box viewport-active">
            <div class="banner-mock-animated">
              <div class="badge-pulsing">Auto-advancing 2.4s</div>
              <h5>Automated Slider Active</h5>
              <p>Content changes position without user initiative, disrupting reading focus.</p>
            </div>
          </div>
          <div class="col-footer">
            <span class="text-danger">⚠️ Potential vestibular discomfort</span>
          </div>
        </div>

        <div class="comparison-col">
          <div class="col-head">
            <span class="col-tag tag-adapted">Reduced-Motion Preview</span>
            <span class="col-status">Stable / User-Controlled</span>
          </div>
          <div class="viewport-box viewport-calm">
            <div class="banner-mock-static">
              <div class="badge-static">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                Movement Paused
              </div>
              <h5>Stable Reading View</h5>
              <p>Preserves all content in an accessible stationary layout with manual controls.</p>
            </div>
          </div>
          <div class="col-footer">
            <span class="text-success">✓ Meets WCAG 2.2.2 requirements</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.motion-inventory {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-banner {
  background-color: var(--color-surface);
  border: 1px solid var(--cat-motion-border);
  border-top: 4px solid var(--cat-motion);
  border-radius: var(--radius-lg);
  padding: 28px;
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
  color: var(--cat-motion-dark);
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

.preference-control-box {
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.control-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--color-obsidian);
}

.control-sub {
  font-size: 0.8125rem;
  color: var(--color-muted);
}

.btn-motion-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: #ffffff;
  color: var(--color-charcoal);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-motion-toggle.active {
  background: var(--cat-motion-dark);
  color: #ffffff;
  border-color: var(--cat-motion-dark);
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

.inventory-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.motion-item {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.motion-item:hover {
  border-color: var(--cat-motion);
  box-shadow: var(--shadow-md);
}

.motion-item.selected {
  outline: 2px solid var(--cat-motion);
  background: var(--cat-motion-bg);
}

.motion-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.item-title {
  font-size: 1rem;
  margin-bottom: 14px;
}

.item-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background: var(--color-surface-sunken);
  padding: 12px;
  border-radius: var(--radius-sm);
  margin-bottom: 14px;
}

.meta-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-col .label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-muted);
}

.meta-col .val {
  font-size: 0.8125rem;
  color: var(--color-obsidian);
  word-break: break-all;
}

.motion-evidence-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.8125rem;
}

.evidence-row {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.evidence-row .tag {
  font-weight: 700;
  color: var(--color-muted);
  min-width: 90px;
}

.evidence-row .tag-fix {
  color: #166534;
}

.evidence-row code {
  color: #14532d;
}

/* Two-Panel Comparison */
.comparison-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.comparison-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.col-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.col-tag {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tag-original { color: var(--color-danger); }
.tag-adapted { color: var(--color-success); }

.col-status {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.viewport-box {
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 24px;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-mock-animated {
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 20px;
  width: 100%;
}

.badge-pulsing {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  background: #fee2e2;
  color: #991b1b;
  margin-bottom: 8px;
}

.banner-mock-static {
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 20px;
  width: 100%;
}

.badge-static {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  background: #dcfce7;
  color: #166534;
  margin-bottom: 8px;
}

.banner-mock-animated h5,
.banner-mock-static h5 {
  font-size: 1rem;
  margin-bottom: 6px;
}

.banner-mock-animated p,
.banner-mock-static p {
  font-size: 0.8125rem;
  color: var(--color-muted);
  margin-bottom: 0;
}

.col-footer {
  font-size: 0.8125rem;
  font-weight: 600;
}

.text-danger { color: var(--color-danger); }
.text-success { color: var(--color-success); }

@media (max-width: 768px) {
  .comparison-container {
    grid-template-columns: 1fr;
  }
}
</style>
