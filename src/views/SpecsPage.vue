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
        <div class="card bg-dark-900 border border-dark-700 rounded-xl shadow-lg overflow-hidden">
          <div class="px-6 py-3 bg-gradient-to-r from-dark-800 to-dark-700 border-b border-dark-600">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-neon-blue animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                  <svg class="w-4 h-4 text-neon-blue animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 13l5-5m0 0l5 5m-5-5H18"/>
                  </svg>
                </div>
                <span class="text-sm text-gray-300 font-medium">Scrollable Table</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1">
                  <span class="text-xs text-gray-400 animate-pulse">←</span>
                  <span class="text-xs text-gray-400 animate-pulse delay-100">→</span>
                  <span class="text-xs text-gray-400 animate-pulse delay-200">↑</span>
                  <span class="text-xs text-gray-400 animate-pulse delay-300">↓</span>
                </div>
                <span class="text-xs text-gray-400">scroll to explore</span>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-white">Recent Specifications</h2>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-400">{{ specificationsStore.specifications.length }} specifications</span>
              <button 
                v-if="selectedSpecs.length > 0"
                @click="openProjectLinkingModal"
                class="btn-primary px-4 py-2 text-sm"
              >
                Link {{ selectedSpecs.length }} Spec(s) to Project
              </button>
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
          <div v-else class="max-h-[600px] overflow-y-auto relative" ref="tableContainer" style="scrollbar-width: none; -ms-overflow-style: none;">
            <table class="min-w-full text-left bg-dark-900 border border-dark-700 rounded-xl overflow-hidden" style="min-width: 1200px;">
              <thead class="sticky top-0 z-10">
                <tr class="border-b border-dark-700 bg-dark-800">
                  <th class="py-3 px-4 text-gray-200 font-semibold text-center" style="min-width: 50px;">
                    <input 
                      type="checkbox" 
                      :checked="allSpecsSelected"
                      @change="toggleAllSpecs"
                      class="w-4 h-4 text-neon-blue border-gray-300 rounded focus:ring-neon-blue"
                    />
                  </th>
                  <th class="py-3 px-4 text-gray-200 font-semibold" style="min-width: 200px;">Spec Name</th>
                  <th class="py-3 px-4 text-gray-200 font-semibold" style="min-width: 150px;">Uploaded By</th>
                  <th class="py-3 px-4 text-gray-200 font-semibold" style="min-width: 150px;">Uploaded On</th>
                  <th class="py-3 px-4 text-gray-200 font-semibold" style="min-width: 100px;">File Type</th>
                  <th class="py-3 px-4 text-gray-200 font-semibold" style="min-width: 120px;">Status</th>
                  <th class="py-3 px-4 text-gray-200 font-semibold" style="min-width: 120px;">Assigned To</th>
                  <th class="py-3 px-4 text-gray-200 font-semibold text-center" style="min-width: 140px;">Actions</th>
                  <th class="py-3 px-4 text-gray-200 font-semibold" style="min-width: 180px;">Approval Info</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="spec in specificationsStore.specifications" 
                  :key="spec.id" 
                  class="border-b border-dark-800 hover:bg-dark-800/50 transition-colors"
                  :class="{ 'opacity-50': isSpecAlreadyLinked(spec.id) }"
                >
                  <td class="py-3 px-4 text-center">
                    <input 
                      type="checkbox" 
                      :checked="selectedSpecs.includes(spec.id)"
                      @change="toggleSpecSelection(spec.id)"
                      :disabled="isSpecAlreadyLinked(spec.id)"
                      class="w-4 h-4 text-neon-blue border-gray-300 rounded focus:ring-neon-blue"
                      :class="{ 'cursor-not-allowed opacity-50': isSpecAlreadyLinked(spec.id) }"
                      :title="isSpecAlreadyLinked(spec.id) ? 'This spec is already linked to the project' : ''"
                    />
                    <span 
                      v-if="isSpecAlreadyLinked(spec.id)" 
                      class="ml-2 text-xs text-yellow-400"
                      title="Already linked to project"
                    >
                      ✓
                    </span>
                  </td>
                  <td class="py-3 px-4 max-w-xs">
                    <a
                      @click.prevent="handleDownload(spec.id)"
                      class="text-neon-blue hover:underline font-medium cursor-pointer block"
                      :title="spec.name || spec.file_name || 'Unnamed Spec'"
                    >
                      <span class="truncate block max-w-[180px]">
                        {{ formatSpecName(spec.name || spec.file_name || 'Unnamed Spec') }}
                      </span>
                    </a>
                  </td>
                  <td class="py-3 px-4">{{ spec.uploaded_by || '—' }}</td>
                  <td class="py-3 px-4">{{ spec.uploaded_on ? new Date(spec.uploaded_on).toLocaleString() : '—' }}</td>
                  <td class="py-3 px-4 text-sm text-gray-300">
                    {{ getFileTypeLabel(spec.mime_type || spec.file_type || spec.type || '') }}
                  </td>
                  <td class="py-3 px-4">
                    <span 
                      :class="{
                        'text-green-400': spec.status === 'Approved',
                        'text-yellow-400': spec.status === 'Pending Review',
                        'text-red-400': spec.status === 'Rejected'
                      }"
                    >
                      {{ spec.status }}
                    </span>
                  </td>
                  <td class="py-3 px-4">{{ spec.assigned_to || '—' }}</td>
                  <td class="py-3 px-4 text-center">
                    <!-- If spec is linked, show full action set (user can re-approve / re-reject) -->
                    <div
                      v-if="isSpecAlreadyLinked(spec.id)"
                      class="flex items-center justify-center gap-2"
                    >
                      <button
                        class="rounded-full w-9 h-9 flex items-center justify-center bg-dark-800 hover:bg-green-100/10 border border-green-400"
                        @click="updateSpecStatus(spec, 'approved')"
                        :title="spec.status === 'Approved' ? 'Approve again' : 'Approve'"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        class="rounded-full w-9 h-9 flex items-center justify-center bg-dark-800 hover:bg-red-100/10 border border-red-500"
                        @click="updateSpecStatus(spec, 'rejected')"
                        :title="spec.status === 'Rejected' ? 'Reject again' : 'Reject'"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" />
                          <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" stroke-width="2" />
                        </svg>
                      </button>
                      <button
                        class="rounded-full w-9 h-9 flex items-center justify-center bg-dark-800 hover:bg-blue-100/10 border border-blue-400"
                        @click="handleDownload(spec.id)"
                        title="Download"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 11l5 5 5-5M12 4v12" />
                        </svg>
                      </button>
                      <button
                        class="rounded-full w-9 h-9 flex items-center justify-center bg-dark-800 hover:bg-red-100/10 border border-red-500"
                        @click="() => confirmAndDelete(spec.id)"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>

                    <!-- If spec is NOT linked, keep approve/reject disabled but allow download/delete -->
                    <div
                      v-else
                      class="flex flex-col items-center justify-center gap-1"
                      title="Link this spec to a project to enable approve / reject"
                    >
                      <div class="flex items-center gap-2">
                        <!-- Disabled approve/reject buttons -->
                        <button class="rounded-full w-9 h-9 flex items-center justify-center bg-dark-800 border border-gray-600 opacity-50 cursor-not-allowed" disabled>
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button class="rounded-full w-9 h-9 flex items-center justify-center bg-dark-800 border border-gray-600 opacity-50 cursor-not-allowed" disabled>
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" />
                            <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" stroke-width="2" />
                          </svg>
                        </button>
                        <!-- Active download & delete actions are still available -->
                        <button
                          class="rounded-full w-9 h-9 flex items-center justify-center bg-dark-800 hover:bg-blue-100/10 border border-blue-400"
                          @click="handleDownload(spec.id)"
                          title="Download"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 11l5 5 5-5M12 4v12" />
                          </svg>
                        </button>
                        <button
                          class="rounded-full w-9 h-9 flex items-center justify-center bg-dark-800 hover:bg-red-100/10 border border-red-500"
                          @click="() => confirmAndDelete(spec.id)"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </div>
                      <span class="text-[11px] text-gray-400 mt-0.5">
                        Link to a project to approve / reject
                      </span>
                    </div>
                  </td>
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
                </tr>
              </tbody>
            </table>
            <div v-if="!specificationsStore.specifications.length" class="text-center py-8 text-gray-400">
              No specifications uploaded yet. Drag and drop a file above to get started.
            </div>
            
            <!-- Floating Scroll Indicator -->
            <div v-if="showScrollIndicator" class="absolute bottom-4 right-4 bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 shadow-lg z-20 animate-fade-in">
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1">
                  <svg class="w-3 h-3 text-neon-blue animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                  <svg class="w-3 h-3 text-neon-blue animate-bounce delay-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 13l5-5m0 0l5 5m-5-5H18"/>
                  </svg>
                </div>
                <span class="text-xs text-gray-300 font-medium">Scrolling...</span>
              </div>
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
          <!-- Platform Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform (Optional)</label>
            <select
              class="input-field w-full"
              v-model="createSpecForm.platform"
            >
              <option value="">Select Platform</option>
              <option value="TSMC">TSMC</option>
              <option value="Intel">Intel</option>
              <option value="Samsung">Samsung</option>
            </select>
          </div>
          <!-- EDA Tool Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">EDA Tool (Optional)</label>
            <select
              class="input-field w-full"
              v-model="createSpecForm.eda_tool"
            >
              <option value="">Select EDA Tool</option>
              <option value="Calibre">Calibre</option>
              <option value="Innovus">Innovus</option>
              <option value="ICC2">ICC2</option>
            </select>
          </div>
          <!-- Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type (Optional)</label>
            <select
              class="input-field w-full"
              v-model="createSpecForm.type"
            >
              <option value="">Select Type</option>
              <option value="DRC">DRC</option>
              <option value="LVS">LVS</option>
              <option value="STA">STA</option>
              <option value="Layout">Layout</option>
            </select>
          </div>
          <button class="btn-primary w-full py-3 text-lg font-semibold" :disabled="creatingSpec">
            <span v-if="creatingSpec">Creating...</span>
            <span v-else>Create</span>
          </button>
          <div v-if="createSpecError" class="text-red-400 text-center mt-2">{{ createSpecError }}</div>
        </form>
      </div>
    </div>

    <!-- Toast/Alert for feedback -->
    <Transition name="toast">
      <div v-if="toastMessage" :class="['fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in', toastError ? 'bg-red-600 text-white' : 'bg-green-600 text-white']">
        <div v-if="!toastError" class="flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div v-else class="flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="flex-1 font-medium">{{ toastMessage }}</p>
        <button @click="toastMessage = ''" class="flex-shrink-0 hover:opacity-80 transition-opacity">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>

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

  <!-- Project Linking Modal -->
  <div v-if="showProjectLinkingModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ projectContext ? `Add Specifications to ${projectContext.name || 'Unknown Project'}` : 'Link Specifications to Project' }}
        </h2>
        <button @click="closeProjectLinkingModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div class="mb-4">
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            {{ projectContext 
              ? `Add ${selectedSpecs.length} specification(s) to ${projectContext.name || 'Unknown Project'}:`
              : `Select a project to link ${selectedSpecs.length} specification(s) to:`
            }}
          </p>
          
          <!-- Project Selection (only show if no project context) -->
          <div v-if="!projectContext" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Project
            </label>
            <select v-model="selectedProjectId" class="input-field w-full">
              <option value="">Choose a project...</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }} ({{ project.platform }})
              </option>
            </select>
          </div>

          <!-- Project Context Display (only show if project context exists) -->
          <div v-if="projectContext" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Project
            </label>
            <div class="p-3 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span class="text-gray-900 dark:text-white font-medium">{{ projectContext.name || 'Unknown Project' }}</span>
              </div>
            </div>
          </div>

          <!-- Selected Specs Preview -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Specifications to Link
            </label>
            <div class="max-h-32 overflow-y-auto border border-gray-200 dark:border-dark-700 rounded-lg p-3">
              <div v-for="specId in selectedSpecs" :key="specId" class="text-sm text-gray-600 dark:text-gray-400">
                {{ getSpecName(specId) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-dark-700">
        <button @click="closeProjectLinkingModal" class="btn-secondary">
          Cancel
        </button>
        <button
          @click="linkSpecsToProject"
          :disabled="(!projectContext && !selectedProjectId) || linking"
          class="btn-primary"
          :class="{ 'opacity-50 cursor-not-allowed': (!projectContext && !selectedProjectId) || linking }"
        >
          <span v-if="linking" class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Linking...
          </span>
          <span v-else>
            {{ projectContext ? 'Add to Project' : 'Link to Project' }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import SpecificationsFilter from '@/components/Specifications/SpecificationsFilter.vue'
import { onMounted, onActivated, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSpecificationsStore } from '@/stores/specifications'
import { useProjectsStore } from '@/stores/projects'
import { batchLinkSpecsToProject } from '@/utils/spec-linking-api'
import { authenticatedFetch } from '@/utils/auth-requests'

const route = useRoute()
const router = useRouter()
const specificationsStore = useSpecificationsStore()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()

// Multi-selection state
const selectedSpecs = ref<string[]>([])
const showProjectLinkingModal = ref(false)
const selectedProjectId = ref('')
const linking = ref(false)

// Track already-linked specs for the current project
const alreadyLinkedSpecIds = ref<Set<string | number>>(new Set())
const loadingLinkedSpecs = ref(false)

// Enhanced project context with fallback to projects store and API
const projectContext = ref<{ id: string | number; name: string } | null>(null)

// Load project context on route change
const loadProjectContext = async () => {
  // Get projectId and projectName from query params
  let projectId = route.query.projectId as string | undefined
  let projectName = route.query.projectName as string | undefined
  
  // If query params are not available, check the fullPath for query string
  if (!projectId && route.fullPath.includes('projectId=')) {
    const params = new URLSearchParams(route.fullPath.split('?')[1])
    projectId = params.get('projectId') || undefined
    projectName = params.get('projectName') || undefined
  }
  
  console.log('🔍 DEBUG - Route query:', route.query)
  console.log('🔍 DEBUG - Route fullPath:', route.fullPath)
  console.log('🔍 DEBUG - ProjectId:', projectId, 'ProjectName:', projectName)
  console.log('🔍 DEBUG - Route path:', route.path)
  
  // If we have both projectId and projectName, use them directly
  if (projectId && projectName) {
    projectContext.value = { id: projectId, name: projectName }
    console.log('🔍 DEBUG - Using project from query params:', projectContext.value)
    // Also update localStorage for consistency
    localStorage.setItem('lastVisitedProject', JSON.stringify({ id: projectId, name: projectName }))
    return
  }
  
  // If we have projectId but no name, try to get name from multiple sources
  if (projectId && !projectName) {
    console.log('🔍 DEBUG - Have projectId but no name, fetching...')
    
    // Try localStorage first (fastest)
    const storedProject = localStorage.getItem('lastVisitedProject')
    if (storedProject) {
      try {
        const parsed = JSON.parse(storedProject)
        if (parsed.id && String(parsed.id) === String(projectId) && parsed.name && parsed.name !== 'Unknown Project') {
          projectContext.value = { id: projectId, name: parsed.name }
          console.log('🔍 DEBUG - ✅ Using project from localStorage:', projectContext.value)
          return
        }
      } catch (e) {
        console.log('🔍 DEBUG - Error parsing stored project:', e)
      }
    }
    
    // Check projects store
    const projectFromStore = projectsStore.projects.find(p => String(p.id) === String(projectId))
    console.log('🔍 DEBUG - Project from store:', projectFromStore)
    if (projectFromStore && projectFromStore.name && projectFromStore.name !== 'Unknown Project') {
      projectContext.value = { id: projectId, name: projectFromStore.name }
      console.log('🔍 DEBUG - ✅ Using project from store:', projectContext.value)
      localStorage.setItem('lastVisitedProject', JSON.stringify({ id: projectId, name: projectFromStore.name }))
      return
    }
    
    // If not in store, fetch from API (MUST succeed)
    try {
      console.log('🔍 DEBUG - Fetching project from API:', projectId)
      const headers: HeadersInit = {}
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`
      }
      const response = await fetch(`/api/v1/projects/${projectId}/`, { headers })
      if (response.ok) {
        const projectData = await response.json()
        const name = projectData.name || projectData.project_name
        if (name && name !== 'Unknown Project') {
          projectContext.value = { id: projectId, name }
          console.log('🔍 DEBUG - ✅ Fetched project from API:', projectContext.value)
          // Also update localStorage for future use
          localStorage.setItem('lastVisitedProject', JSON.stringify({ id: projectId, name }))
        } else {
          console.error('🔍 DEBUG - ❌ API returned invalid name:', name)
          projectContext.value = { id: projectId, name: 'Unknown Project' }
        }
      } else {
        const errorText = await response.text()
        console.error('🔍 DEBUG - ❌ Failed to fetch project:', response.status, errorText)
        projectContext.value = { id: projectId, name: 'Unknown Project' }
      }
    } catch (error) {
      console.error('🔍 DEBUG - ❌ Error fetching project:', error)
      projectContext.value = { id: projectId, name: 'Unknown Project' }
    }
    return
  }
  
  // If no project context in URL, try to get from localStorage (last visited project)
  if (!projectId) {
    const storedProject = localStorage.getItem('lastVisitedProject')
    console.log('🔍 DEBUG - Stored project:', storedProject)
    if (storedProject) {
      try {
        const parsed = JSON.parse(storedProject)
        console.log('🔍 DEBUG - Parsed project:', parsed)
        if (parsed.id && parsed.name) {
          projectContext.value = { id: parsed.id, name: parsed.name }
          console.log('🔍 DEBUG - Using project from localStorage (no route params):', projectContext.value)
          return
        }
      } catch (e) {
        console.log('🔍 DEBUG - Error parsing stored project:', e)
        // Invalid stored data, ignore
      }
    }
    projectContext.value = null
    return
  }
  
  projectContext.value = null
  console.log('🔍 DEBUG - Final project context:', projectContext.value)
}

// Watch route changes to reload project context (with immediate to load on mount)
watch(() => route.query, async () => {
  console.log('🔍 DEBUG - Route query changed:', route.query)
  await loadProjectContext()
  // When project context changes, reload already-linked specs
  if (projectContext.value?.id) {
    await loadAlreadyLinkedSpecs()
  }
}, { immediate: true, deep: true })

// Also watch the full route to catch all changes
watch(() => route.fullPath, async (newPath) => {
  console.log('🔍 DEBUG - Route fullPath changed:', newPath)
  if (newPath.includes('projectId=')) {
    await loadProjectContext()
    if (projectContext.value?.id) {
      await loadAlreadyLinkedSpecs()
    }
  }
})

// Also watch projects store in case project gets loaded
watch(() => projectsStore.projects, () => {
  if (projectContext.value && projectContext.value.name === 'Unknown Project') {
    const projectFromStore = projectsStore.projects.find(p => String(p.id) === String(projectContext.value?.id))
    if (projectFromStore && projectFromStore.name) {
      projectContext.value.name = projectFromStore.name
      console.log('🔍 DEBUG - Updated project name from store:', projectContext.value)
    }
  }
})

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

// Scroll indicator
const showScrollIndicator = ref(false)
const tableContainer = ref<HTMLElement>()
let scrollTimeout: any = null

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
    const res = await authenticatedFetch('/api/v1/users/?role=reviewer')
    if (res.ok) reviewers.value = await res.json()
  } catch {}
}

const fetchSpecs = async () => {
  loadingSpecs.value = true;
  specsError.value = '';
  try {
    let url = '/api/v1/specifications/';
    if (selectedStatus.value && selectedStatus.value !== 'All Status') {
      url += `?status=${encodeURIComponent(selectedStatus.value)}`;
    }
    const res = await authenticatedFetch(url);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to fetch specifications');
    }
    specs.value = await res.json();
  } catch (e: any) {
    specsError.value = e.message || 'Failed to fetch specifications';
  } finally {
    loadingSpecs.value = false;
  }
}

const fetchStatusOptions = async () => {
  try {
    const res = await authenticatedFetch('/api/v1/specifications/statuses')
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
    const res = await authenticatedFetch(`/api/v1/specifications/${id}/download`)
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
    // Use the store's deleteSpecification method which handles cache invalidation and updates
    await specificationsStore.deleteSpecification(id)
    
    // ✅ CRITICAL: Reload the list to reflect the deletion
    // This ensures the UI shows the updated list without the deleted item
    await specificationsStore.loadSpecifications()
    
    showToast('Specification deleted successfully.')
    
    // Optionally: Dispatch event to refresh dashboard stats if on dashboard
    // This allows the dashboard to refresh its stats if it's listening
    window.dispatchEvent(new CustomEvent('specification-deleted', { detail: { id } }))
  } catch (e: any) {
    // On error, refresh to restore correct state
    await specificationsStore.loadSpecifications()
    showToast(e.message || 'Failed to delete specification', true)
    console.error('Error deleting specification:', e)
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
  // Load project context first
  await loadProjectContext()
  
  // Load already-linked specs if we have project context
  if (projectContext.value?.id) {
    await loadAlreadyLinkedSpecs()
  }
  
  await delayedLoadSpecs()
  fetchReviewers()
  
  // Add scroll event listener after component is mounted
  setTimeout(() => {
    if (tableContainer.value) {
      tableContainer.value.addEventListener('scroll', handleTableScroll)
    }
  }, 100)
})

// Handle table scroll events
const handleTableScroll = () => {
  showScrollIndicator.value = true
  
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
  
  scrollTimeout = setTimeout(() => {
    showScrollIndicator.value = false
  }, 1000)
}

// --- Create Spec Modal Logic ---
const showCreateModal = ref(false)
const allowedExtensions = ['pdf', 'docx', 'ppt', 'xls', 'pptx', 'xlsx'];
const createSpecFile = ref<File | null>(null);
const createSpecForm = ref({ 
  name: '', 
  version: '', 
  description: '', 
  assigned_to: '', 
  status: 'Pending',
  platform: '',
  eda_tool: '',
  type: ''
});
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
  createSpecForm.value = { 
    name: '', 
    version: '', 
    description: '', 
    assigned_to: '', 
    status: 'Pending',
    platform: '',
    eda_tool: '',
    type: ''
  };
  createSpecError.value = '';
}

const toastMessage = ref('');
const toastError = ref(false);

function showToast(message: string, isError = false) {
  toastMessage.value = message;
  toastError.value = isError;
  setTimeout(() => { toastMessage.value = ''; }, 5000); // Show for 5 seconds for success messages
}

async function updateSpecStatus(spec: any, status: string) {
  try {
    // Use the store's method which handles cache invalidation and updates
    if (status === 'approved' || status === 'rejected') {
      await specificationsStore.updateSpecificationStatus(spec.id, status as 'approved' | 'rejected')
      showToast(`Spec marked as ${status}.`)
    } else {
      throw new Error('Invalid status')
    }
  } catch (e: any) {
    showToast(e.message || 'Failed to update status', true)
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
    
    // Add new filter fields if provided
    if (createSpecForm.value.platform) {
      formData.append('platform', createSpecForm.value.platform);
    }
    if (createSpecForm.value.eda_tool) {
      formData.append('eda_tool', createSpecForm.value.eda_tool);
    }
    if (createSpecForm.value.type) {
      formData.append('type', createSpecForm.value.type);
    }
    
    // Use the store's createSpecification method which handles cache invalidation and refresh
    await specificationsStore.createSpecification(formData);
    
    closeCreateModal();
    showToast('Upload successful!');
  } catch (e: any) {
    let errorMsg = e.message || 'Failed to upload specification';
    // Try to parse error message if it's JSON
    try {
      if (typeof errorMsg === 'string' && errorMsg.includes('{')) {
        const parsed = JSON.parse(errorMsg);
        if (parsed.detail) {
          errorMsg = Array.isArray(parsed.detail) 
            ? parsed.detail.map((d: any) => d.msg || d).join(', ')
            : parsed.detail;
        }
      }
    } catch {}
    createSpecError.value = errorMsg;
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

// Format spec name with proper truncation preserving file extension
function formatSpecName(name: string) {
  if (!name) return 'Unnamed Spec';
  
  // If it's a UUID-like string (no extension), return as is
  if (name.length > 20 && !name.includes('.')) {
    return name.substring(0, 16) + '...';
  }
  
  // If it has an extension, preserve it
  const lastDotIndex = name.lastIndexOf('.');
  if (lastDotIndex !== -1) {
    const nameWithoutExt = name.substring(0, lastDotIndex);
    const extension = name.substring(lastDotIndex);
    
    if (nameWithoutExt.length > 12) {
      return nameWithoutExt.substring(0, 12) + '...' + extension;
    }
  }
  
  // If no extension or short name, truncate normally
  if (name.length > 15) {
    return name.substring(0, 15) + '...';
  }
  
  return name;
}

// Multi-selection functionality
const allSpecsSelected = computed(() => {
  // Count only selectable specs (not already linked)
  const selectableSpecs = specificationsStore.specifications.filter(spec => !isSpecAlreadyLinked(spec.id))
  return selectableSpecs.length > 0 && 
         selectedSpecs.value.length === selectableSpecs.length
})

const toggleSpecSelection = (specId: string) => {
  // Check if this spec is already linked to the current project
  const projectId = projectContext.value?.id || selectedProjectId.value
  if (projectId && alreadyLinkedSpecIds.value.has(String(specId))) {
    // Show a message that this spec is already linked
    showToast(`This spec is already linked to ${projectContext.value?.name || 'the project'}. Remove it from the project first.`, true)
    return
  }
  
  const index = selectedSpecs.value.indexOf(specId)
  if (index === -1) {
    selectedSpecs.value.push(specId)
  } else {
    selectedSpecs.value.splice(index, 1)
  }
}

const toggleAllSpecs = () => {
  if (allSpecsSelected.value) {
    selectedSpecs.value = []
  } else {
    // Only select specs that are not already linked
    selectedSpecs.value = specificationsStore.specifications
      .filter(spec => !isSpecAlreadyLinked(spec.id))
      .map(spec => spec.id)
  }
}

// Check if a spec is already linked to the current project
const isSpecAlreadyLinked = (specId: string | number): boolean => {
  const projectId = projectContext.value?.id || selectedProjectId.value
  if (!projectId) return false
  return alreadyLinkedSpecIds.value.has(String(specId))
}

// Load specs that are already linked to the current project
const loadAlreadyLinkedSpecs = async () => {
  const projectId = projectContext.value?.id || selectedProjectId.value
  if (!projectId) {
    alreadyLinkedSpecIds.value = new Set()
    return
  }
  
  loadingLinkedSpecs.value = true
  try {
    const headers: HeadersInit = {}
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }
    
    const response = await fetch(`/api/v1/projects/${projectId}/linked-content`, { headers })
    if (response.ok) {
      const linkedContent = await response.json()
      console.log('🔍 DEBUG - Loaded linked content to check existing links:', linkedContent)
      
      // Filter for specifications and extract IDs
      const linkedSpecs = Array.isArray(linkedContent) 
        ? linkedContent.filter((item: any) => item.type === 'specification')
        : (linkedContent.specs || [])
      
      // Create a Set of linked spec IDs for fast lookup
      alreadyLinkedSpecIds.value = new Set(linkedSpecs.map((spec: any) => String(spec.id)))
      console.log('🔍 DEBUG - Already linked spec IDs:', Array.from(alreadyLinkedSpecIds.value))
    }
  } catch (error) {
    console.error('🔍 DEBUG - Error loading linked specs:', error)
    alreadyLinkedSpecIds.value = new Set()
  } finally {
    loadingLinkedSpecs.value = false
  }
}

const openProjectLinkingModal = async () => {
  if (selectedSpecs.value.length === 0) return
  
  console.log('🔍 DEBUG - Opening project linking modal...')
  console.log('🔍 DEBUG - Current route query:', route.query)
  console.log('🔍 DEBUG - Current projectContext before load:', projectContext.value)
  
  // FIRST: Always check route query params first (most up-to-date)
  await loadProjectContext()
  
  // SECOND: If we still don't have a valid project context, try localStorage
  if (!projectContext.value || (projectContext.value.name === 'Unknown Project')) {
    const storedProject = localStorage.getItem('lastVisitedProject')
    console.log('🔍 DEBUG - localStorage lastVisitedProject:', storedProject)
    
    if (storedProject) {
      try {
        const parsed = JSON.parse(storedProject)
        console.log('🔍 DEBUG - Parsed localStorage project:', parsed)
        if (parsed.id && parsed.name && parsed.name !== 'Unknown Project') {
          // If we have projectContext with ID but wrong name, update it
          if (projectContext.value && String(projectContext.value.id) === String(parsed.id)) {
            projectContext.value.name = parsed.name
            console.log('🔍 DEBUG - ✅ Updated projectContext name from localStorage:', projectContext.value)
          } else if (!projectContext.value) {
            projectContext.value = { id: parsed.id, name: parsed.name }
            console.log('🔍 DEBUG - ✅ Set projectContext from localStorage:', projectContext.value)
          }
        }
      } catch (e) {
        console.log('🔍 DEBUG - Error parsing localStorage:', e)
      }
    }
    
    // If still "Unknown Project", try fetching from API one more time
    if (projectContext.value && projectContext.value.name === 'Unknown Project' && projectContext.value.id) {
      try {
        console.log('🔍 DEBUG - Last attempt: Fetching project name from API for:', projectContext.value.id)
        const headers: HeadersInit = {}
        if (authStore.token) {
          headers['Authorization'] = `Bearer ${authStore.token}`
        }
        const response = await fetch(`/api/v1/projects/${projectContext.value.id}/`, { headers })
        if (response.ok) {
          const projectData = await response.json()
          const name = projectData.name || projectData.project_name
          if (name && name !== 'Unknown Project') {
            projectContext.value.name = name
            console.log('🔍 DEBUG - ✅ Fetched and updated project name:', projectContext.value)
            localStorage.setItem('lastVisitedProject', JSON.stringify({ id: projectContext.value.id, name }))
          }
        }
      } catch (error) {
        console.error('🔍 DEBUG - ❌ Final fetch attempt failed:', error)
      }
    }
  }
  
  console.log('🔍 DEBUG - Final project context after all attempts:', projectContext.value)
  console.log('🔍 DEBUG - Selected specs:', selectedSpecs.value)
  
  // If we still have "Unknown Project", make one final API call before showing modal
  if (projectContext.value && projectContext.value.name === 'Unknown Project' && projectContext.value.id) {
    console.log('🔍 DEBUG - ⚠️ Still have Unknown Project, making final API call...')
    try {
      const headers: HeadersInit = {}
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`
      }
      const response = await fetch(`/api/v1/projects/${projectContext.value.id}/`, { headers })
      if (response.ok) {
        const projectData = await response.json()
        console.log('🔍 DEBUG - API response:', projectData)
        const name = projectData.name || projectData.project_name
        if (name) {
          projectContext.value.name = name
          console.log('🔍 DEBUG - ✅ FINALLY got project name:', projectContext.value)
          localStorage.setItem('lastVisitedProject', JSON.stringify({ id: projectContext.value.id, name }))
        } else {
          console.error('🔍 DEBUG - ❌ API response has no name field:', projectData)
        }
      } else {
        const errorText = await response.text()
        console.error('🔍 DEBUG - ❌ API call failed:', response.status, errorText)
      }
    } catch (error) {
      console.error('🔍 DEBUG - ❌ Final API call error:', error)
    }
  }
  
  // Load projects if not already loaded (needed for dropdown fallback)
  if (projectsStore.projects.length === 0) {
    await projectsStore.loadProjects()
  }
  
  console.log('🔍 DEBUG - Available projects:', projectsStore.projects)
  
  // Pre-populate project if context is available
  if (projectContext.value) {
    selectedProjectId.value = String(projectContext.value.id)
    console.log('🔍 DEBUG - Pre-populated project ID:', selectedProjectId.value)
  } else {
    // Last resort: Check if there's only one project, use it
    if (projectsStore.projects.length === 1) {
      const singleProject = projectsStore.projects[0]
      projectContext.value = { id: singleProject.id, name: singleProject.name }
      selectedProjectId.value = String(singleProject.id)
      console.log('🔍 DEBUG - Using only available project:', projectContext.value)
    }
  }
  
  console.log('🔍 DEBUG - Final projectContext before showing modal:', projectContext.value)
  console.log('🔍 DEBUG - Project name to display:', projectContext.value?.name)
  
  // Load already-linked specs for this project (to disable checkboxes)
  await loadAlreadyLinkedSpecs()
  
  // Only show modal if we have a valid project context (even if name is still Unknown)
  showProjectLinkingModal.value = true
}

const closeProjectLinkingModal = () => {
  showProjectLinkingModal.value = false
  selectedProjectId.value = ''
}

const linkSpecsToProject = async () => {
  const projectId = projectContext.value?.id || selectedProjectId.value
  if (!projectId || selectedSpecs.value.length === 0) return
  
  linking.value = true
  
  try {
    console.log('🔍 DEBUG - Starting link process for project:', projectId, 'specs:', selectedSpecs.value)
    
    // STEP 3: Link each selected specification to the project
    // Call batchLinkSpecsToProject once with all spec IDs (more efficient)
    await batchLinkSpecsToProject(projectId, selectedSpecs.value)
    console.log('🔍 DEBUG - Successfully linked all specs')
    
    // Get the count and project name before clearing
    const specsCount = selectedSpecs.value.length
    const projectName = projectContext.value?.name || projectsStore.projects.find(p => String(p.id) === String(projectId))?.name || 'project'
    
    // Clear selection and close modal
    selectedSpecs.value = []
    closeProjectLinkingModal()
    
    // Show success toast
    showToast(`Successfully linked ${specsCount} specification(s) to ${projectName}!`, false)
    
    // STEP 4: Refresh linked content to get updated list
    // This emits events for the project page to refresh
    await refreshProjectLinkedContent(projectId)
    
    // Update alreadyLinkedSpecIds to include the newly linked specs immediately
    const linkedSpecIds = selectedSpecs.value.map(id => String(id))
    linkedSpecIds.forEach(specId => {
      alreadyLinkedSpecIds.value.add(specId)
    })
    console.log('🔍 DEBUG - Updated alreadyLinkedSpecIds:', Array.from(alreadyLinkedSpecIds.value))
    
    // Small delay to ensure backend has processed the link
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Navigate back to project page after showing success toast (good UX)
    // Wait 1.5 seconds so user can see the success message
    setTimeout(() => {
      router.push(`/projects/${projectId}`).then(() => {
        // Trigger a refresh event after navigation completes
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('project-content-updated', {
            detail: { projectId }
          }))
        }, 500)
      })
    }, 1500)
    
  } catch (error: any) {
    console.error('🔍 DEBUG - Error linking specs:', error)
    showToast(`Failed to link specifications: ${error.message}`, true)
  } finally {
    linking.value = false
  }
}

