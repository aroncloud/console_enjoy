<template>
  <div class="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col">

    <!-- ── TOOLBAR  -->
    <div
      v-if="title || showSearch || (showFilters && $slots.filters) || $slots.actions"
      class="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-gray-200 bg-white"
    >
      <div class="flex items-center gap-3">
        <h3 v-if="title" class="text-sm font-bold tracking-tight text-gray-900">{{ title }}</h3>
      </div>
      <div class="flex items-center gap-2">
        <slot name="actions" />
        <!-- Filters slot -->
        <template v-if="showFilters && $slots.filters">
          <slot name="filters" />
        </template>
        <!-- Search -->
        <div v-if="showSearch" class="relative flex items-center">
          <svg class="absolute left-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M13 13l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher…"
            class="pl-8 pr-7 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none
                   text-gray-800 placeholder-gray-400 w-52
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:w-64
                   transition-all duration-150"
          />
          <button
            v-if="searchQuery"
            class="absolute right-2 text-gray-400 hover:text-gray-600 text-base leading-none"
            @click="searchQuery = ''"
          >×</button>
        </div>
      </div>
    </div>

    <!-- ── TABLE CONTAINER -->
    <div class="flex-1">

      <!-- Desktop -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50">
              <th
                v-for="col in columns"
                :key="col.key"
                class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap select-none"
                :class="[col.thClass, col.sortable !== false ? 'cursor-pointer group' : '']"
                @click="col.sortable !== false && toggleSort(col.key)"
              >
                <div class="flex items-center gap-1.5">
                  <span>{{ col.label }}</span>
                  <svg
                    v-if="col.sortable !== false"
                    class="w-3 h-4 shrink-0 transition-opacity duration-100"
                    :class="sortKey === col.key ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
                    viewBox="0 0 8 14" fill="none"
                  >
                    <path d="M4 1L1 4.5h6L4 1Z" :fill="sortKey === col.key && sortDir === 'asc' ? '#2563eb' : '#d1d5db'"/>
                    <path d="M4 13L1 9.5h6L4 13Z" :fill="sortKey === col.key && sortDir === 'desc' ? '#2563eb' : '#d1d5db'"/>
                  </svg>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">

            <!-- Skeleton -->
            <template v-if="loading">
              <tr v-for="i in pageSize" :key="`sk-${i}`">
                <td v-for="col in columns" :key="col.key" class="px-4 py-4">
                  <div
                    class="h-3.5 bg-gray-100 rounded-full animate-pulse"
                    :style="{ width: i % 3 === 0 ? '40%' : i % 2 === 0 ? '65%' : '55%' }"
                  />
                </td>
              </tr>
            </template>

            <!-- Empty -->
            <tr v-else-if="paginatedData.length === 0">
              <td :colspan="columns.length" class="py-16 text-center">
                <slot name="empty">
                  <div class="flex flex-col items-center gap-3 text-gray-400">
                    <svg class="w-10 h-10 text-gray-300" viewBox="0 0 48 48" fill="none">
                      <rect x="8" y="10" width="32" height="30" rx="3" stroke="currentColor" stroke-width="1.5"/>
                      <path d="M16 10V8a2 2 0 012-2h12a2 2 0 012 2v2" stroke="currentColor" stroke-width="1.5"/>
                      <path d="M16 22h16M16 29h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    <span class="text-sm">Aucune donnée disponible</span>
                  </div>
                </slot>
              </td>
            </tr>

            <!-- Rows -->
            <template v-else>
              <tr
                v-for="(row, rowIndex) in paginatedData"
                :key="row.id ?? rowIndex"
                class="hover:bg-gray-50 transition-colors"
                :class="onRowClick ? 'cursor-pointer' : ''"
                @click="onRowClick?.(row)"
              >
                <td
                  v-for="col in columns"
                  :key="col.key"
                  class="px-4 py-3.5 text-gray-700 align-middle"
                  :class="col.tdClass"
                >
                  <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                    {{ row[col.key] }}
                  </slot>
                </td>
              </tr>
            </template>

          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="md:hidden p-3 flex flex-col gap-2.5">

        <!-- Skeleton mobile -->
        <template v-if="loading">
          <div v-for="i in pageSize" :key="`sk-m-${i}`" class="border border-gray-100 rounded-lg overflow-hidden bg-white">
            <div class="px-3.5 py-3 bg-gray-50 border-b border-gray-100">
              <div class="h-3.5 bg-gray-100 rounded-full animate-pulse w-2/5" />
            </div>
            <div class="px-3.5 py-3 flex flex-col gap-3">
              <div v-for="j in 3" :key="j" class="flex flex-col gap-1.5">
                <div class="h-2.5 bg-gray-100 rounded-full animate-pulse w-1/4" />
                <div class="h-3 bg-gray-100 rounded-full animate-pulse" :style="{ width: j % 2 === 0 ? '60%' : '45%' }" />
              </div>
            </div>
          </div>
        </template>

        <!-- Empty mobile -->
        <div v-else-if="paginatedData.length === 0" class="py-14 flex flex-col items-center gap-3 text-gray-400">
          <slot name="empty"><span class="text-sm">Aucune donnée disponible</span></slot>
        </div>

        <!-- Cards -->
        <template v-else>
          <div
            v-for="(row, rowIndex) in paginatedData"
            :key="rowIndex"
            class="border border-gray-200 rounded-lg overflow-hidden bg-white transition-all"
            :class="onRowClick ? 'cursor-pointer' : ''"
            @click="onRowClick?.(row)"
          >
            <div class="px-3.5 py-3 bg-gray-50 border-b border-gray-200">
              <slot :name="`cell-${columns[0]?.key}`" :row="row" :value="row[columns[0]?.key]">
                <span class="font-semibold text-sm text-gray-900">{{ row[columns[0]?.key] }}</span>
              </slot>
            </div>
            <div class="px-3.5 py-3 flex flex-col gap-2.5">
              <template v-for="(col, idx) in columns" :key="col.key">
                <div v-if="idx > 0 && col.key !== 'actions'" class="flex flex-col gap-0.5">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">{{ col.label }}</span>
                  <div class="text-sm text-gray-700">
                    <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">{{ row[col.key] }}</slot>
                  </div>
                </div>
              </template>
            </div>
            <div v-if="$slots['cell-actions']" class="px-3.5 py-2.5 border-t border-gray-200 bg-gray-50">
              <slot name="cell-actions" :row="row" />
            </div>
          </div>
        </template>

      </div>
    </div>

    <!-- ── FOOTER -->
    <div class="flex items-center justify-between flex-wrap gap-3 px-5 py-3 border-t border-gray-200 bg-gray-50">
      <!-- Page size -->
      <div class="flex items-center gap-2 text-xs text-gray-400">
        <span>Lignes :</span>
        <select
          v-model="pageSize"
          class="text-xs text-gray-700 bg-white border border-gray-200 rounded-md px-2 py-1 outline-none
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer transition-all"
        >
          <option v-for="n in pageSizeOptions" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>

      <!-- Pagination externe -->
      <Pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total-items="filteredData.length"
        @update:current-page="currentPage = $event"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Pagination from '../../components/Pagination/PaginationTable.vue'
