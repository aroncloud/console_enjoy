<template>
  <div class="h-full">
    <BaseTable
      :columns="columns"
      :data="data.data"
      :sortable="false"
      :searchable="false"
      :loading="loading"
      :meta="data.meta"
      @page-change="handlePageChange"
    >
      <!-- Colonne Hôtel -->
      <template #cell-hotel="{ row }">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <Building2 class="w-4 h-4 text-gray-400 dark:text-slate-400" />
          </div>
          <span class="font-medium text-gray-700 dark:text-slate-200">{{ row.hotel }}</span>
        </div>
      </template>

      <!-- Colonne Produit -->
      <template #cell-product="{ value }">
      
        <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              :style="{ background: getColor(value.slug) + '16' }"
            >
              <component :is="getIconComponent(value.slug)" :size="16" :style="{ color: getColor(value.slug) }" />
            </div>
            <div class="min-w-0">
              <p class="font-bold text-sm text-slate-900 dark:text-white truncate">{{ value.module }}</p>
            </div>
          </div>
      </template>

      <!-- Colonne Date d'échéance -->
      <template #cell-dueDate="{ value }">
        <span class="text-gray-500 dark:text-slate-300 text-sm">{{ formatDate(value) }}</span>
      </template>

      <!-- Colonne Jours restants -->
      <template #cell-daysLeft="{ value }">
        <div class="flex items-center gap-2">
          <div class="w-16 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :class="getProgressColor(value)"
              :style="{ width: `${Math.min(100, (value / 30) * 100)}%` }"
            />
          </div>
          <span
            class="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
            :class="getBadgeClass(value)"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="getDotClass(value)" />
            {{ value }}j
          </span>
        </div>
      </template>

      <!-- Colonne Action -->
      <template #cell-action="{ row }">
         <router-link
          :to="`/clients/${row.hotelId}`"
          class="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 text-sm font-semibold transition-colors"
        >
          <ChevronRight class="w-4 h-4 text-gray-400 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
        </router-link>
      </template>

    </BaseTable>
  </div>
</template>

<script setup lang="ts">
import { type Component } from 'vue'
import BaseTable, { type Column } from '../Table/BaseTable.vue'

import {
   Building2, ChevronRight,
  Package,
  BedDouble, Utensils, ArrowLeftRight, Smartphone, BarChart2, Users
} from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  data: any
  loading?: boolean
 
}>(), {
  data: () => ({ data: [], meta: { total: 0, perPage: 5, currentPage: 1, lastPage: 1, firstPage: 1, firstPageUrl: null, lastPageUrl: null, nextPageUrl: null, previousPageUrl: null } }),
  loading: false,
})

const emit = defineEmits<{
  (e: 'page-change', page: number): void
}>()


const columns: Column[] = [
  { key: 'hotel',   label: 'Hôtel' },
  { key: 'product',  label: 'Produit' },
  { key: 'dueDate', label: "Date d'échéance" },
  { key: 'daysLeft', label: 'Jours restants' },
  { key: 'action',  label: 'Action', thClass: 'text-right', tdClass: 'text-right' },
]


const handlePageChange = (page: number) => {
  emit('page-change', page)
}

const formatDate = (date: string | null): string => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const getBadgeClass = (days: number): string => {
  if (days <= 10) return 'bg-red-50 text-red-600'
  if (days <= 20) return 'bg-orange-50 text-orange-500'
  return 'bg-emerald-50 text-emerald-600'
}

const getDotClass = (days: number): string => {
  if (days <= 10) return 'bg-red-500 animate-pulse'
  if (days <= 20) return 'bg-orange-400'
  return 'bg-emerald-500'
}

const getProgressColor = (days: number): string => {
  if (days <= 10) return 'bg-red-400'
  if (days <= 20) return 'bg-orange-400'
  return 'bg-emerald-400'
}



const slugIconComponents: Record<string, Component> = {
  'pms':             BedDouble,
  'pos':             Utensils,
  'channel-manager': ArrowLeftRight,
  'mobile-app':      Smartphone,
  'analytics':       BarChart2,
  'crm':             Users,
}
const getIconComponent = (slug: string): Component => slugIconComponents[slug] ?? Package

const slugColors: Record<string, string> = {
  'pms':             '#7c3aed',
  'pos':             '#0891b2',
  'channel-manager': '#059669',
  'mobile-app':      '#d97706',
  'analytics':       '#dc2626',
  'crm':             '#0f766e',
}
const getColor = (slug: string) => slugColors[slug] ?? '#6b7280'
</script>
