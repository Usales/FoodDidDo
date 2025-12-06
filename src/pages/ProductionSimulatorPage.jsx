import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/appStore'
import { FiDollarSign, FiTrendingUp, FiDollarSign as FiProfit, FiPackage, FiFileText, FiRefreshCw, FiEdit3 } from 'react-icons/fi'
import './PageCommon.css'
import './ProductionSimulatorPage.css'

export function ProductionSimulatorPage() {
  const navigate = useNavigate()
  const recipes = useAppStore((state) => state.recipes)
  const [budget, setBudget] = useState('500')

  const budgetNumber = Number(budget) || 0

  const scenarios = useMemo(() => {
    if (!recipes.length || budgetNumber <= 0) return []
    return recipes
      .filter((recipe) => recipe.unitCost > 0 && recipe.contributionMargin >= 0 && recipe.contributionMargin < 1)
      .map((recipe) => {
        const maxUnits = Math.floor(budgetNumber / recipe.unitCost)
        if (maxUnits <= 0) return null
        
        const suggestedPrice = recipe.unitCost / (1 - recipe.contributionMargin)
        const estimatedRevenue = maxUnits * suggestedPrice
        const estimatedProfit = estimatedRevenue - maxUnits * recipe.unitCost
        const totalCost = maxUnits * recipe.unitCost
        const marginPercent = recipe.contributionMargin * 100
        
        return {
          id: recipe.id,
          recipeName: recipe.name,
          recipe,
          maxUnits,
          estimatedRevenue,
          estimatedProfit,
          totalCost,
          suggestedPrice,
          marginPercent
        }
      })
      .filter((scenario) => scenario !== null)
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

  const handleReset = () => {
    setBudget('500')
  }

  const handleEditRecipe = (recipeId) => {
    navigate('/custos', { state: { editRecipeId: recipeId } })
  }

  const handleExportReport = () => {
    if (scenarios.length === 0) {
      alert('Não há dados para exportar. Informe um orçamento válido.')
      return
    }

    const report = {
      budget: budgetNumber,
      generatedAt: new Date().toISOString(),
      totals: {
        revenue: totals.revenue,
        profit: totals.profit,
        units: totals.units
      },
      scenarios: scenarios.map((scenario) => ({
        recipeName: scenario.recipeName,
        maxUnits: scenario.maxUnits,
        estimatedRevenue: scenario.estimatedRevenue,
        estimatedProfit: scenario.estimatedProfit,
        totalCost: scenario.totalCost,
        unitCost: scenario.recipe.unitCost,
        suggestedPrice: scenario.suggestedPrice,
        marginPercent: scenario.marginPercent
      }))
    }

    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-simulacao-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleGenerateDetailedPlan = (scenario) => {
    const plan = {
      recipe: scenario.recipeName,
      budget: budgetNumber,
      units: scenario.maxUnits,
      totalCost: scenario.totalCost,
      estimatedRevenue: scenario.estimatedRevenue,
      estimatedProfit: scenario.estimatedProfit,
      unitCost: scenario.recipe.unitCost,
      suggestedPrice: scenario.suggestedPrice,
      marginPercent: scenario.marginPercent,
      yield: scenario.recipe.yield,
      prepTime: scenario.recipe.prepTime,
      batches: Math.ceil(scenario.maxUnits / scenario.recipe.yield),
      costPerBatch: scenario.recipe.totalCost,
      revenuePerBatch: (scenario.recipe.yield * scenario.suggestedPrice),
      profitPerBatch: (scenario.recipe.yield * scenario.suggestedPrice) - scenario.recipe.totalCost
    }

    const dataStr = JSON.stringify(plan, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `plano-detalhado-${scenario.recipeName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page simulator-page">
      <section className="page-stack">
        <div className="simulator-kpi-grid">
          <div className="simulator-kpi-card kpi-budget">
            <div className="kpi-icon-wrapper">
              <FiDollarSign size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Orçamento disponível</span>
              <strong className="kpi-value">R$ {budgetNumber.toFixed(2)}</strong>
            </div>
          </div>
          <div className="simulator-kpi-card kpi-revenue">
            <div className="kpi-icon-wrapper">
              <FiTrendingUp size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Receita estimada</span>
              <strong className="kpi-value">R$ {totals.revenue.toFixed(2)}</strong>
            </div>
          </div>
          <div className="simulator-kpi-card kpi-profit">
            <div className="kpi-icon-wrapper">
              <FiProfit size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Lucro potencial</span>
              <strong className="kpi-value">R$ {totals.profit.toFixed(2)}</strong>
            </div>
          </div>
          <div className="simulator-kpi-card kpi-units">
            <div className="kpi-icon-wrapper">
              <FiPackage size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Unidades sugeridas</span>
              <strong className="kpi-value">{totals.units}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="page-stack">
        <div className="simulator-header">
          <div className="simulator-header-content">
            <h2>Monte seu plano de produção</h2>
            <p className="simulator-subtitle">Simule custos, unidades e lucro baseado no seu orçamento.</p>
          </div>
          <div className="simulator-header-actions">
            <button type="button" className="ghost-btn" onClick={handleReset}>
              <FiRefreshCw size={18} />
              Resetar simulação
            </button>
            <button type="button" className="primary-btn" onClick={handleExportReport}>
              <FiFileText size={18} />
              Exportar relatório
            </button>
          </div>
        </div>

        <div className="budget-input-wrapper">
          <div className="budget-input-container">
            <FiDollarSign className="budget-icon" size={20} />
            <input
              type="number"
              className="budget-input"
              value={budget}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                  setBudget(value)
                }
              }}
              onBlur={(e) => {
                const value = Number(e.target.value)
                if (isNaN(value) || value < 0) {
                  setBudget('500')
                } else {
                  setBudget(value.toString())
                }
              }}
              placeholder="500,00"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {recipes.length === 0 ? (
          <div className="empty-simulation">
            <p>Cadastre receitas na página de Custos para realizar simulações.</p>
          </div>
        ) : scenarios.length === 0 ? (
          <div className="empty-simulation">
            <p>Informe um orçamento válido maior que zero para gerar combinações.</p>
          </div>
        ) : (
          <div className="simulation-results">
            {scenarios.map((scenario) => (
              <article key={scenario.id} className="simulation-card">
                <div className="simulation-card-header">
                  <div className="recipe-icon">🍗</div>
                  <div className="recipe-header-info">
                    <h3>{scenario.recipeName}</h3>
                    <span className="simulation-badge">Resultado da simulação</span>
                  </div>
                </div>

                <div className="simulation-main-stats">
                  <div className="main-stat">
                    <span className="stat-label">Receita total</span>
                    <strong className="stat-value revenue">R$ {scenario.estimatedRevenue.toFixed(2)}</strong>
                  </div>
                  <div className="main-stat">
                    <span className="stat-label">Lucro total</span>
                    <strong className="stat-value profit">R$ {scenario.estimatedProfit.toFixed(2)}</strong>
                  </div>
                  <div className="main-stat">
                    <span className="stat-label">Unidades produzidas</span>
                    <strong className="stat-value units">{scenario.maxUnits} unidades</strong>
                  </div>
                </div>

                <div className="simulation-divider"></div>

                <div className="simulation-details">
                  <div className="detail-item">
                    <span className="detail-icon">📘</span>
                    <div className="detail-content">
                      <span className="detail-label">Custo por unidade</span>
                      <strong className="detail-value">R$ {scenario.recipe.unitCost.toFixed(2)}</strong>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">💸</span>
                    <div className="detail-content">
                      <span className="detail-label">Preço sugerido</span>
                      <strong className="detail-value">R$ {scenario.suggestedPrice.toFixed(2)}</strong>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">🧮</span>
                    <div className="detail-content">
                      <span className="detail-label">Margem estimada</span>
                      <strong className="detail-value margin">{scenario.marginPercent.toFixed(1)}%</strong>
                    </div>
                  </div>
                </div>

                <div className="simulation-actions">
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => handleEditRecipe(scenario.id)}
                  >
                    <FiEdit3 size={18} />
                    Editar receita
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => handleGenerateDetailedPlan(scenario)}
                  >
                    Gerar plano detalhado
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
