<template>
  <div>
    <label v-if="label" class="block text-gray-300 text-sm font-medium mb-2">{{ label }}</label>
    <select 
      :value="modelValue"
      @change="handleChange"
      :disabled="companiesStore.loading || disabled"
      :class="[
        'input-field w-full bg-dark-800/50 border-dark-600 focus:border-neon-blue transition-colors',
        { 'opacity-50 cursor-not-allowed': companiesStore.loading || disabled }
      ]"
      :required="required"
    >
      <option value="">{{ placeholder || (companiesStore.loading ? 'Loading companies...' : 'Select Company') }}</option>
      <option 
        v-for="company in companiesStore.companies" 
        :key="company.id" 
        :value="company.id"
      >
        {{ company.name }}
      </option>
    </select>
    <p v-if="companiesStore.error" class="text-red-400 text-sm mt-1">{{ companiesStore.error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCompaniesStore } from '@/stores/companies'

interface Props {
  modelValue: string | number
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const companiesStore = useCompaniesStore()

onMounted(async () => {
  if (companiesStore.companies.length === 0) {
    await companiesStore.loadCompanies()
  }
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  if (target) {
    const value = target.value
    emit('update:modelValue', value)
  }
}
</script> 