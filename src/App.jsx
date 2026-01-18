import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './components/AuthProvider'
import NameScreen from './components/NameScreen'
import { ThemeProvider } from './contexts/ThemeContext'
import { MainLayout } from './components/layout/MainLayout'
import { useAppStore } from './stores/appStore'
import {
  DashboardPage,
  CashboxPage,
  BudgetPage,
  IngredientsPage,
  RecipesPage,
  CostPage,
  ProductionSimulatorPage,
  ProfitabilityPage,
  FixedCostsPage,
  PricingPage,
  SensitivityPage,
  StockPage,
  CashflowPage,
  ReportsPage,
  ConfigPage,
  OrdersPage
} from './pages'
import './styles/themes.css'
import './App.css'

function AppRoutes() {
  const { logout, user } = useAuth()
  const loadData = useAppStore((state) => state.loadData)

  useEffect(() => {
    // Carregar dados do servidor quando a aplicação iniciar
    loadData()
  }, [loadData])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout onLogout={logout} user={user} />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/caixa" element={<CashboxPage />} />
          <Route path="/fluxo-caixa" element={<CashflowPage />} />
          <Route path="/ingredientes" element={<IngredientsPage />} />
          <Route path="/grocery" element={<Navigate to="/ingredientes" replace />} />
          <Route path="/geladeira" element={<Navigate to="/ingredientes" replace />} />
          <Route path="/orcamento" element={<BudgetPage />} />
          <Route path="/receitas" element={<RecipesPage />} />
          <Route path="/custos" element={<CostPage />} />
          <Route path="/simulador" element={<ProductionSimulatorPage />} />
          <Route path="/lucratividade" element={<ProfitabilityPage />} />
          <Route path="/custos-fixos" element={<FixedCostsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/simulacao" element={<SensitivityPage />} />
          <Route path="/estoque" element={<StockPage />} />
          <Route path="/financeiro" element={<CashflowPage />} />
          <Route path="/relatorios" element={<ReportsPage />} />
          <Route path="/vendas" element={<OrdersPage />} />
          <Route path="/config" element={<ConfigPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function ProtectedApplication() {
  const { isAuthenticated, login } = useAuth()

  if (!isAuthenticated) {
    return <NameScreen onEnter={login} />
  }

  return <AppRoutes />
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProtectedApplication />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

