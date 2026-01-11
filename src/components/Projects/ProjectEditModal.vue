<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-lg relative">
      <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl font-bold" @click="$emit('close')">&times;</button>
      <h2 class="text-3xl font-bold text-white mb-8">Edit Project</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
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
        <div>
          <label class="block text-gray-300 text-sm font-medium mb-2">DESCRIPTION (OPTIONAL)</label>
          <textarea 
            v-model="form.description" 
            placeholder="Project description"
            class="input-field w-full bg-dark-800/50 border-dark-600 focus:border-neon-blue transition-colors resize-none" 
            rows="3"
          ></textarea>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-gray-300 text-sm font-medium mb-2">PLATFORM</label>
            <select 
              v-model="form.platform" 
              class="input-field w-full bg-dark-800/50 border-dark-600 focus:border-neon-blue transition-colors" 
              required
            >
              <option value="">Select Platform</option>
              <option v-for="p in (metadataStore.platforms.length > 0 ? metadataStore.platforms : ['ASIC', 'FPGA', 'SoC'])" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div>
            <label class="block text-gray-300 text-sm font-medium mb-2">EDA TOOL</label>
            <select 
              v-model="form.edaTool" 
              class="input-field w-full bg-dark-800/50 border-dark-600 focus:border-neon-blue transition-colors" 
              required
            >
              <option value="">Select EDA Tool</option>
              <option v-for="e in (metadataStore.edaTools.length > 0 ? metadataStore.edaTools : ['Synopsys', 'Cadence', 'Mentor'])" :key="e" :value="e">{{ e }}</option>
            </select>
          </div>
          <div>
            <label class="block text-gray-300 text-sm font-medium mb-2">TYPE</label>
            <select 
              v-model="form.type" 
              class="input-field w-full bg-dark-800/50 border-dark-600 focus:border-neon-blue transition-colors" 
              required
            >
              <option value="">Select Type</option>
              <option v-for="t in (metadataStore.types.length > 0 ? metadataStore.types : ['TapeOut', 'LintOnly'])" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
        </div>
        <div>
          <CompanySelector v-model="form.companyId" label="COMPANY" required />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" class="btn-secondary px-6 py-3 rounded-lg" @click="$emit('close')">Cancel</button>
          <button type="submit" class="btn-primary px-8 py-3 rounded-lg font-semibold shadow-xl animate-glow" :disabled="submitting">
            <span v-if="submitting">Updating...</span>
            <span v-else>Update Project</span>
          </button>
        </div>
        <div v-if="error" class="text-red-400 mt-2">{{ error }}</div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useProjectsStore, type Project } from '@/stores/projects'
import CompanySelector from '@/components/Common/CompanySelector.vue'
import { useMetadataStore } from '@/stores/metadata'

const props = defineProps<{ project: Project }>()
const emit = defineEmits(['close', 'updated'])
const projectsStore = useProjectsStore()
const metadataStore = useMetadataStore()
const submitting = ref(false)
const error = ref('')
const form = reactive({
  name: '',
  description: '',
  platform: '' as 'ASIC' | 'FPGA' | 'SoC',
  edaTool: '' as 'Synopsys' | 'Cadence' | 'Mentor',
  type: '' as 'TapeOut' | 'LintOnly',
  companyId: ''
})

watch(() => props.project, (p) => {
  if (p) {
    form.name = p.name || ''
    form.description = p.description || ''
    form.platform = (p.platform || '') as 'ASIC' | 'FPGA' | 'SoC'
    form.edaTool = (p.edaTool || '') as 'Synopsys' | 'Cadence' | 'Mentor'
    form.type = (p.type || '') as 'TapeOut' | 'LintOnly'
    form.companyId = p.company_id ? String(p.company_id) : ''
  }
}, { immediate: true })

onMounted(() => {
  if (!metadataStore.platforms.length) metadataStore.fetchMetadata()
})

const handleSubmit = async () => {
  submitting.value = true
  error.value = ''
  try {
    // Validate company_id is selected and is a valid number
    const companyIdNum = parseInt(form.companyId)
    if (!companyIdNum || isNaN(companyIdNum)) {
      throw new Error('Please select a valid company')
    }
    await projectsStore.updateProject(props.project.id, {
      name: form.name,
      description: form.description,
      platform: form.platform,
      edaTool: form.edaTool,
      type: form.type,
      company_id: companyIdNum
    })
    emit('updated')
  } catch (e: any) {
    error.value = e.message || 'Failed to update project'
  } finally {
    submitting.value = false
  }
}
</script> 