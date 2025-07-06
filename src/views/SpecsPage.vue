<template>
  <div class="min-h-screen bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <!-- Page Header -->
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">Specifications</h1>
            <p class="text-gray-400">Upload, manage and review your tapeout specifications</p>
          </div>
          <button class="btn-primary px-6 py-3 text-lg font-semibold shadow-xl animate-glow" @click="showCreateModal = true">
            + Create Spec
          </button>
        </div>

        <!-- Project Error Alert -->
        <div v-if="showProjectError" class="card mb-8 bg-red-500/10 border border-red-500/30">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-red-400">{{ projectError }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <input 
                type="number" 
                v-model.number="currentProjectId" 
                class="input-field w-20 text-center"
                placeholder="ID"
                min="1"
              />
              <button 
                @click="changeProjectId(currentProjectId)" 
                class="btn-secondary px-3 py-1 text-sm"
              >
                Change Project
              </button>
            </div>
          </div>
        </div>

        <!-- Upload Section -->
        <div class="card mb-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-white">Upload New Spec</h2>
            <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" />
            <button class="btn-primary" @click="triggerFileInput" :disabled="uploading">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span v-if="uploading">Uploading...</span>
              <span v-else>Upload Spec</span>
            </button>
          </div>
          
          <div class="border-2 border-dashed border-dark-600 rounded-lg p-8 text-center">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            <p class="text-gray-400 mb-2">Drag and drop your spec files here</p>
            <p class="text-sm text-gray-500">Supports PDF, DOCX, PPT, XLS (Max 50MB)</p>
            <input type="file" class="mt-4" @change="handleFileChange" />
            <div v-if="uploadError" class="text-red-400 mt-2">{{ uploadError }}</div>
            <div v-if="uploadSuccess" class="text-green-400 mt-2">Spec uploaded successfully!</div>
          </div>
        </div>

        <!-- Specs List -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-white">Recent Specifications</h2>
            <div class="flex space-x-2">
              <select class="input-field">
                <option>All Status</option>
                <option>Draft</option>
                <option>Review</option>
                <option>Approved</option>
              </select>
            </div>
          </div>

          <div class="space-y-4">
            <div v-for="spec in specs" :key="spec.id" class="flex items-center justify-between p-4 bg-dark-800 rounded-lg border border-dark-600">
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-white">{{ spec.name }}</h3>
                  <p class="text-sm text-gray-400">v{{ spec.version }} • {{ spec.uploadDate }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-4">
                <span :class="getStatusClass(spec.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ spec.status }}
                </span>
                <div class="flex space-x-2">
                  <button class="p-2 text-gray-400 hover:text-gray-300 transition-colors" title="Preview">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-gray-300 transition-colors" title="Download">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </button>
                  <!-- Actions Dropdown -->
                  <div class="relative" @mouseenter="openDropdown = spec.id" @mouseleave="openDropdown = null">
                    <button class="p-2 text-gray-400 hover:text-gray-300 transition-colors" title="More Actions">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="5" cy="12" r="2"/>
                        <circle cx="12" cy="12" r="2"/>
                        <circle cx="19" cy="12" r="2"/>
                      </svg>
                    </button>
                    <div v-if="openDropdown === spec.id" class="absolute right-0 mt-2 w-56 bg-dark-900 border border-dark-700 rounded-xl shadow-xl z-50 py-2">
                      <button class="block w-full text-left px-4 py-2 hover:bg-dark-800 text-gray-200" @click="viewDetails(spec)">View Details</button>
                      <button class="block w-full text-left px-4 py-2 hover:bg-dark-800 text-gray-200" @click="editSpec(spec)">Edit</button>
                      <button class="block w-full text-left px-4 py-2 hover:bg-dark-800 text-gray-200" @click="deleteSpec(spec)">Delete</button>
                      <button class="block w-full text-left px-4 py-2 hover:bg-dark-800 text-gray-200" @click="duplicateSpec(spec)">Duplicate</button>
                      <button class="block w-full text-left px-4 py-2 hover:bg-dark-800 text-gray-200" @click="approveSpec(spec)">Approve</button>
                      <button class="block w-full text-left px-4 py-2 hover:bg-dark-800 text-gray-200" @click="assignReviewer(spec)">Assign Reviewer</button>
                      <button class="block w-full text-left px-4 py-2 hover:bg-dark-800 text-gray-200" @click="triggerLint(spec)">Trigger Lint</button>
                      <button class="block w-full text-left px-4 py-2 hover:bg-dark-800 text-gray-200" @click="viewLintResults(spec)">View Lint Results</button>
                      <button class="block w-full text-left px-4 py-2 hover:bg-dark-800 text-gray-200" @click="viewVersions(spec)">Version History</button>
                      <button class="block w-full text-left px-4 py-2 hover:bg-dark-800 text-gray-200" @click="compareVersions(spec)">Compare Versions</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Create Spec Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl font-bold" @click="showCreateModal = false">&times;</button>
        <h2 class="text-2xl font-bold mb-6 text-center text-gradient">Create New Spec</h2>
        <form class="space-y-4" @submit.prevent="handleCreateSpec">
          <input class="input-field w-full" v-model="createSpecForm.name" placeholder="Spec Name" required />
          <input class="input-field w-full" v-model="createSpecForm.version" placeholder="Version (e.g. 1.0.0)" pattern="^\d+\.\d+\.\d+$" title="Version must be in the format major.minor.patch (e.g. 1.0.0)" required />
          <textarea class="input-field w-full" v-model="createSpecForm.description" placeholder="Description (optional)" rows="3"></textarea>
          <input type="file" ref="createSpecFileInput" class="input-field w-full" @change="onCreateSpecFileChange" required />
          <button class="btn-primary w-full py-3 text-lg font-semibold" :disabled="creatingSpec">
            <span v-if="creatingSpec">Creating...</span>
            <span v-else>Create</span>
          </button>
          <div v-if="createSpecError" class="text-red-400 text-center mt-2">{{ createSpecError }}</div>
        </form>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-2xl relative">
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl font-bold" @click="closeDetailsModal">&times;</button>
        <h2 class="text-2xl font-bold mb-6 text-center text-gradient">Spec Details</h2>
        <div class="flex space-x-4 mb-6">
          <button v-for="tab in detailsTabs" :key="tab" @click="activeDetailsTab = tab" :class="['px-4 py-2 rounded-lg font-semibold', activeDetailsTab === tab ? 'bg-dark-800 text-neon-blue' : 'bg-dark-700 text-gray-300']">{{ tab }}</button>
        </div>
        <div v-if="activeDetailsTab === 'General'">
          <div class="mb-4">
            <label class="block text-gray-400 mb-1">Name</label>
            <input class="input-field w-full" v-model="detailsSpec.name" />
          </div>
          <div class="mb-4">
            <label class="block text-gray-400 mb-1">Version</label>
            <input class="input-field w-full" v-model="detailsSpec.version" />
          </div>
          <div class="mb-4">
            <label class="block text-gray-400 mb-1">Description</label>
            <textarea class="input-field w-full" v-model="detailsSpec.description" rows="3"></textarea>
          </div>
          <button class="btn-primary w-full mt-4" @click="editSpec(detailsSpec)">Save Changes</button>
        </div>
        <div v-else-if="activeDetailsTab === 'Reviewers'">
          <div class="mb-4 flex items-center justify-between">
            <span class="text-gray-300 font-semibold">Assigned Reviewers</span>
            <button class="btn-secondary" @click="openAssignReviewerModal(detailsSpec)">Assign Reviewer</button>
          </div>
          <ul class="mb-4">
            <li v-for="reviewer in detailsSpec.reviewers || []" :key="reviewer.id" class="flex items-center justify-between py-2 border-b border-dark-700">
              <span class="text-gray-200">{{ reviewer.name }}</span>
              <button class="text-red-400 hover:text-red-600" @click="removeReviewer(detailsSpec, reviewer)">&times;</button>
            </li>
          </ul>
        </div>
        <div v-else-if="activeDetailsTab === 'Lint Results'">
          <div class="mb-4 flex items-center justify-between">
            <span class="text-gray-300 font-semibold">Lint Results</span>
            <button class="btn-secondary" @click="openLintModal(detailsSpec)">Trigger Lint</button>
          </div>
          <ul>
            <li v-for="lint in detailsSpec.lintResults || []" :key="lint.id" class="py-2 border-b border-dark-700">
              <span :class="getLintClass(lint.type)">{{ lint.type }}</span> - {{ lint.message }}
            </li>
          </ul>
        </div>
        <div v-else-if="activeDetailsTab === 'Version History'">
          <div class="mb-4 flex items-center justify-between">
            <span class="text-gray-300 font-semibold">Versions</span>
            <button class="btn-secondary" @click="openVersionModal(detailsSpec)">Compare Versions</button>
          </div>
          <ul>
            <li v-for="version in detailsSpec.versions || []" :key="version.id" class="py-2 border-b border-dark-700 flex items-center justify-between">
              <span class="text-gray-200">v{{ version.number }} - {{ version.date }}</span>
              <button class="btn-secondary" @click="downloadVersion(version)">Download</button>
            </li>
          </ul>
        </div>
        <div class="flex space-x-2 mt-8">
          <button class="btn-primary flex-1" @click="approveSpec(detailsSpec)">Approve</button>
          <button class="btn-secondary flex-1" @click="openDuplicateModal(detailsSpec)">Duplicate</button>
          <button class="btn-secondary flex-1" @click="downloadSpec(detailsSpec)">Download</button>
          <button class="btn-secondary flex-1 text-red-400 border-red-400" @click="openDeleteModal(detailsSpec)">Delete</button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl font-bold" @click="closeEditModal">&times;</button>
        <h2 class="text-2xl font-bold mb-6 text-center text-gradient">Edit Spec</h2>
        <form class="space-y-4" @submit.prevent="handleEditSpec">
          <input class="input-field w-full" v-model="editSpecForm.name" placeholder="Spec Name" required />
          <input class="input-field w-full" v-model="editSpecForm.version" placeholder="Version (e.g. v1.0)" required />
          <textarea class="input-field w-full" v-model="editSpecForm.description" placeholder="Description (optional)" rows="3"></textarea>
          <button class="btn-primary w-full py-3 text-lg font-semibold" :disabled="editingSpec">
            <span v-if="editingSpec">Saving...</span>
            <span v-else>Save</span>
          </button>
          <div v-if="editSpecError" class="text-red-400 text-center mt-2">{{ editSpecError }}</div>
          <div v-if="editSpecSuccess" class="text-green-400 text-center mt-2">Spec updated successfully!</div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-sm relative text-center">
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl font-bold" @click="closeDeleteModal">&times;</button>
        <h2 class="text-2xl font-bold mb-6 text-gradient">Delete Spec?</h2>
        <p class="text-gray-300 mb-6">Are you sure you want to delete this spec? This action cannot be undone.</p>
        <div class="flex space-x-4 justify-center">
          <button class="btn-secondary flex-1" @click="closeDeleteModal">Cancel</button>
          <button class="btn-primary flex-1 bg-red-600 hover:bg-red-700" @click="confirmDeleteSpec">Delete</button>
        </div>
      </div>
    </div>

    <!-- Assign Reviewer Modal -->
    <div v-if="showAssignReviewerModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl font-bold" @click="closeAssignReviewerModal">&times;</button>
        <h2 class="text-2xl font-bold mb-6 text-center text-gradient">Assign Reviewer</h2>
        <form class="space-y-4">
          <input class="input-field w-full" v-model="reviewerEmail" placeholder="Reviewer Email" />
          <button class="btn-primary w-full py-3 text-lg font-semibold">Assign</button>
        </form>
      </div>
    </div>

    <!-- Lint Results Modal -->
    <div v-if="showLintModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-lg relative">
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl font-bold" @click="closeLintModal">&times;</button>
        <h2 class="text-2xl font-bold mb-6 text-center text-gradient">Lint Results</h2>
        <ul>
          <li v-for="lint in lintResults" :key="lint.id" class="py-2 border-b border-dark-700">
            <span :class="getLintClass(lint.type)">{{ lint.type }}</span> - {{ lint.message }}
          </li>
        </ul>
        <button class="btn-primary w-full mt-6" @click="triggerLint(detailsSpec)">Re-run Lint</button>
      </div>
    </div>

    <!-- Version History Modal -->
    <div v-if="showVersionModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-lg relative">
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl font-bold" @click="closeVersionModal">&times;</button>
        <h2 class="text-2xl font-bold mb-6 text-center text-gradient">Version History</h2>
        <ul>
          <li v-for="version in detailsSpec.versions || []" :key="version.id" class="py-2 border-b border-dark-700 flex items-center justify-between">
            <span class="text-gray-200">v{{ version.number }} - {{ version.date }}</span>
            <button class="btn-secondary" @click="compareWithCurrent(version)">Compare</button>
            <button class="btn-secondary" @click="downloadVersion(version)">Download</button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Duplicate Modal -->
    <div v-if="showDuplicateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl font-bold" @click="closeDuplicateModal">&times;</button>
        <h2 class="text-2xl font-bold mb-6 text-center text-gradient">Duplicate Spec</h2>
        <form class="space-y-4">
          <input class="input-field w-full" v-model="duplicateSpecForm.name" placeholder="New Spec Name" />
          <input class="input-field w-full" v-model="duplicateSpecForm.version" placeholder="Version (e.g. v1.0)" />
          <textarea class="input-field w-full" v-model="duplicateSpecForm.description" placeholder="Description (optional)" rows="3"></textarea>
          <button class="btn-primary w-full py-3 text-lg font-semibold">Duplicate</button>
        </form>
      </div>
    </div>

    <!-- Approve Modal -->
    <div v-if="showApproveModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-sm relative text-center">
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl font-bold" @click="closeApproveModal">&times;</button>
        <h2 class="text-2xl font-bold mb-6 text-gradient">Approve Spec?</h2>
        <p class="text-gray-300 mb-6">Are you sure you want to approve this spec?</p>
        <div class="flex space-x-4 justify-center">
          <button class="btn-secondary flex-1" @click="closeApproveModal">Cancel</button>
          <button class="btn-primary flex-1" @click="confirmApproveSpec">Approve</button>
        </div>
      </div>
    </div>

    <!-- Metadata Modal -->
    <div v-if="showMetadataModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl font-bold" @click="showMetadataModal = false">&times;</button>
        <h2 class="text-2xl font-bold mb-6 text-center text-gradient">Spec Metadata</h2>
        <form class="space-y-4" @submit.prevent="submitMetadata">
          <input class="input-field w-full" v-model="metadataForm.name" placeholder="Spec Name" required />
          <textarea class="input-field w-full" v-model="metadataForm.description" placeholder="Description (optional)" rows="3"></textarea>
          <select class="input-field w-full" v-model="metadataForm.projectId" required>
            <option value="">Select Project</option>
            <option v-for="p in projectsStore.projects" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
          <select class="input-field w-full" v-model="metadataForm.type" required>
            <option value="">Select Type</option>
            <option v-for="t in typeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
          <select class="input-field w-full" v-model="metadataForm.status" required>
            <option value="">Select Status</option>
            <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
          <div class="text-gray-400 text-sm">File: <span class="font-mono">{{ metadataFile?.name }}</span></div>
          <button class="btn-primary w-full py-3 text-lg font-semibold" :disabled="metadataLoading">
            <span v-if="metadataLoading">Uploading...</span>
            <span v-else>Upload</span>
          </button>
          <div v-if="metadataError" class="text-red-400 text-center mt-2">{{ metadataError }}</div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'

interface Spec {
  id: string
  name: string
  version: string
  status: 'draft' | 'review' | 'approved'
  uploadDate: string
}

const specs = ref<Spec[]>([])

// Add modal and state for create/update
const showCreateModal = ref(false)
const editingSpec = ref(false)
const specForm = ref({ name: '', version: '', status: 'draft', uploadDate: '' })
const deleting = ref<string | null>(null)
const downloading = ref<string | null>(null)
const duplicating = ref<string | null>(null)
const assigningReviewer = ref<string | null>(null)
const approving = ref<string | null>(null)
const comparing = ref<string | null>(null)
const viewingVersions = ref<string | null>(null)
const runningLint = ref<string | null>(null)
const viewingLintResults = ref<string | null>(null)
const uploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const openDropdown = ref<string | null>(null)
const showDetailsModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showAssignReviewerModal = ref(false)
const showLintModal = ref(false)
const showVersionModal = ref(false)
const showDuplicateModal = ref(false)
const showApproveModal = ref(false)
const detailsSpec = ref<any>({})
const editSpecForm = ref({ name: '', version: '', description: '' })
const duplicateSpecForm = ref({ name: '', version: '', description: '' })
const reviewerEmail = ref('')
const lintResults = ref<any[]>([])
const detailsTabs = ['General', 'Reviewers', 'Lint Results', 'Version History']
const activeDetailsTab = ref('General')
const createSpecForm = ref({
  name: '',
  version: '',
  description: ''
})
const createSpecFile = ref<File | null>(null)
const createSpecFileInput = ref<HTMLInputElement | null>(null)
const creatingSpec = ref(false)
const createSpecError = ref('')
const editSpecError = ref('')
const editSpecSuccess = ref(false)
const route = useRoute()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const typeOptions = [
  { value: 'Functional', label: 'Functional' },
  { value: 'Physical', label: 'Physical' },
  { value: 'Timing', label: 'Timing' },
  { value: 'Other', label: 'Other' },
]
const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review' },
  { value: 'approved', label: 'Approved' },
]

