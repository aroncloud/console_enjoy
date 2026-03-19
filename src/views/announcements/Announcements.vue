<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Edit3, Megaphone, TriangleAlert, RefreshCcw, Info } from 'lucide-vue-next'

import BaseTable, { type Column } from '../../components/Table/BaseTable.vue'
import ButtonComponent from '../../components/Button/ButtonComponent.vue'
import BaseModal from '../../components/Modal/BaseModal.vue'
import Input from '../../components/FormElements/Input.vue'
import Select from '../../components/FormElements/Select.vue'
import Toggle from '../../components/FormElements/Toggle.vue'

import { useToastStore } from '../../composables/toast'
import { announcementService, type AnnouncementsMeta, type CreateAnnouncementPayload } from '../../servicesAPI/announcementService'
import type { Announcement, AnnouncementType } from '../../composables/announcement'

const { t, locale } = useI18n()
const toastStore = useToastStore()

const rows = ref<Announcement[]>([])
const loading = ref(false)
const saving = ref(false)

const filters = reactive({
  type: '' as AnnouncementType | '',
  isActive: '' as '' | 'true' | 'false',
})

const meta = ref<AnnouncementsMeta>({
  total: 0,
  perPage: 20,
  currentPage: 1,
  lastPage: 1,
  firstPage: 1,
  previousPageUrl: null,
  nextPageUrl: null,
})

const page = ref(1)
const limit = ref(20)

const showModal = ref(false)
const editingId = ref<string | null>(null)

const form = reactive<{
  title: string
  content: string
  type: AnnouncementType
  isActive: boolean
  startsAtLocal: string
  endsAtLocal: string
}>({
  title: '',
  content: '',
  type: 'maintenance',
  isActive: true,
  startsAtLocal: '',
  endsAtLocal: '',
})

const typeOptions = computed(() => [
  { label: t('announcements.types.maintenance'), value: 'maintenance' },
  { label: t('announcements.types.info'), value: 'info' },
  { label: t('announcements.types.update'), value: 'update' },
])

const activeOptions = computed(() => [
  { label: t('common.all'), value: '' },
  { label: t('common.active'), value: 'true' },
  { label: t('common.inactive'), value: 'false' },
])

const columns = computed<Column[]>(() => [
  { key: 'title', label: t('announcements.table.title') },
  { key: 'type', label: t('announcements.table.type') },
  { key: 'isActive', label: t('announcements.table.status') },
  { key: 'startsAt', label: t('announcements.table.startsAt') },
  { key: 'endsAt', label: t('announcements.table.endsAt') },
  { key: 'createdAt', label: t('announcements.table.createdAt') },
  { key: 'actions', label: t('common.actions'), tdClass: 'text-right', thClass: 'text-right', sortable: false },
])

