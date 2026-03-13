import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
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

// ── URLs à ne jamais intercepter
const PUBLIC_URLS = [
  '/refresh_token_console',
  '/authLoginConsole',
  '/authLogin',
  '/auth/signin',
]

const isPublicUrl = (url?: string) => PUBLIC_URLS.some((u) => url?.includes(u))

// ── Intercepteur response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Ne jamais intercepter les routes publiques (login, refresh)
    if (isPublicUrl(originalRequest.url)) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
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
        const { data } = await api.post('/refresh_token_console')
        const newToken = data.data.access_token.token

        localStorage.setItem('token', newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        const { useAuthStore } = await import('../composables/useAuth')
        const authStore = useAuthStore()
        authStore.updateToken(newToken, data.data.access_token)
        if (data.data.refresh_token) {
          authStore.updateRefreshToken(data.data.refresh_token.token, data.data.refresh_token)
        }

        processQueue(null, newToken)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)

        localStorage.removeItem('token')
        const { useAuthStore } = await import('../composables/useAuth')
        useAuthStore().logout()

        // ── Navigation SPA sans rechargement de page
        const { default: router } = await import('../router')
        router.push('/login')

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api