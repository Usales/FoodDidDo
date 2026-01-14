import { useEffect, useMemo, useState, useRef } from 'react'
import { useAppStore } from '../stores/appStore'
import { useAuth } from '../components/AuthProvider'
import { FiEdit3, FiTrash2, FiPlus, FiClock, FiDollarSign, FiThermometer } from 'react-icons/fi'
import './PageCommon.css'
import './DashboardPage.css'

const DASHBOARD_SETTINGS_KEY = 'dashboardSettings'
const defaultDashboardSettings = {
  showStatusPanel: true,
  showBusinessInsights: true,
  showMealSection: true
}

const defaultMeals = [
  {
    id: 'meal-1',
    title: 'Avocado toast',
    calories: '250 Cal',
    ingredients: 'Avocado, Bread, Eggs',
    time: '15 min',
    cost: '8.20',
    status: 'fazer'
  },
  {
    id: 'meal-2',
    title: 'Alfredo Pasta',
    calories: '450 Cal',
    ingredients: 'Alfredo, Chicken, Pasta',
    time: '30 min',
    cost: '12.50',
    status: 'planejado'
  },
  {
    id: 'meal-3',
    title: 'Quinoa Salad',
    calories: '200 Cal',
    ingredients: 'Carrot, Tomato, Mint',
    time: '10 min',
    cost: '5.10',
    status: 'finalizado'
  }
]

const initialForm = {
  title: '',
  calories: '',
  caloriesUnit: 'Cal',
  caloriesMeasureValue: '',
  caloriesMeasure: '',
  ingredients: '',
  time: '',
  timeUnit: 'Min',
  cost: '',
  status: 'fazer'
}

