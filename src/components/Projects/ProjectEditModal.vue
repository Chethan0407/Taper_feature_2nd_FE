<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60">
    <div
      class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-dark-700 dark:bg-dark-900"
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

        <div class="rounded-xl border border-slate-200 p-4 dark:border-dark-600">
          <p class="mb-3 text-sm font-semibold text-slate-800 dark:text-gray-200">Tapeout profile</p>
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
              <input v-model="form.pdk_version" type="text" class="input-field w-full" placeholder="e.g. 1.2.3" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">EDA TOOL VERSION</label>
              <input v-model="form.eda_tool_version" type="text" class="input-field w-full" placeholder="e.g. 2024.1" />
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
  foundry: '',
  process_node: '',
  pdk_version: '',
  eda_tool_version: '',
  target_tapeout_date: '',
  tapeout_status: '',
})

const submitting = ref(false)
const error = ref('')

function toDateInput(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value.slice(0, 10)
  return d.toISOString().slice(0, 10)
}

function syncFromProject(p: Project) {
  form.name = p.name || ''
  form.description = p.description || ''
  form.platform = p.platform || ''
  form.edaTool = p.eda_tool || p.edaTool || ''
  form.type = p.type || ''
  form.companyId = p.company_id ?? p.companyId ?? null
  form.foundry = p.foundry || ''
  form.process_node = p.process_node || ''
  form.pdk_version = p.pdk_version || ''
  form.eda_tool_version = p.eda_tool_version || ''
  form.target_tapeout_date = toDateInput(p.target_tapeout_date)
  form.tapeout_status = p.tapeout_status || ''
}

watch(
  () => props.project,
  (p) => {
    if (p) syncFromProject(p)
  },
  { immediate: true },
)

onMounted(() => {
  if (!metadataStore.platforms.length) metadataStore.fetchMetadata()
  if (props.project) syncFromProject(props.project)
})

const handleSubmit = async () => {
  submitting.value = true
  error.value = ''
  try {
    const targetIso = form.target_tapeout_date
      ? new Date(`${form.target_tapeout_date}T00:00:00Z`).toISOString()
      : undefined

    await projectsStore.updateProject(props.project.id, {
      name: form.name,
      description: form.description || undefined,
      platform: form.platform,
      edaTool: form.edaTool,
      type: form.type,
      company_id: form.companyId != null ? Number(form.companyId) : undefined,
      foundry: form.foundry || undefined,
      process_node: form.process_node || undefined,
      pdk_version: form.pdk_version || undefined,
      eda_tool_version: form.eda_tool_version || undefined,
      target_tapeout_date: targetIso,
      tapeout_status: form.tapeout_status || undefined,
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
