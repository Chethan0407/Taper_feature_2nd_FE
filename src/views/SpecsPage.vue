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
          <button
            class="btn-primary px-6 py-3 text-lg font-semibold shadow-xl animate-glow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            @click="showCreateModal = true"
          >
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

        <!-- Specifications Filter -->
        <SpecificationsFilter
          v-model="specificationsStore.filters"
          @filter-change="handleFilterChange"
        />

        <!-- Specs Table -->
        <div class="card bg-dark-900 border border-dark-700 rounded-xl shadow-lg">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-white">Recent Specifications</h2>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-400">{{ specificationsStore.specifications.length }} specifications</span>
            </div>
          </div>
          <div v-if="showLoading" class="text-center py-8 text-gray-400">
            <svg class="w-8 h-8 animate-spin mx-auto mb-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
            Loading specifications...
                </div>
          <div v-else-if="specificationsStore.error" class="text-center py-8 text-red-400">
            <span v-if="specificationsStore.error.includes('Not Found')">No specifications found.</span>
            <span v-else>{{ specificationsStore.error }}</span>
                </div>
          <div v-else>
            <table class="min-w-full text-left bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
              <thead>
                <tr class="border-b border-dark-700 bg-dark-800">
                  <th class="py-3 px-4 text-gray-200 font-semibold">File Name</th>
                  <th class="py-3 px-4 text-gray-200 font-semibold">Uploaded By</th>
                  <th class="py-3 px-4 text-gray-200 font-semibold">Uploaded On</th>
                  <th class="py-3 px-4 text-gray-200 font-semibold">File Type</th>
                  <th class="py-3 px-4 text-gray-200 font-semibold">Status</th>
                  <th class="py-3 px-4 text-gray-200 font-semibold">Assigned To</th>
                  <th class="py-3 px-4 text-gray-200 font-semibold">Approval Info</th>
                  <th class="py-3 px-4 text-gray-200 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="spec in specificationsStore.specifications" :key="spec.id" class="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                  <td class="py-3 px-4 max-w-xs truncate">
                    <button @click="handleDownload(spec.id)" class="text-neon-blue hover:underline font-medium truncate block text-left w-full" :title="spec.file_name || spec.name || 'Unnamed Spec'">
                      {{ (spec.file_name || spec.name || 'Unnamed Spec').length > 8
                        ? (spec.file_name || spec.name || 'Unnamed Spec').slice(0, 4) + '...' + (spec.file_name || spec.name || 'Unnamed Spec').slice(-4)
                        : (spec.file_name || spec.name || 'Unnamed Spec') }}
                  </button>
                  </td>
                  <td class="py-3 px-4">{{ spec.uploaded_by || '—' }}</td>
                  <td class="py-3 px-4">{{ spec.uploaded_on ? new Date(spec.uploaded_on).toLocaleString() : '—' }}</td>
                  <td class="py-3 px-4" :title="spec.mime_type || spec.file_type || spec.type || '—'">
                    {{ getFileTypeLabel(spec.mime_type || spec.file_type || spec.type || '') }}
                  </td>
                  <td class="py-3 px-4">{{ spec.status }}</td>
                  <td class="py-3 px-4">{{ spec.assigned_to || '—' }}</td>
                  <td class="py-3 px-4">
                    <template v-if="spec.status === 'Approved' && spec.approved_by">
                      Approved By: {{ spec.approved_by }}
                    </template>
                    <template v-else-if="spec.status === 'Rejected' && spec.rejected_by">
                      Rejected By: {{ spec.rejected_by }}
                    </template>
                    <template v-else>
                      —
                    </template>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button class="rounded-full w-9 h-9 flex items-center justify-center bg-dark-800 hover:bg-green-100/10 border border-green-400" @click="updateSpecStatus(spec, 'approved')" :disabled="spec.status === 'Approved'" title="Approve">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button class="rounded-full w-9 h-9 flex items-center justify-center bg-dark-800 hover:bg-red-100/10 border border-red-500" @click="updateSpecStatus(spec, 'rejected')" :disabled="spec.status === 'Rejected'" title="Reject">
                        <!-- Red X SVG for Reject -->
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" />
                          <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" stroke-width="2" />
                        </svg>
                      </button>
                      <button class="rounded-full w-9 h-9 flex items-center justify-center bg-dark-800 hover:bg-blue-100/10 border border-blue-400" @click="handleDownload(spec.id)" title="Download">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 11l5 5 5-5M12 4v12" />
                        </svg>
                      </button>
                      <button class="rounded-full w-9 h-9 flex items-center justify-center bg-dark-800 hover:bg-red-100/10 border border-red-500" @click="() => confirmAndDelete(spec.id)" title="Delete">
                        <!-- Trash/bin SVG for Delete -->
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="!specificationsStore.specifications.length" class="text-center py-8 text-gray-400">
              No specifications uploaded yet. Drag and drop a file above to get started.
            </div>
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
          <!-- Reviewer Assignment: Combobox (autocomplete + free text) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign Reviewer</label>
            <input
              class="input-field w-full"
              v-model="createSpecForm.assigned_to"
              :list="reviewers.length ? 'reviewer-list' : undefined"
              placeholder="Enter reviewer name or email"
              autocomplete="off"
              required
            />
            <datalist v-if="reviewers.length" id="reviewer-list">
              <option v-for="user in reviewers" :key="user.id || user.email" :value="user.email">
                {{ user.name || user.email }}
              </option>
            </datalist>
          </div>
          <button class="btn-primary w-full py-3 text-lg font-semibold" :disabled="creatingSpec">
            <span v-if="creatingSpec">Creating...</span>
            <span v-else>Create</span>
          </button>
          <div v-if="createSpecError" class="text-red-400 text-center mt-2">{{ createSpecError }}</div>
        </form>
      </div>
    </div>

    <!-- Toast/Alert for upload feedback -->
    <div v-if="toastMessage" :class="['fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-xl', toastError ? 'bg-red-600 text-white' : 'bg-green-600 text-white']">
      {{ toastMessage }}
    </div>

    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
        <h2 class="text-2xl font-bold mb-4 text-center text-gradient">Delete Specification</h2>
        <p class="text-gray-300 text-center mb-6">Are you sure you want to delete this specification?</p>
        <div class="flex justify-center gap-4">
          <button class="btn-secondary px-6 py-2" @click="showDeleteModal = false">Cancel</button>
          <button class="btn-danger px-6 py-2" @click="() => handleDelete(specToDelete)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import SpecificationsFilter from '@/components/Specifications/SpecificationsFilter.vue'
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSpecificationsStore } from '@/stores/specifications'

