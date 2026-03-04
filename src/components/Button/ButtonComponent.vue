<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    @click="emit('click', $event)"
    :aria-busy="loading"
    :class="[
      // Base
      'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 active:scale-[0.98]',
      'focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-900',
      
      // Dynamic classes
      sizeClasses,
      variantClasses,
      disabledClasses,
      loadingClasses
    ]"
  >
    <!-- Loading Spinner -->
    <svg 
      v-if="loading" 
      class="animate-spin -ml-1 mr-1 h-4 w-4 text-current" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>

    <!-- Left Icon (si pas de loading) -->
    <component
      v-if="iconLeft && !loading"
      :is="iconLeft"
      :class="iconSizeClasses"
    />

    <!-- Label / Slot -->
    <span v-if="label" class="truncate">{{ label }}</span>
    <slot v-else />

    <!-- Right Icon -->
    <component
      v-if="iconRight && !loading"
      :is="iconRight"
      :class="iconSizeClasses"
    />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  iconLeft?: any
  iconRight?: any
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// --- Classes de Tailles ---
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'px-3 py-1.5 text-xs'
    case 'lg': return 'px-6 py-3 text-base '
    default:   return 'px-4 py-2.5 text-sm'
  }
})

const iconSizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-3.5 h-3.5'
    case 'lg': return 'w-5 h-5'
    default:   return 'w-4 h-4 text-inherit opacity-90'
  }
})

// --- Classes de Variantes (Bleu / Slate pour coller à votre UI) ---
const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':   
      return 'bg-purple-500 text-white hover:bg-purple-600 focus:ring-purple-500'
    
    case 'secondary': 
      return 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
    
    case 'outline': 
      return 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
    
    case 'danger':    
      return 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-400 '
    
    case 'ghost':     
      return 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:ring-slate-200 dark:hover:bg-slate-800 dark:text-slate-400'
    
    default: return ''
  }
})

const disabledClasses = computed(() =>
  (props.disabled || props.loading) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
)

const loadingClasses = computed(() =>
  props.loading ? 'pointer-events-none' : ''
)
</script>