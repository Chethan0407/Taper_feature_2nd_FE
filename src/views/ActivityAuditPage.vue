<template>
  <div class="min-h-screen app-page">
    <Sidebar />
    <div class="ml-64">
      <Header />
      <main class="p-8">
        <div class="mb-8 page-enter">
          <h1 class="page-title-gradient mb-1">Activity audit</h1>
          <p class="page-subtitle">
            Filterable trail from GET /activity — entity, user, action, and time window.
          </p>
        </div>

        <section data-testid="activity-audit" class="module-panel module-panel-accent overflow-hidden p-6">
          <form class="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" @submit.prevent="load">
            <div>
              <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Entity</label>
              <input v-model="filters.entity" class="input-field w-full" placeholder="project, vendor…" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">User</label>
              <input v-model="filters.user" class="input-field w-full" placeholder="email or name" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Action</label>
              <input v-model="filters.action" class="input-field w-full" placeholder="approve, update…" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Search</label>
              <input v-model="filters.q" class="input-field w-full" placeholder="free text" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Since</label>
              <input v-model="filters.since" type="datetime-local" class="input-field w-full" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Until</label>
              <input v-model="filters.until" type="datetime-local" class="input-field w-full" />
            </div>
            <div class="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
              <button type="submit" class="btn-primary px-4 py-2 text-sm" :disabled="loading">
                {{ loading ? 'Loading…' : 'Apply filters' }}
              </button>
              <button type="button" class="btn-secondary px-4 py-2 text-sm" @click="resetFilters">Reset</button>
            </div>
          </form>

          <p v-if="error" class="mb-3 text-sm text-amber-400">{{ error }}</p>
          <div v-if="loading" class="py-8 text-center text-sm text-slate-500">Loading activity…</div>
          <div
            v-else-if="!rows.length"
            class="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500 dark:border-dark-600"
          >
            No activity matches these filters.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full text-left text-sm">
              <thead class="text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th class="py-2 pr-3">When</th>
                  <th class="py-2 pr-3">User</th>
                  <th class="py-2 pr-3">Action</th>
                  <th class="py-2 pr-3">Entity</th>
                  <th class="py-2">Details</th>
                </tr>
              </thead>
              <tbody class="text-slate-700 dark:text-gray-300">
                <tr
                  v-for="row in rows"
                  :key="String(row.id)"
                  class="border-t border-slate-100 dark:border-dark-700"
                >
                  <td class="py-2 pr-3 whitespace-nowrap">{{ formatWhen(row.timestamp) }}</td>
                  <td class="py-2 pr-3">{{ row.user || '—' }}</td>
                  <td class="py-2 pr-3 font-medium">{{ row.action || '—' }}</td>
                  <td class="py-2 pr-3">
                    {{ row.entity || '—' }}
                    <span v-if="row.entity_id != null" class="text-xs text-slate-400">#{{ row.entity_id }}</span>
                  </td>
                  <td class="py-2 max-w-xs truncate text-xs text-slate-500" :title="detailText(row)">
                    {{ detailText(row) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { fetchActivity, type ActivityLogRow } from '@/api/product-surfaces'

const rows = ref<ActivityLogRow[]>([])
const loading = ref(false)
const error = ref('')

const filters = reactive({
  entity: '',
  user: '',
  action: '',
  q: '',
  since: '',
  until: '',
})

function formatWhen(v?: string | null) {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleString()
  } catch {
    return v
  }
}

function detailText(row: ActivityLogRow) {
  if (!row.details || typeof row.details !== 'object') return '—'
  try {
    return JSON.stringify(row.details)
  } catch {
    return '—'
  }
}

function toIsoLocal(v: string) {
  if (!v) return undefined
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString()
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = await fetchActivity({
      entity: filters.entity || undefined,
      user: filters.user || undefined,
      action: filters.action || undefined,
      q: filters.q || undefined,
      since: toIsoLocal(filters.since),
      until: toIsoLocal(filters.until),
      limit: 100,
    })
  } catch (e: any) {
    error.value = e?.message || 'Failed to load activity'
    rows.value = []
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.entity = ''
  filters.user = ''
  filters.action = ''
  filters.q = ''
  filters.since = ''
  filters.until = ''
  void load()
}

onMounted(() => {
  void load()
})
</script>
