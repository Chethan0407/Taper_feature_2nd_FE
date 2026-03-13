import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authenticatedFetch } from '@/utils/auth-requests'
import { getLinkedContent, type LinkedContentResponse } from '@/utils/spec-linking-api'

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

  const API_BASE = '/api/v1/projects'

  // Load all projects
  const loadProjects = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await authenticatedFetch(API_BASE)
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated')
        }
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to load projects')
      }
      
      const data = await response.json()
      projects.value = Array.isArray(data)
        ? data.map((p: any) => ({
            ...p,
            // Normalize core fields so edit modal always sees them
            platform: p.platform || p.platform_name || p.platform_type || '',
            edaTool: p.edaTool || p.eda_tool || p.eda_tool_name || '',
            type: p.type || p.project_type || '',
            createdAt: p.created_at,
            updatedAt: p.updated_at
          }))
        : []
    } catch (err: any) {
      error.value = err.message || 'Failed to load projects'
      console.error('🔍 DEBUG - Error loading projects:', err)
    } finally {
      loading.value = false
    }
  }

  // Create new project
  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { company_id: number }) => {
    loading.value = true
    error.value = null
    try {
      const pd = projectData as any;
      const payload = {
        ...projectData,
        ...(pd.createdAt ? { created_at: pd.createdAt } : {})
      };
      
      const response = await authenticatedFetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated')
        }
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to create project')
      }
      
      const newProject = await response.json()
      return {
        ...newProject,
        platform: newProject.platform || newProject.platform_name || newProject.platform_type || '',
        edaTool: newProject.edaTool || newProject.eda_tool || newProject.eda_tool_name || '',
        type: newProject.type || newProject.project_type || '',
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
      const response = await authenticatedFetch(`${API_BASE}/${id}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated')
        }
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to load project')
      }
      
      const p = await response.json()
      return {
        ...p,
        platform: p.platform || p.platform_name || p.platform_type || '',
        edaTool: p.edaTool || p.eda_tool || p.eda_tool_name || '',
        type: p.type || p.project_type || '',
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
      const pd = projectData as any;
      const payload = {
        ...projectData,
        ...(pd.createdAt ? { created_at: pd.createdAt } : {})
      };
      
      const response = await authenticatedFetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated')
        }
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to update project')
      }
      
      const updatedProject = await response.json()
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = {
          ...updatedProject,
          platform: updatedProject.platform || updatedProject.platform_name || updatedProject.platform_type || projects.value[index].platform,
          edaTool: updatedProject.edaTool || updatedProject.eda_tool || updatedProject.eda_tool_name || projects.value[index].edaTool,
          type: updatedProject.type || updatedProject.project_type || projects.value[index].type,
          createdAt: updatedProject.created_at,
          updatedAt: updatedProject.updated_at
        }
      }
      return {
        ...updatedProject,
        platform: updatedProject.platform || updatedProject.platform_name || updatedProject.platform_type || '',
        edaTool: updatedProject.edaTool || updatedProject.eda_tool || updatedProject.eda_tool_name || '',
        type: updatedProject.type || updatedProject.project_type || '',
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
      const response = await authenticatedFetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated')
        }
        if (response.status === 404) {
          // Project already deleted or doesn't exist - remove from local list anyway
          projects.value = projects.value.filter(p => p.id !== id)
          return
        }
        const errorText = await response.text()
        let errorMsg = 'Failed to delete project'
        try {
          const errorData = JSON.parse(errorText)
          errorMsg = errorData.detail || errorData.message || errorMsg
        } catch {
          errorMsg = errorText || errorMsg
        }
        throw new Error(errorMsg)
      }
      
      // Remove from local list only if deletion was successful
      projects.value = projects.value.filter(p => p.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Failed to delete project'
      console.error('❌ Error deleting project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get linked content for a project
  const getProjectLinkedContent = async (projectId: string): Promise<LinkedContentResponse> => {
    loading.value = true
    error.value = null
    try {
      const linkedContent = await getLinkedContent(projectId)
      return linkedContent
    } catch (err: any) {
      error.value = err.message || 'Failed to load linked content'
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
    deleteProject,
    getProjectLinkedContent
  }
}) 