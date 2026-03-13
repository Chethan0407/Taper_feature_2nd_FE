<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Vendors</h1>
          <p class="text-gray-500 dark:text-gray-400">Vendor collaboration and tracking</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Vendor List -->
          <div class="lg:col-span-2">
            <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Vendor Partners</h2>
                <button class="btn-primary" @click="showVendorModal = true">Add Vendor</button>
              </div>
              <div v-if="error" class="text-red-500 text-center mb-4">{{ error }}</div>
              <div v-if="loading" class="text-gray-400 text-center mb-4">Loading...</div>
              <div v-if="!loading && vendorList.length === 0" class="text-gray-400 text-center mb-4">No vendors yet.</div>
              <div v-else class="space-y-4">
                <div v-for="vendor in vendorList" :key="vendor.id" 
                     class="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors cursor-pointer"
                     @click="viewVendorPreview(vendor)">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                        <span class="text-white font-semibold">{{ vendor.name.charAt(0) }}</span>
                      </div>
                      <div>
                        <h3 class="font-medium text-gray-900 dark:text-white">{{ vendor.name }}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ vendor.type }} • {{ vendor.status }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span :class="getStatusClass(vendor.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                        {{ vendor.status }}
                      </span>
                      <button class="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" @click.stop="handleEdit(vendor)">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                        </svg>
                      </button>
                      <button class="p-2 text-red-400 hover:text-red-600 transition-colors" @click.stop="confirmDelete(vendor)">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div class="lg:col-span-1">
            <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl flex flex-col" style="max-height: 600px;">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 px-6 pt-6 flex-shrink-0">Recent Activity</h2>
              <div class="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                <div v-if="activitiesLoading" class="text-center text-gray-400 py-4">Loading...</div>
                <div v-else-if="activitiesError" class="text-center text-red-400 py-4">Activity feed unavailable</div>
                <div v-else-if="activities.length === 0" class="text-center text-gray-400 py-4">No recent activity.</div>
                <div v-else class="space-y-4">
                  <div v-for="activity in recentActivities" :key="activity.timestamp + activity.action + activity.entity_id" class="flex items-start space-x-3">
                    <div class="w-2 h-2 bg-neon-blue rounded-full mt-2 flex-shrink-0"></div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-gray-900 dark:text-white break-words">{{ activity.action }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ formatActivityDate(activity.timestamp) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vendor Preview Card - Centered Modal (like Edit Project) -->
        <Transition name="modal">
          <div v-if="selectedVendorPreview" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="closeVendorPreview">
            <div class="bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-lg relative border border-neon-blue/20 ring-2 ring-neon-blue/10" @click.stop>
              <button @click="closeVendorPreview" class="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-800 hover:ring-1 hover:ring-neon-blue/30">
                &times;
              </button>
              <h2 class="text-3xl font-bold mb-8 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue bg-clip-text text-transparent animate-gradient">
                Vendor Preview
              </h2>
              <div v-if="previewLoading" class="text-center text-gray-300 py-8">
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
                <div class="flex items-center space-x-4 pb-5 border-b border-dark-700/50 relative">
                  <div class="w-14 h-14 bg-gradient-to-br from-neon-blue via-neon-purple to-neon-blue rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-neon-blue/30 animate-pulse-slow">
                    <span class="text-white font-bold text-2xl drop-shadow-lg">{{ selectedVendorPreview.name?.charAt(0) || 'V' }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-xl font-bold text-white mb-1 drop-shadow-sm">{{ selectedVendorPreview.name }}</h3>
                    <p class="text-sm text-gray-300 font-medium">{{ selectedVendorPreview.type }}</p>
                  </div>
                  <span :class="getStatusClass(selectedVendorPreview.status)" class="px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 shadow-md ring-1 ring-white/10">
                    {{ selectedVendorPreview.status }}
                  </span>
                </div>

                <!-- Linked Specifications -->
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <label class="block text-gray-200 text-sm font-semibold uppercase tracking-wider flex items-center space-x-2">
                      <svg class="w-4 h-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      <span>Linked Specifications</span>
                    </label>
                    <button 
                      @click="openLinkSpecModal"
                      class="px-3 py-1.5 text-xs font-medium text-neon-blue hover:text-neon-purple border border-neon-blue/30 hover:border-neon-blue/50 rounded-lg transition-all hover:bg-neon-blue/10"
                    >
                      + Link Spec
                    </button>
                  </div>
                  <div v-if="previewLinkedSpecs.length === 0" class="text-sm text-gray-500 italic py-3 px-4 bg-gradient-to-r from-dark-800/30 to-dark-800/20 border border-dashed border-neon-blue/20 rounded-lg backdrop-blur-sm">
                    No specifications linked
                  </div>
                  <div v-else class="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    <div v-for="specId in previewLinkedSpecs" :key="specId" 
                         class="px-4 py-2.5 bg-gradient-to-r from-dark-800/60 to-dark-800/40 border border-neon-blue/20 rounded-lg text-sm text-white hover:border-neon-blue/40 hover:from-dark-700/60 hover:to-dark-700/40 transition-all shadow-sm hover:shadow-md group flex items-center justify-between">
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
                    <label class="block text-gray-200 text-sm font-semibold uppercase tracking-wider flex items-center space-x-2">
                      <svg class="w-4 h-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                      </svg>
                      <span>Linked Checklists</span>
                    </label>
                    <button 
                      @click="openLinkChecklistModal"
                      class="px-3 py-1.5 text-xs font-medium text-neon-blue hover:text-neon-purple border border-neon-blue/30 hover:border-neon-blue/50 rounded-lg transition-all hover:bg-neon-blue/10"
                    >
                      + Link Checklist
                    </button>
                  </div>
                  <div v-if="previewLinkedChecklists.length === 0" class="text-sm text-gray-500 italic py-3 px-4 bg-gradient-to-r from-dark-800/30 to-dark-800/20 border border-dashed border-neon-blue/20 rounded-lg backdrop-blur-sm">
                    No checklists linked
                  </div>
                  <div v-else class="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    <div v-for="checklistId in previewLinkedChecklists" :key="checklistId" 
                         class="px-4 py-2.5 bg-gradient-to-r from-dark-800/60 to-dark-800/40 border border-neon-blue/20 rounded-lg text-sm text-white hover:border-neon-blue/40 hover:from-dark-700/60 hover:to-dark-700/40 transition-all shadow-sm hover:shadow-md group flex items-center justify-between">
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

                <!-- Actions -->
                <div class="flex justify-end gap-3 pt-5 border-t border-dark-700/50">
                  <button @click="closeVendorPreview" class="btn-secondary px-6 py-3 rounded-lg font-medium hover:bg-dark-800 transition-all hover:scale-105">
                    Close
                  </button>
                  <button @click="handleEdit(selectedVendorPreview)" class="btn-primary px-8 py-3 rounded-lg font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105 animate-glow">
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
      </main>
    </div>

    <!-- Link Spec Modal -->
    <LinkModal
      v-if="showLinkSpecModal && selectedVendorPreview"
      type="spec"
      :available-items="allSpecs.filter(spec => !previewLinkedSpecs.includes(spec.id))"
      :on-link="linkSpecToVendor"
      :on-close="() => showLinkSpecModal = false"
    />

    <!-- Link Checklist Modal -->
    <LinkModal
      v-if="showLinkChecklistModal && selectedVendorPreview"
      type="checklist"
      :available-items="allChecklists.filter(checklist => !previewLinkedChecklists.includes(checklist.id))"
      :on-link="linkChecklistToVendor"
      :on-close="() => showLinkChecklistModal = false"
    />

    <!-- Vendor Modal - Improved Design -->
    <!-- WHY: Better UX with larger modal, better spacing, searchable multi-selects, and validation -->
    <Transition name="modal">
      <div v-if="showVendorModal" class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="closeModal">
        <div class="bg-dark-900 rounded-2xl relative w-full max-w-2xl shadow-2xl border border-dark-700 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-dark-900 border-b border-dark-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 class="text-2xl font-bold text-gradient">{{ editingVendor ? 'Edit Vendor' : 'Add Vendor' }}</h2>
            <button 
              class="text-gray-400 hover:text-gray-200 transition-colors p-2 hover:bg-dark-800 rounded-lg" 
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
              <label for="name" class="block text-sm font-semibold text-gray-200 mb-2">
                Vendor Name <span class="text-red-400">*</span>
              </label>
              <input 
                id="name" 
                v-model="vendorForm.name" 
                type="text"
                class="input-field w-full py-3 px-4 text-base rounded-lg bg-dark-800 border border-dark-700 text-white placeholder-gray-500 focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all" 
                placeholder="Enter vendor name"
                required
                :class="{ 'border-red-500': formErrors.name }"
              >
              <p v-if="formErrors.name" class="text-red-400 text-sm mt-1">{{ formErrors.name }}</p>
            </div>

            <!-- Type Field - Dropdown with common types -->
            <div>
              <label for="type" class="block text-sm font-semibold text-gray-200 mb-2">
                Vendor Type <span class="text-red-400">*</span>
              </label>
              <select 
                id="type" 
                v-model="vendorForm.type" 
                class="input-field w-full py-3 px-4 text-base rounded-lg bg-dark-800 border border-dark-700 text-white focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all"
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
              <label for="status" class="block text-sm font-semibold text-gray-200 mb-2">
                Status <span class="text-red-400">*</span>
              </label>
              <select 
                id="status" 
                v-model="vendorForm.status" 
                class="input-field w-full py-3 px-4 text-base rounded-lg bg-dark-800 border border-dark-700 text-white focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all"
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
            <div>
              <label class="block text-sm font-semibold text-gray-200 mb-2">
                Linked Specifications
                <span class="text-xs font-normal text-gray-400 ml-2">(Optional)</span>
              </label>
              
              <!-- Preview Section - Show all linked specs -->
              <div v-if="vendorForm.linkedSpecs.length > 0" class="mb-4 p-4 bg-dark-800/50 border border-dark-700 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-sm font-semibold text-gray-300">Currently Linked ({{ vendorForm.linkedSpecs.length }})</h4>
                </div>
                <div class="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                  <div 
                    v-for="specId in vendorForm.linkedSpecs" 
                    :key="specId"
                    class="flex items-center justify-between px-3 py-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                  >
                    <span class="text-white text-sm flex-1">{{ getSpecName(specId) }}</span>
                    <button 
                      type="button"
                      @click="removeSpec(specId)"
                      class="ml-2 text-red-400 hover:text-red-300 transition-colors p-1"
                      title="Remove specification"
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
                  class="input-field w-full py-3 px-4 text-base rounded-lg bg-dark-800 border border-dark-700 text-white placeholder-gray-500 focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all" 
                  placeholder="Search specifications to add..."
                  @focus="showSpecDropdown = true"
                  @blur="onSpecInputBlur"
                >
                <!-- Dropdown -->
                <div v-if="showSpecDropdown && filteredSpecs.length > 0" class="absolute z-10 w-full mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <div 
                    v-for="spec in filteredSpecs" 
                    :key="spec.id"
                    class="px-4 py-2 hover:bg-dark-700 cursor-pointer flex items-center justify-between"
                    @click="toggleSpec(spec.id)"
                  >
                    <span class="text-white text-sm">{{ spec.name || spec.file_name || 'Unnamed Spec' }}</span>
                    <svg v-if="vendorForm.linkedSpecs.includes(spec.id)" class="w-5 h-5 text-neon-blue" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Linked Checklists - Improved with preview and search -->
            <div>
              <label class="block text-sm font-semibold text-gray-200 mb-2">
                Linked Checklists
                <span class="text-xs font-normal text-gray-400 ml-2">(Optional)</span>
              </label>
              
              <!-- Preview Section - Show all linked checklists -->
              <div v-if="vendorForm.linkedChecklists.length > 0" class="mb-4 p-4 bg-dark-800/50 border border-dark-700 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-sm font-semibold text-gray-300">Currently Linked ({{ vendorForm.linkedChecklists.length }})</h4>
                </div>
                <div class="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                  <div 
                    v-for="checklistId in vendorForm.linkedChecklists" 
                    :key="checklistId"
                    class="flex items-center justify-between px-3 py-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                  >
                    <span class="text-white text-sm flex-1">{{ getChecklistName(checklistId) }}</span>
                    <button 
                      type="button"
                      @click="removeChecklist(checklistId)"
                      class="ml-2 text-red-400 hover:text-red-300 transition-colors p-1"
                      title="Remove checklist"
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
                  class="input-field w-full py-3 px-4 text-base rounded-lg bg-dark-800 border border-dark-700 text-white placeholder-gray-500 focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all" 
                  placeholder="Search checklists to add..."
                  @focus="showChecklistDropdown = true"
                  @blur="onChecklistInputBlur"
                >
                <!-- Dropdown -->
                <div v-if="showChecklistDropdown" class="absolute z-10 w-full mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <template v-if="filteredChecklists.length > 0">
                    <div 
                      v-for="checklist in filteredChecklists" 
                      :key="checklist.id"
                      class="px-4 py-2 hover:bg-dark-700 cursor-pointer flex items-center justify-between"
                      @click="toggleChecklist(checklist.id)"
                    >
                      <span class="text-white text-sm">{{ checklist.name || 'Unnamed Checklist' }}</span>
                      <svg v-if="vendorForm.linkedChecklists.includes(checklist.id)" class="w-5 h-5 text-neon-blue" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  </template>
                  <div v-else class="px-4 py-2 text-sm text-gray-400">
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
            <div class="flex gap-3 pt-4 border-t border-dark-700">
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
        <p class="mb-6 text-gray-300 text-center">Are you sure you want to delete <span class="font-semibold">{{ vendorToDelete?.name }}</span>?</p>
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
import { onMounted, ref, computed } from 'vue'
import { useVendorsStore } from '@/stores/vendors'
import { useAuthStore } from '@/stores/auth'
import { authenticatedFetch } from '@/utils/auth-requests'
import type { Vendor } from '@/stores/vendors'

// Replace VendorActivity interface and activities ref with new structure
interface Activity {
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entity_id: number;
}

const vendorsStore = useVendorsStore()
const loading = computed(() => vendorsStore.loading)
const error = computed(() => vendorsStore.error)
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
  if (!specSearch.value) return allSpecs.value
  const search = specSearch.value.toLowerCase()
  return allSpecs.value.filter(spec => 
    (spec.name || spec.file_name || '').toLowerCase().includes(search)
  )
})

