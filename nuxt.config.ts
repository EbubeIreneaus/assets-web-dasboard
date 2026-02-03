// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/png', href: '/logo.png' }]
    }
  },
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/tailwind.css'],
  ui: {
    theme: {
      colors: ['lightText', 'bgDark', 'bgLight', 'dark', 'light', 'success', 'warning', 'error']
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NODE_ENV === 'production'
        ? 'https://backend.digitalassetsweb.com'
        : 'http://127.0.0.1:8000',
      apiURL: process.env.NODE_ENV === 'production'
        ? 'https://backend.digitalassetsweb.com'
        : 'http://127.0.0.1:8000'
    }
  }
})