// Add simple project ID management
const currentProjectId = ref<number>(1)
const showProjectError = ref(false)
const projectError = ref('')

// Simple function to change project ID
const changeProjectId = (newId: number) => {
  currentProjectId.value = newId
  showProjectError.value = false
  projectError.value = ''
  // Reload specs for the new project
  loadSpecsForProject(newId)
}

// Function to load specs for a specific project
const loadSpecsForProject = async (projectId: number) => {
  try {
    const res = await fetch(`http://localhost:8000/api/v1/specs/projects/${projectId}/specs`, {
      headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
    })
    
    if (res.ok) {
      specs.value = await res.json()
      showProjectError.value = false
    } else {
      const errorText = await res.text()
      if (errorText.includes('Project not found')) {
        showProjectError.value = true
        projectError.value = `Project ID ${projectId} not found. Please use a valid project ID.`
      }
    }
  } catch (error) {
    console.error('Error loading specs:', error)
  }
}

const getProjectId = () => {
  // Try to get from route param, fallback to current project ID
  const routeProjectId = route.params.project_id
  if (routeProjectId && typeof routeProjectId === 'string') {
    return parseInt(routeProjectId, 10)
  }
  return currentProjectId.value
}

onMounted(async () => {
  // DEBUG: Check authentication status
  console.log('=== Component Mount Debug ===')
  console.log('Is authenticated:', authStore.isAuthenticated)
  console.log('Token exists:', !!authStore.token)
  console.log('Token value:', authStore.token)
  console.log('LocalStorage token:', localStorage.getItem('tapeout_token'))
  
  // Test authentication with backend
  try {
    const authTestRes = await fetch('http://localhost:8000/api/v1/auth/me', {
      headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
    })
    console.log('Auth test response status:', authTestRes.status)
    if (authTestRes.ok) {
      const userData = await authTestRes.json()
      console.log('User data from auth test:', userData)
    } else {
      const errorText = await authTestRes.text()
      console.log('Auth test error:', errorText)
    }
  } catch (error) {
    console.error('Auth test failed:', error)
  }
  
  // Load specs for current project
  const projectId = getProjectId()
  console.log('Loading specs for project:', projectId)
  
  await loadSpecsForProject(projectId)
  await projectsStore.loadProjects()
})

