<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
    <nav class="fixed top-0 left-0 right-0 z-50 border-b border-dark-700 bg-dark-950/80 backdrop-blur-lg">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex cursor-pointer items-center space-x-3" @click="router.push('/')">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple">
            <svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="6" height="6" rx="1" />
              <rect x="15" y="3" width="6" height="6" rx="1" />
              <rect x="3" y="15" width="6" height="6" rx="1" />
              <rect x="15" y="15" width="6" height="6" rx="1" />
            </svg>
          </div>
          <span class="text-gradient text-xl font-bold">TapeOutOps</span>
        </div>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
          @click="router.push('/login')"
        >
          Sign In
        </button>
      </div>
    </nav>

    <div class="px-4 pb-16 pt-32 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl">
        <h1 class="mb-2 text-4xl font-bold text-white md:text-5xl">Security</h1>
        <p class="mb-2 text-gray-400">Controls as reported by the live security API — no invented certifications.</p>
        <p v-if="overview?.updated_at" class="mb-8 text-xs text-gray-500">
          Last updated {{ formatUpdated(overview.updated_at) }}
        </p>

        <div v-if="loading" class="rounded-2xl border border-dark-700 bg-dark-900/60 p-8 text-gray-400">
          Loading security overview…
        </div>
        <div v-else-if="loadError" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-red-300">
          {{ loadError }}
        </div>

        <div v-else class="space-y-8 rounded-2xl border border-dark-700 bg-dark-900/60 p-8 md:p-12">
          <p v-if="overview?.data_boundary" class="rounded-xl border border-dark-600 bg-dark-950/50 p-4 text-sm text-gray-300">
            {{ overview.data_boundary }}
          </p>

          <section v-for="section in sections" :key="section.title">
            <h2 class="mb-4 text-2xl font-bold text-white">{{ section.title }}</h2>
            <ul class="space-y-3">
              <li
                v-for="item in section.items"
                :key="item.key"
                class="flex flex-col gap-2 rounded-xl border border-dark-700 bg-dark-950/40 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-white">{{ item.label }}</p>
                  <p v-if="item.notes" class="mt-1 text-sm text-gray-400">{{ item.notes }}</p>
                </div>
                <StatusBadge :status="item.status" />
              </li>
            </ul>
          </section>

          <section v-if="overview?.compliance">
            <h2 class="mb-4 text-2xl font-bold text-white">Compliance</h2>
            <p v-if="overview.compliance.encryption_summary" class="mb-2 text-gray-300">
              {{ overview.compliance.encryption_summary }}
            </p>
            <p v-if="overview.compliance.access_summary" class="mb-4 text-gray-300">
              {{ overview.compliance.access_summary }}
            </p>
            <div
              v-if="overview.compliance.soc2"
              class="flex flex-col gap-2 rounded-xl border border-dark-700 bg-dark-950/40 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <p class="font-medium text-white">
                  {{ overview.compliance.soc2.control || 'SOC 2 Type II' }}
                </p>
                <p class="mt-1 text-sm text-gray-400">
                  {{ overview.compliance.soc2.notes || 'Roadmap — not certified.' }}
                </p>
                <p class="mt-2 text-xs font-medium text-amber-300/90">
                  TapeOutOps is not SOC 2 certified. Status reflects roadmap alignment only.
                </p>
              </div>
              <StatusBadge :status="normalizeStatus(overview.compliance.soc2.status)" />
            </div>
          </section>

          <section v-if="overview?.user_best_practices?.length">
            <h2 class="mb-4 text-2xl font-bold text-white">Best practices</h2>
            <ul class="list-inside list-disc space-y-2 text-gray-300">
              <li v-for="(tip, idx) in overview.user_best_practices" :key="idx">{{ tip }}</li>
            </ul>
          </section>

          <section>
            <h2 class="mb-2 text-2xl font-bold text-white">Report a vulnerability</h2>
            <p class="mb-4 text-gray-300">
              Email
              <a
                :href="`mailto:${securityEmail}`"
                class="text-neon-blue transition-colors hover:text-neon-purple"
              >{{ securityEmail }}</a>
              or use the form below.
            </p>

            <form class="space-y-4" @submit.prevent="submitReport">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-sm text-gray-300">Email *</label>
                  <input v-model="report.email" type="email" required class="input-field w-full" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm text-gray-300">Name</label>
                  <input v-model="report.name" type="text" maxlength="120" class="input-field w-full" />
                </div>
              </div>
              <div>
                <label class="mb-1.5 block text-sm text-gray-300">Severity</label>
                <select v-model="report.severity" class="input-field w-full">
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                  <option value="critical">critical</option>
                </select>
              </div>
              <div>
                <label class="mb-1.5 block text-sm text-gray-300">Summary * (min 10 characters)</label>
                <textarea
                  v-model="report.summary"
                  required
                  minlength="10"
                  maxlength="2000"
                  rows="4"
                  class="input-field w-full"
                />
              </div>
              <p v-if="reportSuccess" class="text-sm text-emerald-400">{{ reportSuccess }}</p>
              <p v-if="reportError" class="text-sm text-red-400">{{ reportError }}</p>
              <button type="submit" class="btn-primary px-5 py-2.5 text-sm" :disabled="reportSubmitting">
                {{ reportSubmitting ? 'Sending…' : 'Submit report' }}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchPublicSecurity, submitSecurityReport } from '@/api/security'
