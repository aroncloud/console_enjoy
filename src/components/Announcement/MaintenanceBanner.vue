<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { X, TriangleAlert } from 'lucide-vue-next'
import { useAnnouncementStore } from '../../composables/announcement'

const announcementStore = useAnnouncementStore()
const { banner } = storeToRefs(announcementStore)
const { t, locale } = useI18n()

const visible = computed(() => !!banner.value && banner.value.isActive)

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '—'
  const loc = locale.value === 'fr' ? 'fr-FR' : 'en-US'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(loc, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const close = () => {
  if (banner.value) announcementStore.dismissBanner(banner.value.id)
}
</script>

<template>
  <div v-if="visible" class="px-6 pt-4">
    <div class="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-900/20 px-4 py-3">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3 min-w-0">
          <div class="mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
            <TriangleAlert :size="18" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                {{ t('announcements.types.maintenance') }}
              </span>
              <span class="text-xs text-amber-900/70 dark:text-amber-200/80">
                {{ t('announcements.window', { start: formatDateTime(banner?.startsAt), end: formatDateTime(banner?.endsAt) }) }}
              </span>
            </div>
            <p class="mt-1 text-sm font-semibold text-amber-950 dark:text-amber-100 truncate">
              {{ banner?.title }}
            </p>
            <p class="mt-1 text-sm text-amber-950/80 dark:text-amber-100/80 whitespace-pre-line">
              {{ banner?.content }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="shrink-0 p-2 rounded-lg text-amber-900/70 dark:text-amber-200/80 hover:bg-amber-100 dark:hover:bg-amber-900/30"
          @click="close"
        >
          <X :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

