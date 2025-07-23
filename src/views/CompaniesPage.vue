<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <!-- Page Header -->
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Companies</h1>
            <p class="text-gray-500 dark:text-gray-400">Manage your organization's companies and subsidiaries</p>
          </div>
          <button 
            @click="openCreateModal"
            class="btn-primary px-6 py-3 text-lg font-semibold shadow-xl animate-glow rounded-xl"
          >
            <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Company
          </button>
        </div>

        <!-- Search Bar -->
        <div class="mb-6">
          <div class="relative max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              class="input-field w-full pl-10 pr-4"
              placeholder="Search companies by name, description, or creator..."
              @input="handleSearch"
            />
            <button 
              v-if="searchQuery"
              @click="clearSearch"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div v-if="searchQuery" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Searching for: "{{ searchQuery }}"
          </div>
        </div>

        <!-- Status Filter Dropdown -->
        <div class="mb-6 max-w-xs">
          <label class="block text-gray-300 text-sm font-medium mb-2">Filter by Status</label>
          <select v-model="statusFilter" @change="handleStatusFilter" class="input-field w-full">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <!-- Loading State (only for initial load) -->
        <div v-if="companiesStore.loading && companiesStore.companies.length === 0" class="flex justify-center items-center py-12">
          <div class="text-center">
            <svg class="w-12 h-12 text-neon-blue animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <p class="text-gray-400">Loading companies...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="companiesStore.error && companiesStore.companies.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 class="text-xl font-semibold text-red-400 mb-2">Failed to Load Companies</h3>
          <p class="text-gray-400 mb-4">{{ companiesStore.error }}</p>
          <button @click="companiesStore.loadCompanies()" class="btn-primary">
            Try Again
          </button>
        </div>

        <!-- Inline loader for filtering/searching -->
        <div v-if="isSearching && (companiesStore.companies.length > 0 || searchResults.length > 0)" class="flex items-center mb-2">
          <svg class="w-5 h-5 text-neon-blue animate-spin mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          <span class="text-gray-400">Filtering companies...</span>
        </div>

        <!-- Companies Table -->
        <div v-else-if="(searchQuery ? searchResults.length > 0 : companiesStore.companies.length > 0)" class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-dark-600/50">
                  <th class="text-left p-6 text-gray-700 dark:text-gray-300 font-semibold">Company Name</th>
                  <th class="text-left p-6 text-gray-700 dark:text-gray-300 font-semibold">Description</th>
                  <th class="text-left p-6 text-gray-700 dark:text-gray-300 font-semibold">Created By</th>
                  <th class="text-left p-6 text-gray-700 dark:text-gray-300 font-semibold">Status</th>
                  <th class="text-left p-6 text-gray-700 dark:text-gray-300 font-semibold">Created</th>
                  <th class="text-left p-6 text-gray-700 dark:text-gray-300 font-semibold">Last Updated By</th>
                  <th class="text-right p-6 text-gray-700 dark:text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="company in filteredCompanies" 
                  :key="company.id"
                  class="border-b border-gray-100 dark:border-dark-600/30 hover:bg-gray-50 dark:hover:bg-dark-800/30 transition-colors"
                >
                  <td class="p-6">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                        <span class="text-white font-semibold text-sm">{{ company.name.charAt(0) }}</span>
                      </div>
                      <div>
                        <h3 class="font-semibold text-gray-900 dark:text-white">{{ company.name }}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">ID: {{ company.id }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-6">
                    <p class="text-gray-700 dark:text-gray-300 max-w-xs truncate">{{ company.description || 'No description' }}</p>
                  </td>
                  <td class="p-6">
                    <p class="text-gray-700 dark:text-gray-300">{{ company.createdBy || (company as any).created_by || 'Unknown' }}</p>
                  </td>
                  <td class="p-6">
                    <span :class="getStatusClass(company.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                      {{ company.status }}
                    </span>
                  </td>
                  <td class="p-6">
                    <p class="text-gray-700 dark:text-gray-300 text-sm">{{ formatDate(company.created_at || '') }}</p>
                  </td>
                  <td class="p-6">
                    <p class="text-gray-700 dark:text-gray-300">
                      {{ (company as any).updatedBy || (company as any).updated_by || '—' }}
                    </p>
                  </td>
                  <td class="p-6">
                    <div class="flex items-center justify-end space-x-2">
                      <button 
                        @click="viewCompany(company)"
                        class="btn-secondary p-2 rounded-lg"
                        title="View Company"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      <button 
                        @click="editCompany(company)"
                        class="btn-secondary p-2 rounded-lg"
                        title="Edit Company"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button 
                        @click="deleteCompany(company)"
                        class="btn-secondary p-2 rounded-lg text-red-400 hover:text-red-300"
                        title="Delete Company"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="searchQuery && searchResults.length === 0 && !isSearching" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <h3 class="text-xl font-semibold text-gray-400 mb-2">No Companies Found</h3>
          <p class="text-gray-500 mb-6">No companies match your search criteria</p>
          <button @click="clearSearch" class="btn-secondary">
            Clear Search
          </button>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="!searchQuery && companiesStore.companies.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <h3 class="text-xl font-semibold text-gray-400 mb-2">No Companies Yet</h3>
          <p class="text-gray-500 mb-6">Create your first company to get started</p>
          <button @click="openCreateModal" class="btn-primary">
            Create First Company
          </button>
        </div>

        <!-- Success Toast -->
        <div v-if="showSuccessToast" class="fixed bottom-4 right-4 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-2xl z-50">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>{{ successMessage }}</span>
          </div>
        </div>

        <!-- Error Toast -->
        <div v-if="showErrorToast" class="fixed bottom-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-2xl z-50">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        </div>
      </main>
    </div>

    <!-- Create/Edit Company Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-800 p-8 rounded-2xl relative w-full max-w-lg shadow-2xl border border-gray-200 dark:border-dark-600">
        <button 
          @click="closeModal"
          class="absolute top-6 right-6 text-gray-400 hover:text-gray-200 text-3xl font-bold"
        >
          &times;
        </button>
        
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {{ isEditing ? 'Edit Company' : 'Create New Company' }}
        </h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">COMPANY NAME *</label>
            <input 
              v-model="form.name"
              type="text"
              placeholder="Enter company name"
              class="input-field w-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 focus:border-blue-500 dark:focus:border-neon-blue transition-colors text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">DESCRIPTION</label>
            <textarea 
              v-model="form.description"
              placeholder="Company description (optional)"
              rows="3"
              class="input-field w-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 focus:border-blue-500 dark:focus:border-neon-blue transition-colors resize-none text-gray-900 dark:text-gray-100"
            ></textarea>
          </div>

          <div v-if="isEditing">
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">STATUS</label>
            <select 
              v-model="form.status"
              class="input-field w-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 focus:border-blue-500 dark:focus:border-neon-blue transition-colors"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              @click="closeModal"
              class="btn-secondary px-6 py-3 rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="submitting"
              class="btn-primary px-8 py-3 rounded-lg font-semibold shadow-xl animate-glow"
            >
              <svg v-if="submitting" class="w-5 h-5 mr-2 animate-spin inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              {{ submitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Company' : 'Create Company') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Company Modal -->
    <div v-if="showViewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-800 p-8 rounded-2xl relative w-full max-w-lg shadow-2xl border border-gray-200 dark:border-dark-600">
        <button 
          @click="closeViewModal"
          class="absolute top-6 right-6 text-gray-400 hover:text-gray-200 text-3xl font-bold"
        >
          &times;
        </button>
        
        <div v-if="selectedCompany" class="space-y-6">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center">
              <span class="text-white font-semibold text-xl">{{ selectedCompany.name.charAt(0) }}</span>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white">{{ selectedCompany.name }}</h2>
              <p class="text-gray-400">Company ID: {{ selectedCompany.id }}</p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">DESCRIPTION</label>
              <p class="text-gray-900 dark:text-gray-100 bg-white dark:bg-dark-700 p-3 rounded-lg">
                {{ selectedCompany.description || 'No description provided' }}
              </p>
            </div>

            <div>
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">STATUS</label>
              <div class="flex items-center gap-3">
                <span :class="getStatusClass(selectedCompany.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                  {{ selectedCompany.status }}
                </span>
              </div>
            </div>

            <div>
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">CREATED BY</label>
              <p class="text-gray-900 dark:text-gray-100">{{ selectedCompany.createdBy || (selectedCompany as any).created_by || 'Unknown' }}</p>
            </div>

            <div>
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">CREATED</label>
              <p class="text-gray-900 dark:text-gray-100">{{ formatDate(selectedCompany.created_at || '') }}</p>
            </div>

            <div v-if="selectedCompany.updatedAt">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">LAST UPDATED</label>
              <p class="text-gray-900 dark:text-gray-100">{{ formatDate(selectedCompany.updatedAt || '') }}</p>
            </div>

            <div v-if="(selectedCompany as any).updatedBy || (selectedCompany as any).updated_by">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">LAST UPDATED BY</label>
              <p class="text-gray-900 dark:text-gray-100">{{ (selectedCompany as any).updatedBy || (selectedCompany as any).updated_by }}</p>
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <button 
              @click="closeViewModal"
              class="btn-secondary px-6 py-3 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-800 p-8 rounded-2xl relative w-full max-w-md shadow-2xl border border-gray-200 dark:border-dark-600">
        <div class="text-center">
          <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Delete Company</h3>
          <p class="text-gray-400 mb-6">
            Are you sure you want to delete <strong class="text-gray-900 dark:text-white">{{ companyToDelete?.name }}</strong>? 
            This action cannot be undone.
          </p>
          
          <div class="flex justify-center space-x-3">
            <button 
              @click="closeDeleteModal"
              class="btn-secondary px-6 py-3 rounded-lg"
            >
              Cancel
            </button>
            <button 
              @click="confirmDelete"
              :disabled="deleting"
              class="btn-primary px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700"
            >
              <svg v-if="deleting" class="w-5 h-5 mr-2 animate-spin inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              {{ deleting ? 'Deleting...' : 'Delete Company' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { onMounted, ref, reactive, computed, watch } from 'vue'
