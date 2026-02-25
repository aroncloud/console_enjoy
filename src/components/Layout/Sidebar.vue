
<template>
  <aside class="w-60 bg-white border-r border-gray-100 flex flex-col h-full">
    
    <!-- Logo -->
    <div class="flex items-center gap-3 px-4 py-5">
     <img
        src="/src/assets/logo.jpg"
        alt="Logo ENJOY CONSOLE"
        class="w-12 h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 rounded-full border border-purple-300  object-cover"
      />
     
      <div>
        <p class="text-md  font-bold text-gray-800">ENJOY CONSOLE</p>
        <p class="text-xs text-gray-400">{{ role || 'Invité'}}</p>
      </div>
    </div>

    <!-- Menu -->
    <nav class="flex-1 px-3 py-4 flex flex-col gap-1">
      <RouterLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal text-gray-800 hover:bg-purple-50 hover:text-purple-600 transition-colors"
        exact-active-class="bg-purple-50 text-purple-600 font-semibold"
      >
        <component :is="item.icon" class="w-5 h-5" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    

  </aside>
</template>

<script setup lang="ts">
import { useAuth } from '../../composables/useAuth'
import { computed } from 'vue'
import {
  LayoutDashboard,
  Building2,
  Headphones,
  Receipt,
  Shield,
  Settings,
} from 'lucide-vue-next'

interface MenuItem {
  label: string
  path: string
  icon: unknown
}

const menuItems: MenuItem[] = [
  { label: 'Tableau de bord', path: '/', icon: LayoutDashboard },
  { label: 'Parc Clients', path: '/clients', icon: Building2 },
  { label: 'Facturation', path: '/billing', icon: Receipt },
  { label: 'Sécurité', path: '/security', icon: Shield },
  { label: 'Paramètres', path: '/parametres', icon: Settings },
]

const { state } = useAuth()
const role = computed(() => state.role)

const initials = computed(() => {
  if (!role.value) return 'I'
  return role.value
    .split(' ')
    .map((word: string) => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
})

// optional logo path (you can change this or make it a prop)
const logoSrc = '/logo.png'
</script>