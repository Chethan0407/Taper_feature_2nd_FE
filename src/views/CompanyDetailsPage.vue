<template>
  <div class="min-h-screen bg-dark-950 p-8">
    <h1 class="text-3xl font-bold text-white mb-4">Company Details</h1>
    <div v-if="loading" class="text-gray-400">Loading...</div>
    <div v-else-if="error" class="text-red-400">{{ error }}</div>
    <div v-else-if="company">
      <h2 class="text-2xl text-white mb-2 flex items-center gap-4">
        {{ company.name }}
        <span :class="getStatusClass(company.status)" class="px-3 py-1 rounded-full text-xs font-medium">
          {{ company.status }}
        </span>
      </h2>
      <p class="text-gray-300">ID: {{ company.id }}</p>
      <p class="text-gray-400 mt-2">{{ company.description }}</p>
    </div>
    <div v-else class="text-gray-400">No company found.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const company = ref<any>(null)
const loading = ref(true)
const error = ref('')

function getStatusClass(status: string) {
  if (!status) return 'bg-gray-500 text-white border border-gray-500'
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-500 text-white border border-green-500'
    case 'inactive':
      return 'bg-gray-500 text-white border border-gray-500'
    case 'pending':
      return 'bg-yellow-500 text-white border border-yellow-500'
    case 'blocked':
      return 'bg-red-500 text-white border border-red-500'
    default:
      return 'bg-gray-500 text-white border border-gray-500'
  }
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`/api/v1/companies/${route.params.id}`, {
      headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
    })
    if (!res.ok) throw new Error('Failed to fetch company')
    company.value = await res.json()
  } catch (e: any) {
    error.value = e.message || 'Failed to load company'
  } finally {
    loading.value = false
  }
})
</script> 