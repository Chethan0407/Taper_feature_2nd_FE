/**
 * Vue Router Configuration with Code Splitting
 * 
 * This router implements route-based code splitting for optimal performance:
 * 1. Lazy Loading: Each route component is loaded only when needed
 * 2. Code Splitting: Creates separate chunks for each route (see vite.config.ts)
 * 
 * WHY: Without code splitting, all components load upfront, making initial
 * page load slow. With code splitting, only the current route's component
 * loads, dramatically reducing initial bundle size and improving load time.
 * 
 * Example: If user visits /specs, only SpecsPage.vue loads, not all 15+ pages.
 * This can reduce initial bundle from 2MB to 500KB, improving load time by 70%.
 * 
 * NOTE: Using simple dynamic imports for reliability. Complex async component
 * options can sometimes fail silently, causing blank pages.
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LandingPage from '@/views/LandingPage.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    // If there's a saved position (e.g., from browser back button), use it
    if (savedPosition) {
      return savedPosition
    }
    // Otherwise, scroll to top
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: '/',
      name: 'Landing',
      // Landing page loaded synchronously so initial visit never shows a blank page
      component: LandingPage,
      meta: { requiresAuth: false },
    },
    {
      path: '/login',
      name: 'Login',
      // Login page loaded immediately (no code splitting)
      // WHY: Login is the entry point, so it should load fast
      component: () => import('@/views/LoginPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/verify-email',
      name: 'VerifyEmail',
      // OTP verification page - public, no auth required
      component: () => import('@/views/VerifyEmailPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      // Password reset page - public, no auth required
      component: () => import('@/views/ResetPasswordPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/about',
      name: 'About',
      // About page - public, no auth required
      component: () => import('@/views/AboutPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/privacy',
      name: 'Privacy',
      // Privacy policy page - public, no auth required
      component: () => import('@/views/PrivacyPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/terms',
      name: 'Terms',
      // Terms of service page - public, no auth required
      component: () => import('@/views/TermsPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/security',
      name: 'Security',
      // Security page - public, no auth required
      component: () => import('@/views/SecurityPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/documentation',
      name: 'Documentation',
      // Documentation page - public, no auth required
      component: () => import('@/views/DocumentationPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      // Code split: Creates "dashboard" chunk
      // WHY: Dashboard is large, so splitting reduces initial bundle
      // Using simple dynamic import for reliability
      component: () => import('@/views/DashboardPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/projects',
      name: 'Projects',
      // Code split: Creates "projects" chunk
      component: () => import('@/views/ProjectsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/projects/:id',
      name: 'ProjectDetails',
      // Code split: Creates "project-details" chunk
      // WHY: Detail pages are often large with many components
      component: () => import('@/views/ProjectDetailsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/specs',
      name: 'Specs',
      // Code split: Creates "specs" chunk
      component: () => import('@/views/SpecsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/specs/:id',
      name: 'SpecDetails',
      // Code split: Creates "spec-details" chunk
      component: () => import('@/views/SpecDetailsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/checklists',
      name: 'Checklists',
      // Code split: Creates "checklists" chunk
      component: () => import('@/views/ChecklistsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/speclint',
      name: 'SpecLint',
      // Code split: Creates "speclint" chunk
      component: () => import('@/views/SpecLintPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/vendors',
      name: 'Vendors',
      // Code split: Creates "vendors" chunk
      component: () => import('@/views/VendorsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/companies',
      name: 'Companies',
      // Code split: Creates "companies" chunk
      component: () => import('@/views/CompaniesPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/companies/:id',
      name: 'CompanyDetails',
      // Code split: Creates "company-details" chunk
      component: () => import('@/views/CompanyDetailsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'Settings',
      // Code split: Creates "settings" chunk
      component: () => import('@/views/SettingsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      // Code split: Creates "profile" chunk
      component: () => import('@/views/ProfilePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings/branding',
      name: 'BrandingSettings',
      // Code split: Creates "branding-settings" chunk
      component: () => import('@/views/BrandingSettingsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/usage',
      name: 'SystemUsage',
      component: () => import('@/views/SystemUsagePage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    // Common mistaken URL (no /dashboard prefix in this app) — was a blank black screen in prod
    {
      path: '/dashboard/admin/usage',
      redirect: '/admin/usage',
    },
  ],
})

/**
 * Navigation guard - simplified to prevent blocking
 * 
 * WHY: This guard checks authentication before allowing access to protected routes.
 * It's simplified to avoid blocking navigation, which could cause blank pages.
 */
router.beforeEach(async (to, from, next) => {
  try {
    // Collapse duplicate slashes (e.g. tapeoutops.com//dashboard/... in the bar → path //dashboard/...)
    // so mistaken URLs still match redirects and routes instead of an empty router-view (black screen).
    const collapsed = to.path.replace(/\/+/g, '/')
    if (collapsed !== to.path) {
      next({ path: collapsed, query: to.query, hash: to.hash, replace: true })
      return
    }

    const authStore = useAuthStore()
    
    // Always allow access to public pages (no checks)
    // WHY: These pages must always be accessible, even if user is logged out
    const publicPaths = ['/login', '/verify-email', '/reset-password', '/', '/about', '/privacy', '/terms', '/security', '/documentation']
    if (publicPaths.includes(to.path)) {
      next()
      return
    }
    
    // Check authentication for protected routes
    // WHY: Protected routes require valid authentication token
    if (to.meta.requiresAuth) {
      // Check if we have a valid token (even if user data isn't loaded yet)
      const hasValidToken = authStore.token && 
                           authStore.token !== 'undefined' && 
                           authStore.token !== 'null' &&
                           authStore.token.trim() !== ''
      
      if (!hasValidToken) {
        next('/login')
        return
      }

      // Admin-only routes: require user to be loaded and admin/super-admin (or allow in dev for testing)
      if (to.meta.requiresAdmin) {
        if (!authStore.user) {
          const ok = await authStore.checkAuth()
          if (!ok) {
            next('/login')
            return
          }
        }
        const isDev = import.meta.env.DEV
        if (!authStore.isAdmin && !isDev) {
          next('/dashboard')
          return
        }
      }
      
      next()
      return
    }
    
    // Allow navigation for routes without auth requirement
    next()
  } catch (error) {
    // Always allow navigation to proceed, even on error
    // WHY: Errors in navigation guard shouldn't block the app
    console.error('🚨 Router: Critical error in navigation guard:', error)
    next()
  }
})

export default router
