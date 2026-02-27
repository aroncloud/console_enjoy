<!-- src/components/dashboard/LicenseTable.vue -->
<template>
<div>


  <BaseTable
    :columns="columns"
    :data="pagedLicenses"
    :sortable="false"
    :searchable="false"
  >

    <!-- Colonne Hôtel -->
    <template #cell-hotel="{ row }">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <Building2 class="w-4 h-4 text-gray-400" />
        </div>
        <span class="font-medium text-gray-700">{{ row.hotel }}</span>
      </div>
    </template>

    <!-- Colonne Date d'échéance -->
    <template #cell-dueDate="{ value }">
      <span class="text-gray-600">{{ formatDate(value) }}</span>
    </template>

    <!-- Colonne Jours restants -->
    <template #cell-daysLeft="{ value }">
      <span
        class="px-3 py-1 rounded-full text-xs font-semibold"
        :class="getBadgeClass(value)"
      >
        {{ value }} jours
      </span>
    </template>

    <!-- Colonne Action -->
    <template #cell-action="{ row }">
      <button
        @click.stop="handleAction(row)"
        class="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
      >
        <ChevronRight class="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
      </button>
    </template>


    <!-- pagination footer -->
    <template #footer>
      <PaginationTable
        :currentPage="currentPage"
        :pageSize="pageSize"
        :totalItems="licenses.length"
        @update:currentPage="currentPage = $event"
      />
    </template>
  </BaseTable>
</div>
</template>

<script setup lang="ts">
import { Building2, ChevronRight ,TriangleAlert  } from 'lucide-vue-next'
import BaseTable, { type Column } from '../Table/BaseTable.vue'
import PaginationTable from '../Pagination/PaginationTable.vue'

interface License {
  hotel: string
  dueDate: string
  daysLeft: number
  action?: string
}

const columns: Column[] = [
  { key: 'hotel', label: 'Hôtel' },
  { key: 'dueDate', label: "Date d'échéance" },
  { key: 'daysLeft', label: 'Jours restants' },
  { key: 'action', label: 'Action', thClass: 'text-right', tdClass: 'text-right' },
]

const licenses: License[] = [
  { hotel: 'Hôtel de la Plage', dueDate: '2024-10-14', daysLeft: 12 },
  { hotel: 'Grand Hôtel Lyon', dueDate: '2024-10-20', daysLeft: 18 },
  { hotel: 'Résidence du Parc', dueDate: '2024-10-27', daysLeft: 25 },
  { hotel: 'Château d\'Annecy', dueDate: '2024-11-01', daysLeft: 30 },
  
]

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// pagination state
import { ref, computed } from 'vue'
const currentPage = ref(1)
const pageSize = ref(5)

const pagedLicenses = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return licenses.slice(start, start + pageSize.value)
})

const getBadgeClass = (days: number): string => {
  if (days <= 15) return 'bg-red-100 text-red-600'
  if (days <= 20) return 'bg-orange-100 text-orange-600'
  return 'bg-gray-100 text-gray-500'
}

const handleAction = (row: License): void => {
  console.log('Action pour :', row.hotel)
  // router.push(`/clients/${row.id}`) quand tu auras les vrais IDs
}
</script>