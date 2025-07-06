import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

export interface Company {
  id: number
  name: string
  description?: string
  status: 'active' | 'inactive'
  createdBy?: string
  createdAt: string
  updatedAt: string
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
      
      companies.value = await response.json()
    } catch (err: any) {
      error.value = err.message || 'Failed to load companies'
      console.error('Error loading companies:', err)
    } finally {
      loading.value = false
    }
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
      
      const newCompany = await response.json()
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
      
      const updatedCompany = await response.json()
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
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany
  }
}) 