<template>
  <div class="min-h-screen bg-dark-950 p-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-white">Lint Rules</h1>
      <button class="btn-primary" @click="showModal = true">Add Rule</button>
    </div>
    <div class="card bg-dark-900 border border-dark-700 shadow-lg rounded-2xl">
      <div class="flex items-center justify-between px-8 pt-8 pb-4">
        <h2 class="text-xl font-bold text-white">All Lint Rules</h2>
        <span class="text-gray-400 text-sm">{{ rules.length }} rule{{ rules.length === 1 ? '' : 's' }}</span>
      </div>
      <div v-if="ruleLoading" class="text-gray-400 p-8">Loading rules...</div>
      <div v-else-if="rules.length === 0" class="text-gray-400 p-8">No rules found.</div>
      <div v-else class="overflow-x-auto px-8 pb-8">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-dark-700 bg-dark-800">
              <th class="p-4 text-left text-gray-300 font-semibold">Rule Type</th>
              <th class="p-4 text-left text-gray-300 font-semibold">Pattern</th>
              <th class="p-4 text-left text-gray-300 font-semibold">Severity</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rule in rules" :key="rule.id" class="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
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
    <!-- Add Rule Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-900 p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl font-bold" @click="showModal = false">&times;</button>
        <h2 class="text-2xl font-bold mb-6 text-center text-gradient">Add Lint Rule</h2>
        <form @submit.prevent="addRule" class="space-y-4">
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