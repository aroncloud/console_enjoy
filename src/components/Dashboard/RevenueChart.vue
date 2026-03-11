<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-5">

    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <template v-if="loading">
        <div class="h-5 w-56 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        <div class="flex gap-2">
          <div class="h-7 w-16 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
          <div class="h-7 w-16 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </template>
      <template v-else>
        <h2 class="text-lg font-bold text-gray-800 dark:text-white">Répartition du Chiffre d'Affaires</h2>
        <div class="flex gap-2">
          <button
            v-for="period in periods"
            :key="period.value"
            @click="activePeriod = period.value"
            class="px-3 py-1 text-xs font-semibold rounded transition-colors"
            :class="activePeriod === period.value ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-300'"
          >
            {{ period.label }}
          </button>
        </div>
      </template>
    </div>

    <!-- Skeleton Barres -->
    <template v-if="loading">
      <div class="h-52 flex items-end justify-between gap-2 px-4 animate-pulse">
        <div
          v-for="i in 12"
          :key="i"
          class="w-full bg-gray-200 dark:bg-slate-700 rounded-t"
          :style="{ height: `${15 + (i * 7) % 70}%` }"
        />
      </div>
      <div class="flex justify-between mt-4 px-4 animate-pulse">
        <div v-for="i in 12" :key="i" class="h-2 w-6 bg-gray-200 dark:bg-slate-700 rounded mx-auto" />
      </div>
    </template>

    <!-- Barres réelles -->
    <template v-else-if="activeBars.length>0">
      <div class="h-52 flex items-end justify-between gap-2 px-4 relative">
        <div
          v-for="(bar, index) in activeBars"
          :key="index"
          class="w-full rounded-t relative group transition-all duration-500 cursor-pointer"
          :class="bar.current ? 'bg-blue-600' : 'bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60'"
          :style="{ height: bar.height }"
          @mouseenter="showTooltip(bar, index, $event)"
          @mouseleave="hideTooltip"
        >
          <div
            v-if="bar.current"
            class="absolute inset-x-0 -top-7 text-center text-xs font-bold text-blue-600 dark:text-blue-400"
          >
            Actuel
          </div>
        </div>

        <!-- Tooltip -->
        <Transition name="fade">
          <div
            v-if="tooltip.visible"
            class="absolute z-50 bg-gray-900 text-white rounded-xl px-4 py-3 pointer-events-none min-w-35"
            :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px', transform: 'translateX(-50%)' }"
          >
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              {{ tooltip.label }}
            </p>
            <p class="text-base font-bold text-white">{{ tooltip.value }}</p>
            <div v-if="tooltip.trend" class="flex items-center gap-1 mt-1">
              <TrendingUp v-if="tooltip.trendUp" class="w-3 h-3 text-green-400" />
              <TrendingDown v-else class="w-3 h-3 text-red-400" />
              <span
                class="text-xs font-semibold"
                :class="tooltip.trendUp ? 'text-green-400' : 'text-red-400'"
              >
                {{ tooltip.trend }}
              </span>
            </div>
            <div class="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-gray-900 rotate-45 rounded-sm" />
          </div>
        </Transition>
      </div>

      <!-- Labels -->
      <div class="flex justify-between mt-4 px-4">
        <span
          v-for="(bar, index) in activeBars"
          :key="index"
          class="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest w-full text-center"
        >
          {{ bar.label }}
        </span>
      </div>
    </template>

    <template v-else>
      <div class="h-64 flex flex-col items-center justify-center gap-3 text-center">
        <div class="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
          <BarChart2 class="w-6 h-6 text-gray-300 dark:text-slate-600" />
        </div>
        <p class="text-sm font-semibold text-gray-400 dark:text-slate-400">Aucune donnée disponible</p>
        <p class="text-xs text-gray-300 dark:text-slate-500">Les revenus s'afficheront ici dès qu'il y aura des abonnements actifs.</p>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrendingUp, TrendingDown,BarChart2 } from 'lucide-vue-next'
import type { ChartPoint } from '../../servicesAPI/dashboardService'
import { formatCurrency } from '../Utilities/function';

const props = withDefaults(defineProps<{
  data?: { week: ChartPoint[]; year: ChartPoint[] }
  loading?: boolean
}>(), {
  data: () => ({ week: [], year: [] }),
  loading: false,
})

const activePeriod = ref<'week' | 'year'>('year')

const periods = [
  { label: 'Semaine', value: 'week' as const },
  { label: 'Année',   value: 'year' as const },
]

interface Bar {
  label: string
  height: string
  value: string
  trend: string | null
  trendUp: boolean
  current: boolean
}

const toBar = (points: ChartPoint[]): Bar[] => {
  const max = Math.max(...points.map((p) => p.value), 1)
  return points.map((p) => ({
    label: p.label,
    height: `${Math.max(4, Math.round((p.value / max) * 100))}%`,
    value: `${formatCurrency(p.value)}`,
    trend: p.trend,
    trendUp: p.trendUp,
    current: p.current,
  }))
}

const activeBars = computed<Bar[]>(() =>
  toBar(activePeriod.value === 'week' ? props.data.week : props.data.year)
)

interface TooltipState {
  visible: boolean
  x: number
  y: number
  label: string
  value: string
  trend: string | null
  trendUp: boolean
}

const tooltip = ref<TooltipState>({
  visible: false,
  x: 0,
  y: 0,
  label: '',
  value: '',
  trend: null,
  trendUp: true,
})

const showTooltip = (bar: Bar, _index: number, event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const parent = target.parentElement!.getBoundingClientRect()
  const rect = target.getBoundingClientRect()

  tooltip.value = {
    visible: true,
    x: rect.left - parent.left + rect.width / 2,
    y: rect.top - parent.top - 90,
    label: bar.label,
    value: bar.value,
    trend: bar.trend,
    trendUp: bar.trendUp,
  }
}

const hideTooltip = () => {
  tooltip.value.visible = false
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}
</style>
