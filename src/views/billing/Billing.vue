<template>
  <div class="space-y-6 p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">

    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ">
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <Banknote :size="20" />
          </div>
          <!-- <span class="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">+12.5%</span> -->
        </div>
        <p class="text-slate-500 text-xs font-medium">Revenu Total</p>
        <h3 class="text-2xl font-black mt-1">{{ formatCurrency(totalRevenue) }}</h3>
      </div>
      <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ">
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-orange-100 text-orange-500 rounded-lg">
            <Clock :size="20" />
          </div>
          <span class="text-[10px] font-bold text-orange-500 bg-orange-100 px-2 py-1 rounded-full">{{ pendingCount }} facture{{ pendingCount>1 ? 's' : '' }}</span>
        </div>
        <p class="text-slate-500 text-xs font-medium">Factures en attente</p>
        <h3 class="text-2xl font-black mt-1">{{ formatCurrency(pendingAmount) }}</h3>
      </div>
      <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ">
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-red-100 text-red-500 rounded-lg">
            <TriangleAlert :size="20" />
          </div>
          <span class="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-1 rounded-full">Urgent</span>
        </div>
        <p class="text-slate-500 text-xs font-medium">Paiements en retard</p>
        <h3 class="text-2xl font-black mt-1">{{ formatCurrency(overdueAmount) }}</h3>
      </div>
    </div>

    <!-- Quotas & Table -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Quotas & Dépassements -->
      <div class="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 class="font-bold text-xs uppercase tracking-wider text-slate-500">Quotas & Dépassements</h3>
          <ChartLine :size="16" class="text-slate-400" />
        </div>

        <div class="p-5 space-y-3">
          <div v-if="loadingQuotas" class="animate-pulse space-y-3 flex items-start">
            <div v-for="i in 3" :key="i" class="h-20 bg-gray-100 rounded-lg" />
          </div>

          <div v-else-if="quotaItems.length === 0" class="text-center py-6 text-sm text-slate-400">
            Aucun quota défini
          </div>

          <div
            v-else
            v-for="quota in quotaItems"
            :key="quota.id"
            class="flex flex-col gap-3 p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-bold text-sm text-gray-800 dark:text-white">{{ quota.hotel }}</p>
                <p class="text-xs font-medium mt-0.5 text-slate-500">
                  {{ quota.module }} — limite : {{ quota.limitCount }}
                </p>
              </div>
              <span class="text-xs font-bold text-purple-500 bg-purple-50 px-2 py-1 rounded-full">
                {{ formatCurrency(quota.price) }}
              </span>
            </div>
            <button
              @click="openSurplusModal(quota)"
              class="w-full py-2 text-xs font-bold rounded-lg transition-all bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-purple-500 hover:text-white"
            >
              Facturer surplus
            </button>
          </div>
        </div>
      </div>

      <!-- Table des factures -->
      <div class="lg:col-span-2  dark:border-slate-800  overflow-hidden flex flex-col">
        <BaseTable :columns="columns" :data="invoiceData" :searchable="true" :sortable="false" :title="'Factures'" :showSearch="true" :loading="loading" :meta="metaData" @page-change="handlePage">
          <template #cell-amount="{ value }">
            <span class="font-bold text-green-500">
              {{ formatCurrency(Number(value) )}}
            </span>
          </template>

          <template #cell-status="{ value }">
            <span
              class="px-2 py-1 text-[10px] font-bold rounded-full uppercase"
              :class="{
                'bg-emerald-100 text-emerald-600': value === 'paid',
                'bg-purple-100 text-purple-600':   value === 'pending',
                'bg-red-100 text-red-600':          value === 'due',
                'bg-slate-200 text-slate-500':      value === 'cancelled',
              }"
            >
              {{ value }}
            </span>
          </template>

          <template #cell-description="{value}" >
            <span class="text-sm text-gray-500 font-light">{{ value }}</span>
          </template>

           <template #cell-hotel="{value}" >
            <span class="text-sm text-gray-900 font-semibold capitalize">{{ value }}</span>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
              <button
                v-if="row.status === 'pending' || row.status === 'failed'"
                @click="handleMarkAsPaid(row)"
                class="p-1.5 text-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer"
                title="Marquer comme payé"
              >
                <CheckCircle :size="16" />
              </button>

              <span
                v-else-if="row.status === 'paid'"
                class="p-1.5 text-emerald-300 cursor-default"
                title="Déjà payé"
              >
                <CheckCircle :size="16" />
              </span>

              <!-- Relance / rappel -->
              <button
                class="p-1.5 transition-colors cursor-pointer"
                :class="row.status === 'failed'
                  ? 'text-red-400 hover:text-red-600'
                  : 'text-slate-400 hover:text-purple-500'"
                :title="row.status === 'failed' ? 'Envoyer relance' : 'Envoyer rappel'"
              >
                <Megaphone v-if="row.status === 'failed'" :size="16" />
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
    
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-visible">
        <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div class="p-2 bg-purple-100 text-purple-500 rounded-lg">
            <Gift :size="18" />
          </div>
          <div>
            <h3 class="font-bold text-sm">Offrir un mois gratuit</h3>
            <p class="text-xs text-slate-500">Geste commercial sur un abonnement</p>
          </div>
        </div>
        <div class="p-5 space-y-4">
          <BaseSelect
            lb="Hôtel"
            v-model="selectedHotelId"
            :options="hotelOptions"
            placeholder="Choisir un hôtel..."
            @update:modelValue="loadHotelSubscriptions"
          />
          <BaseSelect
            lb="Abonnement"
            v-model="selectedSubscriptionId"
            :options="subscriptionOptions"
            placeholder="Choisir un abonnement..."
            :disabled="!selectedHotelId"
          />
          <button
            :disabled="!selectedSubscriptionId || loadingExtend"
            @click="handleExtend"
            class="w-full py-2.5 bg-purple-500 text-white font-bold rounded-lg text-sm hover:bg-purple-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle :size="16" />
            {{ loadingExtend ? 'Application...' : 'Appliquer le geste commercial' }}
          </button>
          <p v-if="extendSuccess" class="text-xs text-emerald-600 font-medium text-center">
            ✓ +1 mois appliqué avec succès
          </p>
        </div>
      </div>

     <!-- Calculateur de quotas -->
      <div id="calculateur"  class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
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
          <BaseSelect
            lb="Abonnement concerné"
            v-model="calcSubscriptionId"
            :options="quotaItems.map(q => ({ label: `${q.hotel} — ${q.module}`, value: q.id }))"
            placeholder="Choisir un abonnement..."
          />
          <BaseInput
            lb="Quantité utilisée"
            type="number"
            v-model="usedQuantity"
            placeholder="Ex: 70"
            :min="0"
          />
          <button
            class="w-full py-2.5 bg-purple-500 text-white font-bold rounded-lg text-sm hover:bg-purple-600 transition-all"
            @click="calc"
            :disabled="!calcSubscriptionId"
          >
            Calculer le dépassement
          </button>

          <Transition name="fade">
            <div v-if="result" class="space-y-3">
              <div
                class="flex items-center gap-3 p-3 rounded-lg text-sm font-medium"
                :class="hasOverage
                  ? 'bg-orange-50 text-orange-700 border border-orange-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'"
              >
                <TriangleAlert v-if="hasOverage" :size="16" />
                <CheckCircle v-else :size="16" />
                {{ result }}
              </div>

              <button
                v-if="hasOverage"
                @click="handleFactureSurplus"
                :disabled="loadingFacture"
                class="w-full py-2 bg-orange-500 text-white font-bold rounded-lg text-xs hover:bg-orange-600 transition-all disabled:opacity-50"
              >
                {{ loadingFacture ? 'Génération...' : 'Générer la facture de surplus' }}
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed,onMounted } from 'vue'
import {
  Banknote, Clock, TriangleAlert, ChartLine,
  Mail, Megaphone,
  Gift, PlusCircle, CheckCircle
} from 'lucide-vue-next'

