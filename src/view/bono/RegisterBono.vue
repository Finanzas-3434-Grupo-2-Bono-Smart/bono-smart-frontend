<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import BondService from '@/service/BondService'
import { useAuth } from '@/composables/useAuth'
import MenuBar from '@/components/MenuBar.vue'

const router = useRouter()
const { user, isAuthenticated, getUserId } = useAuth()

// Verificar autenticación al cargar
onMounted(() => {
  console.log('RegisterBono mounted, checking auth...')
  console.log('isAuthenticated:', isAuthenticated.value)
  console.log('user:', user.value)
  console.log('getUserId():', getUserId())
  
  if (!isAuthenticated.value) {
    console.log('User not authenticated, redirecting to login')
    router.push('/login')
    return
  }
})

// Estados del formulario
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Campos del formulario
const bondData = ref({
  nombre: '',
  moneda: 'PEN',
  tipo_tasa: 'efectiva',
  tasa: null,
  frecuencia_capitalizacion: null,
  frecuencia_pago: 2,
  plazo_meses: null,
  valor_nominal: null,
  valor_comercial: null,
  fecha_emision: new Date(),
  plazo_gracia: 'total',
  porcentaje_retencion: 0.05
})

// Opciones para dropdowns
const monedaOptions = ref([
  { label: 'Soles (PEN)', value: 'PEN' },
  { label: 'Dólares (USD)', value: 'USD' }
])

const tipoTasaOptions = ref([
  { label: 'Efectiva', value: 'efectiva' },
  { label: 'Nominal', value: 'nominal' }
])

const frecuenciaPagoOptions = ref([
  { label: 'Mensual', value: 12 },
  { label: 'Bimestral', value: 6 },
  { label: 'Trimestral', value: 4 },
  { label: 'Semestral', value: 2 },
  { label: 'Anual', value: 1 }
])

const plazoGraciaOptions = ref([
  { label: 'Total', value: 'total' },
  { label: 'Parcial', value: 'parcial' },
  { label: 'Sin gracia', value: 'sin_gracia' }
])

// Validaciones
const isFormValid = computed(() => {
  return bondData.value.nombre.trim() !== '' &&
         bondData.value.tasa > 0 &&
         bondData.value.plazo_meses > 0 &&
         bondData.value.valor_nominal > 0 &&
         bondData.value.valor_comercial > 0 &&
         bondData.value.fecha_emision &&
         bondData.value.porcentaje_retencion >= 0
})

// Funciones
const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const userId = getUserId()
    console.log('Creating bond for user ID:', userId) // Para debugging
    
    if (!userId) {
      errorMessage.value = 'Error: Usuario no autenticado.'
      router.push('/login')
      return
    }

    const dataToSend = {
      user_id: userId,
      ...bondData.value,
      tasa: bondData.value.tasa / 100, // Convertir porcentaje a decimal
      porcentaje_retencion: bondData.value.porcentaje_retencion / 100,
      fecha_emision: bondData.value.fecha_emision.toISOString().split('T')[0]
    }
    
    console.log('Data to send:', dataToSend) // Para debugging

    const result = await BondService.createBond(dataToSend)
    
    if (result.success) {
      successMessage.value = 'Bono registrado exitosamente!'
      
      // Limpiar formulario automáticamente
      setTimeout(() => {
        resetForm()
        successMessage.value = ''
      }, 3000)
    } else {
      errorMessage.value = result.error || 'Error al registrar el bono. Intente nuevamente.'
    }
  } catch (error) {
    errorMessage.value = 'Error inesperado. Intente nuevamente.'
    console.error('Bond registration error:', error)
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  bondData.value = {
    nombre: '',
    moneda: 'PEN',
    tipo_tasa: 'efectiva',
    tasa: null,
    frecuencia_capitalizacion: null,
    frecuencia_pago: 2,
    plazo_meses: null,
    valor_nominal: null,
    valor_comercial: null,
    fecha_emision: new Date(),
    plazo_gracia: 'total',
    porcentaje_retencion: 0.05
  }
}

