<template>
  <div class="min-h-screen bg-white dark:bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">SpecLint Engine</h1>
          <p class="text-gray-600 dark:text-gray-400">Automate spec quality checks and validation</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Rule Builder Card -->
          <div>
            <div class="card bg-white dark:bg-dark-900">
              <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Rule Builder</h2>
              <div class="space-y-4">
                <form @submit.prevent="addRule" class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium mb-1">Rule Type</label>
                    <select v-model="ruleForm.ruleType" class="input-field w-full" required>
                      <option value="">Select type</option>
                      <option value="ForbiddenKeyword">Forbidden Keyword</option>
                      <option value="RegexMatch">Regex Match</option>
                      <option value="Naming">Naming</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">Pattern</label>
                    <input v-model="ruleForm.pattern" class="input-field w-full" placeholder="Pattern or keyword" required />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">Severity</label>
                    <select v-model="ruleForm.severity" class="input-field w-full" required>
                      <option value="error">Error</option>
                      <option value="warning">Warning</option>
                    </select>
                  </div>
                  <button class="btn-primary w-full" type="submit" :disabled="ruleLoading">{{ ruleLoading ? 'Adding...' : 'Add Rule' }}</button>
                  <div v-if="ruleError" class="text-red-400 mt-2">{{ ruleError }}</div>
                  <div v-if="ruleSuccess" class="text-green-400 mt-2">{{ ruleSuccess }}</div>
                </form>
              </div>
            </div>
            <!-- All Rules Card (separate) -->
            <div class="card bg-dark-900 border border-dark-700 shadow-lg rounded-2xl mt-8">
              <div class="flex items-center justify-between px-8 pt-8 pb-4">
                <h2 class="text-xl font-bold text-white">All Rules</h2>
                <span class="text-gray-400 text-sm">{{ rules.length }} rule{{ rules.length === 1 ? '' : 's' }}</span>
              </div>
              <div v-if="ruleLoading" class="text-gray-400 p-8">Loading rules...</div>
              <div v-else-if="rules.length === 0" class="text-gray-400 p-8">No rules found.</div>
              <div v-else class="overflow-x-auto px-8 pb-8">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-dark-700 bg-dark-800">
                      <th class="p-4 text-left text-gray-300 font-semibold">ID</th>
                      <th class="p-4 text-left text-gray-300 font-semibold">Rule Type</th>
                      <th class="p-4 text-left text-gray-300 font-semibold">Pattern</th>
                      <th class="p-4 text-left text-gray-300 font-semibold">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="rule in rules" :key="rule.id" class="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                      <td class="p-4 font-mono text-gray-400">{{ rule.id }}</td>
                      <td class="p-4 font-medium text-white">{{ rule.ruleType }}</td>
                      <td class="p-4 font-mono text-blue-400">{{ rule.pattern }}</td>
                      <td class="p-4">
                        <span :class="rule.severity === 'error' ? 'bg-red-500/20 text-red-400 px-3 py-1 rounded text-xs font-semibold' : 'bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded text-xs font-semibold'">
                          {{ rule.severity.charAt(0).toUpperCase() + rule.severity.slice(1) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <!-- Validate Spec Card (unchanged) -->
          <div class="card bg-white dark:bg-dark-900">
            <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Validate Spec</h2>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Spec ID</label>
              <div v-if="availableSpecs.length > 0">
                <select v-model="specId" class="input-field w-full">
                  <option value="">Select a spec...</option>
                  <option v-for="spec in availableSpecs" :key="spec.id" :value="spec.id">
                    {{ (spec.name || spec.file_name || 'Unnamed Spec') }} ({{ spec.id.slice(0, 8) }}…) | {{ spec.status }} | {{ spec.uploaded_by }}
                  </option>
                </select>
              </div>
              <div v-else>
                <input v-model="specId" class="input-field w-full" placeholder="Enter spec ID to lint" />
              </div>
            </div>
            <button class="btn-primary mb-4" @click="runLinter" :disabled="runningLint || !specId">{{ runningLint ? 'Running...' : 'Run Linter' }}</button>
            <div v-if="lintError" class="text-red-400 mb-2">{{ lintError }}</div>
            <div v-if="lintSuccess" class="text-green-400 mb-2">{{ lintSuccess }}</div>
            <!-- Results -->
            <div v-if="lintResults.length > 0" class="space-y-3">
              <h3 class="font-medium text-gray-700 dark:text-gray-200">Lint Results</h3>
              <div v-for="result in lintResults" :key="result.id" class="p-3 bg-gray-100 dark:bg-dark-800 rounded-lg border-l-4" :class="getResultBorderClass(result.type)">
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
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSpecificationsStore } from '@/stores/specifications'

interface LintResult {
  id: string
  type: 'error' | 'warning' | 'info'
  message: string
  line: number
  rule: string
}

interface LintRule {
  id?: string
  ruleType: string
  pattern: string
  severity: string
}

const lintResults = ref<LintResult[]>([])
const rules = ref<LintRule[]>([])
const ruleForm = ref<LintRule>({ ruleType: '', pattern: '', severity: 'error' })
const ruleLoading = ref(false)
const ruleError = ref('')
const ruleSuccess = ref('')
const runningLint = ref(false)
const lintError = ref('')
const lintSuccess = ref('')
const specId = ref('') // For demo, user can enter a spec ID

const authStore = useAuthStore()
const specificationsStore = useSpecificationsStore()

const availableSpecs = computed(() => specificationsStore.specifications)

// Fetch all rules
const fetchRules = async () => {
  ruleLoading.value = true
  ruleError.value = ''
  try {
    const headers = authStore.getAuthHeader() || {}
    const res = await fetch('/api/v1/lint-results/speclint/rules', { headers })
    if (!res.ok) throw new Error('Failed to fetch rules')
    let data = await res.json()
    let ruleList = []
    if (Array.isArray(data)) {
      ruleList = data
    } else if (data && Array.isArray(data.rules)) {
      ruleList = data.rules
    }
    // Normalize ruleType for display
    rules.value = ruleList.map((rule: any) => ({
      ...rule,
      ruleType: rule.ruleType || rule.rule_type || ''
    }))
    console.log('Fetched rules:', rules.value)
  } catch (e: any) {
    ruleError.value = e.message || 'Failed to fetch rules'
  } finally {
    ruleLoading.value = false
  }
}

// Add a new rule
const addRule = async () => {
  ruleLoading.value = true
  ruleError.value = ''
  ruleSuccess.value = ''
  try {
    const headers = { 'Content-Type': 'application/json', ...(authStore.getAuthHeader() || {}) }
    const res = await fetch('/api/v1/lint-results/speclint/rules', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        rule_type: ruleForm.value.ruleType, // snake_case for backend
        ruleType: ruleForm.value.ruleType,  // camelCase for backend workaround
        pattern: ruleForm.value.pattern,
        severity: ruleForm.value.severity
      })
    })
    if (!res.ok) throw new Error('Failed to add rule')
    ruleSuccess.value = 'Rule added!'
    ruleForm.value = { ruleType: '', pattern: '', severity: 'error' }
    await fetchRules()
  } catch (e: any) {
    ruleError.value = e.message || 'Failed to add rule'
  } finally {
    ruleLoading.value = false
    setTimeout(() => { ruleSuccess.value = '' }, 2000)
  }
}

