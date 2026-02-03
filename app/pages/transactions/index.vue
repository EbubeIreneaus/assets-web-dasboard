<script setup lang="ts">
import { ref, watch, onMounted } from "vue";

const runtimeConfig = useRuntimeConfig();
const toast = useToast();
const authToken = useCookie("authToken");

interface Transaction {
  id: number;
  type: "deposit" | "withdraw";
  amount: number;
  createdAt: string;
  status: "pending" | "successful" | "failed";
  label: string;
  channel: string;
}

const transactions = ref<Transaction[]>([]);
const fetching = ref(false);

const statusFilter = ref("all");
const typeFilter = ref("all");

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Success", value: "successful" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

const typeOptions = [
  { label: "All Types", value: "all" },
  { label: "Deposit", value: "deposit" },
  { label: "Withdrawal", value: "withdraw" },
];

const fetchTransactions = async () => {
  fetching.value = true;
  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/transaction/all`,
      {
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
        params: {
          status: statusFilter.value,
          category: typeFilter.value,
          offset: 0,
          limit: 100,
        },
      },
    );

    if (res.success) {
      // Direct mapping if API structure matches.
      // The prompt says: { transactions: [ ... ] }
      transactions.value = res.transactions;
    } else {
      toast.add({
        title: "Error",
        description: "Failed to fetch transactions",
        color: "error",
      });
    }
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: "An unknown server error occurred",
      color: "error",
    });
  } finally {
    fetching.value = false;
  }
};

watch([statusFilter, typeFilter], () => {
  fetchTransactions();
});

onMounted(() => {
  fetchTransactions();
});
</script>

<template>
  <div class="mx-auto px-4 py-6 space-y-6 max-w-4xl">
    <PageTop title="Transaction History" />

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4">
      <UFormField label="Status" class="min-w-[150px]">
        <USelect
          v-model="statusFilter"
          :items="statusOptions"
          option-attribute="label"
          value-attribute="value"
          placeholder="Filter by Status"
        />
      </UFormField>
      <UFormField label="Transaction Type" class="min-w-[150px]">
        <USelect
          v-model="typeFilter"
          :items="typeOptions"
          option-attribute="label"
          value-attribute="value"
          placeholder="Filter by Type"
        />
      </UFormField>
    </div>

    <div class="space-y-4">
      <!-- Loading State -->
      <div v-if="fetching" class="space-y-3">
        <USkeleton class="h-20 w-full" v-for="i in 5" :key="i" />
      </div>

      <!-- Transactions List -->
      <div v-else-if="transactions.length > 0" class="flex flex-col gap-3">
        <TransactionItem
          v-for="transaction in transactions"
          :key="transaction.id"
          :transaction="transaction"
        />
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700"
      >
        <p class="text-gray-500">
          No transactions found matching your filters.
        </p>
      </div>
    </div>
  </div>
</template>
