<script setup lang="ts">
import { ref, onMounted } from "vue";

const runtimeConfig = useRuntimeConfig();
const authToken = useCookie("authToken");
const toast = useToast();

const investmentSummary = ref({
  totalInvested: 0,
  totalGain: 0,
});

const plans = ref<any[]>([]);
const loading = ref(false);

const fetchPlans = async () => {
  loading.value = true;
  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/investment/trading-plan`,
      {
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      },
    );

    if (res.success) {
      investmentSummary.value = {
        totalInvested: res.account?.total_invested ?? 0,
        totalGain: res.account?.total_gain ?? 0,
      };
      plans.value = res.plans.map((plan: any) => ({
        ...plan,
        to: `/plans/${plan.name}`,
        icon: plan.icon
          ? `${runtimeConfig.public.apiURL}${plan.icon}`
          : "/images/plans/real-estate.png",
        gain: `${plan.roi}%`,
      }));
    } else {
      toast.add({
        title: "Error",
        description: "Failed to fetch investment plans",
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
  fetchPlans();
});
</script>

<template>
  <div class="mx-auto px-4 py-6 space-y-6">
      <LoadingModal :visible="loading" />
    <!-- Header -->
    <PageTop title="Market Plan" />

    <!-- Investment Summary -->
    <div class="rounded-xl bg-dark p-5 space-y-4 mb-5">
      <h2 class="text-base font-semibold">My Investment</h2>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-2xl font-bold">
          <p class="text-2xl font-bold" v-money="investmentSummary.totalInvested"></p>
          </p>
          <p class="text-sm text-primary">Total Invested</p>
        </div>

        <div>
          <p class="text-2xl font-bold">
          <p class="text-2xl font-bold" v-money="investmentSummary.totalGain"></p>
          </p>
          <p class="text-sm text-primary">Total Gain</p>
        </div>
      </div>

      <div class="border-t border-slate-800/50 pt-4 space-y-3 text-sm">
        <div class="flex justify-between">
          <span>Total Value $</span>
          <span v-money="investmentSummary.totalInvested"></span>
        </div>

        <div class="flex justify-between">
          <span>Total Gain $</span>
          <span v-money="investmentSummary.totalGain"></span>
        </div>
      </div>
    </div>

    <!-- Investment Plans -->
    <div class="space-y-4 mt-10">
      <h3 class="font-semibold">INVESTMENT PLANS</h3>
      <p class="text-sm text-primary">Daily Percentage Gain</p>

      <NuxtLink
        v-for="plan in plans"
        :key="plan.name"
        :to="plan.to"
        class="flex items-center justify-between p-4 bg-dark hover:bg-slate-800 transition"
      >
        <div class="flex items-center gap-4">
          <img
            :src="plan.icon"
            :alt="plan.name"
            class="h-8 w-8 object-contain"
          />
          <span class="font-medium text-sm">
            {{ plan.label }}
          </span>
        </div>

        <span class="px-3 py-1 rounded-lg bg-slate-800 text-sm">
          {{ plan.gain }}
        </span>
      </NuxtLink>
    </div>
  </div>
</template>
