<template>
  <div class="p-4 sm:p-6 w-full">
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      <span class="ml-3 text-gray-500 font-medium">Loading issue details...</span>
    </div>

    <!-- ===== Page-level Error State (403 / 404) ===== -->
    <div v-else-if="pageError" class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div class="mb-6">
        <span v-if="pageError.code === 403" class="text-8xl">🔒</span>
        <span v-else class="text-8xl">🔍</span>
      </div>
      <h1 class="text-3xl font-extrabold text-gray-900 mb-2">
        {{ pageError.code === 403 ? 'Access Denied' : 'Issue Not Found' }}
      </h1>
      <p class="text-gray-500 text-sm max-w-sm mb-8">
        {{ pageError.code === 403
          ? "You don't have permission to view this issue."
          : "This issue doesn't exist or may have been deleted."
        }}
      </p>
      <div class="flex items-center gap-3">
        <button
          @click="router.go(-1)"
          class="inline-flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition"
        >
          ← Go Back
        </button>
        <router-link
          to="/"
          class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          All Projects
        </router-link>
      </div>
    </div>

    <div v-else-if="issue" class="space-y-6">
      <!-- Top Bar / Breadcrumb -->
      <div class="flex justify-between items-center">
        <router-link
          :to="`/projects/${issueProjectId}`"
          class="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Project Board
        </router-link>

        <button
          @click="handleDeleteIssue"
          class="text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
        >
          Delete Issue
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white shadow-xs border rounded-2xl p-6">
            <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-3">
                  <span
                    class="text-[10px] font-black uppercase px-2 py-0.5 rounded"
                    :class="{
                      'bg-red-100 text-red-700': issue.type === 'bug',
                      'bg-blue-100 text-blue-700': issue.type === 'story',
                      'bg-emerald-100 text-emerald-700': issue.type === 'task'
                    }"
                  >
                    {{ issue.type }}
                  </span>
                  <span class="text-xs font-mono text-gray-400">#{{ issue.id.slice(0, 8) }}</span>
                </div>

                <!-- Inline editable title -->
                <div v-if="!editingTitle" class="group flex items-start gap-2">
                  <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex-1">{{ issue.title }}</h1>
                  <button
                    @click="startEditTitle"
                    class="opacity-0 group-hover:opacity-100 mt-1 text-gray-400 hover:text-blue-600 p-1 rounded transition shrink-0"
                    title="Edit title"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <div v-else class="flex items-start gap-2">
                  <input
                    ref="titleInput"
                    v-model="editTitle"
                    @keydown.enter="saveTitle"
                    @keydown.escape="editingTitle = false"
                    class="flex-1 text-2xl sm:text-3xl font-extrabold text-gray-900 border-b-2 border-blue-500 outline-none bg-transparent"
                  />
                  <div class="flex gap-1 mt-1 shrink-0">
                    <button @click="saveTitle" class="text-xs bg-blue-600 text-white px-2.5 py-1 rounded font-semibold">Save</button>
                    <button @click="editingTitle = false" class="text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1 rounded font-semibold">Cancel</button>
                  </div>
                </div>
              </div>

              <!-- Status Dropdown -->
              <div class="shrink-0">
                <select
                  :value="issue.status"
                  @change="handleStatusChange(($event.target as HTMLSelectElement).value)"
                  :disabled="transitioning"
                  class="text-xs font-bold uppercase border-2 rounded-lg px-3 py-2 bg-white outline-none cursor-pointer transition"
                  :class="getStatusColor(issue.status)"
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <!-- Inline editable description -->
            <div class="border-t pt-6">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</h3>
                <button
                  v-if="!editingDescription"
                  @click="startEditDescription"
                  class="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
              </div>

              <div v-if="!editingDescription">
                <p
                  class="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                  @click="startEditDescription"
                  :class="!issue.description ? 'text-gray-400 italic' : ''"
                >
                  {{ issue.description || 'Click to add a description…' }}
                </p>
              </div>
              <div v-else class="space-y-2">
                <textarea
                  ref="descriptionInput"
                  v-model="editDescription"
                  rows="6"
                  @keydown.escape="editingDescription = false"
                  class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Describe the issue..."
                ></textarea>
                <div class="flex gap-2">
                  <button @click="saveDescription" class="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold">Save</button>
                  <button @click="editingDescription = false" class="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg font-semibold">Cancel</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Comments Section -->
          <div class="bg-white shadow-xs border rounded-2xl p-6">
            <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Activity &amp; Comments
            </h3>

            <div class="space-y-3 mb-6">
              <div
                v-for="c in issue.comments"
                :key="c.id"
                class="bg-gray-50/80 border border-gray-100 rounded-xl p-4"
              >
                <div class="flex justify-between items-center mb-1.5">
                  <span class="font-bold text-xs text-gray-900">{{ c.author?.full_name || c.author?.fullName || 'Team Member' }}</span>
                  <span class="text-[11px] text-gray-400">{{ new Date(c.created_at || c.createdAt).toLocaleString() }}</span>
                </div>
                <p class="text-gray-700 text-sm">{{ c.content }}</p>
              </div>

              <div v-if="!issue.comments?.length" class="text-center py-6 text-xs text-gray-400">
                No comments yet. Start the conversation below.
              </div>
            </div>

            <form @submit.prevent="addComment" class="flex gap-2">
              <input
                v-model="newComment"
                type="text"
                placeholder="Write a comment..."
                class="flex-1 px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50/50"
                :disabled="postingComment"
                required
              />
              <button
                type="submit"
                :disabled="postingComment"
                class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl transition font-semibold text-sm shadow-sm flex items-center gap-2"
              >
                <svg v-if="postingComment" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ postingComment ? 'Posting...' : 'Post' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Sidebar / Details -->
        <div class="space-y-6">
          <div class="bg-white shadow-xs border rounded-2xl p-6">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Details</h3>

            <div class="space-y-4 text-sm">
              <!-- Status (read-only display) -->
              <div class="flex justify-between items-center py-1.5 border-b border-gray-50">
                <span class="text-gray-500 text-xs">Status</span>
                <span 
                  class="font-bold text-xs uppercase px-2 py-0.5 rounded"
                  :class="getStatusBadgeColor(issue.status)"
                >
                  {{ (issue.status || '').replace('_', ' ') }}
                </span>
              </div>

              <!-- Type -->
              <div class="flex justify-between items-center py-1.5 border-b border-gray-50">
                <span class="text-gray-500 text-xs">Type</span>
                <select
                  v-model="editForm.type"
                  class="text-xs font-bold uppercase border rounded-md px-2 py-1 bg-gray-50 outline-none"
                >
                  <option value="task">Task</option>
                  <option value="bug">Bug</option>
                  <option value="story">Story</option>
                </select>
              </div>

              <!-- Priority -->
              <div class="flex justify-between items-center py-1.5 border-b border-gray-50">
                <span class="text-gray-500 text-xs">Priority</span>
                <select
                  v-model="editForm.priority"
                  class="text-xs font-bold uppercase border rounded-md px-2 py-1 bg-gray-50 outline-none"
                  :class="{
                    'text-red-600': editForm.priority === 'highest' || editForm.priority === 'high',
                    'text-amber-600': editForm.priority === 'medium',
                    'text-gray-600': editForm.priority === 'low' || editForm.priority === 'lowest'
                  }"
                >
                  <option value="lowest">Lowest</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="highest">Highest</option>
                </select>
              </div>

              <!-- Assignee -->
              <div class="flex justify-between items-center py-1.5 border-b border-gray-50">
                <span class="text-gray-500 text-xs">Assignee</span>
                <select
                  v-model="editForm.assigneeId"
                  class="text-xs font-medium border rounded-md px-2 py-1 bg-gray-50 outline-none max-w-[150px]"
                >
                  <option value="">Unassigned</option>
                  <option
                    v-for="m in projectStore.members"
                    :key="m.user_id || m.userId"
                    :value="m.user_id || m.userId"
                  >
                    {{ m.user?.full_name || m.user?.fullName }}
                  </option>
                </select>
              </div>

              <!-- Sprint -->
              <div class="flex justify-between items-center py-1.5 border-b border-gray-50">
                <span class="text-gray-500 text-xs">Sprint</span>
                <select
                  v-model="editForm.sprintId"
                  class="text-xs font-medium border rounded-md px-2 py-1 bg-gray-50 outline-none max-w-[150px]"
                >
                  <option value="">Backlog (No Sprint)</option>
                  <option
                    v-for="s in sprintStore.sprints"
                    :key="s.id"
                    :value="s.id"
                  >
                    {{ s.name }}
                  </option>
                </select>
              </div>

              <!-- Story Points -->
              <div class="flex justify-between items-center py-1.5 border-b border-gray-50">
                <span class="text-gray-500 text-xs">Story Points</span>
                <input
                  v-model.number="editForm.storyPoints"
                  type="number"
                  min="0"
                  max="100"
                  class="text-xs font-bold text-gray-700 border rounded-md px-2 py-1 bg-gray-50 outline-none w-16 text-right"
                  placeholder="—"
                />
              </div>

              <!-- Created -->
              <div class="flex justify-between items-center py-1.5">
                <span class="text-gray-500 text-xs">Created</span>
                <span class="text-xs text-gray-600">{{ new Date(issue.created_at || issue.createdAt).toLocaleDateString() }}</span>
              </div>
            </div>

            <!-- Save Button -->
            <div class="mt-5">
              <button
                @click="saveDetails"
                :disabled="savingDetails || !hasChanges"
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-2.5 rounded-xl transition font-semibold text-sm shadow-sm flex items-center justify-center gap-2"
              >
                <svg v-if="savingDetails" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ savingDetails ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getApiErrorMessage } from '@/api/client'
