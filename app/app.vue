<script setup>
const isLoading = ref(true);

onMounted(() => {
  // Small timeout to ensure smooth transition
  setTimeout(() => {
    isLoading.value = false;
  }, 800);

  window.gtranslateSettings = {
    default_language: "en",
    wrapper_selector: ".gtranslate_wrapper",
    switcher_open_direction: "top",
    flag_style: "3d",
  };

  const gt_script = document.createElement("script");
  gt_script.setAttribute(
    "src",
    "https://cdn.gtranslate.net/widgets/latest/float.js"
  );
  gt_script.setAttribute("defer", true);
  document.head.appendChild(gt_script);
});

</script>

<template>
  <div>
    <UApp>
      <div>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
        <div class="gtranslate_wrapper"></div>
      </div>
    </UApp>
    <div
      v-if="isLoading"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-primary transition-opacity duration-500"
    >
      <img src="/logo.png" alt="Logo" class="w-32 h-auto animate-pulse" />
    </div>
  </div>
</template>
