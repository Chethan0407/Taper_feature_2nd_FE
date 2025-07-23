<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center py-12">
    <div class="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-2xl rounded-2xl p-8 w-full max-w-lg">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">User Profile</h1>
      <form @submit.prevent="saveProfile" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
          <input v-model="form.name" :disabled="loading" class="input-field w-full rounded-full px-4 py-2" placeholder="Your name" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
          <input :value="form.email" disabled class="input-field w-full rounded-full px-4 py-2 bg-gray-100 dark:bg-dark-800 text-gray-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
          <select v-model="form.role" :disabled="!canEditRole || loading" class="input-field w-full rounded-full px-4 py-2">
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
          </select>
          <div v-if="!canEditRole" class="text-xs text-gray-400 mt-1">You do not have permission to change your role.</div>
        </div>
        <button type="submit" class="btn-primary w-full text-base font-semibold py-3 flex items-center justify-center gap-2 transition-transform active:scale-95" :disabled="loading">
          <span v-if="loading" class="animate-spin">⏳</span>
          <span v-else>💾</span>
          <span>{{ loading ? 'Saving...' : 'Save Changes' }}</span>
        </button>
        <transition name="fade">
          <div v-if="error" class="text-red-500 mt-2 p-2 rounded bg-red-100 dark:bg-red-900/30 text-sm font-medium">{{ error }}</div>
        </transition>
        <transition name="fade">
          <div v-if="success" class="text-green-600 mt-2 p-2 rounded bg-green-100 dark:bg-green-900/30 text-sm font-medium">Profile updated!</div>
        </transition>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

interface UserProfile {
  name: string
  email: string
  role: string
}

const form = ref<UserProfile>({ name: '', email: '', role: 'user' })
const loading = ref(false)
const error = ref('')
const success = ref(false)
// Mock permission (replace with real permission logic)
const canEditRole = ref(true)

async function fetchProfile() {
  loading.value = true
  error.value = ''
  try {
    const headers = authStore.getAuthHeader() || {}
    const res = await fetch('/api/v1/user/profile', { headers })
    if (!res.ok) throw new Error('Failed to fetch profile')
    const data = await res.json()
    form.value = { name: data.name, email: data.email, role: data.role }
    // Set canEditRole based on permissions if available
    // canEditRole.value = data.can_edit_role
  } catch (e: any) {
    error.value = e.message || 'Failed to fetch profile'
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  loading.value = true
  error.value = ''
  success.value = false
  try {
    const headers = {
      ...authStore.getAuthHeader(),
      'Content-Type': 'application/json'
    }
    const res = await fetch('/api/v1/user/profile', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ name: form.value.name, role: form.value.role })
    })
    if (!res.ok) throw new Error('Failed to update profile')
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