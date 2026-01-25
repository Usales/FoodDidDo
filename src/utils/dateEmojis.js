/**
 * Utilitário para gerenciar emojis de fundo baseados em datas especiais
 */

// Configuração dos emojis para cada data especial
const SPECIAL_DATES_EMOJIS = {
  natal: {
    name: 'Natal',
    emojis: ['🎄', '🎅', '🍪', '🥛', '🍗', '🍷', '🍰', '✨', '🕯️', '⭐']
  },
  pascoa: {
    name: 'Páscoa',
    emojis: ['🥚', '🍫', '🐰', '🍬', '🧺', '✨', '🕊️', '🐣', '🍩', '🍪']
  },
  anoNovo: {
    name: 'Ano Novo / Réveillon',
    emojis: ['🥂', '🍾', '🎉', '✨', '🍇', '🍽️', '🎆', '🎊', '🌟', '🍸']
  },
  diaDasMaes: {
    name: 'Dia das Mães',
    emojis: ['🍰', '🍓', '☕', '💐', '❤️', '🍽️', '🎁', '🥞', '🍫', '🌷']
  },
  diaDosPais: {
    name: 'Dia dos Pais',
    emojis: ['🍖', '🥩', '🍺', '🍟', '🍔', '🔥', '🍽️', '😄', '🎁', '🥃']
  },
  diaDasCriancas: {
    name: 'Dia das Crianças',
    emojis: ['🍭', '🍬', '🍫', '🍦', '🧁', '🎈', '🍪', '🎉', '🍨', '🍩']
  },
  diaDosNamorados: {
    name: 'Dia dos Namorados',
    emojis: ['🍷', '🍫', '🍓', '🍰', '🌹', '💘', '✨', '🍽️', '🥂', '❤️']
  },
  diaDoAmigo: {
    name: 'Dia do Amigo',
    emojis: ['🍕', '🍻', '🍫', '🍟', '🧁', '🍔', '🎉', '🍷', '🥂', '😄']
  },
  diaDaGastronomia: {
    name: 'Dia da Gastronomia',
    emojis: ['🍽️', '👨‍🍳', '🍝', '🍛', '🍷', '✨', '🥗', '🥘', '🔥', '🍰']
  },
  diaDoChocolate: {
    name: 'Dia do Chocolate',
    emojis: ['🍫', '🍩', '🍪', '🍰', '🧁', '🍬', '😋', '🍨', '✨', '☕']
  },
  diaDoCafe: {
    name: 'Dia do Café',
    emojis: ['☕', '🍪', '🥐', '🍩', '🌞', '✨', '📚', '🥛', '🍫', '😋']
  },
  diaDoSorvete: {
    name: 'Dia do Sorvete',
    emojis: ['🍦', '🍨', '🍧', '🍓', '🍫', '😋', '🌞', '🎉', '🧁', '🌈']
  },
  diaDaPizza: {
    name: 'Dia da Pizza',
    emojis: ['🍕', '🧀', '🍅', '🥤', '😋', '🍽️', '✨', '🎉', '🌶️', '🫓']
  },
  diaDoHamburguer: {
    name: 'Dia do Hambúrguer',
    emojis: ['🍔', '🍟', '🥤', '😋', '🍅', '🧀', '🧅', '🍽️', '✨', '🌭']
  },
  carnaval: {
    name: 'Carnaval',
    emojis: ['🎭', '🎪', '🎉', '🎊', '🥳', '🎈', '🍹', '🍻', '🎵', '💃', '🕺', '✨', '🎨', '🌈', '🍺']
  }
}

// Emojis padrão (caso não seja nenhuma data especial)
const DEFAULT_EMOJIS = [
  '🍕', '🍔', '🍟', '🌭', '🍿', '🥗', '🥩', '🍗', '🍖', '🍤',
  '🍣', '🍙', '🍚', '🍜', '🍝', '🍲', '🥘', '🍛', '🍱', '🍳',
  '🍦', '🍧', '🍨', '🍩', '🍪', '🍫', '🍬', '🍭', '🍮', '🍯',
  '🍎', '🍏', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐',
  '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🥑', '🥦', '🥬', '🥒',
  '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥜', '🌰', '🍄',
  '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍯', '🥛', '☕', '🍵',
  '🥤', '🧃', '🍺', '🍻', '🥂', '🍷', '🍸', '🍹', '🧊', '🥄'
]

/**
 * Calcula a data da Páscoa usando o algoritmo de Gauss
 * @param {number} year - Ano para calcular a Páscoa
 * @returns {Date} - Data da Páscoa
 */
function calculateEaster(year) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1

  return new Date(year, month, day)
}

/**
 * Calcula o 2º domingo de maio (Dia das Mães no Brasil)
 * @param {number} year - Ano para calcular
 * @returns {Date} - Data do Dia das Mães
 */
