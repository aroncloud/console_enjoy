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
          :disabled="loading"
          @click="!loading && emit('back')"
        />
      </div>

      <!-- Tab navigation -->
      <div class="flex border-b border-gray-200 mb-6 gap-6">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="!loading && goToTab(tab.key)"
          :disabled="loading"
          :class="[
            'pb-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === tab.key
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500',
            loading ? 'cursor-not-allowed opacity-50' : 'hover:text-gray-700 cursor-pointer'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Form card -->
      <div class="bg-white rounded-xl border border-gray-200 p-8 space-y-8" :class="loading ? 'pointer-events-none opacity-60' : ''">

        <!-- ── Informations Générales ── -->
        <section v-show="activeTab === 'general'">
          <div class="grid grid-cols-2 gap-5">
            <div class="flex flex-col gap-1.5">
              <Input lb="Nom de l'hôtel" v-model="form.hotelName" placeholder="Ex: Grand Hôtel Rivage" :is-required="true" />
              <p v-if="errors.hotelName" class="text-sm font-light italic text-red-500">{{ errors.hotelName }}</p>
            </div>
            <Input lb="Enseigne / Chaîne" v-model="form.chain" placeholder="Ex: Luxury Collection" />
            <Input lb="Code Postal" v-model="form.postalCode" placeholder="Ex: 06000" />
            <InputCountries lb="Pays" v-model="form.country" />
            <InputSelectCity lb="Ville" v-model="form.city" placeholder="Ville" :country="form.country" />

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Site Web</label>
              <div class="flex">
                <span class="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">https://</span>
                <input v-model="form.website" type="text" placeholder="www.hotel.com" class="dark:bg-dark-900 h-11 w-full rounded-r-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-hidden focus:ring-3 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-purple-800" />
              </div>
            </div>

            <Input lb="Nombre d'étages" v-model.number="form.totalFloors" type="number" placeholder="Ex: 5" />

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Classement (étoiles)</label>
              <div class="flex items-center gap-2 h-11">
                <button v-for="star in 5" :key="star" type="button" @click="form.starRating = star" class="transition-transform hover:scale-110">
                  <svg class="w-7 h-7 transition-colors" :class="star <= form.starRating ? 'text-amber-400' : 'text-gray-200'" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </button>
                <span class="text-sm text-gray-500 ml-1">{{ form.starRating > 0 ? `${form.starRating} étoile${form.starRating > 1 ? 's' : ''}` : 'Non classé' }}</span>
              </div>
            </div>

            <div class="col-span-2">
              <Input lb="Adresse (Rue)" v-model="form.address" placeholder="Ex: 42 Avenue des Palmiers" />
            </div>
          </div>
        </section>

        <!-- ── Contact Principal ── -->
        <section v-show="activeTab === 'contact'">
          <div class="space-y-6">
            <div>
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Contact Gestionnaire</h3>
              <div class="grid grid-cols-2 gap-5">
                <Input lb="Nom du Gestionnaire / Directeur" v-model="form.managerName" placeholder="Jean Dupont" />
                <Input lb="Email Professionnel" v-model="form.managerEmail" type="email" placeholder="j.dupont@hotel.com" />
                <InputPhone :title="'Numéro de Téléphone'" v-model="form.phone"   :isRequired="false" />
              </div>
            </div>

            <div class="border-t border-gray-100 pt-6">
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Administrateur Système</h3>
              <p class="text-xs text-gray-400 mb-4">Cet utilisateur recevra les accès pour gérer l'établissement.</p>
              <div class="grid grid-cols-2 gap-5">
                <div class="flex flex-col gap-1.5">
                  <Input lb="Prénom" v-model="form.adminFirstName" placeholder="Ex: Alice" :is-required="true" />
                  <p v-if="errors.adminFirstName" class="text-sm font-light italic text-red-500">{{ errors.adminFirstName }}</p>
                </div>
                <div class="flex flex-col gap-1.5">
                  <Input lb="Nom" v-model="form.adminLastName" placeholder="Ex: Martin" :is-required="true" />
                  <p v-if="errors.adminLastName" class=" text-red-500 text-sm font-light italic">{{ errors.adminLastName }}</p>
                </div>
                <div class="flex flex-col gap-1.5">
                  <Input lb="Email" v-model="form.adminEmail" type="email" placeholder="admin@hotel.com" :is-required="true" />
                  <p v-if="errors.adminEmail" class=" text-red-500 text-sm font-light italic">{{ errors.adminEmail }}</p>
                </div>
                <InputPhone :title="'Numéro de Téléphone'" v-model="form.adminPhoneNumber"   :isRequired="false" />
              </div>
            </div>
          </div>
        </section>

        <!-- ── Configuration Initiale ── -->
        <section v-show="activeTab === 'config'">
          <div class="space-y-6">
            <div>
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Identifiants & Localisation</h3>
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
            </div>

            <div class="border-t border-gray-100 pt-6">
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Horaires</h3>
              <div class="grid grid-cols-4 gap-5">
                <div class="flex flex-col gap-1.5">
                  <InputTime title="Heure de Check-in" v-model="form.checkInTime" />
                 
                </div>
                <div class="flex flex-col gap-1.5">
                  <InputTime title="Heure de Check-out" v-model="form.checkOutTime" />
                </div>
                <Input lb="Taux de taxe (%)" v-model.number="form.taxRate" type="number" placeholder="Ex: 19.25" />
                <div  class="">
                    <Input :lb="'Nombre de Chambres'" v-model.number="form.pmsRooms" type="number" min="1"  placeholder="Ex: 20" />
                  </div>
              </div>
            </div>

            <div class="border-t border-gray-100 pt-6">
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Politiques</h3>
              <div class="grid grid-cols-1 gap-5">
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-gray-700">Politique d'annulation</label>
                  <textarea v-model="form.cancellationPolicy" rows="3" placeholder="Ex: Annulation gratuite jusqu'à 48h avant l'arrivée..." class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-3 focus:ring-purple-500/10 resize-none" />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-gray-700">Politique de l'établissement</label>
                  <textarea v-model="form.policies" rows="3" placeholder="Ex: Non-fumeur. Animaux non admis. Accès PMR disponible..." class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-3 focus:ring-purple-500/10 resize-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── Activation des Services ── -->
        <!-- <section v-show="activeTab === 'services'">
          <div class="space-y-3" :class="loading ? 'pointer-events-none opacity-50' : ''">

            <div :class="['rounded-xl border p-4 transition-all', form.pmsEnabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50']">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', form.pmsEnabled ? 'bg-purple-50' : 'bg-gray-100']">
                    <svg :class="['w-5 h-5', form.pmsEnabled ? 'text-purple-600' : 'text-gray-400']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <input v-model.number="form.pmsRooms" type="number" min="1" class="w-20 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <Toggle v-model="form.pmsEnabled" />
                </div>
              </div>
            </div>

            <div :class="['rounded-xl border p-4 transition-all', form.posEnabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50']">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', form.posEnabled ? 'bg-purple-50' : 'bg-gray-100']">
                    <svg :class="['w-5 h-5', form.posEnabled ? 'text-purple-600' : 'text-gray-400']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <input v-model.number="form.posTerminals" type="number" min="0" class="w-20 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <Toggle v-model="form.posEnabled" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div :class="['rounded-xl border p-4 flex items-center justify-between transition-all', form.channelManagerEnabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50']">
                <div class="flex items-center gap-3">
                  <div :class="['w-9 h-9 rounded-lg flex items-center justify-center', form.channelManagerEnabled ? 'bg-purple-50' : 'bg-gray-100']">
                    <svg :class="['w-4 h-4', form.channelManagerEnabled ? 'text-purple-600' : 'text-gray-400']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-gray-700">Channel Manager</span>
                </div>
                <Toggle v-model="form.channelManagerEnabled" />
              </div>
              <div :class="['rounded-xl border p-4 flex items-center justify-between transition-all', form.mobileAppEnabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50']">
                <div class="flex items-center gap-3">
                  <div :class="['w-9 h-9 rounded-lg flex items-center justify-center', form.mobileAppEnabled ? 'bg-purple-50' : 'bg-gray-100']">
                    <svg :class="['w-4 h-4', form.mobileAppEnabled ? 'text-purple-600' : 'text-gray-400']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-gray-700">Application Mobile</span>
                </div>
                <Toggle v-model="form.mobileAppEnabled" />
              </div>
            </div>

          </div>
        </section> -->

      </div>

      <!-- ── Footer ── -->
      <div class="flex justify-end gap-3 mt-6">
        <ButtonComponent
          v-if="!isFirstTab"
          label="Précédent"
          variant="secondary"
          :iconLeft="ChevronLeft"
          :disabled="loading"
          @click="prevTab"
        />
        <ButtonComponent
          v-if="!isLastTab"
          label="Suivant"
          variant="primary"
          :iconRight="ChevronRight"
          @click="nextTab"
        />
        <ButtonComponent
          v-if="isLastTab"
          label="Créer l'établissement"
          variant="primary"
          :loading="loading"
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
import InputPhone from '../FormElements/InputPhone.vue'
import InputTime from '../FormElements/InputTime.vue'

