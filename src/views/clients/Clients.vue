<script setup lang="ts">
import { ref, computed } from 'vue';
import ButtonComponent from '../../components/Button/ButtonComponent.vue';
import BaseTable, { type Column } from '../../components/Table/BaseTable.vue';
import PaginationTable from '../../components/Pagination/PaginationTable.vue';

import { 
  Plus, 
  BedDouble, 
  Utensils, 
  RefreshCcw, 
  Smartphone, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-vue-next';

// Types
type Status = 'Actif' | 'Démo' | 'Suspendu' | 'Maintenance';

interface Hotel {
  id: string;
  name: string;
  internalId: string;
  status: Status;
  products: string[];
  capacity: number;
  contactName: string;
  contactRole: string;
}
const columns: Column[] = [
  { key: 'hotel', label: 'Hôtel' },
  { key: 'status', label: 'Statut' },
  { key: 'products', label: 'Produits Actifs' },
  { key: 'capacity', label: 'Capacité' },
  { key: 'contact', label: 'Contact' },
  { key: 'actions', label: 'Actions', tdClass: 'text-right' },
]
// Données simulées
const hotels = ref<Hotel[]>([
  {
    id: '1',
    name: 'Grand Plaza Hotel',
    internalId: 'T-882-GP',
    status: 'Actif',
    products: ['bed', 'food', 'sync', 'device'],
    capacity: 120,
    contactName: 'Marc Leroy',
    contactRole: 'Directeur Général'
  },
  {
    id: '2',
    name: 'Auberge du Lac',
    internalId: 'T-415-AL',
    status: 'Démo',
    products: ['bed', 'food', 'sync', 'device-off'],
    capacity: 45,
    contactName: 'Sophie Morel',
    contactRole: 'Propriétaire'
  },
  {
    id: '3',
    name: 'Hôtel Royal',
    internalId: 'T-901-HR',
    status: 'Suspendu',
    products: ['bed-off'],
    capacity: 210,
    contactName: 'Jean Dupont',
    contactRole: 'Admin Réseau'
  },
  {
    id: '4',
    name: 'City Hub Brussels',
    internalId: 'T-223-CH',
    status: 'Actif',
    products: ['bed', 'food', 'sync', 'device'],
    capacity: 85,
    contactName: 'Lucie Bernard',
    contactRole: 'Directrice Opérationnelle'
  },
  {
    id: '5',
    name: 'Marine Resort Spa',
    internalId: 'T-556-MR',
    status: 'Maintenance',
    products: ['bed', 'food', 'sync', 'device-off'],
    capacity: 150,
    contactName: 'Antoine Petit',
    contactRole: 'Resp. Technique'
  }
]);

// pagination state

const currentPage = ref(1)
const pageSize = ref(5)
const pagedHotels = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return hotels.value.slice(start, start + pageSize.value)
})

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'Actif': return 'bg-green-100 text-green-700'
    case 'Démo': return 'bg-orange-100 text-orange-700'
    case 'Suspendu': return 'bg-red-100 text-red-700'
    case 'Maintenance': return 'bg-orange-50 text-orange-600 border border-orange-200'
    default: return 'bg-gray-100 text-gray-600'
  }
}
</script>

<template>
  <main class="p-8 bg-gray-50 min-h-screen font-sans">
    <!-- Header Section -->
    <div class="flex justify-between items-start mb-8">
      

      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestion du Parc Client</h1>
        <p class="text-gray-500 text-sm mt-1">Gérez les abonnements et les accès des établissements hôteliers.</p>
      </div>
      <ButtonComponent
        label="Ajouter un Hôtel"
        variant="primary"
        :iconLeft="Plus"
       />
    </div>

    <!-- Filters / Tabs -->
    <div class="flex gap-3 mb-6">
      <button class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">Tous (1,248)</button>
      <button class="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Actifs (1,102)</button>
      <button class="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Suspendus (14)</button>
      <button class="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Démo (132)</button>
    </div>

    <!-- Table Container -->
    <BaseTable :columns="columns" :data="hotels">
      
      <!-- Slot: Cellule Hôtel -->
      <template #cell-hotel="{ row }">
        <div class="flex flex-col">
          <span class="font-normal text-gray-900">{{ row.name }}</span>
          <span class="text-[10px] text-gray-400 font-medium">ID: {{ row.id }}</span>
        </div>
      </template>

      <!-- Slot: Cellule Statut -->
      <template #cell-status="{ value }">
        <span :class="['px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5', getStatusStyles(value)]">
          <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
          {{ value }}
        </span>
      </template>

      <!-- Slot: Cellule Produits -->
      <template #cell-products="{ row }">
        <div class="flex gap-3 text-blue-500">
          <BedDouble :size="18" :class="row.products.includes('bed-off') ? 'text-gray-200' : ''" />
          <Utensils v-if="row.products.includes('food')" :size="18" />
          <RefreshCcw v-if="row.products.includes('sync')" :size="18" />
          <Smartphone :size="18" :class="row.products.includes('device-off') ? 'text-gray-200' : (row.products.includes('device') ? '' : 'hidden')" />
        </div>
      </template>

      <!-- Slot: Cellule Capacité -->
      <template #cell-capacity="{ value }">
        <span class="text-gray-600">{{ value }}</span>
      </template>

      <!-- Slot: Cellule Contact -->
      <template #cell-contact="{ row }">
        <div class="flex flex-col">
          <span class="font-semibold text-gray-900">{{ row.contactName }}</span>
          <span class="text-xs text-gray-400">{{ row.contactRole }}</span>
        </div>
      </template>

      <!-- Slot: Cellule Actions -->
      <template #cell-actions>
        <router-link to="/details" class="text-purple-500 hover:text-purple-800 text-sm font-bold ">Détails</router-link>
      </template>

      <!-- Slot: Footer (Pagination) -->
      <template #footer>
        <PaginationTable
          :currentPage="currentPage"
          :pageSize="pageSize"
          :totalItems="hotels.length"
          @update:currentPage="currentPage = $event"
        />
      </template>

    </BaseTable>
  </main>
</template>