import { useMemo, useState } from 'react'
import { useAppStore } from '../stores/appStore'
import './PageCommon.css'

// Função para formatar moeda brasileira
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Função para formatar data e hora
const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Função para calcular custo por lote
const calculateCostPerBatch = (recipe) => {
  if (!recipe || !recipe.yield) return 0
  return recipe.unitCost * recipe.yield
}

// Função para calcular lucro por lote
const calculateProfitPerBatch = (recipe, price, margin) => {
  const costPerBatch = calculateCostPerBatch(recipe)
  const revenuePerBatch = price * (recipe.yield || 0)
  return revenuePerBatch - costPerBatch
}

// Função para calcular elasticidade de preço
const calculatePriceElasticity = (currentPrice, newPrice, currentMargin, newMargin) => {
  const priceChange = ((newPrice - currentPrice) / currentPrice) * 100
  const marginChange = newMargin - currentMargin
  return {
    priceChange,
    marginChange,
    elasticity: priceChange !== 0 ? marginChange / priceChange : 0
  }
}

// Função para calcular custos fixos rateados por receita
const calculateFixedCostsAllocation = (recipe, fixedCosts, recipes) => {
  if (!recipe || !fixedCosts || fixedCosts.length === 0) return 0
  
  const totalFixedCosts = fixedCosts.reduce((acc, cost) => acc + cost.value, 0)
  if (totalFixedCosts === 0 || !recipes || recipes.length === 0) return 0
  
  // Rateio mensal simples: divide pelos custos mensais e distribui entre receitas
  const monthlyCosts = fixedCosts.filter(cost => cost.allocationMethod === 'mensal')
  const monthlyTotal = monthlyCosts.reduce((acc, cost) => acc + cost.value, 0)
  
  // Distribui proporcionalmente entre receitas
  return monthlyTotal / recipes.length
}

// Função para calcular custos indiretos por unidade
const calculateIndirectCostsPerUnit = (recipe, fixedCosts, recipes) => {
  if (!recipe || !fixedCosts || fixedCosts.length === 0) return 0
  
  const indirectCosts = fixedCosts.filter(cost => cost.type === 'indireto')
  if (indirectCosts.length === 0) return 0
  
  const totalIndirect = indirectCosts.reduce((acc, cost) => acc + cost.value, 0)
  const totalYield = recipes.reduce((acc, r) => acc + (r.yield || 0), 0)
  
  if (totalYield === 0) return 0
  return (totalIndirect / totalYield) * (recipe.yield || 0)
}

// Função para gerar preços psicológicos
const generatePsychologicalPrices = (suggestedPrice) => {
  const prices = []
  
  // Preço mais competitivo (5-10% abaixo)
  prices.push({
    value: suggestedPrice * 0.92,
    label: 'Mais competitivo',
    description: '5-10% abaixo do sugerido'
  })
  
  // Preço com .99 (aumenta margem)
  const priceWith99 = Math.ceil(suggestedPrice) - 0.01
  if (priceWith99 !== suggestedPrice) {
    prices.push({
      value: priceWith99,
      label: 'Preço .99',
      description: 'Aumenta sua margem'
    })
  }
  
  // Preço premium (10-15% acima)
  prices.push({
    value: suggestedPrice * 1.12,
    label: 'Premium',
    description: '10-15% acima do sugerido'
  })
  
  return prices
}

// Função para validar margem e retornar cor
const getMarginValidationColor = (margin) => {
  if (margin < 30) return '#fbbf24' // Amarelo - baixa
  if (margin >= 30 && margin <= 70) return '#10b981' // Verde - ideal
  if (margin > 70) return '#ef4444' // Vermelho - muito alta
  return 'var(--text-primary)'
}

