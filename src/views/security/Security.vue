<template>
  <div class="space-y-6 p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ">
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <ShieldCheck :size="20" />
          </div>
          <span class="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Opérationnel</span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-xs font-medium">Statut système</p>
        <h3 class="text-2xl font-black mt-1">Nominal</h3>
      </div> -->

      <div
        class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-blue-100 text-blue-500 rounded-lg">
            <Wifi :size="20" />
          </div>
          <span
            class="text-[10px] font-bold text-blue-500 bg-blue-100 px-2 py-1 rounded-full"
            >{{ t('security.kpis.online') }}</span
          >
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-xs font-medium">
          {{ t('security.kpis.activeTenants') }}
        </p>
        <h3 class="text-2xl font-black mt-1">
          {{ activeCount }} / {{ totalCount }}
        </h3>
      </div>

      <div
        class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-red-100 text-red-500 rounded-lg">
            <Power :size="20" />
          </div>
          <span
            class="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-1 rounded-full"
            >{{ t('security.kpis.suspended') }}</span
          >
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-xs font-medium">
          {{ t('security.kpis.revokedAccess') }}
        </p>
        <h3 class="text-2xl font-black mt-1">{{ suspendedCount }}</h3>
      </div>
    </div>

    <!-- Kill-Switch + Tenants -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Kill-Switch -->
      <!-- <div class="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 class="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Kill-Switch API</h3>
          <Power :size="16" class="text-red-400" />
        </div>

        <div class="p-5 space-y-4">
         
          <BaseSelect
            lb="Motif de suspension"
            v-model="killReason"
            :options="reasonOptions"
            placeholder="Choisir un motif..."
          />

         
          <BaseInput
            lb="Tenant ID"
            :is-required="true"
            v-model="tenant"
            placeholder="ex: hotel_grand_paris_01"
          />

          
          <div class="flex flex-wrap gap-1.5">
            <span class="text-xs text-slate-400 w-full">Récents :</span>
            <button
              v-for="t in recentTenants"
              :key="t"
              class="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              @click="tenant = t"
            >
              {{ t }}
            </button>
          </div>

         
          <div v-if="!confirmMode">
            <button
              class="w-full py-2.5 bg-red-500 text-white font-bold rounded-lg text-sm hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="!tenant.trim()"
              @click="confirmMode = true"
            >
              <Power :size="14" />
              Suspendre l'accès API
            </button>
          </div>

          <Transition name="fade">
            <div v-if="confirmMode" class="rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 p-4 space-y-3">
              <p class="text-sm font-semibold text-red-700 dark:text-red-400">Confirmer la suspension de <span class="font-black">{{ tenant }}</span> ?</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Cette action est réversible depuis le panel ci-dessous.</p>
              <div class="flex gap-2">
                <button
                  class="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  @click="confirmMode = false"
                >
                  Annuler
                </button>
                <button
                  class="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5"
                  @click="kill"
                >
                  <Power :size="13" />
                  Confirmer
                </button>
              </div>
            </div>
          </Transition>

          <p class="text-xs text-slate-400 dark:text-slate-400 flex items-start gap-1.5">
            <Info :size="12" class="mt-0.5 shrink-0" />
            Usage : non-paiement prolongé ou incident de sécurité.
          </p>
        </div>
      </div> -->

      <!-- Tenant statuses -->
      <div
        class="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
      >
        <BaseTable
          :columns="tenantColumns"
          :data="tenantStatuses"
          :title="t('security.tenants.title')"
          :meta="metaData"
          @page-change="handlePageChange"
          :loading="isLoading"
        >
          <template #cell-hotel="{ value }">
            <span
              class="font-semibold text-gray-800 dark:text-white capitalize"
              >{{ value.hotelName }}</span
            >
          </template>

          <template #cell-module="{ value }">
            <div class="flex flex-col">
              <span
                class="text-sm font-semibold text-slate-800 dark:text-white"
                >{{ value.name ?? "—" }}</span
              >
              <span class="font-mono text-xs text-slate-400">{{
                value.slug ?? "—"
              }}</span>
            </div>
          </template>

          <template #cell-status="{ value }">
            <span
              class="px-2 py-1 text-[10px] font-bold rounded-full uppercase flex items-center gap-1.5 w-fit"
              :class="
                value === 'canceled'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-emerald-100 text-emerald-600'
              "
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="value === 'canceled' ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'"
              />
              {{ value === 'canceled' ? t('subscriptions.status.canceled') : t('subscriptions.status.active') }}
            </span>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex justify-end">
              <button
                :disabled="loadingStatus"
                class="p-1.5 rounded-lg border transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:opacity-60 disabled:border-gray-100"
                :class="
                  row.status === 'canceled'
                    ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/40 dark:hover:bg-emerald-900/10'
                    : 'border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/10'
                "
                @click="toggleTenant(row)"
              >
                <Power :size="12" />
                {{ row.status === 'canceled' ? t('common.restore') : t('common.suspend') }}
              </button>
            </div>
          </template>
        </BaseTable>
      </div>

      <!-- Audit log -->
      <div class="">
        <!-- <div class="px-5 py-4 border-b rounded-md border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 class="font-bold text-sm">Journal d'audit</h3>
        <button class="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-purple-500 transition-colors">
          <Download :size="14" />
        </button>
      </div> -->

        <BaseTable
          :columns="auditColumns"
          :data="auditLogs"
          :meta="meta"
          :title="t('security.audit.title')"
          :loading="loading"
          @page-change="handlePageAudit"
        >
          <template #cell-action="{ value }">
            <span
              class="px-2 py-1 text-[10px] font-bold rounded-full uppercase whitespace-nowrap"
              :class="getActionBadge(value).class"
            >
              {{ getActionBadge(value).label }}
            </span>
          </template>

          <template #cell-description="{ value }">
            <span class="text-sm text-slate-700 dark:text-slate-200">{{
              value ?? "—"
            }}</span>
          </template>

          <template #cell-hotel="{ value }">
            <span class="text-xs text-slate-500 dark:text-slate-400">{{
              value?.hotelName ?? "—"
            }}</span>
          </template>

          <template #cell-user="{ value }">
            <span class="text-xs text-slate-500 dark:text-slate-400">{{
              value?.fullName ?? "—"
            }}</span>
          </template>

          <template #cell-createdAt="{ value }">
            <span class="text-xs text-slate-400">
              {{ value ? new Date(value).toLocaleString("fr-FR") : "—" }}
            </span>
          </template>
        </BaseTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Wifi, Power } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import BaseTable from "../../components/Table/BaseTable.vue";
