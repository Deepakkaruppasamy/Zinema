import { api } from './api.js'
import { shouldRetry, getRetryDelay, getErrorMessage } from './errorHandler.js'

/**
 * Retry wrapper for API calls with exponential backoff
 */
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
    
    // If we shouldn't retry or have exhausted retries, throw the error
    throw error
  }
}

/**
 * Enhanced API methods with retry logic
 */
export const retryApi = {
  get: (url, config = {}) => retryApiCall(() => api.get(url, config)),
  post: (url, data, config = {}) => retryApiCall(() => api.post(url, data, config)),
  put: (url, data, config = {}) => retryApiCall(() => api.put(url, data, config)),
  delete: (url, config = {}) => retryApiCall(() => api.delete(url, config)),
  patch: (url, data, config = {}) => retryApiCall(() => api.patch(url, data, config))
}

/**
 * Safe API call that handles errors gracefully
 */
export async function safeApiCall(apiCall, fallbackValue = null) {
  try {
    return await retryApiCall(apiCall)
  } catch (error) {
    console.error('API call failed:', error)
    
    // Return fallback value instead of throwing
    if (fallbackValue !== null) {
      return { data: fallbackValue, error: getErrorMessage(error) }
    }
    
    throw error
  }
}
