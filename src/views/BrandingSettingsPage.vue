<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-950">
    <!-- Header and Sidebar -->
    <Header />
    <Sidebar />
    
    <!-- Main Content -->
    <main class="ml-64 p-8">
      <div class="max-w-4xl mx-auto">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Branding & Organization Settings</h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">Customize your company branding and appearance</p>
        </div>

        <!-- Settings Form -->
        <div class="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-2xl rounded-2xl p-8">
          <form @submit.prevent="saveBranding" class="space-y-8">
            <!-- Company Information Section -->
            <div>
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Company Information</h2>
              
              <!-- Company Name -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  v-model="form.company_name"
                  type="text"
                  required
                  maxlength="100"
                  :disabled="loading"
                  class="input-field w-full rounded-xl px-4 py-3 text-lg"
                  placeholder="Enter your company name"
                />
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  This name will appear throughout the application
                </p>
              </div>

              <!-- Logo Upload Section -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Logo
                </label>
                
                <!-- Current Logo Display -->
                <div v-if="currentLogo" class="mb-4">
                  <div class="flex items-center space-x-4">
                    <img 
                      :src="currentLogo" 
                      alt="Current Logo" 
                      class="h-16 w-16 object-contain rounded-lg border border-gray-200 dark:border-dark-600"
                    />
                    <div>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Current logo</p>
                      <button 
                        type="button"
                        @click="removeLogo"
                        :disabled="loading"
                        class="text-sm text-red-500 hover:text-red-600 transition-colors"
                      >
                        Remove logo
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Logo Upload Zone -->
                <div 
                  class="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-xl p-8 text-center hover:border-neon-blue transition-colors cursor-pointer"
                  :class="{ 'border-neon-blue bg-blue-50 dark:bg-blue-900/20': isDragOver }"
                  @click="triggerFileInput"
                  @dragover.prevent="isDragOver = true"
                  @dragleave.prevent="isDragOver = false"
                  @drop.prevent="handleFileDrop"
                >
                  <div class="space-y-4">
                    <div class="mx-auto w-12 h-12 bg-gray-100 dark:bg-dark-800 rounded-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-lg font-medium text-gray-900 dark:text-white">
                        {{ logoUploadText }}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        PNG, JPG, or SVG up to 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Hidden File Input -->
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  class="hidden"
                  @change="handleFileSelect"
                />

                <!-- Upload Progress -->
                <div v-if="uploading" class="mt-4">
                  <div class="flex items-center space-x-3">
                    <div class="animate-spin w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full"></div>
                    <span class="text-sm text-gray-600 dark:text-gray-400">Uploading logo...</span>
                  </div>
                </div>

                <!-- Upload Error -->
                <div v-if="uploadError" class="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p class="text-sm text-red-600 dark:text-red-400">{{ uploadError }}</p>
                </div>
              </div>
            </div>

            <!-- Color Customization Section -->
            <div>
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Color Scheme</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Primary Color -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Color
                  </label>
                  <div class="flex items-center space-x-3">
                    <input
                      v-model="form.primary_color"
                      type="color"
                      :disabled="loading"
                      class="w-12 h-12 rounded-lg border border-gray-300 dark:border-dark-600 cursor-pointer"
                    />
                    <input
                      v-model="form.primary_color"
                      type="text"
                      :disabled="loading"
                      class="input-field flex-1 rounded-xl px-4 py-2 font-mono text-sm"
                      placeholder="#3B82F6"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Main brand color for buttons and accents
                  </p>
                </div>

                <!-- Secondary Color -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secondary Color
                  </label>
                  <div class="flex items-center space-x-3">
                    <input
                      v-model="form.secondary_color"
                      type="color"
                      :disabled="loading"
                      class="w-12 h-12 rounded-lg border border-gray-300 dark:border-dark-600 cursor-pointer"
                    />
                    <input
                      v-model="form.secondary_color"
                      type="text"
                      :disabled="loading"
                      class="input-field flex-1 rounded-xl px-4 py-2 font-mono text-sm"
                      placeholder="#8B5CF6"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Secondary color for highlights and gradients
                  </p>
                </div>
              </div>

              <!-- Color Preview -->
              <div class="mt-6 p-4 bg-gray-50 dark:bg-dark-800 rounded-xl">
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preview</h3>
                <div class="flex items-center space-x-4">
                  <button 
                    class="px-4 py-2 rounded-lg text-white font-medium transition-colors"
                    :style="{ backgroundColor: form.primary_color || '#3B82F6' }"
                  >
                    Primary Button
                  </button>
                  <div 
                    class="px-4 py-2 rounded-lg text-white font-medium"
                    :style="{ 
                      background: `linear-gradient(135deg, ${form.primary_color || '#3B82F6'}, ${form.secondary_color || '#8B5CF6'})`
                    }"
                  >
                    Gradient Element
                  </div>
                </div>
              </div>
            </div>

            <!-- Save Button -->
            <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-dark-700">
              <div class="flex items-center space-x-4">
                <button
                  type="submit"
                  :disabled="loading || !hasChanges"
                  class="btn-primary px-8 py-3 text-base font-semibold flex items-center space-x-2 transition-transform active:scale-95"
                >
                  <span v-if="loading" class="animate-spin">⏳</span>
                  <span v-else>💾</span>
                  <span>{{ loading ? 'Saving...' : 'Save Changes' }}</span>
                </button>
                
                <button
                  v-if="hasChanges"
                  type="button"
                  @click="resetForm"
                  :disabled="loading"
                  class="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Reset
                </button>
              </div>

              <!-- Auto-save indicator -->
              <div v-if="autoSaveStatus" class="text-sm text-gray-500 dark:text-gray-400">
                {{ autoSaveStatus }}
              </div>
            </div>

            <!-- Success/Error Messages -->
            <transition name="fade">
              <div v-if="success" class="p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl">
                <p class="text-green-600 dark:text-green-400 font-medium">✅ Branding settings saved successfully!</p>
              </div>
            </transition>

            <transition name="fade">
              <div v-if="error" class="p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                <p class="text-red-600 dark:text-red-400 font-medium">❌ {{ error }}</p>
              </div>
            </transition>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Header from '@/components/Layout/Header.vue'
