<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";

const router = useRouter();
const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const authToken = useCookie("authToken");

const fromPlan = ref("");
const toPlan = ref("");
const amount = ref<number | null>(null);
const loading = ref(false);
const fetching = ref(false);

const plans = ref<any[]>([]);

const quickAmounts = [100, 200, 500, 1000, 2000, 5000, 10000];

const destinationOptions = computed(() => {
  // Filter out the selected source plan from destination options to prevent swapping to same plan
  return plans.value.filter((p) => p.value !== fromPlan.value);
});

// Watch source plan change to ensure destination is valid
watch(fromPlan, (newValue) => {
  if (toPlan.value === newValue) {
    toPlan.value = "";
  }
});

const fetchPlans = async () => {
  fetching.value = true;
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
      plans.value = res.plans.map((p: any) => ({
        label: p.label,
        value: p.name,
      }));

      if (plans.value.length > 0) {
        fromPlan.value = plans.value[0].value;
        if (plans.value.length > 1) {
          toPlan.value = plans.value[1].value;
        }
      }
    } else {
      toast.add({
        title: "Error",
        description: "Failed to fetch plans",
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

const handleConvert = async () => {
  if (!amount.value || amount.value <= 0) {
    toast.add({
      title: "Error",
      description: "Please enter a valid amount",
      color: "error",
    });
    return;
  }

  if (!fromPlan.value || !toPlan.value) {
    toast.add({
      title: "Error",
      description: "Please select both source and destination plans",
      color: "error",
    });
    return;
  }

  if (fromPlan.value === toPlan.value) {
    toast.add({
      title: "Error",
      description: "Source and destination plans cannot be the same",
      color: "error",
    });
    return;
  }

  loading.value = true;

  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/investment/swap-plan`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
        body: {
          source: fromPlan.value,
          amount: amount.value,
          destination: toPlan.value,
        },
      },
    );

    if (res.success) {
      toast.add({
        title: "Success",
        description: "Plan converted successfully",
        color: "success",
      });
      router.push("/plans");
    } else {
      toast.add({
        title: "Error",
        description: res.msg || "Failed to convert plan",
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
    loading.value = false;
  }
};

onMounted(() => {
  fetchPlans();
});
</script>

<template>
  <div class="mx-auto px-4 py-6 space-y-6">
    <LoadingModal :visible="fetching" />
    <!-- Header -->
    <PageTop title="Convert Plan" />

    <!-- From -->
    <div class="space-y-2">
      <p class="text-sm opacity-80">Source</p>
      <USelect
        v-model="fromPlan"
        :items="plans"
        size="xl"
        class="max-w-xl w-full"
      />
    </div>

    <!-- To -->
    <div class="space-y-2">
      <p class="text-sm opacity-80">Destination</p>
      <USelect
        v-model="toPlan"
        :items="destinationOptions"
        size="xl"
        class="max-w-xl w-full"
      />
    </div>

    <!-- Amount -->
    <div class="space-y-2">
      <p class="text-sm text-primary">Amount in USD ($):</p>

      <UInput
        v-model="amount"
        type="number"
        placeholder="0"
        size="xl"
        class="max-w-xl w-full"
      />
    </div>

    <!-- Quick Amount Grid -->
    <QuickAmountGrid v-model="amount" :amounts="quickAmounts" />

    <!-- Action -->
    <UButton
      size="xl"
      class="mt-6 text-lightText"
      :loading="loading"
      @click="handleConvert"
    >
      Convert Plan
    </UButton>
  </div>
</template>
