<script setup lang="ts">
import { ref } from "vue";

const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const authToken = useCookie("authToken");

const isLoading = ref(false);

const visaTypes = ["Tourist", "Student", "Work"];
const countries = ["USA", "Canada", "UK", "Australia", "Germany"]; // 5 countries as requested

const today = new Date().toISOString().split("T")[0];

const form = ref({
  visa_type: "",
  country: "",
  nationality: "",
  travel_date: today,
  duration: "",
  reason: "",
  confirm: false,
});

async function submitVisa() {
  if (!form.value.confirm) {
    toast.add({
      title: "Confirmation Required",
      description: "Please confirm that all details are correct.",
      color: "warning",
      icon: "i-heroicons-exclamation-triangle",
    });
    return;
  }

  isLoading.value = true;

  try {
    // Expected body:
    // { "visa_type": "student", "country": "string", "nationality": "string", "travel_date": "string", "reason": "string", "duration": "string", "confirm": false }
    // I'll map directly since keys match, except confirm is boolean

    // Note: API body example showed "student" (lowercase), but select items are Capitalized.
    // I will lowercase visa_type to be safe/consistent with flight logic

    const apiBody = {
      ...form.value,
      visa_type: form.value.visa_type.toLowerCase(),
    };

    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/booking/visa`,
      {
        method: "POST",
        body: apiBody,
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      },
    );

    if (res.success) {
      toast.add({
        title: "Application Submitted",
        description: "Your visa application has been submitted successfully.",
        color: "success",
        icon: "i-heroicons-check-circle",
      });
      router.push("/booking");
    } else {
      toast.add({
        title: "Submission Failed",
        description: res.msg || "Failed to submit visa application.",
        color: "error",
        icon: "i-heroicons-x-circle",
      });
    }
  } catch (error: any) {
    toast.add({
      title: "Error",
      description:
        error.data?.msg ||
        error.message ||
        "An error occurred while submitting visa application.",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto px-4 py-6 space-y-8 max-w-3xl">
    <PageTop title="Apply for Visa" />

    <div
      class="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
    >
      <form @submit.prevent="submitVisa" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Visa Type -->
          <UFormField label="Visa Type" name="visa_type" required>
            <USelect
              v-model="form.visa_type"
              :items="visaTypes"
              size="lg"
              placeholder="Select Visa Type"
              class="w-full"
            />
          </UFormField>

          <!-- Destination Country -->
          <UFormField label="Destination Country" name="country" required>
            <USelect
              v-model="form.country"
              :items="countries"
              size="lg"
              placeholder="Select Country"
              class="w-full"
            />
          </UFormField>

          <!-- Nationality -->
          <UFormField label="Nationality" name="nationality" required>
            <USelect
              v-model="form.nationality"
              :items="countries"
              size="lg"
              placeholder="Select Nationality"
              class="w-full"
            />
          </UFormField>

          <!-- Intended Travel Date -->
          <UFormField label="Intended Travel Date" name="travel_date" required>
            <UInput
              v-model="form.travel_date"
              type="date"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <!-- Duration -->
          <UFormField label="Duration" name="duration" required>
            <UInput
              v-model="form.duration"
              size="lg"
              placeholder="eg 2 weeks"
              class="w-full"
            />
          </UFormField>

          <!-- Reason -->
          <div class="md:col-span-2">
            <UFormField label="Reason for travel" name="reason" required>
              <UTextarea
                v-model="form.reason"
                size="lg"
                placeholder="write any important info here"
                :rows="4"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <!-- Confirm Checkbox -->
        <UCheckbox
          v-model="form.confirm"
          label="I confirm all details are correct"
        />

        <div class="pt-4 flex justify-end gap-3">
          <UButton to="/booking" variant="ghost" color="neutral" size="xl">
            Cancel
          </UButton>
          <UButton
            type="submit"
            size="xl"
            color="primary"
            variant="solid"
            label="Apply for Visa"
            icon="i-heroicons-identification"
            :loading="isLoading"
            class="text-light"
          />
        </div>
      </form>
    </div>
  </div>
</template>
