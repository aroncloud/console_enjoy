<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">

    <!-- ── Page header ── -->
    <div class=" dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div class=" px-6">

        <!-- Back button -->
        <div class="pt-5 pb-4">
          <button
            @click="router.back()"
            class="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft  />
            Retour
          </button>
        </div>

        <!-- Title (only on step 1) -->
        <div v-if="currentStep === 1" class="pb-5">
          <h2 class="text-xl font-black text-slate-900 dark:text-white">Choisissez vos modules</h2>
          <p class="text-sm text-slate-500 mt-1">Sélectionnez les modules adaptés à votre établissement</p>
        </div>
        <div v-else-if="currentStep === 2" class="pb-5">
          <h2 class="text-xl font-black text-slate-900 dark:text-white">Paiement</h2>
          <p class="text-sm text-slate-500 mt-1">Finalisez votre souscription en choisissant un mode de paiement</p>
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

      <!-- ── Step 1: Plan ── -->
      <div v-if="currentStep === 1">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Left: Modules -->
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
            <div v-if="modulesLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="i in 6" :key="i" class="h-40 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="mod in modules"
                :key="mod.id"
                class="relative bg-white dark:bg-slate-900 rounded-2xl border-2 transition-all duration-200 overflow-hidden"
                :class="[
                  isSelected(mod.id)
                    ? 'border-purple-500 shadow-lg shadow-purple-100 dark:shadow-purple-900/20'
                    : isLocked(mod.id)
                      ? 'border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed'
                      : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 hover:shadow-md cursor-pointer'
                ]"
                @click="toggleModule(mod)"
              >
                <!-- Selected indicator -->
                <div
                  v-if="isSelected(mod.id)"
                  class="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                  :style="{ background: mod.color }"
                >
                  <Check :size="11" class="text-white" />
                </div>

                <!-- Lock indicator -->
                <div
                  v-if="isLocked(mod.id)"
                  class="absolute top-3 right-3 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"
                >
                  <Lock :size="10" class="text-slate-400" />
                </div>

                <div class="p-5">
                  <!-- Icon + name -->
                  <div class="flex items-start gap-3 mb-4">
                    <div
                      class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      :style="{ background: mod.color + '15', color: mod.color }"
                    >
                      <component :is="mod.icon" :size="20" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-black text-slate-900 dark:text-white text-sm">{{ mod.fullName }}</p>
                      <p class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{{ mod.description }}</p>
                    </div>
                  </div>

                  <!-- Limit input (if selected and has limit) -->
                  <div v-if="isSelected(mod.id) && mod.limitLabel" class="mb-4">
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{{ mod.limitLabel }}</p>
                    <input
                      type="number"
                      min="1"
                      v-model="getSel(mod.id).limitCount"
                      @click.stop
                      class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <!-- Billing cycle (if selected) -->
                  <div v-if="isSelected(mod.id)" class="mb-4" @click.stop>
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Facturation</p>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        v-for="[val, label] in [['monthly', 'Mensuel'], ['yearly', 'Annuel −17%']]"
                        :key="val"
                        @click="setSel(mod.id, 'billingCycle', val)"
                        class="py-1.5 px-2 rounded-lg text-[11px] font-bold border-2 transition-all"
                        :class="getSel(mod.id).billingCycle === val
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'"
                      >{{ label }}</button>
                    </div>
                  </div>

                  <!-- Price + dependency badge -->
                  <div class="flex items-end justify-between">
                    <div>
                      <span class="text-lg font-black text-slate-900 dark:text-white">
                        {{ formatCurrency(getPrice(mod)) }}
                      </span>
                      <span class="text-xs text-slate-400">
                        /{{ isSelected(mod.id) && getSel(mod.id).billingCycle === 'yearly' ? 'an' : 'mois' }}
                      </span>
                    </div>
                    <div v-if="mod.requires" class="flex items-center gap-1 text-[10px] text-slate-400">
                      <Link2 :size="10" />
                      Requiert {{ modules.find(m => m.id === mod.requires)?.name }}
                    </div>
                  </div>
                </div>

                <!-- Bottom color bar when selected -->
                <div
                  v-if="isSelected(mod.id)"
                  class="h-1 w-full"
                  :style="{ background: mod.color }"
                />
              </div>
            </div>
          </div>

          <!-- Right: Summary -->
          <div class="space-y-4">
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-6">
              <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 class="font-black text-sm text-slate-900 dark:text-white">Récapitulatif</h3>
              </div>
              <div class="p-5">
                <div v-if="selectedModules.length === 0" class="text-center py-6">
                  <Package :size="28" class="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p class="text-xs text-slate-400">Aucun module sélectionné</p>
                </div>
                <div v-else class="space-y-3">
                  <div v-for="mod in selectedModules" :key="mod.id" class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                      <div
                        class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        :style="{ background: mod.color + '15', color: mod.color }"
                      >
                        <component :is="mod.icon" :size="13" />
                      </div>
                      <div class="min-w-0">
                        <p class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{{ mod.name }}</p>
                        <p class="text-[10px] text-slate-400">{{ getSel(mod.id).billingCycle === 'yearly' ? 'Annuel' : 'Mensuel' }}</p>
                      </div>
                    </div>
                    <span class="text-xs font-bold text-slate-800 dark:text-white shrink-0">{{ getPrice(mod).toLocaleString('fr-FR') }}</span>
                  </div>

                  <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <div class="flex justify-between items-center">
                      <span class="text-xs text-slate-500">Sous-total</span>
                      <!-- <span class="text-xs font-bold text-slate-700 dark:text-slate-200">{{ totalMonthlyEquivalent.toLocaleString('fr-FR') }} XAF</span> -->
                    </div>
                    <!-- <div class="flex justify-between items-center">
                      <span class="text-xs text-slate-500">TVA (19.25%)</span>
                      <span class="text-xs font-bold text-slate-700 dark:text-slate-200">{{ Math.round(totalMonthlyEquivalent * 0.1925).toLocaleString('fr-FR') }} XAF</span>
                    </div> -->
                  </div>
                  <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span class="text-sm font-black text-slate-900 dark:text-white">Total / mois</span>
                    <span class="text-lg font-black text-purple-600">
                      {{ Math.round(totalMonthlyEquivalent * 1.1925).toLocaleString('fr-FR') }}
                      <span class="text-xs font-normal text-slate-400">XAF</span>
                    </span>
                  </div>
                </div>

                <button
                  @click="goToStep2"
                  :disabled="selectedModules.length === 0"
                  class="mt-5 w-full py-3 rounded-xl text-sm font-black text-white transition-all"
                  :class="selectedModules.length > 0
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 dark:shadow-purple-900/30'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'"
                >
                  Continuer →
                </button>

                <div class="mt-4 space-y-2">
                  <div class="flex items-center gap-2 text-[11px] text-slate-400">
                    <ShieldCheck :size="12" class="text-emerald-500 shrink-0" />
                    <span>Paiement 100% sécurisé</span>
                  </div>
                  <div class="flex items-center gap-2 text-[11px] text-slate-400">
                    <RotateCcw :size="12" class="text-blue-500 shrink-0" />
                    <span>Résiliable à tout moment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Step 2: Paiement ── -->
      <div v-if="currentStep === 2">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Left: Plan recap -->
          <div class="space-y-4">
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-6">
              <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 class="font-black text-sm text-slate-900 dark:text-white">Plan sélectionné</h3>
                <button @click="currentStep = 1" class="text-xs text-purple-600 font-bold hover:underline">Modifier</button>
              </div>
              <div class="p-5 space-y-3">
                <div
                  v-for="mod in selectedModules"
                  :key="mod.id"
                  class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800"
                >
                  <div
                    class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    :style="{ background: mod.color + '15', color: mod.color }"
                  >
                    <component :is="mod.icon" :size="16" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-slate-800 dark:text-white truncate">{{ mod.name }}</p>
                    <p class="text-[10px] text-slate-400">{{ getSel(mod.id).billingCycle === 'yearly' ? 'Facturation annuelle' : 'Facturation mensuelle' }}</p>
                  </div>
                  <span class="text-xs font-black text-slate-900 dark:text-white shrink-0">{{ getPrice(mod).toLocaleString('fr-FR') }}</span>
                </div>

                <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span class="text-xs font-bold text-slate-500">Total TTC / mois</span>
                  <span class="text-sm font-black text-purple-600">
                    {{ Math.round(totalMonthlyEquivalent * 1.1925).toLocaleString('fr-FR') }} XAF
                  </span>
                </div>
              </div>

              <div class="px-5 pb-5 grid grid-cols-2 gap-2">
                <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 flex items-center gap-2">
                  <ShieldCheck :size="13" class="text-emerald-500 shrink-0" />
                  <span class="text-[10px] font-semibold text-slate-500">SSL Sécurisé</span>
                </div>
                <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 flex items-center gap-2">
                  <RotateCcw :size="13" class="text-blue-500 shrink-0" />
                  <span class="text-[10px] font-semibold text-slate-500">Garantie 30j</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Payment + Order summary -->
          <div class="lg:col-span-2 space-y-6">

            <!-- Payment method -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
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

                <!-- Method tabs -->
                <div class="grid grid-cols-3 gap-3">
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

                <!-- Card fields -->
                <div v-if="payment.method === 'card'" class="space-y-4">
                  <div>
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Titulaire de la carte</label>
                    <input
                      v-model="payment.cardName"
                      placeholder="Jean Dupont"
                      class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Numéro de carte</label>
                    <input
                      v-model="payment.cardNumber"
                      placeholder="0000 0000 0000 0000"
                      maxlength="19"
                      class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Date d'expiration</label>
                      <input
                        v-model="payment.expiry"
                        placeholder="MM / AA"
                        class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                      />
                    </div>
                    <div>
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">CVV</label>
                      <input
                        v-model="payment.cvv"
                        placeholder="•••"
                        maxlength="3"
                        class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <!-- Mobile Money fields -->
                <div v-if="payment.method === 'mobile'" class="space-y-4">
                  <div>
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Opérateur</label>
                    <div class="grid grid-cols-3 gap-2">
                      <button
                        v-for="op in mobileOperators"
                        :key="op.name"
                        @click="payment.mobileOperator = op.name"
                        class="py-2.5 px-2 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all"
                        :class="payment.mobileOperator === op.name
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'"
                      >
                        <component
                          :is="op.icon"
                          :size="16"
                          :class="payment.mobileOperator === op.name ? 'text-purple-600' : 'text-slate-400'"
                        />
                        <span
                          class="text-[10px] font-bold text-center leading-tight"
                          :class="payment.mobileOperator === op.name ? 'text-purple-700 dark:text-purple-400' : 'text-slate-500'"
                        >{{ op.name }}</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Numéro de téléphone</label>
                    <input
                      v-model="payment.mobilePhone"
                      placeholder="+237 6XX XXX XXX"
                      class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <!-- Transfer info -->
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
            </div>

            <!-- Order summary + CTA -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <Receipt :size="15" class="text-slate-600 dark:text-slate-300" />
                </div>
                <h3 class="font-black text-sm text-slate-900 dark:text-white">Récapitulatif de commande</h3>
              </div>
              <div class="p-6 space-y-3">
                <div v-for="mod in selectedModules" :key="mod.id" class="flex justify-between items-center">
                  <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <component :is="mod.icon" :size="14" class="text-slate-400 shrink-0" />
                    {{ mod.fullName }}
                  </div>
                  <span class="font-semibold text-slate-800 dark:text-white text-sm">{{ getPrice(mod).toLocaleString('fr-FR') }} XAF</span>
                </div>
                <div class="flex justify-between items-center text-sm text-slate-400">
                  <span>TVA (19.25%)</span>
                  <span>{{ Math.round(totalMonthlyEquivalent * 0.1925).toLocaleString('fr-FR') }} XAF</span>
                </div>
                <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span class="font-black text-slate-900 dark:text-white">Montant total</span>
                  <span class="text-2xl font-black text-purple-600">
                    {{ Math.round(totalMonthlyEquivalent * 1.1925).toLocaleString('fr-FR') }}
                    <span class="text-sm font-normal text-slate-400">XAF</span>
                  </span>
                </div>
                <p class="text-[10px] text-slate-400 text-right flex items-center justify-end gap-1">
                  <RefreshCw :size="10" />
                  Récurrent mensuel à partir d'aujourd'hui
                </p>

                <button
                  @click="goToStep3"
                  class="mt-2 w-full py-3.5 rounded-xl text-sm font-black text-white bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 dark:shadow-purple-900/30 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck :size="16" />
                  Finaliser la souscription →
                </button>
                <p class="text-[10px] text-slate-400 text-center mt-1">
                  En continuant, vous acceptez nos
                  <span class="underline cursor-pointer">Conditions d'utilisation</span>
                  et notre
                  <span class="underline cursor-pointer">Politique de confidentialité</span>.
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
          <p class="text-sm text-slate-500 mb-8">Vos modules sont maintenant actifs. Vous pouvez commencer à les utiliser immédiatement.</p>

          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-6 text-left space-y-3">
            <h3 class="font-black text-sm text-slate-900 dark:text-white mb-3">Modules activés</h3>
            <div v-for="mod in selectedModules" :key="mod.id" class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                :style="{ background: mod.color + '15', color: mod.color }"
              >
                <component :is="mod.icon" :size="15" />
              </div>
              <div class="flex-1">
                <p class="text-xs font-bold text-slate-800 dark:text-white">{{ mod.fullName }}</p>
                <p class="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Check :size="9" /> Actif
                </p>
              </div>
              <span class="text-xs font-black text-slate-700 dark:text-slate-300">{{ getPrice(mod).toLocaleString('fr-FR') }} XAF</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button
              @click="router.back()"
              class="py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <LayoutDashboard :size="15" />
              Tableau de bord
            </button>
            <button
              @click="resetAndRestart"
              class="py-3 rounded-xl bg-purple-600 text-sm font-bold text-white hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus :size="15" />
              Ajouter des modules
            </button>
          </div>
        </div>
      </div>

    </div>
    </div>
 
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { productService, type Product } from '../../servicesAPI/productService'
import { formatCurrency } from '../../components/Utilities/function'
import {
  ArrowLeft, ShieldCheck, Check, Lock, Link2,
  Package, RotateCcw, CreditCard, Info,
  CheckCircle2, AlertTriangle, BedDouble, Utensils,
  ArrowLeftRight, Smartphone, BarChart2, Users,
  Receipt, RefreshCw, LayoutDashboard, Plus,
  Banknote, Wallet, Building2,
} from 'lucide-vue-next'

