import { useMemo, useState } from 'react'
import { useAppStore } from '../stores/appStore'
import { FormModal } from '../components/ui/FormModal'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import './PageCommon.css'
import './CostPage.css'

export function CostPage() {
  const recipes = useAppStore((state) => state.recipes)
  const ingredients = useAppStore((state) => state.ingredients)
  const addRecipe = useAppStore((state) => state.addRecipe)
  const updateRecipe = useAppStore((state) => state.updateRecipe)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formState, setFormState] = useState({
    name: '',
    yield: '',
    prepTime: '',
    recipeIngredients: []
  })

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
      setFormState({
        name: recipe.name,
        yield: recipe.yield.toString(),
        prepTime: recipe.prepTime.toString(),
        recipeIngredients: recipe.ingredients || []
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

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormState({
      name: '',
      yield: '',
      prepTime: '',
      recipeIngredients: []
    })
  }

  const handleAddIngredient = () => {
    setFormState((prev) => ({
      ...prev,
      recipeIngredients: [
        ...prev.recipeIngredients,
        { ingredientId: ingredients[0]?.id || '', quantity: 0 }
      ]
    }))
  }

  const handleUpdateIngredient = (index, field, value) => {
    setFormState((prev) => ({
      ...prev,
      recipeIngredients: prev.recipeIngredients.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
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
      return { totalCost: 0, unitCost: 0, suggestedPrice: 0, suggestedProfit: 0 }
    }

    const totalCost = formState.recipeIngredients.reduce((acc, item) => {
      const ingredient = ingredients.find((ing) => ing.id === item.ingredientId)
      if (!ingredient || !item.quantity) return acc
      return acc + ingredient.unitCost * item.quantity
    }, 0)

    const yieldNum = Number(formState.yield)
    const unitCost = yieldNum > 0 ? totalCost / yieldNum : 0
    const suggestedMargin = 0.45 // Margem padrão de 45%
    const suggestedPrice = unitCost / (1 - suggestedMargin)
    const suggestedProfit = suggestedPrice - unitCost

    return {
      totalCost,
      unitCost,
      suggestedPrice,
      suggestedProfit
    }
  }, [formState.recipeIngredients, formState.yield, ingredients])

  const handleSubmit = () => {
    const yieldNum = Number(formState.yield)
    const prepTimeNum = Number(formState.prepTime)

    if (
      !formState.name.trim() ||
      Number.isNaN(yieldNum) ||
      yieldNum <= 0 ||
      Number.isNaN(prepTimeNum) ||
      prepTimeNum <= 0 ||
      formState.recipeIngredients.length === 0 ||
      calculatedCosts.totalCost <= 0
    ) {
      return
    }

    const recipeData = {
      name: formState.name,
      yield: yieldNum,
      prepTime: prepTimeNum,
      totalCost: calculatedCosts.totalCost,
      unitCost: calculatedCosts.unitCost,
      contributionMargin: 0.45, // Margem padrão
      ingredients: formState.recipeIngredients
    }

    if (editingId) {
      updateRecipe(editingId, recipeData)
    } else {
      addRecipe({
        id: crypto.randomUUID(),
        ...recipeData
      })
    }

    handleCloseModal()
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
        <label className="input-control">
          <span>Nome da receita</span>
          <input
            type="text"
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Ex.: Bolo de Chocolate"
          />
        </label>
        <label className="input-control">
          <span>Rendimento (unidades)</span>
          <input
            type="number"
            value={formState.yield}
            onChange={(event) => setFormState((prev) => ({ ...prev, yield: event.target.value }))}
            placeholder="Ex.: 18"
            min="1"
          />
        </label>
        <label className="input-control">
          <span>Tempo de preparo (minutos)</span>
          <input
            type="number"
            value={formState.prepTime}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, prepTime: event.target.value }))
            }
            placeholder="Ex.: 45"
            min="1"
          />
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
          {formState.recipeIngredients.length === 0 ? (
            <div className="empty-ingredients">Adicione ingredientes para calcular os custos</div>
          ) : (
            <div className="ingredients-list">
              {formState.recipeIngredients.map((item, index) => {
                const ingredient = ingredients.find((ing) => ing.id === item.ingredientId)
                return (
                  <div key={index} className="ingredient-item">
                    <select
                      value={item.ingredientId}
                      onChange={(e) =>
                        handleUpdateIngredient(index, 'ingredientId', e.target.value)
                      }
                      className="ingredient-select"
                    >
                      <option value="">Selecione um ingrediente</option>
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} (R$ {ing.unitCost.toFixed(4)}/un)
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) =>
                        handleUpdateIngredient(index, 'quantity', Number(e.target.value))
                      }
                      placeholder="Quantidade"
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
                )
              })}
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
                <span className="summary-label">Custo unitário</span>
                <span className="summary-value">R$ {calculatedCosts.unitCost.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Lucro sugerido</span>
                <span className="summary-value profit">R$ {calculatedCosts.suggestedProfit.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Preço ideal de venda</span>
                <span className="summary-value price">R$ {calculatedCosts.suggestedPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  )
}
