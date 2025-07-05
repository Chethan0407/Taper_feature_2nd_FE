<template>
  <div class="min-h-screen bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Settings</h1>
          <p class="text-gray-400">Manage your account and organization settings</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- User Settings -->
          <div class="card">
            <h2 class="text-xl font-semibold text-white mb-6">User Profile</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input class="input-field w-full" v-model="profile.name" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input class="input-field w-full" v-model="profile.email" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select class="input-field w-full" v-model="profile.role">
                  <option>Lead Engineer</option>
                  <option>Manager</option>
                  <option>Admin</option>
                </select>
              </div>
              <button class="btn-primary" @click="updateProfile">Update Profile</button>
            </div>
          </div>

          <!-- API Keys -->
          <div class="card">
            <h2 class="text-xl font-semibold text-white mb-6">API Keys</h2>
            <div class="space-y-4">
              <div class="p-4 bg-dark-800 rounded-lg border border-dark-600" v-for="key in apiKeys" :key="key.id">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-white">Production API Key</p>
                    <p class="text-sm text-gray-400">••••••••••••••••••••</p>
                  </div>
                  <button class="text-neon-blue hover:text-neon-blue/80 text-sm" @click="regenerateApiKey(key.id)">Regenerate</button>
                </div>
              </div>
              <button class="btn-secondary w-full" @click="generateApiKey">Generate New Key</button>
            </div>
          </div>

          <!-- Notifications -->
          <div class="card">
            <h2 class="text-xl font-semibold text-white mb-6">Notifications</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-white">Email Notifications</p>
                  <p class="text-sm text-gray-400">Receive updates via email</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer" checked>
                  <div class="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-blue"></div>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-white">Spec Review Alerts</p>
                  <p class="text-sm text-gray-400">Get notified when specs need review</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer" checked>
                  <div class="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-blue"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- Branding -->
          <div class="card">
            <h2 class="text-xl font-semibold text-white mb-6">Branding</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                <input class="input-field w-full" value="Acme Semiconductor" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Logo</label>
                <div class="border-2 border-dashed border-dark-600 rounded-lg p-4 text-center">
                  <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <p class="text-sm text-gray-400">Upload company logo</p>
                </div>
              </div>
              <button class="btn-primary">Save Branding</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { onMounted, ref } from 'vue'

const profile = ref({ name: '', email: '', role: '' })
const apiKeys = ref<{ id: string; [key: string]: any }[]>([])
const branding = ref({})
const notifications = ref({})
const deletingKey = ref<string | null>(null)
const patchingProfile = ref(false)
const updatingBranding = ref(false)
const updatingNotifications = ref(false)

onMounted(async () => {
  const profileRes = await fetch('/api/v1/settings/profile/')
  if (profileRes.ok) {
    profile.value = await profileRes.json()
  }
  const keysRes = await fetch('/api/v1/settings/api-keys/')
  if (keysRes.ok) {
    apiKeys.value = await keysRes.json()
  }
})

const updateProfile = async () => {
  await fetch('/api/v1/settings/profile/', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile.value)
  })
}

const generateApiKey = async () => {
  await fetch('/api/v1/settings/api-keys/', { method: 'POST' })
}

const regenerateApiKey = async (keyId: string) => {
  await fetch(`/api/v1/settings/api-keys/${keyId}/regenerate`, { method: 'POST' })
}
</script> 