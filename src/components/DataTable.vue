<template>
  <div class="data-table">
    <div class="table-wrapper">
      <el-table 
        :data="data" 
        stripe 
        v-loading="loading" 
        element-loading-text="Загрузка..."
        size="small"
        :class="{ 'mobile-table': isMobile }"
      >
        <el-table-column
          v-for="column in visibleColumns"
          :key="column.key"
          :prop="column.key"
          :label="column.label"
          :sortable="column.sortable || false"
          :width="column.width"
          :min-width="column.minWidth || '80px'"
          show-overflow-tooltip
        >
          <template #default="scope">
            <span v-if="column.type === 'date'">
              {{ formatDate(scope.row[column.key]) }}
            </span>
            <span v-else-if="column.type === 'number'">
              {{ formatNumber(scope.row[column.key]) }}
            </span>
            <span v-else>
              {{ truncateText(scope.row[column.key], isMobile ? 15 : 30) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- Показать скрытые колонки на мобильных -->
    <div v-if="isMobile && hiddenColumns.length > 0" class="hidden-columns-info">
      <el-text size="small" type="info">
        Скрыто {{ hiddenColumns.length }} колонок для лучшего отображения
      </el-text>
      <el-button 
        size="small" 
        text 
        @click="showAllColumns = !showAllColumns"
      >
        {{ showAllColumns ? 'Скрыть' : 'Показать все' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
  minWidth?: string
  type?: 'text' | 'date' | 'number'
  priority?: number // 1 = высокий приоритет, 3 = низкий
}

interface Props {
  data: any[]
  columns: Column[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

// Состояние экрана
const screenWidth = ref(window.innerWidth)
const showAllColumns = ref(false)

// Определение мобильного устройства
const isMobile = computed(() => screenWidth.value < 768)
const isTablet = computed(() => screenWidth.value >= 768 && screenWidth.value < 1024)

// Приоритизация колонок
const prioritizedColumns = computed(() => {
  return props.columns.map(col => ({
    ...col,
    priority: getPriority(col)
  }))
})

// Видимые колонки с учетом размера экрана
const visibleColumns = computed(() => {
  if (showAllColumns.value) {
    return prioritizedColumns.value
  }

  let maxColumns: number
  if (isMobile.value) {
    maxColumns = 3 // На мобильных показываем только 3 самые важные колонки
  } else if (isTablet.value) {
    maxColumns = 5 // На планшетах - 5 колонок
  } else {
    return prioritizedColumns.value // На десктопе показываем все
  }

  return prioritizedColumns.value
    .sort((a, b) => (a.priority || 3) - (b.priority || 3))
    .slice(0, maxColumns)
})

// Скрытые колонки
const hiddenColumns = computed(() => {
  if (showAllColumns.value || !isMobile.value) return []
  return prioritizedColumns.value.filter(col => 
    !visibleColumns.value.some(visible => visible.key === col.key)
  )
})

// Определение приоритета колонки
const getPriority = (column: Column): number => {
  if (column.priority) return column.priority

  const key = column.key.toLowerCase()
  
  // Высокий приоритет (1)
  if (key.includes('id') || key.includes('date') || key.includes('amount') || 
      key.includes('price') || key.includes('total') || key.includes('barcode')) {
    return 1
  }
  
  // Средний приоритет (2)
  if (key.includes('quantity') || key.includes('name') || key.includes('status') ||
      key.includes('warehouse') || key.includes('supplier')) {
    return 2
  }
  
  // Низкий приоритет (3)
  return 3
}

// Обработчик изменения размера окна
const handleResize = () => {
  screenWidth.value = window.innerWidth
}

// Утилиты форматирования
const formatDate = (value: any): string => {
  if (!value) return ''
  const date = new Date(value)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: isMobile.value ? '2-digit' : 'numeric'
  })
}

const formatNumber = (value: any): string => {
  if (value === null || value === undefined) return ''
  const num = Number(value)
  if (isMobile.value && num > 999999) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (isMobile.value && num > 999) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString('ru-RU')
}

const truncateText = (value: any, maxLength: number): string => {
  if (!value) return ''
  const str = String(value)
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str
}

// Жизненный цикл
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.data-table {
  margin-top: 20px;
  width: 100%;
}

.table-wrapper {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background: white;
}

.table-wrapper :deep(.el-table) {
  width: 100%;
}

.table-wrapper :deep(.el-table__header-wrapper) {
  background-color: #fafafa;
}

.table-wrapper :deep(.el-table th) {
  background-color: #fafafa;
  font-weight: 600;
  padding: 8px 4px;
}

.table-wrapper :deep(.el-table td) {
  padding: 8px 4px;
}

.hidden-columns-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 0 0 8px 8px;
  border-top: 1px solid #e4e7ed;
}

/* Мобильная адаптация */
.mobile-table :deep(.el-table) {
  font-size: 12px;
}

.mobile-table :deep(.el-table th),
.mobile-table :deep(.el-table td) {
  padding: 6px 2px;
}

.mobile-table :deep(.el-table__cell) {
  word-break: break-word;
}

/* Планшетная адаптация */
@media (min-width: 768px) and (max-width: 1023px) {
  .table-wrapper :deep(.el-table) {
    font-size: 13px;
  }
  
  .table-wrapper :deep(.el-table th),
  .table-wrapper :deep(.el-table td) {
    padding: 8px 6px;
  }
}

/* Десктопная версия */
@media (min-width: 1024px) {
  .table-wrapper :deep(.el-table th),
  .table-wrapper :deep(.el-table td) {
    padding: 12px 8px;
  }
}
</style>

