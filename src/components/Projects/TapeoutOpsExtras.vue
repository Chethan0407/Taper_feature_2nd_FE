<template>
  <div class="space-y-8" data-testid="tapeout-ops-extras">
    <!-- Waivers -->
    <section class="settings-card" data-testid="readiness-waivers">
      <div class="settings-card-body">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold text-white">Waivers</h3>
            <p class="text-sm text-slate-400">Log and approve signoff blockers without claiming tool execution.</p>
          </div>
          <button type="button" class="btn-secondary px-3 py-1.5 text-xs" @click="showWaiverForm = !showWaiverForm">
            {{ showWaiverForm ? 'Cancel' : 'Add waiver' }}
          </button>
        </div>

        <form v-if="showWaiverForm" class="grid gap-3 rounded-xl border border-slate-700 p-3 sm:grid-cols-2" @submit.prevent="onCreateWaiver">
          <input v-model="waiverForm.title" required class="input-field" placeholder="Title" />
          <select v-model="waiverForm.severity" required class="input-field">
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
          <input v-model="waiverForm.rule_id" class="input-field" placeholder="Rule ID (optional)" />
          <input v-model="waiverForm.description" class="input-field sm:col-span-2" placeholder="Description (optional)" />
          <button type="submit" class="btn-primary px-3 py-2 text-sm sm:col-span-2" :disabled="busy">Create waiver</button>
        </form>

        <p v-if="waiversError" class="text-sm text-amber-400">{{ waiversError }}</p>
        <p v-else-if="!waivers.length" class="text-sm text-slate-500">No waivers yet.</p>
        <ul v-else class="divide-y divide-slate-800">
          <li v-for="w in waivers" :key="String(w.id)" class="flex flex-wrap items-center justify-between gap-2 py-3">
            <div class="min-w-0">
              <p class="font-medium text-white">{{ w.title }}</p>
              <p class="text-xs text-slate-500">{{ w.rule_id || '—' }} · {{ w.description || '' }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span :class="statusBadgeClass(w.status || 'pending')">{{ w.status || 'pending' }}</span>
              <span v-if="w.severity" :class="severityBadgeClass(String(w.severity))">{{ w.severity }}</span>
              <button
                v-if="String(w.status || '').toLowerCase() !== 'approved'"
                type="button"
                class="text-xs font-medium text-emerald-400 hover:underline"
                @click="setWaiverStatus(w, 'approved')"
              >
                Approve
              </button>
              <button
                v-if="String(w.status || '').toLowerCase() !== 'rejected'"
                type="button"
                class="text-xs font-medium text-red-400 hover:underline"
                @click="setWaiverStatus(w, 'rejected')"
              >
                Reject
              </button>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Packages -->
    <section class="settings-card" data-testid="readiness-packages">
      <div class="settings-card-body">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold text-white">Release packages</h3>
            <p class="text-sm text-slate-400">Version labels, checksums, and freeze — tracking only.</p>
          </div>
          <button type="button" class="btn-secondary px-3 py-1.5 text-xs" @click="showPkgForm = !showPkgForm">
            {{ showPkgForm ? 'Cancel' : 'New package' }}
          </button>
        </div>

        <form v-if="showPkgForm" class="flex flex-wrap gap-2" @submit.prevent="onCreatePackage">
          <input v-model="pkgForm.version_label" required class="input-field min-w-[10rem] flex-1" placeholder="Version label e.g. TO-1.0" />
          <input v-model="pkgForm.notes" class="input-field min-w-[10rem] flex-1" placeholder="Notes (optional)" />
          <button type="submit" class="btn-primary px-3 py-2 text-sm" :disabled="busy">Create</button>
        </form>

        <p v-if="packagesError" class="text-sm text-amber-400">{{ packagesError }}</p>
        <p v-else-if="!packages.length" class="text-sm text-slate-500">No packages yet.</p>
        <div v-else class="space-y-3">
          <article v-for="pkg in packages" :key="String(pkg.id)" class="rounded-xl border border-slate-700 p-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p class="font-semibold text-white">{{ pkg.version_label || `Package ${pkg.id}` }}</p>
                <p class="text-xs text-slate-500">{{ pkg.notes || 'No notes' }}</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <span :class="statusBadgeClass(pkg.is_frozen ? 'frozen' : pkg.status || 'draft')">
                  {{ pkg.is_frozen ? 'frozen' : pkg.status || 'draft' }}
                </span>
                <button
                  v-if="!pkg.is_frozen"
                  type="button"
                  class="text-xs font-medium text-amber-300 hover:underline"
                  @click="onFreezePackage(pkg)"
                >
                  Freeze package
                </button>
                <label class="cursor-pointer text-xs font-medium text-neon-blue hover:underline">
                  Upload artifact
                  <input type="file" class="hidden" @change="onUploadArtifact($event, pkg)" />
                </label>
              </div>
            </div>
            <ul v-if="pkg.artifacts?.length" class="mt-2 space-y-1 text-xs text-slate-400">
              <li v-for="(a, i) in pkg.artifacts" :key="a.id ?? i">
                {{ a.file_name || 'file' }}
                <span v-if="a.checksum_sha256" class="font-mono text-slate-500"> · sha256:{{ String(a.checksum_sha256).slice(0, 12) }}…</span>
              </li>
            </ul>
            <form v-if="!pkg.is_frozen" class="mt-2 grid gap-2 sm:grid-cols-4" @submit.prevent="onRegisterArtifact(pkg)">
              <input v-model="artifactForms[String(pkg.id)].file_name" required class="input-field text-xs" placeholder="file_name" />
              <input v-model="artifactForms[String(pkg.id)].artifact_type" required class="input-field text-xs" placeholder="artifact_type" />
              <input v-model="artifactForms[String(pkg.id)].checksum_sha256" required class="input-field text-xs" placeholder="checksum_sha256" />
              <button type="submit" class="btn-secondary px-2 py-1.5 text-xs">Register checksum</button>
            </form>
          </article>
        </div>
      </div>
    </section>

    <!-- Submissions -->
    <section class="settings-card" data-testid="readiness-submissions">
      <div class="settings-card-body">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold text-white">Foundry submissions</h3>
            <p class="text-sm text-slate-400">Track ticket status — does not submit to foundry MES.</p>
          </div>
          <button type="button" class="btn-secondary px-3 py-1.5 text-xs" @click="showSubForm = !showSubForm">
            {{ showSubForm ? 'Cancel' : 'New submission' }}
          </button>
        </div>

        <form v-if="showSubForm" class="grid gap-2 sm:grid-cols-3" @submit.prevent="onCreateSubmission">
          <select v-model="subForm.package_id" required class="input-field">
            <option value="">Package</option>
            <option v-for="pkg in packages" :key="String(pkg.id)" :value="String(pkg.id)">
              {{ pkg.version_label || pkg.id }}
            </option>
          </select>
          <select v-model="subForm.status" class="input-field">
            <option v-for="s in submissionStatuses" :key="s" :value="s">{{ s }}</option>
          </select>
          <input v-model="subForm.foundry_ticket_id" class="input-field" placeholder="Foundry ticket ID" />
          <button type="submit" class="btn-primary px-3 py-2 text-sm sm:col-span-3" :disabled="busy">Create submission</button>
        </form>

        <p v-if="subsError" class="text-sm text-amber-400">{{ subsError }}</p>
        <p v-else-if="!submissions.length" class="text-sm text-slate-500">No submissions yet.</p>
        <ul v-else class="divide-y divide-slate-800">
          <li v-for="s in submissions" :key="String(s.id)" class="flex flex-wrap items-center justify-between gap-2 py-3">
            <div>
              <p class="font-medium text-white">Submission {{ s.id }}</p>
              <p class="text-xs text-slate-500">Package {{ s.package_id || '—' }} · Ticket {{ s.foundry_ticket_id || '—' }}</p>
            </div>
            <div class="flex items-center gap-2">
              <select
                class="input-field py-1 text-xs"
                :value="s.status || 'draft'"
                @change="onPatchSubmission(s, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="st in submissionStatuses" :key="st" :value="st">{{ st }}</option>
              </select>
              <span :class="statusBadgeClass(s.status || 'draft')">{{ s.status || 'draft' }}</span>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Fab lots -->
    <section class="settings-card" data-testid="readiness-fab-lots">
      <div class="settings-card-body">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold text-white">Fab lots</h3>
            <p class="text-sm text-slate-400">Post-tapeout lot tracking (wafer_start → fab_out).</p>
          </div>
          <button type="button" class="btn-secondary px-3 py-1.5 text-xs" @click="showLotForm = !showLotForm">
            {{ showLotForm ? 'Cancel' : 'Add lot' }}
          </button>
        </div>

        <form v-if="showLotForm" class="grid gap-2 sm:grid-cols-3" @submit.prevent="onCreateLot">
          <input v-model="lotForm.lot_id" required class="input-field" placeholder="Lot ID" />
          <input v-model.number="lotForm.wafer_count" required type="number" min="1" class="input-field" placeholder="Wafer count" />
          <select v-model="lotForm.status" class="input-field">
            <option v-for="st in fabStatuses" :key="st" :value="st">{{ st }}</option>
          </select>
          <button type="submit" class="btn-primary px-3 py-2 text-sm sm:col-span-3" :disabled="busy">Create fab lot</button>
        </form>

        <p v-if="lotsError" class="text-sm text-amber-400">{{ lotsError }}</p>
        <p v-else-if="!fabLots.length" class="text-sm text-slate-500">No fab lots yet.</p>
        <ul v-else class="divide-y divide-slate-800">
          <li v-for="lot in fabLots" :key="String(lot.id)" class="flex flex-wrap items-center justify-between gap-2 py-3">
            <div>
              <p class="font-medium text-white">{{ lot.lot_id || lot.id }}</p>
              <p class="text-xs text-slate-500">{{ lot.wafer_count ?? '—' }} wafers</p>
            </div>
            <select
              class="input-field py-1 text-xs"
              :value="lot.status || 'wafer_start'"
              @change="onPatchLot(lot, ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="st in fabStatuses" :key="st" :value="st">{{ st }}</option>
            </select>
          </li>
        </ul>
      </div>
    </section>

    <p v-if="flashMsg" class="text-sm" :class="flashErr ? 'text-red-400' : 'text-emerald-400'">{{ flashMsg }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { statusBadgeClass, severityBadgeClass } from '@/utils/status-badge'
import {
  fetchWaivers,
  createWaiver,
  patchWaiver,
  fetchPackages,
  createPackage,
  registerPackageArtifact,
  uploadPackageArtifact,
  freezePackage,
  fetchSubmissions,
  createSubmission,
  patchSubmission,
  fetchFabLots,
  createFabLot,
  patchFabLot,
  type Waiver,
  type ReleasePackage,
  type FoundrySubmission,
  type FabLot,
} from '@/utils/readiness-api'

const props = defineProps<{ projectId: string | number }>()
const emit = defineEmits<{ (e: 'changed'): void }>()

const submissionStatuses = ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'resubmit']
const fabStatuses = ['wafer_start', 'in_fab', 'fab_out', 'hold', 'scrapped']

const busy = ref(false)
const flashMsg = ref('')
const flashErr = ref(false)

const waivers = ref<Waiver[]>([])
const waiversError = ref('')
const showWaiverForm = ref(false)
const waiverForm = reactive({ title: '', severity: 'medium', rule_id: '', description: '' })

const packages = ref<ReleasePackage[]>([])
const packagesError = ref('')
const showPkgForm = ref(false)
const pkgForm = reactive({ version_label: '', notes: '' })
const artifactForms = reactive<Record<string, { file_name: string; artifact_type: string; checksum_sha256: string }>>({})

const submissions = ref<FoundrySubmission[]>([])
const subsError = ref('')
const showSubForm = ref(false)
const subForm = reactive({ package_id: '', status: 'draft', foundry_ticket_id: '' })

const fabLots = ref<FabLot[]>([])
const lotsError = ref('')
const showLotForm = ref(false)
const lotForm = reactive({ lot_id: '', wafer_count: 25, status: 'wafer_start' })

function flash(msg: string, isError = false) {
  flashMsg.value = msg
  flashErr.value = isError
  window.setTimeout(() => {
    if (flashMsg.value === msg) flashMsg.value = ''
  }, 4000)
}

function ensureArtifactForm(pkgId: string | number) {
  const key = String(pkgId)
  if (!artifactForms[key]) {
    artifactForms[key] = { file_name: '', artifact_type: 'gds', checksum_sha256: '' }
  }
}

async function loadAll() {
  waiversError.value = ''
  packagesError.value = ''
  subsError.value = ''
  lotsError.value = ''
  try {
    waivers.value = await fetchWaivers(props.projectId)
  } catch (e: any) {
    waiversError.value = e?.message || 'Failed to load waivers'
  }
  try {
    packages.value = await fetchPackages(props.projectId)
    packages.value.forEach((p) => ensureArtifactForm(p.id))
  } catch (e: any) {
    packagesError.value = e?.message || 'Failed to load packages'
  }
  try {
    submissions.value = await fetchSubmissions(props.projectId)
  } catch (e: any) {
    subsError.value = e?.message || 'Failed to load submissions'
  }
  try {
    fabLots.value = await fetchFabLots(props.projectId)
  } catch (e: any) {
    lotsError.value = e?.message || 'Failed to load fab lots'
  }
}

async function onCreateWaiver() {
  busy.value = true
  try {
    await createWaiver(props.projectId, {
      title: waiverForm.title,
      severity: waiverForm.severity,
      rule_id: waiverForm.rule_id || undefined,
      description: waiverForm.description || undefined,
    })
    showWaiverForm.value = false
    waiverForm.title = ''
    waiverForm.rule_id = ''
    waiverForm.description = ''
    flash('Waiver created')
    await loadAll()
    emit('changed')
  } catch (e: any) {
    flash(e?.message || 'Create waiver failed', true)
  } finally {
    busy.value = false
  }
}

async function setWaiverStatus(w: Waiver, status: string) {
  try {
    await patchWaiver(props.projectId, w.id, { status })
    flash(`Waiver ${status}`)
    await loadAll()
    emit('changed')
  } catch (e: any) {
    flash(e?.message || 'Update failed', true)
  }
}

async function onCreatePackage() {
  busy.value = true
  try {
    await createPackage(props.projectId, {
      version_label: pkgForm.version_label,
      notes: pkgForm.notes || undefined,
    })
    showPkgForm.value = false
    pkgForm.version_label = ''
    pkgForm.notes = ''
    flash('Package created')
    await loadAll()
    emit('changed')
  } catch (e: any) {
    flash(e?.message || 'Create package failed', true)
  } finally {
    busy.value = false
  }
}

async function onFreezePackage(pkg: ReleasePackage) {
  try {
    await freezePackage(props.projectId, pkg.id)
    flash('Package frozen')
    await loadAll()
    emit('changed')
  } catch (e: any) {
    flash(e?.message || 'Freeze failed', true)
  }
}

async function onRegisterArtifact(pkg: ReleasePackage) {
  ensureArtifactForm(pkg.id)
  const f = artifactForms[String(pkg.id)]
  try {
    await registerPackageArtifact(props.projectId, pkg.id, { ...f })
    f.file_name = ''
    f.checksum_sha256 = ''
    flash('Artifact registered')
    await loadAll()
    emit('changed')
  } catch (e: any) {
    flash(e?.message || 'Register failed', true)
  }
}

async function onUploadArtifact(ev: Event, pkg: ReleasePackage) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    await uploadPackageArtifact(props.projectId, pkg.id, file)
    flash('Artifact uploaded')
    await loadAll()
    emit('changed')
  } catch (e: any) {
    flash(e?.message || 'Upload failed', true)
  }
}

