<script setup lang="ts">
import { ref } from "vue";

definePageMeta({
  layout: "auth",
});

const { loading } = useLoadingPage();
const runtimeConfig = useRuntimeConfig();
const toast = useToast();
const router = useRouter();

const email = ref("");
const errorMessage = ref("");

async function requestOtp() {
  if (!email.value) {
    errorMessage.value = "Please enter your email address";
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    errorMessage.value = "Please enter a valid email address";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/auth/sendOtpWithoutAuth/${email.value}`,
      {
        method: "GET",
      },
    );

    // Assuming API returns success or throws error on 4xx/5xx
    // But check response body if needed, typically $fetch throws on error status
    // The prompt says: make a get request... redirect to /auth/reset/verify?email=email

    toast.add({
      title: "Success",
      description: "OTP has been sent to your email.",
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    router.push(`/auth/reset/verify?email=${encodeURIComponent(email.value)}`);
  } catch (error: any) {
    errorMessage.value =
      error.data?.msg ||
      error.message ||
      "Failed to send OTP. Please try again.";

    toast.add({
      title: "Error",
      description: errorMessage.value,
      color: "error",
      icon: "i-heroicons-x-circle",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md space-y-8">
      <!-- Icon/Header similar to login -->
      <div class="text-center space-y-2">
        <h1 class="text-2xl font-bold">Forgot Password?</h1>
        <p class="text-gray-500 dark:text-gray-400">
          Enter your email address and we'll send you a code to reset your
          password.
        </p>
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md"
      >
        {{ errorMessage }}
      </div>

      <form @submit.prevent="requestOtp" class="space-y-6">
        <UFormField label="Email Address" name="email">
          <UInput
            v-model="email"
            type="email"
            size="xl"
            placeholder="Enter your email"
            icon="i-heroicons-envelope"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          size="xl"
          color="primary"
          variant="solid"
          :loading="loading"
        >
          Send OTP Code
        </UButton>

        <div class="text-center">
          <NuxtLink
            to="/auth/login"
            class="text-sm font-medium text-primary hover:underline"
          >
            Back to Login
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>
