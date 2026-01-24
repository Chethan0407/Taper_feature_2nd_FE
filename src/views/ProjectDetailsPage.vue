<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <!-- Loading State -->
        <div v-if="loading && !project" class="flex items-center justify-center min-h-[60vh]">
          <div class="text-center">
            <svg class="w-12 h-12 animate-spin mx-auto mb-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-500 dark:text-gray-400">Loading project...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error && !project" class="card bg-white dark:bg-dark-900 border border-red-500 dark:border-red-500 rounded-2xl shadow-lg p-6 mb-8">
          <div class="text-center py-8">
            <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Project</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">{{ error }}</p>
            <div class="flex items-center justify-center gap-3">
              <button 
                v-if="!error.includes('expired') && !error.includes('session')"
                @click="loadProject" 
                class="btn-primary"
              >
                Retry
              </button>
              <button 
                v-if="error.includes('expired') || error.includes('session')"
                @click="goToLogin" 
                class="btn-primary"
              >
                Go to Login
              </button>
              <button 
                @click="refreshPage" 
                class="btn-secondary"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>

        <!-- Project Content - Show if project exists OR if we have route params (fallback) -->
        <template v-if="project || route.params.id">
        <!-- Quality Score Breakdown at the very top -->
        <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6 mb-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Quality Score Breakdown</h2>
            <button 
              @click="refreshQualityScore"
              class="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              :disabled="qualityScoreLoading"
              title="Refresh quality score"
            >
              <svg class="w-4 h-4" :class="{ 'animate-spin': qualityScoreLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span>{{ qualityScoreLoading ? 'Refreshing...' : 'Refresh' }}</span>
            </button>
          </div>
          <!-- Debug info (remove in production) -->
          <div v-if="!qualityScoreLoading && qualityScoreFetchedOnce && dashboardData.qualityScore === null" class="text-sm text-yellow-500 mb-2">
            ⚠️ Quality score not loaded yet or API returned error
          </div>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-green-500 mb-2">
                {{ dashboardData.qualityScore ? dashboardData.qualityScore.spec_approval_rate.toFixed(1) : '0.0' }}%
              </div>
              <div class="text-gray-400">Approval Rate</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-500 mb-2">
                {{ dashboardData.qualityScore ? dashboardData.qualityScore.checklist_completion_rate.toFixed(1) : '0.0' }}%
              </div>
              <div class="text-gray-400">Completion Rate</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-purple-500 mb-2">
                {{ dashboardData.qualityScore ? dashboardData.qualityScore.lint_pass_rate.toFixed(1) : '0.0' }}%
              </div>
              <div class="text-gray-400">Pass Rate</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-amber-500 mb-2">
                {{ dashboardData.qualityScore ? dashboardData.qualityScore.overall_score.toFixed(1) : '0.0' }}%
          </div>
              <div class="text-gray-400">Overall Score</div>
        </div>
        </div>
        </div>
        <!-- Manage Project Content -->
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
            <!-- WHY: v-if must be on same level as v-else-if, Transition breaks the chain -->
            <div v-if="linkedContentLoading" class="text-center py-8">
              <Transition name="fade">
                <div>
                  <svg class="w-8 h-8 animate-spin mx-auto mb-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p class="text-gray-500">Loading specifications...</p>
                </div>
              </Transition>
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
            <!-- Specs list with internal scroll so page height doesn't keep growing -->
            <div v-else class="max-h-[420px] overflow-y-auto pr-1 space-y-4">
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
                  <div class="flex items-center ml-4">
                  <button
                    @click="removeSpecFromProject(spec.id)"
                      class="px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center space-x-1"
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
          </div>

          <!-- Linked Checklists Section -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6 mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">✅ Linked Checklists</h2>
              <button 
                @click="openLinkModal('checklist')" 
                class="btn-primary px-4 py-2 text-sm flex items-center space-x-2"
                :disabled="!project && !route.params.id"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                <span>Add Checklist</span>
              </button>
            </div>
            <input v-model="checklistSearchTerm" class="input-field w-full mb-4" placeholder="Search linked checklists..." />
            
            <!-- Loading State -->
            <!-- WHY: v-if must be on same level as v-else-if, Transition breaks the chain -->
            <div v-if="linkedContentLoading" class="text-center py-8">
              <Transition name="fade">
                <div>
                  <svg class="w-8 h-8 animate-spin mx-auto mb-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p class="text-gray-500">Loading checklists...</p>
                </div>
              </Transition>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredLinkedChecklists.length === 0" class="text-center py-8">
              <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <h3 class="text-xl font-semibold text-gray-400 mb-2">No Linked Checklists</h3>
              <p class="text-gray-500 mb-6">Add checklists to this project to get started</p>
              <button 
                @click="openLinkModal('checklist')" 
                class="btn-primary"
                :disabled="!project && !route.params.id"
              >
                Add First Checklist
                </button>
            </div>

            <!-- Checklist list with internal scroll so page height doesn't keep growing -->
            <div v-else class="max-h-[420px] overflow-y-auto pr-1 space-y-4">
              <div 
                v-for="checklist in filteredLinkedChecklists" 
                :key="checklist.id" 
                class="border border-gray-200 dark:border-dark-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        {{ typeof checklist === 'object' && checklist !== null ? (checklist.name || `Checklist ${checklist.id}`) : `Checklist ${checklist}` }}
                      </h3>
                      <!-- Status Badge with Icon -->
                      <span 
                        v-if="typeof checklist === 'object' && checklist !== null && checklist.status" 
                        :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getChecklistStatusBadgeClass(checklist.status)]"
                      >
                        <svg 
                          v-if="checklist.status === 'approved'" 
                          class="w-3 h-3 mr-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                        <svg 
                          v-else-if="checklist.status === 'declined'" 
                          class="w-3 h-3 mr-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                        <span class="w-1.5 h-1.5 mr-1 rounded-full" v-else :class="getStatusColor(checklist.status)"></span>
                        {{ checklist.status.charAt(0).toUpperCase() + checklist.status.slice(1) }}
                      </span>
            </div>
                    <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <!-- Show "Already Approved" text if approved -->
                      <span 
                        v-if="typeof checklist === 'object' && checklist !== null && checklist.status === 'approved'" 
                        class="flex items-center text-green-600 dark:text-green-400 font-medium"
                      >
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Already Approved
                </span>
                    </div>
                  </div>
                  <div class="flex items-center ml-4 gap-2">
                    <!-- Approve Button (only show if status is not "approved") -->
                    <button 
                      v-if="typeof checklist === 'object' && checklist !== null && checklist.status !== 'approved'"
                      @click="onApproveChecklist(checklist)"
                      class="px-3 py-1 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors flex items-center space-x-1"
                      :disabled="approvingChecklistId === (typeof checklist === 'object' && checklist !== null ? checklist.id : checklist) || rejectingChecklistId === (typeof checklist === 'object' && checklist !== null ? checklist.id : checklist)"
                      title="Approve checklist"
                    >
                      <svg v-if="approvingChecklistId !== (typeof checklist === 'object' && checklist !== null ? checklist.id : checklist)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{{ approvingChecklistId === (typeof checklist === 'object' && checklist !== null ? checklist.id : checklist) ? 'Approving...' : 'Approve' }}</span>
                  </button>
                    <!-- Reject Button (only show if status is not "declined" and not "approved") -->
                    <button 
                      v-if="typeof checklist === 'object' && checklist !== null && checklist.status !== 'declined' && checklist.status !== 'approved'"
                      @click="onRejectChecklist(checklist)"
                      class="px-3 py-1 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors flex items-center space-x-1"
                      :disabled="rejectingChecklistId === (typeof checklist === 'object' && checklist !== null ? checklist.id : checklist) || approvingChecklistId === (typeof checklist === 'object' && checklist !== null ? checklist.id : checklist)"
                      title="Reject checklist"
                    >
                      <svg v-if="rejectingChecklistId !== (typeof checklist === 'object' && checklist !== null ? checklist.id : checklist)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{{ rejectingChecklistId === (typeof checklist === 'object' && checklist !== null ? checklist.id : checklist) ? 'Rejecting...' : 'Reject' }}</span>
                    </button>
                    <!-- Unlink Button -->
                    <button 
                      @click="onUnlinkChecklist(checklist)"
                      class="px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center space-x-1"
                      :disabled="removingChecklistId === (typeof checklist === 'object' && checklist !== null ? checklist.id : checklist)"
                      title="Remove from project"
                    >
                      <svg v-if="removingChecklistId !== (typeof checklist === 'object' && checklist !== null ? checklist.id : checklist)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{{ removingChecklistId === (typeof checklist === 'object' && checklist !== null ? checklist.id : checklist) ? 'Removing...' : 'Unlink' }}</span>
                  </button>
                </div>
          </div>
                </div>
          </div>
          </div>

          <!-- Linked Spec Lints Section -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6 mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Linked Spec Lints</h2>
              <div class="flex items-center space-x-2">
                <button 
                  @click="loadLinkedContent" 
                  class="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  :disabled="linkedContentLoading"
                  title="Refresh lint results"
                >
                  <svg class="w-4 h-4" :class="{ 'animate-spin': linkedContentLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <span>{{ linkedContentLoading ? 'Refreshing...' : 'Refresh' }}</span>
                </button>
                <button 
                  @click="openLinkLintModal" 
                  class="btn-primary"
                >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                  Link Lint Result
              </button>
              </div>
            </div>
            
            <!-- Loading State -->
            <div v-if="linkedContentLoading" class="text-center py-8">
              <svg class="w-8 h-8 animate-spin mx-auto mb-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-gray-500">Loading lint results...</p>
            </div>
            
            <!-- Empty State -->
            <div v-else-if="linkedSpecLints.length === 0" class="text-center py-8">
              <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3 class="text-xl font-semibold text-gray-400 mb-2">No lint results yet</h3>
              <p class="text-gray-500 mb-6">Link lint results to this project to track spec linting status</p>
              <button 
                @click="openLinkLintModal" 
                class="btn-primary"
              >
                Link Lint Result
              </button>
            </div>
            
            <!-- Lint Results List with internal scroll so page height doesn't keep growing -->
            <div v-else class="max-h-[420px] overflow-y-auto pr-1 space-y-4">
              <div 
                v-for="lint in linkedSpecLints" 
                :key="lint.id" 
                class="border border-gray-200 dark:border-dark-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="flex items-start gap-3 flex-1 cursor-pointer" @click="openLintDetail(lint)">
                    <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  <div class="flex-1">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {{ lint.summary || lint.spec_name || lint.name || `Lint Result #${lint.id}` }}
                      </h3>
                      <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span v-if="lint.issues_count !== undefined" class="font-medium">{{ lint.issues_count }} issues</span>
                        <span v-if="lint.spec_id" class="text-gray-500 dark:text-gray-500">Spec ID: {{ lint.spec_id }}</span>
                        <span v-if="lint.created_at" class="text-gray-500 dark:text-gray-500">
                          Created: {{ formatDateShort(lint.created_at) }}
                      </span>
                    </div>
                      <span 
                        v-if="lint.status"
                        :class="['inline-block px-3 py-1 rounded text-xs font-medium capitalize', getLintStatusBadge(lint.status)]"
                      >
                        {{ lint.status }}
                      </span>
                  </div>
                </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <button
                      @click.stop="openLintDetail(lint)"
                      class="px-3 py-1 text-sm text-blue-600 dark:text-neon-blue hover:text-blue-700 dark:hover:text-neon-blue/80 rounded-lg transition-colors"
                    >
                      View
                    </button>
                    <button
                      @click.stop="onUnlinkLintResult(lint)"
                      :disabled="removingLintId === lint.id"
                      class="px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center space-x-1"
                      title="Unlink from project"
                    >
                      <svg v-if="removingLintId !== lint.id" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{{ removingLintId === lint.id ? 'Unlinking...' : 'Unlink' }}</span>
                    </button>
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

  <!-- Link Lint Result Modal -->
  <div 
    v-if="showLinkLintModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
    @click.self="closeLinkLintModal"
  >
    <div class="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Link Lint Result</h3>
        <button @click="closeLinkLintModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
      <div v-if="lintResultsLoading" class="text-center py-8">
        <svg class="w-8 h-8 animate-spin mx-auto mb-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
        <p class="text-gray-500">Loading lint results...</p>
            </div>

      <div v-else>
        <input 
          v-model="lintResultSearch"
          type="text"
          class="input-field w-full mb-4"
          placeholder="Search lint results by ID, summary, or spec ID..."
        />

        <div v-if="filteredLintResults.length === 0" class="text-center py-8">
          <div v-if="lintResultError" class="mb-4">
            <svg class="w-12 h-12 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-red-500 dark:text-red-400 font-medium mb-4">{{ lintResultError }}</p>
            <div class="flex items-center justify-center gap-3">
              <button 
                @click="goToSpecLintPage" 
                class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                Go to SpecLint Page
              </button>
              <button 
                @click="loadAvailableLintResults" 
                class="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
          <div v-else class="text-gray-500">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p v-if="lintResultSearch" class="font-medium">No lint results match your search.</p>
            <p v-else class="font-medium">No lint results available to link.</p>
            <p class="text-sm mt-2 mb-4">Run linting on a spec first to create lint results.</p>
            <button 
              @click="goToSpecLintPage" 
              class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 mx-auto"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              Go to SpecLint Page
            </button>
          </div>
        </div>

        <div v-else class="space-y-3 max-h-96 overflow-y-auto">
          <div
            v-for="lint in filteredLintResults"
            :key="lint.id"
            :class="[
              'border rounded-lg p-4 cursor-pointer transition-colors',
              selectedLintResultId === lint.id
                ? 'border-neon-blue bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-800'
            ]"
            @click="selectedLintResultId = lint.id"
          >
            <div class="flex items-start gap-3">
              <input
                type="radio"
                :checked="selectedLintResultId === lint.id"
                @change="selectedLintResultId = lint.id"
                class="mt-1"
              />
                  <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h4 class="font-semibold text-gray-900 dark:text-white">Lint Result #{{ lint.id }}</h4>
                  <span v-if="lint.spec_id" class="text-xs text-gray-500 dark:text-gray-400">
                    Spec ID: {{ lint.spec_id }}
                      </span>
                    </div>
                <p v-if="lint.summary" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {{ lint.summary }}
                </p>
                <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span v-if="lint.created_at">
                    Created: {{ formatDateShort(lint.created_at) }}
                  </span>
                  <span v-if="lint.issues && lint.issues.length">
                    {{ lint.issues.length }} issues
                  </span>
                </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

      <div v-if="lintResultError" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p class="text-sm text-red-600 dark:text-red-400">{{ lintResultError }}</p>
      </div>

      <div class="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-dark-700">
        <button @click="closeLinkLintModal" class="btn-secondary">Cancel</button>
        <button
          @click="linkSelectedLintResult"
          :disabled="!selectedLintResultId || linkingLintResult"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ linkingLintResult ? 'Linking...' : 'Link Lint Result' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Lint Detail Modal -->
  <Transition name="modal">
    <div 
      v-if="showLintDetailModal && selectedLintResult" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" 
      @click.self="closeLintDetailModal"
    >
      <div class="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <!-- Header -->
            <div class="flex items-center justify-between mb-6">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ selectedLintResult.spec_name || selectedLintResult.name || `Spec Lint ${selectedLintResult.id}` }}
              </h3>
              <span 
                :class="['px-3 py-1 rounded text-sm font-medium', getLintStatusBadge(selectedLintResult.status)]"
              >
                {{ selectedLintResult.status || 'Pending' }}
              </span>
            </div>
            <p v-if="selectedLintResult.created_at" class="text-sm text-gray-500 dark:text-gray-400">
              Created: {{ formatDate(selectedLintResult.created_at) }}
            </p>
          </div>
          <button @click="closeLintDetailModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
        <!-- Loading State -->
        <div v-if="lintDetailLoading" class="text-center py-8">
          <svg class="w-8 h-8 animate-spin mx-auto mb-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
          <p class="text-gray-500">Loading lint details...</p>
            </div>

        <!-- Detail Content -->
        <div v-else-if="lintDetailData">
          <!-- Summary Section -->
          <div class="mb-6 p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Summary</h4>
            <div class="flex items-center gap-4 text-sm">
              <span class="text-red-500 font-medium">
                {{ lintDetailData.summary?.error || 0 }} errors
              </span>
              <span class="text-yellow-500 font-medium">
                {{ lintDetailData.summary?.warning || 0 }} warnings
              </span>
              <span class="text-blue-500 font-medium">
                {{ lintDetailData.summary?.info || 0 }} info
              </span>
            </div>
          </div>

          <!-- Issues List -->
          <div class="mb-6">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Issues</h4>
            
            <!-- Errors -->
            <div v-if="lintDetailData.issues?.filter((i: any) => i.severity === 'error').length" class="mb-4">
              <h5 class="text-red-400 font-medium mb-2">Errors</h5>
              <div class="space-y-2">
                <div 
                  v-for="(issue, idx) in lintDetailData.issues.filter((i: any) => i.severity === 'error')" 
                  :key="idx"
                  class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <div class="flex items-start justify-between">
                  <div class="flex-1">
                      <p class="text-sm font-medium text-red-400">{{ issue.type }}</p>
                      <p class="text-sm text-gray-300 mt-1">{{ issue.message }}</p>
                      <p v-if="issue.location && issue.location.line" class="text-xs text-gray-400 mt-1">
                        Line {{ issue.location.line }}{{ issue.location.column ? `, Column ${issue.location.column}` : '' }}
                      </p>
                      <p v-if="issue.recommendation" class="text-xs text-blue-400 mt-1">
                        💡 {{ issue.recommendation }}
                      </p>
                    </div>
                    <span :class="['px-2 py-1 rounded text-xs font-medium', getSeverityBadge(issue.severity)]">
                      {{ issue.severity }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            <!-- Warnings -->
            <div v-if="lintDetailData.issues?.filter((i: any) => i.severity === 'warning').length" class="mb-4">
              <h5 class="text-yellow-400 font-medium mb-2">Warnings</h5>
              <div class="space-y-2">
                <div 
                  v-for="(issue, idx) in lintDetailData.issues.filter((i: any) => i.severity === 'warning')" 
                  :key="idx"
                  class="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <p class="text-sm font-medium text-yellow-400">{{ issue.type }}</p>
                      <p class="text-sm text-gray-300 mt-1">{{ issue.message }}</p>
                      <p v-if="issue.location && issue.location.line" class="text-xs text-gray-400 mt-1">
                        Line {{ issue.location.line }}{{ issue.location.column ? `, Column ${issue.location.column}` : '' }}
                      </p>
                      <p v-if="issue.recommendation" class="text-xs text-blue-400 mt-1">
                        💡 {{ issue.recommendation }}
                      </p>
            </div>
                    <span :class="['px-2 py-1 rounded text-xs font-medium', getSeverityBadge(issue.severity)]">
                      {{ issue.severity }}
                    </span>
          </div>
                </div>
    </div>
  </div>

            <!-- Info -->
            <div v-if="lintDetailData.issues?.filter((i: any) => i.severity === 'info').length" class="mb-4">
              <h5 class="text-blue-400 font-medium mb-2">Info</h5>
              <div class="space-y-2">
                <div 
                  v-for="(issue, idx) in lintDetailData.issues.filter((i: any) => i.severity === 'info')" 
                  :key="idx"
                  class="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <p class="text-sm font-medium text-blue-400">{{ issue.type }}</p>
                      <p class="text-sm text-gray-300 mt-1">{{ issue.message }}</p>
                      <p v-if="issue.location && issue.location.line" class="text-xs text-gray-400 mt-1">
                        Line {{ issue.location.line }}{{ issue.location.column ? `, Column ${issue.location.column}` : '' }}
                      </p>
                      <p v-if="issue.recommendation" class="text-xs text-blue-400 mt-1">
                        💡 {{ issue.recommendation }}
                      </p>
                    </div>
                    <span :class="['px-2 py-1 rounded text-xs font-medium', getSeverityBadge(issue.severity)]">
                      {{ issue.severity }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!lintDetailData.issues || lintDetailData.issues.length === 0" class="text-center py-8 text-gray-400">
              No issues found
            </div>
          </div>

          <!-- Review Section -->
          <div v-if="selectedLintResult.reviewer_info || selectedLintResult.review_comment" class="mb-6 p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Review</h4>
            <div v-if="selectedLintResult.reviewer_info" class="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Reviewer: {{ selectedLintResult.reviewer_info.name }} ({{ selectedLintResult.reviewer_info.email }})
            </div>
            <div v-if="selectedLintResult.review_comment" class="text-sm text-gray-700 dark:text-gray-300">
              {{ selectedLintResult.review_comment }}
            </div>
            <div v-if="selectedLintResult.review_timestamp" class="text-xs text-gray-400 mt-2">
              {{ formatDate(selectedLintResult.review_timestamp) }}
            </div>
          </div>

          <!-- Add Comment Section -->
          <div class="mb-6">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Add Comment</h4>
            <textarea 
              v-model="newComment"
              class="input-field w-full min-h-[100px] mb-3"
              placeholder="Enter your review comment..."
            ></textarea>
            <button 
              @click="submitComment"
              :disabled="!newComment.trim() || commentSubmitting"
              class="btn-primary px-4 py-2 text-sm"
            >
              {{ commentSubmitting ? 'Submitting...' : 'Submit Comment' }}
            </button>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-dark-700">
            <button 
              @click="reRunLint(selectedLintResult.spec_id)"
              class="btn-primary px-4 py-2 text-sm"
            >
              Re-run Lint
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

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
import { fetchProjectDashboard, authenticatedFetch } from '@/utils/auth-requests'
import { apiClient, parseApiError } from '@/utils/api-client'
import { getLinkedContent, type LinkedSpecification } from '@/utils/spec-linking-api'
import { validateToken, isTokenExpired } from '@/utils/token-utils'

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
  spec_approval_rate: number
  checklist_completion_rate: number
  lint_pass_rate: number
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
// Dedicated loading flag for quality score to avoid warning flicker while fetching
const qualityScoreLoading = ref(false)
// Track that we attempted at least one fetch; prevents warning on first render
const qualityScoreFetchedOnce = ref(false)

// Auto-refresh timer
const autoRefreshTimer = ref<number | null>(null)
const linkedSpecifications = ref<LinkedSpecification[]>([])
const linkedChecklists = ref<any[]>([])
const linkedSpecLints = ref<any[]>([])
const linkedContentLoading = ref(false)
// WHY: Prevent multiple simultaneous calls to loadLinkedContent (causes jerky loading)
let loadLinkedContentInProgress = false
// WHY: Track minimum display time for loader to prevent flickering
let loaderShowTime = 0
const MIN_LOADER_DISPLAY_TIME = 300 // Minimum 300ms to prevent flicker
const LOADER_DELAY = 150 // Wait 150ms before showing loader (fast loads won't show it)
let loaderDelayTimer: ReturnType<typeof setTimeout> | null = null
let loaderMinTimeTimer: ReturnType<typeof setTimeout> | null = null

const removingSpecId = ref<string | number | null>(null)
const removingChecklistId = ref<string | number | null>(null)
const removingLintId = ref<string | number | null>(null)
const approvingChecklistId = ref<string | number | null>(null)
const rejectingChecklistId = ref<string | number | null>(null)

// Link Lint Result Modal
const showLinkLintModal = ref(false)
const lintResults = ref<any[]>([])
const lintResultsLoading = ref(false)
const lintResultError = ref('')
const lintResultSearch = ref('')
const selectedLintResultId = ref<number | null>(null)
const linkingLintResult = ref(false)

const showEditModal = ref(false)

// Lint detail modal state
const showLintDetailModal = ref(false)
const selectedLintResult = ref<any>(null)
const lintDetailLoading = ref(false)
const lintDetailData = ref<any>(null)
const newComment = ref('')
const commentSubmitting = ref(false)

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
    loading.value = false
    return
  }

  loading.value = true
  error.value = null
  
  // Add timeout to prevent infinite loading
  // WHY: If project doesn't load in 15 seconds, show error and allow user to retry
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  timeoutId = setTimeout(() => {
    if (loading.value && !project.value) {
      console.error('⏱️ Project load timeout after 15 seconds')
      error.value = 'Request timed out. The server may be slow or unavailable. Please try again.'
      loading.value = false
      // Clear any pending operations
      loadLinkedContentInProgress = false
      linkedContentLoading.value = false
    }
  }, 15000) // 15 second timeout (increased from 10s to account for multiple API calls)
  
  try {
    // STEP 1: Load project details (use authenticatedFetch for proper auth)
    // WHY: This is the main API call - if it fails, we can't show the page
    console.log('🔍 Loading project:', projectId)
    console.log('🔍 Auth store state:', {
      hasToken: !!authStore.token,
      hasUser: !!authStore.user,
      isAuthenticated: authStore.isAuthenticated
    })
    
    // Add timeout for the main project fetch
    // WHY: Prevents hanging if API is slow or unresponsive
    const projectFetchPromise = authenticatedFetch(`/api/v1/projects/${projectId}`)
    const projectFetchTimeout = new Promise<Response>((_, reject) => {
      setTimeout(() => reject(new Error('Project fetch timeout after 8 seconds')), 8000)
    })
    
    let projectRes: Response
    try {
      projectRes = await Promise.race([projectFetchPromise, projectFetchTimeout]) as Response
    } catch (raceError: any) {
      // Handle timeout or other race errors
      if (raceError.message?.includes('timeout')) {
        error.value = 'Project fetch timed out. The server may be slow. Please try again.'
        loading.value = false
        if (timeoutId) clearTimeout(timeoutId)
        return
      }
      throw raceError // Re-throw if it's not a timeout
    }
    if (!projectRes.ok) {
      // Read error response body only once
      let errorDetail = 'Failed to load project'
      let errorText = ''
      
      try {
        errorText = await projectRes.text()
        try {
          const errorData = JSON.parse(errorText)
          errorDetail = errorData.detail || errorData.message || errorText
        } catch {
          errorDetail = errorText || errorDetail
        }
      } catch (e) {
        console.error('Could not read error detail:', e)
        // Try to get error from authenticatedFetch's errorDetail property
        if ((projectRes as any).errorDetail) {
          errorDetail = (projectRes as any).errorDetail
        }
      }
      
      console.error('❌ Failed to load project:', projectRes.status, errorDetail)
      
      if (projectRes.status === 401) {
        console.error('❌ 401 Unauthorized - Full details:', {
          errorDetail,
          isAuthenticated: authStore.isAuthenticated,
          hasToken: !!authStore.token,
          tokenLength: authStore.token?.length || 0,
          tokenPreview: authStore.token ? `${authStore.token.substring(0, 20)}...` : 'none',
          url: `/api/v1/projects/${projectId}`
        })
        
        // Check error message for specific reasons
        const errorLower = errorDetail.toLowerCase()
        const isExpiredError = errorLower.includes('expired') || 
                               errorLower.includes('expir') ||
                               errorLower.includes('invalid token') ||
                               errorLower.includes('token has expired')
        
        const isInvalidToken = errorLower.includes('invalid') ||
                               errorLower.includes('malformed') ||
                               errorLower.includes('not found')
        
        // Always clear auth and redirect on 401 - the token is definitely invalid
        console.error('❌ 401 Unauthorized - Clearing auth and redirecting to login')
        
        // Show appropriate error message first
        if (isExpiredError) {
          error.value = 'Your session has expired. Please log in again.'
        } else if (isInvalidToken) {
          error.value = 'Invalid authentication token. Please log in again.'
        } else {
          error.value = errorDetail || 'Authentication failed. Please log in again.'
        }
        
        loading.value = false
        if (timeoutId) clearTimeout(timeoutId)
        
        // Clear auth state
        authStore.logout()
        
        // Stop any pending requests by clearing timers
        if (autoRefreshTimer.value) {
          clearInterval(autoRefreshTimer.value)
          autoRefreshTimer.value = null
        }
        
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login')
        }, 1500) // Give user time to see the error message
        return
      }
      if (projectRes.status === 404) {
        error.value = 'Project not found'
        loading.value = false
        if (timeoutId) clearTimeout(timeoutId)
        return
      }
      error.value = errorText || 'Failed to load project'
      loading.value = false
      if (timeoutId) clearTimeout(timeoutId)
      throw new Error(errorText || 'Failed to load project')
    }
    const projectData = await projectRes.json()
    console.log('✅ Project loaded:', projectData)
    project.value = projectData
    
    if (!metadataStore.platforms.length) await metadataStore.fetchMetadata()
    
    // STEP 2: Load linked content FIRST (source of truth for specs)
    // WHY: Wrap in try-catch to prevent one failure from blocking the entire page
    try {
      await loadLinkedContent()
    } catch (err: any) {
      console.error('⚠️ Failed to load linked content (non-blocking):', err)
      // Don't throw - allow page to render even if linked content fails
    }
    
    // STEP 3: Load dashboard data (but preserve specs from linked-content)
    // WHY: Wrap in try-catch to prevent one failure from blocking the entire page
    try {
      await loadDashboardData(projectId)
    } catch (err: any) {
      console.error('⚠️ Failed to load dashboard data (non-blocking):', err)
      // Don't throw - allow page to render even if dashboard data fails
    }
    
    // STEP 4: Explicitly load quality score to ensure it's fetched
    // WHY: Wrap in try-catch to prevent one failure from blocking the entire page
    try {
      await loadQualityScore(projectId)
    } catch (err: any) {
      console.error('⚠️ Failed to load quality score (non-blocking):', err)
      // Don't throw - allow page to render even if quality score fails
    }
    
    // STEP 4: Start auto-refresh (every 5 minutes - less frequent to avoid unnecessary refreshes)
    if (!autoRefreshTimer.value) {
      autoRefreshTimer.value = setInterval(async () => {
        const currentProjectId = project.value?.id || route.params.id
        if (currentProjectId) {
          console.log('🔄 Auto-refreshing linked content...')
          await loadLinkedContent()
        }
      }, 300000) // Every 5 minutes (300000ms) instead of 30 seconds
      console.log('🔄 Auto-refresh started (every 5 minutes)')
    }
    
    // Removed: 2-second delayed refresh - unnecessary and causes flickering
  } catch (err: any) {
    error.value = err.message || 'Failed to load project'
    console.error('❌ Error loading project:', err)
    console.error('❌ Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    })
    
    // Ensure loading is set to false on error
    // WHY: Prevents infinite loading spinner
    loading.value = false
    loadLinkedContentInProgress = false
    linkedContentLoading.value = false
  } finally {
    // Clear timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    // Always set loading to false, even if there was an error
    // WHY: Ensures UI is never stuck in loading state
    if (loading.value) {
      console.warn('⚠️ Force-clearing loading state in finally block')
      loading.value = false
    }
    
    // Ensure linked content loading is also cleared
    if (linkedContentLoading.value) {
      linkedContentLoading.value = false
    }
    loadLinkedContentInProgress = false
    
    console.log('✅ loadProject completed (success or error)')
  }
}

