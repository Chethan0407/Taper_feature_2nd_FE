import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginPage.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/DashboardPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/projects',
      name: 'Projects',
      component: () => import('@/views/ProjectsPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/projects/:id',
      name: 'ProjectDetails',
      component: () => import('@/views/ProjectDetailsPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/specs',
      name: 'Specs',
      component: () => import('@/views/SpecsPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/specs/:id',
      name: 'SpecDetails',
      component: () => import('@/views/SpecDetailsPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/checklists',
      name: 'Checklists',
      component: () => import('@/views/ChecklistsPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/speclint',
      name: 'SpecLint',
      component: () => import('@/views/SpecLintPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/vendors',
      name: 'Vendors',
      component: () => import('@/views/VendorsPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/companies',
      name: 'Companies',
      component: () => import('@/views/CompaniesPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/companies/:id',
      name: 'CompanyDetails',
      component: () => import('@/views/CompanyDetailsPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/SettingsPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/ProfilePage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings/branding',
      name: 'BrandingSettings',
      component: () => import('@/views/BrandingSettingsPage.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // If we have a token but no user data, try to load it
  if (authStore.token && authStore.token !== 'undefined' && authStore.token !== 'null' && !authStore.user) {
    console.log('🔄 Router: Token exists but no user data, attempting to load user')
    const authResult = await authStore.checkAuth()
    if (!authResult) {
      console.log('❌ Router: Failed to load user data, redirecting to login')
      next('/login')
      return
    }
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('🚫 Router: Route requires auth but user not authenticated, redirecting to login')
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    console.log('✅ Router: User is authenticated, redirecting to dashboard')
    next('/dashboard')
  } else {
    next()
  }
})

export default router 