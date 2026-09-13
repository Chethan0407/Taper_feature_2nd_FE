<template>
  <div>
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 transform -translate-y-4 scale-95"
      enter-to-class="opacity-100 transform translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 transform translate-y-0 scale-100"
      leave-to-class="opacity-0 transform -translate-y-4 scale-95"
    >
      <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-dark-600/50 dark:bg-dark-900/95 dark:backdrop-blur-sm">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Project Name -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">PROJECT NAME</label>
            <input 
              v-model="form.name"
              type="text"
              placeholder="Enter project name"
              class="input-field w-full"
              required
            />
            <p v-if="nameError" class="mt-1 text-xs text-red-400">
              {{ nameError }}
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">DESCRIPTION (OPTIONAL)</label>
            <textarea 
              v-model="form.description"
              placeholder="Project description"
              rows="3"
              class="input-field w-full resize-none"
            ></textarea>
          </div>

          <!-- Platform, EDA Tool, Type Row -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Platform -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">PLATFORM</label>
              <select v-model="form.platform" class="input-field w-full" required>
                <option value="">Select Platform</option>
                <option v-for="p in (metadataStore.platforms.length > 0 ? metadataStore.platforms : ['ASIC', 'FPGA', 'SoC'])" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>

            <!-- EDA Tool -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">EDA TOOL</label>
              <select v-model="form.edaTool" class="input-field w-full" required>
                <option value="">Select EDA Tool</option>
                <option v-for="e in (metadataStore.edaTools.length > 0 ? metadataStore.edaTools : ['Synopsys', 'Cadence', 'Mentor'])" :key="e" :value="e">{{ e }}</option>
              </select>
            </div>

            <!-- Type -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">TYPE</label>
              <select v-model="form.type" class="input-field w-full" required>
                <option value="">Select Type</option>
                <option v-for="t in (metadataStore.types.length > 0 ? metadataStore.types : ['TapeOut', 'LintOnly'])" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>

          <!-- Company Selection -->
          <div>
            <CompanySelector
              v-model="form.companyId"
              label="COMPANY"
              required
            />
          </div>

          <!-- Tapeout profile -->
          <div class="rounded-xl border border-slate-200 p-4 dark:border-dark-600">
            <p class="mb-3 text-sm font-semibold text-slate-800 dark:text-gray-200">Tapeout profile</p>
            <p class="mb-4 text-xs text-slate-500 dark:text-gray-400">
              Foundry, node, and PDK for program readiness tracking — not an EDA runner.
            </p>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">FOUNDRY</label>
                <select v-model="form.foundry" class="input-field w-full">
                  <option value="">Select foundry</option>
                  <option
                    v-for="f in (metadataStore.platforms.length ? metadataStore.platforms : ['TSMC', 'Samsung', 'GlobalFoundries', 'Intel'])"
                    :key="f"
                    :value="f"
                  >{{ f }}</option>
                </select>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">PROCESS NODE</label>
                <select v-model="form.process_node" class="input-field w-full">
                  <option value="">Select node</option>
                  <option
                    v-for="n in (metadataStore.processNodes.length ? metadataStore.processNodes : ['N3', 'N5', 'N7', 'N16', 'N28'])"
                    :key="n"
                    :value="n"
                  >{{ n }}</option>
                </select>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">PDK VERSION</label>
                <input v-model="form.pdk_version" type="text" placeholder="e.g. 1.2.3" class="input-field w-full" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">EDA TOOL VERSION</label>
                <input v-model="form.eda_tool_version" type="text" placeholder="e.g. 2024.1" class="input-field w-full" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">TARGET TAPEOUT DATE</label>
                <input v-model="form.target_tapeout_date" type="date" class="input-field w-full" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">TAPEOUT STATUS</label>
                <select v-model="form.tapeout_status" class="input-field w-full">
                  <option value="">Select status</option>
                  <option
                    v-for="s in (metadataStore.tapeoutStatuses.length ? metadataStore.tapeoutStatuses : ['planning', 'in_progress', 'frozen', 'submitted', 'fab'])"
                    :key="s"
                    :value="s"
                  >{{ s }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              @click="emit('cancel')"
              class="btn-secondary px-6 py-3 rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="submitting"
              class="btn-primary rounded-lg px-8 py-3 font-semibold"
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
import { ref, reactive, onMounted } from 'vue'
import { useProjectsStore, type Project } from '@/stores/projects'
import CompanySelector from '@/components/Common/CompanySelector.vue'
import { useMetadataStore } from '@/stores/metadata'

interface Props {
  onProjectCreated?: (project: Project) => void
}

const props = defineProps<Props>()

const projectsStore = useProjectsStore()
const showForm = ref(true)
const submitting = ref(false)
const nameError = ref('')

const metadataStore = useMetadataStore()

const form = reactive({
  name: '',
  description: '',
  platform: '' as string,
  edaTool: '' as string,
  type: '' as string,
  companyId: '' as string,
  foundry: '',
  process_node: '',
  pdk_version: '',
  eda_tool_version: '',
  target_tapeout_date: '',
  tapeout_status: '',
})

const emit = defineEmits(['project-created', 'cancel'])

onMounted(async () => {
  if (!metadataStore.platforms.length) metadataStore.fetchMetadata()
})

const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    resetForm()
    emit('cancel')
  }
}

const resetForm = () => {
  form.name = ''
  form.description = ''
  form.platform = ''
  form.edaTool = ''
  form.type = ''
  form.companyId = ''
  form.foundry = ''
  form.process_node = ''
  form.pdk_version = ''
  form.eda_tool_version = ''
  form.target_tapeout_date = ''
  form.tapeout_status = ''
  nameError.value = ''
}

const handleSubmit = async () => {
  submitting.value = true
  nameError.value = ''

  try {
    const trimmedName = form.name.trim()

    if (!trimmedName) {
      throw new Error('Project name is required')
    }

    const existing = projectsStore.projects?.some(
      (p) => p.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    )
    if (existing) {
      nameError.value = 'A project with this name already exists. Please choose a different name.'
      submitting.value = false
      return
    }

    if (!form.companyId || !parseInt(form.companyId)) {
      throw new Error('Please select a company')
    }

    const targetIso = form.target_tapeout_date
      ? new Date(`${form.target_tapeout_date}T00:00:00Z`).toISOString()
      : undefined

    const projectData = {
      name: trimmedName,
      description: form.description,
      platform: form.platform,
      edaTool: form.edaTool,
      type: form.type,
      status: 'active' as const,
      company_id: parseInt(form.companyId),
      foundry: form.foundry || undefined,
      process_node: form.process_node || undefined,
      pdk_version: form.pdk_version || undefined,
      eda_tool_version: form.eda_tool_version || undefined,
      target_tapeout_date: targetIso,
      tapeout_status: form.tapeout_status || undefined,
      created_at: '',
      updated_at: '',
    }

    const newProject = await projectsStore.createProject(projectData as any)

    emit('project-created', newProject)
    if (props.onProjectCreated) {
      props.onProjectCreated(newProject)
    }

    resetForm()
    showForm.value = false
  } catch (error: any) {
    console.error('Failed to create project:', error)
  } finally {
    submitting.value = false
  }
}
</script> 