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
        <div v-else-if="overviewError" class="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{{ overviewError }}</div>
        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div class="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4">
            <div class="text-xs font-medium uppercase tracking-wide text-sky-400">Total Users</div>
            <div class="mt-1 text-3xl font-bold text-sky-300">{{ overview?.users?.total ?? '—' }}</div>
          </div>
          <div class="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div class="text-xs font-medium uppercase tracking-wide text-emerald-400">Active Users</div>
            <div class="mt-1 text-3xl font-bold text-emerald-300">{{ overview?.users?.active ?? '—' }}</div>
          </div>
          <div class="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div class="text-xs font-medium uppercase tracking-wide text-amber-400">Signups (7d)</div>
            <div class="mt-1 text-3xl font-bold text-amber-300">{{ overview?.users?.signups_7d ?? '—' }}</div>
          </div>
          <div class="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4">
            <div class="text-xs font-medium uppercase tracking-wide text-violet-400">Companies</div>
            <div class="mt-1 text-3xl font-bold text-violet-300">{{ overview?.resources?.companies ?? '—' }}</div>
          </div>
          <div class="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4">
            <div class="text-xs font-medium uppercase tracking-wide text-cyan-400">Projects</div>
            <div class="mt-1 text-3xl font-bold text-cyan-300">{{ overview?.resources?.projects ?? '—' }}</div>
          </div>
          <div class="rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-4">
            <div class="text-xs font-medium uppercase tracking-wide text-fuchsia-400">Specifications</div>
            <div class="mt-1 text-3xl font-bold text-fuchsia-300">{{ overview?.resources?.specifications ?? '—' }}</div>
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
          <div class="bg-dark-900 border border-dark-700 rounded-xl p-5" data-testid="signups-trend-chart">
            <h3 class="text-gray-300 font-medium mb-3">Signups per day</h3>
            <div class="h-48 flex items-end gap-[2px]">
              <div
                v-for="d in signupTrendSeries"
                :key="d.date"
                class="min-w-0 flex-1 rounded-t transition-colors"
                :class="d.count > 0 ? 'bg-neon-blue/80 hover:bg-neon-blue' : 'bg-transparent'"
                :title="`${d.date}: ${d.count}`"
                :style="{ height: trendBarHeight(d.count, 'signups') + '%' }"
              />
            </div>
            <div class="flex justify-between mt-2 text-xs text-gray-500">
              <span>{{ signupTrendStart }}</span>
              <span>{{ signupTrendEnd }}</span>
            </div>
          </div>
          <div class="bg-dark-900 border border-dark-700 rounded-xl p-5" data-testid="projects-trend-chart">
            <h3 class="text-gray-300 font-medium mb-3">Projects per day</h3>
            <div v-if="projectTrendSeries.some((d) => d.count > 0)" class="h-48 flex items-end gap-[2px]">
              <div
                v-for="d in projectTrendSeries"
                :key="d.date"
                class="min-w-0 flex-1 rounded-t transition-colors"
                :class="d.count > 0 ? 'bg-neon-purple/80 hover:bg-neon-purple' : 'bg-transparent'"
                :title="`${d.date}: ${d.count}`"
                :style="{ height: trendBarHeight(d.count, 'projects') + '%' }"
              />
            </div>
            <div v-else class="flex h-48 items-center justify-center rounded-lg border border-dashed border-dark-600 px-4 text-center text-sm text-gray-500">
              No project-creation data for this window.
            </div>
            <div v-if="projectTrendSeries.some((d) => d.count > 0)" class="flex justify-between mt-2 text-xs text-gray-500">
              <span>{{ projectTrendStart }}</span>
              <span>{{ projectTrendEnd }}</span>
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
          <button class="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-white text-sm" @click="applyUsersFilters">Apply</button>
        </div>
        <div v-if="usersLoading" class="text-gray-400">Loading users...</div>
        <div v-else-if="usersError" class="text-red-400">{{ usersError }}</div>
        <template v-else>
          <div class="overflow-x-auto rounded-xl border border-dark-700 bg-dark-900">
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
                <tr v-if="!usersList.length">
                  <td colspan="7" class="py-6 px-4 text-center text-gray-500">No users found.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
            <div>{{ usersRangeLabel }}</div>
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" class="px-3 py-1.5 rounded-lg bg-dark-700 text-white disabled:opacity-50" :disabled="!usersCanPrev || usersLoading" @click="goUsersPage(usersPage - 1)">Previous</button>
              <button
                v-for="n in usersPageNumbers"
                :key="n"
                type="button"
                class="min-w-[2.25rem] px-2.5 py-1.5 rounded-lg disabled:opacity-50"
                :class="n === usersPage ? 'bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/40 font-semibold' : 'bg-dark-700 text-white'"
                :disabled="usersLoading"
                @click="goUsersPage(n)"
              >{{ n }}</button>
              <button type="button" class="px-3 py-1.5 rounded-lg bg-dark-700 text-white disabled:opacity-50" :disabled="!usersCanNext || usersLoading" @click="goUsersPage(usersPage + 1)">Next</button>
            </div>
            <label class="flex items-center gap-2">
              <span>Rows</span>
              <select v-model.number="usersLimit" class="bg-dark-800 border border-dark-600 rounded-lg px-2 py-1.5 text-white text-sm max-w-[5.5rem]" @change="changeUsersPageSize">
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </label>
          </div>
        </template>
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
      <section class="mb-10" data-testid="usage-by-domain">
        <h2 class="text-xl font-semibold text-white mb-4">Usage by domain</h2>
        <div v-if="domainsLoading" class="text-gray-400">Loading domains...</div>
        <div v-else-if="domainsError" class="text-red-400">{{ domainsError }}</div>
        <template v-else>
          <div class="overflow-x-auto rounded-xl border border-dark-700 bg-dark-900">
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
                <tr v-for="d in pagedDomains" :key="d.domain" class="border-b border-dark-800 hover:bg-dark-800/50">
                  <td class="py-3 px-4 text-gray-200">{{ d.domain }}</td>
                  <td class="py-3 px-4 text-gray-200">{{ d.users }}</td>
                  <td class="py-3 px-4 text-gray-200">{{ d.companies }}</td>
                  <td class="py-3 px-4 text-gray-200">{{ d.projects }}</td>
                </tr>
                <tr v-if="!pagedDomains.length">
                  <td colspan="4" class="py-6 px-4 text-center text-gray-500">No domains found.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-if="domainsTotal > 0"
            class="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500"
            data-testid="domains-pagination"
          >
            <div>{{ domainsRangeLabel }}</div>
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" class="px-3 py-1.5 rounded-lg bg-dark-700 text-white disabled:opacity-50" :disabled="!domainsCanPrev" @click="goDomainsPage(domainsPage - 1)">Previous</button>
              <button
                v-for="n in domainsPageNumbers"
                :key="n"
                type="button"
                class="min-w-[2.25rem] px-2.5 py-1.5 rounded-lg"
                :class="n === domainsPage ? 'bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/40 font-semibold' : 'bg-dark-700 text-white'"
                @click="goDomainsPage(n)"
              >{{ n }}</button>
              <button type="button" class="px-3 py-1.5 rounded-lg bg-dark-700 text-white disabled:opacity-50" data-testid="domains-next" :disabled="!domainsCanNext" @click="goDomainsPage(domainsPage + 1)">Next</button>
            </div>
            <label class="flex items-center gap-2">
              <span>Rows</span>
              <select v-model.number="domainsLimit" class="bg-dark-800 border border-dark-600 rounded-lg px-2 py-1.5 text-white text-sm max-w-[5.5rem]" data-testid="domains-page-size" @change="changeDomainsPageSize">
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
              </select>
            </label>
          </div>
        </template>
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
import { fillDailySeries, trendBarPercent, trendSeriesMax } from '@/utils/usage-trends'

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