// Load spec lints for project from linked-content endpoint (filter by type "specLint")
// NOTE: The /spec-lints/with-status endpoint was removed, now using /linked-content
// This function now accepts the linkedContent to avoid duplicate API calls
const loadSpecLints = async (linkedContent: { specLints?: any[] }): Promise<any[]> => {
  try {
    console.log('🔍 Processing spec lints from linked-content')
    console.log('🔍 Raw linkedContent:', linkedContent)
    console.log('🔍 linkedContent.specLints:', linkedContent.specLints)
    
    // Get spec lints from linked content (already filtered by getLinkedContent)
    const specLintsArray = linkedContent.specLints || []
    
    console.log('🔍 Loaded spec lints from linked-content:', specLintsArray.length)
    console.log('🔍 Spec lints array:', specLintsArray)
    
    // Transform the response to match our format
    return specLintsArray.map((lint: any) => {
      // Handle summary - it might be an object like { error: 1, warning: 0, info: 0 }
      let summary = lint.summary || ''
      if (typeof summary === 'object' && summary !== null) {
        // Convert object to readable string
        const errorCount = summary.error || 0
        const warningCount = summary.warning || 0
        const infoCount = summary.info || 0
        summary = `Found ${errorCount} error(s), ${warningCount} warning(s), ${infoCount} info`
      }
      
      // Calculate issues_count from summary if not provided
      let issuesCount = lint.issues_count
      if (issuesCount === undefined || issuesCount === null) {
        if (typeof lint.summary === 'object' && lint.summary !== null) {
          issuesCount = (lint.summary.error || 0) + (lint.summary.warning || 0) + (lint.summary.info || 0)
        } else {
          issuesCount = 0
        }
      }
      
      return {
        id: lint.id,
        spec_id: lint.spec_id || lint.id,
        spec_name: lint.spec_name || lint.name,
      name: lint.spec_name || lint.name || `Spec Lint ${lint.id}`,
      file_name: lint.file_name,
        status: lint.status || 'pending', // "approved", "pending", or "declined"
        reviewer_info: lint.reviewer_info || null,
        review_timestamp: lint.review_timestamp,
        review_comment: lint.review_comment,
        issues_count: issuesCount,
        summary: summary,
        created_at: lint.created_at,
      liked_by_me: lint.liked_by_me || false,
      like_count: lint.like_count || 0,
      type: 'spec_lint'
      }
    })
  } catch (err: any) {
    console.error('Error processing spec lints:', err)
    return []
  }
}

