<template>
  <div class="min-h-screen grid grid-cols-12">
    <aside class="col-span-2 border-r bg-white">
      <div class="p-4 text-lg font-semibold">Enjoy Console</div>
      <nav class="px-2 space-y-1">
        <RouterLink class="block rounded px-3 py-2 hover:bg-gray-100" to="/">Dashboard</RouterLink>
        <RouterLink class="block rounded px-3 py-2 hover:bg-gray-100" to="/clients">Clients</RouterLink>
        <RouterLink class="block rounded px-3 py-2 hover:bg-gray-100" to="/support">Support</RouterLink>
        <RouterLink class="block rounded px-3 py-2 hover:bg-gray-100" to="/billing">Billing</RouterLink>
        <RouterLink class="block rounded px-3 py-2 hover:bg-gray-100" to="/security">Sécurité</RouterLink>
      </nav>
    </aside>
    <div class="col-span-10">
      <header class="border-b bg-white">
        <div class="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <div class="text-sm text-gray-600">Console d’administration</div>
          <div class="flex items-center gap-4">
            <span class="text-xs text-gray-500 capitalize">{{ role || 'invité' }}</span>
            <button class="rounded border px-3 py-1 text-sm hover:bg-gray-50" @click="logout">Déconnexion</button>
          </div>
        </div>
      </header>
      <main class="mx-auto max-w-7xl p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAuth } from '../../composables/useAuth'
import { computed } from 'vue'
const { state, logout: doLogout } = useAuth()
const role = computed(() => state.role)
const logout = () => doLogout()
</script>
<style scoped></style>
