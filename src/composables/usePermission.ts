import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface Permission {
  id: number
  name: string
  label: string
  category: string
}

interface Role {
  id: number
  roleName: string
  description: string | null
}

export const usePermissionsStore = defineStore('permissions', () => {
  const permissions = ref<Permission[]>([])
  const role        = ref<Role | null>(null)

  const permissionNames = computed(() => new Set(permissions.value.map((p) => p.name)))

  const isSuperAdmin = computed(() => (role.value?.roleName ?? '').toLowerCase() === 'super admin')

  // L'utilisateur a cette permission ?
  const can = (permission: string): boolean =>
    isSuperAdmin.value || permissionNames.value.has(permission)

  // L'utilisateur a AU MOINS UNE des permissions ?
  const canAny = (...perms: string[]): boolean =>
    isSuperAdmin.value || perms.some((p) => permissionNames.value.has(p))

  // L'utilisateur a TOUTES les permissions ?
  const canAll = (...perms: string[]): boolean =>
    isSuperAdmin.value || perms.every((p) => permissionNames.value.has(p))


  const init = (userRole: any) => {
    if (!userRole) return
    role.value = {
      id:          userRole.id,
      roleName:    userRole.roleName,
      description: userRole.description ?? null,
    }
    permissions.value = (userRole.permissions ?? []).map((p: any) => ({
      id:       p.id,
      name:     p.name,
      label:    p.label ?? p.name,
      category: p.category ?? '',
    }))
  }

 
  const reset = () => {
    permissions.value = []
    role.value        = null
  }

   return { permissions, role, permissionNames, isSuperAdmin, can, canAny, canAll, init, reset }
}, { persist: true })
