<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Card from 'primevue/card'
import MenuBar from '@/components/MenuBar.vue'
import { useRoute } from 'vue-router'
const route = useRoute()

import FlowBondService from '@/service/FlowBondService'

const bondId = ref(null)
const bondFlows = ref([])
const bondMetrics = ref(null)
const isLoading = ref(false)
const error = ref(null)
const totalAmortizacion = ref(0)
const totalIntereses = ref(0)
const totalCuota = ref(0)
const totalFlujoEmisor = ref(0)
const totalFlujoInversor = ref(0)
const bondName = ref(route.query.bond_name)

async function loadFlows() {
  if (!bondId.value) return
  isLoading.value = true
  error.value = null

  const [flowsRes, metricsRes] = await Promise.all([
    FlowBondService.getFlowsByBondId(bondId.value),
    FlowBondService.getMetricsByBondId(bondId.value)
  ])

  if (flowsRes.success) {
    bondFlows.value = flowsRes.data
    calcularTotales()
  } else {
    error.value = flowsRes.error || 'Error al cargar flujos'
  }

  if (metricsRes.success) {
    bondMetrics.value = metricsRes.data[0] || null
  } else {
    error.value = metricsRes.error || 'Error al cargar métricas'
  }

  isLoading.value = false
}

function calcularTotales() {
  totalAmortizacion.value = bondFlows.value.reduce((sum, f) => sum + (parseFloat(f.amortizacion) || 0), 0)
  totalIntereses.value = bondFlows.value.reduce((sum, f) => sum + (parseFloat(f.intereses) || 0), 0)
  totalCuota.value = bondFlows.value.reduce((sum, f) => sum + (parseFloat(f.cuota) || 0), 0)
  totalFlujoEmisor.value = bondFlows.value.reduce((sum, f) => sum + (parseFloat(f.flujo_emisor) || 0), 0)
  totalFlujoInversor.value = bondFlows.value.reduce((sum, f) => sum + (parseFloat(f.flujo_inversor) || 0), 0)
}

function formatNumber(value) {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(num) ? value : num.toFixed(4)
}

function formatDate(dateString) {
  const d = new Date(dateString)
  return isNaN(d) ? dateString : d.toLocaleDateString('es-PE')
}


bondId.value = route.query.bond_id

onMounted(() => {
  loadFlows()
})

function refreshFlows() {
  loadFlows()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <MenuBar
        title="Flujo de Bono"
        subtitle="Detalle de los flujos financieros asociados al bono seleccionado"
    />

    <div class="max-w-7xl mx-auto px-4 py-8">
      <Card class="mb-6 bg-blue-50 border-blue-200">
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-info-circle text-blue-600"></i>
            <span class="text-blue-800">Información del Bono</span>
          </div>
        </template>
        <template #content>
          <div class="text-sm space-y-2">
            <div><strong>ID del Bono:</strong> <code class="bg-gray-100 px-2 py-1 rounded">{{ bondId }}</code></div>
            <div><strong>Nombre del Bono:</strong> <code class="bg-gray-100 px-2 py-1 rounded">{{ bondName }}</code></div>
            <div><strong>N° de Periodos:</strong> {{ bondFlows.length }}</div>
            <div><strong>Última Actualización:</strong> {{ new Date().toLocaleString('es-PE') }}</div>
          </div>
        </template>
      </Card>

      <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-10">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <i class="pi pi-calendar text-green-700"></i>
            <span class="text-green-700">Cronograma de Bono</span>
          </div>
          <Button
              label="Actualizar"
              icon="pi pi-refresh"
              severity="secondary"
              size="small"
              :loading="isLoading"
              @click="refreshFlows"
          />
        </div>

        <DataTable
            :value="bondFlows"
            :paginator="true"
            :rows="32"
            :rowsPerPageOptions="[5,15,25,35]"
            responsiveLayout="scroll"
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{first} a {last} de {totalRecords} flujos"
            class="p-datatable-sm"
            :loading="isLoading"
            emptyMessage="No hay datos disponibles"
        >
          <Column field="periodo" header="N° Periodo" sortable />
          <Column field="fecha_pago" header="Fecha Pago" sortable>
            <template #body="{ data }">
              {{ formatDate(data.fecha_pago) }}
            </template>
          </Column>
          <Column field="amortizacion" header="Amortización" sortable :footer="formatNumber(totalAmortizacion)" >
            <template #body="{ data }">
              {{ formatNumber(data.amortizacion) }}
            </template>
          </Column>
          <Column field="intereses" header="Intereses" sortable :footer="formatNumber(totalIntereses)">
            <template #body="{ data }">
              {{ formatNumber(data.intereses) }}
            </template>
          </Column>
          <Column field="cuota" header="Cuota" sortable :footer="formatNumber(totalCuota)">
            <template #body="{ data }">
              {{ formatNumber(data.cuota) }}
            </template>
          </Column>
          <Column field="flujo_emisor" header="Flujo Emisor" sortable :footer="formatNumber(totalFlujoEmisor)">
            <template #body="{ data }">
              {{ formatNumber(data.flujo_emisor) }}
            </template>
          </Column>
          <Column field="flujo_inversor" header="Flujo Inversor" sortable :footer="formatNumber(totalFlujoInversor)">
            <template #body="{ data }">
              {{ formatNumber(data.flujo_inversor) }}
            </template>
          </Column>
        </DataTable>

        <div v-if="error" class="p-4 text-red-600">{{ error }}</div>
      </div>

      <div v-if="bondMetrics" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <i class="pi pi-percentage text-cyan-700"></i>
            <span class="text-cyan-700">Cronograma de Bono</span>
          </div>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><strong>TCEA:</strong> {{ formatNumber(bondMetrics.tcea * 100) }}%</div>
          <div><strong>TREA:</strong> {{ formatNumber(bondMetrics.trea * 100) }}%</div>
          <div><strong>Convexidad:</strong> {{ formatNumber(bondMetrics.convexidad) }}</div>
          <div><strong>Duración:</strong> {{ formatNumber(bondMetrics.duracion) }}</div>
          <div><strong>Duración Modificada:</strong> {{ formatNumber(bondMetrics.duracion_modificada) }}</div>
          <div><strong>Precio Máximo:</strong> {{ formatNumber(bondMetrics.precio_maximo) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
