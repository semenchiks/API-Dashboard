import axios from 'axios'

const API_BASE_URL = '/api' // Используем прокси вместо прямого обращения
const API_KEY = 'E6kUTYrYwZq2tN4QEtyzsbEBk3ie'

// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

// Интерфейсы для типизации
export interface ApiParams {
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface ApiResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

// Тестовые данные для демонстрации
const generateTestData = (type: string, count = 50) => {
  const data = []
  for (let i = 1; i <= count; i++) {
    const baseData = {
      id: i,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }

    switch (type) {
      case 'sales':
        data.push({
          ...baseData,
          amount: Math.floor(Math.random() * 50000) + 1000,
          quantity: Math.floor(Math.random() * 100) + 1,
          product_name: `Товар ${i}`,
          customer_name: `Клиент ${i}`,
          status: ['завершена', 'в обработке', 'отменена'][Math.floor(Math.random() * 3)],
          discount: Math.floor(Math.random() * 5000),
          profit: Math.floor(Math.random() * 15000) + 2000,
        })
        break
      case 'orders':
        data.push({
          ...baseData,
          total: Math.floor(Math.random() * 75000) + 2000,
          items_count: Math.floor(Math.random() * 10) + 1,
          customer: `Покупатель ${i}`,
          status: ['новый', 'подтвержден', 'доставляется', 'выполнен'][Math.floor(Math.random() * 4)],
          discount_amount: Math.floor(Math.random() * 3000),
          delivery_cost: Math.floor(Math.random() * 1000) + 200,
        })
        break
      case 'stocks':
        data.push({
          ...baseData,
          product_name: `Товар на складе ${i}`,
          quantity: Math.floor(Math.random() * 1000) + 10,
          warehouse: `Склад ${Math.floor(Math.random() * 5) + 1}`,
          reserved: Math.floor(Math.random() * 100),
          available: Math.floor(Math.random() * 900) + 10,
          incoming: Math.floor(Math.random() * 200),
        })
        break
      case 'incomes':
        data.push({
          ...baseData,
          amount: Math.floor(Math.random() * 100000) + 5000,
          net_amount: Math.floor(Math.random() * 80000) + 4000,
          source: ['продажи', 'услуги', 'партнерство'][Math.floor(Math.random() * 3)],
          category: ['основной', 'дополнительный', 'разовый'][Math.floor(Math.random() * 3)],
          commission: Math.floor(Math.random() * 5000),
          tax_amount: Math.floor(Math.random() * 8000),
          description: `Доход от операции ${i}`,
        })
        break
    }
  }
  return data
}

// Базовая функция для выполнения запросов
async function makeRequest<T>(endpoint: string, params: ApiParams = {}): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.get(endpoint, {
      params: {
        ...params,
        key: API_KEY,
      },
    })
    return response.data
  } catch (error) {
    console.warn('API недоступен, используются тестовые данные:', error)
    
    // Возвращаем тестовые данные если API недоступен
    const type = endpoint.replace('/', '')
    const testData = generateTestData(type, params.limit || 50)
    const page = params.page || 1
    const limit = params.limit || 50
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    return {
      data: testData.slice(startIndex, endIndex) as T[],
      current_page: page,
      last_page: Math.ceil(testData.length / limit),
      per_page: limit,
      total: testData.length,
    }
  }
}

// API методы для каждого эндпоинта
export const api = {
  // Продажи
  getSales: (params: ApiParams) => makeRequest('/sales', params),

  // Заказы
  getOrders: (params: ApiParams) => makeRequest('/orders', params),

  // Склады (только текущий день)
  getStocks: (params: Pick<ApiParams, 'dateFrom' | 'page' | 'limit'>) => 
    makeRequest('/stocks', params),

  // Доходы
  getIncomes: (params: ApiParams) => makeRequest('/incomes', params),
}

// Утилиты для работы с датами
export const dateUtils = {
  // Форматирование даты в формат Y-m-d
  formatDate: (date: Date): string => {
    return date.toISOString().split('T')[0]
  },

  // Форматирование даты и времени в формат Y-m-d H:i:s
  formatDateTime: (date: Date): string => {
    return date.toISOString().replace('T', ' ').substring(0, 19)
  },

  // Получение текущей даты
  getCurrentDate: (): string => {
    return dateUtils.formatDate(new Date())
  },

  // Получение даты неделю назад
  getWeekAgoDate: (): string => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return dateUtils.formatDate(date)
  },
}
