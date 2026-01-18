import PropTypes from 'prop-types'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AiOutlineHome,
  AiOutlineShoppingCart,
  AiOutlineBook,
  AiOutlineDollarCircle,
  AiOutlineFundProjectionScreen,
  AiOutlinePieChart,
  AiOutlineCalculator,
  AiOutlineTag,
  AiOutlineExperiment,
  AiOutlineInbox,
  AiOutlineLineChart,
  AiOutlineFileText,
  AiOutlineSetting,
  AiOutlineRise,
  AiOutlineWallet
} from 'react-icons/ai'
import { FiLogOut, FiSearch, FiChevronDown, FiMenu, FiX } from 'react-icons/fi'
import { HiMoon, HiSun } from 'react-icons/hi'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import './MainLayout.css'

const DASHBOARD_SETTINGS_KEY = 'dashboardSettings'
const SIDEBAR_SETTINGS_KEY = 'sidebarSettings'

const navigation = [
  {
    section: 'Visão Geral',
    items: [
      { path: '/dashboard', label: 'Home', icon: <AiOutlineHome /> },
      { path: '/caixa', label: 'Caixa', icon: <AiOutlineWallet /> },
      { path: '/fluxo-caixa', label: 'Fluxo de Caixa', icon: <AiOutlineLineChart /> },
      { path: '/orcamento', label: 'Orçamentos', icon: <AiOutlineDollarCircle /> },
      { path: '/ingredientes', label: 'Ingredientes', icon: <AiOutlineShoppingCart /> },
      { path: '/receitas', label: 'Receitas', icon: <AiOutlineBook /> }
    ]
  },
  {
    section: 'Análises',
    items: [
      { path: '/custos', label: 'Custos', icon: <AiOutlinePieChart /> },
      { path: '/simulador', label: 'Simulador', icon: <AiOutlineFundProjectionScreen /> },
      { path: '/lucratividade', label: 'Lucratividade', icon: <AiOutlineRise /> },
      { path: '/custos-fixos', label: 'Custos Fixos', icon: <AiOutlineCalculator /> },
      { path: '/pricing', label: 'Pricing', icon: <AiOutlineTag /> },
      { path: '/simulacao', label: 'Sensibilidade', icon: <AiOutlineExperiment /> }
    ]
  },
  {
    section: 'Operação',
    items: [
      { path: '/estoque', label: 'Estoque', icon: <AiOutlineInbox /> },
      { path: '/relatorios', label: 'Relatórios', icon: <AiOutlineFileText /> },
      { path: '/config', label: 'Configurações', icon: <AiOutlineSetting /> }
    ]
  }
]

