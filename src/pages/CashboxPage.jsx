import { useState, useMemo } from 'react'
import { useAppStore } from '../stores/appStore'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiCheck, FiSearch } from 'react-icons/fi'
import './PageCommon.css'
import './CashboxPage.css'

const PAYMENT_METHODS = [
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'cartao_credito', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'cartao_debito', label: 'Cartão de Débito', icon: '💳' },
  { value: 'pix', label: 'PIX', icon: '📱' }
]

export function CashboxPage() {
  const recipes = useAppStore((state) => state.recipes)
  const pricing = useAppStore((state) => state.pricing)
  const addCashflowEntry = useAppStore((state) => state.addCashflowEntry)
  const addOrder = useAppStore((state) => state.addOrder)
  const addStockMovement = useAppStore((state) => state.addStockMovement)
  const loadData = useAppStore((state) => state.loadData)

  const [cart, setCart] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('dinheiro')
  const [receivedAmount, setReceivedAmount] = useState('')
  const [discount, setDiscount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100

  // Filtrar produtos por busca
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return recipes
    const query = searchQuery.toLowerCase()
    return recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(query)
    )
  }, [recipes, searchQuery])

  // Calcular totais
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const discountValue = Number(discount) || 0
    const total = Math.max(0, subtotal - discountValue)
    const received = Number(receivedAmount) || 0
    const change = received - total
    const cost = cart.reduce((sum, item) => sum + ((item.unitCost || 0) * item.quantity), 0)
    const profit = total - cost

    return {
      subtotal,
      discount: discountValue,
      total,
      received,
      change: change > 0 ? change : 0,
      cost,
      profit
    }
  }, [cart, discount, receivedAmount])

  const getDefaultPriceForRecipe = (recipe) => {
    const priced = pricing?.find((p) => p.recipeId === recipe.id)
    if (priced && typeof priced.price === 'number') return roundMoney(priced.price)
    if (recipe.unitCost) return roundMoney(recipe.unitCost * 1.5)
    return 0
  }

  // Adicionar produto ao carrinho
  const handleAddProduct = (recipe) => {
    const existingItem = cart.find(item => item.id === recipe.id)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === recipe.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      // Usar preço do Pricing se disponível, senão usar unitCost * 1.5 como padrão
      const price = roundMoney(getDefaultPriceForRecipe(recipe))
      setCart([...cart, {
        id: recipe.id,
        name: recipe.name,
        price: price,
        unitCost: recipe.unitCost || 0,
        quantity: 1
      }])
    }
    setSearchQuery('') // Limpar busca após adicionar
  }

  // Atualizar quantidade
  const handleUpdateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQuantity }
      }
      return item
    }))
  }

  // Remover item do carrinho
  const handleRemoveItem = (id) => {
    setCart(cart.filter(item => item.id !== id))
  }

  // Atualizar preço manualmente
  const handleUpdatePrice = (id, newPrice) => {
    setCart(cart.map(item =>
      item.id === id
        ? { ...item, price: roundMoney(newPrice) }
        : item
    ))
  }

  // Atualizar quantidade manualmente
  const handleUpdateQuantityManual = (id, newQuantity) => {
    const qty = Math.max(1, Number(newQuantity) || 1)
    setCart(cart.map(item =>
      item.id === id
        ? { ...item, quantity: qty }
        : item
    ))
  }

  // Finalizar venda
  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      alert('Adicione pelo menos um produto ao carrinho.')
      return
    }

    if (totals.total <= 0) {
      alert('O valor total deve ser maior que zero.')
      return
    }

    if (selectedPaymentMethod === 'dinheiro' && totals.received < totals.total) {
      alert('O valor recebido deve ser maior ou igual ao total.')
      return
    }

    setIsProcessing(true)

    try {
      // Criar descrição da venda
      const itemsDescription = cart.map(item => 
        `${item.quantity}x ${item.name}`
      ).join(', ')

      // 1. Criar Order com OrderItems e Payment
      const orderData = {
        status: 'confirmed',
        total: totals.total,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: 0,
        deliveryFee: 0,
        notes: null,
        items: cart.map(item => ({
          recipeId: item.id,
          recipeName: item.name,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        payment: {
          amount: totals.total,
          method: selectedPaymentMethod === 'dinheiro' ? 'cash' : 
                  selectedPaymentMethod === 'pix' ? 'pix' :
                  selectedPaymentMethod === 'cartao_credito' ? 'credit_card' :
                  selectedPaymentMethod === 'cartao_debito' ? 'debit_card' : 'other',
          status: 'paid',
          paidAt: new Date().toISOString()
        }
      }

      const order = await addOrder(orderData)

      // 2. Registrar entrada no fluxo de caixa (vinculado ao pedido)
      await addCashflowEntry({
        id: crypto.randomUUID(),
        type: 'entrada',
        description: `Venda #${order.orderNumber || order.id.slice(0, 8)}: ${itemsDescription}`,
        amount: totals.total,
        cost: totals.cost,
        profit: totals.profit,
        date: new Date().toISOString(),
        category: `Venda - ${PAYMENT_METHODS.find(m => m.value === selectedPaymentMethod)?.label || 'Outros'}`
      })

      // Recarregar dados
      await loadData()

      // Limpar carrinho e campos
      setCart([])
      setReceivedAmount('')
      setDiscount('')
      setSelectedPaymentMethod('dinheiro')
      setSearchQuery('')

      alert(
        `✅ Venda finalizada com sucesso!\n\n` +
        `Pedido: #${order.orderNumber || order.id.slice(0, 8)}\n` +
        `Total: R$ ${totals.total.toFixed(2)}\n` +
        `Forma de pagamento: ${PAYMENT_METHODS.find(m => m.value === selectedPaymentMethod)?.label || 'Outros'}`
      )
    } catch (error) {
      console.error('Erro ao finalizar venda:', error)
      alert(`❌ Erro ao finalizar venda: ${error.message || 'Tente novamente.'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Limpar venda
  const handleClearSale = () => {
    if (cart.length === 0) return
    
    if (window.confirm('Tem certeza que deseja limpar o carrinho?')) {
      setCart([])
      setReceivedAmount('')
      setDiscount('')
      setSelectedPaymentMethod('dinheiro')
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="page cashbox-page">
      <div className="cashbox-container">
        {/* Painel de Produtos */}
        <section className="cashbox-products-section">
          <div className="cashbox-section-header">
            <h2>Caixa</h2>
          </div>

          {/* Busca de Produtos */}
          <div className="cashbox-search">
            <FiSearch size={20} className="cashbox-search-icon" />
            <input
              type="text"
              className="cashbox-search-input"
              placeholder="Buscar produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Lista de Produtos */}
          <div className="cashbox-products-list">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((recipe) => (
                <button
                  key={recipe.id}
                  type="button"
                  className="cashbox-product-item"
                  onClick={() => handleAddProduct(recipe)}
                >
                  <div className="cashbox-product-content">
                    <strong>{recipe.name}</strong>
                    <span className="cashbox-product-price">
                      {formatCurrency(getDefaultPriceForRecipe(recipe))}
                    </span>
                  </div>
                  <FiPlus size={20} className="cashbox-product-add" />
                </button>
              ))
            ) : (
              <div className="cashbox-empty-state">
                {searchQuery ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}
              </div>
            )}
          </div>
        </section>

        {/* Painel do Carrinho e Pagamento */}
        <section className="cashbox-cart-section">
          <div className="cashbox-section-header">
            <h2>Carrinho</h2>
            {cart.length > 0 && (
              <button
                type="button"
                className="cashbox-clear-btn"
                onClick={handleClearSale}
              >
                Limpar
              </button>
            )}
          </div>

          {/* Resumo rápido: Produto e Qtd (mesma cor do "Subtotal:") */}
          {cart.length > 0 && (
            <div className="cashbox-cart-brief-list">
              {cart.map((item) => (
                <div key={item.id} className="cashbox-cart-brief-item">
                  <div className="cashbox-cart-brief-row">
                    <span className="cashbox-cart-brief-name">{item.name}</span>
                    <div className="cashbox-cart-brief-right">
                      <div className="cashbox-cart-brief-qty">
                        <button
                          type="button"
                          className="cashbox-cart-brief-qty-btn"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          aria-label="Diminuir quantidade"
                        >
                          <FiMinus size={12} />
                        </button>
                        <input
                          type="number"
                          className="cashbox-cart-brief-qty-input"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantityManual(item.id, e.target.value)}
                          min="1"
                          aria-label="Quantidade"
                        />
                        <button
                          type="button"
                          className="cashbox-cart-brief-qty-btn"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          aria-label="Aumentar quantidade"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>

                      <div className="cashbox-cart-brief-price">
                        <CurrencyInput
                          label=""
                          value={roundMoney(item.price).toFixed(2)}
                          onChange={(value) => handleUpdatePrice(item.id, value)}
                          placeholder="0,00"
                        />
                      </div>

                      <button
                        type="button"
                        className="cashbox-cart-brief-remove-btn"
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label="Remover item"
                        title="Remover"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length === 0 && (
            <div className="cashbox-empty-cart">
              <FiShoppingCart size={48} />
              <p>Carrinho vazio</p>
              <span>Adicione produtos para iniciar uma venda</span>
            </div>
          )}

          {/* Resumo e Pagamento */}
          {cart.length > 0 && (
            <div className="cashbox-payment-section">
              <div className="cashbox-totals">
                <div className="cashbox-total-row">
                  <span>Subtotal:</span>
                  <strong>{formatCurrency(totals.subtotal)}</strong>
                </div>
                <div className="cashbox-total-row">
                  <span>Desconto:</span>
                  <CurrencyInput
                    value={discount}
                    onChange={setDiscount}
                    placeholder="0,00"
                    style={{ width: '120px', textAlign: 'right' }}
                  />
                </div>
                <div className="cashbox-total-row total">
                  <span>Total:</span>
                  <strong>{formatCurrency(totals.total)}</strong>
                </div>
              </div>

              <div className="cashbox-payment-methods">
                <label className="cashbox-payment-label">Forma de Pagamento</label>
                <div className="cashbox-payment-options">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      className={`cashbox-payment-option ${selectedPaymentMethod === method.value ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedPaymentMethod(method.value)
                        if (method.value !== 'dinheiro') {
                          setReceivedAmount(totals.total.toFixed(2))
                        } else {
                          setReceivedAmount('')
                        }
                      }}
                    >
                      <span className="cashbox-payment-icon">{method.icon}</span>
                      <span>{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedPaymentMethod === 'dinheiro' && (
                <div className="cashbox-received-section">
                  <label className="cashbox-received-label">Valor Recebido</label>
                  <div className="cashbox-received-input">
                    <CurrencyInput
                      value={receivedAmount}
                      onChange={setReceivedAmount}
                      placeholder="0,00"
                    />
                  </div>

                  {String(receivedAmount).trim() !== '' && (
                    <div className={`cashbox-change ${(totals.received - totals.total) >= 0 ? 'ok' : 'warn'}`}>
                      <span>{(totals.received - totals.total) >= 0 ? 'Troco:' : 'Faltam:'}</span>
                      <strong>{formatCurrency(Math.abs(totals.received - totals.total))}</strong>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                className="cashbox-complete-btn"
                onClick={handleCompleteSale}
                disabled={isProcessing || totals.total <= 0 || (selectedPaymentMethod === 'dinheiro' && totals.received < totals.total)}
              >
                <FiCheck size={20} />
                {isProcessing ? 'Processando...' : 'Finalizar Venda'}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
