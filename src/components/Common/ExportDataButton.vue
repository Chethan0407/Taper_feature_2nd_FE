<template>
  <div v-if="canExport" class="relative inline-flex" data-testid="export-data-button" ref="rootEl">
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-100 dark:hover:bg-dark-700"
      :class="buttonClass"
      :disabled="loading"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="open = !open"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
      </svg>
      <span>{{ loading ? 'Exporting…' : label }}</span>
      <svg class="h-3.5 w-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl dark:border-dark-600 dark:bg-dark-900"
      role="menu"
    >
      <p class="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">Format</p>
      <button
        v-for="fmt in formats"
        :key="fmt"
        type="button"
        class="flex w-full items-center px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-dark-800"
        role="menuitem"
        :disabled="loading"
        @click="runExport(fmt)"
      >
        Export {{ fmt.toUpperCase() }}
      </button>
    </div>

    <p
      v-if="error"
      class="absolute left-0 top-full z-40 mt-2 max-w-xs rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 shadow dark:bg-red-950/40 dark:text-red-300"
      data-testid="export-error"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  downloadExport,
  type ExportFormat,
  type ExportResource,
} from '@/utils/exports-api'

const props = withDefaults(
  defineProps<{
    resource: ExportResource
    label?: string
    formats?: ExportFormat[]
    buttonClass?: string
    /** Specs-only optional filters */
    status?: string
    platform?: string
    limit?: number
  }>(),
  {
    label: 'Export',
    formats: () => ['csv', 'xlsx', 'json'],
    buttonClass: '',
  },
)

const emit = defineEmits<{
  (e: 'exported', format: ExportFormat): void
  (e: 'error', message: string): void
}>()

const authStore = useAuthStore()
const authReady = ref(false)

const canExport = computed(() => authReady.value && authStore.canManageDataTransfer === true)

const open = ref(false)
const loading = ref(false)
const error = ref('')
const rootEl = ref<HTMLElement | null>(null)

async function runExport(format: ExportFormat) {
  open.value = false
  loading.value = true
  error.value = ''
  try {
    await downloadExport(props.resource, {
      format,
      limit: props.limit,
      status: props.status,
      platform: props.platform,
    })
    emit('exported', format)
  } catch (e: any) {
    const msg = e?.message || 'Export failed'
    error.value = msg
    emit('error', msg)
    setTimeout(() => {
      if (error.value === msg) error.value = ''
    }, 6000)
  } finally {
    loading.value = false
  }
}

function onDocClick(ev: MouseEvent) {
  if (!rootEl.value) return
  if (!rootEl.value.contains(ev.target as Node)) open.value = false
}

onMounted(async () => {
  document.addEventListener('click', onDocClick)
  try {
    // List pages only check token — load /me so is_superuser is accurate
    if (authStore.token && !authStore.user) {
      await authStore.checkAuth()
    }
  } finally {
    authReady.value = true
  }
})
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>
