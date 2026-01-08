import { useMemo, useState, useEffect, useRef } from 'react'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { FormModal } from '../components/ui/FormModal'
import { useAppStore } from '../stores/appStore'
import './PageCommon.css'

const allocationOptions = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'por hora', label: 'Por hora produtiva' },
  { value: 'por lote', label: 'Por lote produzido' },
  { value: 'por unidade', label: 'Por unidade' },
  { value: 'pagamento unico', label: 'Pagamento Único' }
]

const allocationMethodInfo = {
  'mensal': 'Mensal: custo fixo dividido entre todas as receitas do mês',
  'por hora': 'Por hora: usado em equipamentos que consomem por tempo de uso',
  'por lote': 'Por lote: usado para produção específica em lotes',
  'por unidade': 'Por unidade: custo distribuído proporcionalmente por cada unidade produzida',
  'pagamento unico': 'Pagamento Único: custo pago uma única vez, não rateado mensalmente'
}

const quickAddOptions = [
  { name: 'Aluguel', type: 'fixo', value: '', allocationMethod: 'mensal' },
  { name: 'Água', type: 'indireto', value: '', allocationMethod: 'mensal' },
  { name: 'Energia', type: 'indireto', value: '', allocationMethod: 'mensal' },
  { name: 'Gás', type: 'indireto', value: '', allocationMethod: 'por hora' },
  { name: 'Outro', type: 'fixo', value: '', allocationMethod: 'mensal' }
]

// Função para formatar moeda brasileira
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Função para formatar data
const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

// Função para calcular impacto por unidade (estimativa baseada em receitas)
const calculateImpactPerUnit = (cost, totalCosts, recipes) => {
  if (!recipes || recipes.length === 0) return 0
  
  // Pagamento único não é rateado
  if (cost.allocationMethod === 'pagamento unico') {
    return 0
  }
  
  // Estimativa: assume que o custo é distribuído entre todas as unidades produzidas
  const totalYield = recipes.reduce((acc, recipe) => acc + (recipe.yield || 0), 0)
  if (totalYield === 0) return 0
  
  // Para rateio mensal, divide o custo pelo total de unidades
  if (cost.allocationMethod === 'mensal') {
    return cost.value / totalYield
  }
  
  // Para outros métodos, usa uma estimativa baseada na proporção
  const costPercentage = cost.value / totalCosts
  const avgUnitCost = recipes.reduce((acc, r) => acc + (r.unitCost || 0), 0) / recipes.length
  return avgUnitCost * costPercentage * 0.1 // Fator de ajuste
}

// Função para calcular impacto por lote (estimativa)
const calculateImpactPerBatch = (cost, totalCosts, recipes) => {
  if (!recipes || recipes.length === 0) return 0
  
  // Pagamento único não é rateado
  if (cost.allocationMethod === 'pagamento unico') {
    return 0
  }
  
  // Estimativa: assume lotes médios baseados nas receitas
  const avgBatchSize = recipes.reduce((acc, r) => acc + (r.yield || 0), 0) / recipes.length
  if (avgBatchSize === 0) return 0
  
  if (cost.allocationMethod === 'por lote') {
    return cost.value / (totalCosts > 0 ? Math.max(1, totalCosts / 100) : 1) // Estimativa de lotes
  }
  
  if (cost.allocationMethod === 'mensal') {
    const estimatedBatches = Math.max(1, totalCosts / 50) // Estimativa conservadora
    return cost.value / estimatedBatches
  }
  
  // Para outros métodos
  const costPercentage = cost.value / totalCosts
  return (cost.value * costPercentage) / Math.max(1, avgBatchSize)
}

