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
    const controller = new AbortController()
    const t = window.setTimeout(() => controller.abort(), 20_000)
    try {
      const json = (path: string) =>
        fetch(path, { signal: controller.signal }).then(async (r) => {
          if (!r.ok) throw new Error(`${path} (${r.status})`)
          return r.json()
        })
      ;[platforms.value, edaTools.value, types.value, statuses.value] = await Promise.all([
        json('/api/v1/metadata/platforms'),
        json('/api/v1/metadata/eda-tools'),
        json('/api/v1/metadata/types'),
        json('/api/v1/metadata/statuses'),
      ])
    } catch (e: any) {
      error.value =
        e?.name === 'AbortError'
          ? 'Metadata request timed out — is the API running on port 8000?'
          : e.message || 'Failed to load metadata'
    } finally {
      clearTimeout(t)
      loading.value = false
    }
  }

  return { platforms, edaTools, types, statuses, loading, error, fetchMetadata }
}) 