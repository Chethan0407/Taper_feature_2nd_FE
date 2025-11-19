<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p class="text-gray-500 dark:text-gray-400">Manage your account and organization settings</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- 1. User Profile (Top-Left) -->
          <div 
            ref="profileSectionRef"
            id="profile"
            class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl p-6 scroll-mt-8"
          >
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">User Profile</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input 
                  v-model="profile.name" 
                  type="text"
                  class="input-field w-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 focus:ring-blue-500 dark:focus:ring-neon-blue text-gray-900 dark:text-gray-100" 
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                <select 
                  v-model="profile.role"
                  class="input-field w-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 focus:ring-blue-500 dark:focus:ring-neon-blue text-gray-900 dark:text-gray-100"
                >
                  <option value="admin">Admin</option>
                  <option value="engineer">Engineer</option>
                  <option value="pm">PM</option>
                </select>
              </div>
              <div v-if="profile.email" class="text-sm text-gray-500 dark:text-gray-400">
                Email: {{ profile.email }}
              </div>
              <button 
                @click="updateProfile" 
                :disabled="profileLoading"
                class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="profileLoading">Updating...</span>
                <span v-else>Update Profile</span>
              </button>
              <div v-if="profileSuccess" class="text-green-500 text-sm text-center">Profile updated successfully!</div>
              <div v-if="profileError" class="text-red-500 text-sm text-center">{{ profileError }}</div>
            </div>
          </div>

          <!-- 2. API Keys (Top-Right) -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">API Keys</h2>
            <div class="space-y-4">
              <div v-if="apiKeysLoading" class="text-center text-gray-400 py-4">Loading...</div>
              <div v-else-if="apiKeysError" class="text-red-500 text-sm text-center py-4">{{ apiKeysError }}</div>
              <div v-else-if="apiKeys.length === 0" class="text-center py-8">
                <p class="text-gray-500 dark:text-gray-400 mb-4">No API keys found</p>
                <button 
                  @click="showGenerateModal = true"
                  class="btn-secondary"
                >
                  Generate New Key
                </button>
              </div>
              <div v-else class="space-y-3">
                <div 
                  v-for="key in apiKeys" 
                  :key="key.id"
                  class="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-gray-900 dark:text-white mb-1">{{ key.name || 'Unnamed Key' }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400 font-mono mb-2 break-all">
                        {{ key.key_masked || '••••••••••••••••••••' }}
                      </p>
                      <div class="text-xs text-gray-400 dark:text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                        <span v-if="key.created_at">Created: {{ formatDate(key.created_at) }}</span>
                        <span v-if="key.last_used_at">Last used: {{ formatDate(key.last_used_at) }}</span>
                        <span v-else>Never used</span>
                        <span v-if="key.expires_at" class="text-yellow-400 dark:text-yellow-500">Expires: {{ formatDate(key.expires_at) }}</span>
                      </div>
                    </div>
                    <div class="flex flex-col gap-2 flex-shrink-0">
                      <button 
                        @click="regenerateApiKey(key.id)"
                        :disabled="regeneratingKey === key.id"
                        class="text-sm text-blue-600 dark:text-neon-blue hover:text-blue-700 dark:hover:text-neon-blue/80 disabled:opacity-50 whitespace-nowrap"
                      >
                        {{ regeneratingKey === key.id ? 'Regenerating...' : 'Regenerate' }}
                      </button>
                      <button 
                        @click="deleteApiKey(key.id)"
                        :disabled="deletingKey === key.id"
                        class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 disabled:opacity-50 whitespace-nowrap"
                      >
                        {{ deletingKey === key.id ? 'Deleting...' : 'Delete' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                @click="showGenerateModal = true"
                :disabled="apiKeysLoading || rateLimitError"
                class="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate New Key
              </button>
              <div v-if="rateLimitError" class="text-red-500 text-sm text-center">
                {{ rateLimitError }}
              </div>
            </div>
          </div>

          <!-- 3. Notifications (Bottom-Left) -->
          <div 
            ref="notificationsSectionRef"
            id="notifications"
            class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl p-6 scroll-mt-8"
          >
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notifications</h2>
            <div v-if="notificationsLoading" class="text-center text-gray-400 py-4">Loading...</div>
            <div v-else-if="notificationsError" class="text-red-500 text-sm text-center py-4">{{ notificationsError }}</div>
            <div v-else class="space-y-4">
              <div 
                v-for="pref in notificationPreferences" 
                :key="pref.notification_type"
                class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-dark-600 last:border-0"
              >
                <div>
                  <p class="font-medium text-gray-900 dark:text-white capitalize">
                    {{ pref.notification_type }} notifications
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {{ getNotificationDescription(pref.notification_type) }}
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    class="sr-only peer" 
                    :checked="pref.is_enabled"
                    @change="toggleNotification(pref.notification_type, $event)"
                  >
                  <div class="w-11 h-6 bg-gray-200 dark:bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-neon-blue"></div>
                </label>
              </div>
              <button 
                @click="saveNotificationPreferences"
                :disabled="notificationsLoading || savingNotifications"
                class="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="savingNotifications">Saving...</span>
                <span v-else>Save Preferences</span>
              </button>
              <div v-if="notificationsSuccess" class="text-green-500 text-sm text-center">Preferences saved!</div>
            </div>
          </div>

          <!-- 4. Branding & Organization (Bottom-Right) -->
          <div 
            ref="brandingSectionRef"
            id="branding"
            class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl p-6 scroll-mt-8"
          >
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Branding & Organization</h2>
              <router-link 
                to="/settings/branding" 
                class="text-neon-blue hover:text-neon-blue/80 text-sm font-medium transition-colors"
              >
                Manage Branding →
              </router-link>
            </div>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
                <input 
                  v-model="branding.company_name" 
                  type="text"
                  class="input-field w-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 focus:ring-blue-500 dark:focus:ring-neon-blue text-gray-900 dark:text-gray-100"
                  placeholder="Enter company name"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo</label>
                <div v-if="branding.logo_url" class="mb-3">
                  <img 
                  :src="branding.logo_url" 
                  alt="Company Logo" 
                    class="w-24 h-24 object-contain rounded-lg border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-800"
                  />
                </div>
                <div class="flex items-center gap-3">
                  <label class="btn-secondary cursor-pointer">
                    <input 
                      type="file" 
                      accept=".png,.jpg,.jpeg,.gif,.svg,.webp"
                      @change="handleLogoChange"
                      class="hidden"
                    />
                    Upload Logo
                  </label>
                  <span v-if="logoUploading" class="text-sm text-gray-500">Uploading...</span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Allowed: PNG, JPG, JPEG, GIF, SVG, WEBP (Max 5MB)
                </p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color</label>
                  <div class="flex items-center gap-2">
                    <input 
                      v-model="branding.primary_color" 
                      type="color"
                      class="w-12 h-10 rounded border border-gray-200 dark:border-dark-600 cursor-pointer"
                    />
                    <input 
                      v-model="branding.primary_color" 
                      type="text"
                      class="input-field flex-1 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 text-gray-900 dark:text-gray-100"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secondary Color</label>
                  <div class="flex items-center gap-2">
                    <input 
                      v-model="branding.secondary_color" 
                      type="color"
                      class="w-12 h-10 rounded border border-gray-200 dark:border-dark-600 cursor-pointer"
                    />
                    <input 
                      v-model="branding.secondary_color" 
                      type="text"
                      class="input-field flex-1 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 text-gray-900 dark:text-gray-100"
                      placeholder="#10B981"
                    />
                  </div>
                </div>
              </div>

              <button 
                @click="saveBranding"
                :disabled="brandingLoading || logoUploading"
                class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="brandingLoading">Saving...</span>
                <span v-else>Save Branding</span>
              </button>
              <div v-if="brandingSuccess" class="text-green-500 text-sm text-center">Branding saved successfully!</div>
              <div v-if="brandingError" class="text-red-500 text-sm text-center">{{ brandingError }}</div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Generate API Key Modal -->
    <div 
      v-if="showGenerateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showGenerateModal = false"
    >
      <div class="bg-white dark:bg-dark-900 rounded-2xl p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Generate New API Key</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name (Optional)</label>
            <input 
              v-model="newKeyName"
              type="text"
              class="input-field w-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 text-gray-900 dark:text-gray-100"
              placeholder="My API Key"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiration Date (Optional)</label>
            <input 
              v-model="newKeyExpiration"
              type="datetime-local"
              class="input-field w-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div class="flex gap-3">
            <button @click="showGenerateModal = false" class="btn-secondary flex-1">Cancel</button>
            <button 
              @click="generateApiKey"
              :disabled="generatingKey"
              class="btn-primary flex-1 disabled:opacity-50"
            >
              {{ generatingKey ? 'Generating...' : 'Generate' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Show Generated Key Modal (only shown once) -->
    <div 
      v-if="showGeneratedKeyModal && generatedKey"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      @click.self="showGeneratedKeyModal = false"
    >
      <div class="bg-white dark:bg-dark-900 rounded-2xl p-6 max-w-2xl w-full border-2 border-neon-blue dark:border-neon-blue shadow-2xl">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your New API Key</h3>
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-600 rounded-lg p-4 mb-6">
          <p class="text-sm font-semibold text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            This key will only be shown once. Copy it now and store it securely!
          </p>
        </div>
        <div class="bg-gray-50 dark:bg-dark-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-dark-600">
          <div class="flex items-start gap-3">
            <code class="flex-1 text-sm text-gray-900 dark:text-gray-100 break-all font-mono select-all">{{ generatedKey }}</code>
            <button 
              @click="copyGeneratedKey($event)"
              class="btn-primary whitespace-nowrap flex-shrink-0"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
          </div>
        </div>
        <div class="flex gap-3">
          <button 
            @click="closeGeneratedKeyModal"
            class="btn-primary flex-1"
          >
            I've Copied It
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { onMounted, ref, watch, nextTick } from 'vue'
import { apiClient, parseApiError } from '@/utils/api-client'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Refs for section scrolling
const profileSectionRef = ref<HTMLElement | null>(null)
const notificationsSectionRef = ref<HTMLElement | null>(null)
const brandingSectionRef = ref<HTMLElement | null>(null)

// User Profile
const profile = ref({ name: '', email: '', role: 'engineer' })
const profileLoading = ref(false)
const profileSuccess = ref(false)
const profileError = ref('')

// API Keys
const apiKeys = ref<any[]>([])
const apiKeysLoading = ref(false)
const apiKeysError = ref('')
const showGenerateModal = ref(false)
const newKeyName = ref('')
const newKeyExpiration = ref('')
const generatingKey = ref(false)
const regeneratingKey = ref<string | null>(null)
const deletingKey = ref<string | null>(null)
const showGeneratedKeyModal = ref(false)
const generatedKey = ref('')
const rateLimitError = ref('')

// Notifications
const notificationPreferences = ref<Array<{ notification_type: string; is_enabled: boolean }>>([])
const notificationsLoading = ref(false)
const notificationsError = ref('')
const notificationsSuccess = ref(false)
const savingNotifications = ref(false)

// Branding
const branding = ref({
  company_name: '',
  logo_url: '',
  primary_color: '#3B82F6',
  secondary_color: '#10B981'
})
const brandingLoading = ref(false)
const brandingError = ref('')
const brandingSuccess = ref(false)
const logoFile = ref<File | null>(null)
const logoUploading = ref(false)

// Scroll to section based on query parameter
const scrollToSection = async (section: string) => {
  await nextTick()
  const sectionMap: Record<string, HTMLElement | null> = {
    profile: profileSectionRef.value,
    notifications: notificationsSectionRef.value,
    branding: brandingSectionRef.value
  }
  
  const element = sectionMap[section]
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // Highlight the section briefly
    element.classList.add('ring-2', 'ring-neon-blue', 'ring-opacity-50')
    setTimeout(() => {
      element.classList.remove('ring-2', 'ring-neon-blue', 'ring-opacity-50')
    }, 2000)
  }
}

// Watch for section query parameter
watch(() => route.query.section, (section) => {
  if (section && typeof section === 'string') {
    scrollToSection(section)
  }
}, { immediate: true })

// Load all data on mount
onMounted(async () => {
  await Promise.all([
    loadProfile(),
    loadAPIKeys(),
    loadNotifications(),
    loadBranding()
  ])
  
  // Check for section query parameter on mount
  const section = route.query.section
  if (section && typeof section === 'string') {
    scrollToSection(section)
  }
})

// ========== User Profile ==========
const loadProfile = async () => {
  try {
    profileLoading.value = true
    profileError.value = ''
    
    console.log('📋 Loading user profile...')
    
    let res: Response
    try {
      res = await apiClient('/users/user/profile')
    } catch (networkError: any) {
      console.error('❌ Network error loading profile:', networkError)
      profileError.value = 'Network error. Please check your connection and try again.'
      return
    }
    
    console.log('📋 Profile response:', {
      status: res.status,
      ok: res.ok,
      statusText: res.statusText,
      isNetworkError: (res as any).isNetworkError
    })
    
    // Check for network errors
    if ((res as any).isNetworkError) {
      profileError.value = 'Network error. Please check your connection and try again.'
      return
    }
    
    if (!res.ok) {
      // Handle 401 - don't redirect immediately, just show error
      if (res.status === 401 && (res as any).isAuthError) {
        profileError.value = 'Authentication failed. Please refresh the page or log in again.'
        console.error('❌ Profile load failed: 401 Unauthorized')
        return
      }
      
      // Try to get error message
      const errorMessage = await parseApiError(res, 'Failed to load profile')
      console.error('❌ Profile load failed:', errorMessage, 'Status:', res.status)
      profileError.value = errorMessage
      return
    }
    
    // Parse response
    try {
      const user = await res.json()
      console.log('✅ Profile loaded:', user)
      
      if (!user || typeof user !== 'object') {
        throw new Error('Invalid profile data received')
      }
      
      profile.value = {
        name: user.full_name || user.name || '',
        email: user.email || '',
        role: user.role || 'engineer'
      }
      profileError.value = '' // Clear any previous errors
    } catch (parseError: any) {
      console.error('❌ Failed to parse profile response:', parseError)
      profileError.value = parseError.message || 'Failed to parse profile data. Please try again.'
    }
  } catch (e: any) {
    console.error('❌ Profile load error:', e)
    profileError.value = e.message || 'Failed to load profile'
  } finally {
    profileLoading.value = false
  }
}

const updateProfile = async () => {
  try {
    profileLoading.value = true
    profileError.value = ''
    profileSuccess.value = false

    // Validate role
    const allowedRoles = ['admin', 'engineer', 'pm']
    if (!allowedRoles.includes(profile.value.role)) {
      throw new Error('Invalid role. Must be admin, engineer, or pm')
    }

    const body: any = {}
    if (profile.value.name) body.name = profile.value.name
    if (profile.value.role) body.role = profile.value.role

    const res = await apiClient('/users/user/profile', {
      method: 'PUT',
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const errorMessage = await parseApiError(res, 'Failed to update profile')
      throw new Error(errorMessage)
    }

    await loadProfile()
    await authStore.checkAuth() // Refresh global user
    profileSuccess.value = true
    setTimeout(() => { profileSuccess.value = false }, 3000)
  } catch (e: any) {
    profileError.value = e.message || 'Failed to update profile'
  } finally {
    profileLoading.value = false
  }
}

// ========== API Keys ==========
const loadAPIKeys = async () => {
  try {
    apiKeysLoading.value = true
    apiKeysError.value = ''
    rateLimitError.value = ''
    const res = await apiClient('/settings/api-keys/')
    if (!res.ok) {
      // Handle 401 - don't redirect immediately, just show error
      if (res.status === 401 && (res as any).isAuthError) {
        apiKeysError.value = 'Authentication failed. Please refresh the page or log in again.'
        return
      }
      const errorMessage = await parseApiError(res, 'Failed to load API keys')
      throw new Error(errorMessage)
    }
    apiKeys.value = await res.json()
  } catch (e: any) {
    apiKeysError.value = e.message || 'Failed to load API keys'
  } finally {
    apiKeysLoading.value = false
  }
}

const generateApiKey = async () => {
  try {
    generatingKey.value = true
    rateLimitError.value = ''
    apiKeysError.value = ''
    
    const body: any = {}
    if (newKeyName.value?.trim()) body.name = newKeyName.value.trim()
    if (newKeyExpiration.value) {
      body.expires_at = new Date(newKeyExpiration.value).toISOString()
    }

    const res = await apiClient('/settings/api-keys/', {
      method: 'POST',
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      if (res.status === 429) {
        rateLimitError.value = 'Rate limit exceeded. Please wait 1 minute before generating another key.'
      } else {
        const errorMessage = await parseApiError(res, 'Failed to generate API key')
        rateLimitError.value = errorMessage
      }
      return
    }

    const newKey = await res.json()
    // Store the full key - this is the only time it's shown
    generatedKey.value = newKey.key
    showGeneratedKeyModal.value = true
    showGenerateModal.value = false
    newKeyName.value = ''
    newKeyExpiration.value = ''
    await loadAPIKeys()
  } catch (e: any) {
    rateLimitError.value = e.message || 'Failed to generate API key'
    console.error('Failed to generate API key:', e)
  } finally {
    generatingKey.value = false
  }
}

const regenerateApiKey = async (keyId: string) => {
  if (!confirm('Are you sure? This will invalidate the old key and create a new one. The old key will stop working immediately.')) {
    return
  }

  try {
    regeneratingKey.value = keyId
    rateLimitError.value = ''
    apiKeysError.value = ''
    
    const res = await apiClient(`/settings/api-keys/${keyId}/regenerate`, {
      method: 'PUT'
    })

    if (!res.ok) {
      if (res.status === 429) {
        rateLimitError.value = 'Rate limit exceeded. Please wait 1 minute before regenerating.'
      } else {
        const errorMessage = await parseApiError(res, 'Failed to regenerate API key')
        apiKeysError.value = errorMessage
      }
      return
    }

    const newKey = await res.json()
    // Store the full key - this is the only time it's shown
    generatedKey.value = newKey.key
    showGeneratedKeyModal.value = true
    await loadAPIKeys()
  } catch (e: any) {
    apiKeysError.value = e.message || 'Failed to regenerate API key'
    console.error('Failed to regenerate API key:', e)
  } finally {
    regeneratingKey.value = null
  }
}

const deleteApiKey = async (keyId: string) => {
  if (!confirm('Are you sure you want to delete this API key? It will no longer work and cannot be recovered.')) {
    return
  }

  try {
    deletingKey.value = keyId
    apiKeysError.value = ''
    
    const res = await apiClient(`/settings/api-keys/${keyId}`, {
      method: 'DELETE'
    })

    if (!res.ok) {
      const errorMessage = await parseApiError(res, 'Failed to delete API key')
      apiKeysError.value = errorMessage
      return
    }

    await loadAPIKeys()
  } catch (e: any) {
    apiKeysError.value = e.message || 'Failed to delete API key'
    console.error('Failed to delete API key:', e)
  } finally {
    deletingKey.value = null
  }
}

const copyGeneratedKey = async (event?: Event) => {
  try {
    await navigator.clipboard.writeText(generatedKey.value)
    // Show temporary success message
    if (event) {
      const button = event.target as HTMLElement
      if (button) {
        const originalText = button.textContent
        button.textContent = 'Copied!'
        button.classList.add('bg-green-600', 'dark:bg-green-600')
        setTimeout(() => {
          if (button.textContent === 'Copied!') {
            button.textContent = originalText
            button.classList.remove('bg-green-600', 'dark:bg-green-600')
          }
        }, 2000)
      }
    }
  } catch (e) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = generatedKey.value
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      alert('API key copied to clipboard!')
    } catch (err) {
      alert('Failed to copy. Please copy manually.')
    }
    document.body.removeChild(textArea)
  }
}

const closeGeneratedKeyModal = () => {
  showGeneratedKeyModal.value = false
  generatedKey.value = ''
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateString
  }
}

// ========== Notifications ==========
const loadNotifications = async () => {
  try {
    notificationsLoading.value = true
    notificationsError.value = ''
    const res = await apiClient('/settings/notifications/')
    if (!res.ok) {
      // Handle 401 - don't redirect immediately, just show error
      if (res.status === 401 && (res as any).isAuthError) {
        notificationsError.value = 'Authentication failed. Please refresh the page or log in again.'
        return
      }
      const errorMessage = await parseApiError(res, 'Failed to load notifications')
      throw new Error(errorMessage)
    }
    const data = await res.json()
    notificationPreferences.value = data.preferences || []
  } catch (e: any) {
    notificationsError.value = e.message || 'Failed to load notifications'
  } finally {
    notificationsLoading.value = false
  }
}

const toggleNotification = async (type: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const enabled = target.checked

  // Optimistic update
  const pref = notificationPreferences.value.find(p => p.notification_type === type)
  if (pref) {
    pref.is_enabled = enabled
  }

  try {
    // PATCH to update single preference
    const res = await apiClient('/settings/notifications/', {
      method: 'PATCH',
      body: JSON.stringify([{
        notification_type: type,
        is_enabled: enabled
      }])
    })

    if (!res.ok) {
      // Revert on error
      if (pref) pref.is_enabled = !enabled
      const errorMessage = await parseApiError(res, 'Failed to update notification')
      throw new Error(errorMessage)
    }
  } catch (e: any) {
    // Revert on error
    if (pref) pref.is_enabled = !enabled
    alert(`Failed to update notification: ${e.message}`)
  }
}

const saveNotificationPreferences = async () => {
  try {
    savingNotifications.value = true
    notificationsError.value = ''
    notificationsSuccess.value = false

    const res = await apiClient('/settings/notifications/', {
      method: 'PUT',
      body: JSON.stringify(notificationPreferences.value)
    })

    if (!res.ok) {
      const errorMessage = await parseApiError(res, 'Failed to save preferences')
      throw new Error(errorMessage)
    }

    notificationsSuccess.value = true
    setTimeout(() => { notificationsSuccess.value = false }, 3000)
  } catch (e: any) {
    notificationsError.value = e.message || 'Failed to save preferences'
  } finally {
    savingNotifications.value = false
  }
}

const getNotificationDescription = (type: string) => {
  const descriptions: Record<string, string> = {
    comment: 'Get notified when someone comments on your items',
    update: 'Get notified when items you follow are updated',
    mention: 'Get notified when you are mentioned'
  }
  return descriptions[type] || ''
}

// ========== Branding ==========
const loadBranding = async () => {
  try {
    brandingLoading.value = true
    brandingError.value = ''
    const res = await apiClient('/settings/branding/')
    if (!res.ok) {
      // Handle 401 - don't redirect immediately, just show error
      if (res.status === 401 && (res as any).isAuthError) {
        brandingError.value = 'Authentication failed. Please refresh the page or log in again.'
        return
      }
      const errorMessage = await parseApiError(res, 'Failed to load branding')
      throw new Error(errorMessage)
    }
    const data = await res.json()
    branding.value = {
      company_name: data.company_name || '',
      logo_url: data.logo_url || '',
      primary_color: data.primary_color || '#3B82F6',
      secondary_color: data.secondary_color || '#10B981'
    }
  } catch (e: any) {
    brandingError.value = e.message || 'Failed to load branding'
  } finally {
    brandingLoading.value = false
  }
}

const handleLogoChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Allowed: PNG, JPG, JPEG, GIF, SVG, WEBP')
      return
    }

    logoFile.value = file
    await uploadLogo()
  }
}

