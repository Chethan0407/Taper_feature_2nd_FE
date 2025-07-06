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
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/SettingsPage.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router 