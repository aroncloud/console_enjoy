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
  }),
  getters: {
    isMaintenanceActive: (state) => state.active?.type === 'maintenance' && !!state.active?.isActive,
  },
  actions: {
    setActive(announcement: Announcement) {
      this.active = announcement
    },
    clear() {
      this.active = null
    },
  },
})