// Função para obter status do pricing
const getPricingStatus = (pricingEntry, currentRecipe) => {
  if (!pricingEntry || !currentRecipe) return { status: 'unknown', label: 'Desconhecido', color: '#6b7280' }
  
  const currentCost = currentRecipe.unitCost || 0
  const savedCost = pricingEntry.costSnapshot || currentCost
  const costDifference = ((currentCost - savedCost) / savedCost) * 100
  
  const currentPrice = pricingEntry.currentPrice || 0
  const suggestedPrice = pricingEntry.suggestedPrice || 0
  const priceDifference = currentPrice - suggestedPrice
  
  // Se o custo aumentou mais de 5%, está defasado
  if (costDifference > 5) {
    return {
      status: 'outdated',
      label: 'Defasado',
      color: '#ef4444',
      message: `Custo aumentou ${costDifference.toFixed(1)}%`
    }
  }
  
  // Se o preço atual está muito abaixo do sugerido
  if (priceDifference < -0.10) {
    return {
      status: 'below',
      label: 'Abaixo do recomendado',
      color: '#f59e0b',
      message: `Diferença: ${formatCurrency(Math.abs(priceDifference))}`
    }
  }
  
  // Se está atualizado
  if (Math.abs(priceDifference) <= 0.05 && Math.abs(costDifference) <= 5) {
    return {
      status: 'updated',
      label: 'Atualizado',
      color: '#10b981',
      message: 'Preço em dia'
    }
  }
  
  return {
    status: 'needs-review',
    label: 'Revisar',
    color: '#f59e0b',
    message: 'Verificar ajustes necessários'
  }
}

