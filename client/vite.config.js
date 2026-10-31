import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  server: {
    // Keep the target in sync with PORT in server/index.js.
    proxy: { '/api': 'http://localhost:3001' },
  },
});
