<template>
  <div>
    <slot />
    <LoadingModal :visible="loading" />
  </div>
</template>

<script setup lang="ts">
const { loading } = useLoadingPage();
</script>
