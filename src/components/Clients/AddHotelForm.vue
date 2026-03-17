<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-950 px-6 py-8">
    <div class="">

      <!-- Loading skeleton (mode édition) -->
      <div v-if="loadingHotel" class="space-y-6">
        <div class="h-8 w-1/3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        <div class="h-4 w-1/4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-8 space-y-5">
          <div v-for="i in 6" :key="i" class="h-10 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        </div>
      </div>

      <div v-else>
        <!-- Header -->
        <div class="flex items-start justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ isEditMode ? t('hotelForm.header.editTitle') : t('hotelForm.header.createTitle') }}
            </h1>
            <p class="text-gray-500 dark:text-slate-400 text-sm mt-1">
              {{ isEditMode
                ? t('hotelForm.header.editSubtitle', { name: form.hotelName })
                : t('hotelForm.header.createSubtitle') }}
            </p>
          </div>
          <ButtonComponent
            :label="t('hotelForm.actions.backToList')"
            variant="ghost"
            :iconLeft="ArrowLeft"
            :disabled="loading"
            @click="!loading && emit('back')"
          />
        </div>

        <!-- Tab navigation -->
        <div class="flex border-b border-gray-200 dark:border-slate-800 mb-6 gap-6">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="!loading && goToTab(tab.key)"
            :disabled="loading"
            :class="[
              'pb-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.key
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 dark:text-slate-400',
              loading ? 'cursor-not-allowed opacity-50' : 'hover:text-gray-700 dark:hover:text-slate-200 cursor-pointer'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Form card -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-8 space-y-8" :class="loading ? 'pointer-events-none opacity-60' : ''">

          <!-- ── Informations Générales ── -->
      <section v-show="activeTab === 'general'">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          <div class="flex flex-col gap-1.5">
            <Input :lb="t('hotelForm.fields.hotelName')" v-model="form.hotelName" :placeholder="t('hotelForm.placeholders.hotelName')" :is-required="true" />
            <p v-if="errors.hotelName" class="text-sm font-light italic text-red-500">{{ errors.hotelName }}</p>
          </div>

          <Input :lb="t('hotelForm.fields.chain')" v-model="form.chain" :placeholder="t('hotelForm.placeholders.chain')" />

          <Input :lb="t('hotelForm.fields.postalCode')" v-model="form.postalCode" :placeholder="t('hotelForm.placeholders.postalCode')" />

          <InputCountries :lb="t('hotelForm.fields.country')" v-model="form.country" />

          <div class="flex flex-col gap-1.5">
            <InputSelectCity :lb="t('hotelForm.fields.city')" v-model="form.city" :placeholder="t('hotelForm.placeholders.city')" :country="form.country" :is-required="true" />
            <p v-if="errors.city" class="text-sm font-light italic text-red-500">{{ errors.city }}</p>
          </div>

          <Input :lb="t('hotelForm.fields.managerEmail')" v-model="form.managerEmail" type="email" placeholder="j.dupont@hotel.com" />

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('hotelForm.fields.website') }}</label>
            <div class="flex">
              <span class="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-300 text-sm">
                https://
              </span>
              <input
                v-model="form.website"
                type="text"
                placeholder="www.hotel.com"
                class="h-11 w-full rounded-r-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-400 focus:border-purple-500 focus:outline-hidden focus:ring-3 focus:ring-purple-500/10 dark:focus:border-purple-800"
              />
            </div>
          </div>

          <InputPhone :title="t('hotelForm.fields.phoneNumber')" v-model="form.phone" :isRequired="false" />

          <Input :lb="t('hotelForm.fields.totalFloors')" v-model.number="form.totalFloors" type="number" :placeholder="t('hotelForm.placeholders.totalFloors')" :is-required="true" />

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700">
              {{ t('hotelForm.fields.starRating') }}<span class="text-red-500">*</span>
            </label>
            <div class="flex items-center gap-2 h-11">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                @click="form.starRating = star"
                class="transition-transform hover:scale-110"
              >
                <svg class="w-7 h-7 transition-colors" :class="star <= form.starRating ? 'text-amber-400' : 'text-gray-200'" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </button>
              <span class="text-sm text-gray-500 ml-1">
                {{ form.starRating > 0
                  ? t('hotelForm.starRating.stars', { count: form.starRating, suffix: form.starRating > 1 ? 's' : '' })
                  : t('hotelForm.starRating.unrated') }}
              </span>
            </div>
            <p v-if="errors.starRating" class="text-sm font-light italic text-red-500">{{ errors.starRating }}</p>
          </div>

          <div class="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
            <Input :lb="t('hotelForm.fields.address')" v-model="form.address" :placeholder="t('hotelForm.placeholders.address')" :is-required="true" />
            <p v-if="errors.address" class="text-sm font-light italic text-red-500">{{ errors.address }}</p>
          </div>

        </div>
      </section>

          <!-- ── Contact Principal ── -->
          <section v-show="activeTab === 'contact'">
            <div class="space-y-6">
              <!-- <div>
                <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Contact Gestionnaire</h3>
                <div class="grid grid-cols-2 gap-5">
                  <Input lb="Nom du Gestionnaire / Directeur" v-model="form.managerName" placeholder="Jean Dupont" />
                  <Input lb="Email Professionnel" v-model="form.managerEmail" type="email" placeholder="j.dupont@hotel.com" />
                  <InputPhone :title="'Numéro de Téléphone'" v-model="form.phone" :isRequired="false" />
                </div>
              </div> -->

              <div class=" ">
                <h3 class="text-sm font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider mb-4">{{ t('hotelForm.admin.title') }}</h3>
                <p class="text-xs text-gray-400 dark:text-slate-400 mb-4">
                  {{ isEditMode ? t('hotelForm.admin.editHelp') : t('hotelForm.admin.createHelp') }}
                </p>
                <div class="grid md:grid-cols-2 grid-cols-1 gap-5">
                  <div class="flex flex-col gap-1.5">
                    <Input :lb="t('users.fields.firstName')" v-model="form.adminFirstName" :placeholder="t('hotelForm.placeholders.firstName')" :is-required="true" />
                    <p v-if="errors.adminFirstName" class="text-sm font-light italic text-red-500">{{ errors.adminFirstName }}</p>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <Input :lb="t('users.fields.lastName')" v-model="form.adminLastName" :placeholder="t('hotelForm.placeholders.lastName')" :is-required="true" />
                    <p v-if="errors.adminLastName" class="text-red-500 text-sm font-light italic">{{ errors.adminLastName }}</p>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <Input :lb="t('users.fields.email')" v-model="form.adminEmail" type="email" placeholder="admin@hotel.com" :is-required="true" />
                    <p v-if="errors.adminEmail" class="text-red-500 text-sm font-light italic">{{ errors.adminEmail }}</p>
                  </div>
                  <div class="flex flex-col gap-1.5">
                  <InputPhone :title="t('hotelForm.fields.phoneNumber')" v-model="form.adminPhoneNumber" :isRequired="true" />
                  <p v-if="errors.adminPhoneNumber" class="text-sm font-light italic text-red-500">{{ errors.adminPhoneNumber }}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ── Configuration Initiale ── -->
          <section v-show="activeTab === 'config'">
            <div class="space-y-6">
              <div>
                <h3 class="text-sm font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider mb-4">{{ t('hotelForm.config.credentialsTitle') }}</h3>
                <div class="grid  md:grid-cols-3 grid-cols-1 gap-5">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('hotelForm.fields.tenantId') }}</label>
                    <div class="flex gap-2">
                      <input v-model="form.tenantId" readonly class="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-200 focus:outline-none" />
                      <!-- Régénération uniquement en mode création -->
                      <button
                        v-if="!isEditMode"
                        @click="regenerateTenantId"
                        class="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-300 transition-colors"
                        :title="t('common.refresh')"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                      </button>
                    </div>
                    <p class="text-xs text-gray-400 dark:text-slate-400">{{ t('hotelForm.config.tenantHint') }}</p>
                  </div>
                  <Select :lb="t('hotelForm.fields.timezone')" v-model="form.timezone" :options="timezoneOptions" />
                  <Select :lb="t('hotelForm.fields.currencyDefault')" v-model="form.currency" :options="currencyOptions" />
                </div>
              </div>

              <div class="border-t border-gray-100 dark:border-slate-800 pt-6">
                <h3 class="text-sm font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider mb-4">{{ t('hotelForm.config.scheduleTitle') }}</h3>
                <div class="grid grid-cols-1 md:grid-cols-4  gap-5">
                  <div class="flex flex-col gap-1.5">
                    <InputTime :title="t('hotelForm.fields.checkInTime')" v-model="form.checkInTime" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <InputTime :title="t('hotelForm.fields.checkOutTime')" v-model="form.checkOutTime" />
                  </div>
                  <Input :lb="t('hotelForm.fields.taxRate')" v-model.number="form.taxRate" type="number" :placeholder="t('hotelForm.placeholders.taxRate')" />
                  <Input :lb="t('hotelForm.fields.roomsCount')" v-model.number="form.pmsRooms" type="number" min="1" :placeholder="t('hotelForm.placeholders.roomsCount')" />
                </div>
              </div>

              <div class="border-t border-gray-100 dark:border-slate-800 pt-6">
                <h3 class="text-sm font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider mb-4">{{ t('hotelForm.config.policiesTitle') }}</h3>
                <div class="grid grid-cols-1 gap-5">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('hotelForm.fields.cancellationPolicy') }}</label>
                    <textarea v-model="form.cancellationPolicy" rows="3" :placeholder="t('hotelForm.placeholders.cancellationPolicy')" class="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-3 focus:ring-purple-500/10 resize-none" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('hotelForm.fields.hotelPolicy') }}</label>
                    <textarea v-model="form.policies" rows="3" :placeholder="t('hotelForm.placeholders.hotelPolicy')" class="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-3 focus:ring-purple-500/10 resize-none" />
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        <!-- ── Footer ── -->
        <div class="flex justify-end gap-3 mt-6">
          <ButtonComponent
            v-if="!isFirstTab"
            :label="t('common.previous')"
            variant="secondary"
            :iconLeft="ChevronLeft"
            :disabled="loading"
            @click="prevTab"
          />
          <ButtonComponent
            v-if="!isLastTab"
            :label="t('common.next')"
            variant="primary"
            :iconRight="ChevronRight"
            @click="nextTab"
          />
          <ButtonComponent
            v-if="isLastTab"
            :label="isEditMode ? t('hotelForm.actions.saveChanges') : t('hotelForm.actions.createHotel')"
            variant="primary"
            :loading="loading"
            @click="handleSubmit"
          />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