const router = useRouter()

// icon/color helpers (reuse dans dossier clients)
const slugIconComponents: Record<string, Component> = {
  'pms': BedDouble,
  'pos': Utensils,
  'channel-manager': ArrowLeftRight,
  'mobile-app': Smartphone,
  'analytics': BarChart2,
  'crm': Users,
}
const slugColors: Record<string, string> = {
  'pms': '#7c3aed',
  'pos': '#0891b2',
  'channel-manager': '#059669',
  'mobile-app': '#d97706',
  'analytics': '#dc2626',
  'crm': '#0f766e',
}
const getIcon = (slug: string): Component => slugIconComponents[slug] ?? BedDouble
const getColor = (slug: string) => slugColors[slug] ?? '#6b7280'

// ── Types ─────────────────────────────────────────────────────────
interface Module {
  id: number
  slug: string
  name: string
  fullName: string
  description: string
  priceMonthly: number
  icon: any
  color: string
  limitLabel: string | null
  requires?: number
}

interface Selection {
  billingCycle: 'monthly' | 'yearly'
  limitCount: number
}

// ── Catalogue (chargée depuis l'API) ────────────────────────────────
const modules = ref<Module[]>([])
const modulesLoading = ref(false)

// helper pour rafraîchir
async function loadModules() {
  modulesLoading.value = true
  try {
    const res = await productService.getAll()
    const arr = Array.isArray(res.data) ? res.data : []
    modules.value = arr.map((p: Product): Module => ({
      id: Number(p.id),
      slug: p.slug || '',
      name: p.name,
      fullName: p.name,
      description: p.description || '',
      priceMonthly: p.priceMonthly ?? 0,
      icon: getIcon(p.slug || ''),
      color: getColor(p.slug || ''),
      limitLabel: p.slug,
    }))
  } catch (e) {
    console.error(e)
  } finally {
    modulesLoading.value = false
  }
}

