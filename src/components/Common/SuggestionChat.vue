<template>
  <!-- Chat Button (Floating) - Only show when logged in -->
  <button
    v-if="!isOpen && isAuthenticated"
    @click="openChat"
    class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full shadow-2xl hover:shadow-neon-blue/50 transition-all duration-300 hover:scale-110 flex items-center justify-center group"
    aria-label="Open suggestion chat"
  >
    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
    </svg>
    <span class="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
  </button>

  <!-- Chat Window -->
  <Transition name="slide-up">
    <div
      v-if="isOpen"
      class="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-dark-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-700 flex flex-col"
      style="max-height: 600px;"
    >
      <!-- Header -->
      <div class="bg-gradient-to-r from-neon-blue to-neon-purple p-4 rounded-t-2xl flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-white font-semibold">Send Suggestion</h3>
            <p class="text-white/80 text-xs">We'd love to hear from you!</p>
          </div>
        </div>
        <button
          @click="closeChat"
          class="text-white hover:text-white/80 transition-colors p-1"
          aria-label="Close chat"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Messages/Form Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Success Message -->
        <Transition name="fade">
          <div v-if="success" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-start gap-2">
            <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p class="text-green-700 dark:text-green-400 font-medium text-sm">Message sent!</p>
              <p class="text-green-600 dark:text-green-500 text-xs mt-1">We'll get back to you soon.</p>
            </div>
          </div>
        </Transition>

        <!-- Error Message -->
        <Transition name="fade">
          <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
            <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-red-700 dark:text-red-400 text-sm">{{ error }}</p>
          </div>
        </Transition>

        <!-- Form -->
        <form v-if="!success" @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              v-model="formData.category"
              class="input-field w-full"
              required
            >
              <option value="">Select a category</option>
              <option value="feature">Feature Request</option>
              <option value="bug">Bug Report</option>
              <option value="improvement">Improvement Suggestion</option>
              <option value="question">Question</option>
              <option value="other">Other</option>
            </select>
          </div>

          <!-- Subject -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <input
              v-model="formData.subject"
              type="text"
              required
              class="input-field w-full"
              placeholder="Brief description of your suggestion"
              maxlength="200"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ formData.subject.length }}/200 characters
            </p>
          </div>

          <!-- Message -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              v-model="formData.message"
              required
              rows="6"
              class="input-field w-full resize-none"
              placeholder="Tell us more about your suggestion or feedback..."
              maxlength="1000"
            ></textarea>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ formData.message.length }}/1000 characters
            </p>
          </div>

          <!-- File Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Attachments (Optional)
            </label>
            <div class="space-y-3">
              <!-- File Input -->
              <div
                v-if="selectedFiles.length < 5"
                class="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-4 text-center hover:border-neon-blue dark:hover:border-neon-blue transition-colors cursor-pointer"
                @click="triggerFileInput"
              >
                <input
                  ref="fileInput"
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,.txt,.zip,.rar,.xlsx,.xls,.csv"
                  @change="handleFileSelect"
                  class="hidden"
                />
                <svg class="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Click to upload files ({{ selectedFiles.length }}/5)
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Max 10MB per file, 25MB total. Images, PDFs, documents, etc.
                </p>
              </div>

              <!-- Selected Files List -->
              <div v-if="selectedFiles.length > 0" class="space-y-2">
                <div
                  v-for="(file, index) in selectedFiles"
                  :key="index"
                  class="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600"
                >
                  <div class="flex items-center space-x-3 flex-1 min-w-0">
                    <!-- File Icon -->
                    <div class="flex-shrink-0">
                      <svg v-if="isImageFile(file)" class="w-8 h-8 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <svg v-else class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <!-- File Info -->
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {{ file.name }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ formatFileSize(file.size) }}
                      </p>
                    </div>
                  </div>
                  <!-- Remove Button -->
                  <button
                    type="button"
                    @click="removeFile(index)"
                    class="ml-3 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors flex-shrink-0"
                    aria-label="Remove file"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <!-- Total Size Warning -->
                <div v-if="totalFileSize > 25 * 1024 * 1024" class="text-xs text-red-500 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Total size exceeds 25MB limit. Please remove some files.
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isSubmitting || !formData.category || !formData.subject || !formData.message || totalFileSize > 25 * 1024 * 1024"
            class="btn-primary w-full py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
            <span v-else>Send Message</span>
          </button>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authenticatedFetch } from '@/utils/auth-requests'

const authStore = useAuthStore()

// Only show chat if user is authenticated
const isAuthenticated = computed(() => authStore.isAuthenticated)

const isOpen = ref(false)
const isSubmitting = ref(false)
const success = ref(false)
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])

const formData = ref({
  category: '',
  subject: '',
  message: ''
})

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/zip', 'application/x-rar-compressed',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv'
]

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt', '.zip', '.rar', '.xlsx', '.xls', '.csv']

// Computed properties
const totalFileSize = computed(() => {
  return selectedFiles.value.reduce((total, file) => total + file.size, 0)
})

