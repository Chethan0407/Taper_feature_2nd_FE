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
            placeholder="Search companies by name, description, or creator..."
            @focus="showDropdown = !!searchResults.length"
            @blur="handleSearchBlur"
            @keydown="handleKeydown"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <kbd class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono text-gray-500 dark:text-gray-400 bg-light-200 dark:bg-dark-800 border border-light-300 dark:border-dark-600">
              ⌘K
            </kbd>
          </div>
          <!-- Results Dropdown -->
          <div v-if="showDropdown" class="absolute left-0 right-0 mt-1 bg-dark-900 border border-dark-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div v-if="searchLoading" class="p-4 text-gray-400">Searching...</div>
            <div v-else-if="searchError" class="p-4 text-red-400">{{ searchError }}</div>
            <div v-else-if="searchResults.length === 0" class="p-4 text-gray-400">No companies found</div>
            <div v-else>
              <ul>
                <li v-for="(item, idx) in searchResults" :key="item.id"
                  class="p-3 hover:bg-dark-800 cursor-pointer flex flex-col"
                  :class="{ 'bg-dark-700': idx === highlightedIndex }"
                  @mousedown.prevent="handleResultClick(item)"
                  @mouseenter="handleResultMouseEnter(idx)"
                >
                  <span class="text-white font-medium">{{ item.name }}</span>
                  <!-- Removed description, createdBy, and status -->
                </li>
              </ul>
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

        <!-- Profile Section with Dropdown -->
        <div class="relative flex items-center space-x-3" tabindex="0"
          @click="showProfileDropdown = !showProfileDropdown"
          @blur="showProfileDropdown = false"
        >
          <img v-if="branding.logo_url" :src="branding.logo_url" alt="Brand Logo" class="h-8 w-8 rounded-full" />
          <span class="text-white font-semibold text-base cursor-pointer">{{ authStore.user?.name || 'User' }}</span>
          <svg class="w-4 h-4 text-white ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          <div v-if="showProfileDropdown" class="absolute right-0 top-full mt-2 w-56 bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl z-50 py-2 px-2">
            <ul>
              <li>
                <router-link to="/profile" class="block px-4 py-3 text-white hover:bg-dark-800 rounded-lg" @click.native="showProfileDropdown = false">Profile</router-link>
              </li>
              <li>
                <router-link to="/settings" class="block px-4 py-3 text-white hover:bg-dark-800 rounded-lg" @click.native="showProfileDropdown = false">Settings</router-link>
              </li>
              <li>
                <button @click.stop="handleLogout" class="block w-full text-left px-4 py-3 text-red-400 hover:bg-dark-800 rounded-lg">Logout</button>
              </li>
            </ul>
          </div>
        </div>
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
import { useCompaniesStore } from '@/stores/companies'

const router = useRouter()
const authStore = useAuthStore()
const companiesStore = useCompaniesStore()

const searchQuery = ref('')
const notificationCount = ref(3)

// Notification panel state
const showNotificationPanel = ref(false)
const notificationSettings = ref(null)
const notificationLoading = ref(false)
const notificationError = ref('')

const branding = useBrandingStore()

const searchResults = ref<any[]>([])
const searchLoading = ref(false)
const searchError = ref('')
const showDropdown = ref(false)
const highlightedIndex = ref(-1)
let searchTimeout: any = null

// Optionally, you can add a status filter for global search
// const statusFilter = ref('')

watch(searchQuery, (newVal) => {
  clearTimeout(searchTimeout)
  highlightedIndex.value = -1
  if (!newVal) {
    searchResults.value = []
    showDropdown.value = false
    return
  }
  searchTimeout = setTimeout(() => {
    doCompanySearch(newVal)
  }, 300)
})

async function doCompanySearch(query: string) {
  searchLoading.value = true
  searchError.value = ''
  showDropdown.value = true
  try {
    // If you want to support status filter, pass it as the second argument
    // const companies = await companiesStore.searchCompanies(query, statusFilter.value)
    const companies = await companiesStore.searchCompanies(query)
    searchResults.value = companies
  } catch (e) {
    searchError.value = 'Failed to search'
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

function handleResultClick(item: any) {
  // Instead of navigating to company details, route to Companies page with search param
  router.push({ path: '/companies', query: { search: searchQuery.value } })
  showDropdown.value = false
}

function handleKeydown(e: KeyboardEvent) {
  if (!showDropdown.value || searchResults.value.length === 0) return
  if (e.key === 'Enter') {
    router.push({ path: '/companies', query: { search: searchQuery.value } })
    showDropdown.value = false
  }
  // Remove arrow navigation and dropdown highlight logic
}

function handleResultMouseEnter(idx: number) {
  highlightedIndex.value = idx
}

function handleSearchBlur() {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

function getStatusClass(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400 border border-green-500/30'
    case 'inactive':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}

const showProfileDropdown = ref(false)

function handleLogout() {
  showProfileDropdown.value = false
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  if (!branding.company_name) branding.fetchBranding()
})
</script> 