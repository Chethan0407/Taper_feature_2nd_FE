<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-950">
    <Sidebar />
    <div class="ml-64">
      <Header />
      <main class="p-8">
        <div class="mb-10">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">SpecLint Engine</h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">Automate spec quality checks and validation</p>
        </div>
        <!-- Top Section: Two-Column Split -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12 items-start">
          <!-- Rule Builder (Left) -->
          <div class="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-2xl rounded-2xl p-8 flex flex-col gap-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Rule Builder</h2>
            <form @submit.prevent="addRule" class="space-y-6">
          <div>
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Rule Type</label>
                <select v-model="ruleForm.ruleType" class="input-field w-full rounded-full px-4 py-2" required>
                      <option value="">Select type</option>
                      <option value="ForbiddenKeyword">Forbidden Keyword</option>
                      <option value="RegexMatch">Regex Match</option>
                      <option value="Naming">Naming</option>
                    </select>
                  </div>
                  <div>
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Pattern</label>
                <input v-model="ruleForm.pattern" class="input-field w-full rounded-full px-4 py-2" placeholder="Pattern or keyword" required />
                  </div>
                  <div>
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Severity</label>
                <select v-model="ruleForm.severity" class="input-field w-full rounded-full px-4 py-2" required>
                      <option value="error">Error</option>
                      <option value="warning">Warning</option>
                    </select>
              </div>
              <button class="btn-primary w-full text-base font-semibold py-3 flex items-center justify-center gap-2 transition-transform active:scale-95" type="submit" :disabled="ruleLoading">
                <span>➕</span> <span>{{ ruleLoading ? 'Adding...' : 'Add Rule' }}</span>
              </button>
              <transition name="fade">
                <div v-if="ruleError || ruleSuccess" class="min-h-[40px]">
                  <div v-if="ruleError" class="text-red-500 mt-2 p-2 rounded bg-red-100 dark:bg-red-900/30 text-sm font-medium">{{ ruleError }}</div>
                  <div v-if="ruleSuccess" class="text-green-600 mt-2 p-2 rounded bg-green-100 dark:bg-green-900/30 text-sm font-medium">{{ ruleSuccess }}</div>
            </div>
              </transition>
            </form>
          </div>
          <!-- Validate Spec (Right) -->
          <div class="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-2xl rounded-2xl p-8 flex flex-col gap-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Validate Spec</h2>
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Spec ID</label>
              <select v-model="specId" class="input-field w-full rounded-full px-4 py-2" :disabled="loadingSpecs">
                  <option value="">Select a spec...</option>
                  <option v-if="loadingSpecs" value="" disabled>Loading specs...</option>
                  <option v-for="spec in allAvailableSpecs" :key="spec.id" :value="spec.id">
                    {{ formatSpecDisplayName(spec) }}
                  </option>
                </select>
              </div>
            <button class="btn-primary w-full text-base font-semibold py-3 flex items-center justify-center gap-2 transition-transform active:scale-95 mb-2" @click="runLinter" :disabled="runningLint || !specId">
              <span>🧪</span> <span>{{ runningLint ? 'Running...' : 'Run Linter' }}</span>
            </button>
            <transition name="fade">
              <div v-if="lintError || lintSuccess" class="min-h-[40px]">
                <div v-if="lintError" class="text-red-500 mb-2 p-2 rounded bg-red-100 dark:bg-red-900/30 text-sm font-medium">{{ lintError }}</div>
                <div v-if="lintSuccess" class="text-green-600 mb-2 p-2 rounded bg-green-100 dark:bg-green-900/30 text-sm font-medium">{{ lintSuccess }}</div>
              </div>
            </transition>
            <div v-if="lintResults.length > 0" class="space-y-3 mt-4">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Lint Results ({{ lintResults.length }} issue{{ lintResults.length !== 1 ? 's' : '' }})</h3>
              <!-- Group by severity -->
              <div v-for="(group, severity) in groupedResults" :key="severity" class="mb-4">
                <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 capitalize">{{ severity }}s ({{ group.length }})</h4>
                <div class="space-y-2">
                  <div v-for="(result, index) in group" :key="`${severity}-${index}`" class="p-3 bg-gray-50 dark:bg-dark-800 rounded-lg border-l-4" :class="getResultBorderClass(result.severity || severity)">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="text-sm font-medium" :class="getResultTextClass(result.severity || severity)">
                          {{ result.message }}
                        </p>
                        <div class="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span v-if="result.line">Line {{ result.line }}</span>
                          <span v-if="result.ruleType">Rule: {{ result.ruleType }}</span>
                          <span v-if="result.pattern">Pattern: {{ result.pattern }}</span>
                        </div>
                      </div>
                      <span :class="getResultBadgeClass(result.severity || severity)" class="px-2 py-1 rounded text-xs font-medium ml-2">
                        {{ result.severity || severity }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- All Rules Section -->
        <div class="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-2xl rounded-2xl p-8 w-full">
          <EnterpriseFilterBar
            :filters="filterConfig"
            :activeFilters="ruleFilters"
            @filter-change="handleRuleFilterChange"
            @reset="resetRuleFilters"
          />
          <!-- All Rules Table Section: Debounced loader and scrollable table -->
          <div>
            <div v-if="showLoader" class="text-gray-400 p-8">Loading rules...</div>
            <div v-else-if="filteredRules.length === 0" class="flex flex-col items-center justify-center py-16">
              <svg class="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
              <div class="text-lg text-gray-500 dark:text-gray-400 font-medium">No rules found. Try adjusting your filters.</div>
            </div>
            <div v-else class="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar transition-all duration-200">
              <table class="w-full text-sm border-separate border-spacing-0">
                <thead class="sticky top-0 z-10 bg-white dark:bg-dark-900">
                  <tr class="border-b border-gray-200 dark:border-dark-700">
                    <th class="p-4 text-left text-gray-700 dark:text-gray-300 font-semibold">ID</th>
                    <th class="p-4 text-left text-gray-700 dark:text-gray-300 font-semibold">Rule Type</th>
                    <th class="p-4 text-left text-gray-700 dark:text-gray-300 font-semibold">Pattern</th>
                    <th class="p-4 text-left text-gray-700 dark:text-gray-300 font-semibold">Severity</th>
                    <th class="p-4 text-left text-gray-700 dark:text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rule in filteredRules" :key="rule.id" class="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-800/40 transition-colors">
                    <td class="p-4 font-mono text-gray-500 dark:text-gray-400">{{ rule.id }}</td>
                    <td class="p-4 font-medium text-gray-900 dark:text-white">{{ rule.rule_type }}</td>
                    <td class="p-4 font-mono text-blue-600 dark:text-blue-400 underline cursor-pointer" @click="copyPattern(rule.pattern)" :title="'Click to copy: ' + rule.pattern">{{ rule.pattern }}</td>
                    <td class="p-4">
                      <span :class="rule.severity === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded text-xs font-semibold' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded text-xs font-semibold'">
                        {{ rule.severity.charAt(0).toUpperCase() + rule.severity.slice(1) }}
                      </span>
                    </td>
                    <td class="p-4">
                      <div class="flex items-center gap-2">
                        <button
                          @click="editRule(rule)"
                          class="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                          title="Edit rule"
                        >
                          Edit
                        </button>
                        <button
                          @click="deleteRule(rule.id)"
                          class="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                          :disabled="deletingRuleId === rule.id"
                          title="Delete rule"
                        >
                          {{ deletingRuleId === rule.id ? 'Deleting...' : 'Delete' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                  <!-- Spacer row for bottom padding -->
                  <tr aria-hidden="true"><td colspan="5" style="height:2.5rem;"></td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- Pagination controls below the table -->
          <div v-if="totalPages > 1" class="flex flex-wrap items-center justify-between mt-4 gap-4">
            <div class="text-gray-500 dark:text-gray-400 text-sm">
              Showing page {{ page }} of {{ totalPages }} ({{ totalResults }} rules)
            </div>
            <div class="flex items-center gap-2">
              <button class="btn-secondary px-3 py-1" :disabled="!canPrev" @click="page = page - 1">Prev</button>
              <button v-for="n in pageNumbers" :key="n" class="btn-secondary px-3 py-1" :class="{ 'bg-blue-100 dark:bg-blue-900/30 font-bold': n === page }" @click="page = n">{{ n }}</button>
              <button class="btn-secondary px-3 py-1" :disabled="!canNext" @click="page = page + 1">Next</button>
            </div>
            <div>
              <select v-model="pageSize" class="input-field max-w-[90px] rounded-full">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <!-- Edit Rule Modal -->
    <Transition name="modal">
      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click.self="showEditModal = false">
        <div class="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-8 w-full max-w-md">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Rule</h3>
          <form @submit.prevent="updateRule" class="space-y-6">
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Rule Type</label>
              <select v-model="ruleForm.ruleType" class="input-field w-full rounded-full px-4 py-2" required>
                <option value="">Select type</option>
                <option value="ForbiddenKeyword">Forbidden Keyword</option>
                <option value="RegexMatch">Regex Match</option>
                <option value="Naming">Naming</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Pattern</label>
              <input v-model="ruleForm.pattern" class="input-field w-full rounded-full px-4 py-2" placeholder="Pattern or keyword" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Severity</label>
              <select v-model="ruleForm.severity" class="input-field w-full rounded-full px-4 py-2" required>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
              </select>
            </div>
            <div class="flex gap-3">
              <button type="button" @click="showEditModal = false; editingRule = null; ruleForm = { ruleType: '', pattern: '', severity: 'error' }" class="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" class="btn-primary flex-1" :disabled="ruleLoading">
                {{ ruleLoading ? 'Updating...' : 'Update Rule' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import EnterpriseFilterBar from '@/components/Common/EnterpriseFilterBar.vue'
import { onMounted, ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSpecificationsStore } from '@/stores/specifications'
import { authenticatedFetch } from '@/utils/auth-requests'

interface LintResult {
  id?: string
  ruleType?: string
  pattern?: string
  line?: number
  message: string
  severity: 'error' | 'warning' | 'info'
  type?: 'error' | 'warning' | 'info' // Legacy support
  rule?: string // Legacy support
}

interface LintRule {
  id?: string
  ruleType: string
  rule_type?: string // Add this line to support backend snake_case
  pattern: string
  severity: string
}

const lintResults = ref<LintResult[]>([])
const rules = ref<LintRule[]>([])
const ruleForm = ref<LintRule>({ ruleType: '', pattern: '', severity: 'error' })
const ruleLoading = ref(false)
const showLoader = ref(false)
let loaderTimeout: ReturnType<typeof setTimeout> | null = null
const ruleError = ref('')
const ruleSuccess = ref('')
const runningLint = ref(false)
const lintError = ref('')
const lintSuccess = ref('')
const specId = ref('')
const ruleSearch = ref('')
const typeFilter = ref('')
const severityFilter = ref('')
const page = ref(1)
const pageSize = ref(20)
const totalResults = ref(0)
const totalPages = computed(() => Math.ceil(totalResults.value / pageSize.value) || 1)

const filteredRules = computed(() => rules.value) // Now always server-side

const authStore = useAuthStore()
const specificationsStore = useSpecificationsStore()
const availableSpecs = computed(() => specificationsStore.specifications)

// Fetch specs from both endpoints
const allAvailableSpecs = ref<any[]>([])
const loadingSpecs = ref(false)
const deletingRuleId = ref<string | null>(null)
const editingRule = ref<LintRule | null>(null)
const showEditModal = ref(false)

// Fetch all available specs
const fetchAllSpecs = async () => {
  loadingSpecs.value = true
  try {
    // Fetch from both endpoints
    const [specsRes, specificationsRes] = await Promise.all([
      authenticatedFetch('/api/v1/specifications/').catch(() => null),
      authenticatedFetch('/api/v1/specs/').catch(() => null)
    ])
    
    const specs: any[] = []
    
    // Add specifications (UUIDs)
    if (specsRes && specsRes.ok) {
      const specificationsData = await specsRes.json()
      if (Array.isArray(specificationsData)) {
        specs.push(...specificationsData.map((s: any) => ({ ...s, source: 'specifications' })))
      }
    }
    
    // Add specs (integer IDs) - if endpoint exists
    if (specificationsRes && specificationsRes.ok) {
      const specsData = await specificationsRes.json()
      if (Array.isArray(specsData)) {
        specs.push(...specsData.map((s: any) => ({ ...s, source: 'specs' })))
      }
    }
    
    allAvailableSpecs.value = specs
    console.log('✅ Loaded', specs.length, 'specs for dropdown')
  } catch (e: any) {
    console.error('Failed to fetch specs:', e)
    // Fallback to specifications store
    allAvailableSpecs.value = specificationsStore.specifications.map((s: any) => ({ ...s, source: 'specifications' }))
  } finally {
    loadingSpecs.value = false
  }
}

// Format spec display name
const formatSpecDisplayName = (spec: any) => {
  const name = spec.name || spec.file_name || 'Unnamed Spec'
  const id = spec.id
  const idDisplay = typeof id === 'string' && id.length > 8 ? `ID: ${id.slice(0, 8)}...` : `ID: ${id}`
  return `${name} (${idDisplay})`
}

const fetchRules = async () => {
  ruleLoading.value = true
  ruleError.value = ''
  if (loaderTimeout) clearTimeout(loaderTimeout)
  showLoader.value = false
  loaderTimeout = setTimeout(() => {
    if (ruleLoading.value) showLoader.value = true
  }, 300)
  try {
    const params = new URLSearchParams()
    params.append('page', String(page.value))
    params.append('page_size', String(pageSize.value))
    if (ruleFilters.value.search) params.append('search', ruleFilters.value.search)
    if (ruleFilters.value.rule_type) params.append('type', ruleFilters.value.rule_type)
    if (ruleFilters.value.severity) params.append('severity', ruleFilters.value.severity)
    if (ruleFilters.value.created_from) params.append('created_from', ruleFilters.value.created_from)
    if (ruleFilters.value.created_to) params.append('created_to', ruleFilters.value.created_to)
    const res = await authenticatedFetch(`/api/v1/lint-results/speclint/rules?${params.toString()}`)
    if (!res.ok) throw new Error('Failed to fetch rules')
    const data = await res.json()
    rules.value = data.results || []
    totalResults.value = data.pagination?.total_results || 0
  } catch (e: any) {
    ruleError.value = e.message || 'Failed to fetch rules'
  } finally {
    ruleLoading.value = false
    if (loaderTimeout) clearTimeout(loaderTimeout)
    setTimeout(() => { showLoader.value = false }, 100) // hide loader after render
  }
}

interface RuleFilters {
  [key: string]: string;
  search: string;
  rule_type: string;
  severity: string;
  created_from: string;
  created_to: string;
}
const ruleFilters = ref<RuleFilters>({
  search: '',
  rule_type: '',
  severity: '',
  created_from: '',
  created_to: ''
})
const filterConfig = [
  { type: 'search', label: 'Search rules...', key: 'search' },
  { type: 'dropdown', label: 'Rule Type', key: 'rule_type', options: ['ForbiddenKeyword', 'RegexMatch', 'Naming'] },
  { type: 'dropdown', label: 'Severity', key: 'severity', options: ['error', 'warning'] },
  { type: 'date', label: 'Created From', key: 'created_from' },
  { type: 'date', label: 'Created To', key: 'created_to' }
]
function handleRuleFilterChange({ key, value }: { key: string, value: string }) {
  ruleFilters.value[key] = value
}
function resetRuleFilters() {
  ruleFilters.value = { search: '', rule_type: '', severity: '', created_from: '', created_to: '' }
}
// Watch for filter changes and refetch rules
watch(ruleFilters, () => {
  page.value = 1
  fetchRules()
}, { deep: true })
watch([page], () => {
  fetchRules()
})

onMounted(async () => {
  fetchRules()
  await fetchAllSpecs()
  if (specificationsStore.specifications.length === 0) {
    specificationsStore.loadSpecifications()
  }
})

// Add a new rule
const addRule = async () => {
  ruleLoading.value = true
  ruleError.value = ''
  ruleSuccess.value = ''
  try {
    const res = await authenticatedFetch('/api/v1/lint-results/speclint/rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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
    const res = await authenticatedFetch('/api/v1/lint-results/speclint/lint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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
    // Handle response structure: { specId: "123", issues: [...] }
    if (data && Array.isArray(data.issues)) {
      lintResults.value = data.issues.map((issue: any) => ({
        ruleType: issue.ruleType,
        pattern: issue.pattern,
        line: issue.line,
        message: issue.message,
        severity: issue.severity || 'warning'
      }))
    } else if (Array.isArray(data)) {
      lintResults.value = data.map((issue: any) => ({
        ruleType: issue.ruleType || issue.rule_type,
        pattern: issue.pattern,
        line: issue.line,
        message: issue.message,
        severity: issue.severity || 'warning'
      }))
    } else {
      lintResults.value = []
    }
    if (lintResults.value.length === 0) {
      lintSuccess.value = 'No issues found!'
    } else {
      lintSuccess.value = `Lint completed! Found ${lintResults.value.length} issue${lintResults.value.length !== 1 ? 's' : ''}.`
    }
  } catch (e: any) {
    lintError.value = e.message || 'Failed to run linter'
  } finally {
    runningLint.value = false
    setTimeout(() => { lintSuccess.value = '' }, 2000)
  }
}

const getResultBorderClass = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'error': return 'border-red-500'
    case 'warning': return 'border-yellow-500'
    case 'info': return 'border-blue-500'
    default: return 'border-gray-500'
  }
}

const getResultTextClass = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'error': return 'text-red-400'
    case 'warning': return 'text-yellow-400'
    case 'info': return 'text-blue-400'
    default: return 'text-gray-400'
  }
}

const getResultBadgeClass = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'error': return 'bg-red-500/20 text-red-400 border border-red-500/30'
    case 'warning': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    case 'info': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}

// Group results by severity
const groupedResults = computed(() => {
  const groups: Record<string, LintResult[]> = {
    error: [],
    warning: [],
    info: []
  }
  
  lintResults.value.forEach(result => {
    const severity = (result.severity || result.type || 'warning').toLowerCase()
    if (groups[severity]) {
      groups[severity].push(result)
    } else {
      groups.warning.push(result)
    }
  })
  
  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key]
    }
  })
  
  return groups
})

