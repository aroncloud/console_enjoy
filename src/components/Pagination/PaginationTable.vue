<template>
  <div
    v-if="meta && meta.total > meta.perPage"
    class="flex justify-between items-center py-1 space-x-2"
  >
    <!-- Info affichage -->
    <span class="text-xs text-gray-400 font-medium">
      Affichage de {{ startItem }} à {{ endItem }} sur {{ meta.total.toLocaleString() }}
    </span>

    <div class="flex items-center gap-1">
      <!-- Précédent -->
      <button
        :disabled="!meta.previousPageUrl"
        @click="changePage(meta.currentPage - 1)"
        class="p-1.5 border border-gray-200 rounded-md text-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft :size="16" />
      </button>

      <!-- Numéros de page -->
      <template v-for="(p, index) in pages" :key="index">
        <span v-if="p === '...'" class="px-1 text-gray-400">...</span>
        <button
          v-else
          @click="changePage(p as number)"
          :class="[
            'w-8 h-8 rounded-md text-xs font-bold',
            p === meta.currentPage
              ? 'bg-purple-500 text-white'
              : 'text-gray-600 hover:bg-gray-100',
          ]"
        >
          {{ p }}
        </button>
      </template>

      <!-- Suivant -->
      <button
        :disabled="!meta.nextPageUrl"
        @click="changePage(meta.currentPage + 1)"
        class="p-1.5 border border-gray-200 rounded-md text-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Meta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  previousPageUrl?: string | null
  nextPageUrl?: string | null
}

interface Props {
  meta: Meta
  siblingCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  siblingCount: 1,
})

const emit = defineEmits<{
  (e: 'page-change', page: number): void
}>()

const startItem = computed(() =>
  props.meta.total === 0 ? 0 : (props.meta.currentPage - 1) * props.meta.perPage + 1
)

const endItem = computed(() =>
  Math.min(props.meta.currentPage * props.meta.perPage, props.meta.total)
)

const pages = computed<(number | string)[]>(() => {
  const cp = props.meta.currentPage
  const tp = props.meta.lastPage
  const sc = props.siblingCount
  const result: (number | string)[] = []

  if (tp <= 5 + sc * 2) {
    for (let i = 1; i <= tp; i++) result.push(i)
  } else {
    result.push(1)
    const left = Math.max(cp - sc, 2)
    const right = Math.min(cp + sc, tp - 1)
    if (left > 2) result.push('...')
    for (let i = left; i <= right; i++) result.push(i)
    if (right < tp - 1) result.push('...')
    result.push(tp)
  }

  return result
})

function changePage(page: number) {
  const p = Math.min(Math.max(1, page), props.meta.lastPage)
  emit('page-change', p)
}
</script>