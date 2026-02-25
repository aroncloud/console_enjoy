<!-- src/components/dashboard/RecentActivations.vue -->
<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">

   

    <!-- Timeline -->
    <div class="flex flex-col">
      <div
        v-for="(item, index) in activations"
        :key="item.id"
        class="relative flex gap-4"
      >
        <!-- Ligne verticale (pas sur le dernier) -->
        <div
          v-if="index < activations.length - 1"
          class="absolute left-4 top-10 bottom-[-1.5rem] w-[2px] bg-gray-100 z-0"
        />

        <!-- Icône -->
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10"
          :class="item.iconBg"
        >
          <component :is="item.icon" class="w-4 h-4" :class="item.iconColor" />
        </div>

        <!-- Contenu -->
        <div class="pb-6">
          <p class="text-sm font-semibold text-gray-800">{{ item.hotel }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ item.description }}</p>
          <p class="text-[10px] text-gray-300 mt-2 font-medium">{{ item.time }}</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <button class="w-full py-2 text-xs font-bold text-gray-400 hover:text-blue-500 uppercase tracking-widest bg-gray-50 rounded-lg transition-colors">
      Voir tout l'historique
    </button>

  </div>
</template>

<script setup lang="ts">
import { Zap, Smartphone, RefreshCcw, Cloud, UserPlus } from 'lucide-vue-next'

interface Activation {
  id: number
  hotel: string
  description: string
  time: string
  icon: unknown
  iconBg: string
  iconColor: string
}

const activations: Activation[] = [
  {
    id: 1,
    hotel: 'Hôtel Royal',
    description: 'Application Mobile activée',
    time: 'Il y a 10 min',
    icon: Smartphone,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
  },
  {
    id: 2,
    hotel: 'Grand Palace',
    description: 'Mise à jour licences POS',
    time: 'Il y a 45 min',
    icon: RefreshCcw,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    id: 3,
    hotel: 'Les Chalets Alpins',
    description: 'Migration Cloud terminée',
    time: 'Il y a 2h',
    icon: Cloud,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    id: 4,
    hotel: "Villa d'Este",
    description: 'Nouvel établissement ajouté',
    time: 'Il y a 3h',
    icon: UserPlus,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
  },
]
</script>