// Ajustez ces chemins selon votre structure de projet
import BaseTable      from '../../components/Table/BaseTable.vue'
import BaseInput      from '../../components/FormElements/Input.vue'
import BaseSelect     from '../../components/FormElements/Select.vue'
import { invoiceService } from '../../servicesAPI/invoiceService'
import { formatCurrency } from '../../components/Utilities/function'


// ── Colonnes table ─
const columns = [
  { key: 'invoiceNumber',      label: 'Numero Facture' },
  { key: 'billingDate',    label: 'Date' },
  { key: 'hotel',   label: 'Établissement' },
  { key:'description' , label:'Description'},
  { key: 'amount',  label: 'Montant' },
  { key: 'status',  label: 'Statut' },
  { key: 'actions', label: '', thClass: 'text-right' },
]


const searchQuery = ref('')
const metaData = ref<any>()
const invoiceData = ref<any[]>([])
const loading = ref(false)
const statsData = ref<any>(null)


// ── Quotas ───────────


// ── Geste commercial ───────
const selectedModule = ref<string | number>('PMS')




const openSurplusModal = (quota: any) => {
  calcSubscriptionId.value = quota.id
  usedQuantity.value = quota.limitCount // pré-rempli avec la limite
  result.value = ''
  hasOverage.value = false

  // Scroll vers le calculateur
  document.querySelector('#calculateur')?.scrollIntoView({ behavior: 'smooth' })
}


