import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8080',
      '/api': 'http://localhost:8080',
      '/users': 'http://localhost:8080',
      '/projects': 'http://localhost:8080',
      '/tasks': 'http://localhost:8080',
    },
  },
});
