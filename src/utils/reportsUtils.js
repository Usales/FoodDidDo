/**
 * Utilitários para geração de relatórios em PDF e Excel (CSV)
 */

/**
 * Formata número como moeda brasileira
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}

/**
 * Formata data
 */
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

/**
 * Exporta dados como CSV (Excel)
 */
export const exportToCSV = (data, filename, headers = null) => {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar.')
    return
  }

  // Se headers não foram fornecidos, usar as chaves do primeiro objeto
  const csvHeaders = headers || Object.keys(data[0])
  
  // Criar linha de cabeçalho
  const headerRow = csvHeaders.map(h => `"${h}"`).join(',')
  
  // Criar linhas de dados
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header] ?? ''
      // Escapar aspas e quebras de linha
      const escapedValue = String(value).replace(/"/g, '""')
      return `"${escapedValue}"`
    }).join(',')
  })
  
  // Combinar tudo
  const csvContent = [headerRow, ...dataRows].join('\n')
  
  // Adicionar BOM para Excel reconhecer UTF-8
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Gera PDF usando window.print() com conteúdo formatado
 */
export const generatePDF = (title, content, filename) => {
  // Criar uma nova janela com o conteúdo formatado
  const printWindow = window.open('', '_blank')
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @media print {
          @page {
            margin: 2cm;
          }
        }
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        h1 {
          color: #dc2626;
          border-bottom: 3px solid #dc2626;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        h2 {
          color: #3b82f6;
          margin-top: 30px;
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background-color: #f3f4f6;
          color: #1f2937;
          padding: 12px;
          text-align: left;
          border: 1px solid #d1d5db;
          font-weight: 600;
        }
        td {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .summary {
          background-color: #fef2f2;
          border-left: 4px solid #dc2626;
          padding: 15px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #d1d5db;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${content}
      <div class="footer">
        <p>Gerado em ${new Date().toLocaleString('pt-BR')} | FoodDidDo</p>
      </div>
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `
  
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}

/**
 * Relatório 1: Custos e lucros por receita
 */
export const generateCostsAndProfitsReport = (recipes, pricing = []) => {
  if (!recipes || recipes.length === 0) {
    alert('Não há receitas cadastradas para gerar o relatório.')
    return
  }

  // Preparar dados para CSV
  const csvData = recipes.map(recipe => {
    // Buscar preço sugerido se existir
    const pricingEntry = pricing.find(p => p.recipeId === recipe.id)
    const suggestedPrice = pricingEntry?.suggestedPrice || 0
    const unitCost = recipe.unitCost || 0
    const profit = suggestedPrice - unitCost
    const margin = suggestedPrice > 0 ? (profit / suggestedPrice) * 100 : 0

    return {
      'Receita': recipe.name,
      'Rendimento (unidades)': recipe.yield || 0,
      'Custo Total': formatCurrency(recipe.totalCost || 0),
      'Custo Unitário': formatCurrency(unitCost),
      'Preço Sugerido': formatCurrency(suggestedPrice),
      'Lucro Unitário': formatCurrency(profit),
      'Margem (%)': margin.toFixed(2) + '%',
      'Lucro por Lote': formatCurrency(profit * (recipe.yield || 0))
    }
  })

  // Preparar HTML para PDF
  const pdfContent = `
    <h2>Resumo de Custos e Lucratividade</h2>
    <table>
      <thead>
        <tr>
          <th>Receita</th>
          <th>Rendimento</th>
          <th>Custo Unit.</th>
          <th>Preço Sug.</th>
          <th>Lucro Unit.</th>
          <th>Margem</th>
          <th>Lucro/Lote</th>
        </tr>
      </thead>
      <tbody>
        ${recipes.map(recipe => {
          const pricingEntry = pricing.find(p => p.recipeId === recipe.id)
          const suggestedPrice = pricingEntry?.suggestedPrice || 0
          const unitCost = recipe.unitCost || 0
          const profit = suggestedPrice - unitCost
          const margin = suggestedPrice > 0 ? (profit / suggestedPrice) * 100 : 0

          return `
            <tr>
              <td>${recipe.name}</td>
              <td>${recipe.yield || 0}</td>
              <td>${formatCurrency(unitCost)}</td>
              <td>${formatCurrency(suggestedPrice)}</td>
              <td>${formatCurrency(profit)}</td>
              <td>${margin.toFixed(2)}%</td>
              <td>${formatCurrency(profit * (recipe.yield || 0))}</td>
            </tr>
          `
        }).join('')}
      </tbody>
    </table>
    <div class="summary">
      <strong>Total de Receitas:</strong> ${recipes.length}<br>
      <strong>Custo Médio Unitário:</strong> ${formatCurrency(
        recipes.reduce((sum, r) => sum + (r.unitCost || 0), 0) / recipes.length
      )}
    </div>
  `

  return { csvData, pdfContent }
}

/**
 * Relatório 2: Desempenho mensal
 */
export const generateMonthlyPerformanceReport = (cashflow = [], budgets = []) => {
  // Agrupar por mês
  const monthlyData = {}
  
  cashflow.forEach(entry => {
    if (!entry.date) return
    const date = new Date(entry.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthLabel,
        income: 0,
        expense: 0,
        budgets: 0
      }
    }
    
    if (entry.type === 'entrada') {
      monthlyData[monthKey].income += entry.amount || 0
    } else if (entry.type === 'saída') {
      monthlyData[monthKey].expense += entry.amount || 0
    }
  })

  // Adicionar orçamentos
  budgets.forEach(budget => {
    if (!budget.date) return
    const date = new Date(budget.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].budgets += budget.amount || 0
    }
  })

  const months = Object.keys(monthlyData).sort().reverse()

  if (months.length === 0) {
    alert('Não há dados financeiros para gerar o relatório.')
    return null
  }

  // Preparar dados para CSV
  const csvData = months.map(monthKey => {
    const data = monthlyData[monthKey]
    const profit = data.income - data.expense
    const profitMargin = data.income > 0 ? (profit / data.income) * 100 : 0

    return {
      'Mês': data.month,
      'Receitas': formatCurrency(data.income),
      'Gastos': formatCurrency(data.expense),
      'Lucro': formatCurrency(profit),
      'Margem (%)': profitMargin.toFixed(2) + '%',
      'Orçamentos': formatCurrency(data.budgets)
    }
  })

  // Preparar HTML para PDF
  const pdfContent = `
    <h2>Resumo Mensal</h2>
    <table>
      <thead>
        <tr>
          <th>Mês</th>
          <th>Receitas</th>
          <th>Gastos</th>
          <th>Lucro</th>
          <th>Margem</th>
          <th>Orçamentos</th>
        </tr>
      </thead>
      <tbody>
        ${months.map(monthKey => {
          const data = monthlyData[monthKey]
          const profit = data.income - data.expense
          const profitMargin = data.income > 0 ? (profit / data.income) * 100 : 0

          return `
            <tr>
              <td>${data.month}</td>
              <td>${formatCurrency(data.income)}</td>
              <td>${formatCurrency(data.expense)}</td>
              <td>${formatCurrency(profit)}</td>
              <td>${profitMargin.toFixed(2)}%</td>
              <td>${formatCurrency(data.budgets)}</td>
            </tr>
          `
        }).join('')}
      </tbody>
    </table>
    <div class="summary">
      <strong>Total de Meses Analisados:</strong> ${months.length}<br>
      <strong>Receita Total:</strong> ${formatCurrency(
        months.reduce((sum, key) => sum + monthlyData[key].income, 0)
      )}<br>
      <strong>Gasto Total:</strong> ${formatCurrency(
        months.reduce((sum, key) => sum + monthlyData[key].expense, 0)
      )}<br>
      <strong>Lucro Total:</strong> ${formatCurrency(
        months.reduce((sum, key) => sum + (monthlyData[key].income - monthlyData[key].expense), 0)
      )}
    </div>
  `

  return { csvData, pdfContent }
}

/**
 * Relatório 3: Análise de sensibilidade
 */
export const generateSensitivityAnalysisReport = (pricing = [], recipes = []) => {
  if (pricing.length === 0) {
    alert('Não há análises de sensibilidade cadastradas.')
    return null
  }

  // Preparar dados para CSV
  const csvData = pricing.map(price => {
    const recipe = recipes.find(r => r.id === price.recipeId)
    const unitCost = recipe?.unitCost || 0
    const basePrice = price.suggestedPrice || 0
    const currentPrice = price.currentPrice || basePrice
    
    // Calcular margem base
    const baseMargin = basePrice > 0 ? ((basePrice - unitCost) / basePrice) * 100 : 0
    const currentMargin = currentPrice > 0 ? ((currentPrice - unitCost) / currentPrice) * 100 : 0
    
    // Gerar cenários de variação de preço
    const scenarios = []
    const variations = [-20, -10, 0, 10, 20] // Variações de -20% a +20%
    variations.forEach(variation => {
      const scenarioPrice = basePrice * (1 + variation / 100)
      const scenarioMargin = scenarioPrice > 0 ? ((scenarioPrice - unitCost) / scenarioPrice) * 100 : 0
      scenarios.push({
        name: variation === 0 ? 'Base' : `${variation > 0 ? '+' : ''}${variation}%`,
        price: scenarioPrice,
        margin: scenarioMargin
      })
    })

    return {
      'Receita': recipe?.name || 'N/A',
      'Custo Unitário': formatCurrency(unitCost),
      'Preço Sugerido': formatCurrency(basePrice),
      'Preço Atual': formatCurrency(currentPrice),
      'Margem Sugerida (%)': baseMargin.toFixed(2) + '%',
      'Margem Atual (%)': currentMargin.toFixed(2) + '%',
      'Cenário -20%': `${formatCurrency(scenarios[0].price)} (${scenarios[0].margin.toFixed(2)}%)`,
      'Cenário -10%': `${formatCurrency(scenarios[1].price)} (${scenarios[1].margin.toFixed(2)}%)`,
      'Cenário Base': `${formatCurrency(scenarios[2].price)} (${scenarios[2].margin.toFixed(2)}%)`,
      'Cenário +10%': `${formatCurrency(scenarios[3].price)} (${scenarios[3].margin.toFixed(2)}%)`,
      'Cenário +20%': `${formatCurrency(scenarios[4].price)} (${scenarios[4].margin.toFixed(2)}%)`
    }
  })

  // Preparar HTML para PDF
  const pdfContent = `
    <h2>Análise de Sensibilidade de Preços</h2>
    <table>
      <thead>
        <tr>
          <th>Receita</th>
          <th>Custo Unit.</th>
          <th>Preço Sug.</th>
          <th>Preço Atual</th>
          <th>Margem Sug.</th>
          <th>Margem Atual</th>
        </tr>
      </thead>
      <tbody>
        ${pricing.map(price => {
          const recipe = recipes.find(r => r.id === price.recipeId)
          const unitCost = recipe?.unitCost || 0
          const basePrice = price.suggestedPrice || 0
          const currentPrice = price.currentPrice || basePrice
          const baseMargin = basePrice > 0 ? ((basePrice - unitCost) / basePrice) * 100 : 0
          const currentMargin = currentPrice > 0 ? ((currentPrice - unitCost) / currentPrice) * 100 : 0

          return `
            <tr>
              <td>${recipe?.name || 'N/A'}</td>
              <td>${formatCurrency(unitCost)}</td>
              <td>${formatCurrency(basePrice)}</td>
              <td>${formatCurrency(currentPrice)}</td>
              <td>${baseMargin.toFixed(2)}%</td>
              <td>${currentMargin.toFixed(2)}%</td>
            </tr>
          `
        }).join('')}
      </tbody>
    </table>
    <h2>Cenários de Variação de Preço</h2>
    <table>
      <thead>
        <tr>
          <th>Receita</th>
          <th>-20%</th>
          <th>-10%</th>
          <th>Base</th>
          <th>+10%</th>
          <th>+20%</th>
        </tr>
      </thead>
      <tbody>
        ${pricing.map(price => {
          const recipe = recipes.find(r => r.id === price.recipeId)
          const unitCost = recipe?.unitCost || 0
          const basePrice = price.suggestedPrice || 0
          const variations = [-20, -10, 0, 10, 20]
          const scenarioCells = variations.map(variation => {
            const scenarioPrice = basePrice * (1 + variation / 100)
            const scenarioMargin = scenarioPrice > 0 ? ((scenarioPrice - unitCost) / scenarioPrice) * 100 : 0
            return `<td>${formatCurrency(scenarioPrice)}<br><small>${scenarioMargin.toFixed(2)}%</small></td>`
          }).join('')

          return `
            <tr>
              <td>${recipe?.name || 'N/A'}</td>
              ${scenarioCells}
            </tr>
          `
        }).join('')}
      </tbody>
    </table>
  `

  return { csvData, pdfContent }
}

/**
 * Relatório 4: Produção vs orçamento
 */
export const generateProductionVsBudgetReport = (budgets = [], recipes = [], stockMovements = []) => {
  if (budgets.length === 0) {
    alert('Não há orçamentos cadastrados para gerar o relatório.')
    return null
  }

  // Calcular produção estimada baseada em movimentações de estoque
  const productionByBudget = {}
  
  budgets.forEach(budget => {
    productionByBudget[budget.id] = {
      budgetName: budget.name || budget.description || 'Orçamento',
      budgetAmount: budget.amount || 0,
      spent: budget.spent || 0,
      balance: (budget.amount || 0) - (budget.spent || 0),
      productionCount: 0
    }
  })

  // Contar produção baseada em movimentações de saída
  stockMovements.forEach(movement => {
    if (movement.type === 'saída' && movement.budgetId) {
      const budget = productionByBudget[movement.budgetId]
      if (budget) {
        budget.productionCount += movement.quantity || 0
      }
    }
  })

  const budgetData = Object.values(productionByBudget)

  // Preparar dados para CSV
  const csvData = budgetData.map(data => {
    const utilization = data.budgetAmount > 0 ? (data.spent / data.budgetAmount) * 100 : 0
    const efficiency = data.budgetAmount > 0 ? ((data.budgetAmount - data.spent) / data.budgetAmount) * 100 : 0

    return {
      'Orçamento': data.budgetName,
      'Valor Planejado': formatCurrency(data.budgetAmount),
      'Valor Gasto': formatCurrency(data.spent),
      'Saldo': formatCurrency(data.balance),
      'Utilização (%)': utilization.toFixed(2) + '%',
      'Eficiência (%)': efficiency.toFixed(2) + '%',
      'Produção (unidades)': data.productionCount
    }
  })

  // Preparar HTML para PDF
  const pdfContent = `
    <h2>Comparação: Planejamento vs Execução</h2>
    <table>
      <thead>
        <tr>
          <th>Orçamento</th>
          <th>Planejado</th>
          <th>Gasto</th>
          <th>Saldo</th>
          <th>Utilização</th>
          <th>Eficiência</th>
          <th>Produção</th>
        </tr>
      </thead>
      <tbody>
        ${budgetData.map(data => {
          const utilization = data.budgetAmount > 0 ? (data.spent / data.budgetAmount) * 100 : 0
          const efficiency = data.budgetAmount > 0 ? ((data.budgetAmount - data.spent) / data.budgetAmount) * 100 : 0

          return `
            <tr>
              <td>${data.budgetName}</td>
              <td>${formatCurrency(data.budgetAmount)}</td>
              <td>${formatCurrency(data.spent)}</td>
              <td>${formatCurrency(data.balance)}</td>
              <td>${utilization.toFixed(2)}%</td>
              <td>${efficiency.toFixed(2)}%</td>
              <td>${data.productionCount}</td>
            </tr>
          `
        }).join('')}
      </tbody>
    </table>
    <div class="summary">
      <strong>Total de Orçamentos:</strong> ${budgetData.length}<br>
      <strong>Total Planejado:</strong> ${formatCurrency(
        budgetData.reduce((sum, d) => sum + d.budgetAmount, 0)
      )}<br>
      <strong>Total Gasto:</strong> ${formatCurrency(
        budgetData.reduce((sum, d) => sum + d.spent, 0)
      )}<br>
      <strong>Saldo Total:</strong> ${formatCurrency(
        budgetData.reduce((sum, d) => sum + d.balance, 0)
      )}
    </div>
  `

  return { csvData, pdfContent }
}

