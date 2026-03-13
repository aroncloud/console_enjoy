import api from "./api";

export interface Subscription {
  id: string
  hotelId: number
  moduleId: number
  billingCycle: 'monthly' | 'yearly'
  startsAt: string
  endsAt: string
  status: 'active' | 'past_due' | 'canceled'
  price: number
  limitCount: number
}

export interface CreateSubscriptionPayload {
  hotel_id: number       
  module_id: number
  billing_cycle: 'monthly' | 'yearly'
  starts_at: string
  ends_at: string
  limit_count: number
  price: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
  }
}

export const subscriptionService = {
  getAll: (params?: any) =>
    api.get<PaginatedResponse<Subscription>>('/console/subscriptions', { params }).then(r => r.data),

  getById: (id: number) =>
    api.get<Subscription>(`/console/subscriptions/${id}`).then(r => r.data),

  create: (hotel_id: number, payload: any) =>
    api.post<Subscription>(`/console/hotels/${hotel_id}/subscriptions`, payload).then(r => r.data),

  update: (id: number, payload: any) =>
    api.put<Subscription>(`/console/subscriptions/${id}`, payload).then(r => r.data),

  patch: (id: number) =>
    api.patch<Subscription>(`/console/subscriptions/${id}/toggle-status`).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/console/subscriptions/${id}`).then(r => r.data),

  extend: (id: number) =>
    api.patch(`/console/subscriptions/${id}/extend`).then(r => r.data),
}