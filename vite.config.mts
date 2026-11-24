import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Served from https://patrickking67.github.io/commute-analyzer/
  base: '/commute-analyzer/',
  server: { port: 4107, strictPort: true },
  preview: { port: 4107, strictPort: true },
});
