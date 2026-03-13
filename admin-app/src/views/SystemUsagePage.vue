<template>
  <div class="min-h-screen bg-dark-950">
    <!-- Top bar -->
    <header class="sticky top-0 z-10 border-b border-dark-700 bg-dark-900/95 backdrop-blur">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold text-gradient">TapeOutOps Admin · System Usage</h1>
        <button
          @click="logout"
          class="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm"
        >
          Logout
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto p-6">
      <div class="mb-8">
        <p class="text-gray-400">Internal usage and activity dashboard. Admin only.</p>
      </div>

      <!-- Overview KPIs -->
      <section class="mb-10">
        <h2 class="text-xl font-semibold text-white mb-4">Overview</h2>
        <div v-if="overviewLoading" class="text-gray-400">Loading overview...</div>
        <div v-else-if="overviewError" class="text-red-400">{{ overviewError }}</div>
        <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div class="bg-dark-900 border border-dark-700 rounded-xl p-4">
            <div class="text-gray-400 text-sm">Total Users</div>
            <div class="text-2xl font-bold text-white">{{ overview?.users?.total ?? '—' }}</div>
          </div>
          <div class="bg-dark-900 border border-dark-700 rounded-xl p-4">
            <div class="text-gray-400 text-sm">Active Users</div>
            <div class="text-2xl font-bold text-white">{{ overview?.users?.active ?? '—' }}</div>
          </div>
          <div class="bg-dark-900 border border-dark-700 rounded-xl p-4">
            <div class="text-gray-400 text-sm">Signups (7d)</div>
            <div class="text-2xl font-bold text-white">{{ overview?.users?.signups_7d ?? '—' }}</div>
          </div>
          <div class="bg-dark-900 border border-dark-700 rounded-xl p-4">
            <div class="text-gray-400 text-sm">Companies</div>
            <div class="text-2xl font-bold text-white">{{ overview?.resources?.companies ?? '—' }}</div>
          </div>
          <div class="bg-dark-900 border border-dark-700 rounded-xl p-4">
            <div class="text-gray-400 text-sm">Projects</div>
            <div class="text-2xl font-bold text-white">{{ overview?.resources?.projects ?? '—' }}</div>
          </div>
          <div class="bg-dark-900 border border-dark-700 rounded-xl p-4">
            <div class="text-gray-400 text-sm">Specifications</div>
            <div class="text-2xl font-bold text-white">{{ overview?.resources?.specifications ?? '—' }}</div>
          </div>
        </div>
      </section>

      <!-- Trends -->
      <section class="mb-10">
        <h2 class="text-xl font-semibold text-white mb-4">Usage trends</h2>
        <div class="flex gap-4 mb-4">
          <select v-model="trendsDays" class="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm">
            <option :value="7">7 days</option>
            <option :value="30">30 days</option>
            <option :value="90">90 days</option>
          </select>
        </div>
        <div v-if="trendsLoading" class="text-gray-400">Loading trends...</div>
        <div v-else-if="trendsError" class="text-red-400">{{ trendsError }}</div>
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-dark-900 border border-dark-700 rounded-xl p-5">
            <h3 class="text-gray-300 font-medium mb-3">Signups per day</h3>
            <div class="h-48 flex items-end gap-0.5">
              <template v-for="d in (trends?.signups || [])" :key="d.date">
                <div
                  class="flex-1 min-w-0 bg-neon-blue/70 rounded-t hover:bg-neon-blue transition-colors"
                  :title="`${d.date}: ${d.count}`"
                  :style="{ height: trendBarHeight(d.count, 'signups') + '%' }"
                />
              </template>
            </div>
            <div class="flex justify-between mt-2 text-xs text-gray-500">
              <span>{{ firstTrendDate }}</span>
              <span>{{ lastTrendDate }}</span>
            </div>
          </div>
          <div class="bg-dark-900 border border-dark-700 rounded-xl p-5">
            <h3 class="text-gray-300 font-medium mb-3">Projects per day</h3>
            <div class="h-48 flex items-end gap-0.5">
              <template v-for="d in (trends?.projects || [])" :key="d.date">
                <div
                  class="flex-1 min-w-0 bg-neon-purple/70 rounded-t hover:bg-neon-purple transition-colors"
                  :title="`${d.date}: ${d.count}`"
                  :style="{ height: trendBarHeight(d.count, 'projects') + '%' }"
                />
              </template>
            </div>
            <div class="flex justify-between mt-2 text-xs text-gray-500">
              <span>{{ firstTrendDate }}</span>
              <span>{{ lastTrendDate }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Users table -->
      <section class="mb-10">
        <h2 class="text-xl font-semibold text-white mb-4">Users</h2>
        <div class="flex flex-wrap gap-4 mb-4">
          <select v-model="usersFilterActive" class="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm">
            <option value="">All</option>
            <option value="true">Active only</option>
            <option value="false">Inactive only</option>
          </select>
          <input
            v-model="usersFilterDomain"
            type="text"
            placeholder="Filter by domain"
            class="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm w-48"
          />
          <button class="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-white text-sm" @click="fetchUsers">Apply</button>
        </div>
        <div v-if="usersLoading" class="text-gray-400">Loading users...</div>
        <div v-else-if="usersError" class="text-red-400">{{ usersError }}</div>
        <div v-else class="overflow-x-auto rounded-xl border border-dark-700 bg-dark-900">
          <table class="min-w-full text-left">
            <thead class="bg-dark-800 border-b border-dark-700">
              <tr>
                <th class="py-3 px-4 text-gray-300 font-semibold">Email</th>
                <th class="py-3 px-4 text-gray-300 font-semibold">Name</th>
                <th class="py-3 px-4 text-gray-300 font-semibold">Role</th>
                <th class="py-3 px-4 text-gray-300 font-semibold">Domain</th>
                <th class="py-3 px-4 text-gray-300 font-semibold">Active</th>
                <th class="py-3 px-4 text-gray-300 font-semibold">Activity</th>
                <th class="py-3 px-4 text-gray-300 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in usersList" :key="u.id" class="border-b border-dark-800 hover:bg-dark-800/50">
                <td class="py-3 px-4 text-gray-200">{{ u.email }}</td>
                <td class="py-3 px-4 text-gray-200">{{ u.full_name || '—' }}</td>
                <td class="py-3 px-4 text-gray-200">{{ u.role || '—' }}</td>
                <td class="py-3 px-4 text-gray-200">{{ u.email_domain || '—' }}</td>
                <td class="py-3 px-4"><span :class="u.is_active ? 'text-green-400' : 'text-gray-500'">{{ u.is_active ? 'Yes' : 'No' }}</span></td>
                <td class="py-3 px-4 text-gray-200">{{ u.activity_count ?? '—' }}</td>
                <td class="py-3 px-4 text-gray-400 text-sm">{{ formatDate(u.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-2 flex items-center justify-between text-sm text-gray-500">
          <span>Total: {{ usersTotal }} · Page {{ usersPage }}</span>
          <div class="flex gap-2">
            <button :disabled="usersSkip === 0" class="px-3 py-1 rounded bg-dark-700 text-white disabled:opacity-50" @click="usersSkip = Math.max(0, usersSkip - usersLimit); fetchUsers()">Previous</button>
            <button :disabled="usersSkip + usersLimit >= usersTotal" class="px-3 py-1 rounded bg-dark-700 text-white disabled:opacity-50" @click="usersSkip += usersLimit; fetchUsers()">Next</button>
          </div>
        </div>
      </section>

      <!-- Recent activity -->
      <section class="mb-10">
        <h2 class="text-xl font-semibold text-white mb-4">Recent activity</h2>
        <div class="flex gap-4 mb-4">
          <select v-model="activityHours" class="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm">
            <option :value="24">Last 24 hours</option>
            <option :value="48">Last 48 hours</option>
            <option :value="168">Last 7 days</option>
          </select>
        </div>
        <div v-if="activityLoading" class="text-gray-400">Loading activity...</div>
        <div v-else-if="activityError" class="text-red-400">{{ activityError }}</div>
        <div v-else class="space-y-2 max-h-96 overflow-y-auto rounded-xl border border-dark-700 bg-dark-900 p-4">
          <div v-for="a in (activity?.activities || [])" :key="a.id" class="flex items-start gap-3 py-2 border-b border-dark-800 last:border-0">
            <span class="text-gray-500 text-sm shrink-0">{{ formatDateTime(a.created_at) }}</span>
            <span class="text-gray-300">{{ a.user }}</span>
            <span class="text-white">{{ a.action }}</span>
            <span v-if="a.entity" class="text-gray-500 text-sm">{{ a.entity }} {{ a.entity_id }}</span>
          </div>
          <div v-if="!(activity?.activities?.length)" class="text-gray-500">No activity in this period.</div>
        </div>
      </section>

      <!-- Domains -->
      <section class="mb-10">
        <h2 class="text-xl font-semibold text-white mb-4">Usage by domain</h2>
        <div v-if="domainsLoading" class="text-gray-400">Loading domains...</div>
        <div v-else-if="domainsError" class="text-red-400">{{ domainsError }}</div>
        <div v-else class="overflow-x-auto rounded-xl border border-dark-700 bg-dark-900">
          <table class="min-w-full text-left">
            <thead class="bg-dark-800 border-b border-dark-700">
              <tr>
                <th class="py-3 px-4 text-gray-300 font-semibold">Domain</th>
                <th class="py-3 px-4 text-gray-300 font-semibold">Users</th>
                <th class="py-3 px-4 text-gray-300 font-semibold">Companies</th>
                <th class="py-3 px-4 text-gray-300 font-semibold">Projects</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in (domainsData?.domains || [])" :key="d.domain" class="border-b border-dark-800 hover:bg-dark-800/50">
                <td class="py-3 px-4 text-gray-200">{{ d.domain }}</td>
                <td class="py-3 px-4 text-gray-200">{{ d.users }}</td>
                <td class="py-3 px-4 text-gray-200">{{ d.companies }}</td>
                <td class="py-3 px-4 text-gray-200">{{ d.projects }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Most active users -->
      <section>
        <h2 class="text-xl font-semibold text-white mb-4">Most active users (30 days)</h2>
        <div v-if="activeUsersLoading" class="text-gray-400">Loading...</div>
        <div v-else-if="activeUsersError" class="text-red-400">{{ activeUsersError }}</div>
        <div v-else class="rounded-xl border border-dark-700 bg-dark-900 p-4 max-w-xl">
          <ul class="space-y-2">
            <li v-for="(u, i) in (activeUsersData?.active_users || [])" :key="u.email" class="flex justify-between items-center py-1">
              <span class="text-gray-200">{{ i + 1 }}. {{ u.email }}</span>
              <span class="text-gray-400 text-sm">{{ u.activity_count }} actions · {{ formatDateTime(u.last_activity) }}</span>
            </li>
          </ul>
          <p v-if="!(activeUsersData?.active_users?.length)" class="text-gray-500">No data.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authenticatedFetch } from '@/utils/api'

const router = useRouter()
const authStore = useAuthStore()

const API = '/api/v1/admin/usage'

const overview = ref<any>(null)
const overviewLoading = ref(true)
const overviewError = ref('')

const trends = ref<any>(null)
const trendsDays = ref(30)
const trendsLoading = ref(false)
const trendsError = ref('')

const maxSignups = computed(() => {
  const arr = trends.value?.signups || []
  return arr.length ? Math.max(1, ...arr.map((d: any) => d.count)) : 1
})
const maxProjects = computed(() => {
  const arr = trends.value?.projects || []
  return arr.length ? Math.max(1, ...arr.map((d: any) => d.count)) : 1
})
function trendBarHeight(count: number, type: 'signups' | 'projects') {
  const max = type === 'signups' ? maxSignups.value : maxProjects.value
  return Math.round((count / max) * 100)
}
const firstTrendDate = computed(() => (trends.value?.signups || trends.value?.projects || [])[0]?.date || '')
const lastTrendDate = computed(() => {
  const arr = trends.value?.signups || trends.value?.projects || []
  return arr[arr.length - 1]?.date || ''
})

const usersList = ref<any[]>([])
const usersTotal = ref(0)
const usersSkip = ref(0)
const usersLimit = ref(100)
const usersPage = computed(() => Math.floor(usersSkip.value / usersLimit.value) + 1)
const usersFilterActive = ref('')
const usersFilterDomain = ref('')
const usersLoading = ref(false)
const usersError = ref('')

const activity = ref<any>(null)
const activityHours = ref(24)
const activityLoading = ref(false)
const activityError = ref('')

const domainsData = ref<any>(null)
const domainsLoading = ref(false)
const domainsError = ref('')

const activeUsersData = ref<any>(null)
const activeUsersLoading = ref(false)
const activeUsersError = ref('')

function formatDate(s: string) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return s }
}
function formatDateTime(s: string) {
  if (!s) return '—'
  try { return new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return s }
}

async function fetchOverview() {
  overviewLoading.value = true
  overviewError.value = ''
  try {
    const res = await authenticatedFetch(`${API}/overview`)
    if (!res.ok) { const t = await res.text(); let m = 'Failed to load overview'; try { const j = JSON.parse(t); m = j.detail || j.message || t } catch { m = t }; throw new Error(m) }
    overview.value = await res.json()
  } catch (e: any) { overviewError.value = e.message || 'Failed' } finally { overviewLoading.value = false }
}

async function fetchTrends() {
  trendsLoading.value = true
  trendsError.value = ''
  try {
    const res = await authenticatedFetch(`${API}/trends?days=${trendsDays.value}`)
    if (!res.ok) { const t = await res.text(); let m = 'Failed'; try { const j = JSON.parse(t); m = j.detail || j.message || t } catch { m = t }; throw new Error(m) }
    trends.value = await res.json()
  } catch (e: any) { trendsError.value = e.message || 'Failed' } finally { trendsLoading.value = false }
}

async function fetchUsers() {
  usersLoading.value = true
  usersError.value = ''
  try {
    const params = new URLSearchParams()
    params.set('skip', String(usersSkip.value))
    params.set('limit', String(usersLimit.value))
    if (usersFilterActive.value !== '') params.set('is_active', usersFilterActive.value)
    if (usersFilterDomain.value.trim()) params.set('domain', usersFilterDomain.value.trim())
    const res = await authenticatedFetch(`${API}/users?${params}`)
    if (!res.ok) { const t = await res.text(); let m = 'Failed'; try { const j = JSON.parse(t); m = j.detail || j.message || t } catch { m = t }; throw new Error(m) }
    const data = await res.json()
    usersList.value = data.users || []
    usersTotal.value = data.total ?? 0
    usersSkip.value = data.skip ?? 0
    usersLimit.value = data.limit ?? 100
  } catch (e: any) { usersError.value = e.message || 'Failed' } finally { usersLoading.value = false }
}

async function fetchActivity() {
  activityLoading.value = true
  activityError.value = ''
  try {
    const res = await authenticatedFetch(`${API}/activity?hours=${activityHours.value}&limit=100`)
    if (!res.ok) { const t = await res.text(); let m = 'Failed'; try { const j = JSON.parse(t); m = j.detail || j.message || t } catch { m = t }; throw new Error(m) }
    activity.value = await res.json()
  } catch (e: any) { activityError.value = e.message || 'Failed' } finally { activityLoading.value = false }
}

async function fetchDomains() {
  domainsLoading.value = true
  domainsError.value = ''
  try {
    const res = await authenticatedFetch(`${API}/domains`)
    if (!res.ok) { const t = await res.text(); let m = 'Failed'; try { const j = JSON.parse(t); m = j.detail || j.message || t } catch { m = t }; throw new Error(m) }
    domainsData.value = await res.json()
  } catch (e: any) { domainsError.value = e.message || 'Failed' } finally { domainsLoading.value = false }
}

async function fetchActiveUsers() {
  activeUsersLoading.value = true
  activeUsersError.value = ''
  try {
    const res = await authenticatedFetch(`${API}/active-users?days=30`)
    if (!res.ok) { const t = await res.text(); let m = 'Failed'; try { const j = JSON.parse(t); m = j.detail || j.message || t } catch { m = t }; throw new Error(m) }
    activeUsersData.value = await res.json()
  } catch (e: any) { activeUsersError.value = e.message || 'Failed' } finally { activeUsersLoading.value = false }
}

function logout() {
  authStore.logout()
  router.push('/login')
}

watch(trendsDays, () => fetchTrends())
watch(activityHours, () => fetchActivity())

onMounted(() => {
  Promise.all([fetchOverview(), fetchTrends(), fetchUsers(), fetchActivity(), fetchDomains(), fetchActiveUsers()])
})
</script>
