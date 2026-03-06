import api from './api'
import { useAuthStore } from '../composables/useAuth'

// ── Connexion
export function auth(credentials: { email: string; password: string; keepLoggedIn?: boolean }) {
  return api
    .post('/authLoginConsole', credentials)
    .then((resp:any) => {
      const authStore = useAuthStore()

      const token = resp.data.data?.access_token?.token
      const tokenData = resp.data.data?.access_token
      if (token && tokenData) {
        authStore.updateToken(token, tokenData)
        localStorage.setItem('token', token)
      }

      const refresh = resp.data?.data?.refresh_token?.token
      const refreshData = resp.data?.data?.refresh_token
      if (refresh && refreshData) {
        authStore.updateRefreshToken(refresh, refreshData)
      }

      return resp
    })
}

// ── Renvoyer l'email de vérification
export function resendEmailVerification(email: string) {
  return api.post('/auth/resend-verification', { email })
}

// ── Réinitialisation du mot de passe 

export function requestPasswordReset(payload: { email: string; hotelId?: number | string }) {
  return api.post('/auth/forgot-password', payload)
}