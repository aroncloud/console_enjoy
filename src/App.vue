<template>
  <RouterView />
  <MaintenanceOverlay />
</template>

<script setup lang="ts">
import { watchEffect, onMounted } from 'vue'
import { useThemeStore } from './composables/theme'
import { useAuthStore } from './composables/useAuth'
import { usePermissionsStore } from './composables/usePermission'
import MaintenanceOverlay from './components/Announcement/MaintenanceOverlay.vue'

const theme            = useThemeStore()
const authStore        = useAuthStore()
const permissionsStore = usePermissionsStore()

watchEffect(() => {
  document.documentElement.classList.toggle('dark', theme.isDark)
})

onMounted(() => {
  if (authStore.isAuthenticated && permissionsStore.permissions.length === 0) {
    permissionsStore.init(authStore.user?.role?.permissions ?? [])
  }
})
</script>