<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import {
  Plus, Edit, Trash2, Eye,
  Package, Search, Check,
  BedDouble, Utensils, ArrowLeftRight, Smartphone, BarChart2, Users
} from 'lucide-vue-next'
import { type Component } from 'vue'
import { useI18n } from 'vue-i18n'

// components
import Input           from '../../components/FormElements/Input.vue'
import ButtonComponent from '../../components/Button/ButtonComponent.vue'
import BaseTable       from '../../components/Table/BaseTable.vue'
import type { Column } from '../../components/Table/BaseTable.vue'
import BaseModal       from '../../components/Modal/BaseModal.vue'
import Toggle          from '../../components/FormElements/Toggle.vue'
import DeleteConfirmationModal from '../../components/Modal/DeleteConfirmationModal.vue'

import { useToastStore }  from '../../composables/toast'
import { formatCurrency } from '../../components/Utilities/function'
import { productService , type CreateProductPayload } from '../../servicesAPI/productService'
import type { Product }   from '../../servicesAPI/productService'

// ── State 
const products     = ref<Product[]>([])
const loading      = ref(false)
const saving       = ref(false)
const searchQuery  = ref('')
const filterActive = ref<'all' | 'active' | 'inactive'>('all')
const toastStore   = useToastStore()
const { t } = useI18n()

// ── Pagination ───
const page  = ref(1)
const limit = ref(20)
const meta = ref<any>(null)

// ── Columns ───
const columns = computed<Column[]>(() => [
  { key: 'name',         label: t('products.table.product') },
  { key: 'slug',         label: t('products.table.slug') },
  { key: 'priceMonthly', label: t('products.table.priceMonthly') },
  { key: 'isActive',     label: t('products.table.status'),  sortable: false },
  { key: 'actions',      label: t('common.actions'), sortable: false },
])

// ── Modales 
const showForm        = ref(false)
const showDelete      = ref(false)
const editingId       = ref<string | null>(null)
const deletingProduct = ref<Product | null>(null)

const form = reactive({
  slug:         '',
  name:         '',
  priceMonthly: 0,
  description:  '',
  isActive:     true,
})

const formErrors = reactive({
  slug:         '',
  name:         '',
  priceMonthly: '',
})

