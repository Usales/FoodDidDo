import { useMemo, useState } from 'react'
import { FormModal } from '../components/ui/FormModal'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { useAppStore } from '../stores/appStore'
import './PageCommon.css'

const typeLabels = {
  entrada: 'Entrada',
  saída: 'Saída'
}

export function CashflowPage() {
  const cashflow = useAppStore((state) => state.cashflow)
  const addCashflowEntry = useAppStore((state) => state.addCashflowEntry)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formState, setFormState] = useState({
    type: 'entrada',
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10)
  })

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
    addCashflowEntry({
      id: crypto.randomUUID(),
      type: formState.type,
      description: formState.description,
      amount: amountNumber,
      date: formState.date
    })
    setIsModalOpen(false)
    setFormState({
      type: 'entrada',
      description: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10)
    })
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
            <article key={entry.id} className="card-tile">
              <header>
                <h3>{typeLabels[entry.type] ?? entry.type}</h3>
                <span className="pill">{new Date(entry.date).toLocaleDateString('pt-BR')}</span>
              </header>
              <div className="divider" />
              <div className="cashflow-meta">
                <span>{entry.description}</span>
                <strong style={{ color: entry.type === 'entrada' ? 'var(--brand-aqua-dark)' : 'var(--brand-red)' }}>
                  {entry.type === 'entrada' ? '+' : '-'} R$ {entry.amount.toFixed(2)}
                </strong>
              </div>
            </article>
          ))}
          {cashflow.length === 0 ? <div className="card-tile">Nenhum lançamento registrado.</div> : null}
        </div>
      </section>

      <FormModal
        isOpen={isModalOpen}
        title="Novo lançamento"
        description="Registre entradas e saídas para manter o fluxo de caixa atualizado."
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <button className="ghost-btn" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button className="primary-btn" type="button" onClick={handleSubmit}>
              Salvar lançamento
            </button>
          </>
        }
      >
        <label className="input-control">
          <span>Tipo</span>
          <select value={formState.type} onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value }))}>
            <option value="entrada">Entrada</option>
            <option value="saída">Saída</option>
          </select>
        </label>
        <label className="input-control">
          <span>Descrição</span>
          <input value={formState.description} onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))} />
        </label>
        <CurrencyInput label="Valor" value={formState.amount} onChange={(value) => setFormState((prev) => ({ ...prev, amount: value }))} />
        <label className="input-control">
          <span>Data</span>
          <input type="date" value={formState.date} onChange={(event) => setFormState((prev) => ({ ...prev, date: event.target.value }))} />
        </label>
      </FormModal>
    </div>
  )
}

