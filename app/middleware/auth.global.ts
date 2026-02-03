export default defineNuxtRouteMiddleware((to, from) => {
  const authToken = useCookie('authToken')

  if (!authToken.value && !to.path.startsWith('/auth')) {
    return navigateTo('/auth/login')
  }
})
