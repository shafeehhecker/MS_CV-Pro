import { create } from 'zustand'
import api from '../utils/api'

const useCVStore = create((set, get) => ({
  cvs: [],
  currentCV: null,
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  atsResult: null,

  fetchCVs: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/cv')
      set({ cvs: data, isLoading: false })
    } catch { set({ isLoading: false }) }
  },

  fetchCV: async (id) => {
    set({ isLoading: true })
    try {
      const { data } = await api.get(`/cv/${id}`)
      set({ currentCV: data, isLoading: false, atsResult: data.atsScores?.[0] || null })
    } catch { set({ isLoading: false }) }
  },

  createCV: async (opts = {}) => {
    const { data } = await api.post('/cv', opts)
    set(s => ({ cvs: [data, ...s.cvs] }))
    return data
  },

  duplicateCV: async (id) => {
    const { data } = await api.post(`/cv/${id}/duplicate`)
    set(s => ({ cvs: [data, ...s.cvs] }))
    return data
  },

  deleteCV: async (id) => {
    await api.delete(`/cv/${id}`)
    set(s => ({ cvs: s.cvs.filter(c => c.id !== id) }))
  },

  updateMeta: async (id, fields) => {
    const { data } = await api.patch(`/cv/${id}`, fields)
    set(s => ({
      cvs: s.cvs.map(c => c.id === id ? { ...c, ...data } : c),
      currentCV: s.currentCV?.id === id ? { ...s.currentCV, ...data } : s.currentCV
    }))
    return data
  },

  savePersonal: async (cvId, info) => {
    set({ isSaving: true })
    try {
      const { data } = await api.put(`/cv/${cvId}/personal`, info)
      set(s => ({
        currentCV: s.currentCV ? { ...s.currentCV, personalInfo: data } : null,
        isSaving: false,
        lastSaved: new Date()
      }))
    } catch { set({ isSaving: false }) }
  },

  // Generic section save
  addItem: async (cvId, section, item) => {
    const { data } = await api.post(`/cv/${cvId}/${section}`, item)
    set(s => ({
      currentCV: s.currentCV ? {
        ...s.currentCV,
        [sectionKey(section)]: [...(s.currentCV[sectionKey(section)] || []), data]
      } : null
    }))
    return data
  },

  updateItem: async (cvId, section, itemId, item) => {
    set({ isSaving: true })
    const { data } = await api.put(`/cv/${cvId}/${section}/${itemId}`, item)
    set(s => ({
      currentCV: s.currentCV ? {
        ...s.currentCV,
        [sectionKey(section)]: s.currentCV[sectionKey(section)].map(i => i.id === itemId ? data : i)
      } : null,
      isSaving: false,
      lastSaved: new Date()
    }))
  },

  deleteItem: async (cvId, section, itemId) => {
    await api.delete(`/cv/${cvId}/${section}/${itemId}`)
    set(s => ({
      currentCV: s.currentCV ? {
        ...s.currentCV,
        [sectionKey(section)]: s.currentCV[sectionKey(section)].filter(i => i.id !== itemId)
      } : null
    }))
  },

  runATS: async (cvId, jobTitle, jobDescription) => {
    const { data } = await api.post(`/ats/score/${cvId}`, { jobTitle, jobDescription })
    set({ atsResult: data })
    return data
  },

  setAtsResult: (result) => set({ atsResult: result }),
}))

function sectionKey(section) {
  const map = {
    work: 'workExperiences',
    education: 'educations',
    skills: 'skills',
    projects: 'projects',
    certifications: 'certifications'
  }
  return map[section] || section
}

export default useCVStore
