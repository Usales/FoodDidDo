import { useMemo, useState, useEffect, useRef } from 'react'
import { FormModal } from '../components/ui/FormModal'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { useAppStore } from '../stores/appStore'
import { FiEdit3, FiTrash2, FiLock, FiUnlock, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import './PageCommon.css'
import './CashflowPage.css'

const CASHBOX_STORAGE_KEY = 'cashboxData'
const CASHFLOW_PAGE_SETTINGS_KEY = 'cashflowPageSettings'
const typeLabels = {
  entrada: 'Entrada',
  saída: 'Saída',
  orçamento: 'Orçamento'
}

const defaultCashboxData = {
  isOpen: false,
  openingAmount: 0,
  openingDate: null,
  closingDate: null,
  closingBalance: 0,
  totalEntries: 0,
  totalExits: 0
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
  const [cashboxData, setCashboxData] = useState(defaultCashboxData)
  const [cashflowPageSettings, setCashflowPageSettings] = useState(defaultCashflowPageSettings)
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [openingAmount, setOpeningAmount] = useState('')
  const [showSessionDetails, setShowSessionDetails] = useState(false)
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

  // Carregar dados do caixa do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CASHBOX_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setCashboxData({ ...defaultCashboxData, ...parsed })
      }
    } catch (error) {
      console.error('Erro ao carregar dados do caixa:', error)
    }
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

  // Salvar dados do caixa no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CASHBOX_STORAGE_KEY, JSON.stringify(cashboxData))
    } catch (error) {
      console.error('Erro ao salvar dados do caixa:', error)
    }
  }, [cashboxData])

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
    if (cashboxData.isOpen) {
      return cashboxData.openingAmount + summary.income - summary.expense
    }

    // Se o caixa estiver fechado e houver um fechamento registrado, exibir o saldo final do último fechamento
    if (!cashboxData.isOpen && cashboxData.closingDate) {
      return cashboxData.closingBalance || 0
    }

    return 0
  }, [
    cashboxData.isOpen,
    cashboxData.openingAmount,
    cashboxData.closingDate,
    cashboxData.closingBalance,
    summary.income,
    summary.expense
  ])

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

  const handleOpenCashbox = () => {
    const amount = Number(openingAmount)
    if (isNaN(amount) || amount < 0) {
      alert('Por favor, informe um valor válido para abertura do caixa.')
      return
    }

    setCashboxData({
      isOpen: true,
      openingAmount: amount,
      openingDate: new Date().toISOString(),
      closingDate: null,
      closingBalance: 0,
      totalEntries: 0,
      totalExits: 0
    })

    setOpeningAmount('')
    setIsOpenModalOpen(false)
  }

  const handleCloseCashbox = () => {
    if (!window.confirm('Tem certeza que deseja fechar o caixa? Esta ação registrará o saldo final.')) {
      return
    }

    setCashboxData((prev) => ({
      ...prev,
      isOpen: false,
      closingDate: new Date().toISOString(),
      closingBalance: currentBalance,
      totalEntries: summary.income,
      totalExits: summary.expense
    }))

    setIsCloseModalOpen(false)
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
              <span className={`cashflow-status-badge ${cashboxData.isOpen ? 'open' : 'closed'}`}>
                {cashboxData.isOpen ? '🟢 Caixa aberto' : '🔒 Caixa fechado'}
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
              {!cashboxData.isOpen ? (
                <button className="primary-btn" type="button" onClick={() => setIsOpenModalOpen(true)}>
                  <FiUnlock size={18} />
                  Abrir Caixa
                </button>
              ) : (
                <button className="secondary-btn" type="button" onClick={() => setIsCloseModalOpen(true)}>
                  <FiLock size={18} />
                  Fechar Caixa
                </button>
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

          {showSessionDetails && (
            <div className="cashflow-accordion-content">
              <div className="cashflow-details-grid">
                <div className="cashflow-detail">
                  <span>Valor de abertura</span>
                  <strong>{formatCurrency(cashboxData.openingAmount)}</strong>
                </div>
                <div className="cashflow-detail">
                  <span>Data/Hora de abertura</span>
                  <strong>{formatDateTime(cashboxData.openingDate)}</strong>
                </div>
                {!cashboxData.isOpen && (
                  <div className="cashflow-detail">
                    <span>Data/Hora de fechamento</span>
                    <strong>{formatDateTime(cashboxData.closingDate)}</strong>
                  </div>
                )}
                <div className="cashflow-detail">
                  <span>Lucro médio por venda</span>
                  <strong style={{ color: salesSummary.avgProfit >= 0 ? 'var(--success)' : 'var(--error)' }}>
                    {formatCurrency(salesSummary.avgProfit)}
                  </strong>
                </div>
              </div>

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
            <button className="primary-btn" type="button" onClick={handleOpenCashbox}>
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
        onClose={() => setIsCloseModalOpen(false)}
        footer={
          <>
            <button className="ghost-btn" type="button" onClick={() => setIsCloseModalOpen(false)}>
              Cancelar
            </button>
            <button className="primary-btn" type="button" onClick={handleCloseCashbox}>
              Fechar Caixa
            </button>
          </>
        }
      >
        <div className="cashflow-close-summary">
          <div className="cashflow-close-item">
            <span>Valor Inicial:</span>
            <strong>{formatCurrency(cashboxData.openingAmount)}</strong>
          </div>
          <div className="cashflow-close-item">
            <span>Total de Entradas:</span>
            <strong style={{ color: 'var(--success)' }}>{formatCurrency(summary.income)}</strong>
          </div>
          <div className="cashflow-close-item">
            <span>Total de Saídas:</span>
            <strong style={{ color: 'var(--error)' }}>{formatCurrency(summary.expense)}</strong>
          </div>
          <div className="cashflow-close-item total">
            <span>Saldo Final:</span>
            <strong style={{ color: currentBalance >= 0 ? 'var(--success)' : 'var(--error)' }}>
              {formatCurrency(currentBalance)}
            </strong>
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
