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
  isSent?: boolean
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

export interface InvoiceSubscriptionItemPayload {
  module_id: number
  billing_cycle: 'monthly' | 'yearly'
  price: number
  limit_count: number | null
  add_on_id?: number | null
}

export interface InvoicesSubscriptionsPayload {
  periodStart: string
  periodEnd: string
  currency: string
  subscriptions: InvoiceSubscriptionItemPayload[]
}

export interface InvoiceSubscriptionPaymentPayload {
  amount?: number
  currency?: string
  paymentDate?: string
  paymentMethod?: string
  transactionReference?: string
  notes?: string
}

export const invoiceService = {
  get: (params?: { page?: number; search?: string; status?: string ;limit?:any}) =>
    api.get<InvoiceData>('console/billing', { params }).then((r) => r.data),

  markAsPaid: (id: number) =>
    api.post(`/console/invoices-subscriptions/${id}/payments`, {}).then((r) => r.data),

  createInvoiceSubscriptionPayment: (id: number, data: InvoiceSubscriptionPaymentPayload = {}) =>
    api.post(`/console/invoices-subscriptions/${id}/payments`, data).then((r) => r.data),

  getInvoiceSubscription: (id: number) =>
    api.get(`/console/invoices-subscriptions/${id}`).then((r) => r.data),

  resendInvoiceSubscriptionEmail: (id: number) =>
    api.post(`/console/invoices-subscriptions/${id}/resend-email`, {}).then((r) => r.data),

  createInvoicesSubscriptions: (hotelId: number, data: InvoicesSubscriptionsPayload) =>
    api.post(`/console/hotels/${hotelId}/invoices-subscriptions`, data).then((r) => r.data),

  getInvoicesSubscriptionsPdf: (id: number) =>
    api.get(`/console/invoices-subscriptions/${id}/pdf`, { responseType: 'blob' }).then((r) => r.data),

  getInvoicesSubscriptionsReceiptPdf: (id: number) =>
    api.get(`/console/invoices-subscriptions/${id}/receipt-pdf`, { responseType: 'blob' }).then((r) => r.data),


  getQuotas: () =>
    api.get<any[]>('/console/billing/quotas').then((r) => r.data),

  factureSurplus: (hotelId: number, data: { subscriptionId: number; quantity: number; amount: number;description:string }) =>
    api.post(`/console/hotels/${hotelId}/invoice_subscriptions`, data).then((r) => r.data),
}