const filteredChecklists = computed(() => {
  if (!checklistSearch.value) return allChecklists.value
  const search = checklistSearch.value.toLowerCase()
  return allChecklists.value.filter(checklist => 
    (checklist.name || '').toLowerCase().includes(search)
  )
})

// Helper functions for multi-select
const toggleSpec = (specId: string | number) => {
  const index = vendorForm.value.linkedSpecs.indexOf(specId)
  if (index > -1) {
    vendorForm.value.linkedSpecs.splice(index, 1)
  } else {
    vendorForm.value.linkedSpecs.push(specId)
  }
  // Close the dropdown after selecting to avoid it staying open
  showSpecDropdown.value = false
}

// Close spec dropdown when input loses focus (with small delay so clicks on options still register)
const onSpecInputBlur = () => {
  setTimeout(() => {
    showSpecDropdown.value = false
  }, 150)
}

const removeSpec = (specId: string | number) => {
  const index = vendorForm.value.linkedSpecs.indexOf(specId)
  if (index > -1) {
    vendorForm.value.linkedSpecs.splice(index, 1)
  }
}

const getSpecName = (specId: string | number) => {
  // Handle both string and number ID matching
  const spec = allSpecs.value.find(s => String(s.id) === String(specId))
  return spec?.name || spec?.file_name || `Spec ${specId}`
}

