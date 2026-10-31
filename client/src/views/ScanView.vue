<script setup>
import { computed, onUnmounted, ref, watch } from 'vue';
import { clearPreview, getScan, startPreview, startScan } from '../api.js';
import { DEMO_SCAN_RESULT } from '../demoData.js';

// Component Imports
import LandingHero from '../components/LandingHero.vue';
import ShowcaseSection from '../components/ShowcaseSection.vue';
import WorkspaceSidebar from '../components/WorkspaceSidebar.vue';
import InsightPanel from '../components/InsightPanel.vue';
import ExecutiveOverview from '../components/ExecutiveOverview.vue';
import ScreenReaderExplorer from '../components/ScreenReaderExplorer.vue';
import ContrastLab from '../components/ContrastLab.vue';
import MotionInventory from '../components/MotionInventory.vue';
import TransformationStudio from '../components/TransformationStudio.vue';
import IssueGraph from '../components/IssueGraph.vue';
import IssueList from '../components/IssueList.vue';
import SandboxLog from '../components/SandboxLog.vue';

const props = defineProps({
  suggestedUrl: { type: String, default: '' },
});

const POLL_MS = 1000;
const STAGES = ['queued', 'connecting', 'scanning', 'retrieving', 'explaining', 'done'];
const STAGE_LABELS = {
  queued: 'Provisioning Daytona Sandbox',
  connecting: 'Connecting to Sandbox',
  scanning: 'Capturing DOM & Contrast Evidence',
  retrieving: 'Querying Neo4j Accessibility Graph',
  explaining: 'Synthesizing Guidance via Nosana AI',
  patching: 'Synthesizing Fixes via AI',
  retesting: 'Validating Patch in Re-test Sandbox',
  done: 'Analysis & Transformation Ready',
  failed: 'Analysis Pipeline Failed',
};

const viewMode = ref('landing'); // 'landing', 'progress', 'workspace'
const activeTab = ref('overview'); // 'overview', 'screen-reader', 'colour-vision', 'motion', 'studio', 'graph', 'issues', 'sandbox'
const isDemoMode = ref(false);

const scan = ref(null);
const error = ref('');
const isRunning = ref(false);
const selectedIssue = ref(null);
const isInsightPanelOpen = ref(false);

let pollTimer = null;

const stageIndex = computed(() => {
  const current = scan.value?.status;
  const idx = STAGES.indexOf(current);
  return idx >= 0 ? idx : 0;
});

const currentStageLabel = computed(() => {
  const s = scan.value?.status;
  return STAGE_LABELS[s] ?? s ?? 'Analyzing';
});

function adaptScan(s) {
  if (!s) return s;
  if (!s.issues && Array.isArray(s.findings)) {
    const groupMap = { blind: 'blind', colour: 'colourblind', motion: 'cognitive' };
    s.issues = s.findings.map((f, i) => ({
      id: f.id || `f-${i + 1}`,
      group: groupMap[f.area] || f.area || 'blind',
      type: f.ruleId || f.findingType || 'accessibility-barrier',
      selector: f.selector || 'body',
      component: f.component || (f.selector ? f.selector.split(' ')[0] : 'Element'),
      page: f.page || '/',
      wcag: f.guidance?.guidelines?.[0]?.id || '2.1',
      severity: f.findingType === 'automated_violation' ? 'high' : 'medium',
      description: f.summary || f.description || '',
      fixed: Boolean(f.fixed),
      requiresManualReview: f.findingType !== 'automated_violation',
      evidence: f.evidence || {},
      guidance: f.guidance?.needs?.map((n) => n.description).join('. ') || '',
      proposedFix: f.guidance?.needs?.[0]?.fixes?.[0]?.title || '',
      aiExplanation: f.ai?.explanation || '',
    }));
  }
  return s;
}

function stopPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
  isRunning.value = false;
}