// Load linked content (specs, checklists, etc.)
/**
 * Load linked content (specs, checklists, spec lints) for the project
 * 
 * WHY: This function fetches all content linked to the project. It includes
 * error handling and timeout to prevent infinite loading states.
 * 
 * OPTIMIZATION: Could use API cache here, but we want fresh data on each load
 * since linked content changes frequently (specs/checklists added/removed).
 * 
 * ANTI-FLICKER: Uses debouncing to prevent jerky loading indicators:
 * 1. Prevents multiple simultaneous calls
 * 2. Delays showing loader for fast loads (<150ms)
 * 3. Ensures loader shows for minimum 300ms to prevent flicker
 */
const loadLinkedContent = async () => {
  const projectId = project.value?.id || route.params.id
  if (!projectId) {
    console.warn('⚠️ No project ID available')
    linkedContentLoading.value = false
    return
  }
  
  // Prevent multiple simultaneous calls
  // WHY: Multiple calls cause jerky loading state changes
  if (loadLinkedContentInProgress) {
    console.log('⏸️ loadLinkedContent already in progress, skipping duplicate call')
    return
  }
  
  loadLinkedContentInProgress = true
  
  // Clear any existing timers
  if (loaderDelayTimer) {
    clearTimeout(loaderDelayTimer)
    loaderDelayTimer = null
  }
  if (loaderMinTimeTimer) {
    clearTimeout(loaderMinTimeTimer)
    loaderMinTimeTimer = null
  }
  
  // Delay showing loader for fast loads
  // WHY: If data loads in <150ms, don't show loader at all (prevents flicker)
  loaderDelayTimer = setTimeout(() => {
    if (loadLinkedContentInProgress) {
      linkedContentLoading.value = true
      loaderShowTime = Date.now()
    }
  }, LOADER_DELAY)
  
  try {
    console.log('🔍 Loading linked content for project:', projectId)
    
    // Add timeout to prevent infinite loading
    // WHY: If API call hangs, this ensures loading state is cleared after 10 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout: Linked content took too long to load')), 10000)
    })
    
    // Race between API call and timeout
    const linkedContent = await Promise.race([
      getLinkedContent(projectId),
      timeoutPromise
    ]) as Awaited<ReturnType<typeof getLinkedContent>>
    
    console.log('🔍 Loaded linked content:', linkedContent)
    
    const specsArray = linkedContent.specs || []
    const checklistsArray = linkedContent.checklists || []
    
    // Fetch checklists with status from the with-status endpoint
    // This ensures we have the correct status (approved/declined/pending)
    let checklistsWithStatus: any[] = []
    try {
      console.log('📋 Fetching checklists with status for project:', projectId)
      const checklistsStatusResponse = await authenticatedFetch(`/api/v1/projects/${projectId}/checklists/with-status`)
      if (checklistsStatusResponse.ok) {
        checklistsWithStatus = await checklistsStatusResponse.json()
        console.log('✅ Checklists with status fetched:', checklistsWithStatus.length)
        console.log('📋 Checklists status details:', checklistsWithStatus.map((c: any) => ({ id: c.id, name: c.name, status: c.status })))
      } else {
        console.warn('⚠️ Failed to fetch checklists with status:', checklistsStatusResponse.status)
      }
    } catch (err: any) {
      console.error('❌ Error fetching checklists with status:', err)
    }
    
    // Merge checklists from linked-content with status/active IDs from with-status endpoint
    // Create a flexible map so we can match either by template ID or active checklist ID.
    const statusMap = new Map<number | string, any>()
    checklistsWithStatus.forEach((checklist: any) => {
      // Backend may send different identifier fields; index by all of them.
      // Common shapes:
      // - { id: <template_checklist_id>, ... }
      // - { template_id: <template_checklist_id>, ... }
      // - { checklist_template_id: <template_checklist_id>, ... }
      // - { active_checklist_id: <active_instance_id>, ... }
      if (checklist.id !== undefined) {
        statusMap.set(checklist.id, checklist)
      }
      if (checklist.template_id !== undefined) {
        statusMap.set(checklist.template_id, checklist)
      }
      if (checklist.checklist_template_id !== undefined) {
        statusMap.set(checklist.checklist_template_id, checklist)
      }
      if (checklist.active_checklist_id !== undefined) {
        statusMap.set(checklist.active_checklist_id, checklist)
      }
    })
    
    // Merge status into checklists from linked-content
    const mergedChecklists = checklistsArray.map((checklist: any) => {
      const checklistId = checklist.id
      const statusEntry = statusMap.get(checklistId) || {}
      // Backend might expose status or an approved flag under different keys; prefer explicit ones first
      const approvedFlag =
        statusEntry.is_approved ??
        statusEntry.approved ??
        checklist.is_approved ??
        checklist.approved
      const rawStatus =
        (approvedFlag === true ? 'approved' : undefined) ??
        statusEntry.status ??
        statusEntry.approval_status ??
        statusEntry.review_status ??
        checklist.status ??
        'pending'
      // Normalize to lowercase so UI checks like status === 'approved' work reliably
      const status = String(rawStatus).toLowerCase()
      const activeChecklistId =
        statusEntry.active_checklist_id !== undefined
          ? statusEntry.active_checklist_id
          : checklist.active_checklist_id

      return {
        ...checklist,
        status,                  // Use status from with-status endpoint, fallback to linked-content status, then 'pending'
        active_checklist_id: activeChecklistId
      }
    })
    
    // Process spec lints from linked-content (no separate API call needed)
    const specLintsArray = await loadSpecLints(linkedContent)
    
    console.log('🔍 Specs found:', specsArray.length)
    console.log('🔍 Checklists found:', mergedChecklists.length)
    console.log('🔍 Checklists with merged status:', mergedChecklists.map((c: any) => ({ id: c.id, name: c.name, status: c.status })))
    console.log('🔍 Spec Lints found:', specLintsArray.length)
    console.log('🔍 Spec Lints details:', specLintsArray)
    
    linkedSpecifications.value = specsArray
    linkedChecklists.value = mergedChecklists
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
    
    // Ensure minimum display time for loader
    // WHY: Prevents flickering if load completes too quickly
    const elapsed = Date.now() - loaderShowTime
    if (elapsed < MIN_LOADER_DISPLAY_TIME && linkedContentLoading.value) {
      const remaining = MIN_LOADER_DISPLAY_TIME - elapsed
      loaderMinTimeTimer = setTimeout(() => {
        linkedContentLoading.value = false
        loadLinkedContentInProgress = false
      }, remaining)
    } else {
      linkedContentLoading.value = false
      loadLinkedContentInProgress = false
    }
  } catch (err: any) {
    // Log error with details
    // WHY: Helps debug why loading is stuck
    console.error('❌ Error loading linked content:', err)
    console.error('❌ Error message:', err.message)
    console.error('❌ Error stack:', err.stack)
    
    // Show error to user
    // WHY: User should know why content isn't loading
    showToast(err.message || 'Failed to load linked content. Please try refreshing.', true)
    
    // Clear loading state even on error
    // WHY: Prevents infinite loading spinner
    linkedContentLoading.value = false
    loadLinkedContentInProgress = false
    
    // Set empty arrays to show empty state instead of loading
    // WHY: Better UX than stuck loading spinner
    linkedSpecifications.value = []
    linkedChecklists.value = []
    linkedSpecLints.value = []
    dashboardData.value.specs = []
  } finally {
    // Clear timers
    if (loaderDelayTimer) {
      clearTimeout(loaderDelayTimer)
      loaderDelayTimer = null
    }
    
    // Always clear loading state after minimum display time
    // WHY: Ensures loading spinner stops even if something goes wrong
    if (!loaderMinTimeTimer) {
      linkedContentLoading.value = false
      loadLinkedContentInProgress = false
    }
  }
}

