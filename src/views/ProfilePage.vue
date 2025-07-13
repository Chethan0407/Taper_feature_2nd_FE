<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-950 flex flex-col items-center justify-center">
    <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl p-10 w-full max-w-md">
      <div class="flex flex-col items-center mb-8">
        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-3xl font-bold text-white mb-4">
          {{ profile.name ? profile.name.charAt(0).toUpperCase() : '?' }}
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">{{ profile.name }}</h2>
      </div>
      <form @submit.prevent="updateProfile" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
          <input v-model="profileForm.name" class="input-field w-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 focus:ring-blue-500 dark:focus:ring-neon-blue text-gray-900 dark:text-gray-100" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
          <select v-model="profileForm.role" class="input-field w-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 focus:ring-blue-500 dark:focus:ring-neon-blue text-gray-900 dark:text-gray-100">
            <option value="Lead Engineer">Lead Engineer</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <button type="submit" class="btn-primary w-full" :disabled="loading">Save Changes</button>
        <div v-if="success" class="text-green-400 text-center mt-2">Profile updated successfully!</div>
        <div v-if="error" class="text-red-400 text-center mt-2">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

const profile = ref({ name: '', email: '', role: '' })
const profileForm = ref({ name: '', role: '' })
const loading = ref(false)
const success = ref(false)
const error = ref('')

const fetchProfile = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('/api/v1/settings/profile/')
    if (!res.ok) throw new Error('Failed to fetch profile')
    const data = await res.json()
    profile.value = data
    profileForm.value = { name: data.name || '', role: data.role || '' }
  } catch (e: any) {
    error.value = e.message || 'Failed to fetch profile'
  } finally {
    loading.value = false
  }
}

const updateProfile = async () => {
  loading.value = true
  error.value = ''
  success.value = false
  try {
    const res = await fetch('/api/v1/settings/profile/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: profileForm.value.name, role: profileForm.value.role })
    })
    if (!res.ok) throw new Error('Failed to update profile')
    await fetchProfile()
    await authStore.checkAuth() // Refresh global user for sidebar
    success.value = true
    setTimeout(() => { success.value = false }, 2000)
  } catch (e: any) {
    error.value = e.message || 'Failed to update profile'
  } finally {
    loading.value = false
  }
}

onMounted(fetchProfile)
</script> 