<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold">Facturation</h1>
    <section class="rounded-lg border bg-white p-4">
      <h2 class="font-medium mb-3">Historique des paiements</h2>
      <ul class="divide-y">
        <li class="py-2 flex items-center justify-between text-sm" v-for="p in payments" :key="p.id">
          <span>{{ p.date }} — {{ p.label }}</span>
          <span class="font-medium">€{{ p.amount }}</span>
        </li>
      </ul>
    </section>
    <section class="rounded-lg border bg-white p-4">
      <h2 class="font-medium mb-3">Offrir un mois gratuit</h2>
      <div class="flex items-center gap-3">
        <select v-model="module" class="rounded border px-3 py-2">
          <option>PMS</option>
          <option>POS</option>
          <option>Channel Manager</option>
          <option>Application Mobile</option>
        </select>
        <button class="rounded border px-3 py-2 hover:bg-gray-50" @click="grant">Offrir</button>
      </div>
    </section>
    <section class="rounded-lg border bg-white p-4">
      <h2 class="font-medium mb-3">Calculateur de quotas</h2>
      <div class="flex items-center gap-3">
        <input v-model.number="rooms" type="number" placeholder="Chambres" class="w-24 rounded border px-2 py-2" />
        <input v-model.number="pos" type="number" placeholder="POS" class="w-24 rounded border px-2 py-2" />
        <button class="rounded border px-3 py-2 hover:bg-gray-50" @click="calc">Calculer</button>
      </div>
      <p class="text-sm text-gray-600 mt-2">{{ result }}</p>
    </section>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const payments = ref([
  { id: 1, date: '2026-02-01', label: 'Royal — Abonnement', amount: 350 },
  { id: 2, date: '2026-01-01', label: 'Royal — Abonnement', amount: 350 },
])
const module = ref('PMS')
const rooms = ref(50)
const pos = ref(2)
const result = ref('')
const grant = () => {
  alert('1 mois gratuit appliqué sur ' + module.value)
}
const calc = () => {
  const extra = Math.max(0, rooms.value - 60) * 2 + Math.max(0, pos.value - 3) * 10
  result.value = extra ? 'Dépassement détecté: €' + extra + ' à facturer.' : 'Aucun dépassement.'
}
</script>
<style scoped></style>
