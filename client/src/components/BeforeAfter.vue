<script setup>
import { computed } from 'vue';
import { imageUrl } from '../api.js';
import { FINDING_TYPE_LABELS, GROUP_LABELS, GROUPS } from '../groups.js';

const props = defineProps({
  scanId: { type: String, required: true },
  preview: { type: Object, required: true },
});
defineEmits(['revert']);

const TYPES = Object.keys(FINDING_TYPE_LABELS);
const comparison = computed(() => props.preview.comparison);
const failed = computed(() => (props.preview.applied ?? []).filter((item) => !item.applied));
</script>

<template>
  <section class="card-box before-after-card" aria-labelledby="before-after-heading">
    <div class="card-head">
      <h2 id="before-after-heading" class="section-title">Before and After Comparison</h2>
      <p class="section-sub">
        A screenshot shows visual changes only. It does not prove that a page works with a screen reader. These
        changes exist only in the sandbox preview.
      </p>
    </div>

    <p v-if="preview.status === 'failed'" class="error" role="alert">Preview failed: {{ preview.error }}</p>
    <p v-else-if="preview.status !== 'done'" role="status" class="status-msg">Applying adjustments and re-running checks…</p>

    <template v-if="preview.status === 'done'">
      <div class="placeholder-grid">
        <figure class="screenshot-figure">
          <img class="screenshot-img" :src="imageUrl(scanId, 'before.jpg')" alt="The page before adjustments" />
          <figcaption>Before Adjustments</figcaption>
        </figure>
        <figure class="screenshot-figure">
          <img class="screenshot-img" :src="imageUrl(scanId, 'after.jpg')" alt="The page with the selected adjustments" />
          <figcaption>After, in the sandbox preview</figcaption>
        </figure>
      </div>

      <div v-if="comparison" class="score-scroll" tabindex="0" role="region" aria-label="Findings before and after">
        <table class="score-table">
          <caption>Findings re-measured, before and after</caption>
          <thead>
            <tr>
              <th scope="col">Area</th>
              <th v-for="type in TYPES" :key="type" scope="col">{{ FINDING_TYPE_LABELS[type] }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="group in GROUPS.filter((g) => ['blind', 'colour', 'motion'].includes(g))" :key="group">
              <th scope="row">{{ GROUP_LABELS[group] || group }}</th>
              <td v-for="type in TYPES" :key="type">
                {{ comparison.countsBefore?.[group]?.[type] ?? 0 }} → {{ comparison.countsAfter?.[group]?.[type] ?? 0 }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <template v-if="preview.contrast?.length">
        <h3 class="sub-head">Measured Contrast</h3>
        <ul class="meta-list">
          <li v-for="item in preview.contrast" :key="item.id">
            <code>{{ item.selector }}</code>: {{ item.ratioBefore }}:1 → {{ item.ratioAfter ?? 'not measured' }}:1
          </li>
        </ul>
      </template>

      <template v-if="failed.length">
        <h3 class="sub-head">Adjustments not applied ({{ failed.length }})</h3>
        <ul class="meta-list">
          <li v-for="item in failed" :key="item.id">{{ item.type }}: {{ item.reason }}</li>
        </ul>
      </template>

      <div class="comparison-summary" v-if="comparison">
        <h3 class="sub-head">New automated violations ({{ comparison.newViolations?.length ?? 0 }})</h3>
        <ul v-if="comparison.newViolations?.length" class="meta-list">
          <li v-for="item in comparison.newViolations" :key="item.key">
            {{ item.summary }} <code>{{ item.selector }}</code>
          </li>
        </ul>
        <p v-else class="text-muted">The re-run found no new automated violations.</p>

        <template v-if="comparison.newObservations?.length">
          <h3 class="sub-head">New observations ({{ comparison.newObservations.length }})</h3>
          <ul class="meta-list">
            <li v-for="item in comparison.newObservations" :key="item.key">
              {{ item.summary }} <code>{{ item.selector }}</code>
            </li>
          </ul>
        </template>

        <h3 class="sub-head">No longer detected ({{ comparison.noLongerDetected?.length ?? 0 }})</h3>
        <p class="issue-meta">These checks stopped flagging the item in the preview. It may still need a proper fix in the site's code.</p>
        <ul v-if="comparison.noLongerDetected?.length" class="meta-list">
          <li v-for="item in comparison.noLongerDetected" :key="item.key">
            {{ item.ruleId }}: <code>{{ item.selector }}</code>
          </li>
        </ul>

        <h3 class="sub-head">Remaining and review items ({{ comparison.remaining?.length ?? 0 }})</h3>
        <ul v-if="comparison.remaining?.length" class="meta-list">
          <li v-for="item in comparison.remaining" :key="item.key">
            {{ FINDING_TYPE_LABELS[item.findingType] || item.findingType }}: {{ item.summary }} <code>{{ item.selector }}</code>
          </li>
        </ul>
      </div>
    </template>

    <div v-if="['done', 'failed'].includes(preview.status)" class="action-footer">
      <button type="button" class="btn-secondary" @click="$emit('revert')">
        Discard preview
      </button>
    </div>
  </section>
</template>

<style scoped>
.before-after-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 1.4rem;
  margin: 0 0 4px 0;
}

.section-sub {
  font-size: 0.9rem;
  color: var(--color-muted);
  margin: 0;
}

.placeholder-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 12px;
}

.screenshot-figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.screenshot-img {
  width: 100%;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.screenshot-figure figcaption {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-muted);
  text-align: center;
}

.score-scroll {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.score-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.score-table th,
.score-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}

.sub-head {
  font-size: 1.1rem;
  margin: 16px 0 6px;
}

.meta-list {
  padding-left: 20px;
  margin: 0 0 12px;
  font-size: 0.875rem;
  line-height: 1.5;
}

.text-muted {
  color: var(--color-muted);
  font-size: 0.875rem;
}

.action-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.btn-secondary {
  padding: 8px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
}

@media (max-width: 768px) {
  .placeholder-grid {
    grid-template-columns: 1fr;
  }
}
</style>
