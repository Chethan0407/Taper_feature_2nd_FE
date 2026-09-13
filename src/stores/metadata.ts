import { defineStore } from 'pinia'
import { ref } from 'vue'

function asStringList(data: unknown): string[] {
  if (!Array.isArray(data)) return []
  return data
    .map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') {
        const o = item as Record<string, unknown>
        return String(o.value || o.name || o.label || o.id || '')
      }
      return ''
    })
    .filter(Boolean)
}

async function fetchList(path: string, signal: AbortSignal): Promise<string[]> {
  const res = await fetch(path, { signal })
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`${path} (${res.status})`)
  return asStringList(await res.json())
}

export const useMetadataStore = defineStore('metadata', () => {
  const platforms = ref<string[]>([])
  const edaTools = ref<string[]>([])
  const types = ref<string[]>([])
  const statuses = ref<string[]>([])
  const processNodes = ref<string[]>([])
  const tapeoutStatuses = ref<string[]>([])
  const signoffGateTypes = ref<string[]>([])
  const signoffGateStatuses = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchMetadata = async () => {
    loading.value = true
    error.value = null
    const controller = new AbortController()
    const t = window.setTimeout(() => controller.abort(), 20_000)
    try {
      const [
        platformsRes,
        edaToolsRes,
        typesRes,
        statusesRes,
        processNodesRes,
        tapeoutStatusesRes,
        gateTypesRes,
        gateStatusesRes,
      ] = await Promise.all([
        fetchList('/api/v1/metadata/platforms', controller.signal),
        fetchList('/api/v1/metadata/eda-tools', controller.signal),
        fetchList('/api/v1/metadata/types', controller.signal),
        fetchList('/api/v1/metadata/statuses', controller.signal),
        fetchList('/api/v1/metadata/process-nodes', controller.signal).catch(() => []),
        fetchList('/api/v1/metadata/tapeout-statuses', controller.signal).catch(() => []),
        fetchList('/api/v1/metadata/signoff-gate-types', controller.signal).catch(() => []),
        fetchList('/api/v1/metadata/signoff-gate-statuses', controller.signal).catch(() => []),
      ])
      platforms.value = platformsRes
      edaTools.value = edaToolsRes
      types.value = typesRes
      statuses.value = statusesRes
      processNodes.value = processNodesRes
      tapeoutStatuses.value = tapeoutStatusesRes
      signoffGateTypes.value = gateTypesRes
      signoffGateStatuses.value = gateStatusesRes
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

  return {
    platforms,
    edaTools,
    types,
    statuses,
    processNodes,
    tapeoutStatuses,
    signoffGateTypes,
    signoffGateStatuses,
    loading,
    error,
    fetchMetadata,
  }
})
