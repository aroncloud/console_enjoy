<template>
  <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 flex items-center justify-between border border-gray-100 dark:border-slate-800">

    <!-- Skeleton -->
    <template v-if="loading">
      <div class="flex flex-col gap-3 animate-pulse w-full">
        <div class="h-3 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
        <div class="h-8 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
        <div class="h-3 w-36 bg-gray-100 dark:bg-slate-800 rounded" />
      </div>
      <div class="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-xl shrink-0 animate-pulse" />
    </template>

    <!-- Contenu réel -->
    <template v-else>
      <div class="flex flex-col gap-1">
        <p class="text-sm text-gray-500 dark:text-slate-400 font-medium">{{ title }}</p>
        <p class="text-3xl font-bold text-gray-800 dark:text-white">{{ value }}</p>

        <div class="flex items-center gap-1 mt-1" v-if="trend">
          <component
            :is="trendPositive ? TrendingUp : TrendingDown"
            class="w-4 h-4"
            :class="trendPositive ? 'text-green-500' : 'text-red-500'"
          />
          <span
            class="text-xs font-medium"
            :class="trendPositive ? 'text-green-500' : 'text-red-500'"
          >
            {{ trend }}
          </span>
        </div>

        <div class="flex items-center gap-1 mt-1" v-if="objectif">
          <component :is="Target" class="w-4 h-4 text-purple-500" />
          <span class="text-xs font-medium text-purple-500">
             {{ objectif }}
          </span>
        </div>
      </div>

      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        :class="iconBg"
      >
        <component :is="icon" class="w-6 h-6" :class="iconColor" />
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Target } from 'lucide-vue-next'

interface Props {
  title?: string
  value?: string
  trend?: string
  icon?: unknown
  iconBg?: string
  iconColor?: string
  objectif?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const trendPositive = computed(
  () => props.trend && props.trend.startsWith('+'),
)
</script>
