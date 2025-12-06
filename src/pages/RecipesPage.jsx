import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FormModal } from '../components/ui/FormModal'
import './PageCommon.css'
import './RecipesPage.css'

export function RecipesPage() {
  const location = useLocation()
  const selectedIngredients = location.state?.ingredients ?? []

  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeRecipe, setActiveRecipe] = useState(null)

  useEffect(() => {
    let isMounted = true
    const loadRecipes = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}local-recipes/recipes.json`)
        if (!response.ok) {
          throw new Error('Não foi possível carregar as receitas.')
        }
        const data = await response.json()
        if (isMounted) {
          setRecipes(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadRecipes()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredRecipes = useMemo(() => {
    if (!selectedIngredients.length) return recipes
    return recipes.filter((recipe) => {
      const recipeIngredients = (recipe.ingredientsList || '').toLowerCase()
      return selectedIngredients.some((ingredient) => {
        const searchIngredient = ingredient.toLowerCase().trim()
        return recipeIngredients.includes(searchIngredient)
      })
    })
  }, [recipes, selectedIngredients])

  const handleOpenRecipe = (recipe) => {
    setActiveRecipe(recipe)
  }

  const handleCloseModal = () => {
    setActiveRecipe(null)
  }

  return (
    <div className="page recipes-page">
      <header className="recipes-header">
        <div>
          <h1>🍽️ Todas as Receitas</h1>
          <p>
            {selectedIngredients.length
              ? `Exibindo receitas que combinam com: ${selectedIngredients.join(', ')}`
              : 'Explore pratos preparados com ingredientes acessíveis e fáceis de encontrar.'}
          </p>
        </div>
      </header>

      {loading ? (
        <section className="recipes-loading page-stack">Carregando receitas...</section>
      ) : error ? (
        <section className="recipes-error page-stack">{error}</section>
      ) : (
        <section className="recipes-grid">
          {filteredRecipes.map((recipe) => (
            <article key={recipe.id} className="recipe-card">
              <div className="recipe-card-image">
                <img src={recipe.image} alt={recipe.title} loading="lazy" />
                <span className="recipe-source-badge">{recipe.source ?? 'Receita'}</span>
              </div>
              <div className="recipe-card-content">
                <h3>{recipe.title}</h3>
                <div className="recipe-meta">
                  <span>📂 {recipe.category}</span>
                  <span>🌍 {recipe.area}</span>
                </div>
                <p>{recipe.ingredientsList}</p>
              </div>
              <footer>
                <button type="button" className="primary-btn" onClick={() => handleOpenRecipe(recipe)}>
                  Ver Receita Completa
                </button>
              </footer>
            </article>
          ))}
        </section>
      )}

      <FormModal
        isOpen={Boolean(activeRecipe)}
        title={activeRecipe?.title ?? ''}
        description={activeRecipe?.category}
        onClose={handleCloseModal}
        footer={
          activeRecipe?.video ? (
            <a
              className="primary-btn"
              href={activeRecipe.video}
              target="_blank"
              rel="noopener noreferrer"
            >
              Assistir vídeo
            </a>
          ) : null
        }
      >
        <div className="recipe-modal-body">
          <h4>Ingredientes</h4>
          <p>{activeRecipe?.ingredientsList}</p>
          <h4>Modo de preparo</h4>
          <p style={{ whiteSpace: 'pre-wrap' }}>{activeRecipe?.instructions}</p>
        </div>
      </FormModal>
    </div>
  )
}

