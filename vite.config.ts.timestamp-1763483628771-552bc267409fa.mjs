// vite.config.ts
import { defineConfig } from "file:///Users/chethangopal/Desktop/Taper_feature_2nd_FE/node_modules/vite/dist/node/index.js";
import vue from "file:///Users/chethangopal/Desktop/Taper_feature_2nd_FE/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { resolve } from "path";
var __vite_injected_original_dirname = "/Users/chethangopal/Desktop/Taper_feature_2nd_FE";
var vite_config_default = defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    port: 5176,
    host: true,
    // Increase timeout for file operations
    fs: {
      // Allow serving files from one level up to the project root
      allow: [".."],
      // Strict mode - only allow files within the project
      strict: false
    },
    // HMR (Hot Module Replacement) configuration
    hmr: {
      overlay: true,
      // Set to false to disable error overlay
      // Increase timeout for HMR connections
      clientPort: 5176
    },
    // Watch options to reduce file system load
    watch: {
      // Ignore certain patterns to reduce file watching overhead
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/dist/**",
        "**/.vscode/**",
        "**/.idea/**",
        "**/.DS_Store",
        "**/*.md",
        "**/.cursor/**"
      ],
      // Use polling if file system events are unreliable
      usePolling: false,
      // Interval for polling (only if usePolling is true)
      interval: 100
    },
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
        // Increase proxy timeout
        timeout: 6e4
        // 60 seconds
      }
    }
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router", "pinia"],
          ui: ["lucide-vue-next", "@headlessui/vue"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvY2hldGhhbmdvcGFsL0Rlc2t0b3AvVGFwZXJfZmVhdHVyZV8ybmRfRkVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9jaGV0aGFuZ29wYWwvRGVza3RvcC9UYXBlcl9mZWF0dXJlXzJuZF9GRS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvY2hldGhhbmdvcGFsL0Rlc2t0b3AvVGFwZXJfZmVhdHVyZV8ybmRfRkUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3Z1ZSgpXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICB9LFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTc2LFxuICAgIGhvc3Q6IHRydWUsXG4gICAgLy8gSW5jcmVhc2UgdGltZW91dCBmb3IgZmlsZSBvcGVyYXRpb25zXG4gICAgZnM6IHtcbiAgICAgIC8vIEFsbG93IHNlcnZpbmcgZmlsZXMgZnJvbSBvbmUgbGV2ZWwgdXAgdG8gdGhlIHByb2plY3Qgcm9vdFxuICAgICAgYWxsb3c6IFsnLi4nXSxcbiAgICAgIC8vIFN0cmljdCBtb2RlIC0gb25seSBhbGxvdyBmaWxlcyB3aXRoaW4gdGhlIHByb2plY3RcbiAgICAgIHN0cmljdDogZmFsc2UsXG4gICAgfSxcbiAgICAvLyBITVIgKEhvdCBNb2R1bGUgUmVwbGFjZW1lbnQpIGNvbmZpZ3VyYXRpb25cbiAgICBobXI6IHtcbiAgICAgIG92ZXJsYXk6IHRydWUsIC8vIFNldCB0byBmYWxzZSB0byBkaXNhYmxlIGVycm9yIG92ZXJsYXlcbiAgICAgIC8vIEluY3JlYXNlIHRpbWVvdXQgZm9yIEhNUiBjb25uZWN0aW9uc1xuICAgICAgY2xpZW50UG9ydDogNTE3NixcbiAgICB9LFxuICAgIC8vIFdhdGNoIG9wdGlvbnMgdG8gcmVkdWNlIGZpbGUgc3lzdGVtIGxvYWRcbiAgICB3YXRjaDoge1xuICAgICAgLy8gSWdub3JlIGNlcnRhaW4gcGF0dGVybnMgdG8gcmVkdWNlIGZpbGUgd2F0Y2hpbmcgb3ZlcmhlYWRcbiAgICAgIGlnbm9yZWQ6IFtcbiAgICAgICAgJyoqL25vZGVfbW9kdWxlcy8qKicsXG4gICAgICAgICcqKi8uZ2l0LyoqJyxcbiAgICAgICAgJyoqL2Rpc3QvKionLFxuICAgICAgICAnKiovLnZzY29kZS8qKicsXG4gICAgICAgICcqKi8uaWRlYS8qKicsXG4gICAgICAgICcqKi8uRFNfU3RvcmUnLFxuICAgICAgICAnKiovKi5tZCcsXG4gICAgICAgICcqKi8uY3Vyc29yLyoqJ1xuICAgICAgXSxcbiAgICAgIC8vIFVzZSBwb2xsaW5nIGlmIGZpbGUgc3lzdGVtIGV2ZW50cyBhcmUgdW5yZWxpYWJsZVxuICAgICAgdXNlUG9sbGluZzogZmFsc2UsXG4gICAgICAvLyBJbnRlcnZhbCBmb3IgcG9sbGluZyAob25seSBpZiB1c2VQb2xsaW5nIGlzIHRydWUpXG4gICAgICBpbnRlcnZhbDogMTAwLFxuICAgIH0sXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjgwMDAnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IHBhdGggPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJy9hcGknKSxcbiAgICAgICAgLy8gSW5jcmVhc2UgcHJveHkgdGltZW91dFxuICAgICAgICB0aW1lb3V0OiA2MDAwMCwgLy8gNjAgc2Vjb25kc1xuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIHZlbmRvcjogWyd2dWUnLCAndnVlLXJvdXRlcicsICdwaW5pYSddLFxuICAgICAgICAgIHVpOiBbJ2x1Y2lkZS12dWUtbmV4dCcsICdAaGVhZGxlc3N1aS92dWUnXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pICJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1UsU0FBUyxvQkFBb0I7QUFDL1YsT0FBTyxTQUFTO0FBQ2hCLFNBQVMsZUFBZTtBQUZ4QixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsSUFBSSxDQUFDO0FBQUEsRUFDZixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFFTixJQUFJO0FBQUE7QUFBQSxNQUVGLE9BQU8sQ0FBQyxJQUFJO0FBQUE7QUFBQSxNQUVaLFFBQVE7QUFBQSxJQUNWO0FBQUE7QUFBQSxJQUVBLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQTtBQUFBO0FBQUEsTUFFVCxZQUFZO0FBQUEsSUFDZDtBQUFBO0FBQUEsSUFFQSxPQUFPO0FBQUE7QUFBQSxNQUVMLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQTtBQUFBLE1BRUEsWUFBWTtBQUFBO0FBQUEsTUFFWixVQUFVO0FBQUEsSUFDWjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxVQUFRLEtBQUssUUFBUSxVQUFVLE1BQU07QUFBQTtBQUFBLFFBRTlDLFNBQVM7QUFBQTtBQUFBLE1BQ1g7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osUUFBUSxDQUFDLE9BQU8sY0FBYyxPQUFPO0FBQUEsVUFDckMsSUFBSSxDQUFDLG1CQUFtQixpQkFBaUI7QUFBQSxRQUMzQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
