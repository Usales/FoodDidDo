import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeNav, setActiveNav] = useState('home')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    calories: '',
    ingredients: '',
    time: '',
    status: 'fazer'
  })
  
  const [meals, setMeals] = useState([
    {
      id: 1,
      title: 'Torrada com abacate',
      calories: '250Cal',
      ingredients: 'Abacate, Pão, Ovos',
      time: '15min',
      status: 'em progresso'
    },
    {
      id: 2,
      title: 'Macarrão Alfredo',
      calories: '450Cal',
      ingredients: 'Frango, Macarrão, Molho Alfredo, Queijo',
      time: '30min',
      status: 'fazer'
    },
    {
      id: 3,
      title: 'Salada de Quinoa',
      calories: '200Cal',
      ingredients: 'Cenoura, Tomate, Minta',
      time: '10min',
      status: 'feita'
    }
  ])

  const handleSaveMeal = () => {
    if (!formData.title.trim()) return
    
    if (editingId) {
      // Editar refeição existente
      setMeals(meals.map(meal => 
        meal.id === editingId 
          ? { ...meal, ...formData }
          : meal
      ))
      setEditingId(null)
    } else {
      // Adicionar nova refeição
      const newMeal = {
        id: Date.now(),
        ...formData
      }
      setMeals([...meals, newMeal])
    }
    
    setFormData({
      title: '',
      calories: '',
      ingredients: '',
      time: '',
      status: 'fazer'
    })
    setShowForm(false)
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

  const handleDeleteMeal = (id) => {
    setMeals(meals.filter(meal => meal.id !== id))
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
    { id: 58, name: 'Tempeh', emoji: '🫘' },
    
    // Frutos do Mar
    { id: 59, name: 'Salmão', emoji: '🐟' },
    { id: 60, name: 'Atum', emoji: '🐟' },
    { id: 61, name: 'Bacalhau', emoji: '🐟' },
    { id: 62, name: 'Sardinha', emoji: '🐟' },
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
    { id: 86, name: 'Mirtilo', emoji: '🫐' },
    { id: 87, name: 'Amora', emoji: '🫐' },
    { id: 88, name: 'Coco', emoji: '🥥' },
    { id: 89, name: 'Tâmara', emoji: '🫒' },
    { id: 90, name: 'Figo', emoji: '🟫' },
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
    { id: 101, name: 'Cevada', emoji: '🌾' },
    { id: 102, name: 'Trigo', emoji: '🌾' },
    { id: 103, name: 'Centeio', emoji: '🌾' },
    { id: 104, name: 'Amaranto', emoji: '🌾' },
    { id: 105, name: 'Chia', emoji: '🌱' },
    { id: 106, name: 'Linhaça', emoji: '🌱' },
    { id: 107, name: 'Gergelim', emoji: '🌱' },
    { id: 108, name: 'Nozes', emoji: '🥜' },
    { id: 109, name: 'Amêndoas', emoji: '🥜' },
    { id: 110, name: 'Castanha', emoji: '🥜' },
    { id: 111, name: 'Avelã', emoji: '🥜' },
    { id: 112, name: 'Pistache', emoji: '🥜' },
    
    // Temperos e Ervas
    { id: 113, name: 'Alecrim', emoji: '🌿' },
    { id: 114, name: 'Tomilho', emoji: '🌿' },
    { id: 115, name: 'Sálvia', emoji: '🌿' },
    { id: 116, name: 'Coentro', emoji: '🌿' },
    { id: 117, name: 'Hortelã', emoji: '🌿' },
    { id: 118, name: 'Louro', emoji: '🍃' },
    { id: 119, name: 'Gengibre', emoji: '🫚' },
    { id: 120, name: 'Alho-poró', emoji: '🧄' },
    { id: 121, name: 'Cebolinha', emoji: '🧅' },
    { id: 122, name: 'Cebola Roxa', emoji: '🧅' },
    { id: 123, name: 'Alho Negro', emoji: '🧄' },
    { id: 124, name: 'Pimenta-do-reino', emoji: '⚫' },
    { id: 125, name: 'Pimenta Caiena', emoji: '🌶️' },
    { id: 126, name: 'Páprica', emoji: '🌶️' },
    { id: 127, name: 'Cominho', emoji: '🟤' },
    { id: 128, name: 'Cardamomo', emoji: '🟢' },
    { id: 129, name: 'Cravo', emoji: '🟤' },
    { id: 130, name: 'Noz-moscada', emoji: '🟤' },
    
    // Molhos e Condimentos
    { id: 131, name: 'Molho de Soja', emoji: '🫗' },
    { id: 132, name: 'Vinagre', emoji: '🫗' },
    { id: 133, name: 'Vinagre Balsâmico', emoji: '🫗' },
    { id: 134, name: 'Mostarda', emoji: '🟡' },
    { id: 135, name: 'Ketchup', emoji: '🍅' },
    { id: 136, name: 'Maionese', emoji: '🟡' },
    { id: 137, name: 'Worcestershire', emoji: '🫗' },
    { id: 138, name: 'Tabasco', emoji: '🌶️' },
    { id: 139, name: 'Sriracha', emoji: '🌶️' },
    { id: 140, name: 'Tahine', emoji: '🫘' },
    
    // Legumes e Tubérculos
    { id: 141, name: 'Batata Doce', emoji: '🍠' },
    { id: 142, name: 'Inhame', emoji: '🍠' },
    { id: 143, name: 'Aipim', emoji: '🍠' },
    { id: 144, name: 'Cenoura Baby', emoji: '🥕' },
    { id: 145, name: 'Nabo Japonês', emoji: '🥕' },
    { id: 146, name: 'Rabanete Branco', emoji: '🥕' },
    
    // Frutas Secas
    { id: 147, name: 'Uva Passa', emoji: '🍇' },
    { id: 148, name: 'Ameixa Seca', emoji: '🟣' },
    { id: 149, name: 'Damasco Seco', emoji: '🟠' },
    { id: 150, name: 'Figo Seco', emoji: '🟫' }
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
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)


  // Dicionário completo de traduções inglês → português
  const translationDictionary = {
    // Ingredientes principais
    'chicken': 'frango', 'beef': 'bovina', 'pork': 'porco', 'lamb': 'cordeiro',
    'fish': 'peixe', 'salmon': 'salmão', 'tuna': 'atum', 'cod': 'bacalhau',
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
    'blueberry': 'mirtilo', 'blueberries': 'mirtilos',
    'grape': 'uva', 'grapes': 'uvas', 'watermelon': 'melancia',
    'pineapple': 'abacaxi', 'mango': 'manga', 'peach': 'pêssego',
    'avocado': 'abacate', 'coconut': 'coco',
    
    // Grãos e cereais
    'rice': 'arroz', 'pasta': 'macarrão', 'bread': 'pão', 'flour': 'farinha',
    'quinoa': 'quinoa', 'oats': 'aveia', 'barley': 'cevada',
    'lentils': 'lentilhas', 'chickpeas': 'grão-de-bico',
    
    // Temperos e ervas
    'salt': 'sal', 'pepper': 'pimenta', 'black pepper': 'pimenta-do-reino',
    'oregano': 'orégano', 'basil': 'manjericão', 'parsley': 'salsa',
    'cilantro': 'coentro', 'thyme': 'tomilho', 'rosemary': 'alecrim',
    'bay leaves': 'folhas de louro', 'cinnamon': 'canela',
    'ginger': 'gengibre', 'cumin': 'cominho', 'paprika': 'páprica',
    'turmeric': 'açafrão', 'cardamom': 'cardamomo',
    
    // Líquidos e óleos
    'water': 'água', 'olive oil': 'azeite de oliva', 'vegetable oil': 'óleo vegetal',
    'coconut oil': 'óleo de coco', 'vinegar': 'vinagre',
    'soy sauce': 'molho de soja', 'honey': 'mel', 'sugar': 'açúcar',
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

  // Função para buscar todas as receitas das APIs para a sidebar
  const fetchAllApiRecipes = async () => {
    setIsLoadingAllRecipes(true)
    console.log('🌍 Buscando todas as receitas das APIs...')
    
    try {
      const allRecipes = []
      
      // 1. Buscar receitas populares do TheMealDB
      try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
        const data = await response.json()
        
        if (data.meals && data.meals.length > 0) {
          // Buscar várias receitas aleatórias
          for (let i = 0; i < 10; i++) {
            const randomResponse = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
            const randomData = await randomResponse.json()
            
            if (randomData.meals && randomData.meals[0]) {
              const meal = randomData.meals[0]
              allRecipes.push({
                id: `mealdb-${meal.idMeal}`,
                title: translateToPortuguese(meal.strMeal) || meal.strMeal,
                image: meal.strMealThumb || 'https://via.placeholder.com/300x200?text=Receita',
                category: meal.strCategory || 'Internacional',
                area: translateToPortuguese(meal.strArea) || meal.strArea || 'Internacional',
                source: 'TheMealDB',
                apiType: 'themealdb'
              })
            }
          }
        }
      } catch (error) {
        console.log('⚠️ Erro ao buscar receitas do TheMealDB:', error)
      }
      
      // 2. Buscar receitas populares do Spoonacular (usando API key demo)
      try {
        const response = await fetch('https://api.spoonacular.com/recipes/random?number=10&apiKey=demo')
        const data = await response.json()
        
        if (data.recipes && data.recipes.length > 0) {
          data.recipes.forEach(recipe => {
            allRecipes.push({
              id: `spoonacular-${recipe.id}`,
              title: translateToPortuguese(recipe.title) || recipe.title,
              image: recipe.image || 'https://via.placeholder.com/300x200?text=Receita',
              category: 'Internacional',
              area: translateToPortuguese(recipe.cuisines?.[0] || recipe.dishTypes?.[0] || 'Internacional'),
              source: 'Spoonacular',
              apiType: 'spoonacular'
            })
          })
        }
      } catch (error) {
        console.log('⚠️ Erro ao buscar receitas do Spoonacular:', error)
      }
      
      // 3. Adicionar receitas criativas locais
      const creativeRecipes = [
        {
          id: 'creative-1',
          title: 'Arroz Brasileiro Tradicional',
          image: 'https://via.placeholder.com/300x200?text=Arroz+Brasileiro',
          category: 'Prato Principal',
          area: 'Brasil',
          source: 'Receita Local',
          apiType: 'local'
        },
        {
          id: 'creative-2',
          title: 'Feijão Tropeiro',
          image: 'https://via.placeholder.com/300x200?text=Feijão+Tropeiro',
          category: 'Prato Principal',
          area: 'Brasil',
          source: 'Receita Local',
          apiType: 'local'
        },
        {
          id: 'creative-3',
          title: 'Macarrão à Carbonara',
          image: 'https://via.placeholder.com/300x200?text=Carbonara',
          category: 'Prato Principal',
          area: 'Italiano',
          source: 'Receita Local',
          apiType: 'local'
        },
        {
          id: 'creative-4',
          title: 'Frango Grelhado',
          image: 'https://via.placeholder.com/300x200?text=Frango+Grelhado',
          category: 'Prato Principal',
          area: 'Internacional',
          source: 'Receita Local',
          apiType: 'local'
        },
        {
          id: 'creative-5',
          title: 'Salada Caesar',
          image: 'https://via.placeholder.com/300x200?text=Salada+Caesar',
          category: 'Salada',
          area: 'Americano',
          source: 'Receita Local',
          apiType: 'local'
        }
      ]
      
      allRecipes.push(...creativeRecipes)
      
      // Remover duplicatas baseado no título
      const uniqueRecipes = allRecipes.filter((recipe, index, self) => 
        index === self.findIndex(r => r.title === recipe.title)
      )
      
      setAllApiRecipes(uniqueRecipes)
      console.log(`✅ ${uniqueRecipes.length} receitas carregadas para a sidebar`)
      
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

  // Função para lidar com o login
  const handleLogin = () => {
    if (isLoggedIn) {
      setIsLoggedIn(false)
      setShowLoginModal(false)
    } else {
      setShowLoginModal(true)
    }
  }

  // Carregar receitas das APIs quando o componente montar
  useEffect(() => {
    fetchAllApiRecipes()
  }, [])
  

  // Função para buscar receitas no TheMealDB
  const searchTheMealDB = async (selectedIngredients) => {
    console.log('🍽️ searchTheMealDB chamada!')
    const foundRecipes = []
    
    console.log('🍽️ Buscando no TheMealDB...')
    console.log('📋 Ingredientes recebidos:', selectedIngredients.map(ing => ing.name))
    
    try {
      // Filtrar ingredientes principais
      const mainIngredients = selectedIngredients.filter(ing => 
        !['Sal', 'Pimenta', 'Azeite', 'Açúcar'].includes(ing.name)
      )
      
      console.log('🎯 Ingredientes principais:', mainIngredients.map(ing => ing.name))
      
      // Buscar por cada ingrediente individual
      for (const ingredient of mainIngredients.slice(0, 4)) {
        const englishName = translateToEnglish(ingredient.name)
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(englishName)}`
        
        console.log(`🔍 Buscando receitas com ${ingredient.name} (${englishName})`)
        console.log(`🌐 URL: ${url}`)
        
        try {
          console.log(`📡 Fazendo requisição para TheMealDB...`)
          const response = await fetch(url)
          console.log(`📡 Response status: ${response.status}`)
          
          if (response.ok) {
            const data = await response.json()
            console.log(`✅ TheMealDB respondeu para ${ingredient.name}:`, data)
            
            if (data.meals && Array.isArray(data.meals)) {
              // Pegar até 8 receitas de cada ingrediente para ter mais variedade
              for (const meal of data.meals.slice(0, 8)) {
                // Verificar se já existe essa receita
                const exists = foundRecipes.some(existing => existing.id === `mealdb-${meal.idMeal}`)
                if (exists) continue
                
                // Buscar detalhes completos da receita
                try {
                  const detailsUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
                  const detailsResponse = await fetch(detailsUrl)
                  
                  if (detailsResponse.ok) {
                    const detailsData = await detailsResponse.json()
                    const mealDetails = detailsData.meals?.[0]
                    
                    if (mealDetails) {
                      // Extrair e traduzir ingredientes da receita
                      const recipeIngredients = []
                      const detailedIngredients = []
                      for (let i = 1; i <= 20; i++) {
                        const ingredientKey = `strIngredient${i}`
                        const measureKey = `strMeasure${i}`
                        if (mealDetails[ingredientKey] && mealDetails[ingredientKey].trim()) {
                          const originalIngredient = mealDetails[ingredientKey].trim()
                          const originalMeasure = mealDetails[measureKey]?.trim() || ''
                          
                          // Traduzir ingrediente e medida
                          const translatedIngredient = translateToPortuguese(originalIngredient)
                          const translatedMeasure = translateToPortuguese(originalMeasure)
                          
                          recipeIngredients.push(`${translatedMeasure} ${translatedIngredient}`.trim())
                          detailedIngredients.push({
                            name: translatedIngredient,
                            measure: translatedMeasure,
                            original: `${originalMeasure} ${originalIngredient}`.trim()
                          })
                        }
                      }
                      
                      // Calcular relevância
                      const relevanceScore = calculateRelevanceForMealDB(mealDetails, selectedIngredients)
                      const translatedInstructions = translateToPortuguese(mealDetails.strInstructions) || 'Instruções não disponíveis'
                      
                      // Verificar se a receita tem instruções válidas antes de adicionar
                      if (hasValidInstructions(translatedInstructions)) {
                        foundRecipes.push({
                          id: `mealdb-${meal.idMeal}`,
                          title: translateToPortuguese(mealDetails.strMeal) || 'Receita sem título',
                          image: mealDetails.strMealThumb || 'https://via.placeholder.com/300x200?text=Receita',
                          instructions: translatedInstructions,
                          ingredient: ingredient.name,
                          category: translateToPortuguese(mealDetails.strCategory) || 'Internacional',
                          area: translateToPortuguese(mealDetails.strArea) || 'Internacional',
                          video: mealDetails.strYoutube || null,
                          source: 'TheMealDB',
                          ingredientsList: recipeIngredients.join(', '),
                          relevanceScore: relevanceScore,
                          tags: mealDetails.strTags || ''
                        })
                        
                        console.log(`✅ Receita adicionada: ${mealDetails.strMeal} (score: ${relevanceScore})`)
                      } else {
                        console.log(`⚠️ Receita "${mealDetails.strMeal}" filtrada - instruções inadequadas`)
                      }
                    }
                  }
                } catch (detailError) {
                  console.log(`⚠️ Erro ao buscar detalhes da receita ${meal.idMeal}:`, detailError.message)
                }
              }
            } else {
              console.log(`📭 Sem receitas no TheMealDB para ${ingredient.name}`)
            }
          }
        } catch (error) {
          console.log(`⚠️ Erro na busca TheMealDB para ${ingredient.name}:`, error.message)
        }
      }
      
    } catch (error) {
      console.error('❌ Erro geral no TheMealDB:', error)
    }
    
    console.log(`🍽️ Total de receitas do TheMealDB: ${foundRecipes.length}`)
    return foundRecipes
  }

  // Função para validar se a receita tem instruções adequadas
  const hasValidInstructions = (instructions) => {
    if (!instructions || instructions.trim() === '') return false
    
    // Verificar se não é apenas texto genérico
    const genericTexts = [
      'instruções não disponíveis',
      'instruções completas disponíveis no site original',
      'receita do spoonacular',
      'consulte livros de culinária',
      'consulte sites especializados',
      'instruções detalhadas que não estão disponíveis',
      'não disponível',
      'n/a',
      'null',
      'undefined'
    ]
    
    const instructionsLower = instructions.toLowerCase().trim()
    
    // Se contém texto genérico, não é válida
    if (genericTexts.some(text => instructionsLower.includes(text))) {
      return false
    }
    
    // Verificar se tem pelo menos 50 caracteres (instruções muito curtas)
    if (instructions.length < 50) {
      return false
    }
    
    // Verificar se contém palavras-chave de instruções de cozinha
    const cookingKeywords = [
      'cozinhe', 'frite', 'asse', 'refogue', 'ferva', 'misture', 'adicione',
      'tempere', 'corte', 'pique', 'bata', 'mexa', 'deixe', 'retire',
      'preaqueça', 'pré-aqueça', 'pré aqueça', 'aquecer', 'aquecido',
      'minutos', 'hora', 'temperatura', 'graus', 'fogo', 'panela',
      'tigela', 'prato', 'sirva', 'decorar', 'finalizar'
    ]
    
    const hasCookingKeywords = cookingKeywords.some(keyword => 
      instructionsLower.includes(keyword)
    )
    
    return hasCookingKeywords
  }

  // Função para calcular relevância no TheMealDB
  const calculateRelevanceForMealDB = (meal, selectedIngredients) => {
    let score = 0
    const mealText = `${meal.strMeal} ${meal.strInstructions}`.toLowerCase()
    
    // Verificar ingredientes na receita
    for (let i = 1; i <= 20; i++) {
      const ingredientKey = `strIngredient${i}`
      if (meal[ingredientKey]) {
        const mealIngredient = meal[ingredientKey].toLowerCase()
        
        selectedIngredients.forEach(userIngredient => {
          const englishName = translateToEnglish(userIngredient.name).toLowerCase()
          const portugueseName = userIngredient.name.toLowerCase()
          
          if (mealIngredient.includes(englishName) || mealIngredient.includes(portugueseName)) {
            score += 15
          }
        })
      }
    }
    
    // Verificar no título e instruções
    selectedIngredients.forEach(userIngredient => {
      const englishName = translateToEnglish(userIngredient.name).toLowerCase()
      const portugueseName = userIngredient.name.toLowerCase()
      
      if (mealText.includes(englishName) || mealText.includes(portugueseName)) {
        score += 5
      }
    })
    
    return score
  }

  // Função para processar instruções do TheMealDB em formato passo a passo
  const processTheMealDBInstructions = (instructions) => {
    if (!instructions) return 'Instruções não disponíveis'
    
    // Traduzir primeiro as instruções
    const translatedInstructions = translateToPortuguese(instructions)
    
    // Limpar e dividir as instruções
    let cleanInstructions = translatedInstructions
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n\n+/g, '\n')
      .trim()
    
    // Se já está numerado, manter
    if (cleanInstructions.match(/^\d+[\.\)]/)) {
      const steps = cleanInstructions
        .split(/\n(?=\d+[\.\)])/g)
        .filter(step => step.trim())
        .map((step, index) => {
          const cleanStep = step.trim().replace(/^\d+[\.\)\s]*/, '')
          return `PASSO ${index + 1}: ${cleanStep}`
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
    
    // Se não está numerado, dividir por sentenças e criar passos
    const sentences = cleanInstructions
      .split(/[.!]\s+/)
      .filter(sentence => sentence.trim().length > 10)
      .map(sentence => sentence.trim())
    
    if (sentences.length > 1) {
      const steps = sentences.map((sentence, index) => {
        let cleanSentence = sentence
        if (!cleanSentence.endsWith('.') && !cleanSentence.endsWith('!')) {
          cleanSentence += '.'
        }
        return `PASSO ${index + 1}: ${cleanSentence}`
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
    
    // Se é um bloco único, tentar dividir por palavras-chave
    const keywordSplit = cleanInstructions
      .split(/(?=\b(?:Then|Next|After|Meanwhile|While|Finally|Lastly|First|Second|Third)\b)/gi)
      .filter(part => part.trim().length > 5)
    
    if (keywordSplit.length > 1) {
      const steps = keywordSplit.map((part, index) => {
        const cleanPart = part.trim().replace(/^(Then|Next|After|Meanwhile|While|Finally|Lastly|First|Second|Third)\s*/gi, '')
        return `PASSO ${index + 1}: ${cleanPart}`
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
    
    // Como último recurso, dividir em parágrafos
    const paragraphs = cleanInstructions
      .split('\n')
      .filter(para => para.trim().length > 10)
    
    if (paragraphs.length > 1) {
      const steps = paragraphs.map((para, index) => {
        return `PASSO ${index + 1}: ${para.trim()}`
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
    
    // Se tudo falhar, retornar como um único passo formatado
    return `
👨‍🍳 MODO DE PREPARO:
PASSO 1: ${cleanInstructions}

💡 DICAS IMPORTANTES:
💡 Leia toda a receita antes de começar
💡 Tenha todos os ingredientes prontos antes de iniciar
    `.trim()
  }

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
    
    // Usar a função do TheMealDB para processar texto simples
    return processTheMealDBInstructions(instructions)
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

  // Função original comentada temporariamente para debug
  const fetchRecipeDetailsOriginal = async (recipe) => {
    console.log('🔍 Abrindo receita:', recipe.title)
    
    setLoadingRecipeDetails(true)
    
    try {
      let detailedRecipe = { ...recipe }
      
      // Se for do TheMealDB, buscar detalhes completos
      if (recipe.source === 'TheMealDB' && recipe.id.includes('mealdb-')) {
        const mealId = recipe.id.replace('mealdb-', '')
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
        
        console.log(`🔍 Buscando detalhes completos para receita ID: ${mealId}`)
        
        try {
          const response = await fetch(url)
          if (response.ok) {
            const data = await response.json()
            const mealDetails = data.meals?.[0]
            
            if (mealDetails) {
              // Extrair todos os ingredientes com medidas
              const detailedIngredients = []
              for (let i = 1; i <= 20; i++) {
                const ingredient = mealDetails[`strIngredient${i}`]
                const measure = mealDetails[`strMeasure${i}`]
                if (ingredient && ingredient.trim()) {
                  detailedIngredients.push({
                    name: ingredient.trim(),
                    measure: measure?.trim() || ''
                  })
                }
              }
              
              // Processar instruções do TheMealDB para formato passo a passo
              const processedInstructions = processTheMealDBInstructions(mealDetails.strInstructions)
              
              detailedRecipe = {
                ...detailedRecipe,
                detailedIngredients,
                fullInstructions: processedInstructions,
                originalInstructions: mealDetails.strInstructions,
                drinkAlternate: mealDetails.strDrinkAlternate,
                tags: mealDetails.strTags?.split(',').map(tag => translateToPortuguese(tag.trim())) || [],
                youtubeUrl: mealDetails.strYoutube,
                sourceUrl: mealDetails.strSource,
                imageSource: mealDetails.strImageSource,
                creativeCommonsConfirmed: mealDetails.strCreativeCommonsConfirmed,
                dateModified: mealDetails.dateModified,
                // Traduzir informações básicas
                title: translateToPortuguese(detailedRecipe.title),
                category: translateToPortuguese(mealDetails.strCategory),
                area: translateToPortuguese(mealDetails.strArea),
                ingredientsList: recipeIngredients.join(', ')
              }
            }
          }
        } catch (error) {
          console.log('⚠️ Erro ao buscar detalhes do TheMealDB:', error)
        }
      }
      
      // Se for do Spoonacular, tentar buscar mais detalhes
      if (recipe.source === 'Spoonacular' && recipe.id.includes('spoonacular-')) {
        const recipeId = recipe.id.replace('spoonacular-', '')
        
        // Tentar buscar instruções detalhadas (requer chave de API válida)
        const apiKeys = ['94c70f8e3e414ac084d01e9d8b75b1cf', 'demo']
        
        for (const apiKey of apiKeys) {
          try {
            const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`
          const response = await fetch(url)
          
          if (response.ok) {
            const data = await response.json()
            
              // Processar instruções do Spoonacular
              const spoonacularInstructions = processSpoonacularInstructions(data)
              
              detailedRecipe = {
                ...detailedRecipe,
                fullInstructions: spoonacularInstructions,
                originalInstructions: data.instructions || data.summary || recipe.instructions,
                cookingMinutes: data.cookingMinutes,
                preparationMinutes: data.preparationMinutes,
                servings: data.servings,
                pricePerServing: data.pricePerServing,
                healthScore: data.healthScore,
                spoonacularScore: data.spoonacularScore,
                readyInMinutes: data.readyInMinutes,
                sourceUrl: data.sourceUrl,
                creditsText: translateToPortuguese(data.creditsText),
                license: data.license,
                // Traduzir arrays de informações
                cuisines: data.cuisines?.map(cuisine => translateToPortuguese(cuisine)) || [],
                dishTypes: data.dishTypes?.map(type => translateToPortuguese(type)) || [],
                diets: data.diets?.map(diet => translateToPortuguese(diet)) || [],
                occasions: data.occasions?.map(occasion => translateToPortuguese(occasion)) || [],
                // Traduzir ingredientes detalhados
                detailedIngredients: data.extendedIngredients?.map(ing => ({
                  name: translateToPortuguese(ing.name),
                  measure: translateToPortuguese(`${ing.amount} ${ing.unit}`),
                  original: translateToPortuguese(ing.original)
                })) || [],
                // Traduzir informações básicas
                title: translateToPortuguese(detailedRecipe.title),
                category: translateToPortuguese(detailedRecipe.category),
                area: translateToPortuguese(detailedRecipe.area)
              }
              break // Sair do loop se conseguiu buscar
            }
          } catch (error) {
            console.log(`⚠️ Erro ao buscar detalhes do Spoonacular com chave ${apiKey}:`, error)
          }
        }
      }
      
      // Para receitas locais, adicionar detalhes creativos
      if (recipe.source?.includes('Local') || recipe.source?.includes('Sugestão')) {
        const creativeDetails = generateCreativeDetails(recipe)
        detailedRecipe = { ...detailedRecipe, ...creativeDetails }
      }
      
      setSelectedRecipe(detailedRecipe)
      setShowRecipeModal(true)
      
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes da receita:', error)
      // Mostrar receita básica mesmo com erro
      setSelectedRecipe(recipe)
      setShowRecipeModal(true)
    } finally {
      setLoadingRecipeDetails(false)
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
        { name: 'Pimenta-do-reino', measure: 'a gosto' },
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
      // 1. Buscar no TheMealDB (API principal)
      console.log('🍽️ Buscando no TheMealDB...')
      const mealDbRecipes = await searchTheMealDB(selectedIngredients)
      console.log(`🍽️ TheMealDB retornou ${mealDbRecipes.length} receitas`)
      allRecipes = [...allRecipes, ...mealDbRecipes]
      
      // 2. SEMPRE tentar Spoonacular para ter mais variedade (mesmo que TheMealDB tenha resultados)
      console.log('🥄 Buscando no Spoonacular para complementar...')
      const spoonacularRecipes = await searchSpoonacular(selectedIngredients)
      console.log(`🥄 Spoonacular retornou ${spoonacularRecipes.length} receitas`)
      allRecipes = [...allRecipes, ...spoonacularRecipes]
      
      // 3. SEMPRE adicionar receitas criativas locais para garantir variedade
      console.log('🔄 Adicionando receitas criativas locais...')
      
      // Receitas criativas baseadas nos ingredientes selecionados
      selectedIngredients.forEach((ingredient, index) => {
        const creativeRecipes = [
          {
            id: `creative-${ingredient.id}-1`,
            title: `${ingredient.name} Refogado Especial`,
            image: `https://via.placeholder.com/300x200?text=${encodeURIComponent(ingredient.name + ' Refogado')}`,
            instructions: `Refogue ${ingredient.name} com alho, cebola e temperos de sua preferência. Uma receita simples e saborosa!`,
            ingredient: ingredient.name,
            category: 'Receita Criativa',
            area: 'Brasil',
            video: null,
            source: 'Sugestão Local',
            ingredientsList: `${ingredient.name}, alho, cebola, sal, pimenta`,
            relevanceScore: 25
          },
          {
            id: `creative-${ingredient.id}-2`,
            title: `Salada de ${ingredient.name}`,
            image: `https://via.placeholder.com/300x200?text=${encodeURIComponent('Salada ' + ingredient.name)}`,
            instructions: `Uma salada fresca e nutritiva com ${ingredient.name} como ingrediente principal. Ideal para refeições leves!`,
            ingredient: ingredient.name,
            category: 'Salada',
            area: 'Brasil',
            video: null,
            source: 'Sugestão Local',
            ingredientsList: `${ingredient.name}, alface, tomate, azeite`,
            relevanceScore: 20
          }
        ]
        
        creativeRecipes.forEach(recipe => {
          // Evitar duplicatas
          const exists = allRecipes.some(existing => existing.id === recipe.id)
          if (!exists) {
            allRecipes.push(recipe)
          }
        })
      })
      
      console.log(`✅ Total com receitas criativas: ${allRecipes.length}`)
      
      // 4. Se ainda não temos receitas, criar fallback de emergência
      if (allRecipes.length === 0) {
        console.log('🚨 Criando fallback de emergência...')
        
        selectedIngredients.slice(0, 3).forEach((ingredient, index) => {
          const emergencyRecipe = {
            id: `emergency-${ingredient.id}`,
            title: `${ingredient.name} Delicioso`,
            image: `https://via.placeholder.com/300x200?text=${encodeURIComponent(ingredient.name)}`,
            instructions: `Receita de emergência com ${ingredient.name}. Consulte livros de culinária para mais detalhes.`,
            ingredient: ingredient.name,
            category: 'Emergência',
            area: 'Local',
            video: null,
            source: 'Fallback de Emergência',
            ingredientsList: `${ingredient.name}, ingredientes básicos`,
            relevanceScore: 15
          }
          allRecipes.push(emergencyRecipe)
        })
        
        console.log(`✅ Criadas ${allRecipes.length} receitas de emergência`)
      }
      
      // Aplicar filtro de modo estrito se necessário
      if (isStrictMode && allRecipes.length > 0) {
        const filteredRecipes = allRecipes.filter(recipe => {
          if (!recipe.ingredientsList || recipe.source === 'Sugestão Local') return true
          
          const recipeIngredients = recipe.ingredientsList.toLowerCase()
          const userIngredients = selectedIngredients.map(ing => ing.name.toLowerCase())
          
          // Contar ingredientes correspondentes
          let matchCount = 0
          userIngredients.forEach(userIng => {
            if (!['sal', 'pimenta', 'azeite', 'açúcar'].includes(userIng)) {
              const englishName = translateToEnglish(userIng)
              if (recipeIngredients.includes(userIng) || recipeIngredients.includes(englishName)) {
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
      
      // Fallback de emergência
      const emergencyRecipes = selectedIngredients.slice(0, 3).map((ingredient, index) => ({
        id: `emergency-fallback-${ingredient.id}`,
        title: `${ingredient.name} Delicioso`,
        image: `https://via.placeholder.com/300x200?text=${encodeURIComponent(ingredient.name)}`,
        instructions: `Receita de emergência com ${ingredient.name}. Consulte livros de culinária ou sites especializados para instruções detalhadas.`,
        ingredient: ingredient.name,
        category: 'Emergência',
        area: 'Local',
        video: null,
        source: 'Fallback de Emergência',
        ingredientsList: `${ingredient.name}, ingredientes básicos`,
        relevanceScore: 10
      }))
      
      // Retornar receitas de emergência (SEM TRADUÇÃO)
      console.log(`✅ ${emergencyRecipes.length} receitas de emergência criadas`)
      
      return emergencyRecipes
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
    
    // Teste simples para verificar se está funcionando
    console.log('🧪 Teste: Criando receita de teste...')
    const testRecipe = {
      id: 'test-1',
      title: 'Receita de Teste com ' + (selected[0]?.name || 'Ingredientes'),
      image: 'https://via.placeholder.com/300x200?text=Receita+Teste',
      instructions: 'Esta é uma receita de teste para verificar se a funcionalidade está funcionando. Instruções detalhadas: 1. Prepare os ingredientes. 2. Cozinhe conforme indicado. 3. Sirva quente.',
      ingredient: selected[0]?.name || 'Arroz',
      category: 'Prato Principal',
      area: 'Brasil',
      video: null,
      source: 'Teste Local',
      ingredientsList: selected.map(ing => ing.name).join(', ') || 'Arroz, Sal, Água',
      relevanceScore: 100
    }
    
    console.log('🧪 Receita de teste criada:', testRecipe)
    
    console.log('🧪 Teste: Definindo receita de teste...')
    setRecipes([testRecipe])
    setShowRecipes(true)
    console.log('🧪 Teste: Receita de teste definida!')
    
    // Continuar com a busca real das APIs
    console.log('🔄 Continuando com busca real das APIs...')
    
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
      
      // Sempre criar receitas de fallback mais detalhadas
      const fallbackRecipes = selected.slice(0, 3).map((ingredient, index) => ({
        id: `fallback-${index}`,
        title: `Receita com ${ingredient.name}`,
        image: 'https://via.placeholder.com/300x200?text=Receita+com+' + encodeURIComponent(ingredient.name),
        instructions: `Uma deliciosa receita utilizando ${ingredient.name} como ingrediente principal. Esta é uma receita de fallback enquanto corrigimos a conexão com a API.`,
        ingredient: ingredient.name,
        category: 'Sugestão',
          area: 'Brasil',
        source: 'Fallback Local',
        ingredientsList: `${ingredient.name} e outros ingredientes básicos`,
        relevanceScore: 50
      }))
      
      setRecipes(fallbackRecipes)
      setShowRecipes(true)
      
      // Alertar o usuário sobre o problema
      alert('Houve um problema ao buscar receitas online. Mostrando sugestões locais.')
      
        } finally {
          console.log('🏁 Finalizando busca de receitas')
        }
  }

  return (
    <div className="app">
      <div className="main-layout">
        {/* Sidebar Esquerda */}
        <div className="sidebar">
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
                setActiveNav('home')
              }}
            >
              <span>Home</span>
            </a>
            <a 
              href="#" 
              className={`nav-item ${activeNav === 'grocery' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                setActiveNav('grocery')
              }}
            >
              <span>Minha Geladeira</span>
            </a>
            <a 
              href="#" 
              className={`nav-item ${activeNav === 'recipes' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                setActiveNav('recipes')
              }}
            >
              <span>Receitas</span>
            </a>
          </nav>
        </div>

        {/* Área de Conteúdo */}
        <div className="content-area">
          {/* Header */}
          <header className="header">
            <div className="header-actions">
              <button className="header-btn">🌙</button>
              <button className="header-btn login-btn" onClick={handleLogin}>
                {isLoggedIn ? '👤' : '👤'}
              </button>
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
                          <h3 className="meal-title">{meal.title}</h3>
                          <div className="meal-details">
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
                          {recipes.filter(r => r.source === 'TheMealDB').length > 0 && (
                            <span className="api-stat themealdb">
                              🍽️ {recipes.filter(r => r.source === 'TheMealDB').length} do TheMealDB
                          </span>
                          )}
                          {recipes.filter(r => r.source === 'Spoonacular').length > 0 && (
                            <span className="api-stat spoonacular">
                              🥄 {recipes.filter(r => r.source === 'Spoonacular').length} do Spoonacular
                            </span>
                          )}
                          {recipes.filter(r => r.source?.includes('Local') || r.source?.includes('Sugestão')).length > 0 && (
                            <span className="api-stat local">
                              💡 {recipes.filter(r => r.source?.includes('Local') || r.source?.includes('Sugestão')).length} sugestões locais
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
                                  {recipe.source === 'TheMealDB' && '🍽️ MDB'}
                                  {recipe.source === 'Spoonacular' && '🥄 SP'}
                                  {(recipe.source?.includes('Local') || recipe.source?.includes('Sugestão')) && '💡 LOC'}
                                  {recipe.source === 'Teste Local' && '🧪 TEST'}
                                  {recipe.source === 'Fallback de Emergência' && '🚨 EMG'}
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
                              <p className="recipe-instructions">
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
                                {recipe.apiType === 'themealdb' && '🍽️ MDB'}
                                {recipe.apiType === 'spoonacular' && '🥄 SP'}
                                {recipe.apiType === 'local' && '💡 LOC'}
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
                      <p>{selectedRecipe.instructions || 'Instruções não disponíveis'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <div className="login-header">
              <h2>Entrar na Conta</h2>
              <button 
                className="close-btn"
                onClick={() => setShowLoginModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="login-body">
              <div className="login-form">
                <div className="form-group">
                  <label>Email:</label>
                  <input 
                    type="email" 
                    placeholder="seu@email.com"
                    className="login-input"
                  />
                </div>
                <div className="form-group">
                  <label>Senha:</label>
                  <input 
                    type="password" 
                    placeholder="Sua senha"
                    className="login-input"
                  />
                </div>
                <div className="login-actions">
                  <button 
                    className="login-submit-btn"
                    onClick={() => {
                      setIsLoggedIn(true)
                      setShowLoginModal(false)
                    }}
                  >
                    Entrar
                  </button>
                  <button 
                    className="login-cancel-btn"
                    onClick={() => setShowLoginModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App