import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5177,
    host: true,
    // Increase timeout for file operations
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
      // Strict mode - only allow files within the project
      strict: false,
    },
    // HMR (Hot Module Replacement) configuration
    hmr: {
      overlay: true, // Set to false to disable error overlay
      // Increase timeout for HMR connections
      clientPort: 5177,
    },
    // Watch options to reduce file system load
    watch: {
      // Ignore certain patterns to reduce file watching overhead
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/.vscode/**',
        '**/.idea/**',
        '**/.DS_Store',
        '**/*.md',
        '**/.cursor/**'
      ],
      // Use polling if file system events are unreliable
      usePolling: false,
      // Interval for polling (only if usePolling is true)
      interval: 100,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '/api'),
        // Increase proxy timeout
        timeout: 60000, // 60 seconds
      },
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['lucide-vue-next', '@headlessui/vue'],
        },
      },
    },
  },
}) 