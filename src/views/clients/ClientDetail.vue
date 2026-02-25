<script setup lang="ts">
import { ref } from 'vue'
import { 
  ArrowLeft , 
 ArrowLeftRight ,
  Edit, 
  Info,  
  Smartphone,
  BedDouble ,
  LogIn ,
  ListChecks ,
  Utensils ,
  Banknote 

} from 'lucide-vue-next' 

// --- État des données ---
const hotelInfo = ref({
  name: "Grand Plaza Hotel",
  status: "Actif",
  tenantId: "88291-GP",
  address: "12 Rue de la Paix, 75002 Paris, France",
  manager: {
    name: "Jean Dupont",
    email: "j.dupont@grandplaza.com",
    initials: "JD"
  },
  version: "v2.4.0",
  monthlyFee: 840.00,
  nextInvoice: "01 Oct. 2023"
})

// --- État des Licences (v-model) ---
const licenses = ref({
  pms: { active: true, rooms: 124 },
  pos: { active: true, units: 4 },
  channelManager: { 
    active: true, 
    otas: [
      { name: 'Booking.com', checked: true },
      { name: 'Expedia', checked: true },
      { name: 'Airbnb', checked: false }
    ]
  },
  mobileApp: { active: false, staffQuota: 15, guestApp: true }
})

const activeTab = ref('overview')

const saveChanges = () => {
  console.log('Données sauvegardées :', licenses.value)
  // Logique d'appel API ici
}
</script>

