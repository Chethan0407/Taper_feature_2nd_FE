<template>
  <div class="min-h-screen bg-light-50 dark:bg-dark-950">
    <Sidebar />
    <div class="ml-64">
      <Header />
      <main class="p-8">
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gradient mb-2">System Usage</h1>
          <p class="text-gray-600 dark:text-gray-400">Internal dashboard for usage and activity (admin only).</p>
          <p v-if="isDev" class="mt-2 text-sm text-amber-400">Development mode: page is open to all logged-in users. API data may require an admin token from the backend.</p>
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

        <!-- Signup leads — same layout pattern as Users (filters + table) -->
        <section class="mb-10">
          <h2 class="text-xl font-semibold text-white mb-4">Signup leads</h2>
          <p class="text-gray-400 text-sm mb-4 max-w-3xl">
            Incomplete sign-ups captured on <strong class="text-gray-300">this browser</strong> (local log). Server list
            uses <code class="text-neon-blue/90 text-xs">GET /api/v1/admin/usage/signup-leads</code> when available.
          </p>

          <h3 class="text-lg font-semibold text-white mb-3">This browser</h3>
          <div class="flex flex-wrap gap-4 mb-4">
            <select
              v-model="leadsLocalSourceFilter"
              class="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">All sources</option>
              <option value="blur">blur (email field)</option>
              <option value="idle">idle (email field)</option>
              <option value="modal_close">modal_close (email)</option>
              <option value="page_left">page_left (email)</option>
              <option value="name_blur">name_blur</option>
              <option value="name_idle">name_idle</option>
              <option value="name_modal_close">name_modal_close</option>
              <option value="name_page_left">name_page_left</option>
            </select>
            <input
              v-model="leadsLocalEmailFilter"
              type="text"
              placeholder="Filter by email or domain"
              class="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm w-56 md:w-64"
            />
            <button
              type="button"
              class="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-white text-sm"
              @click="applyLocalSignupLeadsFilters"
            >
              Apply
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-lg bg-dark-800 border border-dark-600 text-gray-300 hover:text-white text-sm"
              @click="clearLocalSignupLeads"
            >
              Clear log
            </button>
          </div>
          <div class="overflow-x-auto rounded-xl border border-dark-700 bg-dark-900">
            <table class="min-w-full text-left">
              <thead class="bg-dark-800 border-b border-dark-700">
                <tr>
                  <th class="py-3 px-4 text-gray-300 font-semibold">Email</th>
                  <th class="py-3 px-4 text-gray-300 font-semibold">Domain</th>
                  <th class="py-3 px-4 text-gray-300 font-semibold">Source</th>
                  <th class="py-3 px-4 text-gray-300 font-semibold">Partial</th>
                  <th class="py-3 px-4 text-gray-300 font-semibold">Path</th>
                  <th class="py-3 px-4 text-gray-300 font-semibold">Captured</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in (filteredLocalSignupLeads || [])"
                  :key="String(row?.ts) + String(row?.email) + String(idx)"
                  class="border-b border-dark-800 hover:bg-dark-800/50"
                >
                  <td class="py-3 px-4 text-gray-200">{{ row?.email ?? '—' }}</td>
                  <td class="py-3 px-4 text-gray-200">{{ leadEmailDomain(row?.email) }}</td>
                  <td class="py-3 px-4 text-gray-400 text-sm">{{ row?.source ?? '—' }}</td>
                  <td class="py-3 px-4">
                    <span :class="row?.partial ? 'text-amber-400' : 'text-green-400'">
                      {{ row?.partial ? 'Yes' : 'No' }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-gray-500 text-sm">{{ row?.path ?? '—' }}</td>
                  <td class="py-3 px-4 text-gray-400 text-sm">{{ formatDate(row?.ts) }}</td>
                </tr>
                <tr v-if="!(filteredLocalSignupLeads?.length)">
                  <td colspan="6" class="py-8 px-4 text-gray-500 text-sm text-center">
                    No signup leads match your filters. Open Sign up on this browser, type enough of an email (e.g.
                    <code class="text-xs text-gray-400">you@co</code>), pause or blur — then click Apply.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 class="text-lg font-semibold text-white mb-3 mt-10">From server</h3>
          <div class="flex flex-wrap gap-4 mb-4">
            <button
              type="button"
              class="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-white text-sm disabled:opacity-50"
              :disabled="signupLeadsLoading"
              @click="fetchSignupLeads"
            >
              {{ signupLeadsLoading ? 'Loading…' : 'Refresh' }}
            </button>
          </div>
          <div v-if="signupLeadsLoading" class="text-gray-400 mb-4">Loading signup leads…</div>
          <div v-if="signupLeadsError" class="text-red-400 mb-4">{{ signupLeadsError }}</div>
          <p v-if="signupLeadsInfo && !signupLeadsError" class="text-amber-400/90 text-sm mb-4 whitespace-pre-line">
            {{ signupLeadsInfo }}
          </p>
          <div
            v-if="!signupLeadsLoading && !signupLeadsError && (signupLeads?.length ?? 0) > 0"
            class="overflow-x-auto rounded-xl border border-dark-700 bg-dark-900"
          >
            <table class="min-w-full text-left">
              <thead class="bg-dark-800 border-b border-dark-700">
                <tr>
                  <th class="py-3 px-4 text-gray-300 font-semibold">Email</th>
                  <th class="py-3 px-4 text-gray-300 font-semibold">Domain</th>
                  <th class="py-3 px-4 text-gray-300 font-semibold">Last source</th>
                  <th class="py-3 px-4 text-gray-300 font-semibold">Last seen</th>
                  <th class="py-3 px-4 text-gray-300 font-semibold">Converted</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in (signupLeads || [])"
                  :key="String(row?.email) + String(idx)"
                  class="border-b border-dark-800 hover:bg-dark-800/50"
                >
                  <td class="py-3 px-4 text-gray-200">{{ row?.email ?? '—' }}</td>
                  <td class="py-3 px-4 text-gray-200">{{ leadEmailDomain(row?.email) }}</td>
                  <td class="py-3 px-4 text-gray-400 text-sm">{{ row.last_source ?? row.source ?? '—' }}</td>
                  <td class="py-3 px-4 text-gray-400 text-sm">{{ formatDateTime(row.last_seen || row.last_seen_at || row.updated_at || row.created_at) }}</td>
                  <td class="py-3 px-4">
                    <span
                      :class="row.converted === true || row.user_id ? 'text-green-400' : 'text-gray-500'"
                    >
                      {{ row.converted === true || row.user_id ? 'Yes' : 'No' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-else-if="!signupLeadsLoading && !signupLeadsError && !(signupLeads?.length) && !signupLeadsInfo"
            class="overflow-x-auto rounded-xl border border-dark-700 bg-dark-900"
          >
            <table class="min-w-full text-left">
              <thead class="bg-dark-800 border-b border-dark-700">
                <tr>
                  <th class="py-3 px-4 text-gray-300 font-semibold">Email</th>
                  <th class="py-3 px-4 text-gray-300 font-semibold">Domain</th>
                  <th class="py-3 px-4 text-gray-300 font-semibold">Last source</th>
                  <th class="py-3 px-4 text-gray-300 font-semibold">Last seen</th>
                  <th class="py-3 px-4 text-gray-300 font-semibold">Converted</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="5" class="py-8 px-4 text-gray-500 text-sm text-center">
                    No server rows for this query.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Trends (charts) -->
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
            <button
              class="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-white text-sm"
              @click="fetchUsers"
            >
              Apply
            </button>
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
                <tr
                  v-for="u in usersList"
                  :key="u.id"
                  class="border-b border-dark-800 hover:bg-dark-800/50"
                >
                  <td class="py-3 px-4 text-gray-200">{{ u.email }}</td>
                  <td class="py-3 px-4 text-gray-200">{{ u.full_name || '—' }}</td>
                  <td class="py-3 px-4 text-gray-200">{{ u.role || '—' }}</td>
                  <td class="py-3 px-4 text-gray-200">{{ u.email_domain || '—' }}</td>
                  <td class="py-3 px-4">
                    <span :class="u.is_active ? 'text-green-400' : 'text-gray-500'">{{ u.is_active ? 'Yes' : 'No' }}</span>
                  </td>
                  <td class="py-3 px-4 text-gray-200">{{ u.activity_count ?? '—' }}</td>
                  <td class="py-3 px-4 text-gray-400 text-sm">{{ formatDate(u.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-2 flex items-center justify-between text-sm text-gray-500">
            <span>Total: {{ usersTotal }} · Page {{ usersPage }} (skip {{ usersSkip }})</span>
            <div class="flex gap-2">
              <button
                :disabled="usersSkip === 0"
                class="px-3 py-1 rounded bg-dark-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                @click="usersSkip = Math.max(0, usersSkip - usersLimit); fetchUsers()"
              >
                Previous
              </button>
              <button
                :disabled="usersSkip + usersLimit >= usersTotal"
                class="px-3 py-1 rounded bg-dark-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                @click="usersSkip += usersLimit; fetchUsers()"
              >
                Next
              </button>
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
            <div
              v-for="a in (activity?.activities || [])"
              :key="a.id"
              class="flex items-start gap-3 py-2 border-b border-dark-800 last:border-0"
            >
              <span class="text-gray-500 text-sm shrink-0">{{ formatDateTime(a.created_at) }}</span>
              <span class="text-gray-300">{{ a.user }}</span>
              <span class="text-white">{{ a.action }}</span>
              <span v-if="a.entity" class="text-gray-500 text-sm">{{ a.entity }} {{ a.entity_id }}</span>
            </div>
            <div v-if="!(activity?.activities?.length)" class="text-gray-500">No activity in this period.</div>
          </div>
        </section>

        <!-- Domains (optional) -->
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
                <tr
                  v-for="d in (domainsData?.domains || [])"
                  :key="d.domain"
                  class="border-b border-dark-800 hover:bg-dark-800/50"
                >
                  <td class="py-3 px-4 text-gray-200">{{ d.domain }}</td>
                  <td class="py-3 px-4 text-gray-200">{{ d.users }}</td>
                  <td class="py-3 px-4 text-gray-200">{{ d.companies }}</td>
                  <td class="py-3 px-4 text-gray-200">{{ d.projects }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Most active users (optional) -->
        <section>
          <h2 class="text-xl font-semibold text-white mb-4">Most active users (30 days)</h2>
          <div v-if="activeUsersLoading" class="text-gray-400">Loading...</div>
          <div v-else-if="activeUsersError" class="text-red-400">{{ activeUsersError }}</div>
          <div v-else class="rounded-xl border border-dark-700 bg-dark-900 p-4 max-w-xl">
            <ul class="space-y-2">
              <li
                v-for="(u, i) in (activeUsersData?.active_users || [])"
                :key="u.email"
                class="flex justify-between items-center py-1"
              >
                <span class="text-gray-200">{{ i + 1 }}. {{ u.email }}</span>
                <span class="text-gray-400 text-sm">{{ u.activity_count }} actions · {{ formatDateTime(u.last_activity) }}</span>
              </li>
            </ul>
            <p v-if="!(activeUsersData?.active_users?.length)" class="text-gray-500">No data.</p>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { authenticatedFetch } from '@/utils/auth-requests'
import {
  readLocalSignupLeadsLog,
  clearLocalSignupLeadsLog,
  type LocalSignupLeadEntry,
} from '@/utils/clientTelemetry'

const API = '/api/v1/admin/usage'
const isDev = import.meta.env.DEV

// Overview
const overview = ref<{
  users?: { total?: number; active?: number; inactive?: number; signups_7d?: number; signups_30d?: number }
  resources?: { companies?: number; projects?: number; specifications?: number; vendors?: number; lint_rules?: number }
  top_domains?: { domain: string; users: number }[]
  timestamp?: string
} | null>(null)
const overviewLoading = ref(true)
const overviewError = ref('')

// Trends
const trends = ref<{
  signups?: { date: string; count: number }[]
  projects?: { date: string; count: number }[]
  period_days?: number
  timestamp?: string
} | null>(null)
const trendsDays = ref(30)
const trendsLoading = ref(false)
const trendsError = ref('')

const maxSignups = computed(() => {
  const arr = trends.value?.signups || []
  if (!arr.length) return 1
  return Math.max(1, ...arr.map((d: any) => d.count))
})
const maxProjects = computed(() => {
  const arr = trends.value?.projects || []
  if (!arr.length) return 1
  return Math.max(1, ...arr.map((d: any) => d.count))
})
function trendBarHeight(count: number, type: 'signups' | 'projects') {
  const max = type === 'signups' ? maxSignups.value : maxProjects.value
  return Math.round((count / max) * 100)
}
const firstTrendDate = computed(() => {
  const arr = trends.value?.signups || trends.value?.projects || []
  return arr[0]?.date || ''
})
const lastTrendDate = computed(() => {
  const arr = trends.value?.signups || trends.value?.projects || []
  return arr[arr.length - 1]?.date || ''
})

// Users
const usersList = ref<any[]>([])
const usersTotal = ref(0)
const usersSkip = ref(0)
const usersLimit = ref(100)
const usersPage = computed(() => Math.floor(usersSkip.value / usersLimit.value) + 1)
const usersFilterActive = ref('')
const usersFilterDomain = ref('')
const usersLoading = ref(false)
const usersError = ref('')

// Activity
const activity = ref<{
  activities?: { id: number; user: string; action: string; entity?: string; entity_id?: number; details?: any; created_at: string }[]
  security_events?: any[]
  time_range_hours?: number
  total_activities?: number
} | null>(null)
const activityHours = ref(24)
const activityLoading = ref(false)
const activityError = ref('')

// Domains
const domainsData = ref<{ domains?: { domain: string; users: number; companies: number; projects: number }[]; total_domains?: number } | null>(null)
const domainsLoading = ref(false)
const domainsError = ref('')

// Active users
const activeUsersData = ref<{ active_users?: { email: string; activity_count: number; last_activity: string }[]; period_days?: number; total_active?: number } | null>(null)
const activeUsersLoading = ref(false)
const activeUsersError = ref('')

type SignupLeadRow = {
  email: string
  last_source?: string
  source?: string
  last_seen?: string
  last_seen_at?: string
  updated_at?: string
  created_at?: string
  converted?: boolean
  user_id?: string | number | null
}

const signupLeads = ref<SignupLeadRow[]>([])
const signupLeadsLoading = ref(false)
const signupLeadsError = ref('')
/** Shown when API is missing (404) — not a hard error */
const signupLeadsInfo = ref('')
const localSignupLeads = ref<LocalSignupLeadEntry[]>([])
const leadsLocalSourceFilter = ref('')
const leadsLocalEmailFilter = ref('')

function leadEmailDomain(email: string | null | undefined): string {
  if (email == null || typeof email !== 'string') return '—'
  const i = email.lastIndexOf('@')
  if (i === -1 || i === email.length - 1) return '—'
  const d = email.slice(i + 1).trim()
  return d || '—'
}

const filteredLocalSignupLeads = computed(() => {
  const raw = localSignupLeads.value
  let rows = Array.isArray(raw) ? raw : []
  if (leadsLocalSourceFilter.value) {
    rows = rows.filter((r) => r?.source === leadsLocalSourceFilter.value)
  }
  const q = leadsLocalEmailFilter.value.trim().toLowerCase()
  if (q) {
    rows = rows.filter((r) => {
      const em = String(r?.email ?? '').toLowerCase()
      return em.includes(q) || leadEmailDomain(r?.email).toLowerCase().includes(q)
    })
  }
  return rows
})

function refreshLocalSignupLeads() {
  localSignupLeads.value = readLocalSignupLeadsLog()
}

function applyLocalSignupLeadsFilters() {
  refreshLocalSignupLeads()
}

function clearLocalSignupLeads() {
  clearLocalSignupLeadsLog()
  localSignupLeads.value = []
}

function formatDate(s: string | number | undefined) {
  if (s === '' || s === null || s === undefined) return '—'
  try {
    return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return String(s)
  }
}
function formatDateTime(s: string) {
  if (!s) return '—'
  try {
    return new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return s
  }
}

async function fetchOverview() {
  overviewLoading.value = true
  overviewError.value = ''
  try {
    const res = await authenticatedFetch(`${API}/overview`)
    if (!res.ok) {
      const text = await res.text()
      let msg = 'Failed to load overview'
      try {
        const j = JSON.parse(text)
        msg = j.detail || j.message || text
      } catch {
        msg = text || msg
      }
      throw new Error(msg)
    }
    overview.value = await res.json()
  } catch (e: any) {
    overviewError.value = e.message || 'Failed to load overview'
  } finally {
    overviewLoading.value = false
  }
}

async function fetchTrends() {
  trendsLoading.value = true
  trendsError.value = ''
  try {
    const res = await authenticatedFetch(`${API}/trends?days=${trendsDays.value}`)
    if (!res.ok) {
      const text = await res.text()
      let msg = 'Failed to load trends'
      try {
        const j = JSON.parse(text)
        msg = j.detail || j.message || text
      } catch {
        msg = text || msg
      }
      throw new Error(msg)
    }
    trends.value = await res.json()
  } catch (e: any) {
    trendsError.value = e.message || 'Failed to load trends'
  } finally {
    trendsLoading.value = false
  }
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
    const res = await authenticatedFetch(`${API}/users?${params.toString()}`)
    if (!res.ok) {
      const text = await res.text()
      let msg = 'Failed to load users'
      try {
        const j = JSON.parse(text)
        msg = j.detail || j.message || text
      } catch {
        msg = text || msg
      }
      throw new Error(msg)
    }
    const data = await res.json()
    usersList.value = data.users || []
    usersTotal.value = data.total ?? 0
    usersSkip.value = data.skip ?? 0
    usersLimit.value = data.limit ?? 100
  } catch (e: any) {
    usersError.value = e.message || 'Failed to load users'
  } finally {
    usersLoading.value = false
  }
}

async function fetchActivity() {
  activityLoading.value = true
  activityError.value = ''
  try {
    const res = await authenticatedFetch(`${API}/activity?hours=${activityHours.value}&limit=100`)
    if (!res.ok) {
      const text = await res.text()
      let msg = 'Failed to load activity'
      try {
        const j = JSON.parse(text)
        msg = j.detail || j.message || text
      } catch {
        msg = text || msg
      }
      throw new Error(msg)
    }
    activity.value = await res.json()
  } catch (e: any) {
    activityError.value = e.message || 'Failed to load activity'
  } finally {
    activityLoading.value = false
  }
}

async function fetchDomains() {
  domainsLoading.value = true
  domainsError.value = ''
  try {
    const res = await authenticatedFetch(`${API}/domains`)
    if (!res.ok) {
      const text = await res.text()
      let msg = 'Failed to load domains'
      try {
        const j = JSON.parse(text)
        msg = j.detail || j.message || text
      } catch {
        msg = text || msg
      }
      throw new Error(msg)
    }
    domainsData.value = await res.json()
  } catch (e: any) {
    domainsError.value = e.message || 'Failed to load domains'
  } finally {
    domainsLoading.value = false
  }
}

async function fetchSignupLeads() {
  signupLeadsLoading.value = true
  signupLeadsError.value = ''
  signupLeadsInfo.value = ''
  try {
    const res = await authenticatedFetch(`${API}/signup-leads?limit=100`)
    if (res.status === 404) {
      signupLeads.value = []
      signupLeadsInfo.value =
        'GET /api/v1/admin/usage/signup-leads returned 404 — use the “Captured on this browser” table above for a simple preview, or add this endpoint later for all users.'
      return
    }
    if (!res.ok) {
      const text = await res.text()
      let msg = 'Failed to load signup leads'
      try {
        const j = JSON.parse(text)
        msg = j.detail || j.message || text
      } catch {
        msg = text || msg
      }
      throw new Error(msg)
    }
    const data = (await res.json()) as Record<string, unknown>
    const raw = data.items ?? data.leads ?? data.signup_leads
    const items = Array.isArray(raw) ? raw : []
    signupLeads.value = items.map((x: unknown) => {
      const o = x as Record<string, unknown>
      const email = String(o.email ?? o.address ?? '')
      return {
        email,
        last_source: o.last_source != null ? String(o.last_source) : o.source != null ? String(o.source) : undefined,
        source: o.source != null ? String(o.source) : undefined,
        last_seen: o.last_seen != null ? String(o.last_seen) : undefined,
        last_seen_at: o.last_seen_at != null ? String(o.last_seen_at) : undefined,
        updated_at: o.updated_at != null ? String(o.updated_at) : undefined,
        created_at: o.created_at != null ? String(o.created_at) : undefined,
        converted: typeof o.converted === 'boolean' ? o.converted : undefined,
        user_id: o.user_id as string | number | null | undefined,
      } as SignupLeadRow
    }).filter((r) => r.email.includes('@'))
  } catch (e: any) {
    signupLeadsError.value = e.message || 'Failed to load signup leads'
    signupLeads.value = []
  } finally {
    signupLeadsLoading.value = false
    refreshLocalSignupLeads()
  }
}

async function fetchActiveUsers() {
  activeUsersLoading.value = true
  activeUsersError.value = ''
  try {
    const res = await authenticatedFetch(`${API}/active-users?days=30`)
    if (!res.ok) {
      const text = await res.text()
      let msg = 'Failed to load active users'
      try {
        const j = JSON.parse(text)
        msg = j.detail || j.message || text
      } catch {
        msg = text || msg
      }
      throw new Error(msg)
    }
    activeUsersData.value = await res.json()
  } catch (e: any) {
    activeUsersError.value = e.message || 'Failed to load active users'
  } finally {
    activeUsersLoading.value = false
  }
}

watch(trendsDays, () => fetchTrends())
watch(activityHours, () => fetchActivity())

onMounted(async () => {
  refreshLocalSignupLeads()
  await Promise.all([
    fetchOverview(),
    fetchSignupLeads(),
    fetchTrends(),
    fetchUsers(),
    fetchActivity(),
    fetchDomains(),
    fetchActiveUsers(),
  ])
})
</script>
