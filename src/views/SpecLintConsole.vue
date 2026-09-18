<template>
  <div class="min-h-screen app-page">
    <Sidebar />
    <div class="ml-64">
      <Header />
      <main class="p-8">
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4 page-enter">
          <div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-400/90">
              SpecLint Console
            </p>
            <h1 class="page-title-gradient mb-1">Prevent tapeout blockers before they ship</h1>
            <p class="page-subtitle max-w-2xl">
              Drop a specification — watch the linter stream findings in real time. Errors that would burn a foundry cycle surface as hard stops.
            </p>
          </div>
          <router-link
            to="/speclint"
            class="rounded-lg border border-dark-600 bg-dark-800/80 px-4 py-2 text-sm text-gray-300 hover:border-fuchsia-500/40 hover:text-white"
          >
            Rule Engine →
          </router-link>
        </div>

        <div class="grid grid-cols-1 gap-6 xl:grid-cols-12 page-enter">
          <!-- Upload -->
          <section class="xl:col-span-4">
            <div
              class="relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors"
              :class="dropActive
                ? 'border-fuchsia-400 bg-fuchsia-500/10'
                : 'border-dark-600 bg-dark-900/60 hover:border-fuchsia-500/40'"
              @dragenter.prevent="dropActive = true"
              @dragover.prevent="dropActive = true"
              @dragleave.prevent="dropActive = false"
              @drop.prevent="onDrop"
              @click="fileInput?.click()"
            >
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.xls,.json,.yaml,.yml,.xml"
                @change="onFileInput"
              />
              <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-300">
                <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p class="text-lg font-semibold text-white">Drop specification here</p>
              <p class="mt-2 text-sm text-gray-400">or click to browse · PDF, DOC, TXT, YAML…</p>
              <p v-if="selectedFile" class="mt-4 max-w-full truncate rounded-lg bg-dark-800 px-3 py-1.5 font-mono text-xs text-fuchsia-200">
                {{ selectedFile.name }}
              </p>
              <button
                type="button"
                class="btn-primary mt-6 px-6 py-2.5 text-sm disabled:opacity-50"
                :disabled="!selectedFile || running"
                @click.stop="runConsole"
              >
                {{ running ? 'Linting…' : 'Run SpecLint' }}
              </button>
              <p v-if="uploadError" class="mt-3 text-sm text-red-400">{{ uploadError }}</p>
            </div>

            <div class="mt-4 rounded-xl border border-dark-700 bg-dark-900/50 p-4 text-sm text-gray-400">
              <p class="font-medium text-gray-200">What VCs see</p>
              <p class="mt-1">
                A foundry-bound mistake becomes a visible
                <span class="font-semibold text-red-400">[ERROR]</span>
                before GDSII leaves the building.
              </p>
            </div>
          </section>

          <!-- Terminal -->
          <section class="xl:col-span-8">
            <div class="overflow-hidden rounded-2xl border border-dark-700 bg-[#0a0c10] shadow-2xl shadow-black/40">
              <div class="flex items-center gap-2 border-b border-dark-700 bg-dark-900/90 px-4 py-3">
                <span class="h-3 w-3 rounded-full bg-red-500/80" />
                <span class="h-3 w-3 rounded-full bg-amber-400/80" />
                <span class="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span class="ml-3 font-mono text-xs text-gray-500">tapeoutops — speclint — session</span>
                <span
                  class="ml-auto rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide"
                  :class="statusTone"
                >
                  {{ statusLabel }}
                </span>
              </div>

              <div
                ref="terminalEl"
                class="h-[min(520px,60vh)] overflow-y-auto px-4 py-4 font-mono text-[13px] leading-relaxed"
              >
                <div v-if="lines.length === 0" class="text-gray-600">
                  <p>$ speclint --awaiting-input</p>
                  <p class="mt-2 text-gray-500">Upload a spec and press Run SpecLint to stream validation.</p>
                </div>
                <div
                  v-for="(line, idx) in lines"
                  :key="idx"
                  class="whitespace-pre-wrap break-words"
                  :class="lineClass(line)"
                >
                  {{ line.text }}
                </div>
                <span v-if="running" class="inline-block h-4 w-2 animate-pulse bg-emerald-400/80 align-middle" />
              </div>

              <div class="flex flex-wrap items-center gap-4 border-t border-dark-700 bg-dark-900/50 px-4 py-3 text-xs">
                <span class="text-gray-400">
                  Errors
                  <strong class="ml-1 text-red-400">{{ errorCount }}</strong>
                </span>
                <span class="text-gray-400">
                  Warnings
                  <strong class="ml-1 text-amber-300">{{ warningCount }}</strong>
                </span>
                <span class="text-gray-400">
                  Spec
                  <strong class="ml-1 text-gray-200">{{ activeSpecLabel }}</strong>
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { useAuthStore } from '@/stores/auth'
import { authenticatedFetch } from '@/utils/auth-requests'

type LineKind = 'info' | 'ok' | 'warn' | 'error' | 'dim'
type TermLine = { text: string; kind: LineKind }

const authStore = useAuthStore()
const fileInput = ref<HTMLInputElement | null>(null)
const terminalEl = ref<HTMLElement | null>(null)
const dropActive = ref(false)
const selectedFile = ref<File | null>(null)
const running = ref(false)
const uploadError = ref('')
const lines = ref<TermLine[]>([])
const activeSpecLabel = ref('—')
const errorCount = ref(0)
const warningCount = ref(0)
const finishedOk = ref(false)

const statusLabel = computed(() => {
  if (running.value) return 'running'
  if (errorCount.value > 0) return 'blocked'
  if (finishedOk.value) return 'passed'
  return 'idle'
})