// Mapeamento de ingredientes para emojis
const ingredientEmojis = {
  // 🍍 FRUTAS
  'abacaxi': '🍍', 'pineapple': '🍍',
  'banana': '🍌',
  'maçã': '🍎', 'apple': '🍎',
  'pera': '🍐', 'pear': '🍐',
  'laranja': '🍊', 'orange': '🍊',
  'limão': '🍋', 'lemon': '🍋',
  'melancia': '🍉', 'watermelon': '🍉',
  'uva': '🍇', 'grape': '🍇',
  'morango': '🍓', 'strawberry': '🍓',
  'cereja': '🍒', 'cherry': '🍒',
  'pêssego': '🍑', 'peach': '🍑',
  'manga': '🥭', 'mango': '🥭',
  'coco': '🥥', 'coconut': '🥥',
  'kiwi': '🥝',
  'abacate': '🥑', 'avocado': '🥑',
  'ameixa': '🍑', 'plum': '🍑',
  'figo': '🍈', 'fig': '🍈',
  'framboesa': '🍓', 'raspberry': '🍓',
  'mirtilo': '🫐', 'blueberry': '🫐',
  'damasco': '🍑', 'apricot': '🍑',
  'banana seca': '🍌', 'dried banana': '🍌',
  'acerola': '🍒',
  'açaí': '🫐', 'acai': '🫐',
  'amora': '🫐', 'blackberry': '🫐',
  'araçá': '🍎',
  'cajá': '🥭',
  'caju': '🥭', 'cashew fruit': '🥭',
  'caqui': '🍅', 'persimmon': '🍅',
  'carambola': '⭐', 'starfruit': '⭐',
  'ciriguela': '🍒',
  'cupuaçu': '🥥',
  'graviola': '🍈', 'soursop': '🍈',
  'goiaba': '🍐', 'guava': '🍐',
  'jabuticaba': '🫐',
  'jaca': '🍈', 'jackfruit': '🍈',
  'lima': '🍋', 'lime': '🍋',
  'lichia': '🍒', 'lychee': '🍒',
  'mamão': '🍈', 'papaya': '🍈',
  'maracujá': '🍋', 'passion fruit': '🍋',
  'nectarina': '🍑', 'nectarine': '🍑',
  'physalis': '🍒', 'golden berry': '🍒',
  'pitanga': '🍒',
  'pitaia': '🐉', 'dragon fruit': '🐉',
  'romã': '🍎', 'pomegranate': '🍎',
  'tangerina': '🍊', 'mandarin': '🍊',
  'mexerica': '🍊', 'clementine': '🍊',
  'tâmara': '🌴', 'date': '🌴',
  'umbu': '🍈',
  'uva passa': '🍇', 'raisin': '🍇',
  'grapefruit': '🍊', 'toranja': '🍊',
  'kumquat': '🍊',
  'yuzu': '🍋',
  'bergamota': '🍊', 'bergamot': '🍊',
  'pomelo': '🍊',
  'fruta do conde': '🍈', 'custard apple': '🍈', 'atemoya': '🍈',
  'sapoti': '🍈', 'sapodilla': '🍈',
  'rambutan': '🍒',
  'longan': '🍒',
  'mangostão': '🍈', 'mangosteen': '🍈',
  'salak': '🍈', 'snake fruit': '🍈',
  'durian': '🍈',
  'cranberry': '🍒', 'oxicoco': '🍒',
  'gooseberry': '🍒', 'groselha espinhosa': '🍒',
  'currant': '🍒', 'groselha': '🍒',
  'boysenberry': '🍓',
  'figo da índia': '🍈', 'prickly pear': '🍈',
  'feijoa': '🍐', 'pineapple guava': '🍐',
  'nêspera': '🍑', 'loquat': '🍑',
  'marmelo': '🍐', 'quince': '🍐',
  'jambo': '🍎', 'rose apple': '🍎',
  'pequi': '🥭',
  'bacuri': '🍈',
  'tucumã': '🥭',

  // 🥦 VEGETAIS E LEGUMES
  'alface': '🥬', 'lettuce': '🥬',
  'couve': '🥬', 'kale': '🥬',
  'espinafre': '🥬', 'spinach': '🥬',
  'rúcula': '🥬', 'arugula': '🥬',
  'brócolis': '🥦', 'broccoli': '🥦',
  'cenoura': '🥕', 'carrot': '🥕',
  'batata': '🥔', 'potato': '🥔',
  'batata doce': '🍠', 'sweet potato': '🍠',
  'cebola': '🧅', 'onion': '🧅',
  'alho': '🧄', 'garlic': '🧄',
  'milho': '🌽', 'corn': '🌽',
  'pepino': '🥒', 'cucumber': '🥒',
  'berinjela': '🍆', 'eggplant': '🍆',
  'abóbora': '🎃', 'pumpkin': '🎃',
  'pimentão': '🌶️', 'bell pepper': '🌶️',
  'tomate': '🍅', 'tomato': '🍅',
  'cogumelo': '🍄', 'mushroom': '🍄',
  'ervilha': '🟢', 'peas': '🟢',
  'nabo': '🥕', 'turnip': '🥕',
  'aspargo': '🥬', 'asparagus': '🥬',
  'alcachofra': '🥬', 'artichoke': '🥬',
  'bok choy': '🥬', 'acelga chinesa': '🥬',
  'broto de bambu': '🎍', 'bamboo shoot': '🎍',
  'brócolis rabe': '🥦', 'broccoli rabe': '🥦',
  'coração de palma': '🌴', 'hearts of palm': '🌴',
  'endívia': '🥬', 'endive': '🥬',
  'funcho': '🌿',
  'jiló': '🍆', 'jilo': '🍆',
  'kohlrabi': '🥬', 'couve-galema': '🥬',
  'lagarto verde': '🍃', 'chayote': '🍃',
  'milho verde': '🌽', 'green corn': '🌽',
  'mâche': '🥬', 'corn salad': '🥬',
  'mutamba': '🌿', 'moth plant': '🌿',
  'palmito': '🌴', 'palm heart': '🌴',
  'pod': '🥬', 'okra': '🥬', 'quiabo': '🥬',
  'rabanete': '🔴', 'radish': '🔴',
  'raízes de loto': '🌱', 'lotus root': '🌱',
  'seleta de legumes': '🥕', 'mixed vegetables': '🥕',
  'silantro': '🌿', 'coentro fresco': '🌿',
  'wasabi': '🌶️', 'wasabi root': '🌶️',
  'abobrinha': '🥒', 'zucchini': '🥒',
  'chuchu': '🥒', 'chayote squash': '🥒',
  'couve-flor': '🥦', 'cauliflower': '🥦',
  'repolho': '🥬', 'cabbage': '🥬',
  'repolho roxo': '🥬', 'red cabbage': '🥬',
  'repolho branco': '🥬', 'white cabbage': '🥬',
  'aipo': '🥬', 'celery': '🥬',
  'cebolinha': '🌿', 'chives': '🌿',
  'hortelã': '🌿', 'mint': '🌿',
  'manjericão': '🌿', 'basil': '🌿',
  'tomilho': '🌿', 'thyme': '🌿',
  'alecrim': '🌿', 'rosemary': '🌿',
  'orégano fresco': '🌿',
  'beterraba': '🍠', 'beetroot': '🍠',
  'inhame': '🍠', 'yam': '🍠',
  'macaxeira': '🍠', 'cassava': '🍠', 'mandioca': '🍠',
  'taro': '🍠', 'taro root': '🍠',
  'grão-de-bico': '🟢', 'chickpeas': '🟢',
  'mostarda': '🥬', 'mustard greens': '🥬',
  'radicchio': '🥬',
  'chicória': '🥬', 'chicory': '🥬',
  'alho-poró': '🥬', 'leek': '🥬',
  'cebola roxa': '🧅', 'red onion': '🧅',
  'beldroega': '🌿', 'purslane': '🌿',
  'couve-de-bruxelas': '🥦', 'brussels sprouts': '🥦',
  'ervas finas': '🌿', 'mixed herbs': '🌿',

// 🌶️ Pimentas e similares
  'jalapeno': '🌶️','jalapeno ': '🌶️',
  'habanero': '🌶️',
  'caiena' : '🌶️','cayenne ': '🌶️',
  'serrano': '🌶️',
  'pimenta do reino': '🧂',
  'malagueta': '🌶️', 'malagueta pepper': '🌶️',
  'biquinho': '🌶️', 'sweety drop': '🌶️',
  'cumari': '🌶️', 'cumari pepper': '🌶️',
  'cumari do pará': '🌶️',
  'dedo-de-moça': '🌶️', 'finger pepper': '🌶️',
  'chipotle': '🌶️',
  'ancho': '🌶️',
  'pasilla': '🌶️',
  'guajillo': '🌶️',
  'poblano': '🌶️',
  'thai chili': '🌶️', 'pimenta tailandesa': '🌶️',
  'bird’s eye chili': '🌶️', 'piri piri': '🌶️',
  'peri-peri': '🌶️',
  'scotch bonnet': '🌶️',
  'carolina reaper': '🌶️',
  'ghost pepper': '🌶️', 'bhut jolokia': '🌶️',
  'trinidad moruga scorpion': '🌶️',
  'aji amarillo': '🌶️',
  'aji panca': '🌶️',
  'aji limo': '🌶️',
  'pepperoncino': '🌶️',
  'calabrian chili': '🌶️', 'pimenta calabresa fresca': '🌶️',
  'szechuan pepper': '🧂', 'pimenta sichuan': '🧂',
  'pink peppercorn': '🧂',


  // 🌾 GRÃOS, CEREAIS E LEGUMINOSAS
  'arroz': '🍚', 'rice': '🍚',
  'arroz integral': '🍚', 'brown rice': '🍚',
  'arroz arbório': '🍚', 'arborio rice': '🍚',
  'arroz jasmine': '🍚', 'jasmine rice': '🍚',
  'arroz basmati': '🍚', 'basmati rice': '🍚',
  'arroz selvagem': '🍚', 'wild rice': '🍚',
  'arroz negro': '🍚', 'black rice': '🍚',
  'arroz vermelho': '🍚', 'red rice': '🍚',
  'arroz parboilizado': '🍚', 'parboiled rice': '🍚',
  'feijão': '🫘', 'beans': '🫘',
  'feijão preto': '🫘', 'black beans': '🫘',
  'feijão vermelho': '🫘', 'red beans': '🫘',
  'feijão branco': '🫘', 'white beans': '🫘',
  'feijão carioca': '🫘', 'pinto beans': '🫘',
  'feijão fradinho': '🫘', 'black-eyed peas': '🫘',
  'feijão azuki': '🫘', 'adzuki beans': '🫘',
  'feijão mungo': '🫘', 'mung beans': '🫘',
  'feijão de corda': '🫘', 'string beans': '🫘',
  'feijão roxinho': '🫘', 'purple beans': '🫘',
  'lentilha': '🫘', 'lentils': '🫘',
  'lentilha vermelha': '🫘', 'red lentils': '🫘',
  'lentilha verde': '🫘', 'green lentils': '🫘',
  'lentilha preta': '🫘', 'black lentils': '🫘',
  'grão de bico': '🫘', 'chickpea': '🫘',
  'grão de bico torrado': '🫘', 'roasted chickpeas': '🫘',
  'ervilha seca': '🫘', 'split peas': '🫘',
  'ervilha verde': '🫘', 'green peas': '🫘',
  'ervilha amarela': '🫘', 'yellow peas': '🫘',
  'soja': '🫘', 'soybeans': '🫘',
  'edamame': '🫘',
  'fava': '🫘', 'fava beans': '🫘',
  'trigo': '🌾', 'wheat': '🌾',
  'trigo sarraceno': '🌾', 'buckwheat': '🌾',
  'trigo bulgur': '🌾', 'bulgur': '🌾',
  'aveia': '🌾', 'oats': '🌾',
  'aveia em flocos': '🌾', 'rolled oats': '🌾',
  'quinoa': '🌾',
  'quinoa branca': '🌾', 'white quinoa': '🌾',
  'quinoa vermelha': '🌾', 'red quinoa': '🌾',
  'quinoa preta': '🌾', 'black quinoa': '🌾',
  'cevada': '🌾', 'barley': '🌾',
  'cevada perlada': '🌾', 'pearl barley': '🌾',
  'millet': '🌾', 'painço': '🌾',
  'amaranto': '🌾', 'amaranth': '🌾',
  'centeio': '🌾', 'rye': '🌾',
  'espelta': '🌾', 'spelt': '🌾',
  'sorgo': '🌾', 'sorghum': '🌾',
  'couscous': '🌾',
  'couscous marroquino': '🌾', 'moroccan couscous': '🌾',
  'farro': '🌾',
  'teff': '🌾',
  'trigo kamut': '🌾', 'kamut': '🌾',

  // 🍞 MASSAS E PANIFICAÇÃO
  'pão': '🍞', 'bread': '🍞',
  'pão integral': '🍞', 'whole bread': '🍞', 'whole wheat bread': '🍞',
  'pão francês': '🍞', 'french bread': '🍞',
  'pão italiano': '🍞', 'italian bread': '🍞',
  'pão de forma': '🍞', 'sliced bread': '🍞',
  'pão doce': '🍞', 'sweet bread': '🍞',
  'pão de centeio': '🍞', 'rye bread': '🍞',
  'pão de aveia': '🍞', 'oat bread': '🍞',
  'pão ciabatta': '🍞', 'ciabatta': '🍞',
  'baguette': '🥖',
  'focaccia': '🍞',
  'brioche': '🍞',
  'croissant': '🥐',
  'pão de azeitona': '🍞', 'olive bread': '🍞',
  'pão de alho': '🍞', 'garlic bread': '🍞',
  'pão de queijo': '🧀', 'cheese bread': '🧀',
  'pão naan': '🫓', 'naan': '🫓',
  'pão pita': '🫓', 'pita bread': '🫓',
  'tortilla': '🫓',
  'wrap': '🫓',
  'taco shell': '🌮',
  'macarrão': '🍝', 'pasta': '🍝',
  'espaguete': '🍝', 'spaghetti': '🍝',
  'macarrão penne': '🍝', 'penne': '🍝',
  'macarrão fusilli': '🍝', 'fusilli': '🍝',
  'macarrão rigatoni': '🍝', 'rigatoni': '🍝',
  'macarrão fettuccine': '🍝', 'fettuccine': '🍝',
  'macarrão linguine': '🍝', 'linguine': '🍝',
  'macarrão tagliatelle': '🍝', 'tagliatelle': '🍝',
  'macarrão parpadelle': '🍝', 'parpadelle': '🍝',
  'macarrão farfalle': '🍝', 'farfalle': '🍝', 'bow tie pasta': '🍝',
  'macarrão orecchiette': '🍝', 'orecchiette': '🍝',
  'macarrão conchiglie': '🍝', 'conchiglie': '🍝', 'shell pasta': '🍝',
  'macarrão rotini': '🍝', 'rotini': '🍝',
  'macarrão ziti': '🍝', 'ziti': '🍝',
  'macarrão cannelloni': '🍝', 'cannelloni': '🍝',
  'macarrão manicotti': '🍝', 'manicotti': '🍝',
  'ravioli': '🥟',
  'tortellini': '🥟',
  'gnocchi': '🥟',
  'lasanha': '🍝', 'lasagna': '🍝',
  'lasanha verde': '🍝', 'green lasagna': '🍝',
  'massa fresca': '🍝', 'fresh pasta': '🍝',
  'massa seca': '🍝', 'dried pasta': '🍝',
  'massa integral': '🍝', 'whole wheat pasta': '🍝',
  'massa de espinafre': '🍝', 'spinach pasta': '🍝',
  'massa de tomate': '🍝', 'tomato pasta': '🍝',
  'massa': '🍝', 'dough': '🍝',
  'massa de pizza': '🍕', 'pizza dough': '🍕',
  'massa folhada': '🥐', 'puff pastry': '🥐',
  'massa de torta': '🥧', 'pie crust': '🥧',
  'pizza': '🍕',
  'pizza margherita': '🍕',
  'pizza napolitana': '🍕', 'neapolitan pizza': '🍕',
  'pizza calzone': '🥟',
  'pizza stromboli': '🍕',
  'pão de hambúrguer': '🍔', 'burger bun': '🍔',
  'pão de hot dog': '🌭', 'hot dog bun': '🌭',
  'pretzel': '🥨',
  'bagel': '🥯',
  'muffin': '🧁',
  'muffin inglês': '🍞', 'english muffin': '🍞',
  'scone': '🍞',
  'biscoito': '🍪', 'cookie': '🍪',
  'biscoito salgado': '🍪', 'cracker': '🍪',

  // 🥩 PROTEÍNAS ANIMAIS
  'carne': '🥩', 'meat': '🥩',
  'carne bovina': '🥩', 'beef': '🥩',
  'picanha': '🥩',
  'alcatra': '🥩', 'sirloin': '🥩',
  'contrafilé': '🥩', 'tenderloin': '🥩',
  'filé mignon': '🥩', 'filet mignon': '🥩',
  'costela': '🥩', 'ribs': '🥩',
  'costela de boi': '🥩', 'beef ribs': '🥩',
  'bife de chorizo': '🥩',
  'maminha': '🥩',
  'fraldinha': '🥩', 'skirt steak': '🥩',
  'coxão mole': '🥩', 'rump steak': '🥩',
  'coxão duro': '🥩',
  'patinho': '🥩',
  'acém': '🥩',
  'lagarto': '🥩',
  'carne moída': '🥩', 'ground beef': '🥩',
  'hambúrguer': '🍔', 'burger': '🍔',
  'carne de porco': '🥩', 'pork': '🥩',
  'lombo de porco': '🥩', 'pork loin': '🥩',
  'costela de porco': '🥩', 'pork ribs': '🥩',
  'pancetta': '🥓',
  'presunto': '🥓', 'ham': '🥓',
  'presunto parma': '🥓', 'prosciutto': '🥓',
  'bacon': '🥓',
  'toucinho': '🥓', 'pork belly': '🥓',
  'bacon canadense': '🥓', 'canadian bacon': '🥓',
  'salame': '🥓', 'salami': '🥓',
  'pepperoni': '🥓',
  'mortadela': '🥓', 'mortadella': '🥓',
  'linguiça': '🌭', 'sausage': '🌭',
  'linguiça calabresa': '🌭', 'calabrian sausage': '🌭',
  'linguiça toscana': '🌭', 'tuscan sausage': '🌭',
  'linguiça portuguesa': '🌭', 'portuguese sausage': '🌭',
  'salsicha': '🌭', 'hot dog': '🌭',
  'chouriço': '🌭', 'chorizo': '🌭',
  'frango': '🍗', 'chicken': '🍗',
  'peito de frango': '🍗', 'chicken breast': '🍗',
  'coxa de frango': '🍗', 'chicken thigh': '🍗',
  'sobrecoxa de frango': '🍗', 'chicken drumstick': '🍗',
  'asa de frango': '🍗', 'chicken wing': '🍗',
  'frango inteiro': '🍗', 'whole chicken': '🍗',
  'frango desfiado': '🍗', 'shredded chicken': '🍗',
  'frango grelhado': '🍗', 'grilled chicken': '🍗',
  'frango frito': '🍗', 'fried chicken': '🍗',
  'peru': '🦃', 'turkey': '🦃',
  'peito de peru': '🦃', 'turkey breast': '🦃',
  'peru defumado': '🦃', 'smoked turkey': '🦃',
  'peru moído': '🦃', 'ground turkey': '🦃',
  'pato': '🦆', 'duck': '🦆',
  'peito de pato': '🦆', 'duck breast': '🦆',
  'ganso': '🦆', 'goose': '🦆',
  'codorna': '🦃', 'quail': '🦃',
  'faisão': '🦃', 'pheasant': '🦃',
  'coelho': '🐰', 'rabbit': '🐰',
  'carneiro': '🥩', 'lamb': '🥩',
  'cordeiro': '🥩',
  'perna de cordeiro': '🥩', 'leg of lamb': '🥩',
  'costela de cordeiro': '🥩', 'lamb ribs': '🥩',
  'cabrito': '🥩', 'goat': '🥩',
  'búfalo': '🥩', 'buffalo': '🥩',
  'javali': '🥩', 'wild boar': '🥩',
  'veado': '🥩', 'venison': '🥩',
  'ovo': '🥚', 'eggs': '🥚', 'egg': '🥚',
  'ovos mexidos': '🍳', 'scrambled eggs': '🍳',
  'ovo frito': '🍳', 'fried egg': '🍳',
  'ovo pochê': '🍳', 'poached egg': '🍳',
  'ovo cozido': '🥚', 'boiled egg': '🥚',
  'ovo estrelado': '🍳', 'sunny side up': '🍳',
  'omelete': '🍳', 'omelet': '🍳',
  'ovo de codorna': '🥚', 'quail egg': '🥚',
  'gema': '🥚', 'yolk': '🥚',
  'clara': '🥚', 'egg white': '🥚',

  // 🐟 FRUTOS DO MAR
  'peixe': '🐟', 'fish': '🐟',
  'salmão': '🐟', 'salmon': '🐟',
  'salmão grelhado': '🐟', 'grilled salmon': '🐟',
  'salmão defumado': '🐟', 'smoked salmon': '🐟',
  'atum': '🐟', 'tuna': '🐟',
  'atum grelhado': '🐟', 'grilled tuna': '🐟',
  'atum enlatado': '🐟', 'canned tuna': '🐟',
  'atum vermelho': '🐟', 'bluefin tuna': '🐟',
  'bacalhau': '🐟', 'cod': '🐟',
  'bacalhau seco': '🐟', 'dried cod': '🐟',
  'bacalhau fresco': '🐟', 'fresh cod': '🐟',
  'tilápia': '🐟', 'tilapia': '🐟',
  'truta': '🐟', 'trout': '🐟',
  'sardinha': '🐟', 'sardine': '🐟',
  'sardinha enlatada': '🐟', 'canned sardine': '🐟',
  'anchova': '🐟', 'anchovy': '🐟',
  'cavala': '🐟', 'mackerel': '🐟',
  'arenque': '🐟', 'herring': '🐟',
  'linguado': '🐟', 'sole': '🐟',
  'robalo': '🐟', 'sea bass': '🐟',
  'dourado': '🐟', 'dorado': '🐟',
  'pescada': '🐟', 'whiting': '🐟',
  'garoupa': '🐟', 'grouper': '🐟',
  'cherne': '🐟', 'wreckfish': '🐟',
  'badejo': '🐟',
  'cação': '🦈', 'shark': '🦈',
  'raia': '🐟', 'ray': '🐟',
  'enguia': '🐟', 'eel': '🐟',
  'camarão': '🦐', 'shrimp': '🦐',
  'camarão rosa': '🦐', 'pink shrimp': '🦐',
  'camarão cinza': '🦐', 'gray shrimp': '🦐',
  'camarão tigre': '🦐', 'tiger shrimp': '🦐',
  'camarão grelhado': '🦐', 'grilled shrimp': '🦐',
  'camarão frito': '🦐', 'fried shrimp': '🦐',
  'camarão empanado': '🦐', 'breaded shrimp': '🦐',
  'lagosta': '🦞', 'lobster': '🦞',
  'lagosta grelhada': '🦞', 'grilled lobster': '🦞',
  'lagosta cozida': '🦞', 'boiled lobster': '🦞',
  'lagostim': '🦞', 'crayfish': '🦞',
  'caranguejo': '🦀', 'crab': '🦀',
  'caranguejo azul': '🦀', 'blue crab': '🦀',
  'caranguejo rei': '🦀', 'king crab': '🦀',
  'caranguejo do alaska': '🦀', 'alaska crab': '🦀',
  'siri': '🦀',
  'ostra': '🦪', 'oyster': '🦪',
  'ostra fresca': '🦪', 'fresh oyster': '🦪',
  'ostra grelhada': '🦪', 'grilled oyster': '🦪',
  'vieira': '🦪', 'scallop': '🦪',
  'vieira grelhada': '🦪', 'grilled scallop': '🦪',
  'mexilhão': '🦪', 'mussel': '🦪',
  'mexilhão verde': '🦪', 'green mussel': '🦪',
  'berbigão': '🦪', 'cockle': '🦪',
  'amêijoa': '🦪', 'clam': '🦪',
  'amêijoa branca': '🦪', 'white clam': '🦪',
  'amêijoa vermelha': '🦪', 'red clam': '🦪',
  'polvo': '🐙', 'octopus': '🐙',
  'polvo grelhado': '🐙', 'grilled octopus': '🐙',
  'polvo cozido': '🐙', 'boiled octopus': '🐙',
  'lula': '🦑', 'squid': '🦑',
  'lula grelhada': '🦑', 'grilled squid': '🦑',
  'lula frita': '🦑', 'fried squid': '🦑',
  'lula empanada': '🦑', 'breaded squid': '🦑',
  'anéis de lula': '🦑', 'calamari rings': '🦑',
  'choco': '🦑', 'cuttlefish': '🦑',
  'ouriço do mar': '🦔', 'sea urchin': '🦔',
  'pepino do mar': '🦔', 'sea cucumber': '🦔',
  'caranguejo mole': '🦀', 'soft shell crab': '🦀',
  'caranguejo de coco': '🦀', 'coconut crab': '🦀',
  'siri mole': '🦀',
  'siri açu': '🦀',
  'caranguejo de pedra': '🦀', 'stone crab': '🦀',
  'caranguejo de neve': '🦀', 'snow crab': '🦀',
  'caranguejo dungeness': '🦀', 'dungeness crab': '🦀',

  // 🧀 LATICÍNIOS
  'leite': '🥛', 'milk': '🥛',
  'leite integral': '🥛', 'whole milk': '🥛',
  'leite desnatado': '🥛', 'skim milk': '🥛',
  'leite semidesnatado': '🥛', 'semi-skimmed milk': '🥛',
  'leite de cabra': '🥛', 'goat milk': '🥛',
  'leite de ovelha': '🥛', 'sheep milk': '🥛',
  'leite condensado': '🥛', 'condensed milk': '🥛',
  'leite em pó': '🥛', 'powdered milk': '🥛',
  'queijo': '🧀', 'cheese': '🧀',
  'queijo mussarela': '🧀', 'mozzarella': '🧀',
  'queijo parmesão': '🧀', 'parmesan': '🧀',
  'queijo cheddar': '🧀', 'cheddar': '🧀',
  'queijo gouda': '🧀', 'gouda': '🧀',
  'queijo brie': '🧀', 'brie': '🧀',
  'queijo camembert': '🧀', 'camembert': '🧀',
  'queijo gorgonzola': '🧀', 'gorgonzola': '🧀',
  'queijo roquefort': '🧀', 'roquefort': '🧀',
  'queijo azul': '🧀', 'blue cheese': '🧀',
  'queijo suíço': '🧀', 'swiss cheese': '🧀',
  'queijo provolone': '🧀', 'provolone': '🧀',
  'queijo ricota': '🧀', 'ricotta': '🧀',
  'queijo cottage': '🧀', 'cottage cheese': '🧀',
  'queijo cremoso': '🧀', 'cream cheese': '🧀',
  'queijo feta': '🧀', 'feta': '🧀',
  'queijo halloumi': '🧀', 'halloumi': '🧀',
  'queijo manchego': '🧀', 'manchego': '🧀',
  'queijo gruyère': '🧀', 'gruyere': '🧀',
  'queijo emmental': '🧀', 'emmental': '🧀',
  'queijo pecorino': '🧀', 'pecorino': '🧀',
  'queijo asiago': '🧀', 'asiago': '🧀',
  'queijo fontina': '🧀', 'fontina': '🧀',
  'queijo taleggio': '🧀', 'taleggio': '🧀',
  'queijo reino': '🧀', 'king cheese': '🧀',
  'queijo minas': '🧀', 'minas cheese': '🧀',
  'queijo coalho': '🧀', 'coalho cheese': '🧀',
  'queijo canastra': '🧀', 'canastra cheese': '🧀',
  'queijo do reino': '🧀',
  'queijo prato': '🧀', 'prato cheese': '🧀',
  'queijo minas frescal': '🧀', 'fresh minas cheese': '🧀',
  'queijo minas padrão': '🧀', 'standard minas cheese': '🧀',
  'queijo minas curado': '🧀', 'cured minas cheese': '🧀',
  'queijo minas meia cura': '🧀', 'half-cured minas cheese': '🧀',
  'manteiga': '🧈', 'butter': '🧈',
  'manteiga com sal': '🧈', 'salted butter': '🧈',
  'manteiga sem sal': '🧈', 'unsalted butter': '🧈',
  'manteiga clarificada': '🧈', 'clarified butter': '🧈',
  'manteiga ghee': '🧈', 'ghee': '🧈',
  'manteiga de amendoim': '🥜', 'peanut butter': '🥜',
  'iogurte': '🥛', 'yogurt': '🥛', 'yoghurt': '🥛',
  'iogurte grego': '🥛', 'greek yogurt': '🥛',
  'iogurte natural': '🥛', 'natural yogurt': '🥛',
  'iogurte desnatado': '🥛', 'low-fat yogurt': '🥛',
  'iogurte integral': '🥛', 'full-fat yogurt': '🥛',
  'iogurte de frutas': '🥛', 'fruit yogurt': '🥛',
  'iogurte de morango': '🥛', 'strawberry yogurt': '🥛',
  'iogurte de pêssego': '🥛', 'peach yogurt': '🥛',
  'iogurte de baunilha': '🥛', 'vanilla yogurt': '🥛',
  'creme de leite': '🥛', 'cream': '🥛',
  'creme de leite fresco': '🥛', 'fresh cream': '🥛',
  'creme de leite de caixinha': '🥛', 'boxed cream': '🥛',
  'creme de leite para culinária': '🥛', 'cooking cream': '🥛',
  'creme de leite para chantilly': '🥛', 'whipping cream': '🥛',
  'creme azedo': '🥛', 'sour cream': '🥛',
  'creme fraiche': '🥛', 'crème fraîche': '🥛',
  'nata': '🥛', 'heavy cream': '🥛',
  'nata batida': '🥛', 'whipped cream': '🥛',
  'requeijão': '🧀', 'cream cheese spread': '🧀',
  'requeijão cremoso': '🧀', 'creamy requeijão': '🧀',
  'catupiry': '🧀',
  'queijo ralado': '🧀', 'grated cheese': '🧀',
  'queijo parmesão ralado': '🧀', 'grated parmesan': '🧀',
  'queijo mussarela ralada': '🧀', 'grated mozzarella': '🧀',
  'sorvete': '🍦', 'ice cream': '🍦',
  'sorvete de baunilha': '🍦', 'vanilla ice cream': '🍦',
  'sorvete de chocolate': '🍦', 'chocolate ice cream': '🍦',
  'sorvete de morango': '🍦', 'strawberry ice cream': '🍦',
  'gelato': '🍦',
  'sorbet': '🍧',
  'frozen yogurt': '🍦',
  'coalhada': '🥛', 'curd': '🥛',
  'coalhada seca': '🥛', 'dried curd': '🥛',
  'leite fermentado': '🥛', 'fermented milk': '🥛',
  'kefir': '🥛',
  'buttermilk': '🥛', 'leitelho': '🥛',
  'nata do leite': '🥛', 'milk cream': '🥛',
  'soro de leite': '🥛', 'whey': '🥛',

  // 🥜 OLEAGINOSAS
  'amendoim': '🥜', 'peanut': '🥜',
  'amendoim torrado': '🥜', 'roasted peanuts': '🥜',
  'amendoim salgado': '🥜', 'salted peanuts': '🥜',
  'amendoim doce': '🥜', 'sweet peanut': '🥜',
  'amendoim japonês': '🥜', 'japanese peanut': '🥜',
  'castanha': '🌰', 'nuts': '🌰',
  'castanha do pará': '🌰', 'brazil nut': '🌰',
  'castanha de caju': '🌰', 'cashew': '🌰',
  'castanha de caju torrada': '🌰', 'roasted cashew': '🌰',
  'castanha de caju salgada': '🌰', 'salted cashew': '🌰',
  'castanha portuguesa': '🌰', 'portuguese chestnut': '🌰',
  'castanha portuguesa assada': '🌰', 'roasted chestnut': '🌰',
  'amêndoa': '🌰', 'almond': '🌰',
  'amêndoa torrada': '🌰', 'roasted almond': '🌰',
  'amêndoa laminada': '🌰', 'sliced almond': '🌰',
  'amêndoa em flocos': '🌰', 'almond flakes': '🌰',
  'amêndoa doce': '🌰', 'sweet almond': '🌰',
  'amêndoa amarga': '🌰', 'bitter almond': '🌰',
  'nozes': '🌰', 'walnut': '🌰',
  'nozes inteiras': '🌰', 'whole walnuts': '🌰',
  'nozes quebradas': '🌰', 'chopped walnuts': '🌰',
  'nozes em pedaços': '🌰', 'walnut pieces': '🌰',
  'avelã': '🌰', 'hazelnut': '🌰',
  'avelã torrada': '🌰', 'roasted hazelnut': '🌰',
  'avelã em pó': '🌰', 'hazelnut powder': '🌰',
  'pistache': '🌰', 'pistachio': '🌰',
  'pistache torrado': '🌰', 'roasted pistachio': '🌰',
  'pistache salgado': '🌰', 'salted pistachio': '🌰',
  'pistache sem casca': '🌰', 'shelled pistachio': '🌰',
  'macadâmia': '🌰', 'macadamia': '🌰',
  'macadâmia torrada': '🌰', 'roasted macadamia': '🌰',
  'macadâmia salgada': '🌰', 'salted macadamia': '🌰',
  'pinhão': '🌰', 'pine nut': '🌰',
  'pinhão torrado': '🌰', 'roasted pine nut': '🌰',
  'pecã': '🌰', 'pecan': '🌰',
  'pecã torrada': '🌰', 'roasted pecan': '🌰',
  'noz macadâmia': '🌰', 'macadamia nut': '🌰',
  'noz pecã': '🌰', 'pecan nut': '🌰',
  'noz de cola': '🌰', 'cola nut': '🌰',
  'semente de girassol': '🌻', 'sunflower seed': '🌻',
  'semente de girassol torrada': '🌻', 'roasted sunflower seed': '🌻',
  'semente de girassol salgada': '🌻', 'salted sunflower seed': '🌻',
  'semente de abóbora': '🎃', 'pumpkin seed': '🎃',
  'semente de abóbora torrada': '🎃', 'roasted pumpkin seed': '🎃',
  'semente de abóbora salgada': '🎃', 'salted pumpkin seed': '🎃',
  'semente de gergelim': '🫘', 'sesame seed': '🫘',
  'semente de gergelim torrada': '🫘', 'roasted sesame seed': '🫘',
  'semente de gergelim preta': '🫘', 'black sesame seed': '🫘',
  'semente de gergelim branca': '🫘', 'white sesame seed': '🫘',
  'semente de linhaça': '🫘', 'flax seed': '🫘',
  'semente de linhaça dourada': '🫘', 'golden flax seed': '🫘',
  'semente de linhaça marrom': '🫘', 'brown flax seed': '🫘',
  'semente de chia': '🫘', 'chia seed': '🫘',
  'semente de papoula': '🫘', 'poppy seed': '🫘',
  'semente de cânhamo': '🫘', 'hemp seed': '🫘',
  'castanha de baru': '🌰', 'baru nut': '🌰',
  'castanha de baru torrada': '🌰', 'roasted baru nut': '🌰',

  // 🌿 ERVAS, ESPECIARIAS E CONDIMENTOS
  'sal': '🧂', 'salt': '🧂',
  'sal grosso': '🧂', 'coarse salt': '🧂',
  'sal fino': '🧂', 'fine salt': '🧂',
  'sal marinho': '🧂', 'sea salt': '🧂',
  'sal rosa': '🧂', 'pink salt': '🧂',
  'sal do himalaia': '🧂', 'himalayan salt': '🧂',
  'sal kosher': '🧂', 'kosher salt': '🧂',
  'açúcar': '🍬', 'sugar': '🍬',
  'açúcar refinado': '🍬', 'refined sugar': '🍬',
  'açúcar cristal': '🍬', 'crystal sugar': '🍬',
  'açúcar mascavo': '🍬', 'brown sugar': '🍬',
  'açúcar demerara': '🍬', 'demerara sugar': '🍬',
  'açúcar de coco': '🍬', 'coconut sugar': '🍬',
  'açúcar de confeiteiro': '🍬', 'powdered sugar': '🍬',
  'mel': '🍯', 'honey': '🍯',
  'mel de abelha': '🍯', 'bee honey': '🍯',
  'mel silvestre': '🍯', 'wild honey': '🍯',
  'mel de eucalipto': '🍯', 'eucalyptus honey': '🍯',
  'mel de laranjeira': '🍯', 'orange blossom honey': '🍯',
  'mel de acácia': '🍯', 'acacia honey': '🍯',
  'mel de flores': '🍯', 'wildflower honey': '🍯',
  'mel de lavanda': '🍯',
  'mel de alecrim': '🍯', 'rosemary honey': '🍯',
  'mel de tomilho': '🍯', 'thyme honey': '🍯',
  'mel de manuka': '🍯', 'manuka honey': '🍯',
  'mel de tília': '🍯', 'linden honey': '🍯',
  'mel de girassol': '🍯', 'sunflower honey': '🍯',
  'mel de castanheiro': '🍯', 'chestnut honey': '🍯',
  'mel de pinheiro': '🍯', 'pine honey': '🍯',
  'mel de limão': '🍯', 'lemon honey': '🍯',
  'mel de tupelo': '🍯', 'tupelo honey': '🍯',
  'mel de trigo sarraceno': '🍯', 'buckwheat honey': '🍯',
  'mel de alfazema': '🍯', 'lavender honey': '🍯',
  'mel de jataí': '🍯', 'jatai honey': '🍯',
  'mel de assa-peixe': '🍯', 'assa-peixe honey': '🍯',
  'mel de cipó-uva': '🍯', 'cipó-uva honey': '🍯',
  'mel de aroeira': '🍯', 'aroeira honey': '🍯',
  'mel de angico': '🍯', 'angico honey': '🍯',
  'mel de ipê': '🍯', 'ipe honey': '🍯',
  'mel de caju': '🍯', 'cashew honey': '🍯',
  'mel de manga': '🍯', 'mango honey': '🍯',
  'mel de coco': '🍯', 'coconut honey': '🍯',
  'mel de café': '🍯', 'coffee honey': '🍯',
  'mel de cana': '🍯', 'sugarcane honey': '🍯',
  'mel cristalizado': '🍯', 'crystallized honey': '🍯',
  'mel líquido': '🍯', 'liquid honey': '🍯',
  'mel puro': '🍯', 'pure honey': '🍯',
  'mel orgânico': '🍯', 'organic honey': '🍯',
  'mel cru': '🍯', 'raw honey': '🍯',
  'mel pasteurizado': '🍯', 'pasteurized honey': '🍯',
  'mel não pasteurizado': '🍯', 'unpasteurized honey': '🍯',
  'mel de melado': '🍯', 'molasses honey': '🍯',
  'pimenta': '🌶️', 'chili': '🌶️',
  'pimenta do reino': '🧂', 'black pepper': '🧂',
  'pimenta branca': '🧂', 'white pepper': '🧂',
  'pimenta rosa': '🧂',
  'pimenta verde': '🌶️', 'green pepper': '🌶️',
  'pimenta vermelha': '🌶️', 'red pepper': '🌶️',
  'pimenta caiena': '🌶️', 'cayenne pepper': '🌶️',
  'pimenta síria': '🧂', 'syrian pepper': '🧂',
  'páprica': '🌶️', 'paprika': '🌶️',
  'páprica doce': '🌶️', 'sweet paprika': '🌶️',
  'páprica picante': '🌶️', 'hot paprika': '🌶️',
  'páprica defumada': '🌶️', 'smoked paprika': '🌶️',
  'canela': '🟤', 'cinnamon': '🟤',
  'canela em pó': '🟤', 'ground cinnamon': '🟤',
  'canela em pau': '🟤', 'cinnamon stick': '🟤',
  'cominho': '🟤', 'cumin': '🟤',
  'cominho em pó': '🟤', 'ground cumin': '🟤',
  'cominho em sementes': '🟤', 'cumin seeds': '🟤',
  'coentro': '🌿', 'cilantro': '🌿',
  'coentro em pó': '🌿', 'ground cilantro': '🌿',
  'coentro em sementes': '🌿', 'coriander seeds': '🌿',
  'hortelã': '🌿', 'mint': '🌿',
  'hortelã fresca': '🌿', 'fresh mint': '🌿',
  'hortelã seca': '🌿', 'dried mint': '🌿',
  'manjericão': '🌿', 'basil': '🌿',
  'manjericão fresco': '🌿', 'fresh basil': '🌿',
  'manjericão seco': '🌿', 'dried basil': '🌿',
  'manjericão roxo': '🌿', 'purple basil': '🌿',
  'orégano': '🌿', 'oregano': '🌿',
  'orégano fresco': '🌿',
  'orégano seco': '🌿', 'dried oregano': '🌿',
  'alecrim': '🌿', 'rosemary': '🌿',
  'alecrim fresco': '🌿', 'fresh rosemary': '🌿',
  'alecrim seco': '🌿', 'dried rosemary': '🌿',
  'tomilho': '🌿', 'thyme': '🌿',
  'tomilho fresco': '🌿', 'fresh thyme': '🌿',
  'tomilho seco': '🌿', 'dried thyme': '🌿',
  'sálvia': '🌿', 'sage': '🌿',
  'sálvia fresca': '🌿', 'fresh sage': '🌿',
  'sálvia seca': '🌿', 'dried sage': '🌿',
  'louro': '🌿', 'bay leaf': '🌿',
  'louro fresco': '🌿', 'fresh bay leaf': '🌿',
  'louro seco': '🌿', 'dried bay leaf': '🌿',
  'salsa': '🌿', 'parsley': '🌿',
  'salsa fresca': '🌿', 'fresh parsley': '🌿',
  'salsa seca': '🌿', 'dried parsley': '🌿',
  'salsinha': '🌿',
  'cebolinha': '🌿',
  'cebolinha fresca': '🌿', 'fresh chive': '🌿',
  'estragão': '🌿', 'tarragon': '🌿',
  'estragão fresco': '🌿', 'fresh tarragon': '🌿',
  'estragão seco': '🌿', 'dried tarragon': '🌿',
  'endro': '🌿', 'dill': '🌿',
  'endro fresco': '🌿', 'fresh dill': '🌿',
  'endro seco': '🌿', 'dried dill': '🌿',
  'anis': '🌿', 'anise': '🌿',
  'anis estrelado': '⭐', 'star anise': '⭐',
  'cardamomo': '🌿', 'cardamom': '🌿',
  'cardamomo verde': '🌿', 'green cardamom': '🌿',
  'cardamomo preto': '🌿', 'black cardamom': '🌿',
  'cravo': '🌿', 'clove': '🌿',
  'cravo da índia': '🌿',
  'noz moscada': '🌿', 'nutmeg': '🌿',
  'noz moscada ralada': '🌿', 'grated nutmeg': '🌿',
  'gengibre': '🫚', 'ginger': '🫚',
  'gengibre fresco': '🫚', 'fresh ginger': '🫚',
  'gengibre em pó': '🫚', 'ground ginger': '🫚',
  'gengibre ralado': '🫚', 'grated ginger': '🫚',
  'cúrcuma': '🟡',
  'cúrcuma em pó': '🟡', 'ground turmeric': '🟡',
  'curry': '🟡', 'curry powder': '🟡',
  'curry vermelho': '🟡', 'red curry': '🟡',
  'curry verde': '🟢', 'green curry': '🟢',
  'curry amarelo': '🟡', 'yellow curry': '🟡',
  'garam masala': '🟤',
  'pimenta da jamaica': '🌶️', 'allspice': '🌶️',
  'pimenta da jamaica em pó': '🌶️', 'ground allspice': '🌶️',
  'pimenta da jamaica em grãos': '🌶️', 'allspice berries': '🌶️',
  'sementes de mostarda': '🟡', 'mustard seeds': '🟡',
  'mostarda': '🟡', 'mustard': '🟡',
  'mostarda amarela': '🟡',
  'mostarda dijon': '🟡', 'dijon mustard': '🟡',
  'mostarda integral': '🟡',
  'açafrão': '🟡', 'saffron': '🟡',
  'açafrão da terra': '🟡',
  'feno grego': '🌿', 'fenugreek': '🌿',
  'feno grego em pó': '🌿', 'ground fenugreek': '🌿',
  'feno grego em sementes': '🌿', 'fenugreek seeds': '🌿',
  'sementes de erva doce': '🌿', 'fennel seeds': '🌿',
  'erva doce': '🌿',
  'alcaravia': '🌿', 'caraway': '🌿',
  'sementes de alcaravia': '🌿', 'caraway seeds': '🌿',
  'sementes de papoula': '🫘', 'poppy seeds': '🫘',
  'sementes de gergelim': '🫘', 'sesame seeds': '🫘',
  'sementes de gergelim preto': '🫘', 'black sesame seeds': '🫘',
  'sementes de gergelim branco': '🫘', 'white sesame seeds': '🫘',
  'sementes de gergelim torrado': '🫘', 'roasted sesame seeds': '🫘',
  'sementes de cominho preto': '🟤', 'black cumin seeds': '🟤',
  'sementes de nigella': '🟤', 'nigella seeds': '🟤',
  'sementes de nigella sativa': '🟤', 'nigella sativa seeds': '🟤',
  'sementes de nigella preta': '🟤', 'black nigella seeds': '🟤',
  'sementes de nigella branca': '🟤', 'white nigella seeds': '🟤',
  'sementes de nigella torrada': '🟤', 'roasted nigella seeds': '🟤',
  'sementes de nigella salgada': '🟤', 'salted nigella seeds': '🟤',
  'azeite': '🫒', 'olive oil': '🫒',
  'azeite extra virgem': '🫒', 'extra virgin olive oil': '🫒',
  'azeite virgem': '🫒', 'virgin olive oil': '🫒',
  'azeite de oliva': '🫒',
  'óleo de canola': '🫒', 'canola oil': '🫒',
  'óleo de girassol': '🌻', 'sunflower oil': '🌻',
  'óleo de milho': '🌽', 'corn oil': '🌽',
  'óleo de soja': '🫘', 'soybean oil': '🫘',
  'óleo de coco': '🥥', 'coconut oil': '🥥',
  'óleo de gergelim': '🫘', 'sesame oil': '🫘',
  'óleo de gergelim torrado': '🫘', 'roasted sesame oil': '🫘',
  'óleo de amendoim': '🥜', 'peanut oil': '🥜',
  'óleo de abacate': '🥑', 'avocado oil': '🥑',
  'vinagre': '🫒', 'vinegar': '🫒',
  'vinagre de vinho branco': '🫒', 'white wine vinegar': '🫒',
  'vinagre de vinho tinto': '🫒', 'red wine vinegar': '🫒',
  'vinagre balsâmico': '🫒', 'balsamic vinegar': '🫒',
  'vinagre de maçã': '🍎', 'apple cider vinegar': '🍎',
  'vinagre de arroz': '🍚', 'rice vinegar': '🍚',
  'vinagre de arroz temperado': '🍚', 'seasoned rice vinegar': '🍚',
  'vinagre de arroz não temperado': '🍚', 'unseasoned rice vinegar': '🍚',
  'molho de soja': '🫘', 'soy sauce': '🫘',
  'molho de soja claro': '🫘', 'light soy sauce': '🫘',
  'molho de soja escuro': '🫘', 'dark soy sauce': '🫘',
  'molho de soja doce': '🫘', 'sweet soy sauce': '🫘',
  'molho de soja reduzido': '🫘', 'reduced soy sauce': '🫘',
  'molho de soja sem glúten': '🫘', 'gluten-free soy sauce': '🫘',
  'molho de peixe': '🐟', 'fish sauce': '🐟',
  'molho de ostra': '🦪', 'oyster sauce': '🦪',
  'molho hoisin': '🫘', 'hoisin sauce': '🫘',
  'molho teriyaki': '🫘', 'teriyaki sauce': '🫘',
  'molho de pimenta': '🌶️', 'hot sauce': '🌶️',
  'molho tabasco': '🌶️', 'tabasco sauce': '🌶️',
  'molho sriracha': '🌶️', 'sriracha sauce': '🌶️',
  'molho de pimenta doce': '🌶️', 'sweet chili sauce': '🌶️',
  'molho de pimenta agridoce': '🌶️', 'sweet and sour chili sauce': '🌶️',
  'molho de pimenta picante': '🌶️', 'spicy chili sauce': '🌶️',
  'molho de pimenta defumada': '🌶️', 'smoked chili sauce': '🌶️',
  'molho de pimenta fermentada': '🌶️', 'fermented chili sauce': '🌶️',
  'molho de pimenta coreano': '🌶️', 'korean chili sauce': '🌶️',
  'molho de pimenta tailandês': '🌶️', 'thai chili sauce': '🌶️',
  'molho de pimenta mexicano': '🌶️', 'mexican chili sauce': '🌶️',
  'molho de pimenta indiano': '🌶️', 'indian chili sauce': '🌶️',
  'molho de pimenta chinês': '🌶️', 'chinese chili sauce': '🌶️',
  'molho de pimenta japonês': '🌶️', 'japanese chili sauce': '🌶️',
  'molho de pimenta vietnamita': '🌶️', 'vietnamese chili sauce': '🌶️',
  'molho de pimenta indonésio': '🌶️', 'indonesian chili sauce': '🌶️',
  'molho de pimenta malaio': '🌶️', 'malaysian chili sauce': '🌶️',

  // 🍝 MOLHOS E PREPAROS
  'molho': '🍝', 'sauce': '🍝',
  'molho de tomate': '🍅', 'tomato sauce': '🍅',
  'molho marinara': '🍅', 'marinara sauce': '🍅',
  'molho napolitano': '🍅', 'neapolitan sauce': '🍅',
  'molho bolognese': '🍝', 'bolognese sauce': '🍝',
  'molho carbonara': '🍝', 'carbonara sauce': '🍝',
  'molho arrabbiata': '🌶️', 'arrabbiata sauce': '🌶️',
  'molho puttanesca': '🍅', 'puttanesca sauce': '🍅',
  'molho aglio e olio': '🫒', 'aglio e olio': '🫒',
  'molho amatriciana': '🍅', 'amatriciana sauce': '🍅',
  'pesto': '🍝', 'pesto genovese': '🍝',
  'pesto de manjericão': '🍝', 'basil pesto': '🍝',
  'pesto de tomate seco': '🍝', 'sun-dried tomato pesto': '🍝',
  'alfredo': '🍝', 'alfredo sauce': '🍝',
  'molho bechamel': '🥛', 'bechamel sauce': '🥛',
  'molho branco': '🥛', 'white sauce': '🥛',
  'molho holandesa': '🧈', 'hollandaise sauce': '🧈',
  'molho béarnaise': '🧈', 'bearnaise sauce': '🧈',
  'molho bordelaise': '🍷', 'bordelaise sauce': '🍷',
  'molho demi-glace': '🍷', 'demi-glace sauce': '🍷',
  'molho de vinho': '🍷', 'wine sauce': '🍷',
  'molho de queijo': '🧀', 'cheese sauce': '🧀',
  'molho mornay': '🧀', 'mornay sauce': '🧀',
  'molho de cogumelos': '🍄', 'mushroom sauce': '🍄',
  'molho de pimenta': '🌶️',
  'molho barbecue': '🍖', 'barbecue sauce': '🍖',
  'molho barbecue doce': '🍖', 'sweet barbecue sauce': '🍖',
  'molho barbecue picante': '🌶️', 'spicy barbecue sauce': '🌶️',
  'molho ranch': '🥛', 'ranch dressing': '🥛',
  'molho caesar': '🧀', 'caesar dressing': '🧀',
  'molho tártaro': '🥚', 'tartar sauce': '🥚', 'tartare sauce': '🥚',
  'molho de wasabi': '🌶️', 'wasabi sauce': '🌶️',
  'molho ponzu': '🍋', 'ponzu sauce': '🍋',
  'molho yakitori': '🍗', 'yakitori sauce': '🍗',
  'molho tonkatsu': '🍖', 'tonkatsu sauce': '🍖',
  'molho okinomiyaki': '🍝', 'okonomiyaki sauce': '🍝',
  'molho miso': '🫘', 'miso sauce': '🫘',
  'molho satay': '🥜', 'satay sauce': '🥜',
  'molho de amendoim': '🥜', 'peanut sauce': '🥜',
  'molho curry': '🟡', 'curry sauce': '🟡',
  'molho tikka masala': '🍛', 'tikka masala sauce': '🍛',
  'molho korma': '🍛', 'korma sauce': '🍛',
  'molho vindaloo': '🌶️', 'vindaloo sauce': '🌶️',
  'molho massaman': '🍛', 'massaman sauce': '🍛',
  'molho pad thai': '🍝', 'pad thai sauce': '🍝',
  'molho de coco': '🥥', 'coconut sauce': '🥥',
  'molho de tamarindo': '🟤', 'tamarind sauce': '🟤',
  'molho chimichurri': '🌿', 'chimichurri': '🌿',
  'molho verde': '🌿', 'green sauce': '🌿',
  'molho de ervas': '🌿', 'herb sauce': '🌿',
  'molho guacamole': '🥑', 'guacamole': '🥑',
  'molho de abacate': '🥑', 'avocado sauce': '🥑',
  'salsa verde': '🌿', 'green salsa': '🌿',
  'salsa roja': '🍅', 'red salsa': '🍅',
  'salsa cruda': '🍅', 'raw salsa': '🍅',
  'salsa pico de gallo': '🍅', 'pico de gallo': '🍅',
  'molho mole': '🍫', 'mole sauce': '🍫',
  'mole poblano': '🍫', 'poblano mole': '🍫',
  'mole verde': '🌿', 'green mole': '🌿',
  'molho de chipotle': '🌶️', 'chipotle sauce': '🌶️',
  'molho de jalapeño': '🌶️', 'jalapeno sauce': '🌶️',
  'molho adobo': '🌶️', 'adobo sauce': '🌶️',
  'molho aioli': '🧄', 'aioli': '🧄',
  'molho de alho': '🧄', 'garlic sauce': '🧄',
  'molho romesco': '🌶️', 'romesco sauce': '🌶️',
  'molho de pimentão': '🌶️',
  'molho rouille': '🦞', 'rouille sauce': '🦞',
  'molho de mariscos': '🦞', 'seafood sauce': '🦞',
  'molho cocktail': '🦐', 'cocktail sauce': '🦐',
  'molho remoulade': '🦞', 'remoulade sauce': '🦞',
  'molho beurre blanc': '🧈', 'beurre blanc': '🧈',
  'molho velouté': '🥛', 'veloute sauce': '🥛',
  'molho de pimenta rosa': '🩷', 'pink peppercorn sauce': '🩷',
  'molho de gengibre': '🫚', 'ginger sauce': '🫚',
  'molho de limão': '🍋', 'lemon sauce': '🍋',
  'molho de laranja': '🍊', 'orange sauce': '🍊',
  'molho de laranja agridoce': '🍊', 'sweet and sour orange sauce': '🍊',
  'molho agridoce': '🍯', 'sweet and sour sauce': '🍯',
  'molho de mel': '🍯', 'honey sauce': '🍯',
  'molho de mel e mostarda': '🍯', 'honey mustard sauce': '🍯',
  'vinagrete': '🫒', 'vinaigrette': '🫒',
  'molho vinagrete': '🫒', 'vinaigrette dressing': '🫒',
  'molho balsâmico': '🫒', 'balsamic dressing': '🫒',
  'molho de azeite': '🫒', 'olive oil dressing': '🫒',
  'molho de limão e azeite': '🫒', 'lemon olive oil dressing': '🫒',
  'maionese': '🥚', 'mayonnaise': '🥚',
  'maionese caseira': '🥚', 'homemade mayonnaise': '🥚',
  'maionese de alho': '🧄', 'garlic mayonnaise': '🧄',
  'ketchup': '🍅', 'tomato ketchup': '🍅',
  'ketchup caseiro': '🍅', 'homemade ketchup': '🍅',
  'mostarda': '🟡', 'mustard': '🟡',
  'mostarda dijon': '🟡', 'dijon mustard': '🟡',
  'mostarda integral': '🟡', 'whole grain mustard': '🟡',
  'mostarda amarela': '🟡', 'yellow mustard': '🟡',
  'molho de queijo azul': '🧀', 'blue cheese dressing': '🧀',
  'molho de queijo gorgonzola': '🧀', 'gorgonzola sauce': '🧀',
  'molho de queijo cheddar': '🧀', 'cheddar sauce': '🧀',
  'molho de queijo parmesão': '🧀', 'parmesan sauce': '🧀',
  'molho de creme': '🥛', 'cream sauce': '🥛',
  'molho de nata': '🥛',
  'molho de leite condensado': '🥛', 'condensed milk sauce': '🥛',
  'molho de chocolate': '🍫', 'chocolate sauce': '🍫',
  'molho de caramelo': '🍮', 'caramel sauce': '🍮',
  'molho de morango': '🍓', 'strawberry sauce': '🍓',
  'molho de frutas vermelhas': '🍓', 'red berry sauce': '🍓',
  'molho de manga': '🥭', 'mango sauce': '🥭',
  'molho de maracujá': '🍋', 'passion fruit sauce': '🍋',
  'calda': '🍯', 'syrup': '🍯',
  'calda de açúcar': '🍯', 'sugar syrup': '🍯',
  'calda de chocolate': '🍫', 'chocolate syrup': '🍫',
  'calda de caramelo': '🍮', 'caramel syrup': '🍮',
  'molho inglês': '🟤', 'worcestershire sauce': '🟤',
  'molho de picanha': '🥩', 'steak sauce': '🥩',
  'molho de churrasco': '🍖', 'grill sauce': '🍖',
  'molho de churrasco brasileiro': '🍖', 'brazilian barbecue sauce': '🍖',

  // 🥤 BEBIDAS
  'água': '💧', 'water': '💧',
  'água mineral': '💧', 'mineral water': '💧',
  'água com gás': '💧', 'sparkling water': '💧',
  'água sem gás': '💧', 'still water': '💧',
  'água de coco': '🥥', 'coconut water': '🥥',
  'suco': '🧃', 'juice': '🧃',
  'suco de laranja': '🧃', 'orange juice': '🧃',
  'suco de limão': '🧃', 'lemon juice': '🧃',
  'suco de maracujá': '🧃', 'passion fruit juice': '🧃',
  'suco de abacaxi': '🧃', 'pineapple juice': '🧃',
  'suco de maçã': '🧃', 'apple juice': '🧃',
  'suco de uva': '🧃', 'grape juice': '🧃',
  'suco de manga': '🧃', 'mango juice': '🧃',
  'suco de goiaba': '🧃', 'guava juice': '🧃',
  'suco de acerola': '🧃', 'acerola juice': '🧃',
  'suco de caju': '🧃', 'cashew juice': '🧃',
  'suco de açaí': '🧃', 'acai juice': '🧃',
  'suco de cupuaçu': '🧃', 'cupuaçu juice': '🧃',
  'suco de graviola': '🧃', 'soursop juice': '🧃',
  'suco de pitanga': '🧃', 'pitanga juice': '🧃',
  'suco de cajá': '🧃', 'caja juice': '🧃',
  'suco de seriguela': '🧃', 'seriguela juice': '🧃',
  'suco de umbu': '🧃', 'umbu juice': '🧃',
  'suco de buriti': '🧃', 'buriti juice': '🧃',
  'suco de pequi': '🧃', 'pequi juice': '🧃',
  'suco de baru': '🧃', 'baru juice': '🧃',
  'café': '☕', 'coffee': '☕',
  'café expresso': '☕', 'espresso': '☕',
  'café cappuccino': '☕', 'cappuccino': '☕',
  'café latte': '☕', 'latte': '☕',
  'café americano': '☕', 'americano': '☕',
  'café com leite': '☕', 'coffee with milk': '☕',
  'café descafeinado': '☕', 'decaf coffee': '☕',
  'chá': '🍵', 'tea': '🍵',
  'chá verde': '🍵', 'green tea': '🍵',
  'chá preto': '🍵', 'black tea': '🍵',
  'chá de camomila': '🍵', 'chamomile tea': '🍵',
  'chá de hortelã': '🍵', 'mint tea': '🍵',
  'chá de erva-doce': '🍵', 'fennel tea': '🍵',
  'chá de hibisco': '🍵', 'hibiscus tea': '🍵',
  'chá de jasmim': '🍵', 'jasmine tea': '🍵',
  'chá de rooibos': '🍵', 'rooibos tea': '🍵',
  'chá de matcha': '🍵', 'matcha tea': '🍵',
  'chá de chai': '🍵', 'chai tea': '🍵',
  'chá de boldo': '🍵', 'boldo tea': '🍵',
  'chá de carqueja': '🍵', 'carqueja tea': '🍵',
  'chá de espinheira-santa': '🍵', 'espinheira-santa tea': '🍵',
  'chá de quebra-pedra': '🍵', 'quebra-pedra tea': '🍵',
  'chá de cavalinha': '🍵', 'cavalinha tea': '🍵',
  'chá de dente-de-leão': '🍵', 'dandelion tea': '🍵',
  'refrigerante': '🥤', 'soda': '🥤',
  'refrigerante de cola': '🥤', 'cola': '🥤',
  'refrigerante de laranja': '🥤', 'orange soda': '🥤',
  'refrigerante de limão': '🥤', 'lemon soda': '🥤',
  'refrigerante de guaraná': '🥤', 'guarana soda': '🥤',
  'refrigerante de uva': '🥤', 'grape soda': '🥤',
  'refrigerante de maçã': '🥤', 'apple soda': '🥤',
  'refrigerante de maracujá': '🥤', 'passion fruit soda': '🥤',
  'refrigerante de abacaxi': '🥤', 'pineapple soda': '🥤',
  'refrigerante de manga': '🥤', 'mango soda': '🥤',
  'refrigerante de goiaba': '🥤', 'guava soda': '🥤',
  'refrigerante de acerola': '🥤', 'acerola soda': '🥤',
  'refrigerante de caju': '🥤', 'cashew soda': '🥤',
  'refrigerante de açaí': '🥤', 'acai soda': '🥤',
  'refrigerante de cupuaçu': '🥤', 'cupuaçu soda': '🥤',
  'refrigerante de graviola': '🥤', 'soursop soda': '🥤',
  'refrigerante de pitanga': '🥤', 'pitanga soda': '🥤',
  'refrigerante de cajá': '🥤', 'caja soda': '🥤',
  'refrigerante de seriguela': '🥤', 'seriguela soda': '🥤',
  'refrigerante de umbu': '🥤', 'umbu soda': '🥤',
  'refrigerante de buriti': '🥤', 'buriti soda': '🥤',
  'refrigerante de pequi': '🥤', 'pequi soda': '🥤',
  'refrigerante de baru': '🥤', 'baru soda': '🥤',
  'cerveja': '🍺', 'beer': '🍺',
  'cerveja preta': '🍺', 'dark beer': '🍺',
  'cerveja escura': '🍺',
  'cerveja clara': '🍺', 'light beer': '🍺',
  'cerveja pilsen': '🍺', 'pilsen beer': '🍺',
  'cerveja lager': '🍺', 'lager beer': '🍺',
  'cerveja ale': '🍺', 'ale beer': '🍺',
  'cerveja ipa': '🍺', 'ipa beer': '🍺',
  'cerveja stout': '🍺', 'stout beer': '🍺',
  'cerveja porter': '🍺', 'porter beer': '🍺',
  'cerveja weiss': '🍺', 'weiss beer': '🍺',
  'cerveja wheat': '🍺', 'wheat beer': '🍺',
  'cerveja de trigo': '🍺',
  'cerveja artesanal': '🍺', 'craft beer': '🍺',
  'cerveja sem álcool': '🍺', 'non-alcoholic beer': '🍺',
  'cerveja zero álcool': '🍺', 'zero alcohol beer': '🍺',
  'cachaça': '🍶', 'cachaca': '🍶',
  'cachaça prata': '🍶', 'silver cachaca': '🍶',
  'cachaça ouro': '🍶', 'gold cachaca': '🍶',
  'cachaça envelhecida': '🍶', 'aged cachaca': '🍶',
  'cachaça artesanal': '🍶', 'artisanal cachaca': '🍶',
  'cachaça de alambique': '🍶', 'alambique cachaca': '🍶',
  'rum': '🥃',
  'rum branco': '🥃', 'white rum': '🥃',
  'rum dourado': '🥃', 'gold rum': '🥃',
  'rum escuro': '🥃', 'dark rum': '🥃',
  'rum envelhecido': '🥃', 'aged rum': '🥃',
  'rum premium': '🥃', 'premium rum': '🥃',
  'rum artesanal': '🥃', 'artisanal rum': '🥃',
  'rum de melado': '🥃', 'molasses rum': '🥃',
  'rum de cana': '🥃', 'sugarcane rum': '🥃',
  'tequila': '🍸',
  'tequila branca': '🍸', 'white tequila': '🍸',
  'tequila prata': '🍸', 'silver tequila': '🍸',
  'tequila reposado': '🍸', 'reposado tequila': '🍸',
  'tequila añejo': '🍸', 'anejo tequila': '🍸',
  'tequila extra añejo': '🍸', 'extra anejo tequila': '🍸',
  'tequila premium': '🍸', 'premium tequila': '🍸',
  'tequila artesanal': '🍸', 'artisanal tequila': '🍸',
  'tequila 100% agave': '🍸', '100% agave tequila': '🍸',
  'vodka': '🍸',
  'vodka branca': '🍸', 'white vodka': '🍸',
  'vodka premium': '🍸', 'premium vodka': '🍸',
  'vodka artesanal': '🍸', 'artisanal vodka': '🍸',
  'vodka de batata': '🍸', 'potato vodka': '🍸',
  'vodka de trigo': '🍸', 'wheat vodka': '🍸',
  'vodka de centeio': '🍸', 'rye vodka': '🍸',
  'whisky': '🥃', 'whiskey': '🥃',
  'whisky escocês': '🥃', 'scotch whisky': '🥃',
  'whisky irlandês': '🥃', 'irish whiskey': '🥃',
  'whisky americano': '🥃', 'american whiskey': '🥃',
  'whisky bourbon': '🥃', 'bourbon whiskey': '🥃',
  'whisky envelhecido': '🥃', 'aged whiskey': '🥃',
  'whisky premium': '🥃', 'premium whiskey': '🥃',
  'whisky artesanal': '🥃', 'artisanal whiskey': '🥃',
  'gin': '🍸',
  'gin londres': '🍸', 'london gin': '🍸',
  'gin seco': '🍸', 'dry gin': '🍸',
  'gin premium': '🍸', 'premium gin': '🍸',
  'gin artesanal': '🍸', 'artisanal gin': '🍸',
  'conhaque': '🥃', 'cognac': '🥃',
  'conhaque francês': '🥃', 'french cognac': '🥃',
  'conhaque envelhecido': '🥃', 'aged cognac': '🥃',
  'conhaque premium': '🥃', 'premium cognac': '🥃',
  'conhaque artesanal': '🥃', 'artisanal cognac': '🥃',
  'licor': '🍸', 'liqueur': '🍸',
  'licor de frutas': '🍸', 'fruit liqueur': '🍸',
  'licor de café': '🍸', 'coffee liqueur': '🍸',
  'licor de chocolate': '🍸', 'chocolate liqueur': '🍸',
  'licor de baunilha': '🍸', 'vanilla liqueur': '🍸',
  'licor de menta': '🍸', 'mint liqueur': '🍸',
  'licor de amaretto': '🍸', 'amaretto liqueur': '🍸',
  'licor de limoncello': '🍸', 'limoncello liqueur': '🍸',
  'licor de cointreau': '🍸', 'cointreau liqueur': '🍸',
  'licor de grand marnier': '🍸', 'grand marnier liqueur': '🍸',
  'licor de kahlua': '🍸', 'kahlua liqueur': '🍸',
  'licor de baileys': '🍸', 'baileys liqueur': '🍸',
  'licor de frangelico': '🍸', 'frangelico liqueur': '🍸',
  'licor de disaronno': '🍸', 'disaronno liqueur': '🍸',
  'licor de jägermeister': '🍸', 'jagermeister liqueur': '🍸',
  'licor de sambuca': '🍸', 'sambuca liqueur': '🍸',
  'licor de ouzo': '🍸', 'ouzo liqueur': '🍸',
  'licor de absinto': '🍸', 'absinthe liqueur': '🍸',
  'licor de chartreuse': '🍸', 'chartreuse liqueur': '🍸',
  'licor de benedictine': '🍸', 'benedictine liqueur': '🍸',
  'licor de drambuie': '🍸', 'drambuie liqueur': '🍸',
  'licor de galliano': '🍸', 'galliano liqueur': '🍸',
  'licor de midori': '🍸', 'midori liqueur': '🍸',
  'licor de blue curacao': '🍸', 'blue curacao liqueur': '🍸',
  'licor de triple sec': '🍸', 'triple sec liqueur': '🍸',
  'licor de curaçao': '🍸', 'curacao liqueur': '🍸',
  'licor de maraschino': '🍸', 'maraschino liqueur': '🍸',
  'licor de kirsch': '🍸', 'kirsch liqueur': '🍸',
  'licor de sloe gin': '🍸', 'sloe gin liqueur': '🍸',
  'licor de pimm\'s': '🍸', 'pimms liqueur': '🍸',
  'licor de campari': '🍸', 'campari liqueur': '🍸',
  'licor de aperol': '🍸', 'aperol liqueur': '🍸',
  'licor de vermute': '🍸', 'vermouth liqueur': '🍸',
  'vinho': '🍷', 'wine': '🍷',
  'vinho tinto': '🍷', 'red wine': '🍷',
  'vinho branco': '🍷', 'white wine': '🍷',
  'vinho rosé': '🍷', 'rose wine': '🍷',
  'vinho doce': '🍷', 'sweet wine': '🍷',
  'vinho seco': '🍷', 'dry wine': '🍷',
  'vinho espumante': '🍾', 'sparkling wine': '🍾',
  'champagne': '🍾',
  'prosecco': '🍾',
  'cava': '🍾',
  'vinho do porto': '🍷', 'port wine': '🍷',
  'vinho madeira': '🍷', 'madeira wine': '🍷',
  'vinho xerez': '🍷', 'sherry wine': '🍷',
  'vinho moscatel': '🍷', 'muscat wine': '🍷',
}

