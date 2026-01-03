/**
 * Loading Spinner Component
 * 
 * Reusable loading spinner shown during:
 * 1. Route code splitting (while components load)
 * 2. API requests
 * 3. Data fetching
 * 
 * WHY: Provides consistent visual feedback across the app.
 * Users need to know something is happening, not just a blank screen.
 */

<template>
  <div class="flex items-center justify-center min-h-screen bg-dark-950">
    <div class="text-center">
      <!-- Animated spinner -->
      <!-- WHY: Visual indicator that something is loading -->
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-neon-blue border-t-transparent mx-auto mb-4"></div>
      <p class="text-gray-400 text-lg">Loading...</p>
      <!-- Optional: Add progress indicator or percentage if available -->
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or logic needed - this is a pure presentational component
// WHY: Keeps it simple and reusable everywhere
</script>

<style scoped>
/* Spinner animation is handled by Tailwind's animate-spin */
/* WHY: Using Tailwind classes keeps bundle size small */
</style>

