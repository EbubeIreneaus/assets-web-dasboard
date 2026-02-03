<template>
  <div class="flex justify-between mb-10">
    <u-button
      icon="mdi:arrow-left-thick"
      variant="soft"
      size="lg"
      @click="router.back()"
    />
    <h1 class="text-lg font-semibold">{{ title }}</h1>
    <div></div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
defineProps<{ title: string }>();
const router = useRouter()

</script>
