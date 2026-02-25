import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

type Role = 'super-admin' | 'support' | 'commercial'

const state = reactive({
  isAuthenticated: false,
  role: null as Role | null,
  user: null as null | { name: string },
})

export function useAuth() {
  const router = useRouter()
  const login = async (role: Role, code: string) => {
    if (!code || code.length < 4) return false
    state.isAuthenticated = true
    state.role = role
    state.user = { name: role }
    localStorage.setItem('enjoy_console_role', role)
    return true
  }
  const logout = () => {
    state.isAuthenticated = false
    state.role = null
    state.user = null
    localStorage.removeItem('enjoy_console_role')
    router.push('/login')
  }
  const hasRole = (roles: Role[] | Role) => {
    const arr = Array.isArray(roles) ? roles : [roles]
    return !!state.role && arr.includes(state.role)
  }
  const restore = () => {
    const r = localStorage.getItem('enjoy_console_role') as Role | null
    if (r) {
      state.isAuthenticated = true
      state.role = r
      state.user = { name: r }
    }
  }
  const currentRole = computed(() => state.role)
  return { state, login, logout, hasRole, restore, currentRole }
}
