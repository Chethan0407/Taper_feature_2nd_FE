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
      class="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-dark-900 border border-dark-700 rounded-lg shadow-2xl z-50 flex flex-col max-h-[500px]"
    >
      <!-- Header -->
      <div class="px-4 py-3 border-b border-dark-700 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">Notifications</h3>
        <div class="flex items-center gap-3">
          <span v-if="unreadCount > 0" class="text-sm text-neon-blue">
            {{ unreadCount }} unread
          </span>
          <button
            @click="markAllAsRead"
            :disabled="unreadCount === 0 || markingAllAsRead"
            class="text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ markingAllAsRead ? 'Marking...' : 'Mark all as read' }}
          </button>
        </div>
      </div>

      <!-- Notification List -->
      <div class="overflow-y-auto flex-1">
        <div v-if="loading" class="p-8 text-center text-gray-400">
          Loading...
        </div>
        <div v-else-if="error" class="p-8 text-center text-red-400">
          {{ error }}
        </div>
        <div v-else-if="notifications.length === 0" class="p-8 text-center text-gray-400">
          No notifications
        </div>
        <div v-else>
          <div
            v-for="notification in displayedNotifications"
            :key="notification.id"
            :class="[
              'px-4 py-3 border-b border-dark-700 cursor-pointer transition-colors flex items-start gap-3',
              !notification.is_read ? 'bg-dark-800/50 hover:bg-dark-800' : 'hover:bg-dark-800/50'
            ]"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm text-white mb-1">{{ notification.message }}</p>
              <span class="text-xs text-gray-400">{{ formatTime(notification.created_at) }}</span>
            </div>
            <div v-if="!notification.is_read" class="w-2 h-2 bg-neon-blue rounded-full mt-1.5 flex-shrink-0"></div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="notifications.length > 10" class="px-4 py-3 border-t border-dark-700 text-center">
        <router-link
          to="/notifications"
          class="text-sm text-neon-blue hover:text-neon-blue/80"
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

// Load notifications
const loadNotifications = async () => {
  try {
    loading.value = true
    error.value = ''
    const res = await authenticatedFetch('/api/v1/notifications/?is_read=false')
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(errorText || 'Failed to load notifications')
    }
    const data = await res.json()
    notifications.value = Array.isArray(data) ? data : (data.results || [])
  } catch (e: any) {
    error.value = e.message || 'Failed to load notifications'
    console.error('Failed to load notifications:', e)
  } finally {
    loading.value = false
  }
}

// Mark notification as read
const markAsRead = async (notificationId: number) => {
  try {
    const res = await authenticatedFetch(`/api/v1/notifications/${notificationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true })
    })

    if (!res.ok) {
      throw new Error('Failed to mark as read')
    }

    // Update local state
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.is_read = true
    }
  } catch (e: any) {
    console.error('Failed to mark as read:', e)
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
  const routes: Record<string, string> = {
    spec: `/specs/${notification.entity_id}`,
    project: `/projects/${notification.entity_id}`,
    lint_result: `/speclint?project=${notification.entity_id}`,
    checklist: `/checklists/${notification.entity_id}`,
    company: `/companies/${notification.entity_id}`
  }

  const route = routes[notification.entity_type]
  if (route) {
    router.push(route)
  }
}

// Toggle dropdown
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    loadNotifications()
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

// Setup polling
onMounted(() => {
  loadNotifications()
  // Poll every 30 seconds
  pollInterval = window.setInterval(loadNotifications, 30000)
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
  document.removeEventListener('mousedown', handleClickOutside)
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

