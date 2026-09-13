<template>
  <section
    v-if="canTransfer"
    id="data"
    class="settings-card scroll-mt-8"
    data-testid="settings-export-section"
  >
    <div class="settings-card-body !gap-6">
      <div>
        <h2 class="module-section-title text-lg">Data export &amp; import</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-gray-400">
          Download all data, get an empty template, or upload existing records. Admins and superusers only.
          Spec / NDA binary files are not included — metadata only.
        </p>
      </div>

      <!-- Bulk actions -->
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="rounded-xl border border-sky-500/25 bg-sky-500/5 p-4">
          <p class="text-sm font-semibold text-sky-200">Download all data</p>
          <p class="mt-1 text-xs text-slate-400">GET /api/v1/exports/complete</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              class="btn-primary px-3 py-1.5 text-xs"
              data-testid="download-complete-zip"
              :disabled="busy"
              @click="runComplete('zip')"
            >
              ZIP
            </button>
            <button
              type="button"
              class="btn-secondary px-3 py-1.5 text-xs"
              data-testid="download-complete-json"
              :disabled="busy"
              @click="runComplete('json')"
            >
              JSON
            </button>
          </div>
        </div>

        <div class="rounded-xl border border-violet-500/25 bg-violet-500/5 p-4">
          <p class="text-sm font-semibold text-violet-200">Get template</p>
          <p class="mt-1 text-xs text-slate-400">GET /api/v1/imports/template</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              class="btn-primary px-3 py-1.5 text-xs"
              data-testid="download-import-template-zip"
              :disabled="busy"
              @click="runTemplate('zip')"
            >
              ZIP
            </button>
            <button
              type="button"
              class="btn-secondary px-3 py-1.5 text-xs"
              data-testid="download-import-template-json"
              :disabled="busy"
              @click="runTemplate('json')"
            >
              JSON
            </button>
          </div>
        </div>

        <div class="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
          <p class="text-sm font-semibold text-emerald-200">Upload existing data</p>
          <p class="mt-1 text-xs text-slate-400">POST /api/v1/imports/complete · max 25MB</p>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <label class="btn-primary cursor-pointer px-3 py-1.5 text-xs">
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                accept=".json,.zip,.csv,application/json,application/zip,text/csv"
                data-testid="import-file-input"
                :disabled="busy"
                @change="onFilePicked"
              />
              Choose file
            </label>
            <select
              v-model="csvResource"
              class="input-field max-w-[9rem] rounded-lg px-2 py-1.5 text-xs"
              data-testid="import-csv-resource"
              title="Required for single CSV uploads"
            >
              <option value="">CSV resource…</option>
              <option v-for="r in resources" :key="r.id" :value="r.id">{{ r.label }}</option>
            </select>
          </div>
          <p v-if="pickedName" class="mt-2 truncate text-xs text-slate-400">{{ pickedName }}</p>
        </div>
      </div>

      <!-- Per-table export -->
      <div class="rounded-xl border border-slate-700/80 bg-dark-950/40 p-4">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="text-sm font-semibold text-white">Export one table</p>
            <p class="text-xs text-slate-400">Download a single module as CSV, JSON, or XLSX</p>
          </div>
          <AdminExportsMenu />
        </div>
      </div>

      <p v-if="status" class="text-sm text-emerald-400" data-testid="data-transfer-status">{{ status }}</p>
      <p v-if="error" class="text-sm text-red-400" data-testid="data-transfer-error">{{ error }}</p>

      <div
        v-if="importSummary"
        class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100"
        data-testid="import-results"
      >
        <p class="font-semibold">Import finished</p>
        <p v-if="importSummary.imported_by" class="mt-1 text-xs opacity-80">
          By {{ importSummary.imported_by }}
        </p>
        <ul class="mt-2 space-y-1 text-xs">
          <li v-for="(bucket, key) in importSummary.results || {}" :key="key">
            <span class="font-medium capitalize">{{ key }}</span>:
            created {{ bucket.created ?? 0 }},
            updated {{ bucket.updated ?? 0 }},
            skipped {{ bucket.skipped ?? 0 }}
            <span v-if="bucket.errors?.length" class="text-amber-300">
              · {{ bucket.errors.length }} error(s)
            </span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AdminExportsMenu from '@/components/Common/AdminExportsMenu.vue'
import {
  downloadCompleteExport,
  downloadImportTemplate,
  fetchExportTypes,
  uploadImportComplete,
  type ExportResource,
  type ImportCompleteResponse,
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

const authStore = useAuthStore()
const authReady = ref(false)
const canTransfer = computed(() => authReady.value && authStore.canManageDataTransfer === true)

const busy = ref(false)
const error = ref('')
const status = ref('')
const pickedName = ref('')
const csvResource = ref<ExportResource | ''>('')
const importSummary = ref<ImportCompleteResponse | null>(null)
const resources = ref([...DEFAULT_RESOURCES])
const fileInput = ref<HTMLInputElement | null>(null)

function clearMessagesSoon() {
  setTimeout(() => {
    status.value = ''
  }, 5000)
}

async function runComplete(format: 'json' | 'zip') {
  busy.value = true
  error.value = ''
  status.value = ''
  try {
    await downloadCompleteExport(format)
    status.value = `Complete export (${format.toUpperCase()}) downloaded.`
    clearMessagesSoon()
  } catch (e: any) {
    error.value = e?.message || 'Complete export failed'
  } finally {
    busy.value = false
  }
}

async function runTemplate(format: 'json' | 'zip') {
  busy.value = true
  error.value = ''
  status.value = ''
  try {
    await downloadImportTemplate(format)
    status.value = `Import template (${format.toUpperCase()}) downloaded.`
    clearMessagesSoon()
  } catch (e: any) {
    error.value = e?.message || 'Template download failed'
  } finally {
    busy.value = false
  }
}

async function onFilePicked(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const lower = file.name.toLowerCase()
  const isCsv = lower.endsWith('.csv')
  if (isCsv && !csvResource.value) {
    error.value = 'For a single CSV, choose a CSV resource first (e.g. vendors).'
    input.value = ''
    return
  }
  if (file.size > 25 * 1024 * 1024) {
    error.value = 'File exceeds the 25MB upload limit.'
    input.value = ''
    return
  }

  pickedName.value = file.name
  busy.value = true
  error.value = ''
  status.value = ''
  importSummary.value = null
  try {
    const result = await uploadImportComplete(file, {
      resource: isCsv ? (csvResource.value as ExportResource) : undefined,
    })
    importSummary.value = result
    status.value = 'Upload finished.'
    clearMessagesSoon()
  } catch (e: any) {
    error.value = e?.message || 'Import failed'
  } finally {
    busy.value = false
    input.value = ''
  }
}

onMounted(async () => {
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
      } catch {
        /* keep defaults */
      }
    }
  } finally {
    authReady.value = true
  }
})
</script>
