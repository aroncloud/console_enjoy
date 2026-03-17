import api from './api'

export interface AddOn {
  id: number
  moduleId: number
  name: string
  min: number
  max: number
  priceMonth: number
  priceYear?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
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
}

export const addOnService = {
  getAll: (params?: { page?: number; limit?: number; moduleId?: number }) =>
    api.get<PaginatedResponse<AddOn>>('/console/add-ons', { params }).then((r) => r.data),

  getById: (id: number) =>
    api.get<AddOn>(`/console/add-ons/${id}`).then((r) => r.data),

  getByModule: (moduleId: number, params?: { page?: number; limit?: number }) =>
    api
      .get<PaginatedResponse<AddOn>>(`/console/modules/${moduleId}/add-ons`, { params })
      .then((r) => r.data),

  createForModule: (moduleId: number, payload: Omit<AddOn, 'id' | 'moduleId'>) =>
    api.post<AddOn>(`/console/modules/${moduleId}/add-ons`, payload).then((r) => r.data),

  update: (id: number, payload: Partial<Omit<AddOn, 'id' | 'moduleId'>>) =>
    api.patch<AddOn>(`/console/add-ons/${id}`, payload).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/console/add-ons/${id}`).then((r) => r.data),
}

