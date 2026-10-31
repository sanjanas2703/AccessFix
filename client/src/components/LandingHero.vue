<script setup>
import { ref } from 'vue';

const props = defineProps({
  isRunning: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['submit-url', 'explore-demo']);

const inputUrl = ref('');

function handleSubmit() {
  if (!inputUrl.value.trim()) return;
  emit('submit-url', inputUrl.value.trim());
}

function handleDemo() {
  emit('explore-demo');
}
</script>

<template>
  <section class="hero-section" aria-labelledby="hero-headline">
    <div class="hero-content">
      <div class="hero-badge-row">
        <span class="badge badge-screen-reader">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Web Accessibility Intelligence
        </span>
        <span class="hero-tag-text">Screen Reader · Colour Vision · Motion Sensitivity</span>
      </div>

      <h1 id="hero-headline" class="hero-title">
        Not every website works for everyone.
      </h1>

      <p class="hero-description">
        Discover accessibility barriers, understand their human impact, and preview targeted adaptations tailored to distinct visual, auditory, and cognitive needs.
      </p>

      <form class="scan-box" @submit.prevent="handleSubmit">
        <label for="site-url" class="visually-hidden">Website URL to inspect</label>
        <div class="input-wrapper">
          <div class="input-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          <input
            id="site-url"
            v-model="inputUrl"
            type="url"
            inputmode="url"
            placeholder="https://example.com"
            required
            :disabled="isRunning"
            class="url-input"
          />
          <button type="submit" class="btn btn-primary submit-btn" :disabled="isRunning">
            <span v-if="!isRunning">Analyse website</span>
            <span v-else class="loading-label">
              <span class="spinner" aria-hidden="true"></span>
              Connecting...
            </span>
          </button>
        </div>
      </form>

      <div class="hero-meta-row">
        <span class="meta-label">Want a quick walkthrough?</span>
        <button type="button" class="btn-demo-link" @click="handleDemo">
          Explore controlled demo
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

      <div v-if="error" class="hero-error" role="alert">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{{ error }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  padding: 64px 24px 48px;
  max-width: 980px;
  margin: 0 auto;
  text-align: center;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-badge-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.hero-tag-text {
  font-size: 0.8125rem;
  color: var(--color-muted);
  font-weight: 500;
}

.hero-title {
  font-size: clamp(2.4rem, 5vw, 3.75rem);
  letter-spacing: -0.035em;
  font-weight: 800;
  color: var(--color-obsidian);
  line-height: 1.1;
  margin-bottom: 20px;
  max-width: 820px;
}

.hero-description {
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  color: var(--color-charcoal);
  line-height: 1.6;
  max-width: 680px;
  margin-bottom: 36px;
  font-weight: 400;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.scan-box {
  width: 100%;
  max-width: 640px;
  margin-bottom: 20px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 6px;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
}

.input-wrapper:focus-within {
  border-color: var(--color-obsidian);
  box-shadow: 0 0 0 4px rgba(17, 23, 21, 0.08);
}

.input-icon {
  padding: 0 12px;
  color: var(--color-muted);
  display: flex;
  align-items: center;
}

.url-input {
  flex: 1;
  border: 0;
  outline: none;
  font-family: var(--font-body);
  font-size: 1.05rem;
  color: var(--color-obsidian);
  background: transparent;
  padding: 8px 4px;
}

.url-input::placeholder {
  color: var(--color-muted-light);
}

.submit-btn {
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
}

.loading-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.hero-meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
}

.meta-label {
  color: var(--color-muted);
}

.btn-demo-link {
  background: none;
  border: 0;
  padding: 4px 6px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--cat-screen-reader);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.btn-demo-link:hover {
  color: var(--cat-screen-reader-dark);
}

.hero-error {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background-color: var(--color-danger-bg);
  border: 1px solid #fecaca;
  color: var(--color-danger);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  max-width: 640px;
}

@media (max-width: 640px) {
  .hero-section {
    padding: 36px 16px 32px;
  }
  .input-wrapper {
    flex-direction: column;
    padding: 10px;
    gap: 8px;
  }
  .input-icon {
    display: none;
  }
  .url-input {
    width: 100%;
    text-align: center;
  }
  .submit-btn {
    width: 100%;
  }
}
</style>
