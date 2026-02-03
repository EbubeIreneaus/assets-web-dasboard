<template>
  <div class="space-y-6">
    <!-- Profile Section -->
    <div class="text-center">
      <div class="relative inline-block">
        <img
          :src="userProfile.image"
          alt="Profile"
          class="w-24 h-24 rounded-full mx-auto object-cover"
        />
        <button
          class="absolute inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 rounded-full text-white"
        >
          ✎
        </button>
      </div>
      <p class="mt-2 text-lg font-semibold">{{ userProfile.fullname }}</p>
    </div>

    <!-- Navigations -->
    <div class="bg-dark p-4 rounded-lg">
      <ul class="space-y-3">
        <li v-for="item in navigationLinks" :key="item.text">
          <nuxt-link
            :to="item.to"
            class="flex justify-between items-center text-sm"
          >
            <span>{{ item.text }}</span>
            <u-icon name="mdi:chevron-right" size="25" />
          </nuxt-link>
        </li>
      </ul>
    </div>

    <!-- Account Settings -->
    <div class="bg-dark p-4 rounded-lg">
      <h2 class="text-sm font-bold mb-2">Account Settings</h2>
      <ul class="space-y-3">
        <li v-for="item in accountSettings" :key="item.text">
          <nuxt-link
            :to="item.to"
            class="flex justify-between items-center text-sm"
          >
            <span>{{ item.text }}</span>
            <u-icon name="mdi:chevron-right" size="25" />
          </nuxt-link>
        </li>
      </ul>
    </div>

    <!-- Invite & Earn -->
    <div class="bg-dark p-4 rounded-lg">
      <nuxt-link
        to="/account/referral"
        class="flex justify-between items-center text-sm"
      >
        <span>Invite & Earn</span>
        <u-icon name="mdi:chevron-right" size="25" />
      </nuxt-link>
    </div>

    <!-- Verifications -->
    <div class="bg-dark p-4 rounded-lg">
      <h2 class="text-sm font-bold mb-2 text-textLight/40">Verifications</h2>
      <ul class="space-y-3">
        <li class="flex justify-between items-center text-sm">
          <span>Email Verification</span>
          <u-icon name="mdi:check-circle" class="text-green-500" v-if="true" />
          <u-icon name="mdi:check-circle" class="text-red-500" v-else />
        </li>
      </ul>
    </div>

    <!-- Legal -->
    <div class="bg-dark p-4 rounded-lg">
      <h2 class="text-sm font-bold mb-2 text-textLight/50">Legal</h2>
      <ul class="space-y-2">
        <li v-for="item in legalLinks" :key="item.text" class="">
          <nuxt-link
            :to="item.to || '#'"
            class="flex justify-between items-center text-sm"
          >
            <span>{{ item.text }}</span>
            <u-icon name="mdi:chevron-right" size="25" />
          </nuxt-link>
        </li>
      </ul>
    </div>

    <!-- Security -->
    <div class="bg-dark p-4 rounded-lg">
      <h2 class="text-sm font-bold mb-2 text-textLight/40">Security</h2>
      <ul class="space-y-2">
        <li v-for="item in securityLinks" :key="item.text" class="">
          <nuxt-link
            :to="item.to"
            class="flex justify-between items-center text-sm"
          >
            <u-button
              :icon="item.icon"
              :color="item.color"
              :label="item.text"
              variant="ghost"
            />
            <u-icon name="mdi:chevron-right" size="25" />
          </nuxt-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const runtimeConfig = useRuntimeConfig();
const authToken = useCookie("authToken");

const userProfile = ref({
  fullname: "",
  image: "/profile.png",
});

onMounted(async () => {
  try {
    const data = await $fetch(
      `${runtimeConfig.public.apiURL}/api/account/profile`,
      {
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      },
    );

    if (data.success) {
      userProfile.value.fullname = data.fullname;
      if (data.image) {
        userProfile.value.image = `${runtimeConfig.public.apiURL}${data.image}`;
      }
    }
  } catch (error) {
    console.error("Failed to fetch profile:", error);
  }
});

const navigationLinks = [
  { text: "Dashboard", to: "/" },
  { text: "Transactions", to: "/transactions" },
  { text: "Contact", to: "/contact" },
];

const accountSettings = [
  { text: "Personal Information", to: "/account/information" },
  { text: "Change Password", to: "/account/change-password" },
  { text: "Next of Kin", to: "/account/next-of-kin" },
];

const legalLinks = [
  { text: "Our Service", to: "/our-services" },
  { text: "Terms of Use", to: "/terms-of-service" },
  { text: "Privacy Policy", to: "/privacy-policy" },
];

const securityLinks = [
  {
    to: "/auth/signout",
    text: "Sign Out",
    icon: "mdi:facebook",
    color: "warning",
  },
  {
    to: "/account/delete-account",
    text: "Delete Account",
    icon: "mdi:facebook",
    color: "error",
  },
];
</script>

<style scoped>
/* Add any additional styles here */
</style>
