<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AddHotelForm from '../../components/Clients/AddHotelForm.vue'
import ButtonComponent from '../../components/Button/ButtonComponent.vue'
import BaseTable, { type Column } from '../../components/Table/BaseTable.vue'
import { Plus, BedDouble, Utensils, RefreshCcw, Smartphone, ExternalLink } from 'lucide-vue-next'
import { hotelService } from '../../servicesAPI/clientService'
import { useToastStore } from '../../composables/toast'

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

const hotels     = ref<Hotel[]>([])
const loading    = ref(false)
const showForm   = ref(false)
const editHotelId = ref<number | null>(null)  
const toastStore = useToastStore()
const { t } = useI18n()

const columns = computed<Column[]>(() => [
  { key: 'hotel',    label: t('clients.table.hotel') },
  { key: 'location', label: t('clients.table.location') },
  { key: 'status',   label: t('clients.table.status') },
  { key: 'products', label: t('clients.table.activeProducts') },
  { key: 'infos',    label: t('clients.table.info') },
  { key: 'contact',  label: t('clients.table.contact') },
  { key: 'actions',  label: t('common.actions'), tdClass: 'text-right' },
])

onMounted(() => { fetchHotels() })

const fetchHotels = async () => {
  loading.value = true
  try {
    const response = await hotelService.getAll()
    console.log('Hotels API response:', response)
    hotels.value = response.data?.data || response.data || []
  } catch (e: any) {
    toastStore.show({ message: t('clients.toast.loadError'), type: 'error' })
  } finally {
    loading.value = false
  }
}

// ── Ouvrir formulaire ────
const openCreate = () => {
  editHotelId.value = null  
  showForm.value = true
}



const closeForm = () => {
  showForm.value = false
  editHotelId.value = null
}

// ── Submit 
const handleSubmit = async (data: any) => {
  loading.value = true
  try {
    await hotelService.create(data)
    toastStore.show({ message: t('clients.toast.created'), type: 'success' })
    closeForm()
    await fetchHotels()
  } catch (e: any) {
    
     console.error('Status:', e.response)
  console.error('Data:', JSON.stringify(e.response?.data, null, 2))
    toastStore.show({ message: t('clients.toast.createError'), type: 'error' })
  } finally {
    loading.value = false
  }
}

// ── Filtres & pagination ────────────
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

const countActive    = computed(() => hotels.value.filter(h => h.status === 'active').length)
const countInactive  = computed(() => hotels.value.filter(h => h.status === 'inactive').length)
const countSuspended = computed(() => hotels.value.filter(h => h.status === 'suspended').length)

const setFilter = (key: string) => { activeFilter.value = key; currentPage.value = 1 }

const filters = computed(() => [
  { key: 'all',       label: t('clients.filters.all', { count: hotels.value.length }) },
  { key: 'active',    label: t('clients.filters.active', { count: countActive.value }) },
  { key: 'suspended', label: t('clients.filters.suspended', { count: countSuspended.value }) },
  { key: 'inactive',  label: t('clients.filters.inactive', { count: countInactive.value }) },
])

