import api from './api' 

export const permissionService = {
  getAll: (params?: any) => api.get('/permission', { params }).then(r => r.data),
}