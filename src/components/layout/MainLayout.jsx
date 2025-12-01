import PropTypes from 'prop-types'
import { NavLink, Outlet } from 'react-router-dom'
import {
  AiOutlineHome,
  AiOutlineShoppingCart,
  AiOutlineBook,
  AiOutlineDollarCircle,
  AiOutlineFundProjectionScreen,
  AiOutlinePieChart,
  AiOutlineCalculator,
  AiOutlineTag,
  AiOutlineAreaChart,
  AiOutlineExperiment,
  AiOutlineInbox,
  AiOutlineLineChart,
  AiOutlineFileText,
  AiOutlineSetting,
  AiOutlineRise
} from 'react-icons/ai'
import { FiLogOut } from 'react-icons/fi'
import ThemeToggle from '../ThemeToggle'
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
      { path: '/ponto-equilibrio', label: 'Ponto de Equilíbrio', icon: <AiOutlineAreaChart /> },
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
          <div>
            <h1>Bem-vinda, {user?.name ?? 'GabrielSales'}</h1>
            <span className="topbar-subtitle">Organize suas receitas favoritas e gerencie sua geladeira.</span>
          </div>
          <div className="topbar-actions">
            <ThemeToggle className="theme-toggle" />
            <div className="user-chip">
              <span>Olá, {user?.name ?? 'gabrielsales012345'}</span>
              <div className="user-avatar">{(user?.name ?? 'G').charAt(0).toUpperCase()}</div>
            </div>
          </div>
        </header>
        <main className="main-shell-outlet">
          <Outlet />
        </main>
      </div>
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

