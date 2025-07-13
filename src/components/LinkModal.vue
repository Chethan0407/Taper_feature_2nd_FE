<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-8 w-full max-w-md">
      <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Link a {{ type === 'spec' ? 'Spec' : 'Checklist' }}
      </h3>
      <input v-model="search" class="input-field w-full mb-4" :placeholder="`Search ${type === 'spec' ? 'specs' : 'checklists'}...`" />
      <div class="max-h-60 overflow-y-auto mb-4">
        <ul>
          <li
            v-for="item in filteredItems"
            :key="item.id"
            class="py-2 px-2 hover:bg-dark-800 rounded cursor-pointer flex items-center justify-between"
            :class="{ 'bg-dark-800': selectedId === item.id }"
            @click="selectedId = item.id"
          >
            <span>{{ item.name || item.file_name || `ID ${item.id}` }}</span>
            <span v-if="selectedId === item.id" class="text-neon-blue font-bold ml-2">Selected</span>
          </li>
        </ul>
        <div v-if="filteredItems.length === 0" class="text-gray-400 text-center py-4">
          No {{ type === 'spec' ? 'specs' : 'checklists' }} available to link.
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <button class="btn-secondary" @click="onClose">Cancel</button>
        <button class="btn-primary" :disabled="!selectedId" @click="handleLink">Link</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  type: 'spec' | 'checklist'
  availableItems: Array<{ id: string | number; name?: string; file_name?: string }>
  onLink: (item: any) => void
  onClose: () => void
}>()

const search = ref('')
const selectedId = ref<string | number | null>(null)

const filteredItems = computed(() =>
  props.availableItems.filter(
    item =>
      (item.name?.toLowerCase().includes(search.value.toLowerCase()) ||
        item.file_name?.toLowerCase().includes(search.value.toLowerCase()) ||
        String(item.id).includes(search.value))
  )
)

function handleLink() {
  const item = props.availableItems.find(i => i.id === selectedId.value)
  if (item) props.onLink(item)
}
</script> 