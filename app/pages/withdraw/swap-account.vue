<script setup lang="ts">
import { ref } from "vue";

const router = useRouter();
const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const authToken = useCookie("authToken");

const balance = ref(1500.0);
const amount = ref<number | null>(null);
const password = ref("");
const destination = ref("available");
const source = ref("balance");
const loading = ref(false);

const wallets = [
  { label: "Available Balance", value: "available" },
  { label: "Balance", value: "balance" },
];

const quickAmounts = [100, 200, 500, 1000, 2000, 5000, 10000];

const handleWithdraw = async () => {
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

  loading.value = true;

  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/transaction/withdrawal/to-wallet`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
        body: {
          amount: amount.value,
          source: source.value,
          destination: destination.value,
          password: password.value,
        },
      },
    );

    if (res.success) {
      toast.add({
        title: "Success",
        description: "Withdraw initiated successful and awaiting approval",
        color: "success",
      });
      router.push("/");
    } else {
      toast.add({
        title: "Error",
        description: res.msg || "Failed to initiate withdrawal",
        color: "error",
      });
    }
  } catch (error: any) {
    toast.add({
      title: "Error",
      description:
        error.data?.msg || error.message || "An unknown error occurred",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="mx-auto px-4 py-6 space-y-6">
    <!-- Header -->
    <PageTop title="Balance to Available" />

    <!-- Balance Card -->
    <div class="space-y-2">
      <p class="text-sm text-primary">Send From</p>

      <USelect
        v-model="source"
        :items="wallets"
        size="xl"
        class="max-w-xl w-full"
      />
    </div>

    <!-- Destination -->
    <div class="space-y-2">
      <p class="text-sm text-primary">Send To</p>

      <USelect
        v-model="destination"
        :items="wallets"
        size="xl"
        class="max-w-xl w-full"
      />
    </div>

    <!-- Amount -->
    <div class="space-y-2">
      <p class="text-sm text-primary">Amount</p>

      <UInput
        v-model="amount"
        type="number"
        size="lg"
        placeholder="0.00"
        class="max-w-xl w-full"
      />
    </div>

    <!-- Quick Amount Grid -->
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
      class="mt-6 text-textLight"
      :loading="loading"
      @click="handleWithdraw"
    >
      Withdraw
    </UButton>
  </div>
</template>
