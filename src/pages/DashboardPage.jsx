import { useEffect, useMemo, useState } from 'react'
import './PageCommon.css'
import './DashboardPage.css'

const defaultMeals = [
  {
    id: 'meal-1',
    title: 'Avocado toast',
    calories: '250 Cal',
    ingredients: 'Avocado, Bread, Eggs',
    time: '15 min',
    status: 'fazer'
  },
  {
    id: 'meal-2',
    title: 'Alfredo Pasta',
    calories: '450 Cal',
    ingredients: 'Alfredo, Chicken, Pasta',
    time: '30 min',
    status: 'planejado'
  },
  {
    id: 'meal-3',
    title: 'Quinoa Salad',
    calories: '200 Cal',
    ingredients: 'Carrot, Tomato, Mint',
    time: '10 min',
    status: 'finalizado'
  }
]

const initialForm = {
  title: '',
  calories: '',
  ingredients: '',
  time: '',
  status: 'fazer'
}

export function DashboardPage() {
  const [meals, setMeals] = useState(defaultMeals)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('fooddiddo_meals')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length) {
          setMeals(parsed)
        }
      } catch (error) {
        console.warn('Não foi possível carregar refeições salvas', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('fooddiddo_meals', JSON.stringify(meals))
  }, [meals])

  const stats = useMemo(() => {
    const total = meals.length || 1
    const completed = meals.filter((meal) => meal.status === 'finalizado').length
    return {
      total,
      completed,
      percent: Math.round((completed / total) * 100)
    }
  }, [meals])

  const handleEdit = (meal) => {
    setEditingId(meal.id)
    setFormData({
      title: meal.title,
      calories: meal.calories,
      ingredients: meal.ingredients,
      time: meal.time,
      status: meal.status
    })
    setShowForm(true)
  }

  const handleDelete = (mealId) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== mealId))
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) return

    if (editingId) {
      setMeals((prev) =>
        prev.map((meal) => (meal.id === editingId ? { ...meal, ...formData } : meal))
      )
    } else {
      setMeals((prev) => [
        {
          id: `meal-${Date.now()}`,
          ...formData
        },
        ...prev
      ])
    }

    setFormData(initialForm)
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="dashboard-page page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <h1>Eleve seu nível culinário</h1>
          <p>Explore novas receitas, planeje a semana e acompanhe suas refeições favoritas.</p>
        </div>
      </section>

      <section className="page-stack meal-section">
        <header className="meal-section-header">
          <div>
            <h2>Lista de refeições</h2>
            <p className="meal-section-subtitle">
              {stats.completed} de {stats.total} concluídas • {stats.percent}% de progresso
            </p>
          </div>
          <button type="button" className="primary-btn" onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? 'Cancelar' : '+ Nova Refeição'}
          </button>
        </header>

        {showForm ? (
          <div className="meal-form">
            <div className="meal-form-row">
              <label>
                <span>Título</span>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Ex.: Avocado toast"
                />
              </label>
              <label>
                <span>Calorias</span>
                <input
                  type="text"
                  value={formData.calories}
                  onChange={(event) => setFormData((prev) => ({ ...prev, calories: event.target.value }))}
                  placeholder="Ex.: 250 Cal"
                />
              </label>
            </div>
            <div className="meal-form-row">
              <label>
                <span>Ingredientes</span>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(event) => setFormData((prev) => ({ ...prev, ingredients: event.target.value }))}
                  placeholder="Ex.: Avocado, Bread, Eggs"
                />
              </label>
              <label>
                <span>Tempo</span>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(event) => setFormData((prev) => ({ ...prev, time: event.target.value }))}
                  placeholder="Ex.: 15 min"
                />
              </label>
              <label>
                <span>Status</span>
                <select
                  value={formData.status}
                  onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}
                >
                  <option value="fazer">Fazer</option>
                  <option value="planejado">Planejado</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </label>
            </div>
            <div className="meal-form-actions">
              <button type="button" className="primary-btn" onClick={handleSubmit}>
                {editingId ? 'Atualizar refeição' : 'Salvar refeição'}
              </button>
            </div>
          </div>
        ) : null}

        <div className="meal-list">
          {meals.map((meal) => (
            <article key={meal.id} className="meal-card">
              <div className="meal-card-content">
                <header>
                  <h3>{meal.title}</h3>
                  <span className={`status-pill status-${meal.status}`}>{meal.status}</span>
                </header>
                <div className="meal-details">
                  <span>{meal.calories}</span>
                  <span>{meal.time}</span>
                </div>
                <p>{meal.ingredients}</p>
              </div>
              <footer>
                <button type="button" onClick={() => handleEdit(meal)}>
                  Editar
                </button>
                <button type="button" onClick={() => handleDelete(meal.id)}>
                  Excluir
                </button>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

