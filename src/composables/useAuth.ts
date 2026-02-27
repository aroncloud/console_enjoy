import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    refreshToken: null as string | null,
    tokenData: null as any,
    refreshTokenData: null as any,
    user: null as Record<string, any> | null,
    roleId: null as number | null,
    UserId: null as number | null,
    reauthRequired: false as boolean,
    activeHotelId: null as number | null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    isFullyAuthenticated: (state) => !!(state.token && state.user && state.UserId),
    getUser: (state) => state.user,
    isAuthenticated: (state) => !!state.token,
    isSuperAdmin: (state) => state.roleId === 1,
  },

  actions: {

    login(user: any, token: string) {
      this.user = { ...user }
      this.token = token
      this.roleId = user.roleId
      this.UserId = user.id ?? user.UserId
    },

    setReauthRequired(flag: boolean) {
      this.reauthRequired = flag
    },

    /** Définit l'hôtel actif consulté dans la console (navigation admin) */
    setActiveHotelId(hotelId: number | null) {
      this.activeHotelId = hotelId
    },

    logout() {
      this.token = null
      this.refreshToken = null
      this.user = null
      this.roleId = null
      this.UserId = null
      this.tokenData = null
      this.refreshTokenData = null
      this.reauthRequired = false
      this.activeHotelId = null
    },

    forceLogout() {
      this.$reset()
    },

    setRoleId(roleId: number) {
      this.roleId = roleId
    },

    setUserId(UserId: number) {
      this.UserId = UserId
    },


    updateToken(token: string, tokenData: any) {
      this.token = token
      this.tokenData = tokenData
    },

    updateRefreshToken(refreshToken: string, refreshTokenData: any) {
      this.refreshToken = refreshToken
      this.refreshTokenData = refreshTokenData
    },

   

    clearsetRoleId() { this.roleId = null },
    clearsetUserId() { this.UserId = null },
    clearsetUser() { this.user = null },
  },

  persist: true,
})