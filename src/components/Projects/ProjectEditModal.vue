<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60">
    <div
      class="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-dark-700 dark:bg-dark-900"
    >
      <button
        type="button"
        class="absolute right-4 top-4 text-2xl font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        @click="$emit('close')"
      >
        &times;
      </button>
      <h2 class="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Edit Project</h2>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">PROJECT NAME</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Enter project name"
            class="input-field w-full"
            required
          />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">DESCRIPTION (OPTIONAL)</label>
          <textarea
            v-model="form.description"
            placeholder="Project description"
            class="input-field w-full resize-none"
            rows="3"
          />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">PLATFORM</label>
            <select v-model="form.platform" class="input-field w-full" required>
              <option value="">Select Platform</option>
              <option
                v-for="p in metadataStore.platforms.length > 0 ? metadataStore.platforms : ['ASIC', 'FPGA', 'SoC']"
                :key="p"
                :value="p"
              >
                {{ p }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">EDA TOOL</label>
            <select v-model="form.edaTool" class="input-field w-full" required>
              <option value="">Select EDA Tool</option>
              <option
                v-for="e in metadataStore.edaTools.length > 0 ? metadataStore.edaTools : ['Synopsys', 'Cadence', 'Mentor']"
                :key="e"
                :value="e"
              >
                {{ e }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">TYPE</label>
            <select v-model="form.type" class="input-field w-full" required>
              <option value="">Select Type</option>
              <option
                v-for="t in metadataStore.types.length > 0 ? metadataStore.types : ['TapeOut', 'LintOnly']"
                :key="t"
                :value="t"
              >
                {{ t }}
              </option>
            </select>
          </div>
        </div>
        <div>
          <CompanySelector v-model="form.companyId" label="COMPANY" required />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" class="btn-secondary rounded-lg px-6 py-3" @click="$emit('close')">Cancel</button>
          <button type="submit" class="btn-primary rounded-lg px-8 py-3 font-semibold" :disabled="submitting">
            <span v-if="submitting">Updating...</span>
            <span v-else>Update Project</span>
          </button>
        </div>
        <div v-if="error" class="mt-2 text-red-600 dark:text-red-400">{{ error }}</div>
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

const form = reactive({
  name: '',
  description: '',
  platform: '',
  edaTool: '',
  type: '',
  companyId: null as number | string | null,
})

const submitting = ref(false)
const error = ref('')

function syncFromProject(p: Project) {
  form.name = p.name || ''
  form.description = p.description || ''
  form.platform = p.platform || ''
  form.edaTool = p.eda_tool || p.edaTool || ''
  form.type = p.type || ''
  form.companyId = p.company_id ?? p.companyId ?? null
}

watch(
  () => props.project,
  (p) => {
    if (p) syncFromProject(p)
  },
  { immediate: true }
)

onMounted(() => {
  if (props.project) syncFromProject(props.project)
})

const handleSubmit = async () => {
  submitting.value = true
  error.value = ''
  try {
    await projectsStore.updateProject(props.project.id, {
      name: form.name,
      description: form.description || undefined,
      platform: form.platform as Project['platform'],
      edaTool: form.edaTool as Project['edaTool'],
      type: form.type as Project['type'],
      company_id: form.companyId != null ? Number(form.companyId) : undefined,
    })
    emit('updated')
    emit('close')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Update failed'
  } finally {
    submitting.value = false
  }
}
</script>
