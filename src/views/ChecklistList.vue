<template>
  <div class="min-h-screen bg-gray-50 p-8 dark:bg-dark-950">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Checklists</h1>
      <button class="btn-primary px-6 py-3 text-lg font-semibold shadow-xl animate-glow rounded-xl" @click="$router.push('/checklists/create')">
        + Create Checklist
      </button>
    </div>
    <div v-if="loading" class="flex justify-center items-center py-12">
      <span class="text-gray-500 dark:text-gray-400">Loading checklists...</span>
    </div>
    <div v-else-if="error" class="py-12 text-center text-red-600 dark:text-red-400">{{ error }}</div>
    <div v-else-if="checklists.length === 0" class="py-12 text-center text-gray-500 dark:text-gray-400">
      No checklists yet. Create your first checklist.
    </div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-dark-700 dark:bg-dark-900">
        <thead>
          <tr class="border-b border-gray-200 text-left text-gray-600 dark:border-dark-700 dark:text-gray-400">
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Assigned To</th>
            <th class="px-4 py-3">Created By</th>
            <th class="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="checklist in checklists.filter(c => c.id)" :key="checklist.id" class="border-b border-gray-200 hover:bg-gray-50 dark:border-dark-800 dark:hover:bg-dark-800/50">
            <td class="px-4 py-3 text-gray-900 dark:text-gray-100">
              <router-link :to="`/checklists/${String(checklist.id ?? '')}`" class="text-neon-blue hover:underline font-medium">{{ checklist.name }}</router-link>
            </td>
            <td class="px-4 py-3">
              <span v-if="checklist.status" :class="statusBadgeClass(checklist.status)">{{ checklist.status }}</span>
              <span v-else class="text-gray-500">—</span>
            </td>
            <td class="px-4 py-3">
              <span v-if="checklist.assigned_to && checklist.assigned_to.length > 0">
                <span v-for="user in checklist.assigned_to" :key="user.id" class="mr-1 inline-block rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-900 dark:bg-dark-700 dark:text-white">{{ user.name }}</span>
              </span>
              <span v-else class="text-gray-500">—</span>
            </td>
            <td class="px-4 py-3 text-gray-900 dark:text-gray-100">{{ checklist.created_by?.name || '—' }}</td>
            <td class="flex gap-2 px-4 py-3">
              <router-link :to="`/checklists/${String(checklist.id ?? '')}`" title="View"><span class="icon-eye" /></router-link>
              <router-link :to="`/checklists/${String(checklist.id ?? '')}/edit`" title="Edit"><span class="icon-edit" /></router-link>
              <button @click="confirmDelete(checklist)" title="Delete"><span class="icon-trash text-red-400" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Delete modal placeholder -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60">
      <div class="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-dark-700 dark:bg-dark-800">
        <h3 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">Delete Checklist</h3>
        <p class="mb-6 text-gray-600 dark:text-gray-300">Are you sure you want to delete <span class="font-semibold">{{ toDelete?.name }}</span>?</p>
        <div class="flex justify-end gap-2">
          <button class="btn-secondary" @click="showDeleteModal = false">Cancel</button>
          <button class="btn-primary bg-red-500 hover:bg-red-600" @click="deleteChecklist">Delete</button>
        </div>
        <div v-if="deleteError" class="mt-2 text-red-600 dark:text-red-400">{{ deleteError }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChecklistsStore } from '@/stores/checklists'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useChecklistsStore()
const checklists = store.list
const loading = store.loading
const error = store.error
const showDeleteModal = ref(false)
const toDelete = ref<any>(null)
const deleteError = ref('')

onMounted(() => {
  store.fetchList()
})

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs'
    case 'assigned': return 'bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs'
    default: return 'bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs'
  }
}
const confirmDelete = (checklist: any) => {
  toDelete.value = checklist
  showDeleteModal.value = true
}
const deleteChecklist = async () => {
  deleteError.value = ''
  try {
    await store.deleteChecklist(toDelete.value.id)
    showDeleteModal.value = false
  } catch (e: any) {
    deleteError.value = e.message || 'Failed to delete checklist'
  }
}
</script>
<style scoped>
.icon-eye::before { content: '👁'; }
.icon-edit::before { content: '✏️'; }
.icon-trash::before { content: '🗑️'; }
</style> 