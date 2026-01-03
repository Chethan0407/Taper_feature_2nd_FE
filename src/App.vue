<template>
  <div id="app" class="min-h-screen bg-dark-950 dark">
    <div v-if="!mounted" class="flex items-center justify-center min-h-screen text-white">
      <div class="text-center">
        <div class="text-2xl mb-4">Loading...</div>
        <div class="text-sm text-gray-400">Initializing application</div>
      </div>
    </div>
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const mounted = ref(false)

onMounted(() => {
  console.log('✅ App.vue mounted')
  // Set mounted immediately - no delay needed
  mounted.value = true
  console.log('✅ Router view should now render')
})
</script>

<style scoped>
#app {
  font-family: 'Inter', system-ui, sans-serif;
}
</style>