import { useToast } from '@/composables/useToast'
import { useIssueStore } from '@/stores/issues'
import { useProjectStore } from '@/stores/projects'
import { useSprintStore } from '@/stores/sprints'

const route = useRoute()
const router = useRouter()
const issueId = route.params.id as string

const issueStore = useIssueStore()
const projectStore = useProjectStore()
const sprintStore = useSprintStore()
const toast = useToast()

const issue = ref<any>(null)
const newComment = ref('')
const loading = ref(true)
const savingDetails = ref(false)
const postingComment = ref(false)
const transitioning = ref(false)

// Page-level error state (403 / 404)
const pageError = ref<{ code: number; message: string } | null>(null)

// All possible statuses
const allStatuses = ['backlog', 'todo', 'in_progress', 'in_review', 'done']

// Edit form for sidebar details
const editForm = reactive({
  type: '',
  priority: '',
  assigneeId: '',
  sprintId: '',
  storyPoints: null as number | null,
})

// Inline editing state
const editingTitle = ref(false)
const editTitle = ref('')
const titleInput = ref<HTMLInputElement | null>(null)

const editingDescription = ref(false)
const editDescription = ref('')
const descriptionInput = ref<HTMLTextAreaElement | null>(null)

const issueProjectId = computed(() => issue.value?.project_id || issue.value?.projectId || '')

