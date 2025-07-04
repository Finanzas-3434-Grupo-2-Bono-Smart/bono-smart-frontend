<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import AuthService from '@/service/AuthService'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { setAuthData, isAuthenticated, initializeAuth } = useAuth()

// Estados del formulario
const email = ref('')
const password = ref('')
const checked = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

// Validaciones
const isFormValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value) && password.value.length >= 6
})

// Función de login
const handleLogin = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await AuthService.login(email.value, password.value)
    
    if (result.success) {
      // Guardar datos de autenticación
      setAuthData(result.data)
      
      // Redirigir a la lista de bonos
      router.push('/bonds/list')
    } else {
      errorMessage.value = result.error || 'Invalid credentials. Please try again.'
    }
  } catch (error) {
    errorMessage.value = 'An unexpected error occurred. Please try again.'
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}

// Verificar si ya está autenticado
onMounted(() => {
  initializeAuth()
  if (isAuthenticated.value) {
    router.push('/bonds/list')
  }
})
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="max-w-md w-full space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Welcome to BonoSmart!
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    Sign in to continue
                </p>
            </div>
            
            <!-- Error Message -->
            <div v-if="errorMessage" class="mb-4">
                <Message severity="error" :closable="false">{{ errorMessage }}</Message>
            </div>
            
            <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <InputText 
                        id="email" 
                        v-model="email" 
                        type="email" 
                        placeholder="Enter your email"
                        class="mt-1 w-full"
                        :disabled="isLoading"
                        :class="{ 'border-red-500': email && !isFormValid }"
                        required
                    />
                </div>
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <Password 
                        id="password" 
                        v-model="password" 
                        placeholder="Enter your password"
                        class="mt-1 w-full"
                        :feedback="false"
                        toggleMask
                        :disabled="isLoading"
                        required
                    />
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <Checkbox v-model="checked" id="remember" binary :disabled="isLoading" />
                        <label for="remember" class="ml-2 block text-sm text-gray-900">
                            Remember me
                        </label>
                    </div>
                    <div class="text-sm">
                        <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
                            Forgot your password?
                        </a>
                    </div>
                </div>
                <div>
                    <Button 
                        :label="isLoading ? 'Signing in...' : 'Sign In'"
                        type="submit"
                        class="w-full"
                        :disabled="!isFormValid || isLoading"
                        :loading="isLoading"
                    />
                </div>
                
                <!-- Link to Register -->
                <div class="text-center">
                    <p class="text-sm text-gray-600">
                        Don't have an account? 
                        <button 
                            type="button"
                            @click="router.push('/register')"
                            class="font-medium text-blue-600 hover:text-blue-500"
                            :disabled="isLoading"
                        >
                            Create one here
                        </button>
                    </p>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.border-red-500 {
    border-color: #ef4444 !important;
}
</style>