import { create } from 'zustand'
import { authService } from '../services/auth'

const useAuthStore = create((set, get) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const data = await authService.login(email, password)
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      
      const userResponse = await fetch('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      })
      const userData = await userResponse.json()
      
      set({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
      })
      authService.setUser(userData)
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      }
    }
  },

  register: async (userData) => {
    set({ isLoading: true })
    try {
      await authService.register(userData)
      set({ isLoading: false })
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      }
    }
  },

  logout: () => {
    authService.logout()
    set({ user: null, isAuthenticated: false })
  },

  setUser: (user) => {
    set({ user, isAuthenticated: true })
    authService.setUser(user)
  },
}))

export default useAuthStore