// File validation
const isValidFileType = (file: File): boolean => {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  return ALLOWED_EXTENSIONS.includes(extension) || ALLOWED_FILE_TYPES.includes(file.type)
}

const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/')
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// File handling
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  if (files.length === 0) return

  // Check total file count
  if (selectedFiles.value.length + files.length > 5) {
    error.value = 'Maximum 5 files allowed. Please select fewer files.'
    target.value = ''
    return
  }

  // Validate each file
  for (const file of files) {
    // Check file type
    if (!isValidFileType(file)) {
      error.value = `File type not allowed: ${file.name}. Allowed types: Images, PDFs, Documents, Archives, Spreadsheets.`
      target.value = ''
      return
    }

    // Check file size (10MB per file)
    if (file.size > 10 * 1024 * 1024) {
      error.value = `File too large: ${file.name}. Maximum size is 10MB per file.`
      target.value = ''
      return
    }

    // Check total size (25MB total)
    if (totalFileSize.value + file.size > 25 * 1024 * 1024) {
      error.value = `Total file size exceeds 25MB limit. Please remove some files or select smaller files.`
      target.value = ''
      return
    }
  }

  // Add valid files
  selectedFiles.value.push(...files)
  error.value = ''
  target.value = ''
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  error.value = ''
}

const openChat = () => {
  isOpen.value = true
  success.value = false
  error.value = ''
  // Reset form if message was already sent
  if (success.value) {
    formData.value = {
      category: '',
      subject: '',
      message: ''
    }
    selectedFiles.value = []
  }
}

const closeChat = () => {
  isOpen.value = false
  // Reset form after a delay to allow animation
  setTimeout(() => {
    if (!isOpen.value) {
      formData.value = {
        category: '',
        subject: '',
        message: ''
      }
      selectedFiles.value = []
      success.value = false
      error.value = ''
    }
  }, 300)
}

const handleSubmit = async () => {
  if (!formData.value.category || !formData.value.subject || !formData.value.message) {
    return
  }

  // Validate total file size
  if (totalFileSize.value > 25 * 1024 * 1024) {
    error.value = 'Total file size exceeds 25MB limit. Please remove some files.'
    return
  }

  isSubmitting.value = true
  error.value = ''
  success.value = false

  try {
    // Get user info if available
    const userEmail = authStore.user?.email || 'anonymous'
    const userName = authStore.user?.name || 'Anonymous User'

    // Create FormData (multipart/form-data)
    const formDataToSend = new FormData()
    formDataToSend.append('category', formData.value.category)
    formDataToSend.append('subject', formData.value.subject)
    formDataToSend.append('message', formData.value.message)
    formDataToSend.append('user_email', userEmail)
    formDataToSend.append('user_name', userName)

    // Append files
    selectedFiles.value.forEach((file) => {
      formDataToSend.append('files', file)
    })

    // Use authenticatedFetch for consistent error handling
    // Note: authenticatedFetch handles FormData automatically
    const response = await authenticatedFetch('/api/v1/suggestions', {
      method: 'POST',
      body: formDataToSend
    })

    if (!response.ok) {
      let errorMessage = 'Failed to send message. Please try again.'
      try {
        const errorText = await response.text()
        try {
          const errorData = JSON.parse(errorText)
          // Handle different error response formats
          if (errorData.detail) {
            // If detail is an array (validation errors), format it
            if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map((err: any) => {
                if (typeof err === 'string') return err
                if (err.msg) return err.msg
                if (err.loc && err.msg) return `${err.loc.join('.')}: ${err.msg}`
                return JSON.stringify(err)
              }).join(', ')
            } else if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail
            } else {
              errorMessage = JSON.stringify(errorData.detail)
            }
          } else if (errorData.message) {
            errorMessage = typeof errorData.message === 'string' ? errorData.message : JSON.stringify(errorData.message)
          } else if (errorText) {
            errorMessage = errorText
          }
        } catch {
          // If JSON parsing fails, use the text as error message
          errorMessage = errorText || errorMessage
        }
      } catch (e) {
        console.error('Failed to read error response:', e)
        errorMessage = `Request failed with status ${response.status}. Please try again.`
      }
      throw new Error(errorMessage)
    }

    // Success
    success.value = true
    formData.value = {
      category: '',
      subject: '',
      message: ''
    }
    selectedFiles.value = []

    // Auto-close after 3 seconds
    setTimeout(() => {
      closeChat()
    }, 3000)
  } catch (err: any) {
    // Ensure error is always a string, never an object
    if (err instanceof Error) {
      error.value = err.message
    } else if (typeof err === 'string') {
      error.value = err
    } else if (err && typeof err === 'object') {
      // If error is an object, try to extract a meaningful message
      error.value = err.message || err.detail || err.error || JSON.stringify(err)
    } else {
      error.value = 'Failed to send message. Please try again.'
    }
    console.error('Error sending suggestion:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

