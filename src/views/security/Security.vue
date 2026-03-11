<template>
  <div class="space-y-6 p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">

    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ">
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <ShieldCheck :size="20" />
          </div>
          <span class="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Opérationnel</span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-xs font-medium">Statut système</p>
        <h3 class="text-2xl font-black mt-1">Nominal</h3>
      </div>

      <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ">
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-blue-100 text-blue-500 rounded-lg">
            <Wifi :size="20" />
          </div>
          <span class="text-[10px] font-bold text-blue-500 bg-blue-100 px-2 py-1 rounded-full">En ligne</span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-xs font-medium">Tenants actifs</p>
        <h3 class="text-2xl font-black mt-1">{{ tenantStatuses.filter(t => !t.suspended).length }} / {{ tenantStatuses.length }}</h3>
      </div>

      <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ">
        <div class="flex items-center justify-between mb-3">
          <div class="p-2 bg-red-100 text-red-500 rounded-lg">
            <Power :size="20" />
          </div>
          <span class="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-1 rounded-full">Suspendus</span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-xs font-medium">Accès révoqués</p>
        <h3 class="text-2xl font-black mt-1">{{ tenantStatuses.filter(t => t.suspended).length }}</h3>
      </div>
    </div>

    <!-- Kill-Switch + Tenants -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Kill-Switch -->
      <div class="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 class="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Kill-Switch API</h3>
          <Power :size="16" class="text-red-400" />
        </div>

        <div class="p-5 space-y-4">
          <!-- Motif -->
          <BaseSelect
            lb="Motif de suspension"
            v-model="killReason"
            :options="reasonOptions"
            placeholder="Choisir un motif..."
          />

          <!-- Tenant ID -->
          <BaseInput
            lb="Tenant ID"
            :is-required="true"
            v-model="tenant"
            placeholder="ex: hotel_grand_paris_01"
          />

          <!-- Quick picks -->
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

          <!-- Confirm toggle -->
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
      </div>

      <!-- Tenant statuses -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800  overflow-hidden flex flex-col">


        <BaseTable :columns="tenantColumns" :data="tenantStatuses" :title="'Statut des tenants'">

          <template #cell-name="{ value }">
            <span class="font-semibold text-gray-800 dark:text-white">{{ value }}</span>
          </template>

          <template #cell-id="{ value }">
            <span class="font-mono text-xs text-slate-400">{{ value }}</span>
          </template>

          <template #cell-suspended="{ value }">
            <span
              class="px-2 py-1 text-[10px] font-bold rounded-full uppercase flex items-center gap-1.5 w-fit"
              :class="value ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="value ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'" />
              {{ value ? 'Suspendu' : 'Actif' }}
            </span>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex justify-end">
              <button
                class="p-1.5 rounded-lg border transition-colors text-xs font-semibold flex items-center gap-1"
                :class="row.suspended
                  ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/40 dark:hover:bg-emerald-900/10'
                  : 'border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/10'"
                @click="toggleTenant(row)"
              >
                <Power :size="12" />
                {{ row.suspended ? 'Restaurer' : 'Suspendre' }}
              </button>
            </div>
          </template>

        </BaseTable>

      </div>
    </div>

    <!-- Audit log -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="px-5 py-4 border-b rounded-md border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 class="font-bold text-sm">Journal d'audit</h3>
        <button class="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-purple-500 transition-colors">
          <Download :size="14" />
        </button>
      </div>

      <BaseTable :columns="auditColumns" :data="auditLogs">

        <template #cell-type="{ value }">
          <span
            class="px-2 py-1 text-[10px] font-bold rounded-full uppercase"
            :class="value === 'kill' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'"
          >
            {{ value === 'kill' ? 'Suspension' : 'Restauration' }}
          </span>
        </template>

        <template #cell-action="{ value }">
          <span class="text-sm text-gray-800 dark:text-white font-medium">{{ value }}</span>
        </template>

        <template #cell-meta="{ value }">
          <span class="text-xs text-slate-400">{{ value }}</span>
        </template>

        <template #cell-time="{ value }">
          <span class="text-xs text-slate-400">{{ value }}</span>
        </template>

      </BaseTable>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ShieldCheck, Wifi, Power, Info, Download } from 'lucide-vue-next'