// Refresh quality score manually
const refreshQualityScore = async () => {
  const projectId = project.value?.id || route.params.id as string
  if (projectId) {
    await loadQualityScore(projectId)
  }
}

// Load quality score separately (for refresh after linking/unlinking)
const loadQualityScore = async (projectId: string) => {
  qualityScoreLoading.value = true
  try {
    console.log('📊 Loading quality score for project:', projectId)
    const url = `/api/v1/projects/${projectId}/quality-score`
    console.log('📊 Quality score URL:', url)
    
    const response = await authenticatedFetch(url)
    console.log('📊 Quality score response status:', response.status, response.ok)
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.warn('⚠️ Quality score API returned error:', response.status, errorText)
      console.warn('⚠️ Full error response:', errorText)
      // Set to null if API fails - will show 0.0% in UI
      dashboardData.value.qualityScore = null
      showToast('Failed to load quality score. Please check console for details.', true)
      return
    }
    
    const qualityScore = await response.json()
    console.log('✅ Quality score raw response:', JSON.stringify(qualityScore, null, 2))
    console.log('✅ Quality score type:', typeof qualityScore)
    console.log('✅ Quality score keys:', Object.keys(qualityScore))
    
    // Check if all values are 0 or null
    const allZero = (
      (qualityScore.spec_approval_rate === 0 || qualityScore.spec_approval_rate === null || qualityScore.spec_approval_rate === undefined) &&
      (qualityScore.checklist_completion_rate === 0 || qualityScore.checklist_completion_rate === null || qualityScore.checklist_completion_rate === undefined) &&
      (qualityScore.lint_pass_rate === 0 || qualityScore.lint_pass_rate === null || qualityScore.lint_pass_rate === undefined)
    )
    
    if (allZero) {
      console.warn('⚠️ Quality score API returned all zeros')
      console.warn('⚠️ This might indicate:')
      console.warn('   - No specs/checklists/lints in the project yet')
      console.warn('   - Backend calculation issue')
      console.warn('   - All specs are pending (not approved)')
    } else {
      console.log('✅ Quality score has non-zero values!')
    }
    
    // Map quality score fields to match the API response
    // Ensure we're using the correct field names from the API
    const mappedScore = {
      spec_approval_rate: qualityScore.spec_approval_rate ?? qualityScore.specApprovalRate ?? 0,
      checklist_completion_rate: qualityScore.checklist_completion_rate ?? qualityScore.checklistCompletionRate ?? 0,
      lint_pass_rate: qualityScore.lint_pass_rate ?? qualityScore.lintPassRate ?? 0,
      overall_score: qualityScore.overall_score ?? qualityScore.overallScore ?? 0
    }
    
    console.log('📊 Mapped quality score:', mappedScore)
    console.log('📊 Approval rate (raw):', qualityScore.spec_approval_rate, '→ mapped:', mappedScore.spec_approval_rate)
    console.log('📊 Completion rate (raw):', qualityScore.checklist_completion_rate, '→ mapped:', mappedScore.checklist_completion_rate)
    console.log('📊 Pass rate (raw):', qualityScore.lint_pass_rate, '→ mapped:', mappedScore.lint_pass_rate)
    
    // Update the reactive data
    dashboardData.value.qualityScore = mappedScore
    
    console.log('📊 Quality score in dashboardData after update:', dashboardData.value.qualityScore)
    console.log('📊 dashboardData.value.qualityScore type:', typeof dashboardData.value.qualityScore)
    
    // Show success message if values are non-zero
    if (!allZero) {
      console.log('✅ Quality score loaded successfully with non-zero values!')
    }
  } catch (err: any) {
    console.error('❌ Error loading quality score:', err)
    console.error('❌ Error details:', err.message, err.stack)
    // Set to null on error - will show 0.0% in UI
    dashboardData.value.qualityScore = null
    showToast('Error loading quality score. Please check console for details.', true)
  } finally {
    qualityScoreLoading.value = false
    qualityScoreFetchedOnce.value = true
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
    
    // Preserve quality score if it was already loaded
    const preservedQualityScore = dashboardData.value.qualityScore
    
    dashboardData.value = {
      ...data,
      specs: preservedSpecs, // Always keep specs from linked-content
      // Preserve quality score if it exists, otherwise use the one from fetchProjectDashboard
      qualityScore: preservedQualityScore || data.qualityScore
    }
    
    console.log('✅ Dashboard data loaded, preserved', preservedSpecs.length, 'specs')
    console.log('📊 Quality score in dashboardData:', dashboardData.value.qualityScore)
    console.log('📊 Approval rate:', dashboardData.value.qualityScore?.spec_approval_rate)
    console.log('📊 Completion rate:', dashboardData.value.qualityScore?.checklist_completion_rate)
    console.log('📊 Pass rate:', dashboardData.value.qualityScore?.lint_pass_rate)
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

// Get status badge class for checklists
// Approved: Green, Pending: Yellow/Orange, Declined: Red
const getChecklistStatusBadgeClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
    case 'declined':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700'
    case 'pending':
    default:
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700'
  }
}

