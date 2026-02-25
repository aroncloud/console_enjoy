<template>
  <div class="flex flex-col gap-6">

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatsCard
        v-for="stat in stats"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :trend="stat.trend"
        :objectif="stat.objectif"
        :icon="stat.icon"
        :iconBg="stat.iconBg"
        :iconColor="stat.iconColor"
      />
    </div>

    <!-- Licences + Activations -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

      <div class="lg:col-span-2 flex flex-col gap-3">
        <!-- Header Licences -->
        <div class="flex items-center justify-between">
          <h2 class=" text-lg font-bold  text-gray-800 flex items-center gap-2">
            <TriangleAlert class="w-5 h-5 text-red-500" />
            Alertes d'Expiration de Licence (30 jours)
          </h2>
          <button class="text-sm text-blue-500 hover:underline">Voir tout</button>
        </div>
        <LicenseTable />
      </div>

      <div class="lg:col-span-1 flex flex-col gap-3">
        <!-- Header Activations -->
        <div class="flex items-center justify-between">
          <h2 class=" text-lg font-bold text-gray-800 flex items-center gap-2">
            <Zap class="w-5 h-5 text-blue-500" />
            Activations Récentes
          </h2>
        </div>
        <RecentActivations />
      </div>

    </div>

    <!-- Chart -->
    <RevenueChart />

  </div>
</template>

<script setup lang="ts">
import { Building2, BadgeDollarSign, RefreshCcw, TriangleAlert, Zap } from 'lucide-vue-next'
import StatsCard from '../components/Dashboard/StatsCard.vue'
import LicenseTable from '../components/Dashboard/LicenseTable.vue'
import RecentActivations from '../components/Dashboard/RecentActivations.vue'
import RevenueChart from '../components/Dashboard/RevenueChart.vue'

interface Stat {
  title: string
  value: string
  trend?: string
  objectif?: string
  icon: unknown
  iconBg: string
  iconColor: string
}

const stats: Stat[] = [
  {
    title: 'Total Hôtels',
    value: '154',
    trend: '+4 ce mois',
    icon: Building2,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    title: 'Revenu Mensuel (MRR)',
    value: '45 200 F',
    trend: '+12.5% vs mois dernier',
    icon: BadgeDollarSign,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-500',
  },
  {
    title: 'Taux de Renouvellement',
    value: '98.5%',
    objectif: 'Objectif: 99%',
    icon: RefreshCcw,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
  },
]
</script>