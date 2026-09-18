<template>
  <div class="min-h-screen app-page">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <div class="mb-8 flex items-center justify-between page-enter">
          <div>
            <h1 class="page-title-gradient mb-1">Vendors</h1>
            <p class="page-subtitle">Vendor collaboration and tracking</p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <!-- Vendor List -->
          <div class="min-w-0 lg:col-span-2">
            <div class="module-panel module-panel-accent overflow-hidden p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="module-section-title">Vendor Partners</h2>
                <button class="btn-primary" @click="showVendorModal = true">Add Vendor</button>
              </div>
              <div v-if="error" class="text-red-500 text-center mb-4">{{ error }}</div>
              <div v-if="loading" class="text-gray-400 text-center mb-4">Loading...</div>
              <div v-if="!loading && vendorList.length === 0" class="text-gray-400 text-center mb-4">No vendors yet.</div>
              <div v-else class="space-y-4">
                <div v-for="vendor in vendorList" :key="vendor.id" 
                     class="overflow-hidden p-4 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors cursor-pointer"
                     @click="viewVendorPreview(vendor)">
                  <div class="flex min-w-0 items-center gap-3">
                    <div class="flex min-w-0 flex-1 items-center gap-4">
                      <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple">
                        <span class="font-semibold text-white">{{ vendor.name?.charAt(0) || 'V' }}</span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <h3 class="truncate font-medium text-gray-900 dark:text-white" :title="vendor.name">{{ vendor.name }}</h3>
                        <p class="truncate text-sm text-gray-500 dark:text-gray-400">{{ vendor.type }} • {{ vendor.status }}</p>
                      </div>
                    </div>
                    <div class="flex flex-shrink-0 items-center gap-2">
                      <span :class="getStatusClass(vendor.status)">
                        {{ vendor.status }}
                      </span>
                      <button class="p-2 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-300" @click.stop="handleEdit(vendor)">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                        </svg>
                      </button>
                      <button class="p-2 text-red-400 transition-colors hover:text-red-600" @click.stop="confirmDelete(vendor)">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity - Always Visible -->
          <div class="min-w-0 lg:col-span-1">
            <div class="module-panel module-panel-accent flex flex-col overflow-hidden" style="max-height: 600px;">
              <div class="mb-4 flex flex-shrink-0 items-center justify-between px-6 pt-6">
                <h2 class="module-section-title !mb-0">Recent Activity</h2>
                <button
                  type="button"
                  class="text-sm font-medium text-neon-blue hover:underline disabled:opacity-50"
                  :disabled="activitiesLoading"
                  @click="fetchActivities"
                >
                  Refresh
                </button>
              </div>
              <div class="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                <div v-if="activitiesLoading && activities.length === 0" class="text-center text-gray-400 py-4">Loading...</div>
                <div v-else-if="activitiesError && activities.length === 0" class="text-center py-4">
                  <p class="text-red-400 text-sm">{{ activitiesError }}</p>
                  <button type="button" class="mt-2 text-sm font-medium text-neon-blue hover:underline" @click="fetchActivities">
                    Try again
                  </button>
                </div>
                <div v-else-if="activities.length === 0" class="text-center text-gray-400 py-4">No recent activity.</div>
                <div v-else class="space-y-4">
                  <p v-if="activitiesError" class="text-xs text-amber-400">{{ activitiesError }}</p>
                  <div v-for="activity in recentActivities" :key="activity.timestamp + activity.action + activity.entity_id" class="flex items-start space-x-3">
                    <div class="w-2 h-2 bg-neon-blue rounded-full mt-2 flex-shrink-0"></div>
                    <div class="min-w-0 flex-1">
                      <p class="line-clamp-2 break-all text-sm text-gray-900 dark:text-white" :title="activity.action">{{ activity.action }}</p>
                      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ formatActivityDate(activity.timestamp) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 page-enter">
          <VendorPerformancePanel />
        </div>

        <!-- Vendor Preview Card - Centered Modal (like Edit Project) -->
        <Transition name="modal">
          <div v-if="selectedVendorPreview" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" data-testid="vendor-preview-modal" @click.self="closeVendorPreview">
            <div class="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl ring-2 ring-gray-200/80 dark:border-neon-blue/20 dark:bg-dark-900 dark:ring-neon-blue/10" @click.stop>
              <button @click="closeVendorPreview" class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-2xl font-bold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-dark-800 dark:hover:text-white dark:hover:ring-1 dark:hover:ring-neon-blue/30">
                &times;
              </button>
              <h2 class="mb-8 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue bg-clip-text text-3xl font-bold text-transparent animate-gradient">
                Vendor Preview
              </h2>
              <div v-if="previewLoading" class="py-8 text-center text-gray-600 dark:text-gray-300">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-neon-blue border-t-transparent mb-3"></div>
                <p class="text-sm">Loading vendor details...</p>
              </div>
              <div v-else-if="previewError" class="text-center text-red-400 py-8">
                <svg class="w-10 h-10 mx-auto mb-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm">{{ previewError }}</p>
              </div>
              <div v-else-if="selectedVendorPreview" class="space-y-5">
                <!-- Vendor Basic Info -->
                <div class="relative flex items-center space-x-4 border-b border-gray-200 pb-5 dark:border-dark-700/50">
                  <div class="flex h-14 w-14 flex-shrink-0 animate-pulse-slow items-center justify-center rounded-xl bg-gradient-to-br from-neon-blue via-neon-purple to-neon-blue shadow-lg ring-2 ring-neon-blue/30">
                    <span class="text-2xl font-bold text-white drop-shadow-lg">{{ selectedVendorPreview.name?.charAt(0) || 'V' }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="mb-1 truncate text-xl font-bold text-gray-900 drop-shadow-sm dark:text-white" :title="selectedVendorPreview.name">{{ selectedVendorPreview.name }}</h3>
                    <p class="truncate text-sm font-medium text-gray-600 dark:text-gray-300">{{ selectedVendorPreview.type }}</p>
                  </div>
                  <span :class="getStatusClass(selectedVendorPreview.status)">
                    {{ selectedVendorPreview.status }}
                  </span>
                </div>

                <!-- Linked Specifications -->
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <label class="flex items-center space-x-2 text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                      <svg class="h-4 w-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      <span>Linked Specifications</span>
                    </label>
                    <button 
                      @click="openLinkSpecModal"
                      data-testid="link-spec-button"
                      class="px-3 py-1.5 text-xs font-medium text-neon-blue hover:text-neon-purple border border-neon-blue/30 hover:border-neon-blue/50 rounded-lg transition-all hover:bg-neon-blue/10"
                    >
                      + Link Spec
                    </button>
                  </div>
                  <div v-if="previewLinkedSpecs.length === 0" class="rounded-lg border border-dashed border-neon-blue/25 bg-gray-50 px-4 py-3 text-sm italic text-gray-500 backdrop-blur-sm dark:border-neon-blue/20 dark:from-dark-800/30 dark:to-dark-800/20 dark:bg-gradient-to-r">
                    No specifications linked
                  </div>
                  <div v-else class="custom-scrollbar max-h-40 space-y-2 overflow-y-auto pr-2">
                    <div v-for="specId in previewLinkedSpecs" :key="specId" 
                         class="group flex items-center justify-between rounded-lg border border-neon-blue/20 bg-gray-100 px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-all hover:border-neon-blue/40 hover:shadow-md dark:bg-gradient-to-r dark:from-dark-800/60 dark:to-dark-800/40 dark:text-white dark:hover:from-dark-700/60 dark:hover:to-dark-700/40">
                      <div class="flex items-center space-x-2 flex-1 min-w-0">
                        <svg class="w-4 h-4 text-neon-blue opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <span class="font-medium truncate">{{ getSpecName(specId) }}</span>
                      </div>
                      <button 
                        @click="unlinkSpecFromVendor(specId)"
                        class="ml-2 text-red-400 hover:text-red-300 transition-colors p-1 flex-shrink-0"
                        title="Unlink specification"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Linked Checklists -->
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <label class="flex items-center space-x-2 text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                      <svg class="h-4 w-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                      </svg>
                      <span>Linked Checklists</span>
                    </label>
                    <button 
                      @click="openLinkChecklistModal"
                      data-testid="link-checklist-button"
                      class="px-3 py-1.5 text-xs font-medium text-neon-blue hover:text-neon-purple border border-neon-blue/30 hover:border-neon-blue/50 rounded-lg transition-all hover:bg-neon-blue/10"
                    >
                      + Link Checklist
                    </button>
                  </div>
                  <div v-if="previewLinkedChecklists.length === 0" class="rounded-lg border border-dashed border-neon-blue/25 bg-gray-50 px-4 py-3 text-sm italic text-gray-500 backdrop-blur-sm dark:border-neon-blue/20 dark:from-dark-800/30 dark:to-dark-800/20 dark:bg-gradient-to-r">
                    No checklists linked
                  </div>
                  <div v-else class="custom-scrollbar max-h-40 space-y-2 overflow-y-auto pr-2">
                    <div v-for="checklistId in previewLinkedChecklists" :key="checklistId" 
                         class="group flex items-center justify-between rounded-lg border border-neon-blue/20 bg-gray-100 px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-all hover:border-neon-blue/40 hover:shadow-md dark:bg-gradient-to-r dark:from-dark-800/60 dark:to-dark-800/40 dark:text-white dark:hover:from-dark-700/60 dark:hover:to-dark-700/40">
                      <div class="flex items-center space-x-2 flex-1 min-w-0">
                        <svg class="w-4 h-4 text-neon-blue opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                        </svg>
                        <span class="font-medium truncate">{{ getChecklistName(checklistId) }}</span>
                      </div>
                      <button 
                        @click="unlinkChecklistFromVendor(checklistId)"
                        class="ml-2 text-red-400 hover:text-red-300 transition-colors p-1 flex-shrink-0"
                        title="Unlink checklist"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- NDAs -->
                <div data-testid="vendor-nda-section">
                  <div class="mb-3 flex items-center justify-between">
                    <label class="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-200">NDAs</label>
                    <label class="cursor-pointer rounded-lg border border-neon-blue/30 px-3 py-1.5 text-xs font-medium text-neon-blue hover:bg-neon-blue/10">
                      {{ ndaUploading ? 'Uploading…' : '+ Upload NDA' }}
                      <input type="file" class="hidden" :disabled="ndaUploading" @change="onNdaUpload" />
                    </label>
                  </div>
                  <p v-if="ndaError" class="text-xs text-red-400">{{ ndaError }}</p>
                  <div v-else-if="!previewNdas.length" class="rounded-lg border border-dashed border-slate-600 px-4 py-3 text-sm italic text-slate-500">
                    No NDAs uploaded
                  </div>
                  <ul v-else class="space-y-2">
                    <li
                      v-for="nda in previewNdas"
                      :key="String(nda.id || nda.file_name)"
                      class="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm"
                    >
                      <span class="truncate text-slate-200">{{ nda.file_name || nda.name || `NDA ${nda.id}` }}</span>
                      <button
                        type="button"
                        class="text-xs font-medium text-neon-blue hover:underline"
                        @click="onDownloadNda(nda)"
                      >
                        Download
                      </button>
                    </li>
                  </ul>
                </div>

                <!-- Timeline -->
                <div data-testid="vendor-timeline-section">
                  <label class="mb-3 block text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-200">Timeline</label>
                  <p v-if="timelineError" class="text-xs text-amber-400">{{ timelineError }}</p>
                  <div v-else-if="!previewTimeline.length" class="rounded-lg border border-dashed border-slate-600 px-4 py-3 text-sm italic text-slate-500">
                    No timeline events yet
                  </div>
                  <ul v-else class="max-h-40 space-y-2 overflow-y-auto">
                    <li
                      v-for="(ev, idx) in previewTimeline"
                      :key="ev.id || idx"
                      class="rounded-lg border border-slate-700 px-3 py-2 text-sm"
                    >
                      <p class="text-slate-200">{{ ev.message || ev.event || ev.title || 'Event' }}</p>
                      <p class="text-xs text-slate-500">{{ ev.time || ev.created_at || '' }}</p>
                    </li>
                  </ul>
                </div>

                <!-- Acknowledge linked spec -->
                <div v-if="previewLinkedSpecs.length" data-testid="vendor-acknowledge-section">
                  <label class="mb-2 block text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-200">Acknowledge spec</label>
                  <div class="flex flex-wrap gap-2">
                    <select v-model="ackSpecId" class="input-field flex-1 text-sm">
                      <option value="">Select linked spec</option>
                      <option v-for="specId in previewLinkedSpecs" :key="String(specId)" :value="String(specId)">
                        {{ getSpecName(specId) }}
                      </option>
                    </select>
                    <button
                      type="button"
                      class="btn-secondary px-3 py-2 text-sm"
                      :disabled="!ackSpecId || ackBusy"
                      @click="onAcknowledgeSpec"
                    >
                      {{ ackBusy ? '…' : 'Acknowledge' }}
                    </button>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex justify-end gap-3 border-t border-gray-200 pt-5 dark:border-dark-700/50">
                  <button @click="closeVendorPreview" class="btn-secondary rounded-lg px-6 py-3 font-medium transition-all hover:scale-105">
                    Close
                  </button>
                  <button @click="handleEdit(selectedVendorPreview)" class="btn-primary rounded-lg px-8 py-3 font-semibold transition-transform hover:scale-[1.02]">
                    Edit Vendor
                  </button>
                  <button @click="confirmDelete(selectedVendorPreview)" class="px-6 py-3 rounded-lg font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50 transition-all hover:scale-105">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Success / error toasts -->
        <div
          v-if="showSuccessToast"
          data-testid="vendor-success-toast"
          class="fixed bottom-4 right-4 z-[60] rounded-xl bg-green-500/90 px-6 py-3 text-white shadow-2xl backdrop-blur-sm"
          role="status"
        >
          <div class="flex items-center space-x-2">
            <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>{{ successMessage }}</span>
          </div>
        </div>
        <div
          v-if="showErrorToast"
          data-testid="vendor-error-toast"
          class="fixed bottom-4 right-4 z-[60] rounded-xl bg-red-500/90 px-6 py-3 text-white shadow-2xl backdrop-blur-sm"
          role="alert"
        >
          <div class="flex items-center space-x-2">
            <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        </div>
      </main>
    </div>

    <!-- Link Spec Modal -->
    <LinkModal
      v-if="showLinkSpecModal && selectedVendorPreview"
      type="spec"
      :available-items="allSpecs.filter(spec => !previewLinkedSpecs.some(id => String(id) === String(spec.id)))"
      :on-link="linkSpecToVendor"
      :on-close="() => showLinkSpecModal = false"
    />

    <!-- Link Checklist Modal -->
    <LinkModal
      v-if="showLinkChecklistModal && selectedVendorPreview"
      type="checklist"
      :available-items="allChecklists.filter(checklist => !previewLinkedChecklists.some(id => String(id) === String(checklist.id)))"
      :on-link="linkChecklistToVendor"
      :on-close="() => showLinkChecklistModal = false"
    />

    <!-- Vendor Modal - Improved Design -->
    <!-- WHY: Better UX with larger modal, better spacing, searchable multi-selects, and validation -->
    <Transition name="modal">
      <div v-if="showVendorModal" class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="closeModal">
        <div class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-dark-700 dark:bg-dark-900">
          <!-- Header -->
          <div class="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-white px-6 py-4 dark:border-dark-700 dark:bg-dark-900">
            <h2 class="text-2xl font-bold text-gradient">{{ editingVendor ? 'Edit Vendor' : 'Add Vendor' }}</h2>
            <button 
              class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-dark-800 dark:hover:text-gray-200" 
              @click="closeModal"
              aria-label="Close modal"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Form Content -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
            <!-- Name Field -->
            <div>
              <label for="name" class="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Vendor Name <span class="text-red-400">*</span>
              </label>
              <input 
                id="name" 
                v-model="vendorForm.name" 
                type="text"
                class="input-field w-full py-3 px-4 text-base"
                placeholder="Enter vendor name"
                required
                :class="{ 'border-red-500': formErrors.name }"
              >
              <p v-if="formErrors.name" class="text-red-400 text-sm mt-1">{{ formErrors.name }}</p>
            </div>

            <!-- Type Field - Dropdown with common types -->
            <div>
              <label for="type" class="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Vendor Type <span class="text-red-400">*</span>
              </label>
              <select 
                id="type" 
                v-model="vendorForm.type" 
                class="input-field w-full py-3 px-4 text-base"
                required
                :class="{ 'border-red-500': formErrors.type }"
              >
                <option value="">Select vendor type</option>
                <option value="EDA Tool">EDA Tool</option>
                <option value="IP Provider">IP Provider</option>
                <option value="Foundry">Foundry</option>
                <option value="Packaging">Packaging</option>
                <option value="Testing">Testing</option>
                <option value="Design Services">Design Services</option>
                <option value="Other">Other</option>
              </select>
              <p v-if="formErrors.type" class="text-red-400 text-sm mt-1">{{ formErrors.type }}</p>
            </div>

            <!-- Status Field -->
            <div>
              <label for="status" class="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Status <span class="text-red-400">*</span>
              </label>
              <select 
                id="status" 
                v-model="vendorForm.status" 
                class="input-field w-full py-3 px-4 text-base"
                required
                :class="{ 'border-red-500': formErrors.status }"
              >
                <option value="">Select status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
              <p v-if="formErrors.status" class="text-red-400 text-sm mt-1">{{ formErrors.status }}</p>
            </div>

            <!-- Linked Specs - Improved with preview and search -->
            <div data-testid="vendor-form-linked-specs">
              <label class="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Linked Specifications
                <span class="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">(Optional)</span>
              </label>
              
              <!-- Preview Section - Show all linked specs -->
              <div
                v-if="vendorForm.linkedSpecs.length > 0"
                class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-dark-700 dark:bg-dark-800/50"
                data-testid="vendor-linked-specs-preview"
              >
                <div class="mb-3 flex items-center justify-between">
                  <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Currently Linked ({{ vendorForm.linkedSpecs.length }})
                  </h4>
                </div>
                <div class="custom-scrollbar max-h-32 space-y-2 overflow-y-auto">
                  <div 
                    v-for="specId in vendorForm.linkedSpecs" 
                    :key="String(specId)"
                    class="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 transition-colors hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600"
                    data-testid="vendor-linked-spec-chip"
                    :data-spec-id="String(specId)"
                  >
                    <span class="flex-1 text-sm text-gray-900 dark:text-white">{{ getSpecName(specId) }}</span>
                    <button 
                      type="button"
                      @click="removeSpec(specId)"
                      class="ml-2 text-red-400 hover:text-red-300 transition-colors p-1"
                      title="Remove specification"
                      data-testid="vendor-unlink-spec-chip"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Search and Add Section -->
              <div class="relative">
                <input 
                  v-model="specSearch" 
                  type="text"
                  class="input-field w-full py-3 px-4 text-base"
                  placeholder="Search specifications to add..."
                  data-testid="vendor-spec-search"
                  @focus="showSpecDropdown = true"
                  @blur="onSpecInputBlur"
                >
                <!-- Dropdown: mousedown.prevent so blur cannot steal the click / drop prior links -->
                <div
                  v-if="showSpecDropdown && filteredSpecs.length > 0"
                  class="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-dark-700 dark:bg-dark-800"
                  data-testid="vendor-spec-dropdown"
                >
                  <div 
                    v-for="spec in filteredSpecs" 
                    :key="String(spec.id)"
                    class="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-700"
                    data-testid="vendor-spec-option"
                    :data-spec-id="String(spec.id)"
                    @mousedown.prevent="toggleSpec(spec.id)"
                  >
                    <span class="text-sm text-gray-900 dark:text-white">{{ spec.name || spec.file_name || 'Unnamed Spec' }}</span>
                    <svg v-if="isSpecLinked(spec.id)" class="w-5 h-5 text-neon-blue" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Linked Checklists - Improved with preview and search -->
            <div data-testid="vendor-form-linked-checklists">
              <label class="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Linked Checklists
                <span class="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">(Optional)</span>
              </label>
              
              <!-- Preview Section - Show all linked checklists -->
              <div
                v-if="vendorForm.linkedChecklists.length > 0"
                class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-dark-700 dark:bg-dark-800/50"
                data-testid="vendor-linked-checklists-preview"
              >
                <div class="mb-3 flex items-center justify-between">
                  <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Currently Linked ({{ vendorForm.linkedChecklists.length }})
                  </h4>
                </div>
                <div class="custom-scrollbar max-h-32 space-y-2 overflow-y-auto">
                  <div 
                    v-for="checklistId in vendorForm.linkedChecklists" 
                    :key="String(checklistId)"
                    class="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 transition-colors hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600"
                    data-testid="vendor-linked-checklist-chip"
                    :data-checklist-id="String(checklistId)"
                  >
                    <span class="flex-1 text-sm text-gray-900 dark:text-white">{{ getChecklistName(checklistId) }}</span>
                    <button 
                      type="button"
                      @click="removeChecklist(checklistId)"
                      class="ml-2 text-red-400 hover:text-red-300 transition-colors p-1"
                      title="Remove checklist"
                      data-testid="vendor-unlink-checklist-chip"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Search and Add Section -->
              <div class="relative">
                <input 
                  v-model="checklistSearch" 
                  type="text"
                  class="input-field w-full py-3 px-4 text-base"
                  placeholder="Search checklists to add..."
                  data-testid="vendor-checklist-search"
                  @focus="showChecklistDropdown = true"
                  @blur="onChecklistInputBlur"
                >
                <!-- Dropdown -->
                <div
                  v-if="showChecklistDropdown"
                  class="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-dark-700 dark:bg-dark-800"
                  data-testid="vendor-checklist-dropdown"
                >
                  <template v-if="filteredChecklists.length > 0">
                    <div 
                      v-for="checklist in filteredChecklists" 
                      :key="String(checklist.id)"
                      class="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-700"
                      data-testid="vendor-checklist-option"
                      :data-checklist-id="String(checklist.id)"
                      @mousedown.prevent="toggleChecklist(checklist.id)"
                    >
                      <span class="text-sm text-gray-900 dark:text-white">{{ checklist.name || 'Unnamed Checklist' }}</span>
                      <svg v-if="isChecklistLinked(checklist.id)" class="w-5 h-5 text-neon-blue" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  </template>
                  <div v-else class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No checklists found.
                  </div>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="vendorsStore.error" class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p class="text-red-400 text-sm">{{ vendorsStore.error }}</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 border-t border-gray-200 pt-4 dark:border-dark-700">
              <button 
                type="button" 
                class="btn-secondary flex-1 py-3 font-semibold" 
                @click="closeModal"
                :disabled="vendorsStore.loading"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn-primary flex-1 py-3 font-semibold flex items-center justify-center" 
                :disabled="vendorsStore.loading || !isFormValid"
              >
                <span v-if="vendorsStore.loading" class="mr-2">
                  <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                <span>{{ editingVendor ? 'Update Vendor' : 'Add Vendor' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold" @click="showDeleteModal = false">&times;</button>
        <h2 class="text-2xl font-bold mb-6 text-center text-gradient">Delete Vendor</h2>
        <p class="mb-6 text-center text-gray-600 dark:text-gray-300">Are you sure you want to delete <span class="font-semibold">{{ vendorToDelete?.name }}</span>?</p>
        <div class="flex justify-end gap-2">
          <button class="btn-secondary" @click="showDeleteModal = false">Cancel</button>
          <button class="btn-primary bg-red-500 hover:bg-red-600" @click="deleteVendor" :disabled="deletingVendor">Delete<span v-if="deletingVendor" class="ml-2 animate-spin">⏳</span></button>
        </div>
        <div v-if="deleteError" class="text-red-400 mt-2 text-center">{{ deleteError }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import LinkModal from '@/components/LinkModal.vue'
import VendorPerformancePanel from '@/components/Vendors/VendorPerformancePanel.vue'
import { onMounted, ref, computed } from 'vue'
import { useVendorsStore } from '@/stores/vendors'
import { useAuthStore } from '@/stores/auth'
import { authenticatedFetch } from '@/utils/auth-requests'
import { fetchActivity } from '@/api/product-surfaces'
import type { Vendor } from '@/stores/vendors'
import { statusBadgeClass } from '@/utils/status-badge'

// Replace VendorActivity interface and activities ref with new structure
interface Activity {
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entity_id: number | string;
}

const vendorsStore = useVendorsStore()
const loading = computed(() => vendorsStore.loading)
const error = computed(() => vendorsStore.error)
const showSuccessToast = ref(false)
const showErrorToast = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(message: string, isError = false) {
  if (toastTimer) clearTimeout(toastTimer)
  if (isError) {
    errorMessage.value = message
    showErrorToast.value = true
    showSuccessToast.value = false
  } else {
    successMessage.value = message
    showSuccessToast.value = true
    showErrorToast.value = false
  }
  toastTimer = setTimeout(() => {
    showSuccessToast.value = false
    showErrorToast.value = false
  }, 4000)
}

const activities = ref<Activity[]>([])
const activitiesLoading = ref(false)
const activitiesError = ref('')
const showVendorModal = ref(false)
const editingVendor = ref<Vendor | null>(null)
const vendorForm = ref({ name: '', type: '', status: '' as '' | 'active' | 'pending' | 'inactive', linkedSpecs: [] as (string | number)[], linkedChecklists: [] as (string | number)[] })
const deleting = ref<string | null>(null)
const uploadingNDA = ref<string | null>(null)
const acknowledging = ref<string | null>(null)
const vendorDetails = ref(null)
const selectedVendorPreview = ref<Vendor | null>(null)
const previewLoading = ref(false)
const previewError = ref('')
const previewLinkedSpecs = ref<(string | number)[]>([])
const previewLinkedChecklists = ref<(string | number)[]>([])
const previewNdas = ref<any[]>([])
const previewTimeline = ref<any[]>([])
const ndaUploading = ref(false)
const ndaError = ref('')
const timelineError = ref('')
const ackSpecId = ref('')
const ackBusy = ref(false)

const vendorList = computed(() => vendorsStore.vendors as Vendor[])
const authStore = useAuthStore()

const allSpecs = ref<any[]>([])
const allChecklists = ref<any[]>([])

// Link modal states
const showLinkSpecModal = ref(false)
const showLinkChecklistModal = ref(false)

// Form validation and search states
const formErrors = ref<{ name?: string; type?: string; status?: string }>({})
const specSearch = ref('')
const checklistSearch = ref('')
const showSpecDropdown = ref(false)
const showChecklistDropdown = ref(false)

// Form validation
const isFormValid = computed(() => {
  return vendorForm.value.name.trim() !== '' && 
         vendorForm.value.type.trim() !== '' && 
         vendorForm.value.status.trim() !== ''
})

// Filtered specs and checklists for search
const filteredSpecs = computed(() => {
  const list = Array.isArray(allSpecs.value) ? allSpecs.value : []
  if (!specSearch.value) return list
  const search = specSearch.value.toLowerCase()
  return list.filter(spec =>
    (spec.name || spec.file_name || '').toLowerCase().includes(search)
  )
})

const filteredChecklists = computed(() => {
  const list = Array.isArray(allChecklists.value) ? allChecklists.value : []
  if (!checklistSearch.value) return list
  const search = checklistSearch.value.toLowerCase()
  return list.filter(checklist =>
    (checklist.name || '').toLowerCase().includes(search)
  )
})

function linkedIdIndex(list: (string | number)[], id: string | number) {
  const key = String(id)
  return list.findIndex((x) => String(x) === key)
}

function isSpecLinked(specId: string | number) {
  return linkedIdIndex(vendorForm.value.linkedSpecs, specId) > -1
}

function isChecklistLinked(checklistId: string | number) {
  return linkedIdIndex(vendorForm.value.linkedChecklists, checklistId) > -1
}

// Multi-select: append / remove without wiping prior links (normalize string|number ids)
const toggleSpec = (specId: string | number) => {
  const index = linkedIdIndex(vendorForm.value.linkedSpecs, specId)
  if (index > -1) {
    vendorForm.value.linkedSpecs.splice(index, 1)
  } else {
    vendorForm.value.linkedSpecs.push(specId)
  }
  // Keep dropdown open so users can link multiple specs without losing prior chips
  showSpecDropdown.value = true
  specSearch.value = ''
}

// Close spec dropdown when input loses focus (with small delay so clicks on options still register)
const onSpecInputBlur = () => {
  setTimeout(() => {
    showSpecDropdown.value = false
  }, 200)
}

const removeSpec = (specId: string | number) => {
  const index = linkedIdIndex(vendorForm.value.linkedSpecs, specId)
  if (index > -1) {
    vendorForm.value.linkedSpecs.splice(index, 1)
  }
}

const getSpecName = (specId: string | number) => {
  const list = Array.isArray(allSpecs.value) ? allSpecs.value : []
  const spec = list.find(s => String(s.id) === String(specId))
  return spec?.name || spec?.file_name || `Spec ${specId}`
}

const toggleChecklist = (checklistId: string | number) => {
  const index = linkedIdIndex(vendorForm.value.linkedChecklists, checklistId)
  if (index > -1) {
    vendorForm.value.linkedChecklists.splice(index, 1)
  } else {
    vendorForm.value.linkedChecklists.push(checklistId)
  }
  showChecklistDropdown.value = true
  checklistSearch.value = ''
}

// Close checklist dropdown when input loses focus
const onChecklistInputBlur = () => {
  setTimeout(() => {
    showChecklistDropdown.value = false
  }, 200)
}

const removeChecklist = (checklistId: string | number) => {
  const index = linkedIdIndex(vendorForm.value.linkedChecklists, checklistId)
  if (index > -1) {
    vendorForm.value.linkedChecklists.splice(index, 1)
  }
}

const getChecklistName = (checklistId: string | number) => {
  const list = Array.isArray(allChecklists.value) ? allChecklists.value : []
  const checklist = list.find(c => String(c.id) === String(checklistId))
  return checklist?.name || `Checklist ${checklistId}`
}

// Close modal and reset form
const closeModal = () => {
  showVendorModal.value = false
  formErrors.value = {}
  specSearch.value = ''
  checklistSearch.value = ''
  showSpecDropdown.value = false
  showChecklistDropdown.value = false
}

// Limit for recent activities display
const MAX_RECENT_ACTIVITIES = 15

// Helper function to safely parse timestamp for sorting
const parseTimestampForSort = (timestamp: string): number => {
  if (!timestamp) return 0
  try {
    let cleanTimestamp = timestamp.trim()
    // Remove trailing Z if it exists after timezone offset
    if (cleanTimestamp.endsWith('Z') && (cleanTimestamp.includes('+') || cleanTimestamp.includes('-'))) {
      cleanTimestamp = cleanTimestamp.slice(0, -1)
    }
    const date = new Date(cleanTimestamp)
    if (isNaN(date.getTime())) {
      // Fallback: try without timezone
      const withoutTimezone = cleanTimestamp.split(/[+-]/)[0]
      const utcDate = new Date(withoutTimezone + 'Z')
      return isNaN(utcDate.getTime()) ? 0 : utcDate.getTime()
    }
    return date.getTime()
  } catch {
    return 0
  }
}

// Computed property to show only recent activities
const recentActivities = computed(() => {
  // Sort by timestamp (newest first) and limit to MAX_RECENT_ACTIVITIES
  return [...activities.value]
    .sort((a, b) => {
      const dateA = parseTimestampForSort(a.timestamp)
      const dateB = parseTimestampForSort(b.timestamp)
      return dateB - dateA // Descending order (newest first)
    })
    .slice(0, MAX_RECENT_ACTIVITIES)
})

// Fetch recent activity from API — soft-fail only (never logout / never block the page)
const fetchActivities = async () => {
  activitiesLoading.value = true
  activitiesError.value = ''
  try {
    const rows = await fetchActivity({ limit: MAX_RECENT_ACTIVITIES })
    const sortedActivities = [...rows]
      .map((row) => ({
        timestamp: String(row.timestamp || ''),
        user: String(row.user || ''),
        action: String(row.action || ''),
        entity: String(row.entity || ''),
        entity_id: row.entity_id ?? '',
      }))
      .sort((a, b) => {
        const dateA = parseTimestampForSort(a.timestamp)
        const dateB = parseTimestampForSort(b.timestamp)
        return dateB - dateA
      })
      .slice(0, MAX_RECENT_ACTIVITIES)
    activities.value = sortedActivities
  } catch (e: any) {
    // Do NOT logout here — a flaky activity feed was kicking the session and
    // making Vendor performance appear then disappear on /vendors.
    activitiesError.value = e?.message || 'Activity feed unavailable'
  } finally {
    activitiesLoading.value = false
  }
}

onMounted(() => {
  // Load shell data in parallel so a slow activity call cannot stall vendors/performance
  void vendorsStore.fetchVendors()
  void fetchActivities()

  const headers = authStore.token ? { Authorization: `Bearer ${authStore.token}` } : undefined

  void (async () => {
    try {
      const specsRes = await authenticatedFetch('/api/v1/specifications', { headers })
      if (specsRes.ok) {
        const specsData = await specsRes.json()
        allSpecs.value = Array.isArray(specsData) ? specsData : (specsData?.items ?? specsData?.data ?? [])
      }
    } catch {
      /* ignore — link modals degrade gracefully */
    }

    try {
      const checklistsRes = await authenticatedFetch('/api/v1/checklists/templates', { headers })
      if (checklistsRes.ok) {
        const checklistData = await checklistsRes.json()
        allChecklists.value = Array.isArray(checklistData)
          ? checklistData
          : (checklistData?.items ?? checklistData?.data ?? [])
      } else {
        allChecklists.value = []
      }
    } catch {
      allChecklists.value = []
    }
  })()
})

const getStatusClass = (status: string) => statusBadgeClass(status)

// Format activity date safely - handles various timestamp formats from API
const formatActivityDate = (timestamp: string) => {
  if (!timestamp) return 'Unknown date'
  
  try {
    let cleanTimestamp = timestamp.trim()
    
    // Handle malformed timestamps like "2026-01-06T16:25:27.499454+00:00Z" (has both offset and Z)
    // Remove trailing Z if it exists after timezone offset
    if (cleanTimestamp.endsWith('Z') && (cleanTimestamp.includes('+') || cleanTimestamp.includes('-'))) {
      // Check if there's a timezone offset before the Z
      const offsetMatch = cleanTimestamp.match(/[+-]\d{2}:\d{2}Z$/)
      if (offsetMatch) {
        cleanTimestamp = cleanTimestamp.slice(0, -1) // Remove the trailing Z
      }
    }
    
    // Try to parse the date
    let date = new Date(cleanTimestamp)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // If parsing fails, try removing microseconds and timezone, then add Z for UTC
      const withoutMicroseconds = cleanTimestamp.replace(/\.\d+/, '') // Remove microseconds
      const withoutTimezone = withoutMicroseconds.split(/[+-]/)[0] // Remove timezone offset
      
      if (withoutTimezone) {
        date = new Date(withoutTimezone + 'Z')
        if (!isNaN(date.getTime())) {
          return date.toLocaleString()
        }
      }
      
      // Last resort: try parsing as-is without any modifications
      date = new Date(timestamp)
      if (isNaN(date.getTime())) {
        console.warn('Unable to parse timestamp:', timestamp)
        return 'Invalid date'
      }
    }
    
    return date.toLocaleString()
  } catch (error) {
    console.error('Error formatting date:', timestamp, error)
    return 'Invalid date'
  }
}

// Validate form before submission
const validateForm = () => {
  formErrors.value = {}
  let isValid = true

  if (!vendorForm.value.name.trim()) {
    formErrors.value.name = 'Vendor name is required'
    isValid = false
  }

  if (!vendorForm.value.type.trim()) {
    formErrors.value.type = 'Vendor type is required'
    isValid = false
  }

  if (!vendorForm.value.status || vendorForm.value.status.trim() === '') {
    formErrors.value.status = 'Status is required'
    isValid = false
  }

  return isValid
}

// Call fetchActivities after vendor CRUD
const handleSubmit = async (e?: Event) => {
  // Prevent default form submission
  if (e) {
    e.preventDefault()
  }
  
  // Validate form
  if (!validateForm()) {
    // Scroll to first error field
    const firstErrorField = document.querySelector('.border-red-500')
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      ;(firstErrorField as HTMLElement).focus()
    }
    return
  }

  try {
    if (editingVendor.value) {
      await vendorsStore.updateVendor(editingVendor.value.id, vendorForm.value)
    } else {
      await vendorsStore.createVendor(vendorForm.value)
    }
    
    // Only close if successful
    if (!vendorsStore.error) {
      const updatedVendorId = editingVendor.value?.id
      closeModal()
      vendorForm.value = { name: '', type: '', status: '', linkedSpecs: [], linkedChecklists: [] }
      editingVendor.value = null
      // Refresh preview if it's open and showing the updated vendor
      if (selectedVendorPreview.value && updatedVendorId === selectedVendorPreview.value.id) {
        // Refresh the preview with updated data
        const updatedVendor = vendorsStore.vendors.find(v => v.id === updatedVendorId)
        if (updatedVendor) {
          await viewVendorPreview(updatedVendor)
        }
      }
      await fetchActivities()
    }
  } catch (error: any) {
    console.error('Error submitting vendor form:', error)
  }
}

const handleEdit = async (vendor: Vendor) => {
  editingVendor.value = vendor
  showVendorModal.value = true
  formErrors.value = {}
  
  // Fetch full vendor details to get linked specs and checklists
  try {
    const fullVendor = await vendorsStore.getVendor(vendor.id)
    // Normalize IDs to ensure consistent type (convert to strings for consistency)
    const normalizeIds = (ids: any[]): (string | number)[] => {
      if (!Array.isArray(ids)) return []
      return ids.map(id => id !== null && id !== undefined ? id : null).filter(id => id !== null)
    }
    
    vendorForm.value = { 
      name: fullVendor.name || vendor.name, 
      type: fullVendor.type || vendor.type, 
      status: fullVendor.status || vendor.status, 
      linkedSpecs: normalizeIds(fullVendor.linked_specs || fullVendor.linkedSpecs || vendor.linked_specs || []), 
      linkedChecklists: normalizeIds(fullVendor.linked_checklists || fullVendor.linkedChecklists || vendor.linked_checklists || []) 
    }
    console.log('✅ Loaded vendor for editing:', {
      id: fullVendor.id,
      name: fullVendor.name,
      linkedSpecs: vendorForm.value.linkedSpecs,
      linkedChecklists: vendorForm.value.linkedChecklists,
      raw_linked_specs: fullVendor.linked_specs,
      raw_linked_checklists: fullVendor.linked_checklists
    })
  } catch (error: any) {
    console.error('⚠️ Failed to fetch full vendor details, using basic vendor data:', error)
    // Fallback to basic vendor data if fetch fails
    const normalizeIds = (ids: any[]): (string | number)[] => {
      if (!Array.isArray(ids)) return []
      return ids.map(id => id !== null && id !== undefined ? id : null).filter(id => id !== null)
    }
    vendorForm.value = { 
      name: vendor.name, 
      type: vendor.type, 
      status: vendor.status, 
      linkedSpecs: normalizeIds(vendor.linked_specs || []), 
      linkedChecklists: normalizeIds(vendor.linked_checklists || []) 
    }
  }
}

const showDeleteModal = ref(false)
const vendorToDelete = ref<Vendor | null>(null)
const deletingVendor = ref(false)
const deleteError = ref('')

function confirmDelete(vendor: Vendor) {
  vendorToDelete.value = vendor
  showDeleteModal.value = true
  deleteError.value = ''
}

async function deleteVendor() {
  if (!vendorToDelete.value) return
  const id = (vendorToDelete.value as Vendor).id
  deletingVendor.value = true
  deleteError.value = ''
  try {
    await vendorsStore.deleteVendor(id)
    showDeleteModal.value = false
    // Close preview if the deleted vendor was being previewed
    if (selectedVendorPreview.value?.id === id) {
      closeVendorPreview()
    }
    vendorToDelete.value = null
    await fetchActivities()
  } catch (e: any) {
    deleteError.value = e.message || 'Failed to delete vendor'
  } finally {
    deletingVendor.value = false
  }
}

const uploadNDA = async () => {
  /* use onNdaUpload from preview */
}

const acknowledge = async () => {
  /* use onAcknowledgeSpec from preview */
}

async function onNdaUpload(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !selectedVendorPreview.value) return
  ndaUploading.value = true
  ndaError.value = ''
  try {
    await vendorsStore.uploadNDA(String(selectedVendorPreview.value.id), file)
    previewNdas.value = await vendorsStore.listNDAs(String(selectedVendorPreview.value.id))
    showToast('NDA uploaded')
    try {
      previewTimeline.value = await vendorsStore.fetchTimeline(String(selectedVendorPreview.value.id))
    } catch {
      /* ignore */
    }
  } catch (e: any) {
    ndaError.value = e?.message || 'Upload failed'
  } finally {
    ndaUploading.value = false
  }
}

async function onDownloadNda(nda: any) {
  if (!selectedVendorPreview.value || nda?.id == null) return
  try {
    await vendorsStore.downloadNDA(String(selectedVendorPreview.value.id), nda.id)
  } catch (e: any) {
    showToast(e?.message || 'Download failed', true)
  }
}

async function onAcknowledgeSpec() {
  if (!selectedVendorPreview.value || !ackSpecId.value) return
  ackBusy.value = true
  try {
    await vendorsStore.acknowledge(String(selectedVendorPreview.value.id), {
      specification_id: ackSpecId.value,
    })
    showToast('Spec acknowledged')
    previewTimeline.value = await vendorsStore.fetchTimeline(String(selectedVendorPreview.value.id))
  } catch (e: any) {
    showToast(e?.message || 'Acknowledge failed', true)
  } finally {
    ackBusy.value = false
  }
}

// View vendor preview
const viewVendorPreview = async (vendor: Vendor) => {
  selectedVendorPreview.value = vendor
  previewLoading.value = true
  previewError.value = ''
  previewLinkedSpecs.value = []
  previewLinkedChecklists.value = []
  previewNdas.value = []
  previewTimeline.value = []
  ndaError.value = ''
  timelineError.value = ''
  ackSpecId.value = ''

  try {
    const fullVendor = await vendorsStore.getVendor(vendor.id)
    selectedVendorPreview.value = fullVendor

    const normalizeIds = (ids: any[]): (string | number)[] => {
      if (!Array.isArray(ids)) return []
      return ids.map(id => id !== null && id !== undefined ? id : null).filter(id => id !== null) as (string | number)[]
    }

    previewLinkedSpecs.value = normalizeIds(fullVendor.linked_specs || fullVendor.linkedSpecs || [])
    previewLinkedChecklists.value = normalizeIds(fullVendor.linked_checklists || fullVendor.linkedChecklists || [])

    try {
      previewNdas.value = await vendorsStore.listNDAs(String(vendor.id))
    } catch (e: any) {
      ndaError.value = e?.message || 'Failed to load NDAs'
    }
    try {
      previewTimeline.value = await vendorsStore.fetchTimeline(String(vendor.id))
    } catch (e: any) {
      timelineError.value = e?.message || 'Failed to load timeline'
    }
  } catch (error: any) {
    console.error('Failed to fetch vendor preview:', error)
    previewError.value = error.message || 'Failed to load vendor details'
  } finally {
    previewLoading.value = false
  }
}

// Close vendor preview
const closeVendorPreview = () => {
  selectedVendorPreview.value = null
  previewLinkedSpecs.value = []
  previewLinkedChecklists.value = []
  previewError.value = ''
  showLinkSpecModal.value = false
  showLinkChecklistModal.value = false
}

const openLinkSpecModal = () => {
  showLinkSpecModal.value = true
}

const openLinkChecklistModal = () => {
  showLinkChecklistModal.value = true
}

const linkSpecToVendor = async (spec: any) => {
  if (!selectedVendorPreview.value) return
  const vendorId = selectedVendorPreview.value.id
  const specId = spec.id
  
  try {
    const res = await authenticatedFetch(`/api/v1/vendors/${vendorId}/specifications/${specId}/link`, {
      method: 'POST'
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || 'Failed to link specification')
    }
    
    if (!previewLinkedSpecs.value.some(id => String(id) === String(specId))) {
      previewLinkedSpecs.value.push(specId)
    }
    if (selectedVendorPreview.value) {
      selectedVendorPreview.value = {
        ...selectedVendorPreview.value,
        linked_specs: [...previewLinkedSpecs.value],
      } as Vendor
    }
    
    showLinkSpecModal.value = false
    showToast('Specification linked successfully')
    await viewVendorPreview(selectedVendorPreview.value)
    if (!previewLinkedSpecs.value.some(id => String(id) === String(specId))) {
      previewLinkedSpecs.value.push(specId)
    }
  } catch (error: any) {
    console.error('Error linking spec:', error)
    showToast(error.message || 'Failed to link specification', true)
  }
}

const linkChecklistToVendor = async (checklist: any) => {
  if (!selectedVendorPreview.value) return
  const vendorId = selectedVendorPreview.value.id
  const checklistId = checklist.id
  
  try {
    const res = await authenticatedFetch(`/api/v1/vendors/${vendorId}/checklists/${checklistId}/link`, {
      method: 'POST'
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || 'Failed to link checklist')
    }
    
    if (!previewLinkedChecklists.value.some(id => String(id) === String(checklistId))) {
      previewLinkedChecklists.value.push(checklistId)
    }
    if (selectedVendorPreview.value) {
      selectedVendorPreview.value = {
        ...selectedVendorPreview.value,
        linked_checklists: [...previewLinkedChecklists.value],
      } as Vendor
    }
    
    showLinkChecklistModal.value = false
    showToast('Checklist linked successfully')
    await viewVendorPreview(selectedVendorPreview.value)
    if (!previewLinkedChecklists.value.some(id => String(id) === String(checklistId))) {
      previewLinkedChecklists.value.push(checklistId)
    }
  } catch (error: any) {
    console.error('Error linking checklist:', error)
    showToast(error.message || 'Failed to link checklist', true)
  }
}

const unlinkSpecFromVendor = async (specId: string | number) => {
  if (!selectedVendorPreview.value) return
  
  if (!confirm('Are you sure you want to unlink this specification?')) return
  
  try {
    const res = await authenticatedFetch(`/api/v1/vendors/${selectedVendorPreview.value.id}/specifications/${specId}/unlink`, {
      method: 'DELETE'
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || 'Failed to unlink specification')
    }
    
    previewLinkedSpecs.value = previewLinkedSpecs.value.filter(id => String(id) !== String(specId))
    showToast('Specification unlinked successfully')
    await viewVendorPreview(selectedVendorPreview.value)
  } catch (error: any) {
    console.error('Error unlinking spec:', error)
    showToast(error.message || 'Failed to unlink specification', true)
  }
}

const unlinkChecklistFromVendor = async (checklistId: string | number) => {
  if (!selectedVendorPreview.value) return
  
  if (!confirm('Are you sure you want to unlink this checklist?')) return
  
  try {
    const res = await authenticatedFetch(`/api/v1/vendors/${selectedVendorPreview.value.id}/checklists/${checklistId}/unlink`, {
      method: 'DELETE'
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || 'Failed to unlink checklist')
    }
    
    previewLinkedChecklists.value = previewLinkedChecklists.value.filter(id => String(id) !== String(checklistId))
    showToast('Checklist unlinked successfully')
    await viewVendorPreview(selectedVendorPreview.value)
  } catch (error: any) {
    console.error('Error unlinking checklist:', error)
    showToast(error.message || 'Failed to unlink checklist', true)
  }
}
</script>

<style scoped>
/**
 * Modal transition animations
 * WHY: Smooth fade and scale animation for better UX
 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .bg-dark-900,
.modal-leave-active .bg-dark-900 {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease, box-shadow 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-dark-900 {
  transform: scale(0.9) translateY(-20px);
  opacity: 0;
  box-shadow: 0 0 0 rgba(59, 130, 246, 0);
}

.modal-leave-to .bg-dark-900 {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* Custom scrollbar for activity feed */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

/* Enhanced scrollbar for preview modal */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #2563eb, #7c3aed);
}

/* Gradient animation */
@keyframes gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

/* Pulse animation */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.02);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

/* Glow animation */
@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.7), 0 0 60px rgba(59, 130, 246, 0.5);
  }
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #2563eb, #7c3aed);
}

/* Modal animation */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease, box-shadow 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div {
  transform: scale(0.9) translateY(-20px);
  opacity: 0;
  box-shadow: 0 0 0 rgba(59, 130, 246, 0);
}

.modal-leave-to > div {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* Gradient animation */
@keyframes gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

/* Pulse animation */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.02);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

/* Glow animation */
@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.7), 0 0 60px rgba(59, 130, 246, 0.5);
  }
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}
</style> 