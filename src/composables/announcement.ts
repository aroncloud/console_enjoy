import { defineStore } from 'pinia'

export type AnnouncementType = 'maintenance' | 'update' | 'info'

export interface Announcement {
  id: string
  title: string
  content: string
  type: AnnouncementType
  isActive: boolean
  startsAt: string | null
  endsAt: string | null
  createdAt?: string | null
}

export const useAnnouncementStore = defineStore('announcement', {
  state: () => ({
    active: null as Announcement | null,
    banner: null as Announcement | null,
    dismissedBannerIds: [] as string[],
  }),
  getters: {
    isMaintenanceActive: (state) => state.active?.type === 'maintenance' && !!state.active?.isActive,
    isBannerDismissed: (state) => (id: string) => state.dismissedBannerIds.includes(id),
  },
  actions: {
    setActive(announcement: Announcement) {
      this.active = announcement
    },
    setBanner(announcement: Announcement | null) {
      this.banner = announcement
    },
    dismissBanner(id: string) {
      if (!this.dismissedBannerIds.includes(id)) this.dismissedBannerIds.push(id)
      if (this.banner?.id === id) this.banner = null
    },
    maybeSetMaintenanceBanner(announcements: Announcement[], daysBefore = 5) {
      const now = Date.now()
      const windowMs = daysBefore * 24 * 60 * 60 * 1000

      const candidate = announcements
        .filter((a) => a.type === 'maintenance' && !!a.isActive && !!a.startsAt && !this.dismissedBannerIds.includes(a.id))
        .map((a) => {
          const startsAtMs = new Date(a.startsAt as string).getTime()
          const endsAtMs = a.endsAt ? new Date(a.endsAt).getTime() : null
          return { a, startsAtMs, endsAtMs }
        })
        .filter(({ startsAtMs, endsAtMs }) => {
          if (Number.isNaN(startsAtMs)) return false
          if (endsAtMs !== null && Number.isNaN(endsAtMs)) return false
          const bannerStart = startsAtMs - windowMs
          if (now < bannerStart) return false
          if (endsAtMs !== null && now >= endsAtMs) return false
          return true
        })
        .sort((x, y) => x.startsAtMs - y.startsAtMs)[0]?.a

      this.banner = candidate ?? null
    },
    clear() {
      this.active = null
      this.banner = null
    },
  },
  persist: true,
})
