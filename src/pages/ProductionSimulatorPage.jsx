import { useMemo, useState } from 'react'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { useAppStore } from '../stores/appStore'
import './PageCommon.css'

export function ProductionSimulatorPage() {
  const recipes = useAppStore((state) => state.recipes)
  const [budget, setBudget] = useState('500')

  const budgetNumber = Number(budget) || 0

  const scenarios = useMemo(() => {
    if (!recipes.length || budgetNumber <= 0) return []
    return recipes.map((recipe) => {
      const maxUnits = Math.floor(budgetNumber / recipe.unitCost)
      const estimatedRevenue = maxUnits * recipe.unitCost * (1 + recipe.contributionMargin)
      const estimatedProfit = estimatedRevenue - maxUnits * recipe.unitCost
      return {
        id: recipe.id,
        recipeName: recipe.name,
        maxUnits,
        estimatedRevenue,
        estimatedProfit
      }
    })
  }, [budgetNumber, recipes])

  const totals = useMemo(() => {
    return scenarios.reduce(
      (acc, scenario) => ({
        revenue: acc.revenue + scenario.estimatedRevenue,
        profit: acc.profit + scenario.estimatedProfit,
        units: acc.units + scenario.maxUnits
      }),
      { revenue: 0, profit: 0, units: 0 }
    )
  }, [scenarios])

  return (
    <div className="page">
      <section className="page-stack">
        <div className="summary-grid">
          <div className="summary-card">
            <span>Orçamento disponível</span>
            <strong>R$ {budgetNumber.toFixed(2)}</strong>
          </div>
          <div className="summary-card">
            <span>Receita estimada</span>
            <strong>R$ {totals.revenue.toFixed(2)}</strong>
          </div>
          <div className="summary-card">
            <span>Lucro potencial</span>
            <strong>R$ {totals.profit.toFixed(2)}</strong>
          </div>
          <div className="summary-card">
            <span>Unidades totais sugeridas</span>
            <strong>{totals.units}</strong>
          </div>
        </div>
      </section>

      <section className="page-stack">
        <div className="page-header">
          <h2>Monte o plano de produção</h2>
        </div>
        <CurrencyInput label="Orçamento disponível" value={budget} onChange={setBudget} />
        <div className="card-grid">
          {scenarios.map((scenario) => (
            <article key={scenario.id} className="card-tile">
              <header>
                <h3>{scenario.recipeName}</h3>
                <span className="pill">{scenario.maxUnits} unidades</span>
              </header>
              <div className="divider" />
              <div className="production-meta">
                <span>Receita estimada: <strong>R$ {scenario.estimatedRevenue.toFixed(2)}</strong></span>
                <span>Lucro estimado: <strong>R$ {scenario.estimatedProfit.toFixed(2)}</strong></span>
              </div>
            </article>
          ))}
          {scenarios.length === 0 ? <div className="card-tile">Informe um orçamento válido para gerar combinações.</div> : null}
        </div>
      </section>
    </div>
  )
}

