<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">

    <!-- ── Page header ── -->
    <div class="dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div class="px-6">

        <div class="pt-5 pb-4">
          <button
            @click="router.back()"
            class="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft />
            Retour
          </button>
        </div>

        <div v-if="currentStep === 1" class="pb-5">
          <h2 class="text-xl font-black text-slate-900 dark:text-white">Choisissez vos produits</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Sélectionnez les produits adaptés à votre établissement</p>
        </div>
        <div v-else-if="currentStep === 2" class="pb-5">
          <h2 class="text-xl font-black text-slate-900 dark:text-white">Paiement</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Finalisez votre souscription en choisissant un mode de paiement</p>
        </div>

        <!-- Steps -->
        <div class="flex items-center justify-center gap-0 pb-6">
          <div v-for="(step, i) in steps" :key="i" class="flex items-center">
            <div class="flex flex-col items-center">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300"
                :class="currentStep > i + 1
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : currentStep === i + 1
                    ? 'bg-white dark:bg-slate-900 border-purple-600 text-purple-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'"
              >
                <Check v-if="currentStep > i + 1" :size="13" />
                <span v-else>{{ i + 1 }}</span>
              </div>
              <span
                class="text-[10px] font-bold mt-1.5 whitespace-nowrap transition-colors"
                :class="currentStep === i + 1 ? 'text-purple-600' : 'text-slate-400'"
              >{{ step }}</span>
            </div>
            <div
              v-if="i < steps.length - 1"
              class="w-24 sm:w-32 h-0.5 mx-2 mb-5 transition-all duration-500"
              :class="currentStep > i + 1 ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ── Page content ── -->
    <div class="max-w-6xl mx-auto px-6 py-8">

      <!-- ── Step 1 ── -->
      <div v-if="currentStep === 1">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div class="lg:col-span-2 space-y-4">

            <!-- Dependency warning -->
            <Transition name="slide-down">
              <div v-if="showChannelWarning" class="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                <AlertTriangle :size="16" class="text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p class="text-sm font-bold text-amber-800 dark:text-amber-400">Dépendance requise</p>
                  <p class="text-xs text-amber-700 dark:text-amber-500 mt-0.5">
                    Le <strong>Channel Manager</strong> nécessite le module <strong>PMS</strong>.
                    Activez d'abord le PMS pour pouvoir souscrire au Channel Manager.
                  </p>
                </div>
              </div>
            </Transition>

            <!-- Module cards -->
            <div v-if="pageLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="i in 6" :key="i" class="h-40 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
            </div>
            <div v-else-if="availableModules.length > 0" class="grid grid-cols-1 sm:grid-cols-2 items-start gap-4">
              <div
                v-for="mod in availableModules"
                :key="mod.id"
                class="relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden"
                :class="[
                  isSelected(mod.id)
                    ? 'border-purple-300 shadow-lg shadow-purple-100 dark:shadow-purple-900/20'
                    : isLocked(mod.id)
                      ? 'border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed'
                      : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 hover:shadow-md cursor-pointer'
                ]"
                @click="toggleModule(mod)"
              >
                <div v-if="isSelected(mod.id)" class="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" :style="{ background: mod.color }">
                  <Check :size="11" class="text-white" />
                </div>
                <div v-if="isLocked(mod.id)" class="absolute top-3 right-3 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <Lock :size="10" class="text-slate-400" />
                </div>

                <div class="p-5">
                  <!-- Icon + name -->
                  <div class="flex items-start gap-3 mb-4">
                    <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" :style="{ background: mod.color + '15', color: mod.color }">
                      <component :is="mod.icon" :size="20" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-black text-slate-900 dark:text-white text-sm">{{ mod.fullName }}</p>
                      <p class="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{{ formatCurrency(mod.priceMonthly) }}</p>
                    </div>
                  </div>

                  <!-- ── Add-on (one per module) ── -->
                  <div v-if="isSelected(mod.id)" class="mb-4" @click.stop>
                    <div v-if="addOnsLoadedByModule[mod.id] && (addOnsByModule[mod.id] || []).length === 0" class="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add-on</p>
                      <p class="mt-1 text-xs text-slate-500 dark:text-slate-300">Aucun add-on disponible</p>
                    </div>
                    <div v-else class="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                      <Select
                        lb="Add-on"
                        placeholder="Sélectionner un add-on"
                        :isRequired="(addOnsByModule[mod.id] || []).length > 0"
                        :options="addOnOptionsForModule(mod.id)"
                        :isLoading="addOnsLoadingByModule[mod.id]"
                        v-model="getSel(mod.id).addOnId"
                        @change="() => handleAddOnChange(mod.id)"
                      />
                      <div v-if="getSelectedAddOn(mod.id)" class="mt-2 flex items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-300">
                        <span class="truncate">
                          Min {{ getSelectedAddOn(mod.id)?.min }} · Max {{ getSelectedAddOn(mod.id)?.max }}
                        </span>
                        <span class="shrink-0 font-bold text-slate-700 dark:text-slate-200">
                          {{
                            formatCurrency(
                              getSel(mod.id).billingCycle === 'yearly'
                                ? (getSelectedAddOn(mod.id)?.priceYear != null
                                    ? Number(getSelectedAddOn(mod.id)?.priceYear)
                                    : Number(getSelectedAddOn(mod.id)?.priceMonth || 0) * 12)
                                : Number(getSelectedAddOn(mod.id)?.priceMonth || 0)
                            )
                          }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- ── Billing cycle ── -->
                  <div v-if="isSelected(mod.id)" class="mb-4" @click.stop>
                  <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Facturation</p>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        v-for="[val, label] in [['monthly', 'Mensuel'], ['yearly', 'Annuel']]"
                        :key="val"
                        @click="setSel(mod.id, 'billingCycle', val); ensurePeriodMatchesCycle(mod.id)"
                        class="py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all"
                        :class="getSel(mod.id).billingCycle === val
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'"
                      >{{ label }}</button>
                    </div>
                  </div>

                  <!-- ── Période (toujours visible) ── -->
                  <div v-if="isSelected(mod.id)" class="mb-4" @click.stop>
                    <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <CalendarRange :size="11" />
                      Période de souscription
                    </p>
                    <InputDoubleDate
                      :modelValue="{ start: getSel(mod.id).startMonth, end: getSel(mod.id).endMonth }"
                      @update:modelValue="val => { 
                        setSel(mod.id, 'startMonth', val.start); 
                        setSel(mod.id, 'endMonth', val.end);
                        if (getSel(mod.id).billingCycle === 'yearly') ensurePeriodMatchesCycle(mod.id);
                      }"
                    />
                  </div>

                  <!-- ── Prix de souscription (selon add-on + mensuel/annuel) ── -->
                  <div v-if="isSelected(mod.id)" class="mb-4" @click.stop>
                    <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Tag :size="11" />
                      Prix de souscription
                    </p>
                    <div class="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                      <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {{ getSel(mod.id).billingCycle === 'yearly' ? 'Annuel' : 'Mensuel' }}
                      </span>
                      <span class="text-sm font-black text-slate-900 dark:text-white">
                        {{ formatCurrency(getPrice(mod)) }}
                      </span>
                    </div>
                    <!-- <div class="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div class="flex items-center gap-2">

                     
                        <div class="flex-1">
                          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Catalogue</p>
                          <div class="flex items-center h-9 px-3 rounded-lg border border-slate-200 bg-slate-100 dark:bg-slate-700/50 dark:border-slate-600">
                            <span class="text-xs font-bold text-slate-400 line-through">{{ mod.priceMonthly.toLocaleString('fr-FR') }}</span>
                            <span class="text-[9px] text-slate-400 ml-1">/mois</span>
                          </div>
                        </div>

                        <ArrowRight :size="13" class="text-slate-300 shrink-0 mt-4" />

                      
                        <div class="flex-1">
                          <p class="text-[9px] font-bold text-purple-500 uppercase tracking-wider mb-1">Prix appliqué</p>
                          <div class="relative">
                            <input
                              type="number"
                              v-model.number="getSel(mod.id).customPrice"
                              :min="0"
                              class="w-full h-9 rounded-lg border-2 border-purple-300 dark:border-purple-700/60 bg-white dark:bg-slate-800 px-3 pr-10 text-xs font-black text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-500 transition-all"
                            />
                            <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 pointer-events-none">XAF</span>
                          </div>
                        </div>
                      </div>

                      <div v-if="getSel(mod.id).customPrice > 0 && getSel(mod.id).customPrice < mod.priceMonthly" class="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                        <TrendingDown :size="11" />
                        Remise de {{ Math.round((1 - getSel(mod.id).customPrice / mod.priceMonthly) * 100) }}% par rapport au catalogue
                      </div>
                      <div v-else-if="getSel(mod.id).customPrice > mod.priceMonthly" class="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-amber-500">
                        <TrendingUp :size="11" />
                        Majoration de {{ Math.round((getSel(mod.id).customPrice / mod.priceMonthly - 1) * 100) }}% par rapport au catalogue
                      </div>
                    </div> -->
                  </div>

              
                  <!-- <div class="flex items-end justify-between">
                    <div>
                      <span class="text-lg font-black text-slate-900 dark:text-white">{{ formatCurrency(getPrice(mod)) }}</span>
                      <span class="text-xs text-slate-400">/{{ isSelected(mod.id) && getSel(mod.id).billingCycle === 'yearly' ? 'an' : 'mois' }}</span>
                    </div>
                    <div v-if="mod.requires" class="flex items-center gap-1 text-[10px] text-slate-400">
                      <Link2 :size="10" />
                      Requiert {{ modules.find(m => m.id === mod.requires)?.name }}
                    </div>
                  </div> -->
                </div>

                <div v-if="isSelected(mod.id)" class="h-1 w-full" :style="{ background: mod.color }" />
              </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-16 text-slate-400">
              <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                <Package :size="22" class="opacity-40" />
              </div>
              <p class="text-sm font-semibold">Tous les modules sont déjà actifs</p>
              <p class="text-xs mt-1">Cet établissement a souscrit à tous les produits disponibles.</p>
            </div>
          </div>

          <!-- Summary sidebar -->
          <div class="space-y-4">
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-6">
              <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 class="font-black text-sm text-slate-900 dark:text-white">Récapitulatif</h3>
              </div>
              <div class="p-5">
                <div v-if="selectedModules.length === 0" class="text-center py-6">
                  <Package :size="28" class="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p class="text-xs text-slate-400">Aucun produit sélectionné</p>
                </div>
                <div v-else class="space-y-3">
                  <div v-for="mod in selectedModules" :key="mod.id" class="flex items-start justify-between gap-2">
                    <div class="flex items-start gap-2 min-w-0">
                      <div class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" :style="{ background: mod.color + '15', color: mod.color }">
                        <component :is="mod.icon" :size="13" />
                      </div>
                      <div class="min-w-0">
                        <p class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{{ mod.name }}</p>
                        <p class="text-[10px] text-slate-400">{{ getSel(mod.id).billingCycle === 'yearly' ? 'Annuel' : 'Mensuel' }}</p>
                        <p v-if="getSel(mod.id).addOnId" class="text-[10px] text-slate-400 truncate">{{ getSelectedAddOn(mod.id)?.name }}</p>
                       
                      </div>
                    </div>
                    <span class="text-xs font-bold text-slate-800 dark:text-white shrink-0">{{ formatCurrency(getPrice(mod)) }}</span>
                  </div>

                  <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <template v-if="isMixedBilling">
                      <div class="w-full space-y-2">
                        <div class="flex justify-between items-center">
                          <span class="text-sm font-black text-slate-900 dark:text-white">Total / mois</span>
                          <span class="text-lg font-black text-purple-600">{{ formatCurrency(totalMonthly) }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-sm font-black text-slate-900 dark:text-white">Total / an</span>
                          <span class="text-lg font-black text-purple-600">{{ formatCurrency(totalYearly) }}</span>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <span class="text-sm font-black text-slate-900 dark:text-white">
                        Total {{ isYearlyOnlyBilling ? '/ an' : '/ mois' }}
                      </span>
                      <span class="text-lg font-black text-purple-600">
                        {{ formatCurrency(isYearlyOnlyBilling ? totalYearly : totalMonthly) }}
                      </span>
                    </template>
                  </div>
                </div>

                <Transition name="slide-down">
                  <div v-if="hasMissingPeriod" class="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertTriangle :size="13" class="text-amber-500 mt-0.5 shrink-0" />
                    <p class="text-[11px] text-amber-700 font-medium">Veuillez définir la période pour tous les modules en facturation mensuelle.</p>
                  </div>
                </Transition>

                <Transition name="slide-down">
                  <div v-if="hasMissingAddOn" class="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertTriangle :size="13" class="text-amber-500 mt-0.5 shrink-0" />
                    <p class="text-[11px] text-amber-700 font-medium">Veuillez sélectionner un add-on pour chaque module.</p>
                  </div>
                </Transition>

                <Transition name="slide-down">
                  <div v-if="hasAddOnOutOfRange" class="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertTriangle :size="13" class="text-amber-500 mt-0.5 shrink-0" />
                    <p class="text-[11px] text-amber-700 font-medium">La valeur choisie dépasse la plage autorisée de l'add-on.</p>
                  </div>
                </Transition>

                <button
                  @click="goToStep2"
                  :disabled="selectedModules.length === 0 || hasMissingPeriod || hasMissingAddOn || hasAddOnOutOfRange"
                  class="mt-5 w-full py-3 rounded-xl text-sm font-black text-white transition-all"
                  :class="selectedModules.length > 0 && !hasMissingPeriod && !hasMissingAddOn && !hasAddOnOutOfRange
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 dark:shadow-purple-900/30'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'"
                >Continuer →</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Step 2 ── -->
      <div v-if="currentStep === 2">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div class="space-y-4">
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-6">
              <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 class="font-black text-sm text-slate-900 dark:text-white">Plan sélectionné</h3>
                <button :disabled="loading" @click="currentStep = 1" class="text-xs text-purple-600 font-bold hover:underline cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">Modifier</button>
              </div>
              <div class="p-5 space-y-3">
                <div v-for="mod in selectedModules" :key="mod.id" class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" :style="{ background: mod.color + '15', color: mod.color }">
                    <component :is="mod.icon" :size="16" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-slate-800 dark:text-white truncate">{{ mod.name }}</p>
                    <p class="text-[10px] text-slate-400">{{ getSel(mod.id).billingCycle === 'yearly' ? 'Facturation annuelle' : 'Facturation mensuelle' }}</p>
                    <p v-if="getSel(mod.id).billingCycle === 'monthly' && getSel(mod.id).startMonth && getSel(mod.id).endMonth" class="text-[10px] text-purple-500 font-semibold mt-0.5 flex items-center gap-1">
                      <CalendarRange :size="9" />{{ formatMonthShort(getSel(mod.id).startMonth) }} → {{ formatMonthShort(getSel(mod.id).endMonth) }}
                    </p>
                  </div>
                  <span class="text-xs font-black text-slate-900 dark:text-white shrink-0">{{ formatCurrency(getPrice(mod)) }}</span>
                </div>

                <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <template v-if="isMixedBilling">
                    <div class="w-full space-y-2">
                      <div class="flex justify-between items-center">
                        <span class="text-xs font-bold text-slate-500">Total / mois</span>
                        <span class="text-sm font-black text-purple-600">{{ formatCurrency(totalMonthly) }}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-xs font-bold text-slate-500">Total / an</span>
                        <span class="text-sm font-black text-purple-600">{{ formatCurrency(totalYearly) }}</span>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <span class="text-xs font-bold text-slate-500">Total {{ isYearlyOnlyBilling ? '/ an' : '/ mois' }}</span>
                    <span class="text-sm font-black text-purple-600">
                      {{ formatCurrency(isYearlyOnlyBilling ? totalYearly : totalMonthly) }}
                    </span>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2 space-y-6">

            <!-- <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                  <CreditCard :size="15" class="text-purple-600" />
                </div>
                <div>
                  <h3 class="font-black text-sm text-slate-900 dark:text-white">Mode de paiement</h3>
                  <p class="text-[11px] text-slate-400">Choisissez votre méthode préférée</p>
                </div>
              </div>
              <div class="p-6 space-y-5">

             
                <div class="grid grid-cols-2 gap-3">
                  <button
                    v-for="method in paymentMethods"
                    :key="method.val"
                    @click="payment.method = method.val"
                    class="p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all text-center"
                    :class="payment.method === method.val
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'"
                  >
                    <component
                      :is="method.icon"
                      :size="20"
                      :class="payment.method === method.val ? 'text-purple-600' : 'text-slate-400'"
                    />
                    <span
                      class="text-[10px] font-bold leading-tight"
                      :class="payment.method === method.val ? 'text-purple-700 dark:text-purple-400' : 'text-slate-500'"
                    >{{ method.label }}</span>
                  </button>
                </div>

              
                <div v-if="payment.method === 'card'" class="space-y-4">
                  <div>
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Titulaire de la carte</label>
                    <Input v-model="payment.cardName" placeholder="Jean Dupont" customClass="w-full" />
                  </div>
                  <div>
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Numéro de carte</label>
                    <Input v-model="payment.cardNumber" placeholder="0000 0000 0000 0000" maxlength="19" customClass="w-full font-mono" />
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Date d'expiration</label>
                      <Input v-model="payment.expiry" placeholder="MM / AA" customClass="w-full font-mono" />
                    </div>
                    <div>
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">CVV</label>
                      <Input v-model="payment.cvv" placeholder="•••" maxlength="3" customClass="w-full font-mono" />
                    </div>
                  </div>
                </div>

            
                <div v-if="payment.method === 'mobile'" class="space-y-4">
                  <div>
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Opérateur</label>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        v-for="op in mobileOperators"
                        :key="op.name"
                        @click="payment.mobileOperator = op.name"
                        class="py-2.5 px-2 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all"
                        :class="payment.mobileOperator === op.name
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'"
                      >
                        <component :is="op.icon" :size="16" :class="payment.mobileOperator === op.name ? 'text-purple-600' : 'text-slate-400'" />
                        <span class="text-[10px] font-bold text-center leading-tight" :class="payment.mobileOperator === op.name ? 'text-purple-700 dark:text-purple-400' : 'text-slate-500'">{{ op.name }}</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Numéro de téléphone</label>
                    <Input v-model="payment.mobilePhone" placeholder="+237 6XX XXX XXX" customClass="w-full" />
                  </div>
                </div>

              <div v-if="payment.method === 'transfer'" class="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 space-y-3">
                  <p class="text-xs font-bold text-blue-800 dark:text-blue-400 flex items-center gap-1.5">
                    <Info :size="13" />
                    Informations de virement bancaire
                  </p>
                  <div class="space-y-2 text-[12px] text-blue-700 dark:text-blue-300">
                    <div class="flex justify-between">
                      <span class="font-semibold text-blue-600 dark:text-blue-400">Banque</span>
                      <span>Société Générale Cameroun</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="font-semibold text-blue-600 dark:text-blue-400">IBAN</span>
                      <span class="font-mono">CM21 1000 2000 0012 3456 789</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="font-semibold text-blue-600 dark:text-blue-400">Référence</span>
                      <span class="font-mono font-bold">{{ transferRef }}</span>
                    </div>
                  </div>
                  <p class="text-[10px] text-blue-500 flex items-center gap-1">
                    <AlertTriangle :size="11" />
                    Mentionnez impérativement la référence lors du virement.
                  </p>
                </div> 
              </div>
            </div> -->          
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <Receipt :size="15" class="text-slate-600 dark:text-slate-300" />
                </div>
                <h3 class="font-black text-sm text-slate-900 dark:text-white">Récapitulatif de commande</h3>
              </div>
              <div class="p-6 space-y-3">
                <div v-for="mod in selectedModules" :key="mod.id" class="flex justify-between items-start gap-4">
                  <div class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 min-w-0">
                    <component :is="mod.icon" :size="14" class="text-slate-400 shrink-0 mt-0.5" />
                    <div class="min-w-0">
                      <span class="font-medium">{{ mod.fullName }}</span>
                      <div v-if="getSel(mod.id).billingCycle === 'monthly' && getSel(mod.id).startMonth && getSel(mod.id).endMonth" class="flex items-center gap-1 mt-1">
                        <div class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" :style="{ background: mod.color + '15', color: mod.color }">
                          <CalendarRange :size="8" />
                          {{ formatDateFull(getSel(mod.id).startMonth) }} → {{ formatDateFull(getSel(mod.id).endMonth) }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="font-semibold text-slate-800 dark:text-white text-sm block">
                      {{ formatCurrency(getPrice(mod)) }}
                      <span class="text-[10px] text-slate-400 font-bold">
                        {{ getSel(mod.id).billingCycle === 'yearly' ? '/an' : '/mois' }}
                      </span>
                    </span>
                   
                  </div>
                </div>

                <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <template v-if="isMixedBilling">
                    <div class="w-full space-y-2">
                      <div class="flex justify-between items-center">
                        <span class="font-black text-slate-900 dark:text-white">Total / mois</span>
                        <span class="text-2xl font-black text-purple-600">{{ formatCurrency(totalMonthly) }}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="font-black text-slate-900 dark:text-white">Total / an</span>
                        <span class="text-2xl font-black text-purple-600">{{ formatCurrency(totalYearly) }}</span>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <span class="font-black text-slate-900 dark:text-white">Montant total {{ isYearlyOnlyBilling ? '/ an' : '/ mois' }}</span>
                    <span class="text-2xl font-black text-purple-600">
                      {{ formatCurrency(isYearlyOnlyBilling ? totalYearly : totalMonthly) }}
                    </span>
                  </template>
                </div>
                <p class="text-[10px] text-slate-400 text-right flex items-center justify-end gap-1">
                  <RefreshCw :size="10" />
                  <span v-if="isMixedBilling">Total mixte (mensuel + annuel)</span>
                  <span v-else>{{ isYearlyOnlyBilling ? 'Récurrent annuel' : 'Récurrent mensuel' }} à partir d'aujourd'hui</span>
                </p>
                <button
                  @click="goToStep3"
                  :disabled="loading"
                  class="mt-2 w-full py-3.5 rounded-xl text-sm font-black text-white bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 dark:shadow-purple-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <svg
                    v-if="loading"
                    class="animate-spin h-4 w-4 text-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span v-if="loading">Chargement...</span>
                  <template v-else>
                    <ShieldCheck :size="16" />
                    Finaliser la souscription →
                  </template>
                </button>
                <p class="text-[10px] text-slate-400 text-center mt-1">
                  En continuant, vous acceptez nos <span class="underline cursor-pointer">Conditions d'utilisation</span> et notre <span class="underline cursor-pointer">Politique de confidentialité</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Step 3: Confirmation ── -->
      <div v-if="currentStep === 3" class="flex items-center justify-center py-16">
        <div class="text-center max-w-md w-full">
          <div class="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 :size="40" class="text-emerald-500" />
          </div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-2">Souscription confirmée !</h2>
          <p class="text-sm text-slate-500 mb-8">Vos produits sont maintenant actifs. Vous pouvez commencer à les utiliser immédiatement.</p>

          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-6 text-left space-y-3">
            <h3 class="font-black text-sm text-slate-900 dark:text-white mb-3">Produits activés</h3>
            <div v-for="mod in selectedModules" :key="mod.id" class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :style="{ background: mod.color + '15', color: mod.color }">
                <component :is="mod.icon" :size="15" />
              </div>
              <div class="flex-1">
                <p class="text-xs font-bold text-slate-800 dark:text-white">{{ mod.fullName }}</p>
                <p class="text-[10px] text-slate-400">
                  <span v-if="getSel(mod.id).billingCycle === 'monthly'">{{ formatDateFull(getSel(mod.id).startMonth) }} → {{ formatDateFull(getSel(mod.id).endMonth) }}</span>
                  <span v-else>Facturation annuelle</span>
                </p>
                <p class="text-[10px] text-emerald-600 font-semibold flex items-center gap-1"><Check :size="9" /> Actif</p>
              </div>
              <span class="text-xs font-black text-slate-700 dark:text-slate-300">{{ getPrice(mod).toLocaleString('fr-FR') }} XAF</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button @click="router.back()" class="py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              <LayoutDashboard :size="15" />Tableau de bord
            </button>
            <button @click="resetAndRestart" class="py-3 rounded-xl bg-purple-600 text-sm font-bold text-white hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
              <Plus :size="15" />Ajouter des produits
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, type Component } from 'vue'
import { useRouter ,useRoute } from 'vue-router'
import { productService, type Product } from '../../servicesAPI/productService'
import { formatCurrency } from '../../components/Utilities/function'
import InputDoubleDate from '../../components/FormElements/InputDoubleDate.vue'
import Select from '../../components/FormElements/Select.vue'
import { subscriptionService } from '../../servicesAPI/subscriptionService'
import { useToastStore } from '../../composables/toast'
import { addOnService, type AddOn } from '../../servicesAPI/addOnService'
import {
  ArrowLeft, ShieldCheck, Check, Lock,
  Package, CheckCircle2, AlertTriangle, BedDouble, Utensils,
  ArrowLeftRight, Smartphone, BarChart2, Users,
  Receipt, RefreshCw, LayoutDashboard, Plus,
  CalendarRange,
  Tag,
} from 'lucide-vue-next'
import { hotelService } from '../../servicesAPI/clientService'

const router = useRouter()
const toastStore = useToastStore()
const loading = ref(false)
const pageLoading = ref(true) 
const existingSubscriptions = ref<any[]>([])

const route = useRoute()



// ── Icon / Color mapping ───
const slugIconComponents: Record<string, Component> = {
  'pms': BedDouble, 'pos': Utensils, 'channel-manager': ArrowLeftRight,
  'mobile-app': Smartphone, 'analytics': BarChart2, 'crm': Users,
}
const slugColors: Record<string, string> = {
  'pms': '#7c3aed', 'pos': '#0891b2', 'channel-manager': '#059669',
  'mobile-app': '#d97706', 'analytics': '#dc2626', 'crm': '#0f766e',
}
const getIcon  = (slug: string): Component => slugIconComponents[slug] ?? Package
const getColor = (slug: string) => slugColors[slug] ?? '#6b7280'

// ── Types ────
interface OTA { name: string; checked: boolean }

interface Selection {
  billingCycle : 'monthly' | 'yearly'
  rooms        : number
  units        : number
  staffQuota   : number
  guestApp     : boolean
  otas         : OTA[]
  startMonth   : string
  endMonth     : string
  customPrice  : number
  addOnId      : number | null
}



// ── Catalogue ─────
const modules       = ref<any[]>([])
const hotelId = Number(router.currentRoute.value.params.id || 0)

const loadModules = async()=> {

  try {
    const res = await productService.getAll()
    const arr = Array.isArray(res.data) ? res.data : []
    modules.value = arr.map((p: Product): any => ({
      id: Number(p.id), slug: p.slug || '', name: p.name, fullName: p.name,
      description: p.description || '', priceMonthly: p.priceMonthly ?? 0,
      icon: getIcon(p.slug || ''), color: getColor(p.slug || ''),
    }))
  } catch (e) { console.error(e) }
}

const activeModuleSlugs = computed(() =>
  existingSubscriptions.value
    .filter((sub: any) => sub.status === 'active')
    .map((sub: any) => sub.module?.slug)
)

const availableModules = computed(() =>
  modules.value.filter(m =>
    !activeModuleSlugs.value.includes(m.slug) ||
    m.slug === editingSubSlug.value  
  )
)
const openEditMode = (sub: any) => {
  const mod = modules.value.find(m => m.slug === sub.module?.slug)
  if (!mod) return

  if (!availableModules.value.find(m => m.id === mod.id)) {
    modules.value = [...modules.value]  
  }

  selections[mod.id] = {
    billingCycle : sub.billingCycle ?? 'monthly',
    rooms        : sub.limitCount ?? 10,
    units        : sub.limitCount ?? 1,
    staffQuota   : sub.limitCount ?? 5,
    guestApp     : false,
    otas         : DEFAULT_OTAS.map(o => ({ ...o })),
    startMonth   : sub.startsAt?.split('T')[0] ?? '',
    endMonth     : sub.endsAt?.split('T')[0] ?? '',
    customPrice  : Number(sub.price) ?? 0,
    addOnId      : sub.addOnId ?? sub.add_on_id ?? sub.addOn?.id ?? null,
  }
  void ensureAddOnsLoaded(mod.id)
}

onMounted(async () => {
  pageLoading.value = true
  await Promise.all([loadModules(), loadExistingSubscriptions()])
  
  const editSubId = route.query.editSubId
  if (editSubId) {
    const sub = existingSubscriptions.value.find(
      (s: any) => s.id === Number(editSubId)
    )
    if (sub) {
      openEditMode(sub)
    }
  }
  
  pageLoading.value = false
})


const formatMonthShort = (ymd: string): string => {
  if (!ymd) return ''
  const [y, m, d] = ymd.split('-')
  if (!y || !m || !d) return ''
  return `${d}/${m}/${y.slice(2)}`
}


const formatDateFull = (ymd: string): string => {
  if (!ymd) return ''
  const [y, m, d] = ymd.split('-')
  if (!y || !m || !d) return ''
  return `${d}/${m}/${y}`
}



// ── OTA defaults ───────
const DEFAULT_OTAS: OTA[] = [
  { name: 'Booking.com', checked: true },
  { name: 'Agoda',       checked: true },
  { name: 'Expedia',     checked: false },
]

// ── State ───────
const currentStep        = ref(1)
const steps              = ['Plan', 'Paiement', 'Confirmation']
const showChannelWarning = ref(false)
const selections         = reactive<Record<number, Selection>>({})
const addOnsByModule     = reactive<Record<number, AddOn[]>>({})
const addOnsLoadingByModule = reactive<Record<number, boolean>>({})
const addOnsLoadedByModule  = reactive<Record<number, boolean>>({})

// ── Computed ─────
const selectedModules = computed(() => modules.value.filter(m => selections[m.id] !== undefined))

const isSelected = (id: number) => selections[id] !== undefined
const isLocked   = (id: number) => {
  const mod = modules.value.find(m => m.id === id)
  return mod?.requires !== undefined && !isSelected(mod.requires)
}
const getSel = (id: number) => selections[id] as Selection

const getSelectedAddOn = (moduleId: number) => {
  const sel = selections[moduleId]
  if (!sel?.addOnId) return null
  return (addOnsByModule[moduleId] || []).find((a) => a.id === sel.addOnId) ?? null
}

const addOnOptionsForModule = (moduleId: number) =>
  (addOnsByModule[moduleId] || []).map((a) => ({
    value: a.id,
    label: `${a.name} — ${formatCurrency(
      (selections[moduleId]?.billingCycle ?? 'monthly') === 'yearly'
        ? a.priceYear != null
          ? Number(a.priceYear)
          : Number(a.priceMonth) * 12
        : Number(a.priceMonth)
    )} (min ${a.min}, max ${a.max})`,
  }))

const handleAddOnChange = (moduleId: number) => {
  const sel = selections[moduleId]
  if (!sel) return
  sel.customPrice = 0
}

const getLimitCountForModule = (mod: any, sel: Selection) =>
  mod.slug === 'pms'
    ? sel.rooms
    : mod.slug === 'pos'
      ? sel.units
      : mod.slug === 'mobile-app'
        ? sel.staffQuota
        : mod.slug === 'channel-manager'
          ? sel.otas.filter((o: any) => o.checked).length
          : null

const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const addMonths = (ymd: string, months: number) => {
  if (!ymd) return ''
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) return ''
  return fmtDate(new Date(y, m - 1 + months, d))
}

