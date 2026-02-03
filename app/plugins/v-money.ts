export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('money', {
    mounted(el, binding) {
      const value = binding.value;
      if (typeof value === 'number' || !isNaN(Number(value))) {
        el.textContent = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(Number(value));
      } else {
        el.textContent = '$0.00';
      }
    },
    updated(el, binding) {
      const value = binding.value;
      if (value !== binding.oldValue) {
        if (typeof value === 'number' || !isNaN(Number(value))) {
          el.textContent = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(Number(value));
        } else {
          el.textContent = '$0.00';
        }
      }
    }
  })
})