// Check if there are unsaved changes
const hasChanges = computed(() => {
  if (!issue.value) return false
  return (
    editForm.type !== issue.value.type ||
    editForm.priority !== issue.value.priority ||
    editForm.assigneeId !== (issue.value.assignee_id || issue.value.assigneeId || '') ||
    editForm.sprintId !== (issue.value.sprint_id || issue.value.sprintId || '') ||
    editForm.storyPoints !== (issue.value.story_points ?? issue.value.storyPoints ?? null)
  )
})

onMounted(async () => {
  await loadIssue()
})

// Watch for issue changes and populate editForm
watch(issue, (newIssue) => {
  if (newIssue) {
    editForm.type = newIssue.type || 'task'
    editForm.priority = newIssue.priority || 'medium'
    editForm.assigneeId = newIssue.assignee_id || newIssue.assigneeId || ''
    editForm.sprintId = newIssue.sprint_id || newIssue.sprintId || ''
    editForm.storyPoints = newIssue.story_points ?? newIssue.storyPoints ?? null
  }
}, { immediate: true })

const loadIssue = async () => {
  loading.value = true
  try {
    issue.value = await issueStore.fetchIssue(issueId)
    const pid = issue.value?.project_id || issue.value?.projectId
    if (pid) {
      await Promise.all([
        projectStore.fetchMembers(pid),
        sprintStore.loadSprints(pid),
      ])
    }
  } catch (e: any) {
    const status = e?.response?.status
    console.error('Failed to load issue:', e)

    if (status === 403 || status === 404) {
      pageError.value = {
        code: status,
        message: e?.response?.data?.message || (status === 403 ? 'Access denied' : 'Issue not found'),
      }
    } else {
      toast.error(getApiErrorMessage(e, 'Failed to load issue'))
    }
  } finally {
    loading.value = false
  }
}