const uploadLogo = async () => {
  if (!logoFile.value) return

  try {
    logoUploading.value = true
    brandingError.value = ''

    const formData = new FormData()
    formData.append('file', logoFile.value)

    const res = await apiClient('/settings/branding/logo', {
      method: 'POST',
      body: formData
    })

    if (!res.ok) {
      const errorMessage = await parseApiError(res, 'Failed to upload logo')
      throw new Error(errorMessage)
    }

    const data = await res.json()
    branding.value.logo_url = data.logo_url
    logoFile.value = null
  } catch (e: any) {
    brandingError.value = e.message || 'Failed to upload logo'
  } finally {
    logoUploading.value = false
  }
}

const saveBranding = async () => {
  try {
  brandingLoading.value = true
  brandingError.value = ''
  brandingSuccess.value = false

    // If logo file is selected but not uploaded, upload it first
    if (logoFile.value) {
      await uploadLogo()
    }

    const body: any = {}
    if (branding.value.company_name) body.company_name = branding.value.company_name
    if (branding.value.logo_url) body.logo_url = branding.value.logo_url
    if (branding.value.primary_color) body.primary_color = branding.value.primary_color
    if (branding.value.secondary_color) body.secondary_color = branding.value.secondary_color

    const res = await apiClient('/settings/branding/', {
      method: 'PUT',
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const errorMessage = await parseApiError(res, 'Failed to save branding')
      throw new Error(errorMessage)
    }

    await loadBranding()
    brandingSuccess.value = true
    setTimeout(() => { brandingSuccess.value = false }, 3000)
  } catch (e: any) {
    brandingError.value = e.message || 'Failed to save branding'
  } finally {
    brandingLoading.value = false
  }
}
</script> 
