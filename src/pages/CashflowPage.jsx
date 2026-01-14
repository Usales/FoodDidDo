import { useMemo, useState, useEffect, useRef } from 'react'
import { FormModal } from '../components/ui/FormModal'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { useAppStore } from '../stores/appStore'
import { FiEdit3, FiSave, FiTrash2, FiLock, FiUnlock, FiFilter, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi'
import './PageCommon.css'
import './CashflowPage.css'

const CASHBOX_STORAGE_KEY = 'cashboxData'
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
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [openingAmount, setOpeningAmount] = useState('')
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

  // Calcular saldo atual do caixa
  const currentBalance = useMemo(() => {
    if (!cashboxData.isOpen) return 0
    return cashboxData.openingAmount + summary.income - summary.expense
  }, [cashboxData.isOpen, cashboxData.openingAmount, summary.income, summary.expense])

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
      {/* Status do Caixa */}
      <section className="page-stack">
        <div className="cashflow-status-card">
          <div className="cashflow-status-header">
            <div className="cashflow-status-icon">
              {cashboxData.isOpen ? (
                <FiUnlock size={32} style={{ color: 'var(--success)' }} />
              ) : (
                <FiLock size={32} style={{ color: 'var(--text-muted)' }} />
              )}
            </div>
            <div className="cashflow-status-info">
              <h2>Status do Caixa</h2>
              <span className={`cashflow-status-badge ${cashboxData.isOpen ? 'open' : 'closed'}`}>
                {cashboxData.isOpen ? 'Aberto' : 'Fechado'}
              </span>
            </div>
          </div>
          <div className="cashflow-status-actions">
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

      {/* Resumo Financeiro */}
      <section className="page-stack">
        <div className="summary-grid">
          <div className="summary-card">
            <span>Total de Entradas</span>
            <strong style={{ color: 'var(--success)' }}>
              {formatCurrency(summary.income)}
            </strong>
            <small>{summary.entriesCount} registro(s)</small>
          </div>
          <div className="summary-card">
            <span>Total de Saídas</span>
            <strong style={{ color: 'var(--error)' }}>
              {formatCurrency(summary.expense)}
            </strong>
            <small>{summary.exitsCount} registro(s)</small>
          </div>
          <div className="summary-card">
            <span>Saldo Atual</span>
            <strong style={{ color: currentBalance >= 0 ? 'var(--success)' : 'var(--error)' }}>
              {formatCurrency(currentBalance)}
            </strong>
            {cashboxData.isOpen && (
              <small>Caixa aberto</small>
            )}
          </div>
        </div>
      </section>

      {/* Relatório Consolidado */}
      <section className="page-stack">
        <div className="cashflow-report-card">
          <h3>
            <FiDollarSign size={20} />
            Relatório Consolidado
          </h3>
          <div className="cashflow-report-grid">
            <div className="cashflow-report-item">
              <span>Total de Entradas:</span>
              <strong style={{ color: 'var(--success)' }}>
                {formatCurrency(summary.income)}
              </strong>
            </div>
            <div className="cashflow-report-item">
              <span>Total de Saídas:</span>
              <strong style={{ color: 'var(--error)' }}>
                {formatCurrency(summary.expense)}
              </strong>
            </div>
            <div className="cashflow-report-item">
              <span>Diferença:</span>
              <strong style={{ color: summary.balance >= 0 ? 'var(--success)' : 'var(--error)' }}>
                {summary.balance >= 0 ? '+' : ''}{formatCurrency(summary.balance)}
              </strong>
            </div>
            {summary.profit > 0 && (
              <div className="cashflow-report-item profit">
                <span>
                  <FiTrendingUp size={16} />
                  Lucro:
                </span>
                <strong style={{ color: 'var(--success)' }}>
                  {formatCurrency(summary.profit)}
                </strong>
              </div>
            )}
            {summary.loss > 0 && (
              <div className="cashflow-report-item loss">
                <span>
                  <FiTrendingDown size={16} />
                  Prejuízo:
                </span>
                <strong style={{ color: 'var(--error)' }}>
                  {formatCurrency(summary.loss)}
                </strong>
              </div>
            )}
            {cashboxData.isOpen && (
              <div className="cashflow-report-item total">
                <span>Saldo Final do Caixa:</span>
                <strong style={{ color: currentBalance >= 0 ? 'var(--success)' : 'var(--error)' }}>
                  {formatCurrency(currentBalance)}
                </strong>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Informações de Abertura e Fechamento */}
      <section className="page-stack">
        <div className="cashflow-info-grid">
          <div className="cashflow-info-card">
            <h3>
              <FiUnlock size={20} />
              Abertura de Caixa
            </h3>
            <div className="cashflow-info-content">
              <div className="cashflow-info-item">
                <span>Valor Inicial:</span>
                <strong>{formatCurrency(cashboxData.openingAmount)}</strong>
              </div>
              <div className="cashflow-info-item">
                <span>Data/Hora:</span>
                <strong>{formatDateTime(cashboxData.openingDate)}</strong>
              </div>
            </div>
          </div>

          {!cashboxData.isOpen && cashboxData.closingDate && (
            <div className="cashflow-info-card">
              <h3>
                <FiLock size={20} />
                Fechamento de Caixa
              </h3>
              <div className="cashflow-info-content">
                <div className="cashflow-info-item">
                  <span>Saldo Final:</span>
                  <strong style={{ color: cashboxData.closingBalance >= 0 ? 'var(--success)' : 'var(--error)' }}>
                    {formatCurrency(cashboxData.closingBalance)}
                  </strong>
                </div>
                <div className="cashflow-info-item">
                  <span>Total de Entradas:</span>
                  <strong>{formatCurrency(cashboxData.totalEntries)}</strong>
                </div>
                <div className="cashflow-info-item">
                  <span>Total de Saídas:</span>
                  <strong>{formatCurrency(cashboxData.totalExits)}</strong>
                </div>
                <div className="cashflow-info-item">
                  <span>Data/Hora:</span>
                  <strong>{formatDateTime(cashboxData.closingDate)}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Orçamento Definido */}
      {currentBudget && (
        <section className="page-stack">
          <div className="cashflow-budget-card">
            <h3>
              <FiDollarSign size={20} />
              Orçamento Definido
            </h3>
            <div className="cashflow-budget-content">
              <div className="cashflow-budget-item">
                <span>Período:</span>
                <strong>{currentBudget.period}</strong>
              </div>
              <div className="cashflow-budget-item">
                <span>Valor Orçado:</span>
                <strong>{formatCurrency(currentBudget.amount)}</strong>
              </div>
              <div className="cashflow-budget-item">
                <span>Gasto:</span>
                <strong style={{ color: 'var(--error)' }}>
                  {formatCurrency(currentBudget.spent || 0)}
                </strong>
              </div>
              <div className="cashflow-budget-item">
                <span>Disponível:</span>
                <strong style={{ color: 'var(--success)' }}>
                  {formatCurrency((currentBudget.amount || 0) - (currentBudget.spent || 0))}
                </strong>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filtros */}
      <section className="page-stack">
        <div className="page-header">
          <h2>Fluxo de Caixa</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              type="button"
              className={`secondary-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter size={18} />
              Filtros
            </button>
            <button className="primary-btn" type="button" onClick={() => setIsModalOpen(true)}>
              Registrar lançamento
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
            <button
              type="button"
              className="ghost-btn"
              onClick={clearFilters}
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </section>

      {/* Lista de Movimentações */}
      <section className="page-stack">
        <div className="card-grid">
          {filteredCashflow.length > 0 ? (
            filteredCashflow.map((entry) => (
              <article key={entry.id} className="card-tile" style={{ position: 'relative' }}>
                <header>
                  <h3>{typeLabels[entry.type] ?? entry.type}</h3>
                  <span className="pill">{new Date(entry.date).toLocaleDateString('pt-BR')}</span>
                </header>
                <div className="divider" />
                <div className="cashflow-meta">
                  <span>{entry.description}</span>
                  <strong style={{ color: entry.type === 'entrada' ? 'var(--brand-aqua-dark)' : entry.type === 'orçamento' ? 'var(--brand-orange, #ff9800)' : 'var(--brand-red)' }}>
                    {entry.type === 'entrada' ? '+' : entry.type === 'orçamento' ? '' : '-'} R$ {entry.amount.toFixed(2)}
                  </strong>
                </div>
                {entry.category && (
                  <div className="cashflow-category">
                    <span>{entry.category}</span>
                  </div>
                )}
                <div ref={menuRef} style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => handleEditClick(entry.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                      borderRadius: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--input-bg)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }}
                  >
                    <FiEdit3 size={18} />
                  </button>
                  {expandedCardId === entry.id && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '2.5rem',
                        right: '0',
                        background: 'var(--panel-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        padding: '0.5rem',
                        minWidth: '120px',
                        zIndex: 10
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleEdit(entry)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: 'var(--text-primary)',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--input-bg)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <FiEdit3 size={16} />
                        Editar
                      </button>
                      <div
                        style={{
                          height: '1px',
                          background: 'var(--border-color)',
                          margin: '0.25rem 0'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: 'var(--brand-red)',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--input-bg)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <FiTrash2 size={16} />
                        Deletar
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="card-tile">Nenhum lançamento encontrado com os filtros aplicados.</div>
          )}
        </div>
      </section>

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
