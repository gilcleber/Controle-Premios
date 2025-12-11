import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Controle-Premios/', 
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1600,
  }
});
