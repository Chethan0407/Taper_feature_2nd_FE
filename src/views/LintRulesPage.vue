<template>
  <div class="min-h-screen app-page p-8">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Lint Rules</h1>
      <button class="btn-primary" @click="showModal = true">Add Rule</button>
    </div>
    <div class="rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-dark-700 dark:bg-dark-900">
      <div class="flex items-center justify-between px-8 pb-4 pt-8">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">All Lint Rules</h2>
        <span class="text-sm text-gray-500 dark:text-gray-400">{{ rules.length }} rule{{ rules.length === 1 ? '' : 's' }}</span>
      </div>
      <div v-if="ruleLoading" class="p-8 text-gray-500 dark:text-gray-400">Loading rules...</div>
      <div v-else-if="rules.length === 0" class="p-8 text-gray-500 dark:text-gray-400">No rules found.</div>
      <div v-else class="overflow-x-auto px-8 pb-8">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-100 dark:border-dark-700 dark:bg-dark-800">
              <th class="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Rule Type</th>
              <th class="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Pattern</th>
              <th class="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Severity</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rule in rules" :key="rule.id" class="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-dark-800 dark:hover:bg-dark-800/50">
              <td class="p-4 font-medium text-gray-900 dark:text-white">{{ rule.ruleType }}</td>
              <td class="p-4 font-mono text-blue-600 dark:text-blue-400">{{ rule.pattern }}</td>
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
    <!-- Add Rule Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60">
      <div class="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-dark-700 dark:bg-dark-900">
        <button class="absolute right-4 top-4 text-2xl font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200" @click="showModal = false">&times;</button>
        <h2 class="mb-6 text-center text-2xl font-bold text-gradient">Add Lint Rule</h2>
        <form @submit.prevent="addRule" class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Rule Type</label>
            <select v-model="ruleForm.ruleType" class="input-field w-full" required>
              <option value="">Select type</option>
              <option value="ForbiddenKeyword">Forbidden Keyword</option>
              <option value="RegexMatch">Regex Match</option>
              <option value="Naming">Naming</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Pattern</label>
            <input v-model="ruleForm.pattern" class="input-field w-full" placeholder="Pattern or keyword" required />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Severity</label>
            <select v-model="ruleForm.severity" class="input-field w-full" required>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
            </select>
          </div>
          <button class="btn-primary w-full" type="submit" :disabled="ruleLoading">{{ ruleLoading ? 'Adding...' : 'Add Rule' }}</button>
          <div v-if="ruleError" class="mt-2 text-red-600 dark:text-red-400">{{ ruleError }}</div>
          <div v-if="ruleSuccess" class="mt-2 text-green-600 dark:text-green-400">{{ ruleSuccess }}</div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { authenticatedFetch } from '@/utils/auth-requests'

interface LintRule {
  id?: string
  ruleType: string
  pattern: string
  severity: string
}

const rules = ref<LintRule[]>([])
const ruleForm = ref<LintRule>({ ruleType: '', pattern: '', severity: 'error' })
const ruleLoading = ref(false)
const ruleError = ref('')
const ruleSuccess = ref('')
const showModal = ref(false)

const fetchRules = async () => {
  ruleLoading.value = true
  ruleError.value = ''
  try {
    const res = await authenticatedFetch('/api/v1/lint-results/speclint/rules')
    if (!res.ok) throw new Error('Failed to fetch rules')
    let data = await res.json()
    if (Array.isArray(data)) {
      rules.value = data
    } else if (data && Array.isArray(data.rules)) {
      rules.value = data.rules
    } else {
      rules.value = []
    }
  } catch (e: any) {
    ruleError.value = e.message || 'Failed to fetch rules'
  } finally {
    ruleLoading.value = false
  }
}

const addRule = async () => {
  ruleLoading.value = true
  ruleError.value = ''
  ruleSuccess.value = ''
  try {
    const res = await authenticatedFetch('/api/v1/lint-results/speclint/rules', {
      method: 'POST',
      body: JSON.stringify({
        ruleType: ruleForm.value.ruleType,
        pattern: ruleForm.value.pattern,
        severity: ruleForm.value.severity
      })
    })
    if (!res.ok) throw new Error('Failed to add rule')
    ruleSuccess.value = 'Rule added!'
    ruleForm.value = { ruleType: '', pattern: '', severity: 'error' }
    await fetchRules()
    setTimeout(() => { showModal.value = false }, 500)
  } catch (e: any) {
    ruleError.value = e.message || 'Failed to add rule'
  } finally {
    ruleLoading.value = false
    setTimeout(() => { ruleSuccess.value = '' }, 2000)
  }
}

onMounted(() => {
  fetchRules()
})
</script> 