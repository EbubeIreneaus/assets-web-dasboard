<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const authToken = useCookie("authToken");

const planId = route.params.id as string;

const sourcePlan = ref(planId);
const destinationPlan = ref("");
const amount = ref<number | null>(null);
const password = ref("");
const submitting = ref(false);
const fetching = ref(false);

const plans = ref<any[]>([]);

const quickAmounts = [100, 200, 500, 1000, 2000, 5000, 10000];

const destinationOptions = computed(() => {
  return plans.value.filter((p) => !p.disabled && p.value !== sourcePlan.value);
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

      // Default destination to first available option
      if (destinationOptions.value.length > 0) {
        destinationPlan.value = destinationOptions.value[0].value;
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

const handleSwap = async () => {
  if (!amount.value || amount.value <= 0) {
    toast.add({
      title: "Error",
      description: "Please enter a valid amount",
      color: "error",
    });
    return;
  }

  if (!destinationPlan.value) {
    toast.add({
      title: "Error",
      description: "Please select a destination plan",
      color: "error",
    });
    return;
  }

  if (!password.value) {
    toast.add({
      title: "Error",
      description: "Please enter your password",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
    return;
  }

  submitting.value = true;

  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/investment/swap-plan`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
        body: {
          source: sourcePlan.value,
          amount: amount.value,
          destination: destinationPlan.value,
          password: password.value,
        },
      },
    );

    if (res.success) {
      toast.add({
        title: "Success",
        description: "Plan swapped successfully",
        color: "success",
      });
      router.push(`/plans/${planId}`);
    } else {
      toast.add({
        title: "Error",
        description: res.msg || "Failed to swap plan",
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
    submitting.value = false;
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
    <PageTop title="Swap Plan" />

    <!-- Source -->
    <div class="space-y-2">
      <p class="text-sm opacity-80">Source</p>
      <USelect
        v-model="sourcePlan"
        :items="plans"
        size="xl"
        class="max-w-xl w-full"
        disabled
      />
    </div>

    <!-- Destination -->
    <div class="space-y-2">
      <p class="text-sm opacity-80">Destination</p>
      <USelect
        v-model="destinationPlan"
        :items="destinationOptions"
        size="xl"
        class="max-w-xl w-full"
      />
    </div>

    <!-- Amount -->
    <div class="space-y-2 mt-14">
      <p class="text-sm text-lightText/30">Amount in USD ($):</p>
      <UInput
        v-model="amount"
        type="number"
        placeholder="0"
        size="xl"
        class="max-w-xl w-full"
      />
    </div>

    <!-- Quick Amounts -->
    <QuickAmountGrid v-model="amount" :amounts="quickAmounts" />

    <!-- Password -->
    <u-form-field label="Password" required>
      <u-input
        v-model="password"
        type="password"
        size="xl"
        placeholder="Password"
        class="max-w-xl w-full"
        variant="soft"
      />
    </u-form-field>

    <!-- Action -->
    <UButton
      size="xl"
      class="mt-6 text-lightText"
      :loading="submitting"
      @click="handleSwap"
    >
      Swap Plan
    </UButton>
  </div>
</template>
