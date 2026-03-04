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
  hotelId: number
  moduleId: number
  billingCycle: 'monthly' | 'yearly'
  startsAt: string
  endsAt: string
  limitCount: number
  price: number
}

export const subscriptionService = {
  getAll: () =>
    api.get<Subscription[]>('/console').then(r => r.data),

  getById: (id: number) =>
    api.get<Subscription>(`/console/${id}`).then(r => r.data),

 create: (hotel_id : number,payload: CreateSubscriptionPayload) =>
    api.post<Subscription>(`/console/hotels/${hotel_id}/subscriptions`, payload).then(r => r.data),

 update: (id: number, payload: Partial<Subscription>) =>
    api.put<Subscription>(`/console/${id}`, payload).then(r => r.data),

 delete: (id: number) =>
    api.delete(`/console/${id}`).then(r => r.data),
}   