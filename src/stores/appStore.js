import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const createInitialState = () => ({
  budgets: [],
  ingredients: [
    {
      id: 'ingredient-1',
      name: 'Farinha de Trigo',
      category: 'Farinha',
      packagePrice: 120,
      packageQty: 25_000,
      unitCost: 0.0048,
      stockQty: 12_500,
      lowStockThreshold: 5_000
    },
    {
      id: 'ingredient-2',
      name: 'Leite Condensado',
      category: 'Laticínios',
      packagePrice: 6.5,
      packageQty: 395,
      unitCost: 0.0165,
      stockQty: 1_200,
      lowStockThreshold: 395
    },
    {
      id: 'ingredient-3',
      name: 'Ovos',
      category: 'Ovos',
      packagePrice: 24,
      packageQty: 30,
      unitCost: 0.8,
      stockQty: 180,
      lowStockThreshold: 60
    }
  ],
  recipes: [
    {
      id: 'recipe-3',
      name: 'Coxinha de Frango',
      yield: 50,
      prepTime: 120,
      totalCost: 88,
      unitCost: 1.76,
      contributionMargin: 0.45,
      ingredients: []
    }
  ],
  meals: [
    {
      id: 'meal-1',
      title: 'Avocado toast',
      calories: '250 Cal',
      ingredients: 'Avocado, Bread, Eggs',
      time: '15 min',
      status: 'Em andamento'
    },
    {
      id: 'meal-2',
      title: 'Alfredo Pasta',
      calories: '450 Cal',
      ingredients: 'Alfredo, Chicken, Pasta',
      time: '30 min',
      status: 'A fazer'
    },
    {
      id: 'meal-3',
      title: 'Quinoa Salad',
      calories: '200 Cal',
      ingredients: 'Carrot, Tomato, Mint',
      time: '10 min',
      status: 'Concluída'
    },
    {
      id: 'meal-4',
      title: 'Grilled Chicken',
      calories: '250 Cal',
      ingredients: 'Chicken, Spices, Oil',
      time: '30 min',
      status: 'A fazer'
    }
  ],
  pricing: [],
  fixedCosts: [
    {
      id: 'fixed-1',
      name: 'Aluguel',
      type: 'fixo',
      value: 1200,
      allocationMethod: 'mensal'
    },
    {
      id: 'fixed-2',
      name: 'Gás',
      type: 'indireto',
      value: 320,
      allocationMethod: 'por hora'
    },
    {
      id: 'fixed-3',
      name: 'Energia Elétrica',
      type: 'indireto',
      value: 480,
      allocationMethod: 'por lote'
    }
  ],
  cashflow: [],
  stockMovements: [
    {
      id: 'move-2',
      ingredientId: 'ingredient-3',
      type: 'entrada',
      quantity: 120,
      reference: 'Compra ovos',
      createdAt: '2025-11-08T13:10:00Z'
    }
  ],
  warehouses: [
    {
      id: 'warehouse-1',
      name: 'Armazém Principal',
      capacity: 120, // kg (opcional)
      capacityUnit: 'kg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: 'item-1',
          emoji: '🍞',
          name: 'Farinha de Trigo',
          quantity: 12500,
          unit: 'g',
          minIdeal: 5000,
          unitCost: 0.0048,
          category: 'Farinhas',
          notes: '',
          warehouseId: 'warehouse-1'
        },
        {
          id: 'item-2',
          emoji: '🥚',
          name: 'Ovos',
          quantity: 300,
          unit: 'un',
          minIdeal: 600,
          unitCost: 0.8,
          category: 'Ovos',
          notes: '',
          warehouseId: 'warehouse-1'
        },
        {
          id: 'item-3',
          emoji: '🥛',
          name: 'Leite Condensado',
          quantity: 1200,
          unit: 'ml',
          minIdeal: 395,
          unitCost: 0.0165,
          category: 'Laticínios',
          notes: '',
          warehouseId: 'warehouse-1'
        }
      ]
    }
  ]
})

