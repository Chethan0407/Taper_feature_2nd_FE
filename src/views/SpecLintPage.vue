<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-950">
    <!-- Debug: Component loaded indicator -->
    <div v-if="false" style="position: fixed; top: 0; right: 0; background: red; color: white; padding: 10px; z-index: 9999;">
      SpecLintPage Component Loaded
    </div>
    <Sidebar />
    <div class="ml-64">
      <Header />
      <main class="p-8">
        <div class="mb-10">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">SpecLint Engine</h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">Automate spec quality checks and validation</p>
        </div>
        <!-- Top Section: Two-Column Split -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12 items-start">
          <!-- Rule Builder (Left) -->
          <div class="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-2xl rounded-2xl p-8 flex flex-col gap-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Rule Builder</h2>
            <form @submit.prevent="addRule" class="space-y-6">
          <div>
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Rule Type</label>
                <select v-model="ruleForm.ruleType" class="input-field w-full rounded-full px-4 py-2" required>
                      <option value="">Select type</option>
                      <option value="ForbiddenKeyword">Forbidden Keyword</option>
                      <option value="RegexMatch">Regex Match</option>
                      <option value="Naming">Naming</option>
                    </select>
                  </div>
                  <div>
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Pattern</label>
                <input v-model="ruleForm.pattern" class="input-field w-full rounded-full px-4 py-2" placeholder="Pattern or keyword" required />
                  </div>
                  <div>
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Severity</label>
                <select v-model="ruleForm.severity" class="input-field w-full rounded-full px-4 py-2" required>
                      <option value="error">Error</option>
                      <option value="warning">Warning</option>
                    </select>
              </div>
              <button class="btn-primary w-full text-base font-semibold py-3 flex items-center justify-center gap-2 transition-transform active:scale-95" type="submit" :disabled="ruleLoading">
                <span>➕</span> <span>{{ ruleLoading ? 'Adding...' : 'Add Rule' }}</span>
              </button>
              <transition name="fade">
                <div v-if="ruleError || ruleSuccess" class="min-h-[40px]">
                  <div v-if="ruleError" class="text-red-500 mt-2 p-2 rounded bg-red-100 dark:bg-red-900/30 text-sm font-medium">{{ ruleError }}</div>
                  <div v-if="ruleSuccess" class="text-green-600 mt-2 p-2 rounded bg-green-100 dark:bg-green-900/30 text-sm font-medium">{{ ruleSuccess }}</div>
                </div>
              </transition>
            </form>
          </div>
          <!-- Validate Spec (Right) -->
          <div class="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-2xl rounded-2xl p-8 flex flex-col gap-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Validate Spec</h2>
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Spec ID</label>
              <select v-model="specId" class="input-field w-full rounded-full px-4 py-2" :disabled="loadingSpecs">
                  <option value="">Select a spec...</option>
                  <option v-if="loadingSpecs" value="" disabled>Loading specs...</option>
                  <option v-for="spec in allAvailableSpecs" :key="spec.id" :value="spec.id">
                    {{ formatSpecDisplayName(spec) }}
                  </option>
                </select>
              </div>
            <button class="btn-primary w-full text-base font-semibold py-3 flex items-center justify-center gap-2 transition-transform active:scale-95 mb-2" @click="runLinter" :disabled="runningLint || !specId">
              <span>🧪</span> <span>{{ runningLint ? 'Running...' : 'Run Linter' }}</span>
            </button>
            <transition name="fade">
              <div v-if="lintError || lintSuccess || linkingToProject || linkingError" class="min-h-[40px]">
                <div v-if="lintError" class="text-red-500 mb-2 p-2 rounded bg-red-100 dark:bg-red-900/30 text-sm font-medium">{{ lintError }}</div>
                
                <!-- Linking Status -->
                <div v-if="linkingToProject" class="text-blue-600 mb-2 p-2 rounded bg-blue-100 dark:bg-blue-900/30 text-sm font-medium flex items-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Linking lint result to {{ projectName }}...
                </div>
                
                <!-- Linking Error -->
                <div v-if="linkingError" class="text-orange-600 mb-2 p-2 rounded bg-orange-100 dark:bg-orange-900/30 text-sm font-medium">
                  <p class="mb-2">{{ linkingError }}</p>
                  <button 
                    v-if="createdLintResultId"
                    @click="retryLinking" 
                    class="text-sm underline hover:no-underline"
                  >
                    Try linking again
                  </button>
                </div>
                
                <!-- Success Message -->
                <div v-if="lintSuccess && !linkingToProject" class="text-green-600 mb-2 p-2 rounded bg-green-100 dark:bg-green-900/30 text-sm font-medium">
                  <p>{{ lintSuccess }}</p>
                  
                  <!-- Lint Result Summary Preview -->
                  <div v-if="lintResults.length > 0 && projectId && createdLintResultId" class="mt-3 p-3 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Lint Result Summary</h4>
                    <div class="space-y-1 text-xs">
                      <div class="flex items-center justify-between">
                        <span class="text-gray-600 dark:text-gray-400">Total Issues:</span>
                        <span class="font-medium text-gray-900 dark:text-white">{{ lintResults.length }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-gray-600 dark:text-gray-400">Errors:</span>
                        <span class="font-medium text-red-600">{{ lintResults.filter(r => r.severity === 'error').length }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-gray-600 dark:text-gray-400">Warnings:</span>
                        <span class="font-medium text-yellow-600">{{ lintResults.filter(r => r.severity === 'warning').length }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Back to Project button if we came from a project -->
                  <div v-if="projectId && createdLintResultId" class="mt-3 space-y-2">
                    <button 
                      @click="goBackToProject" 
                      class="w-full px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                      </svg>
                      Back to {{ projectName }}
                    </button>
                    
                    <!-- Auto-navigate countdown -->
                    <div v-if="autoNavigateCountdown !== null && autoNavigateCountdown > 0" class="text-center text-xs text-gray-500 dark:text-gray-400">
                      Auto-navigating in {{ autoNavigateCountdown }}s... 
                      <button @click="cancelAutoNavigate" class="text-blue-600 hover:underline">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
            <div v-if="lintResults.length > 0" class="space-y-3 mt-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900 dark:text-white">Lint Results ({{ lintResults.length }} issue{{ lintResults.length !== 1 ? 's' : '' }})</h3>
              </div>

              <!-- Action Buttons Section -->
              <div class="mb-6 space-y-4">
                <!-- Search Bar -->
                <div class="relative">
                  <input
                    v-model="searchTerm"
                    type="text"
                    class="input-field w-full pr-10"
                    placeholder="Search issues by message, pattern, or rule type..."
                  />
                  <button
                    v-if="searchTerm"
                    @click="searchTerm = ''"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                <!-- Statistics Summary -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ filteredAndSortedResults.length }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Total Issues</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-red-600">{{ filteredAndSortedResults.filter(r => r.severity === 'error').length }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Errors</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-yellow-600">{{ filteredAndSortedResults.filter(r => r.severity === 'warning').length }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Warnings</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600">{{ new Set(filteredAndSortedResults.map(r => r.ruleType)).size }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Rule Types</div>
                  </div>
                </div>

                <!-- Action Buttons Row -->
                <div class="flex flex-wrap items-center gap-3">
                  <!-- Save Results Button (if not auto-saved) -->
                <button
                  v-if="!createdLintResultId"
                  @click="saveLintResults"
                  :disabled="savingResults"
                  class="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ savingResults ? 'Saving...' : '💾 Save Results' }}
                </button>

                <!-- Manual Link to Project Button -->
                <button
                  v-if="createdLintResultId && !projectId"
                  @click="showLinkModal = true"
                  class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                  </svg>
                  🔗 Link to Project
                </button>

                  <!-- Export Results Dropdown -->
                  <div class="relative">
                    <button
                      @click="exportResults"
                      :disabled="exportingResults"
                      class="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                      {{ exportingResults ? 'Exporting...' : '📥 Export' }}
                    </button>
                    <div class="absolute top-full left-0 mt-1 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-lg shadow-lg z-10 min-w-[150px] hidden group-hover:block">
                      <button @click="exportResults" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-800 text-sm">Export JSON</button>
                      <button @click="exportToCSV" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-800 text-sm">Export CSV</button>
                    </div>
                  </div>

                  <!-- Share/Copy Link -->
                  <button
                    v-if="createdLintResultId"
                    @click="shareLintResult"
                    class="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                    </svg>
                    🔗 Share
                  </button>

                <!-- View History -->
                <button
                  @click="toggleHistory"
                  class="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  📜 View History
                </button>

                <!-- Filter by Severity -->
                <select
                  v-model="filterSeverity"
                  class="px-3 py-2 text-sm border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                >
                  <option :value="null">All Severities</option>
                  <option value="error">Errors Only</option>
                  <option value="warning">Warnings Only</option>
                </select>

                <!-- Sort Options -->
                <select
                  v-model="sortBy"
                  class="px-3 py-2 text-sm border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                >
                  <option value="line">Sort by Line</option>
                  <option value="severity">Sort by Severity</option>
                  <option value="ruleType">Sort by Rule Type</option>
                </select>
              </div>
              </div>
              </div>

              <!-- Lint History Section -->
              <div v-if="showHistory" class="mb-6 p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-semibold text-gray-900 dark:text-white">Previous Lint Runs</h4>
                  <button
                    v-if="selectedHistoryItem"
                    @click="selectedHistoryItem = null; showCompareModal = false"
                    class="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Close Comparison
                  </button>
                </div>
                <div v-if="lintHistory.length === 0" class="text-gray-500 text-sm">
                  No previous lint runs found
                </div>
                <div v-else class="space-y-2">
                  <div
                    v-for="historyItem in lintHistory"
                    :key="historyItem.id"
                    class="p-3 bg-white dark:bg-dark-900 rounded border border-gray-200 dark:border-dark-700"
                    :class="{ 'ring-2 ring-blue-500': selectedHistoryItem?.id === historyItem.id }"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <span class="text-sm font-medium">Run #{{ historyItem.id }}</span>
                        <span class="text-xs text-gray-500 ml-2">{{ formatDateShort(historyItem.created_at) }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500">{{ historyItem.issues_count || 0 }} issues</span>
                        <button
                          @click="selectHistoryForCompare(historyItem)"
                          class="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                        >
                          {{ selectedHistoryItem?.id === historyItem.id ? 'Selected' : 'Compare' }}
                        </button>
                      </div>
                    </div>
                  </div>
                  <!-- Pagination -->
                  <div v-if="Math.ceil(historyTotal / historyPageSize) > 1" class="flex items-center justify-between mt-4">
                    <div class="text-sm text-gray-500">
                      Page {{ historyPage }} of {{ Math.ceil(historyTotal / historyPageSize) }}
                    </div>
                    <div class="flex gap-2">
                      <button
                        @click="historyPage = Math.max(1, historyPage - 1); fetchLintHistory()"
                        :disabled="historyPage === 1"
                        class="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <button
                        @click="historyPage++; fetchLintHistory()"
                        :disabled="historyPage >= Math.ceil(historyTotal / historyPageSize)"
                        class="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Group by severity -->
              <div v-for="(group, severity) in groupedFilteredResults" :key="severity" class="mb-4">
                <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 capitalize">{{ severity }}s ({{ group.length }})</h4>
                <div class="space-y-2">
                  <div v-for="(result, index) in group" :key="`${severity}-${index}`" class="p-3 bg-gray-50 dark:bg-dark-800 rounded-lg border-l-4" :class="getResultBorderClass(result.severity || severity)">
                <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="text-sm font-medium" :class="getResultTextClass(result.severity || severity)">
                      {{ result.message }}
                    </p>
                        <div class="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span v-if="result.line">
                            <button 
                              @click="navigateToLine(result.line)"
                              class="hover:text-blue-500 hover:underline cursor-pointer mr-2"
                            >
                              📍 Line {{ result.line }}
                            </button>
                            <button
                              v-if="specId && result.line"
                              @click="viewSpecContext(specId, result.line)"
                              class="hover:text-blue-500 hover:underline cursor-pointer text-xs"
                              :disabled="result.line ? loadingContext[result.line] : false"
                            >
                              {{ loadingContext[result.line] ? 'Loading...' : 'View Context' }}
                            </button>
                          </span>
                          <span v-if="result.ruleType">Rule: {{ result.ruleType }}</span>
                          <span v-if="result.pattern">Pattern: {{ result.pattern }}</span>
                  </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <span :class="getResultBadgeClass(result.severity || severity)" class="px-2 py-1 rounded text-xs font-medium">
                          {{ result.severity || severity }}
                  </span>
                        <!-- Action buttons for each issue -->
                        <div class="flex items-center gap-1">
                          <button
                            @click="copyIssueDetails(result)"
                            class="p-1 text-gray-400 hover:text-purple-500 transition-colors"
                            title="Copy issue details"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                            </svg>
                          </button>
                          <button
                            v-if="result.ruleType"
                            @click="viewRuleDetails(result.ruleType || '', result.pattern || '')"
                            class="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            title="View rule details"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </button>
                          <button
                            v-if="createdLintResultId"
                            @click="toggleComments(index)"
                            class="p-1 text-gray-400 hover:text-green-500 transition-colors"
                            title="View/add comments"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                            <span v-if="comments[index]?.length" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{{ comments[index].length }}</span>
                          </button>
                </div>
              </div>
            </div>
                    <!-- Comments Section -->
                    <div v-if="showComments[index]" class="mt-3 pt-3 border-t border-gray-200 dark:border-dark-700">
                      <div v-if="!comments[index] || comments[index].length === 0" class="text-sm text-gray-500 mb-2">
                        No comments yet. Be the first to comment!
                      </div>
                      <div v-else class="space-y-2 mb-3">
                        <div
                          v-for="comment in comments[index]"
                          :key="comment.id"
                          class="p-2 bg-gray-100 dark:bg-dark-700 rounded text-sm"
                        >
                          <div class="flex items-start justify-between">
                            <div class="flex-1">
                              <div class="font-medium text-gray-900 dark:text-white">{{ comment.user_name || 'Anonymous' }}</div>
                              <div v-if="editingCommentId !== comment.id" class="text-gray-700 dark:text-gray-300 mt-1">{{ comment.content }}</div>
                              <input
                                v-else
                                v-model="editingCommentText"
                                class="w-full mt-1 px-2 py-1 border border-gray-300 dark:border-dark-600 rounded bg-white dark:bg-dark-800"
                                @keyup.enter="saveEditedComment(comment.id)"
                                @keyup.esc="editingCommentId = null"
                              />
                              <div class="text-xs text-gray-500 mt-1">{{ formatDateShort(comment.created_at) }}</div>
                            </div>
                            <div v-if="editingCommentId !== comment.id" class="flex gap-1">
                              <button
                                @click="startEditComment(comment)"
                                class="p-1 text-gray-400 hover:text-blue-500"
                                title="Edit comment"
                              >
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                              </button>
                              <button
                                @click="deleteComment(comment.id)"
                                :disabled="deletingCommentId === comment.id"
                                class="p-1 text-gray-400 hover:text-red-500"
                                title="Delete comment"
                              >
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                              </button>
                            </div>
                            <div v-else class="flex gap-1">
                              <button
                                @click="saveEditedComment(comment.id)"
                                class="p-1 text-green-500 hover:text-green-600"
                                title="Save"
                              >
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                              </button>
                              <button
                                @click="editingCommentId = null"
                                class="p-1 text-gray-500 hover:text-gray-600"
                                title="Cancel"
                              >
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        @click="commentOnIssue(index)"
                        class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        + Add Comment
                      </button>
                    </div>
                    <!-- Spec Context -->
                    <div v-if="result.line && specContext[result.line]" class="mt-3 pt-3 border-t border-gray-200 dark:border-dark-700">
                      <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">File Context (Line {{ result.line }}):</div>
                      <pre class="text-xs bg-gray-100 dark:bg-dark-700 p-2 rounded overflow-x-auto">{{ specContext[result.line] }}</pre>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>

        <!-- Comparison Modal -->
        <div
          v-if="showCompareModal && compareLintRuns"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          @click.self="showCompareModal = false"
        >
          <div class="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">Compare Lint Runs</h3>
              <button @click="showCompareModal = false" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div class="text-2xl font-bold text-green-600">{{ compareLintRuns.fixed.length }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Fixed Issues</div>
              </div>
              <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div class="text-2xl font-bold text-red-600">{{ compareLintRuns.new.length }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">New Issues</div>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ compareLintRuns.unchanged.length }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Unchanged</div>
              </div>
            </div>

            <!-- New Issues -->
            <div v-if="compareLintRuns.new.length > 0" class="mb-4">
              <h4 class="font-semibold text-red-600 mb-2">New Issues ({{ compareLintRuns.new.length }})</h4>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="(issue, idx) in compareLintRuns.new"
                  :key="idx"
                  class="p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm"
                >
                  <div class="font-medium">Line {{ issue.line }}: {{ issue.message }}</div>
                  <div class="text-xs text-gray-500">{{ issue.ruleType }}</div>
                </div>
              </div>
            </div>

            <!-- Fixed Issues -->
            <div v-if="compareLintRuns.fixed.length > 0" class="mb-4">
              <h4 class="font-semibold text-green-600 mb-2">Fixed Issues ({{ compareLintRuns.fixed.length }})</h4>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="(issue, idx) in compareLintRuns.fixed"
                  :key="idx"
                  class="p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm"
                >
                  <div class="font-medium">Line {{ issue.line }}: {{ issue.message }}</div>
                  <div class="text-xs text-gray-500">{{ issue.ruleType }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- All Rules Section -->
        <div class="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-2xl rounded-2xl p-8 w-full">
          <EnterpriseFilterBar
            :filters="filterConfig"
            :activeFilters="ruleFilters"
            @filter-change="handleRuleFilterChange"
            @reset="resetRuleFilters"
          />
          <!-- All Rules Table Section: Debounced loader and scrollable table -->
          <div>
            <div v-if="showLoader" class="text-gray-400 p-8">Loading rules...</div>
            <div v-else-if="filteredRules.length === 0" class="flex flex-col items-center justify-center py-16">
              <svg class="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
              <div class="text-lg text-gray-500 dark:text-gray-400 font-medium">No rules found. Try adjusting your filters.</div>
            </div>
            <div v-else class="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar transition-all duration-200">
              <table class="w-full text-sm border-separate border-spacing-0">
                <thead class="sticky top-0 z-10 bg-white dark:bg-dark-900">
                  <tr class="border-b border-gray-200 dark:border-dark-700">
                    <th class="p-4 text-left text-gray-700 dark:text-gray-300 font-semibold">ID</th>
                    <th class="p-4 text-left text-gray-700 dark:text-gray-300 font-semibold">Rule Type</th>
                    <th class="p-4 text-left text-gray-700 dark:text-gray-300 font-semibold">Pattern</th>
                    <th class="p-4 text-left text-gray-700 dark:text-gray-300 font-semibold">Severity</th>
                    <th class="p-4 text-left text-gray-700 dark:text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rule in filteredRules" :key="rule.id" class="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-800/40 transition-colors">
                    <td class="p-4 font-mono text-gray-500 dark:text-gray-400">{{ rule.id }}</td>
                    <td class="p-4 font-medium text-gray-900 dark:text-white">{{ rule.rule_type }}</td>
                    <td class="p-4 font-mono text-blue-600 dark:text-blue-400 underline cursor-pointer" @click="copyPattern(rule.pattern)" :title="'Click to copy: ' + rule.pattern">{{ rule.pattern }}</td>
                    <td class="p-4">
                      <span :class="rule.severity === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded text-xs font-semibold' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded text-xs font-semibold'">
                        {{ rule.severity.charAt(0).toUpperCase() + rule.severity.slice(1) }}
                      </span>
                    </td>
                    <td class="p-4">
                      <div class="flex items-center gap-2">
                        <button
                          @click="editRule(rule)"
                          class="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                          title="Edit rule"
                        >
                          Edit
                        </button>
                        <button
                          v-if="rule.id"
                          @click="deleteRule(rule.id)"
                          class="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                          :disabled="deletingRuleId === rule.id"
                          title="Delete rule"
                        >
                          {{ deletingRuleId === rule.id ? 'Deleting...' : 'Delete' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                  <!-- Spacer row for bottom padding -->
                  <tr aria-hidden="true"><td colspan="5" style="height:2.5rem;"></td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- Pagination controls below the table -->
          <div v-if="totalPages > 1" class="flex flex-wrap items-center justify-between mt-4 gap-4">
            <div class="text-gray-500 dark:text-gray-400 text-sm">
              Showing page {{ page }} of {{ totalPages }} ({{ totalResults }} rules)
            </div>
            <div class="flex items-center gap-2">
              <button class="btn-secondary px-3 py-1" :disabled="!canPrev" @click="page = page - 1">Prev</button>
              <button v-for="n in pageNumbers" :key="n" class="btn-secondary px-3 py-1" :class="{ 'bg-blue-100 dark:bg-blue-900/30 font-bold': n === page }" @click="page = n">{{ n }}</button>
              <button class="btn-secondary px-3 py-1" :disabled="!canNext" @click="page = page + 1">Next</button>
            </div>
            <div>
              <select v-model="pageSize" class="input-field max-w-[90px] rounded-full">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <!-- Edit Rule Modal -->
    <Transition name="modal">
      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click.self="showEditModal = false">
        <div class="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-8 w-full max-w-md">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Rule</h3>
          <form @submit.prevent="updateRule" class="space-y-6">
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Rule Type</label>
              <select v-model="ruleForm.ruleType" class="input-field w-full rounded-full px-4 py-2" required>
                <option value="">Select type</option>
                <option value="ForbiddenKeyword">Forbidden Keyword</option>
                <option value="RegexMatch">Regex Match</option>
                <option value="Naming">Naming</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Pattern</label>
              <input v-model="ruleForm.pattern" class="input-field w-full rounded-full px-4 py-2" placeholder="Pattern or keyword" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Severity</label>
              <select v-model="ruleForm.severity" class="input-field w-full rounded-full px-4 py-2" required>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
              </select>
            </div>
            <div class="flex gap-3">
              <button type="button" @click="showEditModal = false; editingRule = null; ruleForm = { ruleType: '', pattern: '', severity: 'error' }" class="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" class="btn-primary flex-1" :disabled="ruleLoading">
                {{ ruleLoading ? 'Updating...' : 'Update Rule' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import EnterpriseFilterBar from '@/components/Common/EnterpriseFilterBar.vue'
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSpecificationsStore } from '@/stores/specifications'
import { authenticatedFetch } from '@/utils/auth-requests'
import { apiClient, parseApiError } from '@/utils/api-client'

interface LintResult {
  id?: string
  ruleType?: string
  pattern?: string
  line?: number
  message: string
  severity: 'error' | 'warning' | 'info'
  type?: 'error' | 'warning' | 'info' // Legacy support
  rule?: string // Legacy support
}

interface LintRule {
  id?: string
  ruleType: string
  rule_type?: string // Add this line to support backend snake_case
  pattern: string
  severity: string
}

// Initialize route and router
const route = useRoute()
const router = useRouter()

const lintResults = ref<LintResult[]>([])
const rules = ref<LintRule[]>([])
const ruleForm = ref<LintRule>({ ruleType: '', pattern: '', severity: 'error' })
const ruleLoading = ref(false) // For adding/updating/deleting rules
const fetchingRules = ref(false) // For fetching the list of rules
const showLoader = ref(false)
let loaderTimeout: ReturnType<typeof setTimeout> | null = null
const ruleError = ref('')
const ruleSuccess = ref('')
const runningLint = ref(false)
const lintError = ref('')
const lintSuccess = ref('')
const linkingToProject = ref(false)
const linkingError = ref('')
const autoNavigateCountdown = ref<number | null>(null)
const specId = ref('')
const ruleSearch = ref('')
const typeFilter = ref('')
const severityFilter = ref('')
const page = ref(1)
const pageSize = ref(20)
const totalResults = ref(0)
const totalPages = computed(() => Math.ceil(totalResults.value / pageSize.value) || 1)

// Project context from route query
const projectId = computed(() => route.query.projectId || route.query.project)
const projectName = computed(() => route.query.projectName as string || 'Project')
const createdLintResultId = ref<number | string | null>(null)

// Additional state for lint result actions
const savingResults = ref(false)
const showLinkModal = ref(false)
const filterSeverity = ref<string | null>(null)
const sortBy = ref<'line' | 'severity' | 'ruleType'>('line')
const lintHistory = ref<any[]>([])
const showHistory = ref(false)
const exportingResults = ref(false)
const searchTerm = ref('')
const comments = ref<Record<number, any[]>>({})
const showComments = ref<Record<number, boolean>>({})
const editingCommentId = ref<number | null>(null)
const editingCommentText = ref('')
const deletingCommentId = ref<number | null>(null)
const historyPage = ref(1)
const historyPageSize = ref(10)
const historyTotal = ref(0)
const selectedHistoryItem = ref<any>(null)
const showCompareModal = ref(false)
const specContext = ref<Record<number, string>>({})
const loadingContext = ref<Record<number, boolean>>({})

const filteredRules = computed(() => rules.value) // Now always server-side

const authStore = useAuthStore()
const specificationsStore = useSpecificationsStore()
const availableSpecs = computed(() => specificationsStore.specifications)

// Fetch specs from both endpoints
const allAvailableSpecs = ref<any[]>([])
const loadingSpecs = ref(false)
const deletingRuleId = ref<string | null>(null)
const editingRule = ref<LintRule | null>(null)
const showEditModal = ref(false)

// Fetch all available specs
const fetchAllSpecs = async () => {
  console.log('🔵 fetchAllSpecs: Starting to fetch specs...')
  loadingSpecs.value = true
  try {
    // Only fetch from /api/v1/specifications/ (UUID-based specs)
    // Note: GET /api/v1/specs/ does not exist - removed that call
    const url = '/api/v1/specifications/'
    console.log('🔵 fetchAllSpecs: Calling API:', url)
    const specificationsRes = await authenticatedFetch(url).catch((err) => {
      console.error('❌ fetchAllSpecs: API call failed:', err)
      return null
    })
    
    console.log('🔵 fetchAllSpecs: Response received:', specificationsRes ? `status: ${specificationsRes.status}, ok: ${specificationsRes.ok}` : 'null')
    
    const specs: any[] = []
    
    // Add specifications (UUIDs)
    if (specificationsRes && specificationsRes.ok) {
      const specificationsData = await specificationsRes.json()
      console.log('🔵 fetchAllSpecs: Parsed data:', Array.isArray(specificationsData) ? `${specificationsData.length} items` : 'not an array')
      if (Array.isArray(specificationsData)) {
        specs.push(...specificationsData.map((s: any) => ({ ...s, source: 'specifications' })))
      }
    } else if (specificationsRes) {
      const errorText = await specificationsRes.text().catch(() => 'Unknown error')
      console.error('❌ fetchAllSpecs: API error:', specificationsRes.status, errorText)
    }
    
    allAvailableSpecs.value = specs
    console.log('✅ fetchAllSpecs: Loaded', specs.length, 'specs for dropdown')
  } catch (e: any) {
    console.error('❌ fetchAllSpecs: Error:', e)
    // Fallback to specifications store
    allAvailableSpecs.value = specificationsStore.specifications.map((s: any) => ({ ...s, source: 'specifications' }))
  } finally {
    loadingSpecs.value = false
  }
}

// Format spec display name
const formatSpecDisplayName = (spec: any) => {
  const name = spec.name || spec.file_name || 'Unnamed Spec'
  const id = spec.id
  const idDisplay = typeof id === 'string' && id.length > 8 ? `ID: ${id.slice(0, 8)}...` : `ID: ${id}`
  return `${name} (${idDisplay})`
}

const fetchRules = async () => {
  console.log('🔵 fetchRules: Starting to fetch rules...')
  fetchingRules.value = true // Use separate loading state for fetching
  ruleError.value = ''
  if (loaderTimeout) clearTimeout(loaderTimeout)
  showLoader.value = false
  loaderTimeout = setTimeout(() => {
    if (fetchingRules.value) showLoader.value = true
  }, 300)
  try {
    const params = new URLSearchParams()
    params.append('page', String(page.value))
    params.append('page_size', String(pageSize.value))
    if (ruleFilters.value.search) params.append('search', ruleFilters.value.search)
    if (ruleFilters.value.rule_type) params.append('type', ruleFilters.value.rule_type)
    if (ruleFilters.value.severity) params.append('severity', ruleFilters.value.severity)
    const url = `/api/v1/speclint/rules?${params.toString()}`
    console.log('🔵 fetchRules: Calling API:', url)
    const res = await authenticatedFetch(url)
    console.log('🔵 fetchRules: Response status:', res.status, 'ok:', res.ok)
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error')
      console.error('❌ fetchRules: API error:', res.status, errorText)
      throw new Error(`Failed to fetch rules: ${res.status}`)
    }
    const data = await res.json()
    console.log('✅ fetchRules: Success! Loaded', (data.results || []).length, 'rules')
    rules.value = data.results || []
    totalResults.value = data.pagination?.total || data.pagination?.total_results || 0
  } catch (e: any) {
    console.error('❌ fetchRules: Error:', e)
    ruleError.value = e.message || 'Failed to fetch rules'
  } finally {
    fetchingRules.value = false // Use separate loading state for fetching
    if (loaderTimeout) clearTimeout(loaderTimeout)
    setTimeout(() => { showLoader.value = false }, 100) // hide loader after render
  }
}

interface RuleFilters {
  [key: string]: string;
  search: string;
  rule_type: string;
  severity: string;
  created_from: string;
  created_to: string;
}
const ruleFilters = ref<RuleFilters>({
  search: '',
  rule_type: '',
  severity: '',
  created_from: '',
  created_to: ''
})
const filterConfig = [
  { type: 'search', label: 'Search rules...', key: 'search' },
  { type: 'dropdown', label: 'Rule Type', key: 'rule_type', options: ['ForbiddenKeyword', 'RegexMatch', 'Naming'] },
  { type: 'dropdown', label: 'Severity', key: 'severity', options: ['error', 'warning'] },
  { type: 'date', label: 'Created From', key: 'created_from' },
  { type: 'date', label: 'Created To', key: 'created_to' }
]
function handleRuleFilterChange({ key, value }: { key: string, value: string }) {
  ruleFilters.value[key] = value
}
function resetRuleFilters() {
  ruleFilters.value = { search: '', rule_type: '', severity: '', created_from: '', created_to: '' }
}
// Watch for filter changes and refetch rules
watch(ruleFilters, () => {
  page.value = 1
  fetchRules()
}, { deep: true })
watch([page], () => {
  fetchRules()
})

onMounted(async () => {
  console.log('🔵🔵🔵 SpecLintPage: Component MOUNTED - Starting initialization...')
  console.log('🔵 SpecLintPage: Route:', route.path, route.name)
  console.log('🔵 SpecLintPage: Token exists:', !!authStore.token)
  
  try {
    console.log('🔵 SpecLintPage: Step 1 - Calling fetchRules()...')
    await fetchRules() // Make it await so we can see if it completes
    console.log('✅ SpecLintPage: Step 1 - fetchRules() completed')
    
    console.log('🔵 SpecLintPage: Step 2 - Calling fetchAllSpecs()...')
    try {
      await fetchAllSpecs()
      console.log('✅ SpecLintPage: Step 2 - fetchAllSpecs() completed')
    } catch (fetchError: any) {
      console.error('❌ SpecLintPage: Step 2 - Failed to fetch specs:', fetchError.message, fetchError)
      // Don't throw - continue without specs (user can still use the page)
    }
    
    // Only try to load from store if we don't have any specs yet
    // And wrap in try-catch to prevent any errors from blocking page load
    if (allAvailableSpecs.value.length === 0) {
      console.log('🔵 SpecLintPage: Step 3 - No specs from fetchAllSpecs, trying store...')
      try {
        await specificationsStore.loadSpecifications()
        // If store has specs, add them to allAvailableSpecs
        if (specificationsStore.specifications.length > 0) {
          allAvailableSpecs.value = specificationsStore.specifications.map((s: any) => ({ ...s, source: 'store' }))
          console.log('✅ SpecLintPage: Step 3 - Loaded', allAvailableSpecs.value.length, 'specs from store')
        }
      } catch (specError: any) {
        console.error('❌ SpecLintPage: Step 3 - Failed to load specifications from store:', specError.message, specError)
        // Don't throw - continue with empty specs list (user can still use the page)
      }
    }
    console.log('✅✅✅ SpecLintPage: Initialization COMPLETE!')
    console.log('✅ SpecLintPage: Rules loaded:', rules.value.length)
    console.log('✅ SpecLintPage: Specs loaded:', allAvailableSpecs.value.length)
  } catch (error) {
    console.error('❌❌❌ SpecLintPage: CRITICAL ERROR during initialization:', error)
    console.error('❌ SpecLintPage: Error stack:', (error as Error).stack)
  }
})

// Add a new rule
const addRule = async () => {
  ruleLoading.value = true
  ruleError.value = ''
  ruleSuccess.value = ''
  try {
    const res = await authenticatedFetch('/api/v1/speclint/rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ruleType: ruleForm.value.ruleType,
        pattern: ruleForm.value.pattern,
        severity: ruleForm.value.severity
      })
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to add rule')
    }
    ruleSuccess.value = 'Rule added!'
    ruleForm.value = { ruleType: '', pattern: '', severity: 'error' }
    await fetchRules()
  } catch (e: any) {
    ruleError.value = e.message || 'Failed to add rule'
  } finally {
    ruleLoading.value = false
    setTimeout(() => { ruleSuccess.value = '' }, 2000)
  }
}

// Run the linter on a spec
const runLinter = async () => {
  if (!specId.value) {
    lintError.value = 'Please select a spec first'
    return
  }

  runningLint.value = true
  lintError.value = ''
  lintSuccess.value = ''
  lintResults.value = []
  
  try {
    console.log('🧪 Running linter for spec:', specId.value)
    
    // ✅ Use the correct endpoint according to API guide: POST /api/v1/specs/{spec_id}/lint
    const res = await authenticatedFetch(`/api/v1/specs/${specId.value}/lint`, {
      method: 'POST'
    })
    
    console.log('🧪 Linter response:', {
      status: res.status,
      ok: res.ok
    })
    
    // Handle error responses according to API guide
    if (!res.ok) {
      let errorMessage = 'Failed to run linter'
      try {
        const errorData = await res.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch {
        const errorText = await res.text().catch(() => 'Unknown error')
        errorMessage = errorText || errorMessage
      }
      
      // Specific error messages based on status codes
      if (res.status === 400) {
        errorMessage = errorMessage || 'Invalid spec ID format or file error'
      } else if (res.status === 403) {
        errorMessage = errorMessage || "You don't have access to this specification"
      } else if (res.status === 404) {
        errorMessage = errorMessage || 'Specification not found'
      } else if (res.status === 422) {
        errorMessage = errorMessage || 'Validation error. Please check the request format.'
      } else if (res.status === 401) {
        errorMessage = 'Authentication failed. Please refresh the page and log in again.'
      }
      
      lintError.value = errorMessage
      console.error('❌ Linter failed:', errorMessage, 'Status:', res.status)
      return
    }
    
    const data = await res.json()
    console.log('🧪 Linter data received (full response):', JSON.stringify(data, null, 2))
    
    // According to API guide, response format is: { specId: string, issues: [...] }
    const specIdFromResponse = data.specId
    const issues = data.issues || []
    
    console.log('✅ Linter response processed:', {
      specId: specIdFromResponse,
      issuesCount: issues.length
    })
    
    // Process issues from response
    lintResults.value = issues.map((issue: any) => ({
      ruleType: issue.ruleType || issue.rule_type,
      pattern: issue.pattern,
      line: issue.line,
      message: issue.message,
      severity: issue.severity || 'warning'
    }))
    
    // Note: This endpoint returns results but doesn't save them to DB
    // If user wants to save, they need to use Save Results button
    createdLintResultId.value = null
    
    if (lintResults.value.length === 0) {
      lintSuccess.value = 'No issues found! Spec is valid.'
    } else {
      lintSuccess.value = `Found ${lintResults.value.length} issue${lintResults.value.length !== 1 ? 's' : ''}.`
    }
    
    console.log('✅ Linter completed successfully:', lintResults.value.length, 'issues found')
  } catch (e: any) {
    console.error('❌ Linter error:', e)
    
    // More specific error messages
    if (e.message?.includes('401') || e.message?.includes('Authentication') || e.message?.includes('Not authenticated')) {
      lintError.value = 'Authentication failed. Please refresh the page and log in again.'
    } else if (e.message?.includes('Network') || e.message?.includes('fetch')) {
      lintError.value = 'Network error. Please check your connection and try again.'
    } else {
    lintError.value = e.message || 'Failed to run linter'
    }
  } finally {
    runningLint.value = false
    // Don't auto-hide success message if we have a project context (user might want to click back button)
    if (!projectId.value) {
    setTimeout(() => { lintSuccess.value = '' }, 2000)
    }
  }
}

// Fetch the latest lint result ID for a spec
const fetchLatestLintResultId = async (specIdValue: string | number): Promise<string | number | null> => {
  try {
    console.log('🔍 Fetching latest lint result for spec:', specIdValue)
    // Try multiple query parameter formats
    const urls = [
      `/lint-results/?spec_id=${specIdValue}&ordering=-created_at&limit=1`,
      `/lint-results/?specId=${specIdValue}&ordering=-created_at&limit=1`,
      `/lint-results/?ordering=-created_at&limit=10` // Fallback: get recent and filter client-side
    ]
    
    for (const url of urls) {
      try {
        const res = await apiClient(url)
        
        if (res.ok) {
          const data = await res.json()
          console.log('🔍 Lint results API response:', data)
          
          // Handle both array and paginated response
          let results = Array.isArray(data) ? data : (data.results || [])
          
          // If we got all results, filter by spec_id client-side
          if (url.includes('limit=10')) {
            results = results.filter((r: any) => 
              String(r.spec_id) === String(specIdValue) || 
              String(r.specId) === String(specIdValue)
            )
          }
          
          if (results.length > 0) {
            const latest = results[0]
            console.log('✅ Found latest lint result:', latest.id, 'for spec:', specIdValue)
            return latest.id
          }
        }
      } catch (urlError: any) {
        console.warn(`⚠️ Failed to fetch from ${url}:`, urlError)
        continue
      }
    }
    
    console.warn('⚠️ No lint results found for spec after trying all URL formats')
    return null
  } catch (error: any) {
    console.error('❌ Error fetching latest lint result:', error)
    return null
  }
}

// Link lint result to project
const linkLintResultToProject = async (lintResultId: string | number) => {
  if (!projectId.value) {
    console.warn('⚠️ No project ID available for linking')
    return
  }
  
  try {
    console.log('🔗 Linking lint result', lintResultId, 'to project', projectId.value)
    const res = await apiClient(`/projects/${projectId.value}/lint-results/${lintResultId}/link`, {
      method: 'POST'
    })
    
    if (res.ok) {
      console.log('✅ Lint result linked to project successfully')
      lintSuccess.value = `${lintSuccess.value} Successfully linked to ${projectName.value}.`
      
      // Dispatch event to notify project page to refresh
      window.dispatchEvent(new CustomEvent('project-content-updated', {
        detail: { projectId: projectId.value }
      }))
      
      // Start auto-navigate countdown (5 seconds)
      startAutoNavigate()
    } else {
      const errorText = await res.text().catch(() => 'Unknown error')
      let errorMessage = 'Failed to link lint result to project'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }
      console.warn('⚠️ Failed to link lint result:', res.status, errorMessage)
      throw new Error(errorMessage)
    }
  } catch (error: any) {
    console.error('❌ Error linking lint result:', error)
    throw error
  }
}

// Retry linking
const retryLinking = async () => {
  if (!createdLintResultId.value || !projectId.value) return
  
  linkingError.value = ''
  linkingToProject.value = true
  
  try {
    await linkLintResultToProject(createdLintResultId.value as string | number)
  } catch (error: any) {
    linkingError.value = error.message || 'Failed to link. Please try manually from the project page.'
  } finally {
    linkingToProject.value = false
  }
}

// Auto-navigate countdown
let autoNavigateTimer: ReturnType<typeof setInterval> | null = null

const startAutoNavigate = () => {
  if (!projectId.value) return
  
  autoNavigateCountdown.value = 5
  
  autoNavigateTimer = setInterval(() => {
    if (autoNavigateCountdown.value !== null && autoNavigateCountdown.value > 0) {
      autoNavigateCountdown.value--
    } else {
      if (autoNavigateTimer) {
        clearInterval(autoNavigateTimer)
        autoNavigateTimer = null
      }
      if (autoNavigateCountdown.value === 0) {
        goBackToProject()
      }
    }
  }, 1000)
}

const cancelAutoNavigate = () => {
  if (autoNavigateTimer) {
    clearInterval(autoNavigateTimer)
    autoNavigateTimer = null
  }
  autoNavigateCountdown.value = null
}

// Cleanup on component unmount
onBeforeUnmount(() => {
  cancelAutoNavigate()
})

// Navigate back to project
const goBackToProject = () => {
  // Cancel auto-navigate if active
  cancelAutoNavigate()
  
  if (projectId.value) {
    // Dispatch event before navigation to ensure project page refreshes
    window.dispatchEvent(new CustomEvent('project-content-updated', {
      detail: { projectId: projectId.value }
    }))
    router.push(`/projects/${projectId.value}`)
  } else {
    router.push('/projects')
  }
}

// Save lint results to database (for UUID specs or when results weren't auto-saved)
const saveLintResults = async () => {
  if (!specId.value || lintResults.value.length === 0) {
    lintError.value = 'No results to save'
    return
  }
  
  // If already saved (integer spec), don't save again
  if (createdLintResultId.value) {
    lintSuccess.value = 'Lint results already saved!'
    return
  }
  
  savingResults.value = true
  lintError.value = ''
  lintSuccess.value = ''
  
  try {
    const errorCount = lintResults.value.filter(r => r.severity === 'error').length
    const warningCount = lintResults.value.filter(r => r.severity === 'warning').length
    
    // For UUID specs, we need to use a different endpoint to save
    // Check if specId is UUID (contains hyphens) or integer
    const isUUID = String(specId.value).includes('-')
    
    if (isUUID) {
      // UUID spec - use lint-results endpoint to save
      const lintResultData = {
        spec_id: specId.value, // UUID as string
        issues: lintResults.value.map(issue => ({
          severity: issue.severity,
          type: issue.ruleType,
          message: issue.message,
          location: { line: issue.line },
          recommendation: null
        })),
        summary: `Found ${errorCount} error(s), ${warningCount} warning(s)`,
        spec_metadata: {}
      }
      
      const res = await apiClient('/lint-results/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lintResultData)
      })
      
      if (!res.ok) {
        const errorMessage = await parseApiError(res, 'Failed to save lint results')
        throw new Error(errorMessage)
      }
      
      const savedResult = await res.json()
      createdLintResultId.value = savedResult.id
      lintSuccess.value = 'Lint results saved successfully!'
    } else {
      // Integer spec - use /specs/{id}/lint which auto-saves
      // This should have already been saved, but we can call it again
      const res = await apiClient(`/specs/${specId.value}/lint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!res.ok) {
        const errorMessage = await parseApiError(res, 'Failed to save lint results')
        throw new Error(errorMessage)
      }
      
      const savedResult = await res.json()
      
      // Check if it's a LintResult (saved) or LintResultResponse (not saved)
      if ('id' in savedResult) {
        createdLintResultId.value = savedResult.id
        lintSuccess.value = 'Lint results saved successfully!'
      } else {
        lintError.value = 'Results were not saved. Please try again.'
        return
      }
    }
    
    // Auto-link if we have project context
    if (projectId.value && createdLintResultId.value) {
      try {
        linkingToProject.value = true
        await linkLintResultToProject(createdLintResultId.value as string | number)
      } catch (linkError: any) {
        console.warn('Failed to auto-link after save:', linkError)
        linkingError.value = `Results saved but failed to link to project: ${linkError.message || 'Unknown error'}`
      } finally {
        linkingToProject.value = false
      }
    }
  } catch (e: any) {
    lintError.value = e.message || 'Failed to save lint results'
    console.error('Error saving lint results:', e)
  } finally {
    savingResults.value = false
  }
}

// Export results (JSON)
const exportResults = async () => {
  if (lintResults.value.length === 0) {
    lintError.value = 'No results to export'
    return
  }
  
  exportingResults.value = true
  try {
    const errorCount = lintResults.value.filter(r => r.severity === 'error').length
    const warningCount = lintResults.value.filter(r => r.severity === 'warning').length
    
    const data = {
      specId: specId.value,
      timestamp: new Date().toISOString(),
      totalIssues: lintResults.value.length,
      errors: errorCount,
      warnings: warningCount,
      issues: lintResults.value
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lint-results-${specId.value || 'unknown'}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    lintSuccess.value = 'Results exported successfully!'
    setTimeout(() => { lintSuccess.value = '' }, 3000)
  } catch (e: any) {
    lintError.value = 'Failed to export results'
    console.error('Error exporting results:', e)
  } finally {
    exportingResults.value = false
  }
}

// Export to CSV
const exportToCSV = () => {
  if (lintResults.value.length === 0) {
    lintError.value = 'No results to export'
    return
  }
  
  const headers = ['Line', 'Severity', 'Rule Type', 'Message', 'Pattern']
  const rows = lintResults.value.map((issue: any) => [
    issue.line || '',
    issue.severity || '',
    issue.ruleType || '',
    `"${(issue.message || '').replace(/"/g, '""')}"`,
    issue.pattern || ''
  ])
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lint-results-${specId.value || 'unknown'}-${Date.now()}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  lintSuccess.value = 'CSV exported successfully!'
  setTimeout(() => { lintSuccess.value = '' }, 3000)
}

// View lint history
const toggleHistory = async () => {
  showHistory.value = !showHistory.value
  if (showHistory.value && specId.value && lintHistory.value.length === 0) {
    await fetchLintHistory()
  }
}

const fetchLintHistory = async () => {
  if (!specId.value) return
  try {
    const skip = (historyPage.value - 1) * historyPageSize.value
    const res = await apiClient(`/specs/${specId.value}/lint-results?skip=${skip}&limit=${historyPageSize.value}`)
    if (res.ok) {
      const data = await res.json()
      lintHistory.value = Array.isArray(data) ? data : (data.results || [])
      historyTotal.value = Array.isArray(data) ? data.length : (data.total || lintHistory.value.length)
    } else {
      console.warn('Failed to fetch lint history:', res.status)
    }
  } catch (e) {
    console.error('Failed to fetch lint history:', e)
  }
}

// Select history item for comparison
const selectHistoryForCompare = async (historyItem: any) => {
  if (selectedHistoryItem.value?.id === historyItem.id) {
    selectedHistoryItem.value = null
    showCompareModal.value = false
  } else {
    selectedHistoryItem.value = historyItem
    showCompareModal.value = true
    // Fetch full details of selected history item
    try {
      const res = await apiClient(`/lint-results/${historyItem.id}`)
      if (res.ok) {
        selectedHistoryItem.value = await res.json()
      }
    } catch (e) {
      console.error('Failed to fetch history item details:', e)
    }
  }
}

// Compare lint runs
const compareLintRuns = computed(() => {
  if (!selectedHistoryItem.value || !createdLintResultId.value) return null
  
  const currentIssues = lintResults.value
  const previousIssues = selectedHistoryItem.value.issues || []
  
  const currentIssueIds = new Set(currentIssues.map((i: any) => `${i.line}-${i.ruleType}-${i.pattern}`))
  const previousIssueIds = new Set(previousIssues.map((i: any) => `${i.line}-${i.ruleType}-${i.pattern}`))
  
  return {
    new: currentIssues.filter((i: any) => !previousIssueIds.has(`${i.line}-${i.ruleType}-${i.pattern}`)),
    fixed: previousIssues.filter((i: any) => !currentIssueIds.has(`${i.line}-${i.ruleType}-${i.pattern}`)),
    unchanged: currentIssues.filter((i: any) => previousIssueIds.has(`${i.line}-${i.ruleType}-${i.pattern}`))
  }
})

// Navigate to line (if viewing spec file)
const navigateToLine = (lineNumber: number) => {
  // Try to find element with data-line attribute
  const element = document.querySelector(`[data-line="${lineNumber}"]`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    element.classList.add('highlight-line', 'ring-2', 'ring-blue-500')
    setTimeout(() => {
      element.classList.remove('highlight-line', 'ring-2', 'ring-blue-500')
    }, 2000)
    lintSuccess.value = `Scrolled to line ${lineNumber}`
  } else {
    lintSuccess.value = `Line ${lineNumber} - Open spec file to navigate`
  }
  setTimeout(() => { lintSuccess.value = '' }, 3000)
}

// View spec context around line
const viewSpecContext = async (specIdValue: string | number | undefined, lineNumber: number | undefined) => {
  if (!specIdValue || !lineNumber || loadingContext.value[lineNumber]) return
  
  loadingContext.value[lineNumber] = true
  try {
    // Fetch spec file content (this would need backend support)
    const res = await apiClient(`/specs/${specIdValue}/content?line=${lineNumber}&context=5`)
    if (res.ok) {
      const data = await res.json()
      specContext.value[lineNumber] = data.content || data.context || 'Context not available'
    } else {
      specContext.value[lineNumber] = 'Unable to load file context'
    }
  } catch (e) {
    console.error('Failed to fetch spec context:', e)
    specContext.value[lineNumber] = 'Error loading context'
  } finally {
    loadingContext.value[lineNumber] = false
  }
}

// Copy issue details
const copyIssueDetails = (issue: any) => {
  const text = `Line ${issue.line || 'N/A'}: ${issue.message || 'No message'}
Rule: ${issue.ruleType || 'N/A'}
Pattern: ${issue.pattern || 'N/A'}
Severity: ${issue.severity || 'N/A'}`
  
  navigator.clipboard.writeText(text).then(() => {
    lintSuccess.value = 'Issue details copied to clipboard!'
    setTimeout(() => { lintSuccess.value = '' }, 3000)
  }).catch(() => {
    lintError.value = 'Failed to copy to clipboard'
  })
}

// Share lint result
const shareLintResult = () => {
  if (!createdLintResultId.value) {
    lintError.value = 'No lint result to share'
    return
  }
  
  const url = `${window.location.origin}/speclint?lintResultId=${createdLintResultId.value}`
  navigator.clipboard.writeText(url).then(() => {
    lintSuccess.value = 'Link copied to clipboard!'
    setTimeout(() => { lintSuccess.value = '' }, 3000)
  }).catch(() => {
    lintError.value = 'Failed to copy link'
  })
}

// View rule details
const viewRuleDetails = (ruleType: string, pattern: string) => {
  // Find the rule in the rules list
  const rule = rules.value.find(r => 
    (r.ruleType || r.rule_type) === ruleType && r.pattern === pattern
  )
  
  if (rule) {
    lintSuccess.value = `Rule: ${ruleType}, Pattern: ${pattern}, Severity: ${rule.severity}`
  } else {
    lintSuccess.value = `Rule: ${ruleType}, Pattern: ${pattern}`
  }
  setTimeout(() => { lintSuccess.value = '' }, 3000)
}

// Toggle comments display
const toggleComments = async (issueIndex: number) => {
  showComments.value[issueIndex] = !showComments.value[issueIndex]
  
  // Fetch comments if not already loaded
  if (showComments.value[issueIndex] && createdLintResultId.value && !comments.value[issueIndex]) {
    await fetchComments(issueIndex)
  }
}

// Fetch comments for an issue
const fetchComments = async (issueIndex: number) => {
  if (!createdLintResultId.value) return
  
  try {
    const res = await apiClient(`/comments?entity_type=lint_result&entity_id=${createdLintResultId.value}&issue_index=${issueIndex}`)
    if (res.ok) {
      const data = await res.json()
      comments.value[issueIndex] = Array.isArray(data) ? data : (data.results || [])
    }
  } catch (e) {
    console.error('Failed to fetch comments:', e)
    comments.value[issueIndex] = []
  }
}

// Comment on issue
const commentOnIssue = async (issueIndex: number) => {
  if (!createdLintResultId.value) {
    lintError.value = 'Please save lint results first'
    return
  }
  
  const comment = prompt('Enter your comment:')
  if (!comment || !comment.trim()) return
  
  try {
    const res = await apiClient('/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entity_type: 'lint_result',
        entity_id: createdLintResultId.value,
        content: comment.trim(),
        issue_index: issueIndex
      })
    })
    
    if (res.ok) {
      lintSuccess.value = 'Comment added successfully!'
      setTimeout(() => { lintSuccess.value = '' }, 3000)
      // Refresh comments
      await fetchComments(issueIndex)
    } else {
      const errorMessage = await parseApiError(res, 'Failed to add comment')
      throw new Error(errorMessage)
    }
  } catch (e: any) {
    lintError.value = e.message || 'Failed to add comment'
    console.error('Error adding comment:', e)
  }
}

// Edit comment
const startEditComment = (comment: any) => {
  editingCommentId.value = comment.id
  editingCommentText.value = comment.content
}

const saveEditedComment = async (commentId: number) => {
  if (!editingCommentText.value.trim()) return
  
  try {
    const res = await apiClient(`/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editingCommentText.value.trim() })
    })
    
    if (res.ok) {
      lintSuccess.value = 'Comment updated successfully!'
      setTimeout(() => { lintSuccess.value = '' }, 3000)
      // Refresh comments for all issues
      for (const index in comments.value) {
        await fetchComments(parseInt(index))
      }
      editingCommentId.value = null
    } else {
      const errorMessage = await parseApiError(res, 'Failed to update comment')
      throw new Error(errorMessage)
    }
  } catch (e: any) {
    lintError.value = e.message || 'Failed to update comment'
    console.error('Error updating comment:', e)
  }
}

// Delete comment
const deleteComment = async (commentId: number) => {
  if (!confirm('Are you sure you want to delete this comment?')) return
  
  deletingCommentId.value = commentId
  try {
    const res = await apiClient(`/comments/${commentId}`, {
      method: 'DELETE'
    })
    
    if (res.ok) {
      lintSuccess.value = 'Comment deleted successfully!'
      setTimeout(() => { lintSuccess.value = '' }, 3000)
      // Refresh comments for all issues
      for (const index in comments.value) {
        await fetchComments(parseInt(index))
      }
    } else {
      const errorMessage = await parseApiError(res, 'Failed to delete comment')
      throw new Error(errorMessage)
    }
  } catch (e: any) {
    lintError.value = e.message || 'Failed to delete comment'
    console.error('Error deleting comment:', e)
  } finally {
    deletingCommentId.value = null
  }
}

// Format date helper
const formatDateShort = (dateString: string) => {
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

const getResultBorderClass = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'error': return 'border-red-500'
    case 'warning': return 'border-yellow-500'
    case 'info': return 'border-blue-500'
    default: return 'border-gray-500'
  }
}

const getResultTextClass = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'error': return 'text-red-400'
    case 'warning': return 'text-yellow-400'
    case 'info': return 'text-blue-400'
    default: return 'text-gray-400'
  }
}

const getResultBadgeClass = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'error': return 'bg-red-500/20 text-red-400 border border-red-500/30'
    case 'warning': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    case 'info': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}

// Filtered and sorted results
const filteredAndSortedResults = computed(() => {
  let results = [...lintResults.value]
  
  // Filter by severity
  if (filterSeverity.value) {
    results = results.filter(r => r.severity === filterSeverity.value)
  }
  
  // Search filter
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    results = results.filter(r =>
      r.message?.toLowerCase().includes(term) ||
      r.pattern?.toLowerCase().includes(term) ||
      r.ruleType?.toLowerCase().includes(term) ||
      r.line?.toString().includes(term)
    )
  }
  
  // Sort
  results.sort((a, b) => {
    switch (sortBy.value) {
      case 'line':
        return (a.line || 0) - (b.line || 0)
      case 'severity':
        const severityOrder: Record<string, number> = { error: 0, warning: 1, info: 2 }
        return (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2)
      case 'ruleType':
        return (a.ruleType || '').localeCompare(b.ruleType || '')
      default:
        return 0
    }
  })
  
  return results
})

// Group results by severity (using filtered and sorted results)
const groupedFilteredResults = computed(() => {
  const groups: Record<string, LintResult[]> = {
    error: [],
    warning: [],
    info: []
  }
  
  filteredAndSortedResults.value.forEach(result => {
    const severity = (result.severity || result.type || 'warning').toLowerCase()
    if (groups[severity]) {
      groups[severity].push(result)
    } else {
      groups.warning.push(result)
    }
  })
  
  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key]
    }
  })
  
  return groups
})

// Legacy groupedResults for backward compatibility
const groupedResults = computed(() => groupedFilteredResults.value)

// Edit rule
const editRule = (rule: LintRule) => {
  editingRule.value = { ...rule }
  ruleForm.value = {
    ruleType: rule.rule_type || rule.ruleType || '',
    pattern: rule.pattern,
    severity: rule.severity
  }
  showEditModal.value = true
}

// Update rule
const updateRule = async () => {
  if (!editingRule.value?.id) return
  
  ruleLoading.value = true
  ruleError.value = ''
  ruleSuccess.value = ''
  try {
    const res = await authenticatedFetch(`/api/v1/speclint/rules/${editingRule.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ruleType: ruleForm.value.ruleType,
        pattern: ruleForm.value.pattern,
        severity: ruleForm.value.severity
      })
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to update rule')
    }
    ruleSuccess.value = 'Rule updated!'
    showEditModal.value = false
    editingRule.value = null
    ruleForm.value = { ruleType: '', pattern: '', severity: 'error' }
    await fetchRules()
  } catch (e: any) {
    ruleError.value = e.message || 'Failed to update rule'
  } finally {
    ruleLoading.value = false
    setTimeout(() => { ruleSuccess.value = '' }, 2000)
  }
}

// Delete rule
const deleteRule = async (ruleId: string) => {
  if (!confirm('Are you sure you want to delete this rule?')) return
  
  deletingRuleId.value = ruleId
  try {
    const res = await authenticatedFetch(`/api/v1/speclint/rules/${ruleId}`, {
      method: 'DELETE'
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to delete rule')
    }
    await fetchRules()
    ruleSuccess.value = 'Rule deleted!'
    setTimeout(() => { ruleSuccess.value = '' }, 2000)
  } catch (e: any) {
    ruleError.value = e.message || 'Failed to delete rule'
  } finally {
    deletingRuleId.value = null
  }
}

// Copy pattern to clipboard
const copyPattern = async (pattern: string) => {
  try {
    await navigator.clipboard.writeText(pattern)
    ruleSuccess.value = 'Pattern copied to clipboard!'
    setTimeout(() => { ruleSuccess.value = '' }, 2000)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}

// Pagination controls helpers
const canPrev = computed(() => page.value > 1)
const canNext = computed(() => page.value < totalPages.value)
const pageNumbers = computed(() => {
  const arr = []
  for (let i = 1; i <= totalPages.value; i++) arr.push(i)
  return arr
})
</script> 

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #6b7280; /* cement/medium gray */
  border-radius: 6px;
  min-height: 40px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #6b7280 transparent;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 