//  Props 
interface Props { loading?: boolean }
const props = withDefaults(defineProps<Props>(), { loading: false })

//Emits 
const emit = defineEmits<{
  (e: 'submit', data: any): void
  (e: 'cancel'): void
  (e: 'back'): void
}>()

//  Tabs 
const tabs = [
  { key: 'general',  label: 'Informations Générales' },
  { key: 'contact',  label: 'Contact Principal' },
  { key: 'config',   label: 'Configuration Initiale' },
  // { key: 'services', label: 'Activation des Services' },
]

const activeTab    = ref('general')
const currentIndex = computed(() => tabs.findIndex(t => t.key === activeTab.value))
const isFirstTab   = computed(() => currentIndex.value === 0)
const isLastTab    = computed(() => currentIndex.value === tabs.length - 1)

//  Erreurs de validation 
const errors = reactive({
  hotelName: '',
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
})

//  Validation par onglet 
const validateTab = (tabKey: string): boolean => {
  let valid = true
  if (tabKey === 'general') {
    errors.hotelName = form.hotelName.trim() ? '' : "Le nom de l'hôtel est obligatoire"
    if (errors.hotelName) valid = false
  }
  if (tabKey === 'contact') {
    errors.adminFirstName = form.adminFirstName.trim() ? '' : 'Le prénom est obligatoire'
    errors.adminLastName  = form.adminLastName.trim()  ? '' : 'Le nom est obligatoire'
    errors.adminEmail     =  form.adminEmail.trim() && /\S+@\S+\.\S+/.test(form.adminEmail) ? '' : 'Un email valide est requis'
    if (errors.adminFirstName || errors.adminLastName || errors.adminEmail) valid = false
  }
  return valid
}

