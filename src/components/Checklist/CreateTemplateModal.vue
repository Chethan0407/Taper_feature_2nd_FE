<template>
  <Transition name="modal">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" @click.self="$emit('close')">
    <div class="bg-dark-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative">
      <div class="flex items-center justify-between p-6 border-b border-dark-700 flex-shrink-0">
        <h2 class="text-2xl font-bold text-gradient">Create Checklist Template</h2>
        <button class="text-gray-400 hover:text-gray-200 text-2xl font-bold transition-colors" @click="$emit('close')">&times;</button>
      </div>
      <form id="template-form" @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-4">
        <input v-model="form.name" class="input-field w-full" placeholder="Template Name" required />
        <textarea v-model="form.description" class="input-field w-full" placeholder="Description" rows="2" />
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Items (Optional)</label>
          <div class="max-h-64 overflow-y-auto space-y-2 mb-3 custom-scrollbar">
            <template v-if="form.items && Array.isArray(form.items) && form.items.length > 0">
              <div 
                v-for="(item, idx) in form.items" 
                :key="`item-${idx}-${item.order || idx}`" 
                class="p-3 bg-dark-800 rounded-lg border border-dark-700 transition-colors"
              >
              <!-- Item Title Row -->
              <div class="flex gap-2 items-start">
                <div class="flex-1">
                  <input 
                    v-model="item.title" 
                    class="input-field w-full"
                    placeholder="Item title" 
                  />
                </div>
                <div class="flex gap-1 flex-shrink-0">
                  <!-- Toggle Description Button -->
                  <button 
                    type="button" 
                    class="px-2 py-2 text-gray-400 hover:text-gray-300 hover:bg-dark-700 rounded transition-colors" 
                    @click="toggleDescription(idx)"
                    :title="(item.showDescription || false) ? 'Hide description' : 'Show description'"
                  >
                    <svg v-if="!(item.showDescription || false)" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                    </svg>
                  </button>
                  <!-- Remove Button -->
                  <button 
                    type="button" 
                    class="px-2 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors" 
                    @click="removeItem(idx)"
                    title="Remove item"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
              <!-- Collapsible Description -->
              <Transition name="slide-down">
                <div v-if="(item?.showDescription || false)" class="mt-2">
                  <textarea 
                    v-model="item.description" 
                    class="input-field w-full" 
                    placeholder="Description (optional)" 
                    rows="2"
                  />
                </div>
              </Transition>
              </div>
            </template>
            <div v-else class="text-center py-4 text-gray-400 text-sm">
              No items yet. Click "+ Add Item" to add one.
            </div>
          </div>
          <button type="button" class="btn-primary w-full" @click="addItem">+ Add Item</button>
          <p class="text-xs text-gray-400 mt-2">Items are optional. You can create a template without items and add them later.</p>
        </div>
      </form>
      <div class="p-6 border-t border-dark-700 flex-shrink-0 space-y-3">
        <div v-if="error" class="p-3 bg-red-900/20 border border-red-800 rounded-lg">
          <p class="text-red-400 text-sm">{{ error }}</p>
        </div>
        <div class="flex gap-3">
          <button type="button" class="btn-secondary flex-1" @click="$emit('close')" :disabled="submitting">Cancel</button>
          <button type="submit" form="template-form" class="btn-primary flex-1" :disabled="submitting">
            {{ submitting ? 'Creating...' : 'Create Template' }}
          </button>
        </div>
      </div>
    </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authenticatedFetch } from '@/utils/auth-requests'

const emit = defineEmits(['close', 'created'])
const authStore = useAuthStore()

// Handle Escape key to close modal
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && !submitting.value) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
})

const form = reactive({
  name: '',
  description: '',
  items: [{ title: '', description: '', order: 0, showDescription: false }] as Array<{ title: string; description: string; order: number; showDescription: boolean }>
})

// Ensure items is always properly initialized and is an array
if (!Array.isArray(form.items) || form.items.length === 0) {
  form.items = [{ title: '', description: '', order: 0, showDescription: false }]
}

const submitting = ref(false)
const error = ref('')

const addItem = () => {
  form.items.push({ title: '', description: '', order: form.items.length, showDescription: false })
}

const removeItem = (idx: number) => {
  form.items.splice(idx, 1)
  // Recalculate order for remaining items (0-indexed)
  form.items.forEach((item, index) => {
    item.order = index
  })
  // If no items left, add one empty item for better UX
  if (form.items.length === 0) {
    form.items.push({ title: '', description: '', order: 0, showDescription: false })
  }
}

const toggleDescription = (idx: number) => {
  if (form.items && form.items[idx]) {
    // Ensure showDescription property exists
    if (form.items[idx].showDescription === undefined) {
      form.items[idx].showDescription = false
    }
    form.items[idx].showDescription = !form.items[idx].showDescription
  }
}

// Option A: Filter out items with empty titles before submit
// Empty items are allowed and will be filtered out before submission
// This allows creating templates with 0 items (no validation needed)

const handleSubmit = async () => {
  submitting.value = true
  error.value = ''
  
  try {
    // Validate form
    if (!form.name.trim()) {
      throw new Error('Template name is required')
    }
    
    if (!authStore.user?.id) {
      throw new Error('User not authenticated')
    }
    
    // Option A: Filter out items with empty titles before submit
    // Empty items are allowed and will be filtered out
    const itemsArray = form.items || []
    const validItems = itemsArray.filter(item => item && item.title && item.title.trim())
    
    // Prepare request body according to API specification
    const requestBody: any = {
      name: form.name.trim()
    }
    
    // created_by is optional - backend can auto-fill from auth token
    // Only include if we have user email
    if (authStore.user?.email) {
      requestBody.created_by = authStore.user.email
    }
    
    if (form.description.trim()) {
      requestBody.description = form.description.trim()
    }
    
    // Items are optional - only include if there are valid items
    // Note: Backend allows creating templates with 0 items
    if (validItems.length > 0) {
      requestBody.items = validItems.map((item, idx) => ({
        title: item.title.trim(),
        description: item.description?.trim() || null, // null if empty
        order: idx // 0-indexed order (0, 1, 2, ...)
      }))
    }
    // If validItems.length === 0, items array is not included (backend allows this)
    
    const res = await authenticatedFetch('/api/v1/checklists/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!res.ok) {
      let errorMessage = 'Failed to create template'
      try {
        const errorData = await res.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch {
        const errorText = await res.text().catch(() => '')
        if (errorText) errorMessage = errorText
      }
      throw new Error(errorMessage)
    }
    
    const createdTemplate = await res.json()
    console.log('Template created successfully:', createdTemplate)
    
    // Reset form
    form.name = ''
    form.description = ''
    form.items = [{ title: '', description: '', order: 0, showDescription: false }]
    error.value = ''
    
    emit('created')
    emit('close')
  } catch (e: any) {
    error.value = e.message || 'Failed to create template'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active {
  transition: all 0.3s ease-out;
}
.slide-down-leave-active {
  transition: all 0.2s ease-in;
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Modal transition */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style> 