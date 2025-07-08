<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Card from 'primevue/card'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import BondService from '@/service/BondService'
import { useAuth } from '@/composables/useAuth'
import MenuBar from '@/components/MenuBar.vue'

const router = useRouter()
const { user, isAuthenticated, getUserId } = useAuth()

// Estados
const bonds = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const debugInfo = ref('')

const goToCreateBond = () => {
  router.push('/bonds/register')
}

// Computed properties para debugging
const hasToken = computed(() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return !!localStorage.getItem('access_token')
  }
  return false
})

const tokenStatus = computed(() => {
  return hasToken.value ? '✅ Existe' : '❌ No existe'
})

// Verificar autenticación al cargar
onMounted(async () => {
  console.log('=== DEBUGGING INFO ===')
  console.log('ListaBono mounted, checking auth...')
  console.log('isAuthenticated:', isAuthenticated.value)
  console.log('user:', user.value)
  console.log('getUserId():', getUserId())
  
  // Mostrar información de debugging
  debugInfo.value = `
    Usuario autenticado: ${user.value?.email || 'No disponible'}
    User ID: ${getUserId() || 'No disponible'}
    Token existe: ${hasToken.value}
  `
  
  if (!isAuthenticated.value) {
    console.log('User not authenticated, redirecting to login')
    router.push('/login')
    return
  }
  
  await loadUserBonds()
})

function goToBondFlow(bondId, bondName) {
  router.push({ name: 'bond-flow', query: { bond_id: bondId, bond_name: bondName } })
}



// Cargar bonos del usuario
const loadUserBonds = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const userId = getUserId()
    console.log('=== LOADING BONDS ===')
    console.log('Loading bonds for user ID:', userId)
    console.log('API endpoint will be:', `${BondService.baseURL}/bonds?user_id=eq.${userId}`)
    
    if (!userId) {
      errorMessage.value = 'Error: Usuario no autenticado.'
      router.push('/login')
      return
    }

    const result = await BondService.getBondsByUser(userId)
    console.log('=== API RESPONSE ===')
    console.log('Raw result:', result)
    console.log('Success:', result.success)
    console.log('Data:', result.data)
    console.log('Error:', result.error)
    
    if (result.success) {
      bonds.value = result.data || []
      console.log('=== BONDS LOADED ===')
      console.log('Number of bonds:', bonds.value.length)
      console.log('Bonds data:', bonds.value)
    } else {
      errorMessage.value = result.error || 'Error al cargar los bonos.'
      console.error('API Error:', result.error)
    }
  } catch (error) {
    errorMessage.value = 'Error inesperado al cargar los bonos.'
    console.error('=== LOAD BONDS ERROR ===')
    console.error('Error details:', error)
  } finally {
    isLoading.value = false
  }
}

// Computed properties
const hasBonds = computed(() => bonds.value && bonds.value.length > 0)

// Formatear moneda
const formatCurrency = (value, currency = 'PEN') => {
  if (!value) return '-'
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(value)
}

// Formatear porcentaje
const formatPercentage = (value) => {
  if (!value) return '-'
  return `${(value * 100).toFixed(2)}%`
}

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-PE')
}

// Obtener severidad del tag según la moneda
const getCurrencySeverity = (currency) => {
  switch (currency) {
    case 'PEN': return 'success'
    case 'USD': return 'info'
    default: return 'secondary'
  }
}

// Funciones de navegación
const refreshBonds = () => {
  loadUserBonds()
}

// Función para probar con el usuario que tiene bonos
const testWithDifferentUser = async () => {
  const testUserId = 'd2b5110e-1230-480a-a40e-232b551cc90b'
  console.log('=== TESTING WITH USER WHO HAS BONDS ===')
  console.log('Test user ID:', testUserId)
  
  try {
    const result = await BondService.getBondsByUser(testUserId)
    console.log('Test result:', result)
    
    if (result.success && result.data.length > 0) {
      alert(`¡El usuario ${testUserId} SÍ tiene ${result.data.length} bono(s)!\n\nTu usuario actual (${getUserId()}) no tiene bonos.`)
    }
  } catch (error) {
    console.error('Test error:', error)
  }
}

const deleteBondById = async (bondId) => {
  const confirmed = confirm('¿Estás seguro de que deseas eliminar este bono?')
  if (!confirmed) return

  try {
    const result = await BondService.deleteBond(bondId)

    if (result.success) {
      // Eliminar bono localmente para evitar recarga completa
      bonds.value = bonds.value.filter(b => b.id !== bondId)
      console.log(`✅ Bono ${bondId} eliminado correctamente.`)
    } else {
      console.error(`❌ Error al eliminar el bono ${bondId}:`, result.error)
      errorMessage.value = `Error al eliminar el bono: ${result.error}`
    }
  } catch (error) {
    console.error('❌ Error inesperado al eliminar bono:', error)
    errorMessage.value = 'Error inesperado al eliminar el bono.'
  }
}

