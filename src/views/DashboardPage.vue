<template>
  <div class="min-h-screen bg-dark-950">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Main Content -->
    <div class="ml-64">
      <!-- Header -->
      <Header />
      
      <!-- Dashboard Content -->
      <main class="p-8">
        <!-- Welcome Banner -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gradient mb-4">
            Streamline Your Tapeout Workflow
          </h1>
          <p class="text-xl text-gray-400 max-w-2xl">
            Welcome back, {{ authStore.user?.name }}. Manage your semiconductor design specifications, 
            automate quality checks, and collaborate with vendors all in one place.
          </p>
        </div>

        <!-- CTA Section -->
        <div class="mb-12">
          <button class="btn-primary text-lg px-8 py-4 animate-glow">
            Get Started
          </button>
        </div>

        <!-- Chip Illustration -->
        <div class="mb-12 flex justify-center">
          <div class="relative w-64 h-64">
            <!-- Animated Circuit Pattern -->
            <svg class="w-full h-full" viewBox="0 0 256 256" fill="none">
              <!-- Grid Pattern -->
              <defs>
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(0,212,255,0.1)" stroke-width="1"/>
                </pattern>
              </defs>
              <rect width="256" height="256" fill="url(#grid)"/>
              
              <!-- Circuit Lines -->
              <path d="M 32 64 L 96 64 L 96 32 L 160 32 L 160 96 L 224 96" 
                    stroke="rgba(0,212,255,0.6)" stroke-width="2" fill="none" 
                    class="animate-pulse-slow"/>
              <path d="M 64 128 L 128 128 L 128 160 L 192 160 L 192 224" 
                    stroke="rgba(139,92,246,0.6)" stroke-width="2" fill="none" 
                    class="animate-pulse-slow" style="animation-delay: 1s"/>
              
              <!-- Connection Points -->
              <circle cx="32" cy="64" r="4" fill="rgba(0,212,255,0.8)" class="animate-pulse"/>
              <circle cx="96" cy="64" r="4" fill="rgba(0,212,255,0.8)" class="animate-pulse"/>
              <circle cx="160" cy="32" r="4" fill="rgba(0,212,255,0.8)" class="animate-pulse"/>
              <circle cx="224" cy="96" r="4" fill="rgba(0,212,255,0.8)" class="animate-pulse"/>
              <circle cx="64" cy="128" r="4" fill="rgba(139,92,246,0.8)" class="animate-pulse"/>
              <circle cx="192" cy="224" r="4" fill="rgba(139,92,246,0.8)" class="animate-pulse"/>
            </svg>
          </div>
        </div>

        <!-- Feature Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <!-- SpecLint Engine Card -->
          <div class="card group hover:neon-glow transition-all duration-300">
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-semibold text-white mb-2">SpecLint Engine</h3>
                <p class="text-gray-400 mb-4">
                  Automatically validate your specifications for compliance, completeness, and best practices.
                </p>
                <button class="text-neon-blue hover:text-neon-blue/80 font-medium transition-colors">
                  Try SpecLint →
                </button>
              </div>
            </div>
          </div>

          <!-- Checklist Automation Card -->
          <div class="card group hover:neon-glow transition-all duration-300">
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-neon-green to-neon-blue rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-semibold text-white mb-2">Checklist Automation</h3>
                <p class="text-gray-400 mb-4">
                  Create, assign, and track approval workflows with automated reminders and notifications.
                </p>
                <button class="text-neon-green hover:text-neon-green/80 font-medium transition-colors">
                  Create Checklist →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="card text-center">
            <div class="text-3xl font-bold text-neon-blue mb-2">12</div>
            <div class="text-gray-400">Active Specs</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-neon-green mb-2">8</div>
            <div class="text-gray-400">Pending Reviews</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-neon-purple mb-2">5</div>
            <div class="text-gray-400">Vendor Partners</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-yellow-400 mb-2">95%</div>
            <div class="text-gray-400">Quality Score</div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'

const authStore = useAuthStore()

onMounted(async () => {
  // Check authentication on mount
  await authStore.checkAuth()
})
</script> 