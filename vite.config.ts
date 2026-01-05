import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  // Path aliases for cleaner imports
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  
  // Development server configuration
  server: {
    port: 5177,
    host: 'localhost',
    strictPort: false, // Allow fallback to next available port if 5177 is busy
    open: true, // Auto-open browser when server starts
    // CRITICAL: API proxy - required for all /api requests to work
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // Production build optimizations
  build: {
    rollupOptions: {
      output: {
        // Code splitting for better caching
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-ui': ['@headlessui/vue', '@heroicons/vue', 'lucide-vue-next'],
          'vendor-utils': ['@vueuse/core'],
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    target: 'es2020',
  },
  
  // Dependency pre-bundling optimization
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
    exclude: ['vue-virtual-scroller'],
    force: false,
  },
})
