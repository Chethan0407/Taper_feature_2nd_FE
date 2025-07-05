<template>
  <div class="min-h-screen bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Checklists</h1>
          <p class="text-gray-400">Build, reuse and sign-off tapeout checklists</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Checklist Templates -->
          <div class="lg:col-span-2">
            <div class="card">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-white">Checklist Templates</h2>
                <button class="btn-primary">Create Template</button>
              </div>
              
              <div class="space-y-4">
                <div v-for="template in templates" :key="template.id" class="p-4 bg-dark-800 rounded-lg border border-dark-600">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-medium text-white">{{ template.name }}</h3>
                      <p class="text-sm text-gray-400">{{ template.items }} items • {{ template.category }}</p>
                    </div>
                    <button class="btn-secondary">Use Template</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Checklists -->
          <div class="card">
            <h2 class="text-xl font-semibold text-white mb-6">Active Checklists</h2>
            <div class="space-y-4">
              <div v-for="checklist in activeChecklists" :key="checklist.id" class="p-4 bg-dark-800 rounded-lg border border-dark-600">
                <h3 class="font-medium text-white mb-2">{{ checklist.name }}</h3>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-400">{{ checklist.progress }}/{{ checklist.total }} completed</span>
                  <span :class="getProgressClass(checklist.progress, checklist.total)" class="px-2 py-1 rounded text-xs">
                    {{ Math.round((checklist.progress / checklist.total) * 100) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'

interface Template {
  id: string
  name: string
  items: number
  category: string
}

interface Checklist {
  id: string
  name: string
  progress: number
  total: number
}

const templates: Template[] = [
  { id: '1', name: 'Standard Tapeout Checklist', items: 45, category: 'General' },
  { id: '2', name: 'Design Review Checklist', items: 32, category: 'Design' },
  { id: '3', name: 'Foundry Submission', items: 28, category: 'Foundry' }
]

const activeChecklists: Checklist[] = [
  { id: '1', name: 'Project Alpha Review', progress: 12, total: 45 },
  { id: '2', name: 'Beta Design Validation', progress: 8, total: 32 },
  { id: '3', name: 'Gamma Foundry Prep', progress: 25, total: 28 }
]

const getProgressClass = (progress: number, total: number) => {
  const percentage = (progress / total) * 100
  if (percentage >= 80) return 'bg-green-500/20 text-green-400'
  if (percentage >= 50) return 'bg-yellow-500/20 text-yellow-400'
  return 'bg-red-500/20 text-red-400'
}
</script> 