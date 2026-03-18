<template>
  <div class="relative" ref="langDropdownRef">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer text-sm font-medium text-gray-600 dark:text-slate-300"
    >
      <img :src="currentLang?.flag" class="w-5 h-4 object-cover rounded-sm" />
      <ChevronDown class="w-3 h-3" />
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 top-12 w-40 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 z-50 overflow-hidden"
    >
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="switchLang(lang.code)"
        :class="[
          'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer',
          locale === lang.code
            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 font-medium'
            : 'text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
        ]"
      >
        <img :src="lang.flag" class="w-5 h-4 object-cover rounded-sm" />
        {{ lang.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onClickOutside } from '@vueuse/core'
import { ChevronDown } from 'lucide-vue-next'
import FR from '../../assets/Flag_of_France.png'
import GB from '../../assets/united-kingdom_551844.png'

const { locale } = useI18n()

const languages = [
  { code: 'fr', label: 'Français', flag: FR },
  { code: 'en', label: 'English',  flag: GB },
]

const isOpen       = ref(false)
const langDropdownRef = ref<HTMLElement | null>(null)

const currentLang = computed(() => languages.find(l => l.code === locale.value) ?? languages[0])

const switchLang = (code: string) => {
  locale.value = code
  localStorage.setItem('lang', code)
  isOpen.value = false
}

onClickOutside(langDropdownRef, () => { isOpen.value = false })
</script>