<script setup lang="ts">
import { ref, computed } from "vue";

const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const isLoading = ref(false);

const form = ref({
  current: "",
  new: "",
  confirm: "",
});

const passwordsMatch = computed(() => {
  return form.value.new && form.value.new === form.value.confirm;
});

const isLengthValid = computed(() => {
  return form.value.new.length > 6 && form.value.confirm.length > 6;
});

const isValid = computed(() => {
  return (
    form.value.current &&
    form.value.new &&
    passwordsMatch.value &&
    isLengthValid.value
  );
});

async function updatePassword() {
  if (!passwordsMatch.value) {
    toast.add({
      title: "Error",
      description: "New passwords do not match.",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
    return;
  }

  if (!isLengthValid.value) {
    toast.add({
      title: "Error",
      description: "Password must be greater than 6 characters.",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
    return;
  }

  isLoading.value = true;

  try {
    const authToken = useCookie("authToken");
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/auth/change-password`,
      {
        method: "POST",
        body: {
          current: form.value.current,
          new: form.value.new,
          confirm: form.value.confirm,
        },
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      },
    );

    if (res.success) {
      toast.add({
        title: "Success",
        description: "Your password has been changed successfully.",
        color: "success",
        icon: "i-heroicons-check-circle",
      });

      // Redirect to home
      navigateTo("/");
    } else {
      throw new Error(res.msg || "Failed to save password");
    }
  } catch (error: any) {
    toast.add({
      title: "Error",
      description:
        error.data?.msg ||
        error.message ||
        "Failed to save password, unknown server error.",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto px-4 py-6 space-y-8 max-w-2xl">
    <PageTop title="Change Password" />

    <div
      class="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6"
    >
      <div class="space-y-1">
        <h2 class="text-lg font-semibold">Security settings</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Ensure your account is secure by using a strong password.
        </p>
      </div>

      <form @submit.prevent="updatePassword" class="space-y-5">
        <UFormField label="Current Password" name="current" required>
          <UInput
            v-model="form.current"
            type="password"
            size="xl"
            placeholder="Enter your current password"
            icon="i-heroicons-lock-closed"
            class="w-full"
          />
        </UFormField>

        <UFormField label="New Password" name="new" required>
          <UInput
            v-model="form.new"
            type="password"
            size="xl"
            placeholder="Enter new password"
            icon="i-heroicons-key"
            class="w-full"
          />
          <template #help>
            <span
              :class="{
                'text-green-500': form.new.length > 6,
                'text-gray-500': form.new.length <= 6,
              }"
            >
              Must be greater than 6 characters
            </span>
          </template>
        </UFormField>

        <UFormField
          label="Confirm New Password"
          name="confirm"
          required
          :error="
            form.confirm && !passwordsMatch
              ? 'Passwords do not match'
              : undefined
          "
        >
          <UInput
            v-model="form.confirm"
            type="password"
            size="xl"
            placeholder="Confirm new password"
            icon="i-heroicons-key"
            class="w-full"
          >
            <template #trailing>
              <UIcon
                v-if="passwordsMatch && form.confirm"
                name="i-heroicons-check-circle"
                class="w-5 h-5 text-green-500"
              />
            </template>
          </UInput>
        </UFormField>

        <div class="pt-2 flex justify-end">
          <UButton
            type="submit"
            size="xl"
            color="primary"
            variant="solid"
            label="Update Password"
            :loading="isLoading"
            :disabled="!isValid"
            block
            class="w-full md:w-auto min-w-[150px] text-light"
          />
        </div>
      </form>
    </div>
  </div>
</template>