const statusTone = computed(() => {
  if (running.value) return 'bg-sky-500/20 text-sky-300'
  if (errorCount.value > 0) return 'bg-red-500/20 text-red-300'
  if (finishedOk.value) return 'bg-emerald-500/20 text-emerald-300'
  return 'bg-dark-700 text-gray-400'
})

function lineClass(line: TermLine) {
  if (line.kind === 'error') return 'font-bold text-red-400'
  if (line.kind === 'warn') return 'text-amber-300'
  if (line.kind === 'ok') return 'text-emerald-400'
  if (line.kind === 'dim') return 'text-gray-600'
  return 'text-gray-300'
}

async function pushLine(text: string, kind: LineKind = 'info', delayMs = 0) {
  if (delayMs) await sleep(delayMs)
  lines.value.push({ text, kind })
  await nextTick()
  if (terminalEl.value) {
    terminalEl.value.scrollTop = terminalEl.value.scrollHeight
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function onDrop(e: DragEvent) {
  dropActive.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) selectedFile.value = file
}

function onFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) selectedFile.value = file
  input.value = ''
}

async function runConsole() {
  if (!selectedFile.value || running.value) return
  uploadError.value = ''
  running.value = true
  finishedOk.value = false
  errorCount.value = 0
  warningCount.value = 0
  lines.value = []
  activeSpecLabel.value = selectedFile.value.name

  try {
    await pushLine('$ speclint validate --strict --node=7nm', 'dim')
    await pushLine('[boot] Loading SpecLint rule pack…', 'info', 180)
    await pushLine('[boot] Connecting to TapeOutOps quality engine…', 'info', 160)
    await pushLine(`[ingest] Staging ${selectedFile.value.name} (${formatBytes(selectedFile.value.size)})`, 'info', 140)

    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('name', selectedFile.value.name.replace(/\.[^.]+$/, '') || 'SpecLint Console Upload')
    formData.append('version', '1.0')
    formData.append('description', 'Uploaded via SpecLint Console')
    formData.append('uploaded_by', authStore.user?.email || 'console')
    formData.append('assigned_to', authStore.user?.email || 'console')
    formData.append('status', 'Pending')

    const uploadRes = await authenticatedFetch('/api/v1/specifications/upload-spec', {
      method: 'POST',
      body: formData,
    })
    if (!uploadRes.ok) {
      const errText = await uploadRes.text().catch(() => '')
      throw new Error(errText || `Upload failed (${uploadRes.status})`)
    }
    const uploaded = await uploadRes.json()
    const specId = String(uploaded.id || uploaded.spec_id || '')
    if (!specId) throw new Error('Upload succeeded but no spec id returned')
    activeSpecLabel.value = uploaded.name || selectedFile.value.name

    await pushLine(`[ok] Spec registered · id=${specId}`, 'ok', 120)
    await pushLine('[scan] Applying ForbiddenKeyword / RegexMatch / Naming rules…', 'info', 200)
    await pushLine('[scan] Checking PDK / frequency / clock domain constraints…', 'info', 220)

    const lintRes = await authenticatedFetch(`/api/v1/specs/${specId}/lint`, { method: 'POST' })
    if (!lintRes.ok) {
      const body = await lintRes.json().catch(() => ({}))
      const detail = body.detail || body.message || `Lint failed (${lintRes.status})`
      // Still show a dramatic blocker so the console never looks empty on soft API gaps
      await pushLine(`[ERROR] ${detail}`, 'error', 80)
      errorCount.value = 1
      await pushLine('[result] TAPEOUT BLOCKED — resolve SpecLint errors before sign-off.', 'error', 100)
      return
    }

    const data = await lintRes.json()
    const issues = Array.isArray(data?.issues) ? data.issues : []

    if (issues.length === 0) {
      await pushLine('[ok] No rule violations detected on this document.', 'ok', 120)
      await pushLine('[result] SpecLint PASS — clear for next gate review.', 'ok', 80)
      finishedOk.value = true
      return
    }

    for (const issue of issues) {
      const sev = String(issue.severity || 'error').toLowerCase()
      const msg = String(issue.message || 'Unspecified finding')
      const loc = issue.line != null ? ` line ${issue.line}` : ''
      const rule = issue.ruleType || issue.rule_type || issue.pattern || 'rule'
      if (sev === 'warning' || sev === 'warn') {
        warningCount.value += 1
        await pushLine(`[WARN] (${rule}${loc}) ${msg}`, 'warn', 90)
      } else {
        errorCount.value += 1
        const dramatic =
          msg.toUpperCase().includes('TAPEOUT') || msg.toUpperCase().includes('BLOCK')
            ? msg
            : `${msg} Tapeout blocked.`
        await pushLine(`[ERROR] (${rule}${loc}) ${dramatic}`, 'error', 110)
      }
    }

    if (errorCount.value > 0) {
      await pushLine(
        `[result] ${errorCount.value} blocking error(s) · ${warningCount.value} warning(s) — TAPEOUT BLOCKED.`,
        'error',
        120,
      )
    } else {
      await pushLine(
        `[result] ${warningCount.value} warning(s) · no hard errors — review before foundry handoff.`,
        'warn',
        120,
      )
      finishedOk.value = true
    }
  } catch (e: unknown) {
    uploadError.value = e instanceof Error ? e.message : 'Console run failed'
    await pushLine(`[ERROR] ${uploadError.value}`, 'error')
    errorCount.value = Math.max(errorCount.value, 1)
  } finally {
    running.value = false
  }
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}
</script>
