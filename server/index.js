import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import path from 'path'
import { fileURLToPath } from 'url'
import { fileURLToPath as fileURLToPathUtil } from 'url'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const __filename = fileURLToPathUtil(import.meta.url)
const __dirname = path.dirname(__filename)

// Configurar URL do banco de dados
if (!process.env.DATABASE_URL) {
  const dbPath = path.join(__dirname, '../prisma/dev.db')
  process.env.DATABASE_URL = `file:${dbPath}`
}

// Configurar Prisma - a URL do banco é lida da variável de ambiente
const prisma = new PrismaClient()

const fastify = Fastify({
  logger: true
})

// Registrar CORS
await fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
})

// Rotas de Ingredientes
fastify.get('/api/ingredients', async (request, reply) => {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return ingredients
})

fastify.post('/api/ingredients', async (request, reply) => {
  const { name, category, packagePrice, packageQty, stockQty, lowStockThreshold } = request.body
  const unitCost = packagePrice / packageQty
  
  const ingredient = await prisma.ingredient.create({
    data: {
      name,
      category,
      packagePrice,
      packageQty,
      unitCost,
      stockQty: stockQty || 0,
      lowStockThreshold: lowStockThreshold || 0
    }
  })
  
  return ingredient
})

fastify.put('/api/ingredients/:id', async (request, reply) => {
  const { id } = request.params
  const { name, category, packagePrice, packageQty, stockQty, lowStockThreshold } = request.body
  const unitCost = packagePrice / packageQty
  
  const ingredient = await prisma.ingredient.update({
    where: { id },
    data: {
      name,
      category,
      packagePrice,
      packageQty,
      unitCost,
      stockQty,
      lowStockThreshold
    }
  })
  
  return ingredient
})

fastify.delete('/api/ingredients/:id', async (request, reply) => {
  const { id } = request.params
  await prisma.ingredient.delete({
    where: { id }
  })
  return { success: true }
})

