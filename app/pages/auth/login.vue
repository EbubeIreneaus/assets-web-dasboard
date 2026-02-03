<script setup lang="ts">
import { ref } from "vue";

definePageMeta({
  layout: "auth",
});

const { loading } = useLoadingPage();
const runtimeConfig = useRuntimeConfig();
const router = useRouter();

const form = ref({
  email: "",
  password: "",
});

const errorMsg = ref("");

const handleLogin = async () => {
  errorMsg.value = "";
  loading.value = true;

  try {
    const res: any = await $fetch(`${runtimeConfig.public.apiURL}/api/auth/`, {
      method: "POST",
      body: {
        email: form.value.email,
        password: form.value.password,
      },
    });

    if (res.success) {
      const authToken = useCookie("authToken");
      authToken.value = res.token;

      if (res.email_verified === false) {
        navigateTo("/auth/verification");
      } else {
        navigateTo("/");
      }
    } else {
      errorMsg.value = res.msg || "Unknown server error";
    }
  } catch (error: any) {
    errorMsg.value =
      error.data?.msg || error.message || "An unexpected error occurred";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md space-y-6">
      <!-- Header -->
      <div class="text-center space-y-1">
        <h1 class="text-xl font-semibold">Welcome Back</h1>
        <p class="text-sm opacity-70">Login to continue to your account</p>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="handleLogin">
        <!-- Error Message -->
        <div
          v-if="errorMsg"
          class="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md"
        >
          {{ errorMsg }}
        </div>

        <!-- Email -->
        <UInput
          v-model="form.email"
          type="email"
          placeholder="Email Address"
          size="xl"
          block
          class="w-full"
          required
        />

        <!-- Password -->
        <UInput
          v-model="form.password"
          type="password"
          placeholder="Password"
          size="xl"
          block
          class="w-full"
          required
        />

        <!-- Forgot -->
        <div class="flex justify-end">
          <NuxtLink to="/auth/reset" class="text-sm text-primary">
            Forgot password?
          </NuxtLink>
        </div>

        <!-- Action -->
        <UButton
          block
          size="xl"
          class="mt-4 text-textLight"
          type="submit"
          :loading="loading"
        >
          Login
        </UButton>
      </form>

      <!-- Footer -->
      <p class="text-center text-sm opacity-70">
        Don’t have an account?
        <NuxtLink to="/auth/register" class="text-primary"> Register </NuxtLink>
      </p>
    </div>
  </div>
</template>
