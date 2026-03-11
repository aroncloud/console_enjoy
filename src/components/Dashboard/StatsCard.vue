<template>
  <div
    class="bg-white dark:bg-slate-900 rounded-2xl p-5 flex items-center justify-between border border-gray-100 dark:border-slate-800"
  >
    <!-- Infos -->
    <div class="flex flex-col gap-1">
      <p class="text-sm text-gray-500 dark:text-slate-400 font-medium">{{ title }}</p>
      <p class="text-3xl font-bold text-gray-800 dark:text-white">{{ value }}</p>

      <!-- Tendance -->
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
          Objectif : {{ objectif }}
        </span>
      </div>
    </div>

    <!-- Icône -->
    <div
      class="w-12 h-12 rounded-xl flex items-center justify-center"
      :class="iconBg"
    >
      <component :is="icon" class="w-6 h-6" :class="iconColor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { TrendingUp, TrendingDown, Target } from "lucide-vue-next";

interface Props {
  title: string;
  value: string;
  trend?: any;
  icon: unknown;
  iconBg: string;
  iconColor: string;
  objectif?: string;
}

const props = defineProps<Props>();

const trendPositive = computed(
  () => props.trend && props.trend.startsWith("+"),
);
</script>
