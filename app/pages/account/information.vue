<script setup lang="ts">
import { ref, onMounted } from "vue";

const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const isLoading = ref(false);
const isUploading = ref(false);

const user = ref({
  fullname: "",
  email: "",
  type: "",
  email_verified: false,
  country: "",
  phone: "",
  document_verified: false,
  profile_pics: "",
  tier: 0,
  can_verify: false,
});

// To store the original fetched data
const originalUser = ref<any>({});

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

const fileInput = ref<HTMLInputElement | null>(null);

function triggerFileInput() {
  fileInput.value?.click();
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const formData = new FormData();
    formData.append("file", file);

    isUploading.value = true;

    try {
      const authToken = useCookie("authToken");
      const res: any = await $fetch(
        `${runtimeConfig.public.apiURL}/api/auth/update-image`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${authToken.value}`,
          },
        },
      );

      if (res.success) {
        // Update local preview
        const reader = new FileReader();
        reader.onload = (e) => {
          user.value.profile_pics = e.target?.result as string;
        };
        reader.readAsDataURL(file);

        toast.add({
          title: "Photo Updated",
          description: "Your profile picture has been updated successfully.",
          color: "success",
          icon: "i-heroicons-check-circle",
        });
      } else {
        throw new Error(res.msg || "Could not update image");
      }
    } catch (error) {
      toast.add({
        title: "Error",
        description: "Could not update image. Server error.",
        color: "error",
        icon: "i-heroicons-x-circle",
      });
    } finally {
      isUploading.value = false;
      // Reset input
      input.value = "";
    }
  }
}

async function fetchUserInfo() {
  try {
    const authToken = useCookie("authToken");
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/auth/personal-information`,
      {
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      },
    );

    if (res.success) {
      user.value = {
        fullname: res.fullname || "",
        email: res.email || "",
        type: res.type || "",
        email_verified: res.email_verified || false,
        country: res.country || "",
        phone: res.phone || "",
        document_verified: res.document_verified || false,
        profile_pics: res.profile_pics || "",
        tier: res.tier || 0,
        can_verify: res.can_verify || false,
      };

      // Store original response to merge with updates
      originalUser.value = { ...res };
    }
  } catch (error) {
    console.error("Failed to fetch user info", error);
    toast.add({
      title: "Error",
      description: "Failed to load account information.",
      color: "error",
    });
  }
}

async function saveChanges() {
  isLoading.value = true;
  try {
    // Merge current form values with original untouched values
    const payload = {
      ...originalUser.value,
      fullname: user.value.fullname,
      country: user.value.country,
      phone: user.value.phone,
      // Ensure we don't send back fields that shouldn't be updated if the API is strict,
      // but requirement says "send the updated value + the untouched value all together"
    };

    const authToken = useCookie("authToken");
    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/auth/update-personal-information`,
      {
        method: "POST",
        body: payload,
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      },
    );

    if (res.success) {
      toast.add({
        title: "Profile Updated",
        description: "Your account information has been successfully saved.",
        color: "success",
        icon: "i-heroicons-check-circle",
      });
      // Update originalUser with new values
      originalUser.value = { ...payload };
    } else {
      throw new Error(res.msg || "Could not update info");
    }
  } catch (error) {
    toast.add({
      title: "Error",
      description:
        "Could not update info, unknown server error try again later.",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchUserInfo();
});
</script>

<template>
  <div class="mx-auto px-4 py-6 space-y-8 max-w-4xl">
    <PageTop title="Account Information" />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Profile Picture Section -->
      <div class="md:col-span-1 flex flex-col items-center space-y-4">
        <div class="relative group">
          <UAvatar
            :src="user.profile_pics ? `${runtimeConfig.public.apiURL}/${user.profile_pics}`: 'https://i.pravatar.cc/150'"
            :alt="user.fullname"
            size="3xl"
            class="w-32 h-32 ring-4 ring-white dark:ring-gray-800 shadow-lg object-cover"
          />
          <button
            @click="triggerFileInput"
            :disabled="isUploading"
            class="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full shadow-md hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            <UIcon
              :name="
                isUploading ? 'i-heroicons-arrow-path' : 'i-heroicons-camera'
              "
              class="w-5 h-5"
              :class="{ 'animate-spin': isUploading }"
            />
          </button>
        </div>

        <div class="text-center">
          <h3 class="text-xl font-bold">
            {{ user.fullname || "User" }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ user.email }}
          </p>
          <div class="mt-2">
            <UBadge
              :color="user.document_verified ? 'success' : 'error'"
              variant="soft"
            >
              {{ user.document_verified ? "Verified" : "Unverified" }}
            </UBadge>
          </div>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileChange"
        />

        <UButton
          variant="outline"
          color="neutral"
          label="Change Photo"
          @click="triggerFileInput"
          block
          :loading="isUploading"
          class="w-full max-w-[200px]"
        />
      </div>

      <!-- Account Form Section -->
      <div
        class="md:col-span-2 space-y-6 bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
      >
        <h2
          class="text-lg font-semibold border-b border-gray-100 dark:border-gray-800 pb-2"
        >
          Personal Details
        </h2>

        <div class="grid grid-cols-1 gap-4">
          <UFormField label="Full Name" name="fullname">
            <UInput v-model="user.fullname" size="lg" class="w-full" />
          </UFormField>
        </div>

        <UFormField
          label="Email Address"
          name="email"
          help="Email address cannot be changed"
        >
          <UInput
            v-model="user.email"
            size="lg"
            icon="i-heroicons-envelope"
            disabled
            class="opacity-75 w-full"
          />
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Phone Number" name="phone">
            <UInput
              v-model="user.phone"
              size="lg"
              icon="i-heroicons-phone"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Country" name="country">
            <USelect
              v-model="user.country"
              :items="countries"
              size="lg"
              placeholder="Select Country"
              class="w-full"
            />
          </UFormField>
        </div>

        <div class="pt-4 flex justify-end">
          <UButton
            size="xl"
            color="primary"
            variant="solid"
            label="Save Changes"
            icon="i-heroicons-check"
            @click="saveChanges"
            :loading="isLoading"
            class="min-w-[150px] text-light"
          />
        </div>
      </div>
    </div>
  </div>
</template>
