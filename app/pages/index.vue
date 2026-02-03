<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between bg-dark px-3 py-3">
      <div class="flex items-center gap-3">
        <img
          :src="
            user.profile_pics
              ? `${runtimeConfig.public.apiURL}${user.profile_pics}`
              : '/profile.png'
          "
          class="h-8 w-8 rounded-full object-cover"
          alt="profile"
        />
        <h2 class="text-lg font-semibold text-light">
          Hi, {{ user.fullname ? user.fullname.split(" ")[0] : "There" }}
        </h2>
      </div>

      <UButton icon="i-heroicons-headset" variant="ghost" color="lightText" />
    </div>

    <!-- Balance Card -->
    <div class="rounded-2xl p-6 space-y-4">
      <div class="flex items-center gap-2 text-sm text-light/70">
        <span>🇺🇸</span>
        <span>United States Dollars</span>
      </div>

      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-light">
          {{ showBalance ? formatCurrency(account.balance) : "••••••" }}
        </h1>

        <UButton
          :icon="showBalance ? 'i-heroicons-eye' : 'i-heroicons-eye-slash'"
          variant="ghost"
          color="lightText"
          @click="showBalance = !showBalance"
        />
      </div>

      <p class="text-sm text-light/60">Total Balance</p>
    </div>

    <!-- Actions -->
    <div class="grid grid-cols-2 gap-4 sm:max-w-md">
      <UButton
        icon="i-heroicons-arrow-down-tray"
        size="xl"
        block
        color="dark"
        class="text-textLight rounded-none"
        square
        to="/deposit"
      >
        Deposit
      </UButton>

      <UButton
        icon="i-heroicons-arrow-up-tray"
        size="lg"
        block
        color="dark"
        class="text-textLight rounded-none"
        to="/withdraw"
      >
        Withdraw
      </UButton>
    </div>

    <!-- Available to Spend -->
    <nuxt-link
      block
      class="flex items-center justify-between bg-dark px-4 py-6 cursor-pointer"
      to="/withdraw/to-available"
    >
      <span class="text-light/80"> Available to spend </span>

      <div class="flex items-center gap-2">
        <span class="font-semibold text-light">{{
          formatCurrency(account.available_balance)
        }}</span>
        <UIcon name="i-heroicons-chevron-right" />
      </div>
    </nuxt-link>

    <!-- Quick Access -->
    <div class="space-y-4">
      <h3 class="font-semibold text-light">Quick Access</h3>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <nuxt-link
          v-for="item in quickActions"
          :to="item.to"
          :key="item.label"
          class="bg-dark p-4 text-center cursor-pointer hover:bg-dark/80 transition"
        >
          <UIcon :name="item.icon" class="mx-auto mb-2 text-xl text-primary" />
          <p class="text-sm text-light">
            {{ item.label }}
          </p>
        </nuxt-link>
      </div>
    </div>

    <!-- Transactions -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-light">Transactions</h3>

        <nuxt-link
          to="/transactions"
          class="text-sm text-primary flex items-center gap-1"
        >
          see more
          <UIcon name="i-heroicons-chevron-right" />
        </nuxt-link>
      </div>

      <div class="space-y-4">
        <TransactionItem
          v-for="tx in transactions"
          :key="tx.id"
          :transaction="tx"
          @click="navigateTo(`/transactions/${tx.id}`)"
          class="cursor-pointer"
        />
        <div
          v-if="transactions.length === 0"
          class="text-center text-sm text-light/50 py-4"
        >
          No transactions found
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const showBalance = ref(true);
const { loading } = useLoadingPage();
const runtimeConfig = useRuntimeConfig();
const authToken = useCookie("authToken");
const toast = useToast();

const user = ref({
  fullname: "",
  profile_pics: "",
});

const account = ref({
  balance: 0,
  available_balance: 0,
});

const liveChat = ref("");
const transactions = ref<any[]>([]);

const quickActions = [
  { label: "Bookings", icon: "i-heroicons-arrow-trending-up", to: "/booking" },
  { label: "Trading Plan", icon: "i-heroicons-chart-bar", to: "/plans" },
  {
    label: "Convert",
    icon: "i-heroicons-arrows-right-left",
    to: "/plans/convert",
  },
  { label: "Transfer", icon: "i-heroicons-share", to: "/transfer" },
  { label: "Buy Plan", icon: "i-heroicons-banknotes", to: "/plans" },
  { label: "Sell Plan", icon: "i-heroicons-wallet", to: "/plans" },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/db-data`,
      {
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      },
    );

    if (res.success) {
      user.value = res.user;
      account.value = res.account;
      liveChat.value = res.liveChat;
      transactions.value = res.transactions;
    } else {
      toast.add({
        title: "Error",
        description: res.msg || "Failed to load data",
        color: "error",
      });
    }
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.msg || error.message || "Unknown error occurred",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>
