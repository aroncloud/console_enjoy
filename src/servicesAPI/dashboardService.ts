import api from './api'

export interface DashboardStats {
  totalHotels: number
  hotelsThisMonth: number
  mrr: number
  mrrTrend: string | null
  renewalRate: string
  renewalObjectif: string
}

// dashboardService.ts
export interface LicenseAlertPaginated {
  data: LicenseAlert[]
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

export interface DashboardData {
  stats: DashboardStats
  licenseAlerts: LicenseAlertPaginated  
  recentActivations: RecentActivation[]
  revenueChart: {
    week: ChartPoint[]
    year: ChartPoint[]
  }
}

export interface LicenseAlert {
  id: number
  hotel: string
  hotelId: number
  module: string
  dueDate: string | null
  daysLeft: number
}

export interface RecentActivation {
  id: number
  description: string
  action: string
  hotelId: number
  time: string | null
}

export interface ChartPoint {
  label: string
  value: number
  trend: string | null
  trendUp: boolean
  current: boolean
}


export const dashboardService = {
  get: (params?: { alertsPage?: number }) =>
    api.get<DashboardData>('/console/dashboard', { params }).then((r) => r.data),
}