const toggleChecklist = (checklistId: string | number) => {
  const index = vendorForm.value.linkedChecklists.indexOf(checklistId)
  if (index > -1) {
    vendorForm.value.linkedChecklists.splice(index, 1)
  } else {
    vendorForm.value.linkedChecklists.push(checklistId)
  }
  // Close dropdown after selection so it doesn't stay open
  showChecklistDropdown.value = false
}

// Close checklist dropdown when input loses focus
const onChecklistInputBlur = () => {
  setTimeout(() => {
    showChecklistDropdown.value = false
  }, 150)
}

const removeChecklist = (checklistId: string | number) => {
  const index = vendorForm.value.linkedChecklists.indexOf(checklistId)
  if (index > -1) {
    vendorForm.value.linkedChecklists.splice(index, 1)
  }
}

const getChecklistName = (checklistId: string | number) => {
  // Handle both string and number ID matching
  const checklist = allChecklists.value.find(c => String(c.id) === String(checklistId))
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

// Fetch recent activity from API
const fetchActivities = async () => {
  activitiesLoading.value = true
  activitiesError.value = ''
  try {
    const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
    // Fetch activities - limit is handled client-side by recentActivities computed property
    const res = await fetch('/api/v1/activity/', { headers })
    if (!res.ok) {
      if (res.status === 401) {
        await authStore.logout()
        window.location.href = '/login'
        throw new Error('Session expired. Please log in again.')
      }
      throw new Error('Failed to fetch activity')
    }
    const data = await res.json()
    // Store only the most recent activities to prevent memory issues
    const allActivities = Array.isArray(data) ? data : []
    // Sort by timestamp (newest first) and limit what we store
    const sortedActivities = [...allActivities]
      .sort((a, b) => {
        const dateA = parseTimestampForSort(a.timestamp)
        const dateB = parseTimestampForSort(b.timestamp)
        return dateB - dateA // Descending order (newest first)
      })
      .slice(0, MAX_RECENT_ACTIVITIES)
    activities.value = sortedActivities
  } catch (e: any) {
    activitiesError.value = e.message || 'Failed to fetch activity'
    activities.value = []
  } finally {
    activitiesLoading.value = false
  }
}

onMounted(async () => {
  await vendorsStore.fetchVendors()
  await fetchActivities()

  const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined

  // Fetch specs
  const specsRes = await fetch('/api/v1/specifications', { headers })
  if (specsRes.ok) {
    allSpecs.value = await specsRes.json()
  }

  // Fetch checklist templates for linking (not active instances)
  // Backend exposes them under /api/v1/checklists/templates
  const checklistsRes = await fetch('/api/v1/checklists/templates', { headers })
  if (checklistsRes.ok) {
    allChecklists.value = await checklistsRes.json()
  } else {
    allChecklists.value = []
  }
})

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400 border border-green-500/30'
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    case 'inactive':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}

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
  if (uploadingNDA.value) {
    const res = await fetch(`/api/v1/vendors/${uploadingNDA.value}/nda`, {
      method: 'POST'
    })
    if (res.ok) {
      // Handle successful upload
      uploadingNDA.value = null
    }
  }
}

