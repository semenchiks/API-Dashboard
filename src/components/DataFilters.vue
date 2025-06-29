<template>
  <div class="data-filters" :class="{ 'mobile-filters': isMobile }">
    <el-form :model="filters" :inline="!isMobile" label-position="top">
      <div class="filters-row">
        <el-form-item label="Дата от:" v-if="showDateFrom" class="filter-item">
          <el-date-picker
            v-model="filters.dateFrom"
            type="date"
            placeholder="Выберите дату"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :size="isMobile ? 'small' : 'default'"
            @change="onDateFromChange"
          />
        </el-form-item>

        <el-form-item label="Дата до:" v-if="showDateTo" class="filter-item">
          <el-date-picker
            v-model="filters.dateTo"
            type="date"
            placeholder="Выберите дату"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :size="isMobile ? 'small' : 'default'"
            @change="onDateToChange"
          />
        </el-form-item>

        <el-form-item label="Записей на странице:" class="filter-item">
          <el-select 
            v-model="filters.limit" 
            @change="onLimitChange"
            :size="isMobile ? 'small' : 'default'"
            style="width: 100%;"
          >
            <el-option label="50" :value="50" />
            <el-option label="100" :value="100" />
            <el-option label="250" :value="250" />
            <el-option label="500" :value="500" />
          </el-select>
        </el-form-item>
      </div>

      <div class="filters-actions">
        <el-button 
          type="primary" 
          @click="onApplyFilters" 
          :icon="Search"
          :size="isMobile ? 'small' : 'default'"
        > 
          {{ isMobile ? 'Применить' : 'Применить' }}
        </el-button>
        <el-button 
          @click="onResetFilters" 
          :icon="Refresh"
          :size="isMobile ? 'small' : 'default'"
        > 
          {{ isMobile ? 'Сбросить' : 'Сбросить' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted, computed } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { dateUtils } from '../services/api'

interface Filters {
  dateFrom: string
  dateTo: string
  limit: number
  page: number
}

interface Props {
  showDateFrom?: boolean
  showDateTo?: boolean
  defaultDateFrom?: string
  defaultDateTo?: string
}

interface Emits {
  (e: 'update:filters', filters: Filters): void
}

const props = withDefaults(defineProps<Props>(), {
  showDateFrom: true,
  showDateTo: true,
  defaultDateFrom: () => dateUtils.getWeekAgoDate(),
  defaultDateTo: () => dateUtils.getCurrentDate(),
})

const emit = defineEmits<Emits>()

// Состояние экрана
const screenWidth = ref(window.innerWidth)
const isMobile = computed(() => screenWidth.value < 768)

// Обработчик изменения размера окна
const handleResize = () => {
  screenWidth.value = window.innerWidth
}

// Инициализация фильтров
const filters = reactive<Filters>({
  dateFrom: props.defaultDateFrom,
  dateTo: props.defaultDateTo,
  limit: 500,
  page: 1,
})

// Обработчики изменений
const onDateFromChange = () => {
  filters.page = 1
  onApplyFilters()
}

const onDateToChange = () => {
  filters.page = 1
  onApplyFilters()
}

const onLimitChange = () => {
  filters.page = 1
  onApplyFilters()
}

const onApplyFilters = () => {
  emit('update:filters', { ...filters })
}

const onResetFilters = () => {
  filters.dateFrom = props.defaultDateFrom
  filters.dateTo = props.defaultDateTo
  filters.limit = 500
  filters.page = 1
  onApplyFilters()
}

// Жизненный цикл
onMounted(() => {
  window.addEventListener('resize', handleResize)
  // Автоматическое применение фильтров при инициализации
  onApplyFilters()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.data-filters {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-filters {
  padding: 15px;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.filter-item {
  flex: 1;
  min-width: 200px;
  margin-bottom: 0 !important;
}

.filters-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
  }
  
  .filter-item {
    min-width: unset;
    width: 100%;
  }
  
  .filter-item :deep(.el-form-item__label) {
    font-size: 14px;
    margin-bottom: 5px;
  }
  
  .filters-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .filters-actions .el-button {
    flex: 1;
    min-width: 100px;
  }
}

/* Планшетная адаптация */
@media (min-width: 768px) and (max-width: 1023px) {
  .filter-item {
    min-width: 180px;
  }
}

/* Стили для элементов формы */
.data-filters :deep(.el-form-item__label) {
  font-weight: 600;
  color: #606266;
}

.data-filters :deep(.el-date-editor) {
  width: 100%;
}
</style>
