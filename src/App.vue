<template>
  <!-- Root: do not reuse id="app" (mount target in index.html) — duplicate IDs break layout/DOM APIs -->
  <div class="app-root min-h-screen bg-white text-gray-900 dark:bg-[#0e0e0e] dark:text-gray-100">
    <div v-if="error" class="flex min-h-screen items-center justify-center bg-white p-4 text-gray-900 dark:bg-dark-950 dark:text-gray-100">
      <div class="max-w-2xl text-center">
        <div class="mb-4 text-2xl text-red-600 dark:text-red-500">Application Error</div>
        <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">{{ error }}</div>
        <button @click="location.reload()" class="px-4 py-2 bg-neon-blue text-white rounded-lg hover:opacity-90">
          Reload Page
        </button>
      </div>
    </div>
    <div v-else-if="!mounted" class="flex min-h-screen items-center justify-center bg-white text-gray-900 dark:bg-dark-950 dark:text-gray-100">
      <div class="text-center">
        <div class="mb-4 text-2xl font-medium">Loading…</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Initializing application</div>
      </div>
    </div>
    <router-view v-else />
    <!-- Suggestion Chat Widget -->
    <!-- <SuggestionChat /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onErrorCaptured } from 'vue'
// Temporarily disable SuggestionChat to debug white page issue
// import SuggestionChat from '@/components/Common/SuggestionChat.vue'

const mounted = ref(false)
const error = ref<string | null>(null)

onErrorCaptured((err: any) => {
  console.error('🚨 App error captured:', err)
  error.value = err.message || 'An error occurred while loading the application'
  return false
})

onMounted(() => {
  try {
    console.log('✅ App.vue mounted')
    // Set mounted immediately - no delay needed
    mounted.value = true
    console.log('✅ Router view should now render')
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
