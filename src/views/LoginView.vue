<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <div v-if="!showRegister && !showForgot">
        <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Welcome Back</h1>
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="you@example.com"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>
          <button
            type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
          >
            Sign In
          </button>
        </form>
        <div class="mt-4 text-center text-sm">
          <a href="#" @click.prevent="showForgot = true" class="text-blue-600 hover:underline">Forgot password?</a>
        </div>
        <div class="mt-2 text-center text-sm text-gray-600">
          Don't have an account?
          <a href="#" @click.prevent="showRegister = true" class="text-blue-600 hover:underline">Create one</a>
        </div>
      </div>

      <div v-if="showForgot">
        <h2 class="text-xl font-bold text-center text-gray-800 mb-4">Reset Password</h2>
        <p class="text-sm text-gray-600 mb-4">Enter your email and we'll send you a new password.</p>
        <input
          v-model="resetEmail"
          type="email"
          placeholder="you@example.com"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition mb-4"
        />
        <button
          @click="handleForgot"
          class="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 rounded-lg transition"
        >
          Send New Password
        </button>
        <p v-if="resetMessage" class="mt-2 text-sm text-green-600">{{ resetMessage }}</p>
        <p v-if="resetError" class="mt-2 text-sm text-red-600">{{ resetError }}</p>
        <button @click="showForgot = false" class="mt-3 text-sm text-gray-500 hover:underline w-full">Back to login</button>
      </div>

      <div v-if="showRegister">
        <h2 class="text-xl font-bold text-center text-gray-800 mb-4">Create Account</h2>
        <form @submit.prevent="handleRegister">
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              v-model="registerData.full_name"
              type="text"
              placeholder="John Doe"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="registerData.email"
              type="email"
              placeholder="you@example.com"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              v-model="registerData.password"
              type="password"
              placeholder="min 6 characters"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>
          <button
            type="submit"
            class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition"
          >
            Register
          </button>
          <p v-if="registerError" class="mt-2 text-sm text-red-600">{{ registerError }}</p>
        </form>
        <button @click="showRegister = false" class="mt-3 text-sm text-gray-500 hover:underline w-full">Back to login</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const email = ref('')
const password = ref('')
const showForgot = ref(false)
const showRegister = ref(false)
const resetEmail = ref('')
const resetMessage = ref('')
const resetError = ref('')
const registerData = ref({ full_name: '', email: '', password: '' })
const registerError = ref('')

const handleLogin = async () => {
  console.log('Attempting login with:', email.value)
  try {
    const data = await auth.login(email.value, password.value)
    console.log('Login successful, token:', data.access_token)
    router.push('/')
  } catch (e: any) {
    console.error('Login error:', e)
    toast.error(e.response?.data?.message || 'Login failed')
  }
}

const handleForgot = async () => {
  try {
    const res = await auth.forgotPassword(resetEmail.value)
    resetMessage.value = `New password: ${res.new_password}`
    resetError.value = ''
  } catch (e: any) {
    resetError.value = e.response?.data?.message || 'Error resetting password'
    resetMessage.value = ''
  }
}

const handleRegister = async () => {
  try {
    await auth.register(registerData.value)
    toast.success('Registration successful! Please login.')
    showRegister.value = false
    registerData.value = { full_name: '', email: '', password: '' }
  } catch (e: any) {
    registerError.value = e.response?.data?.message || 'Registration failed'
    toast.error(registerError.value)
  }
}
</script>
