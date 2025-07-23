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
          <!-- User Settings -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">User Profile</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input class="input-field w-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 focus:ring-blue-500 dark:focus:ring-neon-blue text-gray-900 dark:text-gray-100" v-model="profile.name" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                <select class="input-field w-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 focus:ring-blue-500 dark:focus:ring-neon-blue text-gray-900 dark:text-gray-100" v-model="profile.role">
                  <option>Lead Engineer</option>
                  <option>Manager</option>
                  <option>Admin</option>
                </select>
              </div>
              <button class="btn-primary" @click="updateProfile">Update Profile</button>
            </div>
          </div>

          <!-- API Keys -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">API Keys</h2>
            <div class="space-y-4">
              <div class="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600" v-for="key in apiKeys" :key="key.id">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">Production API Key</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400"> 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2</p>
                  </div>
                  <button class="text-blue-600 dark:text-neon-blue hover:text-blue-700 dark:hover:text-neon-blue/80 text-sm" @click="regenerateApiKey(key.id)">Regenerate</button>
                </div>
              </div>
              <button class="btn-secondary w-full" @click="generateApiKey">Generate New Key</button>
            </div>
          </div>

          <!-- Notifications -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notifications</h2>
            <div v-if="notificationsLoading" class="text-center text-gray-400 py-4">Loading...</div>
            <div v-else-if="notificationsError" class="text-center text-red-400 py-4">{{ notificationsError }}</div>
            <div v-else class="space-y-4">
              <div v-for="(value, key) in notifications" :key="key" class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ String(key).replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ notificationDescription(String(key)) }}</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer" v-model="notifications[key]">
                  <div class="w-11 h-6 bg-gray-200 dark:bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-neon-blue"></div>
                </label>
              </div>
              <button class="btn-primary w-full mt-4" :disabled="notificationsLoading" @click="updateNotifications()">Save Preferences</button>
              <div v-if="notificationsSuccess" class="text-green-400 text-center mt-2">Preferences saved!</div>
            </div>
          </div>

          <!-- Branding -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Branding & Organization</h2>
              <router-link 
                to="/settings/branding" 
                class="text-neon-blue hover:text-neon-blue/80 text-sm font-medium transition-colors"
              >
                Manage Branding →
              </router-link>
            </div>
            <div class="space-y-8">
              <div class="flex items-center space-x-3">
                <img 
                  v-if="branding.logo_url" 
                  :src="branding.logo_url" 
                  alt="Company Logo" 
                  class="w-12 h-12 object-contain rounded-lg border border-gray-200 dark:border-dark-600"
                />
                <div class="flex-1">
                  <p class="font-medium text-gray-900 dark:text-white mb-2">{{ branding.company_name || 'No company name set' }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Company branding settings</p>
                </div>
              </div>
              <div class="pt-2">
                <router-link 
                  to="/settings/branding" 
                  class="btn-primary w-full text-center"
                >
                  Customize Branding
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <div v-if="brandingError" class="text-red-400 text-center mt-2">{{ brandingError }}</div>
        <div v-if="brandingSuccess" class="text-green-400 text-center mt-2">Branding saved successfully!</div>
        <div v-if="profileSuccess" class="text-green-400 text-center mt-2">Profile updated successfully!</div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

const profile = ref({ name: '', email: '', role: '' })
const apiKeys = ref<{ id: string; [key: string]: any }[]>([])
const branding = ref({
  company_name: '',
  logo_url: '',
  brand_color: '#1e293b',
})
const brandingLogoFile = ref<File | null>(null)
const brandingLogoPreview = ref('')
const brandingError = ref('')
const brandingLoading = ref(false)
const brandingSuccess = ref(false)
const notifications = ref<any>({})
const notificationsLoading = ref(false)
const notificationsError = ref('')
const notificationsSuccess = ref(false)
const deletingKey = ref<string | null>(null)
const patchingProfile = ref(false)
const updatingBranding = ref(false)
const updatingNotifications = ref(false)
const profileSuccess = ref(false)

function notificationDescription(key: string) {
  switch (key) {
    case 'email_notifications':
      return 'Receive updates via email';
    case 'spec_review_alerts':
      return 'Get notified when specs need review';
    default:
      return '';
  }
}

onMounted(async () => {
  const headers = authStore.getAuthHeader() || {}
  const profileRes = await fetch('/api/v1/settings/profile/', { headers })
  if (profileRes.ok) {
    profile.value = await profileRes.json()
  }
  const keysRes = await fetch('/api/v1/settings/api-keys/', { headers })
  if (keysRes.ok) {
    apiKeys.value = await keysRes.json()
  }
  await fetchBranding()
  await fetchNotifications()
})

const fetchBranding = async () => {
  brandingLoading.value = true
  brandingError.value = ''
  try {
    const headers = authStore.getAuthHeader() || {}
    const res = await fetch('/api/v1/settings/branding/', { headers })
    if (!res.ok) throw new Error('Failed to fetch branding')
    const data = await res.json()
    branding.value = {
      company_name: data.company_name || '',
      logo_url: data.logo_url || '',
      brand_color: data.brand_color || '#1e293b',
    }
    brandingLogoPreview.value = data.logo_url || ''
  } catch (e: any) {
    brandingError.value = e.message || 'Failed to fetch branding'
  } finally {
    brandingLoading.value = false
  }
}

const handleLogoChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    brandingLogoFile.value = target.files[0]
    // Preview
    brandingLogoPreview.value = URL.createObjectURL(brandingLogoFile.value)
  }
}

