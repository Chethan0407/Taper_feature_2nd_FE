<template>
  <div class="min-h-screen bg-dark-950 p-8">
    <h1 class="text-3xl font-bold text-white mb-4">Spec Details</h1>
    <div v-if="loading" class="text-gray-400">Loading...</div>
    <div v-else-if="error" class="text-red-400">{{ error }}</div>
    <div v-else-if="spec">
      <h2 class="text-2xl text-white mb-2">{{ spec.name }}</h2>
      <p class="text-gray-300">ID: {{ spec.id }}</p>
      <p class="text-gray-400 mt-2">{{ spec.description }}</p>
    </div>
    <div v-else class="text-gray-400">No spec found.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const spec = ref<any>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`/api/v1/specs/${route.params.id}`)
    if (!res.ok) throw new Error('Failed to fetch spec')
    spec.value = await res.json()
  } catch (e: any) {
    error.value = e.message || 'Failed to load spec'
  } finally {
    loading.value = false
  }
})
</script> 