import { useMemo, useState, useEffect, useRef } from 'react'
import { FormModal } from '../components/ui/FormModal'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { useAppStore } from '../stores/appStore'
import { api } from '../lib/api'
import { FiEdit3, FiTrash2, FiLock, FiUnlock, FiFilter, FiChevronDown, FiChevronUp, FiPlus, FiMinus } from 'react-icons/fi'
import './PageCommon.css'
import './CashflowPage.css'

const CASHFLOW_PAGE_SETTINGS_KEY = 'cashflowPageSettings'
const typeLabels = {
  entrada: 'Entrada',
  saída: 'Saída',
  orçamento: 'Orçamento'
}

// Valores padrão: false = desmarcado (OFF) = exibindo, true = marcado (ON) = oculto
const defaultCashflowPageSettings = {
  showStatusSection: false,
  showSummarySection: false,
  showDetailsSection: false,
  showMovementsSection: false
}

export function CashflowPage() {
  const cashflow = useAppStore((state) => state.cashflow)
  const budgets = useAppStore((state) => state.budgets)
  const addCashflowEntry = useAppStore((state) => state.addCashflowEntry)
  const updateCashflowEntry = useAppStore((state) => state.updateCashflowEntry)
  const deleteCashflowEntry = useAppStore((state) => state.deleteCashflowEntry)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [expandedCardId, setExpandedCardId] = useState(null)
  const [cashboxSession, setCashboxSession] = useState(null)
  const [cashboxMovements, setCashboxMovements] = useState([])
  const [cashflowPageSettings, setCashflowPageSettings] = useState(defaultCashflowPageSettings)
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false)
  const [movementType, setMovementType] = useState('suprimento') // 'suprimento' ou 'sangria'
  const [openingAmount, setOpeningAmount] = useState('')
  const [closingBalance, setClosingBalance] = useState('')
  const [closingNotes, setClosingNotes] = useState('')
  const [movementAmount, setMovementAmount] = useState('')
  const [movementDescription, setMovementDescription] = useState('')
  const [showSessionDetails, setShowSessionDetails] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: 'all',
    startDate: '',
    endDate: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const menuRef = useRef(null)
  
  const [formState, setFormState] = useState({
    type: 'entrada',
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    budgetId: ''
  })

  // Carregar sessão de caixa da API
  const loadCashboxSession = async () => {
    try {
      setLoading(true)
      const data = await api.getCashboxSession()
      setCashboxSession(data.session)
      
      if (data.isOpen && data.session) {
        const movements = await api.getCashboxMovements()
        setCashboxMovements(movements)
      } else {
        setCashboxMovements([])
      }
    } catch (error) {
      console.error('Erro ao carregar sessão de caixa:', error)
      setCashboxSession(null)
      setCashboxMovements([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCashboxSession()
  }, [])

  // Carregar/atualizar preferências de exibição (UI) do Fluxo de Caixa
  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem(CASHFLOW_PAGE_SETTINGS_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          // Garantir que valores não definidos usem false (desmarcado = exibindo)
          const settings = { ...defaultCashflowPageSettings }
          Object.keys(defaultCashflowPageSettings).forEach(key => {
            if (parsed[key] === undefined || parsed[key] === null) {
              settings[key] = false
            } else {
              settings[key] = parsed[key]
            }
          })
          setCashflowPageSettings(settings)
        } else {
          setCashflowPageSettings(defaultCashflowPageSettings)
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do fluxo de caixa:', error)
        setCashflowPageSettings(defaultCashflowPageSettings)
      }
    }

    loadSettings()

    const handleSettingsChanged = (event) => {
      if (event?.detail && typeof event.detail === 'object') {
        setCashflowPageSettings({ ...defaultCashflowPageSettings, ...event.detail })
        return
      }
      loadSettings()
    }

    window.addEventListener('cashflowPageSettingsChanged', handleSettingsChanged)
    return () => window.removeEventListener('cashflowPageSettingsChanged', handleSettingsChanged)
  }, [])


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setExpandedCardId(null)
      }
    }

    if (expandedCardId) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [expandedCardId])

  // Filtrar movimentações
  const filteredCashflow = useMemo(() => {
    let filtered = [...cashflow]

    // Filtro por tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(entry => entry.type === filters.type)
    }

    // Filtro por data
    if (filters.startDate) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date)
        const startDate = new Date(filters.startDate)
        return entryDate >= startDate
      })
    }

    if (filters.endDate) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date)
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999)
        return entryDate <= endDate
      })
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [cashflow, filters])

  // Calcular totais e resumo
  const summary = useMemo(() => {
    const totals = filteredCashflow.reduce(
      (acc, entry) => {
        if (entry.type === 'entrada') {
          acc.income += entry.amount
        } else if (entry.type === 'saída') {
          acc.expense += entry.amount
        }
        return acc
      },
      { income: 0, expense: 0 }
    )
    
    const balance = totals.income - totals.expense
    const profit = balance > 0 ? balance : 0
    const loss = balance < 0 ? Math.abs(balance) : 0

    return {
      income: totals.income,
      expense: totals.expense,
      balance,
      profit,
      loss,
      entriesCount: filteredCashflow.filter(e => e.type === 'entrada').length,
      exitsCount: filteredCashflow.filter(e => e.type === 'saída').length
    }
  }, [filteredCashflow])

  const salesSummary = useMemo(() => {
    const sales = filteredCashflow.filter((e) => {
      const isSaleByCategory = typeof e.category === 'string' && e.category.startsWith('Venda')
      const isSaleByDescription = typeof e.description === 'string' && e.description.startsWith('Venda:')
      return e.type === 'entrada' && (isSaleByCategory || isSaleByDescription)
    })

    const salesWithProfit = sales.filter((e) => typeof e.profit === 'number')
    const totalProfit = salesWithProfit.reduce((sum, e) => sum + e.profit, 0)
    const count = salesWithProfit.length

    return {
      count,
      totalProfit,
      avgProfit: count > 0 ? totalProfit / count : 0
    }
  }, [filteredCashflow])

  // Calcular saldo atual do caixa
  const currentBalance = useMemo(() => {
    if (cashboxSession && cashboxSession.isOpen) {
      return cashboxSession.currentBalance || 0
    }

    // Se o caixa estiver fechado, exibir o saldo final do último fechamento
    if (cashboxSession && !cashboxSession.isOpen && cashboxSession.closingBalance !== null) {
      return cashboxSession.closingBalance || 0
    }

    return 0
  }, [cashboxSession])

  // Orçamento atual (último orçamento)
  const currentBudget = useMemo(() => {
    if (!budgets || budgets.length === 0) return null
    const sorted = [...budgets].sort((a, b) => {
      const parsePeriod = (period) => {
        const [month, year] = period.split('/')
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        return { year: parseInt(year), month: months.indexOf(month) }
      }
      const aDate = parsePeriod(a.period)
      const bDate = parsePeriod(b.period)
      if (aDate.year !== bDate.year) return bDate.year - aDate.year
      return bDate.month - aDate.month
    })
    return sorted[0]
  }, [budgets])

  const handleSubmit = () => {
    const amountNumber = Number(formState.amount)
    if (!formState.description.trim() || Number.isNaN(amountNumber) || amountNumber <= 0) return
    if (formState.type === 'orçamento' && !formState.budgetId) return
    
    const entryData = {
      type: formState.type,
      description: formState.description,
      amount: amountNumber,
      date: formState.date
    }
    
    if (formState.type === 'orçamento' && formState.budgetId) {
      entryData.budgetId = formState.budgetId
    } else {
      entryData.budgetId = undefined
    }
    
    if (editingId) {
      updateCashflowEntry(editingId, entryData)
    } else {
      addCashflowEntry({
        id: crypto.randomUUID(),
        ...entryData
      })
    }
    
    handleCloseModal()
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormState({
      type: 'entrada',
      description: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      budgetId: ''
    })
  }

  const handleEditClick = (entryId) => {
    setExpandedCardId(expandedCardId === entryId ? null : entryId)
  }

  const handleEdit = (entry) => {
    setEditingId(entry.id)
    setFormState({
      type: entry.type,
      description: entry.description,
      amount: entry.amount,
      date: entry.date,
      budgetId: entry.budgetId || ''
    })
    setIsModalOpen(true)
    setExpandedCardId(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      deleteCashflowEntry(id)
      setExpandedCardId(null)
    }
  }

  const handleOpenCashbox = async () => {
    const amount = Number(openingAmount)
    if (isNaN(amount) || amount < 0) {
      alert('Por favor, informe um valor válido para abertura do caixa.')
      return
    }

    try {
      setLoading(true)
      await api.openCashbox({ openingAmount: amount })
      setOpeningAmount('')
      setIsOpenModalOpen(false)
      await loadCashboxSession()
      alert('Caixa aberto com sucesso!')
    } catch (error) {
      alert(`Erro ao abrir caixa: ${error.message || 'Tente novamente.'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseCashbox = async () => {
    const balance = Number(closingBalance)
    if (isNaN(balance) || balance < 0) {
      alert('Por favor, informe um valor válido para o saldo de fechamento.')
      return
    }

    if (!window.confirm('Tem certeza que deseja fechar o caixa? Esta ação registrará o saldo final.')) {
      return
    }

    try {
      setLoading(true)
      await api.closeCashbox({ 
        closingBalance: balance,
        notes: closingNotes || null
      })
      setClosingBalance('')
      setClosingNotes('')
      setIsCloseModalOpen(false)
      await loadCashboxSession()
      alert('Caixa fechado com sucesso!')
    } catch (error) {
      alert(`Erro ao fechar caixa: ${error.message || 'Tente novamente.'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMovement = async () => {
    const amount = Number(movementAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, informe um valor válido maior que zero.')
      return
    }

    try {
      setLoading(true)
      await api.createCashboxMovement({
        type: movementType,
        amount: amount,
        description: movementDescription || null
      })
      setMovementAmount('')
      setMovementDescription('')
      setIsMovementModalOpen(false)
      await loadCashboxSession()
      alert(`${movementType === 'suprimento' ? 'Suprimento' : 'Sangria'} registrado com sucesso!`)
    } catch (error) {
      alert(`Erro ao registrar movimentação: ${error.message || 'Tente novamente.'}`)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const clearFilters = () => {
    setFilters({
      type: 'all',
      startDate: '',
      endDate: ''
    })
  }

  return (
    <div className="page cashflow-page">
      {/* CAMADA 1 — Status do Caixa (fixa e enxuta) */}
      {!cashflowPageSettings.showStatusSection && (
        <section className="page-stack">
          <div className="cashflow-status-bar">
            <div className="cashflow-status-left">
              <h1 className="cashflow-title">Fluxo de Caixa</h1>
              <span className={`cashflow-status-badge ${cashboxSession?.isOpen ? 'open' : 'closed'}`}>
                {cashboxSession?.isOpen ? '🟢 Caixa aberto' : '🔒 Caixa fechado'}
              </span>
            </div>

            <div className="cashflow-status-center" aria-label="Saldo atual do caixa">
              <span className="cashflow-balance-label">Saldo atual</span>
              <strong
                className="cashflow-balance-hero"
                style={{ color: currentBalance >= 0 ? 'var(--success)' : 'var(--error)' }}
              >
                {formatCurrency(currentBalance)}
              </strong>
            </div>

            <div className="cashflow-status-right">
              {!cashboxSession?.isOpen ? (
                <button className="primary-btn" type="button" onClick={() => setIsOpenModalOpen(true)} disabled={loading}>
                  <FiUnlock size={18} />
                  Abrir Caixa
                </button>
              ) : (
                <>
                  <button 
                    className="secondary-btn" 
                    type="button" 
                    onClick={() => {
                      setMovementType('suprimento')
                      setIsMovementModalOpen(true)
                    }}
                    disabled={loading}
                    style={{ marginRight: '0.5rem' }}
                  >
                    <FiPlus size={18} />
                    Suprimento
                  </button>
                  <button 
                    className="secondary-btn" 
                    type="button" 
                    onClick={() => {
                      setMovementType('sangria')
                      setIsMovementModalOpen(true)
                    }}
                    disabled={loading}
                    style={{ marginRight: '0.5rem' }}
                  >
                    <FiMinus size={18} />
                    Sangria
                  </button>
                  <button className="secondary-btn" type="button" onClick={() => setIsCloseModalOpen(true)} disabled={loading}>
                    <FiLock size={18} />
                    Fechar Caixa
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CAMADA 2 — Resumo Financeiro (unificado) */}
      {!cashflowPageSettings.showSummarySection && (
        <section className="page-stack">
          <div className="cashflow-layer-label">Resumo Financeiro</div>
          <div className="cashflow-mini-cards">
            <div className="cashflow-mini-card">
              <span>Entradas</span>
              <strong style={{ color: 'var(--success)' }}>{formatCurrency(summary.income)}</strong>
            </div>
            <div className="cashflow-mini-card">
              <span>Saídas</span>
              <strong style={{ color: 'var(--error)' }}>{formatCurrency(summary.expense)}</strong>
            </div>
            <div className="cashflow-mini-card highlight">
              <span>Resultado do período</span>
              <strong style={{ color: summary.balance >= 0 ? 'var(--success)' : 'var(--error)' }}>
                {summary.balance >= 0 ? '+' : ''}{formatCurrency(summary.balance)}
              </strong>
            </div>
            <div className="cashflow-mini-card">
              <span>Saldo final</span>
              <strong style={{ color: currentBalance >= 0 ? 'var(--success)' : 'var(--error)' }}>
                {formatCurrency(currentBalance)}
              </strong>
            </div>
          </div>
        </section>
      )}

      {/* CAMADA 3 — Detalhes do Caixa (colapsável) */}
      {!cashflowPageSettings.showDetailsSection && (
        <section className="page-stack">
          <div className="cashflow-layer-label">Detalhes do Caixa</div>
          <button
            type="button"
            className="cashflow-accordion-toggle"
            onClick={() => setShowSessionDetails((v) => !v)}
            aria-expanded={showSessionDetails}
          >
            <span className="cashflow-accordion-title">📂 Detalhes da Sessão de Caixa</span>
            {showSessionDetails ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
          </button>

          {showSessionDetails && cashboxSession && (
            <div className="cashflow-accordion-content">
              <div className="cashflow-details-grid">
                <div className="cashflow-detail">
                  <span>Valor de abertura</span>
                  <strong>{formatCurrency(cashboxSession.openingAmount || 0)}</strong>
                </div>
                <div className="cashflow-detail">
                  <span>Data/Hora de abertura</span>
                  <strong>{formatDateTime(cashboxSession.openingDate)}</strong>
                </div>
                {!cashboxSession.isOpen && cashboxSession.closingDate && (
                  <>
                    <div className="cashflow-detail">
                      <span>Data/Hora de fechamento</span>
                      <strong>{formatDateTime(cashboxSession.closingDate)}</strong>
                    </div>
                    <div className="cashflow-detail">
                      <span>Saldo esperado</span>
                      <strong>{formatCurrency(cashboxSession.expectedBalance || 0)}</strong>
                    </div>
                    <div className="cashflow-detail">
                      <span>Saldo real</span>
                      <strong>{formatCurrency(cashboxSession.closingBalance || 0)}</strong>
                    </div>
                    <div className="cashflow-detail">
                      <span>Diferença (conferência)</span>
                      <strong style={{ color: (cashboxSession.difference || 0) === 0 ? 'var(--success)' : 'var(--error)' }}>
                        {formatCurrency(cashboxSession.difference || 0)}
                      </strong>
                    </div>
                  </>
                )}
                {cashboxSession.isOpen && (
                  <>
                    <div className="cashflow-detail">
                      <span>Total suprimentos</span>
                      <strong style={{ color: 'var(--success)' }}>{formatCurrency(cashboxSession.totalSuprimentos || 0)}</strong>
                    </div>
                    <div className="cashflow-detail">
                      <span>Total sangrias</span>
                      <strong style={{ color: 'var(--error)' }}>{formatCurrency(cashboxSession.totalSangrias || 0)}</strong>
                    </div>
                  </>
                )}
                <div className="cashflow-detail">
                  <span>Lucro médio por venda</span>
                  <strong style={{ color: salesSummary.avgProfit >= 0 ? 'var(--success)' : 'var(--error)' }}>
                    {formatCurrency(salesSummary.avgProfit)}
                  </strong>
                </div>
              </div>
              
              {/* Lista de movimentações (suprimento/sangria) */}
              {cashboxSession.isOpen && cashboxMovements.length > 0 && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 600 }}>Movimentações do Caixa</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {cashboxMovements.map((movement) => (
                      <div 
                        key={movement.id} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '0.75rem',
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {movement.type === 'suprimento' ? '➕ Suprimento' : '➖ Sangria'}
                          </span>
                          {movement.description && (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              {movement.description}
                            </span>
                          )}
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {formatDateTime(movement.createdAt)}
                          </span>
                        </div>
                        <strong style={{ 
                          color: movement.type === 'suprimento' ? 'var(--success)' : 'var(--error)',
                          fontSize: '1.1rem'
                        }}>
                          {movement.type === 'suprimento' ? '+' : '-'}{formatCurrency(movement.amount)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentBudget && (
                <div className="cashflow-details-budget">
                  <div className="cashflow-detail">
                    <span>Orçamento</span>
                    <strong>{currentBudget.period}</strong>
                  </div>
                  <div className="cashflow-detail">
                    <span>Valor orçado</span>
                    <strong>{formatCurrency(currentBudget.amount)}</strong>
                  </div>
                  <div className="cashflow-detail">
                    <span>Gasto</span>
                    <strong style={{ color: 'var(--error)' }}>{formatCurrency(currentBudget.spent || 0)}</strong>
                  </div>
                  <div className="cashflow-detail">
                    <span>Disponível</span>
                    <strong style={{ color: 'var(--success)' }}>
                      {formatCurrency((currentBudget.amount || 0) - (currentBudget.spent || 0))}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* CAMADA 4 — Movimentações (foco operacional) */}
      {!cashflowPageSettings.showMovementsSection && (
        <section className="page-stack">
          <div className="page-header">
          <h2 className="cashflow-section-title">Movimentações</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              type="button"
              className={`secondary-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter size={18} />
              Filtros
            </button>
            <button
              className="primary-btn"
              type="button"
              onClick={() => {
                setFormState({ ...formState, type: 'saída' })
                setIsModalOpen(true)
              }}
            >
              Adicionar Despesa
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="cashflow-filters">
            <div className="cashflow-filter-group">
              <label>Tipo de Movimentação</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="all">Todos</option>
                <option value="entrada">Entradas</option>
                <option value="saída">Saídas</option>
              </select>
            </div>
            <div className="cashflow-filter-group">
              <label>Data Inicial</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="cashflow-filter-group">
              <label>Data Final</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="cashflow-filter-group">
              <label>Período</label>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    const today = new Date()
                    let startDate = ''
                    let endDate = today.toISOString().split('T')[0]
                    
                    switch (e.target.value) {
                      case 'hoje':
                        startDate = endDate
                        break
                      case 'semana': {
                        const weekAgo = new Date(today)
                        weekAgo.setDate(today.getDate() - 7)
                        startDate = weekAgo.toISOString().split('T')[0]
                        break
                      }
                      case 'mes': {
                        const monthAgo = new Date(today)
                        monthAgo.setMonth(today.getMonth() - 1)
                        startDate = monthAgo.toISOString().split('T')[0]
                        break
                      }
                      case 'trimestre': {
                        const quarterAgo = new Date(today)
                        quarterAgo.setMonth(today.getMonth() - 3)
                        startDate = quarterAgo.toISOString().split('T')[0]
                        break
                      }
                      case 'ano': {
                        const yearAgo = new Date(today)
                        yearAgo.setFullYear(today.getFullYear() - 1)
                        startDate = yearAgo.toISOString().split('T')[0]
                        break
                      }
                    }
                    setFilters({ ...filters, startDate, endDate })
                  }
                }}
              >
                <option value="">Selecione um período</option>
                <option value="hoje">Hoje</option>
                <option value="semana">Últimos 7 dias</option>
                <option value="mes">Último mês</option>
                <option value="trimestre">Último trimestre</option>
                <option value="ano">Último ano</option>
              </select>
            </div>
            <button
              type="button"
              className="ghost-btn"
              onClick={clearFilters}
            >
              Limpar Filtros
            </button>
          </div>
        )}

        <div className="cashflow-movements-table">
          <div className="cashflow-table-header">
            <div className="cashflow-table-col date">Data</div>
            <div className="cashflow-table-col type">Tipo</div>
            <div className="cashflow-table-col origin">Origem</div>
            <div className="cashflow-table-col value">Valor</div>
            <div className="cashflow-table-col actions">Ações</div>
          </div>
          <div className="cashflow-table-body">
            {filteredCashflow.length > 0 ? (
              filteredCashflow.map((entry) => (
                <div key={entry.id} className="cashflow-table-row">
                  <div className="cashflow-table-col date">
                    {new Date(entry.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="cashflow-table-col type">
                    <span className={`cashflow-type-badge ${entry.type === 'entrada' ? 'entry' : 'exit'}`}>
                      {entry.type === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </div>
                  <div className="cashflow-table-col origin">
                    <div className="cashflow-origin-content">
                      <strong>{entry.description}</strong>
                      {entry.category && (
                        <span className="cashflow-origin-category">{entry.category}</span>
                      )}
                    </div>
                  </div>
                  <div className="cashflow-table-col value">
                    <strong className={`cashflow-value ${entry.type === 'entrada' ? 'entry' : 'exit'}`}>
                      {entry.type === 'entrada' ? '+' : '-'} {formatCurrency(entry.amount)}
                    </strong>
                  </div>
                  <div className="cashflow-table-col actions">
                    <div ref={menuRef} style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => handleEditClick(entry.id)}
                        className="cashflow-action-btn"
                      >
                        <FiEdit3 size={18} />
                      </button>
                      {expandedCardId === entry.id && (
                        <div className="cashflow-action-menu">
                          <button
                            type="button"
                            onClick={() => handleEdit(entry)}
                            className="cashflow-action-menu-item"
                          >
                            <FiEdit3 size={16} />
                            Editar
                          </button>
                          <div className="cashflow-action-menu-divider" />
                          <button
                            type="button"
                            onClick={() => handleDelete(entry.id)}
                            className="cashflow-action-menu-item delete"
                          >
                            <FiTrash2 size={16} />
                            Deletar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="cashflow-empty-state">
                Nenhuma movimentação encontrada com os filtros aplicados.
              </div>
            )}
          </div>
        </div>
        </section>
      )}

      {/* Modal de Abertura de Caixa */}
      <FormModal
        isOpen={isOpenModalOpen}
        title="Abrir Caixa"
        description="Informe o valor inicial para abertura do caixa."
        onClose={() => {
          setIsOpenModalOpen(false)
          setOpeningAmount('')
        }}
        footer={
          <>
            <button className="ghost-btn" type="button" onClick={() => {
              setIsOpenModalOpen(false)
              setOpeningAmount('')
            }}>
              Cancelar
            </button>
            <button className="primary-btn" type="button" onClick={handleOpenCashbox} disabled={loading}>
              Abrir Caixa
            </button>
          </>
        }
      >
        <CurrencyInput
          label="Valor Inicial"
          value={openingAmount}
          onChange={setOpeningAmount}
          placeholder="0,00"
        />
      </FormModal>

      {/* Modal de Fechamento de Caixa */}
      <FormModal
        isOpen={isCloseModalOpen}
        title="Fechar Caixa"
        description="Confirme o fechamento do caixa. O saldo final será registrado."
        onClose={() => {
          setIsCloseModalOpen(false)
          setClosingBalance('')
          setClosingNotes('')
        }}
        footer={
          <>
            <button className="ghost-btn" type="button" onClick={() => {
              setIsCloseModalOpen(false)
              setClosingBalance('')
              setClosingNotes('')
            }}>
              Cancelar
            </button>
            <button className="primary-btn" type="button" onClick={handleCloseCashbox} disabled={loading}>
              Fechar Caixa
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
          <div>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Saldo esperado (calculado):
            </p>
            <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>
              {formatCurrency(cashboxSession?.expectedBalance || currentBalance)}
            </p>
          </div>
          <CurrencyInput
            label="Saldo Real Encontrado"
            value={closingBalance}
            onChange={setClosingBalance}
            placeholder="0,00"
          />
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
              Observações (opcional)
            </label>
            <textarea
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              placeholder="Ex: Diferença devido a troco..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
          {cashboxSession && cashboxSession.expectedBalance !== null && (
            <div style={{ 
              padding: '0.75rem', 
              backgroundColor: 'var(--bg-secondary)', 
              borderRadius: '0.5rem',
              fontSize: '0.85rem'
            }}>
              <strong>Diferença:</strong>{' '}
              <span style={{ 
                color: (Number(closingBalance || 0) - (cashboxSession.expectedBalance || 0)) === 0 
                  ? 'var(--success)' 
                  : 'var(--error)'
              }}>
                {formatCurrency((Number(closingBalance || 0) - (cashboxSession.expectedBalance || 0)))}
              </span>
            </div>
          )}
        </div>
      </FormModal>

      {/* Modal de Movimentação (Suprimento/Sangria) */}
      <FormModal
        isOpen={isMovementModalOpen}
        title={movementType === 'suprimento' ? 'Adicionar Suprimento' : 'Registrar Sangria'}
        description={movementType === 'suprimento' 
          ? 'Adicione dinheiro ao caixa (ex: troco inicial, reposição).'
          : 'Retire dinheiro do caixa (ex: troco para cliente, saque).'}
        onClose={() => {
          setIsMovementModalOpen(false)
          setMovementAmount('')
          setMovementDescription('')
        }}
        footer={
          <>
            <button className="ghost-btn" type="button" onClick={() => {
              setIsMovementModalOpen(false)
              setMovementAmount('')
              setMovementDescription('')
            }}>
              Cancelar
            </button>
            <button 
              className={movementType === 'suprimento' ? 'primary-btn' : 'secondary-btn'} 
              type="button" 
              onClick={handleCreateMovement}
              disabled={loading}
            >
              {movementType === 'suprimento' ? 'Adicionar' : 'Retirar'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
          <CurrencyInput
            label="Valor"
            value={movementAmount}
            onChange={setMovementAmount}
            placeholder="0,00"
          />
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
              Descrição/Motivo (opcional)
            </label>
            <input
              type="text"
              value={movementDescription}
              onChange={(e) => setMovementDescription(e.target.value)}
              placeholder={movementType === 'suprimento' ? 'Ex: Troco inicial' : 'Ex: Troco para cliente'}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
      </FormModal>

      {/* Modal de Lançamento */}
      <FormModal
        isOpen={isModalOpen}
        title={editingId ? "Editar lançamento" : "Novo lançamento"}
        description="Registre entradas e saídas para manter o fluxo de caixa atualizado."
        onClose={handleCloseModal}
        footer={
          <>
            <button className="ghost-btn" type="button" onClick={handleCloseModal}>
              Cancelar
            </button>
            <button className="primary-btn" type="button" onClick={handleSubmit}>
              {editingId ? 'Atualizar lançamento' : 'Salvar lançamento'}
            </button>
          </>
        }
      >
        <label className="input-control">
          <span>Tipo</span>
          <select 
            value={formState.type} 
            onChange={(event) => {
              const newType = event.target.value
              setFormState((prev) => ({ 
                ...prev, 
                type: newType,
                budgetId: newType !== 'orçamento' ? '' : prev.budgetId
              }))
            }}
            disabled={editingId !== null}
          >
            <option value="entrada">Entrada</option>
            <option value="saída">Saída</option>
            <option value="orçamento">Orçamento</option>
          </select>
        </label>
        {formState.type === 'orçamento' && (
          <label className="input-control">
            <span>Nome orçamento</span>
            <select 
              value={formState.budgetId} 
              onChange={(event) => {
                const selectedBudgetId = event.target.value
                const selectedBudget = budgets.find(b => b.id === selectedBudgetId)
                if (selectedBudget) {
                  setFormState((prev) => ({ 
                    ...prev, 
                    budgetId: selectedBudgetId,
                    description: selectedBudget.period,
                    amount: selectedBudget.amount
                  }))
                } else {
                  setFormState((prev) => ({ 
                    ...prev, 
                    budgetId: '',
                    description: '',
                    amount: ''
                  }))
                }
              }}
              disabled={editingId !== null}
            >
              <option value="">Selecione um orçamento</option>
              {budgets.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.period}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="input-control">
          <span>Descrição</span>
          <input 
            value={formState.description} 
            onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
            disabled={(formState.type === 'orçamento' && formState.budgetId !== '') || editingId !== null}
          />
        </label>
        <CurrencyInput 
          label="Valor" 
          value={formState.amount === '' ? '' : String(formState.amount)} 
          onChange={(value) => setFormState((prev) => ({ ...prev, amount: value }))}
          disabled={formState.type === 'orçamento' && formState.budgetId !== ''}
        />
        <label className="input-control">
          <span>Data</span>
          <input type="date" value={formState.date} onChange={(event) => setFormState((prev) => ({ ...prev, date: event.target.value }))} />
        </label>
      </FormModal>
    </div>
  )
}
