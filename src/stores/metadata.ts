import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMetadataStore = defineStore('metadata', () => {
  const platforms = ref<string[]>([])
  const edaTools = ref<string[]>([])
  const types = ref<string[]>([])
  const statuses = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchMetadata = async () => {
    loading.value = true
    error.value = null
    try {
      [platforms.value, edaTools.value, types.value, statuses.value] = await Promise.all([
        fetch('/api/v1/metadata/platforms').then(r => r.json()),
        fetch('/api/v1/metadata/eda-tools').then(r => r.json()),
        fetch('/api/v1/metadata/types').then(r => r.json()),
        fetch('/api/v1/metadata/statuses').then(r => r.json()),
      ])
    } catch (e: any) {
      error.value = e.message || 'Failed to load metadata'
    } finally {
      loading.value = false
    }
  }

  return { platforms, edaTools, types, statuses, loading, error, fetchMetadata }
}) 