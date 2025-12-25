const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001'

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  if (options.body) {
    config.body = JSON.stringify(options.body)
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export const api = {
  // Ingredientes
  getIngredients: () => request('/api/ingredients'),
  createIngredient: (data) => request('/api/ingredients', { method: 'POST', body: data }),
  updateIngredient: (id, data) => request(`/api/ingredients/${id}`, { method: 'PUT', body: data }),
  deleteIngredient: (id) => request(`/api/ingredients/${id}`, { method: 'DELETE' }),

  // Receitas
  getRecipes: () => request('/api/recipes'),
  createRecipe: (data) => request('/api/recipes', { method: 'POST', body: data }),
  updateRecipe: (id, data) => request(`/api/recipes/${id}`, { method: 'PUT', body: data }),
  deleteRecipe: (id) => request(`/api/recipes/${id}`, { method: 'DELETE' }),

  // Orçamentos
  getBudgets: () => request('/api/budgets'),
  createBudget: (data) => request('/api/budgets', { method: 'POST', body: data }),

  // Custos Fixos
  getFixedCosts: () => request('/api/fixed-costs'),
  createFixedCost: (data) => request('/api/fixed-costs', { method: 'POST', body: data }),
  updateFixedCost: (id, data) => request(`/api/fixed-costs/${id}`, { method: 'PUT', body: data }),
  deleteFixedCost: (id) => request(`/api/fixed-costs/${id}`, { method: 'DELETE' }),

  // Fluxo de Caixa
  getCashflow: () => request('/api/cashflow'),
  createCashflowEntry: (data) => request('/api/cashflow', { method: 'POST', body: data }),
  updateCashflowEntry: (id, data) => request(`/api/cashflow/${id}`, { method: 'PUT', body: data }),
  deleteCashflowEntry: (id) => request(`/api/cashflow/${id}`, { method: 'DELETE' }),

  // Preços
  getPricing: () => request('/api/pricing'),
  createPricing: (data) => request('/api/pricing', { method: 'POST', body: data }),

  // Movimentações de Estoque
  getStockMovements: () => request('/api/stock-movements'),
  createStockMovement: (data) => request('/api/stock-movements', { method: 'POST', body: data }),

  // Armazéns
  getWarehouses: () => request('/api/warehouses'),
  createWarehouse: (data) => request('/api/warehouses', { method: 'POST', body: data }),
  updateWarehouse: (id, data) => request(`/api/warehouses/${id}`, { method: 'PUT', body: data }),
  deleteWarehouse: (id) => request(`/api/warehouses/${id}`, { method: 'DELETE' }),

  // Itens do Armazém
  createWarehouseItem: (warehouseId, data) => request(`/api/warehouses/${warehouseId}/items`, { method: 'POST', body: data }),
  updateWarehouseItem: (warehouseId, itemId, data) => request(`/api/warehouses/${warehouseId}/items/${itemId}`, { method: 'PUT', body: data }),
  deleteWarehouseItem: (warehouseId, itemId) => request(`/api/warehouses/${warehouseId}/items/${itemId}`, { method: 'DELETE' }),

  // Backup/Restore
  exportData: () => request('/api/export'),
  restoreData: (data) => request('/api/restore', { method: 'POST', body: data })
}

