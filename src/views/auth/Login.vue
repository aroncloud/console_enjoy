<template>
  <div class="h-screen flex font-sans overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">

    <!--  LEFT PANEL -->
    <div class="w-full lg:w-1/2 flex flex-col bg-white dark:bg-slate-950 px-12 py-8 h-full overflow-hidden">

      <!-- <div class="flex items-center gap-2.5 shrink-0">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100">
          
          <img src="/src/assets/LogoEnjoy.png" alt="Logo EnjoyConsole" class="w-6 h-6"/>
        </div>
        <span class="text-lg font-bold text-gray-900 tracking-tight">EnjoyConsole</span>
      </div> -->

      <div class="flex items-center justify-end shrink-0">
        <button
          type="button"
          @click="toggleTheme"
          class="relative inline-flex h-9 w-16 items-center rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-1 transition-colors cursor-pointer"
          :aria-label="t('common.toggleTheme')"
        >
          <span
            class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow transition-transform"
            :class="isDark ? 'translate-x-7' : 'translate-x-0'"
          >
            <Moon v-if="isDark" class="w-4 h-4 text-slate-300" />
            <Sun v-else class="w-4 h-4 text-amber-500" />
          </span>
        </button>
      </div>
 
      <!-- Form area -->
      <div class="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">

        <!-- ── ACCOUNT PICKER ── -->
        <div v-if="accountPickerMode && !selectedAccount && !resetMode && !emailVerificationRequired">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1.5">{{ t('auth.login.welcomeBack') }}</h1>
          <p class="text-gray-500 dark:text-slate-400 text-sm mb-6">{{ t('auth.login.pickAccount') }}</p>
          <div class="space-y-2.5 mb-4">
            <button
              v-for="acc in rememberedAccounts"
              :key="acc.id ?? acc.email"
              type="button"
              @click="selectAccount(acc)"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-slate-900 transition-all text-left"
            >
              <div class="h-9 w-9 rounded-full bg-purple-600 text-white flex items-center justify-center uppercase text-sm font-bold shrink-0">
                {{ (acc.name || acc.email).slice(0, 1) }}
              </div>
              <div>
                <div class="text-sm font-semibold text-gray-800 dark:text-white">{{ acc.name || acc.email }}</div>
                <div class="text-xs text-gray-500 dark:text-slate-400">{{ acc.email }}</div>
              </div>
            </button>
          </div>
          <button type="button" @click="useAnotherAccount" class="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors">
            {{ t('auth.login.useAnotherAccount') }} →
          </button>
        </div>

        <!-- ── LOGIN FORM ── -->
        <div v-else-if="!resetMode && !emailVerificationRequired">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1.5">{{ t('auth.login.title') }}</h1>
          <p class="text-gray-500 dark:text-slate-400 text-sm mb-6">{{ t('auth.login.subtitle') }}</p>

          <!-- Error -->
          <div v-if="error" class="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-4">
            <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 5v3.5M8 11h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span class="text-xs text-red-600 leading-relaxed">{{ error }}</span>
          </div>

          <!-- Selected account chip -->
          <div v-if="selectedAccount" class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 mb-4">
            <div class="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center uppercase text-sm font-bold shrink-0">
              {{ (selectedAccount.name || selectedAccount.email).slice(0, 1) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-gray-800 dark:text-white truncate">{{ selectedAccount.name || selectedAccount.email }}</div>
              <div class="text-xs text-gray-500 dark:text-slate-400 truncate">{{ selectedAccount.email }}</div>
            </div>
            <button type="button" @click="useAnotherAccount" class="text-xs text-purple-600 hover:text-purple-800 shrink-0 font-medium">{{ t('common.change') }}</button>
          </div>

          <!-- Email -->
          <div v-if="!selectedAccount" class="mb-3.5">
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{{ t('auth.fields.email') }}</label>
            <input
              v-model="email"
              type="email"
              placeholder="admin@enjoy-pms.com"
              autocomplete="username"
              required
              :disabled="isLoading"
              class="w-full px-4 py-2.5 text-sm text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none placeholder-gray-400 dark:placeholder:text-slate-400
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <!-- Password -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('auth.fields.password') }}</label>
              <button type="button" :disabled="isLoading" @click="toggleResetMode"
                class="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors disabled:opacity-50">
                {{ t('auth.login.forgotPassword') }}
              </button>
            </div>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                required
                :disabled="isLoading"
                class="w-full px-4 pr-11 py-2.5 text-sm text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none placeholder-gray-400 dark:placeholder:text-slate-400
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all
                       focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors">
                <svg v-if="!showPassword" class="w-5 h-5" viewBox="0 0 20 20" fill="none">
                  <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <svg v-else class="w-5 h-5" viewBox="0 0 20 20" fill="none">
                  <path d="M3 3l14 14M8.5 8.6A2.5 2.5 0 0012.4 12M6.3 6.4C4.6 7.5 3.3 8.9 2 10s3 6 8 6a9 9 0 003.7-.8M10 4c5 0 8 6 8 6a14.6 14.6 0 01-2.3 2.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember me -->
          <label class="flex items-center gap-2.5 cursor-pointer select-none mb-5" :class="isLoading ? 'opacity-50 pointer-events-none' : ''">
            <div class="relative">
              <input v-model="keepLoggedIn" type="checkbox" class="sr-only" />
              <div class="h-4 w-4 rounded border flex items-center justify-center transition-colors"
                :class="keepLoggedIn ? 'bg-purple-600 border-purple-600' : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700'">
                <svg v-if="keepLoggedIn" class="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 5L4 7.5 8.5 2.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <span class="text-sm text-gray-600 dark:text-slate-300">{{ t('auth.login.rememberMe') }}</span>
          </label>

          <!-- Submit -->
          <button
            type="button"
            @click.prevent="handleSubmit"
            :disabled="isLoading"
            class="w-full py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800
                   disabled:opacity-60 disabled:cursor-not-allowed
                   text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer
                   flex items-center justify-center gap-2 shadow-sm shadow-purple-200"
          >
            <svg v-if="isLoading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="60" stroke-dashoffset="15"/>
            </svg>
            {{ isLoading ? t('auth.login.signingIn') : t('auth.login.signIn') }}
          </button>

          <p class="mt-4 text-center text-xs text-gray-400 dark:text-slate-500">{{ t('auth.login.restricted') }}</p>
        </div>

        <!-- ── RESET PASSWORD ── -->
        <div v-if="resetMode">
          <button type="button" @click="toggleResetMode" class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            {{ t('common.back') }}
          </button>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1.5">{{ t('auth.reset.title') }}</h1>
          <p class="text-gray-500 dark:text-slate-400 text-sm mb-6">{{ t('auth.reset.subtitle') }}</p>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{{ t('auth.fields.email') }}</label>
            <input
              v-model="resetEmail"
              type="email"
              placeholder="admin@enjoy-pms.com"
              :disabled="isVerifyingReset || resetSent"
              class="w-full px-4 py-2.5 text-sm text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none placeholder-gray-400 dark:placeholder:text-slate-400
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>
          <div v-if="resetVerifyError || resetSendError" class="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-3">
            <svg class="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 5v3.5M8 11h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span class="text-xs text-red-600">{{ resetVerifyError || resetSendError }}</span>
          </div>
          <div v-if="resetSent" class="p-3.5 rounded-xl bg-green-50 border border-green-200 mb-4">
            <p class="text-sm text-green-700 flex items-center gap-2">
              <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              {{ t('auth.reset.sent') }}
            </p>
          </div>
          <div class="flex gap-3">
            <button v-if="!resetSent" type="button" @click="sendAdminResetLink" :disabled="isVerifyingReset || !resetEmail"
              class="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white bg-purple-600 hover:bg-purple-700
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              <svg v-if="isVerifyingReset" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="60" stroke-dashoffset="15"/>
              </svg>
              {{ isVerifyingReset ? t('auth.reset.sending') : t('auth.reset.sendLink') }}
            </button>
            <button type="button" @click="backToLogin" class="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
              {{ resetSent ? t('auth.reset.backToLogin') : t('common.cancel') }}
            </button>
          </div>
        </div>

        <!-- ── EMAIL VERIFICATION ── -->
        <div v-if="emailVerificationRequired">
          <button type="button" @click="backToLogin" class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            {{ t('common.back') }}
          </button>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1.5">{{ t('auth.verify.title') }}</h1>
          <p class="text-gray-500 dark:text-slate-400 text-sm mb-1">{{ t('auth.verify.subtitle') }}</p>
          <p class="text-base font-semibold text-gray-800 dark:text-white mb-6">{{ verificationEmail }}</p>
          <div class="space-y-2.5">
            <button type="button" @click="resendVerificationEmail" :disabled="isResendingVerification"
              class="w-full py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700
                     disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-2">
              <svg v-if="isResendingVerification" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="60" stroke-dashoffset="15"/>
              </svg>
              {{ isResendingVerification ? t('auth.verify.sending') : t('auth.verify.resend') }}
            </button>
            <button type="button" @click="backToLogin" class="w-full py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
              {{ t('auth.reset.backToLogin') }}
            </button>
          </div>
          <p v-if="resendVerificationError" class="text-xs text-red-600 mt-3">{{ resendVerificationError }}</p>
          <div v-if="verificationResent" class="mt-3 p-3 rounded-xl bg-green-50 border border-green-200">
            <p class="text-xs text-green-700 flex items-center gap-2">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              {{ t('auth.verify.resent') }}
            </p>
          </div>
          <p class="text-xs text-gray-400 dark:text-slate-500 mt-3">{{ t('auth.verify.checkSpam') }}</p>
        </div>

      </div>

      <!-- Footer -->
      <!-- <div class="shrink-0 pt-4 flex items-center justify-between text-xs text-gray-400">
        <span>© 2026 EnjoyConsole Inc.</span>
        <div class="flex items-center gap-4">
          <a href="#" class="hover:text-gray-600 transition-colors">CGU</a>
          <a href="#" class="hover:text-gray-600 transition-colors">Confidentialité</a>
        </div>
      </div> -->
    </div>

    <!--  RIGHT PANEL -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-purple-50 dark:bg-slate-900 h-full">

      <!-- Top accent bar -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-purple-600"></div>

      <!-- Circle decorations -->
      <div class="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full border border-purple-200 opacity-60"></div>
      <div class="absolute -top-10 -right-10 w-[320px] h-[320px] rounded-full border border-purple-300 opacity-40"></div>
      <div class="absolute bottom-0 -left-20 w-[300px] h-[300px] rounded-full border border-purple-200 opacity-50"></div>

      <!-- Content -->
      <div class="relative flex flex-col justify-center px-16 py-12 w-full">

        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-xs font-semibold text-purple-700 mb-8 w-fit">
          <div class="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
          {{ t('auth.marketing.badge') }}
        </div>

        <!-- Headline -->
        <h2 class="text-4xl font-extrabold text-gray-900 leading-tight mb-4">
          {{ t('auth.marketing.headlineLine1') }}<br/>
          <span class="text-purple-600">{{ t('auth.marketing.headlineLine2') }}</span>
        </h2>

        <!-- Sub -->
        <p class="text-gray-500 text-base leading-relaxed mb-10 max-w-sm">
          {{ t('auth.marketing.description') }}
        </p>

        <!-- Feature list -->
        <div class="space-y-3.5">
          <div v-for="f in features" :key="f.label" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-white border border-purple-200 flex items-center justify-center shrink-0 shadow-sm">
              <svg class="w-4 h-4 text-purple-600" viewBox="0 0 20 20" fill="none" v-html="f.icon"></svg>
            </div>
            <span class="text-sm text-gray-700 font-medium">{{ f.label }}</span>
          </div>
        </div>

        <!-- Divider -->
        <div class="mt-10 pt-6 border-t border-purple-200">
          <p class="text-xs text-gray-400 flex items-center gap-2">
            <svg class="w-3.5 h-3.5 text-purple-400" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L3 4.5v4C3 11.5 5.5 14 8 15c2.5-1 5-3.5 5-6.5v-4L8 2Z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M5.5 8l2 2 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ t('auth.marketing.securityLine') }}
          </p>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Sun, Moon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../composables/useAuth'
