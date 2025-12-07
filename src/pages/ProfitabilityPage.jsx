import { useMemo, useState, useRef, useEffect } from 'react'
import { FiTrendingUp, FiDollarSign, FiPercent, FiPackage, FiSliders, FiInfo, FiX } from 'react-icons/fi'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { useAppStore } from '../stores/appStore'
import './PageCommon.css'
import './ProfitabilityPage.css'

export function ProfitabilityPage() {
  const recipes = useAppStore((state) => state.recipes)
  const fixedCosts = useAppStore((state) => state.fixedCosts)
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id ?? null)
  const [price, setPrice] = useState('6')
  const [openTooltip, setOpenTooltip] = useState(null)
  const tooltipRefs = useRef({})

  const selectedRecipe = useMemo(() => recipes.find((recipe) => recipe.id === selectedRecipeId), [recipes, selectedRecipeId])
  const priceNumber = Number(price) || 0

  // Calcular custo fixo rateado por unidade (simplificado)
  const fixedCostPerUnit = useMemo(() => {
    if (!selectedRecipe || !selectedRecipe.yield) return 0
    // Soma custos fixos que são rateados por lote
    const perBatchCosts = fixedCosts
      .filter(cost => cost.allocationMethod === 'por lote')
      .reduce((sum, cost) => sum + (cost.value || 0), 0)
    return perBatchCosts / selectedRecipe.yield
  }, [fixedCosts, selectedRecipe])

  const metrics = useMemo(() => {
    if (!selectedRecipe) {
      return {
        unitCost: 0,
        grossProfit: 0,
        margin: 0,
        batchProfit: 0,
        totalCost: 0,
        fixedCostRateado: 0,
        baseUnitCost: 0
      }
    }
    const totalCost = selectedRecipe.totalCost || 0
    const recipeYield = selectedRecipe.yield || 1
    // Calcular custo unitário base a partir do totalCost para garantir consistência
    const baseUnitCost = recipeYield > 0 ? totalCost / recipeYield : (selectedRecipe.unitCost || 0)
    const fixedCostRateado = fixedCostPerUnit
    // Custo unitário final = custo base + custo fixo rateado
    const finalUnitCost = baseUnitCost + fixedCostRateado
    const grossProfit = priceNumber - finalUnitCost
    const margin = priceNumber > 0 ? (grossProfit / priceNumber) * 100 : 0
    const batchProfit = grossProfit * recipeYield
    return { 
      unitCost: finalUnitCost, 
      grossProfit, 
      margin, 
      batchProfit,
      totalCost,
      fixedCostRateado,
      baseUnitCost
    }
  }, [priceNumber, selectedRecipe, fixedCostPerUnit])

  // Fechar tooltip ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openTooltip && tooltipRefs.current[openTooltip]) {
        const cardElement = tooltipRefs.current[openTooltip]
        const tooltipElement = cardElement?.querySelector('.metric-tooltip')
        // Não fechar se o clique foi dentro do card ou do tooltip
        if (!cardElement.contains(event.target)) {
          setOpenTooltip(null)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openTooltip])

  const costPercentage = selectedRecipe ? Math.min(100, Math.max(0, 100 - metrics.margin)) : 0
  const profitPercentage = metrics.margin

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const toggleTooltip = (cardId, event) => {
    event?.stopPropagation()
    setOpenTooltip(openTooltip === cardId ? null : cardId)
  }

  return (
    <div className="profitability-page">
      {/* Header Interno */}
      <header className="profitability-header">
        <nav className="profitability-breadcrumb">
          <span>Análises</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Lucratividade</span>
        </nav>
        <h1 className="profitability-title">Lucratividade da Receita</h1>
      </header>

      {/* Bloco 1: Dados da Receita - Grid 2x2 */}
      <section className="profitability-metrics-section">
        <div className="profitability-metrics-grid">
          {/* Card 1: Custo Unitário */}
          <div 
            className={`profitability-metric-card ${openTooltip === 'cost' ? 'tooltip-open' : ''}`}
            ref={el => tooltipRefs.current['cost'] = el}
          >
            <button 
              className="metric-info-btn"
              onClick={(e) => toggleTooltip('cost', e)}
              aria-label="Ver detalhes do custo unitário"
            >
              <FiInfo />
            </button>
            <div className="metric-icon">
              <FiDollarSign />
            </div>
            <span className="metric-label">Custo Unitário</span>
            <strong className="metric-value">{formatCurrency(metrics.unitCost)}</strong>
            {selectedRecipe && (
              <small className="metric-description">{selectedRecipe.name}</small>
            )}
            {openTooltip === 'cost' && (
              <div className="metric-tooltip">
                <button 
                  className="tooltip-close"
                  onClick={(e) => toggleTooltip('cost', e)}
                  aria-label="Fechar detalhes"
                >
                  <FiX />
                </button>
                <h4>Detalhes do Custo Unitário</h4>
                <ul className="tooltip-list">
                  <li><strong>Receita:</strong> {selectedRecipe?.name || 'N/A'}</li>
                  <li><strong>Custo total do lote:</strong> {formatCurrency(metrics.totalCost)}</li>
                  <li><strong>Unidades por lote:</strong> {selectedRecipe?.yield || 0}</li>
                  <li><strong>Custo dos ingredientes:</strong> {formatCurrency(metrics.baseUnitCost)} por unidade</li>
                  {metrics.fixedCostRateado > 0 && (
                    <li><strong>Custo fixo rateado:</strong> {formatCurrency(metrics.fixedCostRateado)} por unidade</li>
                  )}
                  <li><strong>Custo final por unidade:</strong> {formatCurrency(metrics.unitCost)}</li>
                </ul>
              </div>
            )}
          </div>

          {/* Card 2: Lucro por Unidade */}
          <div 
            className={`profitability-metric-card ${openTooltip === 'profit' ? 'tooltip-open' : ''}`}
            ref={el => tooltipRefs.current['profit'] = el}
          >
            <button 
              className="metric-info-btn"
              onClick={(e) => toggleTooltip('profit', e)}
              aria-label="Ver detalhes do lucro por unidade"
            >
              <FiInfo />
            </button>
            <div className="metric-icon metric-icon--profit">
              <FiTrendingUp />
            </div>
            <span className="metric-label">Lucro por Unidade</span>
            <strong className="metric-value">{formatCurrency(metrics.grossProfit)}</strong>
            {openTooltip === 'profit' && (
              <div className="metric-tooltip">
                <button 
                  className="tooltip-close"
                  onClick={(e) => toggleTooltip('profit', e)}
                  aria-label="Fechar detalhes"
                >
                  <FiX />
                </button>
                <h4>Detalhes do Lucro por Unidade</h4>
                <ul className="tooltip-list">
                  <li><strong>Preço de venda:</strong> {formatCurrency(priceNumber)}</li>
                  <li><strong>Custo unitário:</strong> {formatCurrency(metrics.unitCost)}</li>
                  <li><strong>Fórmula:</strong> Preço de venda - Custo unitário</li>
                  <li><strong>Lucro por unidade:</strong> {formatCurrency(metrics.grossProfit)}</li>
                </ul>
              </div>
            )}
          </div>

          {/* Card 3: Margem de Contribuição */}
          <div 
            className={`profitability-metric-card ${openTooltip === 'margin' ? 'tooltip-open' : ''}`}
            ref={el => tooltipRefs.current['margin'] = el}
          >
            <button 
              className="metric-info-btn"
              onClick={(e) => toggleTooltip('margin', e)}
              aria-label="Ver detalhes da margem de contribuição"
            >
              <FiInfo />
            </button>
            <div className="metric-icon metric-icon--margin">
              <FiPercent />
            </div>
            <span className="metric-label">Margem de Contribuição</span>
            <strong className="metric-value">{metrics.margin.toFixed(1)}%</strong>
            {openTooltip === 'margin' && (
              <div className="metric-tooltip">
                <button 
                  className="tooltip-close"
                  onClick={(e) => toggleTooltip('margin', e)}
                  aria-label="Fechar detalhes"
                >
                  <FiX />
                </button>
                <h4>Detalhes da Margem de Contribuição</h4>
                <ul className="tooltip-list">
                  <li><strong>Fórmula:</strong> (Preço de venda - Custo unitário) ÷ Preço de venda</li>
                  <li><strong>Margem:</strong> {metrics.margin.toFixed(2)}%</li>
                  <li><strong>Valor de contribuição:</strong> {formatCurrency(metrics.grossProfit)} por unidade</li>
                  <li><strong>Preço de venda:</strong> {formatCurrency(priceNumber)}</li>
                  <li><strong>Custo unitário:</strong> {formatCurrency(metrics.unitCost)}</li>
                </ul>
              </div>
            )}
          </div>

          {/* Card 4: Lucro por Lote */}
          <div 
            className={`profitability-metric-card ${openTooltip === 'batch' ? 'tooltip-open' : ''}`}
            ref={el => tooltipRefs.current['batch'] = el}
          >
            <button 
              className="metric-info-btn"
              onClick={(e) => toggleTooltip('batch', e)}
              aria-label="Ver detalhes do lucro por lote"
            >
              <FiInfo />
            </button>
            <div className="metric-icon metric-icon--batch">
              <FiPackage />
            </div>
            <span className="metric-label">Lucro por Lote</span>
            <strong className="metric-value">{formatCurrency(metrics.batchProfit)}</strong>
            {selectedRecipe && (
              <small className="metric-description">Rendimento: {selectedRecipe.yield || 0} unidades</small>
            )}
            {openTooltip === 'batch' && (
              <div className="metric-tooltip">
                <button 
                  className="tooltip-close"
                  onClick={(e) => toggleTooltip('batch', e)}
                  aria-label="Fechar detalhes"
                >
                  <FiX />
                </button>
                <h4>Detalhes do Lucro por Lote</h4>
                <ul className="tooltip-list">
                  <li><strong>Lucro por unidade:</strong> {formatCurrency(metrics.grossProfit)}</li>
                  <li><strong>Unidades por lote:</strong> {selectedRecipe?.yield || 0}</li>
                  <li><strong>Fórmula:</strong> Lucro por unidade × Unidades por lote</li>
                  <li><strong>Lucro total:</strong> {formatCurrency(metrics.batchProfit)}</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bloco 2: Calculadora de Margem */}
      <section className="profitability-calculator-section">
        <div className="profitability-calculator-header">
          <div className="calculator-title-wrapper">
            <FiSliders className="calculator-icon" />
            <h2>Calcular nova margem</h2>
          </div>
          <span className="calculator-badge">
            <span className="badge-dot"></span>
            Atualiza em tempo real
          </span>
        </div>
        <div className="profitability-calculator-grid">
          <label className="profitability-input-wrapper">
            <span className="profitability-input-label">Receita</span>
            <select 
              className="profitability-select"
              value={selectedRecipeId ?? ''} 
              onChange={(event) => setSelectedRecipeId(event.target.value)}
            >
              <option value="">Selecione uma receita</option>
              {recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name}
                </option>
              ))}
            </select>
          </label>
          <div className="profitability-input-wrapper">
            <CurrencyInput 
              label="Preço de Venda" 
              value={price} 
              onChange={setPrice}
              placeholder="R$ 0,00"
            />
          </div>
        </div>
        {selectedRecipe && (
          <div className="profitability-unit-calculation">
            <div className="unit-calculation-item">
              <span className="unit-calculation-label">Custo Total do Lote:</span>
              <strong className="unit-calculation-value">{formatCurrency(metrics.totalCost)}</strong>
            </div>
            <div className="unit-calculation-separator">÷</div>
            <div className="unit-calculation-item">
              <span className="unit-calculation-label">Quantidade de Unidades:</span>
              <strong className="unit-calculation-value">{selectedRecipe.yield || 0}</strong>
            </div>
            <div className="unit-calculation-separator">=</div>
            <div className="unit-calculation-item unit-calculation-result">
              <span className="unit-calculation-label">Custo Unitário Base:</span>
              <strong className="unit-calculation-value">{formatCurrency(metrics.baseUnitCost)}</strong>
            </div>
            {metrics.fixedCostRateado > 0 && (
              <>
                <div className="unit-calculation-separator">+</div>
                <div className="unit-calculation-item">
                  <span className="unit-calculation-label">Custo Fixo Rateado:</span>
                  <strong className="unit-calculation-value">{formatCurrency(metrics.fixedCostRateado)}</strong>
                </div>
                <div className="unit-calculation-separator">=</div>
                <div className="unit-calculation-item unit-calculation-result">
                  <span className="unit-calculation-label">Custo Unitário Final:</span>
                  <strong className="unit-calculation-value unit-calculation-final">{formatCurrency(metrics.unitCost)}</strong>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* Bloco 3: Resumo Financeiro */}
      <section className="profitability-summary-section">
        <div className="profitability-summary-grid">
          {/* Coluna 1: Composição custo x lucro */}
          <article className="profitability-composition-card">
            <header className="composition-header">
              <h3>Composição custo x lucro</h3>
            </header>
            <div className="composition-content">
              <div className="composition-bar">
                <div 
                  className="composition-bar-segment composition-bar-segment--cost"
                  style={{ width: `${costPercentage}%` }}
                >
                  <span className="bar-label">Custos</span>
                  <span className="bar-value">{costPercentage.toFixed(1)}%</span>
                </div>
                <div 
                  className="composition-bar-segment composition-bar-segment--profit"
                  style={{ width: `${profitPercentage}%` }}
                >
                  <span className="bar-label">Lucro</span>
                  <span className="bar-value">{profitPercentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="composition-details">
                <div className="composition-detail-item">
                  <span className="detail-label">Custo representa</span>
                  <strong className="detail-value">{costPercentage.toFixed(1)}%</strong>
                  <span className="detail-text">do preço definido</span>
                </div>
                <div className="composition-detail-item">
                  <span className="detail-label">Lucro representa</span>
                  <strong className="detail-value">{profitPercentage.toFixed(1)}%</strong>
                  <span className="detail-text">do preço de venda</span>
                </div>
              </div>
            </div>
          </article>

          {/* Coluna 2: Dica de margem */}
          <div className="profitability-tip-card">
            <div className="tip-icon">
              <FiInfo />
            </div>
            <h3>Dica de Margem</h3>
            <p className="tip-text">
              <strong>Fórmula:</strong> Margem = (Preço de venda - Custo unitário) ÷ Preço de venda
            </p>
            <p className="tip-recommendation">
              <strong>Recomendação:</strong> Mantenha a margem acima de <strong className="tip-highlight">30%</strong> para cobrir custos fixos e atingir o lucro desejado.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