const addYears = (ymd: string, years: number) => {
  if (!ymd) return ''
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) return ''
  return fmtDate(new Date(y + years, m - 1, d))
}

const ensurePeriodMatchesCycle = (moduleId: number) => {
  const sel = selections[moduleId]
  if (!sel) return
  if (!sel.startMonth) sel.startMonth = fmtDate(new Date())
  sel.endMonth = sel.billingCycle === 'yearly' ? addYears(sel.startMonth, 1) : addMonths(sel.startMonth, 1)
}

const ensureAddOnsLoaded = async (moduleId: number) => {
  if (addOnsLoadedByModule[moduleId]) return
  addOnsLoadingByModule[moduleId] = true
  try {
    const res = await addOnService.getByModule(moduleId, { page: 1, limit: 200 })
    addOnsByModule[moduleId] = Array.isArray(res.data) ? res.data : []
    addOnsLoadedByModule[moduleId] = true
  } catch (e) {
    console.error(e)
    addOnsByModule[moduleId] = []
    addOnsLoadedByModule[moduleId] = true
  } finally {
    addOnsLoadingByModule[moduleId] = false
  }
}


const getPrice = (mod: any): number => {
  const sel = selections[mod.id]
  if (!sel) return Number(mod.priceMonthly) 
  if (sel.customPrice > 0) {
    const baseMonthly = Number(sel.customPrice)
    return sel.billingCycle === 'yearly' ? baseMonthly * 12 : baseMonthly
  }

  const selectedAddOn = getSelectedAddOn(mod.id)
  if (selectedAddOn) {
    if (sel.billingCycle === 'yearly') {
      return selectedAddOn.priceYear != null ? Number(selectedAddOn.priceYear) : Number(selectedAddOn.priceMonth) * 12
    }
    return Number(selectedAddOn.priceMonth)
  }

  const baseMonthly = Number(mod.priceMonthly)
  return sel.billingCycle === 'yearly' ? baseMonthly * 12 : baseMonthly
}

