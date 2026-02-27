<template>
  <div class="space-y-6 p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">

    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ">
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <Banknote :size="20" />
          </div>
          <span class="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">+12.5%</span>
        </div>
        <p class="text-slate-500 text-xs font-medium">Revenu Total</p>
        <h3 class="text-2xl font-black mt-1">145 000 €</h3>
      </div>
      <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ">
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-orange-100 text-orange-500 rounded-lg">
            <Clock :size="20" />
          </div>
          <span class="text-[10px] font-bold text-orange-500 bg-orange-100 px-2 py-1 rounded-full">{{ payments.length }} factures</span>
        </div>
        <p class="text-slate-500 text-xs font-medium">Factures en attente</p>
        <h3 class="text-2xl font-black mt-1">5 420 €</h3>
      </div>
      <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ">
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-red-100 text-red-500 rounded-lg">
            <TriangleAlert :size="20" />
          </div>
          <span class="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-1 rounded-full">Urgent</span>
        </div>
        <p class="text-slate-500 text-xs font-medium">Paiements en retard</p>
        <h3 class="text-2xl font-black mt-1">3 200 €</h3>
      </div>
    </div>

    <!-- Quotas & Table -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Quotas & Dépassements -->
      <div class="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800  overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 class="font-bold text-xs uppercase tracking-wider text-slate-500">Quotas &amp; Dépassements</h3>
          <ChartLine :size="16" class="text-slate-400" />
        </div>

        <div class="p-5 space-y-3">
          <div
            v-for="quota in quotaItems"
            :key="quota.name"
            class="flex flex-col gap-3 p-4 rounded-lg border"
            :class="quota.overLimit
              ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-bold text-sm text-gray-800 dark:text-white">{{ quota.name }}</p>
                <p
                  class="text-xs font-medium mt-0.5"
                  :class="quota.overLimit ? 'text-orange-600' : 'text-slate-500'"
                >
                  {{ quota.detail }}
                </p>
              </div>
              <button class="text-purple-500 hover:text-purple-700 transition-colors">
                <SquarePlus :size="20" />
              </button>
            </div>
            <button
              class="w-full py-2 text-xs font-bold rounded-lg transition-all"
              :class="quota.overLimit
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'"
            >
              Facturer surplus
            </button>
          </div>
        </div>
      </div>

      <!-- Table des factures -->
      <div class="lg:col-span-2  dark:border-slate-800  overflow-hidden flex flex-col">
        <BaseTable :columns="columns" :data="paginatedPayments" :searchable="true" :sortable="false" :title="'Dernières Factures'" :showSearch="true">
          <template #cell-amount="{ value }">
            <span class="font-bold">
              {{ Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) }} FCFA
            </span>
          </template>

          <template #cell-status="{ value }">
            <span
              class="px-2 py-1 text-[10px] font-bold rounded-full uppercase"
              :class="{
                'bg-emerald-100 text-emerald-600': value === 'Payé',
                'bg-purple-100 text-purple-600':   value === 'En attente',
                'bg-red-100 text-red-600':          value === 'En retard',
                'bg-slate-200 text-slate-500':      value === 'Annulé',
              }"
            >
              {{ value }}
            </span>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
              <button
                class="p-1.5 text-slate-400 hover:text-purple-500 transition-colors"
                title="Télécharger PDF"
              >
                <Download :size="16" />
              </button>
              <button
                class="p-1.5 transition-colors"
                :class="row.status === 'En retard'
                  ? 'text-red-400 hover:text-red-600'
                  : 'text-slate-400 hover:text-purple-500'"
                :title="row.status === 'En retard' ? 'Envoyer relance' : 'Envoyer rappel'"
              >
                <Megaphone v-if="row.status === 'En retard'" :size="16" />
                <Mail v-else :size="16" />
              </button>
            </div>
          </template>
        </BaseTable>

       
      </div>
    </div>

    <!-- Geste commercial + Calculateur -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Offrir un mois gratuit -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800  overflow-visible">
        <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div class="p-2 bg-purple-100 text-purple-500 rounded-lg">
            <Gift :size="18" />
          </div>
          <div>
            <h3 class="font-bold text-sm">Offrir un mois gratuit</h3>
            <p class="text-xs text-slate-500">Geste commercial sur un module</p>
          </div>
        </div>
        <div class="p-5 space-y-4">
          <BaseSelect
            lb="Module concerné"
            v-model="selectedModule"
            :options="moduleOptions"
            placeholder="Choisir un module..."
          />
          <button
            class="w-full py-2.5 bg-purple-500 text-white font-bold rounded-lg text-sm hover:bg-purple-600 transition-all flex items-center justify-center gap-2"
            @click="grant"
          >
            <PlusCircle :size="16" />
            Appliquer le geste commercial
          </button>
        </div>
      </div>

      <!-- Calculateur de quotas -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div class="p-2 bg-orange-100 text-orange-500 rounded-lg">
            <ChartLine :size="18" />
          </div>
          <div>
            <h3 class="font-bold text-sm">Calculateur de quotas</h3>
            <p class="text-xs text-slate-500">Détection des dépassements à facturer</p>
          </div>
        </div>
        <div class="p-5 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <BaseInput
              lb="Chambres"
              type="number"
              v-model="rooms"
              placeholder="Ex: 60"
              :min="0"
            />
            <BaseInput
              lb="Terminaux POS"
              type="number"
              v-model="pos"
              placeholder="Ex: 3"
              :min="0"
            />
          </div>
          <button
            class="w-full py-2.5 bg-purple-500 text-white font-bold rounded-lg text-sm hover:bg-purple-600 transition-all"
            @click="calc"
          >
            Calculer les dépassements
          </button>
          <Transition name="fade">
            <div
              v-if="result"
              class="flex items-center gap-3 p-3 rounded-lg text-sm font-medium"
              :class="hasOverage
                ? 'bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/20'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20'"
            >
              <TriangleAlert v-if="hasOverage" :size="16" />
              <CheckCircle v-else :size="16" />
              {{ result }}
            </div>
          </Transition>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Banknote, Clock, TriangleAlert, ChartLine, SquarePlus,
  Search, SlidersHorizontal, Download, Mail, Megaphone,
  Gift, PlusCircle, CheckCircle
} from 'lucide-vue-next'