const acknowledge = async () => {
  if (acknowledging.value) {
    const res = await fetch(`/api/v1/vendors/${acknowledging.value}/acknowledge`, {
      method: 'POST'
    })
    if (res.ok) {
      // Handle successful acknowledgement
      acknowledging.value = null
    }
  }
}

// View vendor preview
const viewVendorPreview = async (vendor: Vendor) => {
  selectedVendorPreview.value = vendor
  previewLoading.value = true
  previewError.value = ''
  previewLinkedSpecs.value = []
  previewLinkedChecklists.value = []
  
  try {
    // Fetch full vendor details to get linked specs and checklists
    const fullVendor = await vendorsStore.getVendor(vendor.id)
    selectedVendorPreview.value = fullVendor
    
    // Normalize IDs to ensure consistent type
    const normalizeIds = (ids: any[]): (string | number)[] => {
      if (!Array.isArray(ids)) return []
      return ids.map(id => id !== null && id !== undefined ? id : null).filter(id => id !== null)
    }
    
    previewLinkedSpecs.value = normalizeIds(fullVendor.linked_specs || fullVendor.linkedSpecs || [])
    previewLinkedChecklists.value = normalizeIds(fullVendor.linked_checklists || fullVendor.linkedChecklists || [])
    
    console.log('✅ Loaded vendor preview:', {
      id: fullVendor.id,
      name: fullVendor.name,
      linkedSpecs: previewLinkedSpecs.value,
      linkedChecklists: previewLinkedChecklists.value
    })
  } catch (error: any) {
    console.error('⚠️ Failed to fetch vendor preview:', error)
    previewError.value = error.message || 'Failed to load vendor details'
    // Keep basic vendor info even if fetch fails
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
  
  try {
    const res = await authenticatedFetch(`/api/v1/vendors/${selectedVendorPreview.value.id}/specifications/${spec.id}/link`, {
      method: 'POST'
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || 'Failed to link specification')
    }
    
    // Add to preview list
    if (!previewLinkedSpecs.value.includes(spec.id)) {
      previewLinkedSpecs.value.push(spec.id)
    }
    
    showLinkSpecModal.value = false
    // Refresh vendor data
    await viewVendorPreview(selectedVendorPreview.value)
  } catch (error: any) {
    console.error('Error linking spec:', error)
    alert(error.message || 'Failed to link specification')
  }
}

const linkChecklistToVendor = async (checklist: any) => {
  if (!selectedVendorPreview.value) return
  
  try {
    const res = await authenticatedFetch(`/api/v1/vendors/${selectedVendorPreview.value.id}/checklists/${checklist.id}/link`, {
      method: 'POST'
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || 'Failed to link checklist')
    }
    
    // Add to preview list
    if (!previewLinkedChecklists.value.includes(checklist.id)) {
      previewLinkedChecklists.value.push(checklist.id)
    }
    
    showLinkChecklistModal.value = false
    // Refresh vendor data
    await viewVendorPreview(selectedVendorPreview.value)
  } catch (error: any) {
    console.error('Error linking checklist:', error)
    alert(error.message || 'Failed to link checklist')
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
    
    // Remove from preview list
    previewLinkedSpecs.value = previewLinkedSpecs.value.filter(id => String(id) !== String(specId))
    
    // Refresh vendor data
    await viewVendorPreview(selectedVendorPreview.value)
  } catch (error: any) {
    console.error('Error unlinking spec:', error)
    alert(error.message || 'Failed to unlink specification')
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
    
    // Remove from preview list
    previewLinkedChecklists.value = previewLinkedChecklists.value.filter(id => String(id) !== String(checklistId))
    
    // Refresh vendor data
    await viewVendorPreview(selectedVendorPreview.value)
  } catch (error: any) {
    console.error('Error unlinking checklist:', error)
    alert(error.message || 'Failed to unlink checklist')
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