import { useMemo, useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/appStore'
import { FormModal } from '../components/ui/FormModal'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi'
import './PageCommon.css'
import './CostPage.css'

export function CostPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const recipes = useAppStore((state) => state.recipes)
  const ingredients = useAppStore((state) => state.ingredients)
  const addRecipe = useAppStore((state) => state.addRecipe)
  const updateRecipe = useAppStore((state) => state.updateRecipe)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalExpanded, setIsModalExpanded] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(null) // index do ingrediente com picker aberto
  const [formState, setFormState] = useState({
    name: '',
    yield: '',
    yieldQuantity: '',
    yieldWeight: '',
    prepTime: '',
    recipeIngredients: []
  })
  const [editingIngredients, setEditingIngredients] = useState([]) // Ingredientes em edição (lado esquerdo)
  const [confirmedIngredients, setConfirmedIngredients] = useState([]) // Ingredientes confirmados (lado direito)
  const [editingConfirmedIndex, setEditingConfirmedIndex] = useState(null) // Índice do ingrediente confirmado sendo editado
  const [editingConfirmedData, setEditingConfirmedData] = useState(null) // Dados temporários do ingrediente sendo editado
  const [openEmojiPicker, setOpenEmojiPicker] = useState(null) // index do ingrediente com picker aberto
  
  // Emojis comuns para picker
  const commonEmojis = [
    '📦', '🍞', '🥖', '🥐', '🥯', '🥨', '🧀', '🥚', '🥛', '🧈',
    '🍯', '🧂', '🫙', '🥫', '🍅', '🥕', '🧅', '🧄', '🥔', '🌶️',
    '🥬', '🥦', '🥒', '🥑', '🍄', '🌽', '🍋', '🍊', '🍌', '🍎',
    '🍇', '🍓', '🫐', '🥝', '🍉', '🍑', '🥭', '🍍', '🥩', '🍗',
    '🥓', '🌭', '🍖', '🐟', '🦐', '🦑', '🍤', '🥜', '🌰', '🍪',
    '🍰', '🧁', '🍫', '🍬', '🍭', '☕', '🍵', '🧃', '🥤', '🧊',
    '🍶', '🍺', '🍷', '🥂', '🍾', '🧉', '🥄', '🍴', '🍽️', '🥢',
    '🌾', '🌱', '🌿', '🍃', '🍂', '🍁', '🌺'
  ]

  // KPIs calculados
  const kpis = useMemo(() => {
    if (!recipes.length) {
      return {
        unitAverage: 0,
        averageMargin: 0,
        totalInvested: 0,
        averageProfitPerUnit: 0
      }
    }
    const total = recipes.reduce((acc, recipe) => acc + recipe.totalCost, 0)
    const unitAverage = recipes.reduce((acc, recipe) => acc + recipe.unitCost, 0) / recipes.length
    const averageMargin = recipes.reduce((acc, recipe) => acc + recipe.contributionMargin, 0) / recipes.length
    const averageProfitPerUnit = recipes.reduce((acc, recipe) => {
      const profitPerUnit = recipe.unitCost * recipe.contributionMargin
      return acc + profitPerUnit
    }, 0) / recipes.length

    return {
      unitAverage,
      averageMargin,
      totalInvested: total,
      averageProfitPerUnit
    }
  }, [recipes])

  const handleOpenModal = (recipe = null) => {
    if (recipe) {
      setEditingId(recipe.id)
      // Converter ingredientes antigos (com ingredientId) para novo formato (com name, totalValue, quantity)
      const convertedIngredients = (recipe.ingredients || []).map((ing) => {
        if (ing.ingredientId) {
          // Formato antigo: buscar o ingrediente
          const ingredient = ingredients.find((i) => i.id === ing.ingredientId)
          return {
            emoji: ing.emoji || '📦',
            name: ingredient?.name || '',
            packageQty: ingredient?.packageQty?.toString() || '',
            totalValue: ingredient ? (ingredient.unitCost * (ing.quantity || 0)).toString() : '',
            quantity: ing.quantity?.toString() || ''
          }
        }
        // Formato novo: já tem name, totalValue, quantity
        return {
          emoji: ing.emoji || '📦',
          name: ing.name || '',
          packageQty: ing.packageQty?.toString() || '',
          totalValue: ing.totalValue?.toString() || '',
          quantity: ing.quantity?.toString() || ''
        }
      })
      // Separar yield em quantidade e gramatura se houver yieldWeight no recipe
      const yieldStr = recipe.yield.toString()
      const yieldQuantity = recipe.yieldQuantity?.toString() || yieldStr
      const yieldWeight = recipe.yieldWeight?.toString() || ''
      
      setFormState({
        name: recipe.name,
        yield: yieldStr,
        yieldQuantity: yieldQuantity,
        yieldWeight: yieldWeight,
        prepTime: recipe.prepTime.toString(),
        recipeIngredients: convertedIngredients
      })
      setConfirmedIngredients(convertedIngredients)
      setEditingIngredients([])
    } else {
      setEditingId(null)
    setFormState({
      name: '',
      yield: '',
      yieldQuantity: '',
      yieldWeight: '',
      prepTime: '',
      recipeIngredients: []
    })
      setConfirmedIngredients([])
      setEditingIngredients([])
    }
    setIsModalOpen(true)
  }

  // Abrir modal automaticamente se vier navegação do simulador
  useEffect(() => {
    const editRecipeId = location.state?.editRecipeId
    if (editRecipeId && !isModalOpen) {
      const recipe = recipes.find((r) => r.id === editRecipeId)
      if (recipe) {
        setEditingId(recipe.id)
        // Converter ingredientes antigos (com ingredientId) para novo formato (com name, totalValue, quantity)
        const convertedIngredients = (recipe.ingredients || []).map((ing) => {
          if (ing.ingredientId) {
            // Formato antigo: buscar o ingrediente
            const ingredient = ingredients.find((i) => i.id === ing.ingredientId)
            return {
              emoji: ing.emoji || '📦',
              name: ingredient?.name || '',
              packageQty: ingredient?.packageQty?.toString() || '',
              totalValue: ingredient ? (ingredient.unitCost * (ing.quantity || 0)).toString() : '',
              quantity: ing.quantity?.toString() || ''
            }
          }
          // Formato novo: já tem name, totalValue, quantity
          return {
            emoji: ing.emoji || '📦',
            name: ing.name || '',
            packageQty: ing.packageQty?.toString() || '',
            totalValue: ing.totalValue?.toString() || '',
            quantity: ing.quantity?.toString() || ''
          }
        })
        // Separar yield em quantidade e gramatura se houver yieldWeight no recipe
        const yieldStr = recipe.yield.toString()
        const yieldQuantity = recipe.yieldQuantity?.toString() || yieldStr
        const yieldWeight = recipe.yieldWeight?.toString() || ''
        
        setFormState({
          name: recipe.name,
          yield: yieldStr,
          yieldQuantity: yieldQuantity,
          yieldWeight: yieldWeight,
          prepTime: recipe.prepTime.toString(),
          recipeIngredients: convertedIngredients
        })
        setIsModalOpen(true)
        // Limpar o state para não abrir novamente
        window.history.replaceState({}, document.title)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.editRecipeId, recipes])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setIsModalExpanded(false)
    setEditingId(null)
    setFormErrors({})
    setFormState({
      name: '',
      yield: '',
      yieldQuantity: '',
      yieldWeight: '',
      prepTime: '',
      recipeIngredients: []
    })
    setEditingIngredients([])
    setConfirmedIngredients([])
    setEditingConfirmedIndex(null)
    setEditingConfirmedData(null)
    setOpenEmojiPicker(null)
    
    // Se veio do simulador, voltar para lá ao cancelar
    if (location.state?.editRecipeId) {
      navigate('/simulador')
    }
  }

  // Fechar picker de emoji ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openEmojiPicker !== null && !event.target.closest('.ingredient-emoji-picker')) {
        setOpenEmojiPicker(null)
      }
    }

    if (openEmojiPicker !== null) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openEmojiPicker])

  const handleAddIngredient = () => {
    setEditingIngredients((prev) => [
      ...prev,
      { emoji: '📦', name: '', packageQty: '', totalValue: '', quantity: '' }
    ])
  }

  const handleConfirmIngredient = (index) => {
    const ingredient = editingIngredients[index]
    // Validar se o ingrediente tem nome
    if (!ingredient.name || ingredient.name.trim() === '') {
      setFormErrors((prev) => ({
        ...prev,
        ingredients: 'O nome do ingrediente é obrigatório'
      }))
      return
    }
    // Mover da lista de edição para a lista de confirmados
    setConfirmedIngredients((prev) => [...prev, ingredient])
    setEditingIngredients((prev) => prev.filter((_, i) => i !== index))
    setOpenEmojiPicker(null)
    setIsModalExpanded(true)
    // Limpar erro de ingredientes se houver
    if (formErrors.ingredients) {
      setFormErrors((prev) => ({ ...prev, ingredients: '' }))
    }
  }

  const handleUpdateIngredient = (index, field, value) => {
    setEditingIngredients((prev) => {
      const updatedIngredients = prev.map((item, i) => {
        if (i === index) {
          const updated = { ...item, [field]: value }
          
          // Se atualizou o nome, verificar se corresponde a um ingrediente cadastrado
          if (field === 'name') {
            const foundIngredient = ingredients.find(
              (ing) => ing.name.toLowerCase() === value.toLowerCase().trim()
            )
            if (foundIngredient) {
              // Se encontrou ingrediente, preencher quantidade original do pacote
              updated.packageQty = foundIngredient.packageQty?.toString() || ''
              // Se tem quantidade usada, calcular valor total
              if (updated.quantity) {
                const quantity = Number(updated.quantity) || 0
                updated.totalValue = (foundIngredient.unitCost * quantity).toFixed(2)
              }
              // Normalizar o nome para o nome exato do ingrediente cadastrado
              updated.name = foundIngredient.name
            }
          }
          
          // Se atualizou a quantidade original do pacote, não precisa recalcular
          
          // Se atualizou a quantidade usada e tem um ingrediente cadastrado, recalcular valor total
          if (field === 'quantity') {
            const foundIngredient = ingredients.find(
              (ing) => ing.name.toLowerCase() === (updated.name || '').toLowerCase().trim()
            )
            if (foundIngredient) {
              const quantity = Number(value) || 0
              updated.totalValue = (foundIngredient.unitCost * quantity).toFixed(2)
            }
          }
          
          return updated
        }
        return item
      })
      return updatedIngredients
    })
    // Limpar erro de ingredientes quando atualizar
    if (formErrors.ingredients) {
      setFormErrors((prev) => ({ ...prev, ingredients: '' }))
    }
  }

  const handleRemoveIngredient = (index) => {
    setEditingIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  const handleEditConfirmedIngredient = (index) => {
    const ingredient = confirmedIngredients[index]
    setEditingConfirmedIndex(index)
    setEditingConfirmedData({ ...ingredient })
  }

  const handleSaveConfirmedIngredient = (index) => {
    if (!editingConfirmedData || !editingConfirmedData.name || editingConfirmedData.name.trim() === '') {
      return
    }
    setConfirmedIngredients((prev) => {
      const updated = [...prev]
      updated[index] = editingConfirmedData
      return updated
    })
    setEditingConfirmedIndex(null)
    setEditingConfirmedData(null)
  }

  const handleCancelEditConfirmed = () => {
    setEditingConfirmedIndex(null)
    setEditingConfirmedData(null)
  }

  const handleDeleteConfirmedIngredient = (index) => {
    setConfirmedIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpdateConfirmedIngredient = (field, value) => {
    setEditingConfirmedData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  // Calcular custos automaticamente
  const calculatedCosts = useMemo(() => {
    // Usar yieldQuantity se disponível, senão usar yield
    const yieldValue = formState.yieldQuantity || formState.yield
    if (!yieldValue || Number(yieldValue) <= 0) {
      return { totalCost: 0, usageCost: 0, unitCost: 0, suggestedPrice: 0, suggestedProfit: 0 }
    }

    // Usar ingredientes confirmados para calcular custos
    const allIngredients = [...confirmedIngredients]

    // Custo total (valor total do pacote de cada ingrediente)
    const totalCost = allIngredients.reduce((acc, item) => {
      const totalValueStr = String(item.totalValue || '').trim()
      if (!totalValueStr) return acc
      
      const totalValue = Number(totalValueStr)
      if (isNaN(totalValue) || totalValue <= 0) return acc
      return acc + totalValue
    }, 0)

    // Custo de uso (calculado baseado na quantidade usada)
    const usageCost = allIngredients.reduce((acc, item) => {
      const packageQty = Number(item.packageQty || 0)
      const totalValue = Number(item.totalValue || 0)
      const quantityUsed = Number(item.quantity || 0)
      
      // Se não tem quantidade original ou valor total, não calcular
      if (packageQty <= 0 || totalValue <= 0 || quantityUsed <= 0) return acc
      
      // Preço por unidade (grama/ml/un) = valor total / quantidade original
      const pricePerUnit = totalValue / packageQty
      
      // Custo de uso = preço por unidade × quantidade usada
      const costOfUsage = pricePerUnit * quantityUsed
      
      return acc + costOfUsage
    }, 0)

    const yieldNum = Number(yieldValue)
    // Calcular custo unitário com mais precisão
    const unitCost = yieldNum > 0 ? usageCost / yieldNum : 0
    const suggestedMargin = 0.45 // Margem padrão de 45%
    const suggestedPrice = unitCost > 0 ? unitCost / (1 - suggestedMargin) : 0
    const suggestedProfit = suggestedPrice - unitCost

    return {
      totalCost: Number(totalCost.toFixed(2)),
      usageCost: Number(usageCost.toFixed(2)),
      unitCost: Number(unitCost.toFixed(4)), // Mais precisão no custo unitário
      suggestedPrice: Number(suggestedPrice.toFixed(2)),
      suggestedProfit: Number(suggestedProfit.toFixed(2))
    }
  }, [confirmedIngredients, formState.yield, formState.yieldQuantity])

  const handleSubmit = async () => {
    // Usar yieldQuantity se disponível, senão usar yield
    const yieldValue = formState.yieldQuantity || formState.yield
    const yieldNum = Number(yieldValue)
    const prepTimeNum = Number(formState.prepTime)
    const errors = {}

    // Validações
    if (!formState.name.trim()) {
      errors.name = 'Nome da receita é obrigatório'
    }

    if (!yieldValue || Number.isNaN(yieldNum) || yieldNum <= 0) {
      errors.yield = 'Quantidade de rendimento deve ser um número maior que zero'
    }

    if (!formState.prepTime || Number.isNaN(prepTimeNum) || prepTimeNum <= 0) {
      errors.prepTime = 'Tempo de preparo deve ser um número maior que zero'
    }

    if (confirmedIngredients.length === 0) {
      errors.ingredients = 'Adicione pelo menos um ingrediente'
    }

    // Validar ingredientes
    const invalidIngredients = confirmedIngredients.filter(
      (ing) => {
        const nameValid = ing.name?.trim()
        const totalValueStr = String(ing.totalValue || '').trim()
        const totalValue = totalValueStr ? Number(totalValueStr) : 0
        return !nameValid || !totalValueStr || isNaN(totalValue) || totalValue <= 0
      }
    )

    if (invalidIngredients.length > 0) {
      errors.ingredients = `Preencha todos os ingredientes com nome e valor total válidos (${invalidIngredients.length} inválido${invalidIngredients.length > 1 ? 's' : ''})`
    }

    if (calculatedCosts.totalCost <= 0) {
      errors.cost = 'O custo total deve ser maior que zero'
    }

    setFormErrors(errors)

    // Se houver erros, não submeter e mostrar feedback
    if (Object.keys(errors).length > 0) {
      console.log('Erros de validação:', errors)
      // Scroll para o primeiro erro
      const firstErrorField = Object.keys(errors)[0]
      const errorElement = document.querySelector(`.input-error, .error-message`)
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      // Mostrar alerta se houver erro de ingredientes
      if (errors.ingredients) {
        alert(errors.ingredients)
      }
      return
    }

    // Preparar dados dos ingredientes
    const ingredientsData = confirmedIngredients.map((ing) => ({
      emoji: ing.emoji || '📦',
      name: ing.name.trim(),
      packageQty: Number(ing.packageQty) || undefined,
      totalValue: Number(ing.totalValue) || 0,
      quantity: Number(ing.quantity) || 0
    }))

    const recipeData = {
      name: formState.name.trim(),
      yield: yieldNum,
      yieldQuantity: formState.yieldQuantity ? Number(formState.yieldQuantity) : undefined,
      yieldWeight: formState.yieldWeight ? Number(formState.yieldWeight) : undefined,
      prepTime: prepTimeNum,
      totalCost: calculatedCosts.totalCost,
      unitCost: calculatedCosts.unitCost,
      contributionMargin: 0.45, // Margem padrão
      ingredients: ingredientsData
    }

    try {
      console.log('Salvando receita com dados:', recipeData)
      console.log('Ingredientes confirmados:', confirmedIngredients)
      
      if (editingId) {
        await updateRecipe(editingId, recipeData)
        console.log('Receita atualizada:', recipeData)
      } else {
        const newRecipe = {
          id: crypto.randomUUID(),
          ...recipeData
        }
        await addRecipe(newRecipe)
        console.log('Receita adicionada:', newRecipe)
      }

      // Limpar erros e fechar modal
      setFormErrors({})
      handleCloseModal()
      
      // Mostrar feedback de sucesso
      alert(editingId ? 'Receita atualizada com sucesso!' : 'Receita adicionada com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar receita:', error)
      setFormErrors({ submit: 'Erro ao salvar receita. Tente novamente.' })
      alert(`Erro ao salvar receita: ${error.message || 'Verifique o console para mais detalhes.'}`)
    }
  }

  const getMarginColor = (margin) => {
    if (margin >= 0.4) return 'var(--success)'
    if (margin >= 0.25) return 'var(--warning)'
    return 'var(--error)'
  }

  return (
    <div className="page cost-page">
      <section className="page-stack">
        <div className="kpi-grid">
          <div className="kpi-card kpi-card-primary">
            <div className="kpi-label">Custo unitário médio</div>
            <div className="kpi-value">R$ {kpis.unitAverage.toFixed(2)}</div>
            <div className="kpi-subtitle">Por unidade produzida</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Margem média / Lucro por unidade</div>
            <div className="kpi-value">R$ {kpis.averageProfitPerUnit.toFixed(2)}</div>
            <div className="kpi-subtitle">{(kpis.averageMargin * 100).toFixed(1)}% de margem</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Total investido até agora</div>
            <div className="kpi-value">R$ {kpis.totalInvested.toFixed(2)}</div>
            <div className="kpi-subtitle">Em todas as receitas</div>
          </div>
        </div>
      </section>

      <section className="page-stack">
        <div className="page-header">
          <h2>Custos por ficha técnica</h2>
          <button className="primary-btn" type="button" onClick={() => handleOpenModal()}>
            Adicionar
          </button>
        </div>
        {recipes.length === 0 ? (
          <div className="empty-state">Cadastre receitas para visualizar os custos.</div>
        ) : (
          <div className="recipes-table-container">
            <table className="recipes-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Custo unitário</th>
                  <th>Rendimento</th>
                  <th>Margem %</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe) => {
                  const marginPercent = (recipe.contributionMargin * 100).toFixed(1)
                  return (
                    <tr key={recipe.id}>
                      <td className="recipe-name">{recipe.name}</td>
                      <td className="recipe-cost">R$ {recipe.unitCost.toFixed(2)}</td>
                      <td className="recipe-yield">
                        {recipe.yieldQuantity || recipe.yield} {recipe.yieldWeight ? `(${recipe.yieldWeight}g)` : 'un.'}
                      </td>
                      <td>
                        <span
                          className="margin-badge"
                          style={{ color: getMarginColor(recipe.contributionMargin) }}
                        >
                          {marginPercent}%
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() => handleOpenModal(recipe)}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <FormModal
        isOpen={isModalOpen}
        isExpanded={isModalExpanded}
        title={editingId ? 'Editar receita' : 'Adicionar receita'}
        description={
          editingId
            ? 'Atualize as informações da receita.'
            : 'Cadastre uma nova receita adicionando ingredientes e quantidades.'
        }
        onClose={handleCloseModal}
        footer={
          <>
            <button className="ghost-btn" type="button" onClick={handleCloseModal}>
              Cancelar
            </button>
            <button className="primary-btn" type="button" onClick={handleSubmit}>
              {editingId ? 'Atualizar' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className={`modal-content-wrapper ${isModalExpanded ? 'modal-content-expanded' : ''}`}>
          <div className="modal-form-column">
            {formErrors.submit && (
              <div className="error-message" style={{ 
                display: 'block', 
                marginBottom: '1rem', 
                padding: '0.75rem', 
                background: 'rgba(220, 38, 38, 0.1)', 
                border: '1px solid rgba(220, 38, 38, 0.3)', 
                borderRadius: '8px' 
              }}>
                {formErrors.submit}
              </div>
            )}
            <label className="input-control">
              <span>Nome da receita</span>
              <input
                type="text"
                value={formState.name}
                onChange={(event) => {
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                  if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: '' }))
                }}
                placeholder="Ex.: Bolo de Chocolate"
                className={formErrors.name ? 'input-error' : ''}
              />
              {formErrors.name && <span className="error-message">{formErrors.name}</span>}
            </label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <label className="input-control" style={{ flex: '1', minWidth: '200px' }}>
                <span>Quantidade (unidades)</span>
                <input
                  type="number"
                  value={formState.yieldQuantity}
                  onChange={(event) => {
                    const value = event.target.value
                    setFormState((prev) => ({ 
                      ...prev, 
                      yieldQuantity: value,
                      yield: value // Manter yield para compatibilidade
                    }))
                    if (formErrors.yield) setFormErrors((prev) => ({ ...prev, yield: '' }))
                  }}
                  placeholder="Ex.: 1 ou 4"
                  min="1"
                  step="1"
                  className={formErrors.yield ? 'input-error' : ''}
                />
                {formErrors.yield && <span className="error-message">{formErrors.yield}</span>}
              </label>
              <label className="input-control" style={{ flex: '1', minWidth: '200px' }}>
                <span>Gramatura (g)</span>
                <input
                  type="number"
                  value={formState.yieldWeight}
                  onChange={(event) => {
                    setFormState((prev) => ({ ...prev, yieldWeight: event.target.value }))
                  }}
                  placeholder="Ex.: 400 ou 100"
                  min="0"
                  step="1"
                />
              </label>
            </div>
            <label className="input-control">
              <span>Tempo de preparo (minutos)</span>
              <input
                type="number"
                value={formState.prepTime}
                onChange={(event) => {
                  setFormState((prev) => ({ ...prev, prepTime: event.target.value }))
                  if (formErrors.prepTime) setFormErrors((prev) => ({ ...prev, prepTime: '' }))
                }}
                placeholder="Ex.: 45"
                min="1"
                step="1"
                className={formErrors.prepTime ? 'input-error' : ''}
              />
              {formErrors.prepTime && <span className="error-message">{formErrors.prepTime}</span>}
            </label>

            <div className="ingredients-section">
              <div className="ingredients-header">
                <span className="ingredients-label">Ingredientes</span>
                <button
                  type="button"
                  className="add-ingredient-btn"
                  onClick={handleAddIngredient}
                >
                  + Adicionar ingrediente
                </button>
              </div>
              {formErrors.ingredients && (
                <span className="error-message" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  {formErrors.ingredients}
                </span>
              )}
              {formErrors.cost && (
                <span className="error-message" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  {formErrors.cost}
                </span>
              )}
              {editingIngredients.length === 0 ? (
                <div className="empty-ingredients">Adicione ingredientes para calcular os custos</div>
              ) : (
                <div className="ingredients-list">
                  {editingIngredients.map((item, index) => (
                    <div key={index} className="ingredient-item">
                      {/* Emoji picker */}
                      <div className="ingredient-emoji-wrapper">
                        <div className="ingredient-emoji-picker" style={{ position: 'relative' }}>
                          <button
                            type="button"
                            className="ingredient-emoji-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenEmojiPicker(openEmojiPicker === index ? null : index)
                            }}
                          >
                            {item.emoji || '📦'}
                          </button>
                          {openEmojiPicker === index && (
                            <div 
                              className="emoji-picker-dropdown"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="emoji-picker-grid">
                                {commonEmojis.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    className="emoji-option"
                                    onClick={() => {
                                      handleUpdateIngredient(index, 'emoji', emoji)
                                      setOpenEmojiPicker(null)
                                    }}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Linha 1: Nome do ingrediente (ocupa 2 colunas) */}
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) =>
                          handleUpdateIngredient(index, 'name', e.target.value)
                        }
                        placeholder="Nome do ingrediente"
                        className="ingredient-name"
                      />
                      
                      {/* Linha 2: Qtd. original do pacote | Valor total */}
                      <input
                        type="number"
                        value={item.packageQty || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          handleUpdateIngredient(index, 'packageQty', value)
                        }}
                        onBlur={(e) => {
                          const value = e.target.value
                          if (value && (isNaN(Number(value)) || Number(value) < 0)) {
                            handleUpdateIngredient(index, 'packageQty', '')
                          }
                        }}
                        placeholder="Qtd. original do pacote"
                        min="0"
                        step="0.01"
                        className="ingredient-package-qty"
                      />
                      
                      <input
                        type="number"
                        value={item.totalValue || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          handleUpdateIngredient(index, 'totalValue', value)
                        }}
                        onBlur={(e) => {
                          // Garantir que o valor seja válido ao sair do campo
                          const value = e.target.value
                          if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
                            handleUpdateIngredient(index, 'totalValue', '')
                          }
                        }}
                        placeholder="Valor total (R$)"
                        min="0"
                        step="0.01"
                        className="ingredient-value"
                      />
                      
                      {/* Linha 3: Mg/Ml usados | Botão excluir */}
                      <input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          handleUpdateIngredient(index, 'quantity', value)
                        }}
                        onBlur={(e) => {
                          // Garantir que o valor seja válido ao sair do campo
                          const value = e.target.value
                          if (value && (isNaN(Number(value)) || Number(value) < 0)) {
                            handleUpdateIngredient(index, 'quantity', '')
                          } else {
                            // Recalcular valor total quando sair do campo de quantidade
                            const currentItem = editingIngredients[index]
                            if (currentItem && currentItem.name) {
                              const foundIngredient = ingredients.find(
                                (ing) => ing.name.toLowerCase() === currentItem.name.toLowerCase().trim()
                              )
                              if (foundIngredient && value) {
                                const quantity = Number(value) || 0
                                handleUpdateIngredient(index, 'totalValue', (foundIngredient.unitCost * quantity).toFixed(2))
                              }
                            }
                          }
                        }}
                        placeholder="Mg/Ml usados"
                        min="0"
                        step="0.01"
                        className="ingredient-quantity"
                      />
                      
                      <div className="ingredient-action-buttons">
                        <button
                          type="button"
                          className="cancel-ingredient-btn"
                          onClick={() => handleRemoveIngredient(index)}
                          title="Cancelar adição"
                        >
                          ✕
                        </button>
                        <button
                          type="button"
                          className="confirm-ingredient-btn"
                          onClick={() => handleConfirmIngredient(index)}
                          title="Confirmar ingrediente"
                        >
                          ✓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {isModalExpanded && (
            <div className="modal-ingredients-column">
              <div className="ingredients-list-view">
                <h3>Ingredientes Adicionados</h3>
                {confirmedIngredients.length === 0 ? (
                  <div className="empty-ingredients">Nenhum ingrediente adicionado</div>
                ) : (
                  <div className="ingredients-list-display">
                    {confirmedIngredients.map((item, index) => (
                      <div key={index} className="ingredient-display-item">
                        {editingConfirmedIndex === index ? (
                          // Modo de edição
                          <div className="ingredient-edit-form">
                            <input
                              type="text"
                              value={editingConfirmedData?.name || ''}
                              onChange={(e) => handleUpdateConfirmedIngredient('name', e.target.value)}
                              placeholder="Nome do ingrediente"
                              className="ingredient-edit-input"
                            />
                            <input
                              type="number"
                              value={editingConfirmedData?.packageQty || ''}
                              onChange={(e) => handleUpdateConfirmedIngredient('packageQty', e.target.value)}
                              placeholder="Qtd. pacote"
                              className="ingredient-edit-input"
                              min="0"
                              step="0.01"
                            />
                            <input
                              type="number"
                              value={editingConfirmedData?.quantity || ''}
                              onChange={(e) => handleUpdateConfirmedIngredient('quantity', e.target.value)}
                              placeholder="Qtd. usada"
                              className="ingredient-edit-input"
                              min="0"
                              step="0.01"
                            />
                            <input
                              type="number"
                              value={editingConfirmedData?.totalValue || ''}
                              onChange={(e) => handleUpdateConfirmedIngredient('totalValue', e.target.value)}
                              placeholder="Valor total"
                              className="ingredient-edit-input"
                              min="0"
                              step="0.01"
                            />
                            <div className="ingredient-edit-actions">
                              <button
                                type="button"
                                className="ingredient-save-btn"
                                onClick={() => handleSaveConfirmedIngredient(index)}
                                title="Salvar"
                              >
                                <FiCheck />
                              </button>
                              <button
                                type="button"
                                className="ingredient-cancel-btn"
                                onClick={handleCancelEditConfirmed}
                                title="Cancelar"
                              >
                                <FiX />
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Modo de visualização
                          <>
                            <span className="ingredient-emoji-display">{item.emoji || '📦'}</span>
                            <div className="ingredient-info">
                              <div className="ingredient-name-display">{item.name || 'Sem nome'}</div>
                              <div className="ingredient-details">
                                {item.packageQty && <span>Pacote: {item.packageQty}</span>}
                                {item.quantity && <span>Qtd: {item.quantity}</span>}
                                {item.totalValue && <span>Valor: R$ {Number(item.totalValue).toFixed(2)}</span>}
                              </div>
                            </div>
                            <div className="ingredient-display-actions">
                              <button
                                type="button"
                                className="ingredient-edit-btn"
                                onClick={() => handleEditConfirmedIngredient(index)}
                                title="Editar"
                              >
                                <FiEdit2 />
                              </button>
                              <button
                                type="button"
                                className="ingredient-delete-btn"
                                onClick={() => handleDeleteConfirmedIngredient(index)}
                                title="Excluir"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {calculatedCosts.totalCost > 0 && (
                <div className="cost-summary">
                  <h4>Resumo automático</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="summary-label">Custo Total em Produtos</span>
                      <span className="summary-value">R$ {calculatedCosts.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Custo de Uso</span>
                      <span className="summary-value">R$ {calculatedCosts.usageCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </FormModal>
    </div>
  )
}
