<template>
  <div class="mx-auto px-4 py-6 space-y-8">
    <PageTop title="Travel Booking" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Flight Booking -->
      <div
        class="bg-white dark:bg-gray-900/50 p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center space-y-4 hover:border-primary-500 transition-colors cursor-pointer"
        @click="navigateTo('/booking/flight')"
      >
        <div class="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-full">
          <UIcon
            name="i-heroicons-paper-airplane"
            class="w-8 h-8 text-primary-500"
          />
        </div>
        <div>
          <h3 class="text-xl font-bold">Book a Flight</h3>
          <p class="text-gray-500 dark:text-gray-400 mt-2">
            Find the best flights for your next destination.
          </p>
        </div>
        <UButton
          to="/booking/flight"
          size="lg"
          variant="solid"
          color="primary"
          block
          class="w-full max-w-xs mt-4"
        >
          Book Flight
        </UButton>
      </div>

      <!-- Visa Booking -->
      <div
        class="bg-white dark:bg-gray-900/50 p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center space-y-4 hover:border-primary-500 transition-colors cursor-pointer"
        @click="navigateTo('/booking/visa')"
      >
        <div class="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-full">
          <UIcon
            name="i-heroicons-identification"
            class="w-8 h-8 text-primary-500"
          />
        </div>
        <div>
          <h3 class="text-xl font-bold">Apply for Visa</h3>
          <p class="text-gray-500 dark:text-gray-400 mt-2">
            Get your visa processed quickly and easily.
          </p>
        </div>
        <UButton
          to="/booking/visa"
          size="lg"
          variant="solid"
          color="primary"
          block
          class="w-full max-w-xs mt-4"
        >
          Apply Now
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No script logic needed for navigation page
</script>
