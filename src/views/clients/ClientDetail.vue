<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, Edit, Info, LogIn,
  ListChecks, Banknote, OctagonAlert, Layers,
  BedDouble, Utensils, ArrowLeftRight, Smartphone, BarChart2, Users,
} from 'lucide-vue-next'
import { type Component } from 'vue'
import { hotelService } from '../../servicesAPI/clientService'
// skeleton will be rendered inline during loading

const route  = useRoute()
const router = useRouter()

// ── State 
const hotel   = ref<any>(null)
const loading = ref(false)
const error   = ref<string | null>(null)

// ── Modules actifs (à brancher sur GET /hotels/:id/subscriptions) ──────────
const activeModules = ref<{ slug: string; name: string; icon: Component }[]>([])

const slugIconComponents: Record<string, Component> = {
  'pms':             BedDouble,
  'pos':             Utensils,
  'channel-manager': ArrowLeftRight,
  'mobile-app':      Smartphone,
  'analytics':       BarChart2,
  'crm':             Users,
}
const slugColors: Record<string, string> = {
  'pms':             '#7c3aed',
  'pos':             '#0891b2',
  'channel-manager': '#059669',
  'mobile-app':      '#d97706',
  'analytics':       '#dc2626',
  'crm':             '#0f766e',
}
const getIcon  = (slug: string): Component => slugIconComponents[slug] ?? BedDouble
const getColor = (slug: string) => slugColors[slug] ?? '#6b7280'

