<script setup lang="ts">
defineProps<{
  amounts: number[]
  modelValue: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

function selectAmount(value: number) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="grid grid-cols-3 gap-3 gap-y-5">
    <UButton
      v-for="value in amounts"
      :key="value"
      color="dark"
      class="text-textLight py-3"
      size="xl"
      :class="{
        'ring-2 ring-primary': modelValue === value
      }"
      @click="selectAmount(value)"
    >
      ${{ value.toLocaleString() }}.00
    </UButton>
  </div>
</template>
