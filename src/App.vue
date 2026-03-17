<template>
  <RouterView />
  <MaintenanceOverlay />
</template>
<script setup lang="ts">
import { watchEffect } from 'vue'
import { useThemeStore } from './composables/theme'
import MaintenanceOverlay from './components/Announcement/MaintenanceOverlay.vue'

const theme = useThemeStore()

watchEffect(() => {
  document.documentElement.classList.toggle('dark', theme.isDark)
})
</script>