import { useCompaniesStore, type Company, type CreateCompanyData, type UpdateCompanyData } from '@/stores/companies'
import { useRoute } from 'vue-router'

const companiesStore = useCompaniesStore()

// State
const showModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const selectedCompany = ref<Company | null>(null)
const companyToDelete = ref<Company | null>(null)

// Search state
const searchQuery = ref('')
const searchResults = ref<Company[]>([])
const isSearching = ref(false)

// Status filter state
const statusFilter = ref<"active" | "inactive" | "">('')

// Toast state
const showSuccessToast = ref(false)
const showErrorToast = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Form
const form = reactive({
  name: '',
  description: '',
  status: 'active' as 'active' | 'inactive'
})

const route = useRoute()

function syncSearchAndStatusFromRoute() {
  const searchParam = route.query.search as string || ''
  const statusParam = route.query.status as string || ''
  searchQuery.value = searchParam
  statusFilter.value = (statusParam === 'active' || statusParam === 'inactive') ? statusParam : ''
  handleSearch()
}

onMounted(async () => {
  const searchParam = route.query.search as string || ''
  const statusParam = route.query.status as string || ''
  searchQuery.value = searchParam
  statusFilter.value = (statusParam === 'active' || statusParam === 'inactive') ? statusParam : ''
  if (searchQuery.value || statusFilter.value) {
    await handleSearch()
  } else {
    await companiesStore.loadCompanies()
    searchResults.value = companiesStore.companies
  }
})

