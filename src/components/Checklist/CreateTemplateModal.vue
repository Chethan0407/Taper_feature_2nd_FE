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
            <input v-model="item.text" class="input-field flex-1" placeholder="Item text" required />
            <label class="flex items-center text-xs text-gray-400">
              <input type="checkbox" v-model="item.required" class="mr-1" /> Required
            </label>
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
const emit = defineEmits(['close', 'created'])
const form = reactive({
  name: '',
  description: '',
  items: [{ text: '', required: false }]
})
const submitting = ref(false)
const error = ref('')
const addItem = () => form.items.push({ text: '', required: false })
const removeItem = (idx: number) => form.items.splice(idx, 1)
const handleSubmit = async () => {
  submitting.value = true
  error.value = ''
  try {
    const res = await fetch('http://localhost:8000/api/v1/checklists/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, is_template: true })
    })
    if (!res.ok) throw new Error('Failed to create template')
    emit('created')
    emit('close')
  } catch (e: any) {
    error.value = e.message || 'Failed to create template'
  } finally {
    submitting.value = false
  }
}
</script> 