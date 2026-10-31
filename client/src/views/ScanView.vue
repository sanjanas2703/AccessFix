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
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
  isRunning.value = false;
}

async function poll(scanId) {
  try {
    scan.value = await getScan(scanId);
    if (['done', 'failed'].includes(scan.value.status)) {
      stopPolling();
      if (scan.value?.status === 'done') {
        viewMode.value = 'workspace';
        activeTab.value = 'overview';
      }
      return;
    }
    pollTimer = setTimeout(() => poll(scanId), POLL_MS);
  } catch (err) {
    error.value = err.message || 'Error communicating with scanning server';
    stopPolling();
    viewMode.value = 'landing';
  }
}

async function onSubmit() {
  error.value = '';
  isDemoMode.value = false;
  scan.value = null;
  isRunning.value = true;
  viewMode.value = 'progress';

  try {
    const { scanId } = await startScan(url.value);
    await poll(scanId);
  } catch (err) {
    error.value = err.message || 'Failed to initiate scan';
    stopPolling();
    viewMode.value = 'landing';
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

function handleExploreDemo() {
  error.value = '';
  stopPolling();
  isDemoMode.value = true;
  scan.value = JSON.parse(JSON.stringify(DEMO_SCAN_RESULT));
  viewMode.value = 'workspace';
  activeTab.value = 'overview';
  // Pre-select first issue for insights panel showcase
  if (scan.value.issues?.length > 0) {
    selectedIssue.value = scan.value.issues[0];
    isInsightPanelOpen.value = true;
  }
}

function handleSelectIssue(issue) {
  selectedIssue.value = issue;
  isInsightPanelOpen.value = true;
}

function handleInspectInStudio(issue) {
  selectedIssue.value = issue;
  activeTab.value = 'studio';
  isInsightPanelOpen.value = false;
}

function handleNewScan() {
  stopPolling();
  viewMode.value = 'landing';
  scan.value = null;
  error.value = '';
}

onUnmounted(() => stopPolling());
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

<style scoped>
.scan-view-root {
  width: 100%;
}

/* Progress View */
.progress-page {
  max-width: 840px;
  margin: 48px auto;
  padding: 0 var(--space-6);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.progress-card {
  text-align: center;
  padding: 36px;
}

.progress-title {
  font-size: 1.6rem;
  margin: 12px 0 6px;
}

.progress-url {
  font-size: 0.875rem;
  color: var(--color-muted);
  margin-bottom: 24px;
}

.progress-bar-container {
  height: 8px;
  background: var(--color-surface-sunken);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 32px;
}

.progress-bar-fill {
  height: 100%;
  background: var(--cat-screen-reader);
  transition: width 0.4s ease;
}

.steps-list {
  display: flex;
  justify-content: space-between;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 12px;
  flex-wrap: wrap;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 110px;
}

.step-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 700;
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-muted);
}

.step-item.completed .step-icon-box {
  background: #dcfce7;
  border-color: #22c55e;
  color: #166534;
}

.step-item.active .step-icon-box {
  background: var(--cat-screen-reader);
  border-color: var(--cat-screen-reader);
  color: #ffffff;
}

.step-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-muted);
  text-align: center;
}

.step-item.active .step-label {
  color: var(--color-obsidian);
  font-weight: 700;
}

.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Three-Part Workspace Layout */
.workspace-layout {
  display: flex;
  width: 100%;
  min-height: calc(100vh - 68px);
}

.workspace-centre {
  flex: 1;
  padding: 32px var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
  overflow-y: auto;
}

@media (max-width: 1100px) {
  .workspace-layout {
    flex-direction: column;
  }
}
</style>
