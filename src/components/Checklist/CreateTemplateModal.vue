<template>
  <Transition name="modal">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/60"
      @click.self="$emit('close')"
    >
      <div
        class="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-dark-700 dark:bg-dark-900"
      >
        <div
          class="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-6 dark:border-dark-700"
        >
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gradient">Create Checklist Template</h2>
          <button
            type="button"
            class="text-2xl font-bold text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            @click="$emit('close')"
          >
            &times;
          </button>
        </div>
        <form id="template-form" class="flex-1 space-y-4 overflow-y-auto p-6" @submit.prevent="handleSubmit">
          <input v-model="form.name" class="input-field w-full" placeholder="Template Name" required />
          <textarea v-model="form.description" class="input-field w-full" placeholder="Description" rows="2" />
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Items (Optional)</label>
            <div class="custom-scrollbar mb-3 max-h-64 space-y-2 overflow-y-auto">
              <template v-if="form.items && Array.isArray(form.items) && form.items.length > 0">
                <div
                  v-for="(item, idx) in form.items"
                  :key="`item-${idx}-${item.order || idx}`"
                  class="rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors dark:border-dark-700 dark:bg-dark-800"
                >
                  <div class="flex items-start gap-2">
                    <div class="flex-1">
                      <input v-model="item.title" class="input-field w-full" placeholder="Item title" />
                    </div>
                    <div class="flex flex-shrink-0 gap-1">
                      <button
                        type="button"
                        class="rounded px-2 py-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-dark-700 dark:hover:text-gray-300"
                        :title="(item.showDescription || false) ? 'Hide description' : 'Show description'"
                        @click="toggleDescription(idx)"
                      >
                        <svg
                          v-if="!(item.showDescription || false)"
                          class="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        class="rounded px-2 py-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                        title="Remove item"
                        @click="removeItem(idx)"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <Transition name="slide-down">
                    <div v-if="item?.showDescription || false" class="mt-2">
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
              <div v-else class="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No items yet. Click "+ Add Item" to add one.
              </div>
            </div>
            <button type="button" class="btn-primary w-full" @click="addItem">+ Add Item</button>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Items are optional. You can create a template without items and add them later.
            </p>
          </div>
        </form>
        <div
          class="flex-shrink-0 space-y-3 border-t border-gray-200 p-6 dark:border-dark-700"
        >
          <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
          </div>
          <div class="flex gap-3">
            <button type="button" class="btn-secondary flex-1" :disabled="submitting" @click="$emit('close')">
              Cancel
            </button>
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
  items: [{ title: '', description: '', order: 0, showDescription: false }] as Array<{
    title: string
    description: string
    order: number
    showDescription: boolean
  }>,
})

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
  form.items.forEach((item, index) => {
    item.order = index
  })
  if (form.items.length === 0) {
    form.items.push({ title: '', description: '', order: 0, showDescription: false })
  }
}

const toggleDescription = (idx: number) => {
  if (form.items && form.items[idx]) {
    if (form.items[idx].showDescription === undefined) {
      form.items[idx].showDescription = false
    }
    form.items[idx].showDescription = !form.items[idx].showDescription
  }
}

const handleSubmit = async () => {
  submitting.value = true
  error.value = ''

  try {
    if (!form.name.trim()) {
      throw new Error('Template name is required')
    }

    if (!authStore.user?.id) {
      throw new Error('User not authenticated')
    }

    const itemsArray = form.items || []
    const validItems = itemsArray.filter((item) => item && item.title && item.title.trim())

    const requestBody: Record<string, unknown> = {
      name: form.name.trim(),
    }

    if (authStore.user?.email) {
      requestBody.created_by = authStore.user.email
    }

    if (form.description.trim()) {
      requestBody.description = form.description.trim()
    }

    if (validItems.length > 0) {
      requestBody.items = validItems.map((item, idx) => ({
        title: item.title.trim(),
        description: item.description?.trim() || null,
        order: idx,
      }))
    }

    const res = await authenticatedFetch('/api/v1/checklists/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!res.ok) {
      let errorMessage = 'Failed to create template'
      try {
        const errorData = await res.json()
        errorMessage = (errorData as { detail?: string; message?: string }).detail || (errorData as { message?: string }).message || errorMessage
      } catch {
        const errorText = await res.text().catch(() => '')
        if (errorText) errorMessage = errorText
      }
      throw new Error(errorMessage)
    }

    await res.json()

    form.name = ''
    form.description = ''
    form.items = [{ title: '', description: '', order: 0, showDescription: false }]
    error.value = ''

    emit('created')
    emit('close')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to create template'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active {
  transition: all 0.3s ease-out;
}
.slide-down-leave-active {
  transition: all 0.2s ease-in;
}
.slide-down-enter-from {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 200px;
  opacity: 1;
  transform: translateY(0);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.06);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