// Navigation 
const nextTab = () => {
  if (isLastTab.value || props.loading) return
  if (!validateTab(activeTab.value)) return
  const nextTabItem = tabs[currentIndex.value + 1]
  if (nextTabItem) activeTab.value = nextTabItem.key
}

const prevTab = () => {
  if (!isFirstTab.value && !props.loading) {
    const prevTabItem = tabs[currentIndex.value - 1]
    if (prevTabItem) activeTab.value = prevTabItem.key
  }
}

// Clic direct sur un onglet — libre vers le passé, bloqué vers le futur si invalide
const goToTab = (key: string) => {
  const targetIndex = tabs.findIndex(t => t.key === key)
  if (targetIndex > currentIndex.value && !validateTab(activeTab.value)) return
  activeTab.value = key
}

//  Options
const timezoneOptions = [
  { value: 'Africa/Douala',    label: '(GMT+01:00) Douala, Yaoundé' },
  { value: 'Europe/Paris',     label: '(GMT+01:00) Paris, Berlin' },
  { value: 'Europe/London',    label: '(GMT+00:00) Londres' },
  { value: 'America/New_York', label: '(GMT-05:00) New York' },
  { value: 'Asia/Tokyo',       label: '(GMT+09:00) Tokyo' },
]

const currencyOptions = [
  { value: 'XAF', label: 'Franc CFA (XAF)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'USD', label: 'Dollar ($)' },
  { value: 'GBP', label: 'Livre (£)' },
  { value: 'CHF', label: 'Franc suisse (CHF)' },
]

// Form state
const generateTenantId = () => `TEN-${Math.floor(1000 + Math.random() * 9000)}-FR`

const form = reactive({
  hotelName: '', chain: '', address: '', postalCode: '', city: '', country: 'CM',
  website: '', totalFloors: 0, starRating: 0,
  managerName: '', managerEmail: '', phone: '',
  adminFirstName: '', adminLastName: '', adminEmail: '', adminPhoneNumber: '',
  tenantId: generateTenantId(), timezone: 'Africa/Douala', currency: 'XAF',
  checkInTime: '14:00', checkOutTime: '11:00', taxRate: 0,
  cancellationPolicy: '', policies: '',
  pmsEnabled: true, pmsRooms: 1,
  posEnabled: false, posTerminals: 0,
  channelManagerEnabled: false, mobileAppEnabled: false,
})

const regenerateTenantId = () => { form.tenantId = generateTenantId() }

// Submit 
const handleSubmit = () => {
  const validGeneral = validateTab('general')
  const validContact = validateTab('contact')
  if (!validGeneral) { activeTab.value = 'general'; return }
  if (!validContact) { activeTab.value = 'contact'; return }

  emit('submit', {
    name: form.hotelName,
    description: '',
    address: form.address,
    city: form.city,
    state: '',
    country: form.country,
    postalCode: form.postalCode,
    email: form.managerEmail,
    website: form.website ? `https://${form.website}` : '',
    phone: form.phone,
    totalRooms: Math.max(form.pmsRooms, 1),
    totalFloors: form.totalFloors,
    starRating: form.starRating,
    timezone: form.timezone,
    currency: form.currency,
    taxRate: form.taxRate,
    checkInTime: form.checkInTime,
    checkOutTime: form.checkOutTime,
    cancellationPolicy: form.cancellationPolicy,
    policies: form.policies,
    isActive: true,
    adminFirstName: form.adminFirstName,
    adminLastName: form.adminLastName,
    adminEmail: form.adminEmail,
    adminPhoneNumber: form.adminPhoneNumber,
  })
}
</script>