const fetchData = async ( currentPage=1) => {
  loading.value = true
  try {
    const response  = await invoiceService.get({
      page: currentPage,
      search: searchQuery.value,
    })
    invoiceData.value = response.invoices?.data || []
    metaData.value = response.invoices?.meta || []
    statsData.value = response?.stats || null
    console.log('response',response)
  } catch(e:any){
    console.log('error',e)
  }
  finally {
    loading.value = false
  }
}

const handlePage = (newPage:number)=>{
  fetchData(newPage)
}

// Stats
const totalRevenue  = computed(() => statsData.value?.totalRevenue  ?? 0)
const pendingAmount = computed(() => statsData.value?.pendingAmount ?? 0)
const pendingCount  = computed(() => statsData.value?.pendingCount  ?? 0)
const overdueAmount = computed(() => statsData.value?.overdueAmount ?? 0)

const handleMarkAsPaid = async () => {
  try {
    // await invoiceService.markAsPaid(row.id)
    // await fetchData()
  } catch (e) {
    console.error('Erreur paiement', e)
  }
}

import { subscriptionService } from '../../servicesAPI/subscriptionService'

// ── Quotas ───────────────────
const quotaItems = ref<any[]>([])
const loadingQuotas = ref(false)

const fetchQuotas = async () => {
  loadingQuotas.value = true
  try {
    quotaItems.value = await invoiceService.getQuotas()
  } finally {
    loadingQuotas.value = false
  }
}

// ── Geste commercial ──────────
const selectedHotelId = ref<number | null>(null)
const selectedSubscriptionId = ref<number | null>(null)
const subscriptionOptions = ref<{ label: string; value: number }[]>([])
const loadingExtend = ref(false)
const extendSuccess = ref(false)

const hotelOptions = computed(() =>
  [...new Map(quotaItems.value.map(q => [q.hotelId, { label: q.hotel, value: q.hotelId }])).values()]
)

const loadHotelSubscriptions = () => {
  selectedSubscriptionId.value = null
  subscriptionOptions.value = quotaItems.value
    .filter(q => q.hotelId === selectedHotelId.value)
    .map(q => ({ label: q.module, value: q.id }))
}

const handleExtend = async () => {
  if (!selectedSubscriptionId.value) return
  loadingExtend.value = true
  extendSuccess.value = false
  try {
    await subscriptionService.extend(selectedSubscriptionId.value)
    extendSuccess.value = true
    setTimeout(() => extendSuccess.value = false, 3000)
  } finally {
    loadingExtend.value = false
  }
}

// ── Calculateur ───────────────────
const calcSubscriptionId = ref<number | null>(null)
const usedQuantity = ref<number>(0)
const result = ref('')
const hasOverage = ref(false)
const surplusAmount = ref(0)
const loadingFacture = ref(false)

const calc = () => {
  const sub = quotaItems.value.find(q => q.id === calcSubscriptionId.value)
  if (!sub) return

  const extra = Math.max(0, usedQuantity.value - sub.limitCount)
  const pricePerUnit = sub.price / sub.limitCount
  surplusAmount.value = Math.round(extra * pricePerUnit)
  hasOverage.value = extra > 0
  result.value = extra
    ? `Dépassement de ${extra} unités — surplus à facturer : ${formatCurrency(surplusAmount.value)}`
    : 'Aucun dépassement — quota respecté.'
}

const handleFactureSurplus = async () => {
  const sub = quotaItems.value.find(q => q.id === calcSubscriptionId.value)
  if (!sub) return
  loadingFacture.value = true
  try {
    await invoiceService.factureSurplus(sub.hotelId, {
      subscriptionId: sub.id,
      quantity: usedQuantity.value - sub.limitCount,
      amount: surplusAmount.value,
      description: `Surplus de ${usedQuantity.value - sub.limitCount} ${sub.moduleName} (limite: ${sub.limitCount})`
    })
    result.value = '✓ Facture de surplus générée avec succès'
    hasOverage.value = false
    await fetchData()
  } finally {
    loadingFacture.value = false
  }
}

onMounted(() => {
  fetchData()
  fetchQuotas()
})









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
