import api from './api'

export interface Invoice {
  id: number
  invoiceNumber: string
  hotelId: number
  hotel: string
  subscriptionId: number | null
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'cancelled'
  description: string | null
  billingDate: string | null
  createdAt: string
}

export interface InvoicePaginated {
  data: Invoice[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
    firstPageUrl: string | null
    lastPageUrl: string | null
    nextPageUrl: string | null
    previousPageUrl: string | null
  }
}

export interface InvoiceStats {
  totalRevenue: number
  pendingAmount: number
  pendingCount: number
  overdueAmount: number
}

export interface InvoiceData {
  stats: InvoiceStats
  invoices: InvoicePaginated
}

export const invoiceService = {
  get: (params?: { page?: number; search?: string; status?: string }) =>
    api.get<InvoiceData>('console/billing', { params }).then((r) => r.data),

  markAsPaid: (id: number) =>
    api.patch(`/console/invoices/${id}/pay`).then((r) => r.data),


  getQuotas: () =>
    api.get<any[]>('/console/billing/quotas').then((r) => r.data),

  factureSurplus: (hotelId: number, data: { subscriptionId: number; quantity: number; amount: number }) =>
    api.post(`/console/hotels/${hotelId}/invoices`, data).then((r) => r.data),
}