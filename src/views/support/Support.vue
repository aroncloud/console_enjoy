<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-slate-900 dark:text-white">{{ t('support.title') }}</h1>
    <section class="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <h2 class="font-medium mb-3 text-slate-900 dark:text-white">{{ t('support.impersonate.title') }}</h2>
      <div class="flex items-center gap-3">
        <input v-model="tenant" :placeholder="t('support.impersonate.tenantPlaceholder')" class="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400" />
        <button class="rounded border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800" @click="impersonate">{{ t('support.impersonate.openDashboard') }}</button>
      </div>
    </section>
    <section class="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <h2 class="font-medium mb-3 text-slate-900 dark:text-white">{{ t('support.logs.title') }}</h2>
      <ul class="divide-y divide-slate-200 dark:divide-slate-800">
        <li class="py-2 text-sm text-slate-700 dark:text-slate-200" v-for="l in logs" :key="l.id">
          <span class="text-red-600">{{ l.service }}</span> — {{ l.message }}
        </li>
      </ul>
    </section>
    <section class="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <h2 class="font-medium mb-3 text-slate-900 dark:text-white">{{ t('support.versions.title') }}</h2>
      <div class="flex items-center gap-3">
        <select v-model="version" class="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white">
          <option value="stable">{{ t('support.versions.stable') }}</option>
          <option value="beta">{{ t('support.versions.beta') }}</option>
          <option value="canary">{{ t('support.versions.canary') }}</option>
        </select>
        <button class="rounded border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800" @click="applyVersion">{{ t('common.apply') }}</button>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const tenant = ref('')
const version = ref('stable')
const logs = ref([
  { id: 1, service: 'Channel Manager', message: 'Connexion échouée à Booking' },
  { id: 2, service: 'POS', message: 'Synchronisation article KO' },
])
const impersonate = () => {
  alert(t('support.impersonate.alert', { tenant: tenant.value }))
}
const applyVersion = () => {
  alert(t('support.versions.alert', { version: version.value }))
}
</script>
<style scoped></style>