// Rotas de Receitas
fastify.get('/api/recipes', async (request, reply) => {
  const recipes = await prisma.recipe.findMany({
    include: {
      ingredients: {
        include: {
          ingredient: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  // Transformar para o formato esperado pelo frontend
  return recipes.map(recipe => ({
    ...recipe,
    ingredients: recipe.ingredients.map(ri => ({
      ...ri.ingredient,
      quantity: ri.quantity,
      unit: ri.unit
    }))
  }))
})

fastify.post('/api/recipes', async (request, reply) => {
  try {
    const { name, yield: recipeYield, prepTime, totalCost, unitCost, contributionMargin, includeInBudget, ingredients } = request.body
    
    // Validar dados obrigatórios
    if (!name || !recipeYield || !ingredients || ingredients.length === 0) {
      return reply.status(400).send({ 
        error: 'Dados inválidos', 
        message: 'Nome, rendimento e ingredientes são obrigatórios' 
      })
    }

    // Processar ingredientes: buscar ou criar pelo nome
    const ingredientConnections = await Promise.all(
      ingredients.map(async (ing) => {
        let ingredientId = ing.ingredientId || ing.id
        
        // Se não tiver ID, buscar ou criar pelo nome
        if (!ingredientId && ing.name) {
          let ingredient = await prisma.ingredient.findFirst({
            where: { name: ing.name.trim() }
          })
          
          // Se não existir, criar o ingrediente
          if (!ingredient) {
            ingredient = await prisma.ingredient.create({
              data: {
                name: ing.name.trim(),
                category: ing.category || 'Outros',
                packagePrice: ing.totalValue || ing.packagePrice || 0,
                packageQty: ing.packageQty || 1,
                unitCost: (ing.totalValue || 0) / (ing.packageQty || 1),
                stockQty: 0,
                lowStockThreshold: 0
              }
            })
          }
          
          ingredientId = ingredient.id
        }
        
        if (!ingredientId) {
          throw new Error(`Ingrediente inválido: ${ing.name || 'sem nome'}`)
        }
        
        return {
          ingredientId,
          quantity: Number(ing.quantity) || 0,
          unit: ing.unit || 'g'
        }
      })
    )
    
    const recipe = await prisma.recipe.create({
      data: {
        name: name.trim(),
        yield: Number(recipeYield),
        prepTime: Number(prepTime) || 0,
        totalCost: Number(totalCost) || 0,
        unitCost: Number(unitCost) || 0,
        contributionMargin: contributionMargin ? Number(contributionMargin) : null,
        includeInBudget: includeInBudget !== undefined ? (includeInBudget === true || includeInBudget === 'true') : true,
        ingredients: {
          create: ingredientConnections
        }
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    })
    
    return {
      ...recipe,
      ingredients: recipe.ingredients.map(ri => ({
        ...ri.ingredient,
        quantity: ri.quantity,
        unit: ri.unit
      }))
    }
  } catch (error) {
    fastify.log.error(error)
    return reply.status(500).send({ 
      error: 'Erro ao criar receita', 
      message: error.message 
    })
  }
})

fastify.put('/api/recipes/:id', async (request, reply) => {
  try {
    const { id } = request.params
    const { name, yield: recipeYield, prepTime, totalCost, unitCost, contributionMargin, ingredients } = request.body
    
    // Validar dados obrigatórios
    if (!name || !recipeYield || !ingredients || ingredients.length === 0) {
      return reply.status(400).send({ 
        error: 'Dados inválidos', 
        message: 'Nome, rendimento e ingredientes são obrigatórios' 
      })
    }

    // Processar ingredientes: buscar ou criar pelo nome
    const ingredientConnections = await Promise.all(
      ingredients.map(async (ing) => {
        let ingredientId = ing.ingredientId || ing.id
        
        // Se não tiver ID, buscar ou criar pelo nome
        if (!ingredientId && ing.name) {
          let ingredient = await prisma.ingredient.findFirst({
            where: { name: ing.name.trim() }
          })
          
          // Se não existir, criar o ingrediente
          if (!ingredient) {
            ingredient = await prisma.ingredient.create({
              data: {
                name: ing.name.trim(),
                category: ing.category || 'Outros',
                packagePrice: ing.totalValue || ing.packagePrice || 0,
                packageQty: ing.packageQty || 1,
                unitCost: (ing.totalValue || 0) / (ing.packageQty || 1),
                stockQty: 0,
                lowStockThreshold: 0
              }
            })
          }
          
          ingredientId = ingredient.id
        }
        
        if (!ingredientId) {
          throw new Error(`Ingrediente inválido: ${ing.name || 'sem nome'}`)
        }
        
        return {
          ingredientId,
          quantity: Number(ing.quantity) || 0,
          unit: ing.unit || 'g'
        }
      })
    )
    
    // Deletar ingredientes antigos
    await prisma.recipeIngredient.deleteMany({
      where: { recipeId: id }
    })
    
    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        name: name.trim(),
        yield: Number(recipeYield),
        prepTime: Number(prepTime) || 0,
        totalCost: Number(totalCost) || 0,
        unitCost: Number(unitCost) || 0,
        contributionMargin: contributionMargin ? Number(contributionMargin) : null,
        includeInBudget: request.body.includeInBudget !== undefined ? (request.body.includeInBudget === true || request.body.includeInBudget === 'true') : undefined,
        ingredients: {
          create: ingredientConnections
        }
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    })
    
    return {
      ...recipe,
      ingredients: recipe.ingredients.map(ri => ({
        ...ri.ingredient,
        quantity: ri.quantity,
        unit: ri.unit
      }))
    }
  } catch (error) {
    fastify.log.error(error)
    return reply.status(500).send({ 
      error: 'Erro ao atualizar receita', 
      message: error.message 
    })
  }
})

fastify.patch('/api/recipes/:id/budget', async (request, reply) => {
  try {
    const { id } = request.params
    const { includeInBudget } = request.body
    
    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        includeInBudget: includeInBudget === true || includeInBudget === 'true'
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    })
    
    // Transformar para o formato esperado pelo frontend
    return {
      ...recipe,
      ingredients: recipe.ingredients.map(ri => ({
        ...ri.ingredient,
        quantity: ri.quantity,
        unit: ri.unit
      }))
    }
  } catch (error) {
    fastify.log.error('Erro ao atualizar includeInBudget:', error)
    return reply.status(500).send({ 
      error: 'Erro ao atualizar receita', 
      message: error.message 
    })
  }
})

fastify.delete('/api/recipes/:id', async (request, reply) => {
  try {
    const { id } = request.params
    fastify.log.info(`Tentando deletar receita com ID: ${id}`)
    
    // Verificar se a receita existe
    const recipe = await prisma.recipe.findUnique({
      where: { id }
    })
    
    if (!recipe) {
      fastify.log.warn(`Receita não encontrada: ${id}`)
      return reply.status(404).send({ 
        error: 'Receita não encontrada', 
        message: `Receita com ID ${id} não foi encontrada` 
      })
    }
    
    fastify.log.info(`Receita encontrada: ${recipe.name}`)
    
    // O onDelete: Cascade já deve deletar os RecipeIngredient automaticamente
    // Mas vamos deletar manualmente para garantir
    const deletedIngredients = await prisma.recipeIngredient.deleteMany({
      where: { recipeId: id }
    })
    fastify.log.info(`Deletados ${deletedIngredients.count} ingredientes relacionados`)
    
    // Deletar a receita
    await prisma.recipe.delete({
      where: { id }
    })
    
    fastify.log.info(`Receita ${id} deletada com sucesso`)
    return { success: true }
  } catch (error) {
    fastify.log.error('Erro ao deletar receita:', error)
    fastify.log.error('Erro completo:', JSON.stringify(error, null, 2))
    
    // Verificar se é um erro de Prisma
    if (error.code === 'P2025') {
      return reply.status(404).send({ 
        error: 'Receita não encontrada', 
        message: error.meta?.cause || 'Receita não foi encontrada' 
      })
    }
    
    // Se for um erro de validação, retornar 400
    if (error.code === 'P2003' || error.name === 'PrismaClientValidationError') {
      return reply.status(400).send({ 
        error: 'Erro de validação', 
        message: error.message || 'Dados inválidos para deletar receita' 
      })
    }
    
    return reply.status(500).send({ 
      error: 'Erro ao deletar receita', 
      message: error.message || 'Erro desconhecido ao deletar receita' 
    })
  }
})

// Rotas de Orçamentos
fastify.get('/api/budgets', async (request, reply) => {
  const budgets = await prisma.budget.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return budgets
})

fastify.post('/api/budgets', async (request, reply) => {
  const budget = await prisma.budget.create({
    data: request.body
  })
  return budget
})

// Rotas de Custos Fixos
fastify.get('/api/fixed-costs', async (request, reply) => {
  const costs = await prisma.fixedCost.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return costs
})

fastify.post('/api/fixed-costs', async (request, reply) => {
  const cost = await prisma.fixedCost.create({
    data: request.body
  })
  return cost
})

fastify.put('/api/fixed-costs/:id', async (request, reply) => {
  const { id } = request.params
  const cost = await prisma.fixedCost.update({
    where: { id },
    data: request.body
  })
  return cost
})

fastify.delete('/api/fixed-costs/:id', async (request, reply) => {
  const { id } = request.params
  await prisma.fixedCost.delete({
    where: { id }
  })
  return { success: true }
})

// Rotas de Fluxo de Caixa
fastify.get('/api/cashflow', async (request, reply) => {
  try {
    const entries = await prisma.cashflowEntry.findMany({
      orderBy: { date: 'desc' }
    })
    return entries
  } catch (error) {
    // Compatibilidade: bancos antigos podem não ter colunas cost/profit ainda
    if (error?.code === 'P2022') {
      const entries = await prisma.cashflowEntry.findMany({
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          date: true,
          category: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { date: 'desc' }
      })
      return entries.map((e) => ({ ...e, cost: null, profit: null }))
    }
    throw error
  }
})

fastify.post('/api/cashflow', async (request, reply) => {
  try {
    const entry = await prisma.cashflowEntry.create({
      data: request.body
    })
    return entry
  } catch (error) {
    // Compatibilidade: bancos antigos podem não ter colunas cost/profit ainda
    if (error?.code === 'P2022') {
      const { cost, profit, ...data } = request.body || {}
      const entry = await prisma.cashflowEntry.create({ data })
      return { ...entry, cost: null, profit: null }
    }
    throw error
  }
})

fastify.put('/api/cashflow/:id', async (request, reply) => {
  const { id } = request.params
  try {
    const entry = await prisma.cashflowEntry.update({
      where: { id },
      data: request.body
    })
    return entry
  } catch (error) {
    // Compatibilidade: bancos antigos podem não ter colunas cost/profit ainda
    if (error?.code === 'P2022') {
      const { cost, profit, ...data } = request.body || {}
      const entry = await prisma.cashflowEntry.update({ where: { id }, data })
      return { ...entry, cost: null, profit: null }
    }
    throw error
  }
})

fastify.delete('/api/cashflow/:id', async (request, reply) => {
  try {
    const { id } = request.params
    await prisma.cashflowEntry.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    fastify.log.error(error)
    return reply.status(500).send({ 
      error: 'Erro ao deletar entrada de fluxo de caixa', 
      message: error.message 
    })
  }
})

// ============================================
// ROTAS DE CAIXA (ABERTURA/FECHAMENTO/SUPRIMENTO/SANGRIA)
// ============================================

// Obter sessão atual de caixa
fastify.get('/api/cashbox/session', async (request, reply) => {
  try {
    const session = await prisma.cashboxSession.findFirst({
      where: { isOpen: true },
      include: {
        cashMovements: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { openingDate: 'desc' }
    })
    
    if (!session) {
      return { isOpen: false, session: null }
    }
    
    // Calcular saldo atual (abertura + suprimentos - sangrias + entradas - saídas do fluxo de caixa)
    const totalSuprimentos = session.cashMovements
      .filter(m => m.type === 'suprimento')
      .reduce((sum, m) => sum + m.amount, 0)
    
    const totalSangrias = session.cashMovements
      .filter(m => m.type === 'sangria')
      .reduce((sum, m) => sum + m.amount, 0)
    
    // Buscar entradas e saídas do fluxo de caixa desde a abertura
    const cashflowEntries = await prisma.cashflowEntry.findMany({
      where: {
        date: {
          gte: session.openingDate
        }
      }
    })
    
    const totalEntradas = cashflowEntries
      .filter(e => e.type === 'entrada')
      .reduce((sum, e) => sum + e.amount, 0)
    
    const totalSaidas = cashflowEntries
      .filter(e => e.type === 'saída')
      .reduce((sum, e) => sum + e.amount, 0)
    
    const currentBalance = session.openingAmount + totalSuprimentos - totalSangrias + totalEntradas - totalSaidas
    
    return {
      isOpen: true,
      session: {
        ...session,
        currentBalance,
        totalSuprimentos,
        totalSangrias,
        totalEntradas,
        totalSaidas
      }
    }
  } catch (error) {
    fastify.log.error(error)
    return reply.status(500).send({ 
      error: 'Erro ao buscar sessão de caixa', 
      message: error.message 
    })
  }
})

// Abrir caixa
fastify.post('/api/cashbox/open', async (request, reply) => {
  try {
    const { openingAmount } = request.body
    
    if (!openingAmount || openingAmount < 0) {
      return reply.status(400).send({ 
        error: 'Valor inválido', 
        message: 'O valor de abertura deve ser maior ou igual a zero' 
      })
    }
    
    // Verificar se já existe uma sessão aberta
    const existingSession = await prisma.cashboxSession.findFirst({
      where: { isOpen: true }
    })
    
    if (existingSession) {
      return reply.status(400).send({ 
        error: 'Caixa já aberto', 
        message: 'Já existe uma sessão de caixa aberta. Feche o caixa antes de abrir uma nova sessão.' 
      })
    }
    
    const session = await prisma.cashboxSession.create({
      data: {
        isOpen: true,
        openingAmount: Number(openingAmount),
        openingDate: new Date()
      },
      include: {
        cashMovements: true
      }
    })
    
    return session
  } catch (error) {
    fastify.log.error(error)
    return reply.status(500).send({ 
      error: 'Erro ao abrir caixa', 
      message: error.message 
    })
  }
})

// Fechar caixa
fastify.post('/api/cashbox/close', async (request, reply) => {
  try {
    const { closingBalance, notes } = request.body
    
    if (closingBalance === undefined || closingBalance < 0) {
      return reply.status(400).send({ 
        error: 'Valor inválido', 
        message: 'O saldo de fechamento deve ser informado e maior ou igual a zero' 
      })
    }
    
    // Buscar sessão aberta
    const session = await prisma.cashboxSession.findFirst({
      where: { isOpen: true },
      include: {
        cashMovements: true
      }
    })
    
    if (!session) {
      return reply.status(400).send({ 
        error: 'Caixa não aberto', 
        message: 'Não existe uma sessão de caixa aberta' 
      })
    }
    
    // Calcular saldo esperado
    const totalSuprimentos = session.cashMovements
      .filter(m => m.type === 'suprimento')
      .reduce((sum, m) => sum + m.amount, 0)
    
    const totalSangrias = session.cashMovements
      .filter(m => m.type === 'sangria')
      .reduce((sum, m) => sum + m.amount, 0)
    
    // Buscar entradas e saídas do fluxo de caixa desde a abertura
    const cashflowEntries = await prisma.cashflowEntry.findMany({
      where: {
        date: {
          gte: session.openingDate
        }
      }
    })
    
    const totalEntradas = cashflowEntries
      .filter(e => e.type === 'entrada')
      .reduce((sum, e) => sum + e.amount, 0)
    
    const totalSaidas = cashflowEntries
      .filter(e => e.type === 'saída')
      .reduce((sum, e) => sum + e.amount, 0)
    
    const expectedBalance = session.openingAmount + totalSuprimentos - totalSangrias + totalEntradas - totalSaidas
    const difference = Number(closingBalance) - expectedBalance
    
    const updatedSession = await prisma.cashboxSession.update({
      where: { id: session.id },
      data: {
        isOpen: false,
        closingDate: new Date(),
        closingBalance: Number(closingBalance),
        expectedBalance,
        difference,
        notes: notes || null
      },
      include: {
        cashMovements: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    
    return updatedSession
  } catch (error) {
    fastify.log.error(error)
    return reply.status(500).send({ 
      error: 'Erro ao fechar caixa', 
      message: error.message 
    })
  }
})

// Listar movimentações (suprimento/sangria) da sessão atual
fastify.get('/api/cashbox/movements', async (request, reply) => {
  try {
    const session = await prisma.cashboxSession.findFirst({
      where: { isOpen: true }
    })
    
    if (!session) {
      return []
    }
    
    const movements = await prisma.cashMovement.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'desc' }
    })
    
    return movements
  } catch (error) {
    fastify.log.error(error)
    return reply.status(500).send({ 
      error: 'Erro ao buscar movimentações', 
      message: error.message 
    })
  }
})

// Criar movimentação (suprimento ou sangria)
fastify.post('/api/cashbox/movements', async (request, reply) => {
  try {
    const { type, amount, description } = request.body
    
    if (!type || !['suprimento', 'sangria'].includes(type)) {
      return reply.status(400).send({ 
        error: 'Tipo inválido', 
        message: 'Tipo deve ser "suprimento" ou "sangria"' 
      })
    }
    
    if (!amount || amount <= 0) {
      return reply.status(400).send({ 
        error: 'Valor inválido', 
        message: 'O valor deve ser maior que zero' 
      })
    }
    
    // Verificar se existe sessão aberta
    const session = await prisma.cashboxSession.findFirst({
      where: { isOpen: true }
    })
    
    if (!session) {
      return reply.status(400).send({ 
        error: 'Caixa não aberto', 
        message: 'É necessário abrir o caixa antes de fazer movimentações' 
      })
    }
    
    const movement = await prisma.cashMovement.create({
      data: {
        sessionId: session.id,
        type,
        amount: Number(amount),
        description: description || null
      }
    })
    
    return movement
  } catch (error) {
    fastify.log.error(error)
    return reply.status(500).send({ 
      error: 'Erro ao criar movimentação', 
      message: error.message 
    })
  }
})

// Rotas de Preços
fastify.get('/api/pricing', async (request, reply) => {
  const pricing = await prisma.pricing.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return pricing
})

fastify.post('/api/pricing', async (request, reply) => {
  const pricing = await prisma.pricing.create({
    data: request.body
  })
  return pricing
})

// Rotas de Movimentações de Estoque
fastify.get('/api/stock-movements', async (request, reply) => {
  const movements = await prisma.stockMovement.findMany({
    include: {
      ingredient: true
    },
    orderBy: { createdAt: 'desc' }
  })
  return movements
})

fastify.post('/api/stock-movements', async (request, reply) => {
  const { ingredientId, type, quantity, reference } = request.body
  
  // Atualizar estoque do ingrediente
  const ingredient = await prisma.ingredient.findUnique({
    where: { id: ingredientId }
  })
  
  const newStockQty = type === 'entrada' 
    ? ingredient.stockQty + quantity 
    : ingredient.stockQty - quantity
  
  await prisma.ingredient.update({
    where: { id: ingredientId },
    data: { stockQty: newStockQty }
  })
  
  const movement = await prisma.stockMovement.create({
    data: {
      ingredientId,
      type,
      quantity,
      reference
    },
    include: {
      ingredient: true
    }
  })
  
  return movement
})

// Rotas de Armazéns
fastify.get('/api/warehouses', async (request, reply) => {
  const warehouses = await prisma.warehouse.findMany({
    include: {
      items: true
    },
    orderBy: { createdAt: 'desc' }
  })
  return warehouses
})

fastify.post('/api/warehouses', async (request, reply) => {
  const warehouse = await prisma.warehouse.create({
    data: {
      name: request.body.name,
      capacity: request.body.capacity,
      capacityUnit: request.body.capacityUnit
    },
    include: {
      items: true
    }
  })
  return warehouse
})

fastify.put('/api/warehouses/:id', async (request, reply) => {
  const { id } = request.params
  const warehouse = await prisma.warehouse.update({
    where: { id },
    data: request.body
  })
  return warehouse
})

fastify.delete('/api/warehouses/:id', async (request, reply) => {
  const { id } = request.params
  await prisma.warehouse.delete({
    where: { id }
  })
  return { success: true }
})

// Rotas de Itens do Armazém
fastify.post('/api/warehouses/:warehouseId/items', async (request, reply) => {
  const { warehouseId } = request.params
  const item = await prisma.warehouseItem.create({
    data: {
      ...request.body,
      warehouseId
    }
  })
  return item
})

fastify.put('/api/warehouses/:warehouseId/items/:itemId', async (request, reply) => {
  const { itemId } = request.params
  const item = await prisma.warehouseItem.update({
    where: { id: itemId },
    data: request.body
  })
  return item
})

fastify.delete('/api/warehouses/:warehouseId/items/:itemId', async (request, reply) => {
  const { itemId } = request.params
  await prisma.warehouseItem.delete({
    where: { id: itemId }
  })
  return { success: true }
})

// Rota de backup/export
// Inclui: budgets, ingredients, recipes, fixedCosts, cashflow, stockMovements, warehouses, pricing, customers, orders
fastify.get('/api/export', async (request, reply) => {
  try {
    const fetchCashflowSafe = async () => {
      try {
        return await prisma.cashflowEntry.findMany()
      } catch (error) {
        // Compatibilidade: bancos antigos podem não ter colunas cost/profit ainda
        if (error?.code === 'P2022') {
          const entries = await prisma.cashflowEntry.findMany({
            select: {
              id: true,
              type: true,
              amount: true,
              description: true,
              date: true,
              category: true,
              createdAt: true,
              updatedAt: true
            }
          })
          return entries.map((e) => ({ ...e, cost: null, profit: null }))
        }
        throw error
      }
    }

    const [budgets, ingredients, recipes, fixedCosts, cashflow, stockMovements, warehouses, pricing, customers, orders, cashboxSessions] = await Promise.all([
      prisma.budget.findMany(),
      prisma.ingredient.findMany(),
      prisma.recipe.findMany({
        include: {
          ingredients: {
            include: { ingredient: true }
          }
        }
      }),
      prisma.fixedCost.findMany(),
      fetchCashflowSafe(),
      prisma.stockMovement.findMany(),
      prisma.warehouse.findMany({
        include: { items: true }
      }),
      prisma.pricing.findMany(),
      prisma.customer.findMany().catch(() => []),
      prisma.order.findMany({
        include: {
          items: true,
          payment: true,
          invoice: true
        }
      }).catch(() => []),
      prisma.cashboxSession.findMany({
        include: {
          cashMovements: true
        }
      }).catch(() => [])
    ])
    
    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        budgets: budgets || [],
        ingredients: ingredients || [],
        recipes: (recipes || []).map(r => ({
          ...r,
          ingredients: (r.ingredients || []).map(ri => ({
            ...ri.ingredient,
            quantity: ri.quantity,
            unit: ri.unit
          }))
        })),
        fixedCosts: fixedCosts || [],
        cashflow: cashflow || [],
        stockMovements: stockMovements || [],
        warehouses: warehouses || [],
        pricing: pricing || [],
        customers: customers || [],
        orders: orders || [],
        cashboxSessions: cashboxSessions || []
      }
    }
  } catch (error) {
    fastify.log.error('Erro ao exportar dados:', error)
    return reply.status(500).send({ 
      error: 'Erro ao exportar dados', 
      message: error.message 
    })
  }
})

// Rota de restore/import
fastify.post('/api/restore', async (request, reply) => {
  try {
    const { data } = request.body
    
    if (!data || typeof data !== 'object') {
      return reply.status(400).send({ 
        error: 'Dados inválidos', 
        message: 'O arquivo de backup não contém dados válidos' 
      })
    }
    
    // Limpar dados existentes (em ordem para respeitar foreign keys)
    await Promise.all([
      prisma.cashMovement.deleteMany().catch(() => {}),
      prisma.cashboxSession.deleteMany().catch(() => {}),
      prisma.orderItem.deleteMany().catch(() => {}),
      prisma.payment.deleteMany().catch(() => {}),
      prisma.invoice.deleteMany().catch(() => {}),
      prisma.order.deleteMany().catch(() => {}),
      prisma.customer.deleteMany().catch(() => {}),
      prisma.recipeIngredient.deleteMany(),
      prisma.stockMovement.deleteMany(),
      prisma.warehouseItem.deleteMany(),
      prisma.warehouse.deleteMany(),
      prisma.recipe.deleteMany(),
      prisma.ingredient.deleteMany(),
      prisma.budget.deleteMany(),
      prisma.fixedCost.deleteMany(),
      prisma.cashflowEntry.deleteMany(),
      prisma.pricing.deleteMany()
    ])
    
    // Restaurar dados na ordem correta (respeitando dependências)
    
    // 1. Ingredientes primeiro (necessários para receitas)
    if (data.ingredients && Array.isArray(data.ingredients)) {
      if (data.ingredients.length > 0) {
        await prisma.ingredient.createMany({ 
          data: data.ingredients.map(ing => ({
            id: ing.id,
            name: ing.name,
            category: ing.category,
            packagePrice: ing.packagePrice,
            packageQty: ing.packageQty,
            unitCost: ing.unitCost,
            stockQty: ing.stockQty || 0,
            lowStockThreshold: ing.lowStockThreshold || 0,
            createdAt: ing.createdAt ? new Date(ing.createdAt) : new Date(),
            updatedAt: ing.updatedAt ? new Date(ing.updatedAt) : new Date()
          }))
        })
      }
    }
    
    // 2. Orçamentos
    if (data.budgets && Array.isArray(data.budgets)) {
      if (data.budgets.length > 0) {
        await prisma.budget.createMany({ 
          data: data.budgets.map(b => ({
            id: b.id,
            period: b.period,
            amount: b.amount,
            spent: b.spent || 0,
            createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
            updatedAt: b.updatedAt ? new Date(b.updatedAt) : new Date()
          }))
        })
      }
    }
    
    // 3. Receitas (dependem de ingredientes)
    if (data.recipes && Array.isArray(data.recipes)) {
      for (const recipe of data.recipes) {
        const { ingredients, ...recipeData } = recipe
        const created = await prisma.recipe.create({
          data: {
            id: recipeData.id,
            name: recipeData.name,
            yield: recipeData.yield,
            prepTime: recipeData.prepTime,
            totalCost: recipeData.totalCost,
            unitCost: recipeData.unitCost,
            contributionMargin: recipeData.contributionMargin,
            includeInBudget: recipeData.includeInBudget !== undefined ? recipeData.includeInBudget : true,
            createdAt: recipeData.createdAt ? new Date(recipeData.createdAt) : new Date(),
            updatedAt: recipeData.updatedAt ? new Date(recipeData.updatedAt) : new Date()
          }
        })
        
        // Restaurar ingredientes da receita
        if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
          // Buscar IDs dos ingredientes pelo nome (caso os IDs tenham mudado)
          const ingredientConnections = await Promise.all(
            ingredients.map(async (ing) => {
              let ingredientId = ing.id || ing.ingredientId
              
              // Se não tiver ID válido, tentar buscar pelo nome
              if (!ingredientId && ing.name) {
                const foundIngredient = await prisma.ingredient.findFirst({
                  where: { name: ing.name.trim() }
                })
                if (foundIngredient) {
                  ingredientId = foundIngredient.id
                }
              }
              
              if (!ingredientId) {
                throw new Error(`Ingrediente não encontrado: ${ing.name || 'sem nome'}`)
              }
              
              return {
                recipeId: created.id,
                ingredientId: ingredientId,
                quantity: Number(ing.quantity) || 0,
                unit: ing.unit || 'g'
              }
            })
          )
          
          await prisma.recipeIngredient.createMany({
            data: ingredientConnections
          })
        }
      }
    }
    
    // 4. Custos Fixos
    if (data.fixedCosts && Array.isArray(data.fixedCosts)) {
      if (data.fixedCosts.length > 0) {
        await prisma.fixedCost.createMany({ 
          data: data.fixedCosts.map(fc => ({
            id: fc.id,
            name: fc.name,
            type: fc.type,
            value: fc.value,
            allocationMethod: fc.allocationMethod,
            createdAt: fc.createdAt ? new Date(fc.createdAt) : new Date(),
            updatedAt: fc.updatedAt ? new Date(fc.updatedAt) : new Date()
          }))
        })
      }
    }
    
    // 5. Pricing
    if (data.pricing && Array.isArray(data.pricing)) {
      if (data.pricing.length > 0) {
        await prisma.pricing.createMany({ 
          data: data.pricing.map(p => ({
            id: p.id,
            recipeId: p.recipeId || null,
            recipeName: p.recipeName || null,
            price: p.price,
            margin: p.margin || null,
            createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
            updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date()
          }))
        })
      }
    }
    
    // 6. Fluxo de Caixa
    if (data.cashflow && Array.isArray(data.cashflow)) {
      if (data.cashflow.length > 0) {
        const rowsWithProfit = data.cashflow.map(cf => ({
          id: cf.id,
          type: cf.type,
          amount: cf.amount,
          cost: typeof cf.cost === 'number' ? cf.cost : null,
          profit: typeof cf.profit === 'number' ? cf.profit : null,
          description: cf.description,
          date: cf.date ? new Date(cf.date) : new Date(),
          category: cf.category || null,
          createdAt: cf.createdAt ? new Date(cf.createdAt) : new Date(),
          updatedAt: cf.updatedAt ? new Date(cf.updatedAt) : new Date()
        }))

        try {
          await prisma.cashflowEntry.createMany({ data: rowsWithProfit })
        } catch (error) {
          // Compatibilidade: bancos antigos podem não ter colunas cost/profit ainda
          if (error?.code === 'P2022') {
            await prisma.cashflowEntry.createMany({
              data: rowsWithProfit.map(({ cost, profit, ...rest }) => rest)
            })
          } else {
            throw error
          }
        }
      }
    }
    
    // 7. Movimentações de Estoque (dependem de ingredientes)
    if (data.stockMovements && Array.isArray(data.stockMovements)) {
      if (data.stockMovements.length > 0) {
        // Validar que os ingredientes existem antes de criar movimentações
        const validMovements = await Promise.all(
          data.stockMovements.map(async (sm) => {
            let ingredientId = sm.ingredientId
            // Se o ingrediente não existir pelo ID, tentar buscar pelo nome
            if (sm.ingredient?.name) {
              const foundIngredient = await prisma.ingredient.findFirst({
                where: { name: sm.ingredient.name.trim() }
              })
              if (foundIngredient) {
                ingredientId = foundIngredient.id
              }
            }
            return ingredientId ? {
              id: sm.id,
              ingredientId: ingredientId,
              type: sm.type,
              quantity: sm.quantity,
              reference: sm.reference || null,
              createdAt: sm.createdAt ? new Date(sm.createdAt) : new Date()
            } : null
          })
        )
        
        const movementsToCreate = validMovements.filter(m => m !== null)
        if (movementsToCreate.length > 0) {
          await prisma.stockMovement.createMany({ data: movementsToCreate })
        }
      }
    }
    
    // 8. Armazéns e Itens (últimos, pois dependem de nada)
    if (data.warehouses && Array.isArray(data.warehouses)) {
      for (const warehouse of data.warehouses) {
        const { items, ...warehouseData } = warehouse
        const created = await prisma.warehouse.create({
          data: {
            id: warehouseData.id,
            name: warehouseData.name,
            capacity: warehouseData.capacity || null,
            capacityUnit: warehouseData.capacityUnit || null,
            createdAt: warehouseData.createdAt ? new Date(warehouseData.createdAt) : new Date(),
            updatedAt: warehouseData.updatedAt ? new Date(warehouseData.updatedAt) : new Date()
          }
        })
        
        if (items && Array.isArray(items) && items.length > 0) {
          await prisma.warehouseItem.createMany({
            data: items.map(item => ({
              id: item.id,
              warehouseId: created.id,
              emoji: item.emoji || null,
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              minIdeal: item.minIdeal || null,
              unitCost: item.unitCost || null,
              category: item.category || null,
              notes: item.notes || null,
              createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
              updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date()
            }))
          })
        }
      }
    }
    
    // 8. Restauração de Sessões de Caixa (antes de clientes/pedidos para manter histórico)
    if (data.cashboxSessions && Array.isArray(data.cashboxSessions)) {
      if (data.cashboxSessions.length > 0) {
        for (const session of data.cashboxSessions) {
          const { cashMovements, ...sessionData } = session
          const createdSession = await prisma.cashboxSession.create({
            data: {
              id: sessionData.id,
              isOpen: sessionData.isOpen || false,
              openingAmount: sessionData.openingAmount || 0,
              openingDate: sessionData.openingDate ? new Date(sessionData.openingDate) : null,
              closingDate: sessionData.closingDate ? new Date(sessionData.closingDate) : null,
              closingBalance: sessionData.closingBalance || null,
              expectedBalance: sessionData.expectedBalance || null,
              difference: sessionData.difference || null,
              notes: sessionData.notes || null,
              createdAt: sessionData.createdAt ? new Date(sessionData.createdAt) : new Date(),
              updatedAt: sessionData.updatedAt ? new Date(sessionData.updatedAt) : new Date()
            }
          })
          
          // Restaurar movimentações da sessão
          if (cashMovements && Array.isArray(cashMovements) && cashMovements.length > 0) {
            await prisma.cashMovement.createMany({
              data: cashMovements.map(m => ({
                id: m.id,
                sessionId: createdSession.id,
                type: m.type,
                amount: m.amount,
                description: m.description || null,
                createdAt: m.createdAt ? new Date(m.createdAt) : new Date()
              }))
            })
          }
        }
      }
    }
    
    // 9. Clientes (antes dos pedidos)
    if (data.customers && Array.isArray(data.customers)) {
      if (data.customers.length > 0) {
        await prisma.customer.createMany({
          data: data.customers.map(c => ({
            id: c.id,
            name: c.name,
            email: c.email || null,
            cpfCnpj: c.cpfCnpj || null,
            phone: c.phone || null,
            address: c.address || null,
            city: c.city || null,
            state: c.state || null,
            zipCode: c.zipCode || null,
            notes: c.notes || null,
            createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
            updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date()
          }))
        })
      }
    }
    
    // 10. Pedidos (Orders) com Items, Payment e Invoice
    if (data.orders && Array.isArray(data.orders)) {
      for (const order of data.orders) {
        const { items, payment, invoice, ...orderData } = order
        
        const createdOrder = await prisma.order.create({
          data: {
            id: orderData.id,
            customerId: orderData.customerId || null,
            orderNumber: orderData.orderNumber || null,
            status: orderData.status || 'pending',
            total: Number(orderData.total),
            subtotal: Number(orderData.subtotal || orderData.total),
            discount: Number(orderData.discount || 0),
            tax: Number(orderData.tax || 0),
            deliveryFee: Number(orderData.deliveryFee || 0),
            notes: orderData.notes || null,
            createdAt: orderData.createdAt ? new Date(orderData.createdAt) : new Date(),
            updatedAt: orderData.updatedAt ? new Date(orderData.updatedAt) : new Date()
          }
        })
        
        // Restaurar items do pedido
        if (items && Array.isArray(items) && items.length > 0) {
          await prisma.orderItem.createMany({
            data: items.map(item => ({
              id: item.id,
              orderId: createdOrder.id,
              recipeId: item.recipeId || null,
              recipeName: item.recipeName || item.name,
              name: item.name,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              totalPrice: Number(item.totalPrice || (item.unitPrice * item.quantity)),
              notes: item.notes || null,
              createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
            }))
          })
        }
        
        // Restaurar pagamento
        if (payment) {
          await prisma.payment.create({
            data: {
              id: payment.id,
              orderId: createdOrder.id,
              amount: Number(payment.amount),
              method: payment.method || 'cash',
              status: payment.status || 'pending',
              provider: payment.provider || null,
              providerId: payment.providerId || null,
              qrCode: payment.qrCode || null,
              qrCodeText: payment.qrCodeText || null,
              barcode: payment.barcode || null,
              barcodeUrl: payment.barcodeUrl || null,
              pixCopyPaste: payment.pixCopyPaste || null,
              expirationDate: payment.expirationDate ? new Date(payment.expirationDate) : null,
              paidAt: payment.paidAt ? new Date(payment.paidAt) : null,
              failureReason: payment.failureReason || null,
              metadata: payment.metadata || null,
              createdAt: payment.createdAt ? new Date(payment.createdAt) : new Date(),
              updatedAt: payment.updatedAt ? new Date(payment.updatedAt) : new Date()
            }
          })
        }
        
        // Restaurar nota fiscal (se houver)
        if (invoice) {
          await prisma.invoice.create({
            data: {
              id: invoice.id,
              orderId: createdOrder.id,
              type: invoice.type || 'NFCe',
              number: invoice.number || null,
              series: invoice.series || null,
              accessKey: invoice.accessKey || null,
              status: invoice.status || 'pending',
              provider: invoice.provider || null,
              providerId: invoice.providerId || null,
              xml: invoice.xml || null,
              xmlUrl: invoice.xmlUrl || null,
              pdfUrl: invoice.pdfUrl || null,
              pdfBase64: invoice.pdfBase64 || null,
              cancellationReason: invoice.cancellationReason || null,
              cancelledAt: invoice.cancelledAt ? new Date(invoice.cancelledAt) : null,
              issuedAt: invoice.issuedAt ? new Date(invoice.issuedAt) : null,
              errorMessage: invoice.errorMessage || null,
              metadata: invoice.metadata || null,
              createdAt: invoice.createdAt ? new Date(invoice.createdAt) : new Date(),
              updatedAt: invoice.updatedAt ? new Date(invoice.updatedAt) : new Date()
            }
          })
        }
      }
    }
    
    return { 
      success: true,
      message: 'Dados restaurados com sucesso',
      summary: {
        budgets: data.budgets?.length || 0,
        ingredients: data.ingredients?.length || 0,
        recipes: data.recipes?.length || 0,
        fixedCosts: data.fixedCosts?.length || 0,
        pricing: data.pricing?.length || 0,
        cashflow: data.cashflow?.length || 0,
        stockMovements: data.stockMovements?.length || 0,
        warehouses: data.warehouses?.length || 0,
        customers: data.customers?.length || 0,
        orders: data.orders?.length || 0
      }
    }
  } catch (error) {
    fastify.log.error('Erro ao restaurar dados:', error)
    return reply.status(500).send({ 
      error: 'Erro ao restaurar dados', 
      message: error.message 
    })
  }
})

