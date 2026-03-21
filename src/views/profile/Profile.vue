<script setup lang="ts">
import { computed, ref } from 'vue'
import { KeyRound, User as UserIcon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

import ButtonComponent from '../../components/Button/ButtonComponent.vue'
import { useAuthStore } from '../../composables/useAuth'
import { useToastStore } from '../../composables/toast'
import { requestPasswordReset } from '../../servicesAPI/auth'

const authStore = useAuthStore()
const toastStore = useToastStore()
const { t } = useI18n()

const saving = ref(false)

const displayName = computed(() => authStore.user?.fullName ?? authStore.user?.username ?? '—')
const userEmail = computed(() => authStore.user?.email ?? '—')
const roleName = computed(() => authStore.user?.role?.roleName ?? '—')

const initials = computed(() =>
  displayName.value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w: string) => (w[0]?.toUpperCase() ?? ''))
    .join('')
    .slice(0, 2) || 'U'
)

const resetMyPassword = async () => {
  const email = authStore.user?.email
  if (!email) return
  saving.value = true
  try {
    await requestPasswordReset({ email })
    toastStore.show({ type: 'success', message: t('users.toast.resetSent', { email }) })
  } catch (e) {
    console.error(e)
    toastStore.show({ type: 'error', message: t('users.toast.resetError') })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-dvh space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ t('profile.title') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-300 mt-1">{{ t('profile.subtitle') }}</p>
      </div>
      <ButtonComponent variant="secondary" :iconLeft="KeyRound" :loading="saving" @click="resetMyPassword">
        {{ t('profile.resetPassword') }}
      </ButtonComponent>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <span class="text-lg font-bold text-purple-700 dark:text-purple-200">{{ initials }}</span>
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-slate-900 dark:text-white truncate">{{ displayName }}</p>
          <p class="text-sm text-slate-500 dark:text-slate-300 truncate">{{ userEmail }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
        <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <p class="text-xs text-slate-400 dark:text-slate-400">{{ t('users.fields.role') }}</p>
          <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">{{ roleName }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <p class="text-xs text-slate-400 dark:text-slate-400">{{ t('users.fields.email') }}</p>
          <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">{{ userEmail }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-400 dark:text-slate-400">{{ t('profile.account') }}</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">{{ t('profile.connected') }}</p>
          </div>
          <UserIcon class="w-5 h-5 text-slate-400 dark:text-slate-300" />
        </div>
      </div>
    </div>
  </div>
</template>
