import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '../stores/appStore'
import { FiX, FiFilter, FiChevronDown, FiChevronUp, FiEye } from 'react-icons/fi'
import { FormModal } from '../components/ui/FormModal'
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
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto',
  delivered: 'Entregue',
  cancelled: 'Cancelado'
}

const ORDER_STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  preparing: '#8b5cf6',
  ready: '#10b981',
  delivered: '#059669',
  cancelled: '#ef4444'
}

export function OrdersPage() {
  const orders = useAppStore((state) => state.orders)
  const loadData = useAppStore((state) => state.loadData)
  const updateOrder = useAppStore((state) => state.updateOrder)
  
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: '',
    endDate: '',
    search: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  // Carregar orders ao montar
  useEffect(() => {
    loadData()
  }, [loadData])

  // Filtrar orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Filtro por status
      if (filters.status !== 'all' && order.status !== filters.status) {
        return false
      }

      // Filtro por data
      if (filters.startDate) {
        const orderDate = new Date(order.createdAt).toISOString().slice(0, 10)
        if (orderDate < filters.startDate) return false
      }
      if (filters.endDate) {
        const orderDate = new Date(order.createdAt).toISOString().slice(0, 10)
        if (orderDate > filters.endDate) return false
      }

      // Filtro por busca (número do pedido, nome do cliente, etc)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(searchLower)
        const matchesCustomer = order.customer?.name?.toLowerCase().includes(searchLower)
        const matchesItems = order.items?.some(item => 
          item.name.toLowerCase().includes(searchLower)
        )
        if (!matchesOrderNumber && !matchesCustomer && !matchesItems) {
          return false
        }
      }

      return true
    })
  }, [orders, filters])

  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = filteredOrders.length
    const totalValue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
    const cancelled = filteredOrders.filter(o => o.status === 'cancelled').length
    const confirmed = filteredOrders.filter(o => o.status === 'confirmed').length
    
    return { total, totalValue, cancelled, confirmed }
  }, [filteredOrders])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }


  return (
    <div className="page orders-page">
      <div className="page-header">
        <h1>Histórico de Vendas</h1>
        <button
          type="button"
          className="page-filter-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter size={20} />
          Filtros
          {showFilters ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </button>
      </div>

      {/* Estatísticas */}
      <div className="orders-stats">
        <div className="orders-stat-card">
          <span className="orders-stat-label">Total de Pedidos</span>
          <strong className="orders-stat-value">{stats.total}</strong>
        </div>
        <div className="orders-stat-card">
          <span className="orders-stat-label">Valor Total</span>
          <strong className="orders-stat-value">{formatCurrency(stats.totalValue)}</strong>
        </div>
        <div className="orders-stat-card">
          <span className="orders-stat-label">Confirmados</span>
          <strong className="orders-stat-value">{stats.confirmed}</strong>
        </div>
        <div className="orders-stat-card">
          <span className="orders-stat-label">Cancelados</span>
          <strong className="orders-stat-value">{stats.cancelled}</strong>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="page-stack orders-filters">
          <div className="orders-filters-grid">
            <div className="orders-filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="preparing">Preparando</option>
                <option value="ready">Pronto</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div className="orders-filter-group">
              <label>Data Inicial</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="orders-filter-group">
              <label>Data Final</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="orders-filter-group">
              <label>Buscar</label>
              <input
                type="text"
                placeholder="Número do pedido, cliente, item..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Lista de Pedidos */}
      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <p>Nenhum pedido encontrado.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="orders-card">
              <div className="orders-card-header">
                <div className="orders-card-info">
                  <div className="orders-card-title">
                    <strong>
                      Pedido #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                    </strong>
                    <span
                      className="orders-status-badge"
                      style={{ backgroundColor: `${ORDER_STATUS_COLORS[order.status] || '#6b7280'}20`, color: ORDER_STATUS_COLORS[order.status] || '#6b7280' }}
                    >
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <div className="orders-card-meta">
                    <span>{formatDate(order.createdAt)}</span>
                    {order.customer && (
                      <span>Cliente: {order.customer.name}</span>
                    )}
                  </div>
                </div>
                <div className="orders-card-actions">
                  <strong className="orders-card-total">
                    {formatCurrency(order.total)}
                  </strong>
                  <button
                    type="button"
                    className="orders-expand-btn"
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  >
                    {expandedOrderId === order.id ? (
                      <FiChevronUp size={20} />
                    ) : (
                      <FiChevronDown size={20} />
                    )}
                  </button>
                </div>
              </div>

              {expandedOrderId === order.id && (
                <div className="orders-card-details">
                  <div className="orders-details-section">
                    <h3>Itens do Pedido</h3>
                    <div className="orders-items-list">
                      {order.items?.map((item) => (
                        <div key={item.id} className="orders-item">
                          <div className="orders-item-info">
                            <strong>{item.name}</strong>
                            <span>{item.quantity}x {formatCurrency(item.unitPrice)}</span>
                          </div>
                          <strong>{formatCurrency(item.totalPrice)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="orders-details-section">
                    <h3>Resumo</h3>
                    <div className="orders-summary">
                      <div className="orders-summary-row">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="orders-summary-row">
                          <span>Desconto:</span>
                          <span>-{formatCurrency(order.discount)}</span>
                        </div>
                      )}
                      {order.tax > 0 && (
                        <div className="orders-summary-row">
                          <span>Taxa:</span>
                          <span>{formatCurrency(order.tax)}</span>
                        </div>
                      )}
                      {order.deliveryFee > 0 && (
                        <div className="orders-summary-row">
                          <span>Taxa de Entrega:</span>
                          <span>{formatCurrency(order.deliveryFee)}</span>
                        </div>
                      )}
                      <div className="orders-summary-row orders-summary-total">
                        <span>Total:</span>
                        <strong>{formatCurrency(order.total)}</strong>
                      </div>
                    </div>
                  </div>

                  {order.payment && (
                    <div className="orders-details-section">
                      <h3>Pagamento</h3>
                      <div className="orders-payment-info">
                        <div className="orders-payment-row">
                          <span>Método:</span>
                          <span>{PAYMENT_METHOD_LABELS[order.payment.method] || order.payment.method}</span>
                        </div>
                        <div className="orders-payment-row">
                          <span>Status:</span>
                          <span>{order.payment.status}</span>
                        </div>
                        <div className="orders-payment-row">
                          <span>Valor:</span>
                          <strong>{formatCurrency(order.payment.amount)}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.notes && (
                    <div className="orders-details-section">
                      <h3>Observações</h3>
                      <p className="orders-notes">{order.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  )
}