const getStatusClass = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-500/20 text-green-400 border border-green-500/30'
    case 'review':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    case 'draft':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const file = target.files[0]
  metadataFile.value = file
  metadataForm.value.name = file.name.replace(/\.[^/.]+$/, '')
  metadataForm.value.description = ''
  metadataForm.value.projectId = ''
  metadataForm.value.type = ''
  metadataForm.value.status = 'draft'
  showMetadataModal.value = true
}

const submitMetadata = async () => {
  metadataLoading.value = true
  metadataError.value = ''
  try {
    if (!metadataFile.value) throw new Error('No file selected')
    if (!metadataForm.value.name) throw new Error('Name is required')
    if (!metadataForm.value.projectId) throw new Error('Project is required')
    if (!metadataForm.value.type) throw new Error('Type is required')
    if (!metadataForm.value.status) throw new Error('Status is required')
    const formData = new FormData()
    formData.append('file', metadataFile.value)
    formData.append('name', metadataForm.value.name)
    formData.append('description', metadataForm.value.description)
    formData.append('project_id', metadataForm.value.projectId)
    formData.append('type', metadataForm.value.type)
    formData.append('status', metadataForm.value.status)
    const headers: HeadersInit = {}
    if (authStore.token) headers['Authorization'] = `Bearer ${authStore.token}`
    const res = await fetch('http://localhost:8000/api/v1/specs/', {
      method: 'POST',
      headers,
      body: formData,
    })
    if (!res.ok) throw new Error(await res.text() || 'Failed to upload spec')
    // Refresh specs list
    await fetchRecentSpecs()
    showMetadataModal.value = false
    metadataFile.value = null
    window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Spec uploaded successfully!', type: 'success' } }))
  } catch (e: any) {
    metadataError.value = e.message || 'Failed to upload spec'
    window.dispatchEvent(new CustomEvent('toast', { detail: { message: metadataError.value, type: 'error' } }))
  } finally {
    metadataLoading.value = false
  }
}

