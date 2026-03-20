<template>
  <aside class="w-60 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col h-full">
    <div class="flex items-center gap-3 px-4 py-5">
      <img
        src="/src/assets/LogoEnjoy.png"
        alt="Logo ENJOY CONSOLE"
        class="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12  object-cover"
      />
      <div>
        <p class="text-md font-bold text-gray-800 dark:text-white">ENJOY CONSOLE</p>
        <p class="text-xs text-gray-400 dark:text-slate-400">{{ roleName }}</p>
      </div>
    </div>

    <nav class="flex-1 px-3 py-4 flex flex-col gap-1">
      <RouterLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        @click="emit('close')"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal text-gray-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
        :class="{ 'bg-purple-50 dark:bg-slate-800 text-purple-600 dark:text-purple-300 font-semibold': isActive(item.path) }"
      >
        <component :is="item.icon" class="w-5 h-5" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../composables/useAuth'
import { usePermissionsStore } from '../../composables/usePermission'
import { LayoutDashboard, Building2, Receipt, Shield, Package, Users as UsersIcon, MonitorPlay, Megaphone } from 'lucide-vue-next'

const route            = useRoute()
const authStore        = useAuthStore()
const permissionsStore = usePermissionsStore()
const { t }            = useI18n()
const emit             = defineEmits(['close'])

const roleName = computed(() => authStore.user?.role?.roleName ?? t('roles.superAdmin'))

const allMenuItems = computed(() => [
  { label: t('nav.dashboard'),     path: '/',             icon: LayoutDashboard, permission: 'console_dashboard_view'     },
  { label: t('nav.clients'),       path: '/clients',      icon: Building2,       permission: 'console_clients_view'       },
  { label: t('nav.products'),      path: '/products',     icon: Package,         permission: 'console_products_view'      },
  { label: t('nav.billing'),       path: '/billing',      icon: Receipt,         permission: 'console_billing_view'       },
  { label: t('nav.demos'),         path: '/demo',         icon: MonitorPlay,     permission: 'console_demos_view'         },
  { label: t('nav.announcements'), path: '/announcements',icon: Megaphone,       permission: 'console_announcements_view' },
  { label: t('nav.security'),      path: '/security',     icon: Shield,          permission: 'console_security_view'      },
  { label: t('nav.users'),         path: '/users',        icon: UsersIcon,       permission: 'console_users_view'         },
])


const menuItems = computed(() =>
  allMenuItems.value.filter(item => permissionsStore.can(item.permission))
)

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>