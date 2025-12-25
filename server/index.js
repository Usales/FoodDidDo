import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import path from 'path'
import { fileURLToPath } from 'url'
import { fileURLToPath as fileURLToPathUtil } from 'url'

const __filename = fileURLToPathUtil(import.meta.url)
const __dirname = path.dirname(__filename)

// Configurar Prisma com caminho absoluto do banco
const dbPath = path.join(__dirname, '../prisma/dev.db')
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  }
})

const fastify = Fastify({
  logger: true
})

// Registrar CORS
await fastify.register(cors, {
  origin: true
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
  const { name, yield: recipeYield, prepTime, totalCost, unitCost, contributionMargin, ingredients } = request.body
  
  const recipe = await prisma.recipe.create({
    data: {
      name,
      yield: recipeYield,
      prepTime,
      totalCost,
      unitCost,
      contributionMargin,
      ingredients: {
        create: ingredients.map(ing => ({
          ingredientId: ing.ingredientId || ing.id,
          quantity: ing.quantity,
          unit: ing.unit || 'g'
        }))
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
})

fastify.put('/api/recipes/:id', async (request, reply) => {
  const { id } = request.params
  const { name, yield: recipeYield, prepTime, totalCost, unitCost, contributionMargin, ingredients } = request.body
  
  // Deletar ingredientes antigos
  await prisma.recipeIngredient.deleteMany({
    where: { recipeId: id }
  })
  
  const recipe = await prisma.recipe.update({
    where: { id },
    data: {
      name,
      yield: recipeYield,
      prepTime,
      totalCost,
      unitCost,
      contributionMargin,
      ingredients: {
        create: ingredients.map(ing => ({
          ingredientId: ing.ingredientId || ing.id,
          quantity: ing.quantity,
          unit: ing.unit || 'g'
        }))
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
})

fastify.delete('/api/recipes/:id', async (request, reply) => {
  const { id } = request.params
  await prisma.recipe.delete({
    where: { id }
  })
  return { success: true }
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

