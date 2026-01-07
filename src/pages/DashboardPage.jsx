import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../stores/appStore'
import { useAuth } from '../components/AuthProvider'
import { FiEdit3, FiTrash2, FiPlus, FiClock, FiDollarSign, FiThermometer } from 'react-icons/fi'
import './PageCommon.css'
import './DashboardPage.css'

const defaultMeals = [
  {
    id: 'meal-1',
    title: 'Avocado toast',
    calories: '250 Cal',
    ingredients: 'Avocado, Bread, Eggs',
    time: '15 min',
    cost: '8.20',
    status: 'fazer'
  },
  {
    id: 'meal-2',
    title: 'Alfredo Pasta',
    calories: '450 Cal',
    ingredients: 'Alfredo, Chicken, Pasta',
    time: '30 min',
    cost: '12.50',
    status: 'planejado'
  },
  {
    id: 'meal-3',
    title: 'Quinoa Salad',
    calories: '200 Cal',
    ingredients: 'Carrot, Tomato, Mint',
    time: '10 min',
    cost: '5.10',
    status: 'finalizado'
  }
]

const initialForm = {
  title: '',
  calories: '',
  caloriesUnit: 'Cal',
  ingredients: '',
  time: '',
  timeUnit: 'Min',
  cost: '',
  status: 'fazer'
}

// Mapeamento de ingredientes para emojis
const ingredientEmojis = {
  'abacaxi': '🍍', 'pineapple': '🍍',
  'abacate': '🥑', 'avocado': '🥑',
  'alface': '🥬', 'lettuce': '🥬',
  'arroz': '🍚', 'rice': '🍚',
  'azeitona': '🫒', 'olive': '🫒',
  'banana': '🍌',
  'batata': '🥔', 'potato': '🥔',
  'bread': '🍞', 'pão': '🍞',
  'brocolis': '🥦', 'brócolis': '🥦', 'broccoli': '🥦',
  'carne': '🥩', 'meat': '🥩', 'beef': '🥩',
  'chicken': '🍗', 'frango': '🍗',
  'carrot': '🥕', 'cenoura': '🥕',
  'cebola': '🧅', 'onion': '🧅',
  'cheese': '🧀', 'queijo': '🧀',
  'chocolate': '🍫',
  'coco': '🥥', 'coconut': '🥥',
  'couve': '🥬', 'kale': '🥬',
  'egg': '🥚', 'eggs': '🥚', 'ovo': '🥚', 'ovos': '🥚',
  'espinafre': '🥬', 'spinach': '🥬',
  'fish': '🐟', 'peixe': '🐟',
  'leite': '🥛', 'milk': '🥛',
  'mint': '🌿', 'hortelã': '🌿', 'hortelã': '🌿',
  'manteiga': '🧈', 'butter': '🧈',
  'milho': '🌽', 'corn': '🌽',
  'mushroom': '🍄', 'cogumelo': '🍄',
  'pasta': '🍝', 'macarrão': '🍝',
  'pepper': '🫑', 'pimentão': '🫑',
  'quinoa': '🌾',
  'sal': '🧂', 'salt': '🧂',
  'tomato': '🍅', 'tomate': '🍅',
  'trigo': '🌾', 'wheat': '🌾',
  'uva': '🍇', 'grape': '🍇',
  'limão': '🍋', 'lemon': '🍋',
  'laranja': '🍊', 'orange': '🍊',
  'morango': '🍓', 'strawberry': '🍓',
  'maçã': '🍎', 'apple': '🍎',
  'alfredo': '🍝', 'molho': '🍝', 'sauce': '🍝'
}

// Função para obter emoji do ingrediente
const getIngredientEmoji = (ingredient) => {
  const normalized = ingredient.trim().toLowerCase()
  return ingredientEmojis[normalized] || '🥘'
}

