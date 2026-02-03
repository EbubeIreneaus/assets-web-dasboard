<script setup lang="ts">
import { ref, onMounted } from "vue";

const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const isLoading = ref(true);

const referralLink = ref("");
const referredUsers = ref<any[]>([]);

async function fetchReferralData() {
  isLoading.value = true;
  try {
    const authToken = useCookie("authToken");
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/referral-data`,
      {
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      },
    );

    if (res.success) {
      // Construct referral link: apiURL/referral_code
      if (res.me && res.me.referral_code) {
        referralLink.value = `${runtimeConfig.public.apiURL}/${res.me.referral_code}`;
      }

      if (res.referee && Array.isArray(res.referee)) {
        referredUsers.value = res.referee;
      }
    }
  } catch (error) {
    toast.add({
      title: "Error",
      description: "Failed to load referral data.",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
  } finally {
    isLoading.value = false;
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(referralLink.value);
    toast.add({
      title: "Copied!",
      description: "Referral link copied to clipboard.",
      color: "success", // Changed to success for green color
      icon: "i-heroicons-check-circle",
    });
  } catch (err) {
    toast.add({
      title: "Failed",
      description: "Could not copy link to clipboard.",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
  }
}

onMounted(() => {
  fetchReferralData();
});
</script>

<template>
  <div class="mx-auto px-4 py-6 space-y-8">
    <PageTop title="Invite a Friend & Earn Rewards" />

    <!-- Header Section -->
    <div
      class="text-center bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700"
    >
      <div class="mb-4 flex justify-center">
        <UIcon name="i-heroicons-gift" class="w-12 h-12 text-primary-500" />
      </div>
      <h2 class="text-2xl font-bold mb-2">Invite your friends</h2>
      <p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        Share your unique referral link with friends and earn rewards when they
        sign up and start their journey!
      </p>
    </div>

    <!-- Referral Link Section -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Your Referral Link
      </label>
      <div class="flex gap-2">
        <UInput
          v-model="referralLink"
          readonly
          class="flex-1"
          size="xl"
          variant="soft"
          icon="i-heroicons-link"
          :loading="isLoading"
          placeholder="Loading link..."
        />
        <UButton
          icon="mdi:content-copy"
          size="xl"
          color="neutral"
          variant="solid"
          @click="copyLink"
          :disabled="!referralLink || isLoading"
        />
      </div>
    </div>

    <!-- Referred by You Section -->
    <div>
      <h3 class="text-lg font-semibold mb-4">Referred by You</h3>

      <div v-if="isLoading" class="space-y-3">
        <USkeleton class="h-20 w-full" v-for="n in 3" :key="n" />
      </div>

      <div v-else-if="referredUsers.length" class="space-y-3">
        <div
          v-for="user in referredUsers"
          :key="user.id"
          class="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
        >
          <div class="flex items-center gap-3">
            <UAvatar :alt="user.fullname" size="md" />
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ user.fullname }}
              </p>
              <!--
                Assuming API doesn't return date based on the prompt description,
                so omitting date or using a placeholder if needed.
                The prompt specificied: id, fullname, has_first_deposit.
              -->
            </div>
          </div>
          <div class="text-right flex items-center gap-2">
            <!--
              Status Icon Logic:
              Green check if has_first_deposit (bonus received)
              Yellow warning if not
            -->
            <UIcon
              v-if="user.has_first_deposit"
              name="i-heroicons-check-circle"
              class="w-6 h-6 text-green-500"
            />
            <UIcon
              v-else
              name="i-heroicons-exclamation-triangle"
              class="w-6 h-6 text-yellow-500"
            />

            <UBadge
              :color="user.has_first_deposit ? 'success' : 'warning'"
              variant="subtle"
            >
              {{ user.has_first_deposit ? "Bonus Received" : "Pending" }}
            </UBadge>
          </div>
        </div>
      </div>
      <div
        v-else
        class="text-center py-10 text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-lg"
      >
        <p>You haven't referred anyone yet.</p>
      </div>
    </div>
  </div>
</template>