async function onCreateSubmission() {
  busy.value = true
  try {
    await createSubmission(props.projectId, {
      package_id: subForm.package_id,
      status: subForm.status,
      foundry_ticket_id: subForm.foundry_ticket_id || undefined,
    })
    showSubForm.value = false
    subForm.package_id = ''
    subForm.foundry_ticket_id = ''
    flash('Submission created')
    await loadAll()
    emit('changed')
  } catch (e: any) {
    flash(e?.message || 'Create submission failed', true)
  } finally {
    busy.value = false
  }
}

async function onPatchSubmission(s: FoundrySubmission, status: string) {
  try {
    await patchSubmission(props.projectId, s.id, { status })
    flash('Submission updated')
    await loadAll()
    emit('changed')
  } catch (e: any) {
    flash(e?.message || 'Update failed', true)
  }
}

async function onCreateLot() {
  busy.value = true
  try {
    await createFabLot(props.projectId, {
      lot_id: lotForm.lot_id,
      wafer_count: Number(lotForm.wafer_count) || 1,
      status: lotForm.status,
    })
    showLotForm.value = false
    lotForm.lot_id = ''
    flash('Fab lot created')
    await loadAll()
    emit('changed')
  } catch (e: any) {
    flash(e?.message || 'Create fab lot failed', true)
  } finally {
    busy.value = false
  }
}

async function onPatchLot(lot: FabLot, status: string) {
  try {
    await patchFabLot(props.projectId, lot.id, { status })
    flash('Fab lot updated')
    await loadAll()
    emit('changed')
  } catch (e: any) {
    flash(e?.message || 'Update failed', true)
  }
}

watch(
  () => props.projectId,
  () => {
    if (props.projectId != null && props.projectId !== '') loadAll()
  },
)

onMounted(loadAll)

defineExpose({ reload: loadAll })
</script>
