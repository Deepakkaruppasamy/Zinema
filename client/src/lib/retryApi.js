import { api } from './api.js'
import { shouldRetry, getRetryDelay, getErrorMessage } from './errorHandler.js'

export async function retryApiCall(apiCall, retryCount = 0) {
  try {
    return await apiCall()
  } catch (error) {
    if (shouldRetry(error, retryCount)) {
      const delay = getRetryDelay(retryCount)
      console.log(`Retrying API call in ${delay}ms (attempt ${retryCount + 1})`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return retryApiCall(apiCall, retryCount + 1)
    }
    
    throw error
  }
}

export const retryApi = {
  get: (url, config = {}) => retryApiCall(() => api.get(url, config)),
  post: (url, data, config = {}) => retryApiCall(() => api.post(url, data, config)),
  put: (url, data, config = {}) => retryApiCall(() => api.put(url, data, config)),
  delete: (url, config = {}) => retryApiCall(() => api.delete(url, config)),
  patch: (url, data, config = {}) => retryApiCall(() => api.patch(url, data, config))
}

export async function safeApiCall(apiCall, fallbackValue = null) {
  try {
    return await retryApiCall(apiCall)
  } catch (error) {
    console.error('API call failed:', error)
    
    if (fallbackValue !== null) {
      return { data: fallbackValue, error: getErrorMessage(error) }
    }
    
    throw error
  }
}