import BaseTable       from '../../components/Table/BaseTable.vue'
import BaseInput       from '../../components/FormElements/Input.vue'
import BaseSelect      from '../../components/FormElements/Select.vue'


// ── Kill-Switch 
const tenant      = ref('')
const confirmMode = ref(false)
const killReason  = ref<string | number>('payment')

const reasonOptions = [
  { label: 'Non-paiement prolongé',   value: 'payment'  },
  { label: 'Incident de sécurité',    value: 'security' },
  { label: "Abus d'API",              value: 'abuse'    },
]

const recentTenants = ['hotel_grand_paris_01', 'city_hub_lyon_02', 'boutique_lodge_03']

const kill = () => {
  if (!tenant.value.trim()) return
  const found = tenantStatuses.value.find(t => t.id === tenant.value.trim())
  if (found) found.suspended = true
  auditLogs.value.unshift({
    type:   'kill',
    action: `Accès suspendus — ${tenant.value.trim()}`,
    meta:   `Motif : ${reasonOptions.find(r => r.value === killReason.value)?.label} · par Admin`,
    time:   "À l'instant",
  })
  tenant.value      = ''
  confirmMode.value = false
}

// ── Tenants ───────────────────────────────────────────────────────────────────
const tenantColumns = [
  { key: 'name',      label: 'Établissement' },
  { key: 'id',        label: 'Tenant ID' },
  { key: 'suspended', label: 'Statut' },
  { key: 'actions',   label: '', thClass: 'text-right' },
]

const tenantStatuses = ref([
  { id: 'hotel_grand_paris_01',   name: 'Grand Hotel Paris',   suspended: false },
  { id: 'city_hub_lyon_02',       name: 'City Hub Lyon',       suspended: false },
  { id: 'boutique_lodge_03',      name: 'Boutique Lodge',      suspended: true  },
  { id: 'ocean_breeze_resort_04', name: 'Ocean Breeze Resort', suspended: false },
  { id: 'mountain_view_lodge_05', name: 'Mountain View Lodge', suspended: false },
])



const toggleTenant = (t: Record<string, any>) => {
  const tenant = t as { id: string; name: string; suspended: boolean }
  tenant.suspended = !tenant.suspended
  auditLogs.value.unshift({
    type:   tenant.suspended ? 'kill' : 'restore',
    action: tenant.suspended ? `Accès suspendus — ${tenant.name}` : `Accès restaurés — ${tenant.name}`,
    meta:   'Action manuelle · par Admin',
    time:   "À l'instant",
  })
}

// ── Audit log ─────────────────────────────────────────────────────────────────
const auditColumns = [
  { key: 'type',   label: 'Type'    },
  { key: 'action', label: 'Action'  },
  { key: 'meta',   label: 'Détails' },
  { key: 'time',   label: 'Date'    },
]

const auditLogs = ref([
  { type: 'kill',    action: 'Accès suspendus — Boutique Lodge',   meta: 'Motif : Non-paiement · par Admin',   time: 'Il y a 2h'  },
  { type: 'restore', action: 'Accès restaurés — Mountain View',    meta: 'Paiement reçu · par Système',        time: 'Il y a 5h'  },
  { type: 'kill',    action: 'Accès suspendus — Urban Stay Berlin', meta: "Motif : Abus d'API · par Admin",     time: 'Hier 14:32' },
  { type: 'restore', action: 'Accès restaurés — Urban Stay Berlin', meta: 'Vérification complète · par Admin', time: 'Hier 16:10' },
])
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