function calculateMothersDay(year) {
  // Primeiro dia de maio
  const firstDay = new Date(year, 4, 1) // Mês 4 = maio (0-indexed)
  const dayOfWeek = firstDay.getDay() // 0 = domingo, 1 = segunda, etc.
  
  // Calcula quantos dias até o primeiro domingo
  let daysUntilFirstSunday = (7 - dayOfWeek) % 7
  if (daysUntilFirstSunday === 0 && dayOfWeek !== 0) {
    daysUntilFirstSunday = 7
  }
  
  // Primeiro domingo de maio
  const firstSunday = new Date(year, 4, 1 + daysUntilFirstSunday)
  
  // Segundo domingo = primeiro domingo + 7 dias
  const secondSunday = new Date(firstSunday)
  secondSunday.setDate(firstSunday.getDate() + 7)
  
  return secondSunday
}

/**
 * Calcula o 2º domingo de agosto (Dia dos Pais no Brasil)
 * @param {number} year - Ano para calcular
 * @returns {Date} - Data do Dia dos Pais
 */
function calculateFathersDay(year) {
  // Primeiro dia de agosto
  const firstDay = new Date(year, 7, 1) // Mês 7 = agosto (0-indexed)
  const dayOfWeek = firstDay.getDay() // 0 = domingo, 1 = segunda, etc.
  
  // Calcula quantos dias até o primeiro domingo
  let daysUntilFirstSunday = (7 - dayOfWeek) % 7
  if (daysUntilFirstSunday === 0 && dayOfWeek !== 0) {
    daysUntilFirstSunday = 7
  }
  
  // Primeiro domingo de agosto
  const firstSunday = new Date(year, 7, 1 + daysUntilFirstSunday)
  
  // Segundo domingo = primeiro domingo + 7 dias
  const secondSunday = new Date(firstSunday)
  secondSunday.setDate(firstSunday.getDate() + 7)
  
  return secondSunday
}

/**
 * Verifica se duas datas são do mesmo dia (ignorando horas)
 * @param {Date} date1 - Primeira data
 * @param {Date} date2 - Segunda data
 * @returns {boolean} - True se forem do mesmo dia
 */
function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Retorna qual data especial é hoje (se houver)
 * @param {Date} currentDate - Data atual (padrão: new Date())
 * @returns {string|null} - Chave da data especial ou null
 */
function getCurrentSpecialDate(currentDate = new Date()) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1 // 1-12
  const day = currentDate.getDate()

  // Datas fixas
  const fixedDates = {
    // Natal - 25 de dezembro
    natal: { month: 12, day: 25 },
    // Ano Novo - 31 de dezembro
    anoNovo: { month: 12, day: 31 },
    // Dia das Crianças - 12 de outubro
    diaDasCriancas: { month: 10, day: 12 },
    // Dia dos Namorados - 12 de junho
    diaDosNamorados: { month: 6, day: 12 },
    // Dia do Amigo - 20 de julho
    diaDoAmigo: { month: 7, day: 20 },
    // Dia do Chocolate - 7 de julho
    diaDoChocolate: { month: 7, day: 7 },
    // Dia do Café - 14 de abril
    diaDoCafe: { month: 4, day: 14 },
    // Dia do Sorvete - 23 de setembro
    diaDoSorvete: { month: 9, day: 23 },
    // Dia da Pizza - 10 de julho (mesmo dia da Gastronomia)
    diaDaPizza: { month: 7, day: 10 },
    // Dia do Hambúrguer - 28 de maio
    diaDoHamburguer: { month: 5, day: 28 }
  }

  // Verifica datas fixas (verificar Dia da Pizza primeiro para ter prioridade sobre Gastronomia)
  if (month === 7 && day === 10) {
    return 'diaDaPizza' // Dia da Pizza tem prioridade sobre Dia da Gastronomia
  }
  
  for (const [key, { month: m, day: d }] of Object.entries(fixedDates)) {
    if (month === m && day === d) {
      return key
    }
  }

  // Datas móveis
  const easterDate = calculateEaster(year)
  if (isSameDay(currentDate, easterDate)) {
    return 'pascoa'
  }

  const mothersDay = calculateMothersDay(year)
  if (isSameDay(currentDate, mothersDay)) {
    return 'diaDasMaes'
  }

  const fathersDay = calculateFathersDay(year)
  if (isSameDay(currentDate, fathersDay)) {
    return 'diaDosPais'
  }

  return null
}

/**
 * Retorna os emojis para a data atual
 * @param {Date} currentDate - Data atual (padrão: new Date())
 * @returns {string[]} - Array de emojis
 */
export function getEmojisForDate(currentDate = new Date()) {
  const specialDateKey = getCurrentSpecialDate(currentDate)
  
  if (specialDateKey && SPECIAL_DATES_EMOJIS[specialDateKey]) {
    return SPECIAL_DATES_EMOJIS[specialDateKey].emojis
  }
  
  return DEFAULT_EMOJIS
}

/**
 * Retorna o nome da data especial atual (se houver)
 * @param {Date} currentDate - Data atual (padrão: new Date())
 * @returns {string|null} - Nome da data especial ou null
 */
export function getSpecialDateName(currentDate = new Date()) {
  const specialDateKey = getCurrentSpecialDate(currentDate)
  
  if (specialDateKey && SPECIAL_DATES_EMOJIS[specialDateKey]) {
    return SPECIAL_DATES_EMOJIS[specialDateKey].name
  }
  
  return null
}

// Exporta também as funções auxiliares caso sejam necessárias
export { getCurrentSpecialDate, calculateEaster, calculateMothersDay, calculateFathersDay }

