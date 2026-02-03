<script setup lang="ts">
import { ref, onMounted } from "vue";

const toast = useToast();
const runtimeConfig = useRuntimeConfig();

const isLoading = ref(true);
const hasNextOfKin = ref(false);

const nextOfKin = ref<{
  fullname: string;
  email: string;
  phone: string;
  relationship: string;
  address: string;
  country: string;
} | null>(null);

async function fetchNextOfKin() {
  isLoading.value = true;
  try {
    const authToken = useCookie("authToken");
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/auth/next-of-kin`,
      {
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      },
    );

    if (res.success && res.data) {
      nextOfKin.value = res.data;
      hasNextOfKin.value = true;
    } else {
      nextOfKin.value = null;
      hasNextOfKin.value = false;
    }
  } catch (error) {
    // If 404 or other error, assume no NOK or handle gracefully
    nextOfKin.value = null;
    hasNextOfKin.value = false;
  } finally {
    isLoading.value = false;
  }
}

async function deleteNOK() {
  if (
    confirm("Are you sure you want to delete your Next of Kin information?")
  ) {
    try {
      const authToken = useCookie("authToken");
      await $fetch(`${runtimeConfig.public.apiURL}/api/auth/next-of-kin`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      });

      nextOfKin.value = null;
      hasNextOfKin.value = false;

      toast.add({
        title: "Deleted",
        description: "Next of Kin information has been removed.",
        color: "success",
        icon: "i-heroicons-trash",
      });
    } catch (error) {
      toast.add({
        title: "Error",
        description: "Failed to delete Next of Kin information.",
        color: "error",
        icon: "i-heroicons-x-circle",
      });
    }
  }
}

onMounted(() => {
  fetchNextOfKin();
});
</script>

<template>
  <div class="mx-auto px-4 py-6 space-y-8 max-w-3xl">
    <PageTop title="Next of Kin" />

    <!-- Legal Warning/Info Message -->
    <div class="bg-dark rounded-xl p-4 flex gap-4 items-start">
      <UIcon
        name="i-heroicons-information-circle"
        class="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5"
      />
      <p class="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
        If For six months, you have been inactive on your account and failed to
        respond to messages from the company, your Next of Kin is to be contcted
        as to your way about, and with proper Death Certificate and Evidence All
        assets would be immediately transsfered to our next of kin
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <USkeleton class="h-64 w-full" />
    </div>

    <!-- No Next of Kin State -->
    <div
      v-else-if="!hasNextOfKin"
      class="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700"
    >
      <div class="mb-4 flex justify-center">
        <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-full">
          <UIcon name="i-heroicons-user-group" class="w-8 h-8 text-gray-400" />
        </div>
      </div>
      <h3 class="text-lg font-semibold mb-2">No Next of Kin Added</h3>
      <p class="text-gray-500 mb-6 max-w-sm mx-auto">
        Please add your next of kin details to ensure your assets are secure in
        case of unforeseen circumstances.
      </p>
      <UButton
        to="/account/add-next-of-kin"
        size="lg"
        color="primary"
        variant="solid"
        icon="i-heroicons-plus"
        class="text-light"
      >
        Add Next of Kin
      </UButton>
    </div>

    <!-- Next of Kin Details -->
    <div
      v-else
      class="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
    >
      <div
        class="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center"
      >
        <h2 class="text-lg font-semibold">Contact Details</h2>
        <UButton
          color="error"
          variant="ghost"
          icon="i-heroicons-trash"
          size="sm"
          @click="deleteNOK"
        >
          Delete
        </UButton>
      </div>

      <div class="p-6 grid gap-6 md:grid-cols-2" v-if="nextOfKin">
        <div class="space-y-1">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Full Name
          </p>
          <p class="text-base font-medium">{{ nextOfKin.fullname }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Relationship
          </p>
          <p class="text-base font-medium">{{ nextOfKin.relationship }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Email Address
          </p>
          <p class="text-base font-medium">{{ nextOfKin.email }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Phone Number
          </p>
          <p class="text-base font-medium">{{ nextOfKin.phone }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Country
          </p>
          <p class="text-base font-medium">{{ nextOfKin.country }}</p>
        </div>

        <div class="space-y-1 md:col-span-2">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Address
          </p>
          <p class="text-base font-medium">{{ nextOfKin.address }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
