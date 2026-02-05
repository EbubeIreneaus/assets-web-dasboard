<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const { loading } = useLoadingPage();
const runtimeConfig = useRuntimeConfig();
const authToken = useCookie("authToken");
const toast = useToast();

const channelId = ref<number | null>(null);
const paymentOptions = ref<any[]>([]);
const selectedMethod = ref<string | null>(null);
const amount = ref<number | null>(null);

const selectedOption = computed(() =>
  paymentOptions.value.find((o) => o.name === selectedMethod.value),
);

const fetchChannels = async () => {
  loading.value = true;
  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/admin/crypto-channels`,
      {
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      },
    );

    if (res.success) {
      paymentOptions.value = res.data;
    } else {
      toast.add({
        title: "Error",
        description: res.msg || "Failed to fetch payment channels",
        color: "error",
      });
    }
  } catch (error: any) {
    toast.add({
      title: "Error",
      description:
        error.data?.msg || error.message || "Failed to fetch payment channels",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

const handleDeposit = async () => {
  if (!amount.value || !selectedMethod.value) return;

  loading.value = true;
  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/transaction/deposit`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
        body: {
          amount: amount.value,
          channel: selectedMethod.value,
        },
      },
    );

    if (res.success) {
      router.push(`/deposit/${res.id}?channelId=${channelId.value}`);
    } else {
      toast.add({
        title: "Error",
        description: res.msg || "Deposit failed",
        color: "error",
      });
    }
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.msg || error.message || "Deposit failed",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchChannels();
});
</script>

<template>
  <div class="mx-auto px-4 py-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between">
      <u-button
        icon="mdi:arrow-left-thick"
        variant="soft"
        size="lg"
        @click="router.back()"
      />
      <h1 class="text-lg font-semibold">Deposit</h1>
      <div></div>
    </div>

    <!-- Amount -->
    <div class="space-y-2">
      <p class="text-sm opacity-80">Enter Amount</p>
      <UInput
        v-model="amount"
        type="number"
        placeholder="Amount (USD)"
        size="xl"
        class="max-w-lg w-full"
      />
    </div>

    <!-- Payment Methods -->
    <div class="space-y-4">
      <h2 class="text-base font-semibold">Please Choose a method of payment</h2>

      <div v-if="paymentOptions.length > 0" class="space-y-2">
        <div
          v-for="option in paymentOptions"
          :key="option.id"
          class="flex items-center justify-between px-4 py-6 rounded-md bg-dark cursor-pointer border border-transparent hover:border-primary/50 transition-colors"
          :class="{ 'border-primary!': selectedMethod === option.name }"
          @click="() => {selectedMethod = option.name; channelId = option.id}"
        >
          <div class="flex flex-col">
            <span class="text-sm font-medium">
              {{ option.name }}
            </span>
            <span class="text-xs opacity-60">
              {{ option.network }}
            </span>
          </div>

          <UIcon
            name="i-heroicons-check-circle"
            class="text-green-500 w-6 h-6"
            v-if="selectedMethod === option.name"
          />
        </div>
      </div>
      <div v-else class="text-center py-4 opacity-70">
        Loading payment methods...
      </div>
    </div>

    <!-- Deposit Overview -->
    <div class="rounded-xl bg-slate-900 p-4 space-y-4">
      <h3 class="font-semibold">Deposit Overview</h3>

      <div class="flex justify-between text-sm">
        <span class="opacity-70">Amount</span>
        <span>${{ amount ?? "0.00" }}</span>
      </div>

      <div class="flex justify-between text-sm">
        <span class="opacity-70">Channel</span>
        <span>{{ selectedOption?.name ?? "N/A" }}</span>
      </div>

      <div class="flex justify-between text-sm">
        <span class="opacity-70">Network</span>
        <span>{{ selectedOption?.network ?? "N/A" }}</span>
      </div>
    </div>

    <!-- Action -->
    <UButton
      size="xl"
      :disabled="!selectedMethod || !amount"
      :loading="loading"
      @click="handleDeposit"
      class="max-w-xl text-lightText"
    >
      Make Deposit
    </UButton>
  </div>
</template>
