<script setup lang="ts">
import { ref, computed } from "vue";

const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const authToken = useCookie("authToken");
const step = ref(1);
const isLoading = ref(false);
const userFound = ref(false);
const errorMsg = ref("");

// Step 1 Data
const email = ref("");
const searchResult = ref<{
  name: string;
  avatar: string;
  email: string;
  active: boolean;
} | null>(null);

// Step 2 Data
const amount = ref<number | null>(null);
const selectedSource = ref<"balance" | "available_balance">("balance");

// Balances
const balances = ref({
  balance: 0.0,
  available_balance: 0.0,
});

async function checkUser() {
  if (!email.value) return;

  isLoading.value = true;
  errorMsg.value = "";
  searchResult.value = null;
  userFound.value = false;

  try {
    const data: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/account/transfer/reciever-info/${email.value}`,
      {
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      },
    );

    if (data.success) {
      searchResult.value = {
        name: data.data.fullname,
        email: data.data.email,
        avatar: runtimeConfig.public.apiURL + data.data.image || "/profile.png",
        active: data.data.active
      };

      // Update balances from the response (sender's balances)
      balances.value = {
        balance: data.data.balance,
        available_balance: data.data.available_balance,
      };

      userFound.value = true;
    } else {
      errorMsg.value = data.msg || "Account not found";
    }
  } catch (error: any) {
    errorMsg.value = "An error occurred while checking the user.";
    console.error(error);
  } finally {
    isLoading.value = false;
  }
}

function proceedToTransfer() {
  step.value = 2;
}

function setAmount(value: number) {
  amount.value = value;
}

async function performTransfer() {
  if (!amount.value) return;

  // Client-side validation
  const currentBalance = balances.value[selectedSource.value];
  if (amount.value > currentBalance) {
    toast.add({
      title: "Insufficient Funds",
      description: "You do not have enough balance for this transfer.",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
    return;
  }

  isLoading.value = true;

  try {
    const payload = {
      amount: amount.value,
      source: selectedSource.value,
      to: email.value,
    };

    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/account/transfer`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
        body: payload,
      },
    );

    if (res.success) {
      toast.add({
        title: "Transfer Successful",
        description: `Sent $${amount.value} to ${searchResult.value?.name}`,
        color: "success",
        icon: "i-heroicons-check-circle",
      });

      // Redirect to home page
      await navigateTo("/");
    } else {
      toast.add({
        title: "Transfer Failed",
        description: res.msg || "Unknown server error",
        color: "error",
        icon: "i-heroicons-x-circle",
      });
    }
  } catch (error) {
    toast.add({
      title: "Error",
      description: "An unknown server error occurred",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto px-4 py-6 space-y-8 max-w-2xl">
    <PageTop title="Transfer Funds" />

    <!-- Step 1: Find User -->
    <div
      v-if="step === 1"
      class="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6"
    >
      <h2 class="text-xl font-bold">Find Recipient</h2>

      <div class="space-y-4">
        <UFormField label="Recipient Email" name="email">
          <UInput
            v-model="email"
            type="email"
            size="xl"
            placeholder="Enter receiver's email"
            icon="i-heroicons-envelope"
            @keyup.enter="checkUser"
            class="w-full"
          >
            <template #trailing>
              <UButton
                v-if="!userFound"
                color="neutral"
                variant="ghost"
                icon="i-heroicons-magnifying-glass"
                :loading="isLoading"
                @click="checkUser"
                class="text-light"
              />
            </template>
          </UInput>
        </UFormField>
      </div>

      <!-- Result Area -->
      <div
        v-if="errorMsg"
        class="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg text-sm text-center"
      >
        {{ errorMsg }}
      </div>

      <div
        v-if="searchResult"
        class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl flex items-center gap-4"
      >
        <UAvatar
          :src="searchResult.avatar"
          :alt="searchResult.name"
          size="lg"
        />
        <div>
          <h3 class="font-bold text-gray-900 dark:text-white">
            {{ searchResult.name }}
          </h3>
          <p class="text-xs text-gray-500">{{ searchResult.email }}</p>
          <span
            class="text-xs font-medium text-green-500 flex items-center gap-1 mt-1"
            v-if="searchResult.active"
          >
            <UIcon name="i-heroicons-check-badge" class="w-3 h-3" /> Active
            User
          </span>
          <span
            class="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"
            v-else
          >
            <UIcon name="i-heroicons-x-badge" class="w-3 h-3" /> Inactive
            User
          </span>
        </div>
      </div>

      <div class="pt-2">
        <UButton
          v-if="userFound"
          size="xl"
          block
          label="Proceed to Transfer"
          color="primary"
          @click="proceedToTransfer"
          icon="i-heroicons-arrow-right"
          class="text-light"
        />
        <UButton
          v-else
          size="xl"
          block
          label="Check User"
          color="primary"
          :loading="isLoading"
          @click="checkUser"
          class="text-light"
        />
      </div>
    </div>

    <!-- Step 2: Transfer Details -->
    <div
      v-else
      class="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-8"
    >
      <!-- Receiver Header -->
      <div
        class="flex flex-col items-center pb-6 border-b border-gray-100 dark:border-gray-800"
      >
        <UAvatar
          :src="searchResult?.avatar"
          :alt="searchResult?.name"
          size="2xl"
          class="mb-3 ring-4 ring-gray-50 dark:ring-gray-800"
        />
        <h2 class="text-lg font-bold">Transfer to {{ searchResult?.name }}</h2>
        <p class="text-sm text-gray-500">{{ searchResult?.email }}</p>
      </div>

      <!-- Source Selection -->
      <div class="space-y-3">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Source Wallet
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Main Balance -->
          <div
            class="relative p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col gap-2 group"
            :class="
              selectedSource === 'balance'
                ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-900/10 ring-1 ring-primary-500'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800'
            "
            @click="selectedSource = 'balance'"
          >
            <div class="flex items-center justify-between">
              <div
                class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              >
                <UIcon name="i-heroicons-wallet" class="w-5 h-5" />
              </div>
              <UIcon
                v-if="selectedSource === 'balance'"
                name="i-heroicons-check-circle"
                class="w-6 h-6 text-primary-500"
              />
              <div
                v-else
                class="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
              ></div>
            </div>
            <div>
              <p
                class="text-xs text-gray-500 font-medium uppercase tracking-wide"
              >
                Main Balance
              </p>
              <p class="text-lg font-bold">
                ${{ balances.balance.toLocaleString() }}
              </p>
            </div>
          </div>

          <!-- Available Balance -->
          <div
            class="relative p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col gap-2 group"
            :class="
              selectedSource === 'available_balance'
                ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-900/10 ring-1 ring-primary-500'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800'
            "
            @click="selectedSource = 'available_balance'"
          >
            <div class="flex items-center justify-between">
              <div
                class="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              >
                <UIcon name="i-heroicons-banknotes" class="w-5 h-5" />
              </div>
              <UIcon
                v-if="selectedSource === 'available_balance'"
                name="i-heroicons-check-circle"
                class="w-6 h-6 text-primary-500"
              />
              <div
                v-else
                class="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
              ></div>
            </div>
            <div>
              <p
                class="text-xs text-gray-500 font-medium uppercase tracking-wide"
              >
                Available Balance
              </p>
              <p class="text-lg font-bold">
                ${{ balances.available_balance.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Amount Input -->
      <div class="space-y-4">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Amount to Transfer
        </h3>
        <UInput
          v-model="amount"
          type="number"
          size="xl"
          placeholder="0.00"
          icon="i-heroicons-currency-dollar"
          class="w-full"
        />
        <QuickAmountGrid
          v-model="amount"
          :amounts="[50, 100, 200, 500, 1000, 5000]"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4 pt-4">
        <UButton
          variant="ghost"
          color="neutral"
          size="xl"
          class="flex-1"
          @click="step = 1"
        >
          Back
        </UButton>
        <UButton
          variant="solid"
          color="primary"
          size="xl"
          class="flex-[2] text-light"
          :loading="isLoading"
          :disabled="!amount"
          @click="performTransfer"
        >
          Confirm Transfer
        </UButton>
      </div>
    </div>
  </div>
</template>
