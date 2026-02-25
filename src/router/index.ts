import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../views/layouts/AdminLayout.vue'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/auth/Login.vue'
import Clients from '../views/clients/Clients.vue'
import ClientDetail from '../views/clients/ClientDetail.vue'
import Support from '../views/support/Support.vue'
import Billing from '../views/billing/Billing.vue'
import Security from '../views/security/Security.vue'
import { useAuth } from '../composables/useAuth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: Login, meta: { public: true } },
    {
      path: '/',
      component: AdminLayout,
      children: [
        { path: '', name: 'dashboard', component: Dashboard, meta: { roles: ['super-admin', 'support', 'commercial'] } },
        { path: 'clients', name: 'clients', component: Clients, meta: { roles: ['super-admin', 'support', 'commercial'] } },
        { path: 'clients/:id', name: 'client-detail', component: ClientDetail, meta: { roles: ['super-admin', 'support', 'commercial'] } },
        { path: 'support', name: 'support', component: Support, meta: { roles: ['super-admin', 'support'] } },
        { path: 'billing', name: 'billing', component: Billing, meta: { roles: ['super-admin', 'commercial'] } },
        { path: 'security', name: 'security', component: Security, meta: { roles: ['super-admin'] } },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const { state, restore, hasRole } = useAuth()
  if (!state.isAuthenticated) restore()
  if (to.meta.public) return true
  if (!state.isAuthenticated) return { name: 'login' }
  if (to.meta.roles && !hasRole(to.meta.roles as any)) return { name: 'dashboard' }
  return true
})

export { router }
export default router
