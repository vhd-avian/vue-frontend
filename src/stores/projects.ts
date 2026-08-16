import { defineStore } from 'pinia'
import api from '@/api/client'
import type {
  ProjectDto,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectMemberDto,
  ProjectMemberAddRequest,
  UserDto,
} from '@/types'

export const useProjectStore = defineStore('projects', {
  state: () => ({
    projects: [] as ProjectDto[],
    currentProject: null as ProjectDto | null,
    members: [] as ProjectMemberDto[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async loadProjects(includeArchived = false) {
      this.loading = true
      this.error = null
      try {
        const res = await api.get<{ items: ProjectDto[] }>('/projects', {
          params: { include_archived: includeArchived },
        })
        this.projects = res.data.items
        return this.projects
      } catch (e: any) {
        this.error = e.response?.data?.message || 'Failed to load projects'
        throw e
      } finally {
        this.loading = false
      }
    },

    async createProject(data: ProjectCreateRequest) {
      const res = await api.post<ProjectDto>('/projects', data)
      this.projects.unshift(res.data)
      return res.data
    },

    async fetchProject(id: string) {
      const res = await api.get<ProjectDto>(`/projects/${id}`)
      this.currentProject = res.data
      return res.data
    },

    async updateProject(id: string, data: ProjectUpdateRequest) {
      const res = await api.put<ProjectDto>(`/projects/${id}`, data)
      this.currentProject = res.data
      const idx = this.projects.findIndex((p) => p.id === id)
      if (idx !== -1) {
        this.projects[idx] = res.data
      }
      return res.data
    },

    async deleteProject(id: string) {
      await api.delete(`/projects/${id}`)
      this.projects = this.projects.filter((p) => p.id !== id)
      if (this.currentProject?.id === id) {
        this.currentProject = null
      }
    },

    async fetchMembers(projectId: string) {
      const res = await api.get<ProjectMemberDto[]>(`/projects/${projectId}/members`)
      this.members = res.data
      return res.data
    },

    async addMember(projectId: string, data: ProjectMemberAddRequest) {
      await api.post(`/projects/${projectId}/members`, data)
      await this.fetchMembers(projectId)
    },

    async removeMember(projectId: string, userId: string) {
      await api.delete(`/projects/${projectId}/members`, {
        data: { userId },
      })
      this.members = this.members.filter((m) => {
        const id = m.user_id || m.userId
        return id !== userId
      })
    },

    async updateMemberRole(projectId: string, userId: string, role: string) {
      await api.put(`/projects/${projectId}/members/${userId}`, { role })
      await this.fetchMembers(projectId)
    },

    async searchUsers(query: string = '') {
      const res = await api.get<UserDto[]>('/users', {
        params: { q: query },
      })
      return res.data
    },
  },
})
