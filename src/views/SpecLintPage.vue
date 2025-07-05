<template>
  <div class="min-h-screen bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">SpecLint Engine</h1>
          <p class="text-gray-400">Automate spec quality checks and validation</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Rule Builder -->
          <div class="card">
            <h2 class="text-xl font-semibold text-white mb-6">Rule Builder</h2>
            <div class="space-y-4">
              <div class="p-4 bg-dark-800 rounded-lg border border-dark-600">
                <h3 class="font-medium text-white mb-2">Keyword Detection</h3>
                <input class="input-field w-full mb-2" placeholder="Enter keywords (comma separated)" />
                <select class="input-field w-full">
                  <option>Error</option>
                  <option>Warning</option>
                  <option>Info</option>
                </select>
              </div>
              
              <div class="p-4 bg-dark-800 rounded-lg border border-dark-600">
                <h3 class="font-medium text-white mb-2">Date Format Validation</h3>
                <input class="input-field w-full mb-2" placeholder="Date format pattern" />
                <select class="input-field w-full">
                  <option>Error</option>
                  <option>Warning</option>
                  <option>Info</option>
                </select>
              </div>
              
              <button class="btn-primary w-full">Add Rule</button>
            </div>
          </div>

          <!-- Spec Upload & Results -->
          <div class="card">
            <h2 class="text-xl font-semibold text-white mb-6">Validate Spec</h2>
            
            <div class="border-2 border-dashed border-dark-600 rounded-lg p-6 text-center mb-6">
              <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-gray-400 mb-2">Upload spec to validate</p>
              <button class="btn-primary">Run Linter</button>
            </div>

            <!-- Results -->
            <div v-if="lintResults.length > 0" class="space-y-3">
              <h3 class="font-medium text-white">Lint Results</h3>
              <div v-for="result in lintResults" :key="result.id" class="p-3 bg-dark-800 rounded-lg border-l-4" :class="getResultBorderClass(result.type)">
                <div class="flex items-start justify-between">
                  <div>
                    <p class="text-sm font-medium" :class="getResultTextClass(result.type)">
                      {{ result.message }}
                    </p>
                    <p class="text-xs text-gray-400 mt-1">Line {{ result.line }} • {{ result.rule }}</p>
                  </div>
                  <span :class="getResultBadgeClass(result.type)" class="px-2 py-1 rounded text-xs font-medium">
                    {{ result.type }}
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
import { onMounted, ref } from 'vue'

interface LintResult {
  id: string
  type: 'error' | 'warning' | 'info'
  message: string
  line: number
  rule: string
}

const lintResults = ref<LintResult[]>([])
const rules = ref([])
const showRuleModal = ref(false)
const editingRule = ref(null)
const ruleForm = ref({})
const runningLint = ref(false)
const exporting = ref(false)
const deletingResult = ref(false)

const fetchLintResults = async (specId: string) => {
  const res = await fetch(`/api/v1/lint-results/spec/${specId}`)
  if (res.ok) {
    lintResults.value = await res.json()
  }
}

onMounted(() => {
  // Call fetchLintResults with the current specId if available
})

const getResultBorderClass = (type: string) => {
  switch (type) {
    case 'error': return 'border-red-500'
    case 'warning': return 'border-yellow-500'
    case 'info': return 'border-blue-500'
    default: return 'border-gray-500'
  }
}

const getResultTextClass = (type: string) => {
  switch (type) {
    case 'error': return 'text-red-400'
    case 'warning': return 'text-yellow-400'
    case 'info': return 'text-blue-400'
    default: return 'text-gray-400'
  }
}

const getResultBadgeClass = (type: string) => {
  switch (type) {
    case 'error': return 'bg-red-500/20 text-red-400 border border-red-500/30'
    case 'warning': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    case 'info': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}
</script> 