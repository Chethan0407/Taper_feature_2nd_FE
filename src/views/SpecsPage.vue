<template>
  <div class="min-h-screen bg-white dark:bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <!-- Page Header -->
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2 dark:text-white">Specifications</h1>
            <p class="text-gray-500 dark:text-gray-400">Upload, manage and review your tapeout specifications</p>
          </div>
          <button class="btn-primary px-6 py-3 text-lg font-semibold shadow-xl animate-glow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2" @click="showCreateModal = true">
            + Create Spec
          </button>
        </div>

        <!-- Drag-and-Drop Upload Area -->
        <div
          class="mb-8 bg-white dark:bg-dark-900 border-2 border-dashed border-gray-300 dark:border-dark-700 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-lg transition-colors duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-800"
          @click="triggerFileInput"
          @dragover.prevent="dragActive = true"
          @dragleave.prevent="dragActive = false"
          @drop.prevent="onDropFile"
          :class="{ 'ring-2 ring-blue-400': dragActive }"
        >
          <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4h-4a2 2 0 01-2-2V8a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2z" />
          </svg>
          <p class="text-gray-600 dark:text-gray-400 mb-2 text-sm">Drag and drop a spec file here, or <span class="text-blue-600 underline">browse</span> to upload</p>
          <p class="text-xs text-gray-400">PDF, DOCX, PPT, XLS, PPTX, XLSX up to 50MB</p>
          <input ref="dragDropFileInput" type="file" class="hidden" @change="onDragDropFileChange" accept=".pdf,.docx,.ppt,.xls,.pptx,.xlsx" />
        </div>

        <!-- Specs Table -->
        <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl shadow-lg">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Recent Specifications</h2>
            <div>
              <select class="input-field" v-model="selectedStatus" @change="handleStatusChange">
                <option value="">All Status</option>
                <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
              </select>
            </div>
          </div>
          <div v-if="loadingSpecs" class="text-center py-8 text-gray-400">Loading specifications...</div>
          <div v-else-if="specsError" class="text-center py-8 text-red-400">{{ specsError }}</div>
          <div v-else>
            <table class="min-w-full text-left bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl overflow-hidden">
              <thead>
                <tr class="border-b border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-800">
                  <th class="py-3 px-4 text-gray-700 dark:text-gray-200 font-semibold">File Name</th>
                  <th class="py-3 px-4 text-gray-700 dark:text-gray-200 font-semibold">Uploaded By</th>
                  <th class="py-3 px-4 text-gray-700 dark:text-gray-200 font-semibold">Uploaded On</th>
                  <th class="py-3 px-4 text-gray-700 dark:text-gray-200 font-semibold">File Type</th>
                  <th class="py-3 px-4 text-gray-700 dark:text-gray-200 font-semibold">Status</th>
                  <th class="py-3 px-4 text-gray-700 dark:text-gray-200 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="spec in specs" :key="spec.id" class="border-b border-gray-200 dark:border-dark-800 hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors">
                  <td class="py-3 px-4">{{ spec.file_name || spec.name }}</td>
                  <td class="py-3 px-4">{{ spec.uploaded_by || spec.uploader || '—' }}</td>
                  <td class="py-3 px-4">{{ spec.uploaded_on ? new Date(spec.uploaded_on).toLocaleString() : '—' }}</td>
                  <td class="py-3 px-4">{{ spec.file_type || spec.type || '—' }}</td>
                  <td class="py-3 px-4">{{ spec.status }}</td>
                  <td class="py-3 px-4 flex gap-2">
                    <button class="btn-secondary focus:outline-none focus:ring-2 focus:ring-blue-400" @click="handleDownload(spec.id)">Download</button>
                    <button class="btn-secondary text-red-400 focus:outline-none focus:ring-2 focus:ring-red-400" @click="handleDelete(spec.id)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="!specs.length" class="text-center py-8 text-gray-400">No specifications found.</div>
          </div>
        </div>
      </main>
    </div>

    <!-- Create Spec Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white dark:bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl font-bold" @click="closeCreateModal">&times;</button>
        <h2 class="text-2xl font-bold mb-6 text-center text-gradient">Create New Spec</h2>
        <form class="space-y-4" @submit.prevent="handleCreateSpec">
          <input class="input-field w-full" v-model="createSpecForm.name" placeholder="Spec Name" required />
          <input class="input-field w-full" v-model="createSpecForm.version" placeholder="Version (e.g. 1.0.0)" pattern="^\d+\.\d+\.\d+$" title="Version must be in the format major.minor.patch (e.g. 1.0.0)" required />
          <textarea class="input-field w-full" v-model="createSpecForm.description" placeholder="Description (optional)" rows="3"></textarea>
          <div>
            <div v-if="createSpecFile">
              <div class="flex items-center justify-between bg-gray-100 dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg px-3 py-2 mb-2">
                <span class="truncate text-gray-700 dark:text-gray-200">{{ createSpecFile.name }}</span>
                <button type="button" class="text-blue-600 hover:underline text-sm ml-4" @click="removeSelectedFile">Change</button>
              </div>
            </div>
            <input
              v-else
              type="file"
              ref="createSpecFileInput"
              class="input-field w-full"
              @change="onCreateSpecFileChange"
              required
            />
          </div>
          <button class="btn-primary w-full py-3 text-lg font-semibold" :disabled="creatingSpec">
            <span v-if="creatingSpec">Creating...</span>
            <span v-else>Create</span>
          </button>
          <div v-if="createSpecError" class="text-red-400 text-center mt-2">{{ createSpecError }}</div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const specs = ref<any[]>([])
