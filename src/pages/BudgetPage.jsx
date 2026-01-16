import { useMemo, useState } from 'react'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { FormModal } from '../components/ui/FormModal'
import { useAppStore } from '../stores/appStore'
import '../components/ui/InputControls.css'
import './PageCommon.css'

export function BudgetPage() {
  const budgets = useAppStore((state) => state.budgets)
  const recipes = useAppStore((state) => state.recipes)
  const fixedCosts = useAppStore((state) => state.fixedCosts)
  const warehouses = useAppStore((state) => state.warehouses)
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
    const latest = sortedBudgets[0] || budgets[0]
    const total = latest?.amount || 0

    // Map de consumo por ingrediente (nome -> total consumido nas receitas)
    const consumedByName = recipes.reduce((acc, recipe) => {
      const ingredients = recipe?.ingredients
      if (!Array.isArray(ingredients)) return acc

      for (const ing of ingredients) {
        const name = String(ing?.name || '').trim().toLowerCase()
        if (!name) continue
        const qty = Number(ing?.quantity) || 0
        acc[name] = (acc[name] || 0) + qty
      }
      return acc
    }, {})

    // Soma do custo de compra do estoque (saldo real * custo unitário), consolidando duplicados por nome
    const stockPurchaseCost = (warehouses || []).reduce((acc, warehouse) => {
      const items = Array.isArray(warehouse?.items) ? warehouse.items : []
      const itemsMap = new Map()

      for (const item of items) {
        const nameKey = String(item?.name || '').trim().toLowerCase()
        if (!nameKey) continue

        const qty = Number(item?.quantity) || 0
        const unitCost = Number(item?.unitCost) || 0

        const existing = itemsMap.get(nameKey)
        if (existing) {
          itemsMap.set(nameKey, {
            totalQty: existing.totalQty + qty,
            totalCost: existing.totalCost + qty * unitCost
          })
        } else {
          itemsMap.set(nameKey, {
            totalQty: qty,
            totalCost: qty * unitCost
          })
        }
      }

      let warehouseSum = 0
      for (const [nameKey, data] of itemsMap.entries()) {
        const consumed = consumedByName[nameKey] || 0
        const realStock = Math.max(0, (data.totalQty || 0) - consumed)
        const avgUnitCost = data.totalQty > 0 ? data.totalCost / data.totalQty : 0
        warehouseSum += realStock * avgUnitCost
      }

      return acc + warehouseSum
    }, 0)

    // Calcular gastos baseado no custo total das receitas com includeInBudget = true
    const spentFromRecipes = recipes
      .filter((recipe) => recipe.includeInBudget !== false)
      .reduce((acc, recipe) => acc + (recipe.totalCost || 0), 0)

    // Custos fixos mensais (afetam o orçamento do mês)
    const spentFromFixedCostsMonthly = fixedCosts
      .filter((cost) => (cost.allocationMethod || 'mensal') === 'mensal')
      .reduce((acc, cost) => acc + (cost.value || 0), 0)

    // Gasto do período mais recente: usa o maior entre banco e cálculo (receitas + fixos mensais + estoque)
    const computedSpent = spentFromRecipes + spentFromFixedCostsMonthly + stockPurchaseCost
    const spent = Math.max(latest?.spent || 0, computedSpent)

    const balance = total - spent

    // Calcular progresso do orçamento mais recente (baseado no spent final)
    let progress = 0
    if (latest && latest.amount > 0) {
      progress = Math.min(100, Math.round((spent / latest.amount) * 100))
    }
    
    return {
      total,
      spent,
      balance,
      latest,
      progress,
      stockPurchaseCost
    }
  }, [budgets, recipes, fixedCosts, warehouses, sortedBudgets])

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
      <div className="page-header">
        <h1>Orçamentos</h1>
      </div>

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
                R$ {summary.spent.toFixed(2)} de R$ {summary.latest.amount.toFixed(2)}
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
                  // Calcular gastos baseado no custo total das receitas com includeInBudget = true
                  const isLatest = budget.id === (sortedBudgets[0]?.id || budgets[0]?.id)

                  const consumedByName = recipes.reduce((acc, recipe) => {
                    const ingredients = recipe?.ingredients
                    if (!Array.isArray(ingredients)) return acc

                    for (const ing of ingredients) {
                      const name = String(ing?.name || '').trim().toLowerCase()
                      if (!name) continue
                      const qty = Number(ing?.quantity) || 0
                      acc[name] = (acc[name] || 0) + qty
                    }
                    return acc
                  }, {})

                  const stockPurchaseCost = (warehouses || []).reduce((acc, warehouse) => {
                    const items = Array.isArray(warehouse?.items) ? warehouse.items : []
                    const itemsMap = new Map()

                    for (const item of items) {
                      const nameKey = String(item?.name || '').trim().toLowerCase()
                      if (!nameKey) continue

                      const qty = Number(item?.quantity) || 0
                      const unitCost = Number(item?.unitCost) || 0

                      const existing = itemsMap.get(nameKey)
                      if (existing) {
                        itemsMap.set(nameKey, {
                          totalQty: existing.totalQty + qty,
                          totalCost: existing.totalCost + qty * unitCost
                        })
                      } else {
                        itemsMap.set(nameKey, {
                          totalQty: qty,
                          totalCost: qty * unitCost
                        })
                      }
                    }

                    let warehouseSum = 0
                    for (const [nameKey, data] of itemsMap.entries()) {
                      const consumed = consumedByName[nameKey] || 0
                      const realStock = Math.max(0, (data.totalQty || 0) - consumed)
                      const avgUnitCost = data.totalQty > 0 ? data.totalCost / data.totalQty : 0
                      warehouseSum += realStock * avgUnitCost
                    }

                    return acc + warehouseSum
                  }, 0)

                  const spentFromRecipes = recipes
                    .filter((recipe) => recipe.includeInBudget !== false)
                    .reduce((acc, recipe) => acc + (recipe.totalCost || 0), 0)

                  const spentFromFixedCostsMonthly = fixedCosts
                    .filter((cost) => (cost.allocationMethod || 'mensal') === 'mensal')
                    .reduce((acc, cost) => acc + (cost.value || 0), 0)

                  // Para o orçamento mais recente: maior entre banco e (receitas + fixos mensais)
                  const computedSpent = spentFromRecipes + spentFromFixedCostsMonthly + stockPurchaseCost
                  const actualSpent = isLatest ? Math.max(budget.spent || 0, computedSpent) : budget.spent
                  const remaining = budget.amount - actualSpent
                  const percentage = budget.amount > 0 ? Math.min(100, Math.round((actualSpent / budget.amount) * 100)) : 0
                  
                  return (
                    <tr key={budget.id}>
                      <td className="budget-period">{budget.period}</td>
                      <td className="budget-amount">R$ {budget.amount.toFixed(2)}</td>
                      <td className="budget-spent">R$ {actualSpent.toFixed(2)}</td>
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