const fetchRecentSpecs = async () => {
  const res = await fetch('http://localhost:8000/api/v1/specs/?sort=created_at', {
    headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
  })
  if (res.ok) {
    specs.value = await res.json()
  }
}

const viewDetails = (spec: Spec) => {
  detailsSpec.value = { ...spec }
  showDetailsModal.value = true
  activeDetailsTab.value = 'General'
}
const editSpec = (spec: Spec) => {
  editSpecForm.value = { 
    name: spec.name, 
    version: spec.version, 
    description: (spec as any).description || '' 
  }
  showEditModal.value = true
}
const deleteSpec = (spec: Spec) => {}
const duplicateSpec = (spec: Spec) => {
  duplicateSpecForm.value = { 
    name: spec.name + ' Copy', 
    version: spec.version, 
    description: (spec as any).description || '' 
  }
  showDuplicateModal.value = true
}
const approveSpec = (spec: Spec) => {}
const assignReviewer = (spec: Spec) => {}
const triggerLint = (spec: Spec) => {}
const viewLintResults = (spec: Spec) => {}
const viewVersions = (spec: Spec) => {}
const compareVersions = (spec: Spec) => {}
const closeDetailsModal = () => { showDetailsModal.value = false }
const closeEditModal = () => { showEditModal.value = false }
const openDeleteModal = (spec: Spec) => { detailsSpec.value = { ...spec }; showDeleteModal.value = true }
const closeDeleteModal = () => { showDeleteModal.value = false }
const confirmDeleteSpec = () => { showDeleteModal.value = false }
const openAssignReviewerModal = (spec: Spec) => { detailsSpec.value = { ...spec }; showAssignReviewerModal.value = true }
const closeAssignReviewerModal = () => { showAssignReviewerModal.value = false }
const removeReviewer = (spec: Spec, reviewer: any) => {}
const openLintModal = (spec: Spec) => { detailsSpec.value = { ...spec }; showLintModal.value = true }
const closeLintModal = () => { showLintModal.value = false }
const openVersionModal = (spec: Spec) => { detailsSpec.value = { ...spec }; showVersionModal.value = true }
const closeVersionModal = () => { showVersionModal.value = false }
const compareWithCurrent = (version: any) => {}
const downloadVersion = (version: any) => {}
const openDuplicateModal = (spec: Spec) => {
  duplicateSpecForm.value = { 
    name: spec.name + ' Copy', 
    version: spec.version, 
    description: (spec as any).description || '' 
  }
  showDuplicateModal.value = true
}
const closeDuplicateModal = () => { showDuplicateModal.value = false }
const openApproveModal = (spec: Spec) => { detailsSpec.value = { ...spec }; showApproveModal.value = true }
const closeApproveModal = () => { showApproveModal.value = false }
const confirmApproveSpec = () => { showApproveModal.value = false }
const downloadSpec = (spec: Spec) => {}
const getLintClass = (type: string) => {
  if (type === 'error') return 'text-red-400';
  if (type === 'warning') return 'text-yellow-400';
  if (type === 'info') return 'text-blue-400';
  return 'text-gray-400';
}

const onCreateSpecFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    createSpecFile.value = target.files[0]
  } else {
    createSpecFile.value = null
  }
}

function isValidSemver(version: string) {
  return /^\d+\.\d+\.\d+$/.test(version)
}

const handleCreateSpec = async () => {
  creatingSpec.value = true
  createSpecError.value = ''
  try {
    const projectId = getProjectId()
    if (!createSpecFile.value) {
      createSpecError.value = 'Please select a file.'
      creatingSpec.value = false
      return
    }
    if (!isValidSemver(createSpecForm.value.version)) {
      createSpecError.value = 'Version must be in the format major.minor.patch (e.g. 1.0.0)'
      creatingSpec.value = false
      return
    }
    const formData = new FormData()
    formData.append('file', createSpecFile.value)
    formData.append('name', createSpecForm.value.name)
    formData.append('version', createSpecForm.value.version)
    if (createSpecForm.value.description) {
      formData.append('description', createSpecForm.value.description)
    }
    const res = await fetch(`http://localhost:8000/api/v1/specs/projects/${projectId}/specs`, {
      method: 'POST',
      headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined,
      body: formData
    })
    if (!res.ok) {
      const errorText = await res.text()
      console.log('Create spec error response:', errorText)
      
      // Handle project not found error
      if (res.status === 404 && errorText.includes('Project not found')) {
        createSpecError.value = `Project ID ${projectId} not found. Please use a valid project ID.`
        showProjectError.value = true
        projectError.value = `Project ID ${projectId} not found. Please use a valid project ID.`
        creatingSpec.value = false
        return
      }
      
      throw new Error(errorText || 'Failed to create spec')
    }
    // Refresh specs list
    const specsRes = await fetch(`http://localhost:8000/api/v1/specs/projects/${projectId}/specs`, {
      headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
    })
    if (specsRes.ok) {
      specs.value = await specsRes.json()
    }
    showCreateModal.value = false
    createSpecForm.value = { name: '', version: '', description: '' }
    createSpecFile.value = null
    if (createSpecFileInput.value) createSpecFileInput.value.value = ''
  } catch (e: any) {
    createSpecError.value = e.message || 'Failed to create spec'
  } finally {
    creatingSpec.value = false
  }
}

