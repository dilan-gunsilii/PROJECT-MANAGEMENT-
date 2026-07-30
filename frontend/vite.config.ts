import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'API_BASE_URL',
      '/api': 'API_BASE_URL',
      '/users': 'API_BASE_URL',
      '/projects': 'API_BASE_URL',
      '/tasks': 'API_BASE_URL',
    },
  },
});
