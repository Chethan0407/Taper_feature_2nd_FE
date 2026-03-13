import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
    { path: '/', name: 'Dashboard', component: () => import('@/views/SystemUsagePage.vue'), meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  if (to.meta.public) {
    if (authStore.isAuthenticated) return next('/')
    return next()
  }
  if (to.meta.requiresAuth && !authStore.isAuthenticated) return next('/login')
  next()
})

export default router
