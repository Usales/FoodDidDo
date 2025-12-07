import { useState, useEffect } from 'react'
import { FiFileText, FiFile } from 'react-icons/fi'
import { useAppStore } from '../stores/appStore'
import {
  generateCostsAndProfitsReport,
  generateMonthlyPerformanceReport,
  generateSensitivityAnalysisReport,
  generateProductionVsBudgetReport,
  exportToCSV,
  generatePDF
} from '../utils/reportsUtils'
import './PageCommon.css'
import './ReportsPage.css'

const reports = [
  { id: 'r1', title: 'Custos e lucros por receita', description: 'Consolidação de fichas técnicas com lucratividade.' },
  { id: 'r2', title: 'Desempenho mensal', description: 'Resumo de vendas, gastos e lucro por mês.' },
  { id: 'r3', title: 'Análise de sensibilidade', description: 'Comparativo de cenários e impacto em margens.' },
  { id: 'r4', title: 'Produção vs orçamento', description: 'Comparação entre planejamento e execução da produção.' }
]

export function ReportsPage() {
  // Buscar dados do store
  const recipes = useAppStore((state) => state.recipes)
  const pricing = useAppStore((state) => state.pricing)
  const cashflow = useAppStore((state) => state.cashflow)
  const budgets = useAppStore((state) => state.budgets)
  const stockMovements = useAppStore((state) => state.stockMovements)

  // Gerenciar histórico de exportações
  const [recentExports, setRecentExports] = useState(() => {
    const saved = localStorage.getItem('reports-exports')
    return saved ? JSON.parse(saved) : []
  })

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

  const getRecentExportsCount = () => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return recentExports.filter(exp => new Date(exp.date) >= sevenDaysAgo).length
  }

  const handleGeneratePDF = (reportId) => {
    try {
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

        default:
          alert('Relatório não implementado.')
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    }
  }

  const handleExportExcel = (reportId) => {
    try {
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

        default:
          alert('Relatório não implementado.')
      }
    } catch (error) {
      console.error('Erro ao exportar Excel:', error)
      alert('Erro ao exportar Excel. Tente novamente.')
    }
  }

  return (
    <div className="reports-page">
      {/* Cards de Indicadores */}
      <section className="reports-indicators">
        <div className="reports-indicator-card reports-indicator-card--dark">
          <span className="reports-indicator-label">Relatórios Disponíveis</span>
          <strong className="reports-indicator-value">{reports.length}</strong>
        </div>
        <div className="reports-indicator-card reports-indicator-card--dark">
          <span className="reports-indicator-label">Exportações Recentes</span>
          <strong className="reports-indicator-value">{getRecentExportsCount()}</strong>
          <small className="reports-indicator-subtitle">Últimos 7 dias</small>
        </div>
      </section>

      {/* Sessão Principal - Relatórios */}
      <section className="reports-main-section">
        <div className="reports-header">
          <h2>Relatórios</h2>
        </div>
        <div className="reports-grid">
          {reports.map((report) => (
            <article key={report.id} className="report-card">
              <header className="report-card-header">
                <h3>{report.title}</h3>
              </header>
              <div className="report-card-divider" />
              <p className="report-card-description">{report.description}</p>
              <div className="report-card-actions">
                <button 
                  className="report-btn report-btn--pdf" 
                  type="button"
                  onClick={() => handleGeneratePDF(report.id)}
                >
                  <FiFileText />
                  Gerar PDF
                </button>
                <button 
                  className="report-btn report-btn--excel" 
                  type="button"
                  onClick={() => handleExportExcel(report.id)}
                >
                  <FiFile />
                  Exportar Excel
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

