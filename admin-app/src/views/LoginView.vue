<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-dark-950">
    <div class="w-full max-w-md">
      <div class="rounded-2xl border border-dark-700 bg-dark-900 p-8 shadow-xl">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gradient">TapeOutOps Admin</h1>
          <p class="text-gray-400 mt-2">System Usage · Internal dashboard</p>
        </div>
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="input w-full"
              placeholder="Admin email"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="input w-full"
              placeholder="Password"
            />
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 rounded-lg font-semibold bg-neon-blue text-dark-900 hover:opacity-90 disabled:opacity-50"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
          <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const getBaseUrl = () => {
  const base = import.meta.env.VITE_API_BASE
  if (base && base.trim() !== '') return base.replace(/\/$/, '')
  return ''
}

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const base = getBaseUrl() || ''
    const res = await fetch(`${base}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim(), password: password.value }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      error.value = data.detail || data.message || 'Login failed'
      return
    }
    const token = data.token || data.access_token
    if (!token) {
      error.value = 'No token received'
      return
    }
    authStore.setToken(token.startsWith('Bearer ') ? token.slice(7) : token)
    router.push('/')
  } catch (e: any) {
    error.value = e.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.input {
  @apply bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue/50;
}
</style>
