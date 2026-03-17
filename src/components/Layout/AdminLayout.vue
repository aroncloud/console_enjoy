
<template>
  <div class="flex h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
    <!-- mobile overlay -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
      @click="isSidebarOpen = false"
    ></div>

    <!-- sidebar (hidden on small, slide-in/out) -->
    <Sidebar
      @close="isSidebarOpen = false" 
      :class="[
        'fixed inset-y-0 left-0 w-60 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col transform transition-transform duration-200 z-50',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0 md:relative md:block',
      ]"
    />

    <div class="flex flex-col flex-1 overflow-hidden">
      <Navbar @toggle-sidebar="toggleSidebar" />
      <MaintenanceBanner />
      <main class="flex-1 overflow-y-auto p-6 customer-scrollbar bg-gray-50 dark:bg-slate-950">
        <RouterView />
      </main>
    </div>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
import ToastContainer from '../Toast/ToastContainer.vue'
import MaintenanceBanner from '../Announcement/MaintenanceBanner.vue'
import { announcementService } from '../../servicesAPI/announcementService'
import { useAnnouncementStore } from '../../composables/announcement'

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const announcementStore = useAnnouncementStore()

const loadMaintenanceBanner = async () => {
  try {
    const res = await announcementService.getAll({ page: 1, limit: 50, type: 'maintenance', isActive: true })
    announcementStore.maybeSetMaintenanceBanner(res.data, 5)
  } catch {
    announcementStore.setBanner(null)
  }
}

let intervalId: number | undefined

onMounted(() => {
  loadMaintenanceBanner()
  intervalId = window.setInterval(loadMaintenanceBanner, 30 * 60 * 1000)
})

onBeforeUnmount(() => {
  if (intervalId) window.clearInterval(intervalId)
})
</script>
<style scoped>
.customer-scrollbar::-webkit-scrollbar {
  width: 2px;
}
.customer-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.customer-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
.customer-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

</style>
