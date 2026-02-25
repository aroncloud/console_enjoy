<template>
  <header class="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
    <!-- mobile hamburger -->
    <button
      class="md:hidden p-2 mr-2"
      @click="$emit('toggle-sidebar')"
    >
      <Menu class="w-6 h-6 text-gray-600" />
    </button>

    <!-- Recherche -->
    <div class="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 max-w-full md:w-96">
      <Search class="w-4 h-4 text-gray-400" />
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un hôtel, une facture ou un ticket..."
        class="bg-transparent outline-none text-sm text-gray-600 w-full"
      />
    </div>

    <!-- Droite -->
    <div class="flex items-center gap-4 ">
        <div class="border-r border-gray-200 pr-4">
        <button class="relative p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer">
            <Bell class="w-5 h-5 text-gray-500" />
            <span class="absolute top-1 right-1 w-1 h-1 bg-red-500 rounded-full"></span>
        </button>
        </div>
      <!-- Avatar + Dropdown -->
      <div class="relative" ref="dropdownRef">
        <div
          class="flex items-center gap-3 cursor-pointer"
          @click="toggleDropdown"
        >
          <div class="text-right">
            <p class="text-sm font-semibold text-gray-800">{{ role || 'Invité' }}</p>
            <p class="text-xs text-green-500">En ligne</p>
          </div>
          <div class="w-9 h-9 bg-amber-200 rounded-full flex items-center justify-center font-bold text-sm text-amber-700">
            {{ initials }}
          </div>
        </div>

        <!-- Dropdown Menu -->
        <div
          v-if="isOpen"
          class="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden"
        >
          <!-- Infos utilisateur -->
          <div class="px-4 py-3 border-b border-gray-100">
            <p class="text-sm font-semibold text-gray-800">Jean Administrateur</p>

          </div>

          <!-- Actions -->
          <div class="py-1">
            <button
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <User class="w-4 h-4" />
              Mon profil
            </button>
            <button
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Settings class="w-4 h-4" />
              Paramètres
            </button>
          </div>

          <!-- Déconnexion -->
          <div class="border-t border-gray-100 py-1">
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut class="w-4 h-4" />
              Se déconnecter
            </button>
          </div>
        </div>
      </div>

    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { Search, Bell, LogOut, User, Settings, Menu } from 'lucide-vue-next'
import { useAuth } from '../../composables/useAuth'

const search = ref<string>('')
const isOpen = ref<boolean>(false)
const dropdownRef = ref<HTMLElement | null>(null)

const { state, logout: doLogout } = useAuth()
const role = computed(() => state.role)


const initials = computed(() => {
  if (!role.value) return 'I'
  return role.value
    .split(' ')
    .map((word: string) => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

onClickOutside(dropdownRef, () => {
  isOpen.value = false
})

const handleLogout = () => {
  isOpen.value = false
  doLogout()
}
</script>