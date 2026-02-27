<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">

    <!-- Main -->
    <div class="flex-1 grid place-items-center px-4 py-12">
      <div class="w-full max-w-md">

        <!-- Card -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          <!-- Card header -->
          <div class="px-8 pt-8 pb-6 text-center">
            <div class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <h1 class="text-xl font-bold text-gray-900">
              {{ resetMode ? 'Réinitialiser le mot de passe' : 'Accès Console' }}
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              {{ resetMode ? 'Un lien vous sera envoyé par email' : 'Interface d\'administration sécurisée' }}
            </p>
          </div>

          <!-- Divider -->
          <div class="h-px bg-gray-100 mx-8" />

          <!-- ───────────────────────────────────── ACCOUNT PICKER ── -->
          <div
            v-if="accountPickerMode && !selectedAccount && !resetMode && !emailVerificationRequired"
            class="px-8 py-6 space-y-4"
          >
            <p class="text-sm text-gray-500">Sélectionnez un compte pour continuer</p>
            <div class="grid grid-cols-1 gap-3">
              <button
                v-for="acc in rememberedAccounts"
                :key="acc.id ?? acc.email"
                type="button"
                @click="selectAccount(acc)"
                class="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
              >
                <div class="h-9 w-9 rounded-full bg-purple-500 text-white flex items-center justify-center uppercase text-sm font-bold shrink-0">
                  {{ (acc.name || acc.email).slice(0, 1) }}
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-800">{{ acc.name || acc.email }}</div>
                  <div class="text-xs text-gray-500">{{ acc.email }}</div>
                </div>
              </button>
            </div>
            <button
              type="button"
              @click="useAnotherAccount"
              class="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              Utiliser un autre compte
            </button>
          </div>

          <!-- ─────────────────────────────────────── LOGIN FORM ──── -->
          <form
            v-else-if="!resetMode && !emailVerificationRequired"
            @submit.prevent="handleSubmit"
            class="px-8 py-6 space-y-5"
          >
            <!-- Error banner -->
            <div v-if="error" class="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg">
              <svg class="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 5v3.5M8 11h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span class="text-xs text-red-600">{{ error }}</span>
            </div>

            <!-- Selected account chip -->
            <div
              v-if="selectedAccount"
              class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50"
            >
              <div class="h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center uppercase text-sm font-bold shrink-0">
                {{ (selectedAccount.name || selectedAccount.email).slice(0, 1) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-800 truncate">{{ selectedAccount.name || selectedAccount.email }}</div>
                <div class="text-xs text-gray-500 truncate">{{ selectedAccount.email }}</div>
              </div>
              <button type="button" @click="useAnotherAccount" class="text-xs text-purple-600 hover:text-purple-800 shrink-0">
                Changer
              </button>
            </div>

            <!-- Email field -->
            <div v-if="!selectedAccount" class="space-y-1.5">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Adresse email</label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M2 7l8 5 8-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <input
                  v-model="email"
                  type="email"
                  placeholder="admin@votre-pms.com"
                  autocomplete="username"
                  required
                  :disabled="isLoading"
                  class="w-full pl-9 pr-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg
                         outline-none placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed
                         focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                />
              </div>
            </div>

            <!-- Password field -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Mot de passe</label>
                <button
                  type="button"
                  :disabled="isLoading"
                  @click="toggleResetMode"
                  class="text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 20 20" fill="none">
                  <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  required
                  :disabled="isLoading"
                  class="w-full pl-9 pr-10 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg
                         outline-none placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed
                         focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="!showPassword" class="w-4 h-4" viewBox="0 0 20 20" fill="none">
                    <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                  <svg v-else class="w-4 h-4" viewBox="0 0 20 20" fill="none">
                    <path d="M3 3l14 14M8.5 8.6A2.5 2.5 0 0012.4 12M6.3 6.4C4.6 7.5 3.3 8.9 2 10s3 6 8 6a9 9 0 003.7-.8M10 4c5 0 8 6 8 6a14.6 14.6 0 01-2.3 2.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Keep logged in -->
            <label class="flex items-center gap-2 cursor-pointer select-none" :class="isLoading ? 'opacity-50 pointer-events-none' : ''">
              <div class="relative">
                <input v-model="keepLoggedIn" type="checkbox" class="sr-only" />
                <div
                  :class="keepLoggedIn ? 'border-purple-500 bg-purple-500' : 'bg-gray-50 border-gray-200'"
                  class="h-4 w-4 rounded border flex items-center justify-center transition-colors"
                >
                  <svg v-if="keepLoggedIn" class="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L4 7.5 8.5 2.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <span class="text-xs text-gray-500">Rester connecté</span>
            </label>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed
                     text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg v-if="isLoading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="60" stroke-dashoffset="15"/>
              </svg>
              {{ isLoading ? 'Connexion…' : 'Se connecter' }}
            </button>
          </form>

          <!-- ──────────────────────────────────── RESET PASSWORD ─── -->
          <div v-if="resetMode" class="px-8 py-6 space-y-4">
            <div class="flex items-center gap-2 mb-1">
              <button type="button" @click="toggleResetMode" class="p-1 rounded hover:bg-gray-100 transition-colors">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="text-gray-600">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <span class="text-sm font-semibold text-gray-700">Réinitialisation</span>
            </div>

            <p class="text-xs text-gray-500">
              Renseignez votre adresse email. Si un compte existe, vous recevrez un lien de réinitialisation.
            </p>

            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Adresse email</label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M2 7l8 5 8-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <input
                  v-model="resetEmail"
                  type="email"
                  placeholder="admin@votre-pms.com"
                  :disabled="isVerifyingReset || resetSent"
                  class="w-full pl-9 pr-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg
                         outline-none placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed
                         focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                />
              </div>
            </div>

            <div v-if="resetVerifyError || resetSendError" class="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg">
              <svg class="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 5v3.5M8 11h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span class="text-xs text-red-600">{{ resetVerifyError || resetSendError }}</span>
            </div>

            <div v-if="resetSent" class="p-3 rounded-lg bg-green-50 border border-green-200">
              <p class="text-xs text-green-700 flex items-center gap-2">
                <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Email envoyé. Vérifiez votre boîte de réception et suivez les instructions.
              </p>
            </div>

            <div class="flex items-center gap-3 pt-1">
              <button
                v-if="!resetSent"
                type="button"
                @click="sendAdminResetLink"
                :disabled="isVerifyingReset || !resetEmail"
                class="px-4 py-2.5 text-sm font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg v-if="isVerifyingReset" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="60" stroke-dashoffset="15"/>
                </svg>
                {{ isVerifyingReset ? 'Envoi…' : 'Envoyer le lien' }}
              </button>
              <button
                type="button"
                @click="backToLogin"
                class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {{ resetSent ? 'Retour à la connexion' : 'Annuler' }}
              </button>
            </div>
          </div>

          <!-- ─────────────────────────── EMAIL VERIFICATION NEEDED ── -->
          <div v-if="emailVerificationRequired" class="px-8 py-6 space-y-4">
            <div class="flex items-center gap-2">
              <button type="button" @click="backToLogin" class="p-1 rounded hover:bg-gray-100 transition-colors">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="text-gray-600">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <span class="text-sm font-semibold text-gray-700">Vérification requise</span>
            </div>

            <div class="p-5 rounded-lg bg-purple-50 border border-purple-200">
              <div class="flex flex-col items-center text-center gap-4">
                <div class="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg class="h-7 w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-bold text-gray-800 mb-1">Vérifiez votre email</h3>
                  <p class="text-xs text-gray-500">Un email de vérification a été envoyé à</p>
                  <p class="text-sm font-semibold text-gray-800 mt-0.5">{{ verificationEmail }}</p>
                </div>
                <div class="w-full space-y-2">
                  <button
                    type="button"
                    @click="resendVerificationEmail"
                    :disabled="isResendingVerification"
                    class="w-full px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700
                           disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg v-if="isResendingVerification" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="60" stroke-dashoffset="15"/>
                    </svg>
                    {{ isResendingVerification ? 'Envoi…' : "Renvoyer l'email" }}
                  </button>
                  <button type="button" @click="backToLogin" class="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    Retour à la connexion
                  </button>
                  <p v-if="resendVerificationError" class="text-xs text-red-600">{{ resendVerificationError }}</p>
                  <div v-if="verificationResent" class="p-3 rounded-lg bg-green-50 border border-green-200">
                    <p class="text-xs text-green-700 flex items-center justify-center gap-2">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Email renvoyé avec succès.
                    </p>
                  </div>
                </div>
                <p class="text-xs text-gray-400">Vous ne trouvez pas l'email ? Vérifiez vos spams.</p>
              </div>
            </div>
          </div>

          <!-- Card footer -->
          <div class="px-8 pb-6 text-center">
            <p class="text-xs text-gray-400">
              Accès réservé au personnel autorisé.
              <a href="#" class="text-purple-600 hover:underline ml-1">Politique de sécurité</a>
            </p>
          </div>
        </div>

        <!-- Security badges -->
        <div class="flex items-center justify-center gap-4 mt-5 flex-wrap">
          <div class="flex items-center gap-1.5 text-xs text-gray-400">
            <svg class="w-3.5 h-3.5 text-green-500" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L3 4.5v4C3 11.5 5.5 14 8 15c2.5-1 5-3.5 5-6.5v-4L8 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M5.5 8l2 2 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Connexion chiffrée TLS
          </div>
          <div class="w-px h-3 bg-gray-200" />
          <div class="flex items-center gap-1.5 text-xs text-gray-400">
            <svg class="w-3.5 h-3.5 text-purple-500" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="7" width="12" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Session sécurisée
          </div>
          <div class="w-px h-3 bg-gray-200" />
          <div class="flex items-center gap-1.5 text-xs text-gray-400">
            <svg class="w-3.5 h-3.5 text-purple-500" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 5v3l2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Session 8h
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="px-8 py-4 flex items-center justify-between text-xs text-gray-400 border-t border-gray-200 bg-white">
      <span>© 2026 EnjoyConsole Inc.</span>
      <div class="flex items-center gap-4">
        <a href="#" class="hover:text-gray-600 transition-colors">CGU</a>
        <a href="#" class="hover:text-gray-600 transition-colors">Confidentialité</a>
      </div>
      <div class="flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
          <path d="M6 6c0-1.1.9-2 2-2s2 .9 2 2c0 .8-.5 1.5-1.2 1.8L8 9v1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="8" cy="12" r=".75" fill="currentColor"/>
        </svg>
        Français (FR)
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../composables/useAuth'
import { auth, resendEmailVerification, requestPasswordReset } from '../../servicesAPI/auth'

const router = useRouter()
const authStore = useAuthStore()

// ── Form 
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const keepLoggedIn = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)

// ── Account picker 
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

// ── Email verification 
const emailVerificationRequired = ref(false)
const verificationEmail = ref('')
const isResendingVerification = ref(false)
const verificationResent = ref(false)
const resendVerificationError = ref<string | null>(null)

// ── Brute-force guard 
const loginAttempts = ref(0)
const MAX_LOGIN_ATTEMPTS = 3

// ── Cookie helpers 
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

// ── Lifecycle
onMounted(() => {
  try {
    let raw = getCookie('rememberedAccounts')
    const ls = localStorage.getItem('rememberedAccounts')
    if (!raw && ls) {
      setCookie('rememberedAccounts', ls, { days: 30, secure: location.protocol === 'https:', sameSite: 'Lax' })
      localStorage.removeItem('rememberedAccounts')
      raw = ls
    }
    const list = raw ? (JSON.parse(raw) as RememberedAccount[]) : []
    rememberedAccounts.value = Array.isArray(list) ? list : []
    if (rememberedAccounts.value.length > 0 && !authStore.isAuthenticated) {
      accountPickerMode.value = true
    }
  } catch {
    rememberedAccounts.value = []
  }
})

// ── Account picker
const selectAccount = (acc: RememberedAccount) => {
  selectedAccount.value = acc
  email.value = acc.email
  accountPickerMode.value = false
}

const useAnotherAccount = () => {
  selectedAccount.value = null
  accountPickerMode.value = false
  email.value = ''
}

// ── Login 
const handleSubmit = async () => {
  error.value = null
  loginAttempts.value++

  if (!email.value.trim() || !password.value.trim()) {
    error.value = 'Email et mot de passe requis.'
    return
  }

  isLoading.value = true
  try {
    const res = await auth({
      email: email.value.trim().toLowerCase(),
      password: password.value,
      keepLoggedIn: keepLoggedIn.value,
    })

    const { user, access_token } = res.data.data
    const token = access_token.token

    authStore.login(user, token)
    authStore.setRoleId(user.roleId)
    authStore.setUserId(user.id ?? user.UserId)

    if (keepLoggedIn.value) {
      const entry: RememberedAccount = {
        id: user.id,
        name: user.name || user.fullName || user.username || user.email,
        email: user.email || email.value,
      }
      const existing = rememberedAccounts.value.filter((a) => a.email !== entry.email)
      rememberedAccounts.value = [entry, ...existing].slice(0, 5)
      setCookie('rememberedAccounts', JSON.stringify(rememberedAccounts.value), {
        days: 30, secure: location.protocol === 'https:', sameSite: 'Lax',
      })
    }

    loginAttempts.value = 0
    console.log('Login successful, redirecting...', res.data.data)
    router.push({ path: '/' })
  } catch (err: any) {
    if (err.response?.status === 403) {
      const data = err.response.data
      if (data?.error === 'EMAIL_NOT_VERIFIED' || data?.requiresVerification) {
        emailVerificationRequired.value = true
        verificationEmail.value = data.email || email.value
        isLoading.value = false
        return
      }
      error.value = 'Accès interdit.'
    } else if (err.response?.status === 503) {
      error.value = 'Service temporairement indisponible.'
      if (loginAttempts.value < MAX_LOGIN_ATTEMPTS) {
        setTimeout(() => handleSubmit(), 2000)
        return
      }
    } else if (err.response?.status === 401) {
      error.value = 'Email ou mot de passe incorrect.'
    } else if (err.response?.status === 400 && err.response.data?.message === 'Login failed') {
      error.value = 'Échec de connexion. Vérifiez vos identifiants.'
    } else if (err.response?.status === 400) {
      error.value = err.response.data?.message || 'Données de requête invalides.'
    } else if (err.response?.status === 422) {
      error.value = 'Erreur de validation.'
    } else if (err.response) {
      error.value = 'Erreur serveur. Veuillez réessayer.'
    } else if (err.request) {
      error.value = 'Erreur réseau. Vérifiez votre connexion.'
    } else {
      error.value = 'Une erreur inattendue est survenue.'
    }
  } finally {
    isLoading.value = false
  }
}

// ── Reset password  
const sendAdminResetLink = async () => {
  resetVerifyError.value = null
  resetSendError.value = null
  resetSent.value = false

  if (!resetEmail.value.trim()) {
    resetVerifyError.value = 'Veuillez saisir votre adresse email.'
    return
  }

  isVerifyingReset.value = true
  try {
    await requestPasswordReset({ email: resetEmail.value.trim().toLowerCase() })
    resetSent.value = true
  } catch (e: any) {
    resetSendError.value = e?.response?.data?.message || "Impossible d'envoyer le lien. Vérifiez l'adresse email."
  } finally {
    isVerifyingReset.value = false
  }
}

const toggleResetMode = () => {
  resetMode.value = !resetMode.value
  if (!resetMode.value) {
    resetEmail.value = ''
    resetVerifyError.value = null
    resetSendError.value = null
    isVerifyingReset.value = false
    resetSent.value = false
  }
}

const backToLogin = () => {
  resetMode.value = false
  resetEmail.value = ''
  resetVerifyError.value = null
  resetSendError.value = null
  isVerifyingReset.value = false
  resetSent.value = false
  emailVerificationRequired.value = false
  verificationEmail.value = ''
  verificationResent.value = false
  resendVerificationError.value = null
  email.value = ''
  password.value = ''
  error.value = null
}

// ── Email verification 
const resendVerificationEmail = async () => {
  resendVerificationError.value = null
  verificationResent.value = false
  isResendingVerification.value = true
  try {
    await resendEmailVerification(verificationEmail.value)
    verificationResent.value = true
  } catch (err: any) {
    resendVerificationError.value = err?.response?.data?.message || "Impossible de renvoyer l'email."
  } finally {
    isResendingVerification.value = false
  }
}
</script>