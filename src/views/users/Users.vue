<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { Plus, Edit, KeyRound, Eye, Users as UsersIcon ,Search} from 'lucide-vue-next'

import BaseTable, { type Column } from '../../components/Table/BaseTable.vue'
import BaseModal from '../../components/Modal/BaseModal.vue'
import Input from '../../components/FormElements/Input.vue'
import Toggle from '../../components/FormElements/Toggle.vue'
import Select from '../../components/FormElements/Select.vue'
import ButtonComponent from '../../components/Button/ButtonComponent.vue'

import { useToastStore } from '../../composables/toast'
import { requestPasswordReset } from '../../servicesAPI/auth'
import { userService, type User, type CreateUserPayload } from '../../servicesAPI/userService'

const toastStore = useToastStore()

const users = ref<User[]>([])
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const filterActive = ref<'all' | 'active' | 'inactive'>('all')

const page = ref(1)
const limit = ref(20)
const meta = ref<any>(null)

const columns: Column[] = [
  { key: 'user', label: 'Utilisateur' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Rôle' },
  { key: 'isActive', label: 'Statut', sortable: false },
  { key: 'actions', label: 'Actions', sortable: false, tdClass: 'text-right', thClass: 'text-right' },
]

const showForm = ref(false)
const editingId = ref<number | null>(null)
const loadingRole = ref(false)
const showProfile = ref(false)
const viewingUser = ref<User | null>(null)

const form = reactive({
  firstName:'',
  lastName: '',
  username: '',
  email: '',
  roleId: '' as '' | number,
  isActive: true,
})

const formErrors = reactive({
  firstName:'',
  lastName: '',
  email: '',
})

// const roleOptions = [
//   { label: 'Rôle (auto)', value: '' },
//   { label: 'Super Admin', value: 1 },
//   { label: 'Admin', value: 2 },
//   { label: 'Manager', value: 3 },
// ]
const roleOptions = ref<any[]>([])

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || 'U'

type UserLike = {
  firstName?:string,
  lastName?: string,
  fullName?: string
  username?: string
  email?: string
  roleId?: number
  role?: { roleName?: string } | null
}

const displayName = (u: UserLike) => u.fullName || u.username || u.email || '—'
const displayRole = (u: UserLike) => u.role?.roleName || (u.roleId ? `Rôle #${u.roleId}` : '—')

const fetchUsers = async (targetPage = 1) => {
  loading.value = true
  try {
    const res = await userService.getAll({
      page: targetPage,
      limit: limit.value,
      search: searchQuery.value.trim() || undefined,
      isActive:
        filterActive.value === 'active' ? true
        : filterActive.value === 'inactive' ? false
        : undefined,
    })
    users.value = res.data
    meta.value = res.meta
  } catch (e) {
    console.error(e)
    toastStore.show({ type: 'error', message: 'Erreur lors du chargement des utilisateurs' })
  } finally {
    loading.value = false
  }
}

const fetchRole = async()=>{
  
  try {
    loadingRole.value = true
    const roles = await userService.getRoleAll()
    console.log('roles',roles)
    roleOptions.value = [
      { label: 'Rôle (auto)', value: '' },
      ...roles.map(r => ({ label: r.roleName, value: r.id }))
    ]
  } catch (e) {
    console.error(e)
  }finally{
    loadingRole.value = false
  }
}

onMounted(() => {
  fetchRole()
  fetchUsers(1)
})

const handlePageChange = (newPage: number) => {
  page.value = newPage
  fetchUsers(newPage)
}

watch([searchQuery, filterActive], () => {
  page.value = 1
  fetchUsers(1)
})

const resetForm = () => {
  form.firstName = ''
  form.lastName = ''
  form.username = ''
  form.email = ''
  form.roleId = ''
  form.isActive = true
  formErrors.firstName = ''
  formErrors.lastName = ''
  formErrors.email = ''
  editingId.value = null
}

const openCreate = () => {
  resetForm()
  showForm.value = true
}

const openEdit = (row: any) => {
  const u = row as User
  resetForm()
  editingId.value = u.id
  form.firstName = u.firstName ?? ''
  form.lastName = u.lastName ?? ''
  form.username = u.username ?? ''
  form.email = u.email ?? ''
  form.roleId = u.roleId ?? ''
  form.isActive = u.isActive ?? true
  showForm.value = true
}

const validateForm = () => {
  formErrors.firstName = form.firstName.trim() ? '' : 'Le prénom est obligatoire'
  formErrors.lastName = form.lastName.trim() ? '' : 'Le nom est obligatoire'
  formErrors.email = form.email.trim() && /\S+@\S+\.\S+/.test(form.email) ? '' : "L'email est obligatoire"
  return !formErrors.firstName && !formErrors.email && !formErrors.lastName
}

const handleSubmit = async () => {
  if (!validateForm()) return
  saving.value = true
  try {
    const payload: CreateUserPayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      username: form.username.trim() || undefined,
      email: form.email.trim(),
      roleId: form.roleId === '' ? undefined : Number(form.roleId),
      isActive: form.isActive,
    }
    console.log('payload',payload)
    if (editingId.value) {
      await userService.update(editingId.value, payload)
      toastStore.show({ type: 'success', message: 'Utilisateur mis à jour' })
    } else {
      await userService.create(payload)
      toastStore.show({ type: 'success', message: 'Utilisateur créé' })
    }

    showForm.value = false
    resetForm()
    await fetchUsers(page.value)
  } catch (e) {
    console.error(e)
    toastStore.show({ type: 'error', message: 'Erreur lors de la sauvegarde' })
  } finally {
    saving.value = false
  }
}