// Edit rule
const editRule = (rule: LintRule) => {
  editingRule.value = { ...rule }
  ruleForm.value = {
    ruleType: rule.rule_type || rule.ruleType || '',
    pattern: rule.pattern,
    severity: rule.severity
  }
  showEditModal.value = true
}

// Update rule
const updateRule = async () => {
  if (!editingRule.value?.id) return
  
  ruleLoading.value = true
  ruleError.value = ''
  ruleSuccess.value = ''
  try {
    const res = await authenticatedFetch(`/api/v1/lint-results/speclint/rules/${editingRule.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rule_type: ruleForm.value.ruleType,
        pattern: ruleForm.value.pattern,
        severity: ruleForm.value.severity
      })
    })
    if (!res.ok) throw new Error('Failed to update rule')
    ruleSuccess.value = 'Rule updated!'
    showEditModal.value = false
    editingRule.value = null
    ruleForm.value = { ruleType: '', pattern: '', severity: 'error' }
    await fetchRules()
  } catch (e: any) {
    ruleError.value = e.message || 'Failed to update rule'
  } finally {
    ruleLoading.value = false
    setTimeout(() => { ruleSuccess.value = '' }, 2000)
  }
}

// Delete rule
const deleteRule = async (ruleId: string) => {
  if (!confirm('Are you sure you want to delete this rule?')) return
  
  deletingRuleId.value = ruleId
  try {
    const res = await authenticatedFetch(`/api/v1/lint-results/speclint/rules/${ruleId}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to delete rule')
    await fetchRules()
    ruleSuccess.value = 'Rule deleted!'
    setTimeout(() => { ruleSuccess.value = '' }, 2000)
  } catch (e: any) {
    ruleError.value = e.message || 'Failed to delete rule'
  } finally {
    deletingRuleId.value = null
  }
}

// Copy pattern to clipboard
const copyPattern = async (pattern: string) => {
  try {
    await navigator.clipboard.writeText(pattern)
    ruleSuccess.value = 'Pattern copied to clipboard!'
    setTimeout(() => { ruleSuccess.value = '' }, 2000)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}

// Pagination controls helpers
const canPrev = computed(() => page.value > 1)
const canNext = computed(() => page.value < totalPages.value)
const pageNumbers = computed(() => {
  const arr = []
  for (let i = 1; i <= totalPages.value; i++) arr.push(i)
  return arr
})
</script> 

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #6b7280; /* cement/medium gray */
  border-radius: 6px;
  min-height: 40px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #6b7280 transparent;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 