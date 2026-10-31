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
  <section class="card" aria-labelledby="before-after-heading">
    <h2 id="before-after-heading">Before and after</h2>
    <p v-if="preview.status === 'failed'" class="error" role="alert">Preview failed: {{ preview.error }}</p>
    <p v-else-if="preview.status !== 'done'" role="status">Applying adjustments and re-running checks…</p>

    <template v-if="preview.status === 'done'">
      <p>
        A screenshot shows visual changes only. It does not prove that a page works with a screen reader. These
        changes exist only in the sandbox preview.
      </p>
      <div class="placeholder-grid">
        <figure>
          <img class="screenshot" :src="imageUrl(scanId, 'before.jpg')" alt="The page before adjustments" />
          <figcaption>Before</figcaption>
        </figure>
        <figure>
          <img class="screenshot" :src="imageUrl(scanId, 'after.jpg')" alt="The page with the selected adjustments" />
          <figcaption>After, in the sandbox preview</figcaption>
        </figure>
      </div>

      <div class="score-scroll" tabindex="0" role="region" aria-label="Findings before and after">
        <table class="score-table">
          <caption>Findings re-measured, before and after</caption>
          <thead>
            <tr>
              <th scope="col">Area</th>
              <th v-for="type in TYPES" :key="type" scope="col">{{ FINDING_TYPE_LABELS[type] }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="group in GROUPS" :key="group">
              <th scope="row">{{ GROUP_LABELS[group] }}</th>
              <td v-for="type in TYPES" :key="type">
                {{ comparison.countsBefore[group][type] }} → {{ comparison.countsAfter[group][type] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <template v-if="preview.contrast?.length">
        <h3>Measured contrast</h3>
        <ul>
          <li v-for="item in preview.contrast" :key="item.id">
            <code>{{ item.selector }}</code>: {{ item.ratioBefore }}:1 → {{ item.ratioAfter ?? 'not measured' }}:1
          </li>
        </ul>
      </template>

      <template v-if="failed.length">
        <h3>Adjustments not applied ({{ failed.length }})</h3>
        <ul>
          <li v-for="item in failed" :key="item.id">{{ item.type }}: {{ item.reason }}</li>
        </ul>
      </template>

      <h3>New automated violations ({{ comparison.newViolations.length }})</h3>
      <ul v-if="comparison.newViolations.length">
        <li v-for="item in comparison.newViolations" :key="item.key">
          {{ item.summary }} <code>{{ item.selector }}</code>
        </li>
      </ul>
      <p v-else>The re-run found no new automated violations.</p>

      <template v-if="comparison.newObservations.length">
        <h3>New observations ({{ comparison.newObservations.length }})</h3>
        <ul>
          <li v-for="item in comparison.newObservations" :key="item.key">
            {{ item.summary }} <code>{{ item.selector }}</code>
          </li>
        </ul>
      </template>

      <h3>No longer detected ({{ comparison.noLongerDetected.length }})</h3>
      <p class="issue-meta">These checks stopped flagging the item in the preview. It may still need a proper fix in the site's code.</p>
      <ul>
        <li v-for="item in comparison.noLongerDetected" :key="item.key">
          {{ item.ruleId }}: <code>{{ item.selector }}</code>
        </li>
      </ul>

      <h3>Remaining and review items ({{ comparison.remaining.length }})</h3>
      <ul>
        <li v-for="item in comparison.remaining" :key="item.key">
          {{ FINDING_TYPE_LABELS[item.findingType] }}: {{ item.summary }} <code>{{ item.selector }}</code>
        </li>
      </ul>
    </template>

    <button v-if="['done', 'failed'].includes(preview.status)" type="button" class="primary" @click="$emit('revert')">
      Discard preview
    </button>
  </section>
</template>
