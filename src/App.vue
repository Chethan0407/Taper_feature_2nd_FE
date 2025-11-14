<template>
  <div id="app" class="min-h-screen bg-dark-950 dark">
    <router-view />
    <AuthDebugger />
  </div>
</template>

<script setup lang="ts">
import AuthDebugger from '@/components/AuthDebugger.vue'
// Global app setup
</script>

<style scoped>
#app {
  font-family: 'Inter', system-ui, sans-serif;
}
</style> 