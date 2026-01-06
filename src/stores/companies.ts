import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import { apiClient } from '@/utils/api-client'

export interface Company {
  id: number
  name: string
  description?: string
  status: string
  createdBy?: string
  created_at?: string
  updated_at?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateCompanyData {
  name: string
  description?: string
}

export interface UpdateCompanyData {
  name?: string
  description?: string
  status?: 'active' | 'inactive'
}

export const useCompaniesStore = defineStore('companies', () => {
  const companies = ref<Company[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  const API_BASE = '/companies'

  // Load all companies
  const loadCompanies = async () => {
    loading.value = true
    error.value = null
    try {
      // Remove trailing slash - backend doesn't accept trailing slashes
      const response = await apiClient(`${API_BASE}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorMsg = 'Failed to load companies'
        try {
          const errorData = JSON.parse(errorText)
          errorMsg = errorData.detail || errorData.message || errorMsg
        } catch {
          errorMsg = errorText || errorMsg
        }
        throw new Error(errorMsg)
      }
      
      const rawCompanies = await response.json()
      companies.value = rawCompanies.map((c: any) => ({
        ...c,
        createdBy: c.created_by || c.createdBy
      }))
    } catch (err: any) {
      error.value = err.message || 'Failed to load companies'
      console.error('Error loading companies:', err)
    } finally {
      loading.value = false
    }
  }

  // Search companies (optionally by status)
  const searchCompanies = async (query: string, status?: string) => {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (query) params.append('search', query)
      if (status) params.append('status', status)
      // Remove trailing slash - backend doesn't accept trailing slashes
      const queryString = params.toString()
      const url = queryString ? `${API_BASE}?${queryString}` : `${API_BASE}`
      const response = await apiClient(url)
      if (!response.ok) {
        const errorText = await response.text()
        let errorMsg = 'Failed to search companies'
        try {
          const errorData = JSON.parse(errorText)
          errorMsg = errorData.detail || errorData.message || errorMsg
        } catch {
          errorMsg = errorText || errorMsg
        }
        throw new Error(errorMsg)
      }
      const rawCompanies = await response.json()
      return rawCompanies.map((c: any) => ({
        ...c,
        createdBy: c.created_by || c.createdBy
      }))
    } catch (err: any) {
      error.value = err.message || 'Failed to search companies'
      console.error('Error searching companies:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Filter companies by status (optionally with search)
  const filterCompaniesByStatus = async (status: string, query?: string) => {
    return searchCompanies(query || '', status)
  }

  // Get single company
  const getCompany = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient(`${API_BASE}/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to load company')
      }
      
      return await response.json()
    } catch (err: any) {
      error.value = err.message || 'Failed to load company'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create new company
  const createCompany = async (companyData: CreateCompanyData) => {
    loading.value = true
    error.value = null
    try {
      // Remove trailing slash - backend doesn't accept trailing slashes
      const response = await apiClient(`${API_BASE}`, {
        method: 'POST',
        body: JSON.stringify(companyData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorMsg = 'Failed to create company'
        try {
          const errorData = JSON.parse(errorText)
          errorMsg = errorData.detail || errorData.message || errorMsg
        } catch {
          errorMsg = errorText || errorMsg
        }
        throw new Error(errorMsg)
      }
      
      const newCompanyRaw = await response.json()
      const newCompany = {
        ...newCompanyRaw,
        createdBy: newCompanyRaw.created_by || newCompanyRaw.createdBy
      }
      // Reload companies to ensure we have the latest data
      await loadCompanies()
      return newCompany
    } catch (err: any) {
      error.value = err.message || 'Failed to create company'
      console.error('Error creating company:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update company
  const updateCompany = async (id: number, companyData: UpdateCompanyData) => {
    loading.value = true
    error.value = null
    try {
      // Remove trailing slash - backend doesn't accept trailing slashes for action endpoints
      const response = await apiClient(`${API_BASE}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(companyData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorMsg = 'Failed to update company'
        try {
          const errorData = JSON.parse(errorText)
          errorMsg = errorData.detail || errorData.message || errorMsg
        } catch {
          errorMsg = errorText || errorMsg
        }
        throw new Error(errorMsg)
      }
      
      const updatedCompanyRaw = await response.json()
      const updatedCompany = {
        ...updatedCompanyRaw,
        updatedBy: updatedCompanyRaw.updated_by || updatedCompanyRaw.updatedBy
      }
      const index = companies.value.findIndex(c => c.id === id)
      if (index !== -1) {
        companies.value[index] = updatedCompany
      }
      // Reload companies to ensure we have the latest data
      await loadCompanies()
      return updatedCompany
    } catch (err: any) {
      error.value = err.message || 'Failed to update company'
      console.error('Error updating company:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete company
  const deleteCompany = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      // Remove trailing slash - backend doesn't accept trailing slashes for action endpoints
      const response = await apiClient(`${API_BASE}/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok && response.status !== 404) {
        const errorText = await response.text()
        let errorMsg = 'Failed to delete company'
        try {
          const errorData = JSON.parse(errorText)
          errorMsg = errorData.detail || errorData.message || errorMsg
        } catch {
          errorMsg = errorText || errorMsg
        }
        throw new Error(errorMsg)
      }
      
      // Remove from local list
      companies.value = companies.value.filter(c => c.id !== id)
      // Reload companies to ensure we have the latest data
      await loadCompanies()
    } catch (err: any) {
      error.value = err.message || 'Failed to delete company'
      console.error('Error deleting company:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    companies,
    loading,
    error,
    loadCompanies,
    searchCompanies,
    filterCompaniesByStatus,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany
  }
}) 