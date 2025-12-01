import { useMemo } from 'react'
import { useAppStore } from '../stores/appStore'
import './PageCommon.css'

export function BreakEvenPage() {
  const fixedCosts = useAppStore((state) => state.fixedCosts)
  const recipes = useAppStore((state) => state.recipes)

  const totalFixedCosts = useMemo(() => fixedCosts.reduce((acc, cost) => acc + cost.value, 0), [fixedCosts])
  const averageContributionMargin = useMemo(() => {
    if (!recipes.length) return 0
    return recipes.reduce((acc, recipe) => acc + recipe.contributionMargin, 0) / recipes.length
  }, [recipes])

  const averageSalePrice = useMemo(() => {
    if (!recipes.length) return 0
    return recipes.reduce((acc, recipe) => acc + recipe.unitCost * (1 + recipe.contributionMargin), 0) / recipes.length
  }, [recipes])

  const breakEvenUnits = useMemo(() => {
    if (!recipes.length || !averageContributionMargin) return 0
    const averagePrice = recipes.reduce((acc, recipe) => acc + recipe.unitCost * (1 + recipe.contributionMargin), 0) / recipes.length
    const averageContribution = averagePrice * averageContributionMargin
    if (!averageContribution) return 0
    return Math.ceil(totalFixedCosts / averageContribution)
  }, [averageContributionMargin, recipes, totalFixedCosts])

  const breakEvenValue = breakEvenUnits * averageSalePrice

  return (
    <div className="page">
      <section className="page-stack">
        <div className="summary-grid">
          <div className="summary-card">
            <span>Custos fixos mensais</span>
            <strong>R$ {totalFixedCosts.toFixed(2)}</strong>
          </div>
          <div className="summary-card">
            <span>Margem de contribuição média</span>
            <strong>{(averageContributionMargin * 100).toFixed(1)}%</strong>
          </div>
          <div className="summary-card">
            <span>Ponto de equilíbrio (unidades)</span>
            <strong>{breakEvenUnits}</strong>
          </div>
          <div className="summary-card">
            <span>Ponto de equilíbrio (R$)</span>
            <strong>R$ {breakEvenValue.toFixed(2)}</strong>
          </div>
        </div>
      </section>

      <section className="page-stack">
        <div className="card-grid">
          <article className="card-tile">
            <header>
              <h3>Receita x Lucro</h3>
            </header>
            <div className="divider" />
            <div className="break-even-meta">
              <span>
                Com a margem média atual, cada unidade gera uma contribuição de{' '}
                <strong>R$ {(averageSalePrice * averageContributionMargin || 0).toFixed(2)}</strong>.
              </span>
              <span>
                Planeje vender pelo menos <strong>{breakEvenUnits}</strong> unidades para cobrir seus custos fixos.
              </span>
            </div>
          </article>
          <div className="tip-card">
            <h3>Como interpretar</h3>
            <p>
              Abaixo do ponto de equilíbrio você opera com prejuízo. Use este indicador para definir suas metas semanais e combine com o simulador de
              produção para testar diferentes cenários.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

