<template>
  <div class="min-h-screen bg-dark-950 p-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-white">Checklists</h1>
      <button class="btn-primary px-6 py-3 text-lg font-semibold shadow-xl animate-glow rounded-xl" @click="$router.push('/checklists/create')">
        + Create Checklist
      </button>
    </div>
    <div v-if="loading" class="flex justify-center items-center py-12">
      <span class="text-gray-400">Loading checklists...</span>
    </div>
    <div v-else-if="error" class="text-center py-12 text-red-400">{{ error }}</div>
    <div v-else-if="checklists.length === 0" class="text-center py-12 text-gray-400">
      No checklists yet. Create your first checklist.
    </div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full bg-dark-900 rounded-xl shadow-lg">
        <thead>
          <tr class="text-left text-gray-400 border-b border-dark-700">
            <th class="py-3 px-4">Name</th>
            <th class="py-3 px-4">Status</th>
            <th class="py-3 px-4">Assigned To</th>
            <th class="py-3 px-4">Created By</th>
            <th class="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="checklist in checklists.filter(c => c.id)" :key="checklist.id" class="border-b border-dark-800 hover:bg-dark-800/50">
            <td class="py-3 px-4">
              <router-link :to="`/checklists/${String(checklist.id ?? '')}`" class="text-neon-blue hover:underline font-medium">{{ checklist.name }}</router-link>
            </td>
            <td class="py-3 px-4">
              <span v-if="checklist.status" :class="statusBadgeClass(checklist.status)">{{ checklist.status }}</span>
              <span v-else class="text-gray-500">—</span>
            </td>
            <td class="py-3 px-4">
              <span v-if="checklist.assigned_to && checklist.assigned_to.length > 0">
                <span v-for="user in checklist.assigned_to" :key="user.id" class="inline-block bg-dark-700 text-white rounded-full px-2 py-1 text-xs mr-1">{{ user.name }}</span>
              </span>
              <span v-else class="text-gray-500">—</span>
            </td>
            <td class="py-3 px-4">{{ checklist.created_by?.name || '—' }}</td>
            <td class="py-3 px-4 flex gap-2">
              <router-link :to="`/checklists/${String(checklist.id ?? '')}`" title="View"><span class="icon-eye" /></router-link>
              <router-link :to="`/checklists/${String(checklist.id ?? '')}/edit`" title="Edit"><span class="icon-edit" /></router-link>
              <button @click="confirmDelete(checklist)" title="Delete"><span class="icon-trash text-red-400" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Delete modal placeholder -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-dark-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h3 class="text-xl font-bold mb-4 text-white">Delete Checklist</h3>
        <p class="mb-6 text-gray-300">Are you sure you want to delete <span class="font-semibold">{{ toDelete?.name }}</span>?</p>
        <div class="flex justify-end gap-2">
          <button class="btn-secondary" @click="showDeleteModal = false">Cancel</button>
          <button class="btn-primary bg-red-500 hover:bg-red-600" @click="deleteChecklist">Delete</button>
        </div>
        <div v-if="deleteError" class="text-red-400 mt-2">{{ deleteError }}</div>
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