// ---- Status helpers ----
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    backlog: 'border-gray-300 text-gray-700',
    todo: 'border-blue-300 text-blue-700',
    in_progress: 'border-amber-300 text-amber-700',
    in_review: 'border-purple-300 text-purple-700',
    done: 'border-emerald-300 text-emerald-700',
  }
  return colors[status] || 'border-gray-300 text-gray-700'
}

const getStatusBadgeColor = (status: string) => {
  const colors: Record<string, string> = {
    backlog: 'bg-gray-100 text-gray-700',
    todo: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-amber-100 text-amber-700',
    in_review: 'bg-purple-100 text-purple-700',
    done: 'bg-emerald-100 text-emerald-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

// ---- Status change handler ----
const handleStatusChange = async (newStatus: string) => {
  if (newStatus === issue.value.status) return
  
  transitioning.value = true
  try {
    await issueStore.updateIssue(issueId, { status: newStatus })
    issue.value.status = newStatus  // Update local state
    toast.success(`Status changed to ${newStatus.replace('_', ' ')}`)
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to change status')
  } finally {
    transitioning.value = false
  }
}

// ---- Inline edit helpers ----
const startEditTitle = async () => {
  editTitle.value = issue.value.title
  editingTitle.value = true
  await nextTick()
  titleInput.value?.focus()
  titleInput.value?.select()
}

const saveTitle = async () => {
  if (!editTitle.value.trim()) return
  try {
    await issueStore.updateIssue(issueId, { title: editTitle.value.trim() })
    issue.value.title = editTitle.value.trim()  // Update local state
    editingTitle.value = false
    toast.success('Title updated')
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to update title')
  }
}

const startEditDescription = async () => {
  editDescription.value = issue.value.description || ''
  editingDescription.value = true
  await nextTick()
  descriptionInput.value?.focus()
}

const saveDescription = async () => {
  try {
    await issueStore.updateIssue(issueId, { description: editDescription.value })
    issue.value.description = editDescription.value  // Update local state
    editingDescription.value = false
    toast.success('Description updated')
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to update description')
  }
}

// ---- Save sidebar details ----
const saveDetails = async () => {
  if (!hasChanges.value) return
  
  savingDetails.value = true
  try {
    const updates: any = {}

    if (editForm.type !== issue.value.type) {
      updates.type = editForm.type
    }

    if (editForm.priority !== issue.value.priority) {
      updates.priority = editForm.priority
    }

    if (editForm.assigneeId !== (issue.value.assignee_id || issue.value.assigneeId || '')) {
      updates.assignee_id = editForm.assigneeId || undefined
    }

    if (editForm.sprintId !== (issue.value.sprint_id || issue.value.sprintId || '')) {
      updates.sprint_id = editForm.sprintId || undefined
    }

    if (editForm.storyPoints !== (issue.value.story_points ?? issue.value.storyPoints ?? null)) {
      updates.story_points = editForm.storyPoints ?? undefined
    }

    await issueStore.updateIssue(issueId, updates)
    
    // Update local state instead of reloading
    if (updates.type) issue.value.type = updates.type
    if (updates.priority) issue.value.priority = updates.priority
    if (updates.assignee_id !== undefined) issue.value.assignee_id = updates.assignee_id
    if (updates.sprint_id !== undefined) issue.value.sprint_id = updates.sprint_id
    if (updates.story_points !== undefined) issue.value.story_points = updates.story_points
    
    toast.success('Issue details updated')
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to update issue details')
  } finally {
    savingDetails.value = false
  }
}

const addComment = async () => {
  if (!newComment.value.trim()) return
  
  postingComment.value = true
  try {
    const newCommentData = await issueStore.addComment(issueId, newComment.value)
    
    // Add comment to local state instead of reloading
    if (!issue.value.comments) {
      issue.value.comments = []
    }
    issue.value.comments.push(newCommentData)
    
    newComment.value = ''
    toast.success('Comment added')
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to add comment')
  } finally {
    postingComment.value = false
  }
}

const handleDeleteIssue = async () => {
  if (!confirm('Are you sure you want to delete this issue?')) return
  try {
    const pid = issueProjectId.value
    await issueStore.deleteIssue(issueId)
    toast.success('Issue deleted')
    router.push(`/projects/${pid}`)
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to delete issue')
  }
}
</script>