const uploadLogo = async () => {
  if (!brandingLogoFile.value) return
  brandingLoading.value = true
  brandingError.value = ''
  try {
    const formData = new FormData()
    formData.append('file', brandingLogoFile.value)
    const headers = authStore.getAuthHeader() || {}
    const res = await fetch('/api/v1/settings/branding/logo', {
      method: 'POST',
      headers,
      body: formData
    })
    if (!res.ok) throw new Error('Failed to upload logo')
    const data = await res.json()
    branding.value.logo_url = data.logo_url
    brandingLogoPreview.value = data.logo_url
    brandingLogoFile.value = null
  } catch (e: any) {
    brandingError.value = e.message || 'Failed to upload logo'
  } finally {
    brandingLoading.value = false
  }
}

const saveBranding = async () => {
  brandingLoading.value = true
  brandingError.value = ''
  brandingSuccess.value = false
  try {
    // If a new logo is selected but not uploaded, upload it first
    if (brandingLogoFile.value) {
      await uploadLogo()
    }
    // Save branding info
    const headers = {
      ...authStore.getAuthHeader(),
      'Content-Type': 'application/json'
    }
    const res = await fetch('/api/v1/settings/branding/', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        company_name: branding.value.company_name,
        logo_url: branding.value.logo_url,
        brand_color: branding.value.brand_color,
      })
    })
    if (!res.ok) throw new Error('Failed to save branding')
    await fetchBranding()
    brandingSuccess.value = true
    setTimeout(() => { brandingSuccess.value = false }, 2000)
  } catch (e: any) {
    brandingError.value = e.message || 'Failed to save branding'
  } finally {
    brandingLoading.value = false
  }
}

const updateProfile = async () => {
  const headers = {
    ...authStore.getAuthHeader(),
    'Content-Type': 'application/json'
  }
  const res = await fetch('/api/v1/settings/profile/', {
    method: 'PUT',
    headers,
    body: JSON.stringify(profile.value)
  })
  if (res.ok) {
    // Re-fetch the updated profile
    const profileRes = await fetch('/api/v1/settings/profile/', { headers })
    if (profileRes.ok) {
      profile.value = await profileRes.json()
    }
    await authStore.checkAuth() // Refresh global user for sidebar
    profileSuccess.value = true
    setTimeout(() => { profileSuccess.value = false }, 2000)
  }
}

const generateApiKey = async () => {
  const headers = authStore.getAuthHeader() || {}
  await fetch('/api/v1/settings/api-keys/', { 
    method: 'POST',
    headers
  })
}

const regenerateApiKey = async (keyId: string) => {
  const headers = authStore.getAuthHeader() || {}
  await fetch(`/api/v1/settings/api-keys/${keyId}/regenerate`, { 
    method: 'POST',
    headers
  })
}

const fetchNotifications = async () => {
  notificationsLoading.value = true
  notificationsError.value = ''
  try {
    const headers = authStore.getAuthHeader() || {}
    const res = await fetch('/api/v1/settings/notifications/', { headers })
    if (!res.ok) throw new Error('Failed to fetch notifications')
    notifications.value = await res.json()
  } catch (e: any) {
    notificationsError.value = e.message || 'Failed to fetch notifications'
  } finally {
    notificationsLoading.value = false
  }
}

const updateNotifications = async (changedOnly = false) => {
  notificationsLoading.value = true
  notificationsError.value = ''
  notificationsSuccess.value = false
  try {
    const method = changedOnly ? 'PATCH' : 'PUT'
    const headers = {
      ...authStore.getAuthHeader(),
      'Content-Type': 'application/json'
    }
    const res = await fetch('/api/v1/settings/notifications/', {
      method,
      headers,
      body: JSON.stringify(notifications.value)
    })
    if (!res.ok) throw new Error('Failed to update notifications')
    notificationsSuccess.value = true
    setTimeout(() => { notificationsSuccess.value = false }, 2000)
  } catch (e: any) {
    notificationsError.value = e.message || 'Failed to update notifications'
  } finally {
    notificationsLoading.value = false
  }
}
</script> 