import api from './api' 

export const roleService = {
  getById: (id: number) => api.get(`/console/roles/${id}`).then(r => r.data),
  create: (data: any) => api.post('/console/roles', data).then(r => r.data),
  update: (id: number, data: any) => api.put(`/console/roles/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/console/roles/${id}`).then(r => r.data),
  assignPermissions: (id: number, data: { permissionIds: number[]; serviceId?: number }) =>
    api.post(`/console/roles/${id}/permissions/console`, data).then(r => r.data),
}

