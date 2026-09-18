<template>
  <section
    id="integrations"
    class="settings-card scroll-mt-8"
    data-testid="settings-integrations"
  >
    <div class="settings-card-body space-y-8">
      <div>
        <h2 class="module-section-title text-lg">Integrations</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-gray-400">
          Cursor / Claude MCP (API keys), plus inbound Jira / GitLab / GitHub / Jenkins. Bidirectional sync remains roadmap.
        </p>
      </div>

      <SettingsAgentAccessPanel />

      <div class="rounded-xl border border-slate-200 p-4 dark:border-dark-600">
        <h3 class="text-sm font-semibold text-slate-800 dark:text-gray-100">Create inbound connector</h3>
        <form class="mt-3 grid gap-3 sm:grid-cols-2" @submit.prevent="createConnector">
          <div>
            <label class="mb-1 block text-xs uppercase tracking-wide text-slate-400">Provider</label>
            <select v-model="form.provider" class="input-field w-full" required>
              <option value="jira">Jira</option>
              <option value="gitlab">GitLab</option>
              <option value="github">GitHub</option>
              <option value="jenkins">Jenkins</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs uppercase tracking-wide text-slate-400">Company ID</label>
            <input v-model.number="form.company_id" type="number" min="1" class="input-field w-full" required />
          </div>
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs uppercase tracking-wide text-slate-400">Name (optional)</label>
            <input v-model="form.name" class="input-field w-full" placeholder="Prod Jira inbound" />
          </div>
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs uppercase tracking-wide text-slate-400">Shared secret (optional)</label>
            <input v-model="form.secret" class="input-field w-full" placeholder="Used as X-TapeOutOps-Secret for CI hooks" />
          </div>
          <div class="sm:col-span-2">
            <button type="submit" class="btn-primary px-4 py-2 text-sm" :disabled="createBusy">
              {{ createBusy ? 'Creating…' : 'Create connector' }}
            </button>
            <p v-if="createMsg" class="mt-2 text-sm" :class="createErr ? 'text-red-500' : 'text-emerald-500'">
              {{ createMsg }}
            </p>
            <p v-if="lastSecret" class="mt-2 break-all text-xs text-amber-400">
              Save this secret now — shown once: {{ lastSecret }}
            </p>
          </div>
        </form>
      </div>

      <div>
        <div class="mb-3 flex items-center justify-between gap-2">
          <h3 class="text-sm font-semibold text-slate-800 dark:text-gray-100">Connectors</h3>
          <button type="button" class="text-sm text-neon-blue hover:underline" @click="loadConnectors">Refresh</button>
        </div>
        <p v-if="connectorsError" class="mb-2 text-sm text-amber-400">{{ connectorsError }}</p>
        <div v-if="connectorsLoading" class="py-4 text-sm text-slate-500">Loading connectors…</div>
        <div
          v-else-if="!connectors.length"
          class="rounded-xl border border-dashed border-slate-300 py-6 text-center text-sm text-slate-500 dark:border-dark-600"
        >
          No connectors yet.
        </div>
        <ul v-else class="space-y-2">
          <li
            v-for="c in connectors"
            :key="c.id"
            class="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-dark-600"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="font-medium text-slate-800 dark:text-gray-100">
                {{ c.name || c.provider }}
                <span class="ml-1 text-xs font-normal text-slate-400">{{ c.provider }}</span>
              </span>
              <span :class="c.is_active ? 'text-emerald-400' : 'text-slate-400'">
                {{ c.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <p class="mt-1 break-all text-xs text-slate-500">Inbound: {{ c.inbound_path }}</p>
            <p class="text-xs text-slate-500">Secret hint: {{ c.secret_hint }}</p>
          </li>
        </ul>
      </div>

      <div>
        <div class="mb-3 flex items-center justify-between gap-2">
          <h3 class="text-sm font-semibold text-slate-800 dark:text-gray-100">Recent inbound events</h3>
          <button type="button" class="text-sm text-neon-blue hover:underline" @click="loadEvents">Refresh</button>
        </div>
        <p v-if="eventsError" class="mb-2 text-sm text-amber-400">{{ eventsError }}</p>
        <div v-if="eventsLoading" class="py-4 text-sm text-slate-500">Loading events…</div>
        <div
          v-else-if="!events.length"
          class="rounded-xl border border-dashed border-slate-300 py-6 text-center text-sm text-slate-500 dark:border-dark-600"
        >
          No integration events yet.
        </div>
        <ul v-else class="space-y-2">
          <li
            v-for="ev in events"
            :key="ev.id"
            class="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-dark-600"
          >
            <div class="flex flex-wrap justify-between gap-2">
              <span class="font-medium">{{ ev.provider }} · {{ ev.event_type || 'event' }}</span>
              <span class="text-xs text-slate-400">{{ ev.status }}</span>
            </div>
            <p class="mt-1 text-xs text-slate-500">{{ formatWhen(ev.created_at) }}</p>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import SettingsAgentAccessPanel from '@/components/Settings/SettingsAgentAccessPanel.vue'
import {
  createIntegrationConnector,
  listIntegrationConnectors,
  listIntegrationEvents,
  type IntegrationConnector,
  type IntegrationEvent,
} from '@/api/product-surfaces'

const authStore = useAuthStore()

const connectors = ref<IntegrationConnector[]>([])
const connectorsLoading = ref(false)
const connectorsError = ref('')
const events = ref<IntegrationEvent[]>([])
const eventsLoading = ref(false)
const eventsError = ref('')

const createBusy = ref(false)
const createMsg = ref('')
const createErr = ref(false)
const lastSecret = ref('')

const form = reactive({
  provider: 'jira',
  company_id: 1,
  name: '',
  secret: '',
})

function formatWhen(v?: string | null) {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleString()
  } catch {
    return v
  }
}

function companyIdFromUser(): number {
  const u = authStore.user as Record<string, unknown> | null
  const raw = u?.company_id ?? u?.companyId
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 1
}

async function loadConnectors() {
  connectorsLoading.value = true
  connectorsError.value = ''
  try {
    connectors.value = await listIntegrationConnectors(form.company_id || undefined)
  } catch (e: any) {
    connectorsError.value = e?.message || 'Failed to load connectors'
    connectors.value = []
  } finally {
    connectorsLoading.value = false
  }
}

async function loadEvents() {
  eventsLoading.value = true
  eventsError.value = ''
  try {
    events.value = await listIntegrationEvents({
      company_id: form.company_id || undefined,
      limit: 40,
    })
  } catch (e: any) {
    eventsError.value = e?.message || 'Failed to load events'
    events.value = []
  } finally {
    eventsLoading.value = false
  }
}

async function createConnector() {
  createBusy.value = true
  createMsg.value = ''
  createErr.value = false
  lastSecret.value = ''
  try {
    const created = await createIntegrationConnector({
      provider: form.provider,
      company_id: form.company_id,
      name: form.name || undefined,
      secret: form.secret || undefined,
    })
    createMsg.value = `Connector #${created.id} created`
    if (created.secret) lastSecret.value = created.secret
    form.name = ''
    form.secret = ''
    await Promise.all([loadConnectors(), loadEvents()])
  } catch (e: any) {
    createErr.value = true
    createMsg.value = e?.message || 'Create failed'
  } finally {
    createBusy.value = false
  }
}

onMounted(() => {
  form.company_id = companyIdFromUser()
  void Promise.all([loadConnectors(), loadEvents()])
})
</script>