export const useAppStore = create(devtools((set, get) => ({
  ...createInitialState(),
  addBudget: (budget) => set((state) => ({ budgets: [budget, ...state.budgets] })),
  addIngredient: (ingredient) => set((state) => ({
    ingredients: [{ ...ingredient, unitCost: ingredient.packagePrice / ingredient.packageQty }, ...state.ingredients]
  })),
  addRecipe: (recipe) => set((state) => ({ recipes: [recipe, ...state.recipes] })),
  updateRecipe: (id, updates) =>
    set((state) => ({
      recipes: state.recipes.map((recipe) => (recipe.id === id ? { ...recipe, ...updates } : recipe))
    })),
  addMeal: (meal) => set((state) => ({ meals: [meal, ...state.meals] })),
  updateMeal: (id, updates) =>
    set((state) => ({
      meals: state.meals.map((meal) => (meal.id === id ? { ...meal, ...updates } : meal))
    })),
  deleteMeal: (id) =>
    set((state) => ({
      meals: state.meals.filter((meal) => meal.id !== id)
    })),
  addCashflowEntry: (entry) => set((state) => ({ cashflow: [entry, ...state.cashflow] })),
  updateCashflowEntry: (id, updates) =>
    set((state) => ({
      cashflow: state.cashflow.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
    })),
  deleteCashflowEntry: (id) =>
    set((state) => ({
      cashflow: state.cashflow.filter((entry) => entry.id !== id)
    })),
  addFixedCost: (cost) => set((state) => ({ fixedCosts: [cost, ...state.fixedCosts] })),
  updateFixedCost: (id, updates) =>
    set((state) => ({
      fixedCosts: state.fixedCosts.map((cost) => (cost.id === id ? { ...cost, ...updates } : cost))
    })),
  deleteFixedCost: (id) =>
    set((state) => ({
      fixedCosts: state.fixedCosts.filter((cost) => cost.id !== id)
    })),
  addPricing: (pricing) => set((state) => ({ pricing: [pricing, ...state.pricing] })),
  updatePricing: (id, updates) =>
    set((state) => ({
      pricing: state.pricing.map((p) => (p.id === id ? { ...p, ...updates } : p))
    })),
  deletePricing: (id) =>
    set((state) => ({
      pricing: state.pricing.filter((p) => p.id !== id)
    })),
  addStockMovement: (movement) => set((state) => ({ stockMovements: [movement, ...state.stockMovements] })),
  addWarehouse: (warehouse) => set((state) => ({ 
    warehouses: [{ ...warehouse, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), items: [] }, ...state.warehouses] 
  })),
  updateWarehouse: (id, updates) =>
    set((state) => ({
      warehouses: state.warehouses.map((w) => (w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w))
    })),
  deleteWarehouse: (id) =>
    set((state) => ({
      warehouses: state.warehouses.filter((w) => w.id !== id)
    })),
  addWarehouseItem: (warehouseId, item) => {
    const newItem = { ...item, id: crypto.randomUUID(), warehouseId }
    return set((state) => ({
      warehouses: state.warehouses.map((w) =>
        w.id === warehouseId
          ? { ...w, items: [...w.items, newItem], updatedAt: new Date().toISOString() }
          : w
      )
    }))
  },
  updateWarehouseItem: (warehouseId, itemId, updates) =>
    set((state) => ({
      warehouses: state.warehouses.map((w) =>
        w.id === warehouseId
          ? {
              ...w,
              items: w.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
              updatedAt: new Date().toISOString()
            }
          : w
      )
    })),
  deleteWarehouseItem: (warehouseId, itemId) =>
    set((state) => ({
      warehouses: state.warehouses.map((w) =>
        w.id === warehouseId
          ? {
              ...w,
              items: w.items.filter((item) => item.id !== itemId),
              updatedAt: new Date().toISOString()
            }
          : w
      )
    })),
  getBudgetBalance: () => {
    const { budgets } = get()
    const totalAmount = budgets.reduce((acc, budget) => acc + budget.amount, 0)
    const totalSpent = budgets.reduce((acc, budget) => acc + (budget.spent || 0), 0)
    return totalAmount - totalSpent
  },
  // Métodos para backup e restauração
  exportData: () => {
    const state = get()
    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        budgets: state.budgets,
        ingredients: state.ingredients,
        recipes: state.recipes,
        meals: state.meals,
        pricing: state.pricing,
        fixedCosts: state.fixedCosts,
        cashflow: state.cashflow,
        stockMovements: state.stockMovements,
        warehouses: state.warehouses
      }
    }
  },
  restoreData: (backupData) => {
    if (!backupData || !backupData.data) {
      throw new Error('Formato de backup inválido')
    }
    
    set({
      budgets: backupData.data.budgets || [],
      ingredients: backupData.data.ingredients || [],
      recipes: backupData.data.recipes || [],
      meals: backupData.data.meals || [],
      pricing: backupData.data.pricing || [],
      fixedCosts: backupData.data.fixedCosts || [],
      cashflow: backupData.data.cashflow || [],
      stockMovements: backupData.data.stockMovements || [],
      warehouses: backupData.data.warehouses || []
    })
  }
})))

