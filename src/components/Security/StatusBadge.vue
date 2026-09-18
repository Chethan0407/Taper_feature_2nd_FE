<template>
  <span
    class="inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
    :class="tone"
    data-testid="security-status-badge"
  >
    {{ STATUS_LABEL[status] }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { STATUS_LABEL, type SecurityStatus } from '@/types/security'

const props = defineProps<{ status: SecurityStatus }>()

const tone = computed(() => {
  switch (props.status) {
    case 'live':
      return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
    case 'ops':
      return 'border-sky-500/40 bg-sky-500/15 text-sky-300'
    case 'partial':
      return 'border-amber-500/40 bg-amber-500/15 text-amber-300'
    case 'roadmap':
    default:
      return 'border-violet-500/40 bg-violet-500/15 text-violet-300'
  }
})
</script>
