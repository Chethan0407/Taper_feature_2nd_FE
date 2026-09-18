<template>
  <section data-testid="vendor-performance" class="module-panel module-panel-accent overflow-hidden p-6">
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="module-section-title">Vendor performance</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-gray-400">
          Live SLA and staging signals — metadata / NDA / acknowledgement staging only.
        </p>
      </div>
      <button
        type="button"
        class="text-sm font-medium text-neon-blue hover:underline disabled:opacity-50"
        :disabled="loading"
        @click="load"
      >
        {{ loading && rows.length ? 'Refreshing…' : 'Refresh' }}
      </button>
    </div>

    <p v-if="note" class="mb-3 text-xs text-slate-500 dark:text-gray-400">{{ note }}</p>
    <p v-if="error" class="mb-3 text-sm text-amber-400">
      {{ error }}
      <button type="button" class="ml-2 font-medium text-neon-blue hover:underline" @click="load">Try again</button>
    </p>
    <div v-if="loading && !rows.length" class="py-6 text-center text-sm text-slate-500">Loading performance…</div>
    <div
      v-else-if="!rows.length"
      class="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500 dark:border-dark-600"
    >
      No vendor performance rows yet.
    </div>
    <div v-else class="overflow-x-auto" :class="{ 'opacity-70': loading }">
      <table class="min-w-full text-left text-sm">
        <thead class="text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th class="py-2 pr-3">Vendor</th>
            <th class="py-2 pr-3">Status</th>
            <th class="py-2 pr-3">Specs</th>
            <th class="py-2 pr-3">Acks</th>
            <th class="py-2 pr-3">SLA</th>
            <th class="py-2 pr-3">Staging</th>
            <th class="py-2">Last activity</th>
          </tr>
        </thead>
        <tbody class="text-slate-700 dark:text-gray-300">
          <tr
            v-for="row in rows"
            :key="String(row.vendor_id)"
            class="border-t border-slate-100 dark:border-dark-700"
          >
            <td class="py-2 pr-3 font-medium">
              {{ row.name }}
              <span v-if="row.type" class="ml-1 text-xs text-slate-400">· {{ row.type }}</span>
            </td>
            <td class="py-2 pr-3">{{ row.status || '—' }}</td>
            <td class="py-2 pr-3">{{ row.linked_specifications ?? 0 }}</td>
            <td class="py-2 pr-3">{{ row.acknowledgements ?? 0 }}</td>
            <td class="py-2 pr-3">
              <span :class="row.sla_breached ? 'text-red-400' : 'text-emerald-400'">
                {{ row.sla_breached ? 'Breached' : 'OK' }}
              </span>
              <span v-if="row.response_sla_hours != null" class="ml-1 text-xs text-slate-400">
                ({{ row.response_sla_hours }}h)
              </span>
            </td>
            <td class="py-2 pr-3">{{ row.staging || '—' }}</td>
            <td class="py-2">{{ formatWhen(row.last_activity_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchVendorPerformance, type VendorPerformanceRow } from '@/api/product-surfaces'
import { isAbortError } from '@/utils/request-coordinator'

const rows = ref<VendorPerformanceRow[]>([])
const note = ref('')
const loading = ref(false)
const error = ref('')

function formatWhen(v?: string | null) {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleString()
  } catch {
    return v
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchVendorPerformance(50)
    rows.value = Array.isArray(data.vendors) ? data.vendors : []
    note.value = data.note || ''
  } catch (e: any) {
    if (isAbortError(e)) return
    error.value = e?.message || 'Failed to load vendor performance'
    // Keep previous rows so the panel does not vanish on a flaky refresh
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})
</script>
