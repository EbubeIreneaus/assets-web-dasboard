<script setup lang="ts">
import { computed } from "vue";

interface Transaction {
  id: string | number;
  type: "deposit" | "withdraw";
  amount: string | number; // Formatting handled by parent or string format
  createdAt: string;
  status: "pending" | "successful" | "failed";
  label: string;
}

const props = defineProps<{
  transaction: Transaction;
}>();

const statusColor = computed(() => {
  switch (props.transaction.status) {
    case "successful":
      return "text-green-500 bg-green-50 dark:bg-green-900/20";
    case "failed":
      return "text-red-500 bg-red-50 dark:bg-red-900/20";
    case "pending":
      return "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
    default:
      return "text-gray-500 bg-gray-50 dark:bg-gray-900/20";
  }
});

const statusLabel = computed(() => {
  return props.transaction.status
    ? props.transaction.status.charAt(0).toUpperCase() +
        props.transaction.status.slice(1)
    : "Unknown";
});

const iconName = computed(() => {
  return props.transaction.type !== "withdraw"
    ? "i-heroicons-arrow-down-left"
    : "i-heroicons-arrow-up-right";
});

const iconColor = computed(() => {
  return props.transaction.type !== "withdraw"
    ? "text-green-500"
    : "text-red-500";
});
</script>

<template>
  <NuxtLink
    :to="`/transactions/${transaction.id}`"
    class="flex items-center justify-between p-4 bg-white dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors shadow-sm"
  >
    <div class="flex items-center gap-4">
      <!-- Icon -->
      <div
        class="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"
      >
        <UIcon :name="iconName" class="w-5 h-5" :class="iconColor" />
      </div>

      <!-- Label & Date -->
      <div>
        <h4 class="font-semibold text-gray-900 dark:text-gray-100">
          {{ transaction.label }}
        </h4>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ new Date(transaction.createdAt).toLocaleDateString() }}
        </p>
      </div>
    </div>

    <!-- Amount & Status -->
    <div class="text-right">
      <p
        class="font-bold text-gray-900 dark:text-gray-100"
        :class="
          transaction.type === 'deposit'
            ? 'text-green-600 dark:text-green-400'
            : ''
        "
      >
        {{ transaction.type != "withdraw" ? "+" : "-" }}{{ transaction.amount }}
      </p>
      <span
        class="inline-block px-2 py-0.5 rounded text-xs font-medium mt-1"
        :class="statusColor"
      >
        {{ statusLabel }}
      </span>
    </div>
  </NuxtLink>
</template>
