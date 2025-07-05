<template>
  <div class="fixed left-0 top-0 h-full w-64 bg-light-100 dark:bg-dark-900 border-r border-light-300 dark:border-dark-700 flex flex-col">
    <!-- Logo -->
    <div class="p-6 border-b border-light-300 dark:border-dark-700">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="6" height="6" rx="1"/>
            <rect x="15" y="3" width="6" height="6" rx="1"/>
            <rect x="3" y="15" width="6" height="6" rx="1"/>
            <rect x="15" y="15" width="6" height="6" rx="1"/>
            <line x1="9" y1="6" x2="9" y2="18"/>
            <line x1="15" y1="6" x2="15" y2="18"/>
            <line x1="6" y1="9" x2="18" y2="9"/>
            <line x1="6" y1="15" x2="18" y2="15"/>
          </svg>
        </div>
        <span class="text-xl font-bold text-gradient">TapeOutOps</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 space-y-2">
      <router-link
        v-for="item in navigationItems"
        :key="item.name"
        :to="item.path"
        class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-light-200 dark:hover:bg-dark-800 transition-all duration-200"
        :class="{ 'bg-primary-600/20 text-primary-600 dark:text-primary-400 border border-primary-600/30': $route.path === item.path }"
      >
        <component :is="item.icon" class="w-5 h-5" />
        <span class="font-medium">{{ item.name }}</span>
      </router-link>
    </nav>

    <!-- User Profile -->
    <div class="p-4 border-t border-light-300 dark:border-dark-700">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center">
          <span class="text-sm font-semibold text-white">
            {{ userInitials }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
            {{ authStore.user?.name }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
            {{ authStore.user?.email }}
          </p>
        </div>
        <button
          @click="handleLogout"
          class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title="Logout"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Search,
  Users,
  Settings
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const navigationItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Specs', path: '/specs', icon: FileText },
  { name: 'Checklists', path: '/checklists', icon: CheckSquare },
  { name: 'SpecLint', path: '/speclint', icon: Search },
  { name: 'Vendors', path: '/vendors', icon: Users },
  { name: 'Settings', path: '/settings', icon: Settings },
]

const userInitials = computed(() => {
  const name = authStore.user?.name || ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script> 