<template>
  <main class="flex flex-1 flex-col bg-slate-50 dark:bg-slate-950 ">
    
   

    <!-- PAGE CONTENT -->
    <div class="p-8 space-y-8  w-full">

     
      
      <!-- Quick Actions -->
      <section class="gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex justify-between">
        <div class="flex flex-col">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ hotelInfo.name }}</h2>
            <span class="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {{ hotelInfo.status }}
            </span>
          </div>
          </div>

          <div class="flex flex-wrap ">
       
        <button class="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <LogIn  class="w-4 h-4" /> Se connecter en tant que
        </button>
        <div class="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
        <button class="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-semibold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20">
          <EmergencyHome class="w-4 h-4" /> Kill-Switch (Suspendre API)
        </button>
        </div>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Column -->
        <div class="lg:col-span-1 space-y-8">
          <!-- General Info -->
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Info class="w-5 h-5 text-blue-600" /> Informations Générales
              </h3>
              <button class="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors">
                <Edit class="w-4 h-4" />
              </button>
            </div>
            <div class="p-5 space-y-4">
              <div class="space-y-1">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nom de l'établissement</p>
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ hotelInfo.name }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Adresse</p>
                <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ hotelInfo.address }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Manager</p>
                <div class="flex items-center gap-3 mt-1">
                  <div class="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {{ hotelInfo.manager.initials }}
                  </div>
                  <div class="flex flex-col">
                    <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ hotelInfo.manager.name }}</p>
                    <p class="text-xs text-slate-500">{{ hotelInfo.manager.email }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Billing Summary -->
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Banknote  class="w-5 h-5 text-blue-600" /> Technique & Facturation
              </h3>
            </div>
            <div class="p-5 space-y-6">
              <div class="flex items-center justify-between">
                <div class="space-y-1">
                  <p class="text-[10px] font-bold text-slate-400 uppercase">Version Actuelle</p>
                  <p class="text-lg font-bold text-slate-900 dark:text-white">{{ hotelInfo.version }}</p>
                </div>
                <button class="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
                  Mettre à jour
                </button>
              </div>
              <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div class="flex justify-between items-end">
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Mensualité</p>
                    <p class="text-2xl font-black text-slate-900 dark:text-white">{{ hotelInfo.monthlyFee }}<span class="text-sm font-normal text-slate-500"> /mois</span></p>
                  </div>
                  <div class="text-right">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Prochaine facture</p>
                    <p class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ hotelInfo.nextInvoice }}</p>
                  </div>
                </div>
                <button class="w-full py-2.5 border border-blue-600 text-blue-600 font-bold rounded-lg text-sm hover:bg-blue-50 transition-all">
                  Générer Gratuité
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column (Configuration) -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full">
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <ListChecks  class="text-blue-600 w-5 h-5" />
                </div>
                <h3 class="font-bold text-lg text-slate-900 dark:text-white">Configuration des Licences</h3>
              </div>
              <button @click="saveChanges" class="bg-slate-900 dark:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
                Enregistrer les modifications
              </button>
            </div>

            <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- PMS Card -->
              <div class="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-6">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <BedDouble  class="text-slate-400 w-5 h-5" />
                    <span class="font-bold text-slate-900 dark:text-white">PMS Connection</span>
                  </div>
                  <Toggle v-model="licenses.pms.active" />
                </div>
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <p class="text-sm font-medium text-slate-500">Nombre de chambres</p>
                    <span class="text-sm font-bold text-blue-600">{{ licenses.pms.rooms }}</span>
                  </div>
                  <input type="range" min="0" max="250" v-model="licenses.pms.rooms" class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
              </div>

              <!-- POS Card -->
              <div class="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-6">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <Utensils  class="text-slate-400 w-5 h-5" />
                    <span class="font-bold text-slate-900 dark:text-white">POS Integration</span>
                  </div>
                  <Toggle v-model="licenses.pos.active" />
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium text-slate-500">Licences de caisse</p>
                  <div class="flex items-center gap-3">
                    <input type="number" v-model="licenses.pos.units" class="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm p-2 outline-none focus:ring-1 focus:ring-blue-600" />
                    <span class="text-[10px] font-bold text-slate-400 whitespace-nowrap">UNITÉS</span>
                  </div>
                </div>
              </div>

              <!-- Channel Manager -->
              <div class="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-4">
                <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                  <div class="flex items-center gap-3">
                    <ArrowLeftRight class="text-slate-400 w-5 h-5" />
                    <span class="font-bold text-slate-900 dark:text-white">Channel Manager</span>
                  </div>
                  <Toggle v-model="licenses.channelManager.active" />
                </div>
                <div class="space-y-2">
                  <p class="text-[10px] font-bold text-slate-400 uppercase">OTAs Connectés</p>
                  <div v-for="ota in licenses.channelManager.otas" :key="ota.name" 
                    class="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                    :class="!ota.checked && 'opacity-60'">
                    <input type="checkbox" v-model="ota.checked" class="rounded text-blue-600 focus:ring-blue-500" />
                    <span class="text-sm font-medium">{{ ota.name }}</span>
                  </div>
                </div>
              </div>

              <!-- Mobile App -->
              <div class="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-6">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <Smartphone class="text-slate-400 w-5 h-5" />
                    <span class="font-bold text-slate-900 dark:text-white">Application Mobile</span>
                  </div>
                  <Toggle v-model="licenses.mobileApp.active" />
                </div>
                <div class="space-y-4">
                  <div class="space-y-1">
                    <p class="text-xs font-medium text-slate-500">Quota staff</p>
                    <input type="number" v-model="licenses.mobileApp.staffQuota" class="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm" />
                  </div>
                  <div class="flex items-center justify-between p-3 rounded-lg border border-blue-100 bg-blue-50/50 dark:bg-blue-900/10">
                    <div class="flex items-center gap-2">
                      <PersonPin class="text-blue-600 w-4 h-4" />
                      <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">Guest App Option</span>
                    </div>
                    <input type="checkbox" v-model="licenses.mobileApp.guestApp" class="rounded text-blue-600 h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Detail -->
      <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex -space-x-2">
            <div class="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 bg-blue-100 flex items-center justify-center text-[10px] font-bold">SM</div>
            <div class="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-100 flex items-center justify-center text-[10px] font-bold">AL</div>
            <div class="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-700">+3</div>
          </div>
          <p class="text-sm text-slate-500">Dernière modification par <span class="font-bold text-slate-900 dark:text-white">Admin (Sarah M.)</span> il y a 2 heures</p>
        </div>
        <div class="flex gap-3">
          <button class="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Exporter le profil (PDF)</button>
          <button class="px-4 py-2 text-sm font-bold bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors">Historique complet</button>
        </div>
      </div>
    </div>
  </main>
</template>



<style scoped>
/* On peut ajouter des styles spécifiques ici si nécessaire */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 1;
}
</style>