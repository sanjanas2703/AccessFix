import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// "vite build --mode extension" writes the unpacked extension to extension/dist.
const extensionBuild = {
  base: './',
  publicDir: '../extension/public',
  build: { outDir: '../extension/dist', emptyOutDir: true, target: 'chrome114' },
};

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  server: {
    // Keep the target in sync with PORT in server/index.js.
    proxy: { '/api': 'http://localhost:3001' },
  },
  ...(mode === 'extension' ? extensionBuild : {}),
}));
