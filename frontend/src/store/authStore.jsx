import { create } from 'zustand'
import api from '../utils/api'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,

  init: async () => {
    const token = localStorage.getItem('token')
    if (!token) { set({ isLoading: false }); return }
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data, token, isLoading: false })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null, isLoading: false })
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    set({ user: data.user, token: data.token })
    return data
  },

  register: async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('token', data.token)
    set({ user: data.user, token: data.token })
    return data
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  }
}))

export default useAuthStore
