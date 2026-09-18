<template>
  <div class="min-h-screen app-page">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <div class="mb-8 page-enter">
          <h1 class="page-title-gradient mb-1">Settings</h1>
          <p class="page-subtitle">Manage your account and organization settings</p>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- 1. User Profile -->
          <section
            ref="profileSectionRef"
            id="profile"
            class="settings-card scroll-mt-8"
          >
            <div class="settings-card-body">
              <div>
                <h2 class="module-section-title text-lg">User Profile</h2>
                <p class="mt-1 text-sm text-slate-500 dark:text-gray-400">Name, role, photo, and account email</p>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">Profile photo</label>
                  <div class="flex flex-wrap items-center gap-4">
                    <div
                      class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-gradient-to-br from-neon-blue to-neon-purple text-lg font-semibold text-white dark:border-dark-600"
                      title="Current photo"
                    >
                      <img
                        v-if="currentAvatarUrl"
                        :src="currentAvatarUrl"
                        alt="Current avatar"
                        class="h-full w-full object-cover"
                      />
                      <span v-else>{{ profileInitials }}</span>
                    </div>
                    <div
                      v-if="avatarPreviewUrl"
                      class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-neon-blue/50 bg-slate-100 dark:bg-dark-800"
                      title="Preview"
                    >
                      <img
                        :src="avatarPreviewUrl"
                        alt="Preview"
                        class="h-full w-full object-cover"
                      />
                    </div>
                    <div class="flex min-w-0 flex-col gap-2">
                      <div class="flex flex-wrap items-center gap-2">
                        <label class="btn-secondary cursor-pointer px-4 py-2 text-sm">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/gif,image/webp"
                            class="hidden"
                            @change="handleAvatarChange"
                          />
                          Choose photo
                        </label>
                        <button
                          type="button"
                          class="btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                          :disabled="!avatarFile || avatarUploading"
                          @click="uploadAvatar"
                        >
                          <span v-if="avatarUploading">Uploading…</span>
                          <span v-else>Upload</span>
                        </button>
                      </div>
                      <p class="text-xs text-slate-500 dark:text-gray-400">
                        PNG, JPG, GIF, WEBP · max 5MB
                      </p>
                      <p v-if="avatarSuccess" class="text-sm text-emerald-500">Photo updated.</p>
                      <p v-if="avatarError" class="text-sm text-red-500">{{ avatarError }}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">Name</label>
                  <input
                    v-model="profile.name"
                    type="text"
                    class="input-field w-full"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">Role</label>
                  <select v-model="profile.role" class="input-field w-full">
                    <option value="admin">Admin</option>
                    <option value="engineer">Engineer</option>
                    <option value="pm">PM</option>
                  </select>
                </div>
                <p v-if="profile.email" class="text-sm text-slate-500 dark:text-gray-400">
                  Email · {{ profile.email }}
                </p>
                <p v-if="profileSuccess" class="text-sm text-emerald-500">Profile updated successfully!</p>
                <p v-if="profileError" class="text-sm text-red-500">{{ profileError }}</p>
              </div>
            </div>
            <div class="settings-card-footer">
              <button
                type="button"
                class="btn-primary px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="profileLoading"
                @click="updateProfile"
              >
                <span v-if="profileLoading">Updating…</span>
                <span v-else>Update Profile</span>
              </button>
            </div>
          </section>

          <!-- 2. API Keys -->
          <section class="settings-card">
            <div class="settings-card-body">
              <div>
                <h2 class="module-section-title text-lg">API Keys</h2>
                <p class="mt-1 text-sm text-slate-500 dark:text-gray-400">Generate and manage access keys</p>
              </div>
              <div v-if="apiKeysLoading" class="py-6 text-center text-sm text-slate-400">Loading…</div>
              <div v-else-if="apiKeysError" class="py-4 text-center text-sm text-red-500">{{ apiKeysError }}</div>
              <div v-else-if="apiKeys.length === 0" class="rounded-xl border border-dashed border-slate-300 py-8 text-center dark:border-dark-600">
                <p class="mb-1 text-sm text-slate-500 dark:text-gray-400">No API keys yet</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="key in apiKeys"
                  :key="key.id"
                  class="rounded-xl border border-slate-200 px-4 py-3 dark:border-dark-600 dark:bg-dark-950/50"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0 flex-1">
                      <p class="mb-1 font-medium text-slate-900 dark:text-white">{{ key.name || 'Unnamed Key' }}</p>
                      <p class="mb-2 break-all font-mono text-xs text-slate-500 dark:text-gray-400">
                        {{ key.key_masked || '••••••••••••••••••••' }}
                      </p>
                      <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400 dark:text-gray-500">
                        <span v-if="key.created_at">Created {{ formatDate(key.created_at) }}</span>
                        <span v-if="key.last_used_at">Last used {{ formatDate(key.last_used_at) }}</span>
                        <span v-else>Never used</span>
                        <span v-if="key.expires_at" class="text-amber-500">Expires {{ formatDate(key.expires_at) }}</span>
                      </div>
                    </div>
                    <div class="flex shrink-0 flex-col items-end gap-1.5">
                      <button
                        type="button"
                        class="text-sm text-neon-blue hover:underline disabled:opacity-50"
                        :disabled="regeneratingKey === key.id"
                        @click="regenerateApiKey(key.id)"
                      >
                        {{ regeneratingKey === key.id ? 'Regenerating…' : 'Regenerate' }}
                      </button>
                      <button
                        type="button"
                        class="text-sm text-red-500 hover:underline disabled:opacity-50"
                        :disabled="deletingKey === key.id"
                        @click="deleteApiKey(key.id)"
                      >
                        {{ deletingKey === key.id ? 'Deleting…' : 'Delete' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="rateLimitError" class="text-center text-sm text-red-500">{{ rateLimitError }}</p>
            </div>
            <div class="settings-card-footer">
              <button
                type="button"
                class="btn-secondary px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="apiKeysLoading || !!rateLimitError"
                @click="showGenerateModal = true"
              >
                Generate New Key
              </button>
            </div>
          </section>

          <!-- 3. Notifications -->
          <section
            ref="notificationsSectionRef"
            id="notifications"
            class="settings-card scroll-mt-8"
          >
            <div class="settings-card-body">
              <div>
                <h2 class="module-section-title text-lg">Notifications</h2>
                <p class="mt-1 text-sm text-slate-500 dark:text-gray-400">Choose what you get alerted about</p>
              </div>
              <div v-if="notificationsLoading" class="py-6 text-center text-sm text-slate-400">Loading…</div>
              <div v-else-if="notificationsError" class="py-4 text-center text-sm text-red-500">{{ notificationsError }}</div>
              <div v-else class="divide-y divide-slate-200 dark:divide-dark-700">
                <div
                  v-for="pref in notificationPreferences"
                  :key="pref.notification_type"
                  class="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                >
                  <div class="min-w-0">
                    <p class="font-medium capitalize text-slate-900 dark:text-white">
                      {{ pref.notification_type }} notifications
                    </p>
                    <p class="mt-0.5 text-sm text-slate-500 dark:text-gray-400">
                      {{ getNotificationDescription(pref.notification_type) }}
                    </p>
                  </div>
                  <label class="relative inline-flex shrink-0 cursor-pointer items-center">
                    <input
                      type="checkbox"
                      class="peer sr-only"
                      :checked="pref.is_enabled"
                      @change="toggleNotification(pref.notification_type, $event)"
                    >
                    <div class="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-neon-blue peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-dark-600"></div>
                  </label>
                </div>
              </div>
              <p v-if="notificationsSuccess" class="text-sm text-emerald-500">Preferences saved!</p>
            </div>
            <div class="settings-card-footer">
              <button
                type="button"
                class="btn-primary px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="notificationsLoading || savingNotifications"
                @click="saveNotificationPreferences"
              >
                <span v-if="savingNotifications">Saving…</span>
                <span v-else>Save Preferences</span>
              </button>
            </div>
          </section>

          <!-- 4. Branding & Organization -->
          <section
            ref="brandingSectionRef"
            id="branding"
            class="settings-card scroll-mt-8"
          >
            <div class="settings-card-body">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h2 class="module-section-title text-lg">Branding & Organization</h2>
                  <p class="mt-1 text-sm text-slate-500 dark:text-gray-400">Logo for your workspace</p>
                </div>
                <router-link
                  to="/settings/branding"
                  class="shrink-0 text-sm font-medium text-neon-blue hover:underline"
                >
                  Manage →
                </router-link>
              </div>
              <div class="space-y-5">
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">Company Name</label>
                  <input
                    v-model="branding.company_name"
                    type="text"
                    class="input-field w-full cursor-not-allowed opacity-70"
                    placeholder="Company name is managed in Companies"
                    readonly
                  />
                </div>

                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">Logo</label>
                  <div v-if="branding.logo_url" class="mb-3">
                    <img
                      :src="branding.logo_url"
                      alt="Company Logo"
                      class="h-20 w-20 rounded-lg border border-slate-200 object-contain dark:border-dark-600 dark:bg-dark-800"
                    />
                  </div>
                  <div class="flex items-center gap-3">
                    <label class="btn-secondary cursor-pointer px-4 py-2 text-sm">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.gif,.svg,.webp"
                        class="hidden"
                        @change="handleLogoChange"
                      />
                      Upload Logo
                    </label>
                    <span v-if="logoUploading" class="text-sm text-slate-500">Uploading…</span>
                  </div>
                  <p class="mt-2 text-xs text-slate-500 dark:text-gray-400">
                    PNG, JPG, GIF, SVG, WEBP · max 5MB
                  </p>
                </div>

                <p v-if="brandingSuccess" class="text-sm text-emerald-500">Branding saved successfully!</p>
                <p v-if="brandingError" class="text-sm text-red-500">{{ brandingError }}</p>
              </div>
            </div>
            <div class="settings-card-footer">
              <button
                type="button"
                class="btn-primary px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="brandingLoading || logoUploading"
                @click="saveBranding"
              >
                <span v-if="brandingLoading">Saving…</span>
                <span v-else>Save Branding</span>
              </button>
            </div>
          </section>
        </div>

        <div class="mt-6 page-enter">
          <SettingsSecurityPanel />
        </div>

        <div class="mt-6 page-enter">
          <SettingsIntegrationsPanel />
        </div>

        <!-- Admin / superuser data transfer (header: Settings → Data) -->
        <div ref="dataSectionRef" class="mt-6 page-enter">
          <SettingsDataTransfer />
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

    <!-- API Key Delete Confirmation Modal -->
    <Transition name="modal">
      <div v-if="showDeleteConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click.self="closeDeleteConfirmModal">
        <div class="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all">
          <!-- Icon -->
          <div class="flex items-center justify-center mb-4">
            <div class="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          </div>
          
          <!-- Title -->
          <h3 class="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Delete API Key
          </h3>
          
          <!-- Message -->
          <p class="text-gray-600 dark:text-gray-400 text-center mb-6">
            Are you sure you want to delete this API key? It will no longer work and cannot be recovered.
          </p>
          
          <!-- Buttons -->
          <div class="flex items-center justify-end space-x-3">
            <button
              @click="closeDeleteConfirmModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleDeleteConfirm"
              class="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import SettingsDataTransfer from '@/components/Common/SettingsDataTransfer.vue'
import SettingsSecurityPanel from '@/components/Settings/SettingsSecurityPanel.vue'
import SettingsIntegrationsPanel from '@/components/Settings/SettingsIntegrationsPanel.vue'
import { onMounted, onActivated, onUnmounted, ref, computed, watch, nextTick } from 'vue'
import { apiClient, parseApiError } from '@/utils/api-client'
import { useAuthStore } from '@/stores/auth'
import { useBrandingStore } from '@/stores/branding'
import { useRouter, useRoute } from 'vue-router'
import { applyBrandTheme } from '@/utils/brand-theme'

const authStore = useAuthStore()
const brandingStore = useBrandingStore()
const router = useRouter()
const route = useRoute()

// Refs for section scrolling
const profileSectionRef = ref<HTMLElement | null>(null)
const notificationsSectionRef = ref<HTMLElement | null>(null)
const brandingSectionRef = ref<HTMLElement | null>(null)
const dataSectionRef = ref<HTMLElement | null>(null)

// User Profile
const profile = ref({ name: '', email: '', role: 'engineer' })
const profileLoading = ref(false)
const profileSuccess = ref(false)
const profileError = ref('')

const avatarFile = ref<File | null>(null)
const avatarPreviewUrl = ref<string | null>(null)
const avatarUploading = ref(false)
const avatarSuccess = ref(false)
const avatarError = ref('')

const currentAvatarUrl = computed(
  () => authStore.user?.avatar || authStore.user?.avatar_url || ''
)

const profileInitials = computed(() => {
  const name = (profile.value.name || profile.value.email || 'U').trim()
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
})

const revokeAvatarPreview = () => {
  if (avatarPreviewUrl.value) {
    URL.revokeObjectURL(avatarPreviewUrl.value)
    avatarPreviewUrl.value = null
  }
}

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

// Delete confirmation modal
const showDeleteConfirmModal = ref(false)
const keyToDelete = ref<string | null>(null)

// Notifications
const notificationPreferences = ref<Array<{ notification_type: string; is_enabled: boolean }>>([])
const notificationsLoading = ref(false)
const notificationsError = ref('')
const notificationsSuccess = ref(false)
const savingNotifications = ref(false)

// Branding (local edit state mirrors global branding store)
const branding = ref({
  company_name: '',
  logo_url: '',
  primary_color: '#0f766e',
  secondary_color: '#d97706'
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
    // Legacy ?section=appearance links land on profile (theme is dark-only now)
    appearance: profileSectionRef.value,
    notifications: notificationsSectionRef.value,
    branding: brandingSectionRef.value,
    data: dataSectionRef.value,
    'data-transfer': dataSectionRef.value,
  }

  const element =
    sectionMap[section] ||
    (typeof document !== 'undefined' ? document.getElementById(section) : null)
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

// Load all data function (reusable)
const loadAllData = async () => {
  try {
    console.log('📋 Loading all Settings page data...')
    await Promise.all([
      loadProfile(),
      loadAPIKeys(),
      loadNotifications(),
      loadBranding()
    ])
    console.log('✅ All Settings page data loaded')
  } catch (error) {
    console.error('❌ Error loading Settings page data:', error)
  }
}

// Load all data on mount
onMounted(async () => {
  await loadAllData()

  // Check for section query parameter on mount
  const section = route.query.section
  if (section && typeof section === 'string') {
    scrollToSection(section)
  }
})

// Reload data when component is activated (when navigating back)
onActivated(async () => {
  console.log('🔄 Settings page activated, reloading data...')
  // Only reload if data seems stale or missing
  if (!profile.value.email && !profileLoading.value) {
    await loadAllData()
  }
  
  // Check for section query parameter
  const section = route.query.section
  if (section && typeof section === 'string') {
    await nextTick()
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
      profileLoading.value = false
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
      const avatar = user.avatar_url || user.avatar
      if (typeof avatar === 'string' && avatar.trim()) {
        authStore.setUserAvatar(avatar.trim())
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

const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  avatarError.value = ''
  avatarSuccess.value = false
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    avatarError.value = 'File size must be less than 5MB'
    target.value = ''
    return
  }

  const allowed = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
  if (!allowed.includes(file.type)) {
    avatarError.value = 'Invalid file type. Allowed: PNG, JPG, GIF, WEBP'
    target.value = ''
    return
  }

  revokeAvatarPreview()
  avatarFile.value = file
  avatarPreviewUrl.value = URL.createObjectURL(file)
  target.value = ''
}

const uploadAvatar = async () => {
  if (!avatarFile.value) return

  try {
    avatarUploading.value = true
    avatarError.value = ''
    avatarSuccess.value = false

    const formData = new FormData()
    formData.append('file', avatarFile.value)

    const res = await apiClient('/settings/profile/avatar', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const errorMessage = await parseApiError(res, 'Failed to upload photo')
      throw new Error(errorMessage)
    }

    const data = await res.json()
    const url = (data.avatar_url || data.avatar || '').trim()
    if (!url) throw new Error('Upload succeeded but no avatar URL returned')

    authStore.setUserAvatar(url)
    revokeAvatarPreview()
    avatarFile.value = null
    avatarSuccess.value = true
    setTimeout(() => { avatarSuccess.value = false }, 3000)
  } catch (e: any) {
    avatarError.value = e.message || 'Failed to upload photo'
  } finally {
    avatarUploading.value = false
  }
}

onUnmounted(() => {
  revokeAvatarPreview()
})

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

const deleteApiKey = (keyId: string) => {
  keyToDelete.value = keyId
  showDeleteConfirmModal.value = true
}

const closeDeleteConfirmModal = () => {
  showDeleteConfirmModal.value = false
  keyToDelete.value = null
}

const handleDeleteConfirm = async () => {
  if (!keyToDelete.value) {
    closeDeleteConfirmModal()
    return
  }

  const keyId = keyToDelete.value
  closeDeleteConfirmModal()

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
    // Backend: GET /api/v1/settings/notifications -> { "preferences": [ ... ] }
    const res = await apiClient('/settings/notifications')
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
    const prefs = Array.isArray(data.preferences) ? data.preferences : []

    // Ensure we always have the 3 core notification types
    const defaultTypes: Array<{ notification_type: string; is_enabled: boolean }> = [
      { notification_type: 'comment', is_enabled: true },
      { notification_type: 'update', is_enabled: true },
      { notification_type: 'mention', is_enabled: true }
    ]

    const merged: Array<{ notification_type: string; is_enabled: boolean }> = defaultTypes.map(def => {
      const existing = prefs.find((p: any) => p.notification_type === def.notification_type)
      return existing ? { notification_type: existing.notification_type, is_enabled: !!existing.is_enabled } : def
    })

    notificationPreferences.value = merged
  } catch (e: any) {
    notificationsError.value = e.message || 'Failed to load notifications'
  } finally {
    notificationsLoading.value = false
  }
}

const toggleNotification = async (type: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const enabled = target.checked

  // Optimistically update local state
  const existing = notificationPreferences.value.find(p => p.notification_type === type)
  let previousValue: boolean | undefined

  if (existing) {
    previousValue = existing.is_enabled
    existing.is_enabled = enabled
  } else {
    notificationPreferences.value.push({ notification_type: type, is_enabled: enabled })
  }

  try {
    savingNotifications.value = true
    notificationsError.value = ''
    notificationsSuccess.value = false

    // Always send full preferences array on each toggle
    const res = await apiClient('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(notificationPreferences.value)
    })

    if (!res.ok) {
      const errorMessage = await parseApiError(res, 'Failed to update notification preferences')
      throw new Error(errorMessage)
    }

    notificationsSuccess.value = true
    setTimeout(() => { notificationsSuccess.value = false }, 1500)
  } catch (e: any) {
    // Revert optimistic change on error
    if (existing && previousValue !== undefined) {
      existing.is_enabled = previousValue
    }
    notificationsError.value = e.message || 'Failed to update notification preferences'
    // Also revert the checkbox UI
    target.checked = !enabled
  } finally {
    savingNotifications.value = false
  }
}

const saveNotificationPreferences = async () => {
  try {
    savingNotifications.value = true
    notificationsError.value = ''
    notificationsSuccess.value = false

    // Backend: PUT /api/v1/settings/notifications with full array of preferences
    const res = await apiClient('/settings/notifications', {
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
    // Prefer using the shared branding store so Header & other views stay in sync
    await brandingStore.fetchBranding()
    const data = {
      company_name: brandingStore.company_name,
      logo_url: brandingStore.logo_url,
      primary_color: brandingStore.primary_color,
      secondary_color: brandingStore.secondary_color
    }
    branding.value = {
      company_name: data.company_name || '',
      logo_url: data.logo_url || '',
      primary_color: data.primary_color || '#0f766e',
      secondary_color: data.secondary_color || '#d97706'
    }
    applyBrandTheme({
      primary_color: branding.value.primary_color,
      secondary_color: branding.value.secondary_color,
    })
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

    const body: Record<string, string> = {}
    // NOTE: company_name is immutable once the company is created and is managed
    // via the Companies module, so we intentionally do NOT send it from here.
    // Color scheme UI removed — theme colors stay on app defaults / API.
    if (branding.value.logo_url) body.logo_url = branding.value.logo_url

    // Use the shared branding store update so global state (Header, etc.) updates immediately
    await brandingStore.updateBranding(body)

    // Refresh local edit state from store
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

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style> 
