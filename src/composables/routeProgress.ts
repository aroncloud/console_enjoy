import { ref } from 'vue'

export const routeProgressVisible = ref(false)

export function showRouteProgress() {
  routeProgressVisible.value = true
}

export function hideRouteProgress() {
  routeProgressVisible.value = false
}
