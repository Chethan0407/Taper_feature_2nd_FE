<template>
  <div
    class="rounded-xl border border-neon-blue/30 bg-neon-blue/5 p-4 dark:border-neon-blue/25"
    data-testid="settings-agent-access"
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-sm font-semibold text-slate-800 dark:text-gray-100">
            Connect Cursor or Claude
          </h3>
          <span
            class="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300"
          >
            Live · API key
          </span>
        </div>
        <p class="mt-1 text-sm text-slate-500 dark:text-gray-400">
          Agents call the same authenticated APIs with
          <code class="text-xs">X-API-Key</code>
          or
          <code class="text-xs">Authorization: Bearer &lt;key&gt;</code>
          — same RBAC as the user who created the key.
        </p>
      </div>
      <button
        type="button"
        class="text-sm text-neon-blue hover:underline"
        :disabled="loading"
        @click="load"
      >
        Refresh
      </button>
    </div>

    <p v-if="error" class="mt-3 text-sm text-amber-400">{{ error }}</p>
    <p v-else-if="loading" class="mt-3 text-sm text-slate-500">Loading agent access…</p>

    <template v-else-if="access">
      <ol class="mt-4 list-decimal space-y-3 pl-5 text-sm text-slate-700 dark:text-gray-300">
        <li>
          <span class="font-medium text-slate-900 dark:text-white">Create an API key</span>
          in
          <router-link
            to="/settings?section=account"
            class="text-neon-blue hover:underline"
          >
            Settings → Account → API Keys
          </router-link>
          . Copy it once — we never store the raw key in the browser after create.
        </li>
        <li>
          <span class="font-medium text-slate-900 dark:text-white">Paste into Cursor / Claude MCP</span>
          using the snippet below. Set
          <code class="text-xs">{{ access.mcp.path }}</code>
          to an absolute path on your machine (see
          <span class="font-mono text-xs">{{ access.mcp.docs || 'mcp-tapeoutops/README.md' }}</span>
          on the backend).
        </li>
        <li>
          <span class="font-medium text-slate-900 dark:text-white">Discovery</span>
          —
          <a
            :href="agentAccessUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-neon-blue hover:underline"
          >GET /api/v1/public/agent-access</a>
          ·
          <a
            :href="openapiUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-neon-blue hover:underline"
          >OpenAPI</a>
        </li>
      </ol>

      <div class="mt-4">
        <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">MCP config snippet</p>
          <button
            type="button"
            class="btn-secondary px-3 py-1 text-xs"
            @click="copySnippet"
          >
            {{ copied ? 'Copied' : 'Copy JSON' }}
          </button>
        </div>
        <pre
          class="overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-3 text-[11px] leading-relaxed text-emerald-300 dark:border-dark-600"
        >{{ mcpSnippet }}</pre>
        <p class="mt-2 text-xs text-slate-500">
          Env vars from API:
          <span
            v-for="(env, i) in access.mcp.env"
            :key="env"
          >{{ env }}<span v-if="i < access.mcp.env.length - 1">, </span></span>
        </p>
      </div>

      <div
        class="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200"
        role="status"
      >
        {{ access.notes || 'API keys inherit full user access. Prefer a dedicated least-privilege user for agents.' }}
      </div>

      <ul class="mt-3 space-y-1 text-xs text-slate-500 dark:text-gray-400">
        <li v-for="h in access.auth.headers" :key="h" class="font-mono">{{ h }}</li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { resolveApiUrl } from '@/config/api'
import { fetchPublicAgentAccess, type PublicAgentAccess } from '@/api/public-claims'

const access = ref<PublicAgentAccess | null>(null)
const loading = ref(false)
const error = ref('')
const copied = ref(false)

const apiBase = computed(() => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'https://tapeoutops.com'
})

const agentAccessUrl = computed(() => resolveApiUrl('/api/v1/public/agent-access'))
const openapiUrl = computed(() => {
  const path = access.value?.auth?.openapi || '/api/v1/openapi.json'
  return resolveApiUrl(path.startsWith('/') ? path : `/${path}`)
})

const mcpSnippet = computed(() => {
  const path = access.value?.mcp?.path || 'mcp-tapeoutops/server.py'
  const body = {
    mcpServers: {
      tapeoutops: {
        command: 'python',
        args: [`</absolute/path/to/${path}>`],
        env: {
          TAPEOUTOPS_API_URL: apiBase.value,
          TAPEOUTOPS_API_KEY: '<paste-api-key-once>',
        },
      },
    },
  }
  return JSON.stringify(body, null, 2)
})

async function copySnippet() {
  try {
    await navigator.clipboard.writeText(mcpSnippet.value)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    /* ignore */
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    access.value = await fetchPublicAgentAccess()
  } catch (e: any) {
    error.value = e?.message || 'Failed to load agent access'
    access.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})
</script>
