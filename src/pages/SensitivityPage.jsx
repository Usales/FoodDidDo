import { useMemo, useState } from 'react'
import { useAppStore } from '../stores/appStore'
import './PageCommon.css'

export function SensitivityPage() {
  const recipes = useAppStore((state) => state.recipes)
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id ?? null)
  const [ingredientVariation, setIngredientVariation] = useState('10')
  const [marginVariation, setMarginVariation] = useState('5')

  const selectedRecipe = useMemo(() => recipes.find((recipe) => recipe.id === selectedRecipeId), [recipes, selectedRecipeId])
  const ingredientVariationNumber = Number(ingredientVariation) || 0
  const marginVariationNumber = Number(marginVariation) || 0

  const scenario = useMemo(() => {
    if (!selectedRecipe) {
      return {
        newUnitCost: 0,
        suggestedPrice: 0,
        newMargin: 0
      }
    }
    const newUnitCost = selectedRecipe.unitCost * (1 + ingredientVariationNumber / 100)
    const suggestedPrice = selectedRecipe.unitCost * (1 + marginVariationNumber / 100)
    const newMargin = suggestedPrice ? ((suggestedPrice - newUnitCost) / suggestedPrice) * 100 : 0
    return { newUnitCost, suggestedPrice, newMargin }
  }, [ingredientVariationNumber, marginVariationNumber, selectedRecipe])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Sensibilidade</h1>
      </div>

      <section className="page-stack">
        <div className="summary-grid">
          <div className="summary-card">
            <span>Custo atual</span>
            <strong>R$ {selectedRecipe?.unitCost.toFixed(2) ?? '0,00'}</strong>
          </div>
          <div className="summary-card">
            <span>Novo custo unitário</span>
            <strong>R$ {scenario.newUnitCost.toFixed(2)}</strong>
            <small>Variação de {ingredientVariationNumber}%</small>
          </div>
          <div className="summary-card">
            <span>Preço sugerido</span>
            <strong>R$ {scenario.suggestedPrice.toFixed(2)}</strong>
            <small>Ajuste margem {marginVariationNumber}%</small>
          </div>
          <div className="summary-card">
            <span>Nova margem</span>
            <strong>{scenario.newMargin.toFixed(1)}%</strong>
          </div>
        </div>
      </section>

      <section className="page-stack">
        <div className="page-header">
          <h2>Simule cenários</h2>
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
            <span>Variação dos ingredientes (%)</span>
            <input
              type="number"
              value={ingredientVariation}
              min="-50"
              max="200"
              onChange={(event) => setIngredientVariation(event.target.value)}
            />
          </label>
          <label className="input-control">
            <span>Ajuste da margem (%)</span>
            <input type="number" value={marginVariation} min="-20" max="200" onChange={(event) => setMarginVariation(event.target.value)} />
          </label>
        </div>
      </section>

      <section className="page-stack">
        <div className="card-grid">
          <article className="card-tile">
            <header>
              <h3>Impacto na lucratividade</h3>
            </header>
            <div className="divider" />
            <div className="sensitivity-meta">
              <span>
                Cada 1% de aumento no custo reduz a margem em aproximadamente{' '}
                <strong>{(selectedRecipe ? 1 / (1 + selectedRecipe.contributionMargin) : 0).toFixed(2)}%</strong>.
              </span>
              <span>
                Ajuste o preço de venda para manter a margem mínima que cubra seus custos fixos e objetivos de lucro.
              </span>
            </div>
          </article>
          <div className="tip-card">
            <h3>Dicas de sensibilidade</h3>
            <p>
              Crie cenários pessimista, realista e otimista. Planeje as compras conforme o impacto esperado e revise semanalmente os preços para
              proteger a margem.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

