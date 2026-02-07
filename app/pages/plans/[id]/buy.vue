<script setup lang="ts">
import { ref, onMounted } from "vue";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const authToken = useCookie("authToken");

const planId = route.params.id as string;

const plan = ref({
  name: "",
  dailyGain: "",
  icon: "/images/plans/real-estate.png",
});

const balance = ref(0);
const amount = ref<number | null>(null);
const password = ref("");
const submitting = ref(false);
const fetching = ref(false);

const quickAmounts = [100, 200, 500, 1000, 2000, 5000, 10000];

const fetchData = async () => {
  fetching.value = true;
  try {
    const [planRes, balanceRes]: [any, any] = await Promise.all([
      $fetch(`${runtimeConfig.public.apiURL}/api/investment/plan/${planId}`, {
        headers: { Authorization: `Bearer ${authToken.value}` },
      }),
      $fetch(`${runtimeConfig.public.apiURL}/api/account/balance`, {
        headers: { Authorization: `Bearer ${authToken.value}` },
      }),
    ]);

    if (planRes.success) {
      plan.value = {
        name: planRes.plan.name,
        dailyGain: `${planRes.plan.roi}%`,
        icon: planRes.plan.icon
          ? `${runtimeConfig.public.apiURL}${planRes.plan.icon}`
          : plan.value.icon,
      };
    }

    if (balanceRes.success) {
      balance.value = parseFloat(balanceRes.available_balance);
    }
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: "Failed to fetch data",
      color: "error",
    });
  } finally {
    fetching.value = false;
  }
};

const handleBuy = async () => {
  if (!amount.value || amount.value <= 0) {
    toast.add({
      title: "Error",
      description: "Please enter a valid amount",
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
      `${runtimeConfig.public.apiURL}/api/investment/buy-plan`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
        body: {
          planName: planId,
          amount: amount.value,
          password: password.value,
        },
      },
    );

    if (res.success) {
      toast.add({
        title: "Success",
        description: "Plan purchased successfully",
        color: "success",
      });
      router.push(`/plans/${planId}`);
    } else {
      toast.add({
        title: "Error",
        description: res.msg || "Failed to buy plan",
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
  fetchData();
});
</script>

<template>
  <div class="mx-auto px-4 py-6 space-y-8">
    <LoadingModal :visible="fetching" />
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-lg font-semibold">Buy {{ plan.name }} Shares</h1>
    </div>

    <!-- Plan Info -->
    <div class="flex flex-col items-center text-center space-y-3">
      <div
        class="h-20 w-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center"
      >
        <img
          :src="plan.icon"
          :alt="plan.name"
          class="h-10 w-10 object-contain"
        />
      </div>

      <h2 class="text-xl font-semibold italic">
        {{ plan.name }}
      </h2>

      <p class="text-sm text-primary">{{ plan.dailyGain }} Today</p>
    </div>

    <!-- Amount Input -->
    <UInput
      v-model="amount"
      type="number"
      size="xl"
      placeholder="0"
      class="max-w-xl w-full"
    />

    <!-- Quick Amounts -->
    <QuickAmountGrid v-model="amount" :amounts="quickAmounts" />

    <!-- Balance -->
    <div
      class="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800"
    >
      <div class="flex items-center gap-3">
        <u-icon name="mdi:wallet" />
        <span class="font-medium">Balance</span>
      </div>

      <div class="flex items-center gap-2">
        <span class="font-semibold" v-money="balance"></span>
        <u-icon
          v-if="amount && amount <= balance"
          name="mdi:check-circle"
          class="text-green-500"
        />
        <u-icon v-else name="mdi:xmark" class="text-red-500" />
      </div>
    </div>

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
    <UButton size="xl" class="mt-6" :loading="submitting" @click="handleBuy">
      Buy Plan
    </UButton>
  </div>
</template>
