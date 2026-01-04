import PropTypes from 'prop-types'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
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
  AiOutlineRise
} from 'react-icons/ai'
import { FiLogOut, FiSearch, FiChevronDown, FiMenu, FiX } from 'react-icons/fi'
import { HiMoon, HiSun } from 'react-icons/hi'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import './MainLayout.css'

const navigation = [
  {
    section: 'Visão Geral',
    items: [
      { path: '/dashboard', label: 'Home', icon: <AiOutlineHome /> },
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
      { path: '/financeiro', label: 'Financeiro', icon: <AiOutlineLineChart /> },
      { path: '/relatorios', label: 'Relatórios', icon: <AiOutlineFileText /> },
      { path: '/config', label: 'Configurações', icon: <AiOutlineSetting /> }
    ]
  }
]

export function MainLayout({ onLogout, user }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const navigate = useNavigate()
  const { theme, toggleTheme, isDarkMode } = useTheme()

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
          {navigation.map((group) => (
            <div key={group.section} className="sidebar-section">
              <span className="sidebar-section-label">{group.section}</span>
              {group.items.map((item) => (
                <NavLink key={item.path} to={item.path} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                  <span aria-hidden="true" className="sidebar-link-icon">
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button type="button" className="logout-btn" onClick={onLogout}>
            <FiLogOut size={18} />
            Sair
          </button>
        </div>
      </aside>
      <div className="main-shell-content">
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
                return `${greeting}, ${userName}`
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
                placeholder="Buscar receitas, ingredientes, custos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="user-dropdown-wrapper" ref={dropdownRef}>
              <button
                type="button"
                className="user-chip"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="user-avatar">{(user?.name ?? 'G').charAt(0).toUpperCase()}</div>
                <span className="user-name">{user?.name ?? 'gabrielsales012345'}</span>
                <FiChevronDown className={`dropdown-chevron ${userDropdownOpen ? 'open' : ''}`} />
              </button>
              {userDropdownOpen && (
                <div className="user-dropdown">
                  <button 
                    type="button" 
                    className="dropdown-item"
                    onClick={() => {
                      toggleTheme()
                      setUserDropdownOpen(false)
                    }}
                  >
                    {isDarkMode ? <HiSun size={16} /> : <HiMoon size={16} />}
                    {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
                  </button>
                  <button 
                    type="button" 
                    className="dropdown-item"
                    onClick={() => {
                      navigate('/config')
                      setUserDropdownOpen(false)
                    }}
                  >
                    <AiOutlineSetting size={16} />
                    Configurações
                  </button>
                  <button type="button" className="dropdown-item" onClick={onLogout}>
                    <FiLogOut size={16} />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
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
              {navigation.map((group) => (
                <div key={group.section} className="mobile-menu-section">
                  <span className="mobile-menu-section-label">{group.section}</span>
                  {group.items.map((item) => (
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
              ))}
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
    name: PropTypes.string
  })
}

MainLayout.defaultProps = {
  user: null
}

