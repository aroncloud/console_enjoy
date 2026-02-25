<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Parc client</h1>
      <input v-model="q" placeholder="Rechercher..." class="rounded border px-3 py-2" />
    </div>
    <div class="overflow-auto rounded border bg-white">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-3 py-2 text-left font-medium">Nom</th>
            <th class="px-3 py-2 text-left font-medium">Tenant ID</th>
            <th class="px-3 py-2 text-left font-medium">Statut</th>
            <th class="px-3 py-2 text-left font-medium"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in filtered" :key="h.id" class="border-t">
            <td class="px-3 py-2">{{ h.name }}</td>
            <td class="px-3 py-2">{{ h.id }}</td>
            <td class="px-3 py-2 capitalize" :class="statusClass(h.status)">{{ h.status }}</td>
            <td class="px-3 py-2 text-right">
              <RouterLink :to="`/clients/${h.id}`" class="rounded border px-3 py-1 hover:bg-gray-50">Ouvrir</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
type Status = 'actif' | 'suspendu' | 'maintenance' | 'démo'
type Hotel = { id: string; name: string; status: Status }
const q = ref('')
const hotels = ref<Hotel[]>([
  { id: 'royal-001', name: 'Hôtel Royal', status: 'actif' },
  { id: 'sunset-002', name: 'Sunset Resort', status: 'démo' },
  { id: 'oasis-003', name: 'Oasis', status: 'maintenance' },
])
const filtered = computed(() =>
  hotels.value.filter((h) => h.name.toLowerCase().includes(q.value.toLowerCase()) || h.id.includes(q.value)),
)
const statusClass = (s: Status) =>
  s === 'actif'
    ? 'text-green-600'
    : s === 'suspendu'
      ? 'text-red-600'
      : s === 'maintenance'
        ? 'text-amber-600'
        : 'text-blue-600'
</script>
<style scoped></style>