const getStatusStyles = (status: string) => ({
  active:    'bg-green-100 text-green-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  inactive:  'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-900/25 dark:text-red-300',
  demo:      'bg-orange-100 text-orange-700 dark:bg-amber-900/25 dark:text-amber-300',
}[status] ?? 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-300')

const getStatusLabel = (status: string) => ({
  active:    t('status.active'),
  inactive:  t('status.inactive'),
  suspended: t('status.suspended'),
  demo:      t('status.demo'),
}[status] ?? status)

const renderStars = (grade: number) => '★'.repeat(grade) + '☆'.repeat(5 - grade)

const getProducts = (row: any) => 
  (row.subscriptions || []).filter((r:any)=>r.status === 'active').map((sub: any) => sub.module?.slug).filter(Boolean)
</script>

<template>

  <!-- ── Vue Formulaire (création OU édition selon editHotelId) ── -->
  <AddHotelForm
    v-if="showForm"
    :hotel-id="editHotelId"
    :loading="loading"
    @submit="handleSubmit"
    @cancel="closeForm"
    @back="closeForm"
  />

  <!-- ── Vue Liste ── -->
  <div v-else class="p-4 md:p-8 bg-gray-50 dark:bg-slate-950 min-h-screen font-sans">

    <div class="flex flex-col md:flex-row justify-between md:items-start mb-8 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('clients.title') }}</h1>
        <p class="text-gray-500 dark:text-slate-400 text-sm mt-1">{{ t('clients.subtitle') }}</p>
      </div>
      <ButtonComponent :label="t('clients.actions.addHotel')" variant="primary" :iconLeft="Plus" @click="openCreate" />
    </div>

    <div class="flex gap-3 mb-6 overflow-x-auto pb-2">
      <button
        v-for="filter in filters"
        :key="filter.key"
        @click="setFilter(filter.key)"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer',
          activeFilter === filter.key
            ? 'bg-purple-600 text-white'
            : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
        ]"
      >{{ filter.label }}</button>
    </div>

    <BaseTable :columns="columns" :data="pagedHotels" :loading="loading">

      <template #cell-hotel="{ row }">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
            <BedDouble class="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p class="font-semibold text-gray-900 dark:text-white text-sm">{{ row.hotelName }}</p>
            <p class="text-[11px] text-gray-400 dark:text-slate-400 font-mono">{{ row.hotelCode }}</p>
          </div>
        </div>
      </template>

      <template #cell-location="{ row }">
        <div class="flex flex-col">
          <span class="text-sm text-gray-800 dark:text-slate-200">{{ row.city }}</span>
          <span class="text-xs text-gray-400 dark:text-slate-400">{{ row.country }}</span>
        </div>
      </template>

      <template #cell-products="{ row }">
        <div class="flex items-center gap-2.5 text-gray-300 dark:text-slate-600">
          <BedDouble  :size="17" :class="getProducts(row).includes('pms') ? 'text-purple-500' : 'text-gray-200 dark:text-slate-700'" title="PMS" />
          <Utensils   :size="17" :class="getProducts(row).includes('pos') ? 'text-orange-400' : 'text-gray-200 dark:text-slate-700'" :title="t('clients.products.pos')" />
          <RefreshCcw :size="17" :class="getProducts(row).includes('channel-manager')? 'text-green-500' : 'text-gray-200 dark:text-slate-700'" :title="t('clients.products.channelManager')" />
          <Smartphone :size="17" :class="getProducts(row).includes('mobile-app') ? 'text-blue-400'   : 'text-gray-200 dark:text-slate-700'" :title="t('clients.products.mobileApp')" />
        </div>
      </template>

      <template #cell-status="{ row }">
        <span :class="['px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5', getStatusStyles(row.status)]">
          <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
          {{ getStatusLabel(row.status) }}
        </span>
      </template>

      <template #cell-infos="{ row }">
        <div class="flex flex-col gap-0.5">
          <span class="text-xs text-amber-500 tracking-wide">{{ renderStars(row.grade ?? 0) }}</span>
          <span class="text-xs text-gray-500 dark:text-slate-400">{{ row.currencyCode }}</span>
        </div>
      </template>

      <template #cell-contact="{ row }">
        <div class="flex flex-col">
          <span class="text-xs text-gray-700 dark:text-slate-200 truncate max-w-35">{{ row.email }}</span>
          <span class="text-xs text-gray-400 dark:text-slate-400">{{ row.phoneNumber }}</span>
        </div>
      </template>

      <template #cell-actions="{ row }">
        <router-link
          :to="`/clients/${row.id}`"
          class="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 text-sm font-semibold transition-colors"
        >
          {{ t('common.details') }}
          <ExternalLink class="w-3 h-3" />
        </router-link>
      </template>

    </BaseTable>
  </div>
</template>
