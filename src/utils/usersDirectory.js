const USERS_DIRECTORY_KEY = 'usersDirectory'

const USER_TYPE_LABELS = {
  customer: 'Cliente',
  supplier: 'Fornecedor',
  employee: 'Funcionário'
}

export function getUsersDirectory() {
  try {
    const raw = localStorage.getItem(USERS_DIRECTORY_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function getUserTypeLabel(type) {
  return USER_TYPE_LABELS[type] || 'Usuário'
}

export function formatUserDisplay(user) {
  if (!user) return ''
  const typeLabel = getUserTypeLabel(user.type)
  const name = String(user.name || '').trim() || '—'
  return `${typeLabel}: ${name}`
}

export function findUserById(users, id) {
  if (!id) return null
  const list = Array.isArray(users) ? users : []
  return list.find((u) => u?.id === id) || null
}

export function groupUsersByType(users) {
  const list = Array.isArray(users) ? users : []
  const groups = { customer: [], supplier: [], employee: [], other: [] }
  for (const u of list) {
    if (!u) continue
    if (u.type === 'customer') groups.customer.push(u)
    else if (u.type === 'supplier') groups.supplier.push(u)
    else if (u.type === 'employee') groups.employee.push(u)
    else groups.other.push(u)
  }
  return groups
}

