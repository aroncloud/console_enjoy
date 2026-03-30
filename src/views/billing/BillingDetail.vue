<template>
  <div class="bg-slate-50 dark:bg-slate-950 min-h-dvh">
    <div class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 sm:py-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <button @click="router.back()" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <ArrowLeft :size="18" />
          </button>
          <div class="min-w-0">
            <h1 class="text-lg font-black text-slate-900 dark:text-white truncate">
              {{ invoice?.invoiceNumber ?? `Invoice #${invoiceId}` }}
            </h1>
            <p class="text-xs text-slate-500 truncate">
              {{ invoice?.hotel?.hotelName ?? invoice?.hotel ?? '—' }}
            </p>
            <p class="text-[10px] text-slate-400 truncate" v-if="subscriptionSummary">
              Subscriptions: {{ subscriptionSummary }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="invoice"
            @click="openInvoicePdf"
            class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="PDF"
            :disabled="invoicePdfLoading"
          >
            <Loader2 v-if="invoicePdfLoading" :size="16" class="animate-spin" />
            <FileText v-else :size="16" />
            PDF
          </button>
          <button
            v-if="invoice"
            @click="openReceiptPdf"
            class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Receipt PDF"
            :disabled="receiptPdfLoading"
          >
            <Loader2 v-if="receiptPdfLoading" :size="16" class="animate-spin" />
            <ReceiptText v-else :size="16" />
            Reçu
          </button>
          <button
            v-if="canAddPayment"
            @click="showAddPayment = true"
            class="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2"
          >
            <PlusCircle :size="16" />
            Ajouter paiement
          </button>
        </div>
      </div>
    </div>

    <div class="p-4 sm:p-6">
      <div v-if="loading" class="space-y-4">
        <div class="h-24 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div class="h-48 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1 space-y-4">
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">Invoice</h3>
              <span
                v-if="invoice?.status"
                class="px-2 inline-flex py-1 text-[10px] font-bold rounded-full whitespace-nowrap uppercase"
                :class="{
                  'bg-emerald-100 text-emerald-600': invoice.status === 'paid',
                  'bg-purple-100 text-purple-600':   invoice.status === 'pending',
                  'bg-red-100 text-red-600':          invoice.status === 'due' || invoice.status === 'failed',
                  'bg-slate-200 text-slate-500':      invoice.status === 'cancelled',
                }"
              >
                {{ invoice.status }}
              </span>
            </div>
            <div class="p-4 space-y-3">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs text-slate-400">Montant</p>
                <p class="text-sm font-black text-slate-900 dark:text-white">
                  {{ formatCurrency(Number(invoice?.totalAmount ?? invoice?.amount ?? 0)) }}
                </p>
              </div>
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs text-slate-400">Devise</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ displayCurrency }}</p>
              </div>
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs text-slate-400">Date facture</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ formatDay(invoice?.billingDate) }}</p>
              </div>
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs text-slate-400">Période</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">
                  {{ formatDay(invoice?.periodStart) }} → {{ formatDay(invoice?.periodEnd) }}
                </p>
              </div>
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs text-slate-400">Payé le</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ formatDayTime(invoice?.paidAt) }}</p>
              </div>
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs text-slate-400">Créé le</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ formatDayTime(invoice?.createdAt) }}</p>
              </div>
            </div>
          </div>

          <div v-if="lastReceipt || lastPayment" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">Dernier paiement</h3>
            </div>
            <div class="p-4 space-y-2">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs text-slate-400">Montant</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ formatCurrency(Number(lastPayment?.amount ?? 0)) }}</p>
              </div>
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs text-slate-400">Date</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ formatDayTime(lastPayment?.paymentDate) }}</p>
              </div>
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs text-slate-400">Méthode</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ lastPayment?.paymentMethod ?? '—' }}</p>
              </div>
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs text-slate-400">Reçu</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ lastReceipt?.receiptNumber ?? '—' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-4">
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">Subscriptions</h3>
            </div>
            <div class="p-4">
              <div v-if="subscriptionLines.length === 0" class="text-sm text-slate-400 text-center py-6">
                —
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="(line, idx) in subscriptionLines"
                  :key="idx"
                  class="flex items-center justify-between gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                >
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {{ line.moduleName ?? `Module #${line.moduleId ?? '—'}` }}
                      <span v-if="line.addOnId" class="text-xs text-slate-500">· Add-on #{{ line.addOnId }}</span>
                    </p>
                    <p class="text-xs text-slate-500">
                      {{ line.billingCycle ?? '—' }}
                      · {{ line.status ?? '—' }}
                      · {{ formatDay(line.startsAt) }} → {{ formatDay(line.endsAt) }}
                      · limit: {{ line.limitCount ?? '—' }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-black text-slate-900 dark:text-white">{{ formatCurrency(Number(line.price ?? 0)) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BaseModal v-model="showAddPayment" customClass="max-w-xl">
      <template #header>
        <div class="flex items-center gap-2">
          <h3 class="font-bold text-slate-900 dark:text-white">Ajouter paiement</h3>
        </div>
      </template>

      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <BaseInput
            lb="Montant"
            type="number"
            v-model="paymentAmount"
            :placeholder="String(invoice?.totalAmount ?? invoice?.amount ?? '')"
            :min="0"
            :disabled="paying"
          />
          <BaseInput
            lb="Devise"
            v-model="paymentCurrency"
            :disabled="true"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <BaseInput lb="Date paiement" type="date" v-model="paymentDateYmd" :disabled="paying" />
          <BaseInput lb="Heure (optionnel)" type="time" v-model="paymentTimeHm" :disabled="paying" />
        </div>

        <BaseSelect
          lb="Méthode"
          v-model="paymentMethod"
          :options="paymentMethodOptions"
          placeholder="—"
          :disabled="paying"
        />

        <BaseInput
          lb="Transaction reference"
          v-model="transactionReference"
          placeholder="TRX-001"
          :disabled="paying"
        />

        <BaseInput
          lb="Notes"
          v-model="paymentNotes"
          placeholder="Paid at reception"
          :disabled="paying"
        />
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <button
            class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
            :disabled="paying"
            @click="showAddPayment = false"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            class="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="paying"
            @click="submitPayment"
          >
            Enregistrer
          </button>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '../../composables/toast'
import { invoiceService } from '../../servicesAPI/invoiceService'
import { formatCurrency } from '../../components/Utilities/function'
import BaseModal from '../../components/Modal/BaseModal.vue'
import BaseInput from '../../components/FormElements/Input.vue'
import BaseSelect from '../../components/FormElements/Select.vue'
import { ArrowLeft, FileText, ReceiptText, PlusCircle, Loader2 } from 'lucide-vue-next'

const { t } = useI18n()
const toastore = useToastStore()
const route = useRoute()
const router = useRouter()

const invoiceId = computed(() => Number(route.params.id))
const loading = ref(false)
const invoice = ref<any | null>(null)
const invoicePdfLoading = ref(false)
const receiptPdfLoading = ref(false)

const lastPayment = ref<any | null>(null)
const lastReceipt = ref<any | null>(null)

const showAddPayment = ref(false)
const paying = ref(false)

const paymentAmount = ref<string>('')
const paymentCurrency = ref<string>('')
const paymentDateYmd = ref<string>('')
const paymentTimeHm = ref<string>('')
const paymentMethod = ref<string>('')
const transactionReference = ref<string>('')
const paymentNotes = ref<string>('')

const paymentMethodOptions = [
  { label: 'Cash', value: 'Cash' },
  { label: 'mobile Money', value: 'mobile Money' },
  { label: 'orange Money', value: 'orange Money' },
  { label: 'Smallpay', value: 'Smallpay' },
]

const normalizeCurrency = (value: any) => {
  const v = String(value ?? '').trim().toUpperCase()
  if (!v) return 'XAF'
  if (v === 'FCFA') return 'XAF'
  if (v === 'FEX') return 'XAF'
  return v
}

const displayCurrency = computed(() => normalizeCurrency(invoice.value?.currency))

const canAddPayment = computed(() => {
  const status = invoice.value?.status
  return status === 'pending' || status === 'failed' || status === 'due'
})

const formatDay = (value: any) => {
  if (!value) return '—'
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const formatDayTime = (value: any) => {
  if (!value) return '—'
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const subscriptionLines = computed(() => {
  const lines = invoice.value?.subscriptions
  if (!Array.isArray(lines)) return []
  return lines.map((l: any) => ({
    moduleId: l.moduleId ?? l.module_id ?? l.module?.id ?? null,
    moduleName: l.module?.name ?? l.module?.moduleName ?? l.moduleName ?? null,
    addOnId: l.addOnId ?? l.add_on_id ?? l.addOn?.id ?? null,
    billingCycle: l.billingCycle ?? l.billing_cycle ?? null,
    price: l.price ?? null,
    limitCount: l.limitCount ?? l.limit_count ?? null,
    status: l.status ?? null,
    startsAt: l.startsAt ?? l.starts_at ?? null,
    endsAt: l.endsAt ?? l.ends_at ?? null,
  }))
})

const subscriptionSummary = computed(() => {
  const lines = subscriptionLines.value
  if (!lines.length) return ''
  return lines
    .map((l) => `${l.moduleName ?? `Module #${l.moduleId ?? '—'}`} (${l.billingCycle ?? '—'})`)
    .join(', ')
})

const fetchInvoice = async () => {
  if (!Number.isFinite(invoiceId.value)) return
  loading.value = true
  try {
    const data = await invoiceService.getInvoiceSubscription(invoiceId.value)
    invoice.value = data
    paymentCurrency.value = normalizeCurrency(data?.currency)
  } catch (e) {
    console.error(e)
    toastore.show({ title: t('common.error'), message: t('common.genericError'), type: 'error' })
  } finally {
    loading.value = false
  }
}

const openBlobInNewTab = (blob: Blob) => {
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

const openInvoicePdf = async () => {
  if (!invoiceId.value) return
  if (invoicePdfLoading.value) return
  invoicePdfLoading.value = true
  try {
    const blob = await invoiceService.getInvoicesSubscriptionsPdf(invoiceId.value)
    openBlobInNewTab(blob)
  } catch (e) {
    console.error(e)
    toastore.show({ title: t('common.error'), message: t('common.genericError'), type: 'error' })
  } finally {
    invoicePdfLoading.value = false
  }
}

const openReceiptPdf = async () => {
  if (!invoiceId.value) return
  if (receiptPdfLoading.value) return
  receiptPdfLoading.value = true
  try {
    const blob = await invoiceService.getInvoicesSubscriptionsReceiptPdf(invoiceId.value)
    openBlobInNewTab(blob)
  } catch (e) {
    console.error(e)
    toastore.show({ title: t('common.error'), message: t('common.genericError'), type: 'error' })
  } finally {
    receiptPdfLoading.value = false
  }
}

const submitPayment = async () => {
  if (!invoiceId.value) return
  paying.value = true
  try {
    const payload: any = {}
    if (paymentAmount.value !== '' && Number.isFinite(Number(paymentAmount.value))) payload.amount = Number(paymentAmount.value)
    payload.currency = normalizeCurrency(paymentCurrency.value || invoice.value?.currency)
    if (paymentMethod.value) payload.paymentMethod = paymentMethod.value
    if (transactionReference.value) payload.transactionReference = transactionReference.value
    if (paymentNotes.value) payload.notes = paymentNotes.value

    if (paymentDateYmd.value) {
      payload.paymentDate = paymentTimeHm.value
        ? `${paymentDateYmd.value}T${paymentTimeHm.value}:00`
        : paymentDateYmd.value
    }

    const res = await invoiceService.createInvoiceSubscriptionPayment(invoiceId.value, payload)
    lastPayment.value = res?.payment ?? null
    lastReceipt.value = res?.receipt ?? null
    toastore.show({ title: t('billing.table.title'), message: t('billing.status.paid'), type: 'success' })
    showAddPayment.value = false
    paymentAmount.value = ''
    paymentDateYmd.value = ''
    paymentTimeHm.value = ''
    paymentMethod.value = ''
    transactionReference.value = ''
    paymentNotes.value = ''
    await fetchInvoice()
  } catch (e) {
    console.error(e)
    toastore.show({ title: t('common.error'), message: t('common.genericError'), type: 'error' })
  } finally {
    paying.value = false
  }
}

onMounted(() => {
  fetchInvoice()
})
</script>