watch(() => [route.query.search, route.query.status], () => {
  syncSearchAndStatusFromRoute()
})

// Utility functions
const getStatusClass = (status: string) => {
  if (!status) return 'bg-gray-500 text-white border border-gray-500'
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-500 text-white border border-green-500'
    case 'inactive':
      return 'bg-gray-500 text-white border border-gray-500'
    case 'pending':
      return 'bg-yellow-500 text-white border border-yellow-500'
    case 'blocked':
      return 'bg-red-500 text-white border border-red-500'
    default:
      return 'bg-gray-500 text-white border border-gray-500'
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const showToast = (message: string, isError = false) => {
  if (isError) {
    errorMessage.value = message
    showErrorToast.value = true
    setTimeout(() => {
      showErrorToast.value = false
    }, 5000)
  } else {
    successMessage.value = message
    showSuccessToast.value = true
    setTimeout(() => {
      showSuccessToast.value = false
    }, 3000)
  }
}

// Search functions
let searchLoaderTimeout: ReturnType<typeof setTimeout> | null = null
const handleSearch = async () => {
  if (searchLoaderTimeout) clearTimeout(searchLoaderTimeout)
  let loaderShown = false
  searchLoaderTimeout = setTimeout(() => {
  isSearching.value = true
    loaderShown = true
  }, 300)
  try {
    const results = await companiesStore.searchCompanies(searchQuery.value, statusFilter.value)
    searchResults.value = results
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = []
  } finally {
    if (searchLoaderTimeout) clearTimeout(searchLoaderTimeout)
    if (loaderShown) isSearching.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  isSearching.value = false
  handleStatusFilter() // Refresh with just status filter
}

// Status filter functions
let statusLoaderTimeout: ReturnType<typeof setTimeout> | null = null
const handleStatusFilter = async () => {
  if (statusLoaderTimeout) clearTimeout(statusLoaderTimeout)
  let loaderShown = false
  statusLoaderTimeout = setTimeout(() => {
  isSearching.value = true
    loaderShown = true
  }, 300)
  try {
    const results = await companiesStore.searchCompanies(searchQuery.value, statusFilter.value)
    searchResults.value = results
  } catch (error) {
    console.error('Status filter failed:', error)
    searchResults.value = []
  } finally {
    if (statusLoaderTimeout) clearTimeout(statusLoaderTimeout)
    if (loaderShown) isSearching.value = false
  }
}

// Computed property for filtered companies
const filteredCompanies = computed(() =>
  searchResults.value.filter(company =>
    !statusFilter.value ||
    (company.status && company.status.toLowerCase() === statusFilter.value.toLowerCase())
  )
)

// Modal functions
const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

const editCompany = (company: Company) => {
  isEditing.value = true
  selectedCompany.value = company
  form.name = company.name
  form.description = company.description || ''
  form.status = (company.status === 'active' || company.status === 'inactive') ? company.status : 'active'
  showModal.value = true
}

const viewCompany = (company: Company) => {
  selectedCompany.value = company
  showViewModal.value = true
}

const deleteCompany = (company: Company) => {
  companyToDelete.value = company
  showDeleteModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedCompany.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  companyToDelete.value = null
}

const resetForm = () => {
  form.name = ''
  form.description = ''
  form.status = 'active'
  selectedCompany.value = null
}

// Form submission
const handleSubmit = async () => {
  submitting.value = true
  
  try {
    if (isEditing.value && selectedCompany.value) {
      const updateData: UpdateCompanyData = {
        name: form.name,
        description: form.description,
        status: form.status
      }
      await companiesStore.updateCompany(selectedCompany.value.id, updateData)
      showToast('Company updated successfully!')
    } else {
      const createData: CreateCompanyData = {
        name: form.name,
        description: form.description
      }
      await companiesStore.createCompany(createData)
      showToast('Company created successfully!')
    }
    
    closeModal()
  } catch (error: any) {
    console.error('Failed to save company:', error)
    showToast(error.message || 'Failed to save company', true)
  } finally {
    submitting.value = false
  }
}

// Delete confirmation
const confirmDelete = async () => {
  if (!companyToDelete.value) return
  
  deleting.value = true
  
  try {
    await companiesStore.deleteCompany(companyToDelete.value.id)
    showToast('Company deleted successfully!')
    closeDeleteModal()
  } catch (error: any) {
    console.error('Failed to delete company:', error)
    const msg = error.message || ''
    if (msg.includes('Cannot delete company with existing projects')) {
      showToast('Cannot delete company with existing projects. Please delete all projects first.', true)
    } else {
      showToast(msg || 'Failed to delete company', true)
    }
  } finally {
    deleting.value = false
  }
}
</script> 