// Função para capitalizar primeira letra
const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function DashboardPage() {
  const { user } = useAuth()
  const recipes = useAppStore((state) => state.recipes)
  const [meals, setMeals] = useState(defaultMeals)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [showFabMenu, setShowFabMenu] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('fooddiddo_meals')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length) {
          setMeals(parsed)
        }
      } catch (error) {
        console.warn('Não foi possível carregar refeições salvas', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('fooddiddo_meals', JSON.stringify(meals))
  }, [meals])

  // Fechar FAB menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFabMenu && !event.target.closest('.fab-container')) {
        setShowFabMenu(false)
      }
    }

    if (showFabMenu) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showFabMenu])

  const stats = useMemo(() => {
    const total = meals.length || 1
    const completed = meals.filter((meal) => meal.status === 'finalizado').length
    const pending = meals.filter((meal) => meal.status === 'fazer' || meal.status === 'planejado').length
    const totalCost = meals.reduce((sum, meal) => sum + (parseFloat(meal.cost) || 0), 0)
    const lowStockItems = [] // TODO: integrar com estoque real
    
    return {
      total,
      completed,
      pending,
      percent: Math.round((completed / total) * 100),
      totalCost: totalCost.toFixed(2),
      lowStockCount: lowStockItems.length
    }
  }, [meals])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const getUserName = () => {
    const name = user?.name || 'Sales'
    return name.split(' ')[0] // Primeiro nome apenas
  }

  const businessInsights = useMemo(() => {
    if (!recipes.length) return null

    const bestRecipe = recipes.reduce((best, recipe) => {
      const profitPerUnit = recipe.unitCost * recipe.contributionMargin
      const bestProfit = best.unitCost * best.contributionMargin
      return profitPerUnit > bestProfit ? recipe : best
    }, recipes[0])

    const suggestedPrice = bestRecipe.unitCost / (1 - bestRecipe.contributionMargin)
    const profitPerUnit = suggestedPrice - bestRecipe.unitCost
    const profitPerBatch = profitPerUnit * bestRecipe.yield

    return {
      recipeName: bestRecipe.name,
      suggestedPrice: suggestedPrice.toFixed(2),
      profitPerUnit: profitPerUnit.toFixed(2),
      profitPerBatch: profitPerBatch.toFixed(2),
      yield: bestRecipe.yield
    }
  }, [recipes])

  const handleEdit = (meal) => {
    setEditingId(meal.id)
    // Extrair valor e unidade de calorias (ex: "250 Cal" -> "250", "Cal")
    const caloriesStr = meal.calories || ''
    const caloriesMatch = caloriesStr.match(/^(\d+(?:\.\d+)?)\s*(Cal|Seg|Min|Hrs|KG|G|Litro)?$/i)
    const caloriesValue = caloriesMatch ? caloriesMatch[1] : caloriesStr.replace(/\s*(Cal|Seg|Min|Hrs|KG|G|Litro)/gi, '').trim() || ''
    const caloriesUnit = caloriesMatch?.[2] || (caloriesStr.toLowerCase().includes('cal') ? 'Cal' : 'Cal')
    
    // Extrair valor e unidade de tempo (ex: "15 min" -> "15", "Min")
    const timeStr = meal.time || ''
    const timeMatch = timeStr.match(/^(\d+(?:\.\d+)?)\s*(Seg|Min|Hrs|KG|G|Litro)?$/i)
    const timeValue = timeMatch ? timeMatch[1] : timeStr.replace(/\s*(Seg|Min|Hrs|KG|G|Litro)/gi, '').trim() || ''
    const timeUnit = timeMatch?.[2] || (timeStr.toLowerCase().includes('min') ? 'Min' : (timeStr.toLowerCase().includes('hrs') || timeStr.toLowerCase().includes('hora') ? 'Hrs' : 'Min'))
    
    setFormData({
      title: meal.title,
      calories: caloriesValue,
      caloriesUnit: caloriesUnit,
      ingredients: meal.ingredients,
      time: timeValue,
      timeUnit: timeUnit,
      cost: meal.cost || '',
      status: meal.status
    })
    setShowForm(true)
  }

  const handleDelete = (mealId) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== mealId))
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) return

    const mealData = {
      ...formData,
      calories: `${formData.calories} ${formData.caloriesUnit}`,
      time: `${formData.time} ${formData.timeUnit}`
    }

    if (editingId) {
      setMeals((prev) =>
        prev.map((meal) => (meal.id === editingId ? { ...meal, ...mealData } : meal))
      )
    } else {
      setMeals((prev) => [
        {
          id: `meal-${Date.now()}`,
          ...mealData
        },
        ...prev
      ])
    }

    setFormData(initialForm)
    setEditingId(null)
    setShowForm(false)
    setShowFabMenu(false)
  }

  // Função para obter lista de ingredientes
  const getIngredientsList = () => {
    if (!formData.ingredients) return []
    return formData.ingredients.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0)
  }

  return (
    <div className="dashboard-page page">
      {/* Painel de Status Diário */}
      <section className="dashboard-status-panel">
        <div className="status-panel-header">
          <h2>Hoje</h2>
        </div>
        <div className="status-panel-content">
          <div className="status-item">
            <span className="status-label">{stats.pending} refeições pendentes</span>
          </div>
          {stats.lowStockCount > 0 && (
            <div className="status-item status-alert">
              <span className="status-label">Estoque baixo: {stats.lowStockCount} item{stats.lowStockCount > 1 ? 's' : ''}</span>
            </div>
          )}
          <div className="status-item">
            <span className="status-label">Custo estimado: R$ {stats.totalCost}</span>
          </div>
        </div>
      </section>

      {businessInsights && (
        <section className="page-stack business-insights">
          <div className="insights-content">
            <h2>💡 Oportunidade de Negócio</h2>
            <p className="insights-text">
              Com a receita <strong>{businessInsights.recipeName}</strong>, você poderia vender cada unidade a{' '}
              <strong className="highlight-price">R$ {businessInsights.suggestedPrice}</strong> e lucrar{' '}
              <strong className="highlight-profit">R$ {businessInsights.profitPerUnit}</strong> por unidade.
            </p>
            <p className="insights-text">
              Em um lote de <strong>{businessInsights.yield} unidades</strong>, seu lucro total seria de{' '}
              <strong className="highlight-profit">R$ {businessInsights.profitPerBatch}</strong>.
            </p>
          </div>
        </section>
      )}

      <section className="page-stack meal-section">
        <header className="meal-section-header">
          <div>
            <h2>Refeições</h2>
            <p className="meal-section-subtitle">
              {stats.completed} de {stats.total} concluídas • {stats.percent}% de progresso
            </p>
          </div>
        </header>

        {showForm ? (
          <div className="meal-form">
            <div className="meal-form-header">
              <h3>{editingId ? 'Editar refeição' : 'Nova refeição'}</h3>
              <button
                type="button"
                className="meal-form-close"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData(initialForm)
                  setShowFabMenu(false)
                }}
                aria-label="Fechar formulário"
              >
                ×
              </button>
            </div>
            <div className="meal-form-row">
              <label>
                <span>Título</span>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Ex.: Avocado toast"
                />
              </label>
              <label>
                <span>Calorias</span>
                <div className="input-with-select">
                  <input
                    type="text"
                    value={formData.calories}
                    onChange={(event) => setFormData((prev) => ({ ...prev, calories: event.target.value }))}
                    placeholder="Ex.: 250"
                  />
                  <select
                    value={formData.caloriesUnit}
                    onChange={(event) => setFormData((prev) => ({ ...prev, caloriesUnit: event.target.value }))}
                    className="unit-select"
                  >
                    <option value="Cal">Cal</option>
                    <option value="Seg">Seg</option>
                    <option value="Min">Min</option>
                    <option value="Hrs">Hrs</option>
                    <option value="KG">KG</option>
                    <option value="G">G</option>
                    <option value="Litro">Litro</option>
                  </select>
                </div>
              </label>
            </div>
            <div className="meal-form-row">
              <label>
                <span>Ingredientes</span>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(event) => setFormData((prev) => ({ ...prev, ingredients: event.target.value }))}
                  placeholder="Ex.: Avocado, Bread, Eggs"
                />
                {getIngredientsList().length > 0 && (
                  <div className="ingredients-chips">
                    {getIngredientsList().map((ingredient, index) => (
                      <span key={index} className="ingredient-chip">
                        {getIngredientEmoji(ingredient)}{capitalizeFirst(ingredient)}
                      </span>
                    ))}
                  </div>
                )}
              </label>
              <label>
                <span>Tempo</span>
                <div className="input-with-select">
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(event) => setFormData((prev) => ({ ...prev, time: event.target.value }))}
                    placeholder="Ex.: 15"
                  />
                  <select
                    value={formData.timeUnit}
                    onChange={(event) => setFormData((prev) => ({ ...prev, timeUnit: event.target.value }))}
                    className="unit-select"
                  >
                    <option value="Seg">Seg</option>
                    <option value="Min">Min</option>
                    <option value="Hrs">Hrs</option>
                    <option value="KG">KG</option>
                    <option value="G">G</option>
                    <option value="Litro">Litro</option>
                  </select>
                </div>
              </label>
              <label>
                <span>Custo (R$)</span>
                <input
                  type="text"
                  value={formData.cost}
                  onChange={(event) => setFormData((prev) => ({ ...prev, cost: event.target.value }))}
                  placeholder="Ex.: 8.20"
                />
              </label>
              <label>
                <span>Status</span>
                <select
                  value={formData.status}
                  onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}
                >
                  <option value="fazer">Fazer</option>
                  <option value="planejado">Planejado</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </label>
            </div>
            <div className="meal-form-actions">
              {editingId && (
                <button
                  type="button"
                  className="delete-meal-btn"
                  onClick={() => {
                    handleDelete(editingId)
                    setShowForm(false)
                    setEditingId(null)
                    setFormData(initialForm)
                    setShowFabMenu(false)
                  }}
                  title="Excluir refeição"
                >
                  <FiTrash2 size={18} />
                </button>
              )}
              <button type="button" className="primary-btn" onClick={handleSubmit}>
                {editingId ? 'Atualizar refeição' : 'Salvar refeição'}
              </button>
            </div>
          </div>
        ) : null}

        <div className="meal-list">
          {meals.map((meal) => (
            <article 
              key={meal.id} 
              className="meal-card"
              onClick={(e) => {
                e.stopPropagation()
                handleEdit(meal)
              }}
            >
              <div className="meal-card-content">
                <header>
                  <h3>{meal.title}</h3>
                  <span className={`status-pill status-${meal.status}`}>{meal.status}</span>
                </header>
                <div className="meal-details">
                  <span className="meal-detail-item">
                    <FiClock size={14} />
                    {meal.time}
                  </span>
                  {meal.cost && (
                    <span className="meal-detail-item">
                      <FiDollarSign size={14} />
                      R$ {parseFloat(meal.cost).toFixed(2)}
                    </span>
                  )}
                  <span className="meal-detail-item">
                    <FiThermometer size={14} />
                    {meal.calories}
                  </span>
                </div>
                <div className="meal-ingredients">
                  <span className="meal-ingredients-label">Ingredientes:</span>
                  <div className="ingredients-chips">
                    {meal.ingredients?.split(',').map((ing, index) => {
                      const trimmedIng = ing.trim()
                      return trimmedIng ? (
                        <span key={index} className="ingredient-chip">
                          {getIngredientEmoji(trimmedIng)}{capitalizeFirst(trimmedIng)}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Floating Action Button */}
      <div className="fab-container">
        {showFabMenu && (
          <div className="fab-menu">
            <button
              type="button"
              className="fab-menu-item"
              onClick={(e) => {
                e.stopPropagation()
                setShowForm(true)
                setShowFabMenu(false)
                setFormData(initialForm)
                setEditingId(null)
              }}
            >
              <FiPlus size={20} />
              <span>Nova refeição</span>
            </button>
          </div>
        )}
        <button
          type="button"
          className={`fab-button ${showFabMenu ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            setShowFabMenu(!showFabMenu)
          }}
          aria-label="Nova refeição"
        >
          <FiPlus size={24} />
        </button>
      </div>
    </div>
  )
}

