<template>
  <div class="flex min-h-screen bg-bgDark text-textLight">
    <!-- Sidebar -->
    <aside
      class="fixed z-50 inset-y-0 left-0 w-76 bg-bgDark p-4 transition-transform transform lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto custom-scrollbar"
      :class="{ '-translate-x-full': !isSidebarOpen }"
    >
      <button class="absolute top-4 right-4 lg:hidden" @click="toggleSidebar">
        ✕
      </button>
      <sidebar />
    </aside>

    <!-- Main Content -->
    <div class="flex-1">
      <header class="p-4 lg:hidden">
        <button @click="toggleSidebar">☰</button>
      </header>
      <main class="p-4 mb-20 lg:mb-0">
        <slot />
      </main>
    </div>
    <LoadingModal :visible="loading" />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
const { loading } = useLoadingPage();

const route = useRoute();
const isSidebarOpen = ref(false);
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// Close sidebar when route changes (mobile)
watch(
  () => route.path,
  () => {
    isSidebarOpen.value = false;
  },
);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}
</style>
