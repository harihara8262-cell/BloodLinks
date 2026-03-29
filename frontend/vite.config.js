import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
          maps: ["leaflet"],
        },
      },
    },
  },
  server: {
    port: 3002,
    strictPort: true,
    host: '127.0.0.1',
    open: true,
  },
});