const loadingSpecs = ref(false)
const specsError = ref('')
const statusOptions = ref<string[]>([])
const selectedStatus = ref('')

const authStore = useAuthStore()

const fetchSpecs = async () => {
  loadingSpecs.value = true
  specsError.value = ''
  try {
    let url = '/api/v1/specifications'
    if (selectedStatus.value) url += `?status=${encodeURIComponent(selectedStatus.value)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(await res.text() || 'Failed to fetch specifications')
    specs.value = await res.json()
  } catch (e: any) {
    specsError.value = e.message || 'Failed to fetch specifications'
  } finally {
    loadingSpecs.value = false
  }
}

const fetchStatusOptions = async () => {
  try {
    const res = await fetch('/api/v1/specifications/statuses')
    if (!res.ok) throw new Error(await res.text() || 'Failed to fetch statuses')
    statusOptions.value = await res.json()
  } catch (e: any) {
    statusOptions.value = []
  }
}

const handleStatusChange = (e: Event) => {
  selectedStatus.value = (e.target as HTMLSelectElement).value
  fetchSpecs()
}

const handleDownload = async (id: string) => {
  try {
    const res = await fetch(`/api/v1/specifications/${id}/download`)
    if (!res.ok) throw new Error('Failed to download file')
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '' // Let backend set filename via headers
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    // Optionally show toast
  }
}

const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this specification?')) return
  try {
    const res = await fetch(`/api/v1/specifications/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete specification')
    fetchSpecs()
  } catch (e) {
    // Optionally show toast
  }
}

onMounted(() => {
  fetchStatusOptions()
  fetchSpecs()
})

// --- Create Spec Modal Logic ---
const showCreateModal = ref(false)
const allowedExtensions = ['pdf', 'docx', 'ppt', 'xls', 'pptx', 'xlsx'];
const createSpecFile = ref<File | null>(null);
const createSpecForm = ref({ name: '', version: '', description: '' });
const creatingSpec = ref(false);
const createSpecError = ref('');
const createSpecFileInput = ref<HTMLInputElement | null>(null);
const dragActive = ref(false)
const dragDropFileInput = ref<HTMLInputElement | null>(null)

function onCreateSpecFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    const file = files[0];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      createSpecError.value = 'Invalid file type. Only PDF, DOCX, PPT, XLS, PPTX, XLSX are allowed.';
      createSpecFile.value = null;
      return;
    }
    createSpecFile.value = file;
    createSpecError.value = '';
    if (!createSpecForm.value.name) {
      createSpecForm.value.name = file.name.replace(/\.[^/.]+$/, '');
    }
  }
}

function closeCreateModal() {
  showCreateModal.value = false;
  if (dragDropFileInput.value) dragDropFileInput.value.value = '';
  if (createSpecFileInput.value) createSpecFileInput.value.value = '';
  createSpecFile.value = null;
  createSpecForm.value = { name: '', version: '', description: '' };
  createSpecError.value = '';
}

async function handleCreateSpec() {
  if (!createSpecFile.value) {
    createSpecError.value = 'Please select a file.';
    return;
  }
  if (!createSpecForm.value.name || !createSpecForm.value.version) {
    createSpecError.value = 'Name and version are required.';
    return;
  }
  if (createSpecFile.value.size > 50 * 1024 * 1024) {
    createSpecError.value = 'File size exceeds 50MB limit.';
    return;
  }
  creatingSpec.value = true;
  createSpecError.value = '';
  try {
    const formData = new FormData();
    formData.append('file', createSpecFile.value);
    formData.append('name', createSpecForm.value.name);
    formData.append('version', createSpecForm.value.version);
    formData.append('description', createSpecForm.value.description || '');
    formData.append('uploaded_by', authStore.user?.email || 'unknown');
    const res = await fetch('/api/v1/specifications/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      let errMsg = await res.text();
      try { errMsg = JSON.parse(errMsg).detail?.map((d: any) => d.msg).join(', ') || errMsg } catch {}
      throw new Error(errMsg || 'Failed to upload specification');
    }
    closeCreateModal();
    fetchSpecs();
  } catch (e: any) {
    createSpecError.value = e.message || 'Failed to upload specification';
  } finally {
    creatingSpec.value = false;
  }
}

function triggerFileInput() {
  dragDropFileInput.value?.click()
}

function onDragDropFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    handleFileForModal(files[0])
  }
}

function onDropFile(e: DragEvent) {
  dragActive.value = false
  if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    handleFileForModal(e.dataTransfer.files[0])
  }
}

function handleFileForModal(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !allowedExtensions.includes(ext)) {
    createSpecError.value = 'Invalid file type. Only PDF, DOCX, PPT, XLS, PPTX, XLSX are allowed.'
    return
  }
  if (file.size > 50 * 1024 * 1024) {
    createSpecError.value = 'File size exceeds 50MB limit.'
    return
  }
  createSpecFile.value = file
  createSpecForm.value.name = file.name.replace(/\.[^/.]+$/, '')
  showCreateModal.value = true
  // Focus the name input after modal opens
  setTimeout(() => {
    createSpecFileInput.value?.focus()
  }, 100)
}

function removeSelectedFile() {
  createSpecFile.value = null;
  if (createSpecFileInput.value) createSpecFileInput.value.value = '';
}
</script> 