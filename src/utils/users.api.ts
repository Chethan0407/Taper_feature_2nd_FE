import axios from 'axios'

export async function fetchNotificationSettings() {
  return axios.get('/api/v1/notifications/')
}

export async function updateNotificationSettings(data: Record<string, any>) {
  return axios.put('/api/v1/notifications/', data)
}

export async function patchNotificationSettings(data: Record<string, any>) {
  return axios.patch('/api/v1/notifications/', data)
} 