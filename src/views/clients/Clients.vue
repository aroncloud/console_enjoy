<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AddHotelForm from '../../components/Clients/AddHotelForm.vue'
import ButtonComponent from '../../components/Button/ButtonComponent.vue'
import BaseTable, { type Column } from '../../components/Table/BaseTable.vue'
import PaginationTable from '../../components/Pagination/PaginationTable.vue'
import { Plus, BedDouble, Utensils, RefreshCcw, Smartphone, ExternalLink } from 'lucide-vue-next'
import { hotelService } from '../../servicesAPI/clientService'
import { useToastStore } from '../../composables/toast'

// ── Types 
interface Hotel {
  id: number
  hotelName: string
  hotelCode: string
  city: string
  country: string
  email: string
  phoneNumber: string
  status: string
  propertyType: string
  grade: number
  totalRooms: number
  currencyCode: string
  channelEnable: boolean
  migrated: boolean
  currentWorkingDate: string | null
}

// ── State 
const hotels    = ref<Hotel[]>([])
const loading   = ref(false)
const showForm  = ref(false)
const toastStore = useToastStore()

// ── Colonnes table 
const columns: Column[] = [
  { key: 'hotel',    label: 'Hôtel' },
  { key: 'location', label: 'Localisation' },
  { key: 'status',   label: 'Statut' },
  { key: 'products', label: 'Produits Actifs' },
  { key: 'infos',    label: 'Infos' },
  { key: 'contact',  label: 'Contact' },
  { key: 'actions',  label: 'Actions', tdClass: 'text-right' },
]

// ── Chargement 
onMounted(() => {
   fetchHotels()
})

const fetchHotels = async () => {
  loading.value = true
  try {
    const response = await hotelService.getAll()
    hotels.value = response.data?.data || response.data || []
  } catch (e: any) {
    console.error('Erreur lors du chargement des hôtels :', e)
    toastStore.show({
      message: 'Erreur lors du chargement des hôtels',
      type: 'error',
    })
  } finally {
    loading.value = false
  }
}

// ── Formulaire 
const openForm  = () => { showForm.value = true }
const closeForm = () => { showForm.value = false }

const handleSubmit = async (data: any) => {
  try {
    loading.value = true
    console.log('Données soumises :', data)
    await hotelService.create(data)
    toastStore.show({
      message: 'Hôtel ajouté avec succès !',
      type: 'success',
    })
  
    closeForm()
    await fetchHotels()
  } catch (e: any) {
    toastStore.show({
      message: 'Erreur lors de l\'ajout de l\'hôtel',
      type: 'error',
    })
  } finally {
    loading.value = false 
  }
}

// ── Filtres 
const activeFilter = ref('all')
const currentPage  = ref(1)
const pageSize     = ref(5)

const filteredHotels = computed(() => {
  if (activeFilter.value === 'all') return hotels.value
  return hotels.value.filter(h => h.status === activeFilter.value)
})

const pagedHotels = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredHotels.value.slice(start, start + pageSize.value)
})

// Compteurs basés sur les vrais statuts backend
const countActive    = computed(() => hotels.value.filter(h => h.status === 'active').length)
const countInactive  = computed(() => hotels.value.filter(h => h.status === 'inactive').length)
const countSuspended = computed(() => hotels.value.filter(h => h.status === 'suspended').length)

const setFilter = (key: string) => {
  activeFilter.value = key
  currentPage.value = 1
}

// ── Styles statut 
const getStatusStyles = (status: string) => {
  switch (status) {
    case 'active':    return 'bg-green-100 text-green-700'
    case 'inactive':  return 'bg-gray-100 text-gray-600'
    case 'suspended': return 'bg-red-100 text-red-700'
    case 'demo':      return 'bg-orange-100 text-orange-700'
    default:          return 'bg-gray-100 text-gray-500'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':    return 'Actif'
    case 'inactive':  return 'Inactif'
    case 'suspended': return 'Suspendu'
    case 'demo':      return 'Démo'
    default:          return status
  }
}

// ── Étoiles 
const renderStars = (grade: number) => '★'.repeat(grade) + '☆'.repeat(5 - grade)

// ── Produits 
const getProducts = (row: Hotel) => {
  if ((row as any).products) return (row as any).products
  return ['pms']
}
</script>

