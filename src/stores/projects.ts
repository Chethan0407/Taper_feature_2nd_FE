import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

export interface Project {
  id: string
  name: string
  description?: string
  platform: 'ASIC' | 'FPGA' | 'SoC'
  edaTool: 'Synopsys' | 'Cadence' | 'Mentor'
  type: 'TapeOut' | 'LintOnly'
  status: 'active' | 'planning' | 'completed' | 'archived'
  createdAt: string
  updatedAt: string
}

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  const API_BASE = 'http://localhost:8000/api/v1/projects'

  // Load all projects
  const loadProjects = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(API_BASE, {
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
      
      if (!response.ok) {
        throw new Error('Failed to load projects')
      }
      
      projects.value = await response.json()
    } catch (err: any) {
      error.value = err.message || 'Failed to load projects'
      console.error('Error loading projects:', err)
    } finally {
      loading.value = false
    }
  }

  // Create new project
  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
        },
        body: JSON.stringify(projectData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to create project')
      }
      
      const newProject = await response.json()
      projects.value.push(newProject)
      return newProject
    } catch (err: any) {
      error.value = err.message || 'Failed to create project'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get single project
  const getProject = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
      
      if (!response.ok) {
        throw new Error('Failed to load project')
      }
      
      return await response.json()
    } catch (err: any) {
      error.value = err.message || 'Failed to load project'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update project
  const updateProject = async (id: string, projectData: Partial<Project>) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
        },
        body: JSON.stringify(projectData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to update project')
      }
      
      const updatedProject = await response.json()
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      return updatedProject
    } catch (err: any) {
      error.value = err.message || 'Failed to update project'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete project
  const deleteProject = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete project')
      }
      
      projects.value = projects.value.filter(p => p.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Failed to delete project'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    projects,
    loading,
    error,
    loadProjects,
    createProject,
    getProject,
    updateProject,
    deleteProject
  }
}) 