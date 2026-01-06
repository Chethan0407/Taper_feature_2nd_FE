<template>
  <div 
    class="card bg-dark-900/30 backdrop-blur-sm border border-dark-600/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:border-neon-blue/30 transition-all duration-300 cursor-pointer group relative"
    @click="handleCardClick"
  >
    <!-- Header with Icon and Status -->
    <div class="flex items-start justify-between mb-4">
      <div class="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
      </div>
      <span :class="getStatusClass(project.status)" class="px-3 py-1 rounded-full text-xs font-medium">
        {{ project.status }}
      </span>
    </div>
    
    <!-- Project Name -->
    <h3 class="text-xl font-bold text-white mb-2 group-hover:text-neon-blue transition-colors duration-300">
      {{ project.name }}
    </h3>
    
    <!-- Description -->
    <p v-if="project.description" class="text-gray-400 text-sm mb-4 line-clamp-2">
      {{ project.description }}
    </p>
    
    <!-- Platform + EDA Tool -->
    <div class="flex items-center space-x-2 mb-4">
      <span v-if="project.platform" class="text-neon-blue font-medium">{{ project.platform }}</span>
      <span v-if="project.platform && project.edaTool" class="text-gray-500">•</span>
      <span v-if="project.edaTool" class="text-gray-300">{{ project.edaTool }}</span>
    </div>
    
    <!-- Type Badge -->
    <div class="mb-4">
      <span :class="getTypeClass(project.type)" class="px-3 py-1 rounded-lg text-xs font-medium">
        {{ project.type === 'LintOnly' ? '✅ Lint Only' : '🚀 TapeOut' }}
      </span>
    </div>
    
    <!-- Created Date -->
    <div class="flex items-center justify-between text-sm text-gray-500">
      <span>Created {{ formatDate(project.createdAt) }}</span>
      <div class="flex items-center space-x-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
        </svg>
        <span>{{ getDaysAgo(project.createdAt) }}</span>
      </div>
    </div>
    
    <!-- Hover Actions -->
    <div 
      class="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end justify-end p-4 pointer-events-none"
    >
      <div class="flex space-x-2 pointer-events-auto">
        <button 
          @click.stop="$emit('edit', project)"
          class="btn-secondary px-3 py-2 text-sm rounded-lg"
          title="Edit Project"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>
        <button 
          @click.stop="$emit('delete', project)"
          class="btn-secondary px-3 py-2 text-sm rounded-lg text-red-400 hover:text-red-300"
          title="Delete Project"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Project } from '@/stores/projects'

interface Props {
  project: Project
}

const props = defineProps<Props>()

console.log('ProjectCard.vue project:', props.project);

const emit = defineEmits<{
  click: [project: Project]
  edit: [project: Project]
  delete: [project: Project]
}>()

const handleCardClick = (event: MouseEvent) => {
  // Only emit if the click wasn't on a button
  const target = event.target as HTMLElement
  if (target.closest('button')) {
    console.log('🛑 Click was on a button, ignoring')
    return // Let the button handle its own click
  }
  console.log('🖱️ Card clicked, emitting project:', props.project)
  console.log('🖱️ Project ID:', props.project?.id)
  if (props.project && props.project.id) {
    emit('click', props.project)
  } else {
    console.error('❌ Cannot emit click - project or project.id is missing:', props.project)
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400 border border-green-500/30'
    case 'planning':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    case 'completed':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    case 'archived':
      return 'bg-red-500/20 text-red-400 border border-red-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}

const getTypeClass = (type: string) => {
  switch (type) {
    case 'LintOnly':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    case 'TapeOut':
      return 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

const getDaysAgo = (dateString: string | undefined) => {
  if (!dateString) return '—';
  const now = new Date();
  const created = new Date(dateString);
  if (isNaN(created.getTime())) return '—';
  
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffSeconds = Math.floor(diffTime / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // Handle very recent items (less than 1 minute)
  if (diffSeconds < 60) return 'Just now';
  
  // Handle items created in the last hour
  if (diffMinutes < 60) {
    if (diffMinutes === 1) return '1 minute ago';
    return `${diffMinutes} minutes ago`;
  }
  
  // Handle items created today (less than 24 hours)
  if (diffHours < 24) {
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  }
  
  // Handle days
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  // Handle weeks
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return '1 week ago';
  if (diffDays < 30) return `${diffWeeks} weeks ago`;
  
  // Handle months
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 month ago';
  if (diffDays < 365) return `${diffMonths} months ago`;
  
  // Handle years
  const diffYears = Math.floor(diffDays / 365);
  if (diffYears === 1) return '1 year ago';
  return `${diffYears} years ago`;
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 