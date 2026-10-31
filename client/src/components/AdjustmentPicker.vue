<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  adjustments: { type: Array, required: true },
  findings: { type: Array, required: true },
  busy: { type: Boolean, default: false },
});
const emit = defineEmits(['preview']);

// Nothing is selected by default: every adjustment is opt-in.
const selected = ref([]);

const aiRecommended = computed(
  () => new Set(props.findings.flatMap((finding) => finding.ai?.recommendedAdjustmentIds ?? [])),
);

function detail({ type, params }) {
  if (type === 'contrast-color') return `${params.selector}: text colour to ${params.color}`;
  if (type === 'aria-label-from-context') return `${params.selector}: name "${params.label}", from adjacent label text`;
  if (type === 'status-text-label') return `${params.selector}: add text "[${params.label}]"`;
  return 'Whole page';
}
</script>

<template>
  <section class="card" aria-labelledby="adjustments-heading">
    <h2 id="adjustments-heading">Preview adjustments</h2>
    <p v-if="adjustments.length === 0">
      No adjustments are available for this scan. They are offered only when the scan supports one and the knowledge
      graph links it to the finding.
    </p>
    <form v-else @submit.prevent="emit('preview', selected)">
      <p>
        Adjustments apply only to a temporary copy of the page in the sandbox. Your site is not changed.
      </p>
      <ul class="adjustment-list">
        <li v-for="adjustment in adjustments" :key="adjustment.id">
          <label>
            <input v-model="selected" type="checkbox" :value="adjustment.id" />
            {{ adjustment.title }}
          </label>
          <p class="issue-meta">{{ detail(adjustment) }}. {{ adjustment.description }}</p>
          <p v-if="aiRecommended.has(adjustment.id)" class="issue-meta">Recommended by the AI suggestion.</p>
        </li>
      </ul>
      <button type="submit" class="primary" :disabled="busy || selected.length === 0">
        {{ busy ? 'Running preview…' : 'Preview selected' }}
      </button>
    </form>
  </section>
</template>
