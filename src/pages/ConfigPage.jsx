import { useState, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAppStore } from '../stores/appStore'
import { Tooltip } from '../components/ui/Tooltip'
import { ToggleSwitch } from '../components/ui/ToggleSwitch'
import ThemeToggle from '../components/ThemeToggle'
import './PageCommon.css'
import './ConfigPage.css'

export function ConfigPage() {
  const { theme, setTheme } = useTheme()
  const exportData = useAppStore((state) => state.exportData)
  const restoreData = useAppStore((state) => state.restoreData)
  const fileInputRef = useRef(null)
  const [settings, setSettings] = useState({
    currency: 'BRL',
    language: 'pt-BR',
    backupEmail: '',
    autoBackup: false
  })

  const handleChange = (field) => (event) => {
    if (field === 'theme') {
      setTheme(event.target.value)
    } else {
      setSettings((prev) => ({ ...prev, [field]: event.target.value }))
    }
  }

  const handleThemeChange = (event) => {
    const newTheme = event.target.value
    setTheme(newTheme)
  }

  const handleBackup = async () => {
    try {
      const backupData = await exportData()
      const jsonString = JSON.stringify(backupData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().split('T')[0]
      link.href = url
      link.download = `fooddiddo-backup-${timestamp}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      // Mostrar resumo do backup
      const data = backupData.data || {}
      const summary = [
        `📊 Orçamentos: ${data.budgets?.length || 0}`,
        `🥘 Receitas: ${data.recipes?.length || 0}`,
        `🥬 Ingredientes: ${data.ingredients?.length || 0}`,
        `💰 Custos Fixos: ${data.fixedCosts?.length || 0}`,
        `💵 Pricing: ${data.pricing?.length || 0}`,
        `💸 Fluxo de Caixa: ${data.cashflow?.length || 0}`,
        `📦 Estoque: ${data.warehouses?.length || 0} armazén(s)`,
        `📋 Movimentações: ${data.stockMovements?.length || 0}`
      ].join('\n')
      
      alert(`✅ Backup exportado com sucesso!\n\n${summary}\n\nO arquivo foi salvo no seu computador.`)
    } catch (error) {
      console.error('Erro ao exportar backup:', error)
      alert(`❌ Erro ao exportar backup: ${error.message || 'Tente novamente.'}`)
    }
  }

  const handleRestore = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonContent = e.target?.result
        if (typeof jsonContent !== 'string') {
          throw new Error('Formato de arquivo inválido')
        }

        const backupData = JSON.parse(jsonContent)
        
        // Validar estrutura do backup
        if (!backupData.data || typeof backupData.data !== 'object') {
          throw new Error('Formato de backup inválido. O arquivo não contém dados válidos.')
        }

        // Confirmar restauração
        const confirmMessage = `⚠️ ATENÇÃO: Esta ação irá substituir TODOS os dados atuais pelos dados do backup.\n\n` +
          `Data do backup: ${backupData.exportDate ? new Date(backupData.exportDate).toLocaleString('pt-BR') : 'Não informada'}\n\n` +
          `Deseja continuar?`
        
        if (window.confirm(confirmMessage)) {
          try {
            const result = await restoreData(backupData)
            
            // Mostrar resumo da restauração
            const summary = result?.summary || {}
            const summaryText = [
              `📊 Orçamentos: ${summary.budgets || 0}`,
              `🥘 Receitas: ${summary.recipes || 0}`,
              `🥬 Ingredientes: ${summary.ingredients || 0}`,
              `💰 Custos Fixos: ${summary.fixedCosts || 0}`,
              `💵 Pricing: ${summary.pricing || 0}`,
              `💸 Fluxo de Caixa: ${summary.cashflow || 0}`,
              `📦 Armazéns: ${summary.warehouses || 0}`,
              `📋 Movimentações: ${summary.stockMovements || 0}`
            ].join('\n')
            
            alert(`✅ Dados restaurados com sucesso!\n\n${summaryText}\n\nA página será recarregada.`)
            // Recarregar a página para aplicar as mudanças
            window.location.reload()
          } catch (error) {
            console.error('Erro ao restaurar:', error)
            alert(`❌ Erro ao restaurar backup: ${error.message || 'Verifique o console para mais detalhes.'}`)
          }
        }
      } catch (error) {
        console.error('Erro ao restaurar backup:', error)
        if (error instanceof SyntaxError) {
          alert('❌ Erro: O arquivo selecionado não é um JSON válido.')
        } else {
          alert(`❌ Erro ao restaurar backup: ${error.message}`)
        }
      } finally {
        // Limpar o input para permitir selecionar o mesmo arquivo novamente
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
    reader.onerror = () => {
      alert('❌ Erro ao ler o arquivo. Tente novamente.')
    }
    reader.readAsText(file)
  }

  const handleAutoBackupToggle = () => {
    setSettings((prev) => ({ ...prev, autoBackup: !prev.autoBackup }))
  }

  const handleActivateAutoBackup = () => {
    setSettings((prev) => ({ ...prev, autoBackup: true }))
    alert('Backup automático ativado! Você receberá backups semanais no e-mail cadastrado.')
  }

  const getCurrencyLabel = (code) => {
    const labels = {
      BRL: 'BRL',
      USD: 'USD'
    }
    return labels[code] || code
  }

  const getLanguageLabel = (code) => {
    const labels = {
      'pt-BR': 'pt-BR',
      'en-US': 'en-US'
    }
    return labels[code] || code
  }

  return (
    <div className="page config-page">
      {/* Seção 1: Estado Atual */}
      <section className="config-section">
        <h2 className="config-section-title">Estado Atual</h2>
        <div className="config-state-grid">
          <div className="config-state-card">
            <span className="config-state-card-label">
              Moeda padrão
              <Tooltip content="Moeda utilizada para exibir valores financeiros no sistema">
                <span className="tooltip-icon">ⓘ</span>
              </Tooltip>
            </span>
            <strong className="config-state-card-value">{getCurrencyLabel(settings.currency)}</strong>
          </div>
          <div className="config-state-card">
            <span className="config-state-card-label">
              Idioma
              <Tooltip content="Idioma da interface do sistema">
                <span className="tooltip-icon">ⓘ</span>
              </Tooltip>
            </span>
            <strong className="config-state-card-value">{getLanguageLabel(settings.language)}</strong>
          </div>
          <div className="config-state-card">
            <span className="config-state-card-label">
              Tema atual
              <Tooltip content="Tema visual da interface (claro ou escuro)">
                <span className="tooltip-icon">ⓘ</span>
              </Tooltip>
            </span>
            <strong className="config-state-card-value">{theme === 'light' ? 'Claro' : 'Escuro'}</strong>
          </div>
        </div>
      </section>

      {/* Seção 2: Preferências Gerais */}
      <section className="config-section">
        <h2 className="config-section-title">Preferências Gerais</h2>
        <div className="config-preferences-grid">
          <div className="config-input-group">
            <label className="config-input-label">
              Moeda
              <Tooltip content="Selecione a moeda padrão para exibição de valores">
                <span className="tooltip-icon">ⓘ</span>
              </Tooltip>
            </label>
            <select value={settings.currency} onChange={handleChange('currency')}>
              <option value="BRL">Real (R$)</option>
              <option value="USD">Dólar (US$)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>

          <div className="config-input-group">
            <label className="config-input-label">
              Idioma
              <Tooltip content="Selecione o idioma da interface">
                <span className="tooltip-icon">ⓘ</span>
              </Tooltip>
            </label>
            <select value={settings.language} onChange={handleChange('language')}>
              <option value="pt-BR">Português</option>
              <option value="en-US">Inglês</option>
            </select>
          </div>

          <div className="config-input-group">
            <label className="config-input-label">
              Tema
              <Tooltip content="Escolha entre tema claro ou escuro">
                <span className="tooltip-icon">ⓘ</span>
              </Tooltip>
            </label>
            <div className="config-theme-toggle-wrapper">
              <select value={theme} onChange={handleThemeChange}>
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
              <ThemeToggle className="theme-toggle" />
            </div>
          </div>

          <div className="config-input-group">
            <label className="config-input-label">
              E-mail para backup
              <Tooltip content="E-mail onde você receberá os backups automáticos">
                <span className="tooltip-icon">ⓘ</span>
              </Tooltip>
            </label>
            <input
              type="email"
              value={settings.backupEmail}
              onChange={handleChange('backupEmail')}
              placeholder="exemplo@empresa.com"
            />
          </div>
        </div>

        <div className="config-actions-row">
          <button className="config-btn-primary" type="button" onClick={handleBackup}>
            🔴 Fazer backup
          </button>
          <button className="config-btn-secondary" type="button" onClick={handleRestore}>
            ⚫ Restaurar arquivo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-label="Selecionar arquivo de backup"
          />
        </div>
      </section>

      {/* Seção 3: Automação / Informações Importantes */}
      <section className="config-section">
        <div className="config-backup-banner">
          <div className="config-backup-icon">📦</div>
          <div className="config-backup-content">
            <h3 className="config-backup-title">Backup automático</h3>
            <p className="config-backup-description">
              Habilite o envio semanal para proteger seus dados financeiros.
            </p>
            <div className="config-backup-action">
              <ToggleSwitch
                checked={settings.autoBackup}
                onChange={handleAutoBackupToggle}
                label={settings.autoBackup ? 'Ativado' : 'Desativado'}
              />
              {!settings.autoBackup && (
                <button className="config-btn-primary" type="button" onClick={handleActivateAutoBackup}>
                  Ativar automação
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
