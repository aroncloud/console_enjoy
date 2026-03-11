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
        :loading="loading"
      />
    </div>

    <!-- Licences + Activations -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">

      <div class="lg:col-span-2 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <TriangleAlert class="w-5 h-5 text-red-500" />
            Alertes d'Expiration de Licence (30 jours)
          </h2>
        </div>
        <LicenseTable :data="dashboard?.licenseAlerts"
          :loading="loading"
          class="flex-1 min-h-0"
          @page-change="handleAlertsPageChange" />
      </div>

      <div class="lg:col-span-1 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Zap class="w-5 h-5 text-blue-500" />
            Activations Récentes
          </h2>
        </div>
        <RecentActivations :data="dashboard?.recentActivations ?? []" :loading="loading" class="flex-1 min-h-0"/>
      </div>

    </div>

    <!-- Chart -->
    <RevenueChart :data="dashboard?.revenueChart" :loading = 'loading' />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Building2, BadgeDollarSign, RefreshCcw, TriangleAlert, Zap } from 'lucide-vue-next'
import StatsCard from '../components/Dashboard/StatsCard.vue'
import LicenseTable from '../components/Dashboard/LicenseTable.vue'
import RecentActivations from '../components/Dashboard/RecentActivations.vue'
import RevenueChart from '../components/Dashboard/RevenueChart.vue'
import { dashboardService, type DashboardData } from '../servicesAPI/dashboardService'
import { formatCurrency } from '../components/Utilities/function'
import { useToastStore } from '../composables/toast'

interface Stat {
  title: string
  value: string
  trend?: string
  objectif?: string
  icon: unknown
  iconBg: string
  iconColor: string
}

const dashboard = ref<DashboardData | null>(null)
const loading = ref(false)
const toastore = useToastStore()

const fetchData = async(page: number) =>{
   loading.value = true
  try {
    dashboard.value = await dashboardService.get({ alertsPage: page })
    console.log('res',dashboard.value)
  } catch (e) {
    toastore.show({ message: 'Erreur lors du chargement du dashboard', type: 'error' ,title:'Erreur'})
  } finally {
    loading.value = false
  }
}

onMounted(()=>{
  fetchData(1)
})

const handleAlertsPageChange =  (newPage: number) => {
 fetchData(newPage)
}
const stats = computed<Stat[]>(() => [
  {
    title: 'Total Hôtels',
    value: dashboard.value ? String(dashboard.value.stats.totalHotels) : '—',
    trend: dashboard.value ? `+${dashboard.value.stats.hotelsThisMonth} ce mois` : undefined,
    icon: Building2,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    title: 'Revenu Mensuel (MRR)',
    value: dashboard.value ? `${formatCurrency(dashboard.value.stats.mrr)} ` : '—',
    trend: dashboard.value?.stats.mrrTrend ?? undefined,
    icon: BadgeDollarSign,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-500',
  },
  {
    title: 'Taux de Renouvellement',
    value: dashboard.value ? dashboard.value.stats.renewalRate : '—',
    objectif: dashboard.value ? `Objectif: ${dashboard.value.stats.renewalObjectif}` : undefined,
    icon: RefreshCcw,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
  },
])
</script>
