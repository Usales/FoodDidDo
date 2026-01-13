# Sistema de Pagamentos e Notas Fiscais

## 📋 Visão Geral

Este documento descreve a estrutura de dados e o plano de implementação para o sistema de pagamentos e emissão de notas fiscais no FoodDidDo.

## 🗄️ Modelos de Dados

### Customer (Cliente)
Armazena informações dos clientes para vendas e emissão de notas fiscais.

**Campos principais:**
- `name`: Nome do cliente
- `email`: E-mail para contato
- `cpfCnpj`: CPF ou CNPJ (obrigatório para nota fiscal)
- `address`, `city`, `state`, `zipCode`: Endereço completo
- `phone`: Telefone de contato

### Order (Pedido)
Representa um pedido de venda com seus itens.

**Campos principais:**
- `orderNumber`: Número do pedido (ex: PED-001)
- `status`: Status do pedido (pending, confirmed, preparing, ready, delivered, cancelled)
- `total`: Valor total do pedido
- `subtotal`: Valor antes de descontos/taxas
- `discount`: Valor de desconto aplicado
- `tax`: Impostos
- `deliveryFee`: Taxa de entrega

**Relacionamentos:**
- `customer`: Cliente que fez o pedido (opcional)
- `items`: Itens do pedido (OrderItem[])
- `payment`: Pagamento do pedido (1:1)
- `invoice`: Nota fiscal do pedido (1:1)

### OrderItem (Item do Pedido)
Representa um item individual dentro de um pedido.

**Campos principais:**
- `recipeId`: ID da receita (opcional, para histórico)
- `recipeName`: Nome do produto/receita
- `name`: Nome do item
- `quantity`: Quantidade
- `unitPrice`: Preço unitário
- `totalPrice`: Preço total (quantity × unitPrice)

### Payment (Pagamento)
Armazena informações sobre o pagamento de um pedido.

**Campos principais:**
- `method`: Método de pagamento (pix, credit_card, debit_card, boleto, cash, other)
- `status`: Status do pagamento (pending, processing, paid, failed, refunded, cancelled)
- `provider`: Provedor de pagamento (mercadopago, pagseguro, asaas, manual)
- `providerId`: ID da transação no gateway
- `qrCode`: QR Code para PIX (base64 ou URL)
- `qrCodeText`: Texto do QR Code PIX
- `pixCopyPaste`: Código PIX para copiar e colar
- `barcode`: Código de barras para boleto
- `expirationDate`: Data de expiração (PIX/boleto)
- `paidAt`: Data/hora do pagamento confirmado

### Invoice (Nota Fiscal)
Armazena informações sobre a nota fiscal emitida para um pedido.

**Campos principais:**
- `type`: Tipo de nota (NFe ou NFCe)
- `number`: Número da nota fiscal
- `series`: Série da nota fiscal
- `accessKey`: Chave de acesso (44 dígitos)
- `status`: Status (pending, issued, cancelled, error)
- `provider`: Provedor (focus, bling, tecnospeed, direct)
- `xml`: XML da nota fiscal (armazenado como texto)
- `xmlUrl`: URL do XML (se armazenado externamente)
- `pdfUrl`: URL do PDF da nota fiscal
- `pdfBase64`: PDF em base64 (alternativa)
- `issuedAt`: Data de emissão

## 🚀 Implementações Futuras

### 1. Integração com Gateways de Pagamento

#### Mercado Pago
- **SDK**: `mercadopago` (npm)
- **Documentação**: https://www.mercadopago.com.br/developers/pt/docs
- **Métodos suportados**: PIX, Cartão de Crédito, Cartão de Débito, Boleto
- **Webhook**: Implementar endpoint `/api/payments/webhook/mercadopago`
- **Taxas**: ~2,99% a 4,99% + taxa fixa por transação

**Endpoints a implementar:**
```
POST /api/payments/create
  - Criar pagamento via Mercado Pago
  - Retornar QR Code PIX ou link de pagamento

POST /api/payments/webhook/mercadopago
  - Receber notificações de status de pagamento
  - Atualizar status automaticamente

GET /api/payments/:id/status
  - Consultar status atual do pagamento
```

#### PagSeguro
- **SDK**: `pagseguro-nodejs` (npm)
- **Documentação**: https://dev.pagseguro.uol.com.br/docs
- **Métodos suportados**: PIX, Cartão, Boleto
- **Webhook**: Implementar endpoint `/api/payments/webhook/pagseguro`

#### Asaas (Focado em PIX)
- **SDK**: `asaas` (npm) ou API REST direta
- **Documentação**: https://docs.asaas.com/
- **Métodos suportados**: PIX, Boleto
- **Vantagem**: Taxas menores (~1,99% a 2,99%)

### 2. Integração com APIs de Nota Fiscal

#### Focus NFe (Recomendado)
- **SDK**: `focus-nfe` (npm) ou API REST
- **Documentação**: https://doc.focusnfe.com.br/
- **Tipos suportados**: NFe, NFCe
- **Custo**: ~R$ 0,50 a R$ 1,50 por nota emitida
- **Vantagem**: API simples e bem documentada

