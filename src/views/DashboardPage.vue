<template>
  <div class="min-h-screen app-page">
    <Sidebar />
    <div class="ml-64">
      <Header />

      <main class="p-8">
        <div
          v-if="adminAccessNotice"
          class="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-100"
          role="status"
        >
          <p class="font-semibold">System Usage is superuser-only</p>
          <p class="mt-1 text-sm opacity-90">
            You were redirected because this account is not a superuser.
          </p>
          <button type="button" class="mt-3 text-sm font-medium text-neon-blue hover:underline" @click="dismissAdminNotice">
            Dismiss
          </button>
        </div>

        <!-- User entry hero -->
        <section class="mb-10 page-enter">
          <p class="mb-2 text-sm text-slate-500">
            Welcome back<span v-if="authStore.user?.name">, {{ authStore.user.name }}</span>
          </p>
          <h1 class="page-title-gradient mb-3 max-w-3xl">
            Your tapeout program workspace
          </h1>
          <p class="page-subtitle max-w-2xl">
            Start from here — open projects, track readiness, run SpecLint, and manage checklists.
            This is your entry point; live counts live on Stats.
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <button type="button" class="btn-primary px-6 py-3 text-base" @click="router.push('/projects')">
              Open Projects
            </button>
            <button type="button" class="btn-secondary px-6 py-3 text-base" @click="router.push('/stats')">
              View Stats
            </button>
          </div>
        </section>

        <!-- Entry cards -->
        <section class="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 page-enter">
          <button
            v-for="card in entryCards"
            :key="card.to"
            type="button"
            class="settings-card group !text-left transition hover:border-neon-blue/40"
            @click="router.push(card.to)"
          >
            <div class="settings-card-body">
              <div
                class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-white"
                :class="card.iconBg"
              >
                <component :is="card.icon" class="h-5 w-5" />
              </div>
              <h2 class="text-lg font-semibold text-white group-hover:text-neon-blue">{{ card.title }}</h2>
              <p class="mt-1 text-sm text-slate-400">{{ card.desc }}</p>
              <p class="mt-3 text-sm font-medium" :class="card.ctaClass">{{ card.cta }} →</p>
            </div>
          </button>
        </section>

        <!-- Soft circuit accent (decorative, not data) -->
        <section class="flex justify-center opacity-80 page-enter" aria-hidden="true">
          <div class="relative h-48 w-48">
            <svg class="h-full w-full" viewBox="0 0 256 256" fill="none">
              <defs>
                <pattern id="dash-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(56,189,248,0.12)" stroke-width="1" />
                </pattern>
              </defs>
              <rect width="256" height="256" fill="url(#dash-grid)" />
              <path
                d="M 32 64 L 96 64 L 96 32 L 160 32 L 160 96 L 224 96"
                stroke="rgba(56,189,248,0.55)"
                stroke-width="2"
                fill="none"
                class="animate-pulse-slow"
              />
              <path
                d="M 64 128 L 128 128 L 128 160 L 192 160 L 192 224"
                stroke="rgba(52,211,153,0.5)"
                stroke-width="2"
                fill="none"
                class="animate-pulse-slow"
                style="animation-delay: 1s"
              />
              <circle cx="32" cy="64" r="4" fill="rgba(56,189,248,0.85)" class="animate-pulse" />
              <circle cx="224" cy="96" r="4" fill="rgba(56,189,248,0.85)" class="animate-pulse" />
              <circle cx="192" cy="224" r="4" fill="rgba(52,211,153,0.85)" class="animate-pulse" />
            </svg>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

onMounted(() => {
  if (!authStore.user) void authStore.checkAuth()
})

const adminAccessNotice = computed(() => route.query.notice === 'admin_required')
function dismissAdminNotice() {
  router.replace({ path: '/dashboard' })
}

function iconPath(d: string) {
  return {
    render() {
      return h(
        'svg',
        { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', 'aria-hidden': 'true' },
        [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d })],
      )
    },
  }
}

const entryCards = [
  {
    title: 'Projects',
    desc: 'Create and open tapeout programs with foundry / node / PDK profile.',
    to: '/projects',
    cta: 'Browse projects',
    ctaClass: 'text-sky-300',
    iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600',
    icon: iconPath('M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'),
  },
  {
    title: 'Tapeout readiness',
    desc: 'Freeze design, upload signoff reports, track waivers and packages.',
    to: '/projects',
    cta: 'Open a project',
    ctaClass: 'text-emerald-300',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    icon: iconPath('M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'),
  },
  {
    title: 'SpecLint',
    desc: 'Validate specification documents for completeness and consistency.',
    to: '/speclint',
    cta: 'Run SpecLint',
    ctaClass: 'text-violet-300',
    iconBg: 'bg-gradient-to-br from-violet-500 to-fuchsia-600',
    icon: iconPath('M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'),
  },
  {
    title: 'Checklists',
    desc: 'Use TOR templates and active approval workflows.',
    to: '/checklists',
    cta: 'Open checklists',
    ctaClass: 'text-amber-300',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    icon: iconPath('M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'),
  },
  {
    title: 'Specs',
    desc: 'Review and filter the specification pipeline.',
    to: '/specs',
    cta: 'Browse specs',
    ctaClass: 'text-cyan-300',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-sky-600',
    icon: iconPath('M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'),
  },
  {
    title: 'Stats',
    desc: 'Live Approved / Pending / Quality metrics and filtered spec matches.',
    to: '/stats',
    cta: 'Open stats',
    ctaClass: 'text-fuchsia-300',
    iconBg: 'bg-gradient-to-br from-fuchsia-500 to-pink-600',
    icon: iconPath('M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'),
  },
]
</script>
