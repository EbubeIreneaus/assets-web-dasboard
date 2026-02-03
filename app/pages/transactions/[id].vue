<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";

const route = useRoute();
const router = useRouter();
const id = route.params.id;
const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const authToken = useCookie("authToken");

const fetching = ref(false);
const transaction = ref<any>(null);

// Styling Logics
const statusColor = computed(() => {
  if (!transaction.value) return "";
  switch (transaction.value.status) {
    case "success":
    case "successful":
      return "text-green-500 bg-green-50 dark:bg-green-900/20 ring-green-500/20";
    case "failed":
      return "text-red-500 bg-red-50 dark:bg-red-900/20 ring-red-500/20";
    case "pending":
      return "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 ring-yellow-500/20";
    default:
      return "text-gray-500 bg-gray-50 dark:bg-gray-900/20 ring-gray-500/20";
  }
});

const statusIcon = computed(() => {
  if (!transaction.value) return "";
  switch (transaction.value.status) {
    case "success":
    case "successful":
      return "i-heroicons-check-circle";
    case "failed":
      return "i-heroicons-x-circle";
    case "pending":
      return "i-heroicons-clock";
    default:
      return "i-heroicons-question-mark-circle";
  }
});

const fetchTransaction = async () => {
  fetching.value = true;
  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/transaction/one/${id}`,
      {
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      },
    );

    if (res.success) {
      transaction.value = res.transaction;
    } else {
      toast.add({
        title: "Error",
        description: res.msg || "Failed to fetch transaction details",
        color: "error",
      });
    }
  } catch (error: any) {
    toast.add({
      title: "Error",
      description:
        error.data?.msg || error.message || "An unknown server error occurred",
      color: "error",
    });
  } finally {
    fetching.value = false;
  }
};

onMounted(() => {
  fetchTransaction();
});
</script>

<template>
  <div class="mx-auto px-4 py-6 space-y-6 max-w-lg">
    <PageTop title="Transaction Details" />

    <div v-if="fetching" class="space-y-4">
      <USkeleton class="h-64 w-full rounded-2xl" />
    </div>

    <div
      v-else-if="transaction"
      class="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
    >
      <!-- Header / Status Icon -->
      <div
        class="flex flex-col items-center py-8 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800"
      >
        <div
          class="w-20 h-20 rounded-full flex items-center justify-center ring-8 mb-4"
          :class="statusColor"
        >
          <UIcon :name="statusIcon" class="w-10 h-10" />
        </div>

        <h2 class="text-3xl font-bold py-2">
          {{ transaction.type === "deposit" ? "+" : "-" }}${{
            transaction.amount
          }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 capitalize">
          {{ transaction.status }} Transaction
        </p>
      </div>

      <!-- Details List -->
      <div class="p-6 space-y-4">
        <div
          class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800/50"
        >
          <span class="text-sm text-gray-500 dark:text-gray-400">Type</span>
          <span class="font-medium capitalize">{{ transaction.type }}</span>
        </div>

        <div
          class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800/50"
        >
          <span class="text-sm text-gray-500 dark:text-gray-400">Label</span>
          <span class="font-medium">{{ transaction.label }}</span>
        </div>

        <div
          class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800/50"
        >
          <span class="text-sm text-gray-500 dark:text-gray-400">Date</span>
          <span class="font-medium">{{
            new Date(transaction.createdAt).toLocaleDateString()
          }}</span>
        </div>

        <div
          class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800/50"
        >
          <span class="text-sm text-gray-500 dark:text-gray-400">Time</span>
          <span class="font-medium">{{
            new Date(transaction.createdAt).toLocaleTimeString()
          }}</span>
        </div>

        <div
          class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800/50"
        >
          <span class="text-sm text-gray-500 dark:text-gray-400">Channel</span>
          <span class="font-medium">{{ transaction.channel }}</span>
        </div>

        <div
          v-if="transaction.id"
          class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800/50"
        >
          <span class="text-sm text-gray-500 dark:text-gray-400"
            >Reference</span
          >
          <span
            class="font-medium text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded"
            >{{ transaction.id }}</span
          >
        </div>
      </div>

      <div class="p-6 pt-0">
        <UButton
          block
          size="xl"
          variant="soft"
          color="neutral"
          @click="router.push('/transactions')"
        >
          Back to History
        </UButton>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else
      class="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700"
    >
      <p class="text-gray-500">Transaction not found.</p>
      <UButton
        class="mt-4"
        variant="soft"
        color="primary"
        @click="router.push('/transactions')"
      >
        Go Back
      </UButton>
    </div>
  </div>
</template>
