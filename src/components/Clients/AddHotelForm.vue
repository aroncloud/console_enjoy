<template>
  <div class="min-h-screen bg-gray-50 px-6 py-8">
    <div class="">

      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Ajouter un nouvel établissement</h1>
          <p class="text-gray-500 text-sm mt-1">Configurez les détails du nouveau client pour son activation.</p>
        </div>
        <ButtonComponent
          label="Retour à la liste"
          variant="ghost"
          :iconLeft="ArrowLeft"
          @click="emit('back')"
        />
      </div>

      <!-- Tab navigation -->
      <div class="flex border-b border-gray-200 mb-6 gap-6">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'pb-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === tab.key
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Form card -->
      <div class="bg-white rounded-xl border border-gray-200  p-8 space-y-8">

        <!-- ── Informations de l'établissement ── -->
        <section v-show="activeTab === 'general'">
          <h3 class="text-base font-semibold text-gray-800 mb-5">Informations de l'établissement</h3>
          <div class="grid grid-cols-2 gap-5">
            <Input lb="Nom de l'hôtel" v-model="form.hotelName" placeholder="Ex: Grand Hôtel Rivage" :is-required="true" />
            <Input lb="Enseigne / Chaîne" v-model="form.chain" placeholder="Ex: Luxury Collection" />
          
            <Input lb="Code Postal" v-model="form.postalCode" placeholder="Ex: 06000" />
            <InputCountries lb="Pays" v-model="form.country" />
            <InputSelectCity lb="Ville" v-model="form.city" placeholder="Ville" :country="form.country" />
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Site Web</label>
              <div class="flex">
                <span class="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">https://</span>
                <input v-model="form.website" type="text" placeholder="www.hotel.com" class="dark:bg-dark-900 h-11 w-full rounded-r-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800  placeholder:text-gray-400 focus:border-purple-500 focus:outline-hidden focus:ring-3 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-purple-800" />
              </div>
            </div>
              <div class="col-span-2">
              <Input lb="Adresse (Rue)" v-model="form.address" placeholder="Ex: 42 Avenue des Palmiers" />
            </div>
          </div>
        </section>

        <!-- ── Contact Principal ── -->
        <section v-show="activeTab === 'contact'">
          <h3 class="text-base font-semibold text-gray-800 mb-5">Contact Principal</h3>
          <div class="grid grid-cols-2 gap-5">
            <Input lb="Nom du Gestionnaire / Directeur" v-model="form.managerName" placeholder="Jean Dupont" />
            <Input lb="Email Professionnel" v-model="form.managerEmail" type="email" placeholder="j.dupont@hotel.com" />
            <Input lb="Numéro de Téléphone" v-model="form.phone" type="tel" placeholder="+33 6 12 34 56 78" />
          </div>
        </section>

        <!-- ── Configuration Initiale ── -->
        <section v-show="activeTab === 'config'">
          <h3 class="text-base font-semibold text-gray-800 mb-5">Configuration Initiale</h3>
          <div class="grid grid-cols-3 gap-5">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Tenant ID</label>
              <div class="flex gap-2">
                <input v-model="form.tenantId" readonly class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none" />
                <button @click="regenerateTenantId" class="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors" title="Régénérer">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-400">Identifiant unique auto-généré.</p>
            </div>
            <Select lb="Fuseau Horaire" v-model="form.timezone" :options="timezoneOptions" />
            <Select lb="Devise par défaut" v-model="form.currency" :options="currencyOptions" />
          </div>
        </section>

        <!-- ── Activation des Services ── -->
        <section v-show="activeTab === 'services'">
          <h3 class="text-base font-semibold text-gray-800 mb-5">Activation des Services</h3>
          <div class="space-y-3">

            <!-- PMS -->
            <div :class="['rounded-xl border p-4 transition-all', form.pmsEnabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50']">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', form.pmsEnabled ? 'bg-blue-50' : 'bg-gray-100']">
                    <svg :class="['w-5 h-5', form.pmsEnabled ? 'text-blue-600' : 'text-gray-400']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-800">PMS (Property Management System)</p>
                    <p class="text-xs text-gray-400 mt-0.5">Gestion des réservations et des chambres</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div v-if="form.pmsEnabled" class="flex items-center gap-2">
                    <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre de Chambres</span>
                    <input v-model.number="form.pmsRooms" type="number" min="0" class="w-20 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <Toggle v-model="form.pmsEnabled" />
                </div>
              </div>
            </div>

            <!-- POS -->
            <div :class="['rounded-xl border p-4 transition-all', form.posEnabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50']">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', form.posEnabled ? 'bg-blue-50' : 'bg-gray-100']">
                    <svg :class="['w-5 h-5', form.posEnabled ? 'text-blue-600' : 'text-gray-400']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-800">POS (Point of Sale)</p>
                    <p class="text-xs text-gray-400 mt-0.5">Gestion de la restauration et points de vente</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div v-if="form.posEnabled" class="flex items-center gap-2">
                    <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Terminaux</span>
                    <input v-model.number="form.posTerminals" type="number" min="0" class="w-20 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <Toggle v-model="form.posEnabled" />
                </div>
              </div>
            </div>

            <!-- Channel Manager + App Mobile -->
            <div class="grid grid-cols-2 gap-3">
              <div :class="['rounded-xl border p-4 flex items-center justify-between transition-all', form.channelManagerEnabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50']">
                <div class="flex items-center gap-3">
                  <div :class="['w-9 h-9 rounded-lg flex items-center justify-center', form.channelManagerEnabled ? 'bg-blue-50' : 'bg-gray-100']">
                    <svg :class="['w-4 h-4', form.channelManagerEnabled ? 'text-blue-600' : 'text-gray-400']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-gray-700">Channel Manager</span>
                </div>
                <Toggle v-model="form.channelManagerEnabled" />
              </div>
              <div :class="['rounded-xl border p-4 flex items-center justify-between transition-all', form.mobileAppEnabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50']">
                <div class="flex items-center gap-3">
                  <div :class="['w-9 h-9 rounded-lg flex items-center justify-center', form.mobileAppEnabled ? 'bg-blue-50' : 'bg-gray-100']">
                    <svg :class="['w-4 h-4', form.mobileAppEnabled ? 'text-blue-600' : 'text-gray-400']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-gray-700">Application Mobile</span>
                </div>
                <Toggle v-model="form.mobileAppEnabled" />
              </div>
            </div>

          </div>
        </section>

      </div>

      <!-- ── Footer ── -->
      <div class="flex justify-end gap-3 mt-6">

        <!-- Précédent — tous les onglets sauf le premier -->
        <ButtonComponent
          v-if="!isFirstTab"
          label="Précédent"
          variant="secondary"
          :iconLeft="ChevronLeft"
          @click="prevTab"
        />

        <!-- Suivant — tous les onglets sauf le dernier -->
        <ButtonComponent
          v-if="!isLastTab"
          label="Suivant"
          variant="primary"
          :iconRight="ChevronRight"
          @click="nextTab"
        />

        <!-- Créer — uniquement sur le dernier onglet -->
        <ButtonComponent
          v-if="isLastTab"
          label="Créer l'établissement"
          variant="primary"
          @click="handleSubmit"
        />

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-vue-next'

