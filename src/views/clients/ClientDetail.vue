<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ hotel.name }}</h1>
        <p class="text-sm text-gray-500">Tenant: {{ hotel.id }}</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm capitalize" :class="statusClass(hotel.status)">{{ hotel.status }}</span>
        <select v-model="hotel.status" class="rounded border px-2 py-1 text-sm">
          <option value="actif">Actif</option>
          <option value="suspendu">Suspendu</option>
          <option value="maintenance">Maintenance</option>
          <option value="démo">Démo</option>
        </select>
      </div>
    </div>

    <section class="grid gap-6 md:grid-cols-2">
      <div class="rounded-lg border bg-white p-4">
        <h2 class="font-medium mb-3">Licences</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-sm">PMS</label>
            <div class="flex items-center gap-3">
              <input type="checkbox" v-model="licenses.pms.enabled" />
              <input type="number" v-model.number="licenses.pms.rooms" class="w-20 rounded border px-2 py-1 text-sm" />
            </div>
          </div>
          <div class="flex items-center justify-between">
            <label class="text-sm">POS</label>
            <div class="flex items-center gap-3">
              <input type="checkbox" v-model="licenses.pos.enabled" />
              <input type="number" v-model.number="licenses.pos.terminals" class="w-20 rounded border px-2 py-1 text-sm" />
            </div>
          </div>
          <div class="flex items-center justify-between">
            <label class="text-sm">Channel Manager</label>
            <div class="flex items-center gap-3">
              <input type="checkbox" v-model="licenses.cm.enabled" />
              <select v-model="licenses.cm.otas" multiple class="rounded border px-2 py-1 text-sm">
                <option>Booking</option>
                <option>Expedia</option>
                <option>Airbnb</option>
                <option>Agoda</option>
              </select>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <label class="text-sm">Application Mobile</label>
            <input type="checkbox" v-model="licenses.mobile.enabled" />
          </div>
          <div class="flex items-center justify-between">
            <label class="text-sm">Quota Staff</label>
            <input type="number" v-model.number="licenses.staff.quota" class="w-20 rounded border px-2 py-1 text-sm" />
          </div>
          <div class="flex items-center justify-between">
            <label class="text-sm">Guest App</label>
            <input type="checkbox" v-model="licenses.guest.enabled" />
          </div>
        </div>
      </div>
      <div class="rounded-lg border bg-white p-4">
        <h2 class="font-medium mb-3">Actions</h2>
        <div class="space-y-2">
          <button class="rounded border px-3 py-2 text-sm hover:bg-gray-50" @click="save">Enregistrer</button>
          <RouterLink to="/support" class="rounded border px-3 py-2 text-sm hover:bg-gray-50 inline-block">Support</RouterLink>
          <RouterLink to="/billing" class="rounded border px-3 py-2 text-sm hover:bg-gray-50 inline-block">Billing</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { useRoute } from 'vue-router'
type Status = 'actif' | 'suspendu' | 'maintenance' | 'démo'
const route = useRoute()
const hotel = reactive({ id: String(route.params.id || 'royal-001'), name: 'Hôtel Royal', status: 'actif' as Status })
const licenses = reactive({
  pms: { enabled: true, rooms: 50 },
  pos: { enabled: false, terminals: 2 },
  cm: { enabled: true, otas: ['Booking'] as string[] },
  mobile: { enabled: false },
  staff: { quota: 5 },
  guest: { enabled: false },
})
const save = () => {
  alert('Enregistré')
}
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
