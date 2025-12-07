import { useMemo, useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/appStore'
import { FormModal } from '../components/ui/FormModal'
import { CurrencyInput } from '../components/ui/CurrencyInput'
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
  const [editingId, setEditingId] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(null) // index do ingrediente com picker aberto
  const [formState, setFormState] = useState({
    name: '',
    yield: '',
    prepTime: '',
    recipeIngredients: []
  })
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
    '🌾', '🌱', '🌿', '🍃', '🍂', '🍁', '🌺', '🌻', '🌷', '🌹'
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
      setFormState({
        name: recipe.name,
        yield: recipe.yield.toString(),
        prepTime: recipe.prepTime.toString(),
        recipeIngredients: convertedIngredients
      })
    } else {
      setEditingId(null)
      setFormState({
        name: '',
        yield: '',
        prepTime: '',
        recipeIngredients: []
      })
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
        setFormState({
          name: recipe.name,
          yield: recipe.yield.toString(),
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
    setEditingId(null)
    setFormErrors({})
    setFormState({
      name: '',
      yield: '',
      prepTime: '',
      recipeIngredients: []
    })
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
    setFormState((prev) => ({
      ...prev,
      recipeIngredients: [
        ...prev.recipeIngredients,
        { emoji: '📦', name: '', packageQty: '', totalValue: '', quantity: '' }
      ]
    }))
  }

  const handleUpdateIngredient = (index, field, value) => {
    setFormState((prev) => {
      const updatedIngredients = prev.recipeIngredients.map((item, i) => {
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
      return {
        ...prev,
        recipeIngredients: updatedIngredients
      }
    })
    // Limpar erro de ingredientes quando atualizar
    if (formErrors.ingredients) {
      setFormErrors((prev) => ({ ...prev, ingredients: '' }))
    }
  }

  const handleRemoveIngredient = (index) => {
    setFormState((prev) => ({
      ...prev,
      recipeIngredients: prev.recipeIngredients.filter((_, i) => i !== index)
    }))
  }

  // Calcular custos automaticamente
  const calculatedCosts = useMemo(() => {
    if (!formState.yield || Number(formState.yield) <= 0) {
      return { totalCost: 0, usageCost: 0, unitCost: 0, suggestedPrice: 0, suggestedProfit: 0 }
    }

    // Custo total (valor total do pacote de cada ingrediente)
    const totalCost = formState.recipeIngredients.reduce((acc, item) => {
      const totalValueStr = String(item.totalValue || '').trim()
      if (!totalValueStr) return acc
      
      const totalValue = Number(totalValueStr)
      if (isNaN(totalValue) || totalValue <= 0) return acc
      return acc + totalValue
    }, 0)

    // Custo de uso (calculado baseado na quantidade usada)
    const usageCost = formState.recipeIngredients.reduce((acc, item) => {
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

    const yieldNum = Number(formState.yield)
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
  }, [formState.recipeIngredients, formState.yield])

  const handleSubmit = () => {
    const yieldNum = Number(formState.yield)
    const prepTimeNum = Number(formState.prepTime)
    const errors = {}

    // Validações
    if (!formState.name.trim()) {
      errors.name = 'Nome da receita é obrigatório'
    }

    if (!formState.yield || Number.isNaN(yieldNum) || yieldNum <= 0) {
      errors.yield = 'Rendimento deve ser um número maior que zero'
    }

    if (!formState.prepTime || Number.isNaN(prepTimeNum) || prepTimeNum <= 0) {
      errors.prepTime = 'Tempo de preparo deve ser um número maior que zero'
    }

    if (formState.recipeIngredients.length === 0) {
      errors.ingredients = 'Adicione pelo menos um ingrediente'
    }

    // Validar ingredientes
    const invalidIngredients = formState.recipeIngredients.filter(
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
      // Scroll para o primeiro erro
      const firstErrorField = Object.keys(errors)[0]
      const errorElement = document.querySelector(`.input-error, .error-message`)
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    // Preparar dados dos ingredientes
    const ingredientsData = formState.recipeIngredients.map((ing) => ({
      emoji: ing.emoji || '📦',
      name: ing.name.trim(),
      packageQty: Number(ing.packageQty) || undefined,
      totalValue: Number(ing.totalValue) || 0,
      quantity: Number(ing.quantity) || 0
    }))

    const recipeData = {
      name: formState.name.trim(),
      yield: yieldNum,
      prepTime: prepTimeNum,
      totalCost: calculatedCosts.totalCost,
      unitCost: calculatedCosts.unitCost,
      contributionMargin: 0.45, // Margem padrão
      ingredients: ingredientsData
    }

    try {
      if (editingId) {
        updateRecipe(editingId, recipeData)
        console.log('Receita atualizada:', recipeData)
      } else {
        const newRecipe = {
          id: crypto.randomUUID(),
          ...recipeData
        }
        addRecipe(newRecipe)
        console.log('Receita adicionada:', newRecipe)
      }

      // Limpar erros e fechar modal
      setFormErrors({})
      handleCloseModal()
    } catch (error) {
      console.error('Erro ao salvar receita:', error)
      setFormErrors({ submit: 'Erro ao salvar receita. Tente novamente.' })
      alert('Erro ao salvar receita. Verifique o console para mais detalhes.')
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
                      <td className="recipe-yield">{recipe.yield} un.</td>
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
        <label className="input-control">
          <span>Rendimento (unidades)</span>
          <input
            type="number"
            value={formState.yield}
            onChange={(event) => {
              setFormState((prev) => ({ ...prev, yield: event.target.value }))
              if (formErrors.yield) setFormErrors((prev) => ({ ...prev, yield: '' }))
            }}
            placeholder="Ex.: 18"
            min="1"
            step="1"
            className={formErrors.yield ? 'input-error' : ''}
          />
          {formErrors.yield && <span className="error-message">{formErrors.yield}</span>}
        </label>
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
          {formState.recipeIngredients.length === 0 ? (
            <div className="empty-ingredients">Adicione ingredientes para calcular os custos</div>
          ) : (
            <div className="ingredients-list">
              {formState.recipeIngredients.map((item, index) => (
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
                        const currentItem = formState.recipeIngredients[index]
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
                  
                  <button
                    type="button"
                    className="remove-ingredient-btn"
                    onClick={() => handleRemoveIngredient(index)}
                  >
                    ✕
                  </button>
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
                <span className="summary-label">Custo total</span>
                <span className="summary-value">R$ {calculatedCosts.totalCost.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Custo de Uso</span>
                <span className="summary-value">R$ {calculatedCosts.usageCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  )
}
