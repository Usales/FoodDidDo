import { useMemo, useState, useEffect, useRef } from 'react'
import { FormModal } from '../components/ui/FormModal'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { useAppStore } from '../stores/appStore'
import { FiEdit3, FiSave, FiTrash2 } from 'react-icons/fi'
import './PageCommon.css'

const typeLabels = {
  entrada: 'Entrada',
  saída: 'Saída',
  orçamento: 'Orçamento'
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
  const menuRef = useRef(null)
  const [formState, setFormState] = useState({
    type: 'entrada',
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    budgetId: ''
  })

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

  const summary = useMemo(() => {
    const totals = cashflow.reduce(
      (acc, entry) => {
        if (entry.type === 'entrada') {
          acc.income += entry.amount
        } else {
          acc.expense += entry.amount
        }
        return acc
      },
      { income: 0, expense: 0 }
    )
    return {
      income: totals.income,
      expense: totals.expense,
      balance: totals.income - totals.expense
    }
  }, [cashflow])

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

  const handleSave = (entry) => {
    // Esta função pode ser usada para salvar alterações inline se necessário
    // Por enquanto, apenas fecha o menu
    setExpandedCardId(null)
  }

  return (
    <div className="page">
      <section className="page-stack">
        <div className="summary-grid">
          <div className="summary-card">
            <span>Entradas</span>
            <strong>R$ {summary.income.toFixed(2)}</strong>
          </div>
          <div className="summary-card">
            <span>Saídas</span>
            <strong>R$ {summary.expense.toFixed(2)}</strong>
          </div>
          <div className="summary-card">
            <span>Saldo</span>
            <strong>R$ {summary.balance.toFixed(2)}</strong>
          </div>
        </div>
      </section>

      <section className="page-stack">
        <div className="page-header">
          <h2>Fluxo de caixa</h2>
          <button className="primary-btn" type="button" onClick={() => setIsModalOpen(true)}>
            Registrar lançamento
          </button>
        </div>
        <div className="card-grid">
          {cashflow.map((entry) => (
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
                    <button
                      type="button"
                      onClick={() => handleSave(entry)}
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
                      <FiSave size={16} />
                      Salvar
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
          ))}
          {cashflow.length === 0 ? <div className="card-tile">Nenhum lançamento registrado.</div> : null}
        </div>
      </section>

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

