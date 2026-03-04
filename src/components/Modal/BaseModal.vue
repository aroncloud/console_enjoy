<template>
  <Transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="close"
    >
      <div :class="['bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-2xl', customClass]">

        <!-- header slot with close button -->
        <div v-if="$slots.header" class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <slot name="header" />
          <button @click="close" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X :size="18" class="text-slate-500" />
          </button>
        </div>

        <!-- default slot for body -->
        <div class="p-6">
          <slot />
        </div>

        <!-- footer slot -->
        <div v-if="$slots.footer" class="px-6 py-4 border-t border-slate-200">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  customClass: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
