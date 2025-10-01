// Error handling utilities for better user experience

export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

export function categorizeError(error) {
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return ErrorTypes.NETWORK_ERROR
  }
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ErrorTypes.TIMEOUT_ERROR
  }
  if (error.response?.status >= 500) {
    return ErrorTypes.SERVER_ERROR
  }
  if (error.response?.status === 401 || error.response?.status === 403) {
    return ErrorTypes.AUTH_ERROR
  }
  return ErrorTypes.UNKNOWN_ERROR
}

export function getErrorMessage(error) {
  const errorType = categorizeError(error)
  
  switch (errorType) {
    case ErrorTypes.NETWORK_ERROR:
      return 'Network connection failed. Please check your internet connection and try again.'
    case ErrorTypes.TIMEOUT_ERROR:
      return 'Request timed out. The server is taking too long to respond. Please try again.'
    case ErrorTypes.SERVER_ERROR:
      return 'Server error occurred. Please try again later.'
    case ErrorTypes.AUTH_ERROR:
      return 'Authentication failed. Please log in again.'
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}

export function shouldRetry(error, retryCount = 0) {
  const maxRetries = 3
  const errorType = categorizeError(error)
  
  // Don't retry auth errors or if we've exceeded max retries
  if (errorType === ErrorTypes.AUTH_ERROR || retryCount >= maxRetries) {
    return false
  }
  
  // Retry network and timeout errors
  return errorType === ErrorTypes.NETWORK_ERROR || errorType === ErrorTypes.TIMEOUT_ERROR
}

export function getRetryDelay(retryCount) {
  // Exponential backoff: 1s, 2s, 4s
  return Math.min(1000 * Math.pow(2, retryCount), 4000)
}
