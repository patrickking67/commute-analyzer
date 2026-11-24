import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Served from https://patrickking67.github.io/commute-analyzer/
  base: '/commute-analyzer/',
  server: { port: 4107, strictPort: true },
  preview: { port: 4107, strictPort: true },
  css: {
    postcss: './postcss.config.js',
  },
});
