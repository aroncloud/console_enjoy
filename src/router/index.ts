import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../components/Layout/AdminLayout.vue'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/auth/Login.vue'
import Clients from '../views/clients/Clients.vue'
import ClientDetail from '../views/clients/ClientDetail.vue'
import HotelSubscriptions from '../views/clients/HotelSubscriptions.vue'
import Support from '../views/support/Support.vue'
import Billing from '../views/billing/Billing.vue'
import Security from '../views/security/Security.vue'
import Product from '../views/products/Product.vue'
import ProductDetail from '../views/products/ProductDetail.vue'
import Users from '../views/users/Users.vue'
import UserProfile from '../views/users/UserProfile.vue'
import Profile from '../views/profile/Profile.vue'
import HistoryView from '../views/history/HistoryView.vue'
import Demo from '../views/demo/DemoView.vue'
import { useAuthStore } from '../composables/useAuth'

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
        { path: '',        name: 'dashboard', component: Dashboard },
        { path: 'clients', name: 'clients',   component: Clients },

    
        {
          path: 'clients/:id',
          
          children: [
            {
              path: '',
              name: 'client-detail',
              component: ClientDetail,
            },
            {
              path: 'subscriptions',
              name: 'client-subscriptions',
              component: HotelSubscriptions,
            },
          ],
        },
     

        { path: 'support',  name: 'support',  component: Support },
        { path: 'billing',  name: 'billing',  component: Billing },
        { path: 'security', name: 'security', component: Security },
        { path: 'products', name: 'products', component: Product },
        { path: 'products/:id', name: 'product-detail', component: ProductDetail },
        { path: 'users',    name: 'users',    component: Users },
        {
          path: '/users/:id',
          name: 'user-profile',
          component: UserProfile,
        },
        { path: 'profile',  name: 'profile',  component: Profile },
        { path: 'demo',  name: 'demo',  component: Demo },
        {
          path: '/history',
          name: 'history',
          component: HistoryView,
        }
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/login',
    },
    
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.public) {
    if (authStore.isAuthenticated && to.name === 'login') return { name: 'dashboard' }
    return true
  }

  if (!authStore.isAuthenticated) return { name: 'login' }

  return true
})

export { router }
export default router
