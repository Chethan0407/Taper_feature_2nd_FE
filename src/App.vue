<template>
  <!-- Root: do not reuse id="app" (mount target in index.html) — duplicate IDs break layout/DOM APIs -->
  <div class="app-root min-h-screen bg-[#e8eef4] text-slate-900 dark:bg-dark-950 dark:text-gray-100">
    <div v-if="error" class="flex min-h-screen items-center justify-center bg-[#e8eef4] p-4 text-slate-900 dark:bg-dark-950 dark:text-gray-100">
      <div class="max-w-2xl text-center">
        <div class="mb-4 text-2xl text-red-600 dark:text-red-500">Application Error</div>
        <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">{{ error }}</div>
        <button @click="location.reload()" class="px-4 py-2 bg-neon-blue text-white rounded-lg hover:opacity-90">
          Reload Page
        </button>
      </div>
    </div>
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onErrorCaptured } from 'vue'
import { useBrandingStore } from '@/stores/branding'
import { applyBrandTheme } from '@/utils/brand-theme'

const error = ref<string | null>(null)

onErrorCaptured((err: any) => {
  console.error('🚨 App error captured:', err)
  error.value = err.message || 'An error occurred while loading the application'
  return false
})

onMounted(() => {
  try {
    applyBrandTheme()
    const branding = useBrandingStore()
    branding.fetchBranding().catch(() => undefined)
  } catch (err: any) {
    console.error('🚨 Error in onMounted:', err)
    error.value = err.message || 'Failed to initialize application'
  }
})
</script>

<style scoped>
.app-root {
  font-family: 'Inter', system-ui, sans-serif;
}
</style>
