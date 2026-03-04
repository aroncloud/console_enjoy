<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToastStore } from '../../composables/toast'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)

function dismiss(id: number) {
  toastStore.dismiss(id)
}
</script>

<template>
  <div class="fixed bottom-0 right-0 pointer-events-none z-[100] flex flex-col-reverse items-end px-4 py-6">
    <div class="w-full max-w-sm flex flex-col gap-3 items-end">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto w-full rounded-xl shadow-lg border bg-white dark:bg-slate-900 px-4 py-3 flex items-start gap-3 transform transition-all duration-200"
        :class="[
          toast.type === 'success'
            ? 'border-emerald-100 dark:border-emerald-700'
            : toast.type === 'error'
              ? 'border-red-100 dark:border-red-700'
              : toast.type === 'warning'
                ? 'border-amber-100 dark:border-amber-700'
                : 'border-slate-200 dark:border-slate-700'
        ]"
      >
        <div
          class="flex items-center justify-center rounded-full w-8 h-8 flex-shrink-0"
          :class="[
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'
              : toast.type === 'error'
                ? 'bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300'
                : toast.type === 'warning'
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          ]"
        >
          <CheckCircle v-if="toast.type === 'success'" :size="18" />
          <XCircle v-else-if="toast.type === 'error'" :size="18" />
          <AlertTriangle v-else-if="toast.type === 'warning'" :size="18" />
          <Info v-else :size="18" />
        </div>
        <div class="flex-1 min-w-0">
          <p v-if="toast.title" class="text-sm font-semibold text-slate-900 dark:text-white">
            {{ toast.title }}
          </p>
          <p class="text-sm text-slate-700 dark:text-slate-200" :class="{ 'mt-0.5': toast.title }">
            {{ toast.message }}
          </p>
        </div>
        <button
          type="button"
          class="ml-2 flex-shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          @click="dismiss(toast.id)"
        >
          <X :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>