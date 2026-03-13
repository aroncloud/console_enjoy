import api from './api'

export interface ActivityLog {
  id: number
  action: string
  description: string
  time: string
  userName?: string
  hotelName?: string
  entityType: string
  entityId: string
}

export interface ActivityLogMeta {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}

export interface ActivityLogResponse {
  data: ActivityLog[]
  meta: ActivityLogMeta
}

export interface ActivityLogFilters {
  page?: number
  limit?: number
  action?: string
  date?: string
}

export const historyService = {
  getAll: async (filters: ActivityLogFilters = {}): Promise<ActivityLogResponse> => {
    const res = await api.get('/console/activity-logs', { params: filters })
    return res.data
  },

  getByHotel: async (hotelId: number, filters: ActivityLogFilters = {}): Promise<ActivityLogResponse> => {
    const res = await api.get(`/console/hotels/${hotelId}/activity-logs`, { params: filters })
    return res.data
  },
}