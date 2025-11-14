<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <!-- Quality Score Breakdown at the very top -->
        <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quality Score Breakdown</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-green-500 mb-2">{{ dashboardData.qualityScore?.approval_rate || 0 }}%</div>
              <div class="text-gray-400">Approval Rate</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-500 mb-2">{{ dashboardData.qualityScore?.completion_rate || 0 }}%</div>
              <div class="text-gray-400">Completion Rate</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-purple-500 mb-2">{{ dashboardData.qualityScore?.pass_rate || 0 }}%</div>
              <div class="text-gray-400">Pass Rate</div>
            </div>
          </div>
        </div>
        <!-- Tab Switcher -->
        <div class="flex space-x-4 mb-8 border-b border-gray-200 dark:border-dark-700">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'px-6 py-3 font-semibold text-lg focus:outline-none transition-colors',
              activeTab === tab.key
                ? 'border-b-4 border-neon-blue text-neon-blue dark:text-neon-blue'
                : 'text-gray-500 dark:text-gray-400 hover:text-neon-blue/80'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Manage Project Tab -->
        <template v-if="activeTab === 'manage'">
          <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Manage Project Content</h2>
          <!-- Project Specifications (add/list) -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6 mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Project Specifications</h2>
              <div class="flex items-center space-x-2">
                <button 
                  @click="loadLinkedContent" 
                  class="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  :disabled="linkedContentLoading"
                  title="Refresh specs list"
                >
                  <svg class="w-4 h-4" :class="{ 'animate-spin': linkedContentLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <span>{{ linkedContentLoading ? 'Refreshing...' : 'Refresh' }}</span>
                </button>
                <button @click="navigateToSpecsWithContext" class="btn-primary">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Add Spec
                </button>
              </div>
            </div>
            <input v-model="specSearchTerm" class="input-field w-full mb-4" placeholder="Search specifications..." />
            
            <!-- Specs will be loaded here -->
            <div v-if="linkedContentLoading" class="text-center py-8">
              <svg class="w-8 h-8 animate-spin mx-auto mb-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-gray-500">Loading specifications...</p>
            </div>
            <div v-else-if="dashboardData.specs.length === 0" class="text-center py-8">
              <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 class="text-xl font-semibold text-gray-400 mb-2">No Specifications Yet</h3>
              <p class="text-gray-500 mb-6">Add specifications to this project to get started</p>
              <button @click="navigateToSpecsWithContext" class="btn-primary">
                Add First Spec
              </button>
            </div>
            <div v-else-if="filteredSpecsList.length === 0" class="text-center py-8">
              <p class="text-gray-400">No specifications match your search.</p>
            </div>
            <div v-else class="space-y-4">
              <div v-for="spec in filteredSpecsList" :key="spec.id" class="border border-gray-200 dark:border-dark-700 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ spec.name || spec.file_name || `Spec ${spec.id}` }}</h3>
                    <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span class="flex items-center">
                        <span class="w-2 h-2 rounded-full mr-2" :class="getStatusColor(spec.status)"></span>
                        {{ spec.status }}
                      </span>
                      <span v-if="spec.reviewer">Reviewed by: {{ spec.reviewer }}</span>
                      <span v-if="spec.timestamp">{{ formatDate(spec.timestamp) }}</span>
                    </div>
                    <p v-if="spec.comments" class="mt-2 text-gray-600 dark:text-gray-300">{{ spec.comments }}</p>
                  </div>
                  <button
                    @click="removeSpecFromProject(spec.id)"
                    class="ml-4 px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center space-x-1"
                    :disabled="removingSpecId === spec.id"
                    title="Remove from project"
                  >
                    <svg v-if="removingSpecId !== spec.id" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{{ removingSpecId === spec.id ? 'Removing...' : 'Remove' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Linked Checklists Section -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6 mb-8">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">✅ Linked Checklists</h2>
              <button 
                @click="openLinkModal('checklist')" 
                class="btn-primary px-4 py-2 text-sm flex items-center space-x-2"
                :disabled="!project"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                <span>Add Checklist</span>
              </button>
            </div>
            <input v-model="checklistSearchTerm" class="input-field w-full mb-2" placeholder="Search linked checklists..." />
            <div v-if="selectedChecklistIds.length" class="mb-2 flex gap-2 items-center">
              <button class="btn-danger px-3 py-1 text-xs" @click="batchUnlinkChecklists">Unlink Selected ({{ selectedChecklistIds.length }})</button>
              <!-- Add batch like button here if needed -->
            </div>
            <RecycleScroller
              :items="filteredLinkedChecklists"
              :item-size="56"
              class="max-h-96 overflow-auto rounded"
              v-slot="{ item: checklist }"
            >
              <li class="flex items-center gap-3 border-b border-dark-800 py-3 px-2 last:border-b-0">
                <input type="checkbox" :checked="selectedChecklistIds.includes(typeof checklist === 'object' && checklist !== null ? checklist.id : checklist)" @change="toggleChecklistSelection(typeof checklist === 'object' && checklist !== null ? checklist.id : checklist)" />
                <span class="text-neon-blue font-medium cursor-pointer hover:underline">
                  {{ typeof checklist === 'object' && checklist !== null ? (checklist.name || `Checklist ${checklist.id}`) : `Checklist ${checklist}` }}
                </span>
                <span class="ml-2 text-yellow-400" v-if="typeof checklist === 'object' && checklist !== null && checklist.liked_by_me">⭐️ You liked this</span>
                <span class="ml-2 text-yellow-400" v-else-if="typeof checklist === 'object' && checklist !== null && (checklist.like_count ?? 0) > 0">⭐️ Liked by {{ checklist.like_count ?? 0 }} people</span>
                <span class="ml-2 text-gray-400" v-else>(No likes)</span>
                <button class="ml-4 btn-secondary px-2 py-1 text-xs" @click="onLikeChecklist(checklist)">
                  {{ typeof checklist === 'object' && checklist !== null && checklist.liked_by_me ? 'Unlike' : 'Like' }}
                </button>
                <button class="ml-2 btn-secondary px-2 py-1 text-xs" @click="onUnlinkChecklist(checklist)">
                  Unlink
                </button>
              </li>
            </RecycleScroller>
            <div v-if="filteredLinkedChecklists.length === 0" class="text-gray-400 text-center py-4">No linked checklists.</div>
          </div>

          <!-- Linked Spec Lints Section -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6 mb-8">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">🔍 Linked Spec Lints</h2>
              <button 
                @click="openSpecLintModal" 
                class="btn-primary px-4 py-2 text-sm flex items-center space-x-2"
                :disabled="!project"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                <span>Add Spec Lint</span>
              </button>
            </div>
            <input v-model="specLintSearchTerm" class="input-field w-full mb-2" placeholder="Search linked spec lints..." />
            <div v-if="selectedSpecLintIds.length" class="mb-2 flex gap-2 items-center">
              <button class="btn-danger px-3 py-1 text-xs" @click="batchUnlinkSpecLints">Unlink Selected ({{ selectedSpecLintIds.length }})</button>
            </div>
            <RecycleScroller
              :items="filteredLinkedSpecLints"
              :item-size="56"
              class="max-h-96 overflow-auto rounded"
              v-slot="{ item: lint }"
            >
              <li class="flex items-center gap-4 border-b border-dark-800 py-3 px-2 last:border-b-0">
                <input 
                  type="checkbox" 
                  :checked="selectedSpecLintIds.includes(typeof lint === 'object' && lint !== null ? lint.id : lint)" 
                  @change="toggleSpecLintSelection(typeof lint === 'object' && lint !== null ? lint.id : lint)"
                  class="flex-shrink-0 w-4 h-4"
                />
                <span class="text-neon-blue font-medium cursor-pointer hover:underline">
                  {{ typeof lint === 'object' && lint !== null ? (lint.name || lint.file_name || `Spec Lint ${lint.id}`) : `Spec Lint ${lint}` }}
                </span>
                <span class="text-yellow-400 text-sm" v-if="typeof lint === 'object' && lint !== null && lint.liked_by_me">⭐️ You liked this</span>
                <span class="text-yellow-400 text-sm" v-else-if="typeof lint === 'object' && lint !== null && (lint.like_count ?? 0) > 0">⭐️ Liked by {{ lint.like_count ?? 0 }} people</span>
                <span class="text-gray-400 text-sm" v-else>(No likes)</span>
                <div class="flex items-center gap-2 ml-auto">
                  <button class="btn-secondary px-3 py-1.5 text-xs" @click="onLikeSpecLint(lint)">
                    {{ typeof lint === 'object' && lint !== null && lint.liked_by_me ? 'Unlike' : 'Like' }}
                  </button>
                  <button class="btn-secondary px-3 py-1.5 text-xs" @click="onUnlinkSpecLint(lint)">
                    Unlink
                  </button>
                </div>
              </li>
            </RecycleScroller>
            <div v-if="filteredLinkedSpecLints.length === 0" class="text-gray-400 text-center py-4">No linked spec lints.</div>
          </div>
        </template>

        <!-- Review Status Tab -->
        <template v-if="activeTab === 'review'">
          <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Review & Quality Status</h2>
          <!-- Specs with Status -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6 mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Specifications with Status</h2>
              <button @click="navigateToSpecsWithContext" class="btn-primary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Spec
              </button>
            </div>
            
            <div v-if="linkedContentLoading" class="text-center py-8">
              <svg class="w-8 h-8 animate-spin mx-auto mb-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-gray-500">Loading specifications...</p>
            </div>
            <div v-else-if="dashboardData.specs.length === 0" class="text-center py-8">
              <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 class="text-xl font-semibold text-gray-400 mb-2">No Specifications Yet</h3>
              <p class="text-gray-500 mb-6">Add specifications to this project to get started</p>
              <button @click="navigateToSpecsWithContext" class="btn-primary">
                Add First Spec
              </button>
            </div>
            <div v-else class="space-y-4">
              <div v-for="spec in dashboardData.specs" :key="spec.id" class="border border-gray-200 dark:border-dark-700 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ spec.name || spec.file_name || `Spec ${spec.id}` }}</h3>
                    <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span class="flex items-center">
                        <span class="w-2 h-2 rounded-full mr-2" :class="getStatusColor(spec.status)"></span>
                        {{ spec.status }}
                      </span>
                      <span v-if="spec.reviewer">Reviewed by: {{ spec.reviewer }}</span>
                      <span v-if="spec.timestamp">{{ formatDate(spec.timestamp) }}</span>
                    </div>
                    <p v-if="spec.comments" class="mt-2 text-gray-600 dark:text-gray-300">{{ spec.comments }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Checklists with Status -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6 mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Checklists with Status</h2>
              <button v-if="project" @click="router.push(`/checklists?project=${project.id}`)" class="btn-primary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Checklist
              </button>
            </div>
            
            <div v-if="dashboardData.checklists.length === 0" class="text-center py-8">
              <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <h3 class="text-xl font-semibold text-gray-400 mb-2">No Checklists Yet</h3>
              <p class="text-gray-500 mb-6">Add checklists to this project to get started</p>
              <button v-if="project" @click="router.push(`/checklists?project=${project.id}`)" class="btn-primary">
                Add First Checklist
              </button>
            </div>
            <div v-else class="space-y-4">
              <div v-for="checklist in dashboardData.checklists" :key="checklist.id" class="border border-gray-200 dark:border-dark-700 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ checklist.name || `Checklist ${checklist.id}` }}</h3>
                    <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span class="flex items-center">
                        <span class="w-2 h-2 rounded-full mr-2" :class="getStatusColor(checklist.status)"></span>
                        {{ checklist.status }}
                      </span>
                      <span v-if="checklist.reviewer">Reviewed by: {{ checklist.reviewer }}</span>
                      <span v-if="checklist.timestamp">{{ formatDate(checklist.timestamp) }}</span>
                    </div>
                    <p v-if="checklist.comments" class="mt-2 text-gray-600 dark:text-gray-300">{{ checklist.comments }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Spec Lints with Status -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6 mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Spec Lints with Status</h2>
              <button v-if="project" @click="router.push(`/speclint?project=${project.id}`)" class="btn-primary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Run Lint
              </button>
            </div>
            
            <div v-if="dashboardData.specLints.length === 0" class="text-center py-8">
              <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3 class="text-xl font-semibold text-gray-400 mb-2">No Spec Lints Yet</h3>
              <p class="text-gray-500 mb-6">Run spec lints to check for issues</p>
              <button v-if="project" @click="router.push(`/speclint?project=${project.id}`)" class="btn-primary">
                Run First Lint
              </button>
            </div>
            <div v-else class="space-y-4">
              <div v-for="lint in dashboardData.specLints" :key="lint.id" class="border border-gray-200 dark:border-dark-700 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ lint.name || `Lint ${lint.id}` }}</h3>
                    <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span class="flex items-center">
                        <span class="w-2 h-2 rounded-full mr-2" :class="getStatusColor(lint.status)"></span>
                        {{ lint.status }}
                      </span>
                      <span v-if="lint.reviewer">Reviewed by: {{ lint.reviewer }}</span>
                      <span v-if="lint.timestamp">{{ formatDate(lint.timestamp) }}</span>
                    </div>
                    <p v-if="lint.comments" class="mt-2 text-gray-600 dark:text-gray-300">{{ lint.comments }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>

  <!-- Add ProjectEditModal -->
  <ProjectEditModal
    v-if="showEditModal && project"
    :project="project"
    @close="closeEditModal"
    @updated="handleProjectUpdated"
  />

  <!-- Link Modal (Reusable for Specs and Checklists) -->
  <LinkModal
    v-if="showLinkModal"
    :type="linkModalType"
    :available-items="linkModalType === 'spec' ? filteredUnlinkedSpecs : filteredUnlinkedChecklists"
    :on-link="linkModalType === 'spec' ? linkSelectedSpec : linkSelectedChecklist"
    :on-close="closeLinkModal"
  />

  <!-- Spec Lint Modal -->
  <Transition name="modal">
    <div v-if="showSpecLintModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click.self="closeSpecLintModal">
      <div class="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-8 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Trigger Spec Lint
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Select a spec from this project to run linting on:
        </p>
        <input 
          v-model="specLintSearch" 
          class="input-field w-full mb-4" 
          placeholder="Search specs..." 
        />
        <div class="max-h-60 overflow-y-auto mb-4">
          <ul>
            <li
              v-for="spec in filteredSpecsForLint"
              :key="spec.id"
              class="py-2 px-2 hover:bg-dark-800 rounded cursor-pointer flex items-center justify-between"
              :class="{ 'bg-dark-800': selectedSpecForLint === spec.id }"
              @click="selectedSpecForLint = spec.id"
            >
              <span>{{ spec.name || spec.file_name || `Spec ${spec.id}` }}</span>
              <span v-if="selectedSpecForLint === spec.id" class="text-neon-blue font-bold ml-2">Selected</span>
            </li>
          </ul>
          <div v-if="filteredSpecsForLint.length === 0" class="text-gray-400 text-center py-4">
            <span v-if="specLintSearch">No specs match your search.</span>
            <span v-else>No specs available in this project. Link a spec first.</span>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button class="btn-secondary" @click="closeSpecLintModal">Cancel</button>
          <button 
            class="btn-primary" 
            :disabled="!selectedSpecForLint" 
            @click="triggerSpecLint(selectedSpecForLint!)"
          >
            Run Lint
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Confirmation Modal -->
  <Transition name="modal">
    <div v-if="showConfirmModal && confirmModalData" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click.self="closeConfirmModal">
      <div class="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all">
        <!-- Icon -->
        <div class="flex items-center justify-center mb-4">
          <div class="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
        </div>
        
        <!-- Title -->
        <h3 class="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
          {{ confirmModalData.title }}
        </h3>
        
        <!-- Message -->
        <p class="text-gray-600 dark:text-gray-400 text-center mb-6">
          {{ confirmModalData.message }}
        </p>
        
        <!-- Buttons -->
        <div class="flex items-center justify-end space-x-3">
          <button
            @click="closeConfirmModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 rounded-lg transition-colors"
          >
            {{ confirmModalData.cancelText || 'Cancel' }}
          </button>
          <button
            @click="handleConfirm"
            class="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            <span>{{ confirmModalData.confirmText || 'Remove' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Toast Notification -->
  <Transition name="toast">
    <div v-if="toastMessage" :class="['fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md', toastError ? 'bg-red-600 text-white' : 'bg-green-600 text-white']">
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
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { onMounted, onBeforeUnmount, onActivated, ref, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore, type Project as BaseProject } from '@/stores/projects'
import ProjectEditModal from '@/components/Projects/ProjectEditModal.vue'
import { useMetadataStore } from '@/stores/metadata'
import { useAuthStore } from '@/stores/auth'
import LinkModal from '@/components/LinkModal.vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import { fetchProjectDashboard } from '@/utils/auth-requests'
import { getLinkedContent, type LinkedSpecification } from '@/utils/spec-linking-api'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const metadataStore = useMetadataStore()
const authStore = useAuthStore()

// Extend the Project type to include optional specs and checklists arrays
interface LinkedSpec {
  id: string | number
  name?: string
  file_name?: string
  liked_by_me?: boolean
  like_count?: number
}
interface LinkedChecklist {
  id: string | number
  name?: string
  liked_by_me?: boolean
  like_count?: number
}

type Project = BaseProject & {
  specs?: LinkedSpec[]
  checklists?: LinkedChecklist[]
}

const project = ref<Project | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Dashboard data types
interface DashboardItem {
  id: string | number
  name?: string
  file_name?: string
  status: string
  reviewer?: string
  timestamp?: string
  comments?: string
}

interface QualityScore {
  overall_score: number
  approval_rate: number
  completion_rate: number
  pass_rate: number
}

// Dashboard data
const dashboardData = ref<{
  specs: DashboardItem[]
  checklists: DashboardItem[]
  specLints: DashboardItem[]
  qualityScore: QualityScore | null
}>({
  specs: [],
  checklists: [],
  specLints: [],
  qualityScore: null
})
const dashboardLoading = ref(false)
const dashboardError = ref<string | null>(null)

// Auto-refresh timer
const autoRefreshTimer = ref<number | null>(null)
const linkedSpecifications = ref<LinkedSpecification[]>([])
const linkedChecklists = ref<any[]>([])
const linkedSpecLints = ref<any[]>([])
const linkedContentLoading = ref(false)
const removingSpecId = ref<string | number | null>(null)

const showEditModal = ref(false)

// Confirmation modal state
const showConfirmModal = ref(false)
const confirmModalData = ref<{
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
} | null>(null)

// Toast notification state
const toastMessage = ref('')
const toastError = ref(false)

const showToast = (message: string, isError = false) => {
  toastMessage.value = message
  toastError.value = isError
  setTimeout(() => {
    toastMessage.value = ''
  }, isError ? 5000 : 3000)
}

const showConfirm = (data: {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
}) => {
  confirmModalData.value = data
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  confirmModalData.value = null
}

const handleConfirm = async () => {
  if (confirmModalData.value?.onConfirm) {
    await confirmModalData.value.onConfirm()
  }
  closeConfirmModal()
}

const selectedFilters = ref({
  platform: '',
  edaTool: '',
  type: '',
  status: ''
})

function handleFilter(key: keyof typeof selectedFilters.value, value: string) {
  selectedFilters.value[key] = selectedFilters.value[key] === value ? '' : value
}

const filteredSpecs = computed(() => {
  // If project.value.specs does not exist, return an empty array
  const specs = (project.value && Array.isArray((project.value as any).specs)) ? (project.value as any).specs : [];
  return specs.filter((spec: any) => {
    return (
      (!selectedFilters.value.platform || spec.platform === selectedFilters.value.platform) &&
      (!selectedFilters.value.edaTool || spec.edaTool === selectedFilters.value.edaTool) &&
      (!selectedFilters.value.type || spec.type === selectedFilters.value.type) &&
      (!selectedFilters.value.status || spec.status === selectedFilters.value.status)
    )
  })
})

const pendingReviewsCount = computed(() => {
  return filteredSpecs.value.filter((spec: any) => spec.status === 'Pending Review').length;
});

const vendorPartnersCount = computed(() => {
  // If specs have a vendor field, count unique vendors
  const vendors = filteredSpecs.value.map((spec: any) => spec.vendor).filter(Boolean);
  return Array.from(new Set(vendors)).length;
});

const qualityScore = computed(() => {
  if (!filteredSpecs.value.length) return 0;
  const passed = filteredSpecs.value.filter((spec: any) => spec.status === 'Passed').length;
  return Math.round((passed / filteredSpecs.value.length) * 100);
});

// Load project details and linked content
const loadProject = async () => {
  const projectId = route.params.id as string
  if (!projectId) {
    error.value = 'Project ID is required'
    return
  }

  loading.value = true
  error.value = null
  try {
    // STEP 1: Load project details
    const projectRes = await fetch(`/api/v1/projects/${projectId}/`, {
      headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
    })
    if (!projectRes.ok) throw new Error(await projectRes.text() || 'Failed to load project')
    const projectData = await projectRes.json()
    project.value = projectData
    
    if (!metadataStore.platforms.length) await metadataStore.fetchMetadata()
    
    // STEP 2: Load linked content FIRST (source of truth for specs)
    await loadLinkedContent()
    
    // STEP 3: Load dashboard data (but preserve specs from linked-content)
    await loadDashboardData(projectId)
    
    // STEP 4: Start auto-refresh (every 30 seconds)
    if (!autoRefreshTimer.value) {
      autoRefreshTimer.value = setInterval(async () => {
        const currentProjectId = project.value?.id || route.params.id
        if (currentProjectId) {
          console.log('🔄 Auto-refreshing linked content...')
          await loadLinkedContent()
        }
      }, 30000) // Every 30 seconds
      console.log('🔄 Auto-refresh started (every 30 seconds)')
    }
    
    // Also do an immediate refresh after 2 seconds to catch newly added specs
    setTimeout(async () => {
      console.log('🔄 Initial delayed refresh...')
      await loadLinkedContent()
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Failed to load project'
    console.error('Error loading project:', err)
  } finally {
    loading.value = false
  }
}

// Load spec lints for project using the correct endpoint
const loadSpecLints = async (projectId: string | number) => {
  try {
    console.log('🔍 Loading spec lints for project:', projectId)
    const response = await fetch(`/api/v1/projects/${projectId}/spec-lints/with-status`, {
      headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
    })
    
    if (!response.ok) {
      console.warn('⚠️ Failed to load spec lints:', response.statusText)
      return []
    }
    
    const specLintsData = await response.json()
    console.log('🔍 Loaded spec lints:', specLintsData)
    
    // Transform the response to match our format
    // The API returns lint results with status, issue count, summary
    const specLintsArray = Array.isArray(specLintsData) ? specLintsData : (specLintsData.results || specLintsData.data || [])
    
    return specLintsArray.map((lint: any) => ({
      id: lint.id || lint.spec_id,
      name: lint.spec_name || lint.name || `Spec Lint ${lint.id}`,
      file_name: lint.file_name,
      status: lint.status || 'pending',
      issue_count: lint.issue_count || lint.issues_count || 0,
      summary: lint.summary || '',
      spec_id: lint.spec_id,
      liked_by_me: lint.liked_by_me || false,
      like_count: lint.like_count || 0,
      type: 'spec_lint'
    }))
  } catch (err: any) {
    console.error('Error loading spec lints:', err)
    return []
  }
}

// Load linked content (specs, checklists, etc.)
const loadLinkedContent = async () => {
  const projectId = project.value?.id || route.params.id
  if (!projectId) {
    console.warn('⚠️ No project ID available')
    return
  }
  
  linkedContentLoading.value = true
  
  try {
    console.log('🔍 Loading linked content for project:', projectId)
    const linkedContent = await getLinkedContent(projectId)
    console.log('🔍 Loaded linked content:', linkedContent)
    
    const specsArray = linkedContent.specs || []
    const checklistsArray = linkedContent.checklists || []
    
    // Load spec lints from the correct endpoint
    const specLintsArray = await loadSpecLints(projectId)
    
    console.log('🔍 Specs found:', specsArray.length)
    console.log('🔍 Checklists found:', checklistsArray.length)
    console.log('🔍 Spec Lints found:', specLintsArray.length)
    
    linkedSpecifications.value = specsArray
    linkedChecklists.value = checklistsArray
    linkedSpecLints.value = specLintsArray
    
    // Map specs to dashboard format
    if (specsArray.length > 0) {
      const mappedSpecs = specsArray.map((spec: any) => ({
        id: spec.id,
        name: spec.name || spec.file_name || `Spec ${spec.id}`,
        file_name: spec.file_name,
        status: spec.status || 'Pending Review',
        reviewer: spec.reviewerName || spec.assigned_to,
        timestamp: spec.uploaded_on || spec.created_at || spec.linked_at,
        comments: spec.description
      }))
      
      // Update dashboardData specs - preserve other data
      dashboardData.value = {
        ...dashboardData.value,
        specs: mappedSpecs
      }
      
      console.log('✅ Updated dashboardData.specs:', dashboardData.value.specs.length)
    } else {
      // Clear specs if none found
      dashboardData.value.specs = []
      console.log('⚠️ No specs in linked content')
    }
    
    await nextTick()
  } catch (err: any) {
    console.error('Error loading linked content:', err)
  } finally {
    linkedContentLoading.value = false
  }
}

// Load dashboard data from all required endpoints
// IMPORTANT: This function should NOT overwrite specs - they come from linked-content only
const loadDashboardData = async (projectId: string) => {
  dashboardLoading.value = true
  dashboardError.value = null
  
  try {
    const data = await fetchProjectDashboard(projectId)
    
    // Preserve specs from linked-content - never overwrite them
    const preservedSpecs = dashboardData.value.specs.length > 0 ? [...dashboardData.value.specs] : []
    
    dashboardData.value = {
      ...data,
      specs: preservedSpecs // Always keep specs from linked-content
    }
    
    console.log('✅ Dashboard data loaded, preserved', preservedSpecs.length, 'specs')
  } catch (err: any) {
    dashboardError.value = err.message || 'Failed to load dashboard data'
    console.error('Dashboard data loading error:', err)
  } finally {
    dashboardLoading.value = false
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400 border border-green-500/30'
    case 'planning':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    case 'completed':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    case 'archived':
      return 'bg-red-500/20 text-red-400 border border-red-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}

// Helper function to get status color for dashboard items
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'passed':
    case 'completed':
      return 'bg-green-500'
    case 'pending':
    case 'in_review':
    case 'review':
      return 'bg-yellow-500'
    case 'rejected':
    case 'failed':
    case 'error':
      return 'bg-red-500'
    case 'draft':
    case 'in_progress':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

// Helper function to format dates
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

const editProject = () => {
  showEditModal.value = true
}

const handleProjectUpdated = async () => {
  showEditModal.value = false
  await loadProject()
}

// Navigate to specs page with project context
const navigateToSpecsWithContext = () => {
  const projectId = project.value?.id || route.params.id
  if (projectId) {
    const projectName = project.value?.name || 'Unknown Project'
    router.push({
      path: '/specs',
      query: {
        projectId: String(projectId),
        projectName: projectName
      }
    })
  } else {
    router.push('/specs')
  }
}

// Navigate to checklists page with project context
const navigateToChecklistsWithContext = () => {
  const projectId = project.value?.id || route.params.id
  if (projectId) {
    const projectName = project.value?.name || 'Unknown Project'
    router.push({
      path: '/checklists',
      query: {
        projectId: String(projectId),
        projectName: projectName
      }
    })
  } else {
    router.push('/checklists')
  }
}

// Navigate to spec lint page with project context
const navigateToSpecLintWithContext = () => {
  const projectId = project.value?.id || route.params.id
  if (projectId) {
    const projectName = project.value?.name || 'Unknown Project'
    router.push({
      path: '/speclint',
      query: {
        project: String(projectId),
        projectId: String(projectId),
        projectName: projectName
      }
    })
  } else {
    router.push('/speclint')
  }
}

const closeEditModal = () => {
  showEditModal.value = false
}

const deleteProject = async () => {
  if (!project.value) return
  
  showConfirm({
    title: 'Delete Project',
    message: `Are you sure you want to delete "${project.value.name}"? This action cannot be undone and will remove all associated data.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    onConfirm: async () => {
      try {
        await projectsStore.deleteProject(project.value!.id)
        showToast('Project deleted successfully!', false)
        router.push('/projects')
      } catch (error: any) {
        console.error('Failed to delete project:', error)
        showToast(error.message || 'Failed to delete project', true)
      }
    }
  })
}

function onMetaChipClick(type: string, value: string) {
  console.log('Clicked', type, value)
  // You can implement filtering or other actions here
}

const specLikes = ref<Record<string, { likedByUser: boolean; likeCount: number }>>({})
const checklistLikes = ref<Record<string, { likedByUser: boolean; likeCount: number }>>({})
// Watch for route changes to reload linked content
watch(() => route.params.id, async (newId) => {
  if (newId) {
    console.log('🔄 Route changed, loading linked content for project:', newId)
    await loadLinkedContent()
  }
}, { immediate: false })

// TODO: Replace with real API calls for likes
onMounted(async () => {
  await loadProject()
  // Always ensure linked content is loaded after project loads
  const projectId = project.value?.id || route.params.id
  if (projectId) {
    console.log('🔄 Ensuring linked content is loaded on mount...')
    // Wait a bit to ensure project is fully loaded
    await nextTick()
    await loadLinkedContent()
  }
  // Mock: populate likes for demo
  specLikes.value = { '1': { likedByUser: true, likeCount: 1 }, '2': { likedByUser: false, likeCount: 3 } }
  checklistLikes.value = { '10': { likedByUser: true, likeCount: 1 }, '11': { likedByUser: false, likeCount: 2 } }
  
  // Listen for project content updates
  window.addEventListener('project-content-updated', handleProjectContentUpdate as EventListener)
})

onActivated(async () => {
  // Refresh when component becomes active (user navigates back)
  if (project.value?.id || route.params.id) {
    console.log('🔄 Component activated, refreshing...')
    await loadLinkedContent()
    
    // Restart auto-refresh
    if (autoRefreshTimer.value) {
      clearInterval(autoRefreshTimer.value)
    }
    autoRefreshTimer.value = setInterval(async () => {
      const currentProjectId = project.value?.id || route.params.id
      if (currentProjectId) {
        console.log('🔄 Auto-refreshing linked content...')
        await loadLinkedContent()
      }
    }, 30000)
  }
})

onBeforeUnmount(() => {
  // Cleanup
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value)
    autoRefreshTimer.value = null
  }
  window.removeEventListener('project-content-updated', handleProjectContentUpdate as EventListener)
})

// Handle project content update events
const handleProjectContentUpdate = async (event: CustomEvent) => {
  const projectId = event.detail?.projectId
  const currentProjectId = route.params.id as string
  if (projectId && String(projectId) === String(currentProjectId)) {
    console.log('🔄 Received project-content-updated event, refreshing...')
    await loadLinkedContent()
  }
}

// Remove spec from project (wrapper function for the remove button)
const removeSpecFromProject = async (specId: string | number) => {
  removingSpecId.value = specId
  try {
    const spec = dashboardData.value.specs.find(s => s.id === specId)
    if (spec) {
      await onUnlinkSpec(spec)
    }
  } finally {
    removingSpecId.value = null
  }
}

// Add empty handlers for like/unlike and unlink actions (to be wired to real API later)
async function onUnlinkSpec(spec: any) {
  if (!project.value) return
  const projectId = project.value.id
  const specId = typeof spec === 'object' && spec !== null ? spec.id : spec
  const specName = typeof spec === 'object' && spec !== null ? (spec.name || spec.file_name || 'spec') : 'spec'
  
  showConfirm({
    title: 'Remove Specification',
    message: `Are you sure you want to remove "${specName}" from this project? This action cannot be undone.`,
    confirmText: 'Remove',
    cancelText: 'Cancel',
    onConfirm: async () => {
      try {
        await fetch(`/api/v1/projects/${projectId}/specs/${specId}`, {
          method: 'DELETE',
          headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
        })
        await loadLinkedContent() // Refresh specs immediately
        showToast(`"${specName}" has been removed from the project successfully.`, false)
      } catch (e: any) {
        showToast(`Failed to remove spec: ${e.message || e}`, true)
      }
    }
  })
}
async function onUnlinkChecklist(checklist: any) {
  if (!project.value) return
  const projectId = project.value.id
  const checklistId = typeof checklist === 'object' && checklist !== null ? checklist.id : checklist
  const checklistName = typeof checklist === 'object' && checklist !== null ? (checklist.name || 'checklist') : 'checklist'
  
  showConfirm({
    title: 'Remove Checklist',
    message: `Are you sure you want to remove "${checklistName}" from this project? This action cannot be undone.`,
    confirmText: 'Remove',
    cancelText: 'Cancel',
    onConfirm: async () => {
      try {
        // Use correct endpoint: DELETE /api/v1/projects/{project_id}/checklists/{checklist_id}/link
        await fetch(`/api/v1/projects/${projectId}/checklists/${checklistId}/link`, {
          method: 'DELETE',
          headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
        })
        await loadLinkedContent() // Refresh linked content instead of full project reload
        showToast(`"${checklistName}" has been removed from the project successfully.`, false)
      } catch (e: any) {
        showToast(`Failed to remove checklist: ${e.message || e}`, true)
      }
    }
  })
}
// Like/unlike handlers will be implemented in Phase 2
async function onLikeSpec(spec: any) {
  if (!project.value) return
  const projectId = project.value.id
  const specId = typeof spec === 'object' && spec !== null ? spec.id : spec
  try {
    if (spec.liked_by_me) {
      await fetch(`/api/v1/projects/specifications/${specId}/like`, {
        method: 'DELETE',
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
    } else {
      await fetch(`/api/v1/projects/specifications/${specId}/like`, {
        method: 'POST',
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
    }
    await loadLinkedContent() // Refresh linked content to update like counts
  } catch (e: any) {
    alert('Failed to update like: ' + (e.message || e))
  }
}
async function onLikeChecklist(checklist: any) {
  if (!project.value) return
  const checklistId = typeof checklist === 'object' && checklist !== null ? checklist.id : checklist
  try {
    if (checklist.liked_by_me) {
      await fetch(`/api/v1/projects/checklists/${checklistId}/like`, {
        method: 'DELETE',
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
    } else {
      await fetch(`/api/v1/projects/checklists/${checklistId}/like`, {
        method: 'POST',
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
    }
    await loadLinkedContent() // Refresh linked content to update like counts
  } catch (e: any) {
    alert('Failed to update like: ' + (e.message || e))
  }
}
async function onUnlinkSpecLint(lint: any) {
  if (!project.value) return
  const projectId = project.value.id
  const lintId = typeof lint === 'object' && lint !== null ? lint.id : lint
  const lintName = typeof lint === 'object' && lint !== null ? (lint.name || lint.file_name || 'spec lint') : 'spec lint'
  
  showConfirm({
    title: 'Remove Spec Lint',
    message: `Are you sure you want to remove "${lintName}" from this project? This action cannot be undone.`,
    confirmText: 'Remove',
    cancelText: 'Cancel',
    onConfirm: async () => {
      try {
        await fetch(`/api/v1/projects/${projectId}/specs/${lintId}`, {
          method: 'DELETE',
          headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
        })
        await loadLinkedContent()
        showToast(`"${lintName}" has been removed from the project successfully.`, false)
      } catch (e: any) {
        showToast(`Failed to remove spec lint: ${e.message || e}`, true)
      }
    }
  })
}
async function onLikeSpecLint(lint: any) {
  if (!project.value) return
  const lintId = typeof lint === 'object' && lint !== null ? lint.id : lint
  try {
    if (lint.liked_by_me) {
      await fetch(`/api/v1/projects/specifications/${lintId}/like`, {
        method: 'DELETE',
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
    } else {
      await fetch(`/api/v1/projects/specifications/${lintId}/like`, {
        method: 'POST',
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
    }
    await loadLinkedContent()
  } catch (e: any) {
    alert('Failed to update like: ' + (e.message || e))
  }
}

const showLinkModal = ref(false)
const linkModalType = ref<'spec' | 'checklist'>('spec')
function openLinkModal(type: 'spec' | 'checklist') {
  linkModalType.value = type
  showLinkModal.value = true
}
function closeLinkModal() {
  showLinkModal.value = false
}

// Spec Lint Modal
const showSpecLintModal = ref(false)
const selectedSpecForLint = ref<string | number | null>(null)
const specLintSearch = ref('')
function openSpecLintModal() {
  showSpecLintModal.value = true
  selectedSpecForLint.value = null
  specLintSearch.value = ''
}
function closeSpecLintModal() {
  showSpecLintModal.value = false
  selectedSpecForLint.value = null
  specLintSearch.value = ''
}

// Filter specs for linting (only show specs that are linked to this project)
const filteredSpecsForLint = computed(() => {
  return linkedSpecifications.value.filter((spec: any) => {
    const name = spec.name || spec.file_name || `Spec ${spec.id}`
    return name.toLowerCase().includes(specLintSearch.value.toLowerCase())
  })
})

// Trigger linting on a spec
async function triggerSpecLint(specId: string | number) {
  if (!project.value) return
  
  try {
    // Try the new specification system endpoint first
    const response = await fetch(`/api/v1/lint-results/speclint/lint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      },
      body: JSON.stringify({ specId: String(specId) })
    })
    
    if (!response.ok) {
      // Fallback to old spec system endpoint
      const oldResponse = await fetch(`/api/v1/specs/${specId}/trigger-lint`, {
        method: 'POST',
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
      
      if (!oldResponse.ok) {
        throw new Error('Failed to trigger linting')
      }
    }
    
    closeSpecLintModal()
    showToast('Linting triggered successfully. Results will appear shortly.', false)
    // Refresh spec lints after a short delay
    setTimeout(async () => {
      await loadLinkedContent()
    }, 2000)
  } catch (e: any) {
    showToast(`Failed to trigger linting: ${e.message || e}`, true)
  }
}

const specSearch = ref('')
const checklistSearch = ref('')
const selectedSpecToLink = ref<string | number | null>(null)
const selectedChecklistToLink = ref<string | number | null>(null)
const allSpecs = ref<LinkedSpec[]>([])
const allChecklists = ref<LinkedChecklist[]>([])

// Fetch all specs and checklists on mount (for linking)
onMounted(async () => {
  loadProject()
  try {
    const specsRes = await fetch('/api/v1/specifications/', { headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined })
    if (specsRes.ok) allSpecs.value = await specsRes.json()
    const checklistsRes = await fetch('/api/v1/checklists/', { headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined })
    if (checklistsRes.ok) allChecklists.value = await checklistsRes.json()
  } catch {}
})

const filteredUnlinkedSpecs = computed(() => {
  const linkedIds = new Set((project.value?.specs ?? project.value?.spec_ids ?? []).map((s: any) => typeof s === 'object' && s !== null ? s.id : s))
  return allSpecs.value.filter(spec => !linkedIds.has(spec.id) && (spec.name?.toLowerCase().includes(specSearch.value.toLowerCase()) || spec.file_name?.toLowerCase().includes(specSearch.value.toLowerCase()) || String(spec.id).includes(specSearch.value)))
})
const filteredUnlinkedChecklists = computed(() => {
  const linkedIds = new Set((project.value?.checklists ?? project.value?.checklist_ids ?? []).map((c: any) => typeof c === 'object' && c !== null ? c.id : c))
  return allChecklists.value.filter(checklist => !linkedIds.has(checklist.id) && (checklist.name?.toLowerCase().includes(checklistSearch.value.toLowerCase()) || String(checklist.id).includes(checklistSearch.value)))
})

async function linkSelectedSpec(item: LinkedSpec) {
  if (!project.value) return
  const projectId = project.value.id
  try {
    await fetch(`/api/v1/projects/${projectId}/specs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      },
      body: JSON.stringify({ specification_id: item.id })
    })
    closeLinkModal()
    await loadProject()
  } catch (e: any) {
    alert('Failed to link spec: ' + (e.message || e))
  }
}
async function linkSelectedChecklist(item: LinkedChecklist) {
  if (!project.value) return
  const projectId = project.value.id
  const checklistId = item.id
  try {
    // Use correct endpoint: POST /api/v1/projects/{project_id}/checklists/{checklist_id}/link
    await fetch(`/api/v1/projects/${projectId}/checklists/${checklistId}/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      }
    })
    closeLinkModal()
    await loadLinkedContent() // Refresh linked content
    showToast(`Checklist "${item.name || `Checklist ${checklistId}`}" has been linked successfully.`, false)
  } catch (e: any) {
    showToast(`Failed to link checklist: ${e.message || e}`, true)
  }
}

const specSearchTerm = ref('')
const checklistSearchTerm = ref('')
const specLintSearchTerm = ref('')

// Filter specs list for Project Specifications section
const filteredSpecsList = computed(() => {
  if (!specSearchTerm.value) {
    return dashboardData.value.specs
  }
  const searchLower = specSearchTerm.value.toLowerCase()
  return dashboardData.value.specs.filter((spec: any) => {
    const name = spec.name || spec.file_name || `Spec ${spec.id}`
    const status = spec.status || ''
    const reviewer = spec.reviewer || ''
    const comments = spec.comments || ''
    return (
      name.toLowerCase().includes(searchLower) ||
      status.toLowerCase().includes(searchLower) ||
      reviewer.toLowerCase().includes(searchLower) ||
      comments.toLowerCase().includes(searchLower)
    )
  })
})

const filteredLinkedSpecs = computed(() => {
  // Combine specs and spec lints from linked content
  const allItems = [
    ...linkedSpecifications.value.map((spec: any) => ({ ...spec, itemType: 'spec' })),
    ...linkedSpecLints.value.map((lint: any) => ({ ...lint, itemType: 'spec_lint' }))
  ]
  
  return allItems.filter((item: any) => {
    const name = typeof item === 'object' && item !== null 
      ? (item.name || item.file_name || `Spec ${item.id}`) 
      : `Spec ${item}`
    return name.toLowerCase().includes(specSearchTerm.value.toLowerCase())
  })
})
const filteredLinkedChecklists = computed(() => {
  // Use linked checklists from linked-content API
  return linkedChecklists.value.filter(checklist => {
    const name = typeof checklist === 'object' && checklist !== null ? (checklist.name || `Checklist ${checklist.id}`) : `Checklist ${checklist}`
    return name.toLowerCase().includes(checklistSearchTerm.value.toLowerCase())
  })
})
const filteredLinkedSpecLints = computed(() => {
  // Use spec lints from linked-content API
  return linkedSpecLints.value.filter(lint => {
    const name = typeof lint === 'object' && lint !== null 
      ? (lint.name || lint.file_name || `Spec Lint ${lint.id}`) 
      : `Spec Lint ${lint}`
    return name.toLowerCase().includes(specLintSearchTerm.value.toLowerCase())
  })
})

const selectedSpecIds = ref<(string | number)[]>([])
const selectedChecklistIds = ref<(string | number)[]>([])
const selectedSpecLintIds = ref<(string | number)[]>([])
function toggleSpecSelection(id: string | number) {
  const idx = selectedSpecIds.value.indexOf(id)
  if (idx === -1) selectedSpecIds.value.push(id)
  else selectedSpecIds.value.splice(idx, 1)
}
function toggleChecklistSelection(id: string | number) {
  const idx = selectedChecklistIds.value.indexOf(id)
  if (idx === -1) selectedChecklistIds.value.push(id)
  else selectedChecklistIds.value.splice(idx, 1)
}
function toggleSpecLintSelection(id: string | number) {
  const idx = selectedSpecLintIds.value.indexOf(id)
  if (idx === -1) selectedSpecLintIds.value.push(id)
  else selectedSpecLintIds.value.splice(idx, 1)
}
async function batchUnlinkSpecs() {
  if (!project.value || !selectedSpecIds.value.length) return
  const projectId = project.value.id
  for (const id of selectedSpecIds.value) {
    await onUnlinkSpec(id)
  }
  selectedSpecIds.value = []
}
async function batchUnlinkChecklists() {
  if (!project.value || !selectedChecklistIds.value.length) return
  const projectId = project.value.id
  for (const id of selectedChecklistIds.value) {
    await onUnlinkChecklist(id)
  }
  selectedChecklistIds.value = []
}
async function batchUnlinkSpecLints() {
  if (!project.value || !selectedSpecLintIds.value.length) return
  const projectId = project.value.id
  for (const id of selectedSpecLintIds.value) {
    await onUnlinkSpecLint(id)
  }
  selectedSpecLintIds.value = []
}

// Tab state for enterprise UX
const tabs = [
  { key: 'manage', label: 'Manage Project' },
  { key: 'review', label: 'Review Status' }
]
const activeTab = ref<string>('manage')
</script>

<style scoped>
/* Modal animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
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
</style> 