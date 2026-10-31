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

const INK = '#1f2933';
const GRID = '#d9dee4';

const chartData = computed(() => ({
  labels: GROUPS.map((group) => GROUP_SHORT_LABELS[group]),
  datasets: [
    {
      label: 'Before fixes',
      data: GROUPS.map((group) => props.before[group]),
      borderColor: '#c2610c',
      backgroundColor: 'rgba(194, 97, 12, 0.12)',
      borderDash: [6, 4], // Dashed, so the series differ by more than colour.
      borderWidth: 2,
      pointRadius: 4,
      pointStyle: 'rect',
    },
    {
      label: 'After fixes',
      data: GROUPS.map((group) => props.after[group]),
      borderColor: '#2a78d6',
      backgroundColor: 'rgba(42, 120, 214, 0.14)',
      borderWidth: 2,
      pointRadius: 4,
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
      ticks: { stepSize: 25, backdropColor: 'transparent', color: '#52606d' },
      grid: { color: GRID },
      angleLines: { color: GRID },
      pointLabels: { color: INK, font: { size: 13 } },
    },
  },
  plugins: {
    legend: { position: 'bottom', labels: { color: INK, usePointStyle: true } },
  },
};

const chartSummary = computed(
  () => `Radar chart of accessibility scores. Overall went from ${props.before.overall} to ${props.after.overall} out of 100. Exact scores are in the table below.`,
);
</script>

<template>
  <section class="card" aria-labelledby="scores-heading">
    <h2 id="scores-heading">Accessibility scores</h2>
    <p class="overall">
      Overall: <strong>{{ before.overall }} → {{ after.overall }}</strong> out of 100
    </p>
    <div class="radar" role="img" :aria-label="chartSummary">
      <Radar :data="chartData" :options="chartOptions" />
    </div>
    <table class="score-table">
      <caption>Scores out of 100, by disability group</caption>
      <thead>
        <tr>
          <th scope="col">Group</th>
          <th scope="col">Before</th>
          <th scope="col">After</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="group in GROUPS" :key="group">
          <th scope="row">{{ GROUP_LABELS[group] }}</th>
          <td>{{ before[group] }}</td>
          <td>{{ after[group] }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
