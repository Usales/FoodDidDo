import { useMemo, useState } from 'react'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { useAppStore } from '../stores/appStore'
import './PageCommon.css'

export function ProfitabilityPage() {
  const recipes = useAppStore((state) => state.recipes)
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id ?? null)
  const [price, setPrice] = useState('6')

  const selectedRecipe = useMemo(() => recipes.find((recipe) => recipe.id === selectedRecipeId), [recipes, selectedRecipeId])
  const priceNumber = Number(price) || 0

  const metrics = useMemo(() => {
    if (!selectedRecipe) {
      return {
        unitCost: 0,
        grossProfit: 0,
        margin: 0,
        batchProfit: 0
      }
    }
    const unitCost = selectedRecipe.unitCost
    const grossProfit = priceNumber - unitCost
    const margin = priceNumber ? (grossProfit / priceNumber) * 100 : 0
    const batchProfit = grossProfit * selectedRecipe.yield
    return { unitCost, grossProfit, margin, batchProfit }
  }, [priceNumber, selectedRecipe])

  return (
    <div className="page">
      <section className="page-stack">
        <div className="summary-grid">
          <div className="summary-card">
            <span>Custo unitário</span>
            <strong>R$ {metrics.unitCost.toFixed(2)}</strong>
            <small>{selectedRecipe?.name ?? 'Selecione uma receita'}</small>
          </div>
          <div className="summary-card">
            <span>Lucro por unidade</span>
            <strong>R$ {metrics.grossProfit.toFixed(2)}</strong>
          </div>
          <div className="summary-card">
            <span>Margem de contribuição</span>
            <strong>{metrics.margin.toFixed(1)}%</strong>
          </div>
          <div className="summary-card">
            <span>Lucro por lote</span>
            <strong>R$ {metrics.batchProfit.toFixed(2)}</strong>
          </div>
        </div>
      </section>

      <section className="page-stack">
        <div className="page-header">
          <h2>Calcular margem</h2>
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
          <CurrencyInput label="Preço de venda" value={price} onChange={setPrice} />
        </div>
      </section>

      <section className="page-stack">
        <h2>Resumo financeiro</h2>
        <div className="card-grid">
          <article className="card-tile">
            <header>
              <h3>Composição custo x lucro</h3>
            </header>
            <div className="divider" />
            <div className="profit-meta">
              <span>
                Custo representa <strong>{selectedRecipe ? Math.min(100, Math.max(0, 100 - metrics.margin)).toFixed(1) : '0'}%</strong> do preço definido.
              </span>
              <span>
                Lucro representa <strong>{metrics.margin.toFixed(1)}%</strong> do preço de venda informado.
              </span>
            </div>
          </article>
          <div className="tip-card">
            <h3>Dica de margem</h3>
            <p>
              Margem = (Preço de venda - Custo unitário) ÷ Preço de venda. Mantenha a margem acima de 30% para cobrir custos fixos e atingir o lucro
              desejado.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

