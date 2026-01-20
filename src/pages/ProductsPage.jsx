import { useMemo, useState } from 'react'
import { FiBarChart2, FiEye, FiFilter, FiGrid, FiHeart, FiList, FiPlus, FiSearch } from 'react-icons/fi'
import { useAppStore } from '../stores/appStore'
import './PageCommon.css'
import './ProductsPage.css'
import supermarketProductsRaw from '../../catalogo-mercado/products.en.json'
import supermarketProductsPt from '../../catalogo-mercado/products.pt.json'

const toNumber = (v) => {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)

const normalizeText = (value) => String(value ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

const typePtByTypeEn = {
  dairy: 'Laticínios',
  fruit: 'Frutas',
  vegetable: 'Vegetais',
  bakery: 'Padaria',
  meat: 'Carnes',
  vegan: 'Vegano'
}

export function ProductsPage() {
  const recipes = useAppStore((s) => s.recipes) || []
  const pricing = useAppStore((s) => s.pricing) || []
  const isLoading = useAppStore((s) => s.isLoading)

  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // grid | list
  const [sort, setSort] = useState('relevant') // relevant | price_asc | price_desc | name_asc | newest
  const [pageSize, setPageSize] = useState(24)
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(true)

  const [selectedCategories, setSelectedCategories] = useState([])
  const [availability, setAvailability] = useState('all') // all | in_stock
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const products = useMemo(() => {
    const pricingMap = new Map((pricing || []).map((p) => [p.recipeId, p]))
    const fromRecipes = (recipes || []).map((r) => {
      const p = pricingMap.get(r.id)
      const price = typeof p?.price === 'number' ? p.price : toNumber(r.unitCost) * 1.5
      const category = String(r.category || r.tag || r.type || 'Geral')
      const image = r.imageUrl || r.image || r.photo || null
      const ratingValue = r.ratingAvg ?? r.rating ?? null
      const ratingCount = r.ratingCount ?? r.reviewsCount ?? null
      const createdAt = r.createdAt || r.created_at || null
      return {
        id: r.id,
        name: r.name,
        category,
        price: Number.isFinite(price) ? price : 0,
        image,
        ratingValue: typeof ratingValue === 'number' ? ratingValue : null,
        ratingCount: typeof ratingCount === 'number' ? ratingCount : null,
        inStock: r.inStock ?? true,
        createdAt,
        description: r.description || r.desc || ''
      }
    })

    const supermarketList = Array.isArray(supermarketProductsRaw) ? supermarketProductsRaw : []
    const fromSupermarket = supermarketList.map((p, idx) => {
      // locale simples (pt hoje), mas já guardando EN para i18n futuro
      const locale = 'pt'

      const nameEn = p.title || `Produto ${idx + 1}`
      const descriptionEn = p.description || ''
      const typeEn = String(p.type || 'Geral')

      const filename = p.filename ? String(p.filename) : null
      const pt = filename ? supermarketProductsPt?.[filename] : null

      const namePt = pt?.title || null
      const descriptionPt = pt?.description || null
      const typePt = typePtByTypeEn[typeEn] || typeEn

      const name = locale === 'pt' ? (namePt || nameEn) : nameEn
      const description = locale === 'pt' ? (descriptionPt || descriptionEn) : descriptionEn
      const category = locale === 'pt' ? typePt : typeEn

      return {
        id: `supermarket:${filename || idx}`,
        name,
        category,
        price: toNumber(p.price),
        image: filename ? `/catalogo-mercado/images/${filename}` : null,
        ratingValue: typeof p.rating === 'number' ? p.rating : null,
        ratingCount: null,
        inStock: true,
        createdAt: null,
        description,
        nameEn,
        categoryEn: typeEn,
        descriptionEn
      }
    })

    return [...fromSupermarket, ...fromRecipes]
  }, [recipes, pricing])

  const categories = useMemo(() => {
    const set = new Set()
    for (const p of products) set.add(p.category || 'Geral')
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [products])

  const priceStats = useMemo(() => {
    const prices = products.map((p) => p.price).filter((v) => Number.isFinite(v))
    const min = prices.length ? Math.min(...prices) : 0
    const max = prices.length ? Math.max(...prices) : 0
    return { min, max }
  }, [products])

  const filtered = useMemo(() => {
    const q = normalizeText(query)
    const minP = minPrice === '' ? null : toNumber(minPrice)
    const maxP = maxPrice === '' ? null : toNumber(maxPrice)

    return products.filter((p) => {
      if (q) {
        const hay = normalizeText(`${p.name} ${p.nameEn || ''} ${p.category} ${p.categoryEn || ''} ${p.description || ''} ${p.descriptionEn || ''}`)
        if (!hay.includes(q)) return false
      }
      if (selectedCategories.length && !selectedCategories.includes(p.category)) return false
      if (availability === 'in_stock' && !p.inStock) return false
      if (minP !== null && p.price < minP) return false
      if (maxP !== null && p.price > maxP) return false
      return true
    })
  }, [products, query, selectedCategories, availability, minPrice, maxPrice])

  const sorted = useMemo(() => {
    const list = [...filtered]
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price)
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price)
    else if (sort === 'name_asc') list.sort((a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR'))
    else if (sort === 'newest') list.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    // relevant: mantém ordem “natural”
    return list
  }, [filtered, sort])

  const totalResults = sorted.length
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize))

  const safePage = clamp(page, 1, totalPages)
  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, safePage, pageSize])

  const activeChips = useMemo(() => {
    const chips = []
    for (const c of selectedCategories) chips.push({ key: `cat:${c}`, label: c, onRemove: () => setSelectedCategories((prev) => prev.filter((x) => x !== c)) })
    if (availability === 'in_stock') chips.push({ key: 'avail:in_stock', label: 'Em estoque', onRemove: () => setAvailability('all') })
    if (minPrice !== '' || maxPrice !== '') {
      const label = `Preço: ${minPrice !== '' ? formatCurrency(toNumber(minPrice)) : '—'} – ${maxPrice !== '' ? formatCurrency(toNumber(maxPrice)) : '—'}`
      chips.push({ key: 'price', label, onRemove: () => { setMinPrice(''); setMaxPrice('') } })
    }
    return chips
  }, [selectedCategories, availability, minPrice, maxPrice])

  const resetPage = () => setPage(1)

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((x) => x !== cat) : [...prev, cat]))
    resetPage()
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setAvailability('all')
    setMinPrice('')
    setMaxPrice('')
    setQuery('')
    setSort('relevant')
    setPageSize(24)
    setPage(1)
  }

  return (
    <div className="page products-page">
      <header className="products-header">
        <div className="products-header-left">
          <h1>Produtos</h1>
          <p className="products-subtitle">Explore nosso catálogo completo</p>
        </div>
        <div className="products-header-right">
          <div className="products-search">
            <FiSearch aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); resetPage() }}
              placeholder="Buscar por nome ou categoria"
              aria-label="Buscar produtos"
            />
          </div>
          <button type="button" className="products-filters-toggle" onClick={() => setFiltersOpen((v) => !v)}>
            <FiFilter aria-hidden="true" />
            Filtros
          </button>
        </div>
      </header>

      <div className="products-toolbar">
        <div className="products-toolbar-left">
          <strong>{totalResults}</strong> produto(s) encontrado(s)
          {activeChips.length > 0 && (
            <div className="products-chips" aria-label="Filtros ativos">
              {activeChips.map((chip) => (
                <button key={chip.key} type="button" className="products-chip" onClick={chip.onRemove} title="Remover filtro">
                  {chip.label} <span aria-hidden="true">×</span>
                </button>
              ))}
              <button type="button" className="products-chip products-chip--clear" onClick={clearFilters}>
                Limpar tudo
              </button>
            </div>
          )}
        </div>

        <div className="products-toolbar-right">
          <label className="products-select">
            <span>Ordenar</span>
            <select value={sort} onChange={(e) => { setSort(e.target.value); resetPage() }}>
              <option value="relevant">Mais relevantes</option>
              <option value="price_asc">Menor preço</option>
              <option value="price_desc">Maior preço</option>
              <option value="name_asc">Nome (A–Z)</option>
              <option value="newest">Mais recentes</option>
            </select>
          </label>
          <label className="products-select">
            <span>Por página</span>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); resetPage() }}>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </label>
          <div className="products-view-toggle" role="group" aria-label="Modo de visualização">
            <button type="button" className={`products-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
              <FiGrid aria-hidden="true" />
            </button>
            <button type="button" className={`products-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
              <FiList aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="products-layout">
        {filtersOpen && (
          <aside className="products-filters" aria-label="Filtros">
            <div className="filter-block">
              <h3>Categorias</h3>
              <div className="filter-list">
                {categories.map((cat) => (
                  <label key={cat} className="filter-check">
                    <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} />
                    <span>{cat}</span>
                  </label>
                ))}
                {categories.length === 0 && <div className="filter-empty">Sem categorias</div>}
              </div>
            </div>

            <div className="filter-block">
              <h3>Preço</h3>
              <div className="filter-row">
                <label>
                  <span>Mín</span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); resetPage() }}
                    placeholder={String(priceStats.min.toFixed(2))}
                  />
                </label>
                <label>
                  <span>Máx</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); resetPage() }}
                    placeholder={String(priceStats.max.toFixed(2))}
                  />
                </label>
              </div>
            </div>

            <div className="filter-block">
              <h3>Disponibilidade</h3>
              <div className="filter-row">
                <label className="filter-select">
                  <span>Status</span>
                  <select value={availability} onChange={(e) => { setAvailability(e.target.value); resetPage() }}>
                    <option value="all">Todos</option>
                    <option value="in_stock">Em estoque</option>
                  </select>
                </label>
              </div>
            </div>
          </aside>
        )}

        <section className="products-results" aria-label="Catálogo">
          {isLoading && (
            <div className={`products-grid ${viewMode === 'list' ? 'list' : ''}`} aria-label="Carregando produtos">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div key={idx} className="product-skeleton" />
              ))}
            </div>
          )}

          {!isLoading && totalResults === 0 && (
            <div className="products-empty">
              <h2>Nenhum produto encontrado</h2>
              <p>Tente remover filtros ou ajustar sua busca.</p>
              <button type="button" className="products-empty-btn" onClick={clearFilters}>Limpar filtros</button>
            </div>
          )}

          {!isLoading && totalResults > 0 && (
            <>
              <div className={`products-grid ${viewMode === 'list' ? 'list' : ''}`}>
                {pageItems.map((p) => (
                  <article key={p.id} className="product-card">
                    <div className="product-media">
                      <div className="product-image" aria-label={`Imagem de ${p.name}`}>
                        {p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <div className="product-image-placeholder">Sem imagem</div>}
                      </div>
                      <div className="product-quick-actions" aria-label="Ações rápidas">
                        <button type="button" className="icon-btn" title="Visualização rápida" aria-label="Visualização rápida">
                          <FiEye />
                        </button>
                        <button type="button" className="icon-btn" title="Favoritar" aria-label="Favoritar">
                          <FiHeart />
                        </button>
                        <button type="button" className="icon-btn" title="Comparar" aria-label="Comparar">
                          <FiBarChart2 />
                        </button>
                      </div>
                    </div>
                    <div className="product-body">
                      <div className="product-top">
                        <div className="product-title">
                          <h3 title={p.name}>{p.name}</h3>
                          <span className="product-tag">{p.category}</span>
                        </div>
                        <div className="product-price">{formatCurrency(p.price)}</div>
                      </div>
                      <div className="product-meta">
                        <span className={`product-stock ${p.inStock ? 'ok' : 'out'}`}>{p.inStock ? 'Em estoque' : 'Sob encomenda'}</span>
                      </div>
                      <div className="product-actions">
                        <button type="button" className="product-btn primary">Ver detalhes</button>
                        <button type="button" className="product-btn icon" title="Adicionar ao carrinho" aria-label="Adicionar ao carrinho">
                          <FiPlus aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <nav className="products-pagination" aria-label="Paginação">
                <button type="button" onClick={() => setPage((p) => clamp(p - 1, 1, totalPages))} disabled={safePage <= 1}>
                  Anterior
                </button>
                <div className="products-pages">
                  {Array.from({ length: totalPages }).slice(0, 9).map((_, idx) => {
                    const n = idx + 1
                    return (
                      <button
                        key={n}
                        type="button"
                        className={n === safePage ? 'active' : ''}
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </button>
                    )
                  })}
                  {totalPages > 9 && <span className="products-pages-ellipsis">…</span>}
                </div>
                <button type="button" onClick={() => setPage((p) => clamp(p + 1, 1, totalPages))} disabled={safePage >= totalPages}>
                  Próximo
                </button>
              </nav>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

