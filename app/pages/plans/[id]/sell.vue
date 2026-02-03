<script setup lang="ts">
import { ref, onMounted } from "vue";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const authToken = useCookie("authToken");

const planId = route.params.id as string;

const planDetails = ref({
  name: "",
  balance: 0,
});

const amount = ref<number | null>(null);
const sellTo = ref<"balance" | "available_balance">("balance");
const submitting = ref(false);
const fetching = ref(false);

const quickAmounts = [100, 200, 500, 1000, 2000, 5000, 10000];

const fetchPlanDetails = async () => {
  fetching.value = true;
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
      planDetails.value = {
        name: res.plan.name,
        balance: res.balance,
      };
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
    fetching.value = false;
  }
};

const handleSell = async () => {
  if (!amount.value || amount.value <= 0) {
    toast.add({
      title: "Error",
      description: "Please enter a valid amount",
      color: "error",
    });
    return;
  }

  if (amount.value > planDetails.value.balance) {
    toast.add({
      title: "Error",
      description: "Insufficient plan balance",
      color: "error",
    });
    return;
  }

  submitting.value = true;

  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/investment/sell-plan`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
        body: {
          plan: planId,
          amount: amount.value,
          to: sellTo.value,
        },
      },
    );

    if (res.success) {
      toast.add({
        title: "Success",
        description: "Plan sold successfully",
        color: "success",
      });
      router.push(`/plans/${planId}`);
    } else {
      toast.add({
        title: "Error",
        description: res.msg || "Failed to sell plan",
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
  fetchPlanDetails();
});
</script>

<template>
  <div class="mx-auto px-4 py-6 space-y-8">
    <LoadingModal :visible="fetching" />
    <!-- Header -->
    <PageTop :title="`Sell ${planDetails.name} Shares`" />

    <!-- Balance Card -->
    <div class="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-2">
      <div class="flex items-center gap-3">
        <u-icon name="mdi:wallet" class="h-7 w-7" />
        <p class="text-2xl font-bold" v-money="planDetails.balance"></p>
      </div>
      <p class="text-sm text-primary">{{ planDetails.name }} Balance</p>
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

    <!-- Sell To -->
    <div class="space-y-3">
      <p class="text-sm text-primary">Sell to:</p>

      <div
        class="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
        @click="sellTo = 'balance'"
      >
        <div class="flex items-center gap-3">
          <u-icon name="mdi:wallet" />
          <span class="font-medium">Balance</span>
        </div>

        <u-icon
          v-if="sellTo == 'balance'"
          name="mdi:check-circle"
          class="text-green-500"
        />
      </div>

      <div
        class="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
        @click="sellTo = 'available_balance'"
      >
        <div class="flex items-center gap-3">
          <u-icon name="mdi:wallet" />
          <span class="font-medium">Available Earnings</span>
        </div>

        <u-icon
          v-if="sellTo == 'available_balance'"
          name="mdi:check-circle"
          class="text-green-500"
        />
      </div>
    </div>

    <!-- Action -->
    <UButton
      size="xl"
      class="mt-6 text-lightText"
      :loading="submitting"
      @click="handleSell"
    >
      Sell Plan
    </UButton>
  </div>
</template>
