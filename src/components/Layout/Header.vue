<template>
  <header class="bg-light-100 dark:bg-dark-900 border-b border-light-300 dark:border-dark-700 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Branding Logo and Name -->
      <div class="flex items-center mr-8">
        <img v-if="branding.logo_url" :src="branding.logo_url" alt="Logo" class="h-10 w-10 rounded-lg mr-4" />
        <span class="text-xl font-bold text-white tracking-wide">{{ branding.company_name }}</span>
      </div>
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
            placeholder="Search companies, projects, specs..."
            @focus="showDropdown = !!searchResults.length"
            @blur="handleSearchBlur"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <kbd class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono text-gray-500 dark:text-gray-400 bg-light-200 dark:bg-dark-800 border border-light-300 dark:border-dark-600">
              ⌘K
            </kbd>
          </div>
          <!-- Results Dropdown -->
          <div v-if="showDropdown" class="absolute left-0 right-0 mt-1 bg-dark-900 border border-dark-700 rounded-lg shadow-lg z-50">
            <div v-if="searchLoading" class="p-4 text-gray-400">Searching...</div>
            <div v-else-if="searchError" class="p-4 text-red-400">{{ searchError }}</div>
            <div v-else-if="searchResults.length === 0" class="p-4 text-gray-400">No results found</div>
            <div v-else>
              <div v-for="group in searchResults" :key="group.type">
                <div class="px-4 py-2 text-xs text-gray-500 font-bold">{{ group.type }}</div>
                <ul>
                  <li v-for="item in group.items" :key="item.id" class="p-3 hover:bg-dark-800 cursor-pointer flex items-center" @mousedown.prevent="handleResultClick(group.type, item)">
                    <span class="text-white font-medium">{{ item.name || item.title }}</span>
                    <span v-if="item.description" class="ml-2 text-gray-400 text-xs truncate">{{ item.description }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side - Actions -->
      <div class="flex items-center space-x-4 ml-6">
        <!-- Notifications -->
        <button class="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" @click="openNotifications">
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
        <!-- Remove the theme toggle button and related logic from the template -->
        <!-- Remove all script logic for theme toggling, isDark, updateTheme, etc. -->
      </div>
    </div>
  </header>

  <!-- Notification Panel -->
  <div v-if="showNotificationPanel" class="absolute right-8 top-16 z-50 w-80 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl p-4">
    <div v-if="notificationLoading" class="text-center py-8 text-gray-400">Loading...</div>
    <div v-else-if="notificationError" class="text-center py-8 text-red-400">{{ notificationError }}</div>
    <div v-else>
      <h3 class="text-lg font-bold text-white mb-4">Notification Preferences</h3>
      <pre class="text-xs text-gray-400 bg-dark-800 rounded p-2 overflow-x-auto">{{ notificationSettings }}</pre>
      <div class="mt-4 text-right">
        <button class="btn-secondary" @click="showNotificationPanel = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchNotificationSettings } from '@/utils/users.api'
import { useBrandingStore } from '@/stores/branding'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const searchQuery = ref('')
const notificationCount = ref(3)

// Notification panel state
const showNotificationPanel = ref(false)
const notificationSettings = ref(null)
const notificationLoading = ref(false)
const notificationError = ref('')

const branding = useBrandingStore()

const searchResults = ref<{ type: string, items: any[] }[]>([])
const searchLoading = ref(false)
const searchError = ref('')
const showDropdown = ref(false)
let searchTimeout: any = null

const openNotifications = async () => {
  showNotificationPanel.value = !showNotificationPanel.value
  if (showNotificationPanel.value) {
    notificationLoading.value = true
    notificationError.value = ''
    try {
      const res = await fetchNotificationSettings()
      notificationSettings.value = res.data
    } catch (e) {
      notificationError.value = (e as any).message || 'Failed to load notifications'
    } finally {
      notificationLoading.value = false
    }
  }
}

watch(searchQuery, (newVal) => {
  clearTimeout(searchTimeout)
  if (!newVal) {
    searchResults.value = []
    showDropdown.value = false
    return
  }
  searchTimeout = setTimeout(() => {
    doGlobalSearch(newVal)
  }, 300)
})

async function doGlobalSearch(query: string) {
  searchLoading.value = true
  searchError.value = ''
  showDropdown.value = true
  try {
    const res = await fetch(`/api/v1/search/?q=${encodeURIComponent(query)}`, {
      headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
    })
    if (!res.ok) throw new Error('Failed to search')
    const data = await res.json()
    searchResults.value = [
      { type: 'Companies', items: data.companies || [] },
      { type: 'Projects', items: data.projects || [] },
      { type: 'Specs', items: data.specs || [] }
    ].filter(group => group.items.length > 0)
  } catch (e) {
    searchError.value = 'Failed to search'
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

function handleResultClick(type: string, item: any) {
  let route = null
  if (type === 'Companies') route = `/companies/${item.id}`
  else if (type === 'Projects') route = `/projects/${item.id}`
  else if (type === 'Specs') route = `/specs/${item.id}`
  if (route) router.push(route)
  showDropdown.value = false
  searchQuery.value = ''
}

function handleSearchBlur() {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

onMounted(() => {
  if (!branding.company_name) branding.fetchBranding()
})
</script> 