export function FixedCostsPage() {
  const fixedCosts = useAppStore((state) => state.fixedCosts)
  const recipes = useAppStore((state) => state.recipes)
  const addFixedCost = useAppStore((state) => state.addFixedCost)
  const updateFixedCost = useAppStore((state) => state.updateFixedCost)
  const deleteFixedCost = useAppStore((state) => state.deleteFixedCost)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCost, setEditingCost] = useState(null)
  const [formState, setFormState] = useState({
    name: '',
    type: 'fixo',
    value: '',
    allocationMethod: 'mensal'
  })
  
  // Filtros e ordenação
  const [sortBy, setSortBy] = useState('maior-valor') // 'maior-valor', 'tipo', 'impacto'
  const [filterType, setFilterType] = useState('todos') // 'fixo', 'indireto', 'todos'
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const quickAddRef = useRef(null)

  // Fechar menu de ações rápidas ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (quickAddRef.current && !quickAddRef.current.contains(event.target)) {
        setShowQuickAdd(false)
      }
    }

    if (showQuickAdd) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showQuickAdd])

  const totalFixed = useMemo(() => fixedCosts.reduce((acc, cost) => acc + cost.value, 0), [fixedCosts])
  
  const costCount = fixedCosts.length
  const averageTicket = costCount > 0 ? totalFixed / costCount : 0
  
  // Calcular impacto médio por receita (estimativa)
  const averageImpactPerRevenue = useMemo(() => {
    if (recipes.length === 0 || totalFixed === 0) return 0
    return totalFixed / recipes.length
  }, [recipes, totalFixed])

  // Filtrar e ordenar custos
  const filteredAndSortedCosts = useMemo(() => {
    let filtered = fixedCosts
    
    // Aplicar filtro de tipo
    if (filterType !== 'todos') {
      filtered = filtered.filter(cost => cost.type === filterType)
    }
    
    // Aplicar ordenação
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'maior-valor':
          return b.value - a.value
        case 'tipo':
          return a.type.localeCompare(b.type) || a.name.localeCompare(b.name)
        case 'impacto':
          const impactA = (a.value / totalFixed) * 100
          const impactB = (b.value / totalFixed) * 100
          return impactB - impactA
        default:
          return 0
      }
    })
    
    return sorted
  }, [fixedCosts, filterType, sortBy, totalFixed])

  const handleSubmit = () => {
    const valueNumber = Number(formState.value)
    if (!formState.name.trim() || Number.isNaN(valueNumber) || valueNumber <= 0) return
    
    if (editingCost) {
      updateFixedCost(editingCost.id, {
        name: formState.name,
        type: formState.type,
        value: valueNumber,
        allocationMethod: formState.allocationMethod
      })
    } else {
    addFixedCost({
      id: crypto.randomUUID(),
      name: formState.name,
      type: formState.type,
      value: valueNumber,
      allocationMethod: formState.allocationMethod
    })
    }
    
    resetForm()
  }

  const handleEdit = (cost) => {
    setEditingCost(cost)
    setFormState({
      name: cost.name,
      type: cost.type,
      value: cost.value.toString(),
      allocationMethod: cost.allocationMethod
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este custo?')) {
      deleteFixedCost(id)
    }
  }

  const handleQuickAdd = (option) => {
    if (option.name === 'Outro') {
      setFormState({
        name: '',
        type: 'fixo',
        value: '',
        allocationMethod: 'mensal'
      })
      setIsModalOpen(true)
      setShowQuickAdd(false)
    } else {
      setFormState({
        name: option.name,
        type: option.type,
        value: '',
        allocationMethod: option.allocationMethod
      })
      setIsModalOpen(true)
      setShowQuickAdd(false)
    }
  }

  const resetForm = () => {
    setFormState({
      name: '',
      type: 'fixo',
      value: '',
      allocationMethod: 'mensal'
    })
    setEditingCost(null)
    setIsModalOpen(false)
    setIsEditModalOpen(false)
  }

  const getLastUpdateDate = () => {
    // Usa a data atual como última atualização (poderia ser salva no store)
    return new Date()
  }

  return (
    <div className="page">
      <section className="page-stack">
        <div className="page-header">
          <div>
            <h2>Custos Fixos e Indiretos</h2>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Última atualização: {formatDate(getLastUpdateDate())}
            </p>
          </div>
          <div style={{ position: 'relative' }} ref={quickAddRef}>
            <button 
              className="primary-btn" 
              type="button" 
              onClick={() => setShowQuickAdd(!showQuickAdd)}
            >
              + Adicionar novo custo
            </button>
            {showQuickAdd && (
              <div 
                className="quick-add-menu"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  boxShadow: 'var(--shadow-xl)',
                  zIndex: 100,
                  minWidth: '200px'
                }}
              >
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-muted)', 
                  marginBottom: '0.5rem',
                  fontWeight: 600
                }}>
                  Adicionar rapidamente:
                </div>
                {quickAddOptions.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => handleQuickAdd(option)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      marginBottom: '0.25rem',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--primary-color)'
                      e.target.style.color = 'var(--text-inverse)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'var(--bg-secondary)'
                      e.target.style.color = 'var(--text-primary)'
                    }}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card TOTAL MENSAL melhorado */}
        <div className="summary-card" style={{ padding: '1.8rem' }}>
          <span>TOTAL MENSAL</span>
          <strong style={{ fontSize: '2rem', margin: '0.5rem 0' }}>
            {formatCurrency(totalFixed)}
          </strong>
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <small>• {costCount} {costCount === 1 ? 'custo cadastrado' : 'custos cadastrados'}</small>
            <small>• Ticket médio de custo: {formatCurrency(averageTicket)}</small>
            {recipes.length > 0 && (
              <small>• Impacto médio por receita: {formatCurrency(averageImpactPerRevenue)}</small>
            )}
          </div>
        </div>
      </section>

      {/* Filtros e Ordenação */}
      <section className="page-stack">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontSize: '0.9rem', 
              color: 'var(--text-muted)',
              fontWeight: 600
            }}>
              Ordenar por:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { value: 'maior-valor', label: 'Maior valor' },
                { value: 'tipo', label: 'Tipo' },
                { value: 'impacto', label: 'Impacto / unidade' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSortBy(option.value)}
                  className={sortBy === option.value ? 'chip chip--selected' : 'chip'}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontSize: '0.9rem', 
              color: 'var(--text-muted)',
              fontWeight: 600
            }}>
              Filtrar:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { value: 'fixo', label: 'Fixo' },
                { value: 'indireto', label: 'Indireto' },
                { value: 'todos', label: 'Todos' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilterType(option.value)}
                  className={filterType === option.value ? 'chip chip--selected' : 'chip'}
                >
                  {option.label}
          </button>
              ))}
        </div>
          </div>
        </div>
      </section>

      {/* Cards de custos */}
      <section className="page-stack">
        <div className="card-grid">
          {filteredAndSortedCosts.map((cost) => {
            const percentage = totalFixed > 0 ? (cost.value / totalFixed) * 100 : 0
            const impactPerUnit = calculateImpactPerUnit(cost, totalFixed, recipes)
            const impactPerBatch = calculateImpactPerBatch(cost, totalFixed, recipes)
            
            return (
              <article key={cost.id} className="card-tile" style={{ 
                border: '1px solid var(--border-primary)',
                position: 'relative'
              }}>
              <header>
                <h3>{cost.name}</h3>
                  <span 
                    className={`cost-badge cost-badge--${cost.type}`}
                  >
                    {cost.type === 'fixo' ? 'Fixo' : 'Indireto'}
                  </span>
              </header>
              <div className="divider" />
                
              <div className="cost-meta">
                  <span>
                    Valor mensal: <strong>{formatCurrency(cost.value)}</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    Método de rateio: {allocationOptions.find(opt => opt.value === cost.allocationMethod)?.label || cost.allocationMethod}
                    <span
                      className="info-icon"
                      title={allocationMethodInfo[cost.allocationMethod] || ''}
                    >
                      ⓘ
                    </span>
                  </span>
                </div>

                <div className="cost-impact-section">
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Impacto:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <span>• {percentage.toFixed(1)}% do total de custos</span>
                    <span>• {formatCurrency(impactPerUnit)} por unidade (média)</span>
                    <span>• {formatCurrency(impactPerBatch)} por lote (média)</span>
                  </div>
                </div>

                <div className="cost-actions">
                  <button
                    type="button"
                    onClick={() => handleEdit(cost)}
                    className="ghost-btn"
                    style={{ flex: 1, fontSize: '0.9rem' }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cost.id)}
                    className="ghost-btn"
                    style={{ 
                      flex: 1, 
                      fontSize: '0.9rem',
                      color: 'var(--primary-color)',
                      borderColor: 'var(--primary-color)'
                    }}
                  >
                    Excluir
                  </button>
              </div>
            </article>
            )
          })}
          {filteredAndSortedCosts.length === 0 && (
            <div className="card-tile" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              {fixedCosts.length === 0 
                ? 'Cadastre seu primeiro custo fixo.' 
                : 'Nenhum custo encontrado com os filtros selecionados.'}
            </div>
          )}
        </div>
      </section>

      {/* Modal de criação */}
      <FormModal
        isOpen={isModalOpen}
        title="Cadastrar custo fixo/indireto"
        description="Esses custos serão rateados automaticamente sobre as receitas."
        onClose={() => {
          resetForm()
          setShowQuickAdd(false)
        }}
        footer={
          <>
            <button className="ghost-btn" type="button" onClick={() => {
            resetForm()
            setShowQuickAdd(false)
          }}>
              Cancelar
            </button>
            <button className="primary-btn" type="button" onClick={handleSubmit}>
              Salvar custo
            </button>
          </>
        }
      >
        <label className="input-control">
          <span>Nome</span>
          <input 
            value={formState.name} 
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))} 
          />
        </label>
        <label className="input-control">
          <span>Tipo</span>
          <select 
            value={formState.type} 
            onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value }))}
          >
            <option value="fixo">Fixo</option>
            <option value="indireto">Indireto</option>
          </select>
        </label>
        <CurrencyInput 
          label="Valor mensal" 
          value={formState.value} 
          onChange={(value) => setFormState((prev) => ({ ...prev, value }))} 
        />
        <label className="input-control">
          <span>Método de rateio</span>
          <select
            value={formState.allocationMethod}
            onChange={(event) => setFormState((prev) => ({ ...prev, allocationMethod: event.target.value }))}
          >
            {allocationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </FormModal>

      {/* Modal de edição */}
      <FormModal
        isOpen={isEditModalOpen}
        title="Editar custo fixo/indireto"
        description="Atualize as informações do custo."
        onClose={resetForm}
        footer={
          <>
            <button className="ghost-btn" type="button" onClick={resetForm}>
              Cancelar
            </button>
            <button className="primary-btn" type="button" onClick={handleSubmit}>
              Salvar alterações
            </button>
          </>
        }
      >
        <label className="input-control">
          <span>Nome</span>
          <input 
            value={formState.name} 
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))} 
          />
        </label>
        <label className="input-control">
          <span>Tipo</span>
          <select 
            value={formState.type} 
            onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value }))}
          >
            <option value="fixo">Fixo</option>
            <option value="indireto">Indireto</option>
          </select>
        </label>
        <CurrencyInput 
          label="Valor mensal" 
          value={formState.value} 
          onChange={(value) => setFormState((prev) => ({ ...prev, value }))} 
        />
        <label className="input-control">
          <span>Método de rateio</span>
          <select
            value={formState.allocationMethod}
            onChange={(event) => setFormState((prev) => ({ ...prev, allocationMethod: event.target.value }))}
          >
            {allocationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </FormModal>
    </div>
  )
}