// Get status badge class for lint results
// Approved: Green, Pending: Yellow/Orange, Declined: Red
const getLintStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
    case 'declined':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700'
    case 'pending':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700'
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-700'
  }
}

// Get severity badge class
const getSeverityBadge = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'error':
      return 'bg-red-500/20 text-red-400 border border-red-500/30'
    case 'warning':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    case 'info':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
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

// Helper function to format dates in short format (for lint results)
// Helper functions for error handling
const refreshPage = () => {
  if (typeof window !== 'undefined') {
    window.location.reload()
  } else {
    // Fallback: use router to reload
    router.go(0)
  }
}

const goToLogin = () => {
  router.push('/login')
}

const formatDateShort = (dateString: string) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
    message: `Are you sure you want to delete "${project.value?.name || 'this project'}"? This action cannot be undone and will remove all associated data.`,
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
// Watch for route changes to reload linked content (only when project ID actually changes)
watch(() => route.params.id, async (newId, oldId) => {
  // Only refresh if the project ID actually changed
  if (newId && newId !== oldId) {
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
    // Also ensure quality score is loaded
    await loadQualityScore(projectId)
    
    // Fetch all specifications and checklists for linking modals
    try {
      // Fetch all specifications (no project_id filter needed for specs)
      const specsRes = await authenticatedFetch('/api/v1/specifications/')
      if (specsRes.ok) allSpecs.value = await specsRes.json()
      
      // Fetch checklists with project_id filter to exclude already-linked ones
      const checklistsUrl = `/api/v1/checklists/?project_id=${projectId}`
      console.log('📋 Fetching checklists with URL:', checklistsUrl)
      const checklistsRes = await authenticatedFetch(checklistsUrl)
      if (checklistsRes.ok) {
        allChecklists.value = await checklistsRes.json()
        console.log('✅ Loaded checklists:', allChecklists.value.length, 'available to link')
      }
    } catch (err: any) {
      console.error('❌ Error fetching specs/checklists for linking:', err)
    }
  }
  // Mock: populate likes for demo
  specLikes.value = { '1': { likedByUser: true, likeCount: 1 }, '2': { likedByUser: false, likeCount: 3 } }
  checklistLikes.value = { '10': { likedByUser: true, likeCount: 1 }, '11': { likedByUser: false, likeCount: 2 } }
  
  // Listen for project content updates
  window.addEventListener('project-content-updated', handleProjectContentUpdate as EventListener)
})

