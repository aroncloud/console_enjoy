<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold">Support & Technique</h1>
    <section class="rounded-lg border bg-white p-4">
      <h2 class="font-medium mb-3">Se connecter en tant que</h2>
      <div class="flex items-center gap-3">
        <input v-model="tenant" placeholder="Tenant ID" class="rounded border px-3 py-2" />
        <button class="rounded border px-3 py-2 hover:bg-gray-50" @click="impersonate">Ouvrir le dashboard</button>
      </div>
    </section>
    <section class="rounded-lg border bg-white p-4">
      <h2 class="font-medium mb-3">Logs d’erreurs</h2>
      <ul class="divide-y">
        <li class="py-2 text-sm" v-for="l in logs" :key="l.id">
          <span class="text-red-600">{{ l.service }}</span> — {{ l.message }}
        </li>
      </ul>
    </section>
    <section class="rounded-lg border bg-white p-4">
      <h2 class="font-medium mb-3">Gestion des versions</h2>
      <div class="flex items-center gap-3">
        <select v-model="version" class="rounded border px-3 py-2">
          <option>stable</option>
          <option>beta</option>
          <option>canary</option>
        </select>
        <button class="rounded border px-3 py-2 hover:bg-gray-50" @click="applyVersion">Appliquer</button>
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
