import { useMemo, useState } from 'react'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { FormModal } from '../components/ui/FormModal'
import { useAppStore } from '../stores/appStore'
import './PageCommon.css'

const allocationOptions = [
  { value: 'mensal', label: 'Por mês' },
  { value: 'por hora', label: 'Por hora produtiva' },
  { value: 'por lote', label: 'Por lote produzido' },
  { value: 'por unidade', label: 'Por unidade' }
]

export function FixedCostsPage() {
  const fixedCosts = useAppStore((state) => state.fixedCosts)
  const addFixedCost = useAppStore((state) => state.addFixedCost)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formState, setFormState] = useState({
    name: '',
    type: 'fixo',
    value: '',
    allocationMethod: 'mensal'
  })

  const totalFixed = useMemo(() => fixedCosts.reduce((acc, cost) => acc + cost.value, 0), [fixedCosts])

  const handleSubmit = () => {
    const valueNumber = Number(formState.value)
    if (!formState.name.trim() || Number.isNaN(valueNumber) || valueNumber <= 0) return
    addFixedCost({
      id: crypto.randomUUID(),
      name: formState.name,
      type: formState.type,
      value: valueNumber,
      allocationMethod: formState.allocationMethod
    })
    setFormState({
      name: '',
      type: 'fixo',
      value: '',
      allocationMethod: 'mensal'
    })
    setIsModalOpen(false)
  }

  return (
    <div className="page">
      <section className="page-stack">
        <div className="page-header">
          <h2>Custos fixos e indiretos</h2>
          <button className="primary-btn" type="button" onClick={() => setIsModalOpen(true)}>
            + Adicionar custo
          </button>
        </div>
        <div className="summary-grid">
          <div className="summary-card">
            <span>Total mensal</span>
            <strong>R$ {totalFixed.toFixed(2)}</strong>
          </div>
        </div>
      </section>

      <section className="page-stack">
        <div className="card-grid">
          {fixedCosts.map((cost) => (
            <article key={cost.id} className="card-tile">
              <header>
                <h3>{cost.name}</h3>
                <span className="pill">{cost.type === 'fixo' ? 'Fixo' : 'Indireto'}</span>
              </header>
              <div className="divider" />
              <div className="cost-meta">
                <span>Valor mensal: <strong>R$ {cost.value.toFixed(2)}</strong></span>
                <span>Método de rateio: {cost.allocationMethod}</span>
              </div>
            </article>
          ))}
          {fixedCosts.length === 0 ? <div className="card-tile">Cadastre seu primeiro custo fixo.</div> : null}
        </div>
      </section>

      <FormModal
        isOpen={isModalOpen}
        title="Cadastrar custo fixo/indireto"
        description="Esses custos serão rateados automaticamente sobre as receitas."
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <button className="ghost-btn" type="button" onClick={() => setIsModalOpen(false)}>
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
          <input value={formState.name} onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))} />
        </label>
        <label className="input-control">
          <span>Tipo</span>
          <select value={formState.type} onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value }))}>
            <option value="fixo">Fixo</option>
            <option value="indireto">Indireto</option>
          </select>
        </label>
        <CurrencyInput label="Valor mensal" value={formState.value} onChange={(value) => setFormState((prev) => ({ ...prev, value }))} />
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

