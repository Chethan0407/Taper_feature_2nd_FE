<template>
  <div class="fixed left-0 top-0 z-30 flex h-full w-64 flex-col border-r border-slate-300/70 bg-[#f7fafc]/95 shadow-[4px_0_24px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-dark-700/80 dark:bg-dark-900/90 dark:shadow-none">
    <!-- Soft brand wash behind nav -->
    <div
      class="pointer-events-none absolute inset-0 opacity-90 dark:opacity-70"
      aria-hidden="true"
      style="background: radial-gradient(ellipse 120% 60% at 0% 0%, rgb(var(--brand-primary-rgb) / 0.16), transparent 55%), linear-gradient(180deg, rgba(255,255,255,0.5), transparent 40%)"
    />

    <!-- Logo -->
    <div class="relative border-b border-slate-300/70 p-6 dark:border-dark-700/80">
      <div class="flex items-center space-x-3">
        <div
          v-if="branding.logo_url"
          class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-md ring-1 ring-black/5 dark:border-dark-600 dark:bg-dark-800 dark:ring-white/10"
        >
          <img
            :src="branding.logo_url"
            alt="Logo"
            class="max-h-full max-w-full object-contain"
          />
        </div>
        <div
          v-else
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple shadow-md ring-1 ring-black/5 dark:ring-white/10"
        >
          <svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
        <span class="font-display text-xl font-bold text-gradient">{{ branding.company_name || 'TapeOutOps' }}</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="relative flex-1 space-y-1.5 overflow-y-auto p-4">
      <router-link
        v-for="item in navigationItems"
        :key="item.name"
        :to="item.path"
        class="group relative flex items-center space-x-3 rounded-xl px-4 py-3 text-slate-600 transition-all duration-200 hover:translate-x-0.5 hover:bg-white hover:text-slate-900 hover:shadow-sm dark:text-gray-300 dark:hover:bg-dark-800/80 dark:hover:text-white dark:hover:shadow-none"
        :class="{
          'border border-neon-blue/30 bg-white text-neon-blue shadow-md shadow-neon-blue/10 dark:border-primary-600/25 dark:bg-primary-600/20 dark:text-primary-400 dark:shadow-sm dark:shadow-primary-600/10':
            $route.path === item.path || $route.path.startsWith(item.path + '/'),
        }"
      >
        <span
          v-if="$route.path === item.path || $route.path.startsWith(item.path + '/')"
          class="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-neon-blue"
          aria-hidden="true"
        />
        <component
          :is="item.icon"
          class="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
          :class="{ 'text-neon-blue': $route.path === item.path || $route.path.startsWith(item.path + '/') }"
        />
        <span class="font-medium">{{ item.name }}</span>
      </router-link>
    </nav>

    <!-- User Profile -->
    <div class="relative border-t border-slate-300/70 p-4 dark:border-dark-700/80">
      <div class="flex items-center space-x-3 rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm dark:border-transparent dark:bg-dark-800/50 dark:shadow-none">
        <div
          v-if="branding.logo_url"
          class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white p-1 shadow-md ring-2 ring-white/40 dark:border-dark-600 dark:bg-dark-800 dark:ring-dark-700"
        >
          <img
            :src="branding.logo_url"
            alt="Brand logo"
            class="max-h-full max-w-full object-contain"
          />
        </div>
        <div
          v-else
          class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neon-green to-neon-blue shadow-md shadow-neon-blue/20 ring-2 ring-white/40 dark:ring-dark-700"
        >
          <span class="text-sm font-semibold text-white">
            {{ userInitials }}
          </span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-slate-800 dark:text-gray-200">
            {{ authStore.user?.name }}
          </p>
          <p class="truncate text-xs text-slate-500 dark:text-gray-400">
            {{ authStore.user?.email }}
          </p>
        </div>
        <button
          @click="handleLogout"
          class="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-gray-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
          title="Logout"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBrandingStore } from '@/stores/branding'
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Search,
  Users,
  Settings,
  Folder,
  Building2,
  BarChart3,
  Activity,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const branding = useBrandingStore()

onMounted(() => {
  if (!branding.logo_url && !branding.company_name) {
    void branding.fetchBranding()
  }
})

const mainNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Stats', path: '/stats', icon: Activity },
  { name: 'Projects', path: '/projects', icon: Folder },
  { name: 'Specs', path: '/specs', icon: FileText },
  { name: 'Checklists', path: '/checklists', icon: CheckSquare },
  { name: 'SpecLint', path: '/speclint', icon: Search },
  { name: 'Vendors', path: '/vendors', icon: Users },
  { name: 'Companies', path: '/companies', icon: Building2 },
  { name: 'Settings', path: '/settings', icon: Settings },
]

const adminNavItems = [
  { name: 'System Usage', path: '/admin/usage', icon: BarChart3 },
]

const navigationItems = computed(() => {
  const items = [...mainNavItems]
  if (authStore.isSuperuser === true) {
    items.push(...adminNavItems)
  }
  return items
})

const userInitials = computed(() => {
  const name = authStore.user?.name || ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
