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

export interface CreateHotelPayload {
  name: string
  description?: string
  address: string
  city: string
  state?: string
  country: string
  postalCode?: string
  email: string
  website?: string
  phone: string
  totalRooms?: number
  totalFloors?: number
  starRating?: number
  timezone?: string
  currency?: string
  taxRate?: number
  checkInTime?: string
  checkOutTime?: string
  cancellationPolicy?: string
  policies?: string
  isActive?: boolean
  adminFirstName: string
  adminLastName: string
  adminEmail: string
  adminPhoneNumber?: string
}

export const hotelService = {
  getAll: () =>
    api.get<any>('/hotels').then(r => r.data),

  getById: (id: number) =>
    api.get<any>(`/hotels/${id}`).then(r => r.data),

   create: (payload: CreateHotelPayload) =>
    api.post<Hotel>('/hotels', payload).then(r => r.data),

  update: (id: number, payload: Partial<Hotel>) =>
    api.put<Hotel>(`/hotels/${id}`, payload).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/hotels/${id}`).then(r => r.data),
}