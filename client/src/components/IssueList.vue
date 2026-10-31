<script setup>
import { computed } from 'vue';
import { GROUP_LABELS, GROUPS } from '../groups.js';

const props = defineProps({
  issues: { type: Array, required: true },
});

const groupedFindings = computed(() =>
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
  </div>
</template>

<style scoped>
.audit-records-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.records-title {
  font-size: 1.6rem;
  margin: 6px 0 4px;
}

.records-sub {
  font-size: 0.9375rem;
  color: var(--color-muted);
  margin-bottom: 0;
  max-width: 680px;
}

.filters-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-input {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  font-family: var(--font-body);
  font-size: 0.875rem;
  min-width: 260px;
}

.filter-select {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.issue-groups-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.issue-group-card {
  padding: 24px;
}

.group-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 12px;
}

.group-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-left h3 {
  font-size: 1.15rem;
  margin: 0;
}

.group-count {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-muted);
}

.issues-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.issue-row-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-sunken);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.issue-row-item:hover {
  background: #ffffff;
  border-color: var(--color-obsidian);
  box-shadow: var(--shadow-sm);
}

.issue-row-item.selected {
  outline: 2px solid var(--color-brand);
  background: var(--color-brand-light);
}

.row-status-badges {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 130px;
}

.row-body {
  flex: 1;
}

.issue-desc {
  font-size: 0.95rem;
  margin: 0 0 6px 0;
  line-height: 1.4;
}

.row-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--color-muted);
  flex-wrap: wrap;
}

.selector-tag {
  color: var(--color-brand);
}

.btn-inspect {
  background: transparent;
  border: 0;
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-obsidian);
  cursor: pointer;
  white-space: nowrap;
}

.empty-state-card {
  padding: 32px;
  text-align: center;
  color: var(--color-muted);
}

@media (max-width: 768px) {
  .issue-row-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
