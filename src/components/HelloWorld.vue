<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  msg: String,
})

const count = ref(0)
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ msg || "BonoSmart Dashboard" }}</h1>
      
      <div class="space-y-4">
        <p class="text-gray-600">
          Tu aplicación de gestión de bonos está funcionando!
        </p>
        
        <div class="flex flex-col gap-4">
          <Button 
            label="Registrar Nuevo Bono"
            class="w-full"
            @click="router.push('/bonds/register')"
          />
          
          <Button 
            label="Ir al Login"
            severity="secondary"
            class="w-full"
            @click="router.push('/login')"
          />
          
          <Button 
            label="Registrarse"
            severity="help"
            class="w-full"
            @click="router.push('/register')"
          />
        </div>

        <div class="mt-6 p-4 bg-gray-100 rounded">
          <button 
            @click="count++"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Contador: {{ count }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
