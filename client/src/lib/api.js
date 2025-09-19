import axios from 'axios'

// Centralized axios instance. If VITE_BASE_URL is set, use it; otherwise fall back to same-origin.
const baseURL = import.meta.env.VITE_BASE_URL || ''

export const api = axios.create({ baseURL })

export default api
