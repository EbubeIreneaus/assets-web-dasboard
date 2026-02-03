<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-bgLight/50 dark:bg-bgDark/50 transition-opacity"
  >
    <div class="flex flex-col items-center justify-center">
      <img src="/logo.png" alt="Loading..." class="w-20 h-20 animate-bounce" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
});

// Since we are using this with v-if in the parent usually, or we can control internal visibility.
// The user provided <Modal transparent={true} visible={true}> so we assume it should just be rendered when "loading" is true.
// The prop 'visible' allows for flexibility if we want to use v-show instead of v-if.
// For now, checks if prop is visible.
const isVisible = computed(() => props.visible);
</script>
