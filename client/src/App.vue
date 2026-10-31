<script setup>
import { ref } from 'vue';
import SiteHeader from './components/SiteHeader.vue';
import ScanView from './views/ScanView.vue';

const scanViewRef = ref(null);
const currentView = ref('landing');
const hasActiveScan = ref(false);

function handleNavigate(view) {
  currentView.value = view;
  if (view === 'landing' && scanViewRef.value) {
    // If user clicks "How it works" or logo, navigate to landing
    scanViewRef.value.viewMode = 'landing';
  } else if (view === 'workspace' && scanViewRef.value && scanViewRef.value.scan) {
    scanViewRef.value.viewMode = 'workspace';
  }
}

function handleNewScan() {
  if (scanViewRef.value) {
    scanViewRef.value.handleNewScan();
  }
}
</script>

<template>
  <div class="app-container">
    <!-- Accessible Skip to Content Link -->
    <a href="#main-content" class="skip-link">Skip to primary content</a>

    <!-- Top Site Navigation Header -->
    <SiteHeader
      :current-view="currentView"
      :has-active-scan="Boolean(scanViewRef?.scan)"
      @navigate="handleNavigate"
      @new-scan="handleNewScan"
    />

    <!-- Main Content Area -->
    <div id="main-content" class="site-main">
      <ScanView ref="scanViewRef" />
    </div>

    <!-- Editorial Product Footer -->
    <footer class="site-footer" role="contentinfo">
      <div class="footer-inner">
        <div class="footer-left">
          <div class="footer-brand">
            <span class="footer-brand-name">AccessFix</span>
            <span class="footer-tagline">— The web, without barriers.</span>
          </div>
          <p class="footer-copy">
            AI-powered accessibility analysis, multi-cue contrast simulation, and deterministic reduced-motion adaptations.
          </p>
        </div>

        <div class="footer-right">
          <div class="footer-note-box">
            <span class="footer-note-title">Conformance & Design Principles</span>
            <p>
              Built strictly in accordance with WCAG 2.1 Level AA recommendations, high-contrast typography, and OS-level <code>prefers-reduced-motion</code> compliance.
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.site-main {
  flex: 1;
  width: 100%;
}

.site-footer {
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 40px var(--space-6);
  margin-top: auto;
}

.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
  flex-wrap: wrap;
}

.footer-brand {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.footer-brand-name {
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 1.15rem;
  color: var(--color-obsidian);
}

.footer-tagline {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.footer-copy {
  font-size: 0.8125rem;
  color: var(--color-muted);
  max-width: 480px;
  margin: 0;
  line-height: 1.5;
}

.footer-note-box {
  max-width: 440px;
}

.footer-note-title {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-obsidian);
  margin-bottom: 6px;
  letter-spacing: 0.03em;
}

.footer-note-box p {
  font-size: 0.8125rem;
  color: var(--color-muted);
  line-height: 1.5;
  margin: 0;
}
</style>
