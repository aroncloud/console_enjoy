<template>
  <div class="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen space-y-6">
    <div class="flex items-center gap-3">
      <button
        v-if="hotelId"
        @click="router.back()"
        class="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
      >
        <ArrowLeft class="w-5 h-5 text-slate-500 dark:text-slate-400" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Historique</h1>
        <p class="text-sm text-slate-500 dark:text-slate-300 mt-1">
          {{ hotelId ? `Activités de l'établissement` : 'Toutes les activités de la plateforme' }}
        </p>
      </div>
    </div>

    <HistoryComponent
      :logs="logs"
      :loading="loading"
      :title="hotelId ? `Historique — ${hotelName}` : 'Toutes les activités'"
      :subtitle="meta ? `${meta.total} événements` : ''"
      :show-filters="true"
      :show-hotel-name="!hotelId"
      :meta="meta"
      @page-change="fetchPage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import HistoryComponent from '../../components/History/HistoryComponent.vue'
import { historyService, type ActivityLog } from '../../servicesAPI/historyService'

const route  = useRoute()
const router = useRouter()

const logs    = ref<ActivityLog[]>([])
const meta    = ref<any>(null)
const loading = ref(false)

const hotelId   = computed(() => route.query.hotelId ? Number(route.query.hotelId) : null)
const hotelName = computed(() => route.query.hotelName as string ?? '')

const fetchPage = async (page = 1) => {
  loading.value = true
  try {
    const res = hotelId.value
      ? await historyService.getByHotel(hotelId.value, { page })
      : await historyService.getAll({ page })

      console.log('logs.value',res)
    logs.value = res.data
    meta.value = res.meta
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchPage(1))
</script>