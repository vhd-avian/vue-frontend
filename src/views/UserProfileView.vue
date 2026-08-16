<template>
  <div class="max-w-4xl mx-auto p-6 sm:p-8">
    <div class="mb-8 flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Profile</p>
        <h1 class="mt-2 text-3xl font-extrabold text-gray-900">Manage your account</h1>
      </div>
    </div>

    <div v-if="loading" class="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
      Loading profile...
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xl font-bold text-white">
            <img v-if="form.avatar_url" :src="form.avatar_url" class="h-full w-full object-cover" alt="Profile avatar" />
            <span v-else>{{ initials }}</span>
          </div>
          <div>
            <p class="text-lg font-bold text-gray-900">{{ form.full_name || 'Your Name' }}</p>
            <p class="text-sm text-gray-500">{{ auth.user?.email }}</p>
          </div>
        </div>

        <div class="mt-6 space-y-3 text-sm text-gray-600">
          <div class="rounded-xl bg-gray-50 px-3 py-2">Role: <span class="font-semibold text-gray-900">{{ userRoleLabel }}</span></div>
          <div class="rounded-xl bg-gray-50 px-3 py-2">Member since: <span class="font-semibold text-gray-900">{{ formatDate(auth.user?.created_at || auth.user?.createdAt) }}</span></div>
        </div>
      </aside>

      <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <form @submit.prevent="saveProfile" class="space-y-6">
          <div class="grid gap-6 md:grid-cols-2">
            <div class="md:col-span-2">
              <label class="mb-1 block text-sm font-semibold text-gray-700">Full name</label>
              <input v-model="form.full_name" type="text" class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" placeholder="Jane Doe" />
            </div>

            <div class="md:col-span-2">
              <label class="mb-1 block text-sm font-semibold text-gray-700">Email</label>
              <input :value="auth.user?.email" type="email" disabled class="w-full rounded-xl border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-gray-500" />
              <p class="mt-1 text-xs text-gray-500">Email address cannot be edited.</p>
            </div>

            <div class="md:col-span-2">
              <label class="mb-1 block text-sm font-semibold text-gray-700">Avatar URL</label>
              <input v-model="form.avatar_url" type="url" class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" placeholder="https://example.com/avatar.png" />
            </div>

            <div>
              <label class="mb-1 block text-sm font-semibold text-gray-700">Phone number</label>
              <input v-model="form.phone_number" type="tel" class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" placeholder="+1 234 567 890" />
            </div>

            <div>
              <label class="mb-1 block text-sm font-semibold text-gray-700">Role</label>
              <select v-model="form.global_role" class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" :disabled="!canEditRole">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold text-gray-700">Bio</label>
            <textarea v-model="form.bio" rows="4" class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" placeholder="Tell the team a little about yourself..."></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <button type="button" class="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50" @click="resetForm">Reset</button>
            <button type="submit" :disabled="saving" class="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
              {{ saving ? 'Saving...' : 'Save changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const auth = useAuthStore()
const toast = useToast()
const loading = ref(true)
const saving = ref(false)

const form = ref({
  full_name: '',
  avatar_url: '',
  bio: '',
  phone_number: '',
  global_role: 'user',
})

const canEditRole = computed(() => (auth.user?.global_role || auth.user?.globalRole || 'user') === 'admin')

const initials = computed(() => {
  const name = form.value.full_name || auth.user?.full_name || auth.user?.fullName || 'User'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U'
})

const userRoleLabel = computed(() => {
  const role = auth.user?.global_role || auth.user?.globalRole || 'user'
  return role === 'admin' ? 'Admin' : 'User'
})

const formatDate = (value?: string) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const resetForm = () => {
  form.value = {
    full_name: auth.user?.full_name || auth.user?.fullName || '',
    avatar_url: auth.user?.avatar_url || auth.user?.avatarUrl || '',
    bio: auth.user?.bio || '',
    phone_number: auth.user?.phone_number || auth.user?.phoneNumber || '',
    global_role: auth.user?.global_role || auth.user?.globalRole || 'user',
  }
}

const saveProfile = async () => {
  try {
    saving.value = true

    const payload: Record<string, string | null> = {
      full_name: form.value.full_name.trim(),
      avatar_url: form.value.avatar_url?.trim() || null,
      bio: form.value.bio?.trim() || null,
      phone_number: form.value.phone_number?.trim() || null,
    }

    if (canEditRole.value) {
      payload.global_role = form.value.global_role
    }

    await auth.updateProfile(payload)
    toast.success('Profile updated successfully.')
    resetForm()
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Unable to save profile changes.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (!auth.user) {
    auth.fetchMe().finally(() => {
      resetForm()
      loading.value = false
    })
    return
  }

  resetForm()
  loading.value = false
})
</script>
