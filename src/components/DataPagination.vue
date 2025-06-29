<template>
  <div class="data-pagination" :class="{ 'mobile-pagination': isMobile }">
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      :page-sizes="[50, 100, 250, 500]"
      :layout="paginationLayout"
      :size="isMobile ? 'small' : 'default'"
      :pager-count="isMobile ? 5 : 7"
      @size-change="onSizeChange"
      @current-change="onCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

interface Props {
  current: number
  pageSize: number
  total: number
}

interface Emits {
  (e: 'update:current', current: number): void
  (e: 'update:pageSize', pageSize: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Состояние экрана
const screenWidth = ref(window.innerWidth)
const isMobile = computed(() => screenWidth.value < 768)
const isTablet = computed(() => screenWidth.value >= 768 && screenWidth.value < 1024)

// Адаптивный layout для пагинации
const paginationLayout = computed(() => {
  if (isMobile.value) {
    return 'prev, pager, next' // Упрощенный layout для мобильных
  } else if (isTablet.value) {
    return 'total, prev, pager, next, sizes' // Средний layout для планшетов
  } else {
    return 'total, sizes, prev, pager, next, jumper' // Полный layout для десктопа
  }
})

// Обработчик изменения размера окна
const handleResize = () => {
  screenWidth.value = window.innerWidth
}

const currentPage = computed({
  get: () => props.current,
  set: (value) => emit('update:current', value),
})

const onSizeChange = (size: number) => {
  emit('update:pageSize', size)
  emit('update:current', 1) // Сбрасываем на первую страницу при изменении размера
}

const onCurrentChange = (page: number) => {
  emit('update:current', page)
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
.data-pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-pagination {
  padding: 15px 10px;
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .data-pagination {
    margin-top: 15px;
    padding: 12px 5px;
  }
  
  .data-pagination :deep(.el-pagination) {
    justify-content: center;
  }
  
  .data-pagination :deep(.el-pager li) {
    min-width: 28px;
    height: 28px;
    line-height: 28px;
    font-size: 12px;
  }
  
  .data-pagination :deep(.btn-prev),
  .data-pagination :deep(.btn-next) {
    min-width: 28px;
    height: 28px;
    line-height: 28px;
  }
}

/* Планшетная адаптация */
@media (min-width: 768px) and (max-width: 1023px) {
  .data-pagination {
    padding: 18px 15px;
  }
  
  .data-pagination :deep(.el-pagination__total),
  .data-pagination :deep(.el-pagination__sizes) {
    font-size: 13px;
  }
}

/* Стили для улучшения внешнего вида */
.data-pagination :deep(.el-pagination) {
  font-weight: 500;
}

.data-pagination :deep(.el-pagination__total) {
  color: #606266;
  font-weight: 600;
}
</style>
