<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold">Sécurité</h1>
    <section class="rounded-lg border bg-white p-4">
      <h2 class="font-medium mb-3">Kill-Switch</h2>
      <div class="flex items-center gap-3">
        <input v-model="tenant" placeholder="Tenant ID" class="rounded border px-3 py-2" />
        <button class="rounded border px-3 py-2 bg-red-600 text-white hover:bg-red-700" @click="kill">Suspendre accès API</button>
      </div>
      <p class="text-sm text-gray-600 mt-2">Usage: non-paiement prolongé ou incident de sécurité.</p>
    </section>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const tenant = ref('')
const kill = () => {
  alert('Accès API suspendus pour ' + tenant.value)
}
</script>
<style scoped></style>
