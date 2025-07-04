<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import AuthService from '@/service/AuthService'

const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const firstName = ref('')
const lastName = ref('')
const agreeTerms = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Computed property para extraer el username del email
const username = computed(() => {
    if (email.value && email.value.includes('@')) {
        return email.value.split('@')[0]
    }
    return ''
})

// Validaciones básicas
const isValidEmail = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.value)
})

const passwordsMatch = computed(() => {
    return password.value === confirmPassword.value && password.value.length > 0
})

const isFormValid = computed(() => {
    return isValidEmail.value && 
           passwordsMatch.value && 
           firstName.value.trim() !== '' && 
           lastName.value.trim() !== '' &&
           agreeTerms.value &&
           password.value.length >= 6
})

const handleRegister = async () => {
    if (!isFormValid.value) return

    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const result = await AuthService.register(email.value, password.value)
        
        if (result.success) {
            successMessage.value = 'Account created successfully! Please check your email to verify your account.'
            
            // Limpiar el formulario
            email.value = ''
            password.value = ''
            confirmPassword.value = ''
            firstName.value = ''
            lastName.value = ''
            agreeTerms.value = false
            
            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } else {
            errorMessage.value = result.error || 'Registration failed. Please try again.'
        }
    } catch (error) {
        errorMessage.value = 'An unexpected error occurred. Please try again.'
        console.error('Registration error:', error)
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="max-w-md w-full space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create your BonoSmart account
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    Join us to manage your finances
                </p>
            </div>
            
            <!-- Messages -->
            <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {{ errorMessage }}
            </div>
            
            <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {{ successMessage }}
            </div>
            
            <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
                <!-- Nombre -->
                <div>
                    <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
                    <InputText 
                        id="firstName" 
                        v-model="firstName" 
                        type="text" 
                        placeholder="Enter your first name"
                        class="mt-1 w-full"
                        :disabled="isLoading"
                        required
                    />
                </div>

                <!-- Apellido -->
                <div>
                    <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
                    <InputText 
                        id="lastName" 
                        v-model="lastName" 
                        type="text" 
                        placeholder="Enter your last name"
                        class="mt-1 w-full"
                        :disabled="isLoading"
                        required
                    />
                </div>

                <!-- Email -->
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <InputText 
                        id="email" 
                        v-model="email" 
                        type="email" 
                        placeholder="Enter your email"
                        class="mt-1 w-full"
                        :class="{ 'border-red-500': email && !isValidEmail }"
                        :disabled="isLoading"
                        required
                    />
                    <p v-if="email && !isValidEmail" class="mt-1 text-sm text-red-600">
                        Please enter a valid email address
                    </p>
                </div>

                <!-- Username (auto-generado) -->
                <div v-if="username">
                    <label class="block text-sm font-medium text-gray-700">Username (auto-generated)</label>
                    <div class="mt-1 p-2 bg-gray-100 border border-gray-300 rounded-md">
                        <span class="text-gray-700">{{ username }}</span>
                    </div>
                    <p class="mt-1 text-xs text-gray-500">
                        This will be your username based on your email
                    </p>
                </div>

                <!-- Password -->
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <Password 
                        id="password" 
                        v-model="password" 
                        placeholder="Enter your password"
                        class="mt-1 w-full"
                        :feedback="true"
                        toggleMask
                        :disabled="isLoading"
                        :class="{ 'border-red-500': password && password.length < 6 }"
                    />
                    <p v-if="password && password.length < 6" class="mt-1 text-sm text-red-600">
                        Password must be at least 6 characters
                    </p>
                </div>

                <!-- Confirm Password -->
                <div>
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <Password 
                        id="confirmPassword" 
                        v-model="confirmPassword" 
                        placeholder="Confirm your password"
                        class="mt-1 w-full"
                        :feedback="false"
                        toggleMask
                        :disabled="isLoading"
                        :class="{ 'border-red-500': confirmPassword && !passwordsMatch }"
                    />
                    <p v-if="confirmPassword && !passwordsMatch" class="mt-1 text-sm text-red-600">
                        Passwords do not match
                    </p>
                </div>

                <!-- Terms and Conditions -->
                <div class="flex items-center">
                    <Checkbox v-model="agreeTerms" id="terms" binary :disabled="isLoading" />
                    <label for="terms" class="ml-2 block text-sm text-gray-900">
                        I agree to the 
                        <a href="#" class="text-blue-600 hover:text-blue-500">Terms and Conditions</a>
                        and 
                        <a href="#" class="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                    </label>
                </div>

                <!-- Register Button -->
                <div>
                    <Button 
                        :label="isLoading ? 'Creating Account...' : 'Create Account'"
                        type="submit"
                        class="w-full"
                        :disabled="!isFormValid || isLoading"
                        :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || isLoading }"
                    />
                </div>

                <!-- Link to Login -->
                <div class="text-center">
                    <p class="text-sm text-gray-600">
                        Already have an account? 
                        <button 
                            type="button"
                            @click="router.push('/login')"
                            class="font-medium text-blue-600 hover:text-blue-500"
                            :disabled="isLoading"
                        >
                            Sign in here
                        </button>
                    </p>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.border-red-500 {
    border-color: #ef4444;
}
</style>