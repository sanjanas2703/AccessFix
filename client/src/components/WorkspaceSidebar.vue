<script setup>
import { computed } from 'vue';

const props = defineProps({
  scan: {
    type: Object,
    required: true,
  },
  activeTab: {
    type: String,
    default: 'overview',
  },
  isDemoMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['select-tab', 'new-scan']);

const screenReaderIssues = computed(() =>
  props.scan?.issues?.filter((i) => i.group === 'blind') ?? []
);

const colourVisionIssues = computed(() =>
  props.scan?.issues?.filter((i) => i.group === 'colourblind') ?? []
);

const motionIssues = computed(() =>
  props.scan?.issues?.filter((i) => i.group === 'cognitive' || i.type?.includes('motion') || i.type?.includes('animation')) ?? []
);

const manualReviewCount = computed(() =>
  props.scan?.issues?.filter((i) => i.requiresManualReview || !i.fixed)?.length ?? 0
);
</script>

<template>
  <aside class="workspace-sidebar" aria-label="Analysis Workspace Navigation">
    <div class="sidebar-top">
      <div class="target-card">
        <div class="target-badge-row">
          <span class="status-indicator-dot" aria-hidden="true"></span>
          <span class="status-name">Target Inspected</span>
          <span v-if="isDemoMode" class="badge-demo">Demo Mode</span>
        </div>
        <div class="target-url" :title="scan.url">
          {{ scan.url }}
        </div>
        <div class="target-meta">
          <span>{{ scan.issues?.length ?? 0 }} findings</span>
          <span>·</span>
          <span>Status: {{ scan.status }}</span>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-group-title">Analysis Perspectives</div>
      <ul class="sidebar-menu">
        <li>
          <button
            type="button"
            class="menu-item"
            :class="{ active: activeTab === 'overview' }"
            @click="emit('select-tab', 'overview')"
          >
            <div class="item-left">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Executive Overview</span>
            </div>
            <span class="count-pill">{{ scan.issues?.length ?? 0 }}</span>
          </button>
        </li>

        <li>
          <button
            type="button"
            class="menu-item tab-sr"
            :class="{ active: activeTab === 'screen-reader' }"
            @click="emit('select-tab', 'screen-reader')"
          >
            <div class="item-left">
              <span class="category-marker marker-teal" aria-hidden="true"></span>
              <span>Screen Reader</span>
            </div>
            <span class="count-pill badge-screen-reader">{{ screenReaderIssues.length }}</span>
          </button>
        </li>

        <li>
          <button
            type="button"
            class="menu-item tab-cv"
            :class="{ active: activeTab === 'colour-vision' }"
            @click="emit('select-tab', 'colour-vision')"
          >
            <div class="item-left">
              <span class="category-marker marker-amber" aria-hidden="true"></span>
              <span>Colour Vision</span>
            </div>
            <span class="count-pill badge-colour-vision">{{ colourVisionIssues.length }}</span>
          </button>
        </li>

        <li>
          <button
            type="button"
            class="menu-item tab-mo"
            :class="{ active: activeTab === 'motion' }"
            @click="emit('select-tab', 'motion')"
          >
            <div class="item-left">
              <span class="category-marker marker-indigo" aria-hidden="true"></span>
              <span>Motion Sensitivity</span>
            </div>
            <span class="count-pill badge-motion">{{ motionIssues.length }}</span>
          </button>
        </li>
      </ul>

      <div class="nav-group-title">Adaptation & Architecture</div>
      <ul class="sidebar-menu">
        <li>
          <button
            type="button"
            class="menu-item studio-link"
            :class="{ active: activeTab === 'studio' }"
            @click="emit('select-tab', 'studio')"
          >
            <div class="item-left">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              <span>Transformation Studio</span>
            </div>
            <span class="studio-badge">Before / After</span>
          </button>
        </li>

        <li>
          <button
            type="button"
            class="menu-item"
            :class="{ active: activeTab === 'graph' }"
            @click="emit('select-tab', 'graph')"
          >
            <div class="item-left">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              <span>Neo4j Component Graph</span>
            </div>
          </button>
        </li>

        <li>
          <button
            type="button"
            class="menu-item"
            :class="{ active: activeTab === 'issues' }"
            @click="emit('select-tab', 'issues')"
          >
            <div class="item-left">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              <span>Audit Records</span>
            </div>
            <span class="count-pill">{{ scan.issues?.length ?? 0 }}</span>
          </button>
        </li>

        <li>
          <button
            type="button"
            class="menu-item"
            :class="{ active: activeTab === 'sandbox' }"
            @click="emit('select-tab', 'sandbox')"
          >
            <div class="item-left">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
              </svg>
              <span>Daytona Sandbox Log</span>
            </div>
            <span class="count-pill">{{ scan.sandboxEvents?.length ?? 0 }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <div class="sidebar-bottom">
      <div class="review-box" v-if="manualReviewCount > 0">
        <span class="review-label">Human Review Needed</span>
        <span class="review-value">{{ manualReviewCount }} items</span>
        <span class="review-sub">Accessibility requires human judgment</span>
      </div>
      <button type="button" class="btn btn-secondary btn-full" @click="emit('new-scan')">
        Scan another website
      </button>
    </div>
  </aside>
</template>

<style scoped>
.workspace-sidebar {
  width: 280px;
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 68px);
  position: sticky;
  top: 68px;
  overflow-y: auto;
}

.sidebar-top {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.target-card {
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px;
}

.target-badge-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 6px;
}

.status-indicator-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #22c55e;
}

.badge-demo {
  background: #fef3c7;
  color: #92400e;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 700;
  margin-left: auto;
}

.target-url {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-obsidian);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.target-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--color-muted);
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
}

.nav-group-title {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-muted-light);
  padding: 8px 10px 4px;
  margin-top: 4px;
}

.sidebar-menu {
  list-style: none;
  margin: 0 0 16px 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: transparent;
  border: 0;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-charcoal);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.menu-item:hover {
  background-color: var(--color-surface-sunken);
  color: var(--color-obsidian);
}

.menu-item.active {
  background-color: var(--color-obsidian);
  color: #ffffff;
  font-weight: 600;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.marker-teal { background-color: var(--cat-screen-reader); }
.marker-amber { background-color: var(--cat-colour-vision); }
.marker-indigo { background-color: var(--cat-motion); }

.count-pill {
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: var(--radius-full);
  background-color: var(--color-surface-sunken);
  color: var(--color-muted);
}

.menu-item.active .count-pill {
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.studio-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 2px 6px;
  background-color: var(--color-brand-light);
  color: var(--color-brand);
  border-radius: 4px;
}

.menu-item.active .studio-badge {
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.sidebar-bottom {
  padding: 16px;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.review-box {
  background: #fffbeb;
  border: 1px solid #fed7aa;
  border-radius: var(--radius-sm);
  padding: 10px;
  margin-bottom: 12px;
}

.review-label {
  display: block;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #9a3412;
}

.review-value {
  display: block;
  font-size: 1.1rem;
  font-weight: 800;
  color: #c2410c;
  line-height: 1.2;
}

.review-sub {
  display: block;
  font-size: 0.6875rem;
  color: #78350f;
  margin-top: 2px;
}

.btn-full {
  width: 100%;
  font-size: 0.8125rem;
  padding: 8px 12px;
}

@media (max-width: 960px) {
  .workspace-sidebar {
    width: 100%;
    height: auto;
    position: static;
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }
}
</style>
