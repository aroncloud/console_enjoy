<!-- src/components/dashboard/RecentActivations.vue -->
<template>
  <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex flex-col gap-4 h-full">

    <!-- Skeleton -->
    <template v-if="loading">
      <div class="flex flex-col animate-pulse">
        <div v-for="i in 4" :key="i" class="relative flex gap-4">
          <div
            v-if="i < 4"
            class="absolute left-4 top-10 bottom-[-1.5rem] w-[2px] bg-gray-100 dark:bg-slate-800 z-0"
          />
          <div class="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full shrink-0 z-10" />
          <div class="pb-6 flex flex-col gap-2 pt-1">
            <div class="h-3 w-48 bg-gray-200 dark:bg-slate-700 rounded" />
            <div class="h-2 w-20 bg-gray-100 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>
      <div class="h-8 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse" />
    </template>

    <!-- Contenu réel -->
    <template v-else>
      <div class="flex flex-col">
        <div
          v-for="(item, index) in enrichedActivations"
          :key="item.id"
          class="relative flex gap-4"
        >
          <div
            v-if="index < enrichedActivations.length - 1"
            class="absolute left-4 top-10 bottom-[-1.5rem] w-[2px] bg-gray-100 dark:bg-slate-800 z-0"
          />
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10"
            :class="item.iconBg"
          >
            <component :is="item.icon" class="w-4 h-4" :class="item.iconColor" />
          </div>
          <div class="pb-6">
            <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ item.description }}</p>
            <p class="text-[10px] text-gray-300 dark:text-slate-400 mt-2 font-medium">{{ item.time ?? '—' }}</p>
          </div>
        </div>

        <p v-if="enrichedActivations.length === 0" class="text-sm text-gray-400 text-center py-4">
          {{ t('dashboard.recentActivations.empty') }}
        </p>
      </div>

      <button @click="handleHistory" class="w-full py-2 text-xs font-bold text-gray-400 dark:text-slate-400 hover:text-blue-500 uppercase tracking-widest bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors cursor-pointer">
        {{ t('dashboard.recentActivations.viewAllHistory') }}
      </button>
    </template>

  </div>


</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Smartphone, RefreshCcw, Cloud, UserPlus, Bell } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { RecentActivation } from '../../servicesAPI/dashboardService'
import router from '../../router';

const props = withDefaults(defineProps<{
  data: RecentActivation[]
  loading?: boolean
}>(), {
  data: () => [],
  loading: false,
})
const { t } = useI18n()

interface IconConfig {
  icon: unknown
  iconBg: string
  iconColor: string
}

const handleHistory = () =>{
  router.push({ name: 'history' })
}

const getIconConfig = (action: string): IconConfig => {
  switch (action) {
    case 'subscription.create':
      return { icon: Smartphone, iconBg: 'bg-blue-100', iconColor: 'text-blue-500' }
    case 'subscription.update':
      return { icon: RefreshCcw, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' }
    case 'hotel.create':
      return { icon: UserPlus, iconBg: 'bg-blue-100', iconColor: 'text-blue-500' }
    case 'subscription.delete':
      return { icon: Cloud, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' }
    default:
      return { icon: Bell, iconBg: 'bg-gray-100', iconColor: 'text-gray-500' }
  }
}

const enrichedActivations = computed(() =>
  props.data.map((item) => ({
    ...item,
    ...getIconConfig(item.action),
  }))
)

</script>
