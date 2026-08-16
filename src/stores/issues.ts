import { defineStore } from 'pinia'
import api from '@/api/client'
import type { IssueDto, IssueCreateRequest } from '@/types'

export const useIssueStore = defineStore('issues', {
  state: () => ({
    issues: [] as IssueDto[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async search(params: Record<string, any>) {
      this.loading = true
      this.error = null
      try {
        const res = await api.get<{ items: IssueDto[] }>('/issues', { params })
        this.issues = res.data.items
        return res.data
      } catch (e: any) {
        this.error = e.response?.data?.message || 'Search failed'
        throw e
      } finally {
        this.loading = false
      }
    },
    async createIssue(data: IssueCreateRequest) {
      const res = await api.post<IssueDto>('/issues', data)
      this.issues.unshift(res.data)
      return res.data
    },
    async updateIssue(id: string, data: Partial<IssueCreateRequest>) {
      const res = await api.put<IssueDto>(`/issues/${id}`, data)
      const idx = this.issues.findIndex((i) => i.id === id)
      if (idx !== -1) this.issues[idx] = res.data
      return res.data
    },
    async deleteIssue(id: string) {
      await api.delete(`/issues/${id}`)
      this.issues = this.issues.filter((i) => i.id !== id)
    },
    async transition(id: string, toStatus: string) {
      const res = await api.post<IssueDto>(`/issues/${id}/transitions`, { to_status: toStatus })
      const idx = this.issues.findIndex((i) => i.id === id)
      if (idx !== -1) this.issues[idx] = res.data
      return res.data
    },
    async getTransitions(id: string) {
      const res = await api.get<{ from_status: string; to_status: string }[]>(`/issues/${id}/transitions`)
      return res.data
    },
    async addComment(issueId: string, content: string) {
      const res = await api.post(`/issues/${issueId}/comments`, { content })
      return res.data
    },
    async fetchIssue(id: string) {
      const res = await api.get<IssueDto>(`/issues/${id}`)
      return res.data
    },
  },
})
