import { useMemo, useState } from 'react'
import { useAppStore } from '../stores/appStore'
import './PageCommon.css'

export function PricingPage() {
  const recipes = useAppStore((state) => state.recipes)
  const pricingHistory = useAppStore((state) => state.pricing)
  const addPricing = useAppStore((state) => state.addPricing)

  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id ?? null)
  const [desiredMargin, setDesiredMargin] = useState('50')

  const selectedRecipe = useMemo(() => recipes.find((recipe) => recipe.id === selectedRecipeId), [recipes, selectedRecipeId])
  const desiredMarginNumber = Number(desiredMargin) || 0

  const suggestedPrice = useMemo(() => {
    if (!selectedRecipe) return 0
    return selectedRecipe.unitCost * (1 + desiredMarginNumber / 100)
  }, [desiredMarginNumber, selectedRecipe])

  const handleSavePricing = () => {
    if (!selectedRecipe) return
    addPricing({
      id: crypto.randomUUID(),
      recipeId: selectedRecipe.id,
      desiredMargin: desiredMarginNumber / 100,
      suggestedPrice,
      currentPrice: suggestedPrice
    })
  }

  return (
    <div className="page">
      <section className="page-stack">
        <div className="summary-grid">
          <div className="summary-card">
            <span>Preço sugerido</span>
            <strong>R$ {suggestedPrice.toFixed(2)}</strong>
          </div>
          <div className="summary-card">
            <span>Custo unitário</span>
            <strong>R$ {selectedRecipe?.unitCost.toFixed(2) ?? '0,00'}</strong>
            <small>{selectedRecipe?.name ?? 'Selecione uma receita'}</small>
          </div>
          <div className="summary-card">
            <span>Margem desejada</span>
            <strong>{desiredMarginNumber.toFixed(0)}%</strong>
          </div>
        </div>
      </section>

      <section className="page-stack">
        <div className="page-header">
          <h2>Formação de preço</h2>
        </div>
        <div className="page-grid">
          <label className="input-control">
            <span>Receita</span>
            <select value={selectedRecipeId ?? ''} onChange={(event) => setSelectedRecipeId(event.target.value)}>
              {recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name}
                </option>
              ))}
            </select>
          </label>
          <label className="input-control">
            <span>Margem desejada (%)</span>
            <input
              type="number"
              value={desiredMargin}
              onChange={(event) => setDesiredMargin(event.target.value)}
              min="0"
              step="1"
              placeholder="Ex.: 50"
            />
          </label>
        </div>
        <button className="primary-btn" type="button" onClick={handleSavePricing}>
          Salvar sugestão
        </button>
      </section>

      <section className="page-stack">
        <div className="page-header">
          <h2>Histórico de sugestões</h2>
        </div>
        <div className="card-grid">
          {pricingHistory.map((entry) => {
            const recipeName = recipes.find((recipe) => recipe.id === entry.recipeId)?.name ?? 'Receita removida'
            return (
              <article key={entry.id} className="card-tile">
                <header>
                  <h3>{recipeName}</h3>
                  <span className="pill">{(entry.desiredMargin * 100).toFixed(0)}%</span>
                </header>
                <div className="divider" />
                <div className="pricing-meta">
                  <span>Preço sugerido: <strong>R$ {entry.suggestedPrice.toFixed(2)}</strong></span>
                  <span>Preço atual: <strong>R$ {entry.currentPrice.toFixed(2)}</strong></span>
                </div>
              </article>
            )
          })}
          {pricingHistory.length === 0 ? <div className="card-tile">Nenhuma sugestão registrada.</div> : null}
        </div>
      </section>
    </div>
  )
}

