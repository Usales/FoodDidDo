import { useMemo, useState } from 'react'
import { FormModal } from '../components/ui/FormModal'
import { useAppStore } from '../stores/appStore'
import { FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import './PageCommon.css'
import supermarketProductsRaw from '../../catalogo-mercado/products.en.json'
import supermarketProductsPt from '../../catalogo-mercado/products.pt.json'

const PRODUCT_NOTES_PREFIX = '__product__:'
const ITEM_NOTES_PREFIX = '__item__:'
const ITEM_ICON_FILE_INPUT_ID = 'stock-item-icon-file'

const toNumber = (v) => {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

const normalizeText = (value) => String(value ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

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
  if (raw.startsWith('{') && raw.endsWith('}')) return safeJsonParse(raw)
  return null
}

const encodeItemMeta = (meta) => `${ITEM_NOTES_PREFIX}${JSON.stringify(meta)}`

const decodeItemMeta = (notes) => {
  const raw = String(notes ?? '').trim()
  if (!raw) return null
  if (raw.startsWith(ITEM_NOTES_PREFIX)) return safeJsonParse(raw.slice(ITEM_NOTES_PREFIX.length))
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

const buildCatalogProducts = () => {
  const list = Array.isArray(supermarketProductsRaw) ? supermarketProductsRaw : []
  return list.map((p, idx) => {
    const filename = p?.filename ? String(p.filename) : null
    const pt = filename ? supermarketProductsPt?.[filename] : null
    const typeEn = String(p?.type || 'Geral')
    const category = typePtByTypeEn[typeEn] || typeEn
    const name = pt?.title || p?.title || `Produto ${idx + 1}`
    const image = filename ? `/catalogo-mercado/images/${filename}` : null
    return {
      catalogId: filename || String(idx),
      name,
      category,
      price: toNumber(p?.price),
      image
    }
  })
}

// Função para formatar moeda brasileira
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Função para formatar data
const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date))
}