import Input           from '../FormElements/Input.vue'
import InputSelectCity from '../FormElements/InputSelectCity.vue'
import InputCountries  from '../FormElements/InputCountries.vue'
import Select          from '../FormElements/Select.vue'
import ButtonComponent from '../Button/ButtonComponent.vue'
import InputPhone      from '../FormElements/InputPhone.vue'
import InputTime       from '../FormElements/InputTime.vue'
import { hotelService } from '../../servicesAPI/clientService'
import { useToastStore } from '../../composables/toast'

// ── Props ─────────
interface Props {
  loading?: boolean
  hotelId?: number | null   
}
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hotelId: null,
})

// ── Emits ────────────────
const emit = defineEmits<{
  (e: 'submit', data: any): void
  (e: 'cancel'): void
  (e: 'back'): void
}>()

const router     = useRouter()
const toastStore = useToastStore()
const { t } = useI18n()

// ── Mode ──────────
const isEditMode  = computed(() => !!props.hotelId)
const loadingHotel = ref(false)

// ── Tabs ────────────
const tabs = computed(() => [
  { key: 'general', label: t('hotelForm.tabs.general') },
  { key: 'contact', label: t('hotelForm.tabs.contact') },
  { key: 'config',  label: t('hotelForm.tabs.config') },
])

