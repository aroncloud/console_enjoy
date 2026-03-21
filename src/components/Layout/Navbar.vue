<template>
  <header class="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
    <button class="md:hidden p-2 " @click="$emit('toggle-sidebar')">
      <Menu class="w-6 h-6 text-gray-600 dark:text-slate-300" />
    </button>

    <div class="hidden md:block" />

    <div class="flex items-center gap-2 sm:gap-4 min-w-0">
      <div class="border-r border-gray-200 pr-2 sm:pr-4">
        <button class="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer">
          <Bell class="w-5 h-5 text-gray-500 dark:text-slate-300" />
          <span class="absolute top-1 right-1 w-1 h-1 bg-red-500 rounded-full"></span>
        </button>
      </div>

       <ButtonLanguage />

    <button
        type="button"
        @click="toggleTheme"
        class="hidden md:flex relative h-8 w-16 items-center rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-1 transition-colors cursor-pointer"
        :aria-label="t('common.toggleTheme')"
      >
        <span
          class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow transition-transform"
          :class="isDark ? 'translate-x-7' : 'translate-x-0'"
        >
          <Moon v-if="isDark" class="w-4 h-4 text-slate-300" />
          <Sun v-else class="w-4 h-4 text-amber-500" />
        </span>
    </button>

      <div class="relative" ref="dropdownRef">
        <div class="flex items-center gap-3 cursor-pointer min-w-0" @click="toggleDropdown">
          <div class="hidden sm:block text-right min-w-0">
            <p class="text-sm font-semibold text-gray-800 dark:text-white max-w-32 sm:max-w-none truncate">{{ displayName }}</p>
            <p class="text-xs text-green-500">{{ t('nav.online') }}</p>
          </div>
          <div class="w-9 h-9 bg-amber-200 rounded-full flex items-center justify-center font-bold text-sm text-amber-700">
            {{ initials }}
          </div>
        </div>

        <div
          v-if="isOpen"
          class="absolute right-0 top-12 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 z-50 overflow-hidden"
        >
          <div class="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
            <p class="text-sm font-semibold text-gray-800 dark:text-white truncate">{{ displayName }}</p>
            <p class="text-xs text-gray-400 dark:text-slate-400 truncate">{{ userEmail }}</p>
            <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
              {{ roleName }}
            </span>
          </div>

          <div class="py-1 md:hidden border-b border-gray-100 dark:border-slate-800">
            <button
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              @click="toggleTheme"
            >
              <Moon v-if="isDark" class="w-4 h-4" />
              <Sun v-else class="w-4 h-4 text-amber-500" />
              {{ isDark ? 'Mode clair' : 'Mode sombre' }}
            </button>
          </div>

          <div class="py-1">
            <button
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              @click="goProfile"
            >
              <User class="w-4 h-4" />
              {{ t('nav.myProfile') }}
            </button>
          </div>

          <div class="border-t border-gray-100 dark:border-slate-800 py-1">
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
            >
              <LogOut class="w-4 h-4" />
              {{ t('nav.logout') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import {  Bell, LogOut, User, Menu, Sun, Moon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../composables/useAuth'
import { useThemeStore } from '../../composables/theme'
import { signOut } from '../../servicesAPI/auth'
import ButtonLanguage from '../Button/ButtonLanguage.vue'

defineEmits(['toggle-sidebar'])

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

// const search = ref('')
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const theme = useThemeStore()
const isDark = computed(() => theme.isDark)

// Champs exacts selon la réponse backend
const displayName = computed(() => authStore.user?.fullName ?? authStore.user?.username ?? t('nav.defaultUserName'))
const userEmail   = computed(() => authStore.user?.email ?? '')
const roleName    = computed(() => authStore.user?.role?.roleName ?? t('roles.superAdmin'))

const initials = computed(() =>
  displayName.value
    .trim()
    .split(/\s+/)
    .filter((w: string) => w.length > 0)
    .map((w: string) => (w[0]?.toUpperCase() ?? ''))
    .join('')
    .slice(0, 2) || 'A'
)

const toggleDropdown = () => { isOpen.value = !isOpen.value }
onClickOutside(dropdownRef, () => { isOpen.value = false })

const toggleTheme = () => { theme.toggle() }

const goProfile = () => {
  isOpen.value = false
  router.push({ name: 'profile' })
}

// const handleLogout = () => {
//   isOpen.value = false
//   authStore.logout()
//   router.push({ name: 'login' })
// }

const handleLogout = async() =>{
  try{
      isOpen.value = false
     await signOut();
  }catch(e:any){
    console.error(e)
  }
}


</script>
