<template>
  <RouterView />
</template>
<script setup lang="ts">
import { provide } from 'vue'
import { useDark } from '@vueuse/core'

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  storageKey: 'enjoy-theme',
})

provide('enjoy-isDark', isDark)
</script>
