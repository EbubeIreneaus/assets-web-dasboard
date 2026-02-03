<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const isLoading = ref(false);

const form = ref({
  fullname: "",
  email: "",
  relationship: "",
  phone: "",
  address: "",
  country: "",
});

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Nigeria",
  "India",
  "China",
  "Japan",
  "Brazil",
];

const relationshipOptions = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Cousin",
  "Friend",
  "Spouse",
  "Son",
  "Daughter",
  "Uncle",
  "Aunt",
  "Other",
];

async function saveNOK() {
  isLoading.value = true;

  try {
    const authToken = useCookie("authToken");
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/auth/next-of-kin`,
      {
        method: "POST",
        body: form.value,
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      },
    );

    if (res.success) {
      toast.add({
        title: "Success",
        description: "Next of Kin information added successfully.",
        color: "success",
        icon: "i-heroicons-check-circle",
      });

      // Navigate back to view page
      router.push("/account/next-of-kin");
    } else {
      throw new Error(res.msg || "Failed to add Next of Kin");
    }
  } catch (error: any) {
    toast.add({
      title: "Error",
      description:
        error.data?.msg ||
        error.message ||
        "Failed to add Next of Kin information.",
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
    <PageTop title="Add Next of Kin" />

    <!-- Legal Warning/Info Message -->
    <div class="bg-dark rounded-xl p-4 flex gap-4 items-start">
      <UIcon
        name="i-heroicons-information-circle"
        class="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5"
      />
      <p class="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
        If For six months, you have been inactive on your account and failed to
        respond to messages from the company, your Next of Kin is to be contcted
        as to your way about, and with proper Death Certificate and Evidence All
        assets would be immediately transsfered to our next of kin
      </p>
    </div>

    <!-- Form -->
    <div
      class="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
    >
      <form @submit.prevent="saveNOK" class="space-y-6">
        <h2
          class="text-lg font-semibold border-b border-gray-100 dark:border-gray-800 pb-2"
        >
          Contact Information
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField label="Full Name" name="fullname" required>
            <UInput
              v-model="form.fullname"
              size="lg"
              placeholder="Enter full name"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Relationship" name="relationship" required>
            <USelect
              v-model="form.relationship"
              :options="relationshipOptions"
              size="lg"
              placeholder="Select Relationship"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Email Address" name="email" required>
            <UInput
              v-model="form.email"
              type="email"
              size="lg"
              placeholder="email@example.com"
              icon="i-heroicons-envelope"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Phone Number" name="phone" required>
            <UInput
              v-model="form.phone"
              type="tel"
              size="lg"
              placeholder="+1 (555) 000-0000"
              icon="i-heroicons-phone"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Country of Residence" name="country" required>
            <USelect
              v-model="form.country"
              :options="countries"
              size="lg"
              placeholder="Select Country"
              class="w-full"
            />
          </UFormField>

          <div class="md:col-span-2">
            <UFormField label="Address" name="address" required>
              <UTextarea
                v-model="form.address"
                size="lg"
                placeholder="Enter full address"
                :rows="3"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <div class="pt-4 flex justify-end gap-3">
          <UButton
            to="/account/next-of-kin"
            variant="ghost"
            color="neutral"
            size="xl"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            size="xl"
            color="primary"
            variant="solid"
            label="Save Information"
            icon="i-heroicons-check"
            :loading="isLoading"
            class="text-light"
          />
        </div>
      </form>
    </div>
  </div>
</template>
