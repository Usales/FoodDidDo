import { useEffect, useMemo, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { FormModal } from '../components/ui/FormModal'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import './PageCommon.css'
import './RecipesPage.css'

const RECIPES_PER_PAGE = 12

export function RecipesPage() {
  const location = useLocation()
  const selectedIngredients = location.state?.ingredients ?? []

  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeRecipe, setActiveRecipe] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const prevIngredientsRef = useRef(selectedIngredients.join(','))

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

  // Calcular paginação
  const paginationData = useMemo(() => {
    const total = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE)
    const start = (currentPage - 1) * RECIPES_PER_PAGE
    const end = start + RECIPES_PER_PAGE
    const paginated = filteredRecipes.slice(start, end)
    
    return {
      totalPages: total,
      startIndex: start,
      endIndex: end,
      paginatedRecipes: paginated
    }
  }, [filteredRecipes, currentPage])

  const { totalPages, startIndex, endIndex, paginatedRecipes } = paginationData

  // Resetar para página 1 quando os filtros mudarem (apenas quando ingredientes mudarem)
  useEffect(() => {
    const currentIngredients = selectedIngredients.join(',')
    // Só resetar se realmente mudou os ingredientes selecionados
    if (prevIngredientsRef.current !== currentIngredients) {
      prevIngredientsRef.current = currentIngredients
      setCurrentPage(1)
    }
  }, [selectedIngredients])

  const handleOpenRecipe = (recipe) => {
    setActiveRecipe(recipe)
  }

  const handleCloseModal = () => {
    setActiveRecipe(null)
  }

  const handlePageChange = (newPage) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages))
    if (validPage !== currentPage) {
      setCurrentPage(validPage)
      // Scroll para o topo da página após um pequeno delay
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    }
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
        <>
          <section className="recipes-grid">
            {paginatedRecipes.map((recipe) => (
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
          
          {totalPages > 1 && (
            <div className="recipes-pagination">
              <button
                type="button"
                className="pagination-btn"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const prevPage = currentPage - 1
                  if (prevPage >= 1) {
                    setCurrentPage(prevPage)
                    requestAnimationFrame(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    })
                  }
                }}
                disabled={currentPage <= 1}
                aria-label="Página anterior"
              >
                <FiChevronLeft size={18} />
                Anterior
              </button>
              
              <div className="pagination-info">
                <span>
                  Página {currentPage} de {totalPages}
                </span>
                <span className="pagination-count">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, filteredRecipes.length)} de {filteredRecipes.length} receitas
                </span>
              </div>
              
              <button
                type="button"
                className="pagination-btn"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const nextPage = currentPage + 1
                  if (nextPage <= totalPages) {
                    setCurrentPage(nextPage)
                    requestAnimationFrame(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    })
                  }
                }}
                disabled={currentPage >= totalPages}
                aria-label="Próxima página"
              >
                Próxima
                <FiChevronRight size={18} />
              </button>
            </div>
          )}
        </>
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