import Sidebar from '@/components/Layout/Sidebar.vue'
import { useAuthStore } from '@/stores/auth'

interface BrandingSettings {
  company_name: string
  logo_url?: string
  primary_color: string
  secondary_color: string
}

const authStore = useAuthStore()

// Form state
const form = ref<BrandingSettings>({
  company_name: '',
  logo_url: '',
  primary_color: '#3B82F6',
  secondary_color: '#8B5CF6'
})

// UI state
const loading = ref(false)
const uploading = ref(false)
const error = ref('')
const success = ref(false)
const uploadError = ref('')
const isDragOver = ref(false)
const fileInput = ref<HTMLInputElement>()

// Auto-save state
const autoSaveStatus = ref('')
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null

// Original values for change detection
const originalValues = ref<BrandingSettings | null>(null)
const currentLogo = ref('')

// Computed properties
const hasChanges = computed(() => {
  if (!originalValues.value) return false
  return (
    form.value.company_name !== originalValues.value.company_name ||
    form.value.primary_color !== originalValues.value.primary_color ||
    form.value.secondary_color !== originalValues.value.secondary_color
  )
})

const logoUploadText = computed(() => {
  if (uploading.value) return 'Uploading...'
  if (currentLogo.value) return 'Click or drag to replace logo'
  return 'Click or drag to upload logo'
})

// Methods
const fetchBrandingSettings = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const headers = authStore.getAuthHeader() || {}
    const response = await fetch('/api/v1/settings/branding/', { headers })
    
    if (!response.ok) {
      throw new Error('Failed to load branding settings')
    }
    
    const data = await response.json()
    form.value = {
      company_name: data.company_name || '',
      logo_url: data.logo_url || '',
      primary_color: data.primary_color || '#3B82F6',
      secondary_color: data.secondary_color || '#8B5CF6'
    }
    
    originalValues.value = { ...form.value }
    currentLogo.value = data.logo_url || ''
    
  } catch (e: any) {
    error.value = e.message || 'Failed to load branding settings'
  } finally {
    loading.value = false
  }
}

const saveBranding = async () => {
  loading.value = true
  error.value = ''
  success.value = false
  
  try {
    const headers = {
      ...authStore.getAuthHeader(),
      'Content-Type': 'application/json'
    }
    
    const response = await fetch('/api/v1/settings/branding/', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        company_name: form.value.company_name,
        primary_color: form.value.primary_color,
        secondary_color: form.value.secondary_color
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to save branding settings')
    }
    
    success.value = true
    originalValues.value = { ...form.value }
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      success.value = false
    }, 3000)
    
  } catch (e: any) {
    error.value = e.message || 'Failed to save branding settings'
  } finally {
    loading.value = false
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    uploadLogo(file)
  }
}

const handleFileDrop = (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    uploadLogo(files[0])
  }
}

const uploadLogo = async (file: File) => {
  // Validate file
  const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    uploadError.value = 'Please select a PNG, JPG, or SVG file'
    return
  }
  
  if (file.size > maxSize) {
    uploadError.value = 'File size must be less than 5MB'
    return
  }
  
  uploading.value = true
  uploadError.value = ''
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const headers = authStore.getAuthHeader() || {}
    const response = await fetch('/api/v1/uploads/logo', {
      method: 'POST',
      headers,
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Failed to upload logo')
    }
    
    const data = await response.json()
    currentLogo.value = data.logo_url
    form.value.logo_url = data.logo_url
    
    // Clear file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    
  } catch (e: any) {
    uploadError.value = e.message || 'Failed to upload logo'
  } finally {
    uploading.value = false
  }
}

const removeLogo = () => {
  currentLogo.value = ''
  form.value.logo_url = ''
  uploadError.value = ''
}

const resetForm = () => {
  if (originalValues.value) {
    form.value = { ...originalValues.value }
    currentLogo.value = originalValues.value.logo_url || ''
  }
  error.value = ''
  uploadError.value = ''
}

// Auto-save functionality
const triggerAutoSave = () => {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout)
  }
  
  autoSaveTimeout = setTimeout(async () => {
    if (hasChanges.value) {
      autoSaveStatus.value = 'Auto-saving...'
      await saveBranding()
      autoSaveStatus.value = 'Auto-saved'
      setTimeout(() => {
        autoSaveStatus.value = ''
      }, 2000)
    }
  }, 1000)
}

// Watchers
watch(() => form.value.company_name, triggerAutoSave)
watch(() => form.value.primary_color, triggerAutoSave)
watch(() => form.value.secondary_color, triggerAutoSave)

// Lifecycle
onMounted(() => {
  fetchBrandingSettings()
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style> 