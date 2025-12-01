import { useMemo, useState } from 'react'
import { FormModal } from '../components/ui/FormModal'
import { useAppStore } from '../stores/appStore'
import { Alert } from '../components/ui/Alert'
import './PageCommon.css'

export function StockPage() {
  const ingredients = useAppStore((state) => state.ingredients)
  const stockMovements = useAppStore((state) => state.stockMovements)
  const addStockMovement = useAppStore((state) => state.addStockMovement)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [movement, setMovement] = useState({
    ingredientId: ingredients[0]?.id ?? '',
    type: 'entrada',
    quantity: 0,
    reference: ''
  })

  const inventory = useMemo(() => {
    return ingredients.map((ingredient) => {
      const movements = stockMovements.filter((movementItem) => movementItem.ingredientId === ingredient.id)
      const balance = movements.reduce((acc, item) => (item.type === 'entrada' ? acc + item.quantity : acc - item.quantity), ingredient.stockQty)
      return {
        ...ingredient,
        balance,
        status: balance <= ingredient.lowStockThreshold ? 'Crítico' : 'OK'
      }
    })
  }, [ingredients, stockMovements])

  const handleSubmit = () => {
    if (!movement.ingredientId || !movement.quantity) return
    addStockMovement({
      id: crypto.randomUUID(),
      ...movement,
      createdAt: new Date().toISOString()
    })
    setMovement({
      ingredientId: ingredients[0]?.id ?? '',
      type: 'entrada',
      quantity: 0,
      reference: ''
    })
    setIsModalOpen(false)
  }

  const lowStock = inventory.filter((item) => item.status === 'Crítico')

  return (
    <div className="page">
      <section className="page-stack">
        <div className="page-header">
          <h2>Controle de estoque</h2>
          <button className="primary-btn" type="button" onClick={() => setIsModalOpen(true)}>
            Registrar movimentação
          </button>
        </div>
        <div className="card-grid">
          {inventory.map((item) => (
            <article key={item.id} className="card-tile">
              <header>
                <h3>{item.name}</h3>
                <span className="pill" style={{ color: item.status === 'Crítico' ? 'var(--brand-red)' : 'var(--brand-blue)' }}>
                  {item.status}
                </span>
              </header>
              <div className="divider" />
              <div className="stock-meta">
                <span>
                  Saldo: <strong>{item.balance}</strong> {item.unit ?? 'g/ml/u'}
                </span>
                <span>Mínimo ideal: {item.lowStockThreshold}</span>
                <span>Custo unitário: R$ {item.unitCost.toFixed(2)}</span>
              </div>
            </article>
          ))}
          {inventory.length === 0 ? <div className="card-tile">Cadastre ingredientes para controlar o estoque.</div> : null}
        </div>
      </section>

      {lowStock.length ? (
        <section className="page-stack">
          <h2>Estoque crítico</h2>
          {lowStock.map((item) => (
            <Alert
              key={item.id}
              variant="danger"
              title={`${item.name} em falta`}
              description={`Saldo atual: ${item.balance} ${item.unit ?? 'g/ml/u'}`}
            />
          ))}
        </section>
      ) : null}

      <FormModal
        isOpen={isModalOpen}
        title="Movimentar estoque"
        description="Entradas e saídas afetam automaticamente o saldo dos ingredientes."
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <button className="ghost-btn" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button className="primary-btn" type="button" onClick={handleSubmit}>
              Salvar movimentação
            </button>
          </>
        }
      >
        <label className="input-control">
          <span>Ingrediente</span>
          <select value={movement.ingredientId} onChange={(event) => setMovement((prev) => ({ ...prev, ingredientId: event.target.value }))}>
            {ingredients.map((ingredient) => (
              <option key={ingredient.id} value={ingredient.id}>
                {ingredient.name}
              </option>
            ))}
          </select>
        </label>
        <label className="input-control">
          <span>Tipo</span>
          <select value={movement.type} onChange={(event) => setMovement((prev) => ({ ...prev, type: event.target.value }))}>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
        </label>
        <label className="input-control">
          <span>Quantidade (g/ml/u)</span>
          <input
            type="number"
            value={movement.quantity}
            onChange={(event) => setMovement((prev) => ({ ...prev, quantity: Number(event.target.value) }))}
          />
        </label>
        <label className="input-control">
          <span>Referência</span>
          <input value={movement.reference} onChange={(event) => setMovement((prev) => ({ ...prev, reference: event.target.value }))} />
        </label>
      </FormModal>
    </div>
  )
}

