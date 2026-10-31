<script setup>
import { computed, onUnmounted, ref, watch } from 'vue';
import { clearPreview, getScan, imageUrl, startPreview, startScan } from '../api.js';
import AdjustmentPicker from '../components/AdjustmentPicker.vue';
import BeforeAfter from '../components/BeforeAfter.vue';
import IntegrationStatus from '../components/IntegrationStatus.vue';
import IssueList from '../components/IssueList.vue';
import SandboxLog from '../components/SandboxLog.vue';

const props = defineProps({
  suggestedUrl: { type: String, default: '' },
});

const POLL_MS = 1000;
const STATUS_LABELS = {
  queued: 'Queued',
  connecting: 'Connecting to the sandbox',
  scanning: 'Scanning',
  retrieving: 'Retrieving guidance',
  explaining: 'Explaining findings',
  done: 'Done',
  failed: 'Failed',
};
const STAGES = ['queued', 'connecting', 'scanning', 'retrieving', 'explaining', 'done'];

const url = ref('');
const scan = ref(null);
const error = ref('');
const isRunning = ref(false);
let pollTimer;

watch(
  () => props.suggestedUrl,
  (value) => {
    url.value = value;
  },
);

const stageIndex = computed(() => STAGES.indexOf(scan.value?.status));
const statusLabel = computed(() => STATUS_LABELS[scan.value?.status] ?? '');
const previewBusy = computed(() => ['queued', 'running'].includes(scan.value?.preview?.status));
const finished = computed(() => ['done', 'failed'].includes(scan.value?.status));

function stopPolling() {
  clearTimeout(pollTimer);
  isRunning.value = false;
}

async function poll(scanId) {
  try {
    scan.value = await getScan(scanId);
    if (finished.value && !previewBusy.value) {
      stopPolling();
      return;
    }
    pollTimer = setTimeout(() => poll(scanId), POLL_MS);
  } catch (err) {
    error.value = err.message;
    stopPolling();
  }
}

async function run(target) {
  error.value = '';
  scan.value = null;
  isRunning.value = true;
  try {
    const { scanId } = await startScan(target);
    await poll(scanId);
  } catch (err) {
    error.value = err.message;
    stopPolling();
  }
}

async function onPreview(adjustmentIds) {
  error.value = '';
  try {
    await startPreview(scan.value.scanId, adjustmentIds);
    await poll(scan.value.scanId);
  } catch (err) {
    error.value = err.message;
  }
}

async function onRevert() {
  error.value = '';
  try {
    await clearPreview(scan.value.scanId);
    scan.value = await getScan(scan.value.scanId);
  } catch (err) {
    error.value = err.message;
  }
}

onUnmounted(() => clearTimeout(pollTimer));
</script>

<template>
  <form class="card scan-form" @submit.prevent="run({ url })">
    <label for="scan-url">Public website URL</label>
    <div class="scan-form-row">
      <input
        id="scan-url"
        v-model="url"
        type="text"
        inputmode="url"
        placeholder="https://example.com"
        required
      />
      <button type="submit" :disabled="isRunning">
        {{ isRunning ? 'Scanning…' : 'Scan' }}
      </button>
    </div>
    <p class="issue-meta">
      <button type="button" class="link-button" :disabled="isRunning" @click="run({ demo: true })">
        Scan the bundled demo page instead
      </button>
    </p>
  </form>

  <section class="card" aria-labelledby="scope-heading">
    <h2 id="scope-heading">What this scan covers</h2>
    <p>
      This scan has limited scope. It covers screen-reader names and alternatives, colour and contrast, and motion
      only. It gives no overall score, and it is not a WCAG certification or a claim that a page is accessible.
    </p>
  </section>

  <p v-if="error" class="error" role="alert">{{ error }}</p>

  <template v-if="scan">
    <section class="card" aria-labelledby="progress-heading">
      <h2 id="progress-heading">Progress</h2>
      <p role="status">
        Status: <strong>{{ statusLabel }}</strong>
      </p>
      <ol class="stages">
        <li
          v-for="(stage, index) in STAGES"
          :key="stage"
          :class="{ reached: index <= stageIndex }"
          :aria-current="index === stageIndex ? 'step' : undefined"
        >
          {{ STATUS_LABELS[stage] }}
        </li>
      </ol>
      <p v-if="scan.status === 'failed'" class="error" role="alert">Scan failed: {{ scan.error }}</p>
    </section>

    <IntegrationStatus :integrations="scan.integrations" />

    <template v-if="scan.status === 'done'">
      <IssueList :findings="scan.findings" :reduced-motion-query="scan.reducedMotionQuery" />

      <section v-if="scan.simulation" class="card" aria-labelledby="simulation-heading">
        <h2 id="simulation-heading">Colour-vision simulation</h2>
        <p>
          A {{ scan.simulation }} simulation to help a person review colour-only findings. It is a viewing aid, not a
          fix.
        </p>
        <img
          class="screenshot"
          :src="imageUrl(scan.scanId, 'simulation.jpg')"
          :alt="`The scanned page with a ${scan.simulation} simulation applied`"
        />
      </section>

      <AdjustmentPicker
        :adjustments="scan.adjustments"
        :findings="scan.findings"
        :busy="previewBusy"
        @preview="onPreview"
      />
      <BeforeAfter
        v-if="scan.preview"
        :scan-id="scan.scanId"
        :preview="scan.preview"
        @revert="onRevert"
      />
    </template>

    <SandboxLog :events="scan.sandboxEvents" />
  </template>
</template>
