<script setup>
import ScanView from './views/ScanView.vue';
</script>

<template>
  <header class="app-header">
    <h1>AccessFix</h1>
    <p>Scan a website, fix its accessibility issues, and see the score change.</p>
  </header>
  <main>
    <ScanView />
  </main>
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
