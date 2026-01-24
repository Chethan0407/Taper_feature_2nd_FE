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
            placeholder="Search companies by name..."
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
        <NotificationBell />

        <!-- Smart Suggestions (Light-bulb) -->
        <button
          class="p-2 text-gray-500 dark:text-gray-400 hover:text-neon-blue transition-colors relative"
          title="Smart Suggestions"
          @click.stop="toggleSmartSuggestions"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 3a1 1 0 011-1 9 9 0 019 9 9.003 9.003 0 01-7 8.717V21a1 1 0 01-1 1h-2a1 1 0 01-1-1v-1.283A9.003 9.003 0 013 11a9 9 0 018-9z" />
          </svg>
        </button>

        <!-- Profile Section with Dropdown -->
        <div 
          class="relative flex items-center space-x-3 cursor-pointer"
          ref="profileDropdownRef"
          @click.stop="toggleProfileDropdown"
        >
          <img 
            v-if="branding.logo_url" 
            :src="branding.logo_url" 
            alt="Brand Logo" 
            class="h-8 w-8 rounded-full border border-dark-600" 
          />
          <span class="text-white font-semibold text-base">
            {{ userProfile?.full_name || authStore.user?.name || 'User' }}
          </span>
          <svg 
            class="w-4 h-4 text-white ml-1 transition-transform"
            :class="{ 'rotate-180': showProfileDropdown }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          <div 
            v-if="showProfileDropdown" 
            class="absolute right-0 top-full mt-2 w-56 bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden"
          >
            <ul>
              <li>
                <router-link 
                  to="/settings?section=profile" 
                  class="block px-4 py-3 text-white hover:bg-dark-800 transition-colors" 
                  @click="closeProfileDropdown"
                >
                  Profile
                </router-link>
              </li>
              <li>
                <router-link 
                  to="/settings?section=notifications" 
                  class="block px-4 py-3 text-white hover:bg-dark-800 transition-colors" 
                  @click="closeProfileDropdown"
                >
                  Settings
                </router-link>
              </li>
              <li>
                <router-link 
                  to="/settings?section=branding" 
                  class="block px-4 py-3 text-white hover:bg-dark-800 transition-colors" 
                  @click="closeProfileDropdown"
                >
                  Branding
                </router-link>
              </li>
              <li class="border-t border-dark-700 mt-1">
                <button 
                  @click.stop="handleLogout" 
                  class="block w-full text-left px-4 py-3 text-red-400 hover:bg-dark-800 transition-colors"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Smart Suggestions Panel -->
  <SmartSuggestionsPanel
    :is-open="showSmartSuggestions"
    @close="showSmartSuggestions = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBrandingStore } from '@/stores/branding'
import { useAuthStore } from '@/stores/auth'
import { useCompaniesStore } from '@/stores/companies'
import NotificationBell from './NotificationBell.vue'
import { authenticatedFetch } from '@/utils/auth-requests'
import SmartSuggestionsPanel from '@/components/Common/SmartSuggestionsPanel.vue'

const router = useRouter()
const authStore = useAuthStore()
const companiesStore = useCompaniesStore()

const searchQuery = ref('')
const profileDropdownRef = ref<HTMLElement | null>(null)

const branding = useBrandingStore()

const searchResults = ref<any[]>([])
const searchLoading = ref(false)
const searchError = ref('')
const showDropdown = ref(false)
const highlightedIndex = ref(-1)
let searchTimeout: any = null

// User profile state
const userProfile = ref<{ full_name?: string; email?: string; role?: string } | null>(null)
const showProfileDropdown = ref(false)

// Smart Suggestions
const showSmartSuggestions = ref(false)

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

    // Extra client-side guard: only show results whose NAME (or domain) visibly matches the query
    const normalized = query.trim().toLowerCase()
    const filtered = companies.filter((c: any) => {
      const name = (c.name || c.company_name || '').toLowerCase()
      const domain = (c.domain || c.website || '').toLowerCase()
      return (
        (name && name.includes(normalized)) ||
        (domain && domain.includes(normalized))
      )
    })

    searchResults.value = filtered
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

// Load user profile
const loadUserProfile = async () => {
  try {
    const res = await authenticatedFetch('/api/v1/users/user/profile')
    if (res.ok) {
      userProfile.value = await res.json()
    }
  } catch (e) {
    console.error('Failed to load user profile:', e)
  }
}

// Toggle profile dropdown
const toggleProfileDropdown = () => {
  showProfileDropdown.value = !showProfileDropdown.value
  if (showProfileDropdown.value && !userProfile.value) {
    loadUserProfile()
  }
}

// Close profile dropdown
const closeProfileDropdown = () => {
  showProfileDropdown.value = false
}

// Handle click outside dropdown
const handleClickOutside = (event: MouseEvent) => {
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(event.target as Node)) {
    showProfileDropdown.value = false
  }
}

const toggleSmartSuggestions = () => {
  showSmartSuggestions.value = !showSmartSuggestions.value
}

// Handle logout
const handleLogout = async () => {
  try {
    // Call logout API
    if (authStore.token) {
      try {
        await authenticatedFetch('/api/v1/auth/logout', {
          method: 'POST'
        })
      } catch (e) {
        console.error('Logout API call failed:', e)
        // Continue with logout even if API fails
      }
    }
    
    // Clear local state
    closeProfileDropdown()
    await authStore.logout()
    
    // Redirect to login
    router.push('/login')
  } catch (e) {
    console.error('Logout failed:', e)
    // Still clear state and redirect
    closeProfileDropdown()
    await authStore.logout()
    router.push('/login')
  }
}

onMounted(() => {
  if (!branding.company_name) branding.fetchBranding()
  loadUserProfile()
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script> 