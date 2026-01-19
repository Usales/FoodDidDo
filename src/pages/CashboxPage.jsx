import { useMemo, useState } from 'react'
import { useAppStore } from '../stores/appStore'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { FormModal } from '../components/ui/FormModal'
import { FiCheck, FiFileText, FiMinus, FiPlus, FiSearch, FiShoppingCart, FiTrash2 } from 'react-icons/fi'
import { findUserById, formatUserDisplay, getUsersDirectory, groupUsersByType } from '../utils/usersDirectory'
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
  const [linkedUserId, setLinkedUserId] = useState('')
  const [couponModalOpen, setCouponModalOpen] = useState(false)
  const [couponSnapshot, setCouponSnapshot] = useState(null)

  const usersDirectory = useMemo(() => getUsersDirectory(), [])
  const usersByType = useMemo(() => groupUsersByType(usersDirectory), [usersDirectory])

  const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)
  }

  const paymentMethodToLabel = (method) => {
    const map = {
      dinheiro: 'Dinheiro',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      pix: 'PIX'
    }
    return map[method] || 'Outros'
  }

  const generateAccessKey = () => {
    // Chave fictícia de 44 dígitos (NFC-e)
    const bytes = new Uint8Array(44)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => String(b % 10)).join('')
  }

  const buildCouponSnapshot = () => {
    const issuedAt = new Date()
    const cupomNumber = String(issuedAt.getTime()).slice(-9)
    const serie = '001'
    const accessKey = generateAccessKey()
    const linkedUser = linkedUserId ? findUserById(usersDirectory, linkedUserId) : null

    const subtotal = roundMoney(totals.subtotal)
    const discountValue = roundMoney(totals.discount || 0)
    const base = Math.max(0, subtotal - discountValue)
    const icmsPercent = 18
    const icmsValue = roundMoney((base * icmsPercent) / 100)
    const total = roundMoney(totals.total)

    const paymentValue =
      selectedPaymentMethod === 'dinheiro'
        ? roundMoney(totals.received || 0) || total
        : total

    return {
      establishment: {
        // Mock realista (teste)
        tradeName: 'FoodDidDo Restaurante',
        legalName: 'FoodDidDo Comércio de Alimentos LTDA',
        cnpj: '04.252.011/0001-10',
        address: 'Av. Paulista, 1000 - Bela Vista, São Paulo/SP - CEP 01310-100'
      },
      document: {
        number: cupomNumber,
        serie,
        issuedAtISO: issuedAt.toISOString(),
        issuedAtLabel: issuedAt.toLocaleString('pt-BR'),
        type: 'NFC-e – modo teste (homologação)',
        accessKey
      },
      customer: linkedUser
        ? {
            name: linkedUser.name,
            document: linkedUser.document || '',
            phone: linkedUser.phone || '',
            type: linkedUser.type
          }
        : null,
      items: cart.map((item, idx) => {
        const quantity = Number(item.quantity) || 0
        const unit = roundMoney(item.price)
        const totalItem = roundMoney(unit * quantity)
        return {
          line: idx + 1,
          description: item.name,
          quantity,
          unitPrice: unit,
          total: totalItem
        }
      }),
      totals: {
        subtotal,
        discount: discountValue,
        icms: { percent: icmsPercent, value: icmsValue },
        total
      },
      payment: {
        method: paymentMethodToLabel(selectedPaymentMethod),
        value: paymentValue
      },
      additional: {
        homologationMessage: 'Documento emitido em ambiente de teste, sem validade fiscal.',
        qrPlaceholderText: 'QR CODE (TESTE)'
      }
    }
  }

  const openCouponModal = () => {
    if (cart.length === 0) {
      alert('Adicione pelo menos um produto ao carrinho para emitir o cupom (teste).')
      return
    }
    setCouponSnapshot(buildCouponSnapshot())
    setCouponModalOpen(true)
  }

  const printCoupon = () => {
    if (!couponSnapshot) return

    const s = couponSnapshot
    const itemsHtml = s.items
      .map(
        (i) => `
          <tr>
            <td class="mono">${String(i.line).padStart(3, '0')}</td>
            <td>${i.description}</td>
            <td class="right mono">${i.quantity}</td>
            <td class="right mono">${formatCurrency(i.unitPrice)}</td>
            <td class="right mono">${formatCurrency(i.total)}</td>
          </tr>`
      )
      .join('')

    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Cupom Fiscal (Teste)</title>
          <style>
            body { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; margin: 0; padding: 16px; color: #111; }
            .paper { width: 76mm; max-width: 100%; margin: 0 auto; }
            h1,h2,h3,p { margin: 0; }
            .center { text-align: center; }
            .muted { color: #444; }
            .sep { border-top: 1px dashed #333; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            td { padding: 4px 0; vertical-align: top; }
            .right { text-align: right; }
            .mono { font-variant-numeric: tabular-nums; }
            .qr { margin: 10px auto 0; width: 140px; height: 140px; border: 2px solid #111; display: grid; place-items: center; font-size: 10px; text-align: center; }
            .badge { display:inline-block; padding: 3px 6px; border: 1px solid #111; border-radius: 8px; font-size: 10px; margin-top: 6px; }
            @media print { body { padding: 0; } .paper { width: 76mm; } }
          </style>
        </head>
        <body>
          <div class="paper">
            <div class="center">
              <h2>${s.establishment.tradeName}</h2>
              <p class="muted">${s.establishment.legalName}</p>
              <p class="muted">CNPJ: ${s.establishment.cnpj}</p>
              <p class="muted">${s.establishment.address}</p>
              <div class="badge">AMBIENTE DE TESTE (HOMOLOGAÇÃO)</div>
            </div>

            <div class="sep"></div>

            <p><strong>${s.document.type}</strong></p>
            <p class="muted mono">Nº ${s.document.number}  Série ${s.document.serie}</p>
            <p class="muted mono">Emissão: ${s.document.issuedAtLabel}</p>

            <div class="sep"></div>

            ${s.customer ? `<p><strong>Consumidor:</strong> ${s.customer.name}</p>
              ${s.customer.document ? `<p class="muted mono">Doc: ${s.customer.document}</p>` : ''}
              ${s.customer.phone ? `<p class="muted mono">Fone: ${s.customer.phone}</p>` : ''}
              <div class="sep"></div>` : ''}

            <table>
              <thead>
                <tr class="muted">
                  <td class="mono">Item</td>
                  <td>Descrição</td>
                  <td class="right mono">Qtd</td>
                  <td class="right mono">Vlr Un</td>
                  <td class="right mono">Total</td>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <div class="sep"></div>

            <table>
              <tbody>
                <tr><td>Subtotal</td><td class="right mono">${formatCurrency(s.totals.subtotal)}</td></tr>
                <tr><td>Descontos</td><td class="right mono">${formatCurrency(s.totals.discount)}</td></tr>
                <tr><td>ICMS (${s.totals.icms.percent}%)</td><td class="right mono">${formatCurrency(s.totals.icms.value)}</td></tr>
                <tr><td><strong>Total</strong></td><td class="right mono"><strong>${formatCurrency(s.totals.total)}</strong></td></tr>
              </tbody>
            </table>

            <div class="sep"></div>

            <p><strong>Pagamento</strong></p>
            <p class="muted mono">${s.payment.method} — ${formatCurrency(s.payment.value)}</p>

            <div class="sep"></div>

            <p class="muted"><strong>Chave de acesso (fictícia)</strong></p>
            <p class="mono muted" style="word-break: break-all;">${s.document.accessKey}</p>
            <div class="qr">${s.additional.qrPlaceholderText}</div>
            <p class="center muted" style="margin-top:10px;">${s.additional.homologationMessage}</p>
          </div>
        </body>
      </html>`

    // PDF “simulável” sem pop-up: renderiza em iframe oculto e chama print()
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    iframe.style.opacity = '0'
    iframe.setAttribute('aria-hidden', 'true')

    document.body.appendChild(iframe)

    const cleanup = () => {
      try {
        document.body.removeChild(iframe)
      } catch {
        // ignore
      }
    }

    const printFromIframe = () => {
      try {
        const win = iframe.contentWindow
        if (!win) return cleanup()
        win.focus()
        win.print()
        // Alguns navegadores não disparam onafterprint no iframe; remover com timeout também.
        win.onafterprint = cleanup
        setTimeout(cleanup, 2500)
      } catch {
        cleanup()
      }
    }

    // Preferir srcdoc (mais simples); fallback para document.write
    try {
      iframe.onload = () => printFromIframe()
      iframe.srcdoc = html
    } catch {
      const doc = iframe.contentDocument
      if (!doc) return cleanup()
      doc.open()
      doc.write(html)
      doc.close()
      setTimeout(printFromIframe, 50)
    }
  }

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
      const linkedUser = linkedUserId ? findUserById(usersDirectory, linkedUserId) : null

      // Criar descrição da venda
      const itemsDescription = cart.map(item => 
        `${item.quantity}x ${item.name}`
      ).join(', ')

      // 1. Criar Order com OrderItems e Payment
      const orderData = {
        customerId: null,
        status: 'confirmed',
        total: totals.total,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: 0,
        deliveryFee: 0,
        notes: linkedUser
          ? JSON.stringify({
              source: 'cashbox',
              linkedUser: {
                id: linkedUser.id,
                type: linkedUser.type,
                name: linkedUser.name,
                phone: linkedUser.phone,
                document: linkedUser.document
              }
            })
          : null,
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

      // 2. Calcular ingredientes necessários para baixa de estoque
      // Para cada item vendido, buscar a receita e seus ingredientes
      const stockMovementsToCreate = []
      for (const cartItem of cart) {
        const recipe = recipes.find(r => r.id === cartItem.id)
        if (recipe && recipe.ingredients && Array.isArray(recipe.ingredients)) {
          // Calcular quantidade por unidade vendida
          const quantityPerUnit = recipe.yield || 1
          
          for (const ingredient of recipe.ingredients) {
            // Calcular quantidade total do ingrediente necessário
            // (quantidade do ingrediente na receita / rendimento da receita) * quantidade vendida
            const ingredientQuantityPerUnit = (ingredient.quantity || 0) / quantityPerUnit
            const totalIngredientQuantity = ingredientQuantityPerUnit * cartItem.quantity
            
            if (totalIngredientQuantity > 0 && ingredient.id) {
              stockMovementsToCreate.push({
                ingredientId: ingredient.id,
                ingredientName: ingredient.name,
                quantity: totalIngredientQuantity,
                reference: `Venda #${order.orderNumber || order.id.slice(0, 8)} - ${cartItem.name}`
              })
            }
          }
        }
      }

      // 3. Criar movimentações de estoque (baixa automática)
      for (const movement of stockMovementsToCreate) {
        try {
          await addStockMovement({
            id: crypto.randomUUID(),
            ingredientId: movement.ingredientId,
            type: 'saída',
            quantity: movement.quantity,
            reference: movement.reference
          })
        } catch (error) {
          console.error(`Erro ao baixar estoque do ingrediente ${movement.ingredientName}:`, error)
          // Continuar com outros ingredientes mesmo se um falhar
        }
      }

      // 4. Registrar entrada no fluxo de caixa (vinculado ao pedido)
      const linkedLabel = linkedUser ? ` (${formatUserDisplay(linkedUser)})` : ''
      await addCashflowEntry({
        id: crypto.randomUUID(),
        type: 'entrada',
        description: `Venda #${order.orderNumber || order.id.slice(0, 8)}: ${itemsDescription}${linkedLabel}`,
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
      setLinkedUserId('')

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
              <div className="cashbox-payment-methods">
                <label className="cashbox-payment-label">Vincular venda a</label>
                <select
                  className="cashbox-search-input"
                  value={linkedUserId}
                  onChange={(e) => setLinkedUserId(e.target.value)}
                >
                  <option value="">Venda avulsa (sem vínculo)</option>
                  {usersByType.customer.length > 0 && (
                    <optgroup label="Clientes">
                      {usersByType.customer.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {usersByType.supplier.length > 0 && (
                    <optgroup label="Fornecedores">
                      {usersByType.supplier.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {usersByType.employee.length > 0 && (
                    <optgroup label="Funcionários">
                      {usersByType.employee.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {usersByType.other.length > 0 && (
                    <optgroup label="Outros">
                      {usersByType.other.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

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

              <button
                type="button"
                className="cashbox-coupon-btn"
                onClick={openCouponModal}
                disabled={cart.length === 0}
                title="Emissão fiscal simulada (sem validade)"
              >
                <FiFileText size={18} />
                Emitir Cupom Fiscal (Teste)
              </button>
            </div>
          )}
        </section>
      </div>

      <FormModal
        isOpen={couponModalOpen}
        onClose={() => {
          setCouponModalOpen(false)
        }}
        title="Cupom Fiscal (Teste)"
        description="Emissão simulada em ambiente de homologação (sem validade fiscal)."
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
            <button type="button" className="page-btn-secondary" onClick={() => setCouponModalOpen(false)}>
              Fechar
            </button>
            <button type="button" className="page-btn-primary" onClick={printCoupon} disabled={!couponSnapshot}>
              Imprimir / Salvar PDF
            </button>
          </div>
        }
      >
        {!couponSnapshot ? (
          <div className="cashbox-coupon-empty">Gere um carrinho para simular a emissão.</div>
        ) : (
          <div className="cashbox-coupon-preview">
            <div className="coupon-paper" aria-label="Prévia do cupom fiscal (teste)">
              <div className="coupon-center">
                <div className="coupon-title">{couponSnapshot.establishment.tradeName}</div>
                <div className="coupon-muted">{couponSnapshot.establishment.legalName}</div>
                <div className="coupon-muted">CNPJ: {couponSnapshot.establishment.cnpj}</div>
                <div className="coupon-muted">{couponSnapshot.establishment.address}</div>
                <div className="coupon-badge">AMBIENTE DE TESTE (HOMOLOGAÇÃO)</div>
              </div>

              <div className="coupon-sep" />

              <div className="coupon-block">
                <div className="coupon-strong">{couponSnapshot.document.type}</div>
                <div className="coupon-muted coupon-mono">
                  Nº {couponSnapshot.document.number} • Série {couponSnapshot.document.serie}
                </div>
                <div className="coupon-muted coupon-mono">Emissão: {couponSnapshot.document.issuedAtLabel}</div>
              </div>

              {couponSnapshot.customer ? (
                <>
                  <div className="coupon-sep" />
                  <div className="coupon-block">
                    <div className="coupon-strong">Consumidor</div>
                    <div className="coupon-mono">{couponSnapshot.customer.name}</div>
                    {couponSnapshot.customer.document ? <div className="coupon-muted coupon-mono">Doc: {couponSnapshot.customer.document}</div> : null}
                    {couponSnapshot.customer.phone ? <div className="coupon-muted coupon-mono">Fone: {couponSnapshot.customer.phone}</div> : null}
                  </div>
                </>
              ) : null}

              <div className="coupon-sep" />

              <table className="coupon-table">
                <thead>
                  <tr>
                    <th className="coupon-mono">Item</th>
                    <th>Descrição</th>
                    <th className="coupon-right coupon-mono">Qtd</th>
                    <th className="coupon-right coupon-mono">Vlr Un</th>
                    <th className="coupon-right coupon-mono">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {couponSnapshot.items.map((i) => (
                    <tr key={i.line}>
                      <td className="coupon-mono">{String(i.line).padStart(3, '0')}</td>
                      <td>{i.description}</td>
                      <td className="coupon-right coupon-mono">{i.quantity}</td>
                      <td className="coupon-right coupon-mono">{formatCurrency(i.unitPrice)}</td>
                      <td className="coupon-right coupon-mono">{formatCurrency(i.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="coupon-sep" />

              <table className="coupon-totals">
                <tbody>
                  <tr>
                    <td>Subtotal</td>
                    <td className="coupon-right coupon-mono">{formatCurrency(couponSnapshot.totals.subtotal)}</td>
                  </tr>
                  <tr>
                    <td>Descontos</td>
                    <td className="coupon-right coupon-mono">{formatCurrency(couponSnapshot.totals.discount)}</td>
                  </tr>
                  <tr>
                    <td>ICMS ({couponSnapshot.totals.icms.percent}%)</td>
                    <td className="coupon-right coupon-mono">{formatCurrency(couponSnapshot.totals.icms.value)}</td>
                  </tr>
                  <tr>
                    <td className="coupon-strong">Total</td>
                    <td className="coupon-right coupon-mono coupon-strong">{formatCurrency(couponSnapshot.totals.total)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="coupon-sep" />

              <div className="coupon-block">
                <div className="coupon-strong">Pagamento</div>
                <div className="coupon-muted coupon-mono">
                  {couponSnapshot.payment.method} — {formatCurrency(couponSnapshot.payment.value)}
                </div>
              </div>

              <div className="coupon-sep" />

              <div className="coupon-block">
                <div className="coupon-muted coupon-strong">Chave de acesso (fictícia)</div>
                <div className="coupon-muted coupon-mono coupon-break">{couponSnapshot.document.accessKey}</div>
                <div className="coupon-qr">{couponSnapshot.additional.qrPlaceholderText}</div>
                <div className="coupon-center coupon-muted coupon-footer-msg">{couponSnapshot.additional.homologationMessage}</div>
              </div>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  )
}