onMounted(() => {
  loadModules()
})

// ── Payment config ─────────────────────────────────────────────────
const paymentMethods = [
  { val: 'card',     label: 'Carte bancaire', icon: CreditCard },
  { val: 'mobile',   label: 'Mobile Money',   icon: Wallet     },
  { val: 'transfer', label: 'Virement',        icon: Building2  },
] as const

const mobileOperators = [
  { name: 'Orange Money', icon: Banknote },
  { name: 'MTN MoMo',     icon: Banknote },
  { name: 'Moov Money',   icon: Banknote },
]

// ── State ──────────────────────────────────────────────────────────
const currentStep        = ref(1)
const steps              = ['Plan', 'Paiement', 'Confirmation']
const showChannelWarning = ref(false)
const transferRef        = 'HOS-' + Math.random().toString(36).substring(2, 8).toUpperCase()

const selections = reactive<Record<number, Selection>>({})

const payment = reactive({
  method:         'card' as 'card' | 'mobile' | 'transfer',
  cardName:       '',
  cardNumber:     '',
  expiry:         '',
  cvv:            '',
  mobileOperator: 'Orange Money',
  mobilePhone:    '',
})

// ── Computed ───────────────────────────────────────────────────────
const selectedModules = computed(() => modules.value.filter(m => selections[m.id] !== undefined))