**Endpoints a implementar:**
```
POST /api/invoices/issue
  - Emitir nota fiscal via Focus NFe
  - Validar dados do cliente e pedido
  - Retornar XML e PDF

GET /api/invoices/:id
  - Buscar nota fiscal por ID
  - Retornar XML, PDF e status

POST /api/invoices/:id/cancel
  - Cancelar nota fiscal
  - Validar motivo do cancelamento
```

#### Bling
- **SDK**: `bling-erp` (npm) ou API REST
- **Documentação**: https://developer.bling.com.br/
- **Vantagem**: ERP completo (não apenas NF)
- **Custo**: Planos a partir de ~R$ 99/mês

#### TecnoSpeed
- **SDK**: API REST
- **Documentação**: https://docs.tecnospeed.com.br/
- **Custo**: ~R$ 0,30 a R$ 0,80 por nota
- **Vantagem**: Taxas competitivas

### 3. Frontend - Páginas e Componentes

#### Página de Checkout
- Seleção de método de pagamento
- Formulário de dados do cliente
- Resumo do pedido
- Exibição de QR Code PIX
- Exibição de código de barras (boleto)
- Status do pagamento em tempo real

#### Página de Histórico de Pedidos
- Lista de pedidos com filtros
- Status de cada pedido
- Link para nota fiscal
- Detalhes do pagamento

#### Página de Clientes
- CRUD de clientes
- Histórico de pedidos por cliente
- Dados para emissão de nota fiscal

#### Componentes
- `PaymentMethodSelector`: Seletor de método de pagamento
- `PixQRCode`: Exibição de QR Code PIX
- `BarcodeDisplay`: Exibição de código de barras
- `InvoiceDownload`: Download de nota fiscal
- `PaymentStatus`: Indicador de status do pagamento

### 4. Webhooks e Notificações

#### Webhook de Pagamento
```javascript
// server/index.js
fastify.post('/api/payments/webhook/:provider', async (request, reply) => {
  const { provider } = request.params
  const payload = request.body
  
  // Validar assinatura do webhook (segurança)
  // Atualizar status do pagamento no banco
  // Notificar cliente (se necessário)
  // Emitir nota fiscal automaticamente (se pago)
})
```

#### Notificações em Tempo Real
- Usar WebSockets ou Server-Sent Events
- Atualizar status do pagamento sem refresh
- Notificar quando pagamento for confirmado

### 5. Fluxo Completo de Venda

1. **Criar Pedido**
   - Cliente seleciona produtos/receitas
   - Sistema calcula total
   - Salva pedido com status "pending"

2. **Processar Pagamento**
   - Cliente escolhe método de pagamento
   - Sistema cria registro de Payment
   - Integra com gateway (Mercado Pago, etc.)
   - Retorna QR Code ou link de pagamento

3. **Aguardar Confirmação**
   - Webhook recebe notificação de pagamento
   - Atualiza status para "paid"
   - Atualiza status do pedido para "confirmed"

4. **Emitir Nota Fiscal**
   - Após confirmação de pagamento
   - Integra com Focus NFe
   - Gera XML e PDF
   - Salva no banco de dados

5. **Finalizar Pedido**
   - Cliente recebe nota fiscal
   - Pedido pode ser preparado/entregue
   - Status final: "delivered"

## 🔒 Segurança

### Validação de Webhooks
- Validar assinatura do webhook (HMAC)
- Verificar origem da requisição
- Rate limiting para prevenir abuso

### Dados Sensíveis
- Não armazenar dados de cartão de crédito
- Criptografar dados sensíveis (CPF/CNPJ)
- Usar HTTPS para todas as comunicações

### Certificado Digital
- Obter certificado digital A1 ou A3
- Necessário para emissão de notas fiscais
- Custo: ~R$ 200-400/ano

## 📊 Custos Estimados

### Custos Fixos Mensais
- Certificado Digital: ~R$ 17-33/mês (anualizado)
- Servidor adicional (se necessário): R$ 50-200/mês

### Custos Variáveis
- Taxa de pagamento: 2-5% por transação
- Emissão de nota: R$ 0,30 a R$ 1,50 por nota

### Exemplo (100 transações/mês)
- Vendas: R$ 5.000
- Taxa de pagamento (3%): R$ 150
- Notas fiscais (100 × R$ 0,50): R$ 50
- **Total variável: ~R$ 200/mês**

## 📝 Próximos Passos

1. ✅ Criar modelos Prisma (CONCLUÍDO)
2. ⏳ Implementar endpoints de pagamento
3. ⏳ Integrar com Mercado Pago (PIX)
4. ⏳ Implementar webhook de pagamento
5. ⏳ Criar página de checkout
6. ⏳ Integrar com Focus NFe
7. ⏳ Implementar emissão automática de nota fiscal
8. ⏳ Criar página de histórico de pedidos
9. ⏳ Implementar notificações em tempo real
10. ⏳ Testes e homologação

## 📚 Referências

- [Mercado Pago Developers](https://www.mercadopago.com.br/developers/pt/docs)
- [Focus NFe Documentation](https://doc.focusnfe.com.br/)
- [PagSeguro Developers](https://dev.pagseguro.uol.com.br/docs)
- [Asaas API Documentation](https://docs.asaas.com/)
- [Bling API Documentation](https://developer.bling.com.br/)
- [TecnoSpeed Documentation](https://docs.tecnospeed.com.br/)
