import api from './api'

export interface Role {
  id?: number
  roleName?: string
}

export interface User {
  id: number
  fullName?: string
  firstName?: string
  lastName?: string
  username?: string
  email: string
  isActive?: boolean
  roleId?: number
  role?: Role | null
  createdAt?: string | null
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

export interface CreateUserPayload {
  fullName?: string
  firstName?: string
  lastName?: string
  username?: string
  email: string
  roleId?: number
  isActive?: boolean
}

export const userService = {
  getAll: (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) =>
    api.get<PaginatedResponse<User>>('/console/users', { params }).then((r) => r.data),

  getById: (id: number) =>
    api.get<any>(`/console/users/${id}`).then((r) => r.data.data),

  create: (payload: CreateUserPayload) =>
    api.post<User>('/console/users', payload).then((r) => r.data),

  update: (id: number, payload: Partial<CreateUserPayload>) =>
    api.put<User>(`/console/users/${id}`, payload).then((r) => r.data),

  getRoleAll: async (): Promise<Role[]> => {
    const res = await api.get('console/roles')
    return res.data
  }
}

