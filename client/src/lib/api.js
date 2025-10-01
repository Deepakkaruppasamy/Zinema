import axios from 'axios'
import { API_CONFIG } from '../config/api.js'

const baseURL = import.meta.env.VITE_BASE_URL || API_CONFIG.BASE_URL

export const api = axios.create({ 
  baseURL,
  timeout: 30000, 
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clerk-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {

      localStorage.removeItem('clerk-token')
      window.location.href = '/login'
    }
    

    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.warn('Network error detected:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default api

// Assistant client helpers
export async function assistantChat(messages, user = {}) {
  const url = (import.meta.env.VITE_API_URL || API_CONFIG.API_URL) + '/deepai/assistant'
  const resp = await api.post(url, { messages, user })
  return resp.data
}

export function buildUserMessage(text) {
  return { role: 'user', text }
}
