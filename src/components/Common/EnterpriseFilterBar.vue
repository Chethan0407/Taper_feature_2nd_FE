<template>
  <div
    class="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-dark-700 dark:bg-dark-800"
  >
    <div
      class="mb-4 flex cursor-pointer select-none items-center justify-between"
      @click="showFilters = !showFilters"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Filters
        <span class="text-gray-500 dark:text-gray-400">{{ showFilters ? '▲' : '▼' }}</span>
      </h3>
      <button
        v-if="showFilters"
        type="button"
        class="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        @click.stop="$emit('reset')"
      >
        Reset All
      </button>
    </div>
    <transition name="fade">
      <div v-if="showFilters">
        <div class="mb-4 flex w-full flex-wrap items-center gap-3">
          <template v-for="filter in filters" :key="filter.key">
            <!-- Search Input -->
            <div v-if="filter.type === 'search'" class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                :value="activeFilters[filter.key] || ''"
                type="text"
                class="input-field max-w-xs w-full rounded-full pl-10"
                :placeholder="filter.label"
                @input="$emit('filter-change', { key: filter.key, value: $event.target.value })"
              />
            </div>
            <!-- Dropdown -->
            <select
              v-else-if="filter.type === 'dropdown'"
              :value="activeFilters[filter.key] || ''"
              class="input-field max-w-xs rounded-full px-4 py-2"
              @change="$emit('filter-change', { key: filter.key, value: $event.target.value })"
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
              class="input-field max-w-xs rounded-full px-4 py-2"
              :placeholder="filter.label"
              @change="$emit('filter-change', { key: filter.key, value: $event.target.value })"
            />
          </template>
        </div>
        <!-- Active Filters Summary -->
        <div
          v-if="showActiveSummary && Object.keys(activeFilters).some((k) => activeFilters[k])"
          class="mt-2 flex flex-wrap gap-2"
        >
          <span class="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
          <template v-for="(value, key) in activeFilters" :key="String(key)">
            <span
              v-if="value"
              class="inline-flex items-center rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-neon-blue/25 dark:text-neon-blue"
            >
              {{ getFilterLabel(String(key), String(value)) }}
              <button
                type="button"
                class="ml-1 hover:text-red-600 dark:hover:text-red-300"
                @click="$emit('filter-change', { key, value: '' })"
              >
                ×
              </button>
            </span>
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
defineProps({
  filters: { type: Array, required: true },
  activeFilters: { type: Object, required: true },
  showActiveSummary: { type: Boolean, default: true },
})
defineEmits(['filter-change', 'reset'])
const showFilters = ref(true)
function getFilterLabel(key: string, value: string) {
  return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`
}
</script>
