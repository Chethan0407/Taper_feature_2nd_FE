<template>
  <div v-if="canExport" class="relative inline-flex shrink-0" data-testid="admin-exports-menu" ref="rootEl">
    <button
      ref="triggerEl"
      type="button"
      class="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
      :disabled="loading"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click.stop="toggle"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
      </svg>
      <span>{{ loading ? 'Exporting…' : 'Export' }}</span>
      <svg class="h-3.5 w-3.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="menuEl"
        class="fixed z-[9999] w-72 overflow-y-auto rounded-xl border border-slate-700 bg-slate-950 py-1 shadow-2xl shadow-black/50"
        role="menu"
        :style="menuStyle"
        @click.stop
      >
        <p class="sticky top-0 z-10 bg-slate-950 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
          {{ selectedResource ? 'Format' : 'Resource' }}
        </p>

        <template v-if="!selectedResource">
          <button
            v-for="res in resources"
            :key="res.id"
            type="button"
            class="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-900"
            role="menuitem"
            :data-testid="`export-resource-${res.id}`"
            @click.stop="selectedResource = res.id"
          >
            <span>{{ res.label }}</span>
            <span class="text-xs text-slate-500">›</span>
          </button>
        </template>

        <template v-else>
          <button
            type="button"
            class="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-neon-blue hover:bg-slate-900"
            @click.stop="selectedResource = null"
          >
            ← {{ resourceLabel(selectedResource) }}
          </button>
          <button
            v-for="fmt in formats"
            :key="fmt"
            type="button"
            class="flex w-full items-center px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-900"
            role="menuitem"
            :data-testid="`export-format-${fmt}`"
            :disabled="loading"
            @click.stop="runExport(fmt)"
          >
            Export {{ fmt.toUpperCase() }}
          </button>
        </template>
      </div>
    </Teleport>

    <p
      v-if="error"
      class="absolute left-0 top-full z-[80] mt-2 max-w-xs rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 shadow dark:bg-red-950/40 dark:text-red-300"
      data-testid="admin-export-error"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  downloadExport,
  fetchExportTypes,
  type ExportFormat,
  type ExportResource,
} from '@/utils/exports-api'

const DEFAULT_RESOURCES: Array<{ id: ExportResource; label: string }> = [
  { id: 'users', label: 'Users' },
  { id: 'companies', label: 'Companies' },
  { id: 'projects', label: 'Projects' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'checklist-templates', label: 'Checklist templates' },
  { id: 'active-checklists', label: 'Active checklists' },
]

const DEFAULT_FORMATS: ExportFormat[] = ['csv', 'xlsx', 'json']

const authStore = useAuthStore()
const authReady = ref(false)
const canExport = computed(() => authReady.value && authStore.canManageDataTransfer === true)

const open = ref(false)
const loading = ref(false)
const error = ref('')
const rootEl = ref<HTMLElement | null>(null)
const triggerEl = ref<HTMLElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)
const selectedResource = ref<ExportResource | null>(null)
const resources = ref([...DEFAULT_RESOURCES])
const formats = ref<ExportFormat[]>([...DEFAULT_FORMATS])
const menuTop = ref(0)
const menuLeft = ref(0)
const menuMaxHeight = ref(320)

const menuStyle = computed(() => ({
  top: `${menuTop.value}px`,
  left: `${menuLeft.value}px`,
  maxHeight: `${menuMaxHeight.value}px`,
}))

function placeMenu() {
  const el = triggerEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const width = 288
  const gap = 8
  const pad = 12
  const estimatedHeight = selectedResource.value
    ? 48 + formats.value.length * 44
    : 36 + resources.value.length * 44

  const spaceBelow = window.innerHeight - rect.bottom - pad
  const spaceAbove = rect.top - pad
  const openUp = spaceBelow < Math.min(estimatedHeight, 280) && spaceAbove > spaceBelow

  const maxH = Math.max(160, Math.min(360, openUp ? spaceAbove - gap : spaceBelow - gap))
  menuMaxHeight.value = maxH

  if (openUp) {
    menuTop.value = Math.max(pad, rect.top - gap - Math.min(estimatedHeight, maxH))
  } else {
    menuTop.value = rect.bottom + gap
  }

  // Prefer aligning to the left edge of the trigger (Settings layout)
  let left = rect.left
  if (left + width > window.innerWidth - pad) {
    left = Math.max(pad, rect.right - width)
  }
  if (left < pad) left = pad
  menuLeft.value = left
}

async function toggle() {
  open.value = !open.value
  if (open.value) {
    selectedResource.value = null
    await nextTick()
    placeMenu()
  }
}

function resourceLabel(id: ExportResource) {
  return resources.value.find((r) => r.id === id)?.label || id
}

async function runExport(format: ExportFormat) {
  if (!selectedResource.value) return
  const resource = selectedResource.value
  open.value = false
  loading.value = true
  error.value = ''
  try {
    await downloadExport(resource, { format })
  } catch (e: any) {
    error.value = e?.message || 'Export failed'
    setTimeout(() => {
      if (error.value === e?.message) error.value = ''
    }, 6000)
  } finally {
    loading.value = false
    selectedResource.value = null
  }
}

function onDocClick(ev: MouseEvent) {
  const t = ev.target as Node
  if (rootEl.value?.contains(t) || menuEl.value?.contains(t)) return
  open.value = false
  selectedResource.value = null
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    open.value = false
    selectedResource.value = null
  }
}

function onScrollOrResize() {
  if (open.value) placeMenu()
}

watch(selectedResource, async () => {
  if (open.value) {
    await nextTick()
    placeMenu()
  }
})

onMounted(async () => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
  window.addEventListener('resize', onScrollOrResize)
  window.addEventListener('scroll', onScrollOrResize, true)
  try {
    if (authStore.token && !authStore.user) {
      await authStore.checkAuth()
    }
    if (authStore.canManageDataTransfer) {
      try {
        const types = await fetchExportTypes()
        const fromApi = (types.resources || [])
          .map((r) => {
            const id = String(r.id || r.value || '').trim() as ExportResource
            const label = String(r.name || r.label || id)
            return id ? { id, label } : null
          })
          .filter(Boolean) as Array<{ id: ExportResource; label: string }>
        if (fromApi.length) resources.value = fromApi

        const fmts = (types.formats || [])
          .map((f) => (typeof f === 'string' ? f : String(f.id || f.value || '')).toLowerCase())
          .filter((f): f is ExportFormat => f === 'csv' || f === 'xlsx' || f === 'json')
        if (fmts.length) formats.value = fmts
      } catch {
        /* keep defaults */
      }
    }
  } finally {
    authReady.value = true
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onScrollOrResize)
  window.removeEventListener('scroll', onScrollOrResize, true)
})
</script>
