<script setup>
import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';
import { computed } from 'vue';
import { Radar } from 'vue-chartjs';
import { GROUP_LABELS, GROUP_SHORT_LABELS, GROUPS } from '../groups.js';

ChartJS.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const props = defineProps({
  before: { type: Object, required: true },
  after: { type: Object, required: true },
});

const chartData = computed(() => ({
  labels: GROUPS.map((group) => GROUP_SHORT_LABELS[group]),
  datasets: [
    {
      label: 'Pre-Remediation Baseline',
      data: GROUPS.map((group) => props.before[group] ?? 0),
      borderColor: '#c2410c',
      backgroundColor: 'rgba(194, 65, 12, 0.14)',
      borderDash: [6, 4],
      borderWidth: 2,
      pointRadius: 5,
      pointStyle: 'rect',
    },
    {
      label: 'Verified Post-Adaptation',
      data: GROUPS.map((group) => props.after[group] ?? 0),
      borderColor: '#0f766e',
      backgroundColor: 'rgba(15, 118, 110, 0.18)',
      borderWidth: 2.5,
      pointRadius: 5,
      pointStyle: 'circle',
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      min: 0,
      max: 100,
      ticks: { stepSize: 25, backdropColor: 'transparent', color: '#5e6862' },
      grid: { color: '#e3e8e1' },
      angleLines: { color: '#e3e8e1' },
      pointLabels: { color: '#111715', font: { size: 13, weight: 600 } },
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#111715',
        usePointStyle: true,
        padding: 20,
        font: { size: 13 },
      },
    },
  },
};

const overallDelta = computed(() => {
  const b = props.before.overall ?? 0;
  const a = props.after.overall ?? 0;
  return a - b;
});

const chartSummary = computed(
  () =>
    `Accessibility Radar Evaluation. Overall score shifted from ${props.before.overall} to ${props.after.overall} out of 100 (+${overallDelta.value}). Detailed values provided in table below.`
);
</script>

<template>
  <section class="scores-panel card-box" aria-labelledby="scores-heading">
    <div class="scores-header">
      <div>
        <span class="badge badge-screen-reader">Accessibility Metric Indices</span>
        <h3 id="scores-heading" class="scores-title">Evaluation by Disability Dimension</h3>
        <p class="scores-sub">
          Comparison of baseline heuristic scores versus automated patch improvements across all five disability categories.
        </p>
      </div>

      <div class="overall-score-pill">
        <span class="pill-label">Composite Progression</span>
        <div class="pill-numbers">
          <span class="score-old">{{ before.overall }}</span>
          <span class="score-arrow">→</span>
          <span class="score-new">{{ after.overall }}</span>
          <span class="score-delta">(+{{ overallDelta }} pts)</span>
        </div>
      </div>
    </div>

    <!-- Layout: Radar Chart (Left) + Dimension Breakdown (Right) -->
    <div class="scores-layout">
      <div class="radar-container" role="img" :aria-label="chartSummary">
        <Radar :data="chartData" :options="chartOptions" />
      </div>

      <div class="score-cards-col">
        <div
          v-for="group in GROUPS"
          :key="group"
          class="dimension-card"
        >
          <div class="dim-top">
            <span class="dim-name">{{ GROUP_LABELS[group] }}</span>
            <span class="dim-delta text-green">
              +{{ (after[group] ?? 0) - (before[group] ?? 0) }}
            </span>
          </div>

          <div class="dim-bar-wrapper">
            <div class="dim-bar-bg">
              <div
                class="dim-bar-before"
                :style="{ width: `${before[group] ?? 0}%` }"
                title="Baseline"
              ></div>
              <div
                class="dim-bar-after"
                :style="{ width: `${after[group] ?? 0}%` }"
                title="Adapted"
              ></div>
            </div>
            <div class="dim-scores-text">
              <span>Baseline: <strong>{{ before[group] }}</strong></span>
              <span>Adapted: <strong class="text-green">{{ after[group] }}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Accessible Data Table for Screen Readers & Keyboard Users -->
    <div class="table-container">
      <table class="score-table">
        <caption>Exact Accessibility Metrics by Disability Group (Scale 0-100)</caption>
        <thead>
          <tr>
            <th scope="col">Disability Group</th>
            <th scope="col">Baseline Score</th>
            <th scope="col">Adapted Score</th>
            <th scope="col">Observed Gain</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="group in GROUPS" :key="group">
            <th scope="row">{{ GROUP_LABELS[group] }}</th>
            <td>{{ before[group] }}</td>
            <td>{{ after[group] }}</td>
            <td class="text-green font-mono">
              +{{ (after[group] ?? 0) - (before[group] ?? 0) }} pts
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.scores-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.scores-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.scores-title {
  font-size: 1.45rem;
  margin: 6px 0 4px;
}

.scores-sub {
  font-size: 0.9375rem;
  color: var(--color-muted);
  margin-bottom: 0;
  max-width: 640px;
}

.overall-score-pill {
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 18px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pill-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-muted);
}

.pill-numbers {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.score-old {
  font-size: 1.25rem;
  color: #c2410c;
  font-weight: 700;
}

.score-arrow {
  color: var(--color-muted);
}

.score-new {
  font-size: 1.5rem;
  color: #0f766e;
  font-weight: 800;
}

.score-delta {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-success);
}

.scores-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: center;
}

.radar-container {
  height: 380px;
  position: relative;
  background: var(--color-surface-sunken);
  border-radius: var(--radius-md);
  padding: 16px;
  border: 1px solid var(--color-border);
}

.score-cards-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dimension-card {
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dim-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dim-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-obsidian);
}

.dim-delta {
  font-size: 0.8125rem;
  font-weight: 700;
}

.dim-bar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dim-bar-bg {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.dim-bar-after {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: #0f766e;
  border-radius: 4px;
}

.dim-bar-before {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: #c2410c;
  border-radius: 4px;
  opacity: 0.7;
}

.dim-scores-text {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-muted);
}

.table-container {
  overflow-x: auto;
  margin-top: 8px;
}

.score-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}

.score-table caption {
  font-size: 0.75rem;
  color: var(--color-muted);
  text-align: left;
  margin-bottom: 8px;
}

.score-table th,
.score-table td {
  padding: 10px 12px;
  text-align: left;
  border-top: 1px solid var(--color-border);
}

.score-table tbody th {
  font-weight: 600;
}

.text-green { color: var(--color-success); }
.font-mono { font-family: var(--font-mono); }

@media (max-width: 900px) {
  .scores-layout {
    grid-template-columns: 1fr;
  }
}
</style>
