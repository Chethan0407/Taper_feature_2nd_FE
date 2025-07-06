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
  company_id: number
  created_at: string
  updated_at: string
  createdAt?: string
  updatedAt?: string
  spec_ids?: number[]
  checklist_ids?: number[]
}

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  const API_BASE = 'http://localhost:8000/api/v1/projects/'

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
      
      const data = await response.json();
      projects.value = Array.isArray(data)
        ? data.map((p: any) => ({
            ...p,
            createdAt: p.created_at,
            updatedAt: p.updated_at
          }))
        : [];
      console.log('Loaded projects:', projects.value);
    } catch (err: any) {
      error.value = err.message || 'Failed to load projects'
      console.error('Error loading projects:', err)
    } finally {
      loading.value = false
    }
  }

  // Create new project
  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { company_id: number }) => {
    loading.value = true
    error.value = null
    try {
      // Map createdAt to created_at if present (type assertion for optional camelCase)
      const pd = projectData as any;
      const payload = {
        ...projectData,
        ...(pd.createdAt ? { created_at: pd.createdAt } : {})
      };
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to create project')
      }
      
      const newProject = await response.json()
      return {
        ...newProject,
        createdAt: newProject.created_at,
        updatedAt: newProject.updated_at
      }
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
      const response = await fetch(`${API_BASE}${id}/`, {
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
      
      if (!response.ok) {
        throw new Error('Failed to load project')
      }
      
      const p = await response.json()
      return {
        ...p,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }
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
      // Map createdAt to created_at if present (type assertion for optional camelCase)
      const pd = projectData as any;
      const payload = {
        ...projectData,
        ...(pd.createdAt ? { created_at: pd.createdAt } : {})
      };
      const response = await fetch(`${API_BASE}${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to update project')
      }
      
      const updatedProject = await response.json()
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = {
          ...updatedProject,
          createdAt: updatedProject.created_at,
          updatedAt: updatedProject.updated_at
        }
      }
      return {
        ...updatedProject,
        createdAt: updatedProject.created_at,
        updatedAt: updatedProject.updated_at
      }
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
      const response = await fetch(`${API_BASE}${id}/`, {
        method: 'DELETE',
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
      
      // Remove from local list regardless of backend response
      projects.value = projects.value.filter(p => p.id !== id)
      
      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to delete project')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete project'
      // Still remove from local list on error
      projects.value = projects.value.filter(p => p.id !== id)
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