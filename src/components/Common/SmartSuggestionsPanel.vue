<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 flex"
        aria-modal="true"
        role="dialog"
      >
        <!-- Backdrop -->
        <div
          class="flex-1 bg-black/40 backdrop-blur-sm"
          @click="close"
        ></div>

        <!-- Panel -->
        <div
          class="w-full max-w-md bg-dark-950 border-l border-dark-700 shadow-2xl z-50 flex flex-col"
        >
          <!-- Header -->
          <div class="px-5 py-4 border-b border-dark-700 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 3a1 1 0 011-1 9 9 0 019 9 9.003 9.003 0 01-7 8.717V21a1 1 0 01-1 1h-2a1 1 0 01-1-1v-1.283A9.003 9.003 0 013 11a9 9 0 018-9z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-white">Smart Suggestions</h2>
                <p class="text-xs text-gray-400">Next best actions based on your current workspace.</p>
              </div>
            </div>
            <button
              class="text-gray-400 hover:text-white transition-colors"
              @click="close"
              aria-label="Close smart suggestions"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div v-if="loading" class="flex items-center justify-center py-12">
              <div class="flex flex-col items-center gap-3 text-gray-400">
                <svg class="w-8 h-8 animate-spin text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4"></circle>
                  <path class="opacity-75" stroke-width="4" d="M4 12a8 8 0 018-8"></path>
                </svg>
                <span class="text-sm">Analyzing your specs, checklists, and activity…</span>
              </div>
            </div>

            <div v-else-if="error" class="py-6">
              <div class="bg-red-900/20 border border-red-700 rounded-xl p-4 flex items-start gap-3">
                <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p class="text-sm text-red-400">{{ error }}</p>
                  <button
                    class="mt-2 text-xs text-neon-blue hover:text-neon-blue/80"
                    @click="loadSuggestions"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>

            <div v-else-if="suggestions.length === 0" class="py-8 text-center text-gray-400 text-sm">
              You're all caught up. No urgent suggestions right now.
            </div>

            <div
              v-else
              v-for="suggestion in suggestions"
              :key="suggestion.id"
              :class="[
                'rounded-xl border px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-dark-800 transition-colors',
                suggestion.severity === 'warning'
                  ? 'border-yellow-500/40 bg-yellow-500/5'
                  : suggestion.severity === 'success'
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-dark-700 bg-dark-900'
              ]"
              @click="handleSuggestionClick(suggestion)"
            >
              <div class="mt-0.5">
                <svg
                  v-if="suggestion.icon === 'spec'"
                  class="w-5 h-5 text-neon-blue"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <svg
                  v-else-if="suggestion.icon === 'checklist'"
                  class="w-5 h-5 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <svg
                  v-else
                  class="w-5 h-5 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-white mb-1">
                  {{ suggestion.title }}
                </p>
                <p class="text-xs text-gray-400 mb-2">
                  {{ suggestion.description }}
                </p>
                <button
                  class="inline-flex items-center gap-1 text-xs font-medium text-neon-blue hover:text-neon-blue/80"
                  @click.stop="handleSuggestionClick(suggestion)"
                >
                  {{ suggestion.ctaLabel }}
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-5 py-3 border-t border-dark-700 text-[11px] text-gray-500 flex items-center justify-between">
            <span>Suggestions are based on your current specs, checklists, and activity.</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authenticatedFetch } from '@/utils/auth-requests'

interface SuggestionCard {
  id: string
  title: string
  description: string
  ctaLabel: string
  route: { path?: string; name?: string; query?: Record<string, any> }
  severity: 'info' | 'warning' | 'success'
  icon: 'spec' | 'checklist' | 'notification'
}

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const error = ref('')
const suggestions = ref<SuggestionCard[]>([])

const close = () => emit('close')

const buildDashboardUrl = () => {
  // Try to reuse any dashboard-like filters from current route query if present
  const params = new URLSearchParams()
  const platform = route.query.platform as string | undefined
  const edaTool = route.query.eda_tool as string | undefined
  const type = route.query.type as string | undefined
  const status = route.query.status as string | undefined

  if (platform) params.append('platform', platform)
  if (edaTool) params.append('eda_tool', edaTool)
  if (type) params.append('type', type)
  if (status) params.append('status', status)

  const qs = params.toString()
  return qs ? `/api/v1/dashboard?${qs}` : '/api/v1/dashboard'
}