const specificationsStore = useSpecificationsStore()
const authStore = useAuthStore()

// Legacy variables for backward compatibility
const specs = ref<any[]>([])
const loadingSpecs = ref(false)
const specsError = ref('')
const statusOptions = ref<string[]>([
  'All Status',
  'Draft',
  'Pending Review',
  'Approved',
  'Rejected',
  'Updated After Rejection',
  'Archived'
]);
const selectedStatus = ref('All Status');

const showLoading = ref(false)
let loadingTimeout: any = null

// Handle filter changes
const handleFilterChange = async (filters: any) => {
  await specificationsStore.updateFilters(filters)
  // Use delayed spinner for filter changes
  // (If updateFilters already calls loadSpecifications, you may want to call delayedLoadSpecs instead)
}

// --- Reviewer logic ---
const reviewers = ref<any[]>([])

const fetchReviewers = async () => {
  try {
    const res = await fetch('/api/v1/users?role=reviewer', {
      headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
    })
    if (res.ok) reviewers.value = await res.json()
  } catch {}
}

const fetchSpecs = async () => {
  loadingSpecs.value = true;
  specsError.value = '';
  try {
    let url = '/api/v1/specifications';
    if (selectedStatus.value && selectedStatus.value !== 'All Status') {
      url += `?status=${encodeURIComponent(selectedStatus.value)}`;
    }
    let fetchOptions: RequestInit = {}
    if (authStore.token) {
      fetchOptions.headers = { 'Authorization': `Bearer ${authStore.token}` }
    }
    const res = await fetch(url, fetchOptions);
    if (!res.ok) throw new Error(await res.text() || 'Failed to fetch specifications');
    specs.value = await res.json();
  } catch (e: any) {
    specsError.value = e.message || 'Failed to fetch specifications';
  } finally {
    loadingSpecs.value = false;
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
    let fetchOptions: RequestInit = {}
    if (authStore.token) {
      fetchOptions.headers = { 'Authorization': `Bearer ${authStore.token}` }
    }
    const res = await fetch(`/api/v1/specifications/${id}/download`, fetchOptions)
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

const showDeleteModal = ref(false)
const specToDelete = ref<any>(null)

function confirmAndDelete(id: string) {
  specToDelete.value = id
  showDeleteModal.value = true
}

const handleDelete = async (id: string) => {
  showDeleteModal.value = false
  try {
    let fetchOptions: RequestInit = {
      method: 'DELETE',
    };
    if (authStore.token) {
      fetchOptions.headers = { 'Authorization': `Bearer ${authStore.token}` };
    }
    const res = await fetch(`/api/v1/specifications/${id}`, fetchOptions);
    if (!res.ok) throw new Error('Failed to delete specification')
    await specificationsStore.loadSpecifications();
  } catch (e) {
    // Optionally show toast
  } finally {
    specToDelete.value = null
  }
}

const delayedLoadSpecs = async () => {
  // Start a timer to show the spinner after 300ms
  loadingTimeout = setTimeout(() => {
    showLoading.value = true
  }, 300)

  await specificationsStore.loadSpecifications()

  // Data loaded, clear timer and hide spinner
  clearTimeout(loadingTimeout)
  showLoading.value = false
}

onMounted(async () => {
  await delayedLoadSpecs()
  fetchReviewers()
})

// --- Create Spec Modal Logic ---
const showCreateModal = ref(false)
const allowedExtensions = ['pdf', 'docx', 'ppt', 'xls', 'pptx', 'xlsx'];
const createSpecFile = ref<File | null>(null);
const createSpecForm = ref({ name: '', version: '', description: '', assigned_to: '', status: 'Pending' });
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
  createSpecForm.value = { name: '', version: '', description: '', assigned_to: '', status: 'Pending' };
  createSpecError.value = '';
}

const toastMessage = ref('');
const toastError = ref(false);

function showToast(message: string, isError = false) {
  toastMessage.value = message;
  toastError.value = isError;
  setTimeout(() => { toastMessage.value = ''; }, 3000);
}

async function updateSpecStatus(spec: any, status: string) {
  try {
    let endpoint = '';
    if (status === 'approved') {
      endpoint = `/api/v1/specifications/${spec.id}/approve`;
    } else if (status === 'rejected') {
      endpoint = `/api/v1/specifications/${spec.id}/reject`;
    } else {
      throw new Error('Invalid status');
    }
    let fetchOptions: RequestInit = {
      method: 'POST',
    };
    if (authStore.token) {
      fetchOptions.headers = { 'Authorization': `Bearer ${authStore.token}` };
    }
    const res = await fetch(endpoint, fetchOptions);
    if (!res.ok) throw new Error('Failed to update status');
    showToast(`Spec marked as ${status}.`);
    await specificationsStore.loadSpecifications();
  } catch (e: any) {
    showToast(e.message || 'Failed to update status', true);
  }
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
  // Version format validation
  if (!/^\d+\.\d+\.\d+$/.test(createSpecForm.value.version)) {
    createSpecError.value = 'Version must be in the format major.minor.patch (e.g. 1.0.0)';
    return;
  }
  if (!createSpecForm.value.assigned_to) {
    createSpecError.value = 'Please assign a reviewer.';
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
    formData.append('assigned_to', createSpecForm.value.assigned_to);
    formData.append('status', 'Pending'); // Always set to Pending on create
    let fetchOptions: RequestInit = {
      method: 'POST',
      body: formData,
    };
    if (authStore.token) {
      fetchOptions.headers = { 'Authorization': `Bearer ${authStore.token}` };
    }
    const res = await fetch('/api/v1/specifications/upload-spec', fetchOptions);
    if (!res.ok) {
      let errMsg = await res.text();
      try { errMsg = JSON.parse(errMsg).detail?.map((d: any) => d.msg).join(', ') || errMsg } catch {}
      throw new Error(errMsg || 'Failed to upload specification');
    }
    closeCreateModal();
    await delayedLoadSpecs();
    showToast('Upload successful!');
  } catch (e: any) {
    createSpecError.value = e.message || 'Failed to upload specification';
    showToast(createSpecError.value, true);
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

// Add a helper to map MIME types to user-friendly labels
function getFileTypeLabel(mimeType: string) {
  if (!mimeType) return '—';
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'Excel';
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'Word';
  if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return 'PowerPoint';
  if (mimeType === 'application/vnd.ms-excel') return 'Excel';
  if (mimeType === 'application/msword') return 'Word';
  if (mimeType === 'application/vnd.ms-powerpoint') return 'PowerPoint';
  return mimeType.split('/').pop()?.toUpperCase() || 'Unknown';
}
</script> 