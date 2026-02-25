<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      sizeClasses,
      variantClasses,
      disabledClasses,
    ]"
  >
    <!-- Left Icon -->
    <component
      v-if="iconLeft"
      :is="iconLeft"
      :class="iconSizeClasses"
    />

    <!-- Text / Slot -->
    <span v-if="label">{{ label }}</span>
    <slot v-else />

    <!-- Right Icon -->
    <component
      v-if="iconRight"
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
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  iconLeft?: unknown
  iconRight?: unknown
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// Size classes
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm'
    case 'lg':
      return 'px-6 py-3 text-lg'
    case 'md':
    default:
      return 'px-4 py-2 text-base'
  }
})

// Icon size classes
const iconSizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-4 h-4'
    case 'lg':
      return 'w-6 h-6'
    case 'md':
    default:
      return 'w-5 h-5'
  }
})

// Variant classes
const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
    case 'secondary':
      return 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400'
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    case 'ghost':
      return 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400'
    default:
      return ''
  }
})

// Disabled classes
const disabledClasses = computed(() => {
  if (props.disabled) {
    return 'opacity-50 cursor-not-allowed'
  }
  return 'cursor-pointer'
})
</script>
