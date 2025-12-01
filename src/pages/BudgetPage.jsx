import { useMemo, useState } from 'react'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { FormModal } from '../components/ui/FormModal'
import { useAppStore } from '../stores/appStore'
import './PageCommon.css'

export function BudgetPage() {
  const budgets = useAppStore((state) => state.budgets)
  const addBudget = useAppStore((state) => state.addBudget)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [period, setPeriod] = useState('')

  const summary = useMemo(() => {
    const total = budgets.reduce((acc, budget) => acc + budget.amount, 0)
    const spent = budgets.reduce((acc, budget) => acc + budget.spent, 0)
    const balance = total - spent
    const latest = budgets[0]
    const progress = latest && latest.amount > 0 ? Math.min(100, Math.round((latest.spent / latest.amount) * 100)) : 0
    return {
      total,
      spent,
      balance,
      latest,
      progress
    }
  }, [budgets])

  const handleCreateBudget = () => {
    const numericAmount = Number(amount)
    if (!period.trim() || Number.isNaN(numericAmount) || numericAmount <= 0) return
    addBudget({
      id: crypto.randomUUID(),
      period,
      amount: numericAmount,
      spent: 0,
      createdAt: new Date().toISOString()
    })
    setAmount('')
    setPeriod('')
    setIsModalOpen(false)
  }

  return (
    <div className="page">
      <section className="page-stack">
        <div className="summary-grid">
          <div className="summary-card">
            <span>Orçamento total planejado</span>
            <strong>R$ {summary.total.toFixed(2)}</strong>
          </div>
          <div className="summary-card">
            <span>Gastos registrados</span>
            <strong>R$ {summary.spent.toFixed(2)}</strong>
          </div>
          <div className="summary-card">
            <span>Saldo disponível</span>
            <strong>R$ {summary.balance.toFixed(2)}</strong>
          </div>
        </div>
        {summary.latest ? (
          <div className="budget-progress">
            <header>
              <h3>{summary.latest.period}</h3>
              <span>
                R$ {summary.latest.spent.toFixed(2)} de R$ {summary.latest.amount.toFixed(2)}
              </span>
            </header>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${summary.progress}%` }} />
            </div>
          </div>
        ) : null}
      </section>

      <section className="page-stack">
        <div className="page-header">
          <h2>Histórico de planejamentos</h2>
          <button className="primary-btn" type="button" onClick={() => setIsModalOpen(true)}>
            + Novo orçamento
          </button>
        </div>
        <div className="card-grid">
          {budgets.map((budget) => {
            const remaining = budget.amount - budget.spent
            const percentage = budget.amount > 0 ? Math.min(100, Math.round((budget.spent / budget.amount) * 100)) : 0
            return (
              <article key={budget.id} className="card-tile">
                <header>
                  <h3>{budget.period}</h3>
                  <span className="pill">{percentage}% utilizado</span>
                </header>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${percentage}%` }} />
                </div>
                <div className="divider" />
                <div className="budget-meta">
                  <span>Planejado: R$ {budget.amount.toFixed(2)}</span>
                  <span>Gasto: R$ {budget.spent.toFixed(2)}</span>
                  <span>Saldo: R$ {remaining.toFixed(2)}</span>
                </div>
              </article>
            )
          })}
          {budgets.length === 0 ? <div className="card-tile">Cadastre seu primeiro orçamento.</div> : null}
        </div>
      </section>

      <FormModal
        isOpen={isModalOpen}
        title="Novo orçamento"
        description="Defina o período e valor disponível para compras."
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <button className="ghost-btn" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button className="primary-btn" type="button" onClick={handleCreateBudget}>
              Salvar
            </button>
          </>
        }
      >
        <label className="input-control">
          <span>Período</span>
          <input value={period} onChange={(event) => setPeriod(event.target.value)} placeholder="Ex.: Novembro/2025" />
        </label>
        <CurrencyInput label="Valor disponível" value={amount} onChange={setAmount} />
      </FormModal>
    </div>
  )
}

