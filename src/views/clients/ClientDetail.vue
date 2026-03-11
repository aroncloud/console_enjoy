<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, Edit, Info,
  ListChecks, Banknote, Layers, Trash2,
  BedDouble, Utensils, ArrowLeftRight, Smartphone, BarChart2, Users,
} from 'lucide-vue-next'
import { type Component } from 'vue'
import { hotelService } from '../../servicesAPI/clientService'
import { useToastStore } from '../../composables/toast'
import { subscriptionService } from '../../servicesAPI/subscriptionService'
import DeleteModal from '../../components/Modal/DeleteConfirmationModal.vue'
import AddHotelForm from '../../components/Clients/AddHotelForm.vue'
import Toggle from '../../components/FormElements/Toggle.vue'

const route      = useRoute()
const router     = useRouter()
const toastStore = useToastStore()

// ── State ────
const hotel        = ref<any>(null)
const loading      = ref(false)
const error        = ref<string | null>(null)
const showEditForm = ref(false)
const showDeleteSubModal = ref(false)
const deleteSubLoading   = ref(false)
const selectedSub        = ref<any>(null)


// ── Delete modal ──────
const showDeleteModal = ref(false)
const deleteLoading   = ref(false)

const handleDeleteConfirm = async () => {
  const id = route.params.id
  if (!id) return
  deleteLoading.value = true
  try {
    await hotelService.delete(Number(id))
    toastStore.show({ type: 'success', message: 'Établissement supprimé avec succès' })
    showDeleteModal.value = false
    router.push('/clients')
  } catch (e: any) {
    console.error(e)
    toastStore.show({ type: 'error', message: 'Erreur lors de la suppression' })
  } finally {
    deleteLoading.value = false
  }
}

// ── Edit ────
const handleUpdate = async (data: any) => {
  loading.value = true
  try {
    await hotelService.update(Number(route.params.id), data)
    await fetchHotel()
    toastStore.show({ type: 'success', message: 'Établissement mis à jour avec succès' })
    showEditForm.value = false
  } catch (e: any) {
    console.error(e)
    toastStore.show({ type: 'error', message: 'Erreur lors de la mise à jour' })
  } finally {
    loading.value = false
  }
}

// ── Icon / Color mapping ────
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

// ── Subscriptions dérivées ────
const activeModules = computed(() =>
  (hotel.value?.subscriptions || []).map((sub: any) => ({
    id           : sub.id,
    moduleId     : sub.moduleId,
    slug         : sub.module?.slug   || '',
    name         : sub.module?.name   || '',
    icon         : getIcon(sub.module?.slug || ''),
    status       : sub.status,
    billingCycle : sub.billingCycle,
    price        : sub.price,
    startsAt     : sub.startsAt,
    endsAt       : sub.endsAt,
    paymentStatus: sub.paymentStatus,
    limitCount : sub.limitCount
  }))
)

// ── Actions abonnements ────
const subActionLoading = ref<number | null>(null)

const toggleSubStatus = async (sub: any) => {
  subActionLoading.value = sub.id
  try {
    const newStatus = sub.status === 'active' ? 'canceled' : 'active'
    await subscriptionService.update(sub.id, { status: newStatus })
    await fetchHotel()
    toastStore.show({
      type: 'success',
      message: `Abonnement ${newStatus === 'active' ? 'activé' : 'désactivé'} avec succès`,
    })
  } catch {
    toastStore.show({ type: 'error', message: 'Erreur lors de la mise à jour' })
  } finally {
    subActionLoading.value = null
  }
}




const deleteSub = (sub: any) => {
  selectedSub.value = sub
  showDeleteSubModal.value = true
}

const handleDeleteSubConfirm = async () => {
  deleteSubLoading.value = true
  try {
    await subscriptionService.delete(selectedSub.value.id)
    await fetchHotel()
    toastStore.show({ type: 'success', message: 'Abonnement supprimé' })
    showDeleteSubModal.value = false
  } catch {
    toastStore.show({ type: 'error', message: 'Erreur lors de la suppression' })
  } finally {
    deleteSubLoading.value = false
  }
}

const formatDate  = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR') : '—'
const formatPrice = (p: string | number) => Number(p).toLocaleString('fr-FR') + ' XAF'

// ── Chargement ─────
onMounted(() => { fetchHotel() })

const fetchHotel = async () => {
  loading.value = true
  try {
    const response = await hotelService.getById(Number(route.params.id))
    hotel.value = response.data?.data ?? response.data
  } catch (e: any) {
    console.error(e)
    error.value = 'Erreur lors du chargement de l\'établissement'
  } finally {
    loading.value = false
  }
}

// ── Computed ─────────
const hotelName    = computed(() => hotel.value?.hotelName   ?? '—')
const hotelCode    = computed(() => hotel.value?.hotelCode   ?? '—')
const hotelStatus  = computed(() => hotel.value?.status      ?? '—')
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