<template>

  <!-- ── Vue Formulaire ── -->
  <AddHotelForm
    v-if="showForm"
    @submit="handleSubmit"
    @cancel="closeForm"
    @back="closeForm"
    :loading="loading"
  />

  <!-- ── Vue Liste ── -->
  <div v-else class="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">

    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between md:items-start mb-8 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestion du Parc Client</h1>
        <p class="text-gray-500 text-sm mt-1">
          Gérez les abonnements et les accès des établissements hôteliers.
        </p>
      </div>
      <ButtonComponent
        label="Ajouter un Hôtel"
        variant="primary"
        :iconLeft="Plus"
        @click="openForm"
      />
    </div>

  

    <!-- Filtres -->
    <div class="flex gap-3 mb-6 overflow-x-auto pb-2">
      <button
        v-for="filter in [
          { key: 'all',       label: `Tous (${hotels.length})` },
          { key: 'active',    label: `Actifs (${countActive})` },
          { key: 'suspended', label: `Suspendus (${countSuspended})` },
          { key: 'inactive',  label: `Inactifs (${countInactive})` },
        ]"
        :key="filter.key"
        @click="setFilter(filter.key)"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer',
          activeFilter === filter.key
            ? 'bg-purple-600 text-white'
            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
        ]"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Table -->
    <BaseTable
      :columns="columns"
      :data="pagedHotels"
      :loading="loading"
    >

      <!-- Hôtel -->
      <template #cell-hotel="{ row }">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
            <BedDouble class="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p class="font-semibold text-gray-900 text-sm">{{ row.hotelName }}</p>
            <p class="text-[11px] text-gray-400 font-mono">{{ row.hotelCode }}</p>
          </div>
        </div>
      </template>

      <!-- Localisation -->
      <template #cell-location="{ row }">
        <div class="flex flex-col">
          <span class="text-sm text-gray-800">{{ row.city }}</span>
          <span class="text-xs text-gray-400">{{ row.country }}</span>
        </div>
      </template>

      <!-- Produits actifs (mock en attendant le back) -->
      <template #cell-products="{ row }">
        <div class="flex items-center gap-2.5 text-gray-300">
          <!-- PMS / Hébergement -->
          <BedDouble
            :size="17"
            :class="getProducts(row).includes('pms') ? 'text-purple-500' : 'text-gray-200'"
            title="PMS"
          />
          <!-- Restauration -->
          <Utensils
            :size="17"
            :class="getProducts(row).includes('pos') ? 'text-orange-400' : 'text-gray-200'"
            title="Point de vente"
          />
          <!-- Channel Manager -->
          <RefreshCcw
            :size="17"
            :class="row.channelEnable ? 'text-green-500' : 'text-gray-200'"
            title="Channel Manager"
          />
          <!-- App mobile -->
          <Smartphone
            :size="17"
            :class="getProducts(row).includes('app') ? 'text-blue-400' : 'text-gray-200'"
            title="App mobile"
          />
        </div>
      </template>

      <!-- Statut -->
      <template #cell-status="{ row }">
        <span :class="['px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5', getStatusStyles(row.status)]">
          <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
          {{ getStatusLabel(row.status) }}
        </span>
      </template>

      <!-- Infos -->
      <template #cell-infos="{ row }">
        <div class="flex flex-col gap-0.5">
          <span class="text-xs text-amber-500 tracking-wide">{{ renderStars(row.grade ?? 0) }}</span>
          <span class="text-xs text-gray-500">{{ row.currencyCode }}</span>
        </div>
      </template>

      <!-- Contact -->
      <template #cell-contact="{ row }">
        <div class="flex flex-col">
          <span class="text-xs text-gray-700 truncate max-w-[140px]">{{ row.email }}</span>
          <span class="text-xs text-gray-400">{{ row.phoneNumber }}</span>
        </div>
      </template>

      <!-- Actions -->
      <template #cell-actions="{ row }">
        <router-link
          :to="`/clients/${row.id}`"
          class="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 text-sm font-semibold transition-colors"
        >
          Détails
          <ExternalLink class="w-3 h-3" />
        </router-link>
      </template>

      <!-- Pagination dans le footer de la table -->
      <template #footer>
        <PaginationTable
          :currentPage="currentPage"
          :pageSize="pageSize"
          :totalItems="filteredHotels.length"
          @update:currentPage="currentPage = $event"
        />
      </template>

    </BaseTable>

  </div>
</template>