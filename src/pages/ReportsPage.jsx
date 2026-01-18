import { useState, useEffect } from 'react'
import { 
  FiFileText, 
  FiFile, 
  FiDollarSign, 
  FiTrendingUp, 
  FiBarChart2, 
  FiPackage, 
  FiShoppingCart,
  FiActivity,
  FiBox
} from 'react-icons/fi'
import { useAppStore } from '../stores/appStore'
import {
  generateCostsAndProfitsReport,
  generateMonthlyPerformanceReport,
  generateSensitivityAnalysisReport,
  generateProductionVsBudgetReport,
  generateSalesReport,
  generateStockReport,
  generateDetailedCashflowReport,
  generateIngredientsReport,
  exportToCSV,
  generatePDF
} from '../utils/reportsUtils'
import './PageCommon.css'
import './ReportsPage.css'

const reports = [
  {
    id: 'r1',
    title: 'Custos e Lucros por Receita',
    description: 'Consolidação de fichas técnicas com custos, preços sugeridos e lucratividade por receita.',
    category: 'Financeiro',
    icon: <FiDollarSign />,
    color: '#dc2626'
  },
  {
    id: 'r2',
    title: 'Desempenho Mensal',
    description: 'Resumo consolidado de receitas, gastos, lucro e orçamentos por mês.',
    category: 'Financeiro',
    icon: <FiTrendingUp />,
    color: '#22c55e'
  },
  {
    id: 'r3',
    title: 'Análise de Sensibilidade',
    description: 'Comparativo de cenários de variação de preços e impacto nas margens de lucro.',
    category: 'Análise',
    icon: <FiBarChart2 />,
    color: '#3b82f6'
  },
  {
    id: 'r4',
    title: 'Produção vs Orçamento',
    description: 'Comparação entre planejamento orçamentário e execução real da produção.',
    category: 'Operacional',
    icon: <FiActivity />,
    color: '#f59e0b'
  },
  {
    id: 'r5',
    title: 'Relatório de Vendas',
    description: 'Análise detalhada de vendas, pedidos, receita, lucro e ticket médio por data.',
    category: 'Vendas',
    icon: <FiShoppingCart />,
    color: '#8b5cf6'
  },
  {
    id: 'r6',
    title: 'Estoque e Movimentações',
    description: 'Situação atual do estoque, movimentações de entrada/saída e alertas de estoque baixo.',
    category: 'Estoque',
    icon: <FiPackage />,
    color: '#ec4899'
  },
  {
    id: 'r7',
    title: 'Fluxo de Caixa Detalhado',
    description: 'Todas as movimentações financeiras com entradas, saídas, custos e lucros.',
    category: 'Financeiro',
    icon: <FiFileText />,
    color: '#06b6d4'
  },
  {
    id: 'r8',
    title: 'Ingredientes e Custos',
    description: 'Inventário completo de ingredientes, custos unitários e valor total em estoque por categoria.',
    category: 'Estoque',
    icon: <FiBox />,
    color: '#14b8a6'
  }
]

