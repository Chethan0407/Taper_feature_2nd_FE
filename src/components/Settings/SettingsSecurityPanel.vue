<template>
  <section
    id="security"
    class="settings-card scroll-mt-8"
    data-testid="settings-security"
  >
    <div class="settings-card-body space-y-8">
      <div>
        <h2 class="module-section-title text-lg">Security</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-gray-400">
          MFA, access review, retention, and account deletion
        </p>
      </div>

      <!-- Session -->
      <div class="rounded-xl border border-slate-200 p-4 dark:border-dark-600">
        <h3 class="text-sm font-semibold text-slate-800 dark:text-gray-100">Session</h3>
        <p v-if="sessionLoading" class="mt-2 text-sm text-slate-500">Loading session…</p>
        <p v-else-if="sessionError" class="mt-2 text-sm text-red-500">{{ sessionError }}</p>
        <dl v-else-if="session" class="mt-3 grid gap-2 text-sm text-slate-600 dark:text-gray-300 sm:grid-cols-2">
          <div>
            <dt class="text-xs uppercase tracking-wide text-slate-400">Expires at</dt>
            <dd>{{ session.expires_at || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-slate-400">Absolute timeout</dt>
            <dd>{{ session.absolute_timeout_minutes }} minutes</dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-slate-400">MFA</dt>
            <dd>{{ session.mfa_enabled ? 'Enabled' : 'Disabled' }}</dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-slate-400">Role</dt>
            <dd>{{ session.rbac_role || '—' }}</dd>
          </div>
        </dl>
      </div>

      <!-- MFA -->
      <div class="rounded-xl border border-slate-200 p-4 dark:border-dark-600">
        <h3 class="text-sm font-semibold text-slate-800 dark:text-gray-100">Multi-factor authentication (TOTP)</h3>
        <p class="mt-1 text-sm text-slate-500 dark:text-gray-400">
          Status: {{ mfaStatus?.mfa_enabled ? 'Enabled' : 'Disabled' }}
          <span v-if="mfaStatus?.method"> · {{ mfaStatus.method }}</span>
        </p>
        <p v-if="mfaError" class="mt-2 text-sm text-red-500">{{ mfaError }}</p>
        <p v-if="mfaSuccess" class="mt-2 text-sm text-emerald-500">{{ mfaSuccess }}</p>

        <div v-if="!mfaStatus?.mfa_enabled" class="mt-4 space-y-4">
          <button
            type="button"
            class="btn-secondary px-4 py-2 text-sm"
            :disabled="mfaBusy"
            @click="startMfaSetup"
          >
            {{ mfaBusy ? 'Working…' : 'Set up MFA' }}
          </button>

          <div v-if="mfaSetup" class="space-y-3 rounded-lg border border-dashed border-slate-300 p-4 dark:border-dark-500">
            <p class="text-sm text-slate-600 dark:text-gray-300">
              Scan this QR with your authenticator app, or enter the secret manually.
            </p>
            <img
              v-if="qrSrc"
              :src="qrSrc"
              alt="MFA QR code"
              class="h-44 w-44 rounded-lg border border-slate-200 bg-white p-2 dark:border-dark-600"
              width="176"
              height="176"
            />
            <p class="break-all font-mono text-xs text-slate-500">{{ mfaSetup.secret }}</p>
            <div>
              <label class="mb-1 block text-sm text-slate-700 dark:text-gray-300">Confirmation code</label>
              <input
                v-model="mfaCode"
                type="text"
                inputmode="numeric"
                maxlength="8"
                class="input-field w-full max-w-xs"
                placeholder="6-digit code"
              />
            </div>
            <button
              type="button"
              class="btn-primary px-4 py-2 text-sm"
              :disabled="mfaBusy || mfaCode.trim().length < 6"
              @click="confirmEnableMfa"
            >
              Enable MFA
            </button>
          </div>
        </div>

        <div v-else class="mt-4 space-y-3">
          <label class="mb-1 block text-sm text-slate-700 dark:text-gray-300">Code to disable MFA</label>
          <input
            v-model="mfaDisableCode"
            type="text"
            inputmode="numeric"
            maxlength="8"
            class="input-field w-full max-w-xs"
            placeholder="6-digit code"
          />
          <button
            type="button"
            class="btn-secondary px-4 py-2 text-sm text-red-500"
            :disabled="mfaBusy || mfaDisableCode.trim().length < 6"
            @click="confirmDisableMfa"
          >
            Disable MFA
          </button>
        </div>
      </div>

      <!-- Access review -->
      <div class="rounded-xl border border-slate-200 p-4 dark:border-dark-600">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-sm font-semibold text-slate-800 dark:text-gray-100">Access review</h3>
          <button type="button" class="btn-secondary px-3 py-1.5 text-xs" :disabled="reviewLoading" @click="loadAccessReview">
            {{ reviewLoading ? 'Loading…' : 'Refresh' }}
          </button>
        </div>
        <p v-if="reviewError" class="mt-2 text-sm text-red-500">{{ reviewError }}</p>
        <p v-else-if="accessReview" class="mt-2 text-xs text-slate-500">
          {{ accessReview.company_name || 'No company' }}
          · reviewed {{ accessReview.reviewed_at }}
        </p>
        <div v-if="accessReview?.users?.length" class="mt-3 overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="text-xs uppercase text-slate-400">
              <tr>
                <th class="py-2 pr-3">Email</th>
                <th class="py-2 pr-3">Role</th>
                <th class="py-2 pr-3">MFA</th>
                <th class="py-2 pr-3">Active</th>
                <th class="py-2">Last login</th>
              </tr>
            </thead>
            <tbody class="text-slate-700 dark:text-gray-300">
              <tr v-for="u in accessReview.users" :key="u.user_id" class="border-t border-slate-100 dark:border-dark-700">
                <td class="py-2 pr-3">{{ u.email }}</td>
                <td class="py-2 pr-3">{{ u.role || '—' }}</td>
                <td class="py-2 pr-3">{{ u.mfa_enabled ? 'Yes' : 'No' }}</td>
                <td class="py-2 pr-3">{{ u.is_active ? 'Yes' : 'No' }}</td>
                <td class="py-2">{{ u.last_login_at || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else-if="accessReview && !reviewLoading" class="mt-3 text-sm text-slate-500">No users in review.</p>
      </div>

      <!-- Retention -->
      <div class="rounded-xl border border-slate-200 p-4 dark:border-dark-600">
        <h3 class="text-sm font-semibold text-slate-800 dark:text-gray-100">Data retention</h3>
        <p v-if="retentionError" class="mt-2 text-sm text-red-500">{{ retentionError }}</p>
        <p v-if="retentionSuccess" class="mt-2 text-sm text-emerald-500">{{ retentionSuccess }}</p>
        <div v-if="retention" class="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm text-slate-700 dark:text-gray-300">Retention days (30–3650)</label>
            <input
              v-model.number="retentionDays"
              type="number"
              min="30"
              max="3650"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm text-slate-700 dark:text-gray-300">Deletion policy</label>
            <select v-model="deletionPolicy" class="input-field w-full">
              <option value="soft_delete">soft_delete</option>
              <option value="anonymize">anonymize</option>
            </select>
          </div>
        </div>
        <p v-if="retention?.notes" class="mt-2 text-xs text-slate-500">{{ retention.notes }}</p>
        <button
          type="button"
          class="btn-primary mt-3 px-4 py-2 text-sm"
          :disabled="retentionBusy || !retention"
          @click="saveRetention"
        >
          {{ retentionBusy ? 'Saving…' : 'Save retention' }}
        </button>
      </div>

      <!-- Delete account -->
      <div class="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
        <h3 class="text-sm font-semibold text-red-400">Delete account</h3>
        <p class="mt-1 text-sm text-slate-600 dark:text-gray-400">
          Soft-deletes your account when confirmed. Export data first if needed.
        </p>
        <label class="mt-3 flex items-center gap-2 text-sm text-slate-700 dark:text-gray-300">
          <input v-model="deleteConfirm" type="checkbox" />
          I confirm account deletion
        </label>
        <input
          v-model="deleteReason"
          type="text"
          maxlength="500"
          class="input-field mt-2 w-full"
          placeholder="Optional reason"
        />
        <p v-if="deleteError" class="mt-2 text-sm text-red-500">{{ deleteError }}</p>
        <p v-if="deleteSuccess" class="mt-2 text-sm text-emerald-500">{{ deleteSuccess }}</p>
        <button
          type="button"
          class="btn-secondary mt-3 px-4 py-2 text-sm text-red-500"
          :disabled="deleteBusy || !deleteConfirm"
          @click="submitDeletion"
        >
          {{ deleteBusy ? 'Submitting…' : 'Request deletion' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  disableMfa,
  enableMfa,
  fetchAccessReview,
  fetchMfaStatus,
  fetchRetention,
  fetchSessionInfo,
  requestAccountDeletion,
  setupMfa,
  updateRetention,
} from '@/api/security'
import type {
  AccessReviewResponse,
  MfaSetupResponse,
  MfaStatus,
  RetentionSettings,
  SessionInfo,
} from '@/types/security'

const authStore = useAuthStore()

const session = ref<SessionInfo | null>(null)
const sessionLoading = ref(false)
const sessionError = ref('')

const mfaStatus = ref<MfaStatus | null>(null)
const mfaSetup = ref<MfaSetupResponse | null>(null)
const mfaCode = ref('')
const mfaDisableCode = ref('')
const mfaBusy = ref(false)
const mfaError = ref('')
const mfaSuccess = ref('')

const accessReview = ref<AccessReviewResponse | null>(null)
const reviewLoading = ref(false)
const reviewError = ref('')

const retention = ref<RetentionSettings | null>(null)
const retentionDays = ref(365)
const deletionPolicy = ref('soft_delete')
const retentionBusy = ref(false)
const retentionError = ref('')
const retentionSuccess = ref('')

const deleteConfirm = ref(false)
const deleteReason = ref('')
const deleteBusy = ref(false)
const deleteError = ref('')
const deleteSuccess = ref('')

const qrSrc = computed(() => {
  if (!mfaSetup.value?.otpauth_url) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?size=176x176&data=${encodeURIComponent(mfaSetup.value.otpauth_url)}`
})

async function loadSession() {
  sessionLoading.value = true
  sessionError.value = ''
  try {
    session.value = await fetchSessionInfo()
  } catch (e: any) {
    sessionError.value = e?.message || 'Failed to load session'
  } finally {
    sessionLoading.value = false
  }
}

async function loadMfaStatus() {
  try {
    mfaStatus.value = await fetchMfaStatus()
  } catch (e: any) {
    mfaError.value = e?.message || 'Failed to load MFA status'
  }
}

async function startMfaSetup() {
  mfaBusy.value = true
  mfaError.value = ''
  mfaSuccess.value = ''
  try {
    mfaSetup.value = await setupMfa()
  } catch (e: any) {
    mfaError.value = e?.message || 'MFA setup failed'
  } finally {
    mfaBusy.value = false
  }
}

async function confirmEnableMfa() {
  mfaBusy.value = true
  mfaError.value = ''
  mfaSuccess.value = ''
  try {
    await enableMfa(mfaCode.value.trim())
    mfaSuccess.value = 'MFA enabled.'
    mfaSetup.value = null
    mfaCode.value = ''
    await loadMfaStatus()
    await loadSession()
  } catch (e: any) {
    mfaError.value = e?.message || 'Failed to enable MFA'
  } finally {
    mfaBusy.value = false
  }
}

async function confirmDisableMfa() {
  mfaBusy.value = true
  mfaError.value = ''
  mfaSuccess.value = ''
  try {
    await disableMfa(mfaDisableCode.value.trim())
    mfaSuccess.value = 'MFA disabled.'
    mfaDisableCode.value = ''
    await loadMfaStatus()
    await loadSession()
  } catch (e: any) {
    mfaError.value = e?.message || 'Failed to disable MFA'
  } finally {
    mfaBusy.value = false
  }
}

async function loadAccessReview() {
  reviewLoading.value = true
  reviewError.value = ''
  try {
    accessReview.value = await fetchAccessReview()
  } catch (e: any) {
    reviewError.value = e?.message || 'Failed to load access review'
  } finally {
    reviewLoading.value = false
  }
}

async function loadRetention() {
  retentionError.value = ''
  try {
    retention.value = await fetchRetention()
    retentionDays.value = retention.value.data_retention_days
    deletionPolicy.value = retention.value.deletion_policy || 'soft_delete'
  } catch (e: any) {
    retentionError.value = e?.message || 'Failed to load retention'
  }
}

async function saveRetention() {
  if (!retention.value) return
  retentionBusy.value = true
  retentionError.value = ''
  retentionSuccess.value = ''
  try {
    const updated = await updateRetention({
      company_id: retention.value.company_id,
      data_retention_days: Number(retentionDays.value),
      deletion_policy: deletionPolicy.value,
    })
    retention.value = {
      ...retention.value,
      data_retention_days: updated.data_retention_days,
      deletion_policy: updated.deletion_policy,
    }
    retentionSuccess.value = 'Retention saved.'
  } catch (e: any) {
    retentionError.value = e?.message || 'Failed to save retention'
  } finally {
    retentionBusy.value = false
  }
}

async function submitDeletion() {
  deleteBusy.value = true
  deleteError.value = ''
  deleteSuccess.value = ''
  try {
    const res = await requestAccountDeletion(true, deleteReason.value.trim() || undefined)
    deleteSuccess.value = res.message || 'Account deletion requested.'
    await authStore.logout()
  } catch (e: any) {
    deleteError.value = e?.message || 'Deletion request failed'
  } finally {
    deleteBusy.value = false
  }
}

onMounted(() => {
  void loadSession()
  void loadMfaStatus()
  void loadAccessReview()
  void loadRetention()
})
</script>