const loadSuggestions = async () => {
  loading.value = true
  error.value = ''
  suggestions.value = []

  try {
    const [dashboardRes, checklistStatsRes, activeChecklistsRes, notificationsRes] = await Promise.allSettled([
      authenticatedFetch(buildDashboardUrl()),
      authenticatedFetch('/api/v1/checklists/stats'),
      authenticatedFetch('/api/v1/checklists/active'),
      authenticatedFetch('/api/v1/notifications?is_read=false')
    ])

    // Specs / dashboard
    if (dashboardRes.status === 'fulfilled' && dashboardRes.value.ok) {
      const data = await dashboardRes.value.json().catch(() => ({}))
      const pending = data.pending_specs ?? data.pending ?? 0

      if (pending && pending > 0) {
        suggestions.value.push({
          id: 'pending-specs',
          title: `You have ${pending} pending specs`,
          description: 'Review and approve pending specifications to keep your tapeout on track.',
          ctaLabel: 'Go to Specs',
          route: { path: '/specs', query: {} },
          severity: 'warning',
          icon: 'spec'
        })
      }
    }

    // Checklists
    let checklistStats: any = null
    if (checklistStatsRes.status === 'fulfilled' && checklistStatsRes.value.ok) {
      checklistStats = await checklistStatsRes.value.json().catch(() => null)
    }

    if (activeChecklistsRes.status === 'fulfilled' && activeChecklistsRes.value.ok) {
      const active = await activeChecklistsRes.value.json().catch(() => [])
      const pendingChecklists = (active || []).filter((c: any) => {
        const approvedFlag = c.is_approved ?? c.approved
        const rawStatus =
          (approvedFlag === true ? 'approved' : undefined) ??
          c.status ??
          c.approval_status ??
          c.review_status ??
          'pending'
        const status = String(rawStatus).toLowerCase()
        return status !== 'approved' && status !== 'done'
      })

      if (pendingChecklists.length > 0) {
        const first = pendingChecklists[0]
        const name =
          first.template_name ||
          first.template?.name ||
          first.name ||
          first.title ||
          `Checklist ${first.id}`

        suggestions.value.push({
          id: 'pending-checklist',
          title: `Checklist "${name}" is pending approval`,
          description: 'Review the items and approve the checklist when everything looks good.',
          ctaLabel: 'Open Checklist',
          route: { path: '/checklists' },
          severity: 'warning',
          icon: 'checklist'
        })
      } else if (checklistStats && checklistStats.active_checklists > 0) {
        suggestions.value.push({
          id: 'all-checklists-approved',
          title: 'All active checklists look good',
          description: 'You have no checklists waiting for approval right now.',
          ctaLabel: 'View Checklists',
          route: { path: '/checklists' },
          severity: 'success',
          icon: 'checklist'
        })
      }
    }

    // Notifications
    if (notificationsRes.status === 'fulfilled') {
      let res = notificationsRes.value
      if (res.status === 404) {
        // Fallback variant with trailing slash before query params
        res = await authenticatedFetch('/api/v1/notifications/?is_read=false')
      }

      if (res.ok) {
        const data = await res.json().catch(() => [])
        const notifications = Array.isArray(data) ? data : (data.results || [])

        const important = notifications.slice(0, 3)
        important.forEach((n: any, index: number) => {
          let title = ''
          let routeConfig: SuggestionCard['route'] = { path: '/' }

          const entityType = n.entity_type
          const entityId = n.entity_id

          if (entityType === 'spec') {
            title = `Spec update: ${n.message || 'A spec was updated'}`
            routeConfig = { path: `/specs/${entityId}` }
          } else if (entityType === 'checklist') {
            title = `Checklist update: ${n.message || 'Checklist status changed'}`
            routeConfig = { path: '/checklists' }
          } else if (entityType === 'project') {
            title = `Project activity: ${n.message || 'Project was updated'}`
            routeConfig = { path: `/projects/${entityId}` }
          } else {
            title = n.message || 'Recent activity'
            routeConfig = { path: '/' }
          }

          suggestions.value.push({
            id: `notification-${n.id ?? index}`,
            title,
            description: 'Review this recent activity to stay up to date.',
            ctaLabel: 'View details',
            route: routeConfig,
            severity: 'info',
            icon: 'notification'
          })
        })
      }
    }
  } catch (e: any) {
    error.value = e?.message || 'Failed to load smart suggestions.'
    console.error('Failed to load smart suggestions:', e)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      loadSuggestions()
    }
  }
)

onMounted(() => {
  if (props.isOpen) {
    loadSuggestions()
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>


