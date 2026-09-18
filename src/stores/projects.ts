import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authenticatedFetch } from '@/utils/auth-requests'
import { getLinkedContent, type LinkedContentResponse } from '@/utils/spec-linking-api'

export interface Project {
  id: string
  name: string
  description?: string
  platform: string
  edaTool: string
  eda_tool?: string
  eda_tool_version?: string
  type: string
  status: string
  company_id: number
  companyId?: number
  foundry?: string
  process_node?: string
  pdk_version?: string
  target_tapeout_date?: string
  tapeout_status?: string
  created_at: string
  updated_at: string
  createdAt?: string
  updatedAt?: string
  spec_ids?: number[]
  checklist_ids?: number[]
}

function normalizeProject(p: any): Project {
  return {
    ...p,
    platform: p.platform || p.platform_name || p.platform_type || '',
    edaTool: p.edaTool || p.eda_tool || p.eda_tool_name || '',
    eda_tool: p.eda_tool || p.edaTool || p.eda_tool_name || '',
    eda_tool_version: p.eda_tool_version || p.edaToolVersion || '',
    type: p.type || p.project_type || '',
    foundry: p.foundry || '',
    process_node: p.process_node || p.processNode || '',
    pdk_version: p.pdk_version || p.pdkVersion || '',
    target_tapeout_date: p.target_tapeout_date || p.targetTapeoutDate || '',
    tapeout_status: p.tapeout_status || p.tapeoutStatus || '',
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }
}

function toApiPayload(projectData: Partial<Project> & Record<string, any>) {
  const {
    edaTool,
    createdAt,
    updatedAt,
    companyId,
    ...rest
  } = projectData

  const payload: Record<string, unknown> = { ...rest }

  if (edaTool != null && payload.eda_tool == null) {
    payload.eda_tool = edaTool
  }
  // Prefer snake_case for API; drop camel aliases that confuse backends
  delete payload.edaTool
  delete payload.companyId

  if (createdAt) payload.created_at = createdAt

  // Omit empty optional tapeout fields
  for (const key of [
    'foundry',
    'process_node',
    'pdk_version',
    'eda_tool_version',
    'target_tapeout_date',
    'tapeout_status',
    'description',
  ]) {
    if (payload[key] === '' || payload[key] == null) delete payload[key]
  }

  return payload
}

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const API_BASE = '/api/v1/projects'

  const loadProjects = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await authenticatedFetch(API_BASE)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated')
        }
        if (response.status === 502 || response.status === 503 || response.status === 504) {
          throw new Error('The API is temporarily unavailable. Please try again in a moment.')
        }
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to load projects')
      }

      const data = await response.json()
      projects.value = Array.isArray(data) ? data.map(normalizeProject) : []
    } catch (err: any) {
      error.value = err.message || 'Failed to load projects'
      console.error('Error loading projects:', err)
    } finally {
      loading.value = false
    }
  }

  const createProject = async (
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { company_id: number },
  ) => {
    loading.value = true
    error.value = null
    try {
      const payload = toApiPayload(projectData as any)

      const response = await authenticatedFetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated')
        }
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to create project')
      }

      return normalizeProject(await response.json())
    } catch (err: any) {
      error.value = err.message || 'Failed to create project'
      throw err
    } finally {
      loading.value = false
    }
  }

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

      return normalizeProject(await response.json())
    } catch (err: any) {
      error.value = err.message || 'Failed to load project'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    loading.value = true
    error.value = null
    try {
      const payload = toApiPayload(projectData as any)

      const response = await authenticatedFetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated')
        }
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to update project')
      }

      const updatedProject = normalizeProject(await response.json())
      const index = projects.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        projects.value[index] = { ...projects.value[index], ...updatedProject }
      }
      return updatedProject
    } catch (err: any) {
      error.value = err.message || 'Failed to update project'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProject = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await authenticatedFetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated')
        }
        if (response.status === 404) {
          projects.value = projects.value.filter((p) => p.id !== id)
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

      projects.value = projects.value.filter((p) => p.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Failed to delete project'
      console.error('Error deleting project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getProjectLinkedContent = async (projectId: string): Promise<LinkedContentResponse> => {
    loading.value = true
    error.value = null
    try {
      return await getLinkedContent(projectId)
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
    getProjectLinkedContent,
  }
})