const hasMonthlyBilling = computed(() =>
  selectedModules.value.some((mod) => getSel(mod.id).billingCycle === 'monthly')
)
const hasYearlyBilling = computed(() =>
  selectedModules.value.some((mod) => getSel(mod.id).billingCycle === 'yearly')
)
const isMixedBilling = computed(() => hasMonthlyBilling.value && hasYearlyBilling.value)
const isYearlyOnlyBilling = computed(() => hasYearlyBilling.value && !hasMonthlyBilling.value)

const totalMonthly = computed(() =>
  selectedModules.value.reduce((acc, mod) => {
    return acc + (getSel(mod.id).billingCycle === 'monthly' ? getPrice(mod) : 0)
  }, 0)
)
const totalYearly = computed(() =>
  selectedModules.value.reduce((acc, mod) => {
    return acc + (getSel(mod.id).billingCycle === 'yearly' ? getPrice(mod) : 0)
  }, 0)
)



const hasMissingPeriod = computed(() =>
  selectedModules.value.some((mod) => {
    const sel = getSel(mod.id)
    return !sel?.startMonth || !sel?.endMonth
  })
)

const hasMissingAddOn = computed(() =>
  selectedModules.value.some((mod) => (addOnsByModule[mod.id] || []).length > 0 && !getSel(mod.id).addOnId)
)