const iconForType = (type: AnnouncementType) => {
  if (type === 'maintenance') return TriangleAlert
  if (type === 'update') return RefreshCcw
  return Info
}

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '—'
  const loc = locale.value === 'fr' ? 'fr-FR' : 'en-US'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(loc, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const toLocalInputValue = (iso?: string | null) => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const toIsoFromLocalInput = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

const resetForm = () => {
  form.title = ''
  form.content = ''
  form.type = 'maintenance'
  form.isActive = true
  form.startsAtLocal = ''
  form.endsAtLocal = ''
}

const openCreate = () => {
  editingId.value = null
  resetForm()
  showModal.value = true
}

const openEdit = (row: any) => {
  editingId.value = row.id
  form.title = row.title ?? ''
  form.content = row.content ?? ''
  form.type = row.type
  form.isActive = !!row.isActive
  form.startsAtLocal = toLocalInputValue(row.startsAt)
  form.endsAtLocal = toLocalInputValue(row.endsAt)
  showModal.value = true
}

const fetchAnnouncements = async (newPage = 1) => {
  loading.value = true
  try {
    const isActiveParam =
      filters.isActive === '' ? '' : filters.isActive === 'true'

    const res = await announcementService.getAll({
      page: newPage,
      limit: limit.value,
      type: filters.type,
      isActive: isActiveParam,
    })
    rows.value = res.data
    meta.value = res.meta
    page.value = res.meta.currentPage
  } catch {
    toastStore.show({ type: 'error', message: t('announcements.toast.loadError') })
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  const payload: CreateAnnouncementPayload = {
    title: form.title.trim(),
    content: form.content.trim(),
    type: form.type,
    isActive: form.isActive,
    startsAt: toIsoFromLocalInput(form.startsAtLocal),
    endsAt: toIsoFromLocalInput(form.endsAtLocal),
  }

  if (!payload.title || !payload.content || !payload.startsAt || !payload.endsAt) {
    toastStore.show({ type: 'warning', message: t('announcements.toast.validationError') })
    return
  }

  saving.value = true
  try {
    if (editingId.value) {
      await announcementService.update(editingId.value, payload)
      toastStore.show({ type: 'success', message: t('announcements.toast.updated') })
    } else {
      await announcementService.create(payload)
      toastStore.show({ type: 'success', message: t('announcements.toast.created') })
    }
    showModal.value = false
    await fetchAnnouncements(page.value)
  } catch {
    toastStore.show({ type: 'error', message: t('announcements.toast.saveError') })
  } finally {
    saving.value = false
  }
}

watch([() => filters.type, () => filters.isActive], () => {
  fetchAnnouncements(1)
})

onMounted(() => {
  fetchAnnouncements(1)
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Megaphone :size="20" class="text-slate-700 dark:text-slate-200" />
          {{ t('announcements.title') }}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {{ t('announcements.subtitle') }}
        </p>
      </div>
      <ButtonComponent :label="t('announcements.actions.new')" :iconLeft="Plus" @click="openCreate" />
    </div>

    <BaseTable
      :columns="columns"
      :data="rows"
      :loading="loading"
      :meta="meta"
      :showFilters="true"
      @page-change="fetchAnnouncements"
    >
      <template #filters>
        <div class="flex md:flex-row flex-col  gap-3">
          <div class="w-50">
          <Select
            :lb="t('announcements.filters.type')"
            :options="[{ label: t('common.all'), value: '' }, ...typeOptions]"
            v-model="filters.type"
            customClass="h-10 "
          />
          </div>
          <div class="w-50">
          <Select
            :lb="t('announcements.filters.status')"
            :options="activeOptions"
            v-model="filters.isActive"
            customClass="h-10"
          />
          </div>
        </div>
      </template>

      <template #cell-type="{ value }">
        <div class="flex items-center gap-2">
          <component :is="iconForType(value)" :size="16" class="text-slate-500 dark:text-slate-300" />
          <span class="text-sm text-slate-700 dark:text-slate-200">
            {{ t(`announcements.types.${value}`) }}
          </span>
        </div>
      </template>

      <template #cell-isActive="{ value }">
        <span
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
          :class="value ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'"
        >
          {{ value ? t('common.active') : t('common.inactive') }}
        </span>
      </template>

      <template #cell-startsAt="{ value }">
        <span class="text-sm text-slate-600 dark:text-slate-300">{{ formatDateTime(value) }}</span>
      </template>

      <template #cell-endsAt="{ value }">
        <span class="text-sm text-slate-600 dark:text-slate-300">{{ formatDateTime(value) }}</span>
      </template>

      <template #cell-createdAt="{ value }">
        <span class="text-sm text-slate-600 dark:text-slate-300">{{ formatDateTime(value) }}</span>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex justify-end">
          <button
            type="button"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-purple-600 hover:text-purple-800 hover:bg-purple-50 dark:hover:bg-slate-800"
            @click.stop="openEdit(row)"
          >
            <Edit3 :size="16" />
            {{ t('common.edit') }}
          </button>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="showModal" customClass="max-w-2xl">
      <template #header>
        <div class="flex items-center gap-2">
          <span class="text-base font-bold text-slate-900 dark:text-white">
            {{ editingId ? t('announcements.modal.editTitle') : t('announcements.modal.createTitle') }}
          </span>
        </div>
      </template>

      <div class="space-y-4">
        <Input :lb="t('announcements.fields.title')" v-model="form.title" :isRequired="true" />

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            {{ t('announcements.fields.content') }}
            <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="form.content"
            rows="5"
            class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 shadow-theme-xs outline-none focus:border-purple-500 focus:ring-3 focus:ring-purple-500/10"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select :lb="t('announcements.fields.type')" :options="typeOptions" v-model="form.type" />
          <div class="pt-7">
            <Toggle v-model="form.isActive" :title="t('announcements.fields.isActive')" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            :lb="t('announcements.fields.startsAt')"
            type="datetime-local"
            v-model="form.startsAtLocal"
            :isRequired="true"
          />
          <Input
            :lb="t('announcements.fields.endsAt')"
            type="datetime-local"
            v-model="form.endsAtLocal"
            :isRequired="true"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <ButtonComponent :label="t('common.cancel')" variant="secondary" @click="showModal = false" />
          <ButtonComponent :label="saving ? t('common.saving') : t('common.save')" :loading="saving" @click="submit" />
        </div>
      </template>
    </BaseModal>
  </div>
</template>
