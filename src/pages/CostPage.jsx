import { useMemo } from 'react'
import { useAppStore } from '../stores/appStore'
import './PageCommon.css'

export function CostPage() {
  const recipes = useAppStore((state) => state.recipes)

  const summary = useMemo(() => {
    if (!recipes.length) {
      return { total: 0, unitAverage: 0 }
    }
    const total = recipes.reduce((acc, recipe) => acc + recipe.totalCost, 0)
    const unitAverage = recipes.reduce((acc, recipe) => acc + recipe.unitCost, 0) / recipes.length
    return { total, unitAverage }
  }, [recipes])

  return (
    <div className="page">
      <section className="page-stack">
        <div className="summary-grid">
          <div className="summary-card">
            <span>Investimento total registrado</span>
            <strong>R$ {summary.total.toFixed(2)}</strong>
          </div>
          <div className="summary-card">
            <span>Custo unitário médio</span>
            <strong>R$ {summary.unitAverage.toFixed(2)}</strong>
          </div>
        </div>
      </section>

      <section className="page-stack">
        <div className="page-header">
          <h2>Custos por ficha técnica</h2>
        </div>
        <div className="card-grid">
          {recipes.map((recipe) => (
            <article key={recipe.id} className="card-tile">
              <header>
                <h3>{recipe.name}</h3>
                <span className="pill">Rende {recipe.yield} un.</span>
              </header>
              <div className="divider" />
              <div className="cost-meta">
                <span>Total: <strong>R$ {recipe.totalCost.toFixed(2)}</strong></span>
                <span>Unitário: <strong>R$ {recipe.unitCost.toFixed(2)}</strong></span>
                <span>Tempo: {recipe.prepTime} min</span>
              </div>
            </article>
          ))}
          {recipes.length === 0 ? <div className="card-tile">Cadastre receitas para visualizar os custos.</div> : null}
        </div>
      </section>
    </div>
  )
}

