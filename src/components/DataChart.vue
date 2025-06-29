<template>
  <div class="chart-container">
    <el-card class="chart-card" :class="{ 'mobile-chart': isMobile }">
      <template #header>
        <div class="chart-header">
          <span class="chart-title">{{ title }}</span>
          <el-select 
            v-model="selectedField" 
            @change="updateChart" 
            placeholder="Поле"
            :disabled="!hasData"
            :size="isMobile ? 'small' : 'default'"
            style="min-width: 120px;"
          >
            <el-option
              v-for="field in numericFields"
              :key="field.key"
              :label="field.label"
              :value="field.key"
            />
          </el-select>
        </div>
      </template>
      <div class="chart-wrapper">
        <div v-if="!hasData" class="no-data">
          <el-empty 
            :description="isMobile ? 'Нет данных' : 'Настройте фильтры для отображения данных'" 
            :image-size="isMobile ? 60 : 100"
          />
        </div>
        <canvas v-else ref="chartCanvas"></canvas>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

interface NumericField {
  key: string
  label: string
}

interface Props {
  data: any[]
  numericFields: NumericField[]
  title?: string
  chartType?: 'line' | 'bar'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'График данных',
  chartType: 'line',
})

const chartCanvas = ref<HTMLCanvasElement>()
const selectedField = ref<string>('')
const screenWidth = ref(window.innerWidth)
let chartInstance: any = null

const hasData = computed(() => props.data && props.data.length > 0)
const isMobile = computed(() => screenWidth.value < 768)

// Обработчик изменения размера окна
const handleResize = () => {
  screenWidth.value = window.innerWidth
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  
  if (props.numericFields.length > 0) {
    selectedField.value = props.numericFields[0].key
  }
  
  // Динамически импортируем Chart.js только когда есть данные
  if (hasData.value) {
    await loadChart()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.destroy()
  }
})

watch(
  () => props.data,
  async () => {
    if (hasData.value && !chartInstance) {
      await loadChart()
    } else if (chartInstance) {
      updateChart()
    }
  },
  { deep: true },
)

const loadChart = async () => {
  try {
    const { Chart, registerables } = await import('chart.js')
    Chart.register(...registerables)
    
    await createChart()
  } catch (error) {
    console.error('Ошибка загрузки Chart.js:', error)
  }
}

const createChart = async () => {
  if (!chartCanvas.value || !hasData.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const chartData = getChartData()
  
  const { Chart } = await import('chart.js')
  
  chartInstance = new Chart(ctx, {
    type: props.chartType,
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              size: isMobile.value ? 10 : 12
            }
          }
        },
        x: {
          ticks: {
            font: {
              size: isMobile.value ? 10 : 12
            },
            maxTicksLimit: isMobile.value ? 5 : 10
          }
        }
      },
      plugins: {
        title: {
          display: false, // Убираем дублирование заголовка
        },
        legend: {
          display: !isMobile.value, // Скрываем легенду на мобильных
          labels: {
            font: {
              size: isMobile.value ? 10 : 12
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          titleFont: {
            size: isMobile.value ? 11 : 13
          },
          bodyFont: {
            size: isMobile.value ? 10 : 12
          }
        },
      },
      elements: {
        point: {
          radius: isMobile.value ? 2 : 3
        },
        line: {
          borderWidth: isMobile.value ? 1 : 2
        }
      }
    },
  })
}

const getChartData = () => {
  if (!selectedField.value || !hasData.value) {
    return {
      labels: [],
      datasets: [],
    }
  }

  // Количество записей зависит от размера экрана
  const maxRecords = isMobile.value ? 10 : 20
  const dataSlice = props.data.slice(-maxRecords)

  const labels = dataSlice.map((item, index) => {
    if (isMobile.value) {
      return `${index + 1}` // Короткие метки на мобильных
    }
    return `Запись ${index + 1}`
  })
  
  const values = dataSlice.map((item) => {
    const value = item[selectedField.value]
    return typeof value === 'number' ? value : parseFloat(value) || 0
  })

  const selectedFieldLabel =
    props.numericFields.find((f) => f.key === selectedField.value)?.label || selectedField.value

  return {
    labels,
    datasets: [
      {
        label: selectedFieldLabel,
        data: values,
        borderColor: '#409EFF',
        backgroundColor: props.chartType === 'bar' ? '#409EFF' : 'rgba(64, 158, 255, 0.1)',
        borderWidth: isMobile.value ? 1 : 2,
        fill: props.chartType === 'line',
      },
    ],
  }
}

const updateChart = () => {
  if (chartInstance && hasData.value) {
    chartInstance.data = getChartData()
    chartInstance.update()
  }
}
</script>

<style scoped>
.chart-container {
  margin-bottom: 20px;
}

.chart-card {
  height: 415px;
}

.mobile-chart {
  height: 280px; /* Уменьшенная высота для мобильных */
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.chart-title {
  font-weight: 600;
  color: #303133;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chart-wrapper {
  height: 320px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-chart .chart-wrapper {
  height: 200px; /* Соответствующая высота для мобильных */
}

.no-data {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .chart-title {
    text-align: center;
    font-size: 14px;
  }
}

/* Планшетная адаптация */
@media (min-width: 768px) and (max-width: 1023px) {
  .chart-card {
    height: 350px;
  }
  
  .chart-wrapper {
    height: 270px;
  }
}
</style>
