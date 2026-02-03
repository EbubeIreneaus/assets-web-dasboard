<script setup lang="ts">
import { ref, watch } from "vue";

definePageMeta({
  layout: "auth",
});

const { loading } = useLoadingPage();
const runtimeConfig = useRuntimeConfig();
const route = useRoute();
const router = useRouter();

const form = ref({
  type: "",
  firstName: "",
  lastName: "",
  email: "",
  country: "",
  phone: "",
  password: "",
  confirmPassword: "",
  referral: "",
});

const accountTypes = [
    { label: "Personal", value: "personal" },
  { label: "Joint", value: "joint" },
  { label: "Organization", value: "organization" },
  {label: "Visa", value: "visa"},
  {label: "Retirement", value: "retirement"}
];

const countries = [
  { label: "Nigeria", value: "NG" },
  { label: "United States", value: "US" },
  { label: "United Kingdom", value: "UK" },
];

const errorMsg = ref("");
const emailErrorMsg = ref("");

// Initialize referral from query param
if (route.query.ref) {
  form.value.referral = route.query.ref as string;
}

// Debounce timer for email check
let emailCheckTimeout: any = null;

const checkEmail = async (email: string) => {
  if (!email) {
    emailErrorMsg.value = "";
    return;
  }

  // Simple regex check before API call to avoid spamming
  if (!/\S+@\S+\.\S+/.test(email)) return;

  try {
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/auth/email-already-exist/${email}`,
    );
    if (res.exist) {
      emailErrorMsg.value = "Email already exists";
    } else {
      emailErrorMsg.value = "";
    }
  } catch (e) {
    // Fail silently or log? user didn't specify error handling for this check, just "if exist is true..."
    console.error("Email check failed", e);
  }
};

watch(
  () => form.value.email,
  (newVal) => {
    clearTimeout(emailCheckTimeout);
    emailCheckTimeout = setTimeout(() => {
      checkEmail(newVal);
    }, 500); // 500ms debounce
  },
);

const handleRegister = async () => {
  errorMsg.value = "";

  // Client-side validations
  if (form.value.password.length <= 6) {
    errorMsg.value = "Password must be greater than 6 characters";
    return;
  }

  if (form.value.password !== form.value.confirmPassword) {
    errorMsg.value = "Passwords do not match";
    return;
  }

  if (emailErrorMsg.value) {
    return; // Don't submit if email exists
  }

  loading.value = true;

  try {
    const payload = {
      fullname: `${form.value.firstName}  ${form.value.lastName}`, // "firstname + '  '+ lastname" (double space per prompt?) Prompt said '  '.
      email: form.value.email,
      type: form.value.type,
      password: form.value.password,
      country: form.value.country,
      phone: form.value.phone,
      referred_by: form.value.referral || null,
    };

    const res: any = await $fetch(`${runtimeConfig.public.apiURL}/api/auth/`, {
      method: "PUT",
      body: payload,
    });

    if (res.success) {
      const authToken = useCookie("authToken");
      authToken.value = res.token;
      navigateTo("/auth/verification");
    } else {
      errorMsg.value = res.msg || "Unknown server error";
    }
  } catch (error: any) {
    errorMsg.value =
      error.data?.msg || error.message || "An unexpected error occurred";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-xl space-y-6">
      <!-- Header -->
      <div class="text-center space-y-1">
        <h1 class="text-3xl font-bold uppercase">Create Account</h1>
        <p class="text-sm opacity-70">Fill in your details to register</p>
      </div>

      <!-- Form -->
      <form class="space-y-4 space-x-5" @submit.prevent="handleRegister">
        <!-- General Error -->
        <div
          v-if="errorMsg"
          class="p-3 mb-4 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md"
        >
          {{ errorMsg }}
        </div>

        <!-- Type -->
        <USelect
          v-model="form.type"
          :items="accountTypes"
          placeholder="Select Account Type"
          size="xl"
          required
        />

        <!-- Firstname -->
        <UInput
          v-model="form.firstName"
          placeholder="First Name"
          size="xl"
          required
        />

        <!-- Lastname -->
        <UInput
          v-model="form.lastName"
          placeholder="Last Name"
          size="xl"
          required
        />

        <!-- Email -->
        <div class="space-y-1">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="Email Address"
            size="xl"
            required
            :color="emailErrorMsg ? 'error' : 'neutral'"
          />
          <p v-if="emailErrorMsg" class="text-xs text-red-500">
            {{ emailErrorMsg }}
          </p>
        </div>

        <!-- Country -->
        <USelect
          v-model="form.country"
          :items="countries"
          placeholder="Select Country"
          size="xl"
          required
        />

        <!-- Phone -->
        <UInput
          v-model="form.phone"
          type="tel"
          placeholder="Phone Number"
          size="xl"
          required
        />

        <!-- Password -->
        <UInput
          v-model="form.password"
          type="password"
          placeholder="Password"
          size="xl"
          required
        />

        <!-- Confirm Password -->
        <UInput
          v-model="form.confirmPassword"
          type="password"
          placeholder="Confirm Password"
          size="xl"
          required
        />

        <!-- Hidden Referral -->
        <input type="hidden" v-model="form.referral" />

        <!-- Action -->
        <UButton
          block
          size="xl"
          class="mt-4 text-lightText"
          type="submit"
          :loading="loading"
        >
          Register
        </UButton>
      </form>

      <!-- Footer -->
      <p class="text-center text-sm opacity-70">
        Already have an account?
        <NuxtLink to="/auth/login" class="text-primary"> Login </NuxtLink>
      </p>
    </div>
  </div>
</template>