const signupTrendSeries = computed(() => fillDailySeries(trends.value?.signups, trendsDays.value))
const projectTrendSeries = computed(() => fillDailySeries(trends.value?.projects, trendsDays.value))
const maxSignups = computed(() => trendSeriesMax(signupTrendSeries.value))
const maxProjects = computed(() => trendSeriesMax(projectTrendSeries.value))
function trendBarHeight(count: number, type: 'signups' | 'projects') {
  const max = type === 'signups' ? maxSignups.value : maxProjects.value
  return trendBarPercent(count, max)
}
const signupTrendStart = computed(() => signupTrendSeries.value[0]?.date || '')
const signupTrendEnd = computed(() => signupTrendSeries.value[signupTrendSeries.value.length - 1]?.date || '')
const projectTrendStart = computed(() => projectTrendSeries.value[0]?.date || '')
const projectTrendEnd = computed(() => projectTrendSeries.value[projectTrendSeries.value.length - 1]?.date || '')

const usersList = ref<any[]>([])
const usersTotal = ref(0)
const usersSkip = ref(0)
const usersLimit = ref(10)
const usersPage = computed(() => Math.floor(usersSkip.value / usersLimit.value) + 1)
const usersTotalPages = computed(() => Math.max(1, Math.ceil(usersTotal.value / usersLimit.value) || 1))
const usersCanPrev = computed(() => usersPage.value > 1)
const usersCanNext = computed(() => usersPage.value < usersTotalPages.value)
const usersRangeLabel = computed(() => {
  if (!usersTotal.value) return 'Showing 0 of 0 users'
  const from = usersSkip.value + 1
  const to = Math.min(usersSkip.value + usersList.value.length, usersTotal.value)
  return `Showing ${from}–${to} of ${usersTotal.value} users · Page ${usersPage.value} of ${usersTotalPages.value}`
})
const usersPageNumbers = computed(() => {
  const total = usersTotalPages.value
  const current = usersPage.value
  const windowSize = 5
  let start = Math.max(1, current - Math.floor(windowSize / 2))
  let end = Math.min(total, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
const usersFilterActive = ref('')
const usersFilterDomain = ref('')
const usersLoading = ref(false)
const usersError = ref('')

function applyUsersFilters() {
  usersSkip.value = 0
  fetchUsers()
}

function goUsersPage(page: number) {
  const next = Math.min(Math.max(1, page), usersTotalPages.value)
  usersSkip.value = (next - 1) * usersLimit.value
  fetchUsers()
}

function changeUsersPageSize() {
  usersSkip.value = 0
  fetchUsers()
}

const activity = ref<any>(null)
const activityHours = ref(24)
const activityLoading = ref(false)
const activityError = ref('')

const domainsData = ref<any>(null)
const domainsLoading = ref(false)
const domainsError = ref('')
const domainsPage = ref(1)
const domainsLimit = ref(10)

const allDomains = computed(() => domainsData.value?.domains || [])
const domainsTotal = computed(() => allDomains.value.length)
const domainsTotalPages = computed(() => Math.max(1, Math.ceil(domainsTotal.value / domainsLimit.value) || 1))
const domainsCanPrev = computed(() => domainsPage.value > 1)
const domainsCanNext = computed(() => domainsPage.value < domainsTotalPages.value)
const pagedDomains = computed(() => {
  const start = (domainsPage.value - 1) * domainsLimit.value
  return allDomains.value.slice(start, start + domainsLimit.value)
})
const domainsRangeLabel = computed(() => {
  if (!domainsTotal.value) return 'Showing 0 of 0 domains'
  const from = (domainsPage.value - 1) * domainsLimit.value + 1
  const to = Math.min(from + pagedDomains.value.length - 1, domainsTotal.value)
  return `Showing ${from}–${to} of ${domainsTotal.value} domains · Page ${domainsPage.value} of ${domainsTotalPages.value}`
})
const domainsPageNumbers = computed(() => {
  const total = domainsTotalPages.value
  const current = domainsPage.value
  const windowSize = 5
  let start = Math.max(1, current - Math.floor(windowSize / 2))
  let end = Math.min(total, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function goDomainsPage(page: number) {
  domainsPage.value = Math.min(Math.max(1, page), domainsTotalPages.value)
}

function changeDomainsPageSize() {
  domainsPage.value = 1
}
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
    usersTotal.value = data.total ?? usersList.value.length
    if (typeof data.skip === 'number') usersSkip.value = data.skip
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
    domainsPage.value = 1
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
