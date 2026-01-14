import { useMemo, useState, useEffect } from 'react'
import { FormModal } from '../components/ui/FormModal'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { useAppStore } from '../stores/appStore'
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiLock, FiUnlock, FiClock } from 'react-icons/fi'
import './PageCommon.css'
import './CashboxPage.css'

const CASHBOX_STORAGE_KEY = 'cashboxData'

const defaultCashboxData = {
  isOpen: false,
  openingAmount: 0,
  openingDate: null,
  closingDate: null,
  closingBalance: 0,
  totalEntries: 0,
  totalExits: 0
}

export function CashboxPage() {
  const cashflow = useAppStore((state) => state.cashflow)
  const budgets = useAppStore((state) => state.budgets)
  const recipes = useAppStore((state) => state.recipes)
  
  const [cashboxData, setCashboxData] = useState(defaultCashboxData)
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [openingAmount, setOpeningAmount] = useState('')

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

  // Calcular totais de entradas e saídas
  const totals = useMemo(() => {
    const entries = cashflow.filter((entry) => entry.type === 'entrada')
    const exits = cashflow.filter((entry) => entry.type === 'saída')
    
    const totalEntries = entries.reduce((sum, entry) => sum + (entry.amount || 0), 0)
    const totalExits = exits.reduce((sum, entry) => sum + (entry.amount || 0), 0)
    
    return {
      entries: totalEntries,
      exits: totalExits,
      entriesCount: entries.length,
      exitsCount: exits.length
    }
  }, [cashflow])

  // Calcular saldo atual
  const currentBalance = useMemo(() => {
    if (!cashboxData.isOpen) return 0
    return cashboxData.openingAmount + totals.entries - totals.exits
  }, [cashboxData.isOpen, cashboxData.openingAmount, totals.entries, totals.exits])

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

  // Histórico de movimentações (ordenado por data)
  const history = useMemo(() => {
    return [...cashflow].sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateB - dateA // Mais recente primeiro
    })
  }, [cashflow])

  // Receitas registradas (entradas relacionadas a receitas)
  const recipeEntries = useMemo(() => {
    return cashflow.filter((entry) => {
      if (entry.type !== 'entrada') return false
      // Verificar se a descrição contém nome de receita
      return recipes.some((recipe) => 
        entry.description.toLowerCase().includes(recipe.name.toLowerCase())
      )
    })
  }, [cashflow, recipes])

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
      totalEntries: totals.entries,
      totalExits: totals.exits
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

  return (
    <div className="page cashbox-page">
      {/* Status do Caixa */}
      <section className="page-stack">
        <div className="cashbox-status-card">
          <div className="cashbox-status-header">
            <div className="cashbox-status-icon">
              {cashboxData.isOpen ? (
                <FiUnlock size={32} style={{ color: 'var(--success)' }} />
              ) : (
                <FiLock size={32} style={{ color: 'var(--text-muted)' }} />
              )}
            </div>
            <div className="cashbox-status-info">
              <h2>Status do Caixa</h2>
              <span className={`cashbox-status-badge ${cashboxData.isOpen ? 'open' : 'closed'}`}>
                {cashboxData.isOpen ? 'Aberto' : 'Fechado'}
              </span>
            </div>
          </div>
          <div className="cashbox-status-actions">
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
            <span>Saldo Atual</span>
            <strong style={{ color: currentBalance >= 0 ? 'var(--success)' : 'var(--error)' }}>
              {formatCurrency(currentBalance)}
            </strong>
          </div>
          <div className="summary-card">
            <span>Total de Entradas</span>
            <strong style={{ color: 'var(--success)' }}>
              {formatCurrency(totals.entries)}
            </strong>
            <small>{totals.entriesCount} registro(s)</small>
          </div>
          <div className="summary-card">
            <span>Total de Saídas</span>
            <strong style={{ color: 'var(--error)' }}>
              {formatCurrency(totals.exits)}
            </strong>
            <small>{totals.exitsCount} registro(s)</small>
          </div>
        </div>
      </section>

      {/* Informações de Abertura e Fechamento */}
      <section className="page-stack">
        <div className="cashbox-info-grid">
          <div className="cashbox-info-card">
            <h3>
              <FiClock size={20} />
              Abertura de Caixa
            </h3>
            <div className="cashbox-info-content">
              <div className="cashbox-info-item">
                <span>Valor Inicial:</span>
                <strong>{formatCurrency(cashboxData.openingAmount)}</strong>
              </div>
              <div className="cashbox-info-item">
                <span>Data/Hora:</span>
                <strong>{formatDateTime(cashboxData.openingDate)}</strong>
              </div>
            </div>
          </div>

          {!cashboxData.isOpen && cashboxData.closingDate && (
            <div className="cashbox-info-card">
              <h3>
                <FiLock size={20} />
                Fechamento de Caixa
              </h3>
              <div className="cashbox-info-content">
                <div className="cashbox-info-item">
                  <span>Saldo Final:</span>
                  <strong style={{ color: cashboxData.closingBalance >= 0 ? 'var(--success)' : 'var(--error)' }}>
                    {formatCurrency(cashboxData.closingBalance)}
                  </strong>
                </div>
                <div className="cashbox-info-item">
                  <span>Total de Entradas:</span>
                  <strong>{formatCurrency(cashboxData.totalEntries)}</strong>
                </div>
                <div className="cashbox-info-item">
                  <span>Total de Saídas:</span>
                  <strong>{formatCurrency(cashboxData.totalExits)}</strong>
                </div>
                <div className="cashbox-info-item">
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
          <div className="cashbox-budget-card">
            <h3>
              <FiDollarSign size={20} />
              Orçamento Definido
            </h3>
            <div className="cashbox-budget-content">
              <div className="cashbox-budget-item">
                <span>Período:</span>
                <strong>{currentBudget.period}</strong>
              </div>
              <div className="cashbox-budget-item">
                <span>Valor Orçado:</span>
                <strong>{formatCurrency(currentBudget.amount)}</strong>
              </div>
              <div className="cashbox-budget-item">
                <span>Gasto:</span>
                <strong style={{ color: 'var(--error)' }}>
                  {formatCurrency(currentBudget.spent || 0)}
                </strong>
              </div>
              <div className="cashbox-budget-item">
                <span>Disponível:</span>
                <strong style={{ color: 'var(--success)' }}>
                  {formatCurrency((currentBudget.amount || 0) - (currentBudget.spent || 0))}
                </strong>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Entradas (Receitas Registradas) */}
      <section className="page-stack">
        <div className="page-header">
          <h2>
            <FiTrendingUp size={24} style={{ marginRight: '0.5rem', color: 'var(--success)' }} />
            Entradas (Receitas Registradas)
          </h2>
        </div>
        <div className="cashbox-entries-list">
          {recipeEntries.length > 0 ? (
            recipeEntries.map((entry) => (
              <div key={entry.id} className="cashbox-entry-item entry">
                <div className="cashbox-entry-icon">
                  <FiTrendingUp size={20} />
                </div>
                <div className="cashbox-entry-content">
                  <div className="cashbox-entry-header">
                    <strong>{entry.description}</strong>
                    <span className="cashbox-entry-date">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="cashbox-entry-amount positive">
                    + {formatCurrency(entry.amount)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="cashbox-empty-state">
              Nenhuma entrada de receita registrada.
            </div>
          )}
        </div>
      </section>

      {/* Saídas (Despesas Registradas) */}
      <section className="page-stack">
        <div className="page-header">
          <h2>
            <FiTrendingDown size={24} style={{ marginRight: '0.5rem', color: 'var(--error)' }} />
            Saídas (Despesas Registradas)
          </h2>
        </div>
        <div className="cashbox-entries-list">
          {totals.exitsCount > 0 ? (
            cashflow
              .filter((entry) => entry.type === 'saída')
              .map((entry) => (
                <div key={entry.id} className="cashbox-entry-item exit">
                  <div className="cashbox-entry-icon">
                    <FiTrendingDown size={20} />
                  </div>
                  <div className="cashbox-entry-content">
                    <div className="cashbox-entry-header">
                      <strong>{entry.description}</strong>
                      <span className="cashbox-entry-date">
                        {new Date(entry.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="cashbox-entry-amount negative">
                      - {formatCurrency(entry.amount)}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="cashbox-empty-state">
              Nenhuma saída registrada.
            </div>
          )}
        </div>
      </section>

      {/* Histórico de Movimentações */}
      <section className="page-stack">
        <div className="page-header">
          <h2>Histórico de Movimentações</h2>
        </div>
        <div className="cashbox-history-list">
          {history.length > 0 ? (
            history.map((entry) => (
              <div key={entry.id} className={`cashbox-history-item ${entry.type === 'entrada' ? 'entry' : 'exit'}`}>
                <div className="cashbox-history-icon">
                  {entry.type === 'entrada' ? (
                    <FiTrendingUp size={18} />
                  ) : (
                    <FiTrendingDown size={18} />
                  )}
                </div>
                <div className="cashbox-history-content">
                  <div className="cashbox-history-header">
                    <strong>{entry.description}</strong>
                    <span className={`cashbox-history-amount ${entry.type === 'entrada' ? 'positive' : 'negative'}`}>
                      {entry.type === 'entrada' ? '+' : '-'} {formatCurrency(entry.amount)}
                    </span>
                  </div>
                  <div className="cashbox-history-meta">
                    <span>{new Date(entry.date).toLocaleDateString('pt-BR')}</span>
                    {entry.category && <span className="cashbox-history-category">{entry.category}</span>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="cashbox-empty-state">
              Nenhuma movimentação registrada.
            </div>
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
        <div className="cashbox-close-summary">
          <div className="cashbox-close-item">
            <span>Valor Inicial:</span>
            <strong>{formatCurrency(cashboxData.openingAmount)}</strong>
          </div>
          <div className="cashbox-close-item">
            <span>Total de Entradas:</span>
            <strong style={{ color: 'var(--success)' }}>{formatCurrency(totals.entries)}</strong>
          </div>
          <div className="cashbox-close-item">
            <span>Total de Saídas:</span>
            <strong style={{ color: 'var(--error)' }}>{formatCurrency(totals.exits)}</strong>
          </div>
          <div className="cashbox-close-item total">
            <span>Saldo Final:</span>
            <strong style={{ color: currentBalance >= 0 ? 'var(--success)' : 'var(--error)' }}>
              {formatCurrency(currentBalance)}
            </strong>
          </div>
        </div>
      </FormModal>
    </div>
  )
}
