import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: 'light' as ThemeMode,
  }),

  getters: {
    isDark: (state) => state.mode === 'dark',
  },

  actions: {
    setMode(mode: ThemeMode) {
      this.mode = mode
    },

    toggle() {
      this.mode = this.mode === 'dark' ? 'light' : 'dark'
    },
  },

  persist: true,
})

