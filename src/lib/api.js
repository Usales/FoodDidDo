const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001'

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      ...options.headers
    },
    ...options
  }

  // Só definir Content-Type se houver body
  if (options.body) {
    config.headers['Content-Type'] = 'application/json'
    config.body = JSON.stringify(options.body)
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      // Tentar pegar a mensagem de erro do servidor
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } else {
          const text = await response.text()
          if (text) errorMessage = text
        }
      } catch (e) {
        // Se não conseguir parsear a resposta, usar a mensagem padrão
      }
      throw new Error(errorMessage)
    }
    
    // Verificar se há conteúdo para parsear
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text()
      return text ? JSON.parse(text) : {}
    }
    
    // Se não houver conteúdo ou não for JSON, retornar objeto vazio ou texto
    const text = await response.text()
    return text ? JSON.parse(text) : { success: true }
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
  updateRecipeBudget: (id, includeInBudget) => request(`/api/recipes/${id}/budget`, { method: 'PATCH', body: { includeInBudget } }),
  deleteRecipe: (id) => request(`/api/recipes/${id}`, { method: 'DELETE' }),

  // Orçamentos
  getBudgets: () => request('/api/budgets'),
  createBudget: (data) => request('/api/budgets', { method: 'POST', body: data }),
  updateBudget: (id, data) => request(`/api/budgets/${id}`, { method: 'PUT', body: data }),
  deleteBudget: (id) => request(`/api/budgets/${id}`, { method: 'DELETE' }),

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
  updatePricing: (id, data) => request(`/api/pricing/${id}`, { method: 'PUT', body: data }),
  deletePricing: (id) => request(`/api/pricing/${id}`, { method: 'DELETE' }),

  // Movimentações de Estoque
  getStockMovements: () => request('/api/stock-movements'),
  createStockMovement: (data) => request('/api/stock-movements', { method: 'POST', body: data }),
  updateStockMovement: (id, data) => request(`/api/stock-movements/${id}`, { method: 'PUT', body: data }),
  deleteStockMovement: (id) => request(`/api/stock-movements/${id}`, { method: 'DELETE' }),

  // Armazéns
  getWarehouses: () => request('/api/warehouses'),
  createWarehouse: (data) => request('/api/warehouses', { method: 'POST', body: data }),
  updateWarehouse: (id, data) => request(`/api/warehouses/${id}`, { method: 'PUT', body: data }),
  deleteWarehouse: (id) => request(`/api/warehouses/${id}`, { method: 'DELETE' }),

  // Itens do Armazém
  getWarehouseItems: (warehouseId) => request(`/api/warehouses/${warehouseId}/items`),
  getWarehouseItem: (warehouseId, itemId) => request(`/api/warehouses/${warehouseId}/items/${itemId}`),
  createWarehouseItem: (warehouseId, data) => request(`/api/warehouses/${warehouseId}/items`, { method: 'POST', body: data }),
  updateWarehouseItem: (warehouseId, itemId, data) => request(`/api/warehouses/${warehouseId}/items/${itemId}`, { method: 'PUT', body: data }),
  deleteWarehouseItem: (warehouseId, itemId) => request(`/api/warehouses/${warehouseId}/items/${itemId}`, { method: 'DELETE' }),

  // Backup/Restore
  exportData: () => request('/api/export'),
  restoreData: (data) => request('/api/restore', { method: 'POST', body: data }),

  // Pedidos/Vendas (Orders)
  getOrders: () => request('/api/orders'),
  getOrder: (id) => request(`/api/orders/${id}`),
  createOrder: (data) => request('/api/orders', { method: 'POST', body: data }),
  updateOrder: (id, data) => request(`/api/orders/${id}`, { method: 'PATCH', body: data }),

  // Lookup (autofill)
  lookupCnpj: (cnpj) => request(`/api/lookup/cnpj/${cnpj}`),

  // Caixa (Abertura/Fechamento/Suprimento/Sangria)
  getCashboxSession: () => request('/api/cashbox/session'),
  openCashbox: (data) => request('/api/cashbox/open', { method: 'POST', body: data }),
  closeCashbox: (data) => request('/api/cashbox/close', { method: 'POST', body: data }),
  getCashboxMovements: () => request('/api/cashbox/movements'),
  createCashboxMovement: (data) => request('/api/cashbox/movements', { method: 'POST', body: data }),

  // Clientes (Customers)
  getCustomers: () => request('/api/customers'),
  getCustomer: (id) => request(`/api/customers/${id}`),
  createCustomer: (data) => request('/api/customers', { method: 'POST', body: data }),
  updateCustomer: (id, data) => request(`/api/customers/${id}`, { method: 'PUT', body: data }),
  deleteCustomer: (id) => request(`/api/customers/${id}`, { method: 'DELETE' }),

  // Pagamentos (Payments)
  getPayments: (params) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`/api/payments${queryString}`)
  },
  getPayment: (id) => request(`/api/payments/${id}`),
  createPayment: (data) => request('/api/payments', { method: 'POST', body: data }),
  updatePayment: (id, data) => request(`/api/payments/${id}`, { method: 'PUT', body: data }),
  updatePaymentStatus: (id, data) => request(`/api/payments/${id}/status`, { method: 'PATCH', body: data }),

  // Notas Fiscais (Invoices)
  getInvoices: (params) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`/api/invoices${queryString}`)
  },
  getInvoice: (id) => request(`/api/invoices/${id}`),
  createInvoice: (data) => request('/api/invoices', { method: 'POST', body: data }),
  updateInvoice: (id, data) => request(`/api/invoices/${id}`, { method: 'PUT', body: data }),
  issueInvoice: (data) => request('/api/invoices/issue', { method: 'POST', body: data }),
  cancelInvoice: (id, cancellationReason) => request(`/api/invoices/${id}/cancel`, { method: 'POST', body: { cancellationReason } }),
  getInvoicePdf: (id) => request(`/api/invoices/${id}/pdf`),
  getInvoiceXml: (id) => request(`/api/invoices/${id}/xml`)
}

