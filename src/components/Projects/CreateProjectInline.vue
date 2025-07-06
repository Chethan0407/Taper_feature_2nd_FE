<template>
  <div class="mb-8">
    <!-- Toggle Button -->
    <div class="flex justify-end mb-4">
      <button 
        @click="toggleForm"
        class="btn-primary px-6 py-3 text-lg font-semibold shadow-xl animate-glow rounded-xl"
        :class="{ 'bg-gray-600': showForm }"
      >
        <svg v-if="!showForm" class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        <svg v-else class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        {{ showForm ? 'Cancel' : 'New Project' }}
      </button>
    </div>

    <!-- Inline Form -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 transform -translate-y-4 scale-95"
      enter-to-class="opacity-100 transform translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 transform translate-y-0 scale-100"
      leave-to-class="opacity-0 transform -translate-y-4 scale-95"
    >
      <div v-if="showForm" class="card bg-dark-900/50 backdrop-blur-sm border border-dark-600/50 rounded-2xl p-6 shadow-2xl">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Project Name -->
          <div>
            <label class="block text-gray-300 text-sm font-medium mb-2">PROJECT NAME</label>
            <input 
              v-model="form.name"
              type="text"
              placeholder="Enter project name"
              class="input-field w-full bg-dark-800/50 border-dark-600 focus:border-neon-blue transition-colors"
              required
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-gray-300 text-sm font-medium mb-2">DESCRIPTION (OPTIONAL)</label>
            <textarea 
              v-model="form.description"
              placeholder="Project description"
              rows="3"
              class="input-field w-full bg-dark-800/50 border-dark-600 focus:border-neon-blue transition-colors resize-none"
            ></textarea>
          </div>

          <!-- Platform, EDA Tool, Type Row -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Platform -->
            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">PLATFORM</label>
              <select 
                v-model="form.platform"
                class="input-field w-full bg-dark-800/50 border-dark-600 focus:border-neon-blue transition-colors"
                required
              >
                <option value="">Select Platform</option>
                <option value="ASIC">ASIC</option>
                <option value="FPGA">FPGA</option>
                <option value="SoC">SoC</option>
              </select>
            </div>

            <!-- EDA Tool -->
            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">EDA TOOL</label>
              <select 
                v-model="form.edaTool"
                class="input-field w-full bg-dark-800/50 border-dark-600 focus:border-neon-blue transition-colors"
                required
              >
                <option value="">Select EDA Tool</option>
                <option value="Synopsys">Synopsys</option>
                <option value="Cadence">Cadence</option>
                <option value="Mentor">Mentor</option>
              </select>
            </div>

            <!-- Type -->
            <div>
              <label class="block text-gray-300 text-sm font-medium mb-2">TYPE</label>
              <select 
                v-model="form.type"
                class="input-field w-full bg-dark-800/50 border-dark-600 focus:border-neon-blue transition-colors"
                required
              >
                <option value="">Select Type</option>
                <option value="TapeOut">TapeOut</option>
                <option value="LintOnly">Lint Only</option>
              </select>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              @click="toggleForm"
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
              {{ submitting ? 'Creating...' : 'Create Project' }}
            </button>
          </div>
        </form>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useProjectsStore, type Project } from '@/stores/projects'

interface Props {
  onProjectCreated?: (project: Project) => void
}

const props = defineProps<Props>()

const projectsStore = useProjectsStore()
const showForm = ref(false)
const submitting = ref(false)

const form = reactive({
  name: '',
  description: '',
  platform: '' as 'ASIC' | 'FPGA' | 'SoC',
  edaTool: '' as 'Synopsys' | 'Cadence' | 'Mentor',
  type: '' as 'TapeOut' | 'LintOnly'
})

const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    resetForm()
  }
}

const resetForm = () => {
  form.name = ''
  form.description = ''
  form.platform = '' as 'ASIC' | 'FPGA' | 'SoC'
  form.edaTool = '' as 'Synopsys' | 'Cadence' | 'Mentor'
  form.type = '' as 'TapeOut' | 'LintOnly'
}

const handleSubmit = async () => {
  submitting.value = true
  
  try {
    const projectData = {
      name: form.name,
      description: form.description,
      platform: form.platform,
      edaTool: form.edaTool,
      type: form.type,
      status: 'active' as const
    }
    
    const newProject = await projectsStore.createProject(projectData)
    
    // Call parent callback if provided
    if (props.onProjectCreated) {
      props.onProjectCreated(newProject)
    }
    
    // Reset form and hide
    resetForm()
    showForm.value = false
    
    // Show success toast (you can implement a toast system)
    console.log('Project created successfully!')
    
  } catch (error: any) {
    console.error('Failed to create project:', error)
    // Show error toast
  } finally {
    submitting.value = false
  }
}
</script> 