<script setup>
import { ref, onMounted } from "vue";

const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const isLoading = ref(false);

const form = ref({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const contactInfo = ref([
  {
    icon: "i-heroicons-envelope",
    label: "Email",
    value: "support@digitalassetsweb.com", // Keeping as default/placeholder or could be from API if available
    href: "mailto:support@digitalassetsweb.com",
  },
  {
    icon: "i-heroicons-phone",
    label: "Phone",
    value: "", // Will be updated from API
    href: "",
  },
]);

const socialLinks = ref([
  {
    icon: "mdi:facebook",
    color: "text-blue-600",
    href: "#",
    label: "Facebook",
  },
  {
    icon: "mdi:twitter", // Changed from mdi:whatsapp as per API response (twitter_url)
    color: "text-blue-400",
    href: "#",
    label: "Twitter",
  },
  {
    icon: "mdi:telegram",
    color: "text-blue-500",
    href: "#",
    label: "Telegram",
  },
]);

const fetchSupportDetails = async () => {
  try {
    const res = await $fetch(
      `${runtimeConfig.public.apiURL}/api/admin/support`,
    );

    if (res.success && res.data) {
      // Update Phone
      if (res.data.phone) {
        const phoneIndex = contactInfo.value.findIndex(
          (c) => c.label === "Phone",
        );
        if (phoneIndex !== -1 && contactInfo.value[phoneIndex]) {
          contactInfo.value[phoneIndex].value = res.data.phone;
          contactInfo.value[phoneIndex].href = `tel:${res.data.phone}`;
        }
      }

      // Update Social Links
      if (res.data.facebook_url) {
        const fbIndex = socialLinks.value.findIndex(
          (s) => s.label === "Facebook",
        );
        if (fbIndex !== -1 && socialLinks.value[fbIndex])
          socialLinks.value[fbIndex].href = res.data.facebook_url;
      }

      if (res.data.twitter_url) {
        const twitterIndex = socialLinks.value.findIndex(
          (s) => s.label === "Twitter",
        );
        if (twitterIndex !== -1 && socialLinks.value[twitterIndex])
          socialLinks.value[twitterIndex].href = res.data.twitter_url;
      }

      if (res.data.telegram_url) {
        const tgIndex = socialLinks.value.findIndex(
          (s) => s.label === "Telegram",
        );
        if (tgIndex !== -1 && socialLinks.value[tgIndex])
          socialLinks.value[tgIndex].href = res.data.telegram_url;
      }
    }
  } catch (error) {
    toast.add({
      title: "Error",
      description: "Failed to load support details",
      color: "error",
    });
  }
};

async function sendMessage() {
  isLoading.value = true;

  try {
    // Using placeholder endpoint as requested
    await $fetch("https://formspree.io/f/mzdvorkv", {
      method: "POST",
      body: form.value,
      headers: {
        Accept: "application/json",
      },
    });

    toast.add({
      title: "Message Sent",
      description:
        "We have received your message and will get back to you shortly.",
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    // Reset form
    form.value = {
      name: "",
      email: "",
      subject: "",
      message: "",
    };
  } catch (error) {
    toast.add({
      title: "Error",
      description: "Failed to send message. Please try again later.",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchSupportDetails();

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  const s1 = document.createElement("script");
  s1.async = true;
  s1.src = "https://embed.tawk.to/68587d0303b6a21914ee2840/1iucqgmje";
  s1.charset = "UTF-8";
  s1.setAttribute("crossorigin", "*");

  document.body.appendChild(s1);
});
</script>

<template>
  <div class="mx-auto px-4 py-6 space-y-8 max-w-5xl">
    <PageTop title="Contact Us" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Contact Information -->
      <div class="space-y-6">
        <div
          class="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6"
        >
          <h2 class="text-xl font-bold">Get in Touch</h2>
          <p class="text-gray-500 dark:text-gray-400">
            Have questions or need assistance? Reach out to us through any of
            the channels below or send us a message directly.
          </p>

          <div class="space-y-4">
            <div
              v-for="item in contactInfo"
              :key="item.label"
              class="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div
                class="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-primary"
              >
                <UIcon :name="item.icon" class="w-5 h-5" />
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ item.label }}
                </p>
                <a
                  :href="item.href"
                  class="font-medium hover:text-primary transition-colors"
                >
                  {{ item.value || "Loading..." }}
                </a>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
            <h3 class="text-sm font-medium mb-3">Connect with us</h3>
            <div class="flex gap-4">
              <a
                v-for="social in socialLinks"
                :key="social.label"
                :href="social.href"
                target="_blank"
                class="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                :aria-label="social.label"
              >
                <UIcon
                  :name="social.icon"
                  class="w-6 h-6"
                  :class="social.color"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Form -->
      <div
        class="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
      >
        <h2 class="text-xl font-bold mb-6">Send a Message</h2>
        <form @submit.prevent="sendMessage" class="space-y-4">
          <UFormField label="Full Name" name="name" required>
            <UInput
              v-model="form.name"
              size="lg"
              placeholder="Your name"
              icon="i-heroicons-user"
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

          <UFormField label="Subject" name="subject" required>
            <UInput
              v-model="form.subject"
              size="lg"
              placeholder="How can we help?"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Message" name="message" required>
            <UTextarea
              v-model="form.message"
              size="lg"
              placeholder="Type your message here..."
              :rows="5"
              class="w-full"
            />
          </UFormField>

          <div class="pt-2">
            <UButton
              type="submit"
              size="xl"
              color="primary"
              variant="solid"
              label="Send Message"
              icon="i-heroicons-paper-airplane"
              :loading="isLoading"
              block
              class="text-light"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
