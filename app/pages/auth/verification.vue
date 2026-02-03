<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

definePageMeta({
  layout: "auth",
});

const { loading } = useLoadingPage();
const runtimeConfig = useRuntimeConfig();
const authToken = useCookie("authToken");
const router = useRouter();

const otpLength = 6;
const otp = ref<string[]>(Array(otpLength).fill(""));
const timer = ref(60);
const canResend = ref(false);
const errorMsg = ref("");

let timerInterval: any = null;

function startTimer() {
  timer.value = 60;
  canResend.value = false;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--;
    } else {
      canResend.value = true;
      clearInterval(timerInterval);
    }
  }, 1000);
}

const sendOtp = async () => {
  loading.value = true;
  errorMsg.value = "";
  try {
    await $fetch(`${runtimeConfig.public.apiURL}/api/auth/send_otp_code/`, {
      headers: {
        Authorization: `Bearer ${authToken.value}`,
      },
    });
    startTimer();
  } catch (error: any) {
    errorMsg.value = error.data?.msg || "Failed to send OTP";
  } finally {
    loading.value = false;
  }
};

const verifyOtp = async () => {
  const code = otp.value.join("");
  if (code.length !== otpLength) return;

  loading.value = true;
  errorMsg.value = "";

  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/auth/verify-otp/${code}`,
      {
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      },
    );

    if (res.success) {
      // "status 200" implies success, response body checked
      if (res.token) {
        // "update authToken"
        authToken.value = res.token;
      }
      navigateTo("/");
    } else {
      errorMsg.value = res.msg || "Verification failed";
    }
  } catch (error: any) {
    errorMsg.value = error.data?.msg || error.message || "Unknown server error";
  } finally {
    loading.value = false;
  }
};

function onInput(e: Event, index: number) {
  const input = e.target as HTMLInputElement;
  const val = input.value;

  otp.value[index] = val.slice(-1);

  if (val && index < otpLength - 1) {
    const next = document.getElementById(
      `otp-${index + 1}`,
    ) as HTMLInputElement | null;
    next?.focus();
  }

  if (otp.value.join("").length === otpLength) {
    verifyOtp();
  }
}

function onBackspace(e: KeyboardEvent, index: number) {
  if (e.key === "Backspace" && !otp.value[index] && index > 0) {
    const prev = document.getElementById(
      `otp-${index - 1}`,
    ) as HTMLInputElement | null;
    prev?.focus();
  }
}

const otpCode = computed(() => otp.value.join(""));

onMounted(() => {
  sendOtp();
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md text-center space-y-8">
      <!-- Icon -->
      <div class="flex justify-center">
        <img src="/images/auth-security.png" alt="Security" class="h-24 w-24" />
      </div>

      <!-- Title -->
      <div class="space-y-2">
        <h1 class="text-xl font-semibold">OTP Code Verification</h1>
        <p class="text-sm opacity-80">
          We have sent an OTP code to your email address<br />
          Enter OTP Code below to verify
        </p>
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMsg"
        class="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md"
      >
        {{ errorMsg }}
      </div>

      <!-- OTP Inputs -->
      <div class="flex justify-center gap-3">
        <input
          v-for="(_, index) in otpLength"
          :key="index"
          :id="`otp-${index}`"
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="h-14 w-12 text-center text-lg rounded-xl bg-transparent border border-slate-600 focus:outline-none focus:border-primary disabled:opacity-50"
          :value="otp[index]"
          @input="onInput($event, index)"
          @keydown="onBackspace($event, index)"
          :disabled="loading"
        />
      </div>

      <!-- Resend -->
      <div class="space-y-2">
        <p class="text-sm opacity-70">Didn’t receive OTP code?</p>

        <button
          v-if="canResend"
          @click="sendOtp"
          class="text-primary font-medium hover:underline"
          :disabled="loading"
        >
          Resend OTP
        </button>
        <p v-else class="text-primary font-medium">Resend in {{ timer }}s</p>
      </div>

      <UButton
        v-if="otpCode.length === otpLength"
        block
        size="xl"
        :loading="loading"
        class="mt-4"
        @click="verifyOtp"
      >
        Verify
      </UButton>
    </div>
  </div>
</template>
