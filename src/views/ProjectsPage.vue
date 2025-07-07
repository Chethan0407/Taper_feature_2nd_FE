<template>
  <div class="min-h-screen bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <!-- Page Header -->
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-white mb-2 tracking-wide">PROJECTS</h1>
            <p class="text-gray-400 text-lg">Manage your tapeout projects and configurations</p>
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
              @click="handleProjectClick"
              @edit="handleProjectEdit"
              @delete="handleProjectDelete"
            />
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <span>Project created successfully!</span>
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
  showSuccessToast.value = true;
  await projectsStore.loadProjects();
  setTimeout(() => {
    showSuccessToast.value = false;
  }, 3000);
};

const handleProjectClick = (project: Project) => {
  router.push(`/projects/${project.id}`)
}

const handleProjectEdit = (project: Project) => {
  editingProject.value = project;
  showEditModal.value = true;
}

const handleProjectDelete = async (project: Project) => {
  if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
    try {
      await projectsStore.deleteProject(project.id)
      // Show success toast
      showSuccessToast.value = true
      setTimeout(() => {
        showSuccessToast.value = false
      }, 3000)
    } catch (error) {
      console.error('Failed to delete project:', error)
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
  showSuccessToast.value = true;
  setTimeout(() => { showSuccessToast.value = false; }, 3000);
}
</script> 