const isSelected = (id: number) => selections[id] !== undefined
const isLocked   = (id: number) => {
  const mod = modules.value.find(m => m.id === id)
  return mod?.requires !== undefined && !isSelected(mod.requires)
}

const getSel = (id: number) => selections[id] as Selection

const getPrice = (mod: Module) => {
  const sel = selections[mod.id]
  if (!sel) return mod.priceMonthly
  return sel.billingCycle === 'yearly' ? Math.round(mod.priceMonthly * 10) : mod.priceMonthly
}

const totalMonthlyEquivalent = computed(() =>
  selectedModules.value.reduce((acc, mod) => {
    const sel = selections[mod.id]
    const monthly = sel?.billingCycle === 'yearly'
      ? Math.round(mod.priceMonthly * 10 / 12)
      : mod.priceMonthly
    return acc + monthly
  }, 0)
)

// ── Actions ────────────────────────────────────────────────────────
const setSel = (id: number, key: keyof Selection, val: any) => {
  const s = getSel(id)
  if (s) (s as any)[key] = val
}

const toggleModule = (mod: Module) => {
  if (isLocked(mod.id)) {
    showChannelWarning.value = true
    setTimeout(() => { showChannelWarning.value = false }, 4000)
    return
  }
  if (isSelected(mod.id)) {
    delete selections[mod.id]
    modules.value.forEach(m => {
      if (m.requires === mod.id && isSelected(m.id)) delete selections[m.id]
    })
  } else {
    selections[mod.id] = { billingCycle: 'monthly', limitCount: 1 }
  }
}

const goToStep2 = () => { if (selectedModules.value.length > 0) currentStep.value = 2 }
const goToStep3 = () => {
  currentStep.value = 3
  // TODO: POST /subscriptions
}

const resetAndRestart = () => {
  Object.keys(selections).forEach(k => delete selections[Number(k)])
  currentStep.value = 1
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>