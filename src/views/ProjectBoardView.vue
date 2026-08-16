<template>
  <div class="p-4 sm:p-6 w-full">
    <!-- Project Header & Breadcrumbs -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <router-link to="/" class="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 mb-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </router-link>
        <div class="flex items-center gap-3">
          <span class="bg-blue-600 text-white text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
            {{ project?.key || '...' }}
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {{ project?.name || 'Loading Project...' }}
          </h1>
          <span
            v-if="isProjectAdmin"
            class="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full"
          >
            Admin Access
          </span>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex items-center gap-3 flex-wrap">
        <button
          @click="showCreateIssueModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition flex items-center gap-2"
        >
          <span class="text-lg leading-none">+</span> New Issue
        </button>
        <button
          v-if="isProjectAdmin"
          @click="openCreateSprintModal"
          class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-lg text-sm font-semibold shadow-xs transition flex items-center gap-1.5"
        >
          <span class="text-lg leading-none text-blue-600">+</span> New Sprint
        </button>
        <button
          v-if="isProjectAdmin"
          @click="openAddMemberModal"
          class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-lg text-sm font-semibold shadow-xs transition flex items-center gap-1.5"
        >
          <span class="text-lg leading-none text-blue-600">+</span> Add Member
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-gray-200 mb-6 space-x-8 text-sm font-semibold">
      <button
        @click="activeTab = 'board'"
        :class="[
          'pb-3 border-b-2 flex items-center gap-2 transition-colors',
          activeTab === 'board'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        Kanban Board
      </button>

      <button
        @click="activeTab = 'sprints'"
        :class="[
          'pb-3 border-b-2 flex items-center gap-2 transition-colors',
          activeTab === 'sprints'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Sprints
        <span v-if="sprintStore.sprints.length" class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
          {{ sprintStore.sprints.length }}
        </span>
      </button>

      <button
        @click="activeTab = 'members'"
        :class="[
          'pb-3 border-b-2 flex items-center gap-2 transition-colors',
          activeTab === 'members'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        Team & Roles
        <span v-if="projectStore.members.length" class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
          {{ projectStore.members.length }}
        </span>
      </button>

      <button
        @click="activeTab = 'settings'"
        :class="[
          'pb-3 border-b-2 flex items-center gap-2 transition-colors',
          activeTab === 'settings'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Settings
      </button>
    </div>

    <!-- ==================== TAB 1: KANBAN BOARD ==================== -->
    <div v-if="activeTab === 'board'">
      <!-- Board Filters -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border shadow-sm">
        <div class="flex items-center gap-3">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Sprint:</label>
          <select
            v-model="selectedSprintFilter"
            @change="refreshIssues"
            class="px-3 py-1.5 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Sprints & Backlog</option>
            <option value="backlog_only">Backlog Only (No Sprint)</option>
            <option v-if="activeSprint" :value="activeSprint.id">
              🏃 Active: {{ activeSprint.name }}
            </option>
            <optgroup label="Other Sprints" v-if="sprintStore.sprints.length > 0">
              <option
                v-for="s in sprintStore.sprints"
                :key="s.id"
                :value="s.id"
              >
                {{ s.name }} ({{ getSprintIsActive(s) ? 'Active' : 'Planned/Closed' }})
              </option>
            </optgroup>
          </select>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="showCreateIssueModal = true"
            class="text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
          >
            + Add Issue
          </button>
          <button
            @click="refreshIssues"
            class="text-xs font-semibold text-gray-600 hover:text-blue-600 flex items-center gap-1.5 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Board
          </button>
        </div>
      </div>

      <!-- Loading / Error -->
      <div v-if="issueStore.loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <span class="ml-3 text-gray-500 font-medium">Loading issues...</span>
      </div>

      <!-- Columns Grid with Drag and Drop -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full pb-6">
        <div
          v-for="status in statuses"
          :key="status"
          class="w-full bg-gray-100/80 border border-gray-200/60 p-3.5 rounded-2xl min-h-[calc(100vh-280px)] flex flex-col transition-all"
          :class="{ 'bg-blue-50/80 border-blue-200': isDragOver && dragOverStatus === status }"
          @dragover.prevent="handleDragOver(status)"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop(status)"
        >
          <div class="flex justify-between items-center mb-3 px-1">
            <h2 class="font-bold text-xs uppercase tracking-wider text-gray-600">
              {{ status.replace('_', ' ') }}
            </h2>
            <span class="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {{ groupedIssues[status]?.length || 0 }}
            </span>
          </div>

          <div class="space-y-3 flex-1 overflow-y-auto">
            <div
              v-for="issue in groupedIssues[status]"
              :key="issue.id"
              class="bg-white p-4 rounded-xl shadow-xs border border-gray-200/70 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
              :class="{ 'opacity-50 border-dashed border-2 border-blue-400': draggedIssueId === issue.id }"
              draggable="true"
              @dragstart="handleDragStart(issue)"
              @dragend="handleDragEnd"
              @click="router.push(`/issues/${issue.id}`)"
            >
              <div class="flex items-start justify-between gap-2 mb-2">
                <span
                  class="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
                  :class="{
                    'bg-red-100 text-red-700': issue.type === 'bug',
                    'bg-blue-100 text-blue-700': issue.type === 'story',
                    'bg-emerald-100 text-emerald-700': issue.type === 'task'
                  }"
                >
                  {{ issue.type }}
                </span>
                <span
                  class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                  :class="{
                    'text-red-600 bg-red-50': issue.priority === 'highest' || issue.priority === 'high',
                    'text-amber-600 bg-amber-50': issue.priority === 'medium',
                    'text-gray-500 bg-gray-50': issue.priority === 'low' || issue.priority === 'lowest'
                  }"
                >
                  {{ issue.priority }}
                </span>
              </div>

              <div class="font-semibold text-gray-900 text-sm mb-3 group-hover:text-blue-600 transition">
                {{ issue.title }}
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-400">
                <span class="font-mono">#{{ issue.id.slice(0, 6) }}</span>
                <div class="flex items-center gap-1.5">
                  <span v-if="getIssueStoryPoints(issue)" class="bg-gray-100 text-gray-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                    {{ getIssueStoryPoints(issue) }} SP
                  </span>
                  <div
                    v-if="getIssueAssigneeId(issue)"
                    class="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold"
                    :title="getMemberName(getIssueAssigneeId(issue))"
                  >
                    {{ getMemberName(getIssueAssigneeId(issue)).charAt(0).toUpperCase() }}
                  </div>
                </div>
              </div>
            </div>

            <div 
              v-if="groupedIssues[status]?.length === 0" 
              class="text-center py-8 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl transition-colors"
              :class="{ 'border-blue-300 bg-blue-50': isDragOver && dragOverStatus === status }"
            >
              {{ isDragOver && dragOverStatus === status ? 'Drop here' : 'No issues' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 2: SPRINTS ==================== -->
    <div v-else-if="activeTab === 'sprints'" class="space-y-6">
      <!-- Active Sprint Card -->
      <div v-if="activeSprint" class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 shadow-md">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="bg-white/20 text-white text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                Active Sprint
              </span>
              <span v-if="getSprintEndDate(activeSprint)" class="text-xs text-blue-100">
                Ends: {{ new Date(getSprintEndDate(activeSprint)!).toLocaleDateString() }}
              </span>
            </div>
            <h2 class="text-2xl font-black">{{ activeSprint.name }}</h2>
            <p class="text-blue-100 text-sm mt-1 max-w-xl">
              {{ activeSprint.goal || 'No sprint goal specified.' }}
            </p>
          </div>

          <div v-if="isProjectAdmin" class="flex items-center gap-2">
            <button
              @click="openEditSprintModal(activeSprint)"
              class="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-lg text-xs font-semibold backdrop-blur transition"
            >
              Edit Sprint
            </button>
            <button
              @click="handleCompleteSprint(activeSprint.id)"
              class="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition"
            >
              Complete Sprint
            </button>
          </div>
        </div>
      </div>

      <!-- Sprints List -->
      <div class="bg-white rounded-2xl border shadow-sm p-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Sprint Backlog & History</h3>
            <p class="text-xs text-gray-500 mt-0.5">Organize issues into iterations and timeboxed sprints</p>
          </div>
          <button
            v-if="isProjectAdmin"
            @click="openCreateSprintModal"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <span class="text-base leading-none">+</span> Create Sprint
          </button>
        </div>

        <div v-if="sprintStore.sprints.length === 0" class="text-center py-12 text-gray-400 border border-dashed rounded-xl">
          <p class="mb-3">No sprints created yet.</p>
          <button
            v-if="isProjectAdmin"
            @click="openCreateSprintModal"
            class="text-blue-600 font-semibold text-xs hover:underline"
          >
            + Create your first sprint
          </button>
        </div>

        <div v-else class="divide-y">
          <div
            v-for="sprint in sprintStore.sprints"
            :key="sprint.id"
            class="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-gray-900 text-base">{{ sprint.name }}</span>
                <span
                  class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                  :class="getSprintIsActive(sprint) ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'"
                >
                  {{ getSprintIsActive(sprint) ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <p class="text-xs text-gray-500">{{ sprint.goal || 'No goal set' }}</p>
              <div class="text-[11px] text-gray-400 flex items-center gap-4">
                <span>Start: {{ getSprintStartDate(sprint) ? new Date(getSprintStartDate(sprint)!).toLocaleDateString() : 'Unscheduled' }}</span>
                <span>End: {{ getSprintEndDate(sprint) ? new Date(getSprintEndDate(sprint)!).toLocaleDateString() : 'Unscheduled' }}</span>
              </div>
            </div>

            <div v-if="isProjectAdmin" class="flex items-center gap-2 flex-wrap">
              <button
                v-if="!getSprintIsActive(sprint)"
                @click="handleActivateSprint(sprint.id)"
                class="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              >
                Start Sprint
              </button>
              <button
                @click="openEditSprintModal(sprint)"
                class="border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              >
                Edit
              </button>
              <button
                v-if="!getSprintIsActive(sprint)"
                @click="handleDeleteSprint(sprint.id)"
                class="border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 3: TEAM & ROLES ==================== -->
    <div v-else-if="activeTab === 'members'" class="space-y-6">
      <div class="bg-white rounded-2xl border shadow-sm p-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Project Members</h3>
            <p class="text-xs text-gray-500 mt-0.5">Manage users and roles (admin, lead, member) who have access to this project</p>
          </div>
          <button
            v-if="isProjectAdmin"
            @click="openAddMemberModal"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <span class="text-base leading-none">+</span> Add Team Member
          </button>
        </div>

        <div class="divide-y">
          <div
            v-for="m in projectStore.members"
            :key="getMemberUserId(m)"
            class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {{ getMemberUserFullName(m).charAt(0).toUpperCase() }}
              </div>
              <div>
                <div class="font-bold text-gray-900 text-sm">{{ getMemberUserFullName(m) }}</div>
                <div class="text-xs text-gray-500">{{ m.user?.email }}</div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2">
                <label class="text-xs text-gray-400 font-medium">Role:</label>
                <select
                  v-if="isProjectAdmin"
                  :value="m.role"
                  @change="handleChangeMemberRole(getMemberUserId(m), ($event.target as HTMLSelectElement).value)"
                  class="text-xs font-bold uppercase px-2.5 py-1.5 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="member">Member</option>
                  <option value="lead">Lead</option>
                  <option value="admin">Admin</option>
                </select>
                <span
                  v-else
                  class="text-xs font-bold uppercase px-2.5 py-1.5 rounded-lg border bg-gray-50 text-gray-600"
                >
                  {{ m.role }}
                </span>
              </div>

              <button
                v-if="isProjectAdmin && getMemberUserId(m) !== authStore.user?.id"
                @click="handleRemoveMember(getMemberUserId(m))"
                class="text-xs text-red-600 hover:text-red-800 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition border border-red-100"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 4: SETTINGS ==================== -->
    <div v-else-if="activeTab === 'settings'" class="w-full space-y-6">
      <div class="bg-white rounded-2xl border shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Project Details</h3>

        <form @submit.prevent="handleUpdateProject" class="space-y-4">
          <div v-if="updateError" class="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {{ updateError }}
          </div>
          <div v-if="updateSuccess" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
            Project updated successfully!
          </div>

          <div v-if="!isProjectAdmin" class="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            You have read-only access. Only project leads and admins can modify settings.
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Project Name *</label>
            <input
              v-model="editProjectForm.name"
              type="text"
              required
              :disabled="!isProjectAdmin"
              :class="!isProjectAdmin ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''"
              class="w-full px-3.5 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Project Key</label>
            <input
              :value="project?.key"
              disabled
              class="w-full px-3.5 py-2 border rounded-lg text-sm bg-gray-100 text-gray-500 font-mono"
            />
            <p class="text-xs text-gray-400 mt-1">Key is assigned at project creation and cannot be modified.</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              v-model="editProjectForm.description"
              rows="3"
              :disabled="!isProjectAdmin"
              :class="!isProjectAdmin ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''"
              class="w-full px-3.5 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Project Lead</label>
            <select
              v-model="editProjectForm.lead_user_id"
              :disabled="!isProjectAdmin"
              :class="!isProjectAdmin ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''"
              class="w-full px-3.5 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option
                v-for="m in projectStore.members"
                :key="getMemberUserId(m)"
                :value="getMemberUserId(m)"
              >
                {{ getMemberUserFullName(m) }} ({{ m.user?.email }})
              </option>
            </select>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_archived"
              v-model="editProjectForm.is_archived"
              :disabled="!isProjectAdmin"
              class="rounded text-blue-600 focus:ring-blue-500"
            />
            <label for="is_archived" class="text-sm font-medium text-gray-700">Archive this project</label>
          </div>

          <div v-if="isProjectAdmin" class="pt-4 border-t flex justify-end">
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div v-if="isProjectAdmin" class="bg-red-50/60 border border-red-200 rounded-2xl p-6">
        <h3 class="text-base font-bold text-red-700 mb-1">Danger Zone</h3>
        <p class="text-xs text-red-600 mb-4">Deleting a project is irreversible and removes all issues, comments, attachments, and sprints.</p>
        <button
          @click="handleDeleteProject"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
        >
          Delete Project
        </button>
      </div>
    </div>

    <!-- ==================== MODALS ==================== -->

    <!-- Create Issue Modal -->
    <div v-if="showCreateIssueModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in duration-150">
        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-900">Create New Issue</h3>
          <button @click="showCreateIssueModal = false" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleCreateIssue" class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
            <input v-model="newIssue.title" type="text" required placeholder="Issue title..." class="w-full px-3.5 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Type</label>
              <select v-model="newIssue.type" class="w-full px-3 py-2 border rounded-lg text-sm outline-none">
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="story">Story</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
              <select v-model="newIssue.priority" class="w-full px-3 py-2 border rounded-lg text-sm outline-none">
                <option value="lowest">Lowest</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="highest">Highest</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Assignee</label>
              <div class="relative">
                <input
                  v-model="assigneeSearch"
                  type="text"
                  placeholder="Search assignee..."
                  class="w-full px-3.5 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div v-if="assigneeSearch || newIssue.assignee_id" class="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                  <button
                    type="button"
                    @click="newIssue.assignee_id = null; assigneeSearch = ''"
                    class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    :class="{ 'bg-blue-50 text-blue-700': !newIssue.assignee_id }"
                  >
                    Unassigned
                  </button>
                  <button
                    v-for="m in filteredAssigneeMembers"
                    :key="getMemberUserId(m)"
                    type="button"
                    @click="newIssue.assignee_id = getMemberUserId(m); assigneeSearch = getMemberUserFullName(m)"
                    class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    :class="{ 'bg-blue-50 text-blue-700': newIssue.assignee_id === getMemberUserId(m) }"
                  >
                    {{ getMemberUserFullName(m) }}
                  </button>
                  <div v-if="!filteredAssigneeMembers.length" class="px-3 py-2 text-xs text-gray-400">
                    No matching members
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Sprint</label>
              <select v-model="newIssue.sprint_id" class="w-full px-3 py-2 border rounded-lg text-sm outline-none">
                <option :value="null">Backlog (No Sprint)</option>
                <option v-for="s in sprintStore.sprints" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Story Points</label>
            <input v-model.number="newIssue.story_points" type="number" min="0" placeholder="e.g. 3" class="w-full px-3.5 py-2 border rounded-lg text-sm outline-none" />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea v-model="newIssue.description" rows="3" placeholder="Describe the issue..." class="w-full px-3.5 py-2 border rounded-lg text-sm outline-none"></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t">
            <button type="button" @click="showCreateIssueModal = false" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Create Issue</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create/Edit Sprint Modal -->
    <div v-if="showSprintModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-900">{{ editingSprintId ? 'Edit Sprint' : 'Create Sprint' }}</h3>
          <button @click="showSprintModal = false" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSaveSprint" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Sprint Name *</label>
            <input v-model="sprintForm.name" type="text" required placeholder="e.g., Sprint 1" class="w-full px-3.5 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Sprint Goal</label>
            <textarea v-model="sprintForm.goal" rows="2" placeholder="What will this sprint accomplish?" class="w-full px-3.5 py-2 border rounded-lg text-sm outline-none"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
              <input v-model="sprintForm.start_date" type="date" class="w-full px-3 py-2 border rounded-lg text-sm outline-none" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
              <input v-model="sprintForm.end_date" type="date" class="w-full px-3 py-2 border rounded-lg text-sm outline-none" />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t">
            <button type="button" @click="showSprintModal = false" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
              {{ editingSprintId ? 'Update Sprint' : 'Create Sprint' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div v-if="showAddMemberModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-900">Add Team Member</h3>
          <button @click="showAddMemberModal = false" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleAddMember" class="p-6 space-y-4">
          <div v-if="addMemberError" class="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {{ addMemberError }}
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Select User *</label>
            <select v-model="selectedUserId" required class="w-full px-3.5 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="" disabled>Select a user to add...</option>
              <option v-for="u in availableUsers" :key="u.id" :value="u.id">
                {{ getUserDisplayName(u) }} ({{ u.email }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Project Role *</label>
            <select v-model="selectedUserRole" class="w-full px-3.5 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="member">Member (Can view, create, edit assigned issues)</option>
              <option value="lead">Lead (Can manage sprints and project)</option>
              <option value="admin">Admin (Full project control)</option>
            </select>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t">
            <button type="button" @click="showAddMemberModal = false" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Add to Project</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getApiErrorMessage } from '@/api/client'
import { useToast } from '@/composables/useToast'
import { useProjectStore } from '@/stores/projects'
import { useIssueStore } from '@/stores/issues'
import { useSprintStore } from '@/stores/sprints'
import { useAuthStore } from '@/stores/auth'
import type { ProjectDto, UserDto, SprintDto, ProjectMemberDto, IssueDto } from '@/types'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

const projectStore = useProjectStore()
const issueStore = useIssueStore()
const sprintStore = useSprintStore()
const authStore = useAuthStore()
const toast = useToast()

const activeTab = ref<'board' | 'sprints' | 'members' | 'settings'>('board')
const project = ref<ProjectDto | null>(null)
const statuses = ['backlog', 'todo', 'in_progress', 'in_review', 'done']
const selectedSprintFilter = ref('all')
const assigneeSearch = ref('')

// Drag and Drop state
const draggedIssueId = ref<string | null>(null)
const draggedIssue = ref<IssueDto | null>(null)
const isDragOver = ref(false)
const dragOverStatus = ref<string | null>(null)

// Modals
const showCreateIssueModal = ref(false)
const showSprintModal = ref(false)
const editingSprintId = ref<string | null>(null)
const showAddMemberModal = ref(false)

const allUsers = ref<UserDto[]>([])
const selectedUserId = ref('')
const selectedUserRole = ref('member')
const addMemberError = ref('')

const updateError = ref('')
const updateSuccess = ref(false)

const editProjectForm = reactive({
  name: '',
  description: '',
  lead_user_id: '',
  is_archived: false,
})

const sprintForm = reactive({
  name: '',
  goal: '',
  start_date: '',
  end_date: '',
})

const newIssue = reactive({
  title: '',
  description: '',
  type: 'task' as 'task' | 'bug' | 'story',
  priority: 'medium' as 'lowest' | 'low' | 'medium' | 'high' | 'highest',
  story_points: undefined as number | undefined,
  assignee_id: null as string | null,
  sprint_id: null as string | null,
})

// Accessor helpers (handles both camelCase and snake_case backend APIs)
const getMemberUserId = (m: ProjectMemberDto) => m.user_id || m.userId || ''
const getMemberUserFullName = (m: ProjectMemberDto) => m.user?.full_name || m.user?.fullName || m.user?.email || 'Member'
const getUserDisplayName = (u: UserDto) => u.full_name || u.fullName || u.email
const getSprintStartDate = (s: SprintDto) => s.start_date || s.startDate
const getSprintEndDate = (s: SprintDto) => s.end_date || s.endDate
const getSprintIsActive = (s: SprintDto) => s.is_active ?? s.isActive ?? false
const getIssueAssigneeId = (i: IssueDto) => i.assignee_id || i.assigneeId
const getIssueStoryPoints = (i: IssueDto) => i.story_points ?? i.storyPoints

const activeSprint = computed(() => {
  return sprintStore.sprints.find((s) => getSprintIsActive(s))
})

// Permissions: check if current user is project lead/admin or global admin
const isProjectAdmin = computed(() => {
  const currentUserId = authStore.user?.id
  if (!currentUserId) return false

  const globalRole = authStore.user?.global_role || authStore.user?.globalRole
  if (globalRole === 'admin') return true

  const leadId = project.value?.lead_user_id || project.value?.leadUserId
  if (leadId && leadId.toString().toLowerCase() === currentUserId.toString().toLowerCase()) return true

  const member = projectStore.members.find((m) => {
    const uid = getMemberUserId(m)
    return uid && uid.toString().toLowerCase() === currentUserId.toString().toLowerCase()
  })

  if (member) {
    const r = (member.role || '').toLowerCase()
    return r === 'admin' || r === 'lead'
  }

  return false
})

// Users available to add as members
const availableUsers = computed(() => {
  const existingMemberIds = new Set(projectStore.members.map((m) => getMemberUserId(m).toLowerCase()))
  return allUsers.value.filter((u) => !existingMemberIds.has(u.id.toLowerCase()))
})

const filteredAssigneeMembers = computed(() => {
  const query = assigneeSearch.value.trim().toLowerCase()
  if (!query) return projectStore.members
  return projectStore.members.filter((m) => {
    const fullName = (getMemberUserFullName(m) || '').toLowerCase()
    const email = (m.user?.email || '').toLowerCase()
    return fullName.includes(query) || email.includes(query)
  })
})

const groupedIssues = computed(() => {
  const groups: Record<string, IssueDto[]> = {}
  statuses.forEach((s) => (groups[s] = []))

  let filtered = issueStore.issues
  if (selectedSprintFilter.value === 'backlog_only') {
    filtered = filtered.filter((i) => !(i.sprint_id || i.sprintId))
  } else if (selectedSprintFilter.value !== 'all') {
    filtered = filtered.filter((i) => (i.sprint_id || i.sprintId) === selectedSprintFilter.value)
  }

  filtered.forEach((i) => {
    if (groups[i.status]) groups[i.status].push(i)
  })
  return groups
})

const getMemberName = (userId: string | null | undefined) => {
  if (!userId) return 'Unassigned'
  const member = projectStore.members.find((m) => getMemberUserId(m).toLowerCase() === userId.toLowerCase())
  return member ? getMemberUserFullName(member) : 'Team Member'
}

// Drag and Drop handlers
const handleDragStart = (issue: IssueDto) => {
  draggedIssueId.value = issue.id
  draggedIssue.value = issue
  document.body.style.cursor = 'grabbing'
}

const handleDragEnd = () => {
  draggedIssueId.value = null
  draggedIssue.value = null
  isDragOver.value = false
  dragOverStatus.value = null
  document.body.style.cursor = 'default'
}

const handleDragOver = (status: string) => {
  isDragOver.value = true
  dragOverStatus.value = status
}

const handleDragLeave = () => {
  isDragOver.value = false
  dragOverStatus.value = null
}

const handleDrop = async (targetStatus: string) => {
  isDragOver.value = false
  dragOverStatus.value = null

  if (!draggedIssue.value) return
  
  const sourceStatus = draggedIssue.value.status
  
  if (sourceStatus === targetStatus) {
    handleDragEnd()
    return
  }

  try {
    const issueId = draggedIssueId.value!
    const issueToUpdate = issueStore.issues.find((i) => i.id === issueId)
    if (issueToUpdate) {
      issueToUpdate.status = targetStatus
    }

    await issueStore.updateIssue(issueId, { status: targetStatus })
    toast.success(`Issue moved to ${targetStatus.replace('_', ' ')}`)
    await refreshIssues()
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to move issue')
    await refreshIssues()
  } finally {
    handleDragEnd()
  }
}

onMounted(async () => {
  await loadProjectData()
})

const loadProjectData = async () => {
  try {
    project.value = await projectStore.fetchProject(projectId)
    editProjectForm.name = project.value.name
    editProjectForm.description = project.value.description || ''
    editProjectForm.lead_user_id = project.value.lead_user_id || project.value.leadUserId || ''
    editProjectForm.is_archived = project.value.is_archived ?? project.value.isArchived ?? false

    await Promise.all([
      projectStore.fetchMembers(projectId),
      sprintStore.loadSprints(projectId),
      refreshIssues(),
    ])
  } catch (e: any) {
    const status = e?.response?.status
    const message = getApiErrorMessage(e, 'Failed to load project')
    console.error('Failed to load project:', e)
    toast.error(message)

    if (status === 403 || status === 404) {
      router.replace('/')
    }
  }
}

const refreshIssues = async () => {
  await issueStore.search({ project_id: projectId, limit: 100 })
}

// Issue creation
const handleCreateIssue = async () => {
  try {
    await issueStore.createIssue({
      title: newIssue.title,
      description: newIssue.description || undefined,
      type: newIssue.type,
      priority: newIssue.priority,
      story_points: newIssue.story_points,
      assignee_id: newIssue.assignee_id || undefined,
      sprint_id: newIssue.sprint_id || undefined,
      project_id: projectId,
    })
    showCreateIssueModal.value = false
    newIssue.title = ''
    newIssue.description = ''
    newIssue.story_points = undefined
    await refreshIssues()
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to create issue')
  }
}

// Sprint Handlers
const openCreateSprintModal = () => {
  editingSprintId.value = null
  sprintForm.name = `Sprint ${sprintStore.sprints.length + 1}`
  sprintForm.goal = ''
  sprintForm.start_date = ''
  sprintForm.end_date = ''
  showSprintModal.value = true
}

const openEditSprintModal = (s: SprintDto) => {
  editingSprintId.value = s.id
  sprintForm.name = s.name
  sprintForm.goal = s.goal || ''
  const start = getSprintStartDate(s)
  const end = getSprintEndDate(s)
  sprintForm.start_date = start ? start.split('T')[0] : ''
  sprintForm.end_date = end ? end.split('T')[0] : ''
  showSprintModal.value = true
}

const handleSaveSprint = async () => {
  try {
    const payload = {
      name: sprintForm.name,
      goal: sprintForm.goal || null,
      start_date: sprintForm.start_date ? new Date(sprintForm.start_date).toISOString() : null,
      end_date: sprintForm.end_date ? new Date(sprintForm.end_date).toISOString() : null,
    }
    if (editingSprintId.value) {
      await sprintStore.updateSprint(editingSprintId.value, payload)
    } else {
      await sprintStore.createSprint(projectId, payload)
    }
    showSprintModal.value = false
    await sprintStore.loadSprints(projectId)
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to save sprint')
  }
}

const handleActivateSprint = async (sprintId: string) => {
  if (!confirm('Are you sure you want to start this sprint?')) return
  try {
    await sprintStore.activateSprint(sprintId)
    await sprintStore.loadSprints(projectId)
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to activate sprint')
  }
}

const handleCompleteSprint = async (sprintId: string) => {
  if (!confirm('Complete this sprint? Unfinished issues will be moved back to backlog.')) return
  try {
    const res = await sprintStore.completeSprint(sprintId)
    toast.success(`Sprint completed! ${res.moved_issue_count} unfinished issues moved to backlog.`)
    await Promise.all([sprintStore.loadSprints(projectId), refreshIssues()])
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to complete sprint')
  }
}

const handleDeleteSprint = async (sprintId: string) => {
  if (!confirm('Delete this sprint?')) return
  try {
    await sprintStore.deleteSprint(sprintId)
    await sprintStore.loadSprints(projectId)
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to delete sprint')
  }
}

// Member Handlers
const openAddMemberModal = async () => {
  addMemberError.value = ''
  selectedUserId.value = ''
  selectedUserRole.value = 'member'
  try {
    allUsers.value = await projectStore.searchUsers()
    showAddMemberModal.value = true
  } catch (e) {
    toast.error('Failed to load user directory')
  }
}

const handleAddMember = async () => {
  addMemberError.value = ''
  try {
    await projectStore.addMember(projectId, {
      user_id: selectedUserId.value,
      role: selectedUserRole.value,
    })
    showAddMemberModal.value = false
  } catch (e: any) {
    addMemberError.value = e.response?.data?.message || 'Failed to add member'
  }
}

const handleChangeMemberRole = async (userId: string, newRole: string) => {
  try {
    await projectStore.updateMemberRole(projectId, userId, newRole)
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to update member role')
    await projectStore.fetchMembers(projectId)
  }
}

const handleRemoveMember = async (userId: string) => {
  if (!confirm('Remove this member from the project?')) return
  try {
    await projectStore.removeMember(projectId, userId)
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to remove member')
  }
}

// Project Settings Handlers
const handleUpdateProject = async () => {
  updateError.value = ''
  updateSuccess.value = false
  try {
    project.value = await projectStore.updateProject(projectId, {
      name: editProjectForm.name,
      description: editProjectForm.description,
      lead_user_id: editProjectForm.lead_user_id,
      is_archived: editProjectForm.is_archived,
    })
    updateSuccess.value = true
  } catch (e: any) {
    updateError.value = e.response?.data?.message || 'Failed to update project'
  }
}

const handleDeleteProject = async () => {
  const confirmed = prompt(`Type "${project.value?.key}" to confirm deleting this project:`)
  if (confirmed !== project.value?.key) {
    toast.error('Project key did not match. Deletion cancelled.')
    return
  }
  try {
    await projectStore.deleteProject(projectId)
    router.push('/')
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Failed to delete project')
  }
}
</script>