import Select from '../FormElements/Select.vue'

export interface Column {
  key: string
  label: string
  sortable?: boolean
  thClass?: string
  tdClass?: string
}

export interface Props {
  columns: Column[]
  data: Record<string, any>[]
  title?: string
  onRowClick?: (row: Record<string, any>) => void
  defaultPageSize?: number
  showSearch?: boolean
  showFilters?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultPageSize: 10,
  data: () => [],
  showSearch: false,
  showFilters: false,
  loading: false,
})

// ── Sort 
const sortKey = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

const sortedData = computed(() => {
  const source = Array.isArray(props.data) ? props.data : []
  if (!sortKey.value) return [...source]
  return [...source].sort((a, b) => {
    const va = a[sortKey.value!], vb = b[sortKey.value!]
    const cmp = va < vb ? -1 : va > vb ? 1 : 0
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

function toggleSort(key: string) {
  sortKey.value === key
    ? (sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc')
    : ((sortKey.value = key), (sortDir.value = 'asc'))
  currentPage.value = 1
}

// ── Search 
const searchQuery = ref('')
const filteredData = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return sortedData.value
  return sortedData.value.filter(row =>
    props.columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q))
  )
})

// ── Pagination 
const pageSizeOptions = [5, 10, 20, 50]
const pageSize = ref(props.defaultPageSize)
const currentPage = ref(1)

watch([searchQuery, pageSize], () => (currentPage.value = 1))

const paginatedData = computed(() =>
  filteredData.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
)
</script>