const statusStyles = computed (()=> {
  const map: Record<string,string> = {
      active:    'bg-emerald-100 text-emerald-700',
      inactive: 'bg-red-100 text-red-700',
}
  return map[hotelStatus.value] ?? 'bg-gray-100 text-gray-500'
})

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    active:    'Actif',
    inactive: 'Inactif',
  }
  return map[hotelStatus.value] ?? hotelStatus.value
})

const getSubStatusConfig = (status: string) => {
  const config: Record<string, { label: string; dot: string; text: string }> = {
    active  : { label: 'Actif',      dot: 'bg-emerald-400', text: 'text-emerald-500' },
    past_due: { label: 'En retard',  dot: 'bg-amber-400',   text: 'text-amber-500'   },
    canceled: { label: 'Résilié',    dot: 'bg-red-400',     text: 'text-red-400'     },
  }
  return config[status] ?? { label: status, dot: 'bg-slate-300', text: 'text-slate-400' }
}
const renderStars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

const limitLabel = (slug: string): string => ({
  'pms'            : 'ch.',
  'pos'            : 'term.',
  'mobile-app'     : 'staff',
  'channel-manager': 'OTA',
}[slug] ?? '')
</script>

<template>

  <!-- ── Formulaire édition ── -->
  <AddHotelForm
    v-if="showEditForm"
    :hotel-id="Number(route.params.id)"
    :loading="loading"
    @submit="handleUpdate"
    @back="showEditForm = false"
    @cancel="showEditForm = false"
  />

  <!-- ── Vue Détail ── -->
  <template v-else>

    <!-- Loading skeleton -->
    <div v-if="loading" class="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 space-y-6">
      <div class="space-y-3">
        <div class="h-6 w-3/4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
        <div class="h-4 w-1/4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div class="space-y-6">
          <div class="h-40 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
          <div class="h-48 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
        </div>
        <div class="lg:col-span-2 space-y-6">
          <div class="h-60 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 gap-4">
      <button @click="router.push('/clients')" class="text-sm text-purple-600 hover:underline">
        ← Retour au parc client
      </button>
    </div>

    <!-- Contenu -->
    <div v-else class="flex flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <div class="p-4 md:p-8 space-y-6 md:space-y-8 w-full">

        <!-- ── Header ── -->
        <section class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="p-4 md:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div class="flex items-center gap-3 flex-wrap">
              <ArrowLeft @click="router.back()" class="cursor-pointer shrink-0 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white transition-colors" />
              <h2 class="text-lg md:text-xl font-bold text-slate-900 dark:text-white">{{ hotelName }}</h2>
              <span class="font-mono text-xs text-gray-400 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">{{ hotelCode }}</span>
              <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', statusStyles]">
                {{ statusLabel }}
              </span>
            </div>
         
          </div>
        </section>

        <!-- ── Grille principale ── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          <!-- ── Colonne gauche ── -->
          <div class="lg:col-span-1 space-y-6">

            <!-- Infos générales -->
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div class="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <Info class="w-5 h-5 text-yellow-600" /> Informations Générales
                </h3>
                <div class="flex items-center gap-2">
                  <button
                    @click="showEditForm = true"
                    class="text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Modifier"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <button
                    @click="showDeleteModal = true"
                    class="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div class="p-4 md:p-5 space-y-4">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {{ initials }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-900 dark:text-white">{{ hotelName }}</p>
                    <p class="text-xs text-amber-500">{{ renderStars(hotelGrade) }}</p>
                  </div>
                </div>
                <div class="space-y-1">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Adresse</p>
                  <p class="text-sm text-slate-700 dark:text-slate-200">{{ hotelAddress }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                  <p class="text-sm text-slate-700 dark:text-slate-200">{{ hotelEmail }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Téléphone</p>
                  <p class="text-sm text-slate-700 dark:text-slate-200">{{ hotelPhone }}</p>
                </div>
                <div class="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Devise</p>
                    <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ currency }}</p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fuseau</p>
                    <p class="text-xs text-slate-600 dark:text-slate-300">{{ timezone }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Technique & Facturation -->
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div class="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <Banknote class="w-5 h-5 text-yellow-600" /> Technique & Facturation
                </h3>
              </div>
              <div class="p-4 md:p-5 space-y-6">
                <div class="flex items-center justify-between">
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Date de travail</p>
                    <p class="text-lg font-bold text-slate-900 dark:text-white">{{ workingDate }}</p>
                  </div>
                  <button class="bg-yellow-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-700 transition-colors cursor-pointer">
                    Mettre à jour
                  </button>
                </div>
                <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div class="flex justify-between items-end">
                    <div class="space-y-1">
                      <p class="text-[10px] font-bold text-slate-400 uppercase">Mensualité</p>
                      <p class="text-2xl font-black text-slate-900 dark:text-white">—<span class="text-sm font-normal text-slate-500 dark:text-slate-400"> /mois</span></p>
                    </div>
                    <div class="text-right">
                      <p class="text-[10px] font-bold text-slate-400 uppercase">Prochaine facture</p>
                      <p class="text-sm font-bold text-slate-700 dark:text-slate-200">—</p>
                    </div>
                  </div>
                  <button class="w-full py-2.5 border border-yellow-600 text-yellow-600 font-bold rounded-lg text-sm hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all cursor-pointer">
                    Générer Gratuité
                  </button>
                </div>
              </div>
            </div>

          </div>

          <!-- ── Colonne droite ── -->
          <div class="lg:col-span-2">
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

              <!-- Header produits -->
              <div class="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="h-9 w-9 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                    <Layers class="text-purple-600 w-4 h-4" />
                  </div>
                  <div>
                    <h3 class="font-bold text-sm text-slate-900 dark:text-white">Produits actifs</h3>
                    <p class="text-xs text-slate-400">
                      {{ activeModules.length }} souscription{{ activeModules.length > 1 ? 's' : '' }} en cours
                    </p>
                  </div>
                </div>
                <RouterLink
                  :to="`/clients/${route.params.id}/subscriptions`"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800/40 text-purple-600 dark:text-purple-300 text-xs font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <ListChecks class="w-3.5 h-3.5" />
                  Ajouter un module
                </RouterLink>
              </div>

              <!-- Liste des abonnements -->
              <div class="p-4 md:p-6">
                <div v-if="activeModules.length > 0" class="space-y-2">
                  <div
                    v-for="item in activeModules"
                    :key="item.id"
                    class="flex items-center gap-3 p-3 rounded-xl border transition-colors"
                    :class="item.status === 'active'
                      ? 'border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 opacity-60 hover:bg-slate-50 dark:hover:bg-slate-800'"
                  >
                    <!-- Icône module -->
                    <div
                      class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      :style="{ background: getColor(item.slug) + '15' }"
                    >
                      <component :is="item.icon" :size="17" :style="{ color: getColor(item.slug) }" />
                    </div>

                    <!-- Infos -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <p class="text-xs font-bold text-slate-800 dark:text-white truncate">{{ item.name }}</p>
                        <span
                          v-if="item.limitCount"
                          class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-200 shrink-0"
                        >
                          {{ item.limitCount }} {{ limitLabel(item.slug) }}
                        </span>
                      </div>
                      <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                        <!-- Statut pill -->
                        <span
                          class="flex items-center gap-1 text-[10px] font-semibold"
                          :class="getSubStatusConfig(item.status).text"
                        >
                          <span
                            class="w-1.5 h-1.5 rounded-full shrink-0"
                            :class="getSubStatusConfig(item.status).dot"
                          />
                          {{ getSubStatusConfig(item.status).label }}
                        </span>
                        <span class="text-slate-200 dark:text-slate-700">·</span>
                        <!-- Prix -->
                        <span class="text-[10px] text-slate-400 font-medium">{{ formatPrice(item.price) }}/mois</span>
                        <span class="text-slate-200 dark:text-slate-700">·</span>
                        <!-- Période -->
                        <span class="text-[10px] text-slate-400">
                          {{ formatDate(item.startsAt) }} → {{ formatDate(item.endsAt) }}
                        </span>
                        <!-- Billing cycle -->
                        <span
                          class="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          :class="item.billingCycle === 'yearly'
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-slate-100 text-slate-500'"
                        >
                          {{ item.billingCycle === 'yearly' ? 'Annuel' : 'Mensuel' }}
                        </span>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2 shrink-0">
                      <Toggle
                        :modelValue="item.status === 'active'"
                        :disabled="subActionLoading === item.id"
                        @update:modelValue="toggleSubStatus(item)"
                      />

                      <!-- Supprimer -->
                      <button
                        @click="deleteSub(item)"
                        :disabled="subActionLoading === item.id"
                        class="p-1.5 rounded-lg text-red-400 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                        title="Supprimer"
                      >
                        <Trash2 :size="18" />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- État vide -->
                <div v-else class="flex flex-col items-center justify-center py-10 text-slate-400">
                  <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <Layers :size="22" class="opacity-40" />
                  </div>
                  <p class="text-sm font-semibold">Aucun produit souscrit</p>
                  <p class="text-xs mt-1 mb-4">Cet établissement n'a pas encore de produits actifs.</p>
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
        <div class="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p class="text-sm text-slate-500 dark:text-slate-300">
            Dernière modification :
            <span class="font-bold text-slate-900 dark:text-white">
              {{ hotel?.updatedAt ? new Date(hotel.updatedAt).toLocaleString('fr-FR') : '—' }}
            </span>
          </p>
          <div class="flex gap-3">
            <button class="px-4 py-2 text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              Historique
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ── Modale de suppression ── -->
    <DeleteModal
      v-model="showDeleteModal"
      title="Supprimer l'établissement"
      :item-name="hotelName"
      description="Toutes les données associées (réservations, abonnements, utilisateurs) seront définitivement perdues."
      :loading="deleteLoading"
      @confirm="handleDeleteConfirm"
    />

    <!-- Modale de suppression  abonnement-->
    <DeleteModal
      v-model="showDeleteSubModal"
      title="Supprimer l'abonnement"
      :item-name="selectedSub?.name"
      description="L'abonnement sera définitivement supprimé."
      :loading="deleteSubLoading"
      @confirm="handleDeleteSubConfirm"
    />

  </template>
</template>
