<template>
  <div class="min-h-screen grid place-items-center">
    <div class="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm">
      <h1 class="text-lg font-semibold mb-4">Connexion Console</h1>
      <form @submit.prevent="onSubmit" class="space-y-3">
        <div>
          <label class="block text-sm mb-1">Rôle</label>
          <select v-model="role" class="w-full rounded border px-3 py-2">
            <option value="super-admin">Super-Admin</option>
            <option value="support">Support/Technique</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        <div>
          <label class="block text-sm mb-1">Code 2FA</label>
          <input v-model="code" type="text" placeholder="••••" class="w-full rounded border px-3 py-2" />
        </div>
        <button class="w-full rounded bg-black text-white px-3 py-2">Se connecter</button>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
const role = ref<'super-admin' | 'support' | 'commercial'>('super-admin')
const code = ref('')
const router = useRouter()
const { login } = useAuth()
const onSubmit = async () => {
  const ok = await login(role.value, code.value)
  if (ok) router.push('/')
}
</script>
<style scoped></style>
