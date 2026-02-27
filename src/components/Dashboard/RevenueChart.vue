<template>
  <div class="bg-white rounded-xl border border-gray-100 p-6 ">

    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-lg font-bold text-gray-800">Répartition du Chiffre d'Affaires</h2>
      <div class="flex gap-2">
        <button
          v-for="period in periods"
          :key="period.value"
          @click="activePeriod = period.value"
          class="px-3 py-1 text-xs font-semibold rounded transition-colors"
          :class="activePeriod === period.value
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-500'"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- Barres -->
    <div class="h-64 flex items-end justify-between gap-2 px-4 relative">
      <div
        v-for="(bar, index) in activeBars"
        :key="index"
        class="w-full rounded-t relative group transition-all duration-500 cursor-pointer"
        :class="bar.current ? 'bg-blue-600' : 'bg-blue-100 hover:bg-blue-200'"
        :style="{ height: bar.height }"
        @mouseenter="showTooltip(bar, index, $event)"
        @mouseleave="hideTooltip"
      >
        <!-- Label "Actuel" -->
        <div
          v-if="bar.current"
          class="absolute inset-x-0 -top-7 text-center text-xs font-bold text-blue-600"
        >
          Actuel
        </div>
      </div>

      <!-- Tooltip -->
      <Transition name="fade">
        <div
          v-if="tooltip.visible"
          class="absolute z-50 bg-gray-900 text-white rounded-xl px-4 py-3 pointer-events-none min-w-[140px]"
          :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px', transform: 'translateX(-50%)' }"
        >
          <!-- Mois -->
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            {{ tooltip.month }}
          </p>
          <!-- Valeur -->
          <p class="text-base font-bold text-white">{{ tooltip.value }}</p>
          <!-- Variation -->
          <div class="flex items-center gap-1 mt-1">
            <TrendingUp v-if="tooltip.trendUp" class="w-3 h-3 text-green-400" />
            <TrendingDown v-else class="w-3 h-3 text-red-400" />
            <span
              class="text-xs font-semibold"
              :class="tooltip.trendUp ? 'text-green-400' : 'text-red-400'"
            >
              {{ tooltip.trend }}
            </span>
          </div>
          <!-- Flèche -->
          <div class="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-gray-900 rotate-45 rounded-sm" />
        </div>
      </Transition>
    </div>

    <!-- Labels mois -->
    <div class="flex justify-between mt-4 px-4">
      <span
        v-for="(bar, index) in activeBars"
        :key="index"
        class="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-full text-center"
      >
        {{ bar.month }}
      </span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'

const activePeriod = ref<'month' | 'quarter'>('quarter')

const periods = [
  { label: 'Mois', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
]

interface Bar {
  month: string
  height: string
  value: string
  trend: string
  trendUp: boolean
  current?: boolean
}

const quarterBars: Bar[] = [
  { month: 'Avril',   height: '66%', value: '38 000 F', trend: '+4.2%',  trendUp: true },
  { month: 'Mai',     height: '75%', value: '45 000 F', trend: '+18.4%', trendUp: true },
  { month: 'Juin',    height: '50%', value: '30 000 F', trend: '-33.3%', trendUp: false },
  { month: 'Juillet', height: '80%', value: '52 000 F', trend: '+73.3%', trendUp: true },
  { month: 'Août',    height: '95%', value: '45 200 F', trend: '+12.5%', trendUp: true, current: true },
  { month: 'Sept',    height: '66%', value: '38 000 F', trend: '-15.9%', trendUp: false },
]

const monthBars: Bar[] = [
  { month: 'Lun', height: '50%', value: '8 000 F',  trend: '+2.1%',  trendUp: true },
  { month: 'Mar', height: '70%', value: '12 000 F', trend: '+50%',   trendUp: true },
  { month: 'Mer', height: '40%', value: '6 000 F',  trend: '-50%',   trendUp: false },
  { month: 'Jeu', height: '85%', value: '15 000 F', trend: '+150%',  trendUp: true },
  { month: 'Ven', height: '95%', value: '18 000 F', trend: '+20%',   trendUp: true, current: true },
  { month: 'Sam', height: '60%', value: '10 000 F', trend: '-44.4%', trendUp: false },
]

const activeBars = computed<Bar[]>(() =>
  activePeriod.value === 'quarter' ? quarterBars : monthBars
)

// Tooltip state
interface TooltipState {
  visible: boolean
  x: number
  y: number
  month: string
  value: string
  trend: string
  trendUp: boolean
}

const tooltip = ref<TooltipState>({
  visible: false,
  x: 0,
  y: 0,
  month: '',
  value: '',
  trend: '',
  trendUp: true,
})

const showTooltip = (bar: Bar, index: number, event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const parent = target.parentElement!.getBoundingClientRect()
  const rect = target.getBoundingClientRect()

  tooltip.value = {
    visible: true,
    x: rect.left - parent.left + rect.width / 2,
    y: rect.top - parent.top - 90,
    month: bar.month,
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