// ── Chargement 
onMounted(async () => {
  const id = route.params.id
  if (!id) { router.push('/clients'); return }

  loading.value = true
  try {
    const response = await hotelService.getById(Number(id))
    hotel.value = response.data?.data ?? response.data

    // TODO: charger les souscriptions actives
    // const subs = await subscriptionService.getByHotel(Number(id))
    // activeModules.value = subs.data
    //   .filter(s => s.status === 'active')
    //   .map(s => ({ slug: s.module.slug, name: s.module.name, icon: getIcon(s.module.slug) }))

  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

// ── Computed 
const hotelName    = computed(() => hotel.value?.hotelName          ?? '—')
const hotelCode    = computed(() => hotel.value?.hotelCode          ?? '—')
const hotelStatus  = computed(() => hotel.value?.status             ?? '—')
const hotelAddress = computed(() => {
  if (!hotel.value) return '—'
  return [hotel.value.address, hotel.value.city, hotel.value.stateProvince, hotel.value.country]
    .filter(Boolean).join(', ')
})
const hotelEmail  = computed(() => hotel.value?.email              ?? '—')
const hotelPhone  = computed(() => hotel.value?.phoneNumber        ?? '—')
const hotelGrade  = computed(() => hotel.value?.grade              ?? 0)
const currency    = computed(() => hotel.value?.currencyCode       ?? '—')
const timezone    = computed(() => hotel.value?.timezone           ?? '—')
const workingDate = computed(() => hotel.value?.currentWorkingDate ?? '—')

const initials = computed(() =>
  hotelName.value.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
)

const statusStyles = computed(() => ({
  active:    'bg-emerald-100 text-emerald-700',
  inactive:  'bg-gray-100 text-gray-500',
  suspended: 'bg-red-100 text-red-700',
}[hotelStatus.value] ?? 'bg-gray-100 text-gray-500'))

const statusLabel = computed(() => ({
  active:    'Actif',
  inactive:  'Inactif',
  suspended: 'Suspendu',
}[hotelStatus.value] ?? hotelStatus.value)) 

const renderStars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)
</script>

<template>

  <!-- Loading skeleton -->
  <div v-if="loading" class="min-h-screen bg-slate-50 p-8 space-y-6">
    <!-- header skeleton -->
    <div class="space-y-3">
      <div class="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
      <div class="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <!-- main grid skeleton -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <div class="space-y-6">
        <div class="h-40 bg-gray-200 rounded-xl animate-pulse"></div>
        <div class="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
      <div class="lg:col-span-2 space-y-6">
        <div class="h-60 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    </div>
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

      <!-- ── Header ── -->
      <section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        <!-- Nom + boutons -->
        <div class="p-4 md:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div class="flex items-center gap-3 flex-wrap">
            <ArrowLeft @click="router.back()" class="cursor-pointer shrink-0 text-gray-500 hover:text-gray-800 transition-colors" />
            <h2 class="text-lg md:text-xl font-bold text-slate-900">{{ hotelName }}</h2>
            <span class="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{{ hotelCode }}</span>
            <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', statusStyles]">
              {{ statusLabel }}
            </span>
          </div>
          <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button class="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors cursor-pointer">
              <LogIn class="w-4 h-4" />
              <span class="hidden sm:inline">Se connecter en tant que</span>
              <span class="sm:hidden">Connexion</span>
            </button>
            <div class="hidden sm:block h-6 w-px bg-slate-200 self-center" />
            <button class="flex items-center justify-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-semibold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20 cursor-pointer">
              <OctagonAlert class="w-4 h-4" />
              <span class="hidden sm:inline">Kill-Switch</span>
              <span class="sm:hidden">Suspendre</span>
            </button>
          </div>
        </div>

        <!-- Onglets -->
        <!-- <div class="flex border-t border-slate-100 px-4">
          <RouterLink
            :to="`/clients/${route.params.id}`"
            class="flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="route.name === 'client-detail'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'"
          >
            <Info class="w-3.5 h-3.5" />
            Vue générale
          </RouterLink>
          <RouterLink
            :to="`/clients/${route.params.id}/subscriptions`"
            class="flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="route.name === 'client-subscriptions'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'"
          >
            <Layers class="w-3.5 h-3.5" />
            Abonnements
          </RouterLink>
        </div> -->

      </section>

      <!-- ── Grille principale ── -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        <!-- ── Colonne gauche ── -->
        <div class="lg:col-span-1 space-y-6">

          <!-- Informations Générales -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 class="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Info class="w-5 h-5 text-yellow-600" /> Informations Générales
              </h3>
              <button class="text-yellow-600 hover:bg-yellow-50 p-1.5 rounded-lg transition-colors cursor-pointer">
                <Edit class="w-4 h-4" />
              </button>
            </div>
            <div class="p-4 md:p-5 space-y-4">
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
              <h3 class="font-bold text-slate-900 flex items-center gap-2 text-sm">
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
                    <!-- TODO: brancher sur le total des souscriptions actives -->
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

        <!-- ── Colonne droite ── -->
        <div class="lg:col-span-2">

          <!-- Modules actifs -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                  <Layers class="text-purple-600 w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-bold text-sm text-slate-900">Produits actifs</h3>
                  <p class="text-xs text-slate-400">Souscriptions en cours pour cet établissement</p>
                </div>
              </div>
              <RouterLink
                :to="`/clients/${route.params.id}/subscriptions`"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 text-purple-600 text-xs font-bold hover:bg-purple-50 transition-colors"
              >
                <ListChecks class="w-3.5 h-3.5" />
                Gérer les abonnements
              </RouterLink>
            </div>

            <div class="p-4 md:p-6">

              <!-- Modules sous forme de cards -->
              <div v-if="activeModules.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div
                  v-for="item in activeModules"
                  :key="item.slug"
                  class="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60"
                >
                  <div
                    class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    :style="{ background: getColor(item.slug) + '15' }"
                  >
                    <component :is="item.icon" :size="16" :style="{ color: getColor(item.slug) }" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-800 truncate">{{ item.name }}</p>
                    <div class="flex items-center gap-1 mt-0.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                      <span class="text-[10px] text-slate-400">Actif</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty state -->
              <div v-else class="flex flex-col items-center justify-center py-10 text-slate-400">
                <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                  <Layers :size="22" class="opacity-40" />
                </div>
                <p class="text-sm font-semibold">Aucun produit souscrit</p>
                <p class="text-xs mt-1 mb-4">Cet établissement n'a pas encore de Produits actifs.</p>
                <RouterLink
                  :to="`/clients/${route.params.id}/subscriptions`"
                  class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
                >
                  <ListChecks :size="13" />
                  Ajouter des produits
                </RouterLink>
              </div>

            </div>
          </div>

        </div>
      </div>

      <!-- ── Footer ── -->
      <div class="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p class="text-sm text-slate-500">
          Dernière modification :
          <span class="font-bold text-slate-900">
            {{ hotel?.updatedAt ? new Date(hotel.updatedAt).toLocaleString('fr-FR') : '—' }}
          </span>
        </p>
        <div class="flex gap-3">
          <button class="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 cursor-pointer">
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
  <!-- ── Accès & Permissions ── 
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ListChecks class="text-yellow-600 w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-bold text-sm text-slate-900">Accès & Permissions</h3>
                  <p class="text-xs text-slate-400">Paramètres techniques et quotas d'utilisation</p>
                </div>
              </div>
              <button
                @click="saveChanges"
                class="bg-slate-900 text-white px-5 py-2 rounded-lg font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer w-full sm:w-auto"
              >
                Enregistrer
              </button>
            </div>

            <div class="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

          
              <div class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-4">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <BedDouble class="text-slate-400 w-4 h-4 shrink-0" />
                    <span class="font-bold text-slate-900 text-sm">PMS</span>
                  </div>
                  <Toggle v-model="licenses.pms.active" />
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <p class="text-xs font-medium text-slate-500">Chambres autorisées</p>
                    <span class="text-xs font-bold text-yellow-600">{{ licenses.pms.rooms }}</span>
                  </div>
                  <input
                    type="range" min="0" max="250"
                    v-model="licenses.pms.rooms"
                    class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                  />
                </div>
              </div>

         
              <div class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-4">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <Utensils class="text-slate-400 w-4 h-4 shrink-0" />
                    <span class="font-bold text-slate-900 text-sm">POS</span>
                  </div>
                  <Toggle v-model="licenses.pos.active" />
                </div>
                <div class="flex items-center gap-3">
                  <Input type="number" v-model="licenses.pos.units" />
                  <span class="text-[10px] font-bold text-slate-400 whitespace-nowrap">TERMINAUX</span>
                </div>
              </div>

              
              <div class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <ArrowLeftRight class="text-slate-400 w-4 h-4 shrink-0" />
                    <span class="font-bold text-slate-900 text-sm">Channel Manager</span>
                  </div>
                  <Toggle v-model="licenses.channelManager.active" />
                </div>
                <div class="space-y-1.5">
                  <p class="text-[10px] font-bold text-slate-400 uppercase">OTAs connectés</p>
                  <div
                    v-for="ota in licenses.channelManager.otas"
                    :key="ota.name"
                    class="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-100 transition-opacity"
                    :class="!ota.checked ? 'opacity-50' : ''"
                  >
                    <CheckboxInput v-model="ota.checked" />
                    <span class="text-xs font-medium">{{ ota.name }}</span>
                  </div>
                </div>
              </div>

         
              <div class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-4">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <Smartphone class="text-slate-400 w-4 h-4 shrink-0" />
                    <span class="font-bold text-slate-900 text-sm">Application Mobile</span>
                  </div>
                  <Toggle v-model="licenses.mobileApp.active" />
                </div>
                <div class="space-y-3">
                  <div class="space-y-1">
                    <p class="text-xs font-medium text-slate-500">Quota staff</p>
                    <Input type="number" v-model="licenses.mobileApp.staffQuota" />
                  </div>
                  <div class="flex items-center justify-between p-2.5 rounded-lg border border-yellow-100 bg-yellow-50/50">
                    <div class="flex items-center gap-2">
                      <span class="text-sm">👤</span>
                      <span class="text-xs font-semibold text-slate-700">Guest App</span>
                    </div>
                    <CheckboxInput v-model="licenses.mobileApp.guestApp" />
                  </div>
                </div>
              </div>

            </div>
          </div>-->