export function ReportsPage() {
  // Buscar dados do store
  const recipes = useAppStore((state) => state.recipes)
  const pricing = useAppStore((state) => state.pricing)
  const cashflow = useAppStore((state) => state.cashflow)
  const budgets = useAppStore((state) => state.budgets)
  const stockMovements = useAppStore((state) => state.stockMovements)
  const ingredients = useAppStore((state) => state.ingredients)
  const orders = useAppStore((state) => state.orders)

  // Gerenciar histórico de exportações
  const [recentExports, setRecentExports] = useState(() => {
    const saved = localStorage.getItem('reports-exports')
    return saved ? JSON.parse(saved) : []
  })

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isGenerating, setIsGenerating] = useState(null) // ID do relatório sendo gerado

  useEffect(() => {
    // Salvar histórico de exportações
    localStorage.setItem('reports-exports', JSON.stringify(recentExports))
  }, [recentExports])

  const addExportRecord = (reportId, format) => {
    const report = reports.find(r => r.id === reportId)
    const newExport = {
      id: crypto.randomUUID(),
      reportId,
      reportName: report?.title || 'Relatório',
      format,
      date: new Date().toISOString()
    }
    setRecentExports(prev => [newExport, ...prev].slice(0, 50)) // Manter apenas últimas 50
  }

  // Obter categorias únicas
  const categories = ['all', ...new Set(reports.map(r => r.category))]

  // Filtrar relatórios por categoria
  const filteredReports = selectedCategory === 'all' 
    ? reports 
    : reports.filter(r => r.category === selectedCategory)

  const handleGeneratePDF = async (reportId) => {
    try {
      setIsGenerating(reportId)
      const report = reports.find(r => r.id === reportId)
      if (!report) return

      let reportData = null
      let title = report.title

      switch (reportId) {
        case 'r1': // Custos e lucros por receita
          reportData = generateCostsAndProfitsReport(recipes, pricing)
          if (!reportData) return
          generatePDF(title, reportData.pdfContent, `relatorio-custos-lucros-${Date.now()}`)
          addExportRecord(reportId, 'PDF')
          break

        case 'r2': // Desempenho mensal
          reportData = generateMonthlyPerformanceReport(cashflow, budgets)
          if (!reportData) return
          generatePDF(title, reportData.pdfContent, `relatorio-desempenho-mensal-${Date.now()}`)
          addExportRecord(reportId, 'PDF')
          break

        case 'r3': // Análise de sensibilidade
          reportData = generateSensitivityAnalysisReport(pricing, recipes)
          if (!reportData) return
          generatePDF(title, reportData.pdfContent, `relatorio-sensibilidade-${Date.now()}`)
          addExportRecord(reportId, 'PDF')
          break

        case 'r4': // Produção vs orçamento
          reportData = generateProductionVsBudgetReport(budgets, recipes, stockMovements)
          if (!reportData) return
          generatePDF(title, reportData.pdfContent, `relatorio-producao-orcamento-${Date.now()}`)
          addExportRecord(reportId, 'PDF')
          break

        case 'r5': // Vendas
          reportData = generateSalesReport(orders)
          if (!reportData) return
          generatePDF(title, reportData.pdfContent, `relatorio-vendas-${Date.now()}`)
          addExportRecord(reportId, 'PDF')
          break

        case 'r6': // Estoque
          reportData = generateStockReport(ingredients, stockMovements)
          if (!reportData) return
          generatePDF(title, reportData.pdfContent, `relatorio-estoque-${Date.now()}`)
          addExportRecord(reportId, 'PDF')
          break

        case 'r7': // Fluxo de caixa detalhado
          reportData = generateDetailedCashflowReport(cashflow)
          if (!reportData) return
          generatePDF(title, reportData.pdfContent, `relatorio-fluxo-caixa-${Date.now()}`)
          addExportRecord(reportId, 'PDF')
          break

        case 'r8': // Ingredientes
          reportData = generateIngredientsReport(ingredients)
          if (!reportData) return
          generatePDF(title, reportData.pdfContent, `relatorio-ingredientes-${Date.now()}`)
          addExportRecord(reportId, 'PDF')
          break

        default:
          alert('Relatório não implementado.')
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert(`Erro ao gerar PDF: ${error.message || 'Tente novamente.'}`)
    } finally {
      setIsGenerating(null)
    }
  }

  const handleExportExcel = async (reportId) => {
    try {
      setIsGenerating(reportId)
      const report = reports.find(r => r.id === reportId)
      if (!report) return

      let reportData = null
      let filename = ''

      switch (reportId) {
        case 'r1': // Custos e lucros por receita
          reportData = generateCostsAndProfitsReport(recipes, pricing)
          if (!reportData) return
          filename = `relatorio-custos-lucros-${Date.now()}`
          exportToCSV(reportData.csvData, filename)
          addExportRecord(reportId, 'Excel')
          break

        case 'r2': // Desempenho mensal
          reportData = generateMonthlyPerformanceReport(cashflow, budgets)
          if (!reportData) return
          filename = `relatorio-desempenho-mensal-${Date.now()}`
          exportToCSV(reportData.csvData, filename)
          addExportRecord(reportId, 'Excel')
          break

        case 'r3': // Análise de sensibilidade
          reportData = generateSensitivityAnalysisReport(pricing, recipes)
          if (!reportData) return
          filename = `relatorio-sensibilidade-${Date.now()}`
          exportToCSV(reportData.csvData, filename)
          addExportRecord(reportId, 'Excel')
          break

        case 'r4': // Produção vs orçamento
          reportData = generateProductionVsBudgetReport(budgets, recipes, stockMovements)
          if (!reportData) return
          filename = `relatorio-producao-orcamento-${Date.now()}`
          exportToCSV(reportData.csvData, filename)
          addExportRecord(reportId, 'Excel')
          break

        case 'r5': // Vendas
          reportData = generateSalesReport(orders)
          if (!reportData) return
          filename = `relatorio-vendas-${Date.now()}`
          exportToCSV(reportData.csvData, filename)
          addExportRecord(reportId, 'Excel')
          break

        case 'r6': // Estoque
          reportData = generateStockReport(ingredients, stockMovements)
          if (!reportData) return
          filename = `relatorio-estoque-${Date.now()}`
          exportToCSV(reportData.csvData, filename)
          addExportRecord(reportId, 'Excel')
          break

        case 'r7': // Fluxo de caixa detalhado
          reportData = generateDetailedCashflowReport(cashflow)
          if (!reportData) return
          filename = `relatorio-fluxo-caixa-${Date.now()}`
          exportToCSV(reportData.csvData, filename)
          addExportRecord(reportId, 'Excel')
          break

        case 'r8': // Ingredientes
          reportData = generateIngredientsReport(ingredients)
          if (!reportData) return
          filename = `relatorio-ingredientes-${Date.now()}`
          exportToCSV(reportData.csvData, filename)
          addExportRecord(reportId, 'Excel')
          break

        default:
          alert('Relatório não implementado.')
      }
    } catch (error) {
      console.error('Erro ao exportar Excel:', error)
      alert(`Erro ao exportar Excel: ${error.message || 'Tente novamente.'}`)
    } finally {
      setIsGenerating(null)
    }
  }

  return (
    <div className="reports-page">
      {/* Header */}
      <section className="reports-header-section">
        <div className="reports-header-content">
          <h1 className="reports-page-title">Relatórios</h1>
          <p className="reports-page-subtitle">
            Gere relatórios detalhados em PDF ou Excel para análise e compartilhamento
          </p>
        </div>
      </section>

      {/* Filtros por Categoria */}
      <section className="reports-filters-section">
        <div className="reports-filters">
          {categories.map(category => (
            <button
              key={category}
              type="button"
              className={`reports-filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'Todos' : category}
            </button>
          ))}
        </div>
      </section>

      {/* Grid de Relatórios */}
      <section className="reports-main-section">
        <div className="reports-grid">
          {filteredReports.map((report) => (
            <article key={report.id} className="report-card">
              <div className="report-card-icon" style={{ color: report.color }}>
                {report.icon}
              </div>
              <header className="report-card-header">
                <div>
                  <span className="report-card-category">{report.category}</span>
                  <h3 className="report-card-title">{report.title}</h3>
                </div>
              </header>
              <div className="report-card-divider" />
              <p className="report-card-description">{report.description}</p>
              <div className="report-card-actions">
                <button 
                  className="report-btn report-btn--pdf" 
                  type="button"
                  onClick={() => handleGeneratePDF(report.id)}
                  disabled={isGenerating === report.id}
                >
                  <FiFileText />
                  {isGenerating === report.id ? 'Gerando...' : 'Gerar PDF'}
                </button>
                <button 
                  className="report-btn report-btn--excel" 
                  type="button"
                  onClick={() => handleExportExcel(report.id)}
                  disabled={isGenerating === report.id}
                >
                  <FiFile />
                  {isGenerating === report.id ? 'Exportando...' : 'Exportar Excel'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