import Toggle          from '../FormElements/Toggle.vue'
import Input           from '../FormElements/Input.vue'
import InputSelectCity from '../FormElements/InputSelectCity.vue'
import InputCountries  from '../FormElements/InputCountries.vue'
import Select          from '../FormElements/Select.vue'
import ButtonComponent from '../Button/ButtonComponent.vue'

// ─── Emits ────────────────────────────────────────────────────────────────────
const emit = defineEmits<{
  (e: 'submit', data: typeof form): void
  (e: 'cancel'): void
  (e: 'back'): void
}>()

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const tabs: { key: string; label: string }[] = [
  { key: 'general',  label: 'Informations Générales' },
  { key: 'contact',  label: 'Contact Principal' },
  { key: 'config',   label: 'Configuration Initiale' },
  { key: 'services', label: 'Activation des Services' },
]

const activeTab    = ref('general')
const currentIndex = computed(() => tabs.findIndex(t => t.key === activeTab.value))
const isFirstTab   = computed(() => currentIndex.value === 0)
const isLastTab    = computed(() => currentIndex.value === tabs.length - 1)

const nextTab = () => { if (!isLastTab.value)  activeTab.value = tabs[currentIndex.value + 1].key }
const prevTab = () => { if (!isFirstTab.value) activeTab.value = tabs[currentIndex.value - 1].key }

// ─── Select options ───────────────────────────────────────────────────────────
const timezoneOptions = [
  { value: 'Europe/Paris',     label: '(GMT+01:00) Paris, Berlin' },
  { value: 'Europe/London',    label: '(GMT+00:00) Londres' },
  { value: 'America/New_York', label: '(GMT-05:00) New York' },
  { value: 'Asia/Tokyo',       label: '(GMT+09:00) Tokyo' },
]

const currencyOptions = [
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'USD', label: 'Dollar ($)' },
  { value: 'GBP', label: 'Livre (£)' },
  { value: 'CHF', label: 'Franc suisse (CHF)' },
]

// ─── Form state ───────────────────────────────────────────────────────────────
const generateTenantId = () => `TEN-${Math.floor(1000 + Math.random() * 9000)}-FR`

const form = reactive({
  hotelName: '',
  chain: '',
  address: '',
  postalCode: '',
  city: '',
  country: 'FR',
  website: '',
  managerName: '',
  managerEmail: '',
  phone: '',
  tenantId: generateTenantId(),
  timezone: 'Europe/Paris',
  currency: 'EUR',
  pmsEnabled: true,
  pmsRooms: 0,
  posEnabled: false,
  posTerminals: 0,
  channelManagerEnabled: false,
  mobileAppEnabled: false,
})

const regenerateTenantId = () => { form.tenantId = generateTenantId() }
const handleSubmit = () => { emit('submit', { ...form }) }
</script>