export function MainLayout({ onLogout, user }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, transform: 'translate(-50%, -50%)' })
  const [isMobile, setIsMobile] = useState(false)
  const [dashboardSettings, setDashboardSettings] = useState({ showHeader: false })
  const [sidebarSettings, setSidebarSettings] = useState({
    showVisaoGeral: false,
    showAnalises: false,
    showOperacao: false,
    showDashboard: false,
    showCaixa: false,
    showFluxoCaixa: false,
    showOrcamento: false,
    showIngredientes: false,
    showReceitas: false,
    showCustos: false,
    showSimulador: false,
    showLucratividade: false,
    showCustosFixos: false,
    showPricing: false,
    showSimulacao: false,
    showEstoque: false,
    showRelatorios: false
  })
  const dropdownRef = useRef(null)
  const userChipRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme, isDarkMode } = useTheme()

  const getBreadcrumb = () => {
    const rawPath = location?.pathname || ''
    const aliasMap = {
      '/financeiro': '/fluxo-caixa',
      '/grocery': '/ingredientes',
      '/geladeira': '/ingredientes'
    }
    const normalizedPath = aliasMap[rawPath] || rawPath

    for (const group of navigation) {
      for (const item of group.items) {
        const isExact = item.path === normalizedPath
        const isNested = item.path !== '/' && normalizedPath.startsWith(`${item.path}/`)
        if (isExact || isNested) {
          return { section: group.section, label: item.label }
        }
      }
    }
    return null
  }

  const breadcrumb = getBreadcrumb()

  // Carregar e reagir às configurações da Home (Cabeçalho)
  useEffect(() => {
    const readSettings = () => {
      try {
        const saved = localStorage.getItem(DASHBOARD_SETTINGS_KEY)
        if (!saved) {
          setDashboardSettings({ showHeader: false })
          return
        }
        const parsed = JSON.parse(saved)
        setDashboardSettings({
          showHeader: typeof parsed?.showHeader === 'boolean' ? parsed.showHeader : false
        })
      } catch {
        setDashboardSettings({ showHeader: false })
      }
    }

    const handleCustom = (event) => {
      const next = event?.detail
      if (next && typeof next === 'object' && typeof next.showHeader === 'boolean') {
        setDashboardSettings({ showHeader: next.showHeader })
      } else {
        readSettings()
      }
    }

    readSettings()
    window.addEventListener('dashboardSettingsChanged', handleCustom)
    return () => window.removeEventListener('dashboardSettingsChanged', handleCustom)
  }, [])

  // Carregar e reagir às configurações da Sidebar
  useEffect(() => {
    const readSidebarSettings = () => {
      try {
        const saved = localStorage.getItem(SIDEBAR_SETTINGS_KEY)
        if (!saved) {
        setSidebarSettings({
          showVisaoGeral: false,
          showAnalises: false,
          showOperacao: false
        })
          return
        }
        const parsed = JSON.parse(saved)
        setSidebarSettings({
          showVisaoGeral: typeof parsed?.showVisaoGeral === 'boolean' ? parsed.showVisaoGeral : false,
          showAnalises: typeof parsed?.showAnalises === 'boolean' ? parsed.showAnalises : false,
          showOperacao: typeof parsed?.showOperacao === 'boolean' ? parsed.showOperacao : false,
          showDashboard: typeof parsed?.showDashboard === 'boolean' ? parsed.showDashboard : false,
          showCaixa: typeof parsed?.showCaixa === 'boolean' ? parsed.showCaixa : false,
          showFluxoCaixa: typeof parsed?.showFluxoCaixa === 'boolean' ? parsed.showFluxoCaixa : false,
          showOrcamento: typeof parsed?.showOrcamento === 'boolean' ? parsed.showOrcamento : false,
          showIngredientes: typeof parsed?.showIngredientes === 'boolean' ? parsed.showIngredientes : false,
          showReceitas: typeof parsed?.showReceitas === 'boolean' ? parsed.showReceitas : false,
          showCustos: typeof parsed?.showCustos === 'boolean' ? parsed.showCustos : false,
          showSimulador: typeof parsed?.showSimulador === 'boolean' ? parsed.showSimulador : false,
          showLucratividade: typeof parsed?.showLucratividade === 'boolean' ? parsed.showLucratividade : false,
          showCustosFixos: typeof parsed?.showCustosFixos === 'boolean' ? parsed.showCustosFixos : false,
          showPricing: typeof parsed?.showPricing === 'boolean' ? parsed.showPricing : false,
          showSimulacao: typeof parsed?.showSimulacao === 'boolean' ? parsed.showSimulacao : false,
          showEstoque: typeof parsed?.showEstoque === 'boolean' ? parsed.showEstoque : false,
          showRelatorios: typeof parsed?.showRelatorios === 'boolean' ? parsed.showRelatorios : false
        })
      } catch {
        setSidebarSettings({
          showVisaoGeral: false,
          showAnalises: false,
          showOperacao: false,
          showDashboard: false,
          showCaixa: false,
          showFluxoCaixa: false,
          showOrcamento: false,
          showIngredientes: false,
          showReceitas: false,
          showCustos: false,
          showSimulador: false,
          showLucratividade: false,
          showCustosFixos: false,
          showPricing: false,
          showSimulacao: false,
          showEstoque: false,
          showRelatorios: false
        })
      }
    }

    const handleSidebarSettingsChange = (event) => {
      const next = event?.detail
      if (next && typeof next === 'object') {
        setSidebarSettings({
          showVisaoGeral: typeof next.showVisaoGeral === 'boolean' ? next.showVisaoGeral : false,
          showAnalises: typeof next.showAnalises === 'boolean' ? next.showAnalises : false,
          showOperacao: typeof next.showOperacao === 'boolean' ? next.showOperacao : false,
          showDashboard: typeof next.showDashboard === 'boolean' ? next.showDashboard : false,
          showCaixa: typeof next.showCaixa === 'boolean' ? next.showCaixa : false,
          showFluxoCaixa: typeof next.showFluxoCaixa === 'boolean' ? next.showFluxoCaixa : false,
          showOrcamento: typeof next.showOrcamento === 'boolean' ? next.showOrcamento : false,
          showIngredientes: typeof next.showIngredientes === 'boolean' ? next.showIngredientes : false,
          showReceitas: typeof next.showReceitas === 'boolean' ? next.showReceitas : false,
          showCustos: typeof next.showCustos === 'boolean' ? next.showCustos : false,
          showSimulador: typeof next.showSimulador === 'boolean' ? next.showSimulador : false,
          showLucratividade: typeof next.showLucratividade === 'boolean' ? next.showLucratividade : false,
          showCustosFixos: typeof next.showCustosFixos === 'boolean' ? next.showCustosFixos : false,
          showPricing: typeof next.showPricing === 'boolean' ? next.showPricing : false,
          showSimulacao: typeof next.showSimulacao === 'boolean' ? next.showSimulacao : false,
          showEstoque: typeof next.showEstoque === 'boolean' ? next.showEstoque : false,
          showRelatorios: typeof next.showRelatorios === 'boolean' ? next.showRelatorios : false
        })
      } else {
        readSidebarSettings()
      }
    }

    readSidebarSettings()
    window.addEventListener('sidebarSettingsChanged', handleSidebarSettingsChange)
    return () => window.removeEventListener('sidebarSettingsChanged', handleSidebarSettingsChange)
  }, [])

  // Verificar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 960)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false)
      }
    }

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userDropdownOpen])

  // Fechar menu mobile ao clicar fora ou pressionar ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        // Verificar se o clique foi no botão hambúrguer
        const menuButton = event.target.closest('.mobile-menu-toggle')
        if (!menuButton) {
          setMobileMenuOpen(false)
        }
      }
    }

    const handleEsc = (event) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEsc)
      // Prevenir scroll do body quando menu aberto
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="main-shell">
      <aside className="main-shell-sidebar">
        <div className="sidebar-brand">
          <img src="/images_/2.png" alt="FoodIDDO" />
        </div>
        <nav>
          {navigation
            .filter((group) => {
              if (group.section === 'Visão Geral') return !sidebarSettings.showVisaoGeral
              if (group.section === 'Análises') return !sidebarSettings.showAnalises
              // Sempre exibir seção Operação se contiver Configurações
              if (group.section === 'Operação') {
                const hasConfig = group.items.some(item => item.path === '/config')
                if (hasConfig) return true // Sempre mostrar seção que contém Configurações
                return !sidebarSettings.showOperacao
              }
              return true
            })
            .map((group) => {
              // Mapeamento de paths para configurações
              const pathToSettingMap = {
                '/dashboard': sidebarSettings.showDashboard,
                '/caixa': sidebarSettings.showCaixa,
                '/fluxo-caixa': sidebarSettings.showFluxoCaixa,
                '/orcamento': sidebarSettings.showOrcamento,
                '/ingredientes': sidebarSettings.showIngredientes,
                '/receitas': sidebarSettings.showReceitas,
                '/custos': sidebarSettings.showCustos,
                '/simulador': sidebarSettings.showSimulador,
                '/lucratividade': sidebarSettings.showLucratividade,
                '/custos-fixos': sidebarSettings.showCustosFixos,
                '/pricing': sidebarSettings.showPricing,
                '/simulacao': sidebarSettings.showSimulacao,
                '/estoque': sidebarSettings.showEstoque,
                '/relatorios': sidebarSettings.showRelatorios
              }

              // Filtrar itens baseado nas configurações (Configurações sempre visível)
              // Quando marcado (true), o item fica oculto, então exibimos quando é false ou undefined
              const filteredItems = group.items.filter((item) => {
                if (item.path === '/config') return true // Sempre mostrar Configurações
                const setting = pathToSettingMap[item.path]
                return setting !== true
              })

              // Não mostrar a seção se não tiver itens visíveis
              if (filteredItems.length === 0) return null

              return (
                <div key={group.section} className="sidebar-section">
                  <span className="sidebar-section-label">{group.section}</span>
                  {filteredItems.map((item) => (
                    <NavLink key={item.path} to={item.path} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                      <span aria-hidden="true" className="sidebar-link-icon">
                        {item.icon}
                      </span>
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )
            })}
        </nav>
        <div className="sidebar-footer">
          <button type="button" className="logout-btn" onClick={onLogout}>
            <FiLogOut size={18} />
            Sair
          </button>
        </div>
      </aside>
      <div className="main-shell-content">
        {!dashboardSettings.showHeader && (
          <header className="topbar">
            <button
              type="button"
              className="mobile-menu-toggle"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <FiX size={20} style={{ display: 'block' }} />
              ) : (
                <FiMenu size={20} style={{ display: 'block' }} />
              )}
            </button>
            <div className="topbar-left">
              <h1>
                {(() => {
                  const hour = new Date().getHours()
                  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
                  const userName = user?.name?.split(' ')[0] || 'Sales'
                  return (
                    <>
                      {greeting}<span className="user-name-mobile">, {userName}</span> 👋
                    </>
                  )
                })()}
              </h1>
              <span className="topbar-subtitle">Organize suas receitas favoritas e gerencie sua geladeira.</span>
            </div>
            <div className="topbar-actions">
              <div className="search-box-wrapper">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  className="global-search"
                  placeholder="Buscar receitas ou ingredientes"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="user-dropdown-wrapper" ref={dropdownRef}>
                <button
                  ref={userChipRef}
                  type="button"
                  className="user-chip"
                  onClick={(e) => {
                    // No mobile, centralizar o dropdown usando valores calculados
                    if (isMobile) {
                      const viewportWidth = window.innerWidth
                      const viewportHeight = window.innerHeight
                      setDropdownPosition({
                        top: viewportHeight / 2,
                        left: viewportWidth / 2,
                        transform: 'translate(-50%, -50%)'
                      })
                    }
                    setUserDropdownOpen(!userDropdownOpen)
                  }}
                >
                  <div className="user-avatar">{(user?.name ?? 'G').charAt(0).toUpperCase()}</div>
                  <span className="user-name">{user?.name ?? 'gabrielsales012345'}</span>
                  <FiChevronDown className={`dropdown-chevron ${userDropdownOpen ? 'open' : ''}`} />
                </button>
                {userDropdownOpen && (
                  <>
                    {isMobile && (
                      <div 
                        className="user-dropdown-overlay" 
                        onClick={() => setUserDropdownOpen(false)}
                      />
                    )}
                    <div 
                      className={`user-dropdown ${isMobile ? 'mobile' : 'desktop'}`}
                      style={isMobile ? {
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        transform: dropdownPosition.transform,
                        right: 'auto',
                        WebkitTransform: dropdownPosition.transform,
                        msTransform: dropdownPosition.transform
                      } : {}}
                    >
                      <div className="dropdown-header">
                        <div className="dropdown-user-info">
                          <div className="dropdown-user-avatar">
                            {(user?.name ?? 'G').charAt(0).toUpperCase()}
                          </div>
                          <div className="dropdown-user-details">
                            <span className="dropdown-user-name">{user?.name ?? 'Usuário'}</span>
                            {user?.email && (
                              <span className="dropdown-user-email">{user.email}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="dropdown-divider"></div>
                      <button 
                        type="button" 
                        className="dropdown-item"
                        onClick={() => {
                          toggleTheme()
                          setUserDropdownOpen(false)
                        }}
                      >
                        <span className="dropdown-item-icon">
                          {isDarkMode ? <HiSun size={18} /> : <HiMoon size={18} />}
                        </span>
                        <span className="dropdown-item-text">
                          {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
                        </span>
                      </button>
                      <button 
                        type="button" 
                        className="dropdown-item"
                        onClick={() => {
                          navigate('/config')
                          setUserDropdownOpen(false)
                        }}
                      >
                        <span className="dropdown-item-icon">
                          <AiOutlineSetting size={18} />
                        </span>
                        <span className="dropdown-item-text">Configurações</span>
                      </button>
                      <div className="dropdown-divider"></div>
                      <button 
                        type="button" 
                        className="dropdown-item dropdown-item-danger" 
                        onClick={() => {
                          setUserDropdownOpen(false)
                          onLogout()
                        }}
                      >
                        <span className="dropdown-item-icon">
                          <FiLogOut size={18} />
                        </span>
                        <span className="dropdown-item-text">Sair</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>
        )}

        {dashboardSettings.showHeader && isMobile && (
          <button
            type="button"
            className="mobile-menu-toggle-floating"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        )}

        {breadcrumb && (
          <nav className="page-breadcrumb" aria-label="Localização">
            <span>{breadcrumb.section}</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{breadcrumb.label}</span>
          </nav>
        )}

        <main className="main-shell-outlet">
          <Outlet />
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
          <div className={`mobile-menu-drawer ${mobileMenuOpen ? 'open' : ''}`} ref={mobileMenuRef}>
            <div className="mobile-menu-header">
              <div className="mobile-menu-brand">
                <img src="/images_/2.png" alt="FoodIDDO" />
              </div>
              <button
                type="button"
                className="mobile-menu-close"
                onClick={closeMobileMenu}
                aria-label="Fechar menu"
              >
                <FiX size={24} />
              </button>
            </div>
            <nav className="mobile-menu-nav">
              {navigation
                .filter((group) => {
                  if (group.section === 'Visão Geral') return !sidebarSettings.showVisaoGeral
                  if (group.section === 'Análises') return !sidebarSettings.showAnalises
                  // Sempre exibir seção Operação se contiver Configurações
                  if (group.section === 'Operação') {
                    const hasConfig = group.items.some(item => item.path === '/config')
                    if (hasConfig) return true // Sempre mostrar seção que contém Configurações
                    return !sidebarSettings.showOperacao
                  }
                  return true
                })
                .map((group) => {
                  // Mapeamento de paths para configurações
                  const pathToSettingMap = {
                    '/dashboard': sidebarSettings.showDashboard,
                    '/caixa': sidebarSettings.showCaixa,
                    '/fluxo-caixa': sidebarSettings.showFluxoCaixa,
                    '/orcamento': sidebarSettings.showOrcamento,
                    '/ingredientes': sidebarSettings.showIngredientes,
                    '/receitas': sidebarSettings.showReceitas,
                    '/custos': sidebarSettings.showCustos,
                    '/simulador': sidebarSettings.showSimulador,
                    '/lucratividade': sidebarSettings.showLucratividade,
                    '/custos-fixos': sidebarSettings.showCustosFixos,
                    '/pricing': sidebarSettings.showPricing,
                    '/simulacao': sidebarSettings.showSimulacao,
                    '/estoque': sidebarSettings.showEstoque,
                    '/relatorios': sidebarSettings.showRelatorios
                  }

                  // Filtrar itens baseado nas configurações (Configurações sempre visível)
                  // Quando marcado (true), o item fica oculto, então exibimos quando é false ou undefined
                  const filteredItems = group.items.filter((item) => {
                    if (item.path === '/config') return true // Sempre mostrar Configurações
                    return pathToSettingMap[item.path] !== true
                  })

                  // Não mostrar a seção se não tiver itens visíveis
                  if (filteredItems.length === 0) return null

                  return (
                    <div key={group.section} className="mobile-menu-section">
                      <span className="mobile-menu-section-label">{group.section}</span>
                      {filteredItems.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={({ isActive }) => `mobile-menu-link${isActive ? ' active' : ''}`}
                          onClick={closeMobileMenu}
                        >
                          <span className="mobile-menu-link-icon">{item.icon}</span>
                          <span className="mobile-menu-link-label">{item.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )
                })}
            </nav>
            <div className="mobile-menu-footer">
              <button type="button" className="mobile-menu-logout" onClick={onLogout}>
                <FiLogOut size={18} />
                Sair
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

MainLayout.propTypes = {
  onLogout: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string
  })
}

MainLayout.defaultProps = {
  user: null
}

