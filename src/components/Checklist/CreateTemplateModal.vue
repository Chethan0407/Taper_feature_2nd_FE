<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
      <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl font-bold" @click="$emit('close')">&times;</button>
      <h2 class="text-2xl font-bold mb-6 text-center text-gradient">Create Checklist Template</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <input v-model="form.name" class="input-field w-full" placeholder="Template Name" required />
        <textarea v-model="form.description" class="input-field w-full" placeholder="Description" rows="2" />
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">Items</label>
          <div v-for="(item, idx) in form.items" :key="idx" class="flex gap-2 mb-2">
            <input v-model="item.title" class="input-field flex-1" placeholder="Item title" required />
            <button type="button" class="btn-secondary" @click="removeItem(idx)">Remove</button>
          </div>
          <button type="button" class="btn-primary" @click="addItem">+ Add Item</button>
        </div>
        <button type="submit" class="btn-primary w-full" :disabled="submitting">
          {{ submitting ? 'Creating...' : 'Create Template' }}
        </button>
        <div v-if="error" class="text-red-400 mt-2">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['close', 'created'])
const authStore = useAuthStore()

const form = reactive({
  name: '',
  description: '',
  items: [{ title: '', order: 1 }]
})

const submitting = ref(false)
const error = ref('')

const addItem = () => {
  form.items.push({ title: '', order: form.items.length + 1 })
}

const removeItem = (idx: number) => {
  form.items.splice(idx, 1)
  // Reorder remaining items
  form.items.forEach((item, index) => {
    item.order = index + 1
  })
}

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
    
    // Filter out empty items
    const validItems = form.items.filter(item => item.title.trim())
    
    // Prepare request body according to API specification
    const requestBody: any = {
      name: form.name.trim(),
      created_by: String(authStore.user.id)
    }
    
    if (form.description.trim()) {
      requestBody.description = form.description.trim()
    }
    
    if (validItems.length > 0) {
      requestBody.items = validItems.map((item, idx) => ({
        title: item.title.trim(),
        order: idx + 1
      }))
    }
    
    const res = await fetch('/api/v1/checklists/templates', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!res.ok) {
      const errorData = await res.text()
      throw new Error(errorData || 'Failed to create template')
    }
    
    const createdTemplate = await res.json()
    console.log('Template created successfully:', createdTemplate)
    
    emit('created')
    emit('close')
  } catch (e: any) {
    error.value = e.message || 'Failed to create template'
  } finally {
    submitting.value = false
  }
}
</script> 