<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ShoppingCart, Document, Box, Money } from '@element-plus/icons-vue'

const router = useRouter()

const sections = [
  {
    name: 'sales',
    title: 'Продажи',
    description: 'Анализ данных о продажах',
    icon: ShoppingCart,
    path: '/sales',
  },
  {
    name: 'orders',
    title: 'Заказы',
    description: 'Управление заказами',
    icon: Document,
    path: '/orders',
  },
  {
    name: 'stocks',
    title: 'Склады',
    description: 'Складские остатки',
    icon: Box,
    path: '/stocks',
  },
  {
    name: 'incomes',
    title: 'Доходы',
    description: 'Анализ доходности',
    icon: Money,
    path: '/incomes',
  },
]

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="home">
    <div class="header">
      <h1>HH API Dashboard</h1>
      <p>Система аналитики данных</p>
    </div>

    <div class="main-content">
      <div class="sections-grid">
        <div v-for="section in sections" :key="section.name" class="section-item">
          <el-card
            class="section-card"
            :body-style="{ padding: '20px' }"
            shadow="hover"
            @click="navigateTo(section.path)"
          >
            <div class="section-content">
              <div class="section-icon">
                <el-icon :size="40">
                  <component :is="section.icon" />
                </el-icon>
              </div>
              <div class="section-info">
                <h3>{{ section.title }}</h3>
                <p>{{ section.description }}</p>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <el-divider />

      <div class="about-section">
        <el-card>
          <template #header>
            <h3>О системе</h3>
          </template>
          <p>
            Данная система предназначена для анализа данных из HH API. Включает в себя следующие
            разделы:
          </p>
          <ul>
            <li>
              <strong>Продажи</strong> - анализ данных о продажах с возможностью фильтрации по
              датам
            </li>
            <li><strong>Заказы</strong> - управление и анализ заказов</li>
            <li><strong>Склады</strong> - текущее состояние складских остатков</li>
            <li><strong>Доходы</strong> - анализ доходности по периодам</li>
          </ul>
          <p>
            Каждый раздел содержит интерактивные графики, таблицы с данными, фильтры и пагинацию
            для удобной работы с большими объемами информации.
          </p>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 40px 0;
  flex-shrink: 0;
}

.header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5em;
  font-weight: 300;
}

.header p {
  margin: 0;
  font-size: 1.2em;
  opacity: 0.9;
}

.main-content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.section-item {
  width: 100%;
}

.section-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  height: 140px;
  width: 100%;
}

.section-card:hover {
  transform: translateY(-5px);
}

.section-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.section-icon {
  color: #409eff;
  margin-right: 20px;
  min-width: 60px;
  display: flex;
  justify-content: center;
}

.section-info {
  flex: 1;
}

.section-info h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 1.3em;
}

.section-info p {
  margin: 0;
  color: #606266;
  font-size: 0.9em;
}

.about-section {
  width: 100%;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px;
  }
  
  .header h1 {
    font-size: 2em;
  }
  
  .sections-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .section-card {
    height: auto;
    min-height: 120px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 15px;
  }
  
  .header {
    padding: 20px 0;
  }
  
  .header h1 {
    font-size: 1.8em;
  }
}
</style>
