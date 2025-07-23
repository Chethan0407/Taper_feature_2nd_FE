<template>
  <div class="bg-dark-800 border border-dark-700 rounded-xl p-6 mb-6">
    <div class="flex items-center justify-between mb-4 cursor-pointer select-none" @click="showFilters = !showFilters">
      <h3 class="text-lg font-semibold text-white">
        Filters
        <span>{{ showFilters ? '▲' : '▼' }}</span>
      </h3>
      <button v-if="showFilters" @click.stop="$emit('reset')" class="text-sm text-gray-400 hover:text-white transition-colors">Reset All</button>
    </div>
    <transition name="fade">
      <div v-if="showFilters">
        <div class="flex flex-wrap items-center gap-3 w-full mb-4">
          <template v-for="filter in filters" :key="filter.key">
            <!-- Search Input -->
            <div v-if="filter.type === 'search'" class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </span>
              <input
                :value="activeFilters[filter.key] || ''"
                @input="$emit('filter-change', { key: filter.key, value: $event.target.value })"
                type="text"
                class="input-field w-full max-w-xs pl-10 rounded-full"
                :placeholder="filter.label"
              />
            </div>
            <!-- Dropdown -->
            <select
              v-else-if="filter.type === 'dropdown'"
              :value="activeFilters[filter.key] || ''"
              @change="$emit('filter-change', { key: filter.key, value: $event.target.value })"
              class="input-field max-w-xs rounded-full px-4 py-2"
            >
              <option :value="''">All {{ filter.label }}</option>
              <option v-for="option in filter.options" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
            <!-- Date Picker -->
            <input
              v-else-if="filter.type === 'date'"
              type="date"
              :value="activeFilters[filter.key] || ''"
              @change="$emit('filter-change', { key: filter.key, value: $event.target.value })"
              class="input-field max-w-xs rounded-full px-4 py-2"
              :placeholder="filter.label"
            />
          </template>
        </div>
        <!-- Active Filters Summary -->
        <div v-if="showActiveSummary && Object.keys(activeFilters).some(k => activeFilters[k])" class="flex flex-wrap gap-2 mt-2">
          <span class="text-sm text-gray-400">Active filters:</span>
          <span
            v-for="(value, key) in activeFilters"
            v-if="value"
            :key="key"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600 text-white"
          >
            {{ getFilterLabel(key, value) }}
            <button
              @click="$emit('filter-change', { key, value: '' })"
              class="ml-1 hover:text-red-200"
            >
              ×
            </button>
          </span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps({
  filters: { type: Array, required: true },
  activeFilters: { type: Object, required: true },
  showActiveSummary: { type: Boolean, default: true },
})
const emit = defineEmits(['filter-change', 'reset'])
const showFilters = ref(true)
function getFilterLabel(key: string, value: string) {
  // Optionally customize label display
  return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`
}
</script> 