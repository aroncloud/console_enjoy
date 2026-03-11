<template>
  <RouterView />
</template>
<script setup lang="ts">
import { watchEffect } from 'vue'
import { useThemeStore } from './composables/theme'

const theme = useThemeStore()

watchEffect(() => {
  document.documentElement.classList.toggle('dark', theme.isDark)
})
</script>
