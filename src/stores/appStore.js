import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const createInitialState = () => ({
  budgets: [
    {
      id: 'budget-1',
      period: 'Novembro/2025',
      amount: 2500,
      spent: 1180,
      createdAt: new Date().toISOString()
    }
  ],
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
      id: 'recipe-1',
      name: 'Bolo de Milho',
      yield: 18,
      prepTime: 45,
      totalCost: 36.4,
      unitCost: 2.02,
      contributionMargin: 0.38
    },
    {
      id: 'recipe-2',
      name: 'Pão Caseiro',
      yield: 24,
      prepTime: 180,
      totalCost: 42.5,
      unitCost: 1.77,
      contributionMargin: 0.31
    },
    {
      id: 'recipe-3',
      name: 'Coxinha de Frango',
      yield: 50,
      prepTime: 120,
      totalCost: 88,
      unitCost: 1.76,
      contributionMargin: 0.45
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
  pricing: [
    {
      id: 'pricing-1',
      recipeId: 'recipe-1',
      desiredMargin: 0.45,
      suggestedPrice: 3.7,
      currentPrice: 3.5
    },
    {
      id: 'pricing-2',
      recipeId: 'recipe-2',
      desiredMargin: 0.5,
      suggestedPrice: 3.55,
      currentPrice: 3.2
    }
  ],
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
  cashflow: [
    { id: 'cf-1', type: 'entrada', description: 'Venda - Bolo de milho', amount: 540, date: '2025-11-07' },
    { id: 'cf-2', type: 'entrada', description: 'Venda - Coxinha', amount: 880, date: '2025-11-06' },
    { id: 'cf-3', type: 'saída', description: 'Compra - Farinha', amount: 320, date: '2025-11-05' },
    { id: 'cf-4', type: 'saída', description: 'Conta de luz', amount: 220, date: '2025-11-02' }
  ],
  stockMovements: [
    {
      id: 'move-1',
      ingredientId: 'ingredient-1',
      type: 'saida',
      quantity: 4_000,
      reference: 'Produção Bolo de Milho',
      createdAt: '2025-11-09T08:35:00Z'
    },
    {
      id: 'move-2',
      ingredientId: 'ingredient-3',
      type: 'entrada',
      quantity: 120,
      reference: 'Compra ovos',
      createdAt: '2025-11-08T13:10:00Z'
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
  addFixedCost: (cost) => set((state) => ({ fixedCosts: [cost, ...state.fixedCosts] })),
  addPricing: (pricing) => set((state) => ({ pricing: [pricing, ...state.pricing] })),
  addStockMovement: (movement) => set((state) => ({ stockMovements: [movement, ...state.stockMovements] })),
  getBudgetBalance: () => {
    const { budgets } = get()
    const totalAmount = budgets.reduce((acc, budget) => acc + budget.amount, 0)
    const totalSpent = budgets.reduce((acc, budget) => acc + (budget.spent || 0), 0)
    return totalAmount - totalSpent
  }
})))

