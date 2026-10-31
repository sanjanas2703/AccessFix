<script setup>
import { computed, ref } from 'vue';
import { GROUP_LABELS, GROUPS } from '../groups.js';

const props = defineProps({
  issues: { type: Array, required: true },
  selectedIssueId: { type: String, default: null },
});

const emit = defineEmits(['select-issue']);

const searchQuery = ref('');
const selectedSeverity = ref('all');
const selectedStatus = ref('all');

const filteredIssues = computed(() => {
  return props.issues.filter((issue) => {
    if (selectedSeverity.value !== 'all' && issue.severity !== selectedSeverity.value) {
      return false;
    }
    if (selectedStatus.value === 'fixed' && !issue.fixed) {
      return false;
    }
    if (selectedStatus.value === 'open' && issue.fixed) {
      return false;
    }
    if (selectedStatus.value === 'review' && !issue.requiresManualReview) {
      return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const matchText = `${issue.description} ${issue.selector} ${issue.component} ${issue.wcag}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });
});

const groupedIssues = computed(() =>
  GROUPS.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    issues: filteredIssues.value.filter((issue) => issue.group === group),
  })).filter((entry) => entry.issues.length > 0)
);
</script>

<template>
  <div class="audit-records-view" aria-labelledby="issues-heading">
    <div class="records-header card-box">
      <div>
        <span class="badge badge-screen-reader">Full Diagnostic Catalog</span>
        <h2 id="issues-heading" class="records-title">Accessibility Audit Records ({{ filteredIssues.length }})</h2>
        <p class="records-sub">
          Comprehensive inventory of detected barriers, WCAG 2.1 compliance tags, and verified remediation states.
        </p>
      </div>

      <!-- Controls Row -->
      <div class="filters-row">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search selector, WCAG, or keyword..."
            class="filter-input"
          />
        </div>

        <select v-model="selectedSeverity" class="filter-select">
          <option value="all">All Severities</option>
          <option value="high">High Severity</option>
          <option value="medium">Medium Severity</option>
          <option value="low">Low Severity</option>
        </select>

        <select v-model="selectedStatus" class="filter-select">
          <option value="all">All Statuses</option>
          <option value="open">Unresolved</option>
          <option value="fixed">Automated Check Improved</option>
          <option value="review">Manual Review Required</option>
        </select>
      </div>
    </div>

    <!-- Grouped Records List -->
    <div class="issue-groups-container">
      <div
        v-for="entry in groupedIssues"
        :key="entry.group"
        class="issue-group-card card-box"
      >
        <div class="group-head">
          <div class="group-left">
            <span
              class="badge"
              :class="{
                'badge-screen-reader': entry.group === 'blind',
                'badge-colour-vision': entry.group === 'colourblind',
                'badge-motion': entry.group === 'cognitive' || entry.group === 'motor',
                'badge-severity-low': entry.group === 'deaf',
              }"
            >
              {{ entry.group }}
            </span>
            <h3>{{ entry.label }}</h3>
          </div>
          <span class="group-count">{{ entry.issues.length }} findings</span>
        </div>

        <ul class="issues-list">
          <li
            v-for="issue in entry.issues"
            :key="issue.id"
            class="issue-row-item"
            :class="{ selected: selectedIssueId === issue.id }"
            @click="emit('select-issue', issue)"
          >
            <div class="row-status-badges">
              <span class="badge" :class="`badge-severity-${issue.severity}`">{{ issue.severity }}</span>
              <span class="badge" :class="issue.fixed ? 'badge-fixed' : 'badge-open'">
                {{ issue.fixed ? 'Check Improved' : 'Unresolved' }}
              </span>
              <span v-if="issue.requiresManualReview" class="badge badge-severity-medium">
                Review Needed
              </span>
            </div>

            <div class="row-body">
              <h4 class="issue-desc">{{ issue.description }}</h4>
              <div class="row-meta">
                <span>Component: <strong>{{ issue.component }}</strong></span>
                <span>·</span>
                <span>Route: <code>{{ issue.page }}</code></span>
                <span>·</span>
                <span>WCAG: <strong class="font-mono">{{ issue.wcag }}</strong></span>
                <span>·</span>
                <code class="selector-tag">{{ issue.selector }}</code>
              </div>
            </div>

            <div class="row-action">
              <button type="button" class="btn-inspect">Inspect →</button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="groupedIssues.length === 0" class="empty-state-card card-box">
        <p>No accessibility records match the active filter criteria.</p>
      </div>
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
