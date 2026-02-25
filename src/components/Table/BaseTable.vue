<template>
  <div class="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    
    <!-- Header optionnel -->
    <div v-if="title || $slots.actions" class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <h3 v-if="title" class="text-base font-semibold text-gray-800">{{ title }}</h3>
      <slot name="actions" />
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        
        <!-- Thead -->
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
              :class="col.thClass"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>

        <!-- Tbody -->
        <tbody class="divide-y divide-gray-50">
          
          <!-- Empty state -->
          <tr v-if="data.length === 0">
            <td :colspan="columns.length" class="text-center py-12 text-gray-400 text-sm">
              <slot name="empty">
                Aucune donnée disponible
              </slot>
            </td>
          </tr>

          <!-- Rows -->
          <tr
            v-for="(row, rowIndex) in data"
            :key="rowIndex"
            class="hover:bg-purple-50 transition-colors"
            :class="onRowClick ? 'cursor-pointer' : ''"
            @click="onRowClick?.(row)"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-5 py-4 text-gray-700"
              :class="col.tdClass"
            >
              <!-- Slot personnalisé par colonne -->
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>

        </tbody>
      </table>
    </div>

    <!-- Footer optionnel (pagination etc.) -->
    <div v-if="$slots.footer" class="px-5 py-3 border-t border-gray-100">
      <slot name="footer" />
    </div>

  </div>
</template>

<script setup lang="ts">
export interface Column {
  key: string
  label: string
  thClass?: string
  tdClass?: string
}

export interface Props<T extends Record<string, any>> {
  columns: Column[]
  data: T[]
  title?: string
  onRowClick?: (row: T) => void
}

// Typage générique en defineProps
const props = defineProps<Props<Record<string, any>>>()
</script>