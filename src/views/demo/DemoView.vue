<script setup lang="ts">
import { ref, computed, watch, onMounted,reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  MonitorPlay, Search, Clock, CheckCircle, 
   Calendar, Mail, MailCheck, Eye,
  Building2, Phone, Globe, BedDouble,Edit
} from 'lucide-vue-next'

import Input              from '../../components/FormElements/Input.vue'
import ButtonComponent    from '../../components/Button/ButtonComponent.vue'
import BaseTable          from '../../components/Table/BaseTable.vue'
import type { Column }    from '../../components/Table/BaseTable.vue'
import BaseModal          from '../../components/Modal/BaseModal.vue'
import Select from '../../components/FormElements/Select.vue'
import Toggle from '../../components/FormElements/Toggle.vue'
import { useToastStore }  from '../../composables/toast'
import { demoService }    from '../../servicesAPI/demoService'
import type { Demo, DemoStatus, UpdateDemoPayload } from '../../servicesAPI/demoService'


const demos        = ref<Demo[]>([])
const allDemos        = ref<Demo[]>([])
const loading      = ref(false)
const saving       = ref(false)
const searchQuery  = ref('')
const filterStatus = ref<DemoStatus | 'all'>('all')
const toastStore   = useToastStore()
const { t, locale } = useI18n()
const page  = ref(1)
const limit = ref(20)
const meta  = ref<any>(null)

//  Modales 
const showDetailModal = ref(false)
const editingDemo     = ref<Demo | null>(null)
const detailDemo      = ref<Demo | null>(null)
const showEditModal = ref(false)


const columns = computed<Column[]>(() => [
  { key: 'contact',   label: t('demos.table.contact') },
  { key: 'company',   label: t('demos.table.company') },
  { key: 'rooms',     label: t('demos.table.rooms'), sortable: false },
  { key: 'createdAt', label: t('demos.table.date'), sortable: false },
  { key: 'status',    label: t('demos.table.status'), sortable: false },
  { key: 'actions',   label: t('common.actions'), sortable: false },
])


const ALL_STATUSES: DemoStatus[] = [
  'New', 'Qualified', 'Demo Scheduled', 'Demo Completed',
  'Trial', 'Negotiation', 'Converted', 'Lost', 'Junk',
]

