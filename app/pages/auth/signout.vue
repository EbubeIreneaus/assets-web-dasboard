<template>
  <div></div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";

definePageMeta({
  layout: "auth",
});

onMounted(() => {
  const authToken = useCookie("authToken");
  authToken.value = null; // Clear the cookie

  // Force redirect to login
  window.location.href = "/auth/login";
});
</script>

<style></style>
