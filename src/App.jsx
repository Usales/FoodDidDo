import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './components/AuthProvider'
import { ThemeProvider } from './contexts/ThemeContext'
import Login from './components/Login'
import Register from './components/Register'
import AuthScreen from './components/AuthScreen'
import ThemeToggle from './components/ThemeToggle'
import { supabase } from './lib/supabase'
import './styles/themes.css'
import './App.css'

function App() {
  const { user, login, logout, isAuthenticated } = useAuth()
  const [activeNav, setActiveNav] = useState('home')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    calories: '',
    ingredients: '',
    time: '',
    status: 'fazer'
  })
  
  const [meals, setMeals] = useState([])

  // Carregar refeições do usuário quando ele fizer login
  useEffect(() => {
    const loadUserMeals = async () => {
      if (user?.id) {
        console.log('Carregando refeições para usuário:', user.id)
        try {
          // SISTEMA HÍBRIDO: Tentar Supabase primeiro, fallback para localStorage
          console.log('Tentando carregar do Supabase...')
          
          const { data, error } = await supabase
            .from('meals')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Erro ao carregar do Supabase:', error)
            throw error
          }

          console.log('✅ Carregado do Supabase com sucesso!')
          setMeals(data || [])
          
        } catch (supabaseError) {
          console.log('⚠️ Supabase falhou, carregando do localStorage...')
          
          // Fallback: carregar do localStorage
          const savedMeals = JSON.parse(localStorage.getItem('fooddiddo_meals') || '[]')
          const userMeals = savedMeals.filter(meal => meal.user_id === user.id)
          console.log('Refeições carregadas do localStorage:', userMeals)
          setMeals(userMeals)
        }
      } else {
        console.log('Usuário não logado, limpando refeições')
        setMeals([])
      }
    }

    loadUserMeals()
  }, [user?.id])

  const handleSaveMeal = async () => {
    console.log('🔍 handleSaveMeal chamado:', { formData, userId: user?.id, editingId })
    
    if (!formData.title.trim() || !user?.id) {
      console.log('❌ Dados inválidos:', { title: formData.title, userId: user?.id })
      return
    }
    
    try {
      if (editingId) {
        // Editar refeição existente - APENAS LOCALSTORAGE
        console.log('✏️ Editando refeição no localStorage...')
        
        const savedMeals = JSON.parse(localStorage.getItem('fooddiddo_meals') || '[]')
        const updatedMeals = savedMeals.map(meal => 
          meal.id === editingId 
            ? { 
                ...meal, 
                title: formData.title,
                calories: formData.calories,
                ingredients: formData.ingredients,
                time: formData.time,
                status: formData.status,
                updated_at: new Date().toISOString()
              }
            : meal
        )
        localStorage.setItem('fooddiddo_meals', JSON.stringify(updatedMeals))

        setMeals(meals.map(meal => 
          meal.id === editingId 
            ? { ...meal, ...formData, updated_at: new Date().toISOString() }
            : meal
        ))
        setEditingId(null)
        alert('✅ Refeição editada com sucesso!')
      } else {
        // Adicionar nova refeição - APENAS LOCALSTORAGE
        console.log('💾 Salvando refeição no localStorage...')
        
        const newMeal = {
          id: Date.now().toString(),
          user_id: user.id,
          title: formData.title,
          calories: formData.calories,
          ingredients: formData.ingredients,
          time: formData.time,
          status: formData.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const savedMeals = JSON.parse(localStorage.getItem('fooddiddo_meals') || '[]')
        savedMeals.unshift(newMeal)
        localStorage.setItem('fooddiddo_meals', JSON.stringify(savedMeals))
        
        setMeals([newMeal, ...meals])
        alert('✅ Refeição salva com sucesso!')
      }
      
      setFormData({
        title: '',
        calories: '',
        ingredients: '',
        time: '',
        status: 'fazer'
      })
      setShowForm(false)
    } catch (error) {
      console.error('Erro ao salvar refeição:', error)
      alert('❌ Erro ao salvar refeição!')
    }
  }

  const handleEditMeal = (meal) => {
    setFormData({
      title: meal.title,
      calories: meal.calories,
      ingredients: meal.ingredients,
      time: meal.time,
      status: meal.status
    })
    setEditingId(meal.id)
    setShowForm(true)
  }

  const handleDeleteMeal = async (id) => {
    if (!user?.id) return

    console.log('🗑️ Deletando refeição do localStorage...')
    
    // Deletar do localStorage
    const savedMeals = JSON.parse(localStorage.getItem('fooddiddo_meals') || '[]')
    const updatedMeals = savedMeals.filter(meal => meal.id !== id)
    localStorage.setItem('fooddiddo_meals', JSON.stringify(updatedMeals))

    // Atualizar estado local
    setMeals(meals.filter(meal => meal.id !== id))
    alert('✅ Refeição deletada com sucesso!')
  }

  // Funções de autenticação
  const handleLogin = (userData) => {
    login(userData)
    setShowLogin(false)
  }

  const handleRegister = (userData) => {
    login(userData)
    setShowRegister(false)
  }

  const handleShowLogin = () => {
    setShowLogin(true)
    setShowRegister(false)
  }

  const handleShowRegister = () => {
    setShowRegister(true)
    setShowLogin(false)
  }

  const handleLogout = async () => {
    console.log('🚪 Iniciando logout...')
    await logout()
    setMeals([]) // Limpar refeições
    setActiveNav('home') // Voltar para home
    setSidebarOpen(false) // Fechar sidebar
    console.log('✅ Logout concluído')
  }

  // Funções para controlar o menu hambúrguer
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const handleNavClick = (nav) => {
    setActiveNav(nav)
    setSidebarOpen(false) // Fechar sidebar após clicar em um item
  }

  // Estados para a geladeira
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIngredients, setSelectedIngredients] = useState([])
  
  // Lista de ingredientes com emojis
  const ingredients = [
    { id: 1, name: 'Milho', emoji: '🌽' },
    { id: 2, name: 'Tomate', emoji: '🍅' },
    { id: 3, name: 'Cenoura', emoji: '🥕' },
    { id: 4, name: 'Brócolis', emoji: '🥦' },
    { id: 5, name: 'Batata', emoji: '🥔' },
    { id: 6, name: 'Cebola', emoji: '🧅' },
    { id: 7, name: 'Alho', emoji: '🧄' },
    { id: 8, name: 'Pimentão', emoji: '🫑' },
    { id: 9, name: 'Pepino', emoji: '🥒' },
    { id: 10, name: 'Alface', emoji: '🥬' },
    { id: 11, name: 'Espinafre', emoji: '🍃' },
    { id: 12, name: 'Cogumelo', emoji: '🍄' },
    { id: 13, name: 'Berinjela', emoji: '🍆' },
    { id: 14, name: 'Abobrinha', emoji: '🥒' },
    { id: 15, name: 'Abacate', emoji: '🥑' },
    { id: 16, name: 'Limão', emoji: '🍋' },
    { id: 17, name: 'Laranja', emoji: '🍊' },
    { id: 18, name: 'Maçã', emoji: '🍎' },
    { id: 19, name: 'Banana', emoji: '🍌' },
    { id: 20, name: 'Morango', emoji: '🍓' },
    { id: 21, name: 'Uva', emoji: '🍇' },
    { id: 22, name: 'Melancia', emoji: '🍉' },
    { id: 23, name: 'Abacaxi', emoji: '🍍' },
    { id: 24, name: 'Manga', emoji: '🥭' },
    { id: 25, name: 'Pêssego', emoji: '🍑' },
    { id: 26, name: 'Frango', emoji: '🍗' },
    { id: 27, name: 'Carne Bovina', emoji: '🥩' },
    { id: 28, name: 'Peixe', emoji: '🐟' },
    { id: 29, name: 'Camarão', emoji: '🦐' },
    { id: 30, name: 'Ovo', emoji: '🥚' },
    { id: 31, name: 'Leite', emoji: '🥛' },
    { id: 32, name: 'Queijo', emoji: '🧀' },
    { id: 33, name: 'Iogurte', emoji: '🥛' },
    { id: 34, name: 'Manteiga', emoji: '🧈' },
    { id: 35, name: 'Pão', emoji: '🍞' },
    { id: 36, name: 'Arroz', emoji: '🍚' },
    { id: 37, name: 'Macarrão', emoji: '🍝' },
    { id: 38, name: 'Feijão', emoji: '🫘' },
    { id: 39, name: 'Lentilha', emoji: '🫘' },
    { id: 40, name: 'Quinoa', emoji: '🌾' },
    { id: 41, name: 'Aveia', emoji: '🌾' },
    { id: 42, name: 'Azeite', emoji: '🫒' },
    { id: 43, name: 'Sal', emoji: '🧂' },
    { id: 44, name: 'Açúcar', emoji: '🍯' },
    { id: 45, name: 'Mel', emoji: '🍯' },
    { id: 46, name: 'Canela', emoji: '🥢' },
    { id: 47, name: 'Pimenta', emoji: '🌶️' },
    { id: 48, name: 'Oregano', emoji: '🌿' },
    { id: 49, name: 'Manjericão', emoji: '🌿' },
    { id: 50, name: 'Salsa', emoji: '🌿' },
    // Carnes e Proteínas
    { id: 51, name: 'Porco', emoji: '🥓' },
    { id: 52, name: 'Cordeiro', emoji: '🐑' },
    { id: 53, name: 'Presunto', emoji: '🍖' },
    { id: 54, name: 'Bacon', emoji: '🥓' },
    { id: 55, name: 'Salsicha', emoji: '🌭' },
    { id: 56, name: 'Linguiça', emoji: '🌭' },
    { id: 57, name: 'Tofu', emoji: '🧀' },
    
    // Frutos do Mar
    { id: 59, name: 'Peixe', emoji: '🐟' },
    { id: 63, name: 'Lula', emoji: '🦑' },
    { id: 64, name: 'Polvo', emoji: '🐙' },
    { id: 65, name: 'Mexilhão', emoji: '🦪' },
    { id: 66, name: 'Ostra', emoji: '🦪' },
    
    // Vegetais Adicionais
    { id: 67, name: 'Rúcula', emoji: '🥬' },
    { id: 68, name: 'Agrião', emoji: '🥬' },
    { id: 69, name: 'Repolho', emoji: '🥬' },
    { id: 70, name: 'Couve', emoji: '🥬' },
    { id: 71, name: 'Couve-flor', emoji: '🥦' },
    { id: 72, name: 'Beterraba', emoji: '🥕' },
    { id: 73, name: 'Nabo', emoji: '🥕' },
    { id: 74, name: 'Rabanete', emoji: '🥕' },
    { id: 75, name: 'Aspargos', emoji: '🌿' },
    { id: 76, name: 'Aipo', emoji: '🥬' },
    { id: 77, name: 'Ervilha', emoji: '🫛' },
    { id: 78, name: 'Milho Verde', emoji: '🌽' },
    { id: 79, name: 'Tomate Cereja', emoji: '🍅' },
    { id: 80, name: 'Pepino Japonês', emoji: '🥒' },
    
    // Frutas Adicionais
    { id: 81, name: 'Kiwi', emoji: '🥝' },
    { id: 82, name: 'Pera', emoji: '🍐' },
    { id: 83, name: 'Ameixa', emoji: '🟣' },
    { id: 84, name: 'Cereja', emoji: '🍒' },
    { id: 85, name: 'Framboesa', emoji: '🫐' },
    { id: 88, name: 'Coco', emoji: '🥥' },
    { id: 91, name: 'Romã', emoji: '🍎' },
    { id: 92, name: 'Caqui', emoji: '🍅' },
    
    // Laticínios e Derivados
    { id: 93, name: 'Cream Cheese', emoji: '🧀' },
    { id: 94, name: 'Ricota', emoji: '🧀' },
    { id: 95, name: 'Mozzarella', emoji: '🧀' },
    { id: 96, name: 'Parmesão', emoji: '🧀' },
    { id: 97, name: 'Gorgonzola', emoji: '🧀' },
    { id: 98, name: 'Cheddar', emoji: '🧀' },
    { id: 99, name: 'Nata', emoji: '🥛' },
    { id: 100, name: 'Leite de Coco', emoji: '🥥' },
    
    // Grãos e Cereais
    { id: 108, name: 'Nozes', emoji: '🥜' },
    { id: 109, name: 'Amêndoas', emoji: '🥜' },
    { id: 110, name: 'Castanha', emoji: '🥜' },
    
    // Temperos e Ervas
    { id: 113, name: 'Alecrim', emoji: '🌿' },
    { id: 114, name: 'Tomilho', emoji: '🌿' },
    { id: 115, name: 'Sálvia', emoji: '🌿' },
    { id: 118, name: 'Louro', emoji: '🍃' },
    { id: 119, name: 'Gengibre', emoji: '🫚' },
    { id: 120, name: 'Alho-poró', emoji: '🧄' },
    { id: 121, name: 'Cebolinha', emoji: '🧅' },
    { id: 122, name: 'Cebola Roxa', emoji: '🧅' },
    
    
    // Legumes e Tubérculos
    { id: 141, name: 'Batata Doce', emoji: '🍠' },
    
  ]

  const handleIngredientToggle = (ingredientId) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredientId)
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    )
  }

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Estados para receitas
  const [recipes, setRecipes] = useState([])
  const [localRecipes, setLocalRecipes] = useState([])
  const [showRecipes, setShowRecipes] = useState(false)
  const [searchMode, setSearchMode] = useState('relevante') // 'estrito' ou 'relevante'

  // Estado para todas as receitas das APIs (para sidebar)
  const [allApiRecipes, setAllApiRecipes] = useState([])
  const [isLoadingAllRecipes, setIsLoadingAllRecipes] = useState(false)
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [recipesPerPage] = useState(12) // 12 receitas por página
  

  // Estados para modal de receita detalhada
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [showRecipeModal, setShowRecipeModal] = useState(false)
  const [loadingRecipeDetails, setLoadingRecipeDetails] = useState(false)
  
  // Estados para login


  // Dicionário completo de traduções inglês → português
  const translationDictionary = {
    // Ingredientes principais
    'chicken': 'frango', 'beef': 'bovina', 'pork': 'porco', 'lamb': 'cordeiro',
    'fish': 'peixe', 'salmon': 'peixe', 'tuna': 'peixe', 'cod': 'peixe',
    'shrimp': 'camarão', 'lobster': 'lagosta', 'crab': 'caranguejo',
    'egg': 'ovo', 'eggs': 'ovos', 'milk': 'leite', 'cream': 'creme',
    'cheese': 'queijo', 'butter': 'manteiga', 'yogurt': 'iogurte',
    
    // Vegetais
    'tomato': 'tomate', 'tomatoes': 'tomates', 'onion': 'cebola', 'onions': 'cebolas',
    'garlic': 'alho', 'carrot': 'cenoura', 'carrots': 'cenouras',
    'potato': 'batata', 'potatoes': 'batatas', 'sweet potato': 'batata doce',
    'bell pepper': 'pimentão', 'red pepper': 'pimenta vermelha',
    'cucumber': 'pepino', 'lettuce': 'alface', 'spinach': 'espinafre',
    'broccoli': 'brócolis', 'cauliflower': 'couve-flor', 'cabbage': 'repolho',
    'mushroom': 'cogumelo', 'mushrooms': 'cogumelos',
    'eggplant': 'berinjela', 'zucchini': 'abobrinha', 'squash': 'abóbora',
    'corn': 'milho', 'peas': 'ervilhas', 'beans': 'feijão',
    'green beans': 'vagem', 'celery': 'aipo',
    
    // Frutas
    'apple': 'maçã', 'apples': 'maçãs', 'banana': 'banana', 'bananas': 'bananas',
    'orange': 'laranja', 'oranges': 'laranjas', 'lemon': 'limão', 'lemons': 'limões',
    'lime': 'lima', 'limes': 'limas', 'lime juice': 'suco de lima',
    'strawberry': 'morango', 'strawberries': 'morangos',
    'grape': 'uva', 'grapes': 'uvas', 'watermelon': 'melancia',
    'pineapple': 'abacaxi', 'mango': 'manga', 'peach': 'pêssego',
    'avocado': 'abacate', 'coconut': 'coco',
    
    // Grãos e cereais
    'rice': 'arroz', 'pasta': 'macarrão', 'bread': 'pão', 'flour': 'farinha',
    'quinoa': 'quinoa', 'oats': 'aveia',
    'lentils': 'lentilhas', 'chickpeas': 'grão-de-bico',
    
    // Temperos e ervas
    'salt': 'sal', 'pepper': 'pimenta',
    'oregano': 'orégano', 'basil': 'manjericão', 'parsley': 'salsa',
    'thyme': 'tomilho', 'rosemary': 'alecrim',
    'bay leaves': 'folhas de louro', 'cinnamon': 'canela',
    'ginger': 'gengibre',
    'turmeric': 'açafrão',
    
    // Líquidos e óleos
    'water': 'água', 'olive oil': 'azeite de oliva', 'vegetable oil': 'óleo vegetal',
    'coconut oil': 'óleo de coco',
    'honey': 'mel', 'sugar': 'açúcar',
    'brown sugar': 'açúcar mascavo', 'vanilla': 'baunilha',
    'jam': 'geleia', 'jelly': 'geleia', 'apricot': 'damasco', 'apricot jam': 'geleia de damasco',
    
    // Medidas específicas
    'tbs': 'colher de sopa', 'tbsp': 'colher de sopa', 'tablespoon': 'colher de sopa',
    'tsp': 'colher de chá', 'teaspoon': 'colher de chá',
    'can': 'lata', 'jar': 'pote', 'bottle': 'garrafa', 'package': 'pacote',
    'spring onions': 'cebolinhas', 'green onions': 'cebolinhas', 'scallions': 'cebolinhas',
    'chopped': 'picado', 'chopped tomatoes': 'tomates picados', 'diced': 'cortado em cubos',
    'sliced': 'fatiado', 'minced': 'picado finamente', 'grated': 'ralado',
    
    // Métodos de cozimento e ações
    'heat': 'aqueça', 'boil': 'ferva', 'simmer': 'deixe ferver em fogo baixo',
    'fry': 'frite', 'sauté': 'refogue', 'bake': 'asse', 'roast': 'asse no forno',
    'grill': 'grelhe', 'steam': 'cozinhe no vapor', 'mix': 'misture',
    'stir': 'mexa', 'chop': 'pique', 'dice': 'corte em cubos',
    'slice': 'fatie', 'mince': 'pique finamente', 'crush': 'esmague',
    'season': 'tempere', 'marinate': 'marine', 'serve': 'sirva',
    'add': 'adicione', 'remove': 'retire', 'drain': 'escorra',
    'rinse': 'enxágue', 'wash': 'lave', 'peel': 'descasque',
    'cook': 'cozinhe', 'cover': 'cubra', 'soften': 'amolecer', 'tender': 'macio',
    'wilted': 'murcho', 'stirring': 'mexendo', 'mixture': 'mistura',
    'sieve': 'peneira', 'colander': 'escorredor', 'cool': 'esfriar',
    'squeeze': 'esprema', 'transfer': 'transfira', 'taste': 'gosto',
    'preheat': 'pré-aqueça', 'brush': 'pincele', 'lightly': 'levemente',
    'place': 'coloque', 'fold': 'dobre', 'seal': 'selar', 'repeat': 'repita',
    'remaining': 'restante', 'crisp': 'crocante', 'golden brown': 'dourado',
    'combine': 'combine', 'sprinkle': 'polvilhe', 'seasoning': 'tempero',
    
    // Palavras específicas que estavam faltando
    'over': 'sobre', 'well': 'bem', 'rub': 'esfregue', 'off': '',
    'excess': 'excesso', 'juice': 'suco', 'scallion': 'cebolinha',
      'pieces': 'pedaços', 'least': 'pelo menos',
      'oil': 'óleo', 'dutch': 'holandesa', 'shake': 'balance',
      'seasonings': 'temperos', 'retire': 'retire', 'each': 'cada',
      'piece': 'pedaço', 'reserve': 'reserve', 'sauce': 'molho',
      'brown': 'doure', 'few': 'alguns', 'time': 'vez', 'very': 'muito',
      'browned': 'dourado', 'rest': 'descansar',
      'you': 'você', 'return': 'retorne', 'pour': 'despeje',
    'coconut milk': 'leite de coco', 'stew': 'ensopado', 'constantly': 'constantemente',
    'turn': 'vire', 'down': 'para baixo', 'minimum': 'mínimo', 'another': 'outros',
    'until': 'até', 'soft': 'macio',
    
    // Preposições e artigos mais específicos
    'to': 'para', 'of': 'de', 'as': 'como', 'into': 'dentro',
    'under': 'sob', 'through': 'através',
    'between': 'entre', 'among': 'entre', 'during': 'durante',
    
    // Utensílios
    'pan': 'panela', 'pot': 'panela', 'skillet': 'frigideira', 'saucepan': 'panela',
    'oven': 'forno', 'microwave': 'micro-ondas', 'blender': 'liquidificador',
    'bowl': 'tigela', 'plate': 'prato',
    'baking sheet': 'assadeira', 'non-stick': 'antiaderente',
    'lid': 'tampa', 'tight-fitting lid': 'tampa bem ajustada',
    'cling film': 'filme plástico', 'saucer': 'pires',
    
    // Medidas
    'cup': 'xícara', 'cups': 'xícaras',
    'tablespoons': 'colheres de sopa',
    'teaspoons': 'colheres de chá',
    'ounce': 'onça', 'ounces': 'onças',
    'pound': 'libra', 'pounds': 'libras', 'gram': 'grama', 'grams': 'gramas',
    'kilogram': 'quilograma', 'liter': 'litro', 'liters': 'litros',
    'milliliter': 'mililitro', 'milliliters': 'mililitros',
    
    // Categorias de comida
    'appetizer': 'aperitivo', 'main course': 'prato principal', 'dessert': 'sobremesa',
    'side dish': 'acompanhamento', 'salad': 'salada', 'soup': 'sopa',
    'breakfast': 'café da manhã', 'lunch': 'almoço', 'dinner': 'jantar',
    'snack': 'lanche', 'beverage': 'bebida',
    
    // Tipos de dieta e proteínas
    'vegan': 'vegano', 'vegetarian': 'vegetariano', 'seafood': 'frutos-do-mar',
    
    // Países e regiões
    'american': 'americano', 'italian': 'italiano', 'french': 'francês',
    'chinese': 'chinês', 'japanese': 'japonês', 'mexican': 'mexicano',
    'indian': 'indiano', 'thai': 'tailandês', 'greek': 'grego',
    'spanish': 'espanhol', 'british': 'britânico', 'german': 'alemão',
    'brazilian': 'brasileiro', 'mediterranean': 'mediterrâneo',
    
    // Palavras conectivas e comuns (SEM artigos problemáticos)
    'and': 'e', 'or': 'ou', 'with': 'com', 'without': 'sem',
    'for': 'por', 'in': 'na', 'on': 'sobre', 'at': 'em',
    'then': 'então', 'next': 'em seguida', 'after': 'depois',
    'before': 'antes', 'finally': 'finalmente', 'lastly': 'por último',
    'meanwhile': 'enquanto isso', 'first': 'primeiro',
    'third': 'terceiro',
    
    // Tempos e quantidades
    'minute': 'minuto', 'minutes': 'minutos', 'hours': 'horas',
    'seconds': 'segundos', 'day': 'dia', 'days': 'dias',
    'small': 'pequeno', 'large': 'grande',
    'fresh': 'fresco', 'dried': 'seco', 'frozen': 'congelado',
    'cold': 'frio', 'warm': 'morno'
  }

  // Função para traduzir ingredientes para inglês (PT → EN)
  const translateToEnglish = (ingredientName) => {
    console.log('🔄 translateToEnglish chamada com:', ingredientName)
    const ptToEn = {
      'Milho': 'corn', 'Tomate': 'tomato', 'Cenoura': 'carrot', 'Brócolis': 'broccoli',
      'Batata': 'potato', 'Cebola': 'onion', 'Alho': 'garlic', 'Pimentão': 'bell pepper',
      'Pepino': 'cucumber', 'Alface': 'lettuce', 'Espinafre': 'spinach', 'Cogumelo': 'mushroom',
      'Berinjela': 'eggplant', 'Abobrinha': 'zucchini', 'Abacate': 'avocado', 'Limão': 'lemon',
      'Laranja': 'orange', 'Maçã': 'apple', 'Banana': 'banana', 'Morango': 'strawberry',
      'Uva': 'grape', 'Melancia': 'watermelon', 'Abacaxi': 'pineapple', 'Manga': 'mango',
      'Pêssego': 'peach', 'Frango': 'chicken', 'Carne Bovina': 'beef', 'Peixe': 'fish',
      'Camarão': 'shrimp', 'Ovo': 'egg', 'Leite': 'milk', 'Queijo': 'cheese',
      'Iogurte': 'yogurt', 'Manteiga': 'butter', 'Pão': 'bread', 'Arroz': 'rice',
      'Macarrão': 'pasta', 'Feijão': 'beans', 'Lentilha': 'lentils', 'Quinoa': 'quinoa',
      'Aveia': 'oats', 'Azeite': 'olive oil', 'Sal': 'salt', 'Açúcar': 'sugar',
      'Mel': 'honey', 'Canela': 'cinnamon', 'Pimenta': 'pepper', 'Oregano': 'oregano',
      'Manjericão': 'basil', 'Salsa': 'parsley'
    }
    return ptToEn[ingredientName] || ingredientName.toLowerCase()
  }

  // Função principal para traduzir texto do inglês para português
  const translateToPortuguese = (text) => {
    if (!text || typeof text !== 'string') {
      return text
    }
    
    let translatedText = text
    
    // Traduzir palavra por palavra, mantendo a estrutura
    Object.entries(translationDictionary).forEach(([english, portuguese]) => {
      // Usar regex para traduzir palavras completas (não partes de palavras)
      const regex = new RegExp(`\\b${english}\\b`, 'gi')
      translatedText = translatedText.replace(regex, portuguese)
    })
    
    // Limpeza AVANÇADA pós-tradução para remover problemas comuns
    translatedText = translatedText
      // Traduzir origens/áreas específicas
      .replace(/\bIrish\b/gi, 'Irlandês')
      .replace(/\bBritish\b/gi, 'Britânico')
      .replace(/\bAmerican\b/gi, 'Americano')
      .replace(/\bItalian\b/gi, 'Italiano')
      .replace(/\bFrench\b/gi, 'Francês')
      .replace(/\bSpanish\b/gi, 'Espanhol')
      .replace(/\bGerman\b/gi, 'Alemão')
      .replace(/\bChinese\b/gi, 'Chinês')
      .replace(/\bJapanese\b/gi, 'Japonês')
      .replace(/\bMexican\b/gi, 'Mexicano')
      .replace(/\bIndian\b/gi, 'Indiano')
      .replace(/\bThai\b/gi, 'Tailandês')
      .replace(/\bGreek\b/gi, 'Grego')
      .replace(/\bTurkish\b/gi, 'Turco')
      .replace(/\bMoroccan\b/gi, 'Marroquino')
      .replace(/\bLebanese\b/gi, 'Libanês')
      .replace(/\bEgyptian\b/gi, 'Egípcio')
      .replace(/\bJamaican\b/gi, 'Jamaicano')
      .replace(/\bCanadian\b/gi, 'Canadense')
      .replace(/\bAustralian\b/gi, 'Australiano')
      
      // Remover sequências problemáticas
      .replace(/o\/um\/uma/gi, 'a')
      .replace(/um\/uma/gi, 'uma')
      .replace(/o\/a/gi, 'a')
      
      // Corrigir construções específicas que ficaram mal traduzidas
      .replace(/na a/gi, 'na')
      .replace(/em a/gi, 'na')
      .replace(/para a/gi, 'para a')
      .replace(/de a/gi, 'da')
      .replace(/com a/gi, 'com a')
      .replace(/sobre a/gi, 'sobre a')
      .replace(/the /gi, '')
      .replace(/\ba\s+grande/gi, 'uma grande')
      .replace(/\ba\s+dutch/gi, 'uma panela holandesa')
      .replace(/\ba\s+few/gi, 'alguns')
      .replace(/\ba\s+time/gi, 'por vez')
      .replace(/\ba\s+prato/gi, 'um prato')
      
      // Corrigir construções específicas do texto
      .replace(/lima over/gi, 'lima sobre')
      .replace(/off excess/gi, 'o excesso de')
      .replace(/marine em least/gi, 'marine por pelo menos')
      .replace(/oil na/gi, 'óleo na')
      .replace(/shake off the/gi, 'retire os')
      .replace(/each piece of/gi, 'cada pedaço de')
      .replace(/marinade por/gi, 'marinada para o')
      .replace(/levemente brown/gi, 'doure levemente')
      .replace(/few pieces/gi, 'alguns pedaços')
      .replace(/em a time/gi, 'por vez')
      .replace(/na very/gi, 'no óleo muito')
      .replace(/browned frango/gi, 'frango dourado')
      .replace(/sobre a prato/gi, 'sobre um prato')
      .replace(/enquanto you/gi, 'enquanto você')
      .replace(/restante pieces/gi, 'pedaços restantes')
      .replace(/excess oil/gi, 'excesso de óleo')
      .replace(/return the/gi, 'retorne o')
      .replace(/pour the/gi, 'despeje a')
      .replace(/over the/gi, 'sobre o')
      .replace(/adicione the/gi, 'adicione as')
      .replace(/over médio/gi, 'em fogo médio')
      .replace(/aqueça por/gi, 'por')
      .replace(/e coco leite/gi, 'e leite de coco')
      .replace(/adicione to/gi, 'adicione ao')
      .replace(/mexendo constantly/gi, 'mexendo constantemente')
      .replace(/aqueça down to/gi, 'fogo para')
      .replace(/cozinhe another/gi, 'cozinhe por mais')
      .replace(/ou até macio/gi, 'ou até ficar macio')
      
      // Corrigir espaçamentos duplos
      .replace(/\s+/g, ' ')
      // Corrigir pontuação
      .replace(/\s+\./g, '.')
      .replace(/\s+,/g, ',')
      // Capitalizar primeira letra de frases
      .replace(/\.\s*([a-z])/g, (match, letter) => '. ' + letter.toUpperCase())
      // Capitalizar início do texto
      .replace(/^([a-z])/, (match, letter) => letter.toUpperCase())
      .trim()
    
    return translatedText
  }

  // Função para obter emoji do ingrediente
  const getIngredientEmoji = (ingredientName) => {
    const emojiMap = {
      // Mapeamento baseado na lista de ingredientes existente
      'milho': '🌽', 'corn': '🌽',
      'tomate': '🍅', 'tomato': '🍅', 'tomatoes': '🍅', 'tomates': '🍅',
      'cenoura': '🥕', 'carrot': '🥕', 'carrots': '🥕', 'cenouras': '🥕',
      'brócolis': '🥦', 'broccoli': '🥦',
      'batata': '🥔', 'potato': '🥔', 'potatoes': '🥔', 'batatas': '🥔',
      'cebola': '🧅', 'onion': '🧅', 'onions': '🧅', 'cebolas': '🧅',
      'alho': '🧄', 'garlic': '🧄',
      'pimentão': '🫑', 'bell pepper': '🫑', 'pepper': '🫑',
      'pepino': '🥒', 'cucumber': '🥒',
      'alface': '🥬', 'lettuce': '🥬',
      'espinafre': '🍃', 'spinach': '🍃',
      'cogumelo': '🍄', 'mushroom': '🍄', 'mushrooms': '🍄',
      'berinjela': '🍆', 'eggplant': '🍆',
      'abobrinha': '🥒', 'zucchini': '🥒',
      'abacate': '🥑', 'avocado': '🥑',
      'limão': '🍋', 'lemon': '🍋', 'lemons': '🍋',
      'laranja': '🍊', 'orange': '🍊', 'oranges': '🍊',
      'maçã': '🍎', 'apple': '🍎', 'apples': '🍎',
      'banana': '🍌', 'bananas': '🍌',
      'morango': '🍓', 'strawberry': '🍓', 'strawberries': '🍓',
      'uva': '🍇', 'grape': '🍇', 'grapes': '🍇',
      'melancia': '🍉', 'watermelon': '🍉',
      'abacaxi': '🍍', 'pineapple': '🍍',
      'manga': '🥭', 'mango': '🥭',
      'pêssego': '🍑', 'peach': '🍑',
      'frango': '🍗', 'chicken': '🍗', 'poultry': '🍗',
      'carne bovina': '🥩', 'beef': '🥩', 'carne': '🥩',
      'peixe': '🐟', 'fish': '🐟',
      'camarão': '🦐', 'shrimp': '🦐',
      'ovo': '🥚', 'egg': '🥚', 'eggs': '🥚', 'ovos': '🥚',
      'leite': '🥛', 'milk': '🥛',
      'queijo': '🧀', 'cheese': '🧀',
      'iogurte': '🥛', 'yogurt': '🥛',
      'manteiga': '🧈', 'butter': '🧈',
      'pão': '🍞', 'bread': '🍞',
      'arroz': '🍚', 'rice': '🍚',
      'macarrão': '🍝', 'pasta': '🍝', 'noodle': '🍝',
      'feijão': '🫘', 'beans': '🫘',
      'lentilha': '🫘', 'lentils': '🫘',
      'quinoa': '🌾', 'aveia': '🌾', 'oats': '🌾',
      'azeite': '🫒', 'olive oil': '🫒', 'oil': '🫒', 'óleo': '🫒',
      'sal': '🧂', 'salt': '🧂',
      'açúcar': '🍯', 'sugar': '🍯',
      'mel': '🍯', 'honey': '🍯',
      'canela': '🥢', 'cinnamon': '🥢',
      'pimenta': '🌶️', 'oregano': '🌿', 'manjericão': '🌿', 'basil': '🌿',
      'salsa': '🌿', 'parsley': '🌿'
    }
    
    // Buscar emoji por nome exato ou palavras contidas
    const lowerIngredient = ingredientName.toLowerCase()
    
    // Busca exata primeiro
    if (emojiMap[lowerIngredient]) {
      return emojiMap[lowerIngredient]
    }
    
    // Busca por palavras contidas
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (lowerIngredient.includes(key) || key.includes(lowerIngredient)) {
        return emoji
      }
    }
    
    // Emoji padrão se não encontrar
    return '🥕'
  }


  // ==================== SISTEMA DE TRADUÇÃO AUTOMÁTICA ====================
  
  // Cache local para traduções (localStorage)
  const getTranslationCache = () => {
    try {
      const cache = localStorage.getItem('recipeTranslations')
      return cache ? JSON.parse(cache) : {}
    } catch (error) {
      console.log('⚠️ Erro ao carregar cache de traduções:', error)
      return {}
    }
  }

  const saveTranslationCache = (cache) => {
    try {
      localStorage.setItem('recipeTranslations', JSON.stringify(cache))
    } catch (error) {
      console.log('⚠️ Erro ao salvar cache de traduções:', error)
    }
  }

  // Função para dividir texto longo em partes menores
  const splitLongText = (text, maxLength = 400) => {
    if (text.length <= maxLength) return [text]
    
    const parts = []
    let currentPart = ''
    const sentences = text.split(/[.!?]+/).filter(s => s.trim())
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim()
      if (!trimmedSentence) continue
      
      if (currentPart.length + trimmedSentence.length + 1 <= maxLength) {
        currentPart += (currentPart ? '. ' : '') + trimmedSentence
      } else {
        if (currentPart) {
          parts.push(currentPart + '.')
          currentPart = trimmedSentence
        } else {
          // Se uma única frase é muito longa, dividir por palavras
          const words = trimmedSentence.split(' ')
          let wordPart = ''
          for (const word of words) {
            if (wordPart.length + word.length + 1 <= maxLength) {
              wordPart += (wordPart ? ' ' : '') + word
            } else {
              if (wordPart) parts.push(wordPart)
              wordPart = word
            }
          }
          if (wordPart) currentPart = wordPart
        }
      }
    }
    
    if (currentPart) {
      parts.push(currentPart + (currentPart.endsWith('.') ? '' : '.'))
    }
    
    return parts
  }


  // Função para traduzir usando MyMemory API (gratuita)
  const translateWithMyMemory = async (text, fromLang = 'en', toLang = 'pt') => {
    if (!text || text.length < 3) return text
    
    // Verificar cache primeiro
    const cache = getTranslationCache()
    const cacheKey = `${text}_${fromLang}_${toLang}`
    
    if (cache[cacheKey]) {
      console.log('💾 Tradução encontrada no cache:', text.substring(0, 50) + '...')
      return cache[cacheKey]
    }
    
    try {
      // Verificar se o texto é muito longo e dividir se necessário
      const textParts = splitLongText(text, 400) // Limite menor para MyMemory
      
      if (textParts.length === 1) {
        // Texto curto - traduzir diretamente
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`
        
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          if (data.responseData && data.responseData.translatedText) {
            let translated = data.responseData.translatedText
            
            // Limpeza pós-tradução
            translated = translated
              .replace(/\s+/g, ' ')
              .replace(/\s+\./g, '.')
              .replace(/\s+,/g, ',')
              .trim()
            
            // Salvar no cache
            cache[cacheKey] = translated
            saveTranslationCache(cache)
            
            console.log(`🌍 Traduzido via MyMemory: "${text.substring(0, 50)}..." → "${translated.substring(0, 50)}..."`)
            return translated
          }
        }
      } else {
        // Texto longo - traduzir em partes
        console.log(`📝 MyMemory: Texto longo detectado, dividindo em ${textParts.length} partes`)
        
        const translatedParts = []
        for (let i = 0; i < textParts.length; i++) {
          const part = textParts[i]
          const partCacheKey = `${part}_${fromLang}_${toLang}`
          
          if (cache[partCacheKey]) {
            translatedParts.push(cache[partCacheKey])
          } else {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(part)}&langpair=${fromLang}|${toLang}`
            
            const response = await fetch(url)
            if (response.ok) {
              const data = await response.json()
              if (data.responseData && data.responseData.translatedText) {
                let translatedPart = data.responseData.translatedText
                
                translatedPart = translatedPart
                  .replace(/\s+/g, ' ')
                  .replace(/\s+\./g, '.')
                  .replace(/\s+,/g, ',')
                  .trim()
                
                cache[partCacheKey] = translatedPart
                translatedParts.push(translatedPart)
              } else {
                translatedParts.push(part)
              }
            } else {
              translatedParts.push(part)
            }
            
            // Pausa entre requisições
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
        
        const finalTranslation = translatedParts.join(' ')
        cache[cacheKey] = finalTranslation
        saveTranslationCache(cache)
        
        console.log(`✅ Tradução completa via MyMemory: ${textParts.length} partes processadas`)
        return finalTranslation
      }
    } catch (error) {
      console.log('⚠️ Erro na tradução via MyMemory:', error.message)
    }
    
    // Fallback final: tradução local
    console.log('🔄 Usando tradução local como fallback...')
    const localTranslation = translateToPortuguese(text)
    cache[cacheKey] = localTranslation
    saveTranslationCache(cache)
    
    console.log(`🌍 Traduzido via Local: "${text.substring(0, 50)}..." → "${localTranslation.substring(0, 50)}..."`)
    return localTranslation
  }

  // Função removida - tradução automática desativada

  // Função removida - tradução em lote desativada

  // ==================== FIM DO SISTEMA DE TRADUÇÃO ====================

  // Função para buscar todas as receitas das APIs e locais para a sidebar
  const fetchAllApiRecipes = async () => {
    setIsLoadingAllRecipes(true)
    
    try {
      const allRecipes = []
      
      // 1. Adicionar receitas locais
      if (localRecipes.length > 0) {
        localRecipes.forEach(recipe => {
          allRecipes.push({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image || 'https://via.placeholder.com/300x200?text=Receita',
            category: recipe.category || 'Internacional',
            area: recipe.area || 'Internacional',
            source: 'Receita Local',
            apiType: 'local'
          })
        })
      }
      
      // Remover duplicatas baseado no título
      const uniqueRecipes = allRecipes.filter((recipe, index, self) => 
        index === self.findIndex(r => r.title === recipe.title)
      )
      
      setAllApiRecipes(uniqueRecipes)
      
    } catch (error) {
      console.error('❌ Erro ao buscar receitas das APIs:', error)
    } finally {
      setIsLoadingAllRecipes(false)
    }
  }

  // Funções de paginação
  const getCurrentPageRecipes = () => {
    const startIndex = (currentPage - 1) * recipesPerPage
    const endIndex = startIndex + recipesPerPage
    return allApiRecipes.slice(startIndex, endIndex)
  }

  const getTotalPages = () => {
    return Math.ceil(allApiRecipes.length / recipesPerPage)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    // Scroll para o topo da seção de receitas
    const recipesSection = document.querySelector('.recipes-page')
    if (recipesSection) {
      recipesSection.scrollIntoView({ behavior: 'smooth' })
    }
  }


  // Função para carregar receitas locais
  const loadLocalRecipes = async () => {
    try {
      const response = await fetch('/local-recipes/recipes.json')
      if (response.ok) {
        const localRecipesData = await response.json()
        setLocalRecipes(localRecipesData)
        console.log('✅ Receitas locais carregadas:', localRecipesData.length)
        console.log('📋 Receitas locais:', localRecipesData.map(r => r.title))
        console.log('🥩 Receitas de carne bovina:', localRecipesData.filter(r => r.ingredient === 'Carne Bovina').map(r => r.title))
      } else {
        console.log('⚠️ Arquivo de receitas locais não encontrado')
        setLocalRecipes([])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar receitas locais:', error)
      setLocalRecipes([])
    }
  }

  // Carregar receitas das APIs e locais quando o componente montar
  useEffect(() => {
    loadLocalRecipes()
  }, [])

  // Recarregar receitas das APIs quando as receitas locais forem carregadas
  useEffect(() => {
    if (localRecipes.length > 0) {
      fetchAllApiRecipes()
    }
  }, [localRecipes])
  



  // Função para processar instruções do Spoonacular
  const processSpoonacularInstructions = (data) => {
    // Tentar obter instruções estruturadas primeiro
    if (data.analyzedInstructions && data.analyzedInstructions.length > 0) {
      const steps = data.analyzedInstructions[0].steps.map((step, index) => {
        const translatedStep = translateToPortuguese(step.step)
        return `PASSO ${index + 1}: ${translatedStep}`
      })
      
      return `
👨‍🍳 MODO DE PREPARO PASSO A PASSO:
${steps.join('\n')}

💡 DICAS IMPORTANTES:
💡 Siga os passos na ordem indicada
💡 Leia toda a receita antes de começar
💡 Tenha todos os ingredientes prontos antes de iniciar
      `.trim()
    }
    
    // Se não tem instruções estruturadas, processar o texto simples
    const instructions = data.instructions || data.summary || 'Instruções não disponíveis'
    
    if (instructions === 'Instruções não disponíveis') {
      return `
👨‍🍳 MODO DE PREPARO:
PASSO 1: Esta receita requer instruções detalhadas que não estão disponíveis na API.

💡 DICAS IMPORTANTES:
💡 Consulte o link da receita original para instruções completas
💡 Tenha todos os ingredientes prontos antes de iniciar
      `.trim()
    }
    
    // Retornar instruções simples formatadas
    return instructions
  }

  // Função para buscar detalhes completos de uma receita
  const fetchRecipeDetails = async (recipe) => {
    console.log('🔍 fetchRecipeDetails chamada com:', recipe)
    
    try {
      console.log('📋 Definindo receita no modal')
      setSelectedRecipe(recipe)
      setShowRecipeModal(true)
      console.log('✅ Modal configurado')
        } catch (error) {
      console.error('❌ ERRO na função fetchRecipeDetails:', error)
    }
  }


  // Função para gerar detalhes creativos para receitas locais
  const generateCreativeDetails = (recipe) => {
    console.log('🎨 generateCreativeDetails chamada com:', recipe)
    
    try {
      const ingredientName = recipe.ingredient
      
      // Receitas específicas baseadas no ingrediente
      const recipeTemplates = {
      'Arroz': {
        ingredients: [
          { name: 'Arroz', measure: '2 xícaras' },
          { name: 'Água', measure: '4 xícaras' },
          { name: 'Sal', measure: '1 colher de chá' },
          { name: 'Óleo', measure: '2 colheres de sopa' },
          { name: 'Alho', measure: '2 dentes picados' },
          { name: 'Cebola', measure: '1/2 unidade picada' }
        ],
        steps: [
          'PASSO 1: Lave o arroz em água corrente até a água sair transparente',
          'PASSO 2: Em uma panela, aqueça o óleo em fogo médio',
          'PASSO 3: Adicione o alho e a cebola, refogue por 2 minutos até ficarem dourados',
          'PASSO 4: Acrescente o arroz e mexa por 1-2 minutos para dourar levemente',
          'PASSO 5: Adicione a água quente e o sal, misture bem',
          'PASSO 6: Quando começar a ferver, abaixe o fogo para mínimo',
          'PASSO 7: Tampe a panela e cozinhe por 18-20 minutos SEM MEXER',
          'PASSO 8: Desligue o fogo e deixe descansar por 5 minutos tampado',
          'PASSO 9: Solte o arroz com um garfo e sirva quente'
        ],
        tips: [
          '💡 NUNCA mexa o arroz durante o cozimento',
          '💡 Use a proporção 1:2 (1 xícara arroz para 2 xícaras água)',
          '💡 Para arroz mais soltinho, adicione algumas gotas de limão'
        ]
      },
      'Macarrão': {
        ingredients: [
          { name: 'Macarrão', measure: '500g' },
          { name: 'Água', measure: '3 litros' },
          { name: 'Sal grosso', measure: '2 colheres de sopa' },
          { name: 'Azeite', measure: '3 colheres de sopa' },
          { name: 'Alho', measure: '4 dentes laminados' },
          { name: 'Parmesão ralado', measure: '100g' },
          { name: 'Salsa picada', measure: '3 colheres de sopa' }
        ],
        steps: [
          'PASSO 1: Ferva a água com sal grosso em uma panela grande',
          'PASSO 2: Quando a água estiver fervendo vigorosamente, adicione o macarrão',
          'PASSO 3: Mexa nos primeiros 2 minutos para não grudar',
          'PASSO 4: Cozinhe conforme o tempo da embalagem MENOS 1 minuto (al dente)',
          'PASSO 5: Enquanto isso, aqueça o azeite em uma frigideira grande',
          'PASSO 6: Adicione o alho laminado e doure por 1 minuto (cuidado para não queimar)',
          'PASSO 7: Reserve 1 xícara da água do cozimento antes de escorrer',
          'PASSO 8: Escorra o macarrão e adicione direto na frigideira com alho',
          'PASSO 9: Misture por 1 minuto, adicionando água do cozimento se necessário',
          'PASSO 10: Desligue o fogo, adicione o parmesão e a salsa, misture e sirva'
        ],
        tips: [
          '💡 NUNCA lave o macarrão após cozinhar',
          '💡 A água deve estar FERVENDO antes de adicionar o macarrão',
          '💡 Use 1 litro de água para cada 100g de macarrão'
        ]
      }
    }
    
    // Pegar template específico ou usar genérico
    const template = recipeTemplates[ingredientName] || {
      ingredients: [
        { name: ingredientName, measure: 'quantidade necessária' },
        { name: 'Azeite', measure: '3 colheres de sopa' },
        { name: 'Alho', measure: '3 dentes picados' },
        { name: 'Cebola', measure: '1 unidade média' },
        { name: 'Sal', measure: 'a gosto' },
        { name: 'Temperos frescos', measure: 'a gosto' }
      ],
      steps: [
        `PASSO 1: Prepare todos os ingredientes, lave e corte o ${ingredientName}`,
        'PASSO 2: Aqueça o azeite em uma panela em fogo médio',
        'PASSO 3: Adicione a cebola picada e refogue por 3-4 minutos até dourar',
        'PASSO 4: Acrescente o alho e refogue por mais 1 minuto',
        `PASSO 5: Adicione o ${ingredientName} preparado`,
        'PASSO 6: Tempere com sal e pimenta a gosto',
        `PASSO 7: Cozinhe mexendo ocasionalmente até o ${ingredientName} estar no ponto`,
        'PASSO 8: Finalize com temperos frescos picados',
        'PASSO 9: Sirva imediatamente enquanto quente'
      ],
      tips: [
        '💡 Mantenha o fogo médio para não queimar',
        '💡 Prove e ajuste os temperos no final',
        '💡 Sirva imediatamente para melhor sabor'
      ]
    }
    
    return {
      fullInstructions: `
🥕 INGREDIENTES NECESSÁRIOS:
${template.ingredients.map(ing => `• ${ing.measure} de ${ing.name}`).join('\n')}

👨‍🍳 MODO DE PREPARO PASSO A PASSO:
${template.steps.map((step, index) => `${step}`).join('\n')}

💡 DICAS IMPORTANTES:
${template.tips.join('\n')}

⏰ TEMPO TOTAL: ${template.cookingMinutes || 20} minutos
🍽️ RENDE: ${template.servings || 4} porções
      `.trim(),
      detailedIngredients: template.ingredients,
      cookingMinutes: template.cookingMinutes || 15,
      preparationMinutes: template.preparationMinutes || 10,
      servings: template.servings || 4,
      tags: ['Fácil', 'Passo a Passo', 'Caseiro', 'Brasileiro'],
      readyInMinutes: (template.cookingMinutes || 15) + (template.preparationMinutes || 10)
    }
    } catch (error) {
      console.error('❌ ERRO na função generateCreativeDetails:', error)
      return {
        fullInstructions: `Receita com ${ingredientName}`,
        detailedIngredients: [{ name: ingredientName, measure: 'quantidade necessária' }],
        cookingMinutes: 15,
        preparationMinutes: 10,
        servings: 4,
        tags: ['Fácil'],
        readyInMinutes: 25
      }
    }
  }

  // Função para buscar receitas no Spoonacular (API de backup)
  const searchSpoonacular = async (selectedIngredients) => {
    console.log('🥄 searchSpoonacular chamada!')
    const foundRecipes = []
    
    console.log('🥄 Buscando no Spoonacular (backup)...')
    
    try {
      // Filtrar ingredientes principais
      const mainIngredients = selectedIngredients.filter(ing => 
        !['Sal', 'Pimenta', 'Azeite', 'Açúcar'].includes(ing.name)
      )
      
      // Criar string de ingredientes em inglês
      const ingredientsString = mainIngredients
        .map(ing => translateToEnglish(ing.name))
        .join(',')
      
      // Tentar múltiplas chaves ou APIs alternativas
      const apiKeys = [
        '94c70f8e3e414ac084d01e9d8b75b1cf', // Chave pública de exemplo
        'demo',
        'test'
      ]
      
      let spoonacularWorked = false
      
      for (const apiKey of apiKeys) {
        if (spoonacularWorked) break
        
        const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredientsString)}&number=8&apiKey=${apiKey}`
        
        console.log(`🔍 Tentando Spoonacular com chave: ${apiKey.substring(0, 4)}...`)
        
        try {
          const response = await fetch(url)
          
          console.log(`📡 Spoonacular status: ${response.status}`)
          
        if (response.ok) {
          const data = await response.json()
            console.log('✅ Spoonacular respondeu:', data)
            
            if (Array.isArray(data) && data.length > 0) {
              spoonacularWorked = true
              
              data.forEach(recipe => {
                // Calcular relevância
                const usedIngredients = recipe.usedIngredients?.length || 0
                const missedIngredients = recipe.missedIngredients?.length || 0
                const relevanceScore = (usedIngredients * 20) - (missedIngredients * 5)
                
              // Spoonacular não tem instruções detalhadas, então vamos filtrar essas receitas
              console.log(`⚠️ Receita do Spoonacular "${recipe.title}" filtrada - sem instruções detalhadas`)
              })
            } else {
              console.log('📭 Sem receitas no Spoonacular')
            }
          } else {
            console.log(`❌ Spoonacular retornou erro: ${response.status}`)
          }
        } catch (error) {
          console.log(`⚠️ Erro na busca Spoonacular com chave ${apiKey}:`, error.message)
        }
      }
      
    } catch (error) {
      console.error('❌ Erro geral no Spoonacular:', error)
    }
    
    console.log(`🥄 Total de receitas do Spoonacular: ${foundRecipes.length}`)
    return foundRecipes
  }

  // Função para busca precisa de ingredientes (evita falsos positivos)
  const hasPreciseIngredientMatch = (recipeIngredients, userIngredient) => {
    const recipeText = recipeIngredients.toLowerCase()
    const userIng = userIngredient.toLowerCase()
    
    // Dividir em palavras e verificar cada uma
    const words = recipeText.split(/[,\s]+/).filter(word => word.length > 0)
    
    // Verificar se o ingrediente do usuário está presente como palavra completa
    return words.some(word => word === userIng)
  }

  // Função para calcular relevância da receita (legada)
  const calculateRelevance = (recipe, selectedIngredients) => {
    const recipeText = `${recipe.receita} ${recipe.ingredientes}`.toLowerCase()
    let score = 0
    
    selectedIngredients.forEach(ingredient => {
      if (recipeText.includes(ingredient.name.toLowerCase())) {
        score += 10
      }
    })
    
    return score
  }

  // Função principal de busca - usando múltiplas APIs
  const searchRecipesFromAPI = async (selectedIngredients, isStrictMode = false) => {
    console.log('🔍 searchRecipesFromAPI chamada!')
    console.log('📊 selectedIngredients recebidos:', selectedIngredients)
    console.log('📊 isStrictMode:', isStrictMode)
    console.log('🔍 Iniciando busca em múltiplas APIs...')
    console.log('📊 Modo:', isStrictMode ? 'Estrito' : 'Relevante')
    
    let allRecipes = []
    
    try {
      // 1. Buscar no Spoonacular (API principal)
      console.log('🥄 Buscando no Spoonacular...')
      const spoonacularRecipes = await searchSpoonacular(selectedIngredients)
      console.log(`🥄 Spoonacular retornou ${spoonacularRecipes.length} receitas`)
      allRecipes = [...allRecipes, ...spoonacularRecipes]
      
      // 2. Adicionar receitas locais (sempre incluir)
      console.log('🏠 Adicionando receitas locais...')
      console.log('🏠 Total de receitas locais disponíveis:', localRecipes.length)
      console.log('🏠 Ingredientes selecionados pelo usuário:', selectedIngredients.map(ing => ing.name))
      console.log('🏠 Receitas de milho disponíveis:', localRecipes.filter(r => r.ingredient === 'Milho').map(r => r.title))
      console.log('🥩 Receitas de carne bovina disponíveis:', localRecipes.filter(r => r.ingredient === 'Carne Bovina').map(r => r.title))
      
      const localRecipesToAdd = localRecipes.filter(recipe => {
        // Filtrar receitas locais que tenham ingredientes correspondentes
        if (!recipe.ingredientsList) {
          console.log('🏠 Receita sem ingredientes, incluindo:', recipe.title)
          return true
        }
        
        const recipeIngredients = recipe.ingredientsList.toLowerCase()
        const userIngredients = selectedIngredients.map(ing => ing.name.toLowerCase())
        
        console.log(`🏠 Verificando receita: ${recipe.title}`)
        console.log(`🏠 Ingredientes da receita: ${recipeIngredients}`)
        console.log(`🏠 Ingredientes do usuário: ${userIngredients}`)
        
        // Verificar se pelo menos um ingrediente corresponde (busca precisa)
        const hasMatch = userIngredients.some(userIng => {
          const englishName = translateToEnglish(userIng)
          const matches = hasPreciseIngredientMatch(recipeIngredients, userIng) || 
                         hasPreciseIngredientMatch(recipeIngredients, englishName)
          console.log(`🏠 ${userIng} (${englishName}) -> ${matches}`)
          console.log(`🏠 Verificando precisamente: "${userIng}" em "${recipeIngredients}"`)
          console.log(`🏠 Verificando precisamente: "${englishName}" em "${recipeIngredients}"`)
          return matches
        })
        
        // Se não encontrou match, verificar se é uma receita de ovos e o usuário selecionou ovos
        if (!hasMatch && recipe.ingredient && recipe.ingredient.toLowerCase().includes('ovo')) {
          const hasOvos = userIngredients.some(ing => 
            hasPreciseIngredientMatch(recipeIngredients, ing) && 
            (ing.includes('ovo') || ing.includes('egg'))
          )
          console.log(`🏠 Receita de ovos sem match direto, mas usuário tem ovos: ${hasOvos}`)
          if (hasOvos) {
            console.log(`🏠 ${recipe.title} -> INCLUÍDA (receita de ovos)`)
            return true
          }
        }
        
        // Se não encontrou match, verificar se é uma receita de milho e o usuário selecionou milho
        if (!hasMatch && recipe.ingredient && recipe.ingredient === 'Milho') {
          const hasMilho = userIngredients.some(ing => 
            hasPreciseIngredientMatch(recipeIngredients, ing) && 
            (ing.toLowerCase().includes('milho') || ing.toLowerCase().includes('corn'))
          )
          console.log(`🏠 Receita de milho sem match direto, mas usuário tem milho: ${hasMilho}`)
          if (hasMilho) {
            console.log(`🏠 ${recipe.title} -> INCLUÍDA (receita de milho)`)
            return true
          }
        }
        
        // Se não encontrou match, verificar se é uma receita de carne bovina e o usuário selecionou carne bovina
        if (!hasMatch && recipe.ingredient && recipe.ingredient === 'Carne Bovina') {
          const hasCarneBovina = userIngredients.some(ing => 
            hasPreciseIngredientMatch(recipeIngredients, ing) && 
            (ing.toLowerCase().includes('carne bovina') || 
             ing.toLowerCase().includes('beef') || 
             ing.toLowerCase().includes('carne'))
          )
          console.log(`🏠 Receita de carne bovina sem match direto, mas usuário tem carne bovina: ${hasCarneBovina}`)
          console.log(`🏠 Ingrediente da receita: ${recipe.ingredient}`)
          console.log(`🏠 Ingredientes do usuário: ${userIngredients}`)
          if (hasCarneBovina) {
            console.log(`🏠 ${recipe.title} -> INCLUÍDA (receita de carne bovina)`)
            return true
          }
        }
        
        // Se não encontrou match, verificar se é uma receita de pimentão e o usuário selecionou pimentão
        if (!hasMatch && recipe.ingredient && recipe.ingredient === 'Pimentão') {
          const hasPimentao = userIngredients.some(ing => 
            hasPreciseIngredientMatch(recipeIngredients, ing) && 
            (ing.toLowerCase().includes('pimentão') || 
             ing.toLowerCase().includes('bell pepper') || 
             ing.toLowerCase().includes('pimenta'))
          )
          console.log(`🏠 Receita de pimentão sem match direto, mas usuário tem pimentão: ${hasPimentao}`)
          console.log(`🏠 Ingrediente da receita: ${recipe.ingredient}`)
          console.log(`🏠 Ingredientes do usuário: ${userIngredients}`)
          if (hasPimentao) {
            console.log(`🏠 ${recipe.title} -> INCLUÍDA (receita de pimentão)`)
            return true
          }
        }
        
        // Se não encontrou match, verificar se é uma receita de pepino e o usuário selecionou pepino
        if (!hasMatch && recipe.ingredient && recipe.ingredient === 'Pepino') {
          const hasPepino = userIngredients.some(ing => 
            hasPreciseIngredientMatch(recipeIngredients, ing) && 
            (ing.toLowerCase().includes('pepino') || 
             ing.toLowerCase().includes('cucumber'))
          )
          console.log(`🏠 Receita de pepino sem match direto, mas usuário tem pepino: ${hasPepino}`)
          console.log(`🏠 Ingrediente da receita: ${recipe.ingredient}`)
          console.log(`🏠 Ingredientes do usuário: ${userIngredients}`)
          if (hasPepino) {
            console.log(`🏠 ${recipe.title} -> INCLUÍDA (receita de pepino)`)
            return true
          }
        }
        
        // Se não encontrou match, verificar se é uma receita de alface e o usuário selecionou alface
        if (!hasMatch && recipe.ingredient && recipe.ingredient === 'Alface') {
          const hasAlface = userIngredients.some(ing => 
            hasPreciseIngredientMatch(recipeIngredients, ing) && 
            (ing.toLowerCase().includes('alface') || 
             ing.toLowerCase().includes('lettuce'))
          )
          console.log(`🏠 Receita de alface sem match direto, mas usuário tem alface: ${hasAlface}`)
          console.log(`🏠 Ingrediente da receita: ${recipe.ingredient}`)
          console.log(`🏠 Ingredientes do usuário: ${userIngredients}`)
          if (hasAlface) {
            console.log(`🏠 ${recipe.title} -> INCLUÍDA (receita de alface)`)
            return true
          }
        }
        
        // Se não encontrou match, verificar se é uma receita de tomate e o usuário selecionou tomate
        if (!hasMatch && recipe.ingredient && recipe.ingredient === 'Tomate') {
          const hasTomate = userIngredients.some(ing => 
            hasPreciseIngredientMatch(recipeIngredients, ing) && 
            (ing.toLowerCase().includes('tomate') || 
             ing.toLowerCase().includes('tomato'))
          )
          console.log(`🏠 Receita de tomate sem match direto, mas usuário tem tomate: ${hasTomate}`)
          console.log(`🏠 Ingrediente da receita: ${recipe.ingredient}`)
          console.log(`🏠 Ingredientes do usuário: ${userIngredients}`)
          if (hasTomate) {
            console.log(`🏠 ${recipe.title} -> INCLUÍDA (receita de tomate)`)
            return true
          }
        }
        
        console.log(`🏠 ${recipe.title} -> ${hasMatch ? 'INCLUÍDA' : 'EXCLUÍDA'}`)
        return hasMatch
      })
      
      console.log(`🏠 ${localRecipesToAdd.length} receitas locais selecionadas`)
      console.log('🏠 Receitas selecionadas:', localRecipesToAdd.map(r => r.title))
      allRecipes = [...allRecipes, ...localRecipesToAdd]
      
      
      // Aplicar filtro de modo estrito se necessário
      if (isStrictMode && allRecipes.length > 0) {
        const filteredRecipes = allRecipes.filter(recipe => {
          if (!recipe.ingredientsList) return true
          
          const recipeIngredients = recipe.ingredientsList.toLowerCase()
          const userIngredients = selectedIngredients.map(ing => ing.name.toLowerCase())
          
          // Contar ingredientes correspondentes (busca precisa)
          let matchCount = 0
          userIngredients.forEach(userIng => {
            if (!['sal', 'pimenta', 'azeite', 'açúcar'].includes(userIng)) {
              const englishName = translateToEnglish(userIng)
              if (hasPreciseIngredientMatch(recipeIngredients, userIng) || 
                  hasPreciseIngredientMatch(recipeIngredients, englishName)) {
                matchCount++
              }
            }
          })
          
          // Modo estrito: pelo menos 40% dos ingredientes principais
          const mainUserIngredients = userIngredients.filter(ing => 
            !['sal', 'pimenta', 'azeite', 'açúcar'].includes(ing)
          )
          
          const minimumMatches = mainUserIngredients.length <= 2 ? 1 : Math.ceil(mainUserIngredients.length * 0.4)
          
          return matchCount >= minimumMatches
        })
        
        console.log(`🎯 Modo estrito: ${filteredRecipes.length} de ${allRecipes.length} receitas aprovadas`)
        
        // Ordenar receitas do modo estrito (SEM TRADUÇÃO)
        const sortedFilteredRecipes = filteredRecipes.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        console.log(`✅ ${sortedFilteredRecipes.length} receitas ordenadas (modo estrito)`)
        
        return sortedFilteredRecipes
      }
      
      // Modo relevante: ordenar por relevância
      console.log(`✅ Total de receitas encontradas: ${allRecipes.length}`)
      
      // 5. ORDENAR RECEITAS (SEM TRADUÇÃO)
      console.log('📋 Ordenando receitas por relevância...')
      const sortedRecipes = allRecipes.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      console.log(`✅ ${sortedRecipes.length} receitas ordenadas`)
      
      return sortedRecipes
      
    } catch (error) {
      console.error('❌ Erro geral ao buscar receitas:', error)
      
      // Retornar array vazio em caso de erro
      console.log('❌ Nenhuma receita encontrada devido a erro')
      return []
    }
  }

  const handleSearchRecipes = async () => {
    console.log('🔍 handleSearchRecipes chamada!')
    console.log('📊 selectedIngredients:', selectedIngredients)
    console.log('📊 selectedIngredients.length:', selectedIngredients.length)
    
    if (selectedIngredients.length === 0) {
      alert('Por favor, selecione pelo menos um ingrediente!')
      return
    }
    
    console.log('✅ Iniciando busca de receitas...')
    const selected = ingredients.filter(ing => selectedIngredients.includes(ing.id))
    const isStrictMode = searchMode === 'estrito'
    
    console.log('🔍 Iniciando busca:', {
      ingredientes: selected.map(ing => ing.name),
      modo: isStrictMode ? 'Estrito' : 'Relevante',
      totalSelecionados: selectedIngredients.length
    })
    
    // Buscar receitas das APIs
    console.log('🔄 Buscando receitas das APIs...')
    
    try {
      const foundRecipes = await searchRecipesFromAPI(selected, isStrictMode)
      
      console.log('✅ Resultado da busca:', {
        total: foundRecipes.length,
        receitas: foundRecipes.map(r => ({ 
          titulo: r.title, 
          score: r.relevanceScore,
          fonte: r.source
        }))
      })
      
      // Sempre mostrar o painel de receitas, mesmo se vazio
      console.log('✅ Definindo receitas encontradas:', foundRecipes.length)
      setRecipes(foundRecipes)
      console.log('✅ Definindo showRecipes como true')
      setShowRecipes(true)
      
      // Log adicional para debug
      if (foundRecipes.length === 0) {
        console.warn('⚠️ Nenhuma receita encontrada. Verifique:', {
          ingredientesSelecionados: selected.map(ing => ing.name),
          modoEstrito: isStrictMode,
          apiTentada: 'API Brasileira'
        })
      }
      
    } catch (error) {
      console.error('❌ Erro na busca:', error)
      
      // Mostrar mensagem de erro
      alert('Houve um problema ao buscar receitas online. Tente novamente mais tarde.')
      setRecipes([])
      setShowRecipes(false)
      
        } finally {
          console.log('🏁 Finalizando busca de receitas')
        }
  }

  // Se não estiver autenticado, mostrar tela de bloqueio
  if (!isAuthenticated) {
    return (
      <AuthScreen 
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    )
  }

  return (
    <div className="app">
      <div className="main-layout">
        {/* Overlay para fechar sidebar no mobile */}
        {sidebarOpen && <div className="sidebar-overlay open" onClick={closeSidebar}></div>}
        
        {/* Sidebar Esquerda */}
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="logo">
              <img src="/images_/2.png" alt="FoodDidDo" className="logo-image" />
            </div>
          </div>
          <nav className="sidebar-nav">
            <a 
              href="#" 
              className={`nav-item ${activeNav === 'home' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                handleNavClick('home')
              }}
            >
              <span>Home</span>
            </a>
            <a 
              href="#" 
              className={`nav-item ${activeNav === 'grocery' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                handleNavClick('grocery')
              }}
            >
              <span>Minha Geladeira</span>
            </a>
            <a 
              href="#" 
              className={`nav-item ${activeNav === 'recipes' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                handleNavClick('recipes')
              }}
            >
              <span>Receitas</span>
            </a>
            
            {/* Botão de Logout */}
            <div className="sidebar-divider"></div>
            <a 
              href="#" 
              className="nav-item logout-btn"
              onClick={(e) => {
                e.preventDefault()
                handleLogout()
              }}
            >
              <span>🚪 Sair</span>
            </a>
          </nav>
        </div>

        {/* Área de Conteúdo */}
        <div className="content-area">
          {/* Header */}
          <header className="header">
            <button className="menu-toggle" onClick={toggleSidebar} title="Menu">
              ☰
            </button>
            <div className="header-actions">
              <ThemeToggle className="header" />
              {isAuthenticated ? (
                <div className="user-menu">
                  <span className="user-name">Olá, {user?.name}</span>
                  <button className="header-btn logout-btn" onClick={handleLogout} title="Sair">
                    🚪
                  </button>
                </div>
              ) : (
                <div className="auth-buttons">
                  <button className="header-btn login-btn" onClick={handleShowLogin} title="Entrar">
                    👤
                  </button>
                  <button className="header-btn register-btn" onClick={handleShowRegister} title="Cadastrar">
                    ✍️
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Conteúdo Principal */}
          <main className="main-content">
            {activeNav === 'home' ? (
              <>
                {/* Hero Banner */}
                <section className="hero-banner" style={{
                  backgroundImage: 'url(/images_/prato.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}>
                  <div className="hero-overlay">
                    <div className="hero-content">
                      <h1 className="hero-title">
                        Eleve seu nível culinário
                      </h1>
                      <p className="hero-subtitle">
                        Explore novas receitas, planeje sua semana, e compre facilmente.
        </p>
      </div>
                  </div>
                </section>

                {/* Lista de Refeições */}
                <section className="meals-section card">
                  <div className="section-header">
                    <h2 className="section-title">Lista de refeições</h2>
                    <button className="add-meal-btn" onClick={() => setShowForm(!showForm)}>
                      {showForm ? 'Cancelar' : '+ Nova Refeição'}
                    </button>
                  </div>

                  {/* Formulário para adicionar/editar refeição */}
                  {showForm && (
                    <div className="meal-form">
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Título da refeição</label>
                          <input 
                            type="text" 
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="Ex: Avocado toast"
                            className="form-input"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Calorias</label>
                          <input 
                            type="text" 
                            value={formData.calories}
                            onChange={(e) => setFormData({...formData, calories: e.target.value})}
                            placeholder="Ex: 250Cal"
                            className="form-input"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Ingredientes</label>
                          <input 
                            type="text" 
                            value={formData.ingredients}
                            onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                            placeholder="Ex: Avocado, Bread, Eggs"
                            className="form-input"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Tempo de preparo</label>
                          <input 
                            type="text" 
                            value={formData.time}
                            onChange={(e) => setFormData({...formData, time: e.target.value})}
                            placeholder="Ex: 15min"
                            className="form-input"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Status</label>
                          <select 
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            className="form-select"
                          >
                            <option value="fazer">fazer</option>
                            <option value="em progresso">em progresso</option>
                            <option value="feita">feita</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label>&nbsp;</label>
                          <button 
                            className="save-btn"
                            onClick={handleSaveMeal}
                          >
                            {editingId ? 'Finalizar Edição' : 'Salvar Refeição'}
                          </button>
                        </div>
                      </div>
                      
                    </div>
                  )}

                  {/* Lista de refeições */}
                  <div className="meals-list">
                    {meals.map(meal => (
                      <div key={meal.id} className="meal-item">
                        <div className="meal-info">
                          <div className="meal-details">
                            <span className="meal-title">{meal.title}</span>
                            <span className="meal-calories">{meal.calories}</span>
                            <span className="meal-ingredients">{meal.ingredients}</span>
                            <span className="meal-time">{meal.time}</span>
                            <span className={`status-badge status-${meal.status.replace(' ', '-')}`}>
                              {meal.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="meal-actions">
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditMeal(meal)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteMeal(meal.id)}
                            title="Excluir"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            ) : activeNav === 'grocery' ? (
              /* Página da Geladeira */
              <div className="fridge-page">
                <h1 className="page-title">🛒 Minha Geladeira</h1>
                
                {/* Barra de Pesquisa */}
                <div className="search-section">
                  <div className="search-bar-container">
                    <input
                      type="text"
                      placeholder="Pesquisar ingredientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="ingredient-search"
                    />
                    <button
                      className="search-recipes-btn"
                      onClick={handleSearchRecipes}
                      disabled={selectedIngredients.length === 0}
                    >
                      🔍 Pesquisar Receitas ({selectedIngredients.length})
                    </button>
                  </div>
                  
                  {/* Botões de Modo de Busca */}
                  <div className="search-mode-buttons">
                    <p className="mode-description">Tipo de busca:</p>
                    <div className="mode-buttons">
                      <button 
                        className={`mode-btn ${searchMode === 'relevante' ? 'active' : ''}`}
                        onClick={() => setSearchMode('relevante')}
                      >
                        🔍 Relevante
                      </button>
                      <button 
                        className={`mode-btn ${searchMode === 'estrito' ? 'active' : ''}`}
                        onClick={() => setSearchMode('estrito')}
                      >
                        🎯 Estrito
                      </button>
                    </div>
                    <div className="mode-explanation">
                      {searchMode === 'estrito' ? (
                        <p>📋 <strong>Modo Estrito:</strong> Mostra apenas receitas que podem ser feitas completamente com os ingredientes selecionados.</p>
                      ) : (
                        <p>🌟 <strong>Modo Relevante:</strong> Mostra todas as receitas que contêm pelo menos um dos ingredientes selecionados.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Receitas Encontradas */}
                {showRecipes && (
                  <div className="recipes-section">
                    <div className="recipes-header">
                      <div className="recipes-title-section">
                        <h2>🍽️ Receitas Encontradas ({recipes.length})</h2>
                        <p className="search-mode-indicator">
                          {searchMode === 'estrito' ? '🎯 Busca Estrita' : '🔍 Busca Relevante'} • 
                          {selectedIngredients.length} ingrediente{selectedIngredients.length !== 1 ? 's' : ''} selecionado{selectedIngredients.length !== 1 ? 's' : ''}
                        </p>
                        <div className="api-stats">
                          {recipes.filter(r => r.source === 'Spoonacular').length > 0 && (
                            <span className="api-stat spoonacular">
                              🥄 {recipes.filter(r => r.source === 'Spoonacular').length} do Spoonacular
                            </span>
                          )}
                          {recipes.filter(r => r.source === 'Receita Local').length > 0 && (
                            <span className="api-stat local">
                              🏠 {recipes.filter(r => r.source === 'Receita Local').length} receitas locais
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        className="close-recipes-btn"
                        onClick={() => setShowRecipes(false)}
                      >
                        ✕ Fechar
                      </button>
                    </div>
                    
                    {recipes.length > 0 ? (
                      <div className="recipes-grid">
                        {recipes.map(recipe => (
                          <div key={recipe.id} className="recipe-card">
                            <div className="recipe-image-container">
                            <img 
                              src={recipe.image} 
                              alt={recipe.title}
                              className="recipe-image"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x200?text=Receita'
                              }}
                            />
                              <div className="recipe-overlay">
                                <span className={`recipe-source source-${recipe.source?.toLowerCase().replace(/\s+/g, '-')}`}>
                                  {recipe.source === 'Spoonacular' && '🥄 SP'}
                                  {recipe.source === 'Receita Local' && '🏠 LOC'}
                                  {!recipe.source && '❓ N/A'}
                                </span>
                              </div>
                            </div>
                            <div className="recipe-content">
                              <div className="recipe-header">
                                <h3 className="recipe-title">
                                  {recipe.title}
                                </h3>
                              </div>
                              <div className="recipe-meta">
                                <span className="recipe-category">📂 {recipe.category}</span>
                                <span className="recipe-area">🌍 {recipe.area}</span>
                              </div>
                              <p className="recipe-ingredient ingredient-contains">
                                <span className="ingredient-emoji-dynamic">{getIngredientEmoji(recipe.ingredient)}</span>
                                <span className="ingredient-text-contains">Contém: {recipe.ingredient}</span>
                              </p>
                              <p className="recipe-instructions" style={{ whiteSpace: 'pre-line' }}>
                                {recipe.instructions?.substring(0, 100)}...
                              </p>
                              <div className="recipe-actions">
                                {recipe.video && (
                                  <a 
                                    href={recipe.video} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="recipe-video-btn"
                                  >
                                    📺 Ver Vídeo
                                  </a>
                                )}
                                <button 
                                  className="recipe-details-btn"
                                  onClick={() => fetchRecipeDetails(recipe)}
                                  disabled={loadingRecipeDetails}
                                >
                                  {loadingRecipeDetails ? '🔄 Carregando...' : 'Ver Receita Completa'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-recipes">
                        <h3>😞 Nenhuma receita encontrada</h3>
                        <p>
                          <strong>Ingredientes selecionados:</strong> {ingredients.filter(ing => selectedIngredients.includes(ing.id)).map(ing => ing.name).join(', ')}
                        </p>
                        <p>
                          <strong>Modo de busca:</strong> {searchMode === 'estrito' ? '🎯 Estrito' : '🔍 Relevante'}
                        </p>
                        <div className="suggestions">
                          <h4>💡 Sugestões:</h4>
                          <ul>
                            <li>Tente selecionar ingredientes mais comuns (arroz, feijão, frango, tomate)</li>
                            <li>Use o modo "Relevante" em vez de "Estrito"</li>
                            <li>Selecione menos ingredientes para ter mais opções</li>
                            <li>Verifique sua conexão com a internet</li>
                          </ul>
                        </div>
                        <button
                          className="retry-btn"
                          onClick={handleSearchRecipes}
                        >
                          🔄 Tentar novamente
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Lista de Ingredientes */}
                {!showRecipes && (
                  <div className="ingredients-grid">
                    {filteredIngredients.map(ingredient => (
                      <div 
                        key={ingredient.id} 
                        className={`ingredient-item ${selectedIngredients.includes(ingredient.id) ? 'selected' : ''}`}
                        onClick={() => handleIngredientToggle(ingredient.id)}
                      >
                        <span className="ingredient-emoji">{ingredient.emoji}</span>
                        <span className="ingredient-name">{ingredient.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeNav === 'recipes' ? (
              /* Página de Receitas */
              <div className="recipes-page">
                <h1 className="page-title">🍽️ Todas as Receitas</h1>
                
                {isLoadingAllRecipes ? (
                  <div className="loading-section">
                    <div className="loading-spinner"></div>
                    <p>Carregando receitas das APIs...</p>
                  </div>
                ) : (
                  <>
                    <div className="recipes-grid">
                      {getCurrentPageRecipes().map(recipe => (
                        <div key={recipe.id} className="recipe-card" onClick={() => fetchRecipeDetails(recipe)}>
                          <div className="recipe-image-container">
                            <img 
                              src={recipe.image} 
                              alt={recipe.title}
                              className="recipe-image"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x200?text=Receita'
                              }}
                            />
                            <div className="recipe-overlay">
                              <span className={`recipe-source source-${recipe.apiType}`}>
                                {recipe.apiType === 'spoonacular' && '🥄 SP'}
                                {recipe.apiType === 'local' && '🏠 LOC'}
                              </span>
                            </div>
                          </div>
                          <div className="recipe-content">
                            <div className="recipe-header">
                              <h3 className="recipe-title">{recipe.title}</h3>
                            </div>
                            <div className="recipe-meta">
                              <span className="recipe-category">📂 {recipe.category}</span>
                              <span className="recipe-area">🌍 {recipe.area}</span>
                            </div>
                            <button className="view-recipe-btn">
                              Ver Receita Completa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Controles de Paginação */}
                    {getTotalPages() > 1 && (
                      <div className="pagination">
                        <div className="pagination-info">
                          Página {currentPage} de {getTotalPages()} • {allApiRecipes.length} receitas
                        </div>
                        <div className="pagination-controls">
                          <button 
                            className="pagination-btn"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            ← Anterior
                          </button>
                          
                          {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          ))}
                          
                          <button 
                            className="pagination-btn"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === getTotalPages()}
                          >
                            Próxima →
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {!isLoadingAllRecipes && allApiRecipes.length === 0 && (
                  <div className="no-recipes">
                    <h3>Nenhuma receita encontrada</h3>
                    <p>Tente recarregar a página ou verifique sua conexão com a internet.</p>
                    <button 
                      className="reload-btn"
                      onClick={() => fetchAllApiRecipes()}
                    >
                      🔄 Recarregar Receitas
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="coming-soon">
                <h2>Em breve...</h2>
                <p>Esta funcionalidade estará disponível em breve!</p>
                <p>Página atual: <strong>{activeNav}</strong></p>
              </div>
            )}
          </main>
        </div>

      </div>

      {/* Modal de Receita Detalhada */}
      {showRecipeModal && selectedRecipe && (
        <div className="recipe-modal-overlay" onClick={() => setShowRecipeModal(false)}>
          <div className="recipe-modal" onClick={(e) => e.stopPropagation()}>
            <div className="recipe-modal-header">
              <div className="recipe-modal-title-section">
                <h2 className="recipe-modal-title">{selectedRecipe.title || 'Receita'}</h2>
                <span className="recipe-source-badge">
                  📋 {selectedRecipe.source || 'Receita'}
                </span>
              </div>
              <button 
                className="recipe-modal-close"
                onClick={() => setShowRecipeModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="recipe-modal-content">
              <div className="recipe-modal-image-section">
                <img 
                  src={selectedRecipe.image || 'https://via.placeholder.com/300x200?text=Receita'} 
                  alt={selectedRecipe.title || 'Receita'}
                  className="recipe-modal-image"
                />
                
                <div className="recipe-modal-info">
                  <div className="recipe-info-grid">
                    <div className="recipe-info-item">
                      <span className="info-icon">📂</span>
                      <span className="info-label">Categoria:</span>
                      <span className="info-value">{selectedRecipe.category || 'N/A'}</span>
                    </div>
                    
                    <div className="recipe-info-item">
                      <span className="info-icon">🌍</span>
                      <span className="info-label">Origem:</span>
                      <span className="info-value">{selectedRecipe.area || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="recipe-modal-details">
                <div className="recipe-ingredients-section">
                  <h3>🥕 Ingredientes</h3>
                  <div className="ingredients-list">
                    {selectedRecipe.ingredientsList ? (
                      <div className="ingredients-list-simple">
                        {selectedRecipe.ingredientsList.split(',').map((ingredient, index) => (
                          <div key={index} className="ingredient-item-simple">
                            <span className="ingredient-bullet">•</span>
                            <span className="ingredient-text">{ingredient.trim()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Ingredientes não especificados</p>
                    )}
                  </div>
                </div>

                <div className="recipe-instructions-section">
                  <h3>📝 Modo de Preparo</h3>
                  <div className="instructions-content">
                    <div className="basic-instructions">
                      <p style={{ whiteSpace: 'pre-line' }}>
                        {selectedRecipe.instructions || 'Instruções não disponíveis'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modais de Autenticação */}
      {showLogin && (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={handleShowRegister}
          onClose={() => setShowLogin(false)}
        />
      )}

      {showRegister && (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={handleShowLogin}
          onClose={() => setShowRegister(false)}
        />
      )}
    </div>
  )
}

// Wrapper com ThemeProvider
const AppWithTheme = () => {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}

export default AppWithTheme