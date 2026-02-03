<script setup lang="ts">
import { ref, computed } from "vue";

const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const authToken = useCookie("authToken");

const isLoading = ref(false);

const tripTypes = [
  { value: "oneway", label: "One Way" },
  { value: "return", label: "Return" },
  { value: "multi", label: "Multi-City" },
];

const boardingClasses = ["Economy", "Business", "First class"];

const today = new Date().toISOString().split("T")[0];

const form = ref({
  trip_type: "oneway",
  from_city: "",
  to_city: "",
  departure_date: today,
  arrival_date: null,
  passenger: 1,
  boarding_class: "Economy", // Default match select item, will map to payload later if needed
  book_with_avios: false,
});

async function submitFlight() {
  isLoading.value = true;

  try {
    const payload = {
      ...form.value,
      boarding_class: form.value.boarding_class.toLowerCase(),
    };

    const apiBody = {
      from_city: payload.from_city,
      to_city: payload.to_city,
      departure_date: payload.departure_date,
      arrival_date: payload.arrival_date,
      boarding_class: payload.boarding_class,
      trip_type: payload.trip_type,
      passenger: payload.passenger,
    };

    const res: any = await $fetch(
      `${runtimeConfig.public.apiURL}/api/booking/flight`,
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
        title: "Flight Booked",
        description: "Your flight has been booked successfully.",
        color: "success",
        icon: "i-heroicons-check-circle",
      });
      router.push("/booking");
    } else {
      toast.add({
        title: "Booking Failed",
        description: res.msg || "Failed to book flight.",
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
        "An error occurred while booking flight.",
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
    <PageTop title="Book a Flight" />

    <div
      class="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
    >
      <form @submit.prevent="submitFlight" class="space-y-6">
        <!-- Trip Type -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >Trip Type</label
          >
          <URadioGroup
            v-model="form.trip_type"
            :items="tripTypes"
            label-key="label"
            value-key="value"
            class="flex gap-4"
            :ui="{ wrapper: 'flex gap-4', fieldset: 'flex gap-4' }"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- From -->
          <UFormField label="From" name="from_city" required>
            <UInput
              v-model="form.from_city"
              size="lg"
              placeholder="Origin City"
              icon="i-heroicons-paper-airplane"
              class="w-full"
            />
          </UFormField>

          <!-- To -->
          <UFormField label="To" name="to_city" required>
            <UInput
              v-model="form.to_city"
              size="lg"
              placeholder="Destination City"
              icon="i-heroicons-map-pin"
              class="w-full"
            />
          </UFormField>

          <!-- Departure Date -->
          <UFormField label="Departure Date" name="departure_date" required>
            <UInput
              v-model="form.departure_date"
              type="date"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <!-- Return Date (Conditional) -->
          <UFormField
            v-if="form.trip_type === 'return'"
            label="Return Date"
            name="arrival_date"
            required
          >
            <UInput
              v-model="form.arrival_date"
              type="date"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <!-- Passengers -->
          <UFormField label="Passengers" name="passenger" required>
            <UInput
              v-model="form.passenger"
              type="number"
              min="1"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <!-- Boarding Class -->
          <UFormField label="Boarding Class" name="boarding_class" required>
            <USelect
              v-model="form.boarding_class"
              :items="boardingClasses"
              size="lg"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Avios Checkbox -->
        <UCheckbox v-model="form.book_with_avios" label="Book using Avios" />

        <div class="pt-4 flex justify-end gap-3">
          <UButton to="/booking" variant="ghost" color="neutral" size="xl">
            Cancel
          </UButton>
          <UButton
            type="submit"
            size="xl"
            color="primary"
            variant="solid"
            label="Book Flight"
            icon="i-heroicons-paper-airplane"
            :loading="isLoading"
            class="text-light"
          />
        </div>
      </form>
    </div>
  </div>
</template>
