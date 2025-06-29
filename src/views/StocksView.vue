<template>
  <div class="stocks-view">
    <div class="page-header">
      <h1>
        <el-icon><Box /></el-icon>
        Склады
      </h1>
      <el-button @click="$router.push('/')" :icon="HomeFilled"> На главную </el-button>
    </div>

    <div class="page-content">
      <!-- Фильтры (только дата ОТ для складов) -->
      <DataFilters
        :show-date-from="true"
        :show-date-to="false"
        :default-date-from="getCurrentDate()"
        @update:filters="onFiltersUpdate"
      />

      <!-- Уведомление о специфике склада -->
      <el-alert
        title="Складские данные"
        description="Данные складов доступны только за текущий день"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      />

      <!-- График -->
      <DataChart
        v-if="chartData.length > 0"
        :data="chartData"
        :numeric-fields="numericFields"
        title="График складских остатков"
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
import { Box, HomeFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { api, type ApiParams, dateUtils } from '../services/api'
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
  { key: 'product_name', label: 'Товар', sortable: false },
  { key: 'quantity', label: 'Количество', type: 'number', sortable: true, width: '120px' },
  { key: 'warehouse', label: 'Склад', sortable: false, width: '150px' },
  { key: 'reserved', label: 'Резерв', type: 'number', sortable: true, width: '100px' },
  { key: 'available', label: 'Доступно', type: 'number', sortable: true, width: '120px' },
])

// Числовые поля для графика
const numericFields = ref([
  { key: 'quantity', label: 'Общее количество' },
  { key: 'available', label: 'Доступно' },
  { key: 'reserved', label: 'В резерве' },
  { key: 'incoming', label: 'Ожидается поступление' },
])

// Получение текущей даты
const getCurrentDate = () => {
  return dateUtils.getCurrentDate()
}

// Загрузка данных
const loadData = async () => {
  loading.value = true
  try {
    const params: Pick<ApiParams, 'dateFrom' | 'page' | 'limit'> = {
      dateFrom: filters.value.dateFrom,
      page: pagination.current,
      limit: pagination.pageSize,
    }

    const response = await api.getStocks(params)

    tableData.value = response.data
    chartData.value = response.data

    pagination.current = response.current_page
    pagination.total = response.total

    // Динамически обновляем колонки на основе полученных данных
    if (response.data.length > 0) {
      updateColumns(response.data[0])
    }
  } catch (error) {
    console.error('Ошибка загрузки данных складов:', error)
    ElMessage.error('Ошибка загрузки данных складов')
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
.stocks-view {
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
