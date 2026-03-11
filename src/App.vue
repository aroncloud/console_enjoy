<template>
  <RouterView />
</template>
<script setup lang="ts">
import { useDark } from '@vueuse/core'

useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  storageKey: 'enjoy-theme',
})
</script>