// Função para obter emoji do ingrediente
const getIngredientEmoji = (ingredient) => {
  const normalized = ingredient.trim().toLowerCase()
  return ingredientEmojis[normalized] || '🥘'
}

// Função para capitalizar primeira letra
const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Função para formatar calorias com separação visual
const formatCalories = (caloriesStr) => {
  if (!caloriesStr) return ''
  
  // Tenta encontrar padrão com quantidade e medida: "250 Cal 100 KG"
  const matchWithValue = caloriesStr.match(/^(\d+(?:\.\d+)?)\s*Cal\s+(\d+(?:\.\d+)?)\s+(KG|G|Ml|L|Kg|g|ml|l|mg)$/i)
  if (matchWithValue) {
    return `${matchWithValue[1]} Cal • ${matchWithValue[2]} ${matchWithValue[3]}`
  }
  
  // Tenta encontrar padrão com medida sem quantidade: "250 Cal KG"
  const matchWithMeasure = caloriesStr.match(/^(\d+(?:\.\d+)?)\s*Cal\s+(KG|G|Ml|L|Kg|g|ml|l|mg)$/i)
  if (matchWithMeasure) {
    return `${matchWithMeasure[1]} Cal • ${matchWithMeasure[2]}`
  }
  
  // Padrão simples: "250 Cal"
  return caloriesStr
}