import { useThemeStore } from '../../composables/theme'
import { auth, resendEmailVerification, requestPasswordReset } from '../../servicesAPI/auth'
import api from '../../servicesAPI/api'
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const theme = useThemeStore()
const isDark = computed(() => theme.isDark)

const toggleTheme = () => { theme.toggle() }

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const keepLoggedIn = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)

type RememberedAccount = { id?: number | string; name?: string; email: string }
const rememberedAccounts = ref<RememberedAccount[]>([])
const accountPickerMode = ref(false)
const selectedAccount = ref<RememberedAccount | null>(null)
const resetMode = ref(false)
const resetEmail = ref('')
const resetVerifyError = ref<string | null>(null)
const resetSendError = ref<string | null>(null)
const isVerifyingReset = ref(false)
const resetSent = ref(false)

const emailVerificationRequired = ref(false)
const verificationEmail = ref('')
const isResendingVerification = ref(false)
const verificationResent = ref(false)
const resendVerificationError = ref<string | null>(null)

const loginAttempts = ref(0)

const features = computed(() => [
  {
    label: t('auth.marketing.features.activity'),
    icon: '<polyline points="2 12 6 8 10 12 14 6 18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  {
    label: t('auth.marketing.features.subscriptions'),
    icon: '<rect x="2" y="5" width="16" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M2 9h16" stroke="currentColor" stroke-width="1.5"/><circle cx="6" cy="13" r="1" fill="currentColor"/>',
  },
  {
    label: t('auth.marketing.features.modules'),
    icon: '<rect x="2" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="11" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/><path d="M14.5 11v7M11 14.5h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  },
  {
    label: t('auth.marketing.features.insights'),
    icon: '<rect x="2" y="12" width="4" height="6" rx="1" fill="currentColor" opacity=".3"/><rect x="8" y="7" width="4" height="11" rx="1" fill="currentColor" opacity=".6"/><rect x="14" y="3" width="4" height="15" rx="1" fill="currentColor"/>',
  },
])

function setCookie(name: string, value: string, options?: { days?: number; secure?: boolean; sameSite?: 'Lax' | 'Strict' | 'None'; path?: string }) {
  let expires = ''
  if (options?.days) {
    const d = new Date()
    d.setTime(d.getTime() + options.days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + d.toUTCString()
  }
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=${options?.path ?? '/'}${options?.sameSite ? '; samesite=' + options.sameSite : ''}${options?.secure ? '; secure' : ''}`
}

function getCookie(name: string): string | null {
  const nameEQ = encodeURIComponent(name) + '='
  for (let c of document.cookie.split(';')) {
    c = c.trim()
    if (c.startsWith(nameEQ)) return decodeURIComponent(c.substring(nameEQ.length))
  }
  return null
}

onMounted(() => {
  try {
    let raw = getCookie('console_rememberedAccounts')  
    const ls = localStorage.getItem('console_rememberedAccounts')  
    if (!raw && ls) {
      setCookie('console_rememberedAccounts', ls, { days: 30, secure: location.protocol === 'https:', sameSite: 'Lax' })  
      localStorage.removeItem('console_rememberedAccounts')  
      raw = ls
    }
    const list = raw ? (JSON.parse(raw) as RememberedAccount[]) : []
    rememberedAccounts.value = Array.isArray(list) ? list : []
    if (rememberedAccounts.value.length > 0 && !authStore.isAuthenticated) accountPickerMode.value = true
  } catch {
    rememberedAccounts.value = []
  }
})

const selectAccount = (acc: RememberedAccount) => { selectedAccount.value = acc; email.value = acc.email; accountPickerMode.value = false }
const useAnotherAccount = () => { selectedAccount.value = null; accountPickerMode.value = false; email.value = '' }

const handleSubmit = async () => {
  error.value = null
  loginAttempts.value++

  if (!email.value.trim() || !password.value.trim()) {
    error.value = t('auth.errors.emailPasswordRequired')
    return
  }

  isLoading.value = true

  try {
    const res = await auth({ email: email.value.trim().toLowerCase(), password: password.value, keepLoggedIn: keepLoggedIn.value })

    const { user, access_token } = res.data.data
    const token = access_token.token

    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    authStore.login(user, token)
    authStore.setRoleId(user.roleId)
    authStore.setUserId(user.id ?? user.UserId)

    if (keepLoggedIn.value) {
      const entry: RememberedAccount = { id: user.id, name: user.name || user.fullName || user.username || user.email, email: user.email || email.value }
      const existing = rememberedAccounts.value.filter((a) => a.email !== entry.email)
      rememberedAccounts.value = [entry, ...existing].slice(0, 5)
      setCookie('console_rememberedAccounts', JSON.stringify(rememberedAccounts.value), { days: 30, secure: location.protocol === 'https:', sameSite: 'Lax' })  
    }

    loginAttempts.value = 0
    router.push({ path: '/' })

  } catch (err: any) {
    console.log(' Erreur status:', err.response?.status, '| data:', err.response?.data)

    if (err.response?.status === 403) {
      const data = err.response.data
      if (data?.error === 'EMAIL_NOT_VERIFIED' || data?.requiresVerification) {
        console.warn(' Email non vérifié')
        emailVerificationRequired.value = true
        verificationEmail.value = data.email || email.value
        return
      }
      error.value = t('auth.errors.forbidden')
    } else if (err.response?.status === 503) {
      error.value = t('auth.errors.serviceUnavailable')
    } else if (err.response?.status === 401) {
      error.value = t('auth.errors.invalidCredentials')
    } else if (err.response?.status === 400 && err.response.data?.message === 'Login failed') {
      error.value = t('auth.errors.loginFailed')
    } else if (err.response?.status === 400) {
      error.value = err.response.data?.message || t('auth.errors.badRequest')
    } else if (err.response?.status === 422) {
      error.value = t('auth.errors.validation')
    } else if (err.response) {
      error.value = t('auth.errors.server')
    } else if (err.request) {
      error.value = t('auth.errors.network')
    } else {
      error.value = t('common.genericError')
    }
  } finally {
    isLoading.value = false
  }
}

const sendAdminResetLink = async () => {
  resetVerifyError.value = null; resetSendError.value = null; resetSent.value = false
  if (!resetEmail.value.trim()) { resetVerifyError.value = t('auth.reset.errors.emailRequired'); return }
  isVerifyingReset.value = true
  try { await requestPasswordReset({ email: resetEmail.value.trim().toLowerCase() }); resetSent.value = true
  } catch (e: any) { resetSendError.value = e?.response?.data?.message || t('auth.reset.errors.sendFailed')
  } finally { isVerifyingReset.value = false }
}

const toggleResetMode = () => {
  resetMode.value = !resetMode.value
  if (!resetMode.value) { resetEmail.value = ''; resetVerifyError.value = null; resetSendError.value = null; isVerifyingReset.value = false; resetSent.value = false }
}

const backToLogin = () => {
  resetMode.value = false; resetEmail.value = ''; resetVerifyError.value = null; resetSendError.value = null
  isVerifyingReset.value = false; resetSent.value = false; emailVerificationRequired.value = false
  verificationEmail.value = ''; verificationResent.value = false; resendVerificationError.value = null
  email.value = ''; password.value = ''; error.value = null
}

const resendVerificationEmail = async () => {
  resendVerificationError.value = null; verificationResent.value = false; isResendingVerification.value = true
  try { await resendEmailVerification(verificationEmail.value); verificationResent.value = true
  } catch (err: any) { resendVerificationError.value = err?.response?.data?.message || t('auth.verify.errors.resendFailed')
  } finally { isResendingVerification.value = false }
}
</script>