// ── Fetch 
const fetchProducts = async (page=1) => {
  loading.value = true
  try {
    const res = await productService.getAll({
      page:     page,
      limit:    limit.value,
      search:   searchQuery.value || undefined,
      isActive: filterActive.value === 'active'   ? true
              : filterActive.value === 'inactive' ? false
              : undefined,
    })
    products.value = res.data
    meta.value     = res.meta
    console.log('Fetched products:', res.data, 'Meta:', res.meta)
  } catch (e) {
    console.error(e)
    toastStore.show({ message: t('products.toast.loadError'), type: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchProducts(1))

const handlePageChange = (newPage: number) => {
  fetchProducts(newPage);
};

// Relancer le fetch + reset page 1 quand search ou filtre change
watch([searchQuery, filterActive], () => {
  page.value = 1
  fetchProducts(1)
})

// Relancer quand la page change
watch(page, () => fetchProducts(1))

// ── Computed KPIs 
const countActive = computed(() => products.value.filter(m => m.isActive).length)

// ── Helpers icônes / couleurs 
const slugIconComponents: Record<string, Component> = {
  'pms':             BedDouble,
  'pos':             Utensils,
  'channel-manager': ArrowLeftRight,
  'mobile-app':      Smartphone,
  'analytics':       BarChart2,
  'crm':             Users,
}
const getIconComponent = (slug: string): Component => slugIconComponents[slug] ?? Package

const slugColors: Record<string, string> = {
  'pms':             '#7c3aed',
  'pos':             '#0891b2',
  'channel-manager': '#059669',
  'mobile-app':      '#d97706',
  'analytics':       '#dc2626',
  'crm':             '#0f766e',
}
const getColor = (slug: string) => slugColors[slug] ?? '#6b7280'

// ── Formulaire 
const resetForm = () => {
  form.slug         = ''
  form.name         = ''
  form.priceMonthly = 0
  form.description  = ''
  form.isActive     = true
  formErrors.slug         = ''
  formErrors.name         = ''
  formErrors.priceMonthly = ''
  editingId.value = null
}

const openCreate = () => { resetForm(); showForm.value = true }

const openEdit = (row: any) => {
  const prod = row as Product
  resetForm()
  editingId.value       = prod.id
  form.slug             = prod.slug ?? ''
  form.name             = prod.name
  form.priceMonthly     = Math.round(prod.priceMonthly ?? 0)
  form.description      = prod.description ?? ''
  form.isActive         = prod.isActive
  showForm.value = true
}

const validateForm = () => {
  formErrors.slug         = form.slug.trim()      ? '' : t('products.validation.slugRequired')
  formErrors.name         = form.name.trim()      ? '' : t('products.validation.nameRequired')
  formErrors.priceMonthly = form.priceMonthly > 0 ? '' : t('products.validation.pricePositive')
  return !formErrors.slug && !formErrors.name && !formErrors.priceMonthly
}

const handleSubmit = async () => {
  if (!validateForm()) return
  saving.value = true
  try {
    const payload: CreateProductPayload = {
      slug:         form.slug.trim(),
      name:         form.name.trim(),
      priceMonthly: form.priceMonthly,
      description:  form.description.trim() || '',
      isActive:     form.isActive,
    }

    if (editingId.value) {
      await productService.update(Number(editingId.value), payload)
      toastStore.show({ message: t('products.toast.updated'), type: 'success' })
    } else {
      await productService.create(payload)
      toastStore.show({ message: t('products.toast.created'), type: 'success' })
    }

    showForm.value = false
    resetForm()
    await fetchProducts(1)
  } catch (e) {
    console.error(e)
    toastStore.show({ message: t('common.errors.save'), type: 'error' })
  } finally {
    saving.value = false
  }
}

// ── Suppression 
const openDelete = (row: any) => {
  deletingProduct.value = row as Product
  showDelete.value = true
}

const confirmDelete = async () => {
  if (!deletingProduct.value) return
  saving.value = true
  try {
    await productService.delete(Number(deletingProduct.value.id))
    toastStore.show({ message: t('products.toast.deleted'), type: 'success' })
    showDelete.value      = false
    deletingProduct.value = null
    // Si on supprime le dernier élément d'une page > 1, reculer d'une page
    if (products.value.length === 1 && page.value > 1) page.value--
    else await fetchProducts(1)
  } catch (e) {
    console.error(e)
    toastStore.show({ message: t('common.errors.delete'), type: 'error' })
  } finally {
    saving.value = false
  }
}

</script>

<template>
  <div class="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen space-y-6">

    <!-- ── Header ── -->
    <div class="flex flex-col md:flex-row justify-between md:items-start gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ t('products.catalog.title') }}</h1>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">{{ t('products.catalog.subtitle') }}</p>
      </div>
      <ButtonComponent variant="primary" :iconLeft="Plus" @click="openCreate">
        {{ t('products.actions.new') }}
      </ButtonComponent>
    </div>

    <!-- ──  ── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div class="flex items-center justify-between mb-2">
          <div class="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"><Package :size="18" class="text-slate-600 dark:text-slate-300" /></div>
            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">{{ t('common.total') }}</span>
        </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">{{ t('products.stats.products') }}</p>
        <p class="text-2xl font-black mt-1 text-slate-900 dark:text-white">{{ meta?.total ?? 0 }}</p>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div class="flex items-center justify-between mb-2">
          <div class="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg"><Check :size="18" class="text-emerald-600 dark:text-emerald-400" /></div>
            <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">{{ t('common.activePlural') }}</span>
        </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">{{ t('products.stats.activeProducts') }}</p>
        <p class="text-2xl font-black mt-1 text-slate-900 dark:text-white">{{ countActive }}</p>
      </div>
      <!-- <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-2">
          <div class="p-2 bg-purple-100 rounded-lg"><Package :size="18" class="text-purple-600" /></div>
          <span class="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">mensuel</span>
        </div>
        <p class="text-xs text-slate-500 font-medium">Revenu catalogue / mois</p>
        <p class="text-2xl font-black mt-1 text-slate-900">{{ formatCurrency(totalRevenuePotentiel) }}</p>
      </div> -->
    </div>

    <!-- ── Filtres + Recherche ── -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="flex-1 max-w-sm relative">
        <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10" />
        <Input v-model="searchQuery" :placeholder="t('products.searchPlaceholder')" customClass="pl-9" />
      </div>
      <div class="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        <button
          v-for="[key, label] in [['all', t('common.all')], ['active', t('common.activePlural')], ['inactive', t('common.inactivePlural')]]"
          :key="key"
          @click="filterActive = key as any"
          class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer"
          :class="filterActive === key ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white'"
        >
          {{ label }}
        </button>
      </div>
    </div>

    <!-- ── Table ── -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <BaseTable :columns="columns" :data="products" :loading="loading" :show-search="false" :meta="meta" @page-change="handlePageChange">

        <template #cell-name="{ row }">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              :style="{ background: getColor(row.slug) + '18' }"
            >
              <component :is="getIconComponent(row.slug)" :size="18" :style="{ color: getColor(row.slug) }" />
            </div>
            <div class="min-w-0">
              <p class="font-bold text-sm text-slate-900 dark:text-white truncate">{{ row.name }}</p>
              <p class="text-xs text-slate-400 dark:text-slate-400 truncate mt-0.5">{{ row.description ?? '—' }}</p>
            </div>
          </div>
        </template>

        <template #cell-slug="{ row }">
          <span class="font-mono text-xs text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{{ row.slug }}</span>
        </template>

        <template #cell-priceMonthly="{ row }">
          <span class="font-bold text-sm text-slate-900 dark:text-white">{{ formatCurrency(row.priceMonthly) }}</span>
        </template>

        <template #cell-isActive="{ row }">
          <span
            :class="[
              'text-xs font-semibold px-2 py-1 rounded-full',
              row.isActive
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300',
            ]"
          >
            {{ row.isActive ? t('common.active') : t('common.inactive') }}
          </span>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1">
            <ButtonComponent variant="ghost" size="sm" :iconLeft="Eye"    :aria-label="t('products.actions.details')"    @click.stop="$router.push({ name: 'product-detail', params: { id: row.id } })" />
            <ButtonComponent variant="ghost" size="sm" :iconLeft="Edit"   :aria-label="t('common.edit')"   @click.stop="openEdit(row)" />
            <ButtonComponent variant="ghost" size="sm" :iconLeft="Trash2" :aria-label="t('products.actions.delete')"  @click.stop="openDelete(row)" />
          </div>
        </template>

      </BaseTable>
    </div>

    <!-- ── Modal formulaire ── -->
    <BaseModal v-model="showForm">
      <template #header>
        <div>
          <h3 class="font-black text-slate-900 dark:text-white">{{ editingId ? t('products.form.editTitle') : t('products.form.createTitle') }}</h3>
          <p class="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
            {{ editingId ? t('products.form.editSubtitle') : t('products.form.createSubtitle') }}
          </p>
        </div>
      </template>

      <div class="space-y-4">
        <Input v-model="form.slug"  :lb="t('products.fields.slug')"    :placeholder="t('products.placeholders.slug')"           :errorMsg="formErrors.slug"         :disabled="saving" customClass="w-full" isRequired />
        <Input v-model="form.name"  :lb="t('products.fields.name')"   :placeholder="t('products.placeholders.name')" :errorMsg="formErrors.name"         :disabled="saving" customClass="w-full" isRequired />
        <Input v-model.number="form.priceMonthly" :lb="t('products.fields.priceMonthlyXaf')" type="number" :placeholder="t('products.placeholders.priceMonthly')" :errorMsg="formErrors.priceMonthly" :disabled="saving" customClass="w-full" isRequired />

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{{ t('products.fields.description') }}</label>
          <textarea
            v-model="form.description"
            rows="2"
            :disabled="saving"
            :placeholder="t('products.placeholders.description')"
            class="w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-purple-500 focus:outline-hidden focus:ring-3 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-purple-800 transition-colors"
            :class="saving ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-400 cursor-not-allowed border-gray-200 dark:border-slate-700' : 'bg-transparent dark:bg-slate-900 border-gray-300 dark:border-slate-700'"
          />
        </div>

        <div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
          <div>
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ t('products.fields.active') }}</p>
            <p class="text-xs text-slate-400 dark:text-slate-400">{{ t('products.fields.activeHelp') }}</p>
          </div>
          <Toggle v-model="form.isActive" />
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <ButtonComponent variant="outline" :disabled="saving" @click="showForm = false">{{ t('common.cancel') }}</ButtonComponent>
          <ButtonComponent variant="primary" :loading="saving" @click="handleSubmit">
            {{ editingId ? t('common.save') : t('products.actions.create') }}
          </ButtonComponent>
        </div>
      </template>
    </BaseModal>

    <!-- ── Modal suppression ── -->
    <DeleteConfirmationModal
      v-model="showDelete"
      :title="t('products.delete.title')"
      :item-name="deletingProduct?.name"
      :description="t('products.delete.description')"
      :loading="saving"
      @confirm="confirmDelete"
    />

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
