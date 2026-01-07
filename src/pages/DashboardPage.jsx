import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../stores/appStore'
import { useAuth } from '../components/AuthProvider'
import { FiEdit3, FiTrash2, FiPlus, FiClock, FiDollarSign, FiThermometer } from 'react-icons/fi'
import './PageCommon.css'
import './DashboardPage.css'

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
  'pimentão': '🫑', 'bell pepper': '🫑',
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
  'coentro': '🌿', 'cilantro': '🌿',
  'endívia': '🥬', 'endive': '🥬',
  'funcho': '🌿', 'fennel': '🌿',
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
  'salsa': '🌿', 'parsley': '🌿',
  'cebolinha': '🌿', 'chives': '🌿',
  'hortelã': '🌿', 'mint': '🌿',
  'manjericão': '🌿', 'basil': '🌿',
  'tomilho': '🌿', 'thyme': '🌿',
  'alecrim': '🌿', 'rosemary': '🌿',
  'orégano fresco': '🌿', 'fresh oregano': '🌿',
  'beterraba': '🍠', 'beetroot': '🍠',
  'inhame': '🍠', 'yam': '🍠',
  'macaxeira': '🍠', 'cassava': '🍠', 'mandioca': '🍠',
  'taro': '🍠', 'taro root': '🍠',
  'fava': '🟢', 'fava beans': '🟢',
  'lentilha': '🟢', 'lentils': '🟢',
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
  'pimenta do reino': '🧂', 'black pepper': '🧂',
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
  'pink peppercorn': '🧂', 'pimenta rosa': '🧂',


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
  'amendoim': '🥜', 'peanut': '🥜',
  'amendoim torrado': '🥜', 'roasted peanuts': '🥜',
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
  'cordeiro': '🥩', 'lamb': '🥩',
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
  'badejo': '🐟', 'grouper': '🐟',
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
  'siri': '🦀', 'blue crab': '🦀',
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
  'castanha': '🌰', 'nuts': '🌰',
  'castanha do pará': '🌰', 'brazil nut': '🌰',
  'amêndoa': '🌰', 'almond': '🌰',
  'nozes': '🌰', 'walnut': '🌰',

  // 🌿 ERVAS, ESPECIARIAS E CONDIMENTOS
  'sal': '🧂', 'salt': '🧂',
  'açúcar': '🍬', 'sugar': '🍬',
  'mel': '🍯', 'honey': '🍯',
  'pimenta': '🌶️', 'chili': '🌶️',
  'canela': '🟤', 'cinnamon': '🟤',
  'cominho': '🟤', 'cumin': '🟤',
  'hortelã': '🌿', 'mint': '🌿',
  'manjericão': '🌿', 'basil': '🌿',
  'orégano': '🌿', 'oregano': '🌿',
  'alecrim': '🌿', 'rosemary': '🌿',
  'azeite': '🫒', 'olive oil': '🫒',

  // 🍫 DOCES E SOBREMESAS
  'chocolate': '🍫',
  'bolo': '🍰', 'cake': '🍰',
  'torta': '🥧', 'pie': '🥧',
  'biscoito': '🍪', 'cookie': '🍪',
  'sorvete': '🍨', 'ice cream': '🍨',
  'pudim': '🍮', 'flan': '🍮',

  // 🍝 MOLHOS E PREPAROS
  'molho': '🍝', 'sauce': '🍝',
  'molho de tomate': '🍅', 'tomato sauce': '🍅',
  'pesto': '🍝',
  'alfredo': '🍝',
  'maionese': '🥚',
  'ketchup': '🍅',
  'mostarda': '🟡', 'mustard': '🟡',

  // 🥤 BEBIDAS
  'água': '💧', 'water': '💧',
  'suco': '🧃', 'juice': '🧃',
  'café': '☕', 'coffee': '☕',
  'chá': '🍵', 'tea': '🍵',
  'refrigerante': '🥤', 'soda': '🥤',
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

export function DashboardPage() {
  const { user } = useAuth()
  const recipes = useAppStore((state) => state.recipes)
  const [meals, setMeals] = useState(defaultMeals)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [showFabMenu, setShowFabMenu] = useState(false)

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
    // Extrair valor e unidade de calorias (ex: "250 Cal" -> "250", "Cal")
    const caloriesStr = meal.calories || ''
    const caloriesMatch = caloriesStr.match(/^(\d+(?:\.\d+)?)\s*(Cal|Seg|Min|Hrs|KG|G|Litro)?$/i)
    const caloriesValue = caloriesMatch ? caloriesMatch[1] : caloriesStr.replace(/\s*(Cal|Seg|Min|Hrs|KG|G|Litro)/gi, '').trim() || ''
    const caloriesUnit = caloriesMatch?.[2] || (caloriesStr.toLowerCase().includes('cal') ? 'Cal' : 'Cal')

    // Extrair valor e unidade de tempo (ex: "15 min" -> "15", "Min")
    const timeStr = meal.time || ''
    const timeMatch = timeStr.match(/^(\d+(?:\.\d+)?)\s*(Seg|Min|Hrs|KG|G|Litro)?$/i)
    const timeValue = timeMatch ? timeMatch[1] : timeStr.replace(/\s*(Seg|Min|Hrs|KG|G|Litro)/gi, '').trim() || ''
    const timeUnit = timeMatch?.[2] || (timeStr.toLowerCase().includes('min') ? 'Min' : (timeStr.toLowerCase().includes('hrs') || timeStr.toLowerCase().includes('hora') ? 'Hrs' : 'Min'))

    setFormData({
      title: meal.title,
      calories: caloriesValue,
      caloriesUnit: caloriesUnit,
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

    const mealData = {
      ...formData,
      calories: `${formData.calories} ${formData.caloriesUnit}`,
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

  return (
    <div className="dashboard-page page">
      {/* Painel de Status Diário */}
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

      {businessInsights && (
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
          <div className="meal-form">
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
                <div className="input-with-select">
                  <input
                    type="text"
                    value={formData.calories}
                    onChange={(event) => setFormData((prev) => ({ ...prev, calories: event.target.value }))}
                    placeholder="Ex.: 250"
                  />
                  <select
                    value={formData.caloriesUnit}
                    onChange={(event) => setFormData((prev) => ({ ...prev, caloriesUnit: event.target.value }))}
                    className="unit-select"
                  >
                    <option value="Cal">Cal</option>
                    <option value="Seg">Seg</option>
                    <option value="Min">Min</option>
                    <option value="Hrs">Hrs</option>
                    <option value="KG">KG</option>
                    <option value="G">G</option>
                    <option value="Litro">Litro</option>
                  </select>
                </div>
              </label>
            </div>
            <div className="meal-form-row">
              <label>
                <span>Ingredientes</span>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(event) => setFormData((prev) => ({ ...prev, ingredients: event.target.value }))}
                  placeholder="Ex.: Avocado, Bread, Eggs"
                />
                {getIngredientsList().length > 0 && (
                  <div className="ingredients-chips">
                    {getIngredientsList().map((ingredient, index) => (
                      <span key={index} className="ingredient-chip">
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
            <article
              key={meal.id}
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
                    {meal.calories}
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
          ))}
        </div>
      </section>

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

