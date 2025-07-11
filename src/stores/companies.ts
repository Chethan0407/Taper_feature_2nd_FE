import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

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

  const API_BASE = 'http://localhost:8000/api/v1/companies'

  // Load all companies
  const loadCompanies = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(API_BASE, {
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
      
      if (!response.ok) {
        throw new Error('Failed to load companies')
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
      const response = await fetch(`${API_BASE}/?${params.toString()}`, {
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
      if (!response.ok) {
        throw new Error('Failed to search companies')
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
      const response = await fetch(`${API_BASE}/${id}`, {
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
      
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
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
        },
        body: JSON.stringify(companyData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to create company')
      }
      
      const newCompanyRaw = await response.json()
      const newCompany = {
        ...newCompanyRaw,
        createdBy: newCompanyRaw.created_by || newCompanyRaw.createdBy
      }
      companies.value.push(newCompany)
      return newCompany
    } catch (err: any) {
      error.value = err.message || 'Failed to create company'
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
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
        },
        body: JSON.stringify(companyData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to update company')
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
      return updatedCompany
    } catch (err: any) {
      error.value = err.message || 'Failed to update company'
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
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete company')
      }
      
      companies.value = companies.value.filter(c => c.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Failed to delete company'
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