import api from './api'

export interface Product {
  id: string
  slug?: string                     
  name: string
  description?: string
  priceMonthly?: number             
  isActive: boolean
}

export interface CreateProductPayload {

    name: string
    description?: string
    priceMonthly: number
    slug?: string
    isActive?: boolean
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

export const productService = {
    getAll: (params?: { page?: number; limit?: number; search?: string; isActive?: boolean | '' }) =>
    api.get<PaginatedResponse<Product>>('/console/modules', { params }).then(r => r.data),

    getById: (id: number) =>
    api.get<Product>(`/console/modules/${id}`).then(r => r.data),

    create: (payload: CreateProductPayload) =>
    api.post<Product>('/console/modules', payload).then(r => r.data),

    update: (id: number, payload: Partial<Product>) =>
    api.put<Product>(`/console/modules/${id}`, payload).then(r => r.data),

    delete: (id: number) =>
    api.delete(`/console/modules/${id}`).then(r => r.data),
}