import api from './api'

export interface Hotel {
  id: string
  name: string
  internalId: string
  status: any
  products: string[]
  capacity: number
  contactName: string
  contactRole: string

}

export const hotelService = {
  getAll: () =>
    api.get<any>('/hotels').then(r => r.data),

  getById: (id: number) =>
    api.get<any>(`/hotels/${id}`).then(r => r.data),

  create: (payload: Omit<Hotel, 'id'>) =>
    api.post<Hotel>('/hotels', payload).then(r => r.data),

  update: (id: number, payload: Partial<Hotel>) =>
    api.put<Hotel>(`/hotels/${id}`, payload).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/hotels/${id}`).then(r => r.data),
}