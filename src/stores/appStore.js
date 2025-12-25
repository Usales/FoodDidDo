import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { api } from '../lib/api'

const createInitialState = () => ({
  budgets: [],
  ingredients: [],
  recipes: [],
  meals: [],
  pricing: [],
  fixedCosts: [],
  cashflow: [],
  stockMovements: [],
  warehouses: [],
  isLoading: false,
  error: null
})

export const useAppStore = create(devtools((set, get) => ({
  ...createInitialState(),
  
  // Carregar dados do servidor
  loadData: async () => {
    set({ isLoading: true, error: null })
    try {
      const [budgets, ingredients, recipes, fixedCosts, cashflow, stockMovements, warehouses] = await Promise.all([
        api.getBudgets(),
        api.getIngredients(),
        api.getRecipes(),
        api.getFixedCosts(),
        api.getCashflow(),
        api.getStockMovements(),
        api.getWarehouses()
      ])
      
      set({
        budgets,
        ingredients,
        recipes,
        fixedCosts,
        cashflow,
        stockMovements,
        warehouses,
        isLoading: false
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      set({ error: error.message, isLoading: false })
    }
  },
  
  // Orçamentos
  addBudget: async (budget) => {
    try {
      const newBudget = await api.createBudget(budget)
      set((state) => ({ budgets: [newBudget, ...state.budgets] }))
      return newBudget
    } catch (error) {
      console.error('Erro ao criar orçamento:', error)
      throw error
    }
  },
  
  // Ingredientes
  addIngredient: async (ingredient) => {
    try {
      const newIngredient = await api.createIngredient(ingredient)
      set((state) => ({ ingredients: [newIngredient, ...state.ingredients] }))
      return newIngredient
    } catch (error) {
      console.error('Erro ao criar ingrediente:', error)
      throw error
    }
  },
  
  updateIngredient: async (id, updates) => {
    try {
      const updated = await api.updateIngredient(id, updates)
      set((state) => ({
        ingredients: state.ingredients.map((ing) => (ing.id === id ? updated : ing))
      }))
      return updated
    } catch (error) {
      console.error('Erro ao atualizar ingrediente:', error)
      throw error
    }
  },
  
  deleteIngredient: async (id) => {
    try {
      await api.deleteIngredient(id)
      set((state) => ({
        ingredients: state.ingredients.filter((ing) => ing.id !== id)
      }))
    } catch (error) {
      console.error('Erro ao deletar ingrediente:', error)
      throw error
    }
  },
  
  // Receitas
  addRecipe: async (recipe) => {
    try {
      const newRecipe = await api.createRecipe(recipe)
      set((state) => ({ recipes: [newRecipe, ...state.recipes] }))
      return newRecipe
    } catch (error) {
      console.error('Erro ao criar receita:', error)
      throw error
    }
  },
  
  updateRecipe: async (id, updates) => {
    try {
      const updated = await api.updateRecipe(id, updates)
      set((state) => ({
        recipes: state.recipes.map((recipe) => (recipe.id === id ? updated : recipe))
      }))
      return updated
    } catch (error) {
      console.error('Erro ao atualizar receita:', error)
      throw error
    }
  },
  
  deleteRecipe: async (id) => {
    try {
      await api.deleteRecipe(id)
      set((state) => ({
        recipes: state.recipes.filter((recipe) => recipe.id !== id)
      }))
    } catch (error) {
      console.error('Erro ao deletar receita:', error)
      throw error
    }
  },
  
  // Refeições (mantido local por enquanto)
  addMeal: (meal) => set((state) => ({ meals: [meal, ...state.meals] })),
  updateMeal: (id, updates) =>
    set((state) => ({
      meals: state.meals.map((meal) => (meal.id === id ? { ...meal, ...updates } : meal))
    })),
  deleteMeal: (id) =>
    set((state) => ({
      meals: state.meals.filter((meal) => meal.id !== id)
    })),
  
  // Fluxo de Caixa
  addCashflowEntry: async (entry) => {
    try {
      const newEntry = await api.createCashflowEntry(entry)
      set((state) => ({ cashflow: [newEntry, ...state.cashflow] }))
      return newEntry
    } catch (error) {
      console.error('Erro ao criar entrada de fluxo de caixa:', error)
      throw error
    }
  },
  
  updateCashflowEntry: async (id, updates) => {
    try {
      const updated = await api.updateCashflowEntry(id, updates)
      set((state) => ({
        cashflow: state.cashflow.map((entry) => (entry.id === id ? updated : entry))
      }))
      return updated
    } catch (error) {
      console.error('Erro ao atualizar entrada de fluxo de caixa:', error)
      throw error
    }
  },
  
  deleteCashflowEntry: async (id) => {
    try {
      await api.deleteCashflowEntry(id)
      set((state) => ({
        cashflow: state.cashflow.filter((entry) => entry.id !== id)
      }))
    } catch (error) {
      console.error('Erro ao deletar entrada de fluxo de caixa:', error)
      throw error
    }
  },
  
  // Custos Fixos
  addFixedCost: async (cost) => {
    try {
      const newCost = await api.createFixedCost(cost)
      set((state) => ({ fixedCosts: [newCost, ...state.fixedCosts] }))
      return newCost
    } catch (error) {
      console.error('Erro ao criar custo fixo:', error)
      throw error
    }
  },
  
  updateFixedCost: async (id, updates) => {
    try {
      const updated = await api.updateFixedCost(id, updates)
      set((state) => ({
        fixedCosts: state.fixedCosts.map((cost) => (cost.id === id ? updated : cost))
      }))
      return updated
    } catch (error) {
      console.error('Erro ao atualizar custo fixo:', error)
      throw error
    }
  },
  
  deleteFixedCost: async (id) => {
    try {
      await api.deleteFixedCost(id)
      set((state) => ({
        fixedCosts: state.fixedCosts.filter((cost) => cost.id !== id)
      }))
    } catch (error) {
      console.error('Erro ao deletar custo fixo:', error)
      throw error
    }
  },
  
  // Preços
  addPricing: async (pricing) => {
    try {
      const newPricing = await api.createPricing(pricing)
      set((state) => ({ pricing: [newPricing, ...state.pricing] }))
      return newPricing
    } catch (error) {
      console.error('Erro ao criar preço:', error)
      throw error
    }
  },
  
  updatePricing: (id, updates) =>
    set((state) => ({
      pricing: state.pricing.map((p) => (p.id === id ? { ...p, ...updates } : p))
    })),
  
  deletePricing: (id) =>
    set((state) => ({
      pricing: state.pricing.filter((p) => p.id !== id)
    })),
  
  // Movimentações de Estoque
  addStockMovement: async (movement) => {
    try {
      const newMovement = await api.createStockMovement(movement)
      set((state) => ({ stockMovements: [newMovement, ...state.stockMovements] }))
      
      // Atualizar estoque do ingrediente localmente
      set((state) => ({
        ingredients: state.ingredients.map((ing) =>
          ing.id === movement.ingredientId
            ? {
                ...ing,
                stockQty:
                  movement.type === 'entrada'
                    ? ing.stockQty + movement.quantity
                    : ing.stockQty - movement.quantity
              }
            : ing
        )
      }))
      
      return newMovement
    } catch (error) {
      console.error('Erro ao criar movimentação de estoque:', error)
      throw error
    }
  },
  
  // Armazéns
  addWarehouse: async (warehouse) => {
    try {
      const newWarehouse = await api.createWarehouse(warehouse)
      set((state) => ({ warehouses: [newWarehouse, ...state.warehouses] }))
      return newWarehouse
    } catch (error) {
      console.error('Erro ao criar armazém:', error)
      throw error
    }
  },
  
  updateWarehouse: async (id, updates) => {
    try {
      const updated = await api.updateWarehouse(id, updates)
      set((state) => ({
        warehouses: state.warehouses.map((w) => (w.id === id ? updated : w))
      }))
      return updated
    } catch (error) {
      console.error('Erro ao atualizar armazém:', error)
      throw error
    }
  },
  
  deleteWarehouse: async (id) => {
    try {
      await api.deleteWarehouse(id)
      set((state) => ({
        warehouses: state.warehouses.filter((w) => w.id !== id)
      }))
    } catch (error) {
      console.error('Erro ao deletar armazém:', error)
      throw error
    }
  },
  
  addWarehouseItem: async (warehouseId, item) => {
    try {
      const newItem = await api.createWarehouseItem(warehouseId, item)
      set((state) => ({
        warehouses: state.warehouses.map((w) =>
          w.id === warehouseId
            ? { ...w, items: [...w.items, newItem] }
            : w
        )
      }))
      return newItem
    } catch (error) {
      console.error('Erro ao criar item do armazém:', error)
      throw error
    }
  },
  
  updateWarehouseItem: async (warehouseId, itemId, updates) => {
    try {
      const updated = await api.updateWarehouseItem(warehouseId, itemId, updates)
      set((state) => ({
        warehouses: state.warehouses.map((w) =>
          w.id === warehouseId
            ? {
                ...w,
                items: w.items.map((item) => (item.id === itemId ? updated : item))
              }
            : w
        )
      }))
      return updated
    } catch (error) {
      console.error('Erro ao atualizar item do armazém:', error)
      throw error
    }
  },
  
  deleteWarehouseItem: async (warehouseId, itemId) => {
    try {
      await api.deleteWarehouseItem(warehouseId, itemId)
      set((state) => ({
        warehouses: state.warehouses.map((w) =>
          w.id === warehouseId
            ? {
                ...w,
                items: w.items.filter((item) => item.id !== itemId)
              }
            : w
        )
      }))
    } catch (error) {
      console.error('Erro ao deletar item do armazém:', error)
      throw error
    }
  },
  
  getBudgetBalance: () => {
    const { budgets } = get()
    const totalAmount = budgets.reduce((acc, budget) => acc + budget.amount, 0)
    const totalSpent = budgets.reduce((acc, budget) => acc + (budget.spent || 0), 0)
    return totalAmount - totalSpent
  },
  
  // Métodos para backup e restauração
  exportData: async () => {
    try {
      return await api.exportData()
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      throw error
    }
  },
  
  restoreData: async (backupData) => {
    if (!backupData || !backupData.data) {
      throw new Error('Formato de backup inválido')
    }
    
    try {
      await api.restoreData(backupData)
      // Recarregar dados após restauração
      await get().loadData()
    } catch (error) {
      console.error('Erro ao restaurar dados:', error)
      throw error
    }
  }
})))
