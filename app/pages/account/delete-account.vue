<template>
  <div>
    <div class="dialog-overlay">
      <div class="dialog-box bg-bgDark">
        <p>Are you sure you want to delete your account?</p>
        <div class="dialog-actions">
          <button
            @click="deleteAccount"
            class="confirm-button"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Deleting...</span>
            <span v-else>Yes</span>
          </button>
          <button @click="cancel" class="cancel-button" :disabled="isLoading">
            No
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
const router = useRouter();
const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const isLoading = ref(false);

definePageMeta({
  layout: "auth",
});

async function deleteAccount() {
  isLoading.value = true;
  try {
    const authToken = useCookie("authToken");
    const res: any = await $fetch(`${runtimeConfig.public.apiURL}/api/auth`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken.value}`,
      },
    });

    if (res.success) {
      toast.add({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
        color: "success",
        icon: "i-heroicons-check-circle",
      });
      // Clear token and redirect to login
      authToken.value = null;
      navigateTo("/auth/login");
    } else {
      throw new Error(res.msg || "Failed to delete account");
    }
  } catch (error: any) {
    toast.add({
      title: "Error",
      description:
        error.data?.msg ||
        error.message ||
        "Failed to delete account, please try again later.",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
    isLoading.value = false;
  }
}

function cancel() {
  if (window.history.length > 2) {
    router.back();
  } else {
    // Fallback if no history
    navigateTo("/account");
  }
}
</script>

<style>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5); /* Added semi-transparent backdrop */
}

.dialog-box {
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 300px; /* Ensure minimum width */
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.confirm-button {
  background-color: #e53e3e;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button {
  background-color: #718096;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.confirm-button:hover:not(:disabled) {
  background-color: #c53030;
}

.cancel-button:hover:not(:disabled) {
  background-color: #4a5568;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
