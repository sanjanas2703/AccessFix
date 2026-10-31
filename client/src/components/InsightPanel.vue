<script setup>
import { ref } from 'vue';

const props = defineProps({
  issue: {
    type: Object,
    default: null,
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['close', 'inspect-in-studio']);

const copied = ref(false);

function copySelector(selector) {
  if (!selector) return;
  navigator.clipboard?.writeText(selector);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1800);
}
</script>

<template>
  <aside
    v-if="isOpen && issue"
    class="insight-panel"
    aria-labelledby="insight-panel-title"
  >
    <div class="panel-header">
      <div class="header-badges">
        <span class="badge" :class="`badge-severity-${issue.severity}`">
          {{ issue.severity }} severity
        </span>
        <span class="badge" :class="issue.fixed ? 'badge-fixed' : 'badge-open'">
          {{ issue.fixed ? 'Patched' : 'Unresolved' }}
        </span>
        <span v-if="issue.requiresManualReview" class="badge badge-severity-medium">
          Review Needed
        </span>
      </div>
      <button
        type="button"
        class="btn-icon"
        aria-label="Close insight panel"
        @click="emit('close')"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="panel-body">
      <h3 id="insight-panel-title" class="issue-heading">
        {{ issue.description }}
      </h3>

      <div class="spec-group">
        <div class="spec-item">
          <span class="spec-label">Component</span>
          <span class="spec-value">{{ issue.component ?? 'General DOM' }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Page Route</span>
          <span class="spec-value">{{ issue.page ?? '/' }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">WCAG Criterion</span>
          <span class="spec-value font-mono">WCAG {{ issue.wcag }}</span>
        </div>
      </div>

      <!-- 1. What's happening? -->
      <section class="insight-section">
        <h4 class="section-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          What's happening?
        </h4>
        <p class="section-text">
          An automated accessibility inspection detected an element violating expected accessibility heuristics for
          <strong>{{ issue.group }}</strong> barriers.
        </p>
        <div class="code-box">
          <div class="code-box-header">
            <span>DOM Selector</span>
            <button
              type="button"
              class="btn-copy"
              @click="copySelector(issue.selector)"
            >
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
          <code class="selector-code">{{ issue.selector }}</code>
        </div>
      </section>

      <!-- 2. Why does it matter? -->
      <section class="insight-section">
        <h4 class="section-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          Why does it matter?
        </h4>
        <p class="section-text">
          <span v-if="issue.group === 'blind'">
            Without explicit names, roles, or alt attributes, assistive software cannot interpret the element's intent, effectively erasing the content for blind navigators.
          </span>
          <span v-else-if="issue.group === 'colourblind'">
            Users with color deficiencies or degraded vision cannot rely on hue alone. Text with contrast below 4.5:1 causes severe eye strain and illegibility.
          </span>
          <span v-else-if="issue.group === 'cognitive' || issue.type?.includes('animation')">
            Uncontrolled motion or looping movement triggers cognitive disruption, attention fragmentation, and inner-ear vestibular dizziness.
          </span>
          <span v-else>
            Keyboard users and people with motor impairments rely on visible focus indicators and navigable tab rings to complete transactions.
          </span>
        </p>
      </section>

      <!-- 3. Technical Evidence -->
      <section v-if="issue.evidence" class="insight-section">
        <h4 class="section-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          Observed Evidence
        </h4>
        <div class="evidence-box">
          <pre><code>{{ JSON.stringify(issue.evidence, null, 2) }}</code></pre>
        </div>
      </section>

      <!-- 4. Suggested Adjustment -->
      <section v-if="issue.guidance || issue.proposedFix" class="insight-section">
        <h4 class="section-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Suggested Adaptation
        </h4>
        <p v-if="issue.guidance" class="section-text guidance-text">
          {{ issue.guidance }}
        </p>
        <div v-if="issue.proposedFix" class="code-box fix-box">
          <span class="fix-label">Proposed Code Fix</span>
          <code>{{ issue.proposedFix }}</code>
        </div>
      </section>

      <!-- 5. Nosana AI Explanation (where provided) -->
      <section v-if="issue.aiExplanation" class="insight-section ai-section">
        <h4 class="section-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          </svg>
          AI Synthesized Explanation
        </h4>
        <p class="ai-text">
          {{ issue.aiExplanation }}
        </p>
      </section>

      <!-- 6. Human Review Flag -->
      <div v-if="issue.requiresManualReview" class="manual-review-alert">
        <strong>Manual Verification Required</strong>
        <p>
          AI and heuristics can flag anomalies, but verifying semantic meaning requires human author context.
        </p>
      </div>

      <div class="panel-actions">
        <button
          type="button"
          class="btn btn-primary btn-full"
          @click="emit('inspect-in-studio', issue)"
        >
          Inspect in Transformation Studio
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.insight-panel {
  width: 380px;
  background-color: var(--color-surface);
  border-left: 1px solid var(--color-border);
  height: calc(100vh - 68px);
  position: sticky;
  top: 68px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-badges {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-icon {
  background: transparent;
  border: 0;
  color: var(--color-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: var(--color-surface-sunken);
  color: var(--color-obsidian);
}

.panel-body {
  padding: 20px;
  flex: 1;
}

.issue-heading {
  font-size: 1.125rem;
  line-height: 1.35;
  margin-bottom: 16px;
}

.spec-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px;
  background: var(--color-surface-sunken);
  border-radius: var(--radius-sm);
  margin-bottom: 20px;
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.spec-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-muted);
}

.spec-value {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-obsidian);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.font-mono {
  font-family: var(--font-mono);
}

.insight-section {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-obsidian);
  margin-bottom: 8px;
}

.section-text {
  font-size: 0.875rem;
  color: var(--color-charcoal);
  line-height: 1.55;
  margin-bottom: 8px;
}

.code-box {
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
}

.code-box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 6px;
}

.btn-copy {
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.6875rem;
  cursor: pointer;
  font-weight: 600;
}

.selector-code {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--color-brand);
  word-break: break-all;
}

.evidence-box {
  background: #111715;
  color: #a7f3d0;
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  font-size: 0.75rem;
  overflow-x: auto;
}

.evidence-box pre {
  margin: 0;
}

.fix-box {
  background: #f0fdf4;
  border-color: #bbf7d0;
  margin-top: 8px;
}

.fix-label {
  display: block;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #166534;
  margin-bottom: 4px;
}

.fix-box code {
  color: #14532d;
  font-size: 0.8125rem;
}

.ai-section {
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-radius: var(--radius-sm);
  padding: 12px;
}

.ai-text {
  font-size: 0.8125rem;
  color: #581c87;
  line-height: 1.5;
  margin-bottom: 0;
}

.manual-review-alert {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: var(--radius-sm);
  padding: 12px;
  margin-bottom: 20px;
  font-size: 0.8125rem;
  color: #92400e;
}

.manual-review-alert strong {
  display: block;
  margin-bottom: 4px;
}

.manual-review-alert p {
  margin: 0;
  color: #78350f;
}

.panel-actions {
  margin-top: 24px;
}

.btn-full {
  width: 100%;
}

@media (max-width: 1200px) {
  .insight-panel {
    position: fixed;
    right: 0;
    top: 68px;
    bottom: 0;
    z-index: 100;
    box-shadow: var(--shadow-lg);
  }
}
</style>
