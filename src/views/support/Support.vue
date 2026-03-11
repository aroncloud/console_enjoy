<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-slate-900 dark:text-white">Support & Technique</h1>
    <section class="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <h2 class="font-medium mb-3 text-slate-900 dark:text-white">Se connecter en tant que</h2>
      <div class="flex items-center gap-3">
        <input v-model="tenant" placeholder="Tenant ID" class="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400" />
        <button class="rounded border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800" @click="impersonate">Ouvrir le dashboard</button>
      </div>
    </section>
    <section class="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <h2 class="font-medium mb-3 text-slate-900 dark:text-white">Logs d’erreurs</h2>
      <ul class="divide-y divide-slate-200 dark:divide-slate-800">
        <li class="py-2 text-sm text-slate-700 dark:text-slate-200" v-for="l in logs" :key="l.id">
          <span class="text-red-600">{{ l.service }}</span> — {{ l.message }}
        </li>
      </ul>
    </section>
    <section class="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <h2 class="font-medium mb-3 text-slate-900 dark:text-white">Gestion des versions</h2>
      <div class="flex items-center gap-3">
        <select v-model="version" class="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white">
          <option>stable</option>
          <option>beta</option>
          <option>canary</option>
        </select>
        <button class="rounded border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800" @click="applyVersion">Appliquer</button>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const tenant = ref('')
const version = ref('stable')
const logs = ref([
  { id: 1, service: 'Channel Manager', message: 'Connexion échouée à Booking' },
  { id: 2, service: 'POS', message: 'Synchronisation article KO' },
])
const impersonate = () => {
  alert('Ouverture du dashboard pour ' + tenant.value)
}
const applyVersion = () => {
  alert('Version ' + version.value + ' assignée')
}
</script>
<style scoped></style>
