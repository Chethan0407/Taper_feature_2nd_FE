<template>
  <header class="bg-light-100 dark:bg-dark-900 border-b border-light-300 dark:border-dark-700 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Left side - Search -->
      <div class="flex-1 max-w-lg">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            class="input-field w-full pl-10 pr-4"
            placeholder="Search specs, checklists, vendors..."
            @keydown.ctrl.k.prevent="focusSearch"
            @keydown.meta.k.prevent="focusSearch"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <kbd class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono text-gray-500 dark:text-gray-400 bg-light-200 dark:bg-dark-800 border border-light-300 dark:border-dark-600">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <!-- Right side - Actions -->
      <div class="flex items-center space-x-4 ml-6">
        <!-- Notifications -->
        <button class="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
          <span v-if="notificationCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {{ notificationCount }}
          </span>
        </button>

        <!-- AI Assistant -->
        <button class="p-2 text-gray-500 dark:text-gray-400 hover:text-neon-blue transition-colors" title="AI Assistant">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </button>

        <!-- Theme Toggle -->
        <button
          @click="toggleTheme"
          class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title="Toggle theme"
        >
          <svg v-if="isDark" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const searchQuery = ref('')
const notificationCount = ref(3)
const isDark = ref(true)

const toggleTheme = () => {
  isDark.value = !isDark.value
  updateTheme()
}

const updateTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.theme = 'dark'
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.theme = 'light'
  }
}

const focusSearch = () => {
  // Focus search input
  const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
  if (searchInput) {
    searchInput.focus()
  }
}

onMounted(() => {
  // Check localStorage first, then system preference
  const savedTheme = localStorage.theme
  if (savedTheme === 'light') {
    isDark.value = false
  } else if (savedTheme === 'dark') {
    isDark.value = true
  } else {
    // Check system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  
  // Apply the theme
  updateTheme()
})

// Watch for system theme changes
watch(isDark, () => {
  updateTheme()
})
</script> 