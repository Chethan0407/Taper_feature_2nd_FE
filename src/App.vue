<template>
  <div id="app" class="min-h-screen" style="background-color: #0E0E0E; color: #f1f5f9;">
    <div v-if="error" class="flex items-center justify-center min-h-screen text-white p-4">
      <div class="text-center max-w-2xl">
        <div class="text-2xl mb-4 text-red-500">Application Error</div>
        <div class="text-sm text-gray-400 mb-4">{{ error }}</div>
        <button @click="location.reload()" class="px-4 py-2 bg-neon-blue text-white rounded-lg hover:opacity-90">
          Reload Page
        </button>
      </div>
    </div>
    <div v-else-if="!mounted" class="flex items-center justify-center min-h-screen text-white" style="color: #f1f5f9;">
      <div class="text-center">
        <div class="text-2xl mb-4" style="color: #f1f5f9;">Loading...</div>
        <div class="text-sm" style="color: #94a3b8;">Initializing application</div>
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
#app {
  font-family: 'Inter', system-ui, sans-serif;
}
</style>
