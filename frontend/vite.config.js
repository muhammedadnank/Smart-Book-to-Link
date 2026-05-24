import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/admin/files/delete': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/admin/maintenance': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/f/': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})

