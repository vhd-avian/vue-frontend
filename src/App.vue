<template>
  <div id="app" class="min-h-screen bg-gray-50 text-gray-900">
    <nav class="bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      <div class="flex items-center gap-8">
        <router-link to="/" class="text-xl font-bold text-blue-600 flex items-center gap-2">
          <span class="bg-blue-600 text-white p-1 rounded text-xs font-mono font-bold">IT</span>
          IssueTracker Pro
        </router-link>
        <div v-if="auth.isAuthenticated" class="flex items-center gap-4 text-sm font-medium">
          <router-link to="/" class="text-gray-600 hover:text-blue-600 transition">Dashboard</router-link>
          <router-link to="/profile" class="text-gray-600 hover:text-blue-600 transition">Profile</router-link>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <!-- API Server Selector / Training Mode Button -->
        <button
          @click="showApiModal = true"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-gray-50 hover:bg-gray-100 transition text-gray-700"
          :title="currentApiUrl"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span class="hidden sm:inline">Backend API:</span>
          <span class="font-mono text-blue-600">{{ shortApiUrl }}</span>
        </button>

        <template v-if="auth.isAuthenticated">
          <router-link to="/profile" class="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition">
            <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {{ (auth.user?.full_name || auth.user?.fullName || auth.user?.email || 'U').charAt(0).toUpperCase() }}
            </div>
            <span class="hidden sm:inline">{{ auth.user?.full_name || auth.user?.fullName || auth.user?.email }}</span>
          </router-link>
          <button @click="handleLogout" class="text-gray-500 hover:text-red-600 text-sm font-medium transition">
            Logout
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="text-sm font-semibold text-blue-600 hover:text-blue-800">
            Sign In
          </router-link>
        </template>
      </div>
    </nav>

    <!-- API Base URL Selector Modal -->
    <div
      v-if="showApiModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>🌐</span> Backend Server &amp; Token Architecture
            </h3>
            <p class="text-xs text-gray-500">
              Select or configure target API backend. Each target retains its independent authentication token.
            </p>
          </div>
          <button @click="showApiModal = false" class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-5">
          <div>
            <div class="flex justify-between items-center mb-2.5">
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Pre-configured Backend Targets (3 per row)
              </label>
              <span class="text-[11px] text-gray-400">Click a card to select</span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                v-for="target in PRESET_BACKENDS"
                :key="target.key"
                type="button"
                @click="selectPreset(target)"
                class="p-3.5 rounded-xl border text-left transition flex flex-col justify-between relative group hover:shadow-sm"
                :class="selectedBackendKey === target.key
                  ? 'border-blue-600 bg-blue-50/80 text-blue-950 ring-2 ring-blue-500/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70 text-gray-700'"
              >
                <!-- Header: Name & Icon -->
                <div class="flex items-start justify-between gap-2">
                  <div class="font-bold text-xs flex items-center gap-1.5 truncate">
                    <span class="text-sm">{{ target.icon }}</span>
                    <span class="truncate">{{ target.name }}</span>
                  </div>
                  <span
                    v-if="selectedBackendKey === target.key"
                    class="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1"
                    title="Currently selected"
                  ></span>
                </div>

                <!-- URL -->
                <div class="mt-2.5 bg-gray-100/70 group-hover:bg-gray-200/60 rounded px-2 py-1 font-mono text-[11px] text-gray-700 truncate">
                  {{ target.url }}
                </div>

                <!-- Storage Key Tag & Token State -->
                <div class="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                  <span class="font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                    access_token_{{ target.key }}
                  </span>
                  <span
                    class="font-medium flex items-center gap-1"
                    :class="hasStoredToken(target.key) ? 'text-emerald-600' : 'text-gray-400'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="hasStoredToken(target.key) ? 'bg-emerald-500' : 'bg-gray-300'"></span>
                    {{ hasStoredToken(target.key) ? 'Saved' : 'No Token' }}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div class="pt-3 border-t border-gray-100">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Custom / Deployed API Configuration
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-gray-700 mb-1">Target API Base URL</label>
                <input
                  v-model="tempApiUrl"
                  type="text"
                  placeholder="e.g., https://my-backend.railway.app/api/v1"
                  class="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono bg-white"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Storage Key Tag (Name)</label>
                <input
                  v-model="selectedBackendKey"
                  type="text"
                  placeholder="e.g., flask, rails"
                  class="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono lowercase bg-white"
                />
              </div>
            </div>
            <div class="mt-2 bg-blue-50/60 border border-blue-100 rounded-lg p-2.5 text-xs text-blue-900 flex items-center justify-between">
              <div>
                <span class="font-semibold">Active Storage Key:</span>
                <code class="ml-1.5 font-mono text-blue-700 bg-white px-1.5 py-0.5 rounded border border-blue-200">
                  access_token_{{ (selectedBackendKey || 'custom').toLowerCase() }}
                </code>
              </div>
              <span class="text-[11px] text-blue-600">
                {{ hasStoredToken(selectedBackendKey) ? '✓ Active Session Token Available' : '○ Needs Login' }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            @click="showApiModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200/70 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="saveApiUrl"
            class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            Switch Backend &amp; Reload
          </button>
        </div>
      </div>
    </div>

    <div class="fixed right-4 top-4 z-[60] flex flex-col gap-3 w-[min(360px,calc(100vw-2rem))]">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="rounded-xl border px-4 py-3 shadow-lg text-sm font-medium backdrop-blur-sm flex items-start justify-between gap-3"
        :class="{
          'bg-red-50 border-red-200 text-red-700': toast.type === 'error',
          'bg-emerald-50 border-emerald-200 text-emerald-700': toast.type === 'success',
          'bg-blue-50 border-blue-200 text-blue-700': toast.type === 'info',
        }"
      >
        <span>{{ toast.message }}</span>
        <button
          type="button"
          class="ml-2 text-current opacity-70 hover:opacity-100 transition focus:outline-none"
          aria-label="Close notification"
          @click="dismiss(toast.id)"
        >
          ×
        </button>
      </div>
    </div>

    <main class="w-full">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import {
  getApiBaseUrl,
  setApiBackend,
  getActiveBackendKey,
  getStoredToken,
  PRESET_BACKENDS,
  type BackendTarget,
} from '@/api/client'

const auth = useAuthStore()
const router = useRouter()
const { toasts, dismiss, success } = useToast()

const showApiModal = ref(false)
const currentApiUrl = ref(getApiBaseUrl())
const tempApiUrl = ref(getApiBaseUrl())
const selectedBackendKey = ref(getActiveBackendKey())

const hasStoredToken = (key?: string): boolean => {
  if (!key) return false
  return !!getStoredToken(key.toLowerCase())
}

const shortApiUrl = computed(() => {
  const target = PRESET_BACKENDS.find((p) => p.url === currentApiUrl.value && p.key === selectedBackendKey.value)
  if (target) {
    return `${target.name} (${target.key})`
  }
  const url = currentApiUrl.value
  if (url === '/api/v1' || url === '/api') return 'Express (/api/v1)'
  return `${selectedBackendKey.value}: ${url.replace('http://', '').replace('https://', '')}`
})

const selectPreset = (target: BackendTarget) => {
  tempApiUrl.value = target.url
  selectedBackendKey.value = target.key
}

const saveApiUrl = () => {
  setApiBackend(tempApiUrl.value, selectedBackendKey.value)
  currentApiUrl.value = getApiBaseUrl()
  showApiModal.value = false
  success(`Active backend switched to ${selectedBackendKey.value} (${currentApiUrl.value})`)
  window.location.reload()
}

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>
