<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

import BaseTable, { type Column } from '../../components/Table/BaseTable.vue'
import BaseModal from '../../components/Modal/BaseModal.vue'
import Input from '../../components/FormElements/Input.vue'
import ButtonComponent from '../../components/Button/ButtonComponent.vue'
import DeleteConfirmationModal from '../../components/Modal/DeleteConfirmationModal.vue'
import { useToastStore } from '../../composables/toast'
import { productService, type Product } from '../../servicesAPI/productService'
import { addOnService, type AddOn } from '../../servicesAPI/addOnService'
import { formatCurrency } from '../../components/Utilities/function'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()
const { t } = useI18n()

const product = ref<Product | null>(null)
const loading = ref(false)

const addOns = ref<AddOn[]>([])
const meta = ref<any>(null)
const page = ref(1)
const limit = ref(10)
const addOnsLoading = ref(false)

const columns = computed<Column[]>(() => [
  { key: 'name', label: t('addons.fields.name') },
  { key: 'min', label: t('addons.fields.min') },
  { key: 'max', label: t('addons.fields.max') },
  { key: 'priceMonth', label: t('addons.fields.priceMonth') },
  { key: 'priceYear', label: t('addons.fields.priceYear') },
  { key: 'actions', label: t('common.actions'), sortable: false, tdClass: 'text-right', thClass: 'text-right' },
])

const showForm = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const showDelete = ref(false)
const deletingAddOn = ref<AddOn | null>(null)
const deleteLoading = ref(false)
const deletingId = ref<number | null>(null)
const form = ref({
  name: '',
  min: 1,
  max: 1,
  priceMonth: 0,
  priceYear: 0,
})
const formErrors = ref({
  name: '',
})

const fetchProduct = async () => {
  try {
    const id = Number(route.params.id)
    product.value = await productService.getById(id)
  } catch (e) {
    console.error(e)
    toastStore.show({ type: 'error', message: t('products.errors.notFound') })
  }
}

const fetchAddOns = async (p = 1) => {
  if (!route.params.id) return
  addOnsLoading.value = true
  try {
    const id = Number(route.params.id)
    const res = await addOnService.getByModule(id, { page: p, limit: limit.value })
    addOns.value = res.data
    meta.value = res.meta
  } catch (e) {
    console.error(e)
    toastStore.show({ type: 'error', message: t('addons.errors.load') })
  } finally {
    addOnsLoading.value = false
  }
}

const handlePageChange = (p: number) => {
  page.value = p
  fetchAddOns(p)
}

const openCreate = () => {
  editingId.value = null
  form.value = { name: '', min: 1, max: 1, priceMonth: 0, priceYear: 0 }
  showForm.value = true
}

const openEdit = (row: any) => {
  const a = row as AddOn
  editingId.value = a.id
  form.value = {
    name: a.name,
    min: a.min,
    max: a.max,
    priceMonth: a.priceMonth,
    priceYear: a.priceYear ?? 0,
  }
  showForm.value = true
}

