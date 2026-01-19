import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../stores/appStore'
import { FormModal } from '../components/ui/FormModal'
import { FiEdit2, FiEye, FiFilter, FiPlus, FiXCircle } from 'react-icons/fi'
import './PageCommon.css'
import './OrdersPage.css'

const PAYMENT_METHOD_LABELS = {
  cash: 'Dinheiro',
  pix: 'PIX',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  boleto: 'Boleto',
  other: 'Outros'
}

const ORDER_STATUS_LABELS = {
  pending: 'Pendente',
  preparing: 'Em produção',
  ready: 'Pronto',
  delivered: 'Entregue',
  cancelled: 'Cancelado'
}

const ORDER_STATUS_COLORS = {
  pending: '#f59e0b',
  preparing: '#8b5cf6',
  ready: '#10b981',
  delivered: '#059669',
  cancelled: '#ef4444'
}

const ORDER_TYPE_LABELS = {
  immediate: 'Pedido',
  preorder: 'Encomenda'
}

const safeJsonParse = (value) => {
  if (!value) return null
  if (typeof value !== 'string') return null
  const raw = value.trim()
  if (!raw) return null
  if (!(raw.startsWith('{') && raw.endsWith('}'))) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const normalize = (value) => String(value ?? '').toLowerCase().trim()

export function OrdersPage() {
  const orders = useAppStore((state) => state.orders)
  const recipes = useAppStore((state) => state.recipes)
  const pricing = useAppStore((state) => state.pricing)
  const loadData = useAppStore((state) => state.loadData)
  const addOrder = useAppStore((state) => state.addOrder)
  const updateOrder = useAppStore((state) => state.updateOrder)

  const [showFilters, setShowFilters] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    startDate: '',
    endDate: ''
  })

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const [newModalOpen, setNewModalOpen] = useState(false)
  const [newOrder, setNewOrder] = useState({
    type: 'immediate',
    expectedDeliveryAt: '',
    customerName: '',
    customerPhone: '',
    customerCpf: '',
    notes: '',
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    items: [] // { recipeId, name, quantity, unitPrice, notes }
  })
  const [productSearch, setProductSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [loadData])

  const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100

  const latestPriceByRecipeId = useMemo(() => {
    const map = new Map()
    for (const p of pricing || []) {
      if (!p?.recipeId) continue
      if (!map.has(p.recipeId) && typeof p.price === 'number') {
        map.set(p.recipeId, p.price)
      }
    }
    return map
  }, [pricing])

  const getDefaultPriceForRecipe = (recipe) => {
    const priced = latestPriceByRecipeId.get(recipe.id)
    if (typeof priced === 'number') return roundMoney(priced)
    const unitCost = Number(recipe.unitCost) || 0
    if (unitCost > 0) return roundMoney(unitCost * 1.5)
    return 0
  }

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)

  const formatDateTime = (dateString) => {
    if (!dateString) return '—'
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatDateOnly = (dateString) => {
    if (!dateString) return '—'
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getOrderMeta = (order) => safeJsonParse(order?.notes) || {}

  const getOrderCustomer = (order) => {
    const meta = getOrderMeta(order)
    const name = order?.customer?.name || meta.customerName || 'Venda avulsa'
    const phone = order?.customer?.phone || meta.customerPhone || ''
    const cpf = order?.customer?.cpfCnpj || meta.customerCpf || ''
    return { name, phone, cpf }
  }

  const getOrderType = (order) => {
    const meta = getOrderMeta(order)
    const t = meta.type
    if (t === 'preorder' || t === 'immediate') return t
    if (meta.expectedDeliveryAt) return 'preorder'
    return 'immediate'
  }

  const getExpectedDeliveryAt = (order) => {
    const meta = getOrderMeta(order)
    return meta.expectedDeliveryAt || ''
  }

  const appendHistory = (order, entry) => {
    const meta = getOrderMeta(order)
    const history = Array.isArray(meta.history) ? meta.history : []
    const next = {
      ...meta,
      history: [{ at: new Date().toISOString(), ...entry }, ...history].slice(0, 50)
    }
    return JSON.stringify(next)
  }

  const filteredOrders = useMemo(() => {
    return (orders || []).filter((order) => {
      const type = getOrderType(order)
      const customer = getOrderCustomer(order)
      const expectedDeliveryAt = getExpectedDeliveryAt(order)

      if (filters.status !== 'all' && order.status !== filters.status) return false
      if (filters.type !== 'all' && type !== filters.type) return false

      // Período (usa createdAt)
      if (filters.startDate) {
        const orderDate = new Date(order.createdAt).toISOString().slice(0, 10)
        if (orderDate < filters.startDate) return false
      }
      if (filters.endDate) {
        const orderDate = new Date(order.createdAt).toISOString().slice(0, 10)
        if (orderDate > filters.endDate) return false
      }

      if (filters.search) {
        const q = normalize(filters.search)
        const orderNumber = normalize(order.orderNumber || order.id?.slice(0, 8))
        const customerName = normalize(customer.name)
        const customerPhone = normalize(customer.phone)
        const matchesItems = (order.items || []).some((i) => normalize(i?.name).includes(q))
        const matchesDelivery = normalize(expectedDeliveryAt).includes(q)
        if (!orderNumber.includes(q) && !customerName.includes(q) && !customerPhone.includes(q) && !matchesItems && !matchesDelivery) {
          return false
        }
      }
      return true
    })
  }, [orders, filters])

  const stats = useMemo(() => {
    const total = filteredOrders.length
    const pending = filteredOrders.filter((o) => o.status === 'pending').length
    const preparing = filteredOrders.filter((o) => o.status === 'preparing').length
    const ready = filteredOrders.filter((o) => o.status === 'ready').length
    return { total, pending, preparing, ready }
  }, [filteredOrders])

  const selectedOrder = useMemo(() => filteredOrders.find((o) => o.id === selectedOrderId) || null, [filteredOrders, selectedOrderId])

  const filteredRecipes = useMemo(() => {
    const q = normalize(productSearch)
    if (!q) return recipes || []
    return (recipes || []).filter((r) => normalize(r.name).includes(q))
  }, [recipes, productSearch])

  const newOrderTotals = useMemo(() => {
    const subtotal = (newOrder.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0)
    const total = subtotal
    return {
      subtotal: roundMoney(subtotal),
      total: roundMoney(total)
    }
  }, [newOrder.items])

  const openDetails = (orderId) => {
    setSelectedOrderId(orderId)
    setDetailsOpen(true)
  }

  const openCancelModal = (orderId) => {
    setSelectedOrderId(orderId)
    setCancelReason('')
    setCancelModalOpen(true)
  }

  const handleUpdateStatus = async (order, nextStatus) => {
    if (!order || !nextStatus || nextStatus === order.status) return
    try {
      const notes = appendHistory(order, { type: 'status', from: order.status, to: nextStatus })
      await updateOrder(order.id, { status: nextStatus, notes })
      await loadData()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert(`Erro ao atualizar status: ${error.message || 'Tente novamente.'}`)
    }
  }

  const handleCancelOrder = async () => {
    if (!selectedOrderId || !cancelReason.trim()) {
      alert('Informe o motivo do cancelamento.')
      return
    }
    const order = (orders || []).find((o) => o.id === selectedOrderId)
    if (!order) return
    try {
      const notes = appendHistory(order, { type: 'cancel', reason: cancelReason.trim() })
      await updateOrder(selectedOrderId, { status: 'cancelled', notes })
      await loadData()
      setCancelModalOpen(false)
      setCancelReason('')
      alert('Pedido cancelado.')
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error)
      alert(`Erro ao cancelar pedido: ${error.message || 'Tente novamente.'}`)
    }
  }

  const handleAddItem = (recipe) => {
    const existing = (newOrder.items || []).find((i) => i.recipeId === recipe.id)
    if (existing) {
      setNewOrder((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.recipeId === recipe.id ? { ...i, quantity: Number(i.quantity || 0) + 1 } : i))
      }))
      return
    }
    const price = getDefaultPriceForRecipe(recipe)
    setNewOrder((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          recipeId: recipe.id,
          name: recipe.name,
          quantity: 1,
          unitPrice: price,
          notes: ''
        }
      ]
    }))
  }

  const handleRemoveItem = (recipeId) => {
    setNewOrder((prev) => ({ ...prev, items: prev.items.filter((i) => i.recipeId !== recipeId) }))
  }

  const handleCreateOrder = async () => {
    if (!newOrder.items || newOrder.items.length === 0) {
      alert('Adicione pelo menos 1 item.')
      return
    }

    const now = new Date()
    const orderNumber = `PED-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getTime()).slice(-5)}`

    const meta = {
      type: newOrder.type,
      expectedDeliveryAt: newOrder.type === 'preorder' && newOrder.expectedDeliveryAt ? newOrder.expectedDeliveryAt : undefined,
      customerName: newOrder.customerName?.trim() || undefined,
      customerPhone: newOrder.customerPhone?.trim() || undefined,
      customerCpf: newOrder.customerCpf?.trim() || undefined,
      noteText: newOrder.notes?.trim() || undefined,
      history: [{ at: new Date().toISOString(), type: 'create' }]
    }

    const items = newOrder.items.map((i) => {
      const qty = Number(i.quantity) || 0
      const unitPrice = Number(i.unitPrice) || 0
      return {
        recipeId: i.recipeId || null,
        recipeName: i.name,
        name: i.name,
        quantity: qty,
        unitPrice: unitPrice,
        totalPrice: roundMoney(qty * unitPrice),
        notes: i.notes?.trim() || null
      }
    })

    const total = newOrderTotals.total
    if (total <= 0) {
      alert('O total do pedido deve ser maior que zero.')
      return
    }

    try {
      await addOrder({
        customerId: null,
        orderNumber,
        status: 'pending',
        total,
        subtotal: newOrderTotals.subtotal,
        discount: 0,
        tax: 0,
        deliveryFee: 0,
        notes: JSON.stringify(meta),
        items,
        payment: {
          amount: total,
          method: newOrder.paymentMethod,
          status: newOrder.paymentStatus
        }
      })

      await loadData()
      setNewModalOpen(false)
      setProductSearch('')
      setNewOrder({
        type: 'immediate',
        expectedDeliveryAt: '',
        customerName: '',
        customerPhone: '',
        customerCpf: '',
        notes: '',
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        items: []
      })
    } catch (error) {
      console.error('Erro ao criar pedido:', error)
      alert(`Erro ao criar pedido: ${error.message || 'Tente novamente.'}`)
    }
  }

  return (
    <div className="page orders-page">
      <div className="page-header orders-header">
        <div>
          <h1>Encomendas</h1>
          <div className="page-subtitle">Gerencie pedidos pendentes, em produção e finalizados</div>
        </div>
        <div className="orders-header-actions">
          <button type="button" className="page-filter-btn" onClick={() => setShowFilters((v) => !v)} title="Filtros">
            <FiFilter size={18} />
            Filtros
          </button>
          <button type="button" className="primary-btn" onClick={() => setNewModalOpen(true)}>
            <FiPlus size={18} />
            Novo Pedido
          </button>
        </div>
      </div>

      <div className="orders-kpis">
        <div className="orders-kpi">
          <span>Total</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="orders-kpi">
          <span>Pendentes</span>
          <strong>{stats.pending}</strong>
        </div>
        <div className="orders-kpi">
          <span>Em produção</span>
          <strong>{stats.preparing}</strong>
        </div>
        <div className="orders-kpi">
          <span>Prontos</span>
          <strong>{stats.ready}</strong>
        </div>
      </div>

      {showFilters && (
        <div className="page-stack orders-filters">
          <div className="orders-filters-grid">
            <div className="orders-filter-group orders-filter-group--wide">
              <label>Buscar</label>
              <input
                type="text"
                placeholder="Cliente, nº do pedido, telefone, item..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div className="orders-filter-group">
              <label>Status</label>
              <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="preparing">Em produção</option>
                <option value="ready">Pronto</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div className="orders-filter-group">
              <label>Tipo</label>
              <select value={filters.type} onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}>
                <option value="all">Todos</option>
                <option value="immediate">Pedido</option>
                <option value="preorder">Encomenda</option>
              </select>
            </div>
            <div className="orders-filter-group">
              <label>Data inicial</label>
              <input type="date" value={filters.startDate} onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))} />
            </div>
            <div className="orders-filter-group">
              <label>Data final</label>
              <input type="date" value={filters.endDate} onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))} />
            </div>
          </div>
        </div>
      )}

      <div className="orders-table-wrap">
        {filteredOrders.length === 0 ? (
          <div className="orders-empty">Nenhum pedido encontrado.</div>
        ) : (
          <>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Criado em</th>
                  <th>Entrega</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ width: '220px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const customer = getOrderCustomer(order)
                  const type = getOrderType(order)
                  const deliveryAt = getExpectedDeliveryAt(order)
                  const statusColor = ORDER_STATUS_COLORS[order.status] || '#6b7280'
                  const orderNo = order.orderNumber || order.id.slice(0, 8).toUpperCase()
                  return (
                    <tr key={order.id}>
                      <td className="orders-cell-mono">{orderNo}</td>
                      <td>
                        <div className="orders-customer">
                          <strong>{customer.name}</strong>
                          {customer.phone ? <span>{customer.phone}</span> : null}
                        </div>
                      </td>
                      <td>
                        <span className={`orders-type-badge ${type}`}>{ORDER_TYPE_LABELS[type]}</span>
                      </td>
                      <td>{formatDateTime(order.createdAt)}</td>
                      <td>{type === 'preorder' ? formatDateOnly(deliveryAt) : '—'}</td>
                      <td>
                        <span className="orders-status-badge" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}><strong>{formatCurrency(order.total)}</strong></td>
                      <td>
                        <div className="orders-actions">
                          <button type="button" className="orders-icon-btn" onClick={() => openDetails(order.id)} title="Ver detalhes">
                            <FiEye size={18} />
                          </button>
                          <button type="button" className="orders-icon-btn" onClick={() => openDetails(order.id)} title="Editar">
                            <FiEdit2 size={18} />
                          </button>
                          {order.status !== 'cancelled' && (
                            <button type="button" className="orders-icon-btn danger" onClick={() => openCancelModal(order.id)} title="Cancelar">
                              <FiXCircle size={18} />
                            </button>
                          )}
                          <select
                            className="orders-status-select"
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order, e.target.value)}
                            disabled={order.status === 'cancelled'}
                            title="Atualizar status"
                          >
                            <option value="pending">Pendente</option>
                            <option value="preparing">Em produção</option>
                            <option value="ready">Pronto</option>
                            <option value="delivered">Entregue</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Cards (mobile) */}
            <div className="orders-cards">
              {filteredOrders.map((order) => {
                const customer = getOrderCustomer(order)
                const type = getOrderType(order)
                const deliveryAt = getExpectedDeliveryAt(order)
                const statusColor = ORDER_STATUS_COLORS[order.status] || '#6b7280'
                const orderNo = order.orderNumber || order.id.slice(0, 8).toUpperCase()
                return (
                  <div key={order.id} className="orders-card">
                    <div className="orders-card-top">
                      <div>
                        <div className="orders-card-title">
                          <strong className="orders-cell-mono">{orderNo}</strong>
                          <span className={`orders-type-badge ${type}`}>{ORDER_TYPE_LABELS[type]}</span>
                        </div>
                        <div className="orders-card-sub">{customer.name}{customer.phone ? ` • ${customer.phone}` : ''}</div>
                      </div>
                      <span className="orders-status-badge" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                    <div className="orders-card-mid">
                      <span>Criado: {formatDateTime(order.createdAt)}</span>
                      {type === 'preorder' ? <span>Entrega: {formatDateOnly(deliveryAt)}</span> : null}
                    </div>
                    <div className="orders-card-bottom">
                      <strong>{formatCurrency(order.total)}</strong>
                      <div className="orders-actions">
                        <button type="button" className="orders-icon-btn" onClick={() => openDetails(order.id)} title="Ver detalhes">
                          <FiEye size={18} />
                        </button>
                        {order.status !== 'cancelled' && (
                          <button type="button" className="orders-icon-btn danger" onClick={() => openCancelModal(order.id)} title="Cancelar">
                            <FiXCircle size={18} />
                          </button>
                        )}
                        <select
                          className="orders-status-select"
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order, e.target.value)}
                          disabled={order.status === 'cancelled'}
                        >
                          <option value="pending">Pendente</option>
                          <option value="preparing">Em produção</option>
                          <option value="ready">Pronto</option>
                          <option value="delivered">Entregue</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal: Detalhes */}
      <FormModal
        isOpen={detailsOpen}
        onClose={() => {
          setDetailsOpen(false)
          setSelectedOrderId(null)
        }}
        title="Detalhes do Pedido"
        description={selectedOrder ? `Pedido ${selectedOrder.orderNumber || selectedOrder.id.slice(0, 8).toUpperCase()}` : ''}
        isExpanded
      >
        {!selectedOrder ? (
          <div className="orders-modal-empty">Selecione um pedido.</div>
        ) : (
          (() => {
            const customer = getOrderCustomer(selectedOrder)
            const type = getOrderType(selectedOrder)
            const deliveryAt = getExpectedDeliveryAt(selectedOrder)
            const meta = getOrderMeta(selectedOrder)
            const noteText = meta.noteText || (typeof selectedOrder.notes === 'string' && !safeJsonParse(selectedOrder.notes) ? selectedOrder.notes : '')
            const history = Array.isArray(meta.history) ? meta.history : []
            return (
              <div className="orders-details">
                <div className="orders-details-grid">
                  <div className="orders-details-card">
                    <h3>Cliente</h3>
                    <div className="orders-details-row"><span>Nome</span><strong>{customer.name}</strong></div>
                    <div className="orders-details-row"><span>Telefone</span><strong>{customer.phone || '—'}</strong></div>
                    <div className="orders-details-row"><span>CPF</span><strong>{customer.cpf || '—'}</strong></div>
                    <div className="orders-details-row"><span>Tipo</span><strong>{ORDER_TYPE_LABELS[type]}</strong></div>
                    <div className="orders-details-row"><span>Entrega</span><strong>{type === 'preorder' ? formatDateOnly(deliveryAt) : '—'}</strong></div>
                  </div>

                  <div className="orders-details-card">
                    <h3>Status</h3>
                    <div className="orders-details-row">
                      <span>Status atual</span>
                      <strong>{ORDER_STATUS_LABELS[selectedOrder.status] || selectedOrder.status}</strong>
                    </div>
                    <div className="orders-details-row">
                      <span>Atualizar</span>
                      <select
                        className="orders-status-select"
                        value={selectedOrder.status}
                        onChange={(e) => handleUpdateStatus(selectedOrder, e.target.value)}
                        disabled={selectedOrder.status === 'cancelled'}
                      >
                        <option value="pending">Pendente</option>
                        <option value="preparing">Em produção</option>
                        <option value="ready">Pronto</option>
                        <option value="delivered">Entregue</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>
                    <div className="orders-details-row"><span>Criado em</span><strong>{formatDateTime(selectedOrder.createdAt)}</strong></div>
                    <div className="orders-details-row"><span>Atualizado</span><strong>{formatDateTime(selectedOrder.updatedAt)}</strong></div>
                  </div>
                </div>

                <div className="orders-details-card">
                  <h3>Itens</h3>
                  <div className="orders-items-list">
                    {(selectedOrder.items || []).map((item) => (
                      <div key={item.id} className="orders-item">
                        <div className="orders-item-info">
                          <strong>{item.name}</strong>
                          <span>{item.quantity}x {formatCurrency(item.unitPrice)}</span>
                          {item.notes ? <span className="orders-item-notes">{item.notes}</span> : null}
                        </div>
                        <strong>{formatCurrency(item.totalPrice)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="orders-details-grid">
                  <div className="orders-details-card">
                    <h3>Pagamento</h3>
                    {selectedOrder.payment ? (
                      <>
                        <div className="orders-details-row"><span>Método</span><strong>{PAYMENT_METHOD_LABELS[selectedOrder.payment.method] || selectedOrder.payment.method}</strong></div>
                        <div className="orders-details-row"><span>Status</span><strong>{selectedOrder.payment.status}</strong></div>
                        <div className="orders-details-row"><span>Valor</span><strong>{formatCurrency(selectedOrder.payment.amount)}</strong></div>
                      </>
                    ) : (
                      <div className="orders-muted">Sem pagamento registrado.</div>
                    )}
                  </div>

                  <div className="orders-details-card">
                    <h3>Resumo</h3>
                    <div className="orders-details-row"><span>Subtotal</span><strong>{formatCurrency(selectedOrder.subtotal)}</strong></div>
                    <div className="orders-details-row"><span>Desconto</span><strong>{formatCurrency(selectedOrder.discount || 0)}</strong></div>
                    <div className="orders-details-row"><span>Taxas</span><strong>{formatCurrency((selectedOrder.tax || 0) + (selectedOrder.deliveryFee || 0))}</strong></div>
                    <div className="orders-details-row"><span>Total</span><strong>{formatCurrency(selectedOrder.total)}</strong></div>
                  </div>
                </div>

                <div className="orders-details-grid">
                  <div className="orders-details-card">
                    <h3>Observações</h3>
                    {noteText ? <div className="orders-notes">{noteText}</div> : <div className="orders-muted">—</div>}
                  </div>
                  <div className="orders-details-card">
                    <h3>Histórico</h3>
                    {history.length === 0 ? (
                      <div className="orders-muted">Sem histórico detalhado.</div>
                    ) : (
                      <div className="orders-history">
                        {history.map((h, idx) => (
                          <div key={idx} className="orders-history-item">
                            <span className="orders-history-date">{formatDateTime(h.at)}</span>
                            <span className="orders-history-text">
                              {h.type === 'create' && 'Pedido criado'}
                              {h.type === 'status' && `Status: ${h.from} → ${h.to}`}
                              {h.type === 'cancel' && `Cancelado: ${h.reason}`}
                              {!['create', 'status', 'cancel'].includes(h.type) ? String(h.type) : null}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })()
        )}
      </FormModal>

      {/* Modal: Novo Pedido */}
      <FormModal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title="Novo Pedido"
        description="Crie um pedido rápido e acompanhe o status até a entrega."
        isExpanded
      >
        <div className="orders-new">
          <div className="orders-new-grid">
            <div className="orders-field">
              <label>Tipo</label>
              <select value={newOrder.type} onChange={(e) => setNewOrder((p) => ({ ...p, type: e.target.value }))}>
                <option value="immediate">Pedido imediato</option>
                <option value="preorder">Encomenda</option>
              </select>
            </div>
            <div className="orders-field">
              <label>Data prevista</label>
              <input
                type="date"
                value={newOrder.expectedDeliveryAt}
                onChange={(e) => setNewOrder((p) => ({ ...p, expectedDeliveryAt: e.target.value }))}
                disabled={newOrder.type !== 'preorder'}
              />
            </div>
            <div className="orders-field">
              <label>Cliente</label>
              <input value={newOrder.customerName} onChange={(e) => setNewOrder((p) => ({ ...p, customerName: e.target.value }))} placeholder="Nome do cliente" />
            </div>
            <div className="orders-field">
              <label>Telefone</label>
              <input value={newOrder.customerPhone} onChange={(e) => setNewOrder((p) => ({ ...p, customerPhone: e.target.value }))} placeholder="(11) 99999-9999" />
            </div>
            <div className="orders-field">
              <label>CPF (opcional)</label>
              <input value={newOrder.customerCpf} onChange={(e) => setNewOrder((p) => ({ ...p, customerCpf: e.target.value }))} placeholder="000.000.000-00" />
            </div>
            <div className="orders-field orders-field--wide">
              <label>Observações</label>
              <input value={newOrder.notes} onChange={(e) => setNewOrder((p) => ({ ...p, notes: e.target.value }))} placeholder="Ex: sem açúcar, entrega às 16h..." />
            </div>
          </div>

          <div className="orders-new-items">
            <div className="orders-new-items-header">
              <h3>Itens</h3>
              <input
                className="orders-product-search"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar produto..."
              />
            </div>
            <div className="orders-new-items-layout">
              <div className="orders-panel orders-products-panel">
                <div className="orders-panel-title">Produtos</div>
                <div className="orders-products">
                  {filteredRecipes.slice(0, 18).map((r) => (
                    <button key={r.id} type="button" className="orders-product" onClick={() => handleAddItem(r)}>
                      <span title={r.name}>{r.name}</span>
                      <strong>{formatCurrency(getDefaultPriceForRecipe(r))}</strong>
                    </button>
                  ))}
                </div>
              </div>

              <div className="orders-panel orders-cart-panel">
                <div className="orders-panel-title">Carrinho</div>
                <div className="orders-cart">
                  {newOrder.items.length === 0 ? (
                    <div className="orders-muted">Nenhum item adicionado.</div>
                  ) : (
                    newOrder.items.map((item) => (
                      <div key={item.recipeId} className="orders-cart-row">
                        <div className="orders-cart-main">
                          <strong className="orders-cart-name" title={item.name}>{item.name}</strong>
                          <div className="orders-cart-controls">
                            <div className="orders-cart-field">
                              <label>Qtd</label>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={item.quantity}
                                onChange={(e) => {
                                  const q = Math.max(1, Number(e.target.value) || 1)
                                  setNewOrder((p) => ({
                                    ...p,
                                    items: p.items.map((i) => (i.recipeId === item.recipeId ? { ...i, quantity: q } : i))
                                  }))
                                }}
                              />
                            </div>
                            <div className="orders-cart-field">
                              <label>Preço</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => {
                                  const v = e.target.value === '' ? '' : Number(e.target.value)
                                  setNewOrder((p) => ({
                                    ...p,
                                    items: p.items.map((i) => (i.recipeId === item.recipeId ? { ...i, unitPrice: v } : i))
                                  }))
                                }}
                              />
                            </div>
                          </div>
                          <input
                            className="orders-cart-notes"
                            value={item.notes}
                            onChange={(e) => {
                              const v = e.target.value
                              setNewOrder((p) => ({
                                ...p,
                                items: p.items.map((i) => (i.recipeId === item.recipeId ? { ...i, notes: v } : i))
                              }))
                            }}
                            placeholder="Observações do item (opcional)"
                          />
                        </div>
                        <div className="orders-cart-right">
                          <strong>{formatCurrency((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))}</strong>
                          <button type="button" className="orders-remove" onClick={() => handleRemoveItem(item.recipeId)}>Remover</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="orders-new-footer">
            <div className="orders-new-payment">
              <div className="orders-field">
                <label>Pagamento</label>
                <select value={newOrder.paymentMethod} onChange={(e) => setNewOrder((p) => ({ ...p, paymentMethod: e.target.value }))}>
                  <option value="cash">Dinheiro</option>
                  <option value="pix">PIX</option>
                  <option value="credit_card">Cartão crédito</option>
                  <option value="debit_card">Cartão débito</option>
                  <option value="other">Outros</option>
                </select>
              </div>
              <div className="orders-field">
                <label>Status do pagamento</label>
                <select value={newOrder.paymentStatus} onChange={(e) => setNewOrder((p) => ({ ...p, paymentStatus: e.target.value }))}>
                  <option value="paid">Pago</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
            </div>

            <div className="orders-new-total">
              <span>Total</span>
              <strong>{formatCurrency(newOrderTotals.total)}</strong>
            </div>

            <div className="orders-new-actions">
              <button type="button" className="page-btn-secondary" onClick={() => setNewModalOpen(false)}>Cancelar</button>
              <button type="button" className="page-btn-primary" onClick={handleCreateOrder} disabled={newOrder.items.length === 0}>Criar Pedido</button>
            </div>
          </div>
        </div>
      </FormModal>

      {/* Modal: Cancelamento */}
      <FormModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false)
          setCancelReason('')
        }}
        title="Cancelar Pedido"
        description="Informe o motivo do cancelamento. Esta ação não pode ser desfeita."
      >
        <div className="orders-cancel-form">
          <label>
            Motivo do cancelamento *
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex: cliente desistiu, produto indisponível..."
              rows={4}
              required
            />
          </label>
          <div className="orders-cancel-actions">
            <button type="button" className="page-btn-secondary" onClick={() => setCancelModalOpen(false)}>
              Voltar
            </button>
            <button type="button" className="page-btn-primary" onClick={handleCancelOrder} disabled={!cancelReason.trim()}>
              Confirmar Cancelamento
            </button>
          </div>
        </div>
      </FormModal>
    </div>
  )
}
