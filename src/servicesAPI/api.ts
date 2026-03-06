import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true, // ← ajout pour envoyer le cookie refresh_token
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Intercepteur request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Gestion de la file d'attente pendant le refresh
let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

// ── Intercepteur response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Évite une boucle infinie si le refresh lui-même échoue
    if (originalRequest.url?.includes('/api/refresh-token')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Si un refresh est déjà en cours → mettre en file d'attente
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Appel refresh — le cookie httpOnly est envoyé automatiquement
        const { data } = await api.post('/api/refresh-token')
        const newToken = data.data.access_token.token

        // Mise à jour du token partout
        localStorage.setItem('token', newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        // Mise à jour du store
        const { useAuthStore } = await import('../composables/useAuth')
        const authStore = useAuthStore()
        authStore.updateToken(newToken, data.data.access_token)
        if (data.data.refresh_token) {
          authStore.updateRefreshToken(data.data.refresh_token.token, data.data.refresh_token)
        }

        processQueue(null, newToken)
        return api(originalRequest) // rejoue la requête originale
      } catch (refreshError) {
        processQueue(refreshError, null)

        // Refresh échoué → déconnexion forcée
        localStorage.removeItem('token')
        const { useAuthStore } = await import('../composables/useAuth')
        useAuthStore().logout()
        window.location.href = '/login'

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api