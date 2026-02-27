<template>
  <aside class="w-60 bg-white border-r border-gray-100 flex flex-col h-full">
    <div class="flex items-center gap-3 px-4 py-5">
      <img
        src="/src/assets/LogoEnjoy.png"
        alt="Logo ENJOY CONSOLE"
        class="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12  object-cover"
      />
      <div>
        <p class="text-md font-bold text-gray-800">ENJOY CONSOLE</p>
        <p class="text-xs text-gray-400">{{ roleName }}</p>
      </div>
    </div>

    <nav class="flex-1 px-3 py-4 flex flex-col gap-1">
      <RouterLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal text-gray-800 hover:bg-purple-50 hover:text-purple-600 transition-colors"
        :class="{ 'bg-purple-50 text-purple-600 font-semibold': isActive(item.path) }"
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
import { useAuthStore } from '../../composables/useAuth'
import { LayoutDashboard, Building2, Receipt, Shield } from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()

// user.role.roleName selon la réponse backend
const roleName = computed(() => authStore.user?.role?.roleName ?? 'Super Admin')

const menuItems = [
  { label: 'Tableau de bord', path: '/',         icon: LayoutDashboard },
  { label: 'Parc Clients',    path: '/clients',  icon: Building2 },
  { label: 'Facturation',     path: '/billing',  icon: Receipt },
  { label: 'Sécurité',        path: '/security', icon: Shield },
]

// Gestion manuelle de l'actif pour éviter le bug de "/" qui matche tout
const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>