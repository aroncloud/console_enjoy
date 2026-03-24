<template>
  <div class="min-h-dvh bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
    <div class="w-full max-w-md text-center">

      <!-- Icône -->
      <div class="flex justify-center mb-6">
        <div class="relative">
          <div class="w-24 h-24 rounded-3xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-center">
            <ShieldOff :size="40" class="text-red-400 dark:text-red-500" />
          </div>
          <div class="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
            <X :size="14" class="text-white" stroke-width="3" />
          </div>
        </div>
      </div>

      <!-- Code -->
      <p class="text-xs font-bold tracking-widest uppercase text-red-400 dark:text-red-500 mb-2">
        {{ t('errors.forbidden.code', { code: 403 }) }}
      </p>

      <!-- Titre -->
      <h1 class="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
        {{ t('errors.forbidden.title') }}
      </h1>

      <!-- Description -->
      <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
        {{ t('errors.forbidden.description') }}
      </p>
      <p class="text-xs text-slate-400 dark:text-slate-500 mb-8">
        {{ t('errors.forbidden.hint') }}
      </p>

      <!-- Permission manquante si disponible -->
      <div v-if="requiredPermission" class="mb-8 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-left">
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{{ t('errors.forbidden.requiredPermission') }}</p>
        <code class="text-xs font-mono text-purple-600 dark:text-purple-400">{{ requiredPermission }}</code>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          @click="goBack"
          class="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft :size="15" />
          {{ t('common.back') }}
        </button>
        <button
          @click="goHome"
          class="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-bold hover:bg-purple-600 transition-colors shadow-sm"
        >
          <LayoutDashboard :size="15" />
          {{ t('nav.dashboard') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ShieldOff, X, ArrowLeft, LayoutDashboard } from 'lucide-vue-next'

const router = useRouter()
const route  = useRoute()
const { t } = useI18n()

const requiredPermission = computed(() => route.query.permission as string | undefined)

const goBack = () => router.back()
const goHome = () => router.push({ name: 'dashboard' })
</script>
