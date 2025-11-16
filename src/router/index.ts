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
  try {
    const authStore = useAuthStore()
    
    // If coming from login page, skip auth check (user just logged in)
    const comingFromLogin = from.path === '/login'
    
    // If we have a token but no user data, try to load it (but don't block navigation)
    // Skip this check if we're coming from login (user just logged in)
    if (!comingFromLogin && authStore.token && authStore.token !== 'undefined' && authStore.token !== 'null' && !authStore.user) {
      console.log('🔄 Router: Token exists but no user data, attempting to load user')
      try {
        const authResult = await authStore.checkAuth()
        if (!authResult) {
          console.log('⚠️ Router: Failed to load user data, but allowing navigation')
          // Don't redirect immediately - let the route check below handle it
        }
      } catch (error) {
        console.error('⚠️ Router: Error during auth check:', error)
        // Don't redirect on error - let the route check below handle it
      }
    }
    
    // Check authentication for protected routes
    if (to.meta.requiresAuth) {
      // Check if we have a valid token (even if user data isn't loaded yet)
      const hasValidToken = authStore.token && 
                           authStore.token !== 'undefined' && 
                           authStore.token !== 'null' &&
                           authStore.token.trim() !== ''
      
      if (!hasValidToken) {
        console.log('🚫 Router: No valid token, redirecting to login')
        next('/login')
        return
      }
      
      // If we have a token but no user, allow navigation (user will be loaded by the component)
      // This prevents logout immediately after login
      if (!authStore.user) {
        console.log('⚠️ Router: Token exists but user not loaded yet - allowing navigation')
        next()
        return
      }
    }
    
    // Redirect authenticated users away from login page
    if (to.path === '/login' && authStore.isAuthenticated) {
      console.log('✅ Router: User is authenticated, redirecting to dashboard')
      next('/dashboard')
      return
    }
    
    next()
  } catch (error) {
    console.error('🚨 Router: Critical error in navigation guard:', error)
    // Always allow navigation to proceed, even on error
    next()
  }
})

export default router 