// Auto-completar valor comercial basado en valor nominal
const syncValorComercial = () => {
  if (bondData.value.valor_nominal && !bondData.value.valor_comercial) {
    bondData.value.valor_comercial = bondData.value.valor_nominal
  }
}
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Menu Bar -->
        <MenuBar 
            title="Registrar Nuevo Bono"
            subtitle="Complete la información del bono que desea registrar"
            :show-list-button="true"
        />
        
        <div class="max-w-4xl mx-auto px-4 py-8">

            <!-- Messages -->
            <div v-if="errorMessage" class="mb-6">
                <Message severity="error" :closable="false">{{ errorMessage }}</Message>
            </div>
            
            <div v-if="successMessage" class="mb-6">
                <Message severity="success" :closable="false">{{ successMessage }}</Message>
            </div>

            <!-- Formulario -->
            <form @submit.prevent="handleSubmit" class="bg-white shadow-lg rounded-lg p-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Información General -->
                    <div class="col-span-1 md:col-span-2">
                        <h2 class="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                            Información General
                        </h2>
                    </div>

                    <!-- Nombre del Bono -->
                    <div class="flex flex-col gap-2">
                        <label for="nombre" class="font-medium text-gray-700">
                            Nombre del Bono <span class="text-red-500">*</span>
                        </label>
                        <InputText 
                            id="nombre" 
                            v-model="bondData.nombre" 
                            placeholder="Ej: Bono Hudbay"
                            :disabled="isLoading"
                            required
                        />
                    </div>

                    <!-- Moneda -->
                    <div class="flex flex-col gap-2">
                        <label for="moneda" class="font-medium text-gray-700">
                            Moneda <span class="text-red-500">*</span>
                        </label>
                        <Dropdown
                            id="moneda"
                            v-model="bondData.moneda"
                            :options="monedaOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Seleccionar moneda"
                            :disabled="isLoading"
                        />
                    </div>

                    <!-- Configuración de Tasa -->
                    <div class="col-span-1 md:col-span-2">
                        <h2 class="text-xl font-semibold text-gray-900 mb-4 border-b pb-2 mt-6">
                            Configuración de Tasa
                        </h2>
                    </div>

                    <!-- Tipo de Tasa -->
                    <div class="flex flex-col gap-2">
                        <label for="tipo_tasa" class="font-medium text-gray-700">
                            Tipo de Tasa <span class="text-red-500">*</span>
                        </label>
                        <Dropdown
                            id="tipo_tasa"
                            v-model="bondData.tipo_tasa"
                            :options="tipoTasaOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Seleccionar tipo"
                            :disabled="isLoading"
                        />
                    </div>

                    <!-- Tasa (%) -->
                    <div class="flex flex-col gap-2">
                        <label for="tasa" class="font-medium text-gray-700">
                            Tasa (%) <span class="text-red-500">*</span>
                        </label>
                        <InputNumber
                            id="tasa"
                            v-model="bondData.tasa"
                            mode="decimal"
                            :min="0"
                            :max="100"
                            :max-fraction-digits="4"
                            placeholder="7.5"
                            :disabled="isLoading"
                            suffix="%"
                        />
                    </div>

                    <!-- Frecuencia de Pago -->
                    <div class="flex flex-col gap-2">
                        <label for="frecuencia_pago" class="font-medium text-gray-700">
                            Frecuencia de Pago <span class="text-red-500">*</span>
                        </label>
                        <Dropdown
                            id="frecuencia_pago"
                            v-model="bondData.frecuencia_pago"
                            :options="frecuenciaPagoOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Seleccionar frecuencia"
                            :disabled="isLoading"
                        />
                    </div>

                    <!-- Plazo en Meses -->
                    <div class="flex flex-col gap-2">
                        <label for="plazo_meses" class="font-medium text-gray-700">
                            Plazo (meses) <span class="text-red-500">*</span>
                        </label>
                        <InputNumber
                            id="plazo_meses"
                            v-model="bondData.plazo_meses"
                            :min="1"
                            :max="600"
                            placeholder="36"
                            :disabled="isLoading"
                            suffix=" meses"
                        />
                    </div>

                    <!-- Información Financiera -->
                    <div class="col-span-1 md:col-span-2">
                        <h2 class="text-xl font-semibold text-gray-900 mb-4 border-b pb-2 mt-6">
                            Información Financiera
                        </h2>
                    </div>

                    <!-- Valor Nominal -->
                    <div class="flex flex-col gap-2">
                        <label for="valor_nominal" class="font-medium text-gray-700">
                            Valor Nominal <span class="text-red-500">*</span>
                        </label>
                        <InputNumber
                            id="valor_nominal"
                            v-model="bondData.valor_nominal"
                            mode="currency"
                            :currency="bondData.moneda"
                            locale="es-PE"
                            :min="0"
                            placeholder="2100"
                            :disabled="isLoading"
                            @input="syncValorComercial"
                        />
                    </div>

                    <!-- Valor Comercial -->
                    <div class="flex flex-col gap-2">
                        <label for="valor_comercial" class="font-medium text-gray-700">
                            Valor Comercial <span class="text-red-500">*</span>
                        </label>
                        <InputNumber
                            id="valor_comercial"
                            v-model="bondData.valor_comercial"
                            mode="currency"
                            :currency="bondData.moneda"
                            locale="es-PE"
                            :min="0"
                            placeholder="2100"
                            :disabled="isLoading"
                        />
                    </div>

                    <!-- Fecha de Emisión -->
                    <div class="flex flex-col gap-2">
                        <label for="fecha_emision" class="font-medium text-gray-700">
                            Fecha de Emisión <span class="text-red-500">*</span>
                        </label>
                        <Calendar
                            id="fecha_emision"
                            v-model="bondData.fecha_emision"
                            date-format="dd/mm/yy"
                            placeholder="Seleccionar fecha"
                            :disabled="isLoading"
                        />
                    </div>

                    <!-- Plazo de Gracia -->
                    <div class="flex flex-col gap-2">
                        <label for="plazo_gracia" class="font-medium text-gray-700">
                            Plazo de Gracia
                        </label>
                        <Dropdown
                            id="plazo_gracia"
                            v-model="bondData.plazo_gracia"
                            :options="plazoGraciaOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Seleccionar tipo"
                            :disabled="isLoading"
                        />
                    </div>

                    <!-- Porcentaje de Retención -->
                    <div class="flex flex-col gap-2">
                        <label for="porcentaje_retencion" class="font-medium text-gray-700">
                            Porcentaje de Retención (%)
                        </label>
                        <InputNumber
                            id="porcentaje_retencion"
                            v-model="bondData.porcentaje_retencion"
                            mode="decimal"
                            :min="0"
                            :max="100"
                            :max-fraction-digits="2"
                            placeholder="5"
                            :disabled="isLoading"
                            suffix="%"
                        />
                    </div>
                </div>

                <!-- Botones -->
                <div class="flex justify-between gap-4 mt-8 pt-6 border-t">
                    <div class="text-sm text-gray-600">
                        <p>Usuario: <span class="font-medium">{{ user?.email }}</span></p>
                        <p>ID: <span class="font-mono text-xs">{{ getUserId() }}</span></p>
                    </div>
                    <div class="flex gap-4">
                        <Button 
                            label="Limpiar Formulario" 
                            severity="secondary"
                            @click="resetForm"
                            :disabled="isLoading"
                            type="button"
                        />
                        <Button 
                            :label="isLoading ? 'Registrando...' : 'Registrar Bono'"
                            type="submit"
                            :disabled="!isFormValid || isLoading"
                            :loading="isLoading"
                        />
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>
