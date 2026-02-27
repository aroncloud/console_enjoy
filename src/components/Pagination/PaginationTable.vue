<template>
  <div class="flex justify-between items-center py-1 space-x-2">
    <span class="text-xs text-gray-400 font-medium">
      Affichage de {{ startItem }} à {{ endItem }} sur {{ totalItems.toLocaleString() }}
    </span>

    <div class="flex items-center gap-1">
      <!-- previous button -->
      <button
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
        class="p-1.5 border border-gray-200 rounded-md text-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft :size="16" />
      </button>

      <!-- page numbers -->
      <template v-for="(p, index) in pages" :key="index">
        <span
          v-if="p === '...'
          "
          class="px-1 text-gray-400"
        >
          ...
        </span>
        <button
          v-else
          @click="changePage(p as number)"
          :class="[
            'w-8 h-8 rounded-md text-xs font-bold',
            p === currentPage
              ? 'bg-purple-500 text-white'
              : 'text-gray-600 hover:bg-gray-100',
          ]"
        >
          {{ p }}
        </button>
      </template>

      <!-- next button -->
      <button
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
        class="p-1.5 border border-gray-200 rounded-md text-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Props {
  currentPage: number
  pageSize: number
  totalItems: number
  // how many page buttons to show around current (not counting first/last)
  siblingCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  siblingCount: 1,
})

// emit signatures using call overloads (avoids TS misinterpreting arrow types)
const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
  (e: 'page-change', page: number): void
}>()

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(props.totalItems / props.pageSize))
})

const startItem = computed(() => {
  return props.totalItems === 0 ? 0 : (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  return Math.min(props.totalItems, props.currentPage * props.pageSize)
})

// compute array of page labels (numbers or '...')
const pages = computed<(number | string)[]>(() => {
  const cp = props.currentPage
  const tp = totalPages.value
  const sc = props.siblingCount
  const result: (number | string)[] = []

  if (tp <= 5 + sc * 2) {
    for (let i = 1; i <= tp; i++) result.push(i)
  } else {
    // always include first and last
    result.push(1)
    let left = Math.max(cp - sc, 2)
    let right = Math.min(cp + sc, tp - 1)

    if (left > 2) {
      result.push('...')
    }

    for (let i = left; i <= right; i++) {
      result.push(i)
    }

    if (right < tp - 1) {
      result.push('...')
    }

    result.push(tp)
  }

  return result
})

// handle page change and emit events
function changePage(page: number) {
  const p = Math.min(Math.max(1, page), totalPages.value)
  emit('update:currentPage', p)
  emit('page-change', p)
}

// watch for external currentPage prop updates
watch(
  () => props.currentPage,
  (newVal) => {
    if (newVal < 1 && totalPages.value > 0) {
      changePage(1)
    } else if (newVal > totalPages.value) {
      changePage(totalPages.value)
    }
  }
)
</script>
