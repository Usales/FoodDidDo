import { useMemo, useState } from 'react'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { FormModal } from '../components/ui/FormModal'
import { useAppStore } from '../stores/appStore'
import '../components/ui/InputControls.css'
import './PageCommon.css'

export function BudgetPage() {
  const budgets = useAppStore((state) => state.budgets)
  const addBudget = useAppStore((state) => state.addBudget)
  const loadData = useAppStore((state) => state.loadData)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState(new Date().getFullYear().toString())

  // Lista de meses
  const months = [
    { value: 'Janeiro', label: 'Janeiro' },
    { value: 'Fevereiro', label: 'Fevereiro' },
    { value: 'Março', label: 'Março' },
    { value: 'Abril', label: 'Abril' },
    { value: 'Maio', label: 'Maio' },
    { value: 'Junho', label: 'Junho' },
    { value: 'Julho', label: 'Julho' },
    { value: 'Agosto', label: 'Agosto' },
    { value: 'Setembro', label: 'Setembro' },
    { value: 'Outubro', label: 'Outubro' },
    { value: 'Novembro', label: 'Novembro' },
    { value: 'Dezembro', label: 'Dezembro' }
  ]

  // Gerar lista de anos (ano atual ± 5 anos)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  // Função para converter período (ex: "Dezembro/2025") para data ordenável
  const parsePeriod = (period) => {
    const [monthName, year] = period.split('/')
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    const monthIndex = monthNames.indexOf(monthName.trim())
    const yearNum = parseInt(year.trim(), 10)
    return { year: yearNum, month: monthIndex, sortValue: yearNum * 12 + monthIndex }
  }

  // Ordenar orçamentos por mês/ano (do mais recente para o mais antigo)
  const sortedBudgets = useMemo(() => {
    return [...budgets].sort((a, b) => {
      const aPeriod = parsePeriod(a.period)
      const bPeriod = parsePeriod(b.period)
      return bPeriod.sortValue - aPeriod.sortValue // Ordem decrescente (mais recente primeiro)
    })
  }, [budgets])

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

  const handleCreateBudget = async () => {
    const numericAmount = Number(amount)
    const period = `${month}/${year}`
    if (!month || !year || Number.isNaN(numericAmount) || numericAmount <= 0) {
      alert('Por favor, preencha todos os campos corretamente.')
      return
    }
    
    try {
      await addBudget({
        period,
        amount: numericAmount,
        spent: 0
      })
      // Recarregar dados para garantir sincronização
      await loadData()
      setAmount('')
      setMonth('')
      setYear('')
      setIsModalOpen(false)
    } catch (error) {
      console.error('Erro ao criar orçamento:', error)
      alert('Erro ao criar orçamento. Verifique se o servidor está rodando.')
    }
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
          <h2>Histórico de Orçamentos</h2>
          <button className="primary-btn" type="button" onClick={() => setIsModalOpen(true)}>
            + Novo orçamento
          </button>
        </div>
        <div className="budget-list">
          {budgets.length === 0 ? (
            <div className="budget-list-empty">Cadastre seu primeiro orçamento.</div>
          ) : (
            <table className="budget-table">
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Investido</th>
                  <th>Gasto</th>
                  <th>Saldo</th>
                  <th>Utilizado</th>
                  <th>Progresso</th>
                </tr>
              </thead>
              <tbody>
                {sortedBudgets.map((budget) => {
                  const remaining = budget.amount - budget.spent
                  const percentage = budget.amount > 0 ? Math.min(100, Math.round((budget.spent / budget.amount) * 100)) : 0
                  return (
                    <tr key={budget.id}>
                      <td className="budget-period">{budget.period}</td>
                      <td className="budget-amount">R$ {budget.amount.toFixed(2)}</td>
                      <td className="budget-spent">R$ {budget.spent.toFixed(2)}</td>
                      <td className="budget-remaining">R$ {remaining.toFixed(2)}</td>
                      <td className="budget-percentage">{percentage}%</td>
                      <td className="budget-progress-cell">
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${percentage}%` }} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
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
        <div className="input-control">
          <span>Período</span>
          <div className="period-inputs">
            <div className="period-input-wrapper">
              <select 
                value={month} 
                onChange={(event) => setMonth(event.target.value)}
              >
                <option value="">Selecione o mês</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="period-input-wrapper">
              <select 
                value={year} 
                onChange={(event) => setYear(event.target.value)}
              >
                <option value="">Selecione o ano</option>
                {years.map((y) => (
                  <option key={y} value={y.toString()}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <CurrencyInput label="Valor disponível" value={amount} onChange={setAmount} />
      </FormModal>
    </div>
  )
}

