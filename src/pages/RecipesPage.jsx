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
  const [filters, setFilters] = useState({
    search: '',
    area: 'all',
    category: 'all',
    flavor: 'all',
    hasVideo: false
  })
  const prevIngredientsRef = useRef(selectedIngredients.join(','))
  const prevFiltersRef = useRef(JSON.stringify(filters))

  const normalizeArea = (area) => {
    const raw = String(area || '').trim()
    if (!raw) return ''

    const key = raw.toLowerCase()
    const map = {
      brasileira: 'Brasil',
      brasil: 'Brasil',
      italiana: 'Itália',
      itália: 'Itália',
      espanhola: 'Espanha',
      espanha: 'Espanha',
      portuguesa: 'Portugal',
      portugal: 'Portugal',
      japonesa: 'Japão',
      japao: 'Japão',
      russa: 'Rússia',
      russia: 'Rússia',
      'rússia': 'Rússia',
      'rússa': 'Rússia',
      'oriente médio': 'Oriente Médio',
      'oriente medio': 'Oriente Médio',
      frança: 'França',
      franca: 'França',
      // "Asiática/Ásia" -> "Japão" (padronização pedida na UI)
      asia: 'Japão',
      'ásia': 'Japão',
      asiática: 'Japão',
      asiatica: 'Japão',
      internacional: 'Internacional'
    }

    return map[key] || raw
  }

  const normalizeText = (value) => {
    const raw = String(value ?? '').trim().toLowerCase()
    if (!raw) return ''
    // remove acentos/diacríticos (ex: pimentão -> pimentao)
    return raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

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

  const inferFlavor = (recipe) => {
    const cat = String(recipe?.category || '').toLowerCase()
    const title = String(recipe?.title || '').toLowerCase()
    const haystack = `${cat} ${title}`

    if (/(drink|cocktail|bebida|juice|suco|smoothie)/.test(haystack)) return 'bebida'
    if (/(dessert|sobremesa|sweet|doce|cake|bolo|cookie|biscoito|chocolate|pudim|torta)/.test(haystack)) return 'doce'
    return 'salgado'
  }

  const filterOptions = useMemo(() => {
    const areas = new Set()
    const categories = new Set()

    for (const recipe of recipes) {
      const area = normalizeArea(recipe?.area)
      const category = String(recipe?.category || '').trim()
      if (area) areas.add(area)
      if (category) categories.add(category)
    }

    const sortPt = (a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })

    return {
      areas: Array.from(areas).sort(sortPt),
      categories: Array.from(categories).sort(sortPt)
    }
  }, [recipes])

  const filteredRecipes = useMemo(() => {
    let base = recipes

    if (selectedIngredients.length) {
      base = base.filter((recipe) => {
        const recipeTitle = normalizeText(recipe.title || '')
        const recipeIngredients = normalizeText(recipe.ingredientsList || '')
        return selectedIngredients.some((ingredient) => {
          const searchIngredient = normalizeText(ingredient)
          if (!searchIngredient) return false
          const inTitle = recipeTitle.includes(searchIngredient)
          const inIngredients = recipeIngredients.includes(searchIngredient)
          // Aceitar ingrediente no título OU na lista de ingredientes (título nem sempre contém o ingrediente)
          return inIngredients || inTitle
        })
      })
    }

    const search = String(filters.search || '').trim().toLowerCase()
    if (search) {
      base = base.filter((recipe) => {
        const haystack = `${recipe.title || ''} ${recipe.ingredientsList || ''} ${recipe.category || ''} ${recipe.area || ''}`.toLowerCase()
        return haystack.includes(search)
      })
    }

    if (filters.area !== 'all') {
      base = base.filter((recipe) => normalizeArea(recipe.area) === filters.area)
    }

    if (filters.category !== 'all') {
      base = base.filter((recipe) => String(recipe.category || '') === filters.category)
    }

    if (filters.flavor !== 'all') {
      base = base.filter((recipe) => inferFlavor(recipe) === filters.flavor)
    }

    if (filters.hasVideo) {
      base = base.filter((recipe) => Boolean(recipe.video))
    }

    return base

    // eslint-disable-next-line react-hooks/exhaustive-deps
    // inferFlavor é estável por definição (não depende de state), mas é função local
  }, [recipes, selectedIngredients, filters])

  // Resetar paginação quando filtros mudarem (ingredientes ou filtros locais)
  useEffect(() => {
    const currentIngredients = selectedIngredients.join(',')
    const currentFilters = JSON.stringify(filters)

    if (prevIngredientsRef.current !== currentIngredients || prevFiltersRef.current !== currentFilters) {
      prevIngredientsRef.current = currentIngredients
      prevFiltersRef.current = currentFilters
      setCurrentPage(1)
    }
  }, [selectedIngredients, filters])

  const updateFilter = (key) => (event) => {
    const value = event?.target?.type === 'checkbox' ? event.target.checked : event.target.value
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      area: 'all',
      category: 'all',
      flavor: 'all',
      hasVideo: false
    })
  }

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

          <div className="recipes-filters" role="region" aria-label="Filtros de receitas">
            <div className="recipes-filters-row">
              <label className="recipes-filter">
                <span>Buscar</span>
                <input
                  type="text"
                  value={filters.search}
                  onChange={updateFilter('search')}
                  placeholder="Ex.: bolo, cenoura, chocolate..."
                />
              </label>

              <label className="recipes-filter">
                <span>País / Região</span>
                <select value={filters.area} onChange={updateFilter('area')}>
                  <option value="all">Todos</option>
                  {filterOptions.areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </label>

              <label className="recipes-filter">
                <span>Sabor</span>
                <select value={filters.flavor} onChange={updateFilter('flavor')}>
                  <option value="all">Todos</option>
                  <option value="doce">Doce</option>
                  <option value="salgado">Salgado</option>
                  <option value="bebida">Bebida</option>
                </select>
              </label>
            </div>

            <div className="recipes-filters-row">
              <label className="recipes-filter">
                <span>Categoria</span>
                <select value={filters.category} onChange={updateFilter('category')}>
                  <option value="all">Todas</option>
                  {filterOptions.categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="recipes-filter recipes-filter-check">
                <input type="checkbox" checked={filters.hasVideo} onChange={updateFilter('hasVideo')} />
                <span>Somente com vídeo</span>
              </label>

              <button type="button" className="recipes-clear-filters" onClick={clearFilters}>
                Limpar filtros
              </button>
            </div>
          </div>
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
                  <img 
                    src={recipe.image || ''}
                    alt={recipe.title} 
                    loading="lazy"
                    onError={(e) => {
                      console.error('Erro ao carregar imagem:', recipe.image)
                      // Tenta usar BASE_URL se o caminho direto falhar
                      if (recipe.image && !e.target.src.includes(import.meta.env.BASE_URL)) {
                        const baseUrl = import.meta.env.BASE_URL || '/'
                        const imagePath = recipe.image.startsWith('/') 
                          ? recipe.image.substring(1) 
                          : recipe.image
                        e.target.src = `${baseUrl}${imagePath}`
                      } else {
                        e.target.style.display = 'none'
                      }
                    }}
                  />
                  <span className="recipe-source-badge">{recipe.source ?? 'Receita'}</span>
                  {/* Badge visual indicando que a receita não possui URL de vídeo */}
                  {!recipe.video && (
                    <span 
                      className="recipe-no-video-badge" 
                      title="Esta receita não possui vídeo"
                      aria-label="Receita sem vídeo disponível"
                      role="status"
                    >
                      !
                    </span>
                  )}
                </div>
                <div className="recipe-card-content">
                  <h3>{recipe.title}</h3>
                  <div className="recipe-meta">
                    <span>📂 {recipe.category}</span>
                    <span>🌍 {normalizeArea(recipe.area)}</span>
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