// Ajustez ces chemins selon votre structure de projet
import BaseTable      from '../../components/Table/BaseTable.vue'
import BaseInput      from '../../components/FormElements/Input.vue'
import BaseSelect     from '../../components/FormElements/Select.vue'
import PaginationTable from '../../components/Pagination/PaginationTable.vue'

// ── Colonnes table ────────────────────────────────────────────────────────────
const columns = [
  { key: 'id',      label: 'ID Facture' },
  { key: 'date',    label: 'Date' },
  { key: 'label',   label: 'Établissement' },
  { key: 'amount',  label: 'Montant' },
  { key: 'status',  label: 'Statut' },
  { key: 'actions', label: '', thClass: 'text-right' },
]

// ── Données ───────────────────────────────────────────────────────────────────
const payments = ref([
  { id: '#INV-2024-001', date: '12 Mai 2024', label: 'Royal Palm Hotel',    amount: 1240,   status: 'Payé'       },
  { id: '#INV-2024-002', date: '10 Mai 2024', label: 'Ocean Breeze Resort', amount: 890.50, status: 'En attente' },
  { id: '#INV-2024-003', date: '05 Mai 2024', label: 'Mountain View Lodge', amount: 2100,   status: 'En retard'  },
  { id: '#INV-2024-004', date: '02 Mai 2024', label: 'Urban Stay Berlin',   amount: 450,    status: 'Annulé'     },
  { id: '#INV-2024-005', date: '28 Avr 2024', label: 'Le Marais Boutique',  amount: 780,    status: 'Payé'       },
  { id: '#INV-2024-006', date: '25 Avr 2024', label: 'Grand Hotel Paris',   amount: 3200,   status: 'En retard'  },
])

// ── Pagination ────────────────────────────────────────────────────────────────
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize    = 4

const filteredPayments = computed(() =>
  payments.value.filter(p =>
    p.label.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

const paginatedPayments = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredPayments.value.slice(start, start + pageSize)
})

// ── Quotas ────────────────────────────────────────────────────────────────────
const quotaItems = ref([
  { name: 'Grand Hotel Paris', detail: '+10 chambres hors quota',    overLimit: true  },
  { name: 'City Hub Lyon',     detail: '+2 terminaux POS',           overLimit: true  },
  { name: 'Boutique Lodge',    detail: 'Utilisation API: +15k appels', overLimit: false },
])

// ── Geste commercial ──────────────────────────────────────────────────────────
const selectedModule = ref<string | number>('PMS')
const moduleOptions = [
  { label: 'PMS',                value: 'PMS'                },
  { label: 'POS',                value: 'POS'                },
  { label: 'Channel Manager',    value: 'Channel Manager'    },
  { label: 'Application Mobile', value: 'Application Mobile' },
]

const grant = () => {
  alert(`1 mois gratuit appliqué sur ${selectedModule.value}`)
}

// ── Calculateur quotas ────────────────────────────────────────────────────────
const rooms      = ref<number>(50)
const pos        = ref<number>(2)
const result     = ref('')
const hasOverage = ref(false)

const calc = () => {
  const extra = Math.max(0, rooms.value - 60) * 2 + Math.max(0, pos.value - 3) * 10
  hasOverage.value = extra > 0
  result.value = extra
    ? `Dépassement détecté : ${extra} € à facturer.`
    : 'Aucun dépassement — quotas respectés.'
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>