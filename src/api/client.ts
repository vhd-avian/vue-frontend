import axios from 'axios'

export const getApiErrorMessage = (error: any, fallback = 'Something went wrong') => {
  const status = error?.response?.status
  const data = error?.response?.data

  if (status === 403 || status === 404) {
    return 'Not found'
  }

  if (status === 401) {
    return 'Your session has expired. Please log in again.'
  }

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message
  }

  if (typeof data?.title === 'string' && data.title.trim()) {
    return data.title
  }

  return fallback
}

export interface BackendTarget {
  name: string
  url: string
  key: string
  icon?: string
}

export const PRESET_BACKENDS: BackendTarget[] = [
  { name: 'AdonisJS Reference', url: 'http://localhost:3333/api/v1', key: 'adonisjs', icon: '⚡' },
  { name: 'Python (FastAPI)', url: 'http://localhost:8000/api/v1', key: 'fastapi', icon: '⚡' },
  { name: 'Python (Flask)', url: 'http://localhost:5000/api/v1', key: 'flask', icon: '🐍' },
  { name: 'C# (.NET Web API)', url: 'http://localhost:5000/api/v1', key: 'dotnet', icon: '🔷' },
  { name: 'Java (Spring Boot)', url: 'http://localhost:8080/api/v1', key: 'spring', icon: '☕' },
  { name: 'Java (Quarkus)', url: 'http://localhost:8080/api/v1', key: 'quarkus', icon: '⚡' },

]

export const getActiveBackendKey = (): string => {
  const customKey = localStorage.getItem('api_backend_key')
  if (customKey && customKey.trim()) {
    return customKey.trim().toLowerCase()
  }

  // Detect based on URL if not explicitly set
  const currentUrl = getApiBaseUrl()
  if (currentUrl === '/api/v1' || currentUrl === '/api') return 'express'
  if (currentUrl.includes(':8000')) return 'fastapi'
  if (currentUrl.includes(':5000')) return 'dotnet'
  if (currentUrl.includes(':8080')) return 'spring'
  if (currentUrl.includes(':3000')) return 'rails'

  return 'custom'
}

export const getApiBaseUrl = (): string => {
  const custom = localStorage.getItem('api_base_url')
  if (custom && custom.trim()) {
    return custom.trim()
  }
  return (import.meta as any).env.VITE_API_BASE_URL || '/api/v1'
}

export const getBackendTokenKey = (backendKey?: string): string => {
  const key = (backendKey || getActiveBackendKey()).toLowerCase().replace(/[^a-z0-9_]/g, '_')
  return `access_token_${key}`
}

export const getStoredToken = (backendKey?: string): string | null => {
  const key = (backendKey || getActiveBackendKey()).toLowerCase()
  // Primary structured key: access_token_<name>
  const token = localStorage.getItem(getBackendTokenKey(key))
  if (token) return token

  // Backward compatibility check for legacy format
  const currentUrl = getApiBaseUrl()
  const legacyUrlKey = `access_token_${currentUrl.replace(/[^a-zA-Z0-9]/g, '_')}`
  const legacyToken = localStorage.getItem(legacyUrlKey) || localStorage.getItem('access_token')
  if (legacyToken) {
    localStorage.setItem(getBackendTokenKey(key), legacyToken)
    return legacyToken
  }

  return null
}

export const setStoredToken = (token: string, backendKey?: string) => {
  const key = (backendKey || getActiveBackendKey()).toLowerCase()
  localStorage.setItem(getBackendTokenKey(key), token)
}

export const removeStoredToken = (backendKey?: string) => {
  const key = (backendKey || getActiveBackendKey()).toLowerCase()
  localStorage.removeItem(getBackendTokenKey(key))
  localStorage.removeItem('access_token')
}

export const setApiBackend = (url: string, key?: string) => {
  const cleanUrl = url ? url.trim() : '/api/v1'
  if (!cleanUrl || cleanUrl === '/api/v1') {
    localStorage.removeItem('api_base_url')
    localStorage.removeItem('api_backend_key')
  } else {
    localStorage.setItem('api_base_url', cleanUrl)
    if (key && key.trim()) {
      localStorage.setItem('api_backend_key', key.trim().toLowerCase())
    } else {
      const matched = PRESET_BACKENDS.find((p) => p.url === cleanUrl)
      if (matched) {
        localStorage.setItem('api_backend_key', matched.key)
      } else {
        localStorage.setItem('api_backend_key', 'custom')
      }
    }
  }
  api.defaults.baseURL = getApiBaseUrl()
}

export const setApiBaseUrl = (url: string) => {
  setApiBackend(url)
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const currentBase = getApiBaseUrl()
  config.baseURL = currentBase
  const activeKey = getActiveBackendKey()
  const token = getStoredToken(activeKey)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    delete config.headers.Authorization
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      removeStoredToken()
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
