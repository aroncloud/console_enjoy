<template>
  <div class="min-h-dvh bg-slate-50 dark:bg-[#0a0a0f]">
    <!-- ── Page Header ── -->
    <div
      class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 sm:py-5 rounded-t-xl"
    >
      <div class="flex items-start justify-between mb-5">
        <div>
          <h1
            class="text-xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            {{ $t("security.title") }}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ $t("security.subTitle") }}
          </p>
        </div>
        <span
          class="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full font-semibold border border-emerald-200 dark:border-emerald-800"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {{ $t("security.status") }}
        </span>
      </div>

      <!-- Stats bar -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div
          class="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <div
            class="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0"
          >
            <Wifi :size="14" class="text-blue-500" />
          </div>
          <div class="min-w-0">
            <p
              class="text-[12px] text-slate-500 dark:text-slate-400 font-medium truncate"
            >
              {{ t("security.kpis.activeTenants") }}
            </p>
            <p
              class="text-base font-black text-slate-800 dark:text-white leading-tight"
            >
              {{ activeCount
              }}<span class="text-xs font-normal text-slate-400"
                >/{{ totalCount }}</span
              >
            </p>
          </div>
        </div>
        <div
          class="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <div class="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg shrink-0">
            <Power :size="14" class="text-red-500" />
          </div>
          <div class="min-w-0">
            <p
              class="text-[12px] text-slate-500 dark:text-slate-400 font-medium truncate"
            >
              {{ t("security.kpis.revokedAccess") }}
            </p>
            <p
              class="text-base font-black text-slate-800 dark:text-white leading-tight"
            >
              {{ suspendedCount }}
            </p>
          </div>
        </div>
        <div
          class="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <div
            class="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg shrink-0"
          >
            <ShieldCheck :size="14" class="text-purple-500" />
          </div>
          <div class="min-w-0">
            <p
              class="text-[12px] text-slate-500 dark:text-slate-400 font-medium truncate"
            >
              {{ t("security.kpis.totalRoles") }}
            </p>
            <p
              class="text-base font-black text-slate-800 dark:text-white leading-tight"
            >
              {{ allRoles.length }}
            </p>
          </div>
        </div>
        <div
          class="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <div
            class="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg shrink-0"
          >
            <Key :size="14" class="text-amber-500" />
          </div>
          <div class="min-w-0">
            <p
              class="text-[12px] text-slate-500 dark:text-slate-400 font-medium truncate"
            >
              {{ t("security.kpis.totalPermissions") }}
            </p>
            <p
              class="text-base font-black text-slate-800 dark:text-white leading-tight"
            >
              {{ allPermissions.length }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Tab nav ── -->
    <div
      class="bg-white dark:bg-slate-900 border-b border-slate-200 rounded-b-xl dark:border-slate-800 px-4 sm:px-6"
    >
      <div class="flex overflow-x-auto">
        <button
          @click="activeTab = 'tenants'"
          class="flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap shrink-0"
          :class="
            activeTab === 'tenants'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          "
        >
          <Wifi :size="13" />
          {{ $t("security.tenant") }}
          <span
            class="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
            :class="
              activeTab === 'tenants'
                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            "
          >
            {{ totalCount }}
          </span>
        </button>
        <button
          @click="activeTab = 'roles'"
          class="flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap shrink-0"
          :class="
            activeTab === 'roles'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          "
        >
          <ShieldCheck :size="13" />
          {{ $t("security.roles.title") }}
          <span
            class="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
            :class="
              activeTab === 'roles'
                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            "
          >
            {{ allRoles.length }}
          </span>
        </button>
      </div>
    </div>

    <!-- ── Content ── -->
    <div class="p-4 sm:p-6">
      <!-- TAB: Tenants -->
      <div v-show="activeTab === 'tenants'">
        <div
          class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <BaseTable
            :columns="tenantColumns"
            :data="tenantStatuses"
            :title="t('security.tenants.title')"
            :meta="metaData"
            @page-change="handlePageChange"
            :loading="isLoading"
          >
            <template #cell-hotel="{ value }">
              <span
                class="font-semibold text-gray-800 dark:text-white capitalize"
                >{{ value.hotelName }}</span
              >
            </template>
            <template #cell-module="{ value }">
              <div class="flex flex-col">
                <span
                  class="text-sm font-semibold text-slate-800 dark:text-white"
                  >{{ value.name ?? "—" }}</span
                >
                <span class="font-mono text-xs text-slate-400">{{
                  value.slug ?? "—"
                }}</span>
              </div>
            </template>
            <template #cell-status="{ value }">
              <span
                class="px-2 py-1 text-[10px] font-bold rounded-full uppercase flex items-center gap-1.5 w-fit"
                :class="
                  value === 'canceled'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-emerald-100 text-emerald-600'
                "
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="
                    value === 'canceled'
                      ? 'bg-red-500'
                      : 'bg-emerald-500 animate-pulse'
                  "
                />
                {{
                  value === "canceled"
                    ? t("subscriptions.status.canceled")
                    : t("subscriptions.status.active")
                }}
              </span>
            </template>
            <template #cell-actions="{ row }">
              <div class="flex justify-end">
                <button
                  :disabled="loadingStatus"
                  class="p-1.5 rounded-lg border transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  :class="
                    row.status === 'canceled'
                      ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/40 dark:hover:bg-emerald-900/10'
                      : 'border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/10'
                  "
                  @click="toggleTenant(row)"
                >
                  <Power :size="12" />
                  {{
                    row.status === "canceled"
                      ? t("common.restore")
                      : t("common.suspend")
                  }}
                </button>
              </div>
            </template>
          </BaseTable>
        </div>
      </div>

      <!-- TAB: Rôles & Permissions -->
      <div
        v-show="activeTab === 'roles'"
        class="flex flex-col lg:flex-row gap-5 lg:h-[calc(100vh-290px)] lg:min-h-[520px]"
      >
        <!-- Colonne gauche: liste rôles -->
        <div
          class="w-full lg:w-72 shrink-0 flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div
            class="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"
          >
            <span
              class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
            >
              {{ $t("security.roles.subTitle") }}
              <span
                class="text-slate-400 font-normal normal-case tracking-normal"
                >({{ filteredRoles.length }})</span
              >
            </span>
            <button
              @click="openCreateModal"
              class="flex items-center gap-1 px-2.5 py-1.5 bg-purple-500 text-white text-[11px] font-bold rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Plus :size="11" /> {{ $t("security.roles.new") }}
            </button>
          </div>

          <div
            class="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800"
          >
            <div class="relative">
              <Search
                :size="12"
                class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                v-model="searchQuery"
                :placeholder="t('security.roles.search')"
                class="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-white"
              />
            </div>
          </div>

          <div class="flex-1 overflow-y-auto scrollbar">
            <div v-if="loadingRoles" class="p-3 space-y-1">
              <div
                v-for="i in 5"
                :key="i"
                class="flex items-center gap-3 px-2 py-2.5"
              >
                <div
                  class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0"
                />
                <div class="flex-1 space-y-1.5">
                  <div
                    class="h-2.5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"
                    :style="{ width: `${55 + ((i * 11) % 35)}%` }"
                  />
                  <div
                    class="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"
                    :style="{ width: `${40 + ((i * 7) % 30)}%` }"
                  />
                </div>
                <div
                  class="w-6 h-4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0"
                />
              </div>
            </div>
            <div
              v-else-if="filteredRoles.length === 0"
              class="p-8 text-center text-xs text-slate-400"
            >
              {{ $t("security.roles.noRoleFound") }}
            </div>

            <div v-else>
              <div
                v-for="role in filteredRoles"
                :key="role.id"
                @click="selectRole(role)"
                class="group flex items-center gap-3 px-4 py-3 cursor-pointer border-l-2 transition-all"
                :class="
                  selectedRole?.id === role.id
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-l-purple-500'
                    : 'border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                "
              >
                <div
                  class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                  :class="
                    selectedRole?.id === role.id
                      ? 'bg-purple-500'
                      : 'bg-slate-100 dark:bg-slate-800'
                  "
                >
                  <ShieldCheck
                    :size="13"
                    :class="
                      selectedRole?.id === role.id
                        ? 'text-white'
                        : 'text-slate-500'
                    "
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p
                    class="text-xs font-semibold truncate capitalize"
                    :class="
                      selectedRole?.id === role.id
                        ? 'text-purple-700 dark:text-purple-300'
                        : 'text-slate-800 dark:text-white'
                    "
                  >
                    {{ role.roleName }}
                  </p>
                  <p class="text-[10px] text-slate-400 truncate mt-0.5">
                    {{ role.description || $t("security.roles.noDescription") }}
                  </p>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <span
                    class="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                    :class="
                      selectedRole?.id === role.id
                        ? 'bg-purple-200 text-purple-700 dark:bg-purple-800 dark:text-purple-200'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    "
                    >{{ role.permissions?.length ?? 0 }}</span
                  >
                  <div
                    class="flex opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <button
                      @click.stop="openEditModal(role)"
                      class="p-1 rounded text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      <Pencil :size="11" />
                    </button>
                    <button
                      @click.stop="confirmDelete(role)"
                      class="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 :size="11" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne droite: permissions -->
        <div
          class="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <!-- Empty state -->
          <div
            v-if="!selectedRole"
            class="flex-1 flex flex-col items-center justify-center gap-4"
          >
            <div
              class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
            >
              <ShieldCheck
                :size="28"
                class="text-slate-300 dark:text-slate-600"
              />
            </div>
            <div class="text-center">
              <p
                class="text-sm font-semibold text-slate-500 dark:text-slate-400"
              >
                {{ $t("security.roles.select") }}
              </p>
              <p class="text-xs text-slate-400 mt-1">
                {{ $t("security.roles.selectSubtitle") }}
              </p>
            </div>
          </div>

          <template v-else>
            <!-- Header permissions -->
            <div
              class="px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-xl bg-purple-500 flex items-center justify-center shrink-0"
                >
                  <ShieldCheck :size="14" class="text-white" />
                </div>
                <div>
                  <p
                    class="text-sm font-bold text-slate-800 dark:text-white capitalize"
                  >
                    {{ selectedRole.roleName }}
                  </p>
                  <p class="text-[10px] text-slate-400">
                    {{ selectedPermissions.size }} / {{ allPermissions.length }}
                    {{ $t("security.roles.permissionActives") }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
               
                <button
                  v-if="hasChanges"
                  @click="savePermissions"
                  :disabled="savingPermissions"
                  class="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-sm"
                >
                  <Loader2
                    v-if="savingPermissions"
                    :size="12"
                    class="animate-spin"
                  />
                  <Save v-else :size="12" />
                  {{ $t("common.save") }}
                </button>
              </div>
            </div>

            <!-- Toolbar -->
            <div
              class="px-4 sm:px-5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div class="flex items-center gap-1.5">
                <button
                  @click="selectAll"
                  class="px-2.5 py-1 text-[11px] font-semibold text-purple-600 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                >
                  {{ $t("security.roles.checkAll") }}
                </button>
                <button
                  @click="clearAll"
                  class="px-2.5 py-1 text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {{ $t("security.roles.uncheckALL") }}
                </button>
              </div>
            </div>
            <div v-if="loadingPermissions" class="space-y-2.5">
              <div
                v-for="g in 3"
                :key="g"
                class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div
                  class="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80"
                >
                  <div
                    class="h-2.5 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
                  />
                  <div
                    class="h-4 w-14 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
                  />
                </div>
                <div
                  v-for="p in 3 + (g % 2)"
                  :key="p"
                  class="flex items-center gap-3 px-4 py-2.5 border-t border-slate-100 dark:border-slate-800"
                >
                  <div
                    class="w-4 h-4 rounded bg-slate-100 dark:bg-slate-700 animate-pulse shrink-0"
                  />
                  <div class="flex-1 flex items-center justify-between gap-2">
                    <div
                      class="h-2.5 bg-slate-100 dark:bg-slate-700 rounded animate-pulse"
                      :style="{ width: `${45 + ((p * 13) % 35)}%` }"
                    />
                    <div
                      class="h-4 w-20 bg-slate-100 dark:bg-slate-700 rounded animate-pulse shrink-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Groups -->
            <div v-else class="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar">
              <div
                v-for="(perms, category) in groupedPermissions"
                :key="category"
                class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div
                  @click="toggleCategory(String(category))"
                  class="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div class="flex items-center gap-2">
                    <ChevronRight
                      :size="13"
                      class="text-slate-400 transition-transform duration-200 shrink-0"
                      :class="
                        openCategories.has(String(category)) ? 'rotate-90' : ''
                      "
                    />
                    <span
                      class="text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300"
                      >{{ category }}</span
                    >
                  </div>
                  <div class="flex items-center gap-2">
                    
                    <span
                      class="text-[10px] text-slate-400 font-mono w-8 text-right tabular-nums"
                      >{{ countSelected(perms) }}/{{ perms.length }}</span
                    >
                    <button
                      @click.stop="toggleCategoryAll( perms)"
                      class="text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors"
                      :class="
                        countSelected(perms) === perms.length
                          ? 'text-slate-500 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                          : 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200'
                      "
                    >
                      {{
                        countSelected(perms) === perms.length
                          ? $t('security.roles.uncheck')
                          : $t('security.roles.checkAll')
                      }}
                    </button>
                  </div>
                </div>

                <div v-if="openCategories.has(String(category))">
                  <label
                    v-for="perm in perms"
                    :key="perm.id"
                    class="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors border-t border-slate-100 dark:border-slate-800"
                  >
                    <div
                      class="w-4 h-4 rounded flex items-center justify-center border-2 transition-all shrink-0 cursor-pointer"
                      :class="
                        selectedPermissions.has(perm.id)
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                      "
                      @click="togglePermission(perm.id)"
                    >
                      <Check
                        v-if="selectedPermissions.has(perm.id)"
                        :size="9"
                        class="text-white"
                        :stroke-width="3"
                      />
                    </div>
                    <div
                      class="flex-1 min-w-0 flex items-center justify-between gap-2"
                      @click="togglePermission(perm.id)"
                    >
                      <p
                        class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate"
                      >
                        {{ perm.label }}
                      </p>
                      <code
                        class="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono shrink-0"
                        >{{ perm.name }}</code
                      >
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- ── MODAL: Créer / Modifier ── -->
    <Transition name="modal">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <div
          class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div
            class="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3"
          >
            <div
              class="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0"
            >
              <ShieldCheck :size="15" class="text-purple-500" />
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-sm text-slate-800 dark:text-white">
                {{
                  editingRole
                    ? t("security.roles.modal.editTitle")
                    : t("security.roles.modal.createTitle")
                }}
              </h3>
              <p class="text-[11px] text-slate-400 mt-0.5">
                {{
                  editingRole
                    ? $t("security.roles.modal.edit")
                    : $t("security.roles.modal.access")
                }}
              </p>
            </div>
            <button
              @click="closeModal"
              class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <X :size="15" />
            </button>
          </div>
          <form @submit.prevent="submitRole" class="p-6 space-y-4">
            <div>
              <Input
                v-model="form.name"
                :lb="$t('security.roles.modal.name')"
                :placeholder="$t('security.roles.modal.namePlaceholder')"
                :is-required="true"
              />
            </div>
            <div>
              <label
                class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400 truncate"
                >{{ $t("security.roles.modal.description") }}</label
              >
              <textarea
                v-model="form.description"
                rows="3"
                :placeholder="t('security.roles.modal.descriptionPlaceholder')"
                class="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-purple-500 focus:outline-hidden focus:ring-3 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-purple-800 resize-none"
              />
            </div>
            <div
              v-if="formError"
              class="flex items-center gap-2 text-red-600 text-xs bg-red-50 dark:bg-red-900/20 px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-800"
            >
              <AlertCircle :size="13" class="shrink-0" /> {{ formError }}
            </div>
            <div class="flex gap-3 pt-1">
              <button
                type="button"
                @click="closeModal"
                :disabled="submitting"
                class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {{ $t("common.cancel") }}
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="flex-1 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-bold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Loader2 v-if="submitting" :size="14" class="animate-spin" />
                {{
                  editingRole
                    ? $t("common.update")
                    : $t("security.roles.create")
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- ── MODAL: Supprimer ── -->
    <Transition name="modal">
      <div
        v-if="deleteTarget"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        @click.self="deleteTarget = null"
      >
        <div
          class="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4"
        >
          <div class="flex items-start gap-4">
            <div class="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl shrink-0">
              <Trash2 :size="18" class="text-red-500" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800 dark:text-white text-sm">
                {{ $t("security.roles.deleteRole") }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {{ $t("security.roles.theRole") }}
                <span
                  class="font-bold text-slate-700 dark:text-slate-300 capitalize"
                  >"{{ deleteTarget.roleName }}"</span
                >
                {{ $t("security.roles.deleted") }}
              </p>
            </div>
          </div>
          <div
            class="flex items-start gap-2 px-3 py-2.5 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800"
          >
            <AlertCircle :size="13" class="text-amber-500 mt-0.5 shrink-0" />
            <p class="text-[11px] text-amber-700 dark:text-amber-400">
              {{ t("security.roles.delete.warning") }}
            </p>
          </div>
          <div class="flex gap-3">
            <button
              @click="deleteTarget = null"
              :disabled="deleting"
              class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {{ $t("common.cancel") }}
            </button>
            <button
              @click="deleteRole"
              :disabled="deleting"
              class="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Loader2 v-if="deleting" :size="13" class="animate-spin" />
              <Trash2 v-else :size="13" />
              {{ $t("common.delete") }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  Wifi,
  Power,
  ShieldCheck,
  Key,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronRight,
  Save,
  X,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-vue-next";
import BaseTable from "../../components/Table/BaseTable.vue";
import { subscriptionService } from "../../servicesAPI/subscriptionService";
import { userService } from "../../servicesAPI/userService";
import { roleService } from "../../servicesAPI/roleService";
import { permissionService } from '../../servicesAPI/permissionService'
import { useToastStore } from "../../composables/toast";
import { useAuthStore } from "../../composables/useAuth";
import Input from "../../components/FormElements/Input.vue";

const { t } = useI18n();
const toastStore = useToastStore();
const authStore = useAuthStore();

// ── Tabs ──
const activeTab = ref<"tenants" | "roles">("tenants");

// ── Tenants ──
const allTenants = ref<any[]>([]);
const activeCount = computed(
  () => allTenants.value.filter((t) => t.status !== "canceled").length,
);
const suspendedCount = computed(
  () => allTenants.value.filter((t) => t.status === "canceled").length,
);
const totalCount = computed(() => allTenants.value.length);

const fetchAllTenants = async () => {
  try {
    const res = await subscriptionService.getAll({ limit: 1000 });
    allTenants.value = res.data;
  } catch (e) {
    console.error(e);
  }
};

const tenantColumns = computed(() => [
  { key: "hotel", label: t("security.table.establishment") },
  { key: "module", label: t("security.table.tenant") },
  { key: "status", label: t("security.table.status") },
  { key: "actions", label: "", thClass: "text-right" },
]);

const tenantStatuses = ref<any[]>([]);
const metaData = ref<any>(null);
const isLoading = ref(false);
const loadingStatus = ref(false);

const fetchSubscriptions = async (page = 1) => {
  isLoading.value = true;
  try {
    const res = await subscriptionService.getAll({ page, limit: 10 });
    tenantStatuses.value = res.data;
    metaData.value = res.meta;
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const handlePageChange = (p: number) => fetchSubscriptions(p);

const toggleTenant = async (row: any) => {
  loadingStatus.value = true;
  try {
    const newStatus = row.status === "canceled" ? "active" : "canceled";
    await subscriptionService.patch(row.id);
    row.status = newStatus;
    const found = allTenants.value.find((t) => t.id === row.id);
    if (found) found.status = newStatus;
    toastStore.show({
      message:
        newStatus === "canceled"
          ? t("security.toast.suspended")
          : t("security.toast.restored"),
      type: "success",
    });
  } catch (e) {
    console.error(e);
    toastStore.show({
      message: t("security.toast.updateError"),
      type: "error",
    });
  } finally {
    loadingStatus.value = false;
  }
};

// ── Roles ──
const allRoles = ref<any[]>([]);
const loadingRoles = ref(false);
const searchQuery = ref("");

const filteredRoles = computed(() => {
  const q = searchQuery.value.toLowerCase();
  if (!q) return allRoles.value;
  return allRoles.value.filter(
    (r) =>
      r.roleName.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q),
  );
});

const fetchRoles = async () => {
  loadingRoles.value = true;
  try {
    const res = await userService.getRoleAll();
    allRoles.value = res;
    console.log(res);
  } catch (e) {
    console.error(e);
  } finally {
    loadingRoles.value = false;
  }
};

// ── Permissions ──
const allPermissions = ref<any[]>([]);
const selectedRole = ref<any>(null);
const selectedPermissions = ref<Set<number>>(new Set());
const originalPermissions = ref<Set<number>>(new Set());
const loadingPermissions = ref(false);
const savingPermissions = ref(false);
const openCategories = ref<Set<string>>(new Set());

const fetchPermissions = async () => {
  try {
    const res = await permissionService.getAll({ limit: 500 });
    console.log('permission',res)
    allPermissions.value = res.data ?? res;
  } catch (e) {
    console.error(e);
  }
};

const groupedPermissions = computed(() => {
  const groups: Record<string, any[]> = {};
  for (const p of allPermissions.value) {
    const cat = p.category || "Autres";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(p);
  }
  return groups;
});

const hasChanges = computed(() => {
  if (selectedPermissions.value.size !== originalPermissions.value.size)
    return true;
  for (const id of selectedPermissions.value)
    if (!originalPermissions.value.has(id)) return true;
  return false;
});

const selectRole = (role: any) => {
  selectedRole.value = role
  loadingPermissions.value = true
  const ids = new Set<number>((role.permissions ?? []).map((p: any) => p.id))
  selectedPermissions.value = ids
  originalPermissions.value = new Set(ids)
  for (const cat of Object.keys(groupedPermissions.value)) {
    openCategories.value.add(cat)
  }
  loadingPermissions.value = false
}

const togglePermission = (id: number) => {
  const s = new Set(selectedPermissions.value);
  s.has(id) ? s.delete(id) : s.add(id);
  selectedPermissions.value = s;
};

const selectAll = () => {
  selectedPermissions.value = new Set(allPermissions.value.map((p) => p.id));
};
const clearAll = () => {
  selectedPermissions.value = new Set();
};
const countSelected = (perms: any[]) =>
  perms.filter((p) => selectedPermissions.value.has(p.id)).length;

const toggleCategory = (cat: string) => {
  openCategories.value.has(cat)
    ? openCategories.value.delete(cat)
    : openCategories.value.add(cat);
  openCategories.value = new Set(openCategories.value);
};

const toggleCategoryAll = ( perms: any[]) => {
  const s = new Set(selectedPermissions.value);
  const allChecked = perms.every((p) => s.has(p.id));
  perms.forEach((p) => (allChecked ? s.delete(p.id) : s.add(p.id)));
  selectedPermissions.value = s;
};

const savePermissions = async () => {
  if (!selectedRole.value) return;
  savingPermissions.value = true;
  try {
    await roleService.assignPermissions(selectedRole.value.id, {
      permissionIds: Array.from(selectedPermissions.value),
    });
    originalPermissions.value = new Set(selectedPermissions.value);
    toastStore.show({
      message: t("security.toast.permissionsSaved"),
      type: "success",
    });
    await fetchRoles();
  } catch (e) {
    console.error(e);
    toastStore.show({
      message: t("security.toast.permissionsError"),
      type: "error",
    });
  } finally {
    savingPermissions.value = false;
  }
};

// ── Modal ──
const showModal = ref(false);
const editingRole = ref<any>(null);
const submitting = ref(false);
const formError = ref("");
const form = ref({ name: "", description: "" });

const openCreateModal = () => {
  editingRole.value = null;
  form.value = { name: "", description: "" };
  formError.value = "";
  showModal.value = true;
};
const openEditModal = (role: any) => {
  editingRole.value = role;
  form.value = { name: role.roleName, description: role.description ?? "" };
  formError.value = "";
  showModal.value = true;
};
const closeModal = () => {
  showModal.value = false;
  editingRole.value = null;
  formError.value = "";
};

const submitRole = async () => {
  formError.value = "";
  submitting.value = true;
  try {
    if (editingRole.value) {
      const payloads = {
        name: form.value.name,
        description: form.value.description,
        createdBy: authStore.UserId,
      };
      await roleService.update(editingRole.value.id, payloads);
      toastStore.show({
        message: t("security.toast.updated"),
        type: "success",
      });
    } else {
      const payload = {
        name: form.value.name,
        description: form.value.description,
        lastModifiedBy: authStore.UserId,
      };
      await roleService.create(payload);
      toastStore.show({
        message: t("security.toast.created"),
        type: "success",
      });
    }
    closeModal();
    await fetchRoles();
  } catch (e: any) {
    console.error(e);
    const msg = e?.response?.data?.message;
    toastStore.show({
      message: msg?.includes("ROLE_ALREADY_EXISTS")
        ? t("roles.modal.alreadyExists")
        : (msg ?? t("security.toast.error")),
      type: "error",
    });
  } finally {
    submitting.value = false;
  }
};

// ── Delete ──
const deleteTarget = ref<any>(null);
const deleting = ref(false);

const confirmDelete = (role: any) => {
  deleteTarget.value = role;
};

const deleteRole = async () => {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await roleService.delete(deleteTarget.value.id);
    toastStore.show({ message: t("security.toast.deleted"), type: "success" });
    if (selectedRole.value?.id === deleteTarget.value.id) {
      selectedRole.value = null;
      selectedPermissions.value = new Set();
    }
    deleteTarget.value = null;
    await fetchRoles();
  } catch (e: any) {
    const msg = e?.response?.data?.message;
    toastStore.show({
      message: msg?.includes("assigné")
        ? t("roles.toast.inUse")
        : t("security.toast.deleteError"),
      type: "error",
    });
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  fetchAllTenants();
  fetchSubscriptions(1);
  fetchRoles();
  fetchPermissions();
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
/* Custom thin scrollbar */
.scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
  scrollbar-gutter: stable;
}

.scrollbar::-webkit-scrollbar {
  width: 6px;
}

.scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

.dark .scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}

.dark .scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #6b7280;
}
</style>
