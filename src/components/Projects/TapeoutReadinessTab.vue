<template>
  <div data-testid="tapeout-readiness-tab" class="space-y-8">
    <div v-if="loading" class="py-16 text-center text-sm text-slate-500 dark:text-gray-400">
      Loading tapeout readiness…
    </div>

    <div v-else-if="fatalError" class="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6">
      <h3 class="text-lg font-semibold text-amber-100">Readiness board unavailable</h3>
      <p class="mt-2 text-sm text-amber-100/80">{{ fatalError }}</p>
      <p class="mt-2 text-xs text-amber-100/60">
        This tracks program readiness (gates, freeze, gaps). It does not run DRC/LVS or submit to a foundry MES.
      </p>
      <button type="button" class="btn-secondary mt-4 px-4 py-2 text-sm" @click="reload">Retry</button>
    </div>

    <template v-else>
      <!-- Header strip -->
      <section class="settings-card">
        <div class="settings-card-body !gap-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Tapeout readiness</p>
              <h2 class="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                Score
                <span class="text-neon-blue">{{ scoreLabel }}</span>
              </h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-gray-400">
                Program ops board — upload signoff reports and track freeze state. Tools like Calibre run outside Taper.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span :class="statusBadgeClass(readiness?.tapeout_status || projectTapeoutStatus || 'planning')">
                {{ readiness?.tapeout_status || projectTapeoutStatus || 'planning' }}
              </span>
              <span
                class="rounded-full border px-3 py-1 text-xs font-semibold"
                :class="isFrozen
                  ? 'border-amber-400/50 bg-amber-500/15 text-amber-200'
                  : 'border-slate-600 bg-slate-800 text-slate-300'"
              >
                {{ isFrozen ? 'Design frozen' : 'Design open' }}
              </span>
              <button
                type="button"
                class="btn-primary px-4 py-2 text-sm disabled:opacity-50"
                :disabled="freezeBusy"
                data-testid="readiness-freeze-btn"
                @click="toggleFreeze"
              >
                {{ freezeBusy ? 'Working…' : isFrozen ? 'Unfreeze design' : 'Freeze design' }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div class="rounded-xl border border-slate-200 px-3 py-2 dark:border-dark-600">
              <p class="text-[11px] uppercase tracking-wide text-slate-500">Foundry</p>
              <p class="mt-0.5 font-medium text-slate-900 dark:text-white">{{ profile.foundry || '—' }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 px-3 py-2 dark:border-dark-600">
              <p class="text-[11px] uppercase tracking-wide text-slate-500">Node</p>
              <p class="mt-0.5 font-medium text-slate-900 dark:text-white">{{ profile.node || '—' }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 px-3 py-2 dark:border-dark-600">
              <p class="text-[11px] uppercase tracking-wide text-slate-500">PDK</p>
              <p class="mt-0.5 font-medium text-slate-900 dark:text-white">{{ profile.pdk || '—' }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 px-3 py-2 dark:border-dark-600">
              <p class="text-[11px] uppercase tracking-wide text-slate-500">Blockers</p>
              <p class="mt-0.5 font-medium text-slate-900 dark:text-white">{{ blockers.length }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Blockers -->
      <section class="settings-card" data-testid="readiness-blockers">
        <div class="settings-card-body">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Blockers</h3>
          <p v-if="!blockers.length" class="text-sm text-slate-500 dark:text-gray-400">No blockers reported.</p>
          <ul v-else class="divide-y divide-slate-200 dark:divide-dark-700">
            <li v-for="(b, idx) in blockers" :key="b.id ?? idx" class="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div class="min-w-0">
                <p class="font-medium text-slate-900 dark:text-white">{{ b.title || b.code || 'Blocker' }}</p>
                <p class="mt-0.5 text-sm text-slate-500 dark:text-gray-400">{{ b.message || b.description || '' }}</p>
              </div>
              <span v-if="b.severity" :class="severityBadgeClass(String(b.severity))">{{ b.severity }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Gaps -->
      <section class="settings-card" data-testid="readiness-gaps">
        <div class="settings-card-body">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Gaps</h3>
          <p class="text-sm text-slate-500 dark:text-gray-400">Rule-based checklist of what’s still incomplete.</p>
          <p v-if="gapsError" class="text-sm text-amber-400">{{ gapsError }}</p>
          <p v-else-if="!gaps.length" class="text-sm text-slate-500 dark:text-gray-400">No open gaps.</p>
          <ul v-else class="mt-2 space-y-2">
            <li
              v-for="(g, idx) in gaps"
              :key="g.id ?? idx"
              class="rounded-xl border border-slate-200 px-3 py-2 dark:border-dark-600"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-medium text-slate-900 dark:text-white">{{ g.title || g.code || 'Gap' }}</p>
                  <p class="text-sm text-slate-500 dark:text-gray-400">{{ g.message || g.description || '' }}</p>
                </div>
                <span v-if="g.severity || g.category" class="text-xs text-slate-400">
                  {{ g.severity || g.category }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- Sign-off matrix (GET /projects/{id}/signoff-matrix) -->
      <section data-testid="signoff-matrix" class="settings-card">
        <div class="settings-card-body">
          <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Sign-off matrix</h3>
              <p class="text-sm text-slate-500 dark:text-gray-400">
                DRC / LVS / packaging / foundry gates from the live matrix API. Approve records an audit trail — does not run Calibre.
              </p>
            </div>
            <button type="button" class="text-sm font-medium text-neon-blue hover:underline" @click="loadMatrix">
              Refresh
            </button>
          </div>
          <p v-if="matrixError" class="mb-3 text-sm text-amber-400">{{ matrixError }}</p>
          <div v-if="matrixLoading" class="py-6 text-center text-sm text-slate-500">Loading matrix…</div>
          <div v-else-if="!matrixRows.length" class="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500 dark:border-dark-600">
            No matrix rows yet.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full text-left text-sm">
              <thead class="text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th class="py-2 pr-3">Gate</th>
                  <th class="py-2 pr-3">Owner</th>
                  <th class="py-2 pr-3">Status</th>
                  <th class="py-2 pr-3">Approved by</th>
                  <th class="py-2 pr-3">When</th>
                  <th class="py-2">Action</th>
                </tr>
              </thead>
              <tbody class="text-slate-700 dark:text-gray-300">
                <tr
                  v-for="row in matrixRows"
                  :key="String(row.gate_id)"
                  class="border-t border-slate-100 dark:border-dark-700"
                >
                  <td class="py-2 pr-3 font-medium">{{ row.gate }}</td>
                  <td class="py-2 pr-3">{{ row.owner || '—' }}</td>
                  <td class="py-2 pr-3">{{ row.status }}</td>
                  <td class="py-2 pr-3">{{ row.approved_by || '—' }}</td>
                  <td class="py-2 pr-3">{{ row.when || '—' }}</td>
                  <td class="py-2">
                    <button
                      type="button"
                      class="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 disabled:opacity-50"
                      :disabled="matrixBusyId === row.gate_id || String(row.status_raw || '').toLowerCase() === 'pass'"
                      @click="approveMatrixGate(row)"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Gate cards -->
      <section data-testid="readiness-gates">
        <div class="mb-4 flex items-end justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Signoff gates</h3>
            <p class="text-sm text-slate-500 dark:text-gray-400">
              Mark pass/fail and attach tool reports (upload only — Taper does not execute EDA).
            </p>
          </div>
          <button type="button" class="text-sm font-medium text-neon-blue hover:underline" @click="reloadGates">
            Refresh
          </button>
        </div>

        <p v-if="gatesError" class="mb-3 text-sm text-amber-400">{{ gatesError }}</p>

        <div v-if="!displayGates.length" class="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500 dark:border-dark-600">
          No signoff gates yet. They appear when the backend provisions gate types for this project.
        </div>

        <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="gate in displayGates"
            :key="String(gate.id)"
            class="settings-card"
            :data-testid="`signoff-gate-${gateLabel(gate)}`"
          >
            <div class="settings-card-body !gap-3">
              <div class="flex items-start justify-between gap-2">
                <h4 class="font-semibold text-slate-900 dark:text-white">{{ gateLabel(gate) }}</h4>
                <span :class="statusBadgeClass(gate.status || 'pending')">{{ gate.status || 'pending' }}</span>
              </div>
              <p class="text-xs text-slate-500">
                Tool: {{ gate.tool_name || '—' }}
                <span v-if="gate.tool_version"> · {{ gate.tool_version }}</span>
              </p>

              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 disabled:opacity-50"
                  :disabled="gateBusyId === gate.id"
                  @click="setGateStatus(gate, 'pass')"
                >
                  Mark pass
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 disabled:opacity-50"
                  :disabled="gateBusyId === gate.id"
                  @click="setGateStatus(gate, 'fail')"
                >
                  Mark fail
                </button>
                <label class="cursor-pointer rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700">
                  Upload report
                  <input
                    type="file"
                    class="hidden"
                    :disabled="gateBusyId === gate.id"
                    @change="onUpload($event, gate)"
                  />
                </label>
              </div>
            </div>
          </article>
        </div>
      </section>

      <p v-if="actionMessage" class="text-sm" :class="actionIsError ? 'text-red-400' : 'text-emerald-400'">
        {{ actionMessage }}
      </p>
    </template>

    <TapeoutOpsExtras
      v-if="!loading"
      class="mt-8"
      :project-id="projectId"
      @changed="onExtrasChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { statusBadgeClass, severityBadgeClass } from '@/utils/status-badge'
import TapeoutOpsExtras from '@/components/Projects/TapeoutOpsExtras.vue'
import {
  fetchProjectReadiness,
  fetchProjectGaps,
  fetchSignoffGates,
  freezeProject,
  unfreezeProject,
  patchSignoffGate,
  uploadSignoffGateReport,
  type ProjectReadiness,
  type ProjectGap,
  type SignoffGate,
  type ReadinessBlocker,
} from '@/utils/readiness-api'
import {
  fetchSignoffMatrix,
  approveSignoffGate,
  type SignoffMatrixRow,
} from '@/api/product-surfaces'

const props = defineProps<{
  projectId: string | number
  foundry?: string
  processNode?: string
  pdkVersion?: string
  projectTapeoutStatus?: string
}>()

const loading = ref(true)
const fatalError = ref('')
const readiness = ref<ProjectReadiness | null>(null)
const gaps = ref<ProjectGap[]>([])
const gapsError = ref('')
const gates = ref<SignoffGate[]>([])
const gatesError = ref('')
const freezeBusy = ref(false)
const gateBusyId = ref<string | number | null>(null)
const actionMessage = ref('')
const actionIsError = ref(false)

const matrixRows = ref<SignoffMatrixRow[]>([])
const matrixLoading = ref(false)
const matrixError = ref('')
const matrixBusyId = ref<string | number | null>(null)

const isFrozen = computed(() => Boolean(readiness.value?.is_design_frozen))

const scoreLabel = computed(() => {
  const s = readiness.value?.readiness_score
  if (s == null || Number.isNaN(Number(s))) return '—'
  return `${Number(s)}%`
})

const blockers = computed<ReadinessBlocker[]>(() => {
  const list = readiness.value?.blockers
  return Array.isArray(list) ? list : []
})

const profile = computed(() => ({
  foundry: readiness.value?.foundry || props.foundry || '',
  node: readiness.value?.process_node || readiness.value?.node || props.processNode || '',
  pdk: readiness.value?.pdk_version || props.pdkVersion || '',
}))

const DEFAULT_GATE_TYPES = ['DRC', 'LVS', 'STA', 'IR_EM', 'DFT']

const displayGates = computed(() => {
  if (gates.value.length) return gates.value
  // Fall back to readiness.gates summary if list endpoint empty
  const summary = readiness.value?.gates
  if (Array.isArray(summary) && summary.length) {
    return summary.map((g, i) => ({
      id: g.id ?? `summary-${i}`,
      gate_type: g.gate_type || g.type || g.name,
      status: g.status,
      tool_name: g.tool_name,
      tool_version: g.tool_version,
    })) as SignoffGate[]
  }
  return []
})

function gateLabel(gate: SignoffGate) {
  return String(gate.gate_type || gate.type || gate.name || gate.id || 'Gate')
}

function flash(msg: string, isError = false) {
  actionMessage.value = msg
  actionIsError.value = isError
  window.setTimeout(() => {
    if (actionMessage.value === msg) actionMessage.value = ''
  }, 4000)
}

async function loadReadiness() {
  readiness.value = await fetchProjectReadiness(props.projectId)
}

async function loadGaps() {
  gapsError.value = ''
  try {
    gaps.value = await fetchProjectGaps(props.projectId)
  } catch (e: any) {
    gapsError.value = e?.message || 'Failed to load gaps'
    gaps.value = []
  }
}

async function loadGates() {
  gatesError.value = ''
  try {
    gates.value = await fetchSignoffGates(props.projectId)
  } catch (e: any) {
    gatesError.value = e?.message || 'Failed to load gates'
    gates.value = []
  }
}

async function loadMatrix() {
  matrixLoading.value = true
  matrixError.value = ''
  try {
    const data = await fetchSignoffMatrix(props.projectId)
    matrixRows.value = Array.isArray(data.gates) ? data.gates : []
  } catch (e: any) {
    matrixError.value = e?.message || 'Failed to load sign-off matrix'
    matrixRows.value = []
  } finally {
    matrixLoading.value = false
  }
}

async function approveMatrixGate(row: SignoffMatrixRow) {
  matrixBusyId.value = row.gate_id
  try {
    await approveSignoffGate(props.projectId, row.gate_id)
    flash(`${row.gate} approved`)
    await Promise.all([loadMatrix(), loadGates(), loadReadiness()])
  } catch (e: any) {
    flash(e?.message || 'Approve failed', true)
  } finally {
    matrixBusyId.value = null
  }
}

async function reload() {
  loading.value = true
  fatalError.value = ''
  try {
    await Promise.all([loadReadiness(), loadGaps(), loadGates(), loadMatrix()])
  } catch (e: any) {
    fatalError.value = e?.message || 'Failed to load readiness board'
  } finally {
    loading.value = false
  }
}

async function reloadGates() {
  await loadGates()
}

async function toggleFreeze() {
  freezeBusy.value = true
  try {
    if (isFrozen.value) {
      await unfreezeProject(props.projectId)
      flash('Design unfrozen')
    } else {
      await freezeProject(props.projectId)
      flash('Design frozen')
    }
    await loadReadiness()
  } catch (e: any) {
    flash(e?.message || 'Freeze action failed', true)
  } finally {
    freezeBusy.value = false
  }
}

async function setGateStatus(gate: SignoffGate, status: string) {
  gateBusyId.value = gate.id
  try {
    await patchSignoffGate(props.projectId, gate.id, {
      status,
      tool_name: gate.tool_name || undefined,
    })
    flash(`${gateLabel(gate)} marked ${status}`)
    await Promise.all([loadGates(), loadReadiness()])
  } catch (e: any) {
    flash(e?.message || 'Failed to update gate', true)
  } finally {
    gateBusyId.value = null
  }
}

async function onUpload(ev: Event, gate: SignoffGate) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  gateBusyId.value = gate.id
  try {
    await uploadSignoffGateReport(props.projectId, gate.id, file, {
      tool_name: gate.tool_name || undefined,
    })
    flash(`Report uploaded for ${gateLabel(gate)}`)
    await Promise.all([loadGates(), loadReadiness()])
  } catch (e: any) {
    flash(e?.message || 'Upload failed', true)
  } finally {
    gateBusyId.value = null
  }
}

async function onExtrasChanged() {
  try {
    await loadReadiness()
  } catch {
    /* ignore */
  }
}

watch(
  () => props.projectId,
  () => {
    if (props.projectId != null && props.projectId !== '') reload()
  },
)

onMounted(() => {
  void DEFAULT_GATE_TYPES
  reload()
})
</script>
