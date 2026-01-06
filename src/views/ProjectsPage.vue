<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <!-- Page Header -->
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-wide">PROJECTS</h1>
            <p class="text-gray-500 dark:text-gray-400 text-lg">Manage your tapeout projects and configurations</p>
          </div>
          <button v-if="!showCreateForm" class="btn-primary px-6 py-3 text-lg font-semibold shadow-xl animate-glow rounded-xl" @click="handleOpenCreate">
            + New Project
          </button>
        </div>
        <div v-if="showCreateForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div class="w-full max-w-2xl mx-auto">
            <CreateProjectInline @project-created="handleProjectCreated" @cancel="handleCloseCreate" />
          </div>
        </div>
        <div v-else>
        <!-- Loading State -->
        <div v-if="projectsStore.loading && projectsStore.projects.length === 0" class="flex justify-center items-center py-12">
          <div class="text-center">
            <svg class="w-12 h-12 text-neon-blue animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <p class="text-gray-400">Loading projects...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="projectsStore.error && projectsStore.projects.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 class="text-xl font-semibold text-red-400 mb-2">Failed to Load Projects</h3>
          <p class="text-gray-400 mb-4">{{ projectsStore.error }}</p>
          <button @click="projectsStore.loadProjects()" class="btn-primary">
            Try Again
          </button>
        </div>

        <!-- Projects Grid -->
        <div v-else-if="filteredProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCard 
            v-for="project in filteredProjects" 
            :key="project.id" 
            :project="project"
            class="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl"
            @click="handleProjectClick"
            @edit="handleProjectEdit"
            @delete="handleProjectDelete"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
            <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
          <h3 class="text-xl font-semibold text-gray-400 mb-2">No Projects Yet</h3>
          <p class="text-gray-500 mb-6">Create your first project to get started with tapeout management</p>
          </div>
        </div>

        <!-- Success Toast -->
        <div v-if="showSuccessToast" class="fixed bottom-4 right-4 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-2xl z-50">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>{{ successMessage }}</span>
          </div>
        </div>

        <!-- Error Toast -->
        <div v-if="showErrorToast" class="fixed bottom-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-2xl z-50">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        </div>

        <ProjectEditModal
          v-if="showEditModal && editingProject"
          :project="editingProject"
          @close="closeEditModal"
          @updated="handleProjectUpdated"
        />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import CreateProjectInline from '@/components/Projects/CreateProjectInline.vue'
import ProjectCard from '@/components/Projects/ProjectCard.vue'
import ProjectEditModal from '@/components/Projects/ProjectEditModal.vue'
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore, type Project } from '@/stores/projects'

const router = useRouter()
const projectsStore = useProjectsStore()
const showSuccessToast = ref(false)
const successMessage = ref('Project created successfully!')
const showErrorToast = ref(false)
const errorMessage = ref('')
const showEditModal = ref(false)
const editingProject = ref<Project | null>(null)
const showCreateForm = ref(false)

onMounted(async () => {
  await projectsStore.loadProjects()
})

const filteredProjects = computed(() =>
  projectsStore.projects
)

const handleOpenCreate = () => {
  showCreateForm.value = true
}
const handleCloseCreate = () => {
  showCreateForm.value = false
}
const handleProjectCreated = async (project: Project) => {
  showCreateForm.value = false
  successMessage.value = 'Project created successfully!'
  showSuccessToast.value = true;
  await projectsStore.loadProjects();
  setTimeout(() => {
    showSuccessToast.value = false;
  }, 3000);
};

const handleProjectClick = (project: Project) => {
  console.log('🔍 handleProjectClick called with project:', project)
  console.log('🔍 Project type:', typeof project)
  console.log('🔍 Project ID:', project?.id)
  console.log('🔍 Project ID type:', typeof project?.id)
  
  if (!project) {
    console.error('❌ No project provided')
    return
  }
  
  if (!project.id) {
    console.error('❌ Project has no ID:', project)
    return
  }
  
  const projectId = String(project.id)
  console.log('🚀 Navigating to project:', projectId)
  console.log('🚀 Navigation path:', `/projects/${projectId}`)
  
  // Use router.push with explicit path
  router.push({ 
    path: `/projects/${projectId}`,
    name: 'ProjectDetails',
    params: { id: projectId }
  }).then(() => {
    console.log('✅ Navigation successful to project:', projectId)
  }).catch((error) => {
    console.error('❌ Navigation failed:', error)
    // Fallback: try direct path navigation
    window.location.href = `/projects/${projectId}`
  })
}

const handleProjectEdit = (project: Project) => {
  editingProject.value = project;
  showEditModal.value = true;
}

const handleProjectDelete = async (project: Project) => {
  if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
    try {
      await projectsStore.deleteProject(project.id)
      // Reload projects list
      await projectsStore.loadProjects()
      // Show success toast with correct message
      successMessage.value = 'Project deleted successfully!'
      showSuccessToast.value = true
      setTimeout(() => {
        showSuccessToast.value = false
      }, 3000)
    } catch (error: any) {
      console.error('Failed to delete project:', error)
      // Show error toast
      errorMessage.value = error.message || 'Failed to delete project'
      showErrorToast.value = true
      setTimeout(() => {
        showErrorToast.value = false
      }, 3000)
    }
  }
}

const closeEditModal = () => {
  showEditModal.value = false;
  editingProject.value = null;
}

const handleProjectUpdated = async () => {
  showEditModal.value = false;
  editingProject.value = null;
  await projectsStore.loadProjects();
  successMessage.value = 'Project updated successfully!'
  showSuccessToast.value = true;
  setTimeout(() => { showSuccessToast.value = false; }, 3000);
}
</script> 