const activeTab    = ref('general')
const currentIndex = computed(() => tabs.value.findIndex(tab => tab.key === activeTab.value))
const isFirstTab   = computed(() => currentIndex.value === 0)
const isLastTab    = computed(() => currentIndex.value === tabs.value.length - 1)

// ── Erreurs ─────
const errors = reactive({
  hotelName:      '',
  adminFirstName: '',
  adminLastName:  '',
  adminEmail:     '',
  address: '',
  city:'',
  starRating:'',
  adminPhoneNumber:''


})

// ── Form ───────
const generateTenantId = () => `TEN-${Math.floor(1000 + Math.random() * 9000)}-FR`

const form = reactive({
  hotelName: '', chain: '', address: '', postalCode: '', city: '', country: 'CM',
  website: '', totalFloors: 1, starRating: 0,
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

// ── Chargement des données en mode édition ──────────
onMounted(async () => {
  if (!isEditMode.value || !props.hotelId) return

  loadingHotel.value = true
  try {
    const response = await hotelService.getById(props.hotelId)
    const h = response.data?.data ?? response.data
    console.log('Données de l\'hôtel chargé pour édition :', h)
    // Pré-remplissage du formulaire avec les données existantes
    form.hotelName         = h.hotelName         ?? ''
    form.chain             = h.description             ?? ''
    form.address           = h.address           ?? ''
    form.postalCode        = h.postalCode        ?? ''
    form.city              = h.city              ?? ''
    form.country           = h.country           ?? 'CM'
    form.website           = (h.website ?? '').replace(/^https?:\/\//, '')
    form.totalFloors       = h.totalFloors       ?? 0
    form.starRating        = h.grade        ?? 0
    form.managerName       = h.managerName       ?? ''
    form.managerEmail      = h.email             ?? ''
    form.phone             = h.phoneNumber       ?? ''
    form.adminFirstName    = h.users[0]?.firstName    ?? ''
    form.adminLastName     = h.users[0]?.lastName     ?? ''
    form.adminEmail        = h.users[0]?.email        ?? ''
    form.adminPhoneNumber  = h.users[0]?.phoneNumber  ?? ''
    form.tenantId          = h.tenantId          ?? form.tenantId
    form.timezone          = h.timezone          ?? 'Africa/Douala'
    form.currency          = h.currencyCode      ?? 'XAF'
    form.checkInTime       = h.checkInTime       ?? '14:00'
    form.checkOutTime      = h.checkOutTime      ?? '11:00'
    form.taxRate           = h.taxRate           ?? 0
    form.pmsRooms          = h.totalRooms        ?? 1
    form.cancellationPolicy = h.cancellationPolicy ?? ''
    form.policies          = h.hotelPolicy          ?? ''
  } catch (e) {
    console.error(e)
    toastStore.show({ type: 'error', message: t('hotelForm.toast.loadError') })
    router.back()
  } finally {
    loadingHotel.value = false
  }
})

// ── Validation ─────────
const validateTab = (tabKey: string): boolean => {
  let valid = true
  if (tabKey === 'general') {
    errors.hotelName = form.hotelName.trim() ? '' : t('hotelForm.validation.hotelNameRequired')
    errors.address = form.address.trim() ? '' : t('hotelForm.validation.addressRequired')
    errors.city = form.city.trim() ? '' : t('hotelForm.validation.cityRequired')
    errors.starRating = form.starRating ? '' : t('hotelForm.validation.starRatingRequired')
    if (errors.hotelName || errors.address || errors.city || errors.starRating ) valid = false
  }
  if (tabKey === 'contact') {
    errors.adminFirstName = form.adminFirstName.trim() ? '' : t('users.validation.firstNameRequired')
    errors.adminLastName  = form.adminLastName.trim()  ? '' : t('users.validation.lastNameRequired')
    errors.adminPhoneNumber = form.adminPhoneNumber ? '' : t('hotelForm.validation.phoneRequired')
    errors.adminEmail     = form.adminEmail.trim() && /\S+@\S+\.\S+/.test(form.adminEmail)
      ? '' : t('hotelForm.validation.emailValid')
    if (errors.adminFirstName || errors.adminLastName || errors.adminEmail || errors.adminPhoneNumber ) valid = false
  }
  return valid
}

// ── Navigation onglets ─────
const nextTab = () => {
  if (isLastTab.value || props.loading) return
  if (!validateTab(activeTab.value)) return
  const next = tabs.value[currentIndex.value + 1]
  if (next) activeTab.value = next.key
}
const prevTab = () => {
  if (!isFirstTab.value && !props.loading) {
    const prev = tabs.value[currentIndex.value - 1]
    if (prev) activeTab.value = prev.key
  }
}
const goToTab = (key: string) => {
  const targetIndex = tabs.value.findIndex(tab => tab.key === key)
  if (targetIndex > currentIndex.value && !validateTab(activeTab.value)) return
  activeTab.value = key
}

// ── Options ───────
const timezoneOptions = [
  { value: 'Africa/Douala',    label: '(GMT+01:00) Douala, Yaoundé' },
  { value: 'Europe/Paris',     label: '(GMT+01:00) Paris, Berlin'   },
  { value: 'Europe/London',    label: '(GMT+00:00) Londres'         },
  { value: 'America/New_York', label: '(GMT-05:00) New York'        },
  { value: 'Asia/Tokyo',       label: '(GMT+09:00) Tokyo'           },
]
const currencyOptions = [
  { value: 'XAF', label: 'Franc CFA (XAF)' },
  { value: 'EUR', label: 'Euro (€)'         },
  { value: 'USD', label: 'Dollar ($)'       },
  { value: 'GBP', label: 'Livre (£)'        },
  { value: 'CHF', label: 'Franc suisse (CHF)' },
]

// ── Submit ─────────
const handleSubmit = () => {
  const validGeneral = validateTab('general')
  const validContact = validateTab('contact')
  if (!validGeneral) { activeTab.value = 'general'; return }
  if (!validContact) { activeTab.value = 'contact'; return }

  const payload = {
    name:               form.hotelName,
    description:        form.chain,
    address:            form.address,
    city:               form.city,
    state:              '',
    country:            form.country,
    postalCode:         form.postalCode,
    email:              form.managerEmail,
    website:            form.website ? `https://${form.website}` : '',
    phone:              form.phone,
    totalRooms:         Math.max(form.pmsRooms, 1),
    totalFloors:        form.totalFloors,
    starRating:         form.starRating,
    timezone:           form.timezone,
    currency:           form.currency,
    taxRate:            form.taxRate,
    checkInTime:        form.checkInTime,
    checkOutTime:       form.checkOutTime,
    cancellationPolicy: form.cancellationPolicy,
    policies:           form.policies,
    isActive:           true,
    adminFirstName:     form.adminFirstName,
    adminLastName:      form.adminLastName,
    adminEmail:         form.adminEmail,
    adminPhoneNumber:   form.adminPhoneNumber,
  }

  emit('submit', payload)
}
</script>
