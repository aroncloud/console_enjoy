<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Toggle from '../../components/FormElements/Toggle.vue'
import CheckboxInput from '../../components/FormElements/CheckboxInput.vue'
import Input from '../../components/FormElements/Input.vue'
import {
  ArrowLeft,
  ArrowLeftRight,
  Edit,
  Info,
  Smartphone,
  BedDouble,
  LogIn,
  ListChecks,
  Utensils,
  Banknote,
  OctagonAlert,
  Loader2,
} from 'lucide-vue-next'
import { hotelService } from '../../servicesAPI/clientService'
import OverLoading from '../../components/spinner/OverLoading.vue'

const route  = useRoute()
const router = useRouter()

// ── State 
const hotel   = ref<any>(null)
const loading = ref(false)
const error   = ref<string | null>(null)

// ── Licences 
const licenses = ref({
  pms:            { active: true,  rooms: 0 },
  pos:            { active: false, units: 1 },
  channelManager: {
    active: false,
    otas: [
      { name: 'Booking.com', checked: false },
      { name: 'Expedia',     checked: false },
      { name: 'Airbnb',      checked: false },
    ],
  },
  mobileApp: { active: false, staffQuota: 0, guestApp: false },
})

// ── Chargement 
onMounted(async () => {
  const id = route.params.id
  if (!id) { router.push('/clients'); return }

  loading.value = true
  try {
    const response = await hotelService.getById(Number(id))
    hotel.value = response.data?.data ?? response.data

    // Initialiser les licences depuis les données réelles dès que le back les enverra
    if (hotel.value?.licenses) {
      licenses.value = { ...licenses.value, ...hotel.value.licenses }
    }

    // Channel manager activé si channelEnable = true
    licenses.value.channelManager.active = hotel.value?.channelEnable ?? false

  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

// ── Données dérivées 
const hotelName    = computed(() => hotel.value?.hotelName    ?? '—')
const hotelCode    = computed(() => hotel.value?.hotelCode    ?? '—')
const hotelStatus  = computed(() => hotel.value?.status       ?? '—')
const hotelAddress = computed(() => {
  if (!hotel.value) return '—'
  const parts = [hotel.value.address, hotel.value.city, hotel.value.stateProvince, hotel.value.country]
  return parts.filter(Boolean).join(', ')
})
const hotelEmail   = computed(() => hotel.value?.email        ?? '—')
const hotelPhone   = computed(() => hotel.value?.phoneNumber  ?? '—')
const hotelGrade   = computed(() => hotel.value?.grade        ?? 0)
const currency     = computed(() => hotel.value?.currencyCode ?? '—')
const timezone     = computed(() => hotel.value?.timezone     ?? '—')
const workingDate  = computed(() => hotel.value?.currentWorkingDate ?? '—')

const initials = computed(() => {
  return hotelName.value.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
})

const statusStyles = computed(() => {
  switch (hotelStatus.value) {
    case 'active':    return 'bg-emerald-100 text-emerald-700'
    case 'inactive':  return 'bg-gray-100 text-gray-500'
    case 'suspended': return 'bg-red-100 text-red-700'
    default:          return 'bg-gray-100 text-gray-500'
  }
})

const statusLabel = computed(() => {
  switch (hotelStatus.value) {
    case 'active':    return 'Actif'
    case 'inactive':  return 'Inactif'
    case 'suspended': return 'Suspendu'
    default:          return hotelStatus.value
  }
})

const renderStars = (grade: number) => '★'.repeat(grade) + '☆'.repeat(5 - grade)

// ── Actions 
const saveChanges = () => {
  console.log('Modifications sauvegardées :', licenses.value)
  // TODO: appel API PATCH /hotels/:id/licenses
}
</script>

<template>

  <!-- Loading -->
  <div v-if="loading" class="flex items-center justify-center min-h-screen bg-slate-50">
    <OverLoading />
  </div>

  <!-- Erreur -->
  <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
    <p class="text-red-500 text-sm">{{ error }}</p>
    <button @click="router.push('/clients')" class="text-sm text-purple-600 hover:underline">
      ← Retour au parc client
    </button>
  </div>

  <!-- Contenu -->
  <div v-else class="flex flex-1 flex-col bg-slate-50">
    <div class="p-4 md:p-8 space-y-6 md:space-y-8 w-full">

      <!-- Quick Actions -->
      <section class="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div class="flex flex-col gap-4 flex-1">
            <div class="flex items-center gap-3 flex-wrap">
              <ArrowLeft @click="router.back()" class="cursor-pointer shrink-0 text-gray-500 hover:text-gray-800 transition-colors" />
              <h2 class="text-lg md:text-xl font-bold text-slate-900">{{ hotelName }}</h2>
              <span class="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{{ hotelCode }}</span>
              <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold flex-shrink-0', statusStyles]">
                {{ statusLabel }}
              </span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button class="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors cursor-pointer">
              <LogIn class="w-4 h-4" />
              <span class="hidden sm:inline">Se connecter en tant que</span>
              <span class="sm:hidden">Connexion</span>
            </button>
            <div class="hidden sm:block h-6 w-px bg-slate-200 self-center"></div>
            <button class="flex items-center justify-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-semibold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20 cursor-pointer">
              <OctagonAlert class="w-4 h-4" />
              <span class="hidden sm:inline">Kill-Switch</span>
              <span class="sm:hidden">Suspendre</span>
            </button>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        <!-- Left Column -->
        <div class="lg:col-span-1 space-y-6 md:space-y-8">

          <!-- Informations Générales -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 class="font-bold text-slate-900 flex items-center gap-2">
                <Info class="w-5 h-5 text-yellow-600" /> Informations Générales
              </h3>
              <button class="text-yellow-600 hover:bg-yellow-50 p-1.5 rounded-lg transition-colors cursor-pointer">
                <Edit class="w-4 h-4" />
              </button>
            </div>
            <div class="p-4 md:p-5 space-y-4">

              <!-- Avatar + nom -->
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {{ initials }}
                </div>
                <div>
                  <p class="text-sm font-bold text-slate-900">{{ hotelName }}</p>
                  <p class="text-xs text-amber-500">{{ renderStars(hotelGrade) }}</p>
                </div>
              </div>

              <div class="space-y-1">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Adresse</p>
                <p class="text-sm text-slate-700">{{ hotelAddress }}</p>
              </div>

              <div class="space-y-1">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                <p class="text-sm text-slate-700">{{ hotelEmail }}</p>
              </div>

              <div class="space-y-1">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Téléphone</p>
                <p class="text-sm text-slate-700">{{ hotelPhone }}</p>
              </div>

              <div class="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div class="space-y-1">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Devise</p>
                  <p class="text-sm font-semibold text-slate-900">{{ currency }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fuseau</p>
                  <p class="text-xs text-slate-600">{{ timezone }}</p>
                </div>
              </div>

            </div>
          </div>

          <!-- Technique & Facturation -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-4 md:p-5 border-b border-slate-100 bg-slate-50">
              <h3 class="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base">
                <Banknote class="w-5 h-5 text-yellow-600" /> Technique & Facturation
              </h3>
            </div>
            <div class="p-4 md:p-5 space-y-6">
              <div class="flex items-center justify-between">
                <div class="space-y-1">
                  <p class="text-[10px] font-bold text-slate-400 uppercase">Date de travail</p>
                  <p class="text-lg font-bold text-slate-900">{{ workingDate }}</p>
                </div>
                <button class="bg-yellow-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-700 transition-colors cursor-pointer">
                  Mettre à jour
                </button>
              </div>
              <div class="pt-4 border-t border-slate-100 space-y-4">
                <div class="flex justify-between items-end">
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Mensualité</p>
                    <p class="text-2xl font-black text-slate-900">—<span class="text-sm font-normal text-slate-500"> /mois</span></p>
                  </div>
                  <div class="text-right">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Prochaine facture</p>
                    <p class="text-sm font-bold text-slate-700">—</p>
                  </div>
                </div>
                <button class="w-full py-2.5 border border-yellow-600 text-yellow-600 font-bold rounded-lg text-sm hover:bg-yellow-50 transition-all cursor-pointer">
                  Générer Gratuité
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
            <div class="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ListChecks class="text-yellow-600 w-5 h-5" />
                </div>
                <h3 class="font-bold text-base md:text-lg text-slate-900">Configuration des Licences</h3>
              </div>
              <button
                @click="saveChanges"
                class="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer w-full sm:w-auto"
              >
                Enregistrer les modifications
              </button>
            </div>

            <div class="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">

              <!-- PMS -->
              <div class="p-4 md:p-6 rounded-xl border border-slate-100 bg-slate-50/50 space-y-6">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <BedDouble class="text-slate-400 w-5 h-5 shrink-0" />
                    <span class="font-bold text-slate-900 text-sm md:text-base">PMS Connection</span>
                  </div>
                  <Toggle v-model="licenses.pms.active" />
                </div>
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <p class="text-sm font-medium text-slate-500">Nombre de chambres</p>
                    <span class="text-sm font-bold text-yellow-600">{{ licenses.pms.rooms }}</span>
                  </div>
                  <input
                    type="range" min="0" max="250"
                    v-model="licenses.pms.rooms"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                  />
                </div>
              </div>

              <!-- POS -->
              <div class="p-4 md:p-6 rounded-xl border border-slate-100 bg-slate-50/50 space-y-6">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <Utensils class="text-slate-400 w-5 h-5 shrink-0" />
                    <span class="font-bold text-slate-900 text-sm md:text-base">POS Integration</span>
                  </div>
                  <Toggle v-model="licenses.pos.active" />
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium text-slate-500">Licences de caisse</p>
                  <div class="flex items-center gap-3">
                    <Input type="number" v-model="licenses.pos.units" />
                    <span class="text-[10px] font-bold text-slate-400 whitespace-nowrap">UNITÉS</span>
                  </div>
                </div>
              </div>

              <!-- Channel Manager -->
              <div class="p-4 md:p-6 rounded-xl border border-slate-100 bg-slate-50/50 space-y-4">
                <div class="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                  <div class="flex items-center gap-3">
                    <ArrowLeftRight class="text-slate-400 w-5 h-5 shrink-0" />
                    <span class="font-bold text-slate-900 text-sm md:text-base">Channel Manager</span>
                  </div>
                  <Toggle v-model="licenses.channelManager.active" />
                </div>
                <div class="space-y-2">
                  <p class="text-[10px] font-bold text-slate-400 uppercase">OTAs Connectés</p>
                  <div
                    v-for="ota in licenses.channelManager.otas"
                    :key="ota.name"
                    class="flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-100"
                    :class="!ota.checked && 'opacity-60'"
                  >
                    <CheckboxInput v-model="ota.checked" />
                    <span class="text-sm font-medium">{{ ota.name }}</span>
                  </div>
                </div>
              </div>

              <!-- Mobile App -->
              <div class="p-4 md:p-6 rounded-xl border border-slate-100 bg-slate-50/50 space-y-6">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <Smartphone class="text-slate-400 w-5 h-5 shrink-0" />
                    <span class="font-bold text-slate-900 text-sm md:text-base">Application Mobile</span>
                  </div>
                  <Toggle v-model="licenses.mobileApp.active" />
                </div>
                <div class="space-y-4">
                  <div class="space-y-1">
                    <p class="text-xs font-medium text-slate-500">Quota staff</p>
                    <Input type="number" v-model="licenses.mobileApp.staffQuota" />
                  </div>
                  <div class="flex items-center justify-between p-3 rounded-lg border border-yellow-100 bg-yellow-50/50">
                    <div class="flex items-center gap-2">
                      <span class="text-yellow-600 w-4 h-4">👤</span>
                      <span class="text-xs font-semibold text-slate-700">Guest App Option</span>
                    </div>
                    <CheckboxInput v-model="licenses.mobileApp.guestApp" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-center gap-4 w-full md:w-auto">
          <p class="text-sm text-slate-500">
            Dernière modification :
            <span class="font-bold text-slate-900">
              {{ hotel?.updatedAt ? new Date(hotel.updatedAt).toLocaleString('fr-FR') : '—' }}
            </span>
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button class="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 cursor-pointer text-center">
            Exporter (PDF)
          </button>
          <button class="px-4 py-2 text-sm font-bold bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">
            Historique
          </button>
        </div>
      </div>

    </div>
  </div>
</template>