// Função para calcular status do item
const getItemStatus = (quantity, minIdeal) => {
  if (quantity === 0) return { label: 'Crítico', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' }
  if (quantity < minIdeal) return { label: 'Baixo', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' }
  return { label: 'OK', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' }
}

// Categorias disponíveis
const categories = [
  'Farinhas',
  'Laticínios',
  'Ovos',
  'Carnes',
  'Vegetais',
  'Frutas',
  'Temperos',
  'Embalagens',
  'Outros'
]

// Unidades disponíveis
const units = ['g', 'kg', 'ml', 'L', 'un']

export function StockPage() {
  const warehouses = useAppStore((state) => state.warehouses)
  const recipes = useAppStore((state) => state.recipes)
  const addWarehouse = useAppStore((state) => state.addWarehouse)
  const updateWarehouse = useAppStore((state) => state.updateWarehouse)
  const deleteWarehouse = useAppStore((state) => state.deleteWarehouse)
  const addWarehouseItem = useAppStore((state) => state.addWarehouseItem)
  const updateWarehouseItem = useAppStore((state) => state.updateWarehouseItem)
  const deleteWarehouseItem = useAppStore((state) => state.deleteWarehouseItem)
  const addStockMovement = useAppStore((state) => state.addStockMovement)

  const [searchQuery, setSearchQuery] = useState('')
  const [expandedWarehouses, setExpandedWarehouses] = useState(new Set())
  const [importingWarehouseIds, setImportingWarehouseIds] = useState([])
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false)
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null)
  const [editingWarehouse, setEditingWarehouse] = useState(null)
  const [editingItem, setEditingItem] = useState(null)

  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    capacity: '',
    capacityUnit: 'kg'
  })

  const [itemForm, setItemForm] = useState({
    emoji: '📦',
    iconUrl: '',
    iconData: '',
    iconFileName: '',
    name: '',
    quantity: '',
    unit: 'g',
    minIdeal: '',
    unitCost: '',
    category: '',
    notes: ''
  })

  const [movementForm, setMovementForm] = useState({
    warehouseId: '',
    itemId: '',
    type: 'entrada',
    quantity: '',
    reference: ''
  })

  // Buscador inteligente
  const filteredWarehouses = useMemo(() => {
    if (!searchQuery.trim()) return warehouses || []

    const query = searchQuery.toLowerCase().trim()

    return (warehouses || [])
      .filter(warehouse => warehouse && warehouse.id && warehouse.name)
      .map((warehouse) => {
        // Verificar se o armazém corresponde
        const warehouseMatches = (warehouse.name || '').toLowerCase().includes(query)

        // Filtrar itens do armazém
        const items = warehouse.items || []
        const filteredItems = items.filter((item) => {
          if (!item || !item.name) return false
          const itemMatches =
            (item.name || '').toLowerCase().includes(query) ||
            (item.emoji || '').includes(query) ||
            (item.category || '').toLowerCase().includes(query) ||
            getItemStatus(item.quantity || 0, item.minIdeal || 0).label.toLowerCase().includes(query) ||
            query === 'ok' && (item.quantity || 0) >= (item.minIdeal || 0) ||
            query === 'baixo' && (item.quantity || 0) < (item.minIdeal || 0) && (item.quantity || 0) > 0 ||
            query === 'crítico' && (item.quantity || 0) === 0

          return itemMatches
        })

        // Se o armazém corresponde ou tem itens que correspondem, incluir
        if (warehouseMatches || filteredItems.length > 0) {
          return { ...warehouse, items: warehouseMatches ? items : filteredItems }
        }

        return null
      })
      .filter(Boolean)
  }, [warehouses, searchQuery])

  // Função para calcular o saldo real (quantidade inicial - quantidade consumida)
  const calculateRealStock = (itemName, initialQuantity) => {
    // Buscar todas as receitas que usam este ingrediente
    const consumedQuantity = recipes.reduce((total, recipe) => {
      if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
        return total
      }
      
      // Somar todas as quantidades consumidas deste ingrediente em todas as receitas
      const recipeConsumption = recipe.ingredients
        .filter(ing => ing.name && ing.name.toLowerCase() === itemName.toLowerCase())
        .reduce((sum, ing) => sum + (Number(ing.quantity) || 0), 0)
      
      return total + recipeConsumption
    }, 0)
    
    // Saldo real = quantidade inicial - quantidade consumida
    const realStock = Math.max(0, initialQuantity - consumedQuantity)
    return realStock
  }

  const toggleWarehouse = (warehouseId) => {
    setExpandedWarehouses((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(warehouseId)) {
        newSet.delete(warehouseId)
      } else {
        newSet.add(warehouseId)
      }
      return newSet
    })
  }

  const handleAddWarehouse = async () => {
    if (!warehouseForm.name.trim()) return

    try {
      if (editingWarehouse) {
        await updateWarehouse(editingWarehouse.id, {
          name: warehouseForm.name.trim(),
          capacity: warehouseForm.capacity ? Number(warehouseForm.capacity) : undefined,
          capacityUnit: warehouseForm.capacityUnit
        })
      } else {
        await addWarehouse({
          name: warehouseForm.name.trim(),
          capacity: warehouseForm.capacity ? Number(warehouseForm.capacity) : undefined,
          capacityUnit: warehouseForm.capacityUnit
        })
      }

      setWarehouseForm({ name: '', capacity: '', capacityUnit: 'kg' })
      setEditingWarehouse(null)
      setIsWarehouseModalOpen(false)
    } catch (error) {
      console.error('Erro ao salvar armazém:', error)
      alert(`Erro ao salvar armazém: ${error.message || 'Erro desconhecido'}`)
    }
  }

  const handleEditWarehouse = (warehouse) => {
    setEditingWarehouse(warehouse)
    setWarehouseForm({
      name: warehouse.name,
      capacity: warehouse.capacity?.toString() || '',
      capacityUnit: warehouse.capacityUnit || 'kg'
    })
    setIsWarehouseModalOpen(true)
  }

  const handleDeleteWarehouse = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este armazém? Todos os itens serão removidos.')) {
      deleteWarehouse(id)
    }
  }

  const handleAddItem = () => {
    if (!itemForm.name.trim() || !selectedWarehouseId) return

    const iconValue = String(itemForm.iconData || itemForm.iconUrl || '').trim()
    const notesText = String(itemForm.notes || '').trim()
    const isEditingProductMeta = Boolean(decodeProductMeta(editingItem?.notes)?.kind === 'produto')
    const isEditingItemMeta = Boolean(decodeItemMeta(editingItem?.notes)?.kind === 'item')

    const computeNotesToSave = () => {
      // 1) Se o item atual é um "produto" (metadados __product__), preservar e só atualizar o campo notes dentro do meta.
      if (isEditingProductMeta) {
        const meta = decodeProductMeta(editingItem?.notes) || { kind: 'produto' }
        const nextMeta = { ...meta, notes: notesText }
        return encodeProductMeta(nextMeta)
      }

      // 2) Se temos ícone, salvar como meta de item (ou atualizar meta existente).
      if (iconValue) {
        const prev = decodeItemMeta(editingItem?.notes)
        const nextMeta = {
          ...(prev && prev.kind === 'item' ? prev : null),
          kind: 'item',
          icon: iconValue,
          notes: notesText
        }
        return encodeItemMeta(nextMeta)
      }

      // 3) Se já era meta de item mas o usuário removeu o ícone, volta para texto simples.
      if (isEditingItemMeta) return notesText || undefined

      // 4) Caso padrão: texto simples
      return notesText || undefined
    }

    const itemData = {
      emoji: itemForm.emoji,
      name: itemForm.name,
      quantity: Number(itemForm.quantity) || 0,
      unit: itemForm.unit,
      minIdeal: Number(itemForm.minIdeal) || 0,
      unitCost: Number(itemForm.unitCost) || 0,
      category: itemForm.category || undefined,
      notes: computeNotesToSave()
    }

    if (editingItem) {
      updateWarehouseItem(selectedWarehouseId, editingItem.id, itemData)
    } else {
      addWarehouseItem(selectedWarehouseId, itemData)
    }

    setItemForm({
      emoji: '📦',
      iconUrl: '',
      iconData: '',
      iconFileName: '',
      name: '',
      quantity: '',
      unit: 'g',
      minIdeal: '',
      unitCost: '',
      category: '',
      notes: ''
    })
    setSelectedWarehouseId(null)
    setEditingItem(null)
    setIsItemModalOpen(false)
  }

  const handleEditItem = (warehouseId, item) => {
    setSelectedWarehouseId(warehouseId)
    setEditingItem(item)

    const productMeta = decodeProductMeta(item?.notes)
    const itemMeta = !productMeta ? decodeItemMeta(item?.notes) : null
    const icon =
      (productMeta?.kind === 'produto' ? String(productMeta.image || '').trim() : '') ||
      (itemMeta?.kind === 'item' ? String(itemMeta.icon || '').trim() : '')
    const isData = icon.startsWith('data:')
    const notesText =
      (productMeta?.kind === 'produto' ? String(productMeta.notes || '') : '') ||
      (itemMeta?.kind === 'item' ? String(itemMeta.notes || '') : '') ||
      String(item?.notes || '')

    setItemForm({
      emoji: item.emoji || '📦',
      iconUrl: icon && !isData ? icon : '',
      iconData: icon && isData ? icon : '',
      iconFileName: '',
      name: item.name,
      quantity: String(item.quantity ?? 0),
      unit: item.unit || 'g',
      minIdeal: String(item.minIdeal ?? 0),
      unitCost: String(item.unitCost ?? 0),
      category: item.category ?? '',
      notes: notesText
    })
    setIsItemModalOpen(true)
  }

  const handleDeleteItem = (warehouseId, itemId) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      deleteWarehouseItem(warehouseId, itemId)
    }
  }

  const handleOpenItemModal = (warehouseId) => {
    setSelectedWarehouseId(warehouseId)
    setEditingItem(null)
    setItemForm({
      emoji: '📦',
      iconUrl: '',
      iconData: '',
      iconFileName: '',
      name: '',
      quantity: '',
      unit: 'g',
      minIdeal: '',
      unitCost: '',
      category: '',
      notes: ''
    })
    setIsItemModalOpen(true)
  }

  const findCatalogItemInWarehouse = (warehouse, catalogProduct) => {
    const items = Array.isArray(warehouse?.items) ? warehouse.items : []
    const expectedId = String(catalogProduct?.catalogId || '')
    const expectedNameKey = normalizeText(catalogProduct?.name)
    return (
      items.find((it) => {
        const meta = decodeProductMeta(it?.notes)
        if (meta?.kind === 'produto' && meta?.source === 'catalogo-mercado') {
          return String(meta.catalogId || '') === expectedId
        }
        return false
      }) ||
      items.find((it) => normalizeText(it?.name) === expectedNameKey) ||
      null
    )
  }

  const importCatalogToWarehouse = async (warehouse) => {
    if (!warehouse?.id) return
    if (importingWarehouseIds.includes(warehouse.id)) return

    setImportingWarehouseIds((prev) => [...prev, warehouse.id])
    try {
      const catalog = buildCatalogProducts()
      const missing = catalog.filter((p) => !findCatalogItemInWarehouse(warehouse, p))
      if (missing.length === 0) {
        alert('Este armazém já contém todos os produtos do catálogo.')
        return
      }

      // Criar apenas os itens faltantes (sem duplicar)
      // OBS: como depende de API, fazemos em sequência para evitar sobrecarga.
      for (const p of missing) {
        const meta = {
          kind: 'produto',
          source: 'catalogo-mercado',
          catalogId: String(p.catalogId),
          brand: '',
          notes: '',
          image: p.image || null,
          price: toNumber(p.price)
        }

        await addWarehouseItem(warehouse.id, {
          emoji: '🛍️',
          name: p.name,
          quantity: 0,
          unit: 'un',
          minIdeal: 0,
          unitCost: 0,
          category: p.category || 'Geral',
          notes: encodeProductMeta(meta)
        })
      }

      alert(`Importação concluída: ${missing.length} produto(s) adicionados ao armazém "${warehouse.name}".`)
    } catch (error) {
      console.error('Erro ao importar catálogo:', error)
      alert(`Erro ao importar catálogo: ${error.message || 'Erro desconhecido'}`)
    } finally {
      setImportingWarehouseIds((prev) => prev.filter((id) => id !== warehouse.id))
    }
  }

  const handleSaveMovement = () => {
    if (!movementForm.warehouseId || !movementForm.itemId || !movementForm.quantity) return

    const warehouse = warehouses.find((w) => w.id === movementForm.warehouseId)
    const item = warehouse?.items.find((i) => i.id === movementForm.itemId)

    if (!item) return

    const quantity = Number(movementForm.quantity)
    const newQuantity =
      movementForm.type === 'entrada' ? item.quantity + quantity : item.quantity - quantity

    updateWarehouseItem(movementForm.warehouseId, movementForm.itemId, {
      quantity: Math.max(0, newQuantity)
    })

    addStockMovement({
      id: crypto.randomUUID(),
      warehouseId: movementForm.warehouseId,
      itemId: movementForm.itemId,
      type: movementForm.type,
      quantity,
      reference: movementForm.reference || undefined,
      createdAt: new Date().toISOString()
    })

    setMovementForm({
      warehouseId: '',
      itemId: '',
      type: 'entrada',
      quantity: '',
      reference: ''
    })
    setIsMovementModalOpen(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Estoque</h1>
      </div>

      {/* Barra superior */}
      <section className="page-stack">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <div style={{ position: 'relative' }}>
              <FiSearch
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontSize: '1.1rem'
                }}
              />
              <input
                type="text"
                placeholder="Buscar armazéns, itens, categorias, status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>
          <button
            className="primary-btn"
            type="button"
            onClick={() => {
              setEditingWarehouse(null)
              setWarehouseForm({ name: '', capacity: '', capacityUnit: 'kg' })
              setIsWarehouseModalOpen(true)
            }}
          >
            ➕ Adicionar Armazém
          </button>
          <button
            className="ghost-btn"
            type="button"
            onClick={() => setIsMovementModalOpen(true)}
          >
            Registrar Movimentação
          </button>
        </div>
      </section>

      {/* Lista de Armazéns */}
      <section className="page-stack">
        {filteredWarehouses.length === 0 ? (
          <div className="card-tile" style={{ textAlign: 'center', padding: '3rem' }}>
            {warehouses.length === 0
              ? 'Nenhum armazém cadastrado. Adicione seu primeiro armazém!'
              : 'Nenhum resultado encontrado para sua busca.'}
          </div>
        ) : (
          filteredWarehouses.map((warehouse) => {
            if (!warehouse || !warehouse.id) {
              console.error('Armazém inválido:', warehouse)
              return null
            }
            const isExpanded = expandedWarehouses.has(warehouse.id)
            const itemCount = (warehouse.items || []).length

            return (
              <div
                key={warehouse.id}
                className="card-tile"
                style={{ marginBottom: '1rem', padding: '1.5rem' }}
              >
                {/* Header do armazém */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <span style={{ fontSize: '1.5rem' }}>📦</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{warehouse.name}</h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        • Itens: {itemCount}
                        {warehouse.capacity && (
                          <> • Capacidade: {warehouse.capacity} {warehouse.capacityUnit}</>
                        )}
                        {warehouse.updatedAt && (
                          <> • Última atualização: {formatDate(warehouse.updatedAt)}</>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="ghost-btn"
                      type="button"
                      onClick={() => handleEditWarehouse(warehouse)}
                      style={{ fontSize: '0.9rem' }}
                    >
                      Editar
                    </button>
                    <button
                      className="ghost-btn"
                      type="button"
                      onClick={() => handleDeleteWarehouse(warehouse.id)}
                      style={{ fontSize: '0.9rem', color: 'var(--primary-color)' }}
                    >
                      Excluir
          </button>
        </div>
                </div>

                <div className="divider" />

                {/* Botão para expandir/recolher */}
                <button
                  type="button"
                  onClick={() => toggleWarehouse(warehouse.id)}
                  style={{
                    width: '100%',
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: 600
                  }}
                >
                  {isExpanded ? (
                    <>
                      <FiChevronUp /> Ocultar itens
                    </>
                  ) : (
                    <>
                      <FiChevronDown /> Mostrar itens
                    </>
                  )}
                </button>

                {/* Itens do armazém */}
                {isExpanded && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: 'var(--text-muted)'
                        }}
                      >
                        🔽 ITENS DO ARMAZÉM
                      </div>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => importCatalogToWarehouse(warehouse)}
                        disabled={importingWarehouseIds.includes(warehouse.id)}
                        title="Adiciona ao armazém todos os produtos do catálogo que estiverem faltando"
                      >
                        {importingWarehouseIds.includes(warehouse.id) ? 'Importando…' : 'Importar catálogo'}
                      </button>
                    </div>

                    {(!warehouse.items || warehouse.items.length === 0) ? (
                      <div
                        style={{
                          padding: '2rem',
                          textAlign: 'center',
                          color: 'var(--text-muted)',
                          background: 'var(--bg-secondary)',
                          borderRadius: '8px'
                        }}
                      >
                        Nenhum item cadastrado neste armazém.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(() => {
                          // Consolidar itens duplicados (mesmo nome) somando as quantidades
                          const itemsMap = new Map()
                          ;(warehouse.items || []).forEach((item) => {
                            if (!item || !item.id) return
                            
                            const itemName = item.name.toLowerCase().trim()
                            if (itemsMap.has(itemName)) {
                              // Se já existe, somar a quantidade
                              const existing = itemsMap.get(itemName)
                              itemsMap.set(itemName, {
                                ...existing,
                                quantity: existing.quantity + (Number(item.quantity) || 0),
                                // Manter o primeiro item como base, mas somar quantidades
                                id: existing.id // Manter o ID do primeiro
                              })
                            } else {
                              // Primeira ocorrência deste item
                              itemsMap.set(itemName, { ...item, quantity: Number(item.quantity) || 0 })
                            }
                          })
                          
                          // Converter Map para Array
                          const consolidatedItems = Array.from(itemsMap.values())
                          
                          return consolidatedItems.map((item) => {
                            // Calcular saldo real (quantidade inicial consolidada - quantidade consumida)
                            const realStock = calculateRealStock(item.name, item.quantity)
                            const status = getItemStatus(realStock, 0) // Usar 0 como mínimo ideal para o status

                          return (
                            <div
                              key={item.id}
                              style={{
                                padding: '1rem',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                {(() => {
                                  const productMeta = decodeProductMeta(item?.notes)
                                  const itemMeta = productMeta ? null : decodeItemMeta(item?.notes)
                                  const img =
                                    (productMeta?.kind === 'produto' ? String(productMeta.image || '').trim() : '') ||
                                    (itemMeta?.kind === 'item' ? String(itemMeta.icon || '').trim() : '')
                                  if (img) {
                                    return (
                                      <img
                                        src={img}
                                        alt={item.name}
                                        style={{
                                          width: 44,
                                          height: 44,
                                          borderRadius: 10,
                                          objectFit: 'cover',
                                          border: '1px solid var(--border-primary)',
                                          flex: '0 0 auto'
                                        }}
                                      />
                                    )
                                  }
                                  return <span style={{ fontSize: '1.8rem' }}>{item.emoji || '📦'}</span>
                                })()}
                                <div style={{ flex: 1 }}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      marginBottom: '0.25rem'
                                    }}
                                  >
                                    <strong style={{ fontSize: '1rem' }}>{item.name}</strong>
                                    <span
                                      className="pill"
                                      style={{
                                        background: status.bg,
                                        color: status.color,
                                        border: `1px solid ${status.color}40`,
                                        fontSize: '0.75rem',
                                        padding: '0.2rem 0.6rem'
                                      }}
                                    >
                                      {status.label}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      fontSize: '0.85rem',
                                      color: 'var(--text-muted)',
                                      display: 'flex',
                                      flexWrap: 'wrap',
                                      gap: '0.5rem'
                                    }}
                                  >
                                    <span>
                                      Saldo: <strong>{realStock.toLocaleString('pt-BR')}</strong> {item.unit}
                                    </span>
                                    {item.unitCost && item.unitCost > 0 && (
                                      <>
                                        <span>•</span>
                                        <span>
                                          Custo de compra: <strong>{formatCurrency(realStock * item.unitCost)}</strong>
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  className="ghost-btn"
                                  type="button"
                                  onClick={() => handleEditItem(warehouse.id, item)}
                                  style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                                >
                                  Editar
                                </button>
                                <button
                                  className="ghost-btn"
                                  type="button"
                                  onClick={() => handleDeleteItem(warehouse.id, item.id)}
                                  style={{
                                    fontSize: '0.85rem',
                                    padding: '0.5rem 0.75rem',
                                    color: 'var(--primary-color)'
                                  }}
                                >
                                  Excluir
                                </button>
                              </div>
                            </div>
                          )
                        })
                        })()}
                      </div>
                    )}

                    {/* Botão adicionar item */}
                    <button
                      type="button"
                      onClick={() => handleOpenItemModal(warehouse.id)}
                      className="primary-btn"
                      style={{ marginTop: '1rem', width: '100%' }}
                    >
                      ➕ Adicionar item
                    </button>
              </div>
                )}
        </div>
            )
          })
        )}
      </section>

      {/* Modal: Adicionar/Editar Armazém */}
      <FormModal
        isOpen={isWarehouseModalOpen}
        title={editingWarehouse ? 'Editar Armazém' : 'Adicionar Armazém'}
        description="Organize seus estoques em armazéns separados."
        onClose={() => {
          setIsWarehouseModalOpen(false)
          setEditingWarehouse(null)
          setWarehouseForm({ name: '', capacity: '', capacityUnit: 'kg' })
        }}
        footer={
          <>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => {
                setIsWarehouseModalOpen(false)
                setEditingWarehouse(null)
                setWarehouseForm({ name: '', capacity: '', capacityUnit: 'kg' })
              }}
            >
              Cancelar
            </button>
            <button className="primary-btn" type="button" onClick={handleAddWarehouse}>
              {editingWarehouse ? 'Salvar alterações' : 'Criar armazém'}
            </button>
          </>
        }
      >
        <label className="input-control">
          <span>Nome do armazém</span>
          <input
            value={warehouseForm.name}
            onChange={(e) => setWarehouseForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Ex.: Armazém Principal"
          />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <label className="input-control">
            <span>Capacidade (opcional)</span>
            <input
              type="number"
              value={warehouseForm.capacity}
              onChange={(e) => setWarehouseForm((prev) => ({ ...prev, capacity: e.target.value }))}
              placeholder="Ex.: 120"
            />
          </label>
          <label className="input-control">
            <span>Unidade</span>
            <select
              value={warehouseForm.capacityUnit}
              onChange={(e) => setWarehouseForm((prev) => ({ ...prev, capacityUnit: e.target.value }))}
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="L">L</option>
              <option value="ml">ml</option>
            </select>
          </label>
        </div>
      </FormModal>

      {/* Modal: Adicionar/Editar Item */}
      <FormModal
        isOpen={isItemModalOpen}
        title={editingItem ? 'Editar Item' : 'Adicionar Item ao Armazém'}
        description="Cadastre um novo item no armazém selecionado."
        onClose={() => {
          setIsItemModalOpen(false)
          setSelectedWarehouseId(null)
          setEditingItem(null)
          setItemForm({
            emoji: '📦',
            iconUrl: '',
            iconData: '',
            iconFileName: '',
            name: '',
            quantity: '',
            unit: 'g',
            minIdeal: '',
            unitCost: '',
            category: '',
            notes: ''
          })
        }}
        footer={
          <>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => {
                setIsItemModalOpen(false)
                setSelectedWarehouseId(null)
                setEditingItem(null)
              }}
            >
              Cancelar
            </button>
            <button className="primary-btn" type="button" onClick={handleAddItem}>
              {editingItem ? 'Salvar alterações' : 'Adicionar item'}
            </button>
          </>
        }
      >
        <label className="input-control">
          <span>Ícone (opcional)</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            <input
              id={ITEM_ICON_FILE_INPUT_ID}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                if (!file) return
                if (file.size > 800 * 1024) {
                  alert('Imagem muito grande. Tente uma imagem menor (até ~800KB).')
                  e.target.value = ''
                  return
                }
                const reader = new FileReader()
                reader.onload = () => {
                  const dataUrl = String(reader.result || '')
                  setItemForm((prev) => ({
                    ...prev,
                    iconData: dataUrl,
                    iconUrl: '',
                    iconFileName: file.name || 'imagem'
                  }))
                }
                reader.readAsDataURL(file)
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <label
                htmlFor={ITEM_ICON_FILE_INPUT_ID}
                className="secondary-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  width: 'fit-content'
                }}
                title="Selecionar imagem do computador"
              >
                Escolher imagem
              </label>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {itemForm.iconFileName
                  ? itemForm.iconFileName
                  : (itemForm.iconUrl ? 'Usando URL do ícone' : 'Nenhum arquivo selecionado')}
              </span>
            </div>

            <input
              type="url"
              placeholder="ou cole uma URL do ícone (https://...)"
              value={itemForm.iconUrl}
              onChange={(e) =>
                setItemForm((prev) => ({
                  ...prev,
                  iconUrl: e.target.value,
                  iconData: prev.iconData,
                  iconFileName: prev.iconFileName
                }))}
            />

            {(itemForm.iconData || itemForm.iconUrl) && (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <img
                  src={itemForm.iconData || itemForm.iconUrl}
                  alt="Prévia do ícone"
                  style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border-primary)' }}
                />
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setItemForm((prev) => ({ ...prev, iconUrl: '', iconData: '', iconFileName: '' }))}
                >
                  Remover ícone
                </button>
              </div>
            )}
          </div>
          <small style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Se não escolher ícone, será usado o emoji padrão do item.
          </small>
        </label>

        <label className="input-control">
          <span>Nome do item</span>
          <input
            value={itemForm.name}
            onChange={(e) => setItemForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Ex.: Farinha de trigo"
          />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <label className="input-control">
            <span>Quantidade inicial</span>
            <input
              type="number"
              value={itemForm.quantity}
              onChange={(e) => setItemForm((prev) => ({ ...prev, quantity: e.target.value }))}
              placeholder="0"
              min="0"
            />
          </label>
          <label className="input-control">
            <span>Unidade</span>
            <select
              value={itemForm.unit}
              onChange={(e) => setItemForm((prev) => ({ ...prev, unit: e.target.value }))}
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="input-control">
          <span>Custo unitário</span>
          <input
            type="number"
            step="0.01"
            value={itemForm.unitCost}
            onChange={(e) => setItemForm((prev) => ({ ...prev, unitCost: e.target.value }))}
            placeholder="0.00"
            min="0"
          />
        </label>

        <label className="input-control">
          <span>Quantidade mínima ideal</span>
          <input
            type="number"
            value={itemForm.minIdeal}
            onChange={(e) => setItemForm((prev) => ({ ...prev, minIdeal: e.target.value }))}
            placeholder="0"
            min="0"
          />
          <small style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Usado para alertas de estoque baixo
          </small>
        </label>

        <label className="input-control">
          <span>Categoria (opcional)</span>
          <select
            value={itemForm.category}
            onChange={(e) => setItemForm((prev) => ({ ...prev, category: e.target.value }))}
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label className="input-control">
          <span>Observações (opcional)</span>
          <textarea
            value={itemForm.notes}
            onChange={(e) => setItemForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Ex.: Somente orgânico, Lote 2025, etc."
            rows="3"
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

      {/* Modal: Registrar Movimentação */}
      <FormModal
        isOpen={isMovementModalOpen}
        title="Registrar Movimentação"
        description="Registre entradas e saídas de itens do estoque."
        onClose={() => {
          setIsMovementModalOpen(false)
          setMovementForm({
            warehouseId: '',
            itemId: '',
            type: 'entrada',
            quantity: '',
            reference: ''
          })
        }}
        footer={
          <>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => {
                setIsMovementModalOpen(false)
                setMovementForm({
                  warehouseId: '',
                  itemId: '',
                  type: 'entrada',
                  quantity: '',
                  reference: ''
                })
              }}
            >
              Cancelar
            </button>
            <button className="primary-btn" type="button" onClick={handleSaveMovement}>
              Salvar movimentação
            </button>
          </>
        }
      >
        <label className="input-control">
          <span>Armazém</span>
          <select
            value={movementForm.warehouseId}
            onChange={(e) => {
              setMovementForm((prev) => ({
                ...prev,
                warehouseId: e.target.value,
                itemId: '' // Reset item quando mudar armazém
              }))
            }}
          >
            <option value="">Selecione um armazém</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </label>

        <label className="input-control">
          <span>Item</span>
          <select
            value={movementForm.itemId}
            onChange={(e) => setMovementForm((prev) => ({ ...prev, itemId: e.target.value }))}
            disabled={!movementForm.warehouseId}
          >
            <option value="">Selecione um item</option>
            {movementForm.warehouseId &&
              warehouses
                .find((w) => w.id === movementForm.warehouseId)
                ?.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.emoji} {item.name} (Saldo: {item.quantity} {item.unit})
              </option>
            ))}
          </select>
        </label>

        <label className="input-control">
          <span>Tipo</span>
          <select
            value={movementForm.type}
            onChange={(e) => setMovementForm((prev) => ({ ...prev, type: e.target.value }))}
          >
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
        </label>

        <label className="input-control">
          <span>Quantidade</span>
          <input
            type="number"
            value={movementForm.quantity}
            onChange={(e) => setMovementForm((prev) => ({ ...prev, quantity: e.target.value }))}
            placeholder="0"
            min="0"
          />
        </label>

        <label className="input-control">
          <span>Referência (opcional)</span>
          <input
            value={movementForm.reference}
            onChange={(e) => setMovementForm((prev) => ({ ...prev, reference: e.target.value }))}
            placeholder="Ex.: Compra, Venda, Ajuste, etc."
          />
        </label>
      </FormModal>
    </div>
  )
}