export function DashboardPage() {
  const { user } = useAuth()
  const recipes = useAppStore((state) => state.recipes)
  const [meals, setMeals] = useState(defaultMeals)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [showFabMenu, setShowFabMenu] = useState(false)
  const ingredientsTimerRef = useRef(null)
  const [dashboardSettings, setDashboardSettings] = useState(defaultDashboardSettings)

  // Carregar configurações do dashboard do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DASHBOARD_SETTINGS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setDashboardSettings({ ...defaultDashboardSettings, ...parsed })
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do dashboard:', error)
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('fooddiddo_meals')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length) {
          setMeals(parsed)
        }
      } catch (error) {
        console.warn('Não foi possível carregar refeições salvas', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('fooddiddo_meals', JSON.stringify(meals))
  }, [meals])

  // Fechar FAB menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFabMenu && !event.target.closest('.fab-container')) {
        setShowFabMenu(false)
      }
    }

    if (showFabMenu) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showFabMenu])

  const stats = useMemo(() => {
    const total = meals.length || 1
    const completed = meals.filter((meal) => meal.status === 'finalizado').length
    const pending = meals.filter((meal) => meal.status === 'fazer' || meal.status === 'planejado').length
    const totalCost = meals.reduce((sum, meal) => sum + (parseFloat(meal.cost) || 0), 0)
    const lowStockItems = [] // TODO: integrar com estoque real

    return {
      total,
      completed,
      pending,
      percent: Math.round((completed / total) * 100),
      totalCost: totalCost.toFixed(2),
      lowStockCount: lowStockItems.length
    }
  }, [meals])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const getUserName = () => {
    const name = user?.name || 'Sales'
    return name.split(' ')[0] // Primeiro nome apenas
  }

  const businessInsights = useMemo(() => {
    if (!recipes.length) return null

    const bestRecipe = recipes.reduce((best, recipe) => {
      const profitPerUnit = recipe.unitCost * recipe.contributionMargin
      const bestProfit = best.unitCost * best.contributionMargin
      return profitPerUnit > bestProfit ? recipe : best
    }, recipes[0])

    const suggestedPrice = bestRecipe.unitCost / (1 - bestRecipe.contributionMargin)
    const profitPerUnit = suggestedPrice - bestRecipe.unitCost
    const profitPerBatch = profitPerUnit * bestRecipe.yield

    return {
      recipeName: bestRecipe.name,
      suggestedPrice: suggestedPrice.toFixed(2),
      profitPerUnit: profitPerUnit.toFixed(2),
      profitPerBatch: profitPerBatch.toFixed(2),
      yield: bestRecipe.yield
    }
  }, [recipes])

  const handleEdit = (meal) => {
    setEditingId(meal.id)
    // Extrair valor, unidade, quantidade e medida de calorias (ex: "250 Cal 100 KG" -> "250", "Cal", "100", "KG")
    const caloriesStr = meal.calories || ''
    // Primeiro tenta encontrar padrão com quantidade e medida: "250 Cal 100 KG"
    const caloriesMatchWithValue = caloriesStr.match(/^(\d+(?:\.\d+)?)\s*Cal\s+(\d+(?:\.\d+)?)\s+(KG|G|Ml|L|Kg|g|ml|l|mg)$/i)
    // Se não encontrar, tenta padrão com medida sem quantidade: "250 Cal KG"
    const caloriesMatchWithMeasure = caloriesStr.match(/^(\d+(?:\.\d+)?)\s*Cal\s+(KG|G|Ml|L|Kg|g|ml|l|mg)$/i)
    // Se não encontrar, tenta padrão simples: "250 Cal"
    const caloriesMatchSimple = caloriesStr.match(/^(\d+(?:\.\d+)?)\s*Cal$/i)
    
    const caloriesValue = caloriesMatchWithValue ? caloriesMatchWithValue[1] : (caloriesMatchWithMeasure ? caloriesMatchWithMeasure[1] : (caloriesMatchSimple ? caloriesMatchSimple[1] : caloriesStr.replace(/\s*(Cal|KG|G|Ml|L|Kg|g|ml|l|mg)/gi, '').trim() || ''))
    const caloriesUnit = 'Cal' // Sempre Cal
    const caloriesMeasureValue = caloriesMatchWithValue ? caloriesMatchWithValue[2] : ''
    const caloriesMeasure = caloriesMatchWithValue ? caloriesMatchWithValue[3] : (caloriesMatchWithMeasure ? caloriesMatchWithMeasure[2] : '')
    
    // Extrair valor e unidade de tempo (ex: "15 min" -> "15", "Min")
    const timeStr = meal.time || ''
    const timeMatch = timeStr.match(/^(\d+(?:\.\d+)?)\s*(Seg|Min|Hrs|KG|G|Litro)?$/i)
    const timeValue = timeMatch ? timeMatch[1] : timeStr.replace(/\s*(Seg|Min|Hrs|KG|G|Litro)/gi, '').trim() || ''
    const timeUnit = timeMatch?.[2] || (timeStr.toLowerCase().includes('min') ? 'Min' : (timeStr.toLowerCase().includes('hrs') || timeStr.toLowerCase().includes('hora') ? 'Hrs' : 'Min'))
    
    setFormData({
      title: meal.title,
      calories: caloriesValue,
      caloriesUnit: caloriesUnit,
      caloriesMeasureValue: caloriesMeasureValue,
      caloriesMeasure: caloriesMeasure,
      ingredients: meal.ingredients,
      time: timeValue,
      timeUnit: timeUnit,
      cost: meal.cost || '',
      status: meal.status
    })
    setShowForm(true)
  }

  const handleDelete = (mealId) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== mealId))
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) return

    let caloriesStr = `${formData.calories} ${formData.caloriesUnit}`
    if (formData.caloriesMeasureValue && formData.caloriesMeasure) {
      caloriesStr += ` ${formData.caloriesMeasureValue} ${formData.caloriesMeasure}`
    } else if (formData.caloriesMeasure) {
      caloriesStr += ` ${formData.caloriesMeasure}`
    }

    const mealData = {
      ...formData,
      calories: caloriesStr,
      time: `${formData.time} ${formData.timeUnit}`
    }

    if (editingId) {
      setMeals((prev) =>
        prev.map((meal) => (meal.id === editingId ? { ...meal, ...mealData } : meal))
      )
    } else {
      setMeals((prev) => [
        {
          id: `meal-${Date.now()}`,
          ...mealData
        },
        ...prev
      ])
    }

    setFormData(initialForm)
    setEditingId(null)
    setShowForm(false)
    setShowFabMenu(false)
  }

  // Função para obter lista de ingredientes
  const getIngredientsList = () => {
    if (!formData.ingredients) return []
    return formData.ingredients.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0)
  }

  // Função para encontrar o melhor match de ingrediente
  const findBestIngredientMatch = (partial) => {
    if (!partial || partial.trim().length === 0) return null
    
    const normalized = partial.trim().toLowerCase()
    const keys = Object.keys(ingredientEmojis)
    
    // Busca exata
    if (ingredientEmojis[normalized]) {
      return normalized
    }
    
    // Busca por começo da palavra
    const startsWith = keys.find(key => key.startsWith(normalized))
    if (startsWith) return startsWith
    
    // Busca por contém
    const contains = keys.find(key => key.includes(normalized))
    if (contains) return contains
    
    // Busca por similaridade (primeiras letras)
    if (normalized.length >= 3) {
      const similar = keys.find(key => {
        const keyStart = key.substring(0, Math.min(normalized.length, key.length))
        return keyStart === normalized.substring(0, keyStart.length)
      })
      if (similar) return similar
    }
    
    return null
  }

  // Função para adicionar ingrediente automaticamente
  const addIngredientAutomatically = (ingredientText, clearInput = false) => {
    if (!ingredientText || ingredientText.trim().length === 0) return
    
    const trimmed = ingredientText.trim()
    const currentList = getIngredientsList()
    
    // Verifica se já existe
    if (currentList.some(ing => ing.toLowerCase() === trimmed.toLowerCase())) {
      if (clearInput) {
        // Se já existe e quer limpar, apenas limpa o input mantendo os existentes
        const existingIngredients = currentList.join(', ')
        setFormData((prev) => ({ ...prev, ingredients: existingIngredients }))
      }
      return
    }
    
    // Tenta encontrar match
    const bestMatch = findBestIngredientMatch(trimmed)
    const ingredientToAdd = bestMatch || trimmed
    
    // Adiciona à lista
    const newIngredients = currentList.length > 0 
      ? [...currentList, ingredientToAdd].join(', ')
      : ingredientToAdd
    
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }))
  }

  // Função para lidar com mudanças no input de ingredientes
  const handleIngredientsChange = (value) => {
    setFormData((prev) => ({ ...prev, ingredients: value }))
    
    // Limpa o timer anterior
    if (ingredientsTimerRef.current) {
      clearTimeout(ingredientsTimerRef.current)
    }
    
    // Pega o último ingrediente (após a última vírgula, ou tudo se não houver vírgula)
    const parts = value.split(',')
    const lastPart = parts[parts.length - 1]?.trim() || ''
    
    // Se houver texto no último ingrediente, inicia timer de 10 segundos
    if (lastPart.length > 0) {
      ingredientsTimerRef.current = setTimeout(() => {
        // Para o auto-add, pega os ingredientes já confirmados (antes da última vírgula)
        const confirmedParts = parts.slice(0, -1).filter(p => p.trim().length > 0).map(p => p.trim())
        const confirmedIngredients = confirmedParts.join(', ')
        
        // Adiciona o último ingrediente automaticamente
        const currentList = confirmedParts
        if (!currentList.some(ing => ing.toLowerCase() === lastPart.toLowerCase())) {
          const bestMatch = findBestIngredientMatch(lastPart)
          const ingredientToAdd = bestMatch || lastPart
          const newIngredients = confirmedIngredients 
            ? `${confirmedIngredients}, ${ingredientToAdd}`
            : ingredientToAdd
          setFormData((prev) => ({ ...prev, ingredients: newIngredients }))
        } else {
          // Se já existe, mantém apenas os confirmados
          setFormData((prev) => ({ ...prev, ingredients: confirmedIngredients }))
        }
      }, 10000) // 10 segundos
    }
  }

  // Função para lidar com Enter no input de ingredientes
  const handleIngredientsKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const value = event.target.value
      
      // Pega o último ingrediente digitado (após a última vírgula)
      const parts = value.split(',')
      const lastPart = parts[parts.length - 1]?.trim() || ''
      
      if (lastPart.length > 0) {
        // Limpa o timer
        if (ingredientsTimerRef.current) {
          clearTimeout(ingredientsTimerRef.current)
        }
        
        // Pega os ingredientes já confirmados (antes da última vírgula)
        const existingParts = parts.slice(0, -1).filter(p => p.trim().length > 0)
        const confirmedIngredients = existingParts.map(p => p.trim())
        
        // Cria lista completa incluindo o novo ingrediente
        const currentList = [...confirmedIngredients]
        
        // Verifica se o último ingrediente já existe
        if (!currentList.some(ing => ing.toLowerCase() === lastPart.toLowerCase())) {
          // Tenta encontrar match melhor
          const bestMatch = findBestIngredientMatch(lastPart)
          const ingredientToAdd = bestMatch || lastPart
          
          // Adiciona à lista
          currentList.push(ingredientToAdd)
        }
        
        // Atualiza o formData com apenas os ingredientes confirmados (sem o que estava sendo digitado)
        const newIngredients = currentList.join(', ')
        setFormData((prev) => ({ ...prev, ingredients: newIngredients }))
      }
    }
  }

  // Função para remover ingrediente ao clicar no chip
  const handleRemoveIngredient = (indexToRemove) => {
    const currentList = getIngredientsList()
    // Remove apenas o item no índice específico
    const updatedList = currentList.filter((_, index) => index !== indexToRemove)
    const newIngredients = updatedList.join(', ')
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }))
    
    // Limpa o timer se estiver ativo
    if (ingredientsTimerRef.current) {
      clearTimeout(ingredientsTimerRef.current)
    }
  }

  // Limpar timer quando o componente desmontar ou o formulário fechar
  useEffect(() => {
    return () => {
      if (ingredientsTimerRef.current) {
        clearTimeout(ingredientsTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!showForm && ingredientsTimerRef.current) {
      clearTimeout(ingredientsTimerRef.current)
    }
  }, [showForm])

  return (
    <div className="dashboard-page page">
      {/* Painel de Status Diário */}
      {dashboardSettings.showStatusPanel && (
      <section className="dashboard-status-panel">
        <div className="status-panel-header">
          <h2>Hoje</h2>
        </div>
        <div className="status-panel-content">
          <div className="status-item">
            <span className="status-label">{stats.pending} refeições pendentes</span>
          </div>
          {stats.lowStockCount > 0 && (
            <div className="status-item status-alert">
              <span className="status-label">Estoque baixo: {stats.lowStockCount} item{stats.lowStockCount > 1 ? 's' : ''}</span>
            </div>
          )}
          <div className="status-item">
            <span className="status-label">Custo estimado: R$ {stats.totalCost}</span>
          </div>
        </div>
      </section>
      )}

      {dashboardSettings.showBusinessInsights && businessInsights && (
        <section className="page-stack business-insights">
          <div className="insights-content">
            <h2>💡 Oportunidade de Negócio</h2>
            <p className="insights-text">
              Com a receita <strong>{businessInsights.recipeName}</strong>, você poderia vender cada unidade a{' '}
              <strong className="highlight-price">R$ {businessInsights.suggestedPrice}</strong> e lucrar{' '}
              <strong className="highlight-profit">R$ {businessInsights.profitPerUnit}</strong> por unidade.
            </p>
            <p className="insights-text">
              Em um lote de <strong>{businessInsights.yield} unidades</strong>, seu lucro total seria de{' '}
              <strong className="highlight-profit">R$ {businessInsights.profitPerBatch}</strong>.
            </p>
          </div>
        </section>
      )}

      {dashboardSettings.showMealSection && (
      <section className="page-stack meal-section">
        <header className="meal-section-header">
          <div>
            <h2>Refeições</h2>
            <p className="meal-section-subtitle">
              {stats.completed} de {stats.total} concluídas • {stats.percent}% de progresso
            </p>
          </div>
        </header>

        {showForm ? (
          <div className={`meal-form meal-form-desktop ${editingId ? 'meal-form-edit' : ''}`}>
            <div className="meal-form-header">
              <h3>{editingId ? 'Editar refeição' : 'Nova refeição'}</h3>
              <button
                type="button"
                className="meal-form-close"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData(initialForm)
                  setShowFabMenu(false)
                }}
                aria-label="Fechar formulário"
              >
                ×
              </button>
            </div>
            <div className="meal-form-row">
              <label>
                <span>Título</span>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Ex.: Avocado toast"
                />
              </label>
              <label>
                <span>Calorias</span>
                <div className="calories-input-group">
                  <div className="input-with-select">
                    <input
                      type="text"
                      value={formData.calories}
                      onChange={(event) => setFormData((prev) => ({ ...prev, calories: event.target.value }))}
                      placeholder="Ex.: 250"
                    />
                    <select
                      value={formData.caloriesUnit}
                      className="unit-select unit-select-fixed"
                      disabled
                    >
                      <option value="Cal">Cal</option>
                    </select>
                  </div>
                  <div className="input-with-select">
                    <input
                      type="text"
                      value={formData.caloriesMeasureValue}
                      onChange={(event) => setFormData((prev) => ({ ...prev, caloriesMeasureValue: event.target.value }))}
                      placeholder="Ex.: 100"
                    />
                    <select
                      value={formData.caloriesMeasure}
                      onChange={(event) => setFormData((prev) => ({ ...prev, caloriesMeasure: event.target.value }))}
                      className="unit-select"
                    >
                      <option value="">-</option>
                      <option value="KG">KG</option>
                      <option value="g">g</option>
                      <option value="Ml">Ml</option>
                      <option value="L">L</option>
                      <option value="mg">mg</option>
                      <option value="ml">ml</option>
                    </select>
                  </div>
                </div>
              </label>
            </div>
            <div className="meal-form-row">
              <label>
                <span>Ingredientes</span>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(event) => handleIngredientsChange(event.target.value)}
                  onKeyDown={handleIngredientsKeyDown}
                  placeholder="Ex.: Avocado, Bread, Eggs"
                />
                {getIngredientsList().length > 0 && (
                  <div className="ingredients-chips">
                    {getIngredientsList().map((ingredient, index) => (
                      <span 
                        key={index} 
                        className="ingredient-chip"
                        onClick={() => handleRemoveIngredient(index)}
                        style={{ cursor: 'pointer' }}
                        title="Clique para remover"
                      >
                        {getIngredientEmoji(ingredient)}{capitalizeFirst(ingredient)}
                      </span>
                    ))}
                  </div>
                )}
              </label>
              <label>
                <span>Tempo</span>
                <div className="input-with-select">
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(event) => setFormData((prev) => ({ ...prev, time: event.target.value }))}
                    placeholder="Ex.: 15"
                  />
                  <select
                    value={formData.timeUnit}
                    onChange={(event) => setFormData((prev) => ({ ...prev, timeUnit: event.target.value }))}
                    className="unit-select"
                  >
                    <option value="Seg">Seg</option>
                    <option value="Min">Min</option>
                    <option value="Hrs">Hrs</option>
                    <option value="KG">KG</option>
                    <option value="G">G</option>
                    <option value="Litro">Litro</option>
                  </select>
                </div>
              </label>
              <label>
                <span>Custo (R$)</span>
                <input
                  type="text"
                  value={formData.cost}
                  onChange={(event) => setFormData((prev) => ({ ...prev, cost: event.target.value }))}
                  placeholder="Ex.: 8.20"
                />
              </label>
              <label>
                <span>Status</span>
                <select
                  value={formData.status}
                  onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}
                >
                  <option value="fazer">Fazer</option>
                  <option value="planejado">Planejado</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </label>
            </div>
            <div className="meal-form-actions">
              {editingId && (
                <button
                  type="button"
                  className="delete-meal-btn"
                  onClick={() => {
                    handleDelete(editingId)
                    setShowForm(false)
                    setEditingId(null)
                    setFormData(initialForm)
                    setShowFabMenu(false)
                  }}
                  title="Excluir refeição"
                >
                  <FiTrash2 size={18} />
                </button>
              )}
              <button type="button" className="primary-btn" onClick={handleSubmit}>
                {editingId ? 'Atualizar refeição' : 'Salvar refeição'}
              </button>
            </div>
          </div>
        ) : null}

        <div className="meal-list">
          {meals.map((meal) => (
            <div key={meal.id} style={{ width: '100%' }}>
              <article
                className="meal-card"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit(meal)
                }}
              >
                <div className="meal-card-content">
                  <header>
                    <h3>{meal.title}</h3>
                    <span className={`status-pill status-${meal.status}`}>{meal.status}</span>
                  </header>
                  <div className="meal-details">
                    <span className="meal-detail-item">
                      <FiClock size={14} />
                      {meal.time}
                    </span>
                    {meal.cost && (
                      <span className="meal-detail-item">
                        <FiDollarSign size={14} />
                        R$ {parseFloat(meal.cost).toFixed(2)}
                      </span>
                    )}
                    <span className="meal-detail-item">
                      <FiThermometer size={14} />
                      {formatCalories(meal.calories)}
                    </span>
                  </div>
                  <div className="meal-ingredients">
                    <span className="meal-ingredients-label">Ingredientes:</span>
                    <div className="ingredients-chips">
                      {meal.ingredients?.split(',').map((ing, index) => {
                        const trimmedIng = ing.trim()
                        return trimmedIng ? (
                          <span key={index} className="ingredient-chip">
                            {getIngredientEmoji(trimmedIng)}{capitalizeFirst(trimmedIng)}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                </div>
              </article>
              {showForm && editingId === meal.id && (
                <div className="meal-form meal-form-mobile">
                  <div className="meal-form-header">
                    <h3>Editar refeição</h3>
                    <button
                      type="button"
                      className="meal-form-close"
                      onClick={() => {
                        setShowForm(false)
                        setEditingId(null)
                        setFormData(initialForm)
                        setShowFabMenu(false)
                      }}
                      aria-label="Fechar formulário"
                    >
                      ×
                    </button>
                  </div>
                  <div className="meal-form-row">
                    <label>
                      <span>Título</span>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                        placeholder="Ex.: Avocado toast"
                      />
                    </label>
                    <label>
                      <span>Calorias</span>
                      <div className="calories-input-group">
                        <div className="input-with-select">
                          <input
                            type="text"
                            value={formData.calories}
                            onChange={(event) => setFormData((prev) => ({ ...prev, calories: event.target.value }))}
                            placeholder="Ex.: 250"
                          />
                          <select
                            value={formData.caloriesUnit}
                            className="unit-select unit-select-fixed"
                            disabled
                          >
                            <option value="Cal">Cal</option>
                          </select>
                        </div>
                        <div className="input-with-select">
                          <input
                            type="text"
                            value={formData.caloriesMeasureValue}
                            onChange={(event) => setFormData((prev) => ({ ...prev, caloriesMeasureValue: event.target.value }))}
                            placeholder="Ex.: 100"
                          />
                          <select
                            value={formData.caloriesMeasure}
                            onChange={(event) => setFormData((prev) => ({ ...prev, caloriesMeasure: event.target.value }))}
                            className="unit-select"
                          >
                            <option value="">-</option>
                            <option value="KG">KG</option>
                            <option value="g">g</option>
                            <option value="Ml">Ml</option>
                            <option value="L">L</option>
                            <option value="mg">mg</option>
                            <option value="ml">ml</option>
                          </select>
                        </div>
                      </div>
                    </label>
                  </div>
                  <div className="meal-form-row">
                    <label>
                      <span>Ingredientes</span>
                      <input
                        type="text"
                        value={formData.ingredients}
                        onChange={(event) => handleIngredientsChange(event.target.value)}
                        onKeyDown={handleIngredientsKeyDown}
                        placeholder="Ex.: Avocado, Bread, Eggs"
                      />
                      {getIngredientsList().length > 0 && (
                        <div className="ingredients-chips">
                          {getIngredientsList().map((ingredient, index) => (
                            <span 
                              key={index} 
                              className="ingredient-chip"
                              onClick={() => handleRemoveIngredient(index)}
                              style={{ cursor: 'pointer' }}
                              title="Clique para remover"
                            >
                              {getIngredientEmoji(ingredient)}{capitalizeFirst(ingredient)}
                            </span>
                          ))}
                        </div>
                      )}
                    </label>
                    <label>
                      <span>Tempo</span>
                      <div className="input-with-select">
                        <input
                          type="text"
                          value={formData.time}
                          onChange={(event) => setFormData((prev) => ({ ...prev, time: event.target.value }))}
                          placeholder="Ex.: 15"
                        />
                        <select
                          value={formData.timeUnit}
                          onChange={(event) => setFormData((prev) => ({ ...prev, timeUnit: event.target.value }))}
                          className="unit-select"
                        >
                          <option value="Seg">Seg</option>
                          <option value="Min">Min</option>
                          <option value="Hrs">Hrs</option>
                          <option value="KG">KG</option>
                          <option value="G">G</option>
                          <option value="Litro">Litro</option>
                        </select>
                      </div>
                    </label>
                    <label>
                      <span>Custo (R$)</span>
                      <input
                        type="text"
                        value={formData.cost}
                        onChange={(event) => setFormData((prev) => ({ ...prev, cost: event.target.value }))}
                        placeholder="Ex.: 8.20"
                      />
                    </label>
                    <label>
                      <span>Status</span>
                      <select
                        value={formData.status}
                        onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}
                      >
                        <option value="fazer">Fazer</option>
                        <option value="planejado">Planejado</option>
                        <option value="finalizado">Finalizado</option>
                      </select>
                    </label>
                  </div>
                  <div className="meal-form-actions">
                    <button
                      type="button"
                      className="delete-meal-btn"
                      onClick={() => {
                        handleDelete(editingId)
                        setShowForm(false)
                        setEditingId(null)
                        setFormData(initialForm)
                        setShowFabMenu(false)
                      }}
                      title="Excluir refeição"
                    >
                      <FiTrash2 size={18} />
                    </button>
                    <button type="button" className="primary-btn" onClick={handleSubmit}>
                      Atualizar refeição
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Floating Action Button */}
      <div className="fab-container">
        {showFabMenu && (
          <div className="fab-menu">
            <button
              type="button"
              className="fab-menu-item"
              onClick={(e) => {
                e.stopPropagation()
                setShowForm(true)
                setShowFabMenu(false)
                setFormData(initialForm)
                setEditingId(null)
              }}
            >
              <FiPlus size={20} />
              <span>Nova refeição</span>
            </button>
          </div>
        )}
        <button
          type="button"
          className={`fab-button ${showFabMenu ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            setShowFabMenu(!showFabMenu)
          }}
          aria-label="Nova refeição"
        >
          <FiPlus size={24} />
        </button>
      </div>
    </div>
  )
}

