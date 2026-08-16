import { defineStore } from 'pinia'
import api, { getStoredToken, setStoredToken, removeStoredToken } from '@/api/client'
import type { UserDto, AuthResponse } from '@/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserDto | null,
    token: null as string | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    initializeAuth() {
      // Initialize auth state for the currently active backend from localStorage
      const storedToken = getStoredToken()
      if (storedToken) {
        this.token = storedToken
      } else {
        this.token = null
        this.user = null
      }
    },
    async login(email: string, password: string) {
      console.log('AuthStore: logging in with', email)
      const res = await api.post<AuthResponse>('/auth/login', { email, password })
      console.log('AuthStore: API response data:', res.data)
      
      const token = res.data.accessToken || res.data.access_token || null
      const user = res.data.user
      
      this.token = token
      this.user = user
      
      if (this.token) {
        setStoredToken(this.token)
      } else {
        console.error('AuthStore: Token is missing from response! Response keys:', Object.keys(res.data))
      }
      return res.data
    },
    async register(data: { email: string; password: string; full_name: string }) {
      const res = await api.post<UserDto>('/auth/register', data)
      return res.data
    },
    async forgotPassword(email: string) {
      const res = await api.post<{ message: string; newPassword: string; new_password: string }>('/auth/forgot-password', { email })
      return {
        message: res.data.message,
        new_password: res.data.newPassword || res.data.new_password
      }
    },
    async fetchMe() {
      if (!this.token) return null
      try {
        const res = await api.get<UserDto>('/auth/me')
        this.user = res.data
        return this.user
      } catch (error) {
        // Token might be invalid or expired, clear auth state
        this.logout()
        throw error
      }
    },
    async updateProfile(data: Partial<{
      full_name: string
      avatar_url: string | null
      bio: string | null
      phone_number: string | null
      global_role: string
    }>) {
      if (!this.user?.id) throw new Error('User is not available')

      const res = await api.patch<UserDto>(`/users/${this.user.id}`, data)
      this.user = res.data
      return res.data
    },
    logout() {
      this.token = null
      this.user = null
      removeStoredToken()
    },
  },
})
