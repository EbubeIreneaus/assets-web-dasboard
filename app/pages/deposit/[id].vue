<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const { loading } = useLoadingPage();
const runtimeConfig = useRuntimeConfig();
const authToken = useCookie("authToken");
const toast = useToast();

const paymentInfo = ref({
  channel: "",
  network: "",
  amount: 0,
  address: "",
  id: "",
  qrcode_image: "",
});

const debugInfo = ref<any>(null); // DEBUG

const receiptFile = ref<File | null>(null);
const isButtonEnabled = computed(() => !!receiptFile.value);

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement | null;
  receiptFile.value = input?.files?.[0] ?? null;
}

const fetchData = async () => {
  loading.value = true;
  const depositId = route.params.id;
  const channelId = route.query.channelId;

  if (!depositId || !channelId) {
    toast.add({
      title: "Error",
      description: "Invalid deposit information",
      color: "error",
    });
    return;
  }

  try {
    const [txRes, channelRes]: [any, any] = await Promise.all([
      $fetch(
        `${runtimeConfig.public.apiURL}/api/transaction/one/${depositId}`,
        {
          headers: { Authorization: `Bearer ${authToken.value}` },
        },
      ),
      $fetch(
        `${runtimeConfig.public.apiURL}/api/transaction/channel/${channelId}`,
        {
          headers: { Authorization: `Bearer ${authToken.value}` },
        },
      ),
    ]);

    debugInfo.value = { txRes, channelRes };
    console.log("txRes:", txRes);
    console.log("channelRes:", channelRes);

    if (txRes.success && channelRes.success) {
      paymentInfo.value = {
        channel: channelRes.data.name,
        network: channelRes.data.network,
        amount: parseFloat(txRes.transaction.amount),
        address: channelRes.data.wallet_address,
        id: txRes.transaction.id,
        qrcode_image: channelRes.data.qrcode_image,
      };
      console.log("paymentInfo:", paymentInfo.value);
    } else {
      toast.add({
        title: "Error",
        description:
          txRes.msg || channelRes.msg || "Failed to fetch deposit details",
        color: "error",
      });
    }
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.msg || error.message || "An error occurred",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.add({
    title: "Copied",
    description: "Address copied to clipboard",
    color: "success",
  });
};

const handleReceiptSubmit = async () => {
  if (!receiptFile.value) {
    toast.add({
      title: "Error",
      description: "Please upload a receipt",
      color: "error",
    });
    return;
  }

  loading.value = true;
  const formData = new FormData();
  formData.append("transactId", paymentInfo.value.id);
  formData.append("amount", paymentInfo.value.amount.toString());
  formData.append(
    "channel",
    `${paymentInfo.value.channel} ${paymentInfo.value.network}`,
  );
  formData.append("file", receiptFile.value);

  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/transaction/pay_slip`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
        body: formData,
      },
    );

    if (res.status == "success") {
      toast.add({
        title: "Success",
        description:
          "We received your deposit request and are processing. We will respond as soon as possible.",
        color: "success",
        duration: 5000,
      });
      router.push("/");
    } else {
      toast.add({
        title: "Error",
        description: res.msg || "Failed to submit receipt",
        color: "error",
      });
    }
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.msg || error.message || "An error occurred",
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

<template>
  <div class="px-4 py-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between">
      <u-button
        icon="mdi:arrow-left-thick"
        variant="soft"
        size="lg"
        @click="router.back()"
      />
      <h1 class="text-lg font-semibold">Confirm Deposit</h1>
      <div></div>
    </div>

    <!-- Payment Information -->
    <div class="rounded-xl bg-slate-900 p-5 space-y-4">
      <h2 class="text-sm tracking-wide font-semibold opacity-80">
        PAYMENT INFORMATION
      </h2>

      <div class="space-y-2 text-sm">
        <div class="flex gap-2">
          <span class="opacity-70">Payment Channel:</span>
          <span class="font-semibold text-amber-400">
            {{ paymentInfo.channel }}
          </span>
        </div>

        <div class="flex gap-2">
          <span class="opacity-70">Network:</span>
          <span class="font-semibold text-amber-400">
            {{ paymentInfo.network }}
          </span>
        </div>

        <div class="flex gap-2">
          <span class="opacity-70">Amount:</span>
          <span class="font-semibold text-amber-400">
            ${{ paymentInfo.amount?.toFixed(2) }}
          </span>
        </div>
      </div>
    </div>

    <!-- QR Code -->
    <div class="flex justify-center" v-if="paymentInfo.qrcode_image">
      <div class="bg-white p-4 rounded-xl">
        <img
          :src="`${runtimeConfig.public.apiURL}${paymentInfo.qrcode_image}`"
          alt="QR Code"
          class="w-34 h-34 object-contain"
        />
      </div>
    </div>

    <!-- Wallet Address -->
    <div class="space-y-2 text-center">
      <p class="break-all text-sm">
        {{ paymentInfo.address }}
      </p>

      <UButton
        variant="link"
        size="xs"
        class="text-primary"
        @click="copyToClipboard(paymentInfo.address)"
      >
        copy
      </UButton>
    </div>

    <!-- Instructions -->
    <p class="text-center text-sm opacity-80">
      Send us payment receipt to process your payment
    </p>

    <!-- Upload -->
    <div>
      <UInput type="file" accept="image/*" size="lg" @change="onFileChange" />
    </div>

    <!-- Action Button -->
    <UButton
      size="xl"
      :disabled="!isButtonEnabled"
      class="mt-2 text-textLight"
      @click="handleReceiptSubmit"
    >
      I have made my deposit
    </UButton>
  </div>
</template>