const getSpecName = (specId: string) => {
  const spec = specificationsStore.specifications.find(s => s.id === specId)
  return spec ? (spec.name || spec.file_name || `Spec ${specId}`) : `Spec ${specId}`
}

// Refresh project's linked content after successful linking
const refreshProjectLinkedContent = async (projectId: string | number) => {
  try {
    // Emit a custom event to notify project details page to refresh
    // This works if the project page is open in another tab/window
    window.dispatchEvent(new CustomEvent('project-content-updated', {
      detail: { projectId }
    }))
    
    // Also emit a storage event (works across tabs)
    localStorage.setItem('project-refresh', JSON.stringify({
      projectId,
      timestamp: Date.now()
    }))
    // Remove it immediately so it triggers on next change
    setTimeout(() => localStorage.removeItem('project-refresh'), 100)
    
  } catch (error: any) {
    // Don't show error to user as the linking was successful
    console.log('🔍 DEBUG - Error refreshing project content:', error)
  }
}

// Computed property for projects
const projects = computed(() => projectsStore.projects)

// Refresh already-linked specs when component becomes active (user navigates back from project page)
onActivated(async () => {
  console.log('🔍 DEBUG - SpecsPage activated, checking for project context')
  await loadProjectContext()
  if (projectContext.value?.id || route.query.projectId) {
    console.log('🔍 DEBUG - Refreshing already-linked specs on activation')
    await loadAlreadyLinkedSpecs()
  }
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.delay-75 {
  animation-delay: 75ms;
}

.delay-100 {
  animation-delay: 100ms;
}

.delay-200 {
  animation-delay: 200ms;
}

.delay-300 {
  animation-delay: 300ms;
}

/* Hide scrollbar for webkit browsers */
.overflow-y-auto::-webkit-scrollbar {
  display: none;
}

.overflow-y-auto {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Toast animations */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style> 