const handleSubmit = async () => {
  if (!route.params.id) return
  const moduleId = Number(route.params.id)
  saving.value = true
  try {
    formErrors.value.name = form.value.name.trim()
      ? ''
      : t('validation.required', { field: t('addons.fields.name') })
    if (formErrors.value.name) { saving.value = false; return }

    if (editingId.value) {
      await addOnService.update(editingId.value, {
        name: form.value.name.trim(),
        min: Number(form.value.min),
        max: Number(form.value.max),
        priceMonth: Number(form.value.priceMonth),
        priceYear: Number(form.value.priceYear),
      })
      toastStore.show({ type: 'success', message: t('addons.success.updated') })
    } else {
      await addOnService.createForModule(moduleId, {
        name: form.value.name.trim(),
        min: Number(form.value.min),
        max: Number(form.value.max),
        priceMonth: Number(form.value.priceMonth),
        priceYear: Number(form.value.priceYear),
      })
      toastStore.show({ type: 'success', message: t('addons.success.created') })
    }
    showForm.value = false
    await fetchAddOns(page.value)
  } catch (e) {
    console.error(e)
    toastStore.show({ type: 'error', message: t('common.errors.save') })
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row: any) => {
  deletingAddOn.value = row as AddOn
  showDelete.value = true
}

const confirmDelete = async () => {
  if (!deletingAddOn.value) return
  deleteLoading.value = true
  deletingId.value = deletingAddOn.value.id
  try {
    await addOnService.delete(deletingAddOn.value.id)
    toastStore.show({ type: 'success', message: t('addons.success.deleted') })
    showDelete.value = false
    deletingAddOn.value = null
    await fetchAddOns(page.value)
  } catch (e) {
    console.error(e)
    toastStore.show({ type: 'error', message: t('common.errors.delete') })
  } finally {
    deleteLoading.value = false
    deletingId.value = null
  }
}

onMounted(async () => {
  loading.value = true
  await fetchProduct()
  await fetchAddOns(1)
  loading.value = false
})
</script>

<template>
  <div class="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-dvh space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <button class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" @click="router.push({ name: 'products' })">
          <ArrowLeft class="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <div class="min-w-0">
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white truncate">
            {{ product?.name ?? t('products.product') }}
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-300 truncate">
            {{ product?.description ?? '—' }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <ButtonComponent :iconLeft="Plus" @click="openCreate">{{ t('addons.actions.add') }}</ButtonComponent>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <BaseTable
        :title="t('addons.title')"
        :columns="columns"
        :data="addOns"
        :loading="addOnsLoading"
        :show-search="false"
        :meta="meta"
        @page-change="handlePageChange"
      >
        <template #cell-name="{ value }">
          <span class="text-sm text-slate-900 dark:text-white">{{ value }}</span>
        </template>
        <template #cell-priceMonth="{ value }">
          <span class="font-semibold text-sm text-slate-900 dark:text-white">{{ formatCurrency(value) }}</span>
        </template>
        <template #cell-priceYear="{ value }">
          <span class="text-sm text-slate-700 dark:text-slate-200">{{ value == null ? '—' : formatCurrency(value) }}</span>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center  gap-1">
            <ButtonComponent variant="ghost" size="sm" :iconLeft="Edit" @click.stop="openEdit(row)" />
            <ButtonComponent
              variant="ghost"
              size="sm"
              :iconLeft="Trash2"
              :loading="deleteLoading && deletingId === row.id"
              :disabled="deleteLoading"
              @click.stop="handleDelete(row)"
            />
          </div>
        </template>
      </BaseTable>
    </div>

    <BaseModal v-model="showForm">
      <template #header>
        <h3 class="font-bold text-slate-900 dark:text-white">
          {{ editingId ? t('addons.modal.editTitle') : t('addons.modal.createTitle') }}
        </h3>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="col-span-2">
          <Input :lb="t('addons.fields.name')" v-model="form.name" :error-msg="formErrors.name" />
        </div>
        <Input :lb="t('addons.fields.min')" v-model="form.min" inputType="number" />
        <Input :lb="t('addons.fields.max')" v-model="form.max" inputType="number" />
        <Input :lb="t('addons.fields.priceMonth')" v-model="form.priceMonth" inputType="number" />
        <Input :lb="t('addons.fields.priceYear')" v-model="form.priceYear" inputType="number" />
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <ButtonComponent variant="secondary" @click="showForm = false">{{ t('common.cancel') }}</ButtonComponent>
          <ButtonComponent :loading="saving" @click="handleSubmit">{{ editingId ? t('common.save') : t('common.create') }}</ButtonComponent>
        </div>
      </template>
    </BaseModal>

    <DeleteConfirmationModal
      v-model="showDelete"
      :loading="deleteLoading"
      :title="t('addons.delete.title')"
      :itemName="deletingAddOn?.name ?? ''"
      @confirm="confirmDelete"
    />
  </div>
</template>
