import api from './api'
import type { Announcement, AnnouncementType } from '../composables/announcement'

export interface AnnouncementsMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
  firstPageUrl?: string | null
  lastPageUrl?: string | null
  nextPageUrl?: string | null
  previousPageUrl?: string | null
}

export interface AnnouncementsResponse {
  meta: AnnouncementsMeta
  data: Announcement[]
}

export interface ListAnnouncementsParams {
  page?: number
  limit?: number
  search?: string
  type?: AnnouncementType | ''
  isActive?: boolean | ''
}

export interface CreateAnnouncementPayload {
  title: string
  content: string
  type: AnnouncementType
  isActive: boolean
  startsAt: string
  endsAt: string
}

const normalizeMeta = (meta: any): AnnouncementsMeta => {
  const currentPage = meta?.currentPage ?? meta?.current_page ?? 1
  const lastPage = meta?.lastPage ?? meta?.last_page ?? 1
  const previousPageUrl =
    meta?.previousPageUrl ?? meta?.previous_page_url ?? (currentPage > 1 ? 'prev' : null)
  const nextPageUrl =
    meta?.nextPageUrl ?? meta?.next_page_url ?? (currentPage < lastPage ? 'next' : null)

  return {
    total: meta?.total ?? 0,
    perPage: meta?.perPage ?? meta?.per_page ?? 0,
    currentPage,
    lastPage,
    firstPage: meta?.firstPage ?? meta?.first_page ?? 1,
    firstPageUrl: meta?.firstPageUrl ?? meta?.first_page_url ?? null,
    lastPageUrl: meta?.lastPageUrl ?? meta?.last_page_url ?? null,
    nextPageUrl,
    previousPageUrl,
  }
}

export const announcementService = {
  getAll: async (params: ListAnnouncementsParams = {}): Promise<AnnouncementsResponse> => {
    const res = await api.get('/console/announcements', { params })
    return { meta: normalizeMeta(res.data?.meta), data: res.data?.data ?? [] }
  },

  create: async (payload: CreateAnnouncementPayload): Promise<Announcement> => {
    const res = await api.post('/console/announcements', payload)
    return res.data
  },

  update: async (id: string, payload: Partial<CreateAnnouncementPayload>): Promise<Announcement> => {
    const res = await api.patch(`/console/announcements/${id}`, payload)
    return res.data
  },
}