async function poll(scanId) {
  try {
    const res = await getScan(scanId);
    scan.value = adaptScan(res);
    if (['done', 'failed'].includes(scan.value?.status)) {
      stopPolling();
      if (scan.value?.status === 'done') {
        viewMode.value = 'workspace';
        activeTab.value = 'overview';
        if (scan.value.issues?.length > 0) {
          selectedIssue.value = scan.value.issues[0];
        }
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

async function runScan(target) {
  error.value = '';
  isDemoMode.value = false;
  scan.value = null;
  isRunning.value = true;
  viewMode.value = 'progress';

  try {
    const payload = typeof target === 'string' ? { url: target } : target;
    const { scanId } = await startScan(payload);
    await poll(scanId);
  } catch (err) {
    error.value = err.message || 'Failed to initiate scan';
    stopPolling();
    viewMode.value = 'landing';
  }
}

function handleUrlSubmit(url) {
  runScan({ url });
}

function handleExploreDemo() {
  error.value = '';
  stopPolling();
  isDemoMode.value = true;
  scan.value = JSON.parse(JSON.stringify(DEMO_SCAN_RESULT));
  viewMode.value = 'workspace';
  activeTab.value = 'overview';
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

async function onPreview(adjustmentIds) {
  if (!scan.value?.scanId) return;
  error.value = '';
  try {
    await startPreview(scan.value.scanId, adjustmentIds);
    await poll(scan.value.scanId);
  } catch (err) {
    error.value = err.message;
  }
}

async function onRevert() {
  if (!scan.value?.scanId) return;
  error.value = '';
  try {
    await clearPreview(scan.value.scanId);
    const res = await getScan(scan.value.scanId);
    scan.value = adaptScan(res);
  } catch (err) {
    error.value = err.message;
  }
}

watch(
  () => props.suggestedUrl,
  (val) => {
    if (val && viewMode.value === 'landing') {
      handleUrlSubmit(val);
    }
  },
);

onUnmounted(() => stopPolling());

defineExpose({
  scan,
  viewMode,
  handleNewScan,
});
</script>

<template>
  <div class="scan-view-root">
    <!-- VIEW 1: LANDING & INITIAL SCAN INPUT -->
    <template v-if="viewMode === 'landing'">
      <LandingHero
        :is-running="isRunning"
        :error="error"
        @submit-url="handleUrlSubmit"
        @explore-demo="handleExploreDemo"
      />
      <ShowcaseSection />
    </template>

    <!-- VIEW 2: PROGRESS / SCAN IN FLIGHT -->
    <template v-else-if="viewMode === 'progress'">
      <div class="progress-page">
        <div class="progress-card card-box">
          <div class="progress-top">
            <span class="badge badge-screen-reader">Active Pipeline</span>
            <h2 class="progress-title">{{ currentStageLabel }}</h2>
            <p class="progress-url font-mono">{{ scan?.url }}</p>
          </div>

          <div class="progress-bar-container">
            <div
              class="progress-bar-fill"
              :style="{ width: `${Math.max(10, ((stageIndex + 1) / STAGES.length) * 100)}%` }"
            ></div>
          </div>

          <!-- Step Progression -->
          <ol class="steps-list" aria-label="Pipeline Stages">
            <li
              v-for="(stage, idx) in STAGES"
              :key="stage"
              class="step-item"
              :class="{
                completed: idx < stageIndex,
                active: idx === stageIndex,
                pending: idx > stageIndex,
              }"
              :aria-current="idx === stageIndex ? 'step' : undefined"
            >
              <div class="step-icon-box">
                <span v-if="idx < stageIndex">✓</span>
                <span v-else-if="idx === stageIndex" class="spinner-sm" aria-hidden="true"></span>
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <span class="step-label">{{ STAGE_LABELS[stage] || stage }}</span>
            </li>
          </ol>
        </div>

        <!-- Live Sandbox Log during Execution -->
        <SandboxLog
          v-if="scan?.sandboxEvents && scan.sandboxEvents.length > 0"
          :events="scan.sandboxEvents"
        />
      </div>
    </template>

    <!-- VIEW 3: THREE-PART SCAN WORKSPACE -->
    <template v-else-if="viewMode === 'workspace' && scan">
      <div class="workspace-layout">
        <!-- Part 1: Left Navigation Sidebar -->
        <WorkspaceSidebar
          :scan="scan"
          :active-tab="activeTab"
          :is-demo-mode="isDemoMode"
          @select-tab="(tab) => (activeTab = tab)"
          @new-scan="handleNewScan"
        />

        <!-- Part 2: Centre Primary Analysis Workspace -->
        <main id="main-content" class="workspace-centre" role="main">
          <!-- Perspective: Overview -->
          <ExecutiveOverview
            v-if="activeTab === 'overview'"
            :scan="scan"
            @navigate-category="(cat) => (activeTab = cat)"
            @select-issue="handleSelectIssue"
          />

          <!-- Perspective: Screen Reader -->
          <ScreenReaderExplorer
            v-else-if="activeTab === 'screen-reader'"
            :issues="scan.issues || []"
            :selected-issue-id="selectedIssue?.id"
            @select-issue="handleSelectIssue"
          />

          <!-- Perspective: Colour Vision -->
          <ContrastLab
            v-else-if="activeTab === 'colour-vision'"
            :issues="scan.issues || []"
            :selected-issue-id="selectedIssue?.id"
            @select-issue="handleSelectIssue"
          />

          <!-- Perspective: Motion Sensitivity -->
          <MotionInventory
            v-else-if="activeTab === 'motion'"
            :issues="scan.issues || []"
            :selected-issue-id="selectedIssue?.id"
            @select-issue="handleSelectIssue"
          />

          <!-- Perspective: Transformation Studio -->
          <TransformationStudio
            v-else-if="activeTab === 'studio'"
            :scan="scan"
            :initial-issue="selectedIssue"
            @select-issue="handleSelectIssue"
          />

          <!-- Perspective: Neo4j Component Graph -->
          <IssueGraph
            v-else-if="activeTab === 'graph'"
            :issues="scan.issues || []"
            @select-issue="handleSelectIssue"
          />

          <!-- Perspective: All Issues Catalog -->
          <IssueList
            v-else-if="activeTab === 'issues'"
            :issues="scan.issues || []"
            :selected-issue-id="selectedIssue?.id"
            @select-issue="handleSelectIssue"
          />

          <!-- Perspective: Daytona Sandbox Log -->
          <SandboxLog
            v-else-if="activeTab === 'sandbox'"
            :events="scan.sandboxEvents || []"
          />
        </main>

        <!-- Part 3: Right Contextual Insights Drawer / Panel -->
        <InsightPanel
          v-if="selectedIssue && isInsightPanelOpen"
          :issue="selectedIssue"
          :is-open="isInsightPanelOpen"
          @close="isInsightPanelOpen = false"
          @inspect-in-studio="handleInspectInStudio"
        />
      </div>
    </template>
  </div>
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
  to {
    transform: rotate(360deg);
  }
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
