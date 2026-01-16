import { useMemo, useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/appStore'
import { FormModal } from '../components/ui/FormModal'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { ToggleSwitch } from '../components/ui/ToggleSwitch'
import { api } from '../lib/api'
import { FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi'
import './PageCommon.css'
import './CostPage.css'

export function CostPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const recipes = useAppStore((state) => state.recipes)
  const ingredients = useAppStore((state) => state.ingredients)
  const warehouses = useAppStore((state) => state.warehouses)
  const addRecipe = useAppStore((state) => state.addRecipe)
  const updateRecipe = useAppStore((state) => state.updateRecipe)
  const deleteRecipe = useAppStore((state) => state.deleteRecipe)
  const addWarehouse = useAppStore((state) => state.addWarehouse)
  const addWarehouseItem = useAppStore((state) => state.addWarehouseItem)
  const updateWarehouseItem = useAppStore((state) => state.updateWarehouseItem)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalExpanded, setIsModalExpanded] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(null) // index do ingrediente com picker aberto
  const [formState, setFormState] = useState({
    name: '',
    yield: '',
    yieldQuantity: '',
    yieldWeight: '',
    prepTime: '',
    contributionMargin: '45.0',
    includeInBudget: true,
    recipeIngredients: []
  })
  const [editingIngredients, setEditingIngredients] = useState([]) // Ingredientes em edição (lado esquerdo)
  const [confirmedIngredients, setConfirmedIngredients] = useState([]) // Ingredientes confirmados (lado direito)

  const editingRecipe = useMemo(() => {
    if (!editingId) return null
    return recipes.find((recipe) => recipe.id === editingId) || null
  }, [editingId, recipes])
  const [editingConfirmedIndex, setEditingConfirmedIndex] = useState(null) // Índice do ingrediente confirmado sendo editado
  const [editingConfirmedData, setEditingConfirmedData] = useState(null) // Dados temporários do ingrediente sendo editado
  const [openEmojiPicker, setOpenEmojiPicker] = useState(null) // index do ingrediente com picker aberto
  const [ingredientNameSuggestions, setIngredientNameSuggestions] = useState({}) // Sugestões de nomes por índice
  const [focusEditingIngredientIndex, setFocusEditingIngredientIndex] = useState(null)
  
  // Emojis comuns para picker
  const commonEmojis = [
    '📦', '🍞', '🥖', '🥐', '🥯', '🥨', '🧀', '🥚', '🥛', '🧈',
    '🍯', '🧂', '🫙', '🥫', '🍅', '🥕', '🧅', '🧄', '🥔', '🌶️',
    '🥬', '🥦', '🥒', '🥑', '🍄', '🌽', '🍋', '🍊', '🍌', '🍎',
    '🍇', '🍓', '🫐', '🥝', '🍉', '🍑', '🥭', '🍍', '🥩', '🍗',
    '🥓', '🌭', '🍖', '🐟', '🦐', '🦑', '🍤', '🥜', '🌰', '🍪',
    '🍰', '🧁', '🍫', '🍬', '🍭', '☕', '🍵', '🧃', '🥤', '🧊',
    '🍶', '🍺', '🍷', '🥂', '🍾', '🧉', '🥄', '🍴', '🍽️', '🥢',
    '🌾', '🌱', '🌿', '🍃', '🍂', '🍁', '🌺'
  ]

  // KPIs calculados
  const kpis = useMemo(() => {
    if (!recipes.length) {
      return {
        unitAverage: 0,
        averageMargin: 0,
        totalInvested: 0,
        averageProfitPerUnit: 0
      }
    }
    const total = recipes.reduce((acc, recipe) => acc + recipe.totalCost, 0)
    const unitAverage = recipes.reduce((acc, recipe) => acc + recipe.unitCost, 0) / recipes.length
    const averageMargin = recipes.reduce((acc, recipe) => acc + recipe.contributionMargin, 0) / recipes.length
    const averageProfitPerUnit = recipes.reduce((acc, recipe) => {
      const profitPerUnit = recipe.unitCost * recipe.contributionMargin
      return acc + profitPerUnit
    }, 0) / recipes.length

    return {
      unitAverage,
      averageMargin,
      totalInvested: total,
      averageProfitPerUnit
    }
  }, [recipes])

  // Funções para salvar e carregar rascunho
  const saveDraft = () => {
    if (!editingId) {
      const draft = {
        formState,
        confirmedIngredients,
        editingIngredients,
        isModalExpanded
      }
      localStorage.setItem('recipeDraft', JSON.stringify(draft))
    }
  }

  const loadDraft = () => {
    try {
      const draftStr = localStorage.getItem('recipeDraft')
      if (draftStr) {
        const draft = JSON.parse(draftStr)
        setFormState(draft.formState || {
          name: '',
          yield: '',
          yieldQuantity: '',
          yieldWeight: '',
          prepTime: '',
          contributionMargin: '45.0',
          includeInBudget: true,
          recipeIngredients: []
        })
        setConfirmedIngredients(draft.confirmedIngredients || [])
        setEditingIngredients(draft.editingIngredients || [])
        setIsModalExpanded(draft.isModalExpanded || false)
        return true
      }
    } catch (error) {
      console.error('Erro ao carregar rascunho:', error)
    }
    return false
  }

  const clearDraft = () => {
    localStorage.removeItem('recipeDraft')
  }

  const handleOpenModal = (recipe = null) => {
    if (recipe) {
      setEditingId(recipe.id)
      console.log('Carregando receita para edição:', recipe)
      
      // Converter ingredientes do formato do backend para o formato do formulário
      // O backend retorna: { ...ingredient, quantity, unit } onde ingredient tem todas as props
      const convertedIngredients = (recipe.ingredients || []).map((ing) => {
        // Calcular totalValue baseado no unitCost e quantity
        const quantity = Number(ing.quantity) || 0
        const unitCost = Number(ing.unitCost) || 0
        const totalValue = quantity > 0 && unitCost > 0 ? (unitCost * quantity).toFixed(2) : (ing.totalValue?.toString() || '0')
        
        return {
          emoji: ing.emoji || '📦',
          name: ing.name || '',
          packageQty: (ing.packageQty?.toString() || ''),
          totalValue: ing.totalValue?.toString() || totalValue,
          quantity: quantity > 0 ? quantity.toString() : ''
        }
      })
      
      console.log('Receita carregada:', recipe)
      console.log('Ingredientes convertidos:', convertedIngredients)
      // Separar yield em quantidade e gramatura se houver yieldWeight no recipe
      const yieldStr = recipe.yield.toString()
      const yieldQuantity = recipe.yieldQuantity?.toString() || yieldStr
      const yieldWeight = recipe.yieldWeight?.toString() || ''
      
      setFormState({
        name: recipe.name,
        yield: yieldStr,
        yieldQuantity: yieldQuantity,
        yieldWeight: yieldWeight,
        prepTime: recipe.prepTime.toString(),
        contributionMargin: recipe.contributionMargin ? (recipe.contributionMargin * 100).toFixed(1) : '45.0',
        includeInBudget: recipe.includeInBudget !== false,
        recipeIngredients: convertedIngredients
      })
      setConfirmedIngredients(convertedIngredients)
      setEditingIngredients([])
      // Expandir modal se houver ingredientes
      if (convertedIngredients.length > 0) {
        setIsModalExpanded(true)
      }
    } else {
      setEditingId(null)
      // Tentar carregar rascunho, se não houver, usar valores padrão
      const hasDraft = loadDraft()
      if (!hasDraft) {
        setFormState({
          name: '',
          yield: '',
          yieldQuantity: '',
          yieldWeight: '',
          prepTime: '',
          contributionMargin: '45.0',
          includeInBudget: true,
          recipeIngredients: []
        })
        setConfirmedIngredients([])
        setEditingIngredients([])
      }
    }
    setIsModalOpen(true)
  }

  // Abrir modal automaticamente se vier navegação do simulador
  useEffect(() => {
    const editRecipeId = location.state?.editRecipeId
    if (editRecipeId && !isModalOpen) {
      const recipe = recipes.find((r) => r.id === editRecipeId)
      if (recipe) {
        setEditingId(recipe.id)
        // Converter ingredientes do formato do backend para o formato do formulário
        const convertedIngredients = (recipe.ingredients || []).map((ing) => {
          // Calcular totalValue baseado no unitCost e quantity
          const quantity = Number(ing.quantity) || 0
          const unitCost = Number(ing.unitCost) || 0
          const totalValue = quantity > 0 && unitCost > 0 ? (unitCost * quantity).toFixed(2) : (ing.totalValue?.toString() || '0')
          
          return {
            emoji: ing.emoji || '📦',
            name: ing.name || '',
            packageQty: (ing.packageQty?.toString() || ''),
            totalValue: ing.totalValue?.toString() || totalValue,
            quantity: quantity > 0 ? quantity.toString() : ''
          }
        })
        // Separar yield em quantidade e gramatura se houver yieldWeight no recipe
        const yieldStr = recipe.yield.toString()
        const yieldQuantity = recipe.yieldQuantity?.toString() || yieldStr
        const yieldWeight = recipe.yieldWeight?.toString() || ''
        
        setFormState({
          name: recipe.name,
          yield: yieldStr,
          yieldQuantity: yieldQuantity,
          yieldWeight: yieldWeight,
          prepTime: recipe.prepTime.toString(),
          contributionMargin: recipe.contributionMargin ? (recipe.contributionMargin * 100).toFixed(1) : '45.0',
          includeInBudget: recipe.includeInBudget !== false,
          recipeIngredients: convertedIngredients
        })
        setConfirmedIngredients(convertedIngredients)
        setEditingIngredients([])
        // Expandir modal se houver ingredientes
        if (convertedIngredients.length > 0) {
          setIsModalExpanded(true)
        }
        setIsModalOpen(true)
        // Limpar o state para não abrir novamente
        window.history.replaceState({}, document.title)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.editRecipeId, recipes])

  const handleCloseModal = () => {
    // Salvar rascunho antes de fechar (apenas se não estiver editando)
    if (!editingId) {
      saveDraft()
    }
    
    setIsModalOpen(false)
    setIsModalExpanded(false)
    setEditingId(null)
    setFormErrors({})
    
    // Só limpar se não estiver salvando rascunho (ou seja, se estiver editando)
    if (editingId) {
      setFormState({
        name: '',
        yield: '',
        yieldQuantity: '',
        yieldWeight: '',
        prepTime: '',
        contributionMargin: '45.0',
        includeInBudget: true,
        recipeIngredients: []
      })
      setEditingIngredients([])
      setConfirmedIngredients([])
    }
    
    setEditingConfirmedIndex(null)
    setEditingConfirmedData(null)
    setOpenEmojiPicker(null)
    setFocusEditingIngredientIndex(null)
    
    // Se veio do simulador, voltar para lá ao cancelar
    if (location.state?.editRecipeId) {
      navigate('/simulador')
    }
  }

  // Fechar picker de emoji ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openEmojiPicker !== null && !event.target.closest('.ingredient-emoji-picker')) {
        setOpenEmojiPicker(null)
      }
    }

    if (openEmojiPicker !== null) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openEmojiPicker])

  const handleAddIngredient = () => {
    setEditingIngredients((prev) => [
      ...prev,
      { emoji: '📦', name: '', packageQty: '', totalValue: '', quantity: '' }
    ])
  }

  const handleConfirmIngredient = (index) => {
    const ingredient = editingIngredients[index]
    // Validar se o ingrediente tem nome
    if (!ingredient.name || ingredient.name.trim() === '') {
      setFormErrors((prev) => ({
        ...prev,
        ingredients: 'O nome do ingrediente é obrigatório'
      }))
      return
    }
    
    const ingredientName = ingredient.name.trim()
    const quantityUsed = Number(ingredient.quantity) || 0
    const currentPackageQty = Number(ingredient.packageQty) || 0
    const totalValue = Number(ingredient.totalValue) || 0
    
    // Verificar se o ingrediente já existe nos confirmados
    const existingConfirmed = confirmedIngredients.find(
      (ing) => ing.name && ing.name.toLowerCase() === ingredientName.toLowerCase()
    )
    
    let updatedIngredient = { ...ingredient }
    
    if (existingConfirmed) {
      // Se já existe, usar o packageQty já reduzido e manter o totalValue original
      const alreadyReducedPackageQty = Number(existingConfirmed.packageQty) || 0
      const updatedPackageQty = Math.max(0, alreadyReducedPackageQty - quantityUsed)
      updatedIngredient.packageQty = updatedPackageQty.toString()
      // Manter o totalValue original (não alterar)
      updatedIngredient.totalValue = existingConfirmed.totalValue || totalValue
    } else {
      // Se é novo, subtrair a quantidade usada do packageQty inicial
      const updatedPackageQty = Math.max(0, currentPackageQty - quantityUsed)
      updatedIngredient.packageQty = updatedPackageQty.toString()
      // Manter o totalValue original
      updatedIngredient.totalValue = totalValue.toString()
    }
    
    // Atualizar packageQty dos ingredientes já confirmados com o mesmo nome
    setConfirmedIngredients((prev) => {
      return prev.map((confirmed) => {
        if (confirmed.name && confirmed.name.toLowerCase() === ingredientName.toLowerCase()) {
          // Se já existe, subtrair a quantidade usada do packageQty
          const currentQty = Number(confirmed.packageQty) || 0
          const updatedPackageQty = Math.max(0, currentQty - quantityUsed)
          return {
            ...confirmed,
            packageQty: updatedPackageQty.toString()
            // Manter totalValue original (não alterar)
          }
        }
        return confirmed
      })
    })
    
    // Remover metadados internos de edição antes de salvar nos confirmados
    const { __fromConfirmed, __confirmedIndex, __originalConfirmed, ...cleanUpdatedIngredient } = updatedIngredient

    // Mover da lista de edição para a lista de confirmados
    setConfirmedIngredients((prev) => [...prev, cleanUpdatedIngredient])
    setEditingIngredients((prev) => prev.filter((_, i) => i !== index))
    setOpenEmojiPicker(null)
    setIsModalExpanded(true)
    // Limpar erro de ingredientes se houver
    if (formErrors.ingredients) {
      setFormErrors((prev) => ({ ...prev, ingredients: '' }))
    }
  }

  const handleUpdateIngredient = (index, field, value) => {
    setEditingIngredients((prev) => {
      const updatedIngredients = prev.map((item, i) => {
        if (i === index) {
          const updated = { ...item, [field]: value }
          
          // Se atualizou o nome, verificar se corresponde a um ingrediente cadastrado ou já consumido
          if (field === 'name') {
            const searchValue = value.toLowerCase().trim()
            
            // Primeiro, verificar se existe nos ingredientes já confirmados (consumidos)
            const consumedIngredient = confirmedIngredients.find(
              (ing) => ing.name && ing.name.toLowerCase() === searchValue
            )
            
            if (consumedIngredient) {
              // Se já foi consumido, manter o packageQty original (congelado)
              // Buscar o ingrediente cadastrado para obter o packageQty original
              const foundIngredient = ingredients.find(
                (ing) => ing.name.toLowerCase() === searchValue
              )
              
              // Manter sempre o packageQty original (não reduzir)
              const originalPackageQty = foundIngredient?.packageQty || Number(consumedIngredient.packageQty) || 0
              updated.packageQty = originalPackageQty.toString()
              updated.name = consumedIngredient.name
              
              // Manter o totalValue original do primeiro consumo (não recalcular)
              if (foundIngredient && foundIngredient.packagePrice) {
                // Usar o valor original do pacote completo
                updated.totalValue = foundIngredient.packagePrice.toFixed(2)
              } else if (consumedIngredient.totalValue) {
                // Se não encontrar, usar o totalValue do primeiro consumo
                updated.totalValue = consumedIngredient.totalValue
              }
              // Limpar a quantidade usada para que o usuário preencha o novo consumo
              updated.quantity = ''
            } else {
              // Se não foi consumido ainda, verificar se corresponde a um ingrediente cadastrado
              const foundIngredient = ingredients.find(
                (ing) => ing.name.toLowerCase() === searchValue
              )
              if (foundIngredient) {
                // Se encontrou ingrediente, preencher quantidade original do pacote
                updated.packageQty = foundIngredient.packageQty?.toString() || ''
                // Preencher valor total original do pacote
                updated.totalValue = foundIngredient.packagePrice?.toFixed(2) || ''
                // Normalizar o nome para o nome exato do ingrediente cadastrado
                updated.name = foundIngredient.name
              }
            }
            
            // Atualizar sugestões
            const suggestions = []
            // Adicionar ingredientes já consumidos
            confirmedIngredients.forEach((ing) => {
              if (ing.name && ing.name.toLowerCase().includes(searchValue) && searchValue.length > 0) {
                suggestions.push(ing.name)
              }
            })
            // Adicionar ingredientes cadastrados
            ingredients.forEach((ing) => {
              if (ing.name && ing.name.toLowerCase().includes(searchValue) && searchValue.length > 0) {
                if (!suggestions.includes(ing.name)) {
                  suggestions.push(ing.name)
                }
              }
            })
            setIngredientNameSuggestions((prev) => ({ ...prev, [index]: suggestions }))
          }
          
          // Se atualizou a quantidade original do pacote, não precisa recalcular
          
          // Se atualizou a quantidade usada, NÃO recalcular valor total
          // O valor total deve manter o valor original do pacote completo
          // Apenas validar se a quantidade é válida
          if (field === 'quantity') {
            // Não alterar totalValue - deve manter o valor original do pacote
            // A quantidade é apenas para registrar quanto será usado agora
          }
          
          return updated
        }
        return item
      })
      return updatedIngredients
    })
    // Limpar erro de ingredientes quando atualizar
    if (formErrors.ingredients) {
      setFormErrors((prev) => ({ ...prev, ingredients: '' }))
    }
  }

  const handleRemoveIngredient = (index) => {
    setEditingIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCancelEditingIngredient = (index) => {
    const ingredient = editingIngredients[index]
    if (!ingredient) return

    // Se este item veio da coluna de confirmados, ao cancelar ele deve voltar pra direita
    if (ingredient.__fromConfirmed) {
      const originalIndex =
        typeof ingredient.__confirmedIndex === 'number' && Number.isFinite(ingredient.__confirmedIndex)
          ? ingredient.__confirmedIndex
          : null

      const originalIngredient = ingredient.__originalConfirmed || ingredient
      const { __fromConfirmed, __confirmedIndex, __originalConfirmed, ...cleanOriginal } = originalIngredient || {}

      setConfirmedIngredients((prev) => {
        const next = [...prev]
        if (originalIndex !== null) {
          const safeIndex = Math.max(0, Math.min(originalIndex, next.length))
          next.splice(safeIndex, 0, cleanOriginal)
          return next
        }
        return [...prev, cleanOriginal]
      })
    }

    setEditingIngredients((prev) => prev.filter((_, i) => i !== index))
    setOpenEmojiPicker(null)
  }

  const handleEditConfirmedIngredient = (index) => {
    const ingredient = confirmedIngredients[index]
    if (!ingredient) return

    const originalIngredient = { ...ingredient }
    // Ao mover para edição, desfaz o consumo para o usuário editar em cima do pacote "cheio"
    const prevRemaining = Number(originalIngredient.packageQty) || 0
    const prevUsed = Number(originalIngredient.quantity) || 0
    const restoredPackageQty = (prevRemaining + prevUsed).toString()

    // Remove da coluna da direita...
    setConfirmedIngredients((prev) => prev.filter((_, i) => i !== index))
    // ...e envia de volta para a coluna da esquerda para edição completa
    setEditingIngredients((prev) => {
      const next = [
        ...prev,
        {
          ...originalIngredient,
          packageQty: restoredPackageQty,
          __fromConfirmed: true,
          __confirmedIndex: index,
          __originalConfirmed: originalIngredient
        }
      ]
      return next
    })

    // Garantir que não fique preso no modo "editar inline"
    setEditingConfirmedIndex(null)
    setEditingConfirmedData(null)
  }

  const handleSaveConfirmedIngredient = (index) => {
    if (!editingConfirmedData || !editingConfirmedData.name || editingConfirmedData.name.trim() === '') {
      return
    }
    setConfirmedIngredients((prev) => {
      const updated = [...prev]
      updated[index] = editingConfirmedData
      return updated
    })
    setEditingConfirmedIndex(null)
    setEditingConfirmedData(null)
  }

  const handleCancelEditConfirmed = () => {
    setEditingConfirmedIndex(null)
    setEditingConfirmedData(null)
  }

  const handleDeleteConfirmedIngredient = (index) => {
    setConfirmedIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpdateConfirmedIngredient = (field, value) => {
    setEditingConfirmedData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  // Calcular peso por porção
  const weightPerPortion = useMemo(() => {
    const quantity = Number(formState.yieldQuantity) || 0
    const weight = Number(formState.yieldWeight) || 0
    
    if (quantity > 0 && weight > 0) {
      return (weight / quantity).toFixed(0)
    }
    
    return null
  }, [formState.yieldQuantity, formState.yieldWeight])

  // Calcular custos automaticamente
  const calculatedCosts = useMemo(() => {
    // Usar yieldQuantity se disponível, senão usar yield
    const yieldValue = formState.yieldQuantity || formState.yield
    if (!yieldValue || Number(yieldValue) <= 0) {
      return { totalCost: 0, usageCost: 0, unitCost: 0, suggestedPrice: 0, suggestedProfit: 0 }
    }

    // Usar ingredientes confirmados para calcular custos
    const allIngredients = [...confirmedIngredients]

    // Custo total (valor total do pacote de cada ingrediente)
    const totalCost = allIngredients.reduce((acc, item) => {
      const totalValueStr = String(item.totalValue || '').trim()
      if (!totalValueStr) return acc
      
      const totalValue = Number(totalValueStr)
      if (isNaN(totalValue) || totalValue <= 0) return acc
      return acc + totalValue
    }, 0)

    // Custo de uso (calculado baseado na quantidade usada)
    const usageCost = allIngredients.reduce((acc, item) => {
      const packageQty = Number(item.packageQty || 0)
      const totalValue = Number(item.totalValue || 0)
      const quantityUsed = Number(item.quantity || 0)
      
      // Se não tem quantidade original ou valor total, não calcular
      if (packageQty <= 0 || totalValue <= 0 || quantityUsed <= 0) return acc
      
      // Preço por unidade (grama/ml/un) = valor total / quantidade original
      const pricePerUnit = totalValue / packageQty
      
      // Custo de uso = preço por unidade × quantidade usada
      const costOfUsage = pricePerUnit * quantityUsed
      
      return acc + costOfUsage
    }, 0)

    const yieldNum = Number(yieldValue)
    // Calcular custo unitário com mais precisão
    const unitCost = yieldNum > 0 ? usageCost / yieldNum : 0
    // Usar margem do formState ou padrão de 45%
    const marginPercent = Number(formState.contributionMargin) || 45.0
    const suggestedMargin = marginPercent / 100
    const suggestedPrice = unitCost > 0 ? unitCost / (1 - suggestedMargin) : 0
    const suggestedProfit = suggestedPrice - unitCost

    return {
      totalCost: Number(totalCost.toFixed(2)),
      usageCost: Number(usageCost.toFixed(2)),
      unitCost: Number(unitCost.toFixed(4)), // Mais precisão no custo unitário
      suggestedPrice: Number(suggestedPrice.toFixed(2)),
      suggestedProfit: Number(suggestedProfit.toFixed(2))
    }
  }, [confirmedIngredients, formState.yield, formState.yieldQuantity, formState.contributionMargin])

  // ===== Saldo global de ingrediente (considera consumo em outras receitas) =====
  const normalizeIngredientKey = (name) => String(name || '').toLowerCase().trim()

  const ingredientOriginalQtyByName = useMemo(() => {
    const map = new Map()
    for (const ing of ingredients || []) {
      const key = normalizeIngredientKey(ing?.name)
      if (!key) continue
      const qty = Number(ing?.packageQty) || 0
      map.set(key, qty)
    }
    return map
  }, [ingredients])

  // Soma o consumo por ingrediente em TODAS as receitas, exceto a receita em edição (se houver)
  const consumedInOtherRecipesByName = useMemo(() => {
    const map = new Map()
    for (const recipe of recipes || []) {
      if (editingId && recipe?.id === editingId) continue
      const recipeIngredients = recipe?.ingredients || []
      for (const ing of recipeIngredients) {
        const key = normalizeIngredientKey(ing?.name)
        if (!key) continue
        const qty = Number(ing?.quantity) || 0
        if (qty <= 0) continue
        map.set(key, (map.get(key) || 0) + qty)
      }
    }
    return map
  }, [recipes, editingId])

  // Consumo já confirmado no rascunho atual (esta receita no modal)
  const consumedInDraftByName = useMemo(() => {
    const map = new Map()
    for (const ing of confirmedIngredients || []) {
      const key = normalizeIngredientKey(ing?.name)
      if (!key) continue
      const qty = Number(ing?.quantity) || 0
      if (qty <= 0) continue
      map.set(key, (map.get(key) || 0) + qty)
    }
    return map
  }, [confirmedIngredients])

  const getOriginalPackageQty = (name, fallbackPackageQty) => {
    const key = normalizeIngredientKey(name)
    if (!key) return 0
    const fromCatalog = ingredientOriginalQtyByName.get(key)
    const fallback = Number(fallbackPackageQty) || 0
    return Number(fromCatalog ?? fallback) || 0
  }

  // Saldo global disponível (considera consumo em outras receitas; não considera o rascunho atual)
  const getGlobalSaldoQty = (name, fallbackPackageQty) => {
    const key = normalizeIngredientKey(name)
    if (!key) return 0
    const original = getOriginalPackageQty(name, fallbackPackageQty)
    const consumedOther = consumedInOtherRecipesByName.get(key) || 0
    return Math.max(0, original - consumedOther)
  }

  // Disponível para esta receita = saldo global - consumo já confirmado no rascunho atual
  const getDisponivelQty = (name, fallbackPackageQty) => {
    const key = normalizeIngredientKey(name)
    if (!key) return 0
    const saldoGlobal = getGlobalSaldoQty(name, fallbackPackageQty)
    const consumedDraft = consumedInDraftByName.get(key) || 0
    return Math.max(0, saldoGlobal - consumedDraft)
  }

  // Função para garantir que existe um warehouse padrão "Estoque"
  const ensureDefaultWarehouse = async () => {
    // Buscar do estado atual
    let defaultWarehouse = warehouses.find((w) => w.name.toLowerCase() === 'estoque')
    
    if (!defaultWarehouse) {
      defaultWarehouse = await addWarehouse({
        name: 'Estoque',
        capacity: undefined,
        capacityUnit: undefined
      })
      // Após criar, recarregar os warehouses para ter os items atualizados
      await useAppStore.getState().loadData()
      // Buscar novamente do estado atualizado
      const updatedState = useAppStore.getState()
      defaultWarehouse = updatedState.warehouses.find((w) => w.id === defaultWarehouse.id) || defaultWarehouse
    }
    
    // Garantir que items seja sempre um array
    if (!defaultWarehouse.items || !Array.isArray(defaultWarehouse.items)) {
      defaultWarehouse.items = []
    }
    
    return defaultWarehouse
  }

  // Função para adicionar ingredientes de uma receita existente ao estoque
  // Usa os dados dos ingredientes cadastrados (packageQty, packagePrice, etc.)
  const addRecipeIngredientsToStock = async (recipe) => {
    try {
      if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
        alert('Esta receita não possui ingredientes cadastrados.')
        return
      }

      // Garantir que existe um armazém "Estoque"
      const defaultWarehouse = await ensureDefaultWarehouse()
      
      if (!defaultWarehouse) {
        console.error('Erro: Não foi possível criar ou obter o armazém padrão')
        alert('Erro ao acessar o estoque. Tente novamente.')
        return
      }
      
      // Buscar warehouse atualizado do estado e garantir que items seja um array
      const currentState = useAppStore.getState()
      const warehouseWithItems = currentState.warehouses.find((w) => w.id === defaultWarehouse.id)
      
      // Garantir que items seja sempre um array válido
      let items = []
      if (warehouseWithItems?.items && Array.isArray(warehouseWithItems.items)) {
        items = warehouseWithItems.items
      } else if (defaultWarehouse.items && Array.isArray(defaultWarehouse.items)) {
        items = defaultWarehouse.items
      }
      
      let addedCount = 0
      let updatedCount = 0
      
      for (const recipeIngredient of recipe.ingredients) {
        // recipe.ingredients vem do backend no formato: { ...ingredient, quantity, unit }
        const ingredient = recipeIngredient
        const name = ingredient.name?.trim()
        
        if (!name) continue
        
        // Usar packageQty do ingrediente cadastrado, ou quantity da receita como fallback
        const packageQty = ingredient.packageQty || ingredient.quantity || 0
        const quantityToAdd = Number(packageQty) || 0
        
        if (quantityToAdd <= 0) continue
        
        // Verificar se já existe um item com o mesmo nome no warehouse
        const existingItem = items.find(
          (item) => item.name.toLowerCase() === name.toLowerCase()
        )
        
        // Calcular custo unitário
        const packagePrice = Number(ingredient.packagePrice) || 0
        const unitCost = packageQty > 0 && packagePrice > 0 
          ? packagePrice / packageQty 
          : (Number(ingredient.unitCost) || 0)
        
        // Determinar unidade (usar unit da receita ou 'g' como padrão)
        const itemUnit = ingredient.unit || 'g'
        
        if (existingItem) {
          // Adicionar a quantidade à quantidade existente
          const newQuantity = existingItem.quantity + quantityToAdd
          await updateWarehouseItem(defaultWarehouse.id, existingItem.id, {
            emoji: ingredient.emoji || existingItem.emoji || '📦',
            name: name,
            quantity: newQuantity,
            unit: itemUnit,
            minIdeal: existingItem.minIdeal || 0,
            unitCost: unitCost || existingItem.unitCost || 0,
            category: ingredient.category || existingItem.category,
            notes: existingItem.notes
          })
          updatedCount++
        } else {
          // Criar novo item no estoque
          await addWarehouseItem(defaultWarehouse.id, {
            emoji: ingredient.emoji || '📦',
            name: name,
            quantity: quantityToAdd,
            unit: itemUnit,
            minIdeal: 0,
            unitCost: unitCost,
            category: ingredient.category,
            notes: undefined
          })
          addedCount++
        }
      }
      
      const message = addedCount > 0 || updatedCount > 0
        ? `Ingredientes adicionados ao estoque: ${addedCount} novos, ${updatedCount} atualizados.`
        : 'Nenhum ingrediente foi adicionado ao estoque.'
      
      alert(message)
      console.log('Ingredientes da receita adicionados ao estoque:', { addedCount, updatedCount })
    } catch (error) {
      console.error('Erro ao adicionar ingredientes da receita ao estoque:', error)
      alert(`Erro ao adicionar ingredientes ao estoque: ${error.message || 'Tente novamente.'}`)
    }
  }

  // Função para adicionar ingredientes da receita ao estoque automaticamente
  // Adiciona a quantidade total do pacote ao estoque
  const addIngredientsToStock = async (recipeIngredients) => {
    try {
      // Garantir que existe um armazém "Estoque"
      const defaultWarehouse = await ensureDefaultWarehouse()
      
      if (!defaultWarehouse) {
        console.error('Erro: Não foi possível criar ou obter o armazém padrão')
        return
      }
      
      // Buscar warehouse atualizado do estado para ter os items mais recentes
      const currentState = useAppStore.getState()
      const warehouseWithItems = currentState.warehouses.find((w) => w.id === defaultWarehouse.id)
      
      // Garantir que items seja sempre um array válido
      let items = []
      if (warehouseWithItems?.items && Array.isArray(warehouseWithItems.items)) {
        items = warehouseWithItems.items
      } else if (defaultWarehouse.items && Array.isArray(defaultWarehouse.items)) {
        items = defaultWarehouse.items
      }
      
      for (const ingredient of recipeIngredients) {
        const { emoji, name, packageQty, totalValue } = ingredient
        
        // Buscar ingrediente cadastrado para obter unidade e outras informações
        const foundIngredient = ingredients.find(
          (ing) => ing.name.toLowerCase() === name.toLowerCase().trim()
        )
        
        // Usar quantidade do pacote, ou quantidade usada se não houver pacote
        const quantityToAdd = packageQty && Number(packageQty) > 0 
          ? Number(packageQty) 
          : (Number(ingredient.quantity) || 0)
        
        // Se não houver quantidade, pular
        if (quantityToAdd <= 0) {
          continue
        }
        
        // Verificar se já existe um item com o mesmo nome no warehouse
        const existingItem = items.find(
          (item) => item.name.toLowerCase() === name.toLowerCase().trim()
        )
        
        // Calcular custo unitário baseado no pacote
        const packageQtyNum = Number(packageQty) || 0
        const totalValueNum = Number(totalValue) || 0
        const unitCost = packageQtyNum > 0 && totalValueNum > 0 
          ? totalValueNum / packageQtyNum 
          : (foundIngredient?.unitCost || (totalValueNum > 0 && quantityToAdd > 0 ? totalValueNum / quantityToAdd : 0))
        
        // Determinar unidade: usar do ingrediente cadastrado, ou do item existente, ou 'g' como padrão
        const itemUnit = foundIngredient?.packageQty ? 
          (foundIngredient.packageQty > 0 ? 'g' : 'g') : // Assumir gramas para ingredientes com packageQty
          (existingItem?.unit || 'g')
        
        if (existingItem) {
          // Adicionar a quantidade à quantidade existente
          const newQuantity = existingItem.quantity + quantityToAdd
          await updateWarehouseItem(defaultWarehouse.id, existingItem.id, {
            emoji: emoji || existingItem.emoji,
            name: name.trim(),
            quantity: newQuantity,
            unit: itemUnit,
            minIdeal: existingItem.minIdeal || 0,
            unitCost: unitCost || existingItem.unitCost || 0,
            category: existingItem.category,
            notes: existingItem.notes
          })
        } else {
          // Criar novo item no estoque
          await addWarehouseItem(defaultWarehouse.id, {
            emoji: emoji || '📦',
            name: name.trim(),
            quantity: quantityToAdd,
            unit: itemUnit,
            minIdeal: 0,
            unitCost: unitCost,
            category: foundIngredient?.category,
            notes: undefined
          })
        }
      }
      
      console.log('Ingredientes adicionados ao estoque com sucesso')
    } catch (error) {
      console.error('Erro ao adicionar ingredientes ao estoque:', error)
      // Não lançar erro para não interromper o fluxo de criação da receita
    }
  }

  const handleSubmit = async () => {
    // Usar yieldQuantity se disponível, senão usar yield
    const yieldValue = formState.yieldQuantity || formState.yield
    const yieldNum = Number(yieldValue)
    const prepTimeNum = Number(formState.prepTime)
    const errors = {}

    // Validações
    if (!formState.name.trim()) {
      errors.name = 'Nome da receita é obrigatório'
    }

    if (!yieldValue || Number.isNaN(yieldNum) || yieldNum <= 0) {
      errors.yield = 'Quantidade de rendimento deve ser um número maior que zero'
    }

    if (!formState.prepTime || Number.isNaN(prepTimeNum) || prepTimeNum <= 0) {
      errors.prepTime = 'Tempo de preparo deve ser um número maior que zero'
    }

    if (confirmedIngredients.length === 0) {
      errors.ingredients = 'Adicione pelo menos um ingrediente'
    }

    // Validar ingredientes
    const invalidIngredients = confirmedIngredients.filter(
      (ing) => {
        const nameValid = ing.name?.trim()
        const totalValueStr = String(ing.totalValue || '').trim()
        const totalValue = totalValueStr ? Number(totalValueStr) : 0
        return !nameValid || !totalValueStr || isNaN(totalValue) || totalValue <= 0
      }
    )

    if (invalidIngredients.length > 0) {
      errors.ingredients = `Preencha todos os ingredientes com nome e valor total válidos (${invalidIngredients.length} inválido${invalidIngredients.length > 1 ? 's' : ''})`
    }

    // Validar custo
    if (calculatedCosts.totalCost <= 0) {
      errors.cost = 'O custo total deve ser maior que zero'
    }

    setFormErrors(errors)

    // Se houver erros, não submeter e mostrar feedback
    if (Object.keys(errors).length > 0) {
      console.log('Erros de validação:', errors)
      // Scroll para o primeiro erro
      const firstErrorField = Object.keys(errors)[0]
      const errorElement = document.querySelector(`.input-error, .error-message`)
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      // Mostrar alerta se houver erro de ingredientes
      if (errors.ingredients) {
        alert(errors.ingredients)
      }
      return
    }

    // Preparar dados dos ingredientes
    const ingredientsData = confirmedIngredients.map((ing) => ({
      emoji: ing.emoji || '📦',
      name: ing.name.trim(),
      packageQty: Number(ing.packageQty) || undefined,
      totalValue: Number(ing.totalValue) || 0,
      quantity: Number(ing.quantity) || 0
    }))

    // Converter margem de percentual para decimal
    const marginPercent = Number(formState.contributionMargin) || 45.0
    const contributionMargin = marginPercent / 100

    // Usar sempre o custo total (não mais receita rápida)
    const finalTotalCost = calculatedCosts.totalCost

    const recipeData = {
      name: formState.name.trim(),
      yield: yieldNum,
      yieldQuantity: formState.yieldQuantity ? Number(formState.yieldQuantity) : undefined,
      yieldWeight: formState.yieldWeight ? Number(formState.yieldWeight) : undefined,
      prepTime: prepTimeNum,
      totalCost: finalTotalCost,
      unitCost: calculatedCosts.unitCost,
      contributionMargin: contributionMargin,
      includeInBudget: formState.includeInBudget !== undefined ? formState.includeInBudget : true,
      ingredients: ingredientsData
    }

    try {
      console.log('Salvando receita com dados:', recipeData)
      console.log('Ingredientes confirmados:', confirmedIngredients)
      
      if (editingId) {
        await updateRecipe(editingId, recipeData)
        console.log('Receita atualizada:', recipeData)
      } else {
        const newRecipe = {
          id: crypto.randomUUID(),
          ...recipeData
        }
        await addRecipe(newRecipe)
        console.log('Receita adicionada:', newRecipe)
        
        // Adicionar ingredientes ao estoque automaticamente ao criar nova receita
        await addIngredientsToStock(confirmedIngredients)
      }

      // Limpar rascunho ao salvar com sucesso
      clearDraft()
      
      // Limpar erros e fechar modal
      setFormErrors({})
      handleCloseModal()
      
      // Mostrar feedback de sucesso
      const message = editingId 
        ? 'Receita atualizada com sucesso!' 
        : quickRecipe 
          ? 'Receita rápida adicionada com sucesso! (custo de uso aplicado)'
          : 'Receita adicionada com sucesso! Ingredientes adicionados ao estoque.'
      alert(message)
    } catch (error) {
      console.error('Erro ao salvar receita:', error)
      setFormErrors({ submit: 'Erro ao salvar receita. Tente novamente.' })
      alert(`Erro ao salvar receita: ${error.message || 'Verifique o console para mais detalhes.'}`)
    }
  }

  const getMarginColor = (margin) => {
    if (margin >= 0.4) return 'var(--success)'
    if (margin >= 0.25) return 'var(--warning)'
    return 'var(--error)'
  }

  const handleDeleteRecipe = async (recipeId, recipeName) => {
    if (window.confirm(`Tem certeza que deseja excluir a receita "${recipeName}"?`)) {
      try {
        await deleteRecipe(recipeId)
        alert('Receita excluída com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir receita:', error)
        alert(`Erro ao excluir receita: ${error.message || 'Tente novamente.'}`)
      }
    }
  }

  return (
    <div className="page cost-page">
      <div className="page-header">
        <h1>Custos</h1>
      </div>

      <section className="page-stack">
        <div className="kpi-grid">
          <div className="kpi-card kpi-card-primary">
            <div className="kpi-label">Custo unitário médio</div>
            <div className="kpi-value">R$ {kpis.unitAverage.toFixed(2)}</div>
            <div className="kpi-subtitle">Por unidade produzida</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Margem média / Lucro por unidade</div>
            <div className="kpi-value">R$ {kpis.averageProfitPerUnit.toFixed(2)}</div>
            <div className="kpi-subtitle">{(kpis.averageMargin * 100).toFixed(1)}% de margem</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Total investido até agora</div>
            <div className="kpi-value">R$ {kpis.totalInvested.toFixed(2)}</div>
            <div className="kpi-subtitle">Em todas as receitas</div>
          </div>
        </div>
      </section>

      <section className="page-stack">
        <div className="page-header">
          <h2>Custos por ficha técnica</h2>
          <button className="primary-btn" type="button" onClick={() => handleOpenModal()}>
            Adicionar
          </button>
        </div>
        {recipes.length === 0 ? (
          <div className="empty-state">Cadastre receitas para visualizar os custos.</div>
        ) : (
          <div className="recipes-table-container">
            <table className="recipes-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>Orçamento</th>
                  <th>Nome</th>
                  <th>Custo unitário</th>
                  <th>Rendimento</th>
                  <th>Margem %</th>
                  <th>Lucro</th>
                  <th>Preço de Venda</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe) => {
                  const marginPercent = (recipe.contributionMargin * 100).toFixed(1)
                  // Calcular lucro: custo unitário × margem
                  const profit = recipe.unitCost * recipe.contributionMargin
                  // Calcular preço de venda: lucro + custo unitário (ou custo / (1 - margem))
                  const sellingPrice = recipe.unitCost + profit
                  return (
                    <tr key={recipe.id}>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '1rem 0.5rem' }}>
                        <ToggleSwitch
                          checked={recipe.includeInBudget !== false}
                          onChange={async (e) => {
                            const newValue = e.target.checked
                            try {
                              await api.updateRecipeBudget(recipe.id, newValue)
                              // Atualizar no store localmente
                              updateRecipe(recipe.id, { includeInBudget: newValue })
                            } catch (error) {
                              console.error('Erro ao atualizar includeInBudget:', error)
                              alert('Erro ao atualizar. Tente novamente.')
                            }
                          }}
                        />
                      </td>
                      <td className="recipe-name">{recipe.name}</td>
                      <td className="recipe-cost">R$ {recipe.unitCost.toFixed(2)}</td>
                      <td className="recipe-yield">
                        {recipe.yieldQuantity || recipe.yield} {recipe.yieldWeight ? `(${recipe.yieldWeight}g)` : 'un.'}
                      </td>
                      <td>
                        <span
                          className="margin-badge"
                          style={{ color: getMarginColor(recipe.contributionMargin) }}
                        >
                          {marginPercent}%
                        </span>
                      </td>
                      <td className="recipe-profit">{profit.toFixed(2)}</td>
                      <td className="recipe-price">R$ {sellingPrice.toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() => handleOpenModal(recipe)}
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <FormModal
        isOpen={isModalOpen}
        isExpanded={isModalExpanded}
        title={editingId ? 'Editar receita' : 'Adicionar receita'}
        description={
          editingId
            ? 'Atualize as informações da receita.'
            : 'Cadastre uma nova receita adicionando ingredientes e quantidades.'
        }
        onClose={handleCloseModal}
        footer={
          <>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
                      handleDeleteRecipe(editingId, formState.name)
                      handleCloseModal()
                    }
                  }}
                  title="Excluir receita"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--error, #dc2626)',
                    borderRadius: '0.85rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: 'var(--error, #dc2626)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--error, #dc2626)'
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--error, #dc2626)'
                  }}
                >
                  <FiTrash2 />
                  Excluir
                </button>
              )}
              <button className="ghost-btn" type="button" onClick={handleCloseModal}>
                Cancelar
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {editingId && (
                <button
                  type="button"
                  className="edit-btn cost-stock-btn"
                  onClick={() => addRecipeIngredientsToStock(editingRecipe)}
                  title="Adicionar ingredientes ao estoque"
                >
                  📦 Estoque
                </button>
              )}
              <button className="primary-btn" type="button" onClick={() => handleSubmit()}>
                {editingId ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </>
        }
      >
        <div className={`modal-content-wrapper ${isModalExpanded ? 'modal-content-expanded' : ''}`}>
          <div className="modal-form-column">
            {formErrors.submit && (
              <div className="error-message" style={{ 
                display: 'block', 
                marginBottom: '1rem', 
                padding: '0.75rem', 
                background: 'rgba(220, 38, 38, 0.1)', 
                border: '1px solid rgba(220, 38, 38, 0.3)', 
                borderRadius: '8px' 
              }}>
                {formErrors.submit}
              </div>
            )}
            <label className="input-control">
              <span>Nome da receita</span>
              <input
                type="text"
                value={formState.name}
                onChange={(event) => {
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                  if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: '' }))
                }}
                placeholder="Ex.: Bolo de Chocolate"
                className={formErrors.name ? 'input-error' : ''}
              />
              {formErrors.name && <span className="error-message">{formErrors.name}</span>}
            </label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <label className="input-control" style={{ flex: '1', minWidth: '200px' }}>
                <span>Quantidade (unidades)</span>
                <input
                  type="number"
                  value={formState.yieldQuantity}
                  onChange={(event) => {
                    const value = event.target.value
                    setFormState((prev) => ({ 
                      ...prev, 
                      yieldQuantity: value,
                      yield: value // Manter yield para compatibilidade
                    }))
                    if (formErrors.yield) setFormErrors((prev) => ({ ...prev, yield: '' }))
                  }}
                  placeholder="Ex.: 1 ou 4"
                  min="1"
                  step="1"
                  className={formErrors.yield ? 'input-error' : ''}
                />
                {formErrors.yield && <span className="error-message">{formErrors.yield}</span>}
              </label>
              <label className="input-control" style={{ flex: '1', minWidth: '200px' }}>
                <span>Gramatura total (g)</span>
                <input
                  type="number"
                  value={formState.yieldWeight}
                  onChange={(event) => {
                    setFormState((prev) => ({ ...prev, yieldWeight: event.target.value }))
                  }}
                  placeholder="Ex.: 400 ou 100"
                  min="0"
                  step="1"
                />
              </label>
            </div>
            {weightPerPortion && (
              <div style={{ 
                marginTop: '-0.5rem', 
                marginBottom: '1rem',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                fontStyle: 'italic'
              }}>
                Cada porção, unidade, fatia ou pedaço terá:{' '}
                <strong style={{ color: 'var(--primary-color)' }}>{weightPerPortion} g</strong>
              </div>
            )}
            <label className="input-control">
              <span>Tempo de preparo (minutos)</span>
              <input
                type="number"
                value={formState.prepTime}
                onChange={(event) => {
                  setFormState((prev) => ({ ...prev, prepTime: event.target.value }))
                  if (formErrors.prepTime) setFormErrors((prev) => ({ ...prev, prepTime: '' }))
                }}
                placeholder="Ex.: 45"
                min="1"
                step="1"
                className={formErrors.prepTime ? 'input-error' : ''}
              />
              {formErrors.prepTime && <span className="error-message">{formErrors.prepTime}</span>}
            </label>
            <label className="input-control">
              <span>Margem de lucro (%)</span>
              <input
                type="number"
                value={formState.contributionMargin}
                onChange={(event) => {
                  const value = event.target.value
                  setFormState((prev) => ({ ...prev, contributionMargin: value }))
                }}
                placeholder="Ex.: 45.0"
                step="0.1"
              />
              {formState.contributionMargin && (
                <div style={{ 
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span className="margin-badge" style={{ 
                    color: getMarginColor(Number(formState.contributionMargin) / 100),
                    fontSize: '0.9rem'
                  }}>
                    {Number(formState.contributionMargin).toFixed(1)}%
                  </span>
                </div>
              )}
            </label>

            <div className="ingredients-section">
              <div className="ingredients-header">
                <span className="ingredients-label">Ingredientes</span>
                <button
                  type="button"
                  className="add-ingredient-btn"
                  onClick={handleAddIngredient}
                >
                  + Adicionar ingrediente
                </button>
              </div>
              {formErrors.ingredients && (
                <span className="error-message" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  {formErrors.ingredients}
                </span>
              )}
              {formErrors.cost && (
                <span className="error-message" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  {formErrors.cost}
                </span>
              )}
              {editingIngredients.length === 0 ? (
                <div className="empty-ingredients">Adicione ingredientes para calcular os custos</div>
              ) : (
                <div className="ingredients-list">
                  {editingIngredients.map((item, index) => (
                    <div key={index} className="ingredient-item">
                      {/* Emoji picker */}
                      <div className="ingredient-emoji-wrapper">
                        <div className="ingredient-emoji-picker" style={{ position: 'relative' }}>
                          <button
                            type="button"
                            className="ingredient-emoji-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenEmojiPicker(openEmojiPicker === index ? null : index)
                            }}
                          >
                            {item.emoji || '📦'}
                          </button>
                          {openEmojiPicker === index && (
                            <div 
                              className="emoji-picker-dropdown"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="emoji-picker-grid">
                                {commonEmojis.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    className="emoji-option"
                                    onClick={() => {
                                      handleUpdateIngredient(index, 'emoji', emoji)
                                      setOpenEmojiPicker(null)
                                    }}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Linha 1: Nome do ingrediente (ocupa 2 colunas) - Combobox */}
                      <div className="ingredient-field ingredient-field--name">
                        <span className="ingredient-field-label">Ingrediente</span>
                        <div className="ingredient-field-control">
                          <input
                            type="text"
                            value={item.name || ''}
                            onChange={(e) => handleUpdateIngredient(index, 'name', e.target.value)}
                            autoFocus={focusEditingIngredientIndex === index}
                            onFocus={() => {
                              if (focusEditingIngredientIndex === index) {
                                setFocusEditingIngredientIndex(null)
                              }
                              // Mostrar sugestões ao focar
                              const searchValue = (item.name || '').toLowerCase().trim()
                              const suggestions = []
                              confirmedIngredients.forEach((ing) => {
                                if (ing.name && ing.name.toLowerCase().includes(searchValue)) {
                                  suggestions.push(ing.name)
                                }
                              })
                              ingredients.forEach((ing) => {
                                if (ing.name && ing.name.toLowerCase().includes(searchValue)) {
                                  if (!suggestions.includes(ing.name)) {
                                    suggestions.push(ing.name)
                                  }
                                }
                              })
                              setIngredientNameSuggestions((prev) => ({ ...prev, [index]: suggestions }))
                            }}
                            onBlur={() => {
                              // Esconder sugestões após um pequeno delay para permitir clique
                              setTimeout(() => {
                                setIngredientNameSuggestions((prev) => {
                                  const updated = { ...prev }
                                  delete updated[index]
                                  return updated
                                })
                              }, 200)
                            }}
                            placeholder="Nome do ingrediente"
                            className="ingredient-name"
                            list={`ingredient-suggestions-${index}`}
                          />
                          {ingredientNameSuggestions[index] && ingredientNameSuggestions[index].length > 0 && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '8px',
                                marginTop: '0.25rem',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                zIndex: 1000,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                              }}
                            >
                              {ingredientNameSuggestions[index].map((suggestion, sugIndex) => (
                                <div
                                  key={sugIndex}
                                  onClick={() => {
                                    // Forçar atualização completa do ingrediente ao selecionar da lista
                                    const consumedIngredient = confirmedIngredients.find(
                                      (ing) => ing.name && ing.name.toLowerCase() === suggestion.toLowerCase()
                                    )

                                    // Atualizar nome primeiro
                                    handleUpdateIngredient(index, 'name', suggestion)

                                    if (consumedIngredient) {
                                      // Se já foi consumido, manter packageQty original (congelado)
                                      const foundIngredient = ingredients.find(
                                        (ing) => ing.name.toLowerCase() === suggestion.toLowerCase()
                                      )

                                      // Manter sempre o packageQty original
                                      const originalPackageQty =
                                        foundIngredient?.packageQty || Number(consumedIngredient.packageQty) || 0

                                      // Aguardar um momento para garantir que o estado foi atualizado
                                      setTimeout(() => {
                                        handleUpdateIngredient(index, 'packageQty', originalPackageQty.toString())
                                      }, 10)
                                    }

                                    setIngredientNameSuggestions((prev) => {
                                      const updated = { ...prev }
                                      delete updated[index]
                                      return updated
                                    })
                                  }}
                                  style={{
                                    padding: '0.75rem 1rem',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid var(--border-primary)',
                                    transition: 'background 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = 'var(--bg-secondary)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent'
                                  }}
                                >
                                  {suggestion}
                                  {confirmedIngredients.some((ing) => ing.name === suggestion) && (
                                    <span
                                      style={{
                                        marginLeft: '0.5rem',
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        fontStyle: 'italic'
                                      }}
                                    >
                                      (já consumido)
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Linha 2: Qtd. original do pacote | Valor total */}
                      <div className="ingredient-fields-column">
                        <div className="ingredient-field">
                          <span className="ingredient-field-label">Pacote</span>
                          <div className="ingredient-field-control">
                            <input
                              type="number"
                              value={item.name ? getGlobalSaldoQty(item.name, item.packageQty) : ''}
                              readOnly
                              placeholder="Saldo global"
                              min="0"
                              step="0.01"
                              className="ingredient-package-qty"
                              style={{
                                cursor: 'not-allowed',
                                background: 'var(--bg-secondary)',
                                opacity: 0.8
                              }}
                              title="Saldo global do ingrediente (considera consumo em outras receitas)"
                            />
                          </div>
                        </div>
                        
                        {/* Campo para mostrar quantidade disponível usando o saldo global */}
                        {(() => {
                          if (item.name) {
                            const availableQty = getDisponivelQty(item.name, item.packageQty)
                            return (
                              <div className="ingredient-field">
                                <span className="ingredient-field-label">Disponível</span>
                                <div className="ingredient-field-control">
                                  <input
                                    type="number"
                                    value={availableQty}
                                    readOnly
                                    placeholder="Disponível"
                                    className="ingredient-available"
                                    style={{
                                      cursor: 'not-allowed',
                                      background: 'var(--bg-secondary)',
                                      opacity: 0.8,
                                      color: availableQty > 0 ? 'var(--text-primary)' : 'var(--error)',
                                      fontSize: '0.85rem',
                                      padding: '0.5rem 0.75rem'
                                    }}
                                    title="Disponível para esta receita (saldo global - consumo já confirmado aqui)"
                                  />
                                </div>
                              </div>
                            )
                          }
                          return null
                        })()}
                        
                        {/* Mg/Ml usados - alinhado abaixo de Qtd. original do pacote */}
                        <div className="ingredient-field">
                          <span className="ingredient-field-label">Usado</span>
                          <div className="ingredient-field-control">
                            <input
                              type="number"
                              value={item.quantity || ''}
                              onChange={(e) => {
                                const value = e.target.value
                                handleUpdateIngredient(index, 'quantity', value)
                              }}
                              onBlur={(e) => {
                                // Garantir que o valor seja válido ao sair do campo
                                const value = e.target.value
                                if (value && (isNaN(Number(value)) || Number(value) < 0)) {
                                  handleUpdateIngredient(index, 'quantity', '')
                                }
                                // NÃO recalcular valor total - deve manter o valor original do pacote
                              }}
                              placeholder="Mg/Ml usados"
                              min="0"
                              step="0.01"
                              className="ingredient-quantity"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="ingredient-field ingredient-field--value">
                        <span className="ingredient-field-label">Valor</span>
                        <div className="ingredient-field-control">
                          <input
                            type="number"
                            value={item.totalValue || ''}
                            readOnly
                            placeholder="Valor total (R$)"
                            min="0"
                            step="0.01"
                            className="ingredient-value"
                            style={{
                              cursor: 'not-allowed',
                              background: 'var(--bg-secondary)',
                              opacity: 0.8
                            }}
                            title="Valor total do pacote (não editável)"
                          />
                        </div>
                      </div>
                      
                      <div className="ingredient-action-buttons">
                        <button
                          type="button"
                          className="cancel-ingredient-btn"
                          onClick={() => handleCancelEditingIngredient(index)}
                          title="Cancelar adição"
                        >
                          ✕
                        </button>
                        <button
                          type="button"
                          className="confirm-ingredient-btn"
                          onClick={() => handleConfirmIngredient(index)}
                          title="Confirmar ingrediente"
                        >
                          ✓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {isModalExpanded && (
            <div className="modal-ingredients-column">
              <div className="ingredients-list-view">
                <h3>Ingredientes Adicionados</h3>
                {confirmedIngredients.length === 0 ? (
                  <div className="empty-ingredients">Nenhum ingrediente adicionado</div>
                ) : (
                  <div className="ingredients-list-display">
                    {confirmedIngredients.map((item, index) => (
                      <div key={index} className="ingredient-display-item">
                        {editingConfirmedIndex === index ? (
                          // Modo de edição
                          <div className="ingredient-edit-form">
                            <input
                              type="text"
                              value={editingConfirmedData?.name || ''}
                              onChange={(e) => handleUpdateConfirmedIngredient('name', e.target.value)}
                              placeholder="Nome do ingrediente"
                              className="ingredient-edit-input"
                            />
                            <input
                              type="number"
                              value={editingConfirmedData?.packageQty || ''}
                              onChange={(e) => handleUpdateConfirmedIngredient('packageQty', e.target.value)}
                              placeholder="Qtd. pacote"
                              className="ingredient-edit-input"
                              min="0"
                              step="0.01"
                            />
                            <input
                              type="number"
                              value={editingConfirmedData?.quantity || ''}
                              onChange={(e) => handleUpdateConfirmedIngredient('quantity', e.target.value)}
                              placeholder="Qtd. usada"
                              className="ingredient-edit-input"
                              min="0"
                              step="0.01"
                            />
                            <input
                              type="number"
                              value={editingConfirmedData?.totalValue || ''}
                              onChange={(e) => handleUpdateConfirmedIngredient('totalValue', e.target.value)}
                              placeholder="Valor total"
                              className="ingredient-edit-input"
                              min="0"
                              step="0.01"
                            />
                            <div className="ingredient-edit-actions">
                              <button
                                type="button"
                                className="ingredient-save-btn"
                                onClick={() => handleSaveConfirmedIngredient(index)}
                                title="Salvar"
                              >
                                <FiCheck />
                              </button>
                              <button
                                type="button"
                                className="ingredient-cancel-btn"
                                onClick={handleCancelEditConfirmed}
                                title="Cancelar"
                              >
                                <FiX />
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Modo de visualização
                          <>
                            <span className="ingredient-emoji-display">{item.emoji || '📦'}</span>
                            <div className="ingredient-info">
                              <div className="ingredient-name-display">{item.name || 'Sem nome'}</div>
                              <div className="ingredient-details">
                                {item.packageQty && <span>Pacote: {item.packageQty}</span>}
                                {item.quantity && <span>Qtd: {item.quantity}</span>}
                                {item.totalValue && <span>Valor: R$ {Number(item.totalValue).toFixed(2)}</span>}
                              </div>
                            </div>
                            <div className="ingredient-display-actions">
                              <button
                                type="button"
                                className="ingredient-edit-btn"
                                onClick={() => handleEditConfirmedIngredient(index)}
                                title="Editar"
                              >
                                <FiEdit2 />
                              </button>
                              <button
                                type="button"
                                className="ingredient-delete-btn"
                                onClick={() => handleDeleteConfirmedIngredient(index)}
                                title="Excluir"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {calculatedCosts.totalCost > 0 && (
                <div className="cost-summary">
                  <h4>Resumo automático</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="summary-label">Custo Total em Produtos</span>
                      <span className="summary-value">R$ {calculatedCosts.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Custo de Uso</span>
                      <span className="summary-value">R$ {calculatedCosts.usageCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </FormModal>
    </div>
  )
}