onActivated(async () => {
  // Refresh when component becomes active (user navigated back)
  const currentProjectId = project.value?.id || route.params.id
  if (currentProjectId) {
    // Always refresh when returning to the page to catch newly linked items
    // This ensures lint results appear immediately after linking from SpecLint
    console.log('🔄 Component activated, refreshing linked content...')
    await loadLinkedContent()
    
    // Also refresh quality score
    await loadQualityScore(currentProjectId)
    
    // Only restart auto-refresh if it's not already running
    if (!autoRefreshTimer.value) {
    autoRefreshTimer.value = setInterval(async () => {
      const currentProjectId = project.value?.id || route.params.id
      if (currentProjectId) {
        console.log('🔄 Auto-refreshing linked content...')
        await loadLinkedContent()
      }
      }, 300000) // 5 minutes
      console.log('🔄 Auto-refresh restarted (every 5 minutes)')
    }
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
  const eventProjectId = event.detail?.projectId
  const currentProjectId = project.value?.id || route.params.id as string
  
  console.log('🔄 Received project-content-updated event:', {
    eventProjectId,
    currentProjectId,
    match: eventProjectId && String(eventProjectId) === String(currentProjectId)
  })
  
  if (eventProjectId && String(eventProjectId) === String(currentProjectId)) {
    console.log('🔄 Refreshing linked content after lint result link...')
    // Add a small delay to ensure backend has processed the link
    await new Promise(resolve => setTimeout(resolve, 500))
    await loadLinkedContent()
    // Also refresh quality score
    if (currentProjectId) {
      await loadQualityScore(currentProjectId)
    }
    console.log('✅ Linked content refreshed')
  }
}

// Remove spec from project (wrapper function for the remove button)
const removeSpecFromProject = async (specId: string | number) => {
  console.log('🗑️ Remove spec button clicked:', specId)
    const spec = dashboardData.value.specs.find(s => s.id === specId)
    if (spec) {
    console.log('✅ Found spec:', spec)
      await onUnlinkSpec(spec)
  } else {
    console.error('❌ Spec not found in dashboardData.specs:', specId)
    console.log('Available specs:', dashboardData.value.specs.map(s => s.id))
    showToast('Spec not found', true)
  }
}

// Add empty handlers for like/unlike and unlink actions (to be wired to real API later)
async function onUnlinkSpec(spec: any) {
  console.log('🔗 onUnlinkSpec called with spec:', spec)
  
  // Get project ID from route if project.value is not available
  const projectId = project.value?.id || route.params.id as string
  if (!projectId) {
    console.error('❌ No project ID found')
    showToast('Project not found. Please refresh the page.', true)
    return
  }
  
  console.log('✅ Project ID:', projectId)
  const specId = typeof spec === 'object' && spec !== null ? spec.id : spec
  const specName = typeof spec === 'object' && spec !== null ? (spec.name || spec.file_name || 'spec') : 'spec'
  
  console.log('🔗 Showing confirmation modal for spec:', specId, specName)
  
  showConfirm({
    title: 'Remove Specification',
    message: `Are you sure you want to remove "${specName}" from this project? This action cannot be undone.`,
    confirmText: 'Remove',
    cancelText: 'Cancel',
    onConfirm: async () => {
      console.log('✅ Confirmation confirmed, unlinking spec:', specId)
      try {
        const url = `/api/v1/projects/${projectId}/specifications/${specId}/link`
        console.log('🔗 Making DELETE request to:', url)
        const response = await authenticatedFetch(url, {
          method: 'DELETE'
        })
        
        console.log('📡 Response status:', response.status, response.ok)
        
        if (!response.ok) {
          // Handle 401 errors
          if (response.status === 401) {
            const errorText = await response.text()
            console.error('❌ 401 Unauthorized:', errorText)
            if (errorText.includes('Token has expired') || errorText.includes('Invalid token') || errorText.includes('User not found')) {
              showToast('Authentication failed. Redirecting to login...', true)
              setTimeout(() => {
                router.push('/login')
              }, 2000)
              return
            }
          }
          const errorText = await response.text()
          console.error('❌ Failed to unlink spec:', response.status, errorText)
          throw new Error(errorText || 'Failed to remove spec')
        }
        
        console.log('✅ Spec unlinked successfully, refreshing data...')
        // Refresh both linked content and dashboard data to update the UI
        await loadLinkedContent()
        await loadDashboardData(projectId)
        await loadQualityScore(projectId) // Refresh quality score after unlinking
        console.log('✅ Data refreshed successfully')
        showToast(`"${specName}" has been removed from the project successfully.`, false)
      } catch (e: any) {
        console.error('❌ Error unlinking spec:', e)
        showToast(`Failed to remove spec: ${e.message || e}`, true)
      }
    }
  })
}
async function onUnlinkChecklist(checklist: any) {
  console.log('🔗 onUnlinkChecklist called with checklist:', checklist)
  
  // Get project ID from route if project.value is not available
  const projectId = project.value?.id || route.params.id as string
  if (!projectId) {
    console.error('❌ No project ID found')
    showToast('Project not found. Please refresh the page.', true)
    return
  }
  
  console.log('✅ Project ID:', projectId)
  const checklistId = typeof checklist === 'object' && checklist !== null ? checklist.id : checklist
  // IMPORTANT: approval must use the ACTIVE checklist ID, not the template/linked ID
  const activeChecklistId =
    typeof checklist === 'object' && checklist !== null
      ? (checklist.active_checklist_id ?? checklist.id)
      : checklist
  const checklistName = typeof checklist === 'object' && checklist !== null ? (checklist.name || 'checklist') : 'checklist'
  
  console.log('🔗 Showing confirmation modal for checklist:', checklistId, checklistName)
  
  showConfirm({
    title: 'Remove Checklist',
    message: `Are you sure you want to remove "${checklistName}" from this project? This action cannot be undone.`,
    confirmText: 'Remove',
    cancelText: 'Cancel',
    onConfirm: async () => {
      console.log('✅ Confirmation confirmed, unlinking checklist:', checklistId)
      removingChecklistId.value = checklistId
      try {
        // Use correct endpoint: DELETE /api/v1/projects/{project_id}/checklists/{checklist_id}/link
        const url = `/api/v1/projects/${projectId}/checklists/${checklistId}/link`
        console.log('🔗 Making DELETE request to:', url)
        const response = await authenticatedFetch(url, {
          method: 'DELETE'
        })
        
        console.log('📡 Response status:', response.status, response.ok)
        
        if (!response.ok) {
          // Handle 401 errors
          if (response.status === 401) {
            const errorText = await response.text()
            console.error('❌ 401 Unauthorized:', errorText)
            if (errorText.includes('Token has expired') || errorText.includes('Invalid token') || errorText.includes('User not found')) {
              showToast('Authentication failed. Redirecting to login...', true)
              setTimeout(() => {
                router.push('/login')
              }, 2000)
              return
            }
          }
          const errorText = await response.text()
          console.error('❌ Failed to unlink checklist:', response.status, errorText)
          throw new Error(errorText || 'Failed to remove checklist')
        }
        
        console.log('✅ Checklist unlinked successfully, refreshing data...')
        // Refresh both linked content and dashboard data to update the UI
        await loadLinkedContent()
        await loadDashboardData(projectId)
        await loadQualityScore(projectId) // Refresh quality score after unlinking
        console.log('✅ Data refreshed successfully')
        showToast(`"${checklistName}" has been removed from the project successfully.`, false)
      } catch (e: any) {
        console.error('❌ Error unlinking checklist:', e)
        showToast(`Failed to remove checklist: ${e.message || e}`, true)
      } finally {
        removingChecklistId.value = null
      }
    }
  })
}

// Approve checklist using the checklist approval endpoint
async function onApproveChecklist(checklist: any) {
  console.log('✅ onApproveChecklist called with checklist:', checklist)
  
  const projectId = project.value?.id || route.params.id as string
  if (!projectId) {
    console.error('❌ No project ID found')
    showToast('Project not found. Please refresh the page.', true)
    return
  }
  
  const checklistId = typeof checklist === 'object' && checklist !== null ? checklist.id : checklist
  const checklistName = typeof checklist === 'object' && checklist !== null ? (checklist.name || 'checklist') : 'checklist'
  // IMPORTANT: Approval must use the ACTIVE checklist ID, not the template/linked ID
  // If we don't yet have an active checklist instance, we will create one first.
  let activeChecklistId: string | number | null =
    typeof checklist === 'object' && checklist !== null
      ? (checklist.active_checklist_id ?? null)
      : null
  
  try {
    approvingChecklistId.value = checklistId
    
    // 1) Ensure we have an active checklist instance
    if (!activeChecklistId) {
      console.log('🧩 No active checklist ID found for template checklist; creating active checklist instance first')
      const createBody: any = { template_id: checklistId }
      // Pass project_id context so backend can associate correctly
      createBody.project_id = projectId
      
      const createRes = await authenticatedFetch('/api/v1/checklists/active', {
        method: 'POST',
        body: JSON.stringify(createBody)
      })
      
      if (!createRes.ok) {
        const createText = await createRes.text().catch(() => '')
        throw new Error(createText || 'Failed to create active checklist before approval')
      }
      
      const createdActiveChecklist = await createRes.json()
      activeChecklistId = createdActiveChecklist.id
      console.log('✅ Created active checklist instance:', createdActiveChecklist)
      
      // Update local checklist object so subsequent actions reuse this ID
      if (typeof checklist === 'object' && checklist !== null) {
        checklist.active_checklist_id = activeChecklistId
      }
    }
    
    if (!activeChecklistId) {
      throw new Error('Active checklist ID is missing; cannot approve')
    }
    
    // 2) Use the checklist approval endpoint with ACTIVE checklist ID
    console.log('📝 Approving checklist with active ID:', activeChecklistId)
    const approvalResponse = await authenticatedFetch(`/api/v1/checklists/active/${activeChecklistId}/approve`, {
      method: 'POST'
    })
    
    if (!approvalResponse.ok) {
      const rawErrorText = await approvalResponse.text()
      let errorMessage = rawErrorText || 'Failed to approve checklist'

      // Try to parse JSON error: { "detail": "..." }
      try {
        const parsed = JSON.parse(rawErrorText)
        if (parsed?.detail) {
          errorMessage = parsed.detail
        }
      } catch {
        // not JSON, keep raw text
      }

      const lowerMsg = errorMessage.toLowerCase()

      // If backend says it's already approved/completed, treat as success
      if (lowerMsg.includes('already approved')) {
        console.warn('ℹ️ Checklist already approved/completed:', errorMessage)
        await loadLinkedContent()
        await loadQualityScore(projectId)
        showToast(`"${checklistName}" is already approved.`, false)
        return
      }

      // If backend says active checklist not found, show friendly message
      if (approvalResponse.status === 404 || lowerMsg.includes('active checklist not found')) {
        console.warn('ℹ️ Active checklist not found for approval:', errorMessage)
        showToast(`Could not approve "${checklistName}" because its active checklist was not found. Please refresh the page or re-link the checklist.`, true)
        return
      }

      if (approvalResponse.status === 401) {
        console.error('❌ 401 Unauthorized:', errorMessage)
        showToast('Authentication failed. Please log in again.', true)
        router.push('/login')
        return
      }

      throw new Error(errorMessage)
    }
    
    const updatedChecklist = await approvalResponse.json()
    console.log('✅ Checklist approved:', updatedChecklist)
    
    // Refresh linked content to get updated checklist status
    await loadLinkedContent()
    
    // Refresh quality score to show updated completion rate
    await loadQualityScore(projectId)
    
    showToast(`"${checklistName}" has been approved successfully.`, false)
  } catch (e: any) {
    console.error('❌ Error approving checklist:', e)
    showToast(`Failed to approve checklist: ${e.message || e}`, true)
  } finally {
    approvingChecklistId.value = null
  }
}

// Reject checklist by creating a comment with "reject" in the content
async function onRejectChecklist(checklist: any) {
  console.log('❌ onRejectChecklist called with checklist:', checklist)
  
  const projectId = project.value?.id || route.params.id as string
  if (!projectId) {
    console.error('❌ No project ID found')
    showToast('Project not found. Please refresh the page.', true)
    return
  }
  
  const checklistId = typeof checklist === 'object' && checklist !== null ? checklist.id : checklist
  const checklistName = typeof checklist === 'object' && checklist !== null ? (checklist.name || 'checklist') : 'checklist'
  
  try {
    rejectingChecklistId.value = checklistId
    
    // Create a comment with "reject" in the content to trigger rejection
    console.log('📝 Creating rejection comment for checklist:', checklistId)
    const commentResponse = await authenticatedFetch('/api/v1/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        entity_type: 'checklist',
        entity_id: checklistId,
        content: 'Rejected by reviewer' // Must contain "reject" (case-insensitive)
      })
    })
    
    if (!commentResponse.ok) {
      if (commentResponse.status === 401) {
        const errorText = await commentResponse.text()
        console.error('❌ 401 Unauthorized:', errorText)
        showToast('Authentication failed. Please log in again.', true)
        router.push('/login')
        return
      }
      const errorText = await commentResponse.text()
      throw new Error(errorText || 'Failed to reject checklist')
    }
    
    const commentData = await commentResponse.json()
    console.log('✅ Rejection comment created:', commentData)
    
    // Wait a bit for backend to process the rejection
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Refresh linked content to get updated checklist status
    await loadLinkedContent()
    
    // Refresh quality score to show updated completion rate
    await loadQualityScore(projectId)
    
    showToast(`"${checklistName}" has been rejected.`, false)
  } catch (e: any) {
    console.error('❌ Error rejecting checklist:', e)
    showToast(`Failed to reject checklist: ${e.message || e}`, true)
  } finally {
    rejectingChecklistId.value = null
  }
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
// Unlink lint result from project
const onUnlinkLintResult = async (lint: any) => {
  const projectId = project.value?.id || route.params.id as string
  if (!projectId) {
    showToast('Project not found. Please refresh the page.', true)
    return
  }

  const lintId = typeof lint === 'object' && lint !== null ? lint.id : lint
  const lintName = lint.summary || lint.spec_name || lint.name || `Lint Result #${lintId}`
  
  showConfirm({
    title: 'Unlink Lint Result',
    message: `Are you sure you want to unlink "${lintName}" from this project?`,
    confirmText: 'Unlink',
    cancelText: 'Cancel',
    onConfirm: async () => {
      try {
        removingLintId.value = lintId
        const url = `/api/v1/projects/${projectId}/lint-results/${lintId}/link`
        console.log('🔗 Unlinking lint result:', url)

        const response = await authenticatedFetch(url, {
          method: 'DELETE'
        })

        if (!response.ok) {
          if (response.status === 401) {
            const errorText = await response.text()
            console.error('❌ 401 Unauthorized:', errorText)
            showToast('Authentication failed. Please log in again.', true)
            router.push('/login')
            return
          }
          const errorText = await response.text()
          throw new Error(errorText || 'Failed to unlink lint result')
        }

        await loadLinkedContent()
        showToast(`"${lintName}" has been unlinked from the project successfully.`, false)
      } catch (e: any) {
        console.error('❌ Error unlinking lint result:', e)
        showToast(`Failed to unlink lint result: ${e.message || e}`, true)
      } finally {
        removingLintId.value = null
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
async function openLinkModal(type: 'spec' | 'checklist') {
  console.log('🔗 openLinkModal called with type:', type)
  linkModalType.value = type
  showLinkModal.value = true
  console.log('✅ Link modal opened, showLinkModal:', showLinkModal.value)
  
  // If opening checklist modal, refresh checklists with project_id filter
  if (type === 'checklist') {
    const projectId = project.value?.id || route.params.id as string
    if (projectId) {
      try {
        const checklistsUrl = `/api/v1/checklists/?project_id=${projectId}`
        console.log('📋 Refreshing checklists with project_id filter:', checklistsUrl)
        const checklistsRes = await authenticatedFetch(checklistsUrl)
        if (checklistsRes.ok) {
          allChecklists.value = await checklistsRes.json()
          console.log('✅ Refreshed checklists:', allChecklists.value.length, 'available to link')
        }
      } catch (err: any) {
        console.error('❌ Error refreshing checklists:', err)
      }
    }
  }
  
  console.log('✅ Available items:', type === 'spec' ? filteredUnlinkedSpecs.value.length : filteredUnlinkedChecklists.value.length)
}
function closeLinkModal() {
  showLinkModal.value = false
}

// Link Lint Result Modal Functions
const openLinkLintModal = async () => {
  showLinkLintModal.value = true
  selectedLintResultId.value = null
  lintResultSearch.value = ''
  lintResultError.value = ''
  
  console.log('🔗 Opening link lint modal, loading available lint results...')
  await loadAvailableLintResults()
  
  // Log the results after loading
  console.log('🔗 Available lint results after load:', lintResults.value?.length || 0)
  if (lintResultError.value) {
    console.error('🔗 Error loading lint results:', lintResultError.value)
  }
}

const closeLinkLintModal = () => {
  showLinkLintModal.value = false
  selectedLintResultId.value = null
  lintResultSearch.value = ''
  lintResultError.value = ''
}

// Navigate to SpecLint page
const goToSpecLintPage = () => {
  closeLinkLintModal() // Close modal first
  router.push('/speclint') // Navigate to SpecLint page
}

const loadAvailableLintResults = async () => {
  try {
    lintResultsLoading.value = true
    lintResultError.value = ''
    
    console.log('📋 Loading available lint results...')
    const res = await authenticatedFetch('/api/v1/lint-results')
    
    console.log('📋 Lint results response:', {
      status: res.status,
      ok: res.ok,
      statusText: res.statusText,
      isAuthError: (res as any).isAuthError
    })
    
    // Handle 401 errors specifically
    if (res.status === 401 && (res as any).isAuthError) {
      const errorDetail = (res as any).errorDetail || 'Authentication failed'
      lintResultError.value = 'Authentication failed. Please refresh the page or log in again.'
      console.error('❌ Lint results load failed: 401 Unauthorized', errorDetail)
      lintResults.value = []
      return
    }
    
    if (!res.ok) {
      let errorMessage = 'Failed to load lint results'
      try {
        const errorText = await res.text()
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.detail || errorData.message || errorText
        } catch {
          errorMessage = errorText || errorMessage
        }
      } catch (e) {
        console.error('Failed to read error response:', e)
      }
      
      lintResultError.value = errorMessage
      console.error('❌ Lint results load failed:', errorMessage, 'Status:', res.status)
      lintResults.value = []
      return
    }
    
    // Parse response
    try {
      const lintResultsData = await res.json()
      console.log('📋 Lint results from API:', lintResultsData)
      console.log('📋 Number of results:', lintResultsData?.length || 0)
      console.log('📋 Results type:', Array.isArray(lintResultsData) ? 'array' : typeof lintResultsData)
      
      // Check if results exist and are an array
      if (lintResultsData && Array.isArray(lintResultsData)) {
        if (lintResultsData.length > 0) {
          lintResults.value = lintResultsData
          lintResultError.value = '' // Clear any previous errors
          console.log('✅ Lint results loaded successfully:', lintResultsData.length, 'results')
        } else {
          lintResults.value = []
          lintResultError.value = 'No lint results found. Run linting on a spec first.'
          console.warn('⚠️ No lint results returned from API (empty array)')
        }
      } else {
        lintResults.value = []
        lintResultError.value = 'Invalid response format from server.'
        console.error('❌ Invalid response format - expected array, got:', typeof lintResultsData)
      }
    } catch (parseError: any) {
      console.error('❌ Failed to parse lint results response:', parseError)
      lintResultError.value = 'Failed to parse response. Please try again.'
      lintResults.value = []
    }
  } catch (e: any) {
    console.error('❌ Error loading lint results:', {
      message: e.message,
      stack: e.stack,
      name: e.name
    })
    
    // More specific error messages
    if (e.message?.includes('401') || e.message?.includes('Authentication') || e.message?.includes('Not authenticated')) {
      lintResultError.value = 'Authentication failed. Please log in again.'
    } else if (e.message?.includes('Network') || e.message?.includes('fetch')) {
      lintResultError.value = 'Network error. Please check your connection and try again.'
    } else {
      lintResultError.value = e.message || 'Failed to load lint results'
    }
    
    lintResults.value = []
  } finally {
    lintResultsLoading.value = false
  }
}

const filteredLintResults = computed(() => {
  // Get IDs of already linked lint results
  const linkedLintIds = new Set(linkedSpecLints.value.map(lint => lint.id))
  
  // Filter out already linked lint results
  const availableLints = lintResults.value.filter(lint => !linkedLintIds.has(lint.id))
  
  // If no search term, return all available (non-linked) lint results
  if (!lintResultSearch.value) return availableLints
  
  // Filter by search term
  const search = lintResultSearch.value.toLowerCase()
  return availableLints.filter(lint => 
    lint.id.toString().includes(search) ||
    lint.summary?.toLowerCase().includes(search) ||
    lint.spec_id?.toString().includes(search)
  )
})

const linkSelectedLintResult = async () => {
  if (!selectedLintResultId.value) {
    lintResultError.value = 'Please select a lint result'
    return
  }

  const projectId = project.value?.id || route.params.id as string
  if (!projectId) {
    showToast('Project not found. Please refresh the page.', true)
    return
  }

  try {
    linkingLintResult.value = true
    lintResultError.value = ''

    const url = `/api/v1/projects/${projectId}/lint-results/${selectedLintResultId.value}/link`
    console.log('🔗 Linking lint result:', url)

    const response = await authenticatedFetch(url, {
      method: 'POST'
    })

    if (!response.ok) {
      if (response.status === 401) {
        const errorText = await response.text()
        console.error('❌ 401 Unauthorized:', errorText)
        showToast('Authentication failed. Please log in again.', true)
        router.push('/login')
        return
      }
      const errorText = await response.text()
      throw new Error(errorText || 'Failed to link lint result')
    }

    const data = await response.json()
    console.log('✅ Lint result linked:', data)

    closeLinkLintModal()
    showToast('Lint result linked successfully!', false)
    
    // Add a small delay to ensure backend has processed the link
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Refresh linked content to show the newly linked lint result
    await loadLinkedContent()
    
    // Also dispatch event to trigger refresh in other components
    // Note: projectId is already defined above, don't redeclare it
    if (projectId) {
      window.dispatchEvent(new CustomEvent('project-content-updated', {
        detail: { projectId }
      }))
    }
    
    // Refresh quality score as well
    if (projectId) {
      await loadQualityScore(projectId)
    }
  } catch (e: any) {
    console.error('❌ Error linking lint result:', e)
    lintResultError.value = e.message || 'Failed to link lint result'
  } finally {
    linkingLintResult.value = false
  }
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

// Load detailed lint result
const loadLintDetail = async (lintResultId: string | number) => {
  lintDetailLoading.value = true
  lintDetailData.value = null
  
  try {
    const response = await authenticatedFetch(`/api/v1/lint-results/${lintResultId}`)
    
    if (!response.ok) {
      throw new Error('Failed to load lint details')
    }
    
    const data = await response.json()
    lintDetailData.value = data

    // Keep the lightweight list item and the detailed payload in sync
    if (selectedLintResult.value && String(selectedLintResult.value.id) === String(data.id ?? lintResultId)) {
      selectedLintResult.value = {
        ...selectedLintResult.value,
        ...data
      }
    }
  } catch (err: any) {
    console.error('Error loading lint detail:', err)
    showToast(`Failed to load lint details: ${err.message}`, true)
  } finally {
    lintDetailLoading.value = false
  }
}

// Open lint detail modal
const openLintDetail = async (lint: any) => {
  selectedLintResult.value = lint
  showLintDetailModal.value = true
  await loadLintDetail(lint.id)
}

// Close lint detail modal
const closeLintDetailModal = () => {
  showLintDetailModal.value = false
  selectedLintResult.value = null
  lintDetailData.value = null
  newComment.value = ''
}

// Navigate to spec detail page
const navigateToSpec = (specId: string | number) => {
  router.push(`/specs/${specId}`)
}

// Re-run lint on a spec (from lint detail modal)
const reRunLint = async (specId: string | number) => {
  try {
    const response = await authenticatedFetch(`/api/v1/specs/${specId}/lint`, {
      method: 'POST'
    })
    
    if (!response.ok) {
      // Handle 401 errors
      if (response.status === 401) {
        const errorText = await response.text()
        if (errorText.includes('Token has expired') || errorText.includes('Invalid token') || errorText.includes('User not found')) {
          showToast('Authentication failed. Redirecting to login...', true)
          setTimeout(() => {
            router.push('/login')
          }, 2000)
          return
        }
      }
      
      // Try to surface backend error message (e.g. "You do not have access to this specification")
      let errorMessage = 'Failed to trigger lint'
      try {
        const errorText = await response.text()
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          if (errorText) {
            errorMessage = errorText
          }
        }
      } catch (e) {
        console.error('Failed to read lint error response:', e)
      }
      
      throw new Error(errorMessage)
    }
    
    showToast('Linting triggered successfully. Results will appear shortly.', false)
    closeLintDetailModal()
    
    // Refresh spec lints after a delay
    setTimeout(async () => {
      await loadLinkedContent()
      await loadDashboardData(project.value?.id || route.params.id as string)
    }, 2000)
  } catch (err: any) {
    showToast(`Failed to trigger lint: ${err.message}`, true)
  }
}

// Submit comment/review
const submitComment = async () => {
  if (!selectedLintResult.value || !newComment.value.trim() || !project.value) return
  
  commentSubmitting.value = true
  
  try {
    // Use the shared comments API (same as SpecLint page)
    const response = await apiClient('/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Backend expects exactly: { content, entity_type, entity_id }
        content: newComment.value.trim(),
        entity_type: 'lint_result',
        entity_id: selectedLintResult.value.id
      })
    })
    
    if (!response.ok) {
      const errorMessage = await parseApiError(response, 'Failed to submit comment')
      throw new Error(errorMessage)
    }
    
    showToast('Comment added successfully', false)
    newComment.value = ''
    
    // Reload lint detail to get updated comments
    await loadLintDetail(selectedLintResult.value.id)
    
    // Refresh the list
    await loadLinkedContent()
  } catch (err: any) {
    showToast(`Failed to submit comment: ${err.message}`, true)
  } finally {
    commentSubmitting.value = false
  }
}

const specSearch = ref('')
const checklistSearch = ref('')
const selectedSpecToLink = ref<string | number | null>(null)
const selectedChecklistToLink = ref<string | number | null>(null)
const allSpecs = ref<LinkedSpec[]>([])
const allChecklists = ref<LinkedChecklist[]>([])

// Fetch all specs and checklists on mount (for linking)

const filteredUnlinkedSpecs = computed(() => {
  // Get all linked spec IDs from multiple sources
  const linkedIds = new Set<string | number>()
  
  // From project.value.specs or spec_ids
  if (project.value?.specs) {
    project.value.specs.forEach((s: any) => {
      const id = typeof s === 'object' && s !== null ? s.id : s
      linkedIds.add(id)
    })
  }
  if (project.value?.spec_ids) {
    project.value.spec_ids.forEach((id: any) => linkedIds.add(id))
  }
  
  // From linkedSpecifications (from linked-content API)
  linkedSpecifications.value.forEach((spec: any) => {
    const id = typeof spec === 'object' && spec !== null ? spec.id : spec
    linkedIds.add(id)
  })
  
  // From dashboardData.specs (currently displayed specs)
  dashboardData.value.specs.forEach((spec: any) => {
    linkedIds.add(spec.id)
  })
  
  // Filter out linked specs and apply search
  return allSpecs.value.filter(spec => {
    const isNotLinked = !linkedIds.has(spec.id)
    const matchesSearch = !specSearch.value || 
      spec.name?.toLowerCase().includes(specSearch.value.toLowerCase()) || 
      spec.file_name?.toLowerCase().includes(specSearch.value.toLowerCase()) || 
      String(spec.id).includes(specSearch.value)
    return isNotLinked && matchesSearch
  })
})
const filteredUnlinkedChecklists = computed(() => {
  // Get all linked checklist IDs from multiple sources
  const linkedIds = new Set<string | number>()
  
  // From project.value.checklists or checklist_ids
  if (project.value?.checklists) {
    project.value.checklists.forEach((c: any) => {
      const id = typeof c === 'object' && c !== null ? c.id : c
      linkedIds.add(String(id))
    })
  }
  if (project.value?.checklist_ids) {
    project.value.checklist_ids.forEach((id: any) => linkedIds.add(String(id)))
  }
  
  // From linkedChecklists (from linked-content API)
  linkedChecklists.value.forEach((checklist: any) => {
    const id = typeof checklist === 'object' && checklist !== null ? checklist.id : checklist
    linkedIds.add(String(id))
  })
  
  // Filter out linked checklists and apply search
  return allChecklists.value.filter(checklist => {
    const isNotLinked = !linkedIds.has(String(checklist.id))
    const matchesSearch = !checklistSearch.value || 
      checklist.name?.toLowerCase().includes(checklistSearch.value.toLowerCase()) || 
      String(checklist.id).includes(checklistSearch.value)
    return isNotLinked && matchesSearch
  })
})

async function linkSelectedSpec(item: LinkedSpec) {
  if (!project.value) return
  const projectId = project.value.id
  try {
    const response = await authenticatedFetch(`/api/v1/projects/${projectId}/specifications/${item.id}/link`, {
      method: 'POST'
    })
    
    if (!response.ok) {
      // Handle 401 errors
      if (response.status === 401) {
        const errorText = await response.text()
        if (errorText.includes('Token has expired') || errorText.includes('Invalid token') || errorText.includes('User not found')) {
          showToast('Authentication failed. Redirecting to login...', true)
          setTimeout(() => {
            router.push('/login')
          }, 2000)
          return
        }
      }
      throw new Error(await response.text() || 'Failed to link spec')
    }
    
    closeLinkModal()
    // Refresh both linked content and dashboard data to update the UI
    await loadLinkedContent()
    await loadDashboardData(projectId)
    await loadQualityScore(projectId) // Refresh quality score after linking
    showToast(`Spec "${item.name || `Spec ${item.id}`}" has been linked successfully.`, false)
  } catch (e: any) {
    showToast(`Failed to link spec: ${e.message || e}`, true)
  }
}
async function linkSelectedChecklist(item: LinkedChecklist) {
  console.log('🔗 linkSelectedChecklist called with item:', item)
  
  // Get project ID from route if project.value is not available
  const projectId = project.value?.id || route.params.id as string
  if (!projectId) {
    console.error('❌ No project ID found')
    showToast('Project not found. Please refresh the page.', true)
    return
  }
  
  console.log('✅ Project ID:', projectId)
  const checklistId = item.id
  const checklistName = item.name || `Checklist ${checklistId}`
  
  try {
    // Use correct endpoint: POST /api/v1/projects/{project_id}/checklists/{checklist_id}/link
    const url = `/api/v1/projects/${projectId}/checklists/${checklistId}/link`
    console.log('🔗 Making POST request to:', url)
    
    const response = await authenticatedFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📡 Response status:', response.status, response.ok)
    
    if (!response.ok) {
      // Handle 401 errors
      if (response.status === 401) {
        const errorText = await response.text()
        console.error('❌ 401 Unauthorized:', errorText)
        if (errorText.includes('Token has expired') || errorText.includes('Invalid token') || errorText.includes('User not found')) {
          showToast('Authentication failed. Redirecting to login...', true)
          setTimeout(() => {
            router.push('/login')
          }, 2000)
          return
        }
      }
      const errorText = await response.text()
      console.error('❌ Failed to link checklist:', response.status, errorText)
      throw new Error(errorText || 'Failed to link checklist')
    }
    
    console.log('✅ Checklist linked successfully, refreshing data...')
    closeLinkModal()
    // Refresh both linked content and dashboard data to update the UI
    await loadLinkedContent()
    await loadDashboardData(projectId)
    await loadQualityScore(projectId) // Refresh quality score after linking
    console.log('✅ Data refreshed successfully')
    showToast(`Checklist "${checklistName}" has been linked successfully.`, false)
  } catch (e: any) {
    console.error('❌ Error linking checklist:', e)
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

// Tab state removed - only one view now
</script>

<style scoped>
/**
 * Fade transition for loading states
 * WHY: Smooth fade in/out prevents jerky appearance when loading state changes
 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

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