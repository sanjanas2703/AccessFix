<script setup>
import { computed } from 'vue';
import { GROUP_LABELS, GROUPS } from '../groups.js';

const props = defineProps({
  issues: { type: Array, required: true },
});

const groupedIssues = computed(() =>
  GROUPS.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    issues: props.issues.filter((issue) => issue.group === group),
  })).filter((entry) => entry.issues.length > 0),
);
</script>

<template>
  <section class="card" aria-labelledby="issues-heading">
    <h2 id="issues-heading">Issues ({{ issues.length }})</h2>
    <div v-for="entry in groupedIssues" :key="entry.group" class="issue-group">
      <h3>{{ entry.label }} ({{ entry.issues.length }})</h3>
      <ul class="issue-list">
        <li v-for="issue in entry.issues" :key="issue.id">
          <p class="issue-title">
            <span :class="['badge', `severity-${issue.severity}`]">{{ issue.severity }}</span>
            <span :class="['badge', issue.fixed ? 'state-fixed' : 'state-open']">
              {{ issue.fixed ? 'Fixed' : 'Not fixed' }}
            </span>
          </p>
          <p>{{ issue.description }}</p>
          <p class="issue-meta">
            {{ issue.component }} · {{ issue.page }} · WCAG {{ issue.wcag }} ·
            <code>{{ issue.selector }}</code>
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>
