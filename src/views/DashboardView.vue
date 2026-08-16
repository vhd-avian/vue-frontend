<template>
  <div class="p-4 sm:p-6 w-full">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Projects</h1>
        <p class="text-gray-500 mt-1">Manage workspaces, sprints, and team collaboration</p>
      </div>
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 border rounded-lg shadow-sm cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            v-model="includeArchived"
            @change="loadProjects"
            class="rounded text-blue-600 focus:ring-blue-500"
          />
          <span>Show Archived</span>
        </label>
        <button
          @click="showCreateModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-semibold shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="projectStore.loading" class="flex flex-col items-center justify-center py-24">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      <span class="mt-4 text-sm font-medium text-gray-500">Loading your projects...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="projectStore.error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center justify-between">
      <span>{{ projectStore.error }}</span>
      <button @click="loadProjects" class="text-sm font-semibold underline hover:text-red-800">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="projectStore.projects.length === 0" class="text-center py-20 bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 shadow-sm">
      <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-1">No projects found</h3>
      <p class="text-gray-500 text-sm max-w-sm mx-auto mb-6">Create a new project to start managing tasks, sprints, and issues with your team.</p>
      <button
        @click="showCreateModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition"
      >
        Create Project
      </button>
    </div>

    <!-- Projects Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="p in projectStore.projects"
        :key="p.id"
        class="bg-white border border-gray-200/80 rounded-2xl p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
        @click="router.push(`/projects/${p.id}`)"
      >
        <div>
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-2">
              <span class="bg-blue-100 text-blue-700 text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                {{ p.key }}
              </span>
              <span v-if="p.is_archived ?? p.isArchived" class="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">
                Archived
              </span>
            </div>
            <div class="text-gray-300 group-hover:text-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <h2 class="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition mb-2">
            {{ p.name }}
          </h2>
          <p class="text-sm text-gray-600 line-clamp-2 mb-6 h-10">
            {{ p.description || 'No description provided.' }}
          </p>
        </div>

        <div class="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="(p.is_archived ?? p.isArchived) ? 'bg-amber-400' : 'bg-emerald-400'"></span>
            <span>{{ (p.is_archived ?? p.isArchived) ? 'Archived' : 'Active' }}</span>
          </div>
          <span>Updated {{ new Date(p.updated_at || p.updatedAt || Date.now()).toLocaleDateString() }}</span>
        </div>
      </div>
    </div>

    <!-- Create Project Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-900">Create New Project</h3>
          <button @click="showCreateModal = false" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleCreateProject" class="p-6 space-y-4">
          <div v-if="createError" class="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {{ createError }}
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Project Name *</label>
            <input
              v-model="newProject.name"
              type="text"
              required
              placeholder="e.g., Mobile App Redesign"
              class="w-full px-3.5 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              @input="autoGenerateKey"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Project Key *</label>
            <input
              v-model="newProject.key"
              type="text"
              required
              maxlength="10"
              placeholder="e.g., MAR"
              class="w-full px-3.5 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm uppercase font-mono"
            />
            <p class="text-xs text-gray-400 mt-1">Short unique identifier for issues (e.g. MAR-101)</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              v-model="newProject.description"
              rows="3"
              placeholder="What is this project about?"
              class="w-full px-3.5 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition flex items-center gap-2"
            >
              <span v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projects'

const router = useRouter()
const projectStore = useProjectStore()

const includeArchived = ref(false)
const showCreateModal = ref(false)
const isSubmitting = ref(false)
const createError = ref('')

const newProject = reactive({
  name: '',
  key: '',
  description: '',
})

const autoGenerateKey = () => {
  if (!newProject.name) return
  const words = newProject.name.trim().split(/\s+/)
  if (words.length === 1) {
    newProject.key = words[0].slice(0, 4).toUpperCase()
  } else {
    newProject.key = words
      .map((w) => w[0])
      .join('')
      .slice(0, 5)
      .toUpperCase()
  }
}

const loadProjects = async () => {
  await projectStore.loadProjects(includeArchived.value)
}

onMounted(async () => {
  await loadProjects()
})

const handleCreateProject = async () => {
  createError.value = ''
  isSubmitting.value = true
  try {
    const created = await projectStore.createProject({
      name: newProject.name.trim(),
      key: newProject.key.trim().toUpperCase(),
      description: newProject.description.trim() || undefined,
    })
    showCreateModal.value = false
    newProject.name = ''
    newProject.key = ''
    newProject.description = ''
    router.push(`/projects/${created.id}`)
  } catch (e: any) {
    createError.value = e.response?.data?.message || e.response?.data?.title || 'Failed to create project'
  } finally {
    isSubmitting.value = false
  }
}
</script>
