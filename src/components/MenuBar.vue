<script setup>
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useAuth } from '@/composables/useAuth'

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'BonoSmart'
  },
  subtitle: {
    type: String,
    default: ''
  },
  showCreateButton: {
    type: Boolean,
    default: false
  },
  showListButton: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const { user, logout } = useAuth()

// Funciones de navegación
const goToCreateBond = () => {
  router.push('/bonds/register')
}

const goToBondList = () => {
  router.push('/bonds/list')
}

const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>

<template>
  <div class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4">
      <div class="py-6 flex justify-between items-center">
        <!-- Título y subtítulo -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ title }}</h1>
          <p v-if="subtitle" class="text-gray-600">{{ subtitle }}</p>
        </div>

        <!-- Botones de acción y usuario -->
        <div class="flex items-center gap-4">
          <!-- Botones de navegación -->
          <div class="flex gap-2">
            <Button 
              v-if="showCreateButton"
              label="Nuevo Bono" 
              @click="goToCreateBond"
              icon="pi pi-plus"
            />
            <Button 
              v-if="showListButton"
              label="Mis Bonos" 
              severity="info"
              @click="goToBondList"
              icon="pi pi-list"
            />
          </div>

          <!-- Información del usuario -->
          <div class="hidden sm:flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <i class="pi pi-user text-white text-sm"></i>
            </div>
            <div class="text-sm">
              <div class="font-medium text-gray-900">{{ user?.email || 'Usuario' }}</div>
              <div class="text-gray-500">BonoSmart</div>
            </div>
          </div>

          <!-- Botón de logout -->
          <Button 
            label="Cerrar Sesión" 
            severity="secondary"
            @click="handleLogout"
            icon="pi pi-sign-out"
            class="!text-red-600 !border-red-300 hover:!bg-red-50"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