const openProfile = (row: any) => {
  viewingUser.value = row as User
  showProfile.value = true
}

const sendResetPassword = async (row: any) => {
  const u = row as User
  saving.value = true
  try {
    await requestPasswordReset({ email: u.email })
    toastStore.show({ type: 'success', message: `Email de réinitialisation envoyé à ${u.email}` })
  } catch (e) {
    console.error(e)
    toastStore.show({ type: 'error', message: "Impossible d'envoyer l'email de réinitialisation" })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen space-y-6">
    <div class="flex flex-col md:flex-row justify-between md:items-start gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Gestion des utilisateurs</h1>
        <p class="text-sm text-slate-500 dark:text-slate-300 mt-1">Créer, modifier et envoyer un email de réinitialisation</p>
      </div>

      <div class="flex items-center gap-2">
        <ButtonComponent variant="secondary" :iconLeft="UsersIcon" @click="fetchUsers(1)">Rafraîchir</ButtonComponent>
        <ButtonComponent :iconLeft="Plus" @click="openCreate">Ajouter</ButtonComponent>
      </div>
    </div>

    <div class="flex flex-col md:flex-row gap-3">
      <div class="flex-1 relative">
        <Search :size="15" class="absolute left-3 top-12 -translate-y-1/3 text-slate-400 dark:text-slate-500 z-10" />
        <Input v-model="searchQuery" lb="Recherche" placeholder="Nom, username ou email" custom-class="pl-8" />
      </div>
      <div class="w-full md:w-64">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Statut</div>
        <div class="flex items-center gap-1 p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            v-for="[key, label] in [['all', 'Tous'], ['active', 'Actifs'], ['inactive', 'Inactifs']]"
            :key="key"
            @click="filterActive = key as any"
            class="px-3 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer"
            :class="filterActive === key ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white'"
          >
            {{ label }}
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <BaseTable
        :columns="columns"
        :data="users"
        :loading="loading"
        :show-search="false"
        :meta="meta"
        @page-change="handlePageChange"
      >
        <template #cell-user="{ row }">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
              <span class="text-sm font-bold text-purple-700 dark:text-purple-200">{{ initials(displayName(row)) }}</span>
            </div>
            <div class="min-w-0">
              <button
                class="font-bold text-sm text-slate-900 dark:text-white truncate text-left hover:underline cursor-pointer"
                @click="openProfile(row)"
              >
                {{ displayName(row) }}
              </button>
              <p class="text-xs text-slate-400 dark:text-slate-400 truncate mt-0.5">@{{ row.username ?? '—' }}</p>
            </div>
          </div>
        </template>

        <template #cell-email="{ row }">
          <span class="text-sm text-purple-700 dark:text-slate-200 hover:underline">{{ row.email }}</span>
        </template>

        <template #cell-role="{ row }">
          <span class="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
            {{ displayRole(row) }}
          </span>
        </template>

        <template #cell-isActive="{ row }">
          <span
            :class="[
              'text-xs font-semibold px-2 py-1 rounded-full',
              (row.isActive ?? true)
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300',
            ]"
          >
            {{ (row.isActive ?? true) ? 'Actif' : 'Inactif' }}
          </span>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center justify-end gap-1">
            <ButtonComponent variant="ghost" size="sm" :iconLeft="Eye" aria-label="Profil" @click.stop="openProfile(row)" />
            <ButtonComponent variant="ghost" size="sm" :iconLeft="Edit" aria-label="Modifier" @click.stop="openEdit(row)" />
            <ButtonComponent
              variant="ghost"
              size="sm"
              :iconLeft="KeyRound"
              aria-label="Réinitialiser mot de passe"
              @click.stop="sendResetPassword(row)"
            />
          </div>
        </template>
      </BaseTable>
    </div>

    <BaseModal v-model="showForm">
      <template #header>
        <div class="flex items-center gap-2">
          <h3 class="font-bold text-slate-900 dark:text-white">
            {{ editingId ? 'Modifier un utilisateur' : 'Ajouter un utilisateur' }}
          </h3>
        </div>
      </template>

      <div class="space-y-4">
        <div class="grid md:grid-cols-2 grid-cols-1 gap-2">
          <Input v-model="form.firstName" lb="Prénom" :error-msg="formErrors.firstName" :placeholder="'Aline'" :is-required="true" :disabled="saving" />
          <Input v-model="form.lastName" lb="Nom" :error-msg="formErrors.lastName" :placeholder="'Mbarga'" :is-required="true" :disabled="saving"/>
        </div>
        <Input v-model="form.username" lb="Username" placeholder="Optionnel" :disabled="saving" />
        <Input v-model="form.email" lb="Email" :error-msg="formErrors.email" :placeholder="'info@gmail.com'" :is-required="true" :disabled="saving" />
        <Select v-model="form.roleId" lb="Rôle" :options="roleOptions" :isLoading="loadingRole" :disabled="saving" />
        <div class="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3">
          <div>
            <p class="text-sm font-semibold text-slate-900 dark:text-white">Compte actif</p>
            <p class="text-xs text-slate-400 dark:text-slate-400">Désactivez pour bloquer la connexion</p>
          </div>
          <Toggle v-model="form.isActive"  :disabled="saving"/>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <ButtonComponent variant="secondary" @click="showForm = false" :disabled="saving">Annuler</ButtonComponent>
          <ButtonComponent :loading="saving" @click="handleSubmit">{{ editingId ? 'Enregistrer' : 'Créer' }}</ButtonComponent>
        </div>
      </template>
    </BaseModal>

    <BaseModal v-model="showProfile" customClass="max-w-xl">
      <template #header>
        <div class="flex items-center gap-2">
          <h3 class="font-bold text-slate-900 dark:text-white">Profil utilisateur</h3>
        </div>
      </template>

      <div v-if="viewingUser" class="space-y-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <span class="text-base font-bold text-purple-700 dark:text-purple-200">{{ initials(displayName(viewingUser)) }}</span>
          </div>
          <div class="min-w-0">
            <p class="text-lg font-bold text-slate-900 dark:text-white truncate">{{ displayName(viewingUser) }}</p>
            <p class="text-sm text-slate-500 dark:text-slate-300 truncate">{{ viewingUser.email }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
            <p class="text-xs text-slate-400 dark:text-slate-400">Username</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">{{ viewingUser.username ?? '—' }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
            <p class="text-xs text-slate-400 dark:text-slate-400">Rôle</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">{{ displayRole(viewingUser) }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <ButtonComponent variant="secondary" @click="showProfile = false" >Fermer</ButtonComponent>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
