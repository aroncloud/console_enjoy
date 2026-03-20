// servicesAPI/demoService.ts
import api from './api'

export type DemoStatus =  | 'New' | 'Qualified' | 'Demo Scheduled' | 'Demo Completed' | 'Trial' | 'Negotiation' | 'Converted' | 'Lost' | 'Junk'

export interface DemoOwner {
  id:        number
  firstName: string
  lastName:  string
  email:     string
}

export interface Demo {
  id:                number
  contactName:       string
  companyName:       string
  email:             string
  phoneNumber:       string | null
  country:           string | null
  numberOfRooms:     number | null
  propertyType:      string | null
  preferredLanguage: string | null
  leadSource:        string | null
  notesMessage:      string | null
  competition:       string | null
  acceptCondition:   boolean
  emailSend:         boolean
  status:            DemoStatus
  followUpDate:      string | null
  owner:             DemoOwner | null
  ownerId:           number | null
  createdAt:         string
  updatedAt:         string
}

export type UpdateDemoPayload = Partial<{
  contactName:       string
  companyName:       string
  email:             string
  phoneNumber:       string | null
  country:           string | null
  numberOfRooms:     number | null
  propertyType:      string | null
  preferredLanguage: string | null
  leadSource:        string | null
  notesMessage:      string | null
  competition:       string | null
  acceptCondition:   boolean
  emailSend:         boolean
  status:            DemoStatus
  ownerId:           number | null
  followUpDate:      string | null
}>

interface GetAllParams {
  page?:    number
  limit?:   number
  search?:  string
  status?:  string
  ownerId?: number
  all?:     boolean   
}


interface AdonisPage<T> {
  data: T[]
  meta: {
    total:        number
    perPage:      number
    currentPage:  number
    lastPage:     number
    firstPage:    number
  }
}

export const demoService = {
  getAll: (params: GetAllParams): Promise<AdonisPage<Demo>> =>
    api.get('/console/demo-requests', { params }).then(r => r.data),

  getOne: (id: number): Promise<Demo> =>
    api.get(`/console/demo-requests/${id}`).then(r => r.data),

  update: (id: number, payload: UpdateDemoPayload): Promise<Demo> =>
    api.patch(`/console/demo-requests/${id}`, payload).then(r => r.data),

  delete: (id: number): Promise<void> =>
    api.delete(`/console/demo-requests/${id}`).then(r => r.data),

  resendEmail: (id: number): Promise<Demo> =>
    api.post(`/console/demo-requests/${id}/resend-email`).then(r => r.data),

  getById: (id: number) => api.get(`/console/demo-requests/${id}`).then(r => r.data),

  create : (payload: UpdateDemoPayload): Promise<Demo> =>
    api.post('/console/demo-requests', payload).then(r => r.data),


}