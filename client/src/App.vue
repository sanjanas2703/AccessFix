<script setup>
import { ref } from 'vue';
import ExtensionBar from './components/ExtensionBar.vue';
import { isExtension } from './extension.js';
import ScanView from './views/ScanView.vue';

const suggestedUrl = ref('');
</script>

<template>
  <header class="app-header">
    <h1>AccessFix</h1>
    <p>Check a page for screen-reader, colour and motion issues, then preview supported adjustments.</p>
  </header>
  <main>
    <ExtensionBar v-if="isExtension" @use-url="suggestedUrl = $event" />
    <ScanView :suggested-url="suggestedUrl" />
  </main>
</template>