const hasAddOnOutOfRange = computed(() =>
  selectedModules.value.some((mod) => {
    const sel = getSel(mod.id)
    const addOn = getSelectedAddOn(mod.id)
    if (!addOn) return false
    const limitCount = getLimitCountForModule(mod, sel)
    if (limitCount == null) return false
    return Number(limitCount) < Number(addOn.min) || Number(limitCount) > Number(addOn.max)
  })
)

const loadExistingSubscriptions = async() =>{
  try {
    const res = await hotelService.getById(hotelId)
    const hotel = res.data?.data ?? res.data
    existingSubscriptions.value = hotel?.subscriptions || []
  } catch (e) { console.error(e) }
}

// ── Actions ────────
const setSel = (id: number, key: keyof Selection, val: any) => {
  const s = getSel(id); if (s) (s as any)[key] = val
}

const defaultSelection = (): Selection => {
  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 6) 

  return {
    billingCycle: 'monthly',
    rooms: 10, units: 1, staffQuota: 5, guestApp: false,
    otas: DEFAULT_OTAS.map(o => ({ ...o })),
    startMonth : fmtDate(start),
    endMonth   : fmtDate(end),
    customPrice: 0,
    addOnId: null,
  }
}


const toggleModule = async (mod: any) => {
  if (isLocked(mod.id)) {
    showChannelWarning.value = true
    setTimeout(() => { showChannelWarning.value = false }, 4000)
    return
  }
  if (isSelected(mod.id)) {
    delete selections[mod.id]
    modules.value.forEach(m => { if (m.requires === mod.id && isSelected(m.id)) delete selections[m.id] })
  } else {
    selections[mod.id] = defaultSelection()
    ensurePeriodMatchesCycle(mod.id)
    await ensureAddOnsLoaded(mod.id)
  }
}

