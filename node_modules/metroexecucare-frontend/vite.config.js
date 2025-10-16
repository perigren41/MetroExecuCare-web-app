import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true, // Enable source maps for debugging production errors
    minify: 'esbuild', // Use esbuild (default, faster and more reliable)
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
        }
      }
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // Listen on all network interfaces for container/cloud compatibility
    open: true,
    strictPort: true, // Fail if port is already in use instead of trying next available
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    allowedHosts: [
      'metroexecucare.up.railway.app',
      '.railway.app', // Allow all Railway subdomains
      'localhost',
      '127.0.0.1'
    ]
  }
})