const handleEditSpec = async () => {
  editingSpec.value = true
  editSpecError.value = ''
  editSpecSuccess.value = false
  try {
    const specId = detailsSpec.value.id
    
    // Add authentication header
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    if (authStore.token && authStore.token !== 'undefined' && authStore.token !== 'null') {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }
    
    const res = await fetch(`http://localhost:8000/api/v1/specs/specs/${specId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(editSpecForm.value)
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(errorText || 'Failed to update spec')
    }
    
    // Refresh specs list
    const projectId = getProjectId()
    const specsRes = await fetch(`http://localhost:8000/api/v1/specs/projects/${projectId}/specs`, {
      headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
    })
    if (specsRes.ok) {
      specs.value = await specsRes.json()
    }
    editSpecSuccess.value = true
    setTimeout(() => {
      showEditModal.value = false
      editSpecSuccess.value = false
    }, 1200)
  } catch (e: any) {
    editSpecError.value = e.message || 'Failed to update spec'
  } finally {
    editingSpec.value = false
  }
}

// Add new refs for metadata modal and file
const showMetadataModal = ref(false)
const metadataForm = ref({
  name: '',
  description: '',
  projectId: '',
  type: '',
  status: 'draft',
})
const metadataFile = ref<File | null>(null)
const metadataLoading = ref(false)
const metadataError = ref('')
</script> 