// Run the linter on a spec
const runLinter = async () => {
  runningLint.value = true
  lintError.value = ''
  lintSuccess.value = ''
  try {
    const headers = { 'Content-Type': 'application/json', ...(authStore.getAuthHeader() || {}) }
    const res = await fetch('/api/v1/lint-results/speclint/lint', {
      method: 'POST',
      headers,
      body: JSON.stringify({ specId: specId.value }) // use camelCase as per backend contract
    })
    if (!res.ok) {
      let errMsg = 'Failed to run linter'
      try {
        const err = await res.json()
        errMsg = err.detail || errMsg
      } catch {}
      throw new Error(errMsg)
    }
    const data = await res.json()
    // Defensive: handle { issues: [] } or array
    if (Array.isArray(data)) {
      lintResults.value = data
    } else if (data && Array.isArray(data.issues)) {
      lintResults.value = data.issues
    } else {
      lintResults.value = []
    }
    if (lintResults.value.length === 0) {
      lintSuccess.value = 'No issues found!'
    } else {
      lintSuccess.value = 'Lint completed!'
    }
  } catch (e: any) {
    lintError.value = e.message || 'Failed to run linter'
  } finally {
    runningLint.value = false
    setTimeout(() => { lintSuccess.value = '' }, 2000)
  }
}

onMounted(() => {
  fetchRules()
  if (specificationsStore.specifications.length === 0) {
    specificationsStore.loadSpecifications()
  }
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