<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { TriangleAlert, Info, RefreshCcw } from 'lucide-vue-next'
import { useAnnouncementStore } from '../../composables/announcement'

const announcementStore = useAnnouncementStore()
const { active } = storeToRefs(announcementStore)
const { t, locale } = useI18n()

const visible = computed(() => !!active.value && active.value.isActive)

const icon = computed(() => {
  if (!active.value) return Info
  if (active.value.type === 'maintenance') return TriangleAlert
  if (active.value.type === 'update') return RefreshCcw
  return Info
})

const badgeClasses = computed(() => {
  if (!active.value) return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
  if (active.value.type === 'maintenance') return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
  if (active.value.type === 'update') return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
  return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
})

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '—'
  const loc = locale.value === 'fr' ? 'fr-FR' : 'en-US'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(loc, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const reload = () => {
  window.location.reload()
}
</script>

<template>
  <div v-if="visible" class="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
      <div class="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            <component :is="icon" :size="18" />
          </div>
          <div class="min-w-0">
            <p class="text-base font-bold text-slate-900 dark:text-white truncate">{{ active?.title }}</p>
            <div class="mt-0.5 flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="badgeClasses">
                {{ t(`announcements.types.${active?.type}`) }}
              </span>
              <span class="text-xs text-slate-500 dark:text-slate-400">
                {{ t('announcements.window', { start: formatDateTime(active?.startsAt), end: formatDateTime(active?.endsAt) }) }}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="px-3 py-2 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          @click="reload"
        >
          {{ t('common.retry') }}
        </button>
      </div>
      <div class="px-4 sm:px-6 py-5">
        <p class="text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">
          {{ active?.content }}
        </p>
      </div>
    </div>
  </div>
</template>