export function PricingPage() {
  const recipes = useAppStore((state) => state.recipes)
  const fixedCosts = useAppStore((state) => state.fixedCosts)
  const pricingHistory = useAppStore((state) => state.pricing)
  const addPricing = useAppStore((state) => state.addPricing)

  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id ?? null)
  const [desiredMargin, setDesiredMargin] = useState('50')
  const [notes, setNotes] = useState('')

  const selectedRecipe = useMemo(() => recipes.find((recipe) => recipe.id === selectedRecipeId), [recipes, selectedRecipeId])
  const desiredMarginNumber = Number(desiredMargin) || 0

  // Calcular custos rateados
  const fixedCostsAllocation = useMemo(() => {
    if (!selectedRecipe) return 0
    return calculateFixedCostsAllocation(selectedRecipe, fixedCosts, recipes)
  }, [selectedRecipe, fixedCosts, recipes])

  const indirectCostsPerUnit = useMemo(() => {
    if (!selectedRecipe) return 0
    return calculateIndirectCostsPerUnit(selectedRecipe, fixedCosts, recipes)
  }, [selectedRecipe, fixedCosts, recipes])

  // Calcular preço sugerido com todos os custos
  const suggestedPrice = useMemo(() => {
    if (!selectedRecipe) return 0
    const baseCost = selectedRecipe.unitCost || 0
    const fixedAllocationPerUnit = fixedCostsAllocation / (selectedRecipe.yield || 1)
    const indirectPerUnit = indirectCostsPerUnit / (selectedRecipe.yield || 1)
    const totalCost = baseCost + fixedAllocationPerUnit + indirectPerUnit
    return totalCost * (1 + desiredMarginNumber / 100)
  }, [desiredMarginNumber, selectedRecipe, fixedCostsAllocation, indirectCostsPerUnit])

  // Composição do preço
  const priceComposition = useMemo(() => {
    if (!selectedRecipe) return null
    
    const baseCost = selectedRecipe.unitCost || 0
    const fixedAllocationPerUnit = fixedCostsAllocation / (selectedRecipe.yield || 1)
    const indirectPerUnit = indirectCostsPerUnit / (selectedRecipe.yield || 1)
    const totalCost = baseCost + fixedAllocationPerUnit + indirectPerUnit
    const marginAmount = totalCost * (desiredMarginNumber / 100)
    
    return {
      ingredients: baseCost,
      fixedCosts: fixedAllocationPerUnit,
      indirectCosts: indirectPerUnit,
      totalCost,
      margin: marginAmount,
      marginPercentage: desiredMarginNumber
    }
  }, [selectedRecipe, fixedCostsAllocation, indirectCostsPerUnit, desiredMarginNumber])

  // Calcular custo e lucro por lote
  const costPerBatch = useMemo(() => {
    if (!selectedRecipe) return 0
    return calculateCostPerBatch(selectedRecipe)
  }, [selectedRecipe])

  const profitPerBatch = useMemo(() => {
    if (!selectedRecipe) return 0
    return calculateProfitPerBatch(selectedRecipe, suggestedPrice, desiredMarginNumber)
  }, [selectedRecipe, suggestedPrice, desiredMarginNumber])

  const contributionMargin = useMemo(() => {
    if (!selectedRecipe || !selectedRecipe.yield || selectedRecipe.yield === 0) return 0
    const revenuePerBatch = suggestedPrice * selectedRecipe.yield
    if (revenuePerBatch === 0) return 0
    return ((revenuePerBatch - costPerBatch) / revenuePerBatch) * 100
  }, [selectedRecipe, suggestedPrice, costPerBatch])

  // Preços psicológicos
  const psychologicalPrices = useMemo(() => {
    return generatePsychologicalPrices(suggestedPrice)
  }, [suggestedPrice])

  // Elasticidade de preço
  const elasticity = useMemo(() => {
    if (!selectedRecipe) return null
    const currentPrice = suggestedPrice
    const newPrice10 = currentPrice * 1.10
    const newMargin10 = ((newPrice10 - (selectedRecipe.unitCost || 0)) / newPrice10) * 100
    return calculatePriceElasticity(currentPrice, newPrice10, desiredMarginNumber, newMargin10)
  }, [suggestedPrice, selectedRecipe, desiredMarginNumber])

  // Validação visual da margem
  const marginColor = useMemo(() => {
    return getMarginValidationColor(desiredMarginNumber)
  }, [desiredMarginNumber])

  const handleSavePricing = () => {
    if (!selectedRecipe) return
    
    const pricingEntry = {
      id: crypto.randomUUID(),
      recipeId: selectedRecipe.id,
      recipeName: selectedRecipe.name,
      desiredMargin: desiredMarginNumber / 100,
      suggestedPrice,
      currentPrice: suggestedPrice,
      costSnapshot: selectedRecipe.unitCost,
      fixedCostsAllocation,
      indirectCostsPerUnit,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      priceComposition: priceComposition
    }
    
    addPricing(pricingEntry)
    setNotes('')
  }

  // Filtrar histórico por receita selecionada
  const filteredHistory = useMemo(() => {
    if (!selectedRecipeId) return pricingHistory
    return pricingHistory.filter(entry => entry.recipeId === selectedRecipeId)
  }, [pricingHistory, selectedRecipeId])

  return (
    <div className="page">
      {/* TOPO: Preço sugerido + custo + margem + Indicadores */}
      <section className="page-stack">
        <div className="page-header">
          <h2>Formação de Preço</h2>
        </div>

        {/* Card de preço sugerido melhorado */}
        <div className="summary-card" style={{ padding: '1.8rem', marginBottom: '1rem' }}>
          <span>PREÇO SUGERIDO</span>
          <strong style={{ fontSize: '2rem', margin: '0.5rem 0' }}>
            {formatCurrency(suggestedPrice)}
          </strong>
          {priceComposition && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-primary)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Composição do preço:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>• Insumos: {formatCurrency(priceComposition.ingredients)}</span>
                {priceComposition.fixedCosts > 0 && (
                  <span>• Rateios fixos: {formatCurrency(priceComposition.fixedCosts)}</span>
                )}
                {priceComposition.indirectCosts > 0 && (
                  <span>• Custos indiretos: {formatCurrency(priceComposition.indirectCosts)}</span>
                )}
                <span>• Margem ({priceComposition.marginPercentage}%): {formatCurrency(priceComposition.margin)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <span>Custo unitário</span>
            <strong>{formatCurrency(selectedRecipe?.unitCost ?? 0)}</strong>
            <small>{selectedRecipe?.name ?? 'Selecione uma receita'}</small>
          </div>
          <div className="summary-card">
            <span>Margem desejada</span>
            <strong style={{ color: marginColor }}>{desiredMarginNumber.toFixed(0)}%</strong>
          </div>
          <div className="summary-card">
            <span>Custo por lote</span>
            <strong>{formatCurrency(costPerBatch)}</strong>
            <small>{(selectedRecipe?.yield ?? 0)} unidades</small>
          </div>
          <div className="summary-card">
            <span>Lucro por lote</span>
            <strong style={{ color: '#10b981' }}>{formatCurrency(profitPerBatch)}</strong>
            <small>Margem: {contributionMargin.toFixed(1)}%</small>
          </div>
        </div>

        {/* Indicadores Inteligentes */}
        {selectedRecipe && (
          <div className="tip-card" style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              🌡 Indicadores Inteligentes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {elasticity && (
                <div>
                  <strong>Elasticidade de preço:</strong> Se aumentar o preço em 10%, sua margem cresce{' '}
                  {elasticity.marginChange.toFixed(1)}%, mas o custo por unidade continua{' '}
                  {formatCurrency(selectedRecipe.unitCost)}.
                </div>
              )}
              {desiredMarginNumber < 30 && (
                <div style={{ color: '#fbbf24' }}>
                  ⚠️ <strong>Preço atual está abaixo da margem mínima recomendada (30%).</strong>
                </div>
              )}
              {desiredMarginNumber >= 30 && desiredMarginNumber <= 70 && (
                <div style={{ color: '#10b981' }}>
                  ✓ Margem dentro da faixa ideal para gastronomia.
                </div>
              )}
              {desiredMarginNumber > 70 && (
                <div style={{ color: '#ef4444' }}>
                  ⚠️ <strong>Margem muito alta pode afetar competitividade.</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Heatmap de margem */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Margem saudável</span>
            <span>Margem agressiva</span>
          </div>
          <div style={{ 
            position: 'relative',
            height: '8px',
            background: 'linear-gradient(to right, #ef4444 0%, #fbbf24 30%, #10b981 50%, #fbbf24 70%, #ef4444 100%)',
            borderRadius: '999px',
            overflow: 'visible'
          }}>
            <div style={{
              position: 'absolute',
              left: `${Math.min(100, Math.max(0, desiredMarginNumber))}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '16px',
              height: '16px',
              background: 'var(--text-primary)',
              border: '2px solid var(--bg-card)',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </div>
          <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            {desiredMarginNumber}%
          </div>
        </div>
      </section>

      {/* MEIO: Inputs + Preços psicológicos + Botão salvar */}
      <section className="page-stack">
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
              max="100"
              step="1"
              placeholder="Ex.: 50"
              style={{
                borderColor: marginColor,
                boxShadow: `0 0 0 3px ${marginColor}20`
              }}
            />
          </label>
        </div>

        {/* Preços psicológicos sugeridos */}
        {psychologicalPrices.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
              Preços psicológicos próximos:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {psychologicalPrices.map((price, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    // Calcular margem necessária para esse preço
                    if (selectedRecipe && priceComposition) {
                      const newMargin = ((price.value - priceComposition.totalCost) / price.value) * 100
                      setDesiredMargin(Math.max(0, Math.min(100, newMargin)).toFixed(0))
                    }
                  }}
                  className="chip"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.75rem',
                    minWidth: '140px'
                  }}
                >
                  <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {formatCurrency(price.value)}
                  </strong>
                  <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {price.label}
                  </small>
                  <small style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {price.description}
                  </small>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Campo de observações */}
        <label className="input-control" style={{ marginTop: '1rem' }}>
          <span>Observações (opcional)</span>
          <input
            type="text"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Ex.: Preço durante feriado"
          />
        </label>

        <button 
          className="primary-btn" 
          type="button" 
          onClick={handleSavePricing}
          disabled={!selectedRecipe}
          style={{ marginTop: '1rem' }}
        >
          Salvar sugestão
        </button>
      </section>

      {/* BAIXO: Histórico profissional */}
      <section className="page-stack">
        <div className="page-header">
          <h2>Histórico de Sugestões</h2>
        </div>
        <div className="card-grid">
          {filteredHistory.map((entry) => {
            const recipe = recipes.find((r) => r.id === entry.recipeId)
            const currentRecipe = recipe || selectedRecipe
            const status = getPricingStatus(entry, currentRecipe)
            const currentCost = currentRecipe?.unitCost || entry.costSnapshot || 0
            const costDifference = entry.costSnapshot 
              ? ((currentCost - entry.costSnapshot) / entry.costSnapshot) * 100 
              : 0
            const priceDifference = (entry.currentPrice || entry.suggestedPrice) - entry.suggestedPrice

            return (
              <article key={entry.id} className="card-tile" style={{ position: 'relative' }}>
                <header>
                  <h3>{entry.recipeName || recipe?.name || 'Receita removida'}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="pill">{(entry.desiredMargin * 100).toFixed(0)}%</span>
                    <span 
                      className="pill"
                      style={{
                        background: `${status.color}20`,
                        color: status.color,
                        border: `1px solid ${status.color}40`
                      }}
                    >
                      {status.label}
                    </span>
                  </div>
                </header>
                <div className="divider" />
                
                {entry.createdAt && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Sugestão salva em {formatDateTime(new Date(entry.createdAt))}
                  </div>
                )}

                <div className="pricing-meta">
                  <span>Preço sugerido: <strong>{formatCurrency(entry.suggestedPrice)}</strong></span>
                  <span>Preço atual: <strong>{formatCurrency(entry.currentPrice || entry.suggestedPrice)}</strong></span>
                  {entry.costSnapshot && (
                    <span>Custo unitário na época: <strong>{formatCurrency(entry.costSnapshot)}</strong></span>
                  )}
                  {currentCost && entry.costSnapshot && costDifference !== 0 && (
                    <span style={{ color: costDifference > 0 ? '#ef4444' : '#10b981' }}>
                      Custo atual: <strong>{formatCurrency(currentCost)}</strong> 
                      {' '}({costDifference > 0 ? '+' : ''}{costDifference.toFixed(1)}%)
                    </span>
                  )}
                  <span>
                    Margem efetiva atual: <strong>
                      {(() => {
                        const currentPrice = entry.currentPrice || entry.suggestedPrice
                        const cost = currentCost || entry.costSnapshot || 0
                        if (currentPrice === 0) return '0%'
                        return (((currentPrice - cost) / currentPrice) * 100).toFixed(1) + '%'
                      })()}
                    </strong>
                  </span>
                </div>

                {status.message && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.5rem', 
                    background: `${status.color}15`,
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: status.color
                  }}>
                    {status.message}
                  </div>
                )}

                {costDifference > 5 && (
                  <div style={{ 
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)'
                  }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                      Novo preço sugerido:
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                      {formatCurrency(entry.suggestedPrice * (1 + costDifference / 100))}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Diferença: {formatCurrency((entry.suggestedPrice * (1 + costDifference / 100)) - entry.suggestedPrice)}
                    </div>
                  </div>
                )}

                {entry.notes && (
                  <div style={{ 
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic'
                  }}>
                    📝 {entry.notes}
                </div>
                )}
              </article>
            )
          })}
          {filteredHistory.length === 0 && (
            <div className="card-tile" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              Nenhuma sugestão registrada para esta receita.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
