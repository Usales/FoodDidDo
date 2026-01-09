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
  const entries = await prisma.cashflowEntry.findMany({
    orderBy: { date: 'desc' }
  })
  return entries
})

fastify.post('/api/cashflow', async (request, reply) => {
  const entry = await prisma.cashflowEntry.create({
    data: request.body
  })
  return entry
})

fastify.put('/api/cashflow/:id', async (request, reply) => {
  const { id } = request.params
  const entry = await prisma.cashflowEntry.update({
    where: { id },
    data: request.body
  })
  return entry
})

fastify.delete('/api/cashflow/:id', async (request, reply) => {
  const { id } = request.params
  await prisma.cashflowEntry.delete({
    where: { id }
  })
  return { success: true }
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
fastify.get('/api/export', async (request, reply) => {
  const [budgets, ingredients, recipes, fixedCosts, cashflow, stockMovements, warehouses] = await Promise.all([
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
    prisma.cashflowEntry.findMany(),
    prisma.stockMovement.findMany(),
    prisma.warehouse.findMany({
      include: { items: true }
    })
  ])
  
  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    data: {
      budgets,
      ingredients,
      recipes: recipes.map(r => ({
        ...r,
        ingredients: r.ingredients.map(ri => ({
          ...ri.ingredient,
          quantity: ri.quantity,
          unit: ri.unit
        }))
      })),
      fixedCosts,
      cashflow,
      stockMovements,
      warehouses
    }
  }
})

// Rota de restore/import
fastify.post('/api/restore', async (request, reply) => {
  const { data } = request.body
  
  // Limpar dados existentes
  await Promise.all([
    prisma.budget.deleteMany(),
    prisma.recipeIngredient.deleteMany(),
    prisma.recipe.deleteMany(),
    prisma.ingredient.deleteMany(),
    prisma.fixedCost.deleteMany(),
    prisma.cashflowEntry.deleteMany(),
    prisma.stockMovement.deleteMany(),
    prisma.warehouseItem.deleteMany(),
    prisma.warehouse.deleteMany()
  ])
  
  // Restaurar dados
  if (data.budgets) {
    await prisma.budget.createMany({ data: data.budgets })
  }
  
  if (data.ingredients) {
    await prisma.ingredient.createMany({ data: data.ingredients })
  }
  
  if (data.recipes) {
    for (const recipe of data.recipes) {
      const { ingredients, ...recipeData } = recipe
      const created = await prisma.recipe.create({
        data: recipeData
      })
      
      if (ingredients && ingredients.length > 0) {
        await prisma.recipeIngredient.createMany({
          data: ingredients.map(ing => ({
            recipeId: created.id,
            ingredientId: ing.id || ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit || 'g'
          }))
        })
      }
    }
  }
  
  if (data.fixedCosts) {
    await prisma.fixedCost.createMany({ data: data.fixedCosts })
  }
  
  if (data.cashflow) {
    await prisma.cashflowEntry.createMany({ data: data.cashflow })
  }
  
  if (data.stockMovements) {
    await prisma.stockMovement.createMany({ data: data.stockMovements })
  }
  
  if (data.warehouses) {
    for (const warehouse of data.warehouses) {
      const { items, ...warehouseData } = warehouse
      const created = await prisma.warehouse.create({
        data: warehouseData
      })
      
      if (items && items.length > 0) {
        await prisma.warehouseItem.createMany({
          data: items.map(item => ({
            ...item,
            warehouseId: created.id
          }))
        })
      }
    }
  }
  
  return { success: true }
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