const goToStep2 = () => {
  if (selectedModules.value.length === 0) return
  if (hasMissingPeriod.value) return
  if (hasMissingAddOn.value) return
  if (hasAddOnOutOfRange.value) return
  currentStep.value = 2
}

const buildSubscriptionPayload = (mod: any) => {
  const sel = getSel(mod.id)
  
  const limitCount = 
    mod.slug === 'pms' ? sel.rooms : 
    mod.slug == 'pos' ? sel.units : 
    mod.slug == 'mobile-app' ? sel.staffQuota : 
    mod.slug == 'channel-manager' ? sel.otas.filter((o: any) => o.checked).length : null 
   

  return {
    module_id    : mod.id,
    add_on_id    : sel.addOnId,
    billing_cycle: sel.billingCycle,
    price        : getPrice(mod),  
    limit_count: limitCount,
    starts_at: sel.startMonth,
    ends_at  : sel.endMonth,
    ...(mod.slug === 'pms'             && { rooms: sel.rooms }),
    ...(mod.slug === 'pos'             && { units: sel.units }),
    ...(mod.slug === 'mobile-app'      && { staff_quota: sel.staffQuota, guest_app: sel.guestApp }),
    ...(mod.slug === 'channel-manager' && { otas: sel.otas.filter(o => o.checked).map(o => o.name) }),
  }
}

