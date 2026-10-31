<script setup>
defineProps({
  currentView: {
    type: String,
    default: 'landing', // 'landing', 'workspace'
  },
  activeTab: {
    type: String,
    default: 'overview',
  },
  hasActiveScan: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['navigate', 'new-scan']);
</script>

<template>
  <header class="site-header" role="banner">
    <div class="header-inner">
      <div class="header-brand">
        <a href="#main" class="brand-link" @click.prevent="emit('navigate', 'landing')">
          <div class="brand-symbol" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="m4.93 4.93 4.24 4.24" />
              <path d="m14.83 9.17 4.24-4.24" />
              <path d="M14.83 14.83 19.07 19.07" />
              <path d="M9.17 14.83 4.93 19.07" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name">AccessFix</span>
            <span class="brand-tagline">The web, without barriers</span>
          </div>
        </a>
      </div>

      <nav class="header-nav" aria-label="Main Navigation">
        <ul class="nav-list">
          <li>
            <button
              type="button"
              class="nav-link"
              :class="{ active: currentView === 'landing' }"
              @click="emit('navigate', 'landing')"
            >
              How it works
            </button>
          </li>
          <li v-if="hasActiveScan">
            <button
              type="button"
              class="nav-link"
              :class="{ active: currentView === 'workspace' }"
              @click="emit('navigate', 'workspace')"
            >
              Scan Workspace
            </button>
          </li>
        </ul>
      </nav>

      <div class="header-actions">
        <button
          v-if="currentView === 'workspace'"
          type="button"
          class="btn btn-secondary btn-sm"
          @click="emit('new-scan')"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Analysis
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(8px);
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--color-obsidian);
}

.brand-symbol {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background-color: var(--color-obsidian);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 1.1875rem;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.brand-tagline {
  font-size: 0.75rem;
  color: var(--color-muted);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.header-nav {
  display: flex;
  align-items: center;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 8px;
}

.nav-link {
  background: transparent;
  border: 0;
  padding: 8px 14px;
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-charcoal);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-link:hover {
  background-color: var(--color-surface-sunken);
  color: var(--color-obsidian);
}

.nav-link.active {
  font-weight: 600;
  color: var(--color-obsidian);
  background-color: var(--color-surface-sunken);
}

.btn-sm {
  padding: 7px 14px;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .brand-tagline {
    display: none;
  }
}
</style>
