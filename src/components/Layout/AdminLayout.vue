
<template>
  <div class="flex h-screen bg-gray-50">
    <!-- mobile overlay -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
      @click="isSidebarOpen = false"
    ></div>

    <!-- sidebar (hidden on small, slide-in/out) -->
    <Sidebar
      :class="[
        'fixed inset-y-0 left-0 w-60 bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-200 z-50',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0 md:relative md:block',
      ]"
    />

    <div class="flex flex-col flex-1 overflow-hidden">
      <Navbar @toggle-sidebar="toggleSidebar" />
      <main class="flex-1 overflow-y-auto p-6 customer-scrollbar">
        <RouterView />
      </main>
    </div>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
import ToastContainer from '../Toast/ToastContainer.vue'

// track visibility for mobile
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
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