// ============================================
// ROTAS DE PEDIDOS/VENDAS (Orders)
// ============================================

// Listar pedidos
fastify.get('/api/orders', async (request, reply) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        payment: true,
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return orders
  } catch (error) {
    fastify.log.error('Erro ao listar pedidos:', error)
    return reply.status(500).send({ 
      error: 'Erro ao listar pedidos', 
      message: error.message 
    })
  }
})

// Buscar pedido específico
fastify.get('/api/orders/:id', async (request, reply) => {
  try {
    const { id } = request.params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payment: true,
        customer: true
      }
    })
    
    if (!order) {
      return reply.status(404).send({ 
        error: 'Pedido não encontrado', 
        message: `Pedido com ID ${id} não foi encontrado` 
      })
    }
    
    return order
  } catch (error) {
    fastify.log.error('Erro ao buscar pedido:', error)
    return reply.status(500).send({ 
      error: 'Erro ao buscar pedido', 
      message: error.message 
    })
  }
})

// Criar pedido (com items e payment)
fastify.post('/api/orders', async (request, reply) => {
  try {
    const { 
      customerId, 
      orderNumber, 
      status, 
      total, 
      subtotal, 
      discount, 
      tax, 
      deliveryFee, 
      notes,
      items, // Array de OrderItems
      payment // Objeto Payment
    } = request.body
    
    // Validar dados obrigatórios
    if (!items || !Array.isArray(items) || items.length === 0) {
      return reply.status(400).send({ 
        error: 'Dados inválidos', 
        message: 'O pedido deve conter pelo menos um item' 
      })
    }
    
    if (!total || total <= 0) {
      return reply.status(400).send({ 
        error: 'Dados inválidos', 
        message: 'O total do pedido deve ser maior que zero' 
      })
    }
    
    // Criar pedido com items e payment em uma transação
    const order = await prisma.$transaction(async (tx) => {
      // 1. Criar o pedido
      const createdOrder = await tx.order.create({
        data: {
          customerId: customerId || null,
          orderNumber: orderNumber || null,
          status: status || 'confirmed',
          total: Number(total),
          subtotal: Number(subtotal || total),
          discount: Number(discount || 0),
          tax: Number(tax || 0),
          deliveryFee: Number(deliveryFee || 0),
          notes: notes || null
        }
      })
      
      // 2. Criar os itens do pedido
      const orderItems = await Promise.all(
        items.map(async (item) => {
          return await tx.orderItem.create({
            data: {
              orderId: createdOrder.id,
              recipeId: item.recipeId || null,
              recipeName: item.recipeName || item.name,
              name: item.name,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              totalPrice: Number(item.totalPrice || (item.unitPrice * item.quantity)),
              notes: item.notes || null
            }
          })
        })
      )
      
      // 3. Criar o pagamento (se fornecido)
      let createdPayment = null
      if (payment) {
        createdPayment = await tx.payment.create({
          data: {
            orderId: createdOrder.id,
            amount: Number(payment.amount || total),
            method: payment.method || 'cash',
            status: payment.status || 'paid',
            provider: payment.provider || null,
            providerId: payment.providerId || null,
            qrCode: payment.qrCode || null,
            qrCodeText: payment.qrCodeText || null,
            barcode: payment.barcode || null,
            barcodeUrl: payment.barcodeUrl || null,
            pixCopyPaste: payment.pixCopyPaste || null,
            expirationDate: payment.expirationDate ? new Date(payment.expirationDate) : null,
            paidAt: payment.paidAt ? new Date(payment.paidAt) : (payment.status === 'paid' ? new Date() : null),
            failureReason: payment.failureReason || null,
            metadata: payment.metadata || null
          }
        })
      }
      
      // Retornar pedido completo
      return {
        ...createdOrder,
        items: orderItems,
        payment: createdPayment
      }
    })
    
    return order
  } catch (error) {
    fastify.log.error('Erro ao criar pedido:', error)
    return reply.status(500).send({ 
      error: 'Erro ao criar pedido', 
      message: error.message 
    })
  }
})

// Atualizar status do pedido (para cancelamento, etc)
fastify.patch('/api/orders/:id', async (request, reply) => {
  try {
    const { id } = request.params
    const { status, notes } = request.body
    
    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes })
      },
      include: {
        items: true,
        payment: true,
        customer: true
      }
    })
    
    return order
  } catch (error) {
    fastify.log.error('Erro ao atualizar pedido:', error)
    if (error.code === 'P2025') {
      return reply.status(404).send({ 
        error: 'Pedido não encontrado', 
        message: error.meta?.cause || 'Pedido não foi encontrado' 
      })
    }
    return reply.status(500).send({ 
      error: 'Erro ao atualizar pedido', 
      message: error.message 
    })
  }
})

// Iniciar servidor
const start = async () => {
  try {
    const port = process.env.PORT || 3001
    await fastify.listen({ port, host: '127.0.0.1' })
    console.log(`🚀 Servidor rodando em http://127.0.0.1:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

