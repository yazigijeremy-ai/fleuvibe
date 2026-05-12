import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          zod: ['zod'],
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 3000,
  },
})