import { subscriptionService } from "../../servicesAPI/subscriptionService";
import { historyService } from "../../servicesAPI/historyService";
import { useToastStore } from "../../composables/toast";

// ── Stats globales  ──
const allTenants = ref<any[]>([]);
const activeCount    = computed(() => allTenants.value.filter((t) => t.status !== 'canceled').length)
const suspendedCount = computed(() => allTenants.value.filter((t) => t.status === 'canceled').length)
const totalCount = computed(() => allTenants.value.length);

const fetchAllTenants = async () => {
  try {
    const res = await subscriptionService.getAll({ limit: 1000 });
    allTenants.value = res.data;
  } catch (e) {
    console.error(e);
  }
};

// ── Table tenants paginée ──
const { t } = useI18n()
const tenantColumns = computed(() => [
  { key: "hotel", label: t('security.table.establishment') },
  { key: "module", label: t('security.table.tenant') },
  { key: "status", label: t('security.table.status') },
  { key: "actions", label: "", thClass: "text-right" },
]);

const tenantStatuses = ref<any[]>([]);
const metaData = ref<any>(null);
const isLoading = ref(false);
const toastStore = useToastStore()
const loadingStatus = ref(false)

const fetchSubscriptions = async (page = 1) => {
  isLoading.value = true;
  try {
    const res = await subscriptionService.getAll({ page, limit: 5 });
    tenantStatuses.value = res.data;
    metaData.value = res.meta;
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const handlePageChange = (newPage: number) => fetchSubscriptions(newPage);

// ── Toggle suspend/restore ──
const toggleTenant = async (row: any) => {
  try {
    loadingStatus.value = true
    const newStatus = row.status === 'canceled' ? 'active' : 'canceled'
    await subscriptionService.patch(row.id)

    // Mise à jour locale
    row.status = newStatus
    const found = allTenants.value.find((t) => t.id === row.id)
    if (found) found.status = newStatus
    toastStore.show({
      message: newStatus === 'canceled' ? t('security.toast.suspended') : t('security.toast.restored'),
      type: 'success',
    })
    await fetchAudit(1)
  } catch (e) {
    console.error(e)
    toastStore.show({
      message: t('security.toast.updateError'),
      type: 'error',
    })
  }finally{
     loadingStatus.value = false
  }
}

// ── Audit  ──
const auditColumns = computed(() => [
  { key: "action", label: t('security.audit.columns.action') },
  { key: "description", label: t('security.audit.columns.description') },
  { key: "hotel", label: t('security.audit.columns.establishment') },
  { key: "user", label: t('security.audit.columns.by') },
  { key: "createdAt", label: t('security.audit.columns.date') },
]);

const auditLogs = ref<any[]>([]);
const meta = ref<any>(null);
const loading = ref(false);

const fetchAudit = async (page = 1) => {
  loading.value = true;
  try {
    const res = await historyService.getAll({
      page,
      limit: 5,
      action: "subscription.toggleStatus",
    });
    auditLogs.value = res.data
    meta.value = res.meta;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const handlePageAudit = (newPage: number) => fetchAudit(newPage);

const getActionBadge = (action: string) => {
  if (action.endsWith('.create')) return { label: t('security.audit.badges.create'), class: 'bg-blue-100 text-blue-600' }
  if (action.endsWith('.toggleStatus')) return { label: t('security.audit.badges.update'), class: 'bg-amber-100 text-amber-600' }
  if (action.endsWith('.delete')) return { label: t('security.audit.badges.delete'), class: 'bg-red-100 text-red-600' }
  if (action.endsWith('.extend')) return { label: t('security.audit.badges.extend'), class: 'bg-purple-100 text-purple-600' }
  return { label: action, class: 'bg-slate-100 text-slate-500' }
}

onMounted(() => {
  fetchAllTenants();
  fetchSubscriptions(1);
  fetchAudit(1);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
