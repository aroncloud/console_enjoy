import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: number
  type: ToastType
  message: string
  title?: string
  duration?: number
}

interface ShowToastPayload {
  type: ToastType
  message: string
  title?: string
  duration?: number
}

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as Toast[],
    nextId: 1
  }),
  actions: {
    show(payload: ShowToastPayload) {
      const id = this.nextId++
      const toast: Toast = {
        id,
        type: payload.type,
        message: payload.message,
        title: payload.title,
        duration: payload.duration
      }
      this.toasts.push(toast)
      const duration = payload.duration ?? 4000
      if (duration > 0) {
        setTimeout(() => {
          this.dismiss(id)
        }, duration)
      }
      return id
    },
    dismiss(id: number) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    },
    clear() {
      this.toasts = []
    }
  }
})

