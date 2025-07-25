import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    cors: true,
    hmr: {
      port: 5174,
      overlay: false,
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    sourcemap: false,
    minify: 'esbuild',
  },
  optimizeDeps: {
    force: true,
  },
  define: {
    global: 'globalThis',
  },
})
