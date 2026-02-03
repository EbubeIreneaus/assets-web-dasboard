<script setup lang="ts">
import { ref, computed } from "vue";

definePageMeta({
  layout: "auth",
});

const { loading } = useLoadingPage();
const runtimeConfig = useRuntimeConfig();
const toast = useToast();
const router = useRouter();
const authToken = useCookie("authToken");

const newPassword = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");
const showPassword = ref(false);

const passwordsMatch = computed(() => {
  return newPassword.value === confirmPassword.value;
});

const isValidLength = computed(() => {
  return newPassword.value.length >= 7;
});

async function resetPassword() {
  if (!passwordsMatch.value) {
    errorMessage.value = "Passwords do not match.";
    return;
  }
  if (!isValidLength.value) {
    errorMessage.value = "Password must be at least 7 characters long.";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/auth/reset-password`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
        body: {
          current: "", // As requested
          new: newPassword.value,
          confirm: confirmPassword.value,
        },
      },
    );

    if (res.success) {
      toast.add({
        title: "Password Reset",
        description: "Your password has been reset successfully. Please login.",
        color: "success",
        icon: "i-heroicons-check-circle",
      });

      // Clear token and redirect to login
      authToken.value = null;
      router.push("/auth/login");
    } else {
      errorMessage.value = res.msg || "Failed to reset password.";
      toast.add({
        title: "Error",
        description: errorMessage.value,
        color: "error",
        icon: "i-heroicons-x-circle",
      });
    }
  } catch (error: any) {
    errorMessage.value =
      error.data?.msg ||
      error.message ||
      "An unknown error occurred. Please try again.";

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
      <!-- Header -->
      <div class="text-center space-y-2">
        <h1 class="text-2xl font-bold">Set New Password</h1>
        <p class="text-gray-500 dark:text-gray-400">
          Your identity has been verified. Create a new password for your
          account.
        </p>
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md"
      >
        {{ errorMessage }}
      </div>

      <form @submit.prevent="resetPassword" class="space-y-6">
        <UFormField label="New Password" name="newPassword" required>
          <UInput
            v-model="newPassword"
            :type="showPassword ? 'text' : 'password'"
            size="xl"
            placeholder="Enter new password"
            icon="i-heroicons-lock-closed"
            class="w-full"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                icon="i-heroicons-eye"
                :padded="false"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <UFormField label="Confirm Password" name="confirmPassword" required>
          <UInput
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            size="xl"
            placeholder="Confirm new password"
            icon="i-heroicons-lock-closed"
            class="w-full"
          />
        </UFormField>

        <div class="text-xs text-gray-500 space-y-1">
          <p
            :class="{
              'text-green-500': isValidLength,
              'text-red-500': !isValidLength && newPassword,
            }"
          >
            <UIcon
              :name="isValidLength ? 'i-heroicons-check' : 'i-heroicons-x-mark'"
              class="w-3 h-3 inline mr-1"
            />
            At least 7 characters
          </p>
          <p
            :class="{
              'text-green-500': passwordsMatch && newPassword,
              'text-red-500': !passwordsMatch && confirmPassword,
            }"
          >
            <UIcon
              :name="
                passwordsMatch && newPassword
                  ? 'i-heroicons-check'
                  : 'i-heroicons-x-mark'
              "
              class="w-3 h-3 inline mr-1"
            />
            Passwords match
          </p>
        </div>

        <UButton
          type="submit"
          block
          size="xl"
          color="primary"
          variant="solid"
          :loading="loading"
        >
          Reset Password
        </UButton>
      </form>
    </div>
  </div>
</template>
