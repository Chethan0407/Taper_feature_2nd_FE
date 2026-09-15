<template>
  <header class="sticky top-0 z-20 border-b border-slate-300/70 bg-[#f7fafc]/90 px-6 py-4 shadow-sm backdrop-blur-xl dark:border-dark-700/80 dark:bg-dark-900/80 dark:shadow-none">
    <div class="flex items-center justify-between">
      <!-- Branding Logo and Name -->
      <div class="flex items-center mr-8">
        <img
          v-if="branding.logo_url"
          :src="branding.logo_url"
          alt="Logo"
          class="mr-4 box-border h-10 w-10 shrink-0 rounded-lg border border-gray-200 bg-white object-contain p-1.5 dark:border-dark-600 dark:bg-dark-800"
          width="40"
          height="40"
        />
        <span class="text-xl font-bold tracking-wide text-gray-900 dark:text-white">{{ branding.company_name }}</span>
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
            @focus="showDropdown = !!(searchResults?.length)"
            @blur="handleSearchBlur"
            @keydown="handleKeydown"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <kbd class="inline-flex items-center rounded border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-400">
              ⌘K
            </kbd>
          </div>
          <!-- Results Dropdown -->
          <div
            v-if="showDropdown"
            class="absolute left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-dark-700 dark:bg-dark-900"
          >
            <div v-if="searchLoading" class="p-4 text-gray-500 dark:text-gray-400">Searching...</div>
            <div v-else-if="searchError" class="p-4 text-red-600 dark:text-red-400">{{ searchError }}</div>
            <div v-else-if="!searchResults?.length" class="p-4 text-gray-500 dark:text-gray-400">No companies found</div>
            <div v-else>
              <ul>
                <li v-for="(item, idx) in (searchResults || [])" :key="item.id"
                  class="flex cursor-pointer flex-col p-3 hover:bg-gray-100 dark:hover:bg-dark-800"
                  :class="{ 'bg-gray-100 dark:bg-dark-700': idx === highlightedIndex }"
                  @mousedown.prevent="handleResultClick(item)"
                  @mouseenter="handleResultMouseEnter(idx)"
                >
                  <span class="font-medium text-gray-900 dark:text-white">{{ item.name }}</span>
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
            v-if="userAvatarUrl"
            :src="userAvatarUrl"
            alt="Profile photo"
            class="h-8 w-8 shrink-0 rounded-full border border-gray-200 object-cover dark:border-dark-600"
            width="32"
            height="32"
            aria-hidden="true"
          />
          <div
            v-else
            class="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gradient-to-br from-neon-blue to-neon-purple text-xs font-semibold text-white dark:border-dark-600"
            aria-hidden="true"
          >
            {{ profileInitials }}
          </div>
          <span class="text-base font-semibold text-gray-900 dark:text-white">
            {{ userProfile?.full_name || authStore.user?.name || 'User' }}
          </span>
          <svg 
            class="ml-1 h-4 w-4 text-gray-600 transition-transform dark:text-white"
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
              <li v-if="authStore.canManageDataTransfer">
                <router-link
                  to="/settings?section=data"
                  class="block px-4 py-3 text-white hover:bg-dark-800 transition-colors"
                  data-testid="header-nav-data"
                  @click="closeProfileDropdown"
                >
                  Data
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBrandingStore } from '@/stores/branding'
import { useAuthStore } from '@/stores/auth'
import { useCompaniesStore } from '@/stores/companies'
import NotificationBell from './NotificationBell.vue'
import { authenticatedFetch } from '@/utils/auth-requests'
import SmartSuggestionsPanel from '@/components/Common/SmartSuggestionsPanel.vue'
import { statusBadgeClass } from '@/utils/status-badge'

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

const profileInitials = computed(() => {
  const name = String(userProfile.value?.full_name || authStore.user?.name || authStore.user?.email || 'U')
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
})

const userAvatarUrl = computed(
  () => authStore.user?.avatar || authStore.user?.avatar_url || ''
)

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
    const list = Array.isArray(companies) ? companies : []

    // Extra client-side guard: only show results whose NAME (or domain) visibly matches the query
    const normalized = query.trim().toLowerCase()
    const filtered = list.filter((c: any) => {
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
  return statusBadgeClass(status)
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