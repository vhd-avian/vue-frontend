import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ProjectBoardView from '@/views/ProjectBoardView.vue'
import IssueDetailView from '@/views/IssueDetailView.vue'
import UserProfileView from '@/views/UserProfileView.vue'
import PatternsView from '@/views/PatternsView.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', component: LoginView, meta: { guest: true } },
  { path: '/', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/projects/:id', component: ProjectBoardView, meta: { requiresAuth: true } },
  { path: '/issues/:id', component: IssueDetailView, meta: { requiresAuth: true } },
  { path: '/profile', component: UserProfileView, meta: { requiresAuth: true } },
  { path: '/patterns', component: PatternsView, meta: { requiresAuth: false } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  console.log(`Navigating to ${to.path} from ${from.path}`)
  const auth = useAuthStore()
  
  if (!auth.user && auth.token) {
    console.log('Token present but no user, fetching me...')
    try {
      await auth.fetchMe()
      console.log('FetchMe successful')
    } catch (error) {
      console.error('FetchMe failed, logging out', error)
      auth.logout()
    }
  }

  console.log('Auth state:', { token: !!auth.token, user: !!auth.user })
  console.log('Route meta:', to.meta)

  if (to.meta.requiresAuth && !auth.token) {
    console.log('Requires auth but no token, redirecting to /login')
    next('/login')
  } else if (to.meta.guest && auth.token) {
    console.log('Guest route but authenticated, redirecting to /')
    next('/')
  } else {
    console.log('Proceeding to route')
    next()
  }
})

export default router