const goToStep3 = async () => {
  try {
    loading.value = true
    for (const mod of selectedModules.value) {
      const payload = buildSubscriptionPayload(mod)

      if (editSubId.value) {
       
        await subscriptionService.update(editSubId.value, {
          status       : 'active',
          billing_cycle: payload.billing_cycle,
          price        : payload.price,
          limit_count  : payload.limit_count,
          starts_at    : payload.starts_at,
          ends_at      : payload.ends_at,
          add_on_id    : payload.add_on_id,
        })
        toastStore.show({ type: 'success', title: 'Abonnement mis à jour', message: `${mod.name} a été modifié.` })
      } else {
        await subscriptionService.create(hotelId, payload)
        toastStore.show({ type: 'success', title: 'Produit activé', message: `${mod.name} a été ajouté.` })
      }
    }
    currentStep.value = 3
  } catch (error: any) {
    const code = error.response?.data?.code
    const codeMessages: Record<string, { title: string; message: string }> = {
      DEPENDENCY_MISSING    : { title: 'Dépendance manquante', message: 'Le Channel Manager nécessite un abonnement PMS actif.' },
      DUPLICATE_SUBSCRIPTION: { title: 'Abonnement existant',  message: 'Un abonnement actif existe déjà pour ce module.' },
      INTERNAL_SERVER_ERROR : { title: 'Erreur', message: 'Une erreur est survenue.' }
    }
    const toast = codeMessages[code] ?? { title: 'Erreur', message: error.response?.data?.message ?? 'Une erreur est survenue.' }
    toastStore.show({ type: 'error', title: toast.title, message: toast.message })
  } finally {
    loading.value = false
  }
}

const resetAndRestart = () => {
  Object.keys(selections).forEach(k => delete selections[Number(k)])
  currentStep.value = 1
}

const editSubId = computed(() => route.query.editSubId ? Number(route.query.editSubId) : null)

const editingSubSlug = computed(() => {
  if (!editSubId.value) return null
  const sub = existingSubscriptions.value.find((s: any) => s.id === editSubId.value)
  return sub?.module?.slug ?? null
})


</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
