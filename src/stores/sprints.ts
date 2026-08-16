import { defineStore } from 'pinia'
import api from '@/api/client'
import type { SprintDto, SprintCreateRequest } from '@/types'

export const useSprintStore = defineStore('sprints', {
  state: () => ({
    sprints: [] as SprintDto[],
    loading: false,
    error: null as string | null,
  }),
  getters: {
    activeSprint: (state) => state.sprints.find((s) => s.is_active),
    upcomingSprints: (state) =>
      state.sprints.filter((s) => !s.is_active && (!s.end_date || new Date(s.end_date) >= new Date())),
  },
  actions: {
    async loadSprints(projectId: string, includeClosed = true) {
      this.loading = true
      this.error = null
      try {
        const res = await api.get<SprintDto[]>(`/projects/${projectId}/sprints`, {
          params: { include_closed: includeClosed },
        })
        this.sprints = res.data
        return this.sprints
      } catch (e: any) {
        this.error = e.response?.data?.message || 'Failed to load sprints'
        throw e
      } finally {
        this.loading = false
      }
    },

    async createSprint(projectId: string, data: SprintCreateRequest) {
      const res = await api.post<SprintDto>(`/projects/${projectId}/sprints`, data)
      this.sprints.unshift(res.data)
      return res.data
    },

    async updateSprint(sprintId: string, data: SprintCreateRequest) {
      const res = await api.put<SprintDto>(`/sprints/${sprintId}`, data)
      const idx = this.sprints.findIndex((s) => s.id === sprintId)
      if (idx !== -1) {
        this.sprints[idx] = res.data
      }
      return res.data
    },

    async deleteSprint(sprintId: string) {
      await api.delete(`/sprints/${sprintId}`)
      this.sprints = this.sprints.filter((s) => s.id !== sprintId)
    },

    async activateSprint(sprintId: string) {
      const res = await api.post<SprintDto>(`/sprints/${sprintId}/activate`)
      this.sprints = this.sprints.map((s) => {
        if (s.id === sprintId) return res.data
        return { ...s, is_active: false }
      })
      return res.data
    },

    async completeSprint(sprintId: string) {
      const res = await api.post<{ moved_issue_count: number }>(`/sprints/${sprintId}/complete`)
      const idx = this.sprints.findIndex((s) => s.id === sprintId)
      if (idx !== -1) {
        this.sprints[idx] = { ...this.sprints[idx], is_active: false }
      }
      return res.data
    },
  },
})
