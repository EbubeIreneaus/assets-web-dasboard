<script setup lang="ts">
import { ref, onMounted } from "vue";

const router = useRouter();
const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const authToken = useCookie("authToken");

/**
 * Mock data – replace later
 */
const availableBalance = ref(0.0);

const withdrawalMethod = ref("bitcoin");
const walletAddress = ref("");
const amount = ref<number | null>(null);
const loading = ref(false);

const methods = [
  { label: "Bitcoin", value: "Bitcoin" },
  { label: "Ethereum", value: "Ethereum" },
  { label: "Binance Coin", value: "Binance Coin" },
  { label: "USDT (ERC-20)", value: "USDT (ERC-20)" },
  { label: "USDT (BEP-20)", value: "USDT (BEP-20)" },
  { label: "USDT (TRC-20)", value: "USDT (TRC-20)" },
  { label: "USDC", value: "USDC" },
  { label: "Solana", value: "Solana" },
  { label: "Polygon", value: "Polygon" },
  { label: "Avalanche", value: "Avalanche" },
  { label: "Litecoin", value: "Litecoin" },
  { label: "Dogecoin", value: "Dogecoin" },
  { label: "DAI", value: "DAI" },
  { label: "Fantom", value: "Fantom" },
  { label: "Arbitrum", value: "Arbitrum" },
  { label: "Optimism", value: "Optimism" },
];

const quickAmounts = [100, 200, 500, 1000, 2000, 5000, 10000];

function setAmount(value: number) {
  amount.value = value;
}

const fetchBalance = async () => {
  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/account/balance`,
      {
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      },
    );

    if (res.success) {
      availableBalance.value = parseFloat(res.available_balance);
    } else {
      availableBalance.value = 0.0;
    }
  } catch (error) {
    console.error("Failed to fetch balance:", error);
    availableBalance.value = 0.0;
  }
};

const handleWithdraw = async () => {
  if (!amount.value || amount.value <= 0) {
    toast.add({
      title: "Error",
      description: "Please enter a valid amount",
      color: "error",
    });
    return;
  }

  if (!walletAddress.value) {
    toast.add({
      title: "Error",
      description: "Please enter a wallet address",
      color: "error",
    });
    return;
  }

  loading.value = true;

  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/transaction/withdrawal`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
        body: {
          amount: amount.value,
          channel: withdrawalMethod.value,
          wallet_address: walletAddress.value,
        },
      },
    );

    if (res.success) {
      toast.add({
        title: "Success",
        description: "Withdrawal initiated successfully",
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

onMounted(() => {
  fetchBalance();
});
</script>

<template>
  <div class="mx-auto px-4 py-6 space-y-6">
    <!-- Header -->
    <PageTop title="Withdraw" />

    <!-- Available Balance -->
    <div class="space-y-1">
      <p class="text-sm opacity-70">Available for withdraw</p>
      <p class="text-3xl font-bold">${{ availableBalance.toFixed(2) }}</p>
    </div>

    <!-- Withdrawal Method -->
    <div class="space-y-2">
      <p class="text-sm text-textLight/50">Withdrawal To</p>

      <USelect
        v-model="withdrawalMethod"
        :items="methods"
        size="xl"
        class="max-w-xl w-full"
        variant="soft"
      />
    </div>

    <!-- Wallet Address -->
    <UInput
      v-model="walletAddress"
      size="xl"
      placeholder="Wallet Address"
      class="max-w-xl w-full"
      variant="soft"
    />

    <!-- Amount -->
    <div class="space-y-2">
      <p class="text-sm text-textLight">Amount to Withdraw</p>

      <UInput
        v-model="amount"
        type="number"
        size="xl"
        placeholder="0.00"
        class="max-w-xl w-full"
        variant="soft"
      />
    </div>

    <!-- Quick Amounts -->
    <QuickAmountGrid v-model="amount" :amounts="quickAmounts" />

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
