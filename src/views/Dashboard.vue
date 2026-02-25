<template>
  <div class="space-y-8">
    <section>
      <h1 class="text-xl font-semibold mb-4">Vue globale</h1>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-lg border bg-white p-6 shadow-sm">
          <h2 class="text-sm font-medium text-gray-500">Total hôtels</h2>
          <p class="mt-2 text-3xl font-semibold">128</p>
        </div>
        <div class="rounded-lg border bg-white p-6 shadow-sm">
          <h2 class="text-sm font-medium text-gray-500">MRR</h2>
          <p class="mt-2 text-3xl font-semibold">€42 500</p>
        </div>
        <div class="rounded-lg border bg-white p-6 shadow-sm">
          <h2 class="text-sm font-medium text-gray-500">Renouvellement</h2>
          <p class="mt-2 text-3xl font-semibold">93%</p>
        </div>
      </div>
    </section>
    <section class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-lg border bg-white p-6 shadow-sm">
        <h3 class="font-medium mb-3">Licences expirant sous 30 jours</h3>
        <ul class="divide-y">
          <li class="py-2 flex items-center justify-between">
            <span>Hôtel Royal</span><span class="text-sm text-red-600">J-14</span>
          </li>
          <li class="py-2 flex items-center justify-between">
            <span>Sunset Resort</span><span class="text-sm text-red-600">J-21</span>
          </li>
          <li class="py-2 flex items-center justify-between">
            <span>Oasis</span><span class="text-sm text-amber-600">J-28</span>
          </li>
        </ul>
      </div>
      <div class="rounded-lg border bg-white p-6 shadow-sm">
        <h3 class="font-medium mb-3">Activations récentes</h3>
        <ul class="space-y-2">
          <li class="text-sm">Hôtel Royal a activé Application Mobile</li>
          <li class="text-sm">LakeView a activé Channel Manager</li>
          <li class="text-sm">Oasis a augmenté quota POS</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
