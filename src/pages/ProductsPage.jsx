import { useMemo, useState } from 'react'
import { FiBarChart2, FiEye, FiFilter, FiGrid, FiHeart, FiList, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi'
import { useAppStore } from '../stores/appStore'
import { FormModal } from '../components/ui/FormModal'
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

const PRODUCTS_WAREHOUSE_NAME = 'Produtos'
const PRODUCT_NOTES_PREFIX = '__product__:'

const safeJsonParse = (value) => {
  try {
    return JSON.parse(String(value))
  } catch {
    return null
  }
}

const encodeProductMeta = (meta) => `${PRODUCT_NOTES_PREFIX}${JSON.stringify(meta)}`

const decodeProductMeta = (notes) => {
  const raw = String(notes ?? '').trim()
  if (!raw) return null
  if (raw.startsWith(PRODUCT_NOTES_PREFIX)) return safeJsonParse(raw.slice(PRODUCT_NOTES_PREFIX.length))
  // fallback: se alguém salvou direto JSON
  if (raw.startsWith('{') && raw.endsWith('}')) return safeJsonParse(raw)
  return null
}

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
  const warehouses = useAppStore((s) => s.warehouses) || []
  const addWarehouse = useAppStore((s) => s.addWarehouse)
  const addWarehouseItem = useAppStore((s) => s.addWarehouseItem)
  const updateWarehouseItem = useAppStore((s) => s.updateWarehouseItem)
  const deleteWarehouseItem = useAppStore((s) => s.deleteWarehouseItem)

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

  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [stockModalLoading, setStockModalLoading] = useState(false)
  const [stockModalMode, setStockModalMode] = useState('edit') // edit | create
  const [stockEditingRef, setStockEditingRef] = useState(null) // { warehouseId, itemId }
  const [stockForm, setStockForm] = useState({
    name: '',
    category: '',
    brand: '',
    price: '0',
    quantity: '0',
    unit: 'un',
    imageUrl: '',
    imageData: '',
    notes: ''
  })

  const getStockItemByRef = (warehouseId, itemId) => {
    const warehouse = (warehouses || []).find((w) => w?.id === warehouseId) || null
    const items = Array.isArray(warehouse?.items) ? warehouse.items : []
    const item = items.find((it) => it?.id === itemId) || null
    return { warehouse, item }
  }

  const openStockItemEditor = (warehouseId, itemId) => {
    const { item } = getStockItemByRef(warehouseId, itemId)
    if (!item) {
      alert('Produto não encontrado no estoque.')
      return
    }
    const meta = decodeProductMeta(item.notes) || { kind: 'produto', source: 'manual', price: 0, brand: '', notes: '', image: null }
    const img = String(meta.image || '').trim()
    const isData = img.startsWith('data:')
    setStockModalMode('edit')
    setStockEditingRef({ warehouseId, itemId })
    setStockForm({
      name: item.name || '',
      category: item.category || 'Geral',
      brand: String(meta.brand || ''),
      price: String(meta.price ?? 0).replace('.', ','), // exibir padrão BR
      quantity: String(item.quantity ?? 0),
      unit: item.unit || 'un',
      imageUrl: img && !isData ? img : '',
      imageData: img && isData ? img : '',
      notes: String(meta.notes || '')
    })
    setStockModalOpen(true)
  }

  const findProductsWarehouse = () => {
    const target = normalizeText(PRODUCTS_WAREHOUSE_NAME)
    return (warehouses || []).find((w) => normalizeText(w?.name) === target) || null
  }

  const ensureProductsWarehouse = async () => {
    const existing = findProductsWarehouse()
    if (existing) return existing
    // Criar automaticamente caso não exista
    return await addWarehouse({ name: PRODUCTS_WAREHOUSE_NAME })
  }

  const buildProductMeta = (p) => {
    const isCatalog = String(p?.id || '').startsWith('supermarket:')
    if (isCatalog) {
      const catalogId = String(p.id).slice('supermarket:'.length) // normalmente filename (ex: 2.jpg)
      return {
        kind: 'produto',
        source: 'catalogo-mercado',
        catalogId,
        brand: '',
        notes: '',
        image: p.image || null,
        price: toNumber(p.price)
      }
    }
    return {
      kind: 'produto',
      source: 'receita',
      recipeId: String(p?.id || ''),
      brand: '',
      notes: '',
      image: p.image || null,
      price: toNumber(p.price)
    }
  }

  const buildManualProductMeta = () => {
    return {
      kind: 'produto',
      source: 'manual',
      brand: String(stockForm.brand || '').trim(),
      notes: String(stockForm.notes || '').trim(),
      image: String(stockForm.imageData || stockForm.imageUrl || '').trim() || null,
      price: toNumber(stockForm.price)
    }
  }

  const findProductItemInWarehouse = (warehouse, p) => {
    const items = Array.isArray(warehouse?.items) ? warehouse.items : []
    const expected = buildProductMeta(p)
    const byMeta = items.find((it) => {
      const meta = decodeProductMeta(it?.notes)
      if (!meta || meta.kind !== 'produto') return false
      if (expected.source !== meta.source) return false
      if (expected.source === 'catalogo-mercado') return meta.catalogId === expected.catalogId
      if (expected.source === 'receita') return meta.recipeId === expected.recipeId
      return false
    })
    if (byMeta) return byMeta
    // fallback: por nome (caso notas tenham sido alteradas manualmente)
    const nameKey = normalizeText(p?.name)
    return items.find((it) => normalizeText(it?.name) === nameKey) || null
  }

  const upsertProductToStock = async (p, { increment = 1, openEditor = false } = {}) => {
    const warehouse = await ensureProductsWarehouse()
    const existing = findProductItemInWarehouse(warehouse, p)

    if (existing) {
      const nextQty = Math.max(0, toNumber(existing.quantity) + toNumber(increment))
      await updateWarehouseItem(warehouse.id, existing.id, { quantity: nextQty })
      if (openEditor) {
        const meta = decodeProductMeta(existing.notes) || buildProductMeta(p)
        const img = String(meta.image || '').trim()
        const isData = img.startsWith('data:')
        setStockModalMode('edit')
        setStockEditingRef({ warehouseId: warehouse.id, itemId: existing.id })
        setStockForm({
          name: existing.name || p.name,
          category: existing.category || p.category || 'Geral',
          brand: String(meta.brand || ''),
          price: String(toNumber(meta.price ?? p.price)),
          quantity: String(nextQty),
          unit: existing.unit || 'un',
          imageUrl: img && !isData ? img : (String(p.image || '').trim() || ''),
          imageData: img && isData ? img : '',
          notes: String(meta.notes || '')
        })
        setStockModalOpen(true)
      }
      return { warehouseId: warehouse.id, itemId: existing.id }
    }

    const meta = buildProductMeta(p)
    const newItem = await addWarehouseItem(warehouse.id, {
      emoji: '🛍️',
      name: p.name,
      quantity: Math.max(0, toNumber(increment)),
      unit: 'un',
      minIdeal: 0,
      unitCost: 0,
      category: p.category || 'Geral',
      notes: encodeProductMeta(meta)
    })

    if (openEditor) {
      setStockModalMode('edit')
      setStockEditingRef({ warehouseId: warehouse.id, itemId: newItem.id })
      setStockForm({
        name: newItem.name || p.name,
        category: newItem.category || p.category || 'Geral',
        brand: '',
        price: String(toNumber(p.price)),
        quantity: String(newItem.quantity ?? 0),
        unit: newItem.unit || 'un',
        imageUrl: String(p.image || '').trim(),
        imageData: '',
        notes: ''
      })
      setStockModalOpen(true)
    }

    return { warehouseId: warehouse.id, itemId: newItem.id }
  }

  const openEditProductInStock = async (p) => {
    if (p?.source === 'manual' && p?.warehouseId && p?.itemId) {
      openStockItemEditor(p.warehouseId, p.itemId)
      return
    }
    setStockModalLoading(true)
    try {
      await upsertProductToStock(p, { increment: 0, openEditor: true })
    } catch (e) {
      console.error(e)
      alert(`Não foi possível abrir o editor do estoque: ${e.message || 'Erro desconhecido'}`)
    } finally {
      setStockModalLoading(false)
    }
  }

  const saveStockEdits = async () => {
    if (!String(stockForm.name || '').trim()) return

    setStockModalLoading(true)
    try {
      if (stockModalMode === 'create' || !stockEditingRef?.warehouseId || !stockEditingRef?.itemId) {
        const warehouse = await ensureProductsWarehouse()
        const meta = buildManualProductMeta()
        await addWarehouseItem(warehouse.id, {
          emoji: '🛍️',
          name: String(stockForm.name).trim(),
          quantity: Math.max(0, toNumber(stockForm.quantity)),
          unit: String(stockForm.unit || 'un'),
          minIdeal: 0,
          unitCost: 0,
          category: String(stockForm.category || 'Geral').trim(),
          notes: encodeProductMeta(meta)
        })
        // Após salvar um "novo produto", limpar campos para um próximo cadastro
        setStockForm({
          name: '',
          category: '',
          brand: '',
          price: '0',
          quantity: '0',
          unit: 'un',
          imageUrl: '',
          imageData: '',
          notes: ''
        })
        setStockModalMode('edit')
      } else {
        const warehouse = (warehouses || []).find((w) => w.id === stockEditingRef.warehouseId) || null
        const item = (Array.isArray(warehouse?.items) ? warehouse.items : []).find((it) => it.id === stockEditingRef.itemId) || null

        const currentMeta = decodeProductMeta(item?.notes) || { kind: 'produto' }
        const nextMeta = {
          ...currentMeta,
          brand: String(stockForm.brand || '').trim(),
          notes: String(stockForm.notes || '').trim(),
          price: toNumber(stockForm.price),
          image: String(stockForm.imageData || stockForm.imageUrl || '').trim() || null
        }

        await updateWarehouseItem(stockEditingRef.warehouseId, stockEditingRef.itemId, {
          name: String(stockForm.name).trim(),
          category: String(stockForm.category || 'Geral').trim(),
          quantity: Math.max(0, toNumber(stockForm.quantity)),
          unit: String(stockForm.unit || 'un'),
          notes: encodeProductMeta(nextMeta)
        })
      }

      setStockModalOpen(false)
      setStockEditingRef(null)
    } catch (e) {
      console.error(e)
      alert(`Não foi possível salvar no estoque: ${e.message || 'Erro desconhecido'}`)
    } finally {
      setStockModalLoading(false)
    }
  }

  const openCreateProduct = () => {
    setStockModalMode('create')
    setStockEditingRef(null)
    // Se o usuário já começou a preencher e fechou o modal, reabrir mantendo os dados
    const hasDraft =
      String(stockForm.name || '').trim() ||
      String(stockForm.category || '').trim() ||
      String(stockForm.brand || '').trim() ||
      String(stockForm.notes || '').trim() ||
      String(stockForm.imageUrl || '').trim() ||
      String(stockForm.imageData || '').trim() ||
      toNumber(stockForm.price) > 0 ||
      toNumber(stockForm.quantity) > 0

    if (!hasDraft || stockModalMode !== 'create') {
      setStockForm({
        name: '',
        category: '',
        brand: '',
        price: '0',
        quantity: '0',
        unit: 'un',
        imageUrl: '',
        imageData: '',
        notes: ''
      })
    }
    setStockModalOpen(true)
  }

  const products = useMemo(() => {
    const pricingMap = new Map((pricing || []).map((p) => [p.recipeId, p]))
    const fromRecipes = (recipes || []).map((r) => {
      const p = pricingMap.get(r.id)
      const price = typeof p?.price === 'number' ? p.price : toNumber(r.unitCost) * 1.5
      const category = String(r.category || r.tag || r.type || 'Geral')
      const image = r.imageUrl || r.image || r.photo || null
      const createdAt = r.createdAt || r.created_at || null
      return {
        id: r.id,
        source: 'receita',
        name: r.name,
        category,
        price: Number.isFinite(price) ? price : 0,
        image,
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
        source: 'catalogo-mercado',
        name,
        category,
        price: toNumber(p.price),
        image: filename ? `/catalogo-mercado/images/${filename}` : null,
        inStock: true,
        createdAt: null,
        description,
        nameEn,
        categoryEn: typeEn,
        descriptionEn
      }
    })

    // Produtos criados manualmente no Estoque (Armazém: Produtos)
    const productsWarehouse = findProductsWarehouse()
    const manualFromStock = (Array.isArray(productsWarehouse?.items) ? productsWarehouse.items : [])
      .map((it) => {
        const meta = decodeProductMeta(it?.notes)
        if (!meta || meta.kind !== 'produto' || meta.source !== 'manual') return null
        return {
          id: `stock:${productsWarehouse.id}:${it.id}`,
          source: 'manual',
          warehouseId: productsWarehouse.id,
          itemId: it.id,
          name: it.name,
          category: it.category || 'Geral',
          price: toNumber(meta.price),
          image: meta.image || null,
          inStock: toNumber(it.quantity) > 0,
          createdAt: it.createdAt || null,
          description: String(meta.notes || ''),
          nameEn: '',
          categoryEn: '',
          descriptionEn: ''
        }
      })
      .filter(Boolean)

    return [...manualFromStock, ...fromSupermarket, ...fromRecipes]
  }, [recipes, pricing, warehouses])

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
      if (availability === 'out_of_stock' && p.inStock) return false
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

  const handleDeleteManualProduct = async (p) => {
    if (!p?.warehouseId || !p?.itemId) return
    if (!window.confirm(`Tem certeza que deseja excluir "${p.name}"?`)) return

    setStockModalLoading(true)
    try {
      await deleteWarehouseItem(p.warehouseId, p.itemId)
      if (stockEditingRef?.warehouseId === p.warehouseId && stockEditingRef?.itemId === p.itemId) {
        setStockModalOpen(false)
        setStockEditingRef(null)
      }
    } catch (e) {
      console.error(e)
      alert(`Não foi possível excluir o produto: ${e.message || 'Erro desconhecido'}`)
    } finally {
      setStockModalLoading(false)
    }
  }

  return (
    <div className="page products-page">
      {/* 1) Contexto (logo abaixo do breadcrumb do MainLayout) */}
      <header className="products-context">
        <h1>Produtos</h1>
        <p className="products-subtitle">Explore nosso catálogo completo</p>
      </header>

      {/* 2) Barra de ações (linha única) */}
      <div className="products-actions-bar">
        <div className="products-actions-left">
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
        </div>
        <div className="products-actions-right">
          <button type="button" className="primary-btn products-action-btn" onClick={openCreateProduct} disabled={stockModalLoading}>
            <FiPlus aria-hidden="true" />
            Adicionar produto
          </button>
          <button
            type="button"
            className="secondary-btn products-action-btn"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-pressed={filtersOpen}
          >
            <FiFilter aria-hidden="true" />
            Filtros
          </button>
        </div>
      </div>

      {/* 3) Feedback + controles */}
      <div className="products-controls-bar">
        <div className="products-controls-left">
          {totalResults} produto(s) encontrado(s)
        </div>
        <div className="products-controls-right">
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
              <div className="filter-list filter-list--grid2">
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
                    <option value="out_of_stock">Indisponível</option>
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
                        {p?.source === 'manual' && p?.warehouseId && p?.itemId && (
                          <button
                            type="button"
                            className="icon-btn icon-btn--danger"
                            title="Excluir produto"
                            aria-label={`Excluir ${p.name}`}
                            onClick={() => handleDeleteManualProduct(p)}
                            disabled={stockModalLoading}
                          >
                            <FiTrash2 />
                          </button>
                        )}
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
                        <button type="button" className="product-btn primary" onClick={() => openEditProductInStock(p)} disabled={stockModalLoading}>
                          Editar
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

      <FormModal
        isOpen={stockModalOpen}
        title={stockModalMode === 'create' ? 'Novo produto' : 'Editar produto no estoque'}
        description={stockModalMode === 'create'
          ? `Crie um produto e adicione ao estoque automaticamente (Armazém: ${PRODUCTS_WAREHOUSE_NAME}).`
          : `Alterações aqui atualizam automaticamente o Estoque (Armazém: ${PRODUCTS_WAREHOUSE_NAME}).`
        }
        onClose={() => {
          if (stockModalLoading) return
          setStockModalOpen(false)
          setStockEditingRef(null)
        }}
        footer={
          <>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => {
                if (stockModalLoading) return
                setStockModalOpen(false)
                setStockEditingRef(null)
              }}
            >
              Cancelar
            </button>
            <button className="primary-btn" type="button" onClick={saveStockEdits} disabled={stockModalLoading}>
              Salvar
            </button>
          </>
        }
      >
        <label className="input-control">
          <span>Nome</span>
          <input value={stockForm.name} onChange={(e) => setStockForm((prev) => ({ ...prev, name: e.target.value }))} />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label className="input-control">
            <span>Categoria</span>
            <input value={stockForm.category} onChange={(e) => setStockForm((prev) => ({ ...prev, category: e.target.value }))} placeholder="Ex.: Laticínios" />
          </label>
          <label className="input-control">
            <span>Marca</span>
            <input value={stockForm.brand} onChange={(e) => setStockForm((prev) => ({ ...prev, brand: e.target.value }))} placeholder="Ex.: Nestlé" />
          </label>
        </div>

        <label className="input-control">
          <span>Preço (opcional)</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={stockForm.price}
            onChange={(e) => setStockForm((prev) => ({ ...prev, price: e.target.value }))}
            onBlur={(e) => {
              const raw = String(e.target.value || '').trim()
              if (!raw) return
              const n = toNumber(raw)
              const formatted = n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              setStockForm((prev) => ({ ...prev, price: formatted }))
            }}
            placeholder="0,00"
          />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <label className="input-control">
            <span>Quantidade</span>
            <input
              type="number"
              min="0"
              value={stockForm.quantity}
              onChange={(e) => setStockForm((prev) => ({ ...prev, quantity: e.target.value }))}
            />
          </label>
          <label className="input-control">
            <span>Unidade</span>
            <select value={stockForm.unit} onChange={(e) => setStockForm((prev) => ({ ...prev, unit: e.target.value }))}>
              <option value="un">un</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="L">L</option>
              <option value="ml">ml</option>
            </select>
          </label>
        </div>

        <label className="input-control">
          <span>Foto do produto (opcional)</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                if (!file) return
                if (file.size > 800 * 1024) {
                  alert('Imagem muito grande. Tente uma foto menor (até ~800KB).')
                  e.target.value = ''
                  return
                }
                const reader = new FileReader()
                reader.onload = () => {
                  const dataUrl = String(reader.result || '')
                  setStockForm((prev) => ({ ...prev, imageData: dataUrl, imageUrl: '' }))
                }
                reader.readAsDataURL(file)
              }}
            />

            <input
              type="url"
              placeholder="ou cole uma URL da foto (https://...)"
              value={stockForm.imageUrl}
              onChange={(e) => setStockForm((prev) => ({ ...prev, imageUrl: e.target.value, imageData: prev.imageData }))}
            />

            {(stockForm.imageData || stockForm.imageUrl) && (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <img
                  src={stockForm.imageData || stockForm.imageUrl}
                  alt="Prévia da foto do produto"
                  style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border-primary)' }}
                />
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setStockForm((prev) => ({ ...prev, imageUrl: '', imageData: '' }))}
                  disabled={stockModalLoading}
                >
                  Remover foto
                </button>
              </div>
            )}
          </div>
        </label>

        <label className="input-control">
          <span>Observações (opcional)</span>
          <textarea
            rows="3"
            value={stockForm.notes}
            onChange={(e) => setStockForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Ex.: lote, validade, fornecedor..."
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </label>
      </FormModal>
    </div>
  )
}

