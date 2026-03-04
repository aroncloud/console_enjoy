<script setup lang="ts">
import { Trash2, Loader2 } from 'lucide-vue-next'

interface Props {
  modelValue: boolean      // v-model pour show/hide
  title?: string           // titre de la modale
  itemName?: string        // nom de l'élément à supprimer
  description?: string     // message custom (optionnel)
  loading?: boolean        // état de chargement
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Supprimer l\'élément',
  itemName: '',
  description: '',
  loading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm'): void
}>()

const close = () => {
  if (!props.loading) emit('update:modelValue', false)
}
</script>

<template>
  <Transition name="modal">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="close"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <!-- Card -->
      <div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden modal-card">

        <!-- Bande rouge -->
        <div class="h-1.5 w-full bg-linear-to-r from-red-400 via-red-500 to-rose-500" />

        <!-- Body -->
        <div class="p-6">

          <!-- Icône + titre -->
          <div class="flex items-start gap-4 mb-5">
            <div class="shrink-0 w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
              <Trash2 :size="22" class="text-red-500" />
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-900">{{ title }}</h3>
              <p class="text-sm text-gray-400 mt-0.5">Cette action est irréversible</p>
            </div>
          </div>

          <!-- Message -->
          <div class="rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-5">
            <!-- Slot custom ou message par défaut -->
            <slot name="message">
              <p class="text-sm text-red-700 leading-relaxed">
                Vous êtes sur le point de supprimer
                <span class="font-bold text-red-900">« {{ itemName }} »</span>.
                <template v-if="description">
                  {{ description }}
                </template>
                <template v-else>
                  Cette action ne peut pas être annulée.
                </template>
              </p>
            </slot>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              :disabled="loading"
              @click="close"
              class="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              :disabled="loading"
              @click="emit('confirm')"
              class="flex-[1.5] py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="loading" :size="15" class="animate-spin" />
              <Trash2   v-else        :size="15" />
              {{ loading ? 'Suppression...' : 'Confirmer' }}
            </button>
          </div>

        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .modal-card {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-card {
  transform: scale(0.92) translateY(8px);
  opacity: 0;
}
</style>