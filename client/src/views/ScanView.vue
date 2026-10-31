<script setup>
import { computed, onUnmounted, ref } from 'vue';
import { getScan, startScan } from '../api.js';
import BeforeAfter from '../components/BeforeAfter.vue';
import IssueGraph from '../components/IssueGraph.vue';
import IssueList from '../components/IssueList.vue';
import SandboxLog from '../components/SandboxLog.vue';
import ScoreRadar from '../components/ScoreRadar.vue';

const POLL_MS = 1000;
const STATUS_LABELS = {
  queued: 'Queued',
  scanning: 'Scanning',
  patching: 'Patching',
  retesting: 'Re-testing',
  done: 'Done',
  failed: 'Failed',
};
const STAGES = ['queued', 'scanning', 'patching', 'retesting', 'done'];

const url = ref('');
const scan = ref(null);
const error = ref('');
const isRunning = ref(false);
let pollTimer;

const stageIndex = computed(() => STAGES.indexOf(scan.value?.status));
const statusLabel = computed(() => STATUS_LABELS[scan.value?.status] ?? '');

function stopPolling() {
  clearTimeout(pollTimer);
  isRunning.value = false;
}

async function poll(scanId) {
  try {
    scan.value = await getScan(scanId);
    if (['done', 'failed'].includes(scan.value.status)) {
      stopPolling();
      return;
    }
    pollTimer = setTimeout(() => poll(scanId), POLL_MS);
  } catch (err) {
    error.value = err.message;
    stopPolling();
  }
}

async function onSubmit() {
  error.value = '';
  scan.value = null;
  isRunning.value = true;
  try {
    const { scanId } = await startScan(url.value);
    await poll(scanId);
  } catch (err) {
    error.value = err.message;
    stopPolling();
  }
}

onUnmounted(() => clearTimeout(pollTimer));
</script>

<template>
  <form class="card scan-form" @submit.prevent="onSubmit">
    <label for="scan-url">Website URL</label>
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
  </form>

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
    </section>

    <SandboxLog :events="scan.sandboxEvents" />

    <template v-if="scan.status === 'done'">
      <ScoreRadar :before="scan.scoresBefore" :after="scan.scoresAfter" />
      <IssueList :issues="scan.issues" />
      <BeforeAfter />
      <IssueGraph />
    </template>
  </template>
</template>
