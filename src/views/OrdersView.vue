<template>
  <div class="orders-view">
    <div class="page-header">
      <h1>
        <el-icon><Document /></el-icon>
        Заказы
      </h1>
      <el-button @click="$router.push('/')" :icon="HomeFilled"> На главную </el-button>
    </div>

    <div class="page-content">
      <!-- Фильтры -->
      <DataFilters
        :show-date-from="true"
        :show-date-to="true"
        @update:filters="onFiltersUpdate"
      />

      <!-- График -->
      <DataChart
        v-if="chartData.length > 0"
        :data="chartData"
        :numeric-fields="numericFields"
        title="График заказов"
        chart-type="bar"
      />

      <!-- Таблица -->
      <DataTable :data="tableData" :columns="columns" :loading="loading" />

      <!-- Пагинация -->
      <DataPagination
        v-if="pagination.total > 0"
        :current="pagination.current"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @update:current="onPageChange"
        @update:pageSize="onPageSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Document, HomeFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { api, type ApiParams } from '../services/api'
import DataFilters from '../components/DataFilters.vue'
import DataChart from '../components/DataChart.vue'
import DataTable from '../components/DataTable.vue'
import DataPagination from '../components/DataPagination.vue'

// Состояние загрузки
const loading = ref(false)

// Данные
const tableData = ref<any[]>([])
const chartData = ref<any[]>([])

// Пагинация
const pagination = reactive({
  current: 1,
  pageSize: 500,
  total: 0,
})

// Фильтры
const filters = ref<ApiParams>({})

// Конфигурация таблицы (будет обновляться динамически)
const columns = ref([
  { key: 'id', label: 'ID', sortable: true, width: '80px' },
  { key: 'date', label: 'Дата', type: 'date', sortable: true, width: '120px' },
  { key: 'total', label: 'Сумма', type: 'number', sortable: true, width: '120px' },
  { key: 'items_count', label: 'Позиций', type: 'number', sortable: true, width: '100px' },
  { key: 'customer', label: 'Клиент', sortable: false },
  { key: 'status', label: 'Статус', sortable: false, width: '100px' },
])

// Числовые поля для графика
const numericFields = ref([
  { key: 'total', label: 'Общая сумма' },
  { key: 'items_count', label: 'Количество позиций' },
  { key: 'discount_amount', label: 'Размер скидки' },
  { key: 'delivery_cost', label: 'Стоимость доставки' },
])

// Загрузка данных
const loadData = async () => {
  loading.value = true
  try {
    const params: ApiParams = {
      ...filters.value,
      page: pagination.current,
      limit: pagination.pageSize,
    }

    const response = await api.getOrders(params)

    tableData.value = response.data
    chartData.value = response.data

    pagination.current = response.current_page
    pagination.total = response.total

    // Динамически обновляем колонки на основе полученных данных
    if (response.data.length > 0) {
      updateColumns(response.data[0])
    }
  } catch (error) {
    console.error('Ошибка загрузки данных заказов:', error)
    ElMessage.error('Ошибка загрузки данных заказов')
    tableData.value = []
    chartData.value = []
  } finally {
    loading.value = false
  }
}

// Обновление колонок на основе данных
const updateColumns = (sampleData: any) => {
  const dynamicColumns = Object.keys(sampleData).map((key) => {
    const value = sampleData[key]
    const isNumber = typeof value === 'number'
    const isDate = key.includes('date') || key.includes('time')
    
    return {
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      type: isDate ? 'date' : isNumber ? 'number' : 'text',
      sortable: true,
      width: isNumber ? '120px' : isDate ? '140px' : undefined,
    }
  })
  
  columns.value = dynamicColumns
  
  // Обновляем числовые поля для графика
  const newNumericFields = Object.keys(sampleData)
    .filter(key => typeof sampleData[key] === 'number')
    .map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
    }))
  
  if (newNumericFields.length > 0) {
    numericFields.value.splice(0, numericFields.value.length, ...newNumericFields)
  }
}

// Обработчики событий
const onFiltersUpdate = (newFilters: ApiParams) => {
  filters.value = newFilters
  pagination.current = 1
  loadData()
}

const onPageChange = (page: number) => {
  pagination.current = page
  loadData()
}

const onPageSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  loadData()
}

// Инициализация
onMounted(() => {
  // Данные загрузятся автоматически при срабатывании фильтров
})
</script>

<style scoped>
.orders-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.page-header h1 {
  margin: 0;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-content {
  flex: 1;
  padding: 20px 40px;
  overflow-y: auto;
  max-width: 100%;
}

/* Адаптивность */
@media (max-width: 768px) {
  .page-header {
    padding: 15px 20px;
    flex-direction: column;
    gap: 15px;
  }
  
  .page-content {
    padding: 15px 20px;
  }
}
</style>