const statusConfig = computed<Record<DemoStatus, { label: string; classes: string }>>(() => ({
  New: { label: t('demos.status.new'), classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' },
  Qualified: { label: t('demos.status.qualified'), classes: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' },
  'Demo Scheduled': { label: t('demos.status.demoScheduled'), classes: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' },
  'Demo Completed': { label: t('demos.status.demoCompleted'), classes: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200' },
  Trial: { label: t('demos.status.trial'), classes: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200' },
  Negotiation: { label: t('demos.status.negotiation'), classes: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' },
  Converted: { label: t('demos.status.converted'), classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200' },
  Lost: { label: t('demos.status.lost'), classes: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200' },
  Junk: { label: t('demos.status.junk'), classes: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
}))

const getStatus = (s: string) =>
  statusConfig.value[s as DemoStatus] ?? { label: s, classes: 'bg-slate-100 text-slate-500' }


const fetchDemos = async (p = 1) => {
  loading.value = true
  try {
    const res = await demoService.getAll({
      page:   p,
      limit:  limit.value,
      search: searchQuery.value || undefined,
      status: filterStatus.value === 'all' ? undefined : filterStatus.value,
    })
    demos.value = res.data
    meta.value = {
      total:      res.meta.total,
      page:       res.meta.currentPage,
      limit:      res.meta.perPage,
      totalPages: res.meta.lastPage,
    }
  } catch (e) {
    console.error(e)
    toastStore.show({ message: t('demos.toast.loadError'), type: 'error' })
  } finally {
    loading.value = false
  }
}

const fetchAllDemos = async () => {
  loading.value = true
  try {
    const res = await demoService.getAll({
    all: true 
    })
    allDemos.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
    fetchDemos(1)
    fetchAllDemos()

})

watch([searchQuery, filterStatus], () => { page.value = 1; fetchDemos(1) })
watch(page, (p) => fetchDemos(p))

const handlePageChange = (newPage: number) => { page.value = newPage }

const countNew       = computed(() => allDemos.value.filter(d => d.status === 'New').length)
const countConverted = computed(() => allDemos.value.filter(d => d.status === 'Converted').length)

//  Détail 
const openDetail = (row: any) => {
  detailDemo.value    = row
  showDetailModal.value = true
}

//  Update demo

const editForm = reactive({
  contactName: '',
  companyName: '',
  email: '',
  phoneNumber: '',
  country: '',
  numberOfRooms: 0,
  propertyType: '',
  preferredLanguage: '',
  leadSource: '',
  notesMessage: '',
  competition: '',
  status: 'New' as DemoStatus,
  followUpDate: '',
  ownerId: null as number | null,
  acceptCondition:   false,
  emailSend:  false,
})

const editFormErrors = reactive({
  contactName: '',
  companyName: '',
  email:       '',
})

const openEditModal = (row: any) => {
    console.log('row',row)
  editingDemo.value          = row
  editForm.contactName       = row.contactName
  editForm.companyName       = row.companyName
  editForm.email             = row.email
  editForm.phoneNumber       = row.phoneNumber       ?? ''
  editForm.country           = row.country           ?? ''
  editForm.numberOfRooms     = row.numberOfRooms     ?? 0
  editForm.propertyType      = row.propertyType      ?? ''
  editForm.preferredLanguage = row.preferredLanguage ?? ''
  editForm.leadSource        = row.leadSource        ?? ''
  editForm.notesMessage      = row.notesMessage      ?? ''
  editForm.competition       = row.competition       ?? ''
  editForm.status            = row.status
  editForm.followUpDate      = row.followUpDate      ?? ''
  editForm.ownerId           = row.ownerId           ?? null
  editForm.acceptCondition   = row.acceptCondition
  editForm.emailSend         = row.emailSend
  editFormErrors.contactName = ''
  editFormErrors.companyName = ''
  editFormErrors.email       = ''
  showEditModal.value = true
}

const validateEditForm = () => {
  editFormErrors.contactName = editForm.contactName.trim() ? '' : t('demos.validation.contactNameRequired')
  editFormErrors.companyName = editForm.companyName.trim() ? '' : t('demos.validation.companyNameRequired')
  editFormErrors.email       = editForm.email.trim()       ? '' : t('demos.validation.emailRequired')
  return !editFormErrors.contactName && !editFormErrors.companyName && !editFormErrors.email
}

const handleUpdate = async () => {
  if (!validateEditForm() || !editingDemo.value) return
  saving.value = true
  try {
    const payload: UpdateDemoPayload = {
      contactName:       editForm.contactName.trim(),
      companyName:       editForm.companyName.trim(),
      email:             editForm.email.trim(),
      phoneNumber:       editForm.phoneNumber.trim()       || null,
      country:           editForm.country.trim()           || null,
      numberOfRooms:     editForm.numberOfRooms            || null,
      propertyType:      editForm.propertyType.trim()      || null,
      preferredLanguage: editForm.preferredLanguage.trim() || null,
      leadSource:        editForm.leadSource.trim()        || null,
      notesMessage:      editForm.notesMessage.trim()      || null,
      competition:       editForm.competition.trim()       || null,
      status:            editForm.status,
      followUpDate:      editForm.followUpDate             || null,
      ownerId:           editForm.ownerId,
      acceptCondition:   editForm.acceptCondition,
      emailSend:         editForm.emailSend,
    }
    await demoService.update(editingDemo.value.id, payload)
    toastStore.show({ message: t('demos.toast.updated'), type: 'success' })
    showEditModal.value = false
    editingDemo.value   = null
    await fetchDemos(page.value)
  } catch (e) {
    console.error(e)
    toastStore.show({ message: t('common.errors.save'), type: 'error' })
  } finally {
    saving.value = false
  }
}



//  Renvoi email 
const handleResendEmail = async (row: any) => {
  try {
    await demoService.resendEmail(row.id)
    toastStore.show({ message: t('demos.toast.emailResent'), type: 'success' })
    await fetchDemos(page.value)
  } catch (e) {
    toastStore.show({ message: t('demos.toast.emailResendError'), type: 'error' })
  }
}



const statusOptions = computed(() => [
  { label: t('demos.filters.allStatuses'), value: 'all' },
  ...ALL_STATUSES.map(s => ({ label: statusConfig.value[s].label, value: s }))
])

const formatDate = (iso: string) => {
  const loc = locale.value === 'fr' ? 'fr-FR' : 'en-US'
  return new Date(iso).toLocaleDateString(loc, { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen space-y-6">

    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ t('demos.title') }}</h1>
      <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">
        {{ t('demos.subtitle') }}
      </p>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div class="flex items-center justify-between mb-2">
          <div class="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <MonitorPlay :size="18" class="text-slate-600 dark:text-slate-300" />
          </div>
          <span class="text-[10px] font-bold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">{{ t('common.total') }}</span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">{{ t('demos.kpis.received') }}</p>
        <p class="text-2xl font-black mt-1 text-slate-900 dark:text-white">{{ allDemos.length ?? 0 }}</p>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div class="flex items-center justify-between mb-2">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Clock :size="18" class="text-blue-600 dark:text-blue-400" />
          </div>
          <span class="text-[10px] font-bold text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">{{ t('demos.kpis.new') }}</span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">{{ t('demos.kpis.toProcess') }}</p>
        <p class="text-2xl font-black mt-1 text-slate-900 dark:text-white">{{ countNew }}</p>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div class="flex items-center justify-between mb-2">
          <div class="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <CheckCircle :size="18" class="text-emerald-600 dark:text-emerald-400" />
          </div>
          <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">{{ t('demos.kpis.converted') }}</span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">{{ t('demos.kpis.convertedClients') }}</p>
        <p class="text-2xl font-black mt-1 text-slate-900 dark:text-white">{{ countConverted }}</p>
      </div>
    </div>

    <!-- Filtres + Recherche -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-3">
  <div class="flex-1 relative">
    <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10" />
    <Input v-model="searchQuery" :placeholder="t('demos.searchPlaceholder')" customClass="pl-9 w-full" />
  </div>

  <div class="w-full sm:w-52 shrink-0">
    <Select v-model="filterStatus" :options="statusOptions" />
  </div>
</div>

    <!-- Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <BaseTable
        :columns="columns"
        :data="demos"
        :loading="loading"
        :show-search="false"
        :meta="meta"
        @page-change="handlePageChange"
      >
        <!-- Contact -->
        <template #cell-contact="{ row }">
          <div class="min-w-0">
            <p class="font-bold text-sm text-slate-900 dark:text-white truncate">{{ row.contactName }}</p>
            <p class="text-xs text-slate-400 truncate mt-0.5">{{ row.email }}</p>
          </div>
        </template>

        <!-- Société -->
        <template #cell-company="{ row }">
          <div class="min-w-0">
            <p class="text-sm text-slate-700 dark:text-slate-200 truncate">{{ row.companyName }}</p>
            <p v-if="row.country" class="text-xs text-slate-400 truncate mt-0.5">{{ row.country }}</p>
          </div>
        </template>

        <!-- Chambres -->
        <template #cell-rooms="{ row }">
          <span class="text-sm text-slate-600 dark:text-slate-300">
            {{ row.numberOfRooms != null ? row.numberOfRooms : '—' }}
          </span>
        </template>

        <!-- Date -->
        <template #cell-createdAt="{ row }">
          <div class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Calendar :size="13" />
            <span class="text-xs">{{ formatDate(row.createdAt) }}</span>
          </div>
        </template>

        <!-- Statut cliquable -->
        <!-- <template #cell-status="{ row }">
          <button
            @click.stop="openStatusModal(row)"
            :class="['text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 transition-opacity hover:opacity-75 whitespace-nowrap', getStatus(row.status).classes]"
          >
            {{ getStatus(row.status).label }}
            <ChevronDown :size="11" />
          </button>
        </template> -->
        <template #cell-status="{ row }">
          <span
            :class="[' text-xs font-semibold px-2 py-1 rounded-full inline-flex items-center gap-1 transition-opacity hover:opacity-75 whitespace-nowrap', getStatus(row.status).classes]"
          >
            {{ getStatus(row.status).label }}
            
          </span>
        </template>

        <!-- Actions -->
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1">
            <!-- Voir le détail -->
            <ButtonComponent variant="ghost" size="sm" :iconLeft="Eye"
              :aria-label="t('common.details')" @click.stop="openDetail(row)" />
            <ButtonComponent variant="ghost" size="sm" :iconLeft="Edit"
                :aria-label="t('common.edit')" @click.stop="openEditModal(row)" />
            <ButtonComponent
              variant="ghost" size="sm"
              :iconLeft="row.emailSend ? MailCheck : Mail"
              :aria-label="row.emailSend ? t('demos.actions.emailSent') : t('demos.actions.resendEmail')"
              :class="row.emailSend ? 'text-emerald-500' : ''"
              @click.stop="handleResendEmail(row)"
            />
           
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- ── Modal update ── -->
     <BaseModal v-model="showEditModal" customClass="max-w-4xl">
        <template #header>
            <div>
            <h3 class="font-black text-slate-900 dark:text-white">{{ t('demos.edit.title') }}</h3>
            <p class="text-xs text-slate-400 mt-0.5">
                {{ editingDemo?.contactName }} — {{ editingDemo?.companyName }}
            </p>
            </div>
        </template>

        <div class="space-y-4 ">

            <!-- Statut -->
            <div>
                 <Select v-model="editForm.status" :options="statusOptions" :lb="t('common.status')" :disabled="saving"  :is-required="true"/>
           
            </div>

            <!-- Ligne 1 : Nom + Société -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input v-model="editForm.contactName" :lb="t('demos.fields.contactName')"
                :placeholder="t('demos.placeholders.contactName')"
                :errorMsg="editFormErrors.contactName"
                :disabled="saving" customClass="w-full" isRequired />
            <Input v-model="editForm.companyName" :lb="t('demos.fields.companyName')"
                :placeholder="t('demos.placeholders.companyName')"
                :errorMsg="editFormErrors.companyName"
                :disabled="saving" customClass="w-full" isRequired />
            <Input v-model="editForm.leadSource" :lb="t('demos.fields.leadSource')"
                :placeholder="t('demos.placeholders.leadSource')"
                :disabled="saving" customClass="w-full" />

            </div>

            <!-- Ligne 2 : Email + Téléphone -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input v-model="editForm.email" :lb="t('users.fields.email')" type="email"
                placeholder="jean@hotel.com"
                :errorMsg="editFormErrors.email"
                :disabled="saving" customClass="w-full" isRequired />
            <Input v-model="editForm.phoneNumber" :lb="t('demos.fields.phoneNumber')"
                placeholder="+237690000000"
                :disabled="saving" customClass="w-full" />
            <Input v-model="editForm.country" :lb="t('hotelForm.fields.country')"
                :placeholder="t('demos.placeholders.country')"
                :disabled="saving" customClass="w-full" />
            </div>

            <!-- Ligne 3 : Pays + Chambres -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input v-model="editForm.propertyType" :lb="t('demos.fields.propertyType')"
                :placeholder="t('demos.placeholders.propertyType')"
                :disabled="saving" customClass="w-full" />
            <Input v-model.number="editForm.numberOfRooms" :lb="t('demos.fields.numberOfRooms')"
                type="number" placeholder="45"
                :disabled="saving" customClass="w-full" />
             <Input v-model="editForm.preferredLanguage" :lb="t('demos.fields.preferredLanguage')"
                :placeholder="t('demos.placeholders.preferredLanguage')"
                :disabled="saving" customClass="w-full" />
            </div>


            <!-- Ligne 5 : Source + Concurrent -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
           
            <Input v-model="editForm.competition" :lb="t('demos.fields.competition')"
                :placeholder="t('demos.placeholders.competition')"
                :disabled="saving" customClass="w-full" />

             <!-- Date de suivi -->
            <Input v-model="editForm.followUpDate" :lb="t('demos.fields.followUpDate')"
                type="datetime-local"
                :disabled="saving" customClass="w-full" />
            </div>

           

            <!-- Notes -->
            <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{{ t('demos.fields.notes') }}</label>
            <textarea
                v-model="editForm.notesMessage"
                rows="2"
                :disabled="saving"
                :placeholder="t('demos.placeholders.notes')"
                class="w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-purple-500 focus:outline-hidden focus:ring-3 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-purple-800 transition-colors"
                :class="saving ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed' : 'bg-transparent dark:bg-slate-900 border-gray-300 dark:border-slate-700'"
            />
            </div>

            <!-- Toggles -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <div>
                <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ t('demos.toggles.conditionsAccepted') }}</p>
                <p class="text-xs text-slate-400">{{ t('demos.toggles.conditionsAcceptedHelp') }}</p>
                </div>
                <Toggle v-model="editForm.acceptCondition" :disabled="saving" />
            </div>
            <div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <div>
                <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ t('demos.toggles.emailSent') }}</p>
                <p class="text-xs text-slate-400">{{ t('demos.toggles.emailSentHelp') }}</p>
                </div>
                <Toggle v-model="editForm.emailSend" :disabled="saving" />
            </div>
            </div>

        </div>

        <template #footer>
            <div class="flex gap-3">
            <ButtonComponent variant="outline" :disabled="saving" @click="showEditModal = false">
                {{ t('common.cancel') }}
            </ButtonComponent>
            <ButtonComponent variant="primary" :loading="saving" @click="handleUpdate">
                {{ t('demos.actions.saveChanges') }}
            </ButtonComponent>
            </div>
        </template>
    </BaseModal>
    

    <!-- ── Modal détail ── -->
    <BaseModal v-model="showDetailModal">
      <template #header>
        <div>
          <h3 class="font-black text-slate-900 dark:text-white">{{ t('demos.detail.title') }}</h3>
          <p class="text-xs text-slate-400 mt-0.5">{{ detailDemo?.contactName }}</p>
        </div>
      </template>

      <div v-if="detailDemo" class="space-y-4">
        <!-- Statut actuel -->
        <div class="flex items-center gap-2">
          <span :class="['text-xs font-semibold px-2 py-1 rounded-full', getStatus(detailDemo.status).classes]">
            {{ getStatus(detailDemo.status).label }}
          </span>
          <span v-if="detailDemo.emailSend" class="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <MailCheck :size="12" /> {{ t('demos.actions.emailSent') }}
          </span>
        </div>

        <!-- Infos principales -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div class="flex items-start gap-2">
            <Building2 :size="14" class="text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-slate-400">{{ t('demos.fields.companyName') }}</p>
              <p class="font-medium text-slate-800 dark:text-slate-100">{{ detailDemo.companyName }}</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <Globe :size="14" class="text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-slate-400">{{ t('hotelForm.fields.country') }}</p>
              <p class="font-medium text-slate-800 dark:text-slate-100">{{ detailDemo.country ?? '—' }}</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <Phone :size="14" class="text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-slate-400">{{ t('demos.fields.phoneNumber') }}</p>
              <p class="font-medium text-slate-800 dark:text-slate-100">{{ detailDemo.phoneNumber ?? '—' }}</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <BedDouble :size="14" class="text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-slate-400">{{ t('demos.fields.numberOfRooms') }}</p>
              <p class="font-medium text-slate-800 dark:text-slate-100">{{ detailDemo.numberOfRooms ?? '—' }}</p>
            </div>
          </div>
        </div>

        <!-- Champs optionnels -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm border-t border-slate-100 dark:border-slate-800 pt-3">
          <div v-if="detailDemo.propertyType">
            <p class="text-xs text-slate-400">{{ t('demos.fields.propertyType') }}</p>
            <p class="font-medium text-slate-800 dark:text-slate-100">{{ detailDemo.propertyType }}</p>
          </div>
          <div v-if="detailDemo.preferredLanguage">
            <p class="text-xs text-slate-400">{{ t('demos.fields.preferredLanguage') }}</p>
            <p class="font-medium text-slate-800 dark:text-slate-100">{{ detailDemo.preferredLanguage }}</p>
          </div>
          <div v-if="detailDemo.leadSource">
            <p class="text-xs text-slate-400">{{ t('demos.fields.leadSource') }}</p>
            <p class="font-medium text-slate-800 dark:text-slate-100">{{ detailDemo.leadSource }}</p>
          </div>
          <div v-if="detailDemo.competition">
            <p class="text-xs text-slate-400">{{ t('demos.fields.competition') }}</p>
            <p class="font-medium text-slate-800 dark:text-slate-100">{{ detailDemo.competition }}</p>
          </div>
          <div v-if="detailDemo.followUpDate">
            <p class="text-xs text-slate-400">{{ t('demos.fields.followUpDate') }}</p>
            <p class="font-medium text-slate-800 dark:text-slate-100">{{ formatDate(detailDemo.followUpDate) }}</p>
          </div>
          <div v-if="detailDemo.owner">
            <p class="text-xs text-slate-400">{{ t('demos.fields.assignedTo') }}</p>
            <p class="font-medium text-slate-800 dark:text-slate-100">
              {{ detailDemo.owner.firstName }} {{ detailDemo.owner.lastName }}
            </p>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="detailDemo.notesMessage" class="border-t border-slate-100 dark:border-slate-800 pt-3">
          <p class="text-xs text-slate-400 mb-1">{{ t('demos.fields.notes') }}</p>
          <p class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{{ detailDemo.notesMessage }}</p>
        </div>
      </div>

      <template #footer>
        <ButtonComponent variant="outline" @click="showDetailModal = false">{{ t('common.close') }}</ButtonComponent>
      </template>
    </BaseModal>

 

  </div>
</template>
<style scoped>

</style>
