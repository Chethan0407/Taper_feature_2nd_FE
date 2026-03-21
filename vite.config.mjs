import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

function logPhase(msg) {
  process.stderr.write(`[vite-config] ${msg}\n`)
}

logPhase('vite.config.mjs loaded (native ESM, no TS bundle)')

/** Dev-only: where /api/* is forwarded. Browser stays on :5177; Vite proxies to the backend. */
function apiProxyTarget(mode) {
  const env = loadEnv(mode, process.cwd(), '')
  const fromFile =
    env.VITE_API_PROXY_TARGET ||
    env.API_PROXY_TARGET ||
    process.env.VITE_API_PROXY_TARGET ||
    process.env.API_PROXY_TARGET
  // Default localhost (often resolves to IPv4 + IPv6); override with VITE_API_PROXY_TARGET if needed
  return (fromFile && fromFile.trim()) || 'http://localhost:8000'
}

export default defineConfig(({ mode }) => {
  const proxyTarget = apiProxyTarget(mode)
  logPhase(`API proxy: /api → ${proxyTarget}`)

  return {
    plugins: [
      {
        name: 'vite-startup-marker',
        configResolved() {
          logPhase('config resolved → HTTP server starting')
        },
      },
      vue(),
    ],

    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },

    // Run Tailwind here so @tailwind / @apply in src/style.css always compile in dev + build
    // (avoids relying on postcss.config discovery alone).
    css: {
      postcss: {
        plugins: [tailwindcss(), autoprefixer()],
      },
    },

    server: {
      port: 5177,
      host: true,
      strictPort: true,
      open: false,
      watch: {
        ignored: ['**/admin-app/**', '**/node_modules/**', '**/dist/**', '**/.git/**'],
      },
      // Do not pin HMR to localhost — breaks opening the app via Network URL (phone / LAN IP).
      proxy: {
        '/api': {
          // Node resolves "localhost" to 127.0.0.1 (or ::1); proxy errors may still say 127.0.0.1:8000
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          ws: false,
          timeout: 60_000,
          proxyTimeout: 60_000,
        },
      },
    },

    build: {
      rollupOptions: {
        output: {
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

    optimizeDeps: {
      entries: [resolve(__dirname, 'index.html')],
      include: ['vue', 'vue-router', 'pinia'],
      exclude: ['vue-virtual-scroller'],
      noDiscovery: true,
    },
  }
})
