import { useEffect, useMemo, useState } from 'react'
import { FormModal } from '../components/ui/FormModal'
import { FiEdit2, FiEye, FiFilter, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import { api } from '../lib/api'
import './PageCommon.css'
import './UsersPage.css'

const STORAGE_KEY = 'usersDirectory'

const USER_TYPE_LABELS = {
  customer: 'Cliente',
  supplier: 'Fornecedor',
  employee: 'Funcionário'
}

const USER_TYPE_COLORS = {
  customer: '#3b82f6',
  supplier: '#f59e0b',
  employee: '#10b981'
}

const STATUS_LABELS = {
  active: 'Ativo',
  inactive: 'Inativo'
}

const normalizeText = (value) => {
  const raw = String(value ?? '').trim().toLowerCase()
  if (!raw) return ''
  return raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const digitsOnly = (value) => String(value ?? '').replace(/\D/g, '')

// Validação básica (mas correta) de CPF
const isValidCPF = (cpf) => {
  const v = digitsOnly(cpf)
  if (v.length !== 11) return false
  if (/^(\d)\1+$/.test(v)) return false
  const calc = (base) => {
    let sum = 0
    for (let i = 0; i < base.length; i++) {
      sum += Number(base[i]) * (base.length + 1 - i)
    }
    const mod = sum % 11
    return mod < 2 ? 0 : 11 - mod
  }
  const d1 = calc(v.slice(0, 9))
  const d2 = calc(v.slice(0, 9) + String(d1))
  return v === v.slice(0, 9) + String(d1) + String(d2)
}

// Validação básica (mas correta) de CNPJ
const isValidCNPJ = (cnpj) => {
  const v = digitsOnly(cnpj)
  if (v.length !== 14) return false
  if (/^(\d)\1+$/.test(v)) return false
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const calc = (base, weights) => {
    let sum = 0
    for (let i = 0; i < weights.length; i++) sum += Number(base[i]) * weights[i]
    const mod = sum % 11
    return mod < 2 ? 0 : 11 - mod
  }
  const d1 = calc(v, weights1)
  const d2 = calc(v.slice(0, 12) + String(d1), weights2)
  return v === v.slice(0, 12) + String(d1) + String(d2)
}

const getDocumentLabel = (type) => (type === 'supplier' ? 'CNPJ' : 'CPF/CNPJ')

const formatDocument = (doc) => {
  const v = digitsOnly(doc)
  if (v.length === 11) return v.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*$/, '$1.$2.$3-$4')
  if (v.length === 14) return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*$/, '$1.$2.$3/$4-$5')
  return doc || ''
}

const formatPhone = (phone) => {
  const v = digitsOnly(phone)
  if (v.length === 10) return v.replace(/^(\d{2})(\d{4})(\d{4}).*$/, '($1) $2-$3')
  if (v.length === 11) return v.replace(/^(\d{2})(\d{5})(\d{4}).*$/, '($1) $2-$3')
  return phone || ''
}

const createEmptyUser = () => ({
  id: crypto.randomUUID(),
  type: 'customer',
  status: 'active',
  name: '',
  document: '',
  phone: '',
  email: '',
  notes: '',
  // Cliente
  birthDate: '',
  // Fornecedor
  companyName: '',
  // Funcionário
  role: '',
  admissionDate: '',
  accessLevel: 'operador'
})

