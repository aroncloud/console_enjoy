
<template>
  <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col h-full">

    <!-- Header -->
    <div class="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
          <History class="w-4 h-4 text-purple-600 dark:text-purple-300" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ title }}</h3>
          <p v-if="subtitle" class="text-xs text-slate-400">{{ subtitle }}</p>
        </div>
      </div>
      <slot name="header-actions" />
    </div>

    <!-- Filtres -->
   <div v-if="showFilters" class="flex flex-col md:flex-row items-start md:items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-slate-800">
  <Input
    v-model="search"
    lb="Recherche"
    placeholder="Rechercher..."
    class="flex-1 w-full"
  />
  <div class="w-full md:w-64">
    <Select
      v-model="filterAction"
      lb="Action"
      :options="availableActions"
      :default-value="'Action'"
    />
  </div>
</div>

    <!-- Skeleton -->
    <div v-if="loading" class="p-5 flex flex-col animate-pulse gap-0">
      <div v-for="i in 4" :key="i" class="relative flex gap-4">
        <div v-if="i < 4" class="absolute left-4 top-10 -bottom-6 w-0.5 bg-gray-100 dark:bg-slate-800 z-0" />
        <div class="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full shrink-0 z-10" />
        <div class="pb-6 flex flex-col gap-2 pt-1">
          <div class="h-3 w-48 bg-gray-200 dark:bg-slate-700 rounded" />
          <div class="h-2 w-20 bg-gray-100 dark:bg-slate-800 rounded" />
        </div>
      </div>
    </div>

    <!-- Liste -->
    <div v-else class="flex-1 overflow-y-auto p-5">
      <div v-if="filteredLogs.length > 0" class="flex flex-col">
        <div
          v-for="(item, index) in filteredLogs"
          :key="item.id"
          class="relative flex gap-4"
        >
          <div
            v-if="index < filteredLogs.length - 1"
            class="absolute left-4 top-10 -bottom-6 w-0.5 bg-gray-100 dark:bg-slate-800 z-0"
          />
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10"
            :class="getIconConfig(item.action).iconBg"
          >
            <component :is="getIconConfig(item.action).icon" class="w-4 h-4" :class="getIconConfig(item.action).iconColor" />
          </div>
          <div class="pb-6 flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ item.description }}</p>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <span
                class="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                :class="getActionBadge(item.action).class"
              >
                {{ getActionBadge(item.action).label }}
              </span>
              <span v-if="item.username" class="text-[10px] text-slate-400 dark:text-slate-500">
                par {{ item.username }}
              </span>
              <span v-else  class="text-[10px] text-slate-400 dark:text-slate-500">
                par {{ item.user?.fullName }}
              </span>
              <span v-if="showHotelName && item.hotelName" class="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                · {{ item.hotelName }}
              </span>
              <span v-else class="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                · {{ item.hotel?.hotelName }}
              </span>
            </div>
            <p class="text-[10px] text-gray-300 dark:text-slate-500 mt-1">{{ formatDate(item.createdAt) ?? '—' }}</p>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-10 text-slate-400">
        <History class="w-10 h-10 opacity-20 mb-2" />
        <p class="text-sm font-semibold">Aucune activité</p>
        <p class="text-xs mt-1">Aucun événement trouvé</p>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="meta && meta.lastPage > 1"
      class="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-slate-800"
    >
      <span class="text-xs text-slate-400">Page {{ meta.currentPage }} / {{ meta.lastPage }}</span>
      <div class="flex items-center gap-1">
        <button
          :disabled="meta.currentPage === 1"
          @click="$emit('page-change', meta.currentPage - 1)"
          class="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          ←
        </button>
        <button
          :disabled="meta.currentPage === meta.lastPage"
          @click="$emit('page-change', meta.currentPage + 1)"
          class="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          →
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { History, Smartphone, RefreshCcw, UserPlus, Bell, Trash2, PenLine } from 'lucide-vue-next'
import Input from '../FormElements/Input.vue'
import Select from '../FormElements/Select.vue'
import { formatDate } from '../Utilities/function'


export interface ActivityLogItem {
  id: number
  action: string
  description: string
  createdAt?: string
  username?: string
  hotelName?: string
  entityType?: string
  entityId?: string
  user?:any
  hotel?:any
}

const props = withDefaults(defineProps<{
  logs: ActivityLogItem[]
  loading?: boolean
  title?: string
  subtitle?: string
  showFilters?: boolean
  showHotelName?: boolean
  meta?: any
}>(), {
  logs: () => [],
  loading: false,
  title: 'Historique',
  showFilters: false,
  showHotelName: false,
})

defineEmits<{
  'page-change': [page: number]
  'filter-change': [filters: { action: string; date: string; search: string }]
}>()

const search = ref('')
const filterAction = ref('')

const availableActions = [
  { label: 'Création',     value: 'hotel.create' },
  { label: 'Abonnement',   value: 'subscription.create' },
  { label: 'Mise à jour',  value: 'subscription.update' },
  { label: 'Suppression',  value: 'subscription.delete' },
]

const filteredLogs = computed(() => {
  return props.logs.filter((log) => {
    const matchSearch = !search.value || log.description.toLowerCase().includes(search.value.toLowerCase())
    const matchAction = !filterAction.value || log.action === filterAction.value
    return matchSearch && matchAction
  })
})

const getIconConfig = (action: string) => {
  switch (action) {
    case 'subscription.create': return { icon: Smartphone,   iconBg: 'bg-blue-100 dark:bg-blue-900/30',    iconColor: 'text-blue-500' }
    case 'subscription.update': return { icon: RefreshCcw,   iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600' }
    case 'subscription.delete': return { icon: Trash2,       iconBg: 'bg-red-100 dark:bg-red-900/30',      iconColor: 'text-red-500' }
    case 'subscription.extend': return { icon: Smartphone,   iconBg: 'bg-purple-100 dark:bg-purple-900/30',  iconColor: 'text-purple-500' }
    case 'subscription.toggleStatus': return { icon: RefreshCcw,   iconBg: 'bg-pink-100 dark:bg-pink-900/30',  iconColor: 'text-pink-500' }
    case 'hotel.create':        return { icon: UserPlus,     iconBg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-500' }
    case 'hotel.update':        return { icon: PenLine,      iconBg: 'bg-amber-100 dark:bg-amber-900/30',  iconColor: 'text-amber-600' }
    case 'user.create':         return { icon: UserPlus,     iconBg: 'bg-blue-100 dark:bg-blue-900/30',    iconColor: 'text-blue-500' }
    default:                    return { icon: Bell,         iconBg: 'bg-gray-100 dark:bg-slate-800',      iconColor: 'text-gray-500' }
  }
}

const getActionBadge = (action: string) => {
  if (action.endsWith('.create')) return { label: 'Création',    class: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' }
  if (action.endsWith('.extend')) return { label: 'extension',    class: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' }
  if (action.endsWith('.update')) return { label: 'Mise à jour', class: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300' }
  if (action.endsWith('.toggleStatus')) return { label: 'Mise à jour', class: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300' }
  if (action.endsWith('.delete')) return { label: 'Suppression', class: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-300' }
  return { label: action, class: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300' }
}
</script>