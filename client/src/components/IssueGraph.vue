<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  issues: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['select-issue']);

const selectedComponent = ref('All');

// Aggregate components and their related issues
const componentsData = computed(() => {
  const map = new Map();
  props.issues.forEach((issue) => {
    const name = issue.component || 'General DOM';
    if (!map.has(name)) {
      map.set(name, {
        name,
        issues: [],
        groups: new Set(),
        severities: { high: 0, medium: 0, low: 0 },
      });
    }
    const entry = map.get(name);
    entry.issues.push(issue);
    entry.groups.add(issue.group);
    if (issue.severity) entry.severities[issue.severity]++;
  });

  return Array.from(map.values())
    .map((c) => ({
      ...c,
      groupCount: c.groups.size,
      totalIssues: c.issues.length,
      isMultiDisability: c.groups.size > 1,
    }))
    .sort((a, b) => b.totalIssues - a.totalIssues);
});

const activeIssues = computed(() => {
  if (selectedComponent.value === 'All') return props.issues;
  return props.issues.filter((i) => (i.component || 'General DOM') === selectedComponent.value);
});
</script>

<template>
  <div class="issue-graph-view" aria-labelledby="graph-heading">
    <div class="graph-header card-box">
      <div>
        <span class="badge badge-screen-reader">Neo4j Architectural Intelligence</span>
        <h2 id="graph-heading" class="graph-title">Component-Issue Relational Graph</h2>
        <p class="graph-sub">
          Visualizes UI components across the site and flags components that introduce compounding accessibility barriers for multiple disability groups.
        </p>
      </div>

      <!-- Filter by Component -->
      <div class="component-filter">
        <label for="comp-select" class="filter-label">Filter Focus Component:</label>
        <select id="comp-select" v-model="selectedComponent" class="comp-dropdown">
          <option value="All">All Components ({{ componentsData.length }})</option>
          <option v-for="c in componentsData" :key="c.name" :value="c.name">
            {{ c.name }} ({{ c.totalIssues }} issues)
          </option>
        </select>
      </div>
    </div>

    <!-- Visual Interactive Component Matrix -->
    <div class="components-grid">
      <div
        v-for="c in componentsData"
        :key="c.name"
        class="component-node-card card-box"
        :class="{
          selected: selectedComponent === c.name,
          'comp-danger': c.isMultiDisability || c.severities.high > 0,
        }"
        @click="selectedComponent = selectedComponent === c.name ? 'All' : c.name"
      >
        <div class="node-top">
          <span class="node-role-badge">&lt;Component&gt;</span>
          <span v-if="c.isMultiDisability" class="badge badge-severity-high">
            Compound Impact ({{ c.groupCount }} Groups)
          </span>
        </div>

        <h3 class="node-name">{{ c.name }}</h3>

        <div class="node-stats">
          <span>{{ c.totalIssues }} {{ c.totalIssues === 1 ? 'issue' : 'issues' }}</span>
          <span>·</span>
          <span class="text-danger">{{ c.severities.high }} high</span>
        </div>

        <!-- Groups Touched -->
        <div class="groups-pills-row">
          <span
            v-for="group in Array.from(c.groups)"
            :key="group"
            class="badge"
            :class="{
              'badge-screen-reader': group === 'blind',
              'badge-colour-vision': group === 'colourblind',
              'badge-motion': group === 'cognitive' || group === 'motor',
              'badge-severity-low': group === 'deaf',
            }"
          >
            {{ group }}
          </span>
        </div>
      </div>
    </div>

    <!-- Related Issues List for Selected Component -->
    <div class="component-issues-list card-box">
      <div class="list-head">
        <h3>
          Issues Associated with: <strong>{{ selectedComponent }}</strong>
          ({{ activeIssues.length }})
        </h3>
        <span class="list-hint">Click an issue to inspect evidence and AI guidance</span>
      </div>

      <div class="issues-cards-row">
        <div
          v-for="issue in activeIssues"
          :key="issue.id"
          class="issue-bubble card-box"
          @click="emit('select-issue', issue)"
        >
          <div class="bubble-header">
            <span class="badge" :class="`badge-severity-${issue.severity}`">{{ issue.severity }}</span>
            <span class="badge font-mono">WCAG {{ issue.wcag }}</span>
            <span class="badge" :class="issue.fixed ? 'badge-fixed' : 'badge-open'">
              {{ issue.fixed ? 'Resolved' : 'Open' }}
            </span>
          </div>
          <h4>{{ issue.description }}</h4>
          <code class="bubble-selector">{{ issue.selector }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.issue-graph-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.graph-title {
  font-size: 1.6rem;
  margin: 6px 0 4px;
}

.graph-sub {
  font-size: 0.9375rem;
  color: var(--color-muted);
  margin-bottom: 0;
  max-width: 680px;
}

.component-filter {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-muted);
}

.comp-dropdown {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.component-node-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.component-node-card:hover {
  border-color: var(--color-obsidian);
  box-shadow: var(--shadow-md);
}

.component-node-card.selected {
  outline: 2px solid var(--color-obsidian);
  background: var(--color-surface-sunken);
}

.comp-danger {
  border-left: 4px solid var(--color-danger);
}

.node-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.node-role-badge {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--color-muted);
}

.node-name {
  font-size: 1.15rem;
  margin: 0;
}

.node-stats {
  font-size: 0.8125rem;
  color: var(--color-muted);
  display: flex;
  gap: 6px;
}

.text-danger { color: var(--color-danger); }

.groups-pills-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 4px;
}

/* Related Issues */
.component-issues-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.list-head h3 {
  font-size: 1.1rem;
  margin: 0;
}

.list-hint {
  font-size: 0.8125rem;
  color: var(--color-muted);
}

.issues-cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
}

.issue-bubble {
  background: var(--color-surface-sunken);
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 16px;
}

.issue-bubble:hover {
  border-color: var(--color-brand);
  background: #ffffff;
  box-shadow: var(--shadow-sm);
}

.bubble-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.issue-bubble h4 {
  font-size: 0.9375rem;
  line-height: 1.4;
  margin-bottom: 8px;
}

.bubble-selector {
  font-size: 0.75rem;
  color: var(--color-muted);
  word-break: break-all;
}
</style>