export function UsersPage() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // create | edit | view
  const [draft, setDraft] = useState(createEmptyUser)
  const [cnpjLookup, setCnpjLookup] = useState({ status: 'idle', message: '' }) // idle|loading|ok|error

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      setUsers(Array.isArray(parsed) ? parsed : [])
    } catch {
      setUsers([])
    }
  }, [])

  const persist = (next) => {
    setUsers(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  const filteredUsers = useMemo(() => {
    const q = normalizeText(search)
    return (users || []).filter((u) => {
      if (typeFilter !== 'all' && u.type !== typeFilter) return false
      if (statusFilter !== 'all' && u.status !== statusFilter) return false
      if (q) {
        const name = normalizeText(u.name)
        const doc = digitsOnly(u.document)
        if (!name.includes(q) && !doc.includes(digitsOnly(q))) return false
      }
      return true
    })
  }, [users, search, typeFilter, statusFilter])

  const openCreate = () => {
    setModalMode('create')
    setDraft(createEmptyUser())
    setCnpjLookup({ status: 'idle', message: '' })
    setModalOpen(true)
  }

  const openView = (u) => {
    setModalMode('view')
    setDraft({ ...u })
    setCnpjLookup({ status: 'idle', message: '' })
    setModalOpen(true)
  }

  const openEdit = (u) => {
    setModalMode('edit')
    setDraft({ ...u })
    setCnpjLookup({ status: 'idle', message: '' })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setDraft(createEmptyUser())
    setCnpjLookup({ status: 'idle', message: '' })
  }

  const autofillFromCnpj = async (docRaw) => {
    const cnpj = digitsOnly(docRaw)
    if (!isValidCNPJ(cnpj)) return

    setCnpjLookup({ status: 'loading', message: 'Buscando dados do CNPJ…' })
    try {
      const data = await api.lookupCnpj(cnpj)

      setDraft((prev) => {
        // Preencher apenas se o usuário ainda não digitou (para não sobrescrever)
        const next = { ...prev }

        if (prev.type === 'supplier') {
          if (!String(prev.name || '').trim() && data?.razaoSocial) next.name = data.razaoSocial
          if (!String(prev.companyName || '').trim() && data?.nomeFantasia) next.companyName = data.nomeFantasia
        } else {
          // Para outros tipos, podemos preencher name se vazio
          if (!String(prev.name || '').trim() && data?.razaoSocial) next.name = data.razaoSocial
        }

        if (!String(prev.phone || '').trim() && data?.telefone) next.phone = data.telefone
        if (!String(prev.email || '').trim() && data?.email) next.email = data.email

        // Colocar endereço nas observações se estiver vazio
        if (!String(prev.notes || '').trim() && data?.endereco) {
          const e = data.endereco
          const parts = [
            e.logradouro,
            e.numero ? `nº ${e.numero}` : null,
            e.complemento,
            e.bairro,
            e.municipio ? `${e.municipio}/${e.uf || ''}` : null,
            e.cep ? `CEP ${e.cep}` : null
          ].filter(Boolean)
          if (parts.length) next.notes = `Endereço (CNPJ): ${parts.join(', ')}`
        }

        return next
      })

      setCnpjLookup({ status: 'ok', message: 'Dados preenchidos a partir do CNPJ.' })
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error)
      setCnpjLookup({ status: 'error', message: error.message || 'Não foi possível consultar o CNPJ.' })
    }
  }

  const validate = (u) => {
    const errors = []
    const nameOk = String(u.name || '').trim().length >= 2
    if (!nameOk) errors.push('Informe o nome completo / razão social.')

    if (!u.type) errors.push('Selecione o tipo de usuário.')

    const doc = digitsOnly(u.document)
    if (u.type === 'supplier') {
      if (!u.companyName?.trim()) errors.push('Informe o nome da empresa.')
      if (!isValidCNPJ(doc)) errors.push('CNPJ inválido.')
    } else {
      if (doc.length > 0 && !(isValidCPF(doc) || isValidCNPJ(doc))) {
        errors.push('Documento inválido (CPF/CNPJ).')
      }
    }

    return errors
  }

  const handleSave = () => {
    const errors = validate(draft)
    if (errors.length) {
      alert(errors.join('\n'))
      return
    }

    if (modalMode === 'create') {
      persist([draft, ...users])
    } else if (modalMode === 'edit') {
      persist(users.map((u) => (u.id === draft.id ? draft : u)))
    }
    closeModal()
  }

  const handleDelete = (u) => {
    if (!window.confirm(`Excluir "${u.name}"?`)) return
    persist(users.filter((x) => x.id !== u.id))
  }

  const readonly = modalMode === 'view'

  return (
    <div className="page users-page">
      <div className="page-header users-header">
        <div>
          <h1>Usuários</h1>
          <div className="page-subtitle">Gerenciamento de clientes, fornecedores e funcionários.</div>
        </div>
        <div className="users-header-actions">
          <button type="button" className="page-filter-btn" onClick={() => setShowFilters((v) => !v)}>
            <FiFilter size={18} />
            Filtros
          </button>
          <button type="button" className="primary-btn" onClick={openCreate}>
            <FiPlus size={18} />
            Novo Usuário
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="page-stack users-filters">
          <div className="users-filters-grid">
            <div className="users-filter-group users-filter-group--wide">
              <label>Buscar</label>
              <input
                type="text"
                placeholder="Nome ou documento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="users-filter-group">
              <label>Tipo</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">Todos</option>
                <option value="customer">Cliente</option>
                <option value="supplier">Fornecedor</option>
                <option value="employee">Funcionário</option>
              </select>
            </div>
            <div className="users-filter-group">
              <label>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Todos</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="users-table-wrap">
        {filteredUsers.length === 0 ? (
          <div className="users-empty">Nenhum usuário encontrado.</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Documento</th>
                <th>Telefone</th>
                <th>Status</th>
                <th style={{ width: '220px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const color = USER_TYPE_COLORS[u.type] || '#6b7280'
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="users-name">
                        <strong>{u.name || '—'}</strong>
                        {u.email ? <span>{u.email}</span> : null}
                      </div>
                    </td>
                    <td>
                      <span className="users-badge" style={{ backgroundColor: `${color}18`, color }}>
                        {USER_TYPE_LABELS[u.type] || u.type}
                      </span>
                    </td>
                    <td className="users-mono">{formatDocument(u.document) || '—'}</td>
                    <td className="users-mono">{formatPhone(u.phone) || '—'}</td>
                    <td>
                      <span className={`users-status ${u.status}`}>{STATUS_LABELS[u.status] || u.status}</span>
                    </td>
                    <td>
                      <div className="users-actions">
                        <button type="button" className="users-icon-btn" onClick={() => openView(u)} title="Visualizar">
                          <FiEye size={18} />
                        </button>
                        <button type="button" className="users-icon-btn" onClick={() => openEdit(u)} title="Editar">
                          <FiEdit2 size={18} />
                        </button>
                        <button type="button" className="users-icon-btn danger" onClick={() => handleDelete(u)} title="Excluir">
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <FormModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalMode === 'create' ? 'Novo Usuário' : modalMode === 'edit' ? 'Editar Usuário' : 'Detalhes do Usuário'}
        description="Cadastre e gerencie clientes, fornecedores e funcionários."
        isExpanded
        footer={
          <div className="users-modal-footer">
            <button type="button" className="page-btn-secondary" onClick={closeModal}>
              <FiX size={16} />
              Cancelar
            </button>
            {modalMode !== 'view' && (
              <button type="button" className="page-btn-primary" onClick={handleSave}>
                Salvar
              </button>
            )}
          </div>
        }
      >
        <div className="users-modal">
          <div className="users-form-grid">
            <div className="users-field">
              <label>Tipo de usuário</label>
              <select
                value={draft.type}
                onChange={(e) => setDraft((p) => ({ ...p, type: e.target.value }))}
                disabled={readonly}
              >
                <option value="customer">Cliente</option>
                <option value="supplier">Fornecedor</option>
                <option value="employee">Funcionário</option>
              </select>
            </div>

            <div className="users-field">
              <label>Status</label>
              <select
                value={draft.status}
                onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
                disabled={readonly}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            {draft.type === 'supplier' ? (
              <div className="users-field users-field--wide">
                <label>Nome da empresa</label>
                <input
                  value={draft.companyName}
                  onChange={(e) => setDraft((p) => ({ ...p, companyName: e.target.value }))}
                  placeholder="Ex: Padaria Exemplo LTDA"
                  disabled={readonly}
                />
              </div>
            ) : null}

            <div className="users-field users-field--wide">
              <label>Nome completo / Razão social</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                placeholder={draft.type === 'supplier' ? 'Razão social do fornecedor' : 'Nome completo'}
                disabled={readonly}
              />
            </div>

            <div className="users-field">
              <label>{getDocumentLabel(draft.type)}</label>
              <input
                value={draft.document}
                onChange={(e) => setDraft((p) => ({ ...p, document: e.target.value }))}
                placeholder={draft.type === 'supplier' ? '00.000.000/0000-00' : '000.000.000-00 ou 00.000.000/0000-00'}
                disabled={readonly}
                onBlur={() => {
                  // Autofill apenas para CNPJ (fornecedor) quando válido
                  const doc = digitsOnly(draft.document)
                  if (!readonly && draft.type === 'supplier' && isValidCNPJ(doc)) {
                    autofillFromCnpj(doc)
                  }
                }}
              />
              <small className="users-hint">
                {digitsOnly(draft.document).length === 0
                  ? 'Opcional (exceto fornecedor)'
                  : isValidCPF(digitsOnly(draft.document)) || isValidCNPJ(digitsOnly(draft.document))
                    ? 'Documento válido'
                    : 'Documento inválido'}
              </small>
              {draft.type === 'supplier' && isValidCNPJ(digitsOnly(draft.document)) && !readonly ? (
                <div className={`users-lookup users-lookup--${cnpjLookup.status}`}>
                  <button
                    type="button"
                    className="users-lookup-btn"
                    onClick={() => autofillFromCnpj(digitsOnly(draft.document))}
                    disabled={cnpjLookup.status === 'loading'}
                  >
                    {cnpjLookup.status === 'loading' ? 'Buscando…' : 'Buscar dados do CNPJ'}
                  </button>
                  {cnpjLookup.message ? <span className="users-lookup-msg">{cnpjLookup.message}</span> : null}
                </div>
              ) : null}
            </div>

            <div className="users-field">
              <label>Telefone</label>
              <input
                value={draft.phone}
                onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
                disabled={readonly}
              />
            </div>

            <div className="users-field users-field--wide">
              <label>E-mail (opcional)</label>
              <input
                value={draft.email}
                onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
                placeholder="email@exemplo.com"
                disabled={readonly}
              />
            </div>

            {draft.type === 'customer' ? (
              <div className="users-field">
                <label>Data de nascimento (opcional)</label>
                <input
                  type="date"
                  value={draft.birthDate}
                  onChange={(e) => setDraft((p) => ({ ...p, birthDate: e.target.value }))}
                  disabled={readonly}
                />
              </div>
            ) : null}

            {draft.type === 'employee' ? (
              <>
                <div className="users-field">
                  <label>Cargo</label>
                  <input
                    value={draft.role}
                    onChange={(e) => setDraft((p) => ({ ...p, role: e.target.value }))}
                    placeholder="Ex: Atendente"
                    disabled={readonly}
                  />
                </div>
                <div className="users-field">
                  <label>Data de admissão</label>
                  <input
                    type="date"
                    value={draft.admissionDate}
                    onChange={(e) => setDraft((p) => ({ ...p, admissionDate: e.target.value }))}
                    disabled={readonly}
                  />
                </div>
                <div className="users-field users-field--wide">
                  <label>Permissão / Nível de acesso</label>
                  <select
                    value={draft.accessLevel}
                    onChange={(e) => setDraft((p) => ({ ...p, accessLevel: e.target.value }))}
                    disabled={readonly}
                  >
                    <option value="operador">Operador</option>
                    <option value="gerente">Gerente</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            ) : null}

            <div className="users-field users-field--wide">
              <label>Observações</label>
              <textarea
                value={draft.notes}
                onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Informações adicionais..."
                rows={4}
                disabled={readonly}
              />
            </div>
          </div>
        </div>
      </FormModal>
    </div>
  )
}

