<template>
  <div class="space-y-6 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 min-h-dvh">

    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ">
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <Banknote :size="20" />
          </div>
          <!-- <span class="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">+12.5%</span> -->
        </div>
        <p class="text-slate-500 text-xs font-medium">{{ t('billing.kpis.totalRevenue') }}</p>
        <h3 class="text-2xl font-black mt-1">{{ formatCurrency(totalRevenue) }}</h3>
      </div>
      <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ">
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-orange-100 text-orange-500 rounded-lg">
            <Clock :size="20" />
          </div>
          <span class="text-[10px] font-bold text-orange-500 bg-orange-100 px-2 py-1 rounded-full">{{ pendingCount }} {{ pendingCountLabel }}</span>
        </div>
        <p class="text-slate-500 text-xs font-medium">{{ t('billing.kpis.pendingInvoices') }}</p>
        <h3 class="text-2xl font-black mt-1">{{ formatCurrency(pendingAmount) }}</h3>
      </div>
      <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ">
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-red-100 text-red-500 rounded-lg">
            <TriangleAlert :size="20" />
          </div>
          <span class="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-1 rounded-full">{{ t('billing.kpis.urgent') }}</span>
        </div>
        <p class="text-slate-500 text-xs font-medium">{{ t('billing.kpis.overduePayments') }}</p>
        <h3 class="text-2xl font-black mt-1">{{ formatCurrency(overdueAmount) }}</h3>
      </div>
    </div>

    <!-- Quotas & Table -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Quotas & Dépassements -->
      <div class="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="px-4 sm:px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 class="font-bold text-xs uppercase tracking-wider text-slate-500">{{ t('billing.quotas.title') }}</h3>
          <ChartLine :size="16" class="text-slate-400" />
        </div>

        <div class="p-4 sm:p-5 space-y-3 max-h-100 overflow-y-auto scrollbar">
          <div v-if="loadingQuotas" class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-20 w-full bg-gray-100 rounded-lg animate-pulse" />
          </div>

          <div v-else-if="quotaItems.length === 0" class="text-center py-6 text-sm text-slate-400">
            {{ t('billing.quotas.empty') }}
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
                  {{ quota.module }} — {{ t('billing.quotas.limit') }} : {{ quota.limitCount }}
                </p>
              </div>
              <span class="text-xs font-bold text-purple-500 bg-purple-50 px-2 py-1 rounded-full">
                {{ formatCurrency(quota.price) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Table des factures -->
      <div class="lg:col-span-2  dark:border-slate-800  overflow-hidden flex flex-col">
        <BaseTable :columns="columns" :data="invoiceData" :searchable="true" :sortable="false" :title="t('billing.table.title')" :showSearch="true" :loading="loading" :meta="metaData" @page-change="handlePage"  @limit-change="handleLimit" 
        :defaultPageSize=5
        >
          <template #cell-amount="{ value }">
            <span class="font-bold text-green-500">
              {{ formatCurrency(Number(value) )}}
            </span>
          </template>

          <template #cell-status="{ value }">
            <span
              class="px-2 inline-flex py-1 text-[10px] font-bold rounded-full whitespace-nowrap uppercase"
              :class="{
                'bg-emerald-100 text-emerald-600': value === 'paid',
                'bg-purple-100 text-purple-600':   value === 'pending',
                'bg-red-100 text-red-600':          value === 'due',
                'bg-slate-200 text-slate-500':      value === 'cancelled',
              }"
            >
              {{ getInvoiceStatusLabel(value) }}
            </span>
          </template>

           <template #cell-billingDate="{value}" >
            <span class="text-sm text-gray-600 dark:text-white whitespace-nowrap">{{ value }}</span>
          </template>
          <template #cell-description="{value}" >
            <span class="text-sm text-gray-500 dark:text-slate-400 font-light">{{ value }}</span>
          </template>

           <template #cell-hotel="{value}" >
            <span class="text-sm text-gray-900 dark:text-white font-semibold capitalize">{{ value }}</span>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
              <button
                @click="goToInvoiceDetails(row)"
                class="p-1.5 text-slate-400 hover:text-purple-500 transition-colors cursor-pointer"
                :title="t('common.details')"
              >
                <Eye :size="16" />
              </button>

              <button
                @click="openInvoicePdf(row)"
                class="p-1.5 text-slate-400 hover:text-purple-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                :title="'PDF'"
                :disabled="pdfLoadingId === Number(row?.id)"
              >
                <Loader2 v-if="pdfLoadingId === Number(row?.id)" :size="16" class="animate-spin" />
                <FileText v-else :size="16" />
              </button>

              <button
                @click="openReceiptPdf(row)"
                class="p-1.5 text-slate-400 hover:text-purple-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                :title="'Receipt PDF'"
                :disabled="receiptLoadingId === Number(row?.id)"
              >
                <Loader2 v-if="receiptLoadingId === Number(row?.id)" :size="16" class="animate-spin" />
                <ReceiptText v-else :size="16" />
              </button>

              <button
                v-if="row.status === 'pending' || row.status === 'failed'"
                @click="handleMarkAsPaid(row)"
                class="p-1.5 text-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer"
                :title="t('billing.actions.markAsPaid')"
              >
                <CheckCircle :size="16" />
              </button>

              <span
                v-else-if="row.status === 'paid'"
                class="p-1.5 text-emerald-300 cursor-default"
                :title="t('billing.actions.alreadyPaid')"
              >
                <CheckCircle :size="16" />
              </span>

              <!-- Relance / rappel -->
              <button
                class="p-1.5 transition-colors cursor-pointer"
                :class="row.status === 'failed'
                  ? 'text-red-400 hover:text-red-600'
                  : 'text-slate-400 hover:text-purple-500'"
                :title="row.status === 'failed' ? t('billing.actions.sendFollowUp') : t('billing.actions.sendReminder')"
              >
                <Megaphone v-if="row.status === 'failed'" :size="16" />
                <Mail v-else :size="16" />
              </button>

            </div>
          </template>
        </BaseTable>

       
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '../../composables/toast'
import { useRouter } from 'vue-router'
import {
  Banknote, Clock, TriangleAlert, ChartLine,
  Mail, Megaphone,
  CheckCircle,
  FileText, ReceiptText, Eye, Loader2
} from 'lucide-vue-next'

import BaseTable      from '../../components/Table/BaseTable.vue'
import { invoiceService } from '../../servicesAPI/invoiceService'
import { formatCurrency } from '../../components/Utilities/function'

const { t } = useI18n()

// ── Colonnes table ─
const columns = computed(() => [
  { key: 'invoiceNumber', label: t('billing.table.invoiceNumber') },
  { key: 'billingDate', label: t('billing.table.billingDate') },
  { key: 'hotel', label: t('billing.table.hotel') },
  { key: 'description', label: t('billing.table.description') },
  { key: 'amount', label: t('billing.table.amount') },
  { key: 'status', label: t('billing.table.status') },
  { key: 'actions', label: '', thClass: 'text-right' },
])

const toastore = useToastStore()
const router = useRouter()
const searchQuery = ref('')
const metaData = ref<any>()
const invoiceData = ref<any[]>([])
const loading = ref(false)
const statsData = ref<any>(null)
const limit = ref(5)
const pdfLoadingId = ref<number | null>(null)
const receiptLoadingId = ref<number | null>(null)

// ── Quotas ───────────────────
const quotaItems = ref<any[]>([])
const loadingQuotas = ref(false)
const paying = ref(false)

const markInvoiceAsPaid = async (id: number) => {
  paying.value = true
  try {
    await invoiceService.createInvoiceSubscriptionPayment(id, {})
    toastore.show({ title: t('billing.table.title'), message: t('billing.status.paid'), type: 'success' })
    await fetchData(metaData.value?.currentPage ?? 1)
  } catch (e) {
    console.error(e)
    toastore.show({ title: t('common.error'), message: t('common.genericError'), type: 'error' })
  } finally {
    paying.value = false
  }
}

const goToInvoiceDetails = (row: any) => {
  if (!row?.id) return
  router.push({ name: 'billing-detail', params: { id: String(row.id) } })
}


const fetchData = async ( currentPage=1) => {
  loading.value = true
  try {
    const response  = await invoiceService.get({
      page: currentPage,
      limit: limit.value,
      search: searchQuery.value,
    })
    invoiceData.value = response.invoices?.data || []
    metaData.value = response.invoices?.meta || []
    statsData.value = response?.stats || null
   console.log('META:', invoiceData.value)
  } catch(e:any){
    console.error('error',e)
    toastore.show({
      title: t('common.error'), message: t('billing.toast.loadError'), type:'error'
    })
  }
  finally {
    loading.value = false
  }
}

const handlePage = (newPage:number)=>{
  fetchData(newPage)
}

const handleLimit = (l: number) => {
  limit.value = l
  fetchData(1)
}

// Stats
const totalRevenue  = computed(() => statsData.value?.totalRevenue  ?? 0)
const pendingAmount = computed(() => statsData.value?.pendingAmount ?? 0)
const pendingCount  = computed(() => statsData.value?.pendingCount  ?? 0)
const overdueAmount = computed(() => statsData.value?.overdueAmount ?? 0)
const pendingCountLabel = computed(() => pendingCount.value > 1 ? t('billing.invoices') : t('billing.invoice'))

const getInvoiceStatusLabel = (status: string) => {
  if (status === 'paid') return t('billing.status.paid')
  if (status === 'pending') return t('billing.status.pending')
  if (status === 'due') return t('billing.status.due')
  if (status === 'cancelled') return t('billing.status.cancelled')
  if (status === 'failed') return t('billing.status.failed')
  return status
}

const handleMarkAsPaid = async (row: any) => {
  if (!row?.id) return
  await markInvoiceAsPaid(Number(row.id))
}

const openBlobInNewTab = (blob: Blob) => {
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

const openInvoicePdf = async (row: any) => {
  const id = Number(row?.id)
  if (!id) return
  if (pdfLoadingId.value === id) return
  pdfLoadingId.value = id
  try {
    const blob = await invoiceService.getInvoicesSubscriptionsPdf(id)
    openBlobInNewTab(blob)
  } catch (e) {
    console.error(e)
    toastore.show({ title: t('common.error'), message: t('common.genericError'), type: 'error' })
  } finally {
    if (pdfLoadingId.value === id) pdfLoadingId.value = null
  }
}

const openReceiptPdf = async (row: any) => {
  const id = Number(row?.id)
  if (!id) return
  if (receiptLoadingId.value === id) return
  receiptLoadingId.value = id
  try {
    const blob = await invoiceService.getInvoicesSubscriptionsReceiptPdf(id)
    openBlobInNewTab(blob)
  } catch (e) {
    console.error(e)
    toastore.show({ title: t('common.error'), message: t('common.genericError'), type: 'error' })
  } finally {
    if (receiptLoadingId.value === id) receiptLoadingId.value = null
  }
}





const fetchQuotas = async () => {
  loadingQuotas.value = true
  try {
    quotaItems.value = await invoiceService.getQuotas()
    console.log('quota',quotaItems.value)
  }catch(e:any){
    console.error(e)
  } finally {
    loadingQuotas.value = false
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

/* Custom thin scrollbar */
.scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
  scrollbar-gutter: stable;
}

.scrollbar::-webkit-scrollbar {
  width: 6px;
}

.scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

.dark .scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}

.dark .scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #6b7280;
}
</style>
