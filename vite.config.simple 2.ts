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
  // Disable source maps in dev for faster startup
  css: {
    devSourcemap: false,
  },
  server: {
    port: 5177,
    host: '0.0.0.0',
    // Optimize file system access
    fs: {
      // Allow current directory and parent (needed for some imports)
      strict: false,
      allow: ['.', '..'],
    },
    // HMR (Hot Module Replacement) configuration
    hmr: {
      overlay: false, // Disable error overlay to prevent "server restarted" errors
      clientPort: 5177,
    },
    // Optimize file watching for better performance
    watch: {
      // Ignore patterns to reduce file watching overhead
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/.vscode/**',
        '**/.idea/**',
        '**/.DS_Store',
        '**/*.md',
        '**/.cursor/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**',
        '**/.turbo/**'
      ],
      usePolling: false, // Use native file system events (faster)
    },
  },
  // Reduce logging overhead
  logLevel: 'info',
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