</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Menu Bar -->
        <MenuBar 
            title="Mis Bonos"
            subtitle="Lista de bonos registrados para tu cuenta"
            :show-create-button="true"
        />
        
        <div class="max-w-7xl mx-auto px-4 py-8">

            <!-- Debug Info Card -->
            <Card class="mb-6 bg-yellow-50 border-yellow-200">
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-info-circle text-yellow-600"></i>
                        <span class="text-yellow-800">Información de Debug</span>
                    </div>
                </template>
                <template #content>
                    <div class="text-sm space-y-2">
                        <div><strong>Usuario:</strong> {{ user?.email || 'No disponible' }}</div>
                        <div><strong>ID Usuario:</strong> <code class="bg-gray-100 px-2 py-1 rounded">{{ getUserId() || 'No disponible' }}</code></div>
                        <div><strong>Token:</strong> {{ tokenStatus }}</div>
                        <div><strong>Endpoint consulta:</strong> <code class="bg-gray-100 px-2 py-1 rounded text-xs">GET /bonds?user_id=eq.{{ getUserId() }}</code></div>
                        <div><strong>Bonos encontrados:</strong> {{ bonds.length }}</div>
                        
                        <!-- Botón de test -->
                        <div class="pt-2">
                            <Button 
                                label="Probar con usuario que tiene bonos" 
                                severity="warning"
                                size="small"
                                @click="testWithDifferentUser"
                                icon="pi pi-search"
                            />
                            <p class="text-xs text-gray-600 mt-1">Esto probará si la API funciona con el usuario d2b5110e-1230-480a-a40e-232b551cc90b</p>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Información del usuario -->
            <Card class="mb-6">
                <template #content>
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="text-sm text-gray-600">Usuario actual:</p>
                            <p class="font-medium">{{ user?.email }}</p>
                            <p class="text-xs text-gray-500 font-mono">ID: {{ getUserId() }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-600">Total de bonos:</p>
                            <p class="text-2xl font-bold text-blue-600">{{ bonds.length }}</p>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Error Message -->
            <div v-if="errorMessage" class="mb-6">
                <Message severity="error" :closable="true" @close="errorMessage = ''">
                    {{ errorMessage }}
                </Message>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="flex justify-center items-center py-12">
                <ProgressSpinner />
                <span class="ml-3 text-gray-600">Cargando bonos...</span>
            </div>

            <!-- No Data State -->
            <div v-else-if="!hasBonds && !errorMessage" class="text-center py-12">
                <div class="bg-white rounded-lg shadow-lg p-8">
                    <i class="pi pi-inbox text-6xl text-gray-400 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">No tienes bonos registrados</h3>
                    <p class="text-gray-600 mb-6">
                        Tu usuario ({{ getUserId() }}) no tiene bonos registrados.<br>
                        ¡Comienza creando tu primer bono!
                    </p>
                    <Button 
                        label="Crear mi primer bono" 
                        @click="goToCreateBond"
                        icon="pi pi-plus"
                        size="large"
                    />
                </div>
            </div>

            <!-- Data Table -->
            <div v-else-if="hasBonds" class="bg-white rounded-lg shadow-lg overflow-hidden">
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 class="text-lg font-semibold text-gray-900">Lista de Bonos</h2>
                    <Button 
                        label="Actualizar" 
                        @click="refreshBonds"
                        icon="pi pi-refresh"
                        severity="secondary"
                        size="small"
                        :loading="isLoading"
                    />
                </div>

                <DataTable 
                    :value="bonds" 
                    :paginator="true" 
                    :rows="10"
                    :rowsPerPageOptions="[5, 10, 20]"
                    responsiveLayout="scroll"
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="{first} a {last} de {totalRecords} bonos"
                    class="p-datatable-sm"
                >
                    <Column field="nombre" header="Nombre" sortable>
                        <template #body="{ data }">
                            <div class="font-medium text-gray-900">{{ data.nombre }}</div>
                        </template>
                    </Column>

                    <Column field="moneda" header="Moneda" sortable>
                        <template #body="{ data }">
                            <Tag 
                                :value="data.moneda" 
                                :severity="getCurrencySeverity(data.moneda)"
                            />
                        </template>
                    </Column>

                    <Column field="tasa" header="Tasa" sortable>
                        <template #body="{ data }">
                            <span class="font-medium">{{ formatPercentage(data.tasa) }}</span>
                            <div class="text-xs text-gray-500">{{ data.tipo_tasa }}</div>
                        </template>
                    </Column>

                    <Column field="valor_nominal" header="Valor Nominal" sortable>
                        <template #body="{ data }">
                            <span class="font-medium">{{ formatCurrency(data.valor_nominal, data.moneda) }}</span>
                        </template>
                    </Column>

                    <Column field="valor_comercial" header="Valor Comercial" sortable>
                        <template #body="{ data }">
                            <span class="font-medium">{{ formatCurrency(data.valor_comercial, data.moneda) }}</span>
                        </template>
                    </Column>

                    <Column field="plazo_meses" header="Plazo" sortable>
                        <template #body="{ data }">
                            <span>{{ data.plazo_meses }} meses</span>
                        </template>
                    </Column>

                    <Column field="fecha_emision" header="Fecha Emisión" sortable>
                        <template #body="{ data }">
                            <span class="text-sm">{{ formatDate(data.fecha_emision) }}</span>
                        </template>
                    </Column>

                    <Column field="frecuencia_pago" header="Freq. Pago" sortable>
                        <template #body="{ data }">
                            <span class="text-sm">{{ data.frecuencia_pago }}x/año</span>
                        </template>
                    </Column>

                    <Column field="plazo_gracia" header="Plazo Gracia">
                        <template #body="{ data }">
                            <Tag 
                                :value="data.plazo_gracia" 
                                severity="secondary"
                                class="text-xs"
                            />
                        </template>
                    </Column>

                    <Column header="Acciones" :exportable="false">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                              <Button
                                  icon="pi pi-eye"
                                  severity="info"
                                  size="small"
                                  @click="() => goToBondFlow(data.id, data.nombre)"
                                  title="Ver detalle"
                              />
                              <Button
                                    icon="pi pi-pencil" 
                                    severity="warning"
                                    size="small"
                                    @click="() => console.log('Editar:', data)"
                                    title="Editar"
                                />
                                <Button
                                  icon="pi pi-trash"
                                  severity="danger"
                                  size="small"
                                  @click="() => deleteBondById(data.id)"
                                  title="Eliminar"
                                />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Estilos adicionales si necesitas */
</style>