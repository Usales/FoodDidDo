import { useMemo, useState } from 'react'
import { useAppStore } from '../stores/appStore'
import { FormModal } from '../components/ui/FormModal'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import './PageCommon.css'

export function CostPage() {
  const recipes = useAppStore((state) => state.recipes)
  const addRecipe = useAppStore((state) => state.addRecipe)
  const updateRecipe = useAppStore((state) => state.updateRecipe)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formState, setFormState] = useState({
    name: '',
    yield: '',
    prepTime: '',
    totalCost: '',
    unitCost: '',
    contributionMargin: ''
  })

  const summary = useMemo(() => {
    if (!recipes.length) {
      return { total: 0, unitAverage: 0 }
    }
    const total = recipes.reduce((acc, recipe) => acc + recipe.totalCost, 0)
    const unitAverage = recipes.reduce((acc, recipe) => acc + recipe.unitCost, 0) / recipes.length
    return { total, unitAverage }
  }, [recipes])

  const handleOpenModal = (recipe = null) => {
    if (recipe) {
      setEditingId(recipe.id)
      setFormState({
        name: recipe.name,
        yield: recipe.yield.toString(),
        prepTime: recipe.prepTime.toString(),
        totalCost: recipe.totalCost.toString(),
        unitCost: recipe.unitCost.toString(),
        contributionMargin: recipe.contributionMargin.toString()
      })
    } else {
      setEditingId(null)
      setFormState({
        name: '',
        yield: '',
        prepTime: '',
        totalCost: '',
        unitCost: '',
        contributionMargin: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormState({
      name: '',
      yield: '',
      prepTime: '',
      totalCost: '',
      unitCost: '',
      contributionMargin: ''
    })
  }

  const handleSubmit = () => {
    const yieldNum = Number(formState.yield)
    const prepTimeNum = Number(formState.prepTime)
    const totalCostNum = Number(formState.totalCost)
    const unitCostNum = Number(formState.unitCost)
    const contributionMarginNum = Number(formState.contributionMargin)

    if (
      !formState.name.trim() ||
      Number.isNaN(yieldNum) ||
      yieldNum <= 0 ||
      Number.isNaN(prepTimeNum) ||
      prepTimeNum <= 0 ||
      Number.isNaN(totalCostNum) ||
      totalCostNum <= 0 ||
      Number.isNaN(unitCostNum) ||
      unitCostNum <= 0 ||
      Number.isNaN(contributionMarginNum) ||
      contributionMarginNum < 0
    ) {
      return
    }

    const recipeData = {
      name: formState.name,
      yield: yieldNum,
      prepTime: prepTimeNum,
      totalCost: totalCostNum,
      unitCost: unitCostNum,
      contributionMargin: contributionMarginNum
    }

    if (editingId) {
      updateRecipe(editingId, recipeData)
    } else {
      addRecipe({
        id: crypto.randomUUID(),
        ...recipeData
      })
    }

    handleCloseModal()
  }

  return (
    <div className="page">
      <section className="page-stack">
        <div className="summary-grid">
          <div className="summary-card">
            <span>Investimento total registrado</span>
            <strong>R$ {summary.total.toFixed(2)}</strong>
          </div>
          <div className="summary-card">
            <span>Custo unitário médio</span>
            <strong>R$ {summary.unitAverage.toFixed(2)}</strong>
          </div>
        </div>
      </section>

      <section className="page-stack">
        <div className="page-header">
          <h2>Custos por ficha técnica</h2>
          <button className="primary-btn" type="button" onClick={() => handleOpenModal()}>
            Adicionar
          </button>
        </div>
        <div className="card-grid">
          {recipes.map((recipe) => (
            <article key={recipe.id} className="card-tile">
              <header>
                <h3>{recipe.name}</h3>
                <span className="pill">Rende {recipe.yield} un.</span>
              </header>
              <div className="divider" />
              <div className="cost-meta">
                <span>Total: <strong>R$ {recipe.totalCost.toFixed(2)}</strong></span>
                <span>Unitário: <strong>R$ {recipe.unitCost.toFixed(2)}</strong></span>
                <span>Tempo: {recipe.prepTime} min</span>
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => handleOpenModal(recipe)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--primary-color)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--text-muted)'
                  }}
                >
                  Editar
                </button>
              </div>
            </article>
          ))}
          {recipes.length === 0 ? <div className="card-tile">Cadastre receitas para visualizar os custos.</div> : null}
        </div>
      </section>

      <FormModal
        isOpen={isModalOpen}
        title={editingId ? 'Editar receita' : 'Adicionar receita'}
        description={editingId ? 'Atualize as informações da receita.' : 'Cadastre uma nova receita para calcular os custos.'}
        onClose={handleCloseModal}
        footer={
          <>
            <button className="ghost-btn" type="button" onClick={handleCloseModal}>
              Cancelar
            </button>
            <button className="primary-btn" type="button" onClick={handleSubmit}>
              {editingId ? 'Atualizar' : 'Salvar'}
            </button>
          </>
        }
      >
        <label className="input-control">
          <span>Nome da receita</span>
          <input
            type="text"
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Ex.: Bolo de Chocolate"
          />
        </label>
        <label className="input-control">
          <span>Rendimento (unidades)</span>
          <input
            type="number"
            value={formState.yield}
            onChange={(event) => setFormState((prev) => ({ ...prev, yield: event.target.value }))}
            placeholder="Ex.: 18"
            min="1"
          />
        </label>
        <label className="input-control">
          <span>Tempo de preparo (minutos)</span>
          <input
            type="number"
            value={formState.prepTime}
            onChange={(event) => setFormState((prev) => ({ ...prev, prepTime: event.target.value }))}
            placeholder="Ex.: 45"
            min="1"
          />
        </label>
        <CurrencyInput
          label="Custo total"
          value={formState.totalCost}
          onChange={(value) => setFormState((prev) => ({ ...prev, totalCost: value.toString() }))}
          placeholder="R$ 0,00"
        />
        <CurrencyInput
          label="Custo unitário"
          value={formState.unitCost}
          onChange={(value) => setFormState((prev) => ({ ...prev, unitCost: value.toString() }))}
          placeholder="R$ 0,00"
        />
        <label className="input-control">
          <span>Margem de contribuição (0-1)</span>
          <input
            type="number"
            step="0.01"
            value={formState.contributionMargin}
            onChange={(event) => setFormState((prev) => ({ ...prev, contributionMargin: event.target.value }))}
            placeholder="Ex.: 0.38"
            min="0"
            max="1"
          />
        </label>
      </FormModal>
    </div>
  )
}

