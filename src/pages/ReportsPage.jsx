import './PageCommon.css'

const reports = [
  { id: 'r1', title: 'Custos e lucros por receita', description: 'Consolidação das fichas técnicas com lucratividade.' },
  { id: 'r2', title: 'Desempenho mensal', description: 'Resumo de vendas, gastos e lucro por mês.' },
  { id: 'r3', title: 'Análise de sensibilidade', description: 'Comparativo de cenários e impacto em margens.' },
  { id: 'r4', title: 'Produção vs orçamento', description: 'Planejamento versus execução da produção.' }
]

export function ReportsPage() {
  return (
    <div className="page">
      <section className="page-stack">
        <div className="summary-grid">
          <div className="summary-card">
            <span>Relatórios disponíveis</span>
            <strong>{reports.length}</strong>
          </div>
          <div className="summary-card">
            <span>Exportações recentes</span>
            <strong>3</strong>
            <small>Últimos 7 dias</small>
          </div>
        </div>
      </section>

      <section className="page-stack">
        <div className="page-header">
          <h2>Relatórios</h2>
        </div>
        <div className="card-grid">
          {reports.map((report) => (
            <article key={report.id} className="card-tile">
              <header>
                <h3>{report.title}</h3>
              </header>
              <div className="divider" />
              <p>{report.description}</p>
              <div className="report-actions">
                <button className="ghost-btn" type="button">
                  Gerar PDF
                </button>
                <button className="ghost-btn" type="button">
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

