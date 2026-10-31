<script setup>
import { ref } from 'vue';

const props = defineProps({
  events: { type: Array, required: true },
});

const copied = ref(false);

const formatTime = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return iso;
  }
};

function copyLog() {
  const text = props.events.map((e) => `[${e.time}] ${e.event}`).join('\n');
  navigator.clipboard?.writeText(text);
  copied.value = true;
  setTimeout(() => (copied.value = false), 1800);
}
</script>

<template>
  <div class="sandbox-log-view card-box" aria-labelledby="log-heading">
    <div class="log-header">
      <div class="log-title-area">
        <span class="badge badge-screen-reader">Execution Trace</span>
        <h3 id="log-heading" class="log-title">Daytona Sandbox Event Log</h3>
        <p class="log-sub">
          Live container diagnostics recording environment initialization, Playwright browser navigation, axe-core scans, and retest assertions.
        </p>
      </div>

      <div class="log-actions">
        <button type="button" class="btn btn-secondary btn-sm" @click="copyLog">
          {{ copied ? 'Copied to Clipboard!' : 'Copy Raw Log' }}
        </button>
      </div>
    </div>

    <div class="console-box" role="region" aria-label="Console terminal output">
      <div class="console-chrome">
        <div class="terminal-dots" aria-hidden="true">
          <span class="t-dot dot-r"></span>
          <span class="t-dot dot-y"></span>
          <span class="t-dot dot-g"></span>
        </div>
        <span class="console-title font-mono">daytona-runner // execution.log</span>
      </div>

      <ol class="sandbox-log">
        <li
          v-for="(item, idx) in events"
          :key="`${item.time}-${idx}`"
          class="log-row"
        >
          <span class="line-num font-mono">{{ String(idx + 1).padStart(2, '0') }}</span>
          <time :datetime="item.time" class="log-time font-mono">{{ formatTime(item.time) }}</time>
          <span class="log-msg font-mono" :class="{ 'msg-finish': item.event.includes('finished') || item.event.includes('complete') }">
            {{ item.event }}
          </span>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.sandbox-log-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.log-title {
  font-size: 1.35rem;
  margin: 6px 0 4px;
}

.log-sub {
  font-size: 0.875rem;
  color: var(--color-muted);
  margin-bottom: 0;
  max-width: 640px;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 0.8125rem;
}

.console-box {
  background: #111715;
  border: 1px solid #24302b;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.console-chrome {
  background: #1a2320;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid #24302b;
}

.terminal-dots {
  display: flex;
  gap: 6px;
}

.t-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot-r { background: #ef4444; }
.dot-y { background: #f59e0b; }
.dot-g { background: #10b981; }

.console-title {
  font-size: 0.75rem;
  color: #8a968f;
}

.sandbox-log {
  list-style: none;
  margin: 0;
  padding: 14px 16px;
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.log-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  font-size: 0.8125rem;
  line-height: 1.45;
}

.line-num {
  color: #44514b;
  min-width: 20px;
  user-select: none;
}

.log-time {
  color: #8a968f;
  min-width: 65px;
}

.log-msg {
  color: #e3e8e1;
  word-break: break-all;
}

.msg-finish {
  color: #6ee7b7;
  font-weight: 600;
}
</style>
