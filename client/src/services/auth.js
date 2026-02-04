import api from './api'

export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken })
    return response.data
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token')
  },

  getToken: () => {
    return localStorage.getItem('access_token')
  },
}
