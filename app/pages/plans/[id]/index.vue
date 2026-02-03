<script setup lang="ts">
import { ref, onMounted } from "vue";

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const authToken = useCookie("authToken");
const toast = useToast();

const planId = route.params.id as string;

const plan = ref({
  name: "",
  label: "",
  balance: 0,
  dailyChange: "",
  icon: "/images/plans/real-estate.png", // Default
});

const transactions = ref<any[]>([]);

const actions = [
  { label: "Buy", icon: "/images/icons/buy.png" },
  { label: "Sell", icon: "/images/icons/sell.png" },
  { label: "Swap", icon: "/images/icons/swap.png" },
];

const loading = ref(false);

const fetchPlanDetails = async () => {
  loading.value = true;
  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/investment/plan/${planId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      },
    );

    if (res.success) {
      plan.value = {
        name: res.plan.name,
        label: res.plan.label,
        balance: res.balance,
        dailyChange: `${res.plan.roi}%`,
        icon: res.plan.icon
          ? `${runtimeConfig.public.apiURL}${res.plan.icon}`
          : plan.value.icon,
      };
      transactions.value = res.transactions;
    } else {
      toast.add({
        title: "Error",
        description: "Failed to fetch plan details",
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
    loading.value = false;
  }
};

onMounted(() => {
  fetchPlanDetails();
});
</script>

<template>
  <div class="mx-auto px-4 py-6 space-y-8 bg-dark">
    <LoadingModal :visible="loading" />
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-lg font-semibold">
        {{ plan.label }}
      </h1>
    </div>

    <!-- Balance + Chart -->
    <div class="rounded-xl p-5 space-y-4">
      <div class="text-center space-y-1">
        <p class="text-3xl font-bold" v-money="plan.balance"></p>
        <p class="text-sm text-primary">{{ plan.dailyChange }} Today</p>
      </div>

      <!-- Chart Image -->
      <img
        src="/images/chart_line_graph.png"
        alt="Performance chart"
        class="w-full h-60 object-contain rounded-lg"
      />
    </div>

    <!-- Actions -->
    <div class="flex gap-4">
      <u-button
        icon="mdi:money"
        label="Buy"
        variant="subtle"
        color="primary"
        size="xl"
        :to="`/plans/${planId}/buy`"
      />
      <u-button
        icon="mdi:currency-usd"
        label="Sell"
        color="neutral"
        variant="subtle"
        size="xl"
        :to="`/plans/${planId}/sell`"
      />
      <u-button
        icon="mdi:swap-horizontal-variant"
        label="Swap"
        variant="subtle"
        color="success"
        size="xl"
        :to="`/plans/${planId}/swap`"
      />
    </div>

    <!-- Recent Transactions -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold">Recent Transaction</h2>

      <div v-if="transactions.length > 0">
        <TransactionItem
          v-for="tx in transactions"
          :key="tx.id"
          :transaction="tx"
        />
      </div>
      <div v-else class="text-center text-sm opacity-50 py-4">
        No recent transactions
      </div>
    </div>
  </div>
</template>
