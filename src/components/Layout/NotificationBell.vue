<template>
  <div class="relative" ref="dropdownRef">
    <button
      class="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      @click="toggleDropdown"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span 
        v-if="unreadCount > 0" 
        class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Notification Dropdown -->
    <div
      v-if="isOpen"
      class="absolute right-0 top-full z-50 mt-2 flex max-h-[500px] w-96 max-w-[calc(100vw-2rem)] flex-col rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-dark-700 dark:bg-dark-900"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-dark-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
        <div class="flex items-center gap-3">
          <span v-if="unreadCount > 0" class="text-sm text-blue-600 dark:text-neon-blue">
            {{ unreadCount }} unread
          </span>
          <button
            @click="markAllAsRead"
            :disabled="unreadCount === 0 || markingAllAsRead"
            class="text-sm text-gray-500 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-white"
          >
            {{ markingAllAsRead ? 'Marking...' : 'Mark all as read' }}
          </button>
        </div>
      </div>

      <!-- Notification List -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="loading" class="p-8 text-center text-gray-500 dark:text-gray-400">
          Loading...
        </div>
        <div v-else-if="error" class="p-8 text-center text-red-600 dark:text-red-400">
          {{ error }}
        </div>
        <div v-else-if="notifications.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
          No notifications
        </div>
        <div v-else>
          <div
            v-for="notification in displayedNotifications"
            :key="notification.id"
            :class="[
              'flex cursor-pointer items-start gap-3 border-b border-gray-100 px-4 py-3 transition-colors dark:border-dark-700',
              !notification.is_read
                ? 'bg-gray-50 hover:bg-gray-100 dark:bg-dark-800/50 dark:hover:bg-dark-800'
                : 'hover:bg-gray-50 dark:hover:bg-dark-800/50',
            ]"
            @click="handleNotificationClick(notification)"
          >
            <div class="min-w-0 flex-1">
              <div class="mb-1 flex items-center gap-2">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                  :class="getTypeBadgeClass(notification.type)"
                >
                  {{ formatType(notification.type) }}
                </span>
              </div>
              <p class="mb-1 text-sm text-gray-900 dark:text-white">{{ notification.message }}</p>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatTime(notification.created_at) }}</span>
            </div>
            <div v-if="!notification.is_read" class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500 dark:bg-neon-blue"></div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="notifications.length > 10" class="border-t border-gray-200 px-4 py-3 text-center dark:border-dark-700">
        <router-link
          to="/notifications"
          class="text-sm text-blue-600 hover:text-blue-500 dark:text-neon-blue dark:hover:text-neon-blue/80"
          @click="isOpen = false"
        >
          View all notifications
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchUnreadNotifications } from '@/utils/shell-data'
import { isAbortError } from '@/utils/request-coordinator'
import { authenticatedFetch } from '@/utils/auth-requests'

interface Notification {
  id: number
  type: 'comment' | 'update' | 'mention'
  entity_type: string
  entity_id: number
  message: string
  is_read: boolean
  created_at: string
}

const router = useRouter()
const dropdownRef = ref<HTMLElement | null>(null)

const notifications = ref<Notification[]>([])
const isOpen = ref(false)
const loading = ref(false)
const error = ref('')
const markingAllAsRead = ref(false)

let pollInterval: number | null = null

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.is_read).length
})

const displayedNotifications = computed(() => {
  return notifications.value.slice(0, 10)
})

// Load notifications (unread only) — shares one GET with Smart Suggestions / other shell readers
const loadNotifications = async () => {
  try {
    loading.value = true
    error.value = ''
    notifications.value = await fetchUnreadNotifications()
  } catch (e: any) {
    if (isAbortError(e)) return
    error.value = e?.message || 'Failed to load notifications'
    console.error('Failed to load notifications:', e)
  } finally {
    loading.value = false
  }
}

// Mark notification as read (optimistic: remove from unread list immediately)
const markAsRead = async (notificationId: number) => {
  // Optimistically remove from local unread list so badge + list update immediately
  const index = notifications.value.findIndex(n => n.id === notificationId)
  if (index === -1) return

  const [removed] = notifications.value.splice(index, 1)

  try {
    const res = await authenticatedFetch(`/api/v1/notifications/${notificationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true })
    })

    if (!res.ok) {
      throw new Error('Failed to mark as read')
    }
  } catch (e: any) {
    console.error('Failed to mark as read:', e)
    // Revert optimistic update on error
    if (removed) {
      notifications.value.splice(index, 0, removed)
    }
  }
}

// Mark all as read
const markAllAsRead = async () => {
  if (unreadCount.value === 0) return

  try {
    markingAllAsRead.value = true
    const unreadNotifications = notifications.value.filter(n => !n.is_read)
    
    // Mark all unread notifications
    await Promise.all(unreadNotifications.map(n => markAsRead(n.id)))
  } catch (e: any) {
    console.error('Failed to mark all as read:', e)
  } finally {
    markingAllAsRead.value = false
  }
}

// Handle notification click
const handleNotificationClick = async (notification: Notification) => {
  // Mark as read if not already read
  if (!notification.is_read) {
    await markAsRead(notification.id)
  }

  // Close dropdown
  isOpen.value = false

  // Navigate to entity
  navigateToEntity(notification)
}

// Navigate to entity based on type
const navigateToEntity = (notification: Notification) => {
  // Map known entity types to existing routes in the app
  const entityType = notification.entity_type

  if (entityType === 'spec') {
    router.push(`/specs/${notification.entity_id}`)
    return
  }

  if (entityType === 'project') {
    router.push(`/projects/${notification.entity_id}`)
    return
  }

  if (entityType === 'lint_result') {
    router.push({ path: '/speclint', query: { project: String(notification.entity_id) } })
    return
  }

  if (entityType === 'checklist') {
    // We don't have a checklist-details route; send user to Checklists overview
    router.push('/checklists')
    return
  }

  if (entityType === 'company') {
    router.push(`/companies/${notification.entity_id}`)
    return
  }

  // Fallback: go to dashboard so we never leave the user on a blank page
  router.push('/dashboard')
}

// Toggle dropdown
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    loadNotifications()
  }
}

// Helper: human-readable notification type
const formatType = (type: Notification['type']) => {
  switch (type) {
    case 'comment':
      return 'Comment'
    case 'update':
      return 'Update'
    case 'mention':
      return 'Mention'
    default:
      return type
  }
}

// Helper: badge color per type
const getTypeBadgeClass = (type: Notification['type']) => {
  switch (type) {
    case 'comment':
      return 'border border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/20 dark:text-blue-300'
    case 'update':
      return 'border border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-300'
    case 'mention':
      return 'border border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-500/40 dark:bg-purple-500/20 dark:text-purple-300'
    default:
      return 'border border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-500/40 dark:bg-gray-500/20 dark:text-gray-300'
  }
}

// Format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// Refresh handler for global "notifications:refresh" events (e.g., checklist approval)
const handleExternalRefresh = () => {
  loadNotifications()
}

// Setup polling
onMounted(() => {
  loadNotifications()
  // Poll every 30 seconds
  pollInterval = window.setInterval(loadNotifications, 30000)
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('notifications:refresh', handleExternalRefresh)
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('notifications:refresh', handleExternalRefresh)
})

// Watch for route changes to refresh notifications
watch(() => router.currentRoute.value.path, () => {
  if (isOpen.value) {
    loadNotifications()
  }
})
</script>

<style scoped>
/* Additional styles if needed */
</style>