import type { PublicSecurityOverview, SecurityControlItem, SecurityStatus } from '@/types/security'
import { isSecurityStatus } from '@/types/security'
import StatusBadge from '@/components/Security/StatusBadge.vue'

const router = useRouter()
const overview = ref<PublicSecurityOverview | null>(null)
const loading = ref(true)
const loadError = ref('')
const reportSubmitting = ref(false)
const reportSuccess = ref('')
const reportError = ref('')

const report = ref({
  email: '',
  name: '',
  summary: '',
  severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
})

const securityEmail = computed(
  () =>
    overview.value?.reporting?.security_email ||
    overview.value?.contact?.security_email ||
    'security@tapeoutops.com',
)

function controlLabel(key: string, item: SecurityControlItem): string {
  if (item.control) return item.control
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function normalizeStatus(status: unknown): SecurityStatus {
  return isSecurityStatus(status) ? status : 'partial'
}

function mapGroup(
  group: Record<string, SecurityControlItem> | undefined,
): Array<{ key: string; label: string; notes?: string; status: SecurityStatus }> {
  if (!group) return []
  return Object.entries(group).map(([key, item]) => ({
    key,
    label: controlLabel(key, item),
    notes: item.notes,
    status: normalizeStatus(item.status),
  }))
}

const sections = computed(() => {
  const o = overview.value
  if (!o) return []
  return [
    { title: 'Encryption', items: mapGroup(o.encryption) },
    { title: 'Authentication & access', items: mapGroup(o.authentication_access) },
    { title: 'Infrastructure', items: mapGroup(o.infrastructure) },
    { title: 'Data protection', items: mapGroup(o.data_protection) },
    { title: 'Monitoring', items: mapGroup(o.monitoring) },
    { title: 'Deployment', items: mapGroup(o.deployment) },
  ].filter((s) => s.items.length > 0)
})

function formatUpdated(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    overview.value = await fetchPublicSecurity()
  } catch (e: any) {
    loadError.value = e?.message || 'Failed to load security overview'
  } finally {
    loading.value = false
  }
}

async function submitReport() {
  reportError.value = ''
  reportSuccess.value = ''
  if (report.value.summary.trim().length < 10) {
    reportError.value = 'Summary must be at least 10 characters.'
    return
  }
  reportSubmitting.value = true
  try {
    await submitSecurityReport({
      email: report.value.email.trim(),
      summary: report.value.summary.trim(),
      severity: report.value.severity,
      name: report.value.name.trim() || null,
      page_url: typeof window !== 'undefined' ? window.location.href : '/security',
    })
    reportSuccess.value = 'Report submitted. Our team will follow up if needed.'
    report.value.summary = ''
    report.value.name = ''
  } catch (e: any) {
    reportError.value = e?.message || 'Failed to submit report'
  } finally {
    reportSubmitting.value = false
  }
}

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  void load()
})
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
