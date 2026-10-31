<script setup>
import { onMounted, ref } from 'vue';
import { setApiBase } from '../api.js';
import { activeTabUrl, loadBackendUrl, saveBackendUrl } from '../extension.js';

const emit = defineEmits(['use-url']);

const backendUrl = ref('');
const message = ref('');

async function useCurrentTab() {
  message.value = '';
  const tabUrl = await activeTabUrl();
  if (tabUrl.startsWith(`${backendUrl.value}/demo`)) {
    message.value = 'This tab is the demo page. Use "Scan the bundled demo page instead" below.';
  } else if (/^https?:/.test(tabUrl)) {
    emit('use-url', tabUrl);
  } else {
    message.value = 'This tab cannot be scanned: only http and https pages can.';
  }
}

async function onSave() {
  try {
    backendUrl.value = await saveBackendUrl(backendUrl.value);
    setApiBase(`${backendUrl.value}/api`);
    message.value = 'Backend URL saved.';
  } catch (err) {
    message.value = err.message;
  }
}

onMounted(async () => {
  backendUrl.value = await loadBackendUrl();
  await useCurrentTab();
});
</script>

<template>
  <section class="card" aria-labelledby="extension-heading">
    <h2 id="extension-heading">Current tab</h2>
    <button type="button" class="primary" @click="useCurrentTab">Use current tab</button>
    <p class="issue-meta">
      The sandbox opens its own copy of a public URL, so it cannot see logged-in pages or your localhost. On the current
      Daytona tier, most public sites are refused.
    </p>
    <p v-if="message" role="status">{{ message }}</p>

    <details>
      <summary>Backend settings</summary>
      <form class="scan-form" @submit.prevent="onSave">
        <label for="backend-url">Backend URL</label>
        <div class="scan-form-row">
          <input id="backend-url" v-model="backendUrl" type="text" inputmode="url" required />
          <button type="submit">Save</button>
        </div>
      </form>
    </details>
  </section>
</template>
