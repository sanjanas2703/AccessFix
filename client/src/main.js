import { createApp } from 'vue';
import { setApiBase } from './api.js';
import App from './App.vue';
import { isExtension, loadBackendUrl } from './extension.js';
import './style.css';

// The website uses the Vite proxy. The extension has no proxy, so it calls the
// backend directly.
if (isExtension) setApiBase(`${await loadBackendUrl()}/api`);

createApp(App).mount('#app');
