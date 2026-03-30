import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../components/Layout/AdminLayout.vue'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/auth/Login.vue'
import Clients from '../views/clients/Clients.vue'
import ClientDetail from '../views/clients/ClientDetail.vue'
import HotelSubscriptions from '../views/clients/HotelSubscriptions.vue'
import Support from '../views/support/Support.vue'
import Billing from '../views/billing/Billing.vue'
import BillingDetail from '../views/billing/BillingDetail.vue'
import Security from '../views/security/Security.vue'
import Product from '../views/products/Product.vue'
import ProductDetail from '../views/products/ProductDetail.vue'
import Users from '../views/users/Users.vue'
import UserProfile from '../views/users/UserProfile.vue'
import Profile from '../views/profile/Profile.vue'
import HistoryView from '../views/history/HistoryView.vue'
import Demo from '../views/demo/DemoView.vue'
import Announcements from '../views/announcements/Announcements.vue'
import { useAuthStore } from '../composables/useAuth'
import { usePermissionsStore } from '../composables/usePermission'
import Forbidden from '../views/errors/Forbidden.vue'
import DemoDetail from '../views/demo/DemoDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { public: true },
    },
    {
      path: '/',
      component: AdminLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: Dashboard,
          meta: { permission: 'console_dashboard_view' },
        },
        {
          path: 'clients',
          name: 'clients',
          component: Clients,
          meta: { permission: 'console_clients_view' },
        },
        {
          path: 'clients/:id',
          children: [
            {
              path: '',
              name: 'client-detail',
              component: ClientDetail,
              meta: { permission: 'console_clients_view' },
            },
            {
              path: 'subscriptions',
              name: 'client-subscriptions',
              component: HotelSubscriptions,
              meta: { permission: 'console_clients_view' },
            },
          ],
        },
        {
          path: 'support',
          name: 'support',
          component: Support,
        },
        {
          path: 'billing',
          name: 'billing',
          component: Billing,
          meta: { permission: 'console_billing_view' },
        },
        {
          path: 'billing/:id',
          name: 'billing-detail',
          component: BillingDetail,
          meta: { permission: 'console_billing_view' },
        },
        {
          path: 'security',
          name: 'security',
          component: Security,
          meta: { permission: 'console_security_view' },
        },
        {
          path: 'products',
          name: 'products',
          component: Product,
          meta: { permission: 'console_products_view' },
        },
        {
          path: 'products/:id',
          name: 'product-detail',
          component: ProductDetail,
          meta: { permission: 'console_products_view' },
        },
        {
          path: 'users',
          name: 'users',
          component: Users,
          meta: { permission: 'console_users_view' },
        },
        {
          path: '/users/:id',
          name: 'user-profile',
          component: UserProfile,
          meta: { permission: 'console_users_view' },
        },
        {
          path: 'profile',
          name: 'profile',
          component: Profile,
        },
        {
          path: 'demo',
          name: 'demo',
          component: Demo,
          meta: { permission: 'console_demos_view' },
        },
        {
          path: 'demo/:id',
          name: 'demo-detail',
          component: DemoDetail
        },
        {
          path: 'announcements',
          name: 'announcements',
          component: Announcements,
          meta: { permission: 'console_announcements_view' },
        },
        {
          path: '/history',
          name: 'history',
          component: HistoryView,
        },
      ],
    },
    {
      path: '/403',
      name: 'forbidden',
      component: Forbidden,
      meta: { public: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/login',
    },
  ],
})

// Mapping permission → path de la route
const permissionToPath: Record<string, any> = {
  console_dashboard_view:     '/',
  console_clients_view:       '/clients',
  console_products_view:      '/products',
  console_billing_view:       '/billing',
  console_demos_view:         '/demo',
  console_announcements_view: '/announcements',
  console_security_view:      '/security',
  console_users_view:         '/users',
}

// Retourne le path de la première route accessible
export const getFirstAccessiblePath = (permissionsStore: any): string => {
  const first = Object.keys(permissionToPath).find(p => permissionsStore.can(p))
  return first ? permissionToPath[first] : '/403'
}

router.beforeEach((to) => {
  const authStore        = useAuthStore()
  const permissionsStore = usePermissionsStore()

  if (authStore.isAuthenticated && permissionsStore.permissions.length === 0 && authStore.user?.role) {
    permissionsStore.init(authStore.user.role)
  }

  if (to.meta.public) {
    return true
  }

  if (!authStore.isAuthenticated || !authStore.user) return { name: 'login' }

  const requiredPermission = (to.meta as any)?.permission as string | undefined
  if (requiredPermission && !permissionsStore.can(requiredPermission)) {
    console.warn('[Router] Permission refusée:', requiredPermission)
    console.warn('[Router] Permissions dispo:', [...permissionsStore.permissionNames])
    if (to.name === 'dashboard') {
      const path = getFirstAccessiblePath(permissionsStore)
      console.log('[Router] Dashboard sans perm → redirect to:', path)
      return { path }
    }
    return { name: 'forbidden', query: { permission: requiredPermission } }
  }

  return true
})

export { router }
export default router
