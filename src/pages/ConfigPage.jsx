import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAppStore } from '../stores/appStore'
import { Tooltip } from '../components/ui/Tooltip'
import { ToggleSwitch } from '../components/ui/ToggleSwitch'
import ThemeToggle from '../components/ThemeToggle'
import { getAppSettings, setAppSettings } from '../utils/appSettings'
import { useCustomAppearance } from '../hooks/useCustomAppearance'
import './PageCommon.css'
import './ConfigPage.css'

const DASHBOARD_SETTINGS_KEY = 'dashboardSettings'
const CASHFLOW_PAGE_SETTINGS_KEY = 'cashflowPageSettings'
const SIDEBAR_SETTINGS_KEY = 'sidebarSettings'

const defaultDashboardSettings = {
  // Quando true, oculta todos os cabeçalhos do layout/Home
  showHeader: false,
  showStatusPanel: false,
  showBusinessInsights: false,
  showMealSection: false,
  showOrdersInPreparation: false
}

// Valores padrão: false = desmarcado (OFF) = exibindo, true = marcado (ON) = oculto
const defaultCashflowPageSettings = {
  showStatusSection: false,
  showSummarySection: false,
  showDetailsSection: false,
  showMovementsSection: false
}

const defaultSidebarSettings = {
  showVisaoGeral: false,
  showAnalises: false,
  showOperacao: false,
  // Visão Geral - itens individuais
  showDashboard: false,
  showCaixa: false,
  showFluxoCaixa: false,
  showOrcamento: false,
  showIngredientes: false,
  showReceitas: false,
  // Análises - itens individuais
  showCustos: false,
  showSimulador: false,
  showLucratividade: false,
  showCustosFixos: false,
  showPricing: false,
  showSimulacao: false,
  // Operação - itens individuais
  showEstoque: false,
  showVendas: false,
  showUsuarios: false,
  showRelatorios: false,
  showConfig: false
}

export function ConfigPage() {
  const { theme, setTheme } = useTheme()
  const exportData = useAppStore((state) => state.exportData)
  const restoreData = useAppStore((state) => state.restoreData)
  const fileInputRef = useRef(null)
  const logoInputRef = useRef(null)
  const [settings, setSettings] = useState(() => getAppSettings())
  const [dashboardSettings, setDashboardSettings] = useState(defaultDashboardSettings)
  const [cashflowPageSettings, setCashflowPageSettings] = useState(defaultCashflowPageSettings)
  const [sidebarSettings, setSidebarSettings] = useState(defaultSidebarSettings)
  const [activeTab, setActiveTab] = useState('geral')
  const { appearance, updateAppearance, resetAppearance } = useCustomAppearance()

  // Carregar preferências gerais (moeda/idioma/backup) do localStorage
  useEffect(() => {
    setSettings(getAppSettings())
  }, [])

  // Carregar configurações do dashboard do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DASHBOARD_SETTINGS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setDashboardSettings({ ...defaultDashboardSettings, ...parsed })
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do dashboard:', error)
    }
  }, [])

  // Carregar configurações do Fluxo de Caixa (UI) do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CASHFLOW_PAGE_SETTINGS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Garantir que valores não definidos usem false (desmarcado = exibindo)
        const settings = { ...defaultCashflowPageSettings }
        Object.keys(defaultCashflowPageSettings).forEach(key => {
          if (parsed[key] === undefined || parsed[key] === null) {
            settings[key] = false
          } else {
            settings[key] = parsed[key]
          }
        })
        setCashflowPageSettings(settings)
      } else {
        // Se não houver valores salvos, usar padrões (todos false = desmarcados)
        setCashflowPageSettings(defaultCashflowPageSettings)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do fluxo de caixa:', error)
      setCashflowPageSettings(defaultCashflowPageSettings)
    }
  }, [])

  // Carregar configurações da sidebar do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_SETTINGS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Garantir que valores não definidos usem false (desmarcado = exibindo)
        const settings = { ...defaultSidebarSettings }
        Object.keys(defaultSidebarSettings).forEach(key => {
          if (parsed[key] === undefined || parsed[key] === null) {
            settings[key] = false
          } else {
            settings[key] = parsed[key]
          }
        })
        setSidebarSettings(settings)
      } else {
        // Se não houver valores salvos, usar padrões (todos false = desmarcados)
        setSidebarSettings(defaultSidebarSettings)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações da sidebar:', error)
      setSidebarSettings(defaultSidebarSettings)
    }
  }, [])

  // Salvar configurações do dashboard no localStorage
  const saveDashboardSettings = (newSettings) => {
    try {
      localStorage.setItem(DASHBOARD_SETTINGS_KEY, JSON.stringify(newSettings))
      setDashboardSettings(newSettings)
      // Atualizar UI em tempo real (mesma aba) sem reload
      window.dispatchEvent(new CustomEvent('dashboardSettingsChanged', { detail: newSettings }))
    } catch (error) {
      console.error('Erro ao salvar configurações do dashboard:', error)
    }
  }

  // Salvar configurações do Fluxo de Caixa (UI) no localStorage
  const saveCashflowPageSettings = (newSettings) => {
    try {
      localStorage.setItem(CASHFLOW_PAGE_SETTINGS_KEY, JSON.stringify(newSettings))
      setCashflowPageSettings(newSettings)
      window.dispatchEvent(new CustomEvent('cashflowPageSettingsChanged', { detail: newSettings }))
    } catch (error) {
      console.error('Erro ao salvar configurações do fluxo de caixa:', error)
    }
  }

  // Salvar configurações da sidebar no localStorage
  const saveSidebarSettings = (newSettings) => {
    try {
      localStorage.setItem(SIDEBAR_SETTINGS_KEY, JSON.stringify(newSettings))
      setSidebarSettings(newSettings)
      // Atualizar UI em tempo real sem reload
      window.dispatchEvent(new CustomEvent('sidebarSettingsChanged', { detail: newSettings }))
    } catch (error) {
      console.error('Erro ao salvar configurações da sidebar:', error)
    }
  }

  const handleChange = (field) => (event) => {
    if (field === 'theme') {
      setTheme(event.target.value)
    } else {
      const next = { ...settings, [field]: event.target.value }
      setSettings(next)
      setAppSettings(next)
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
    reader.onload = async (e) => {
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
    const next = { ...settings, autoBackup: !settings.autoBackup }
    setSettings(next)
    setAppSettings(next)
  }

  const handleActivateAutoBackup = () => {
    const next = { ...settings, autoBackup: true }
    setSettings(next)
    setAppSettings(next)
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

  const renderActiveTabPanel = () => {
    if (activeTab === 'geral') {
      return (
        <div
          id="config-panel-geral"
          role="tabpanel"
          aria-labelledby="config-tab-geral"
          className="config-tab-panel"
        >
          {/* Estado Atual */}
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

          {/* Preferências Gerais */}
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
          </section>

          {/* Aparência do Sistema */}
          <section className="config-section">
            <h2 className="config-section-title">Aparência do Sistema</h2>
            <p className="config-section-description">
              Personalize as cores dos elementos principais do sistema e altere a logo.
            </p>
            <div className="config-preferences-grid">
              <div className="config-input-group">
                <label className="config-input-label">
                  Cor da Barra Lateral
                  <Tooltip content="Cor de fundo da barra lateral (sidebar)">
                    <span className="tooltip-icon">ⓘ</span>
                  </Tooltip>
                </label>
                <div className="config-color-input-wrapper">
                  <input
                    type="color"
                    value={appearance.sidebarColor || '#ffffff'}
                    onChange={(e) => updateAppearance({ sidebarColor: e.target.value })}
                    className="config-color-input"
                  />
                  <input
                    type="text"
                    value={appearance.sidebarColor || ''}
                    onChange={(e) => updateAppearance({ sidebarColor: e.target.value })}
                    placeholder="#ffffff"
                    className="config-color-text-input"
                  />
                  {appearance.sidebarColor && (
                    <button
                      type="button"
                      className="config-color-reset"
                      onClick={() => updateAppearance({ sidebarColor: '' })}
                      title="Restaurar padrão"
                    >
                      ↺
                    </button>
                  )}
                </div>
              </div>

              <div className="config-input-group">
                <label className="config-input-label">
                  Cor do Cabeçalho
                  <Tooltip content="Cor de fundo do cabeçalho (topbar)">
                    <span className="tooltip-icon">ⓘ</span>
                  </Tooltip>
                </label>
                <div className="config-color-input-wrapper">
                  <input
                    type="color"
                    value={appearance.topbarColor || '#ffffff'}
                    onChange={(e) => updateAppearance({ topbarColor: e.target.value })}
                    className="config-color-input"
                  />
                  <input
                    type="text"
                    value={appearance.topbarColor || ''}
                    onChange={(e) => updateAppearance({ topbarColor: e.target.value })}
                    placeholder="#ffffff"
                    className="config-color-text-input"
                  />
                  {appearance.topbarColor && (
                    <button
                      type="button"
                      className="config-color-reset"
                      onClick={() => updateAppearance({ topbarColor: '' })}
                      title="Restaurar padrão"
                    >
                      ↺
                    </button>
                  )}
                </div>
              </div>

              <div className="config-input-group">
                <label className="config-input-label">
                  Cor de Fundo Geral
                  <Tooltip content="Cor de fundo principal da aplicação">
                    <span className="tooltip-icon">ⓘ</span>
                  </Tooltip>
                </label>
                <div className="config-color-input-wrapper">
                  <input
                    type="color"
                    value={appearance.backgroundColor || '#ffffff'}
                    onChange={(e) => updateAppearance({ backgroundColor: e.target.value })}
                    className="config-color-input"
                  />
                  <input
                    type="text"
                    value={appearance.backgroundColor || ''}
                    onChange={(e) => updateAppearance({ backgroundColor: e.target.value })}
                    placeholder="#ffffff"
                    className="config-color-text-input"
                  />
                  {appearance.backgroundColor && (
                    <button
                      type="button"
                      className="config-color-reset"
                      onClick={() => updateAppearance({ backgroundColor: '' })}
                      title="Restaurar padrão"
                    >
                      ↺
                    </button>
                  )}
                </div>
              </div>

              <div className="config-input-group">
                <label className="config-input-label">
                  Cores Claras
                  <Tooltip content="Cor para elementos com tons claros">
                    <span className="tooltip-icon">ⓘ</span>
                  </Tooltip>
                </label>
                <div className="config-color-input-wrapper">
                  <input
                    type="color"
                    value={appearance.lightColors || '#f8fafc'}
                    onChange={(e) => updateAppearance({ lightColors: e.target.value })}
                    className="config-color-input"
                  />
                  <input
                    type="text"
                    value={appearance.lightColors || ''}
                    onChange={(e) => updateAppearance({ lightColors: e.target.value })}
                    placeholder="#f8fafc"
                    className="config-color-text-input"
                  />
                  {appearance.lightColors && (
                    <button
                      type="button"
                      className="config-color-reset"
                      onClick={() => updateAppearance({ lightColors: '' })}
                      title="Restaurar padrão"
                    >
                      ↺
                    </button>
                  )}
                </div>
              </div>

              <div className="config-input-group">
                <label className="config-input-label">
                  Cores Médias
                  <Tooltip content="Cor para elementos com tons médios">
                    <span className="tooltip-icon">ⓘ</span>
                  </Tooltip>
                </label>
                <div className="config-color-input-wrapper">
                  <input
                    type="color"
                    value={appearance.mediumColors || '#f1f5f9'}
                    onChange={(e) => updateAppearance({ mediumColors: e.target.value })}
                    className="config-color-input"
                  />
                  <input
                    type="text"
                    value={appearance.mediumColors || ''}
                    onChange={(e) => updateAppearance({ mediumColors: e.target.value })}
                    placeholder="#f1f5f9"
                    className="config-color-text-input"
                  />
                  {appearance.mediumColors && (
                    <button
                      type="button"
                      className="config-color-reset"
                      onClick={() => updateAppearance({ mediumColors: '' })}
                      title="Restaurar padrão"
                    >
                      ↺
                    </button>
                  )}
                </div>
              </div>

              <div className="config-input-group">
                <label className="config-input-label">
                  Logo do Sistema
                  <Tooltip content="Altere a logo exibida na barra lateral">
                    <span className="tooltip-icon">ⓘ</span>
                  </Tooltip>
                </label>
                <div className="config-logo-wrapper">
                  <div className="config-logo-preview">
                    {appearance.logoUrl ? (
                      <img src={appearance.logoUrl} alt="Logo preview" />
                    ) : (
                      <span>Sem logo</span>
                    )}
                  </div>
                  <div className="config-logo-actions">
                    <button
                      type="button"
                      className="config-btn-secondary"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      📷 Alterar Logo
                    </button>
                    {appearance.logoUrl !== '/images_/2.png' && (
                      <button
                        type="button"
                        className="config-color-reset"
                        onClick={() => updateAppearance({ logoUrl: '/images_/2.png' })}
                        title="Restaurar logo padrão"
                      >
                        ↺ Restaurar
                      </button>
                    )}
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          const dataUrl = event.target?.result
                          if (dataUrl) {
                            updateAppearance({ logoUrl: dataUrl })
                          }
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="config-appearance-actions">
              <button
                type="button"
                className="config-btn-secondary"
                onClick={resetAppearance}
              >
                🔄 Restaurar Padrões
              </button>
            </div>
          </section>
        </div>
      )
    }

    if (activeTab === 'barra-lateral') {
      return (
        <div
          id="config-panel-barra-lateral"
          role="tabpanel"
          aria-labelledby="config-tab-barra-lateral"
          className="config-tab-panel"
        >
          <section className="config-section">
            <h2 className="config-section-title">Barra Lateral</h2>
            <p className="config-section-description">
              Configure quais seções e itens devem ser exibidos na barra lateral do sistema.
            </p>
            <div className="config-dashboard-settings">
              {/* Visão Geral */}
              <div className="config-dashboard-item">
                <div className="config-dashboard-item-content">
                  <div className="config-dashboard-item-header">
                    <h3 className="config-dashboard-item-title">Visão Geral</h3>
                    <Tooltip content="Exibe a seção Visão Geral na barra lateral">
                      <span className="tooltip-icon">ⓘ</span>
                    </Tooltip>
                  </div>
                  <p className="config-dashboard-item-description">
                    Mostra a seção Visão Geral com seus itens de navegação
                  </p>
                </div>
                <ToggleSwitch
                  checked={sidebarSettings.showVisaoGeral ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showVisaoGeral: !(sidebarSettings.showVisaoGeral ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showVisaoGeral ?? false) ? 'Oculto' : 'Exibindo'}
                />
              </div>

              {/* Itens da Visão Geral */}
              {!(sidebarSettings.showVisaoGeral ?? false) && (
                <>
                  <div className="config-dashboard-item" style={{ marginLeft: '2rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                    <div className="config-dashboard-item-content">
                      <div className="config-dashboard-item-header">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Home</h4>
                      </div>
                      <p className="config-dashboard-item-description" style={{ fontSize: '0.85rem' }}>
                        Link para página inicial do dashboard
                      </p>
                    </div>
                <ToggleSwitch
                  checked={sidebarSettings.showDashboard ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showDashboard: !(sidebarSettings.showDashboard ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showDashboard ?? false) ? 'Oculto' : 'Exibindo'}
                />
                  </div>

                  <div className="config-dashboard-item" style={{ marginLeft: '2rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                    <div className="config-dashboard-item-content">
                      <div className="config-dashboard-item-header">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Caixa</h4>
                      </div>
                      <p className="config-dashboard-item-description" style={{ fontSize: '0.85rem' }}>
                        Link para tela de PDV/Caixa
                      </p>
                    </div>
                <ToggleSwitch
                  checked={sidebarSettings.showCaixa ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showCaixa: !(sidebarSettings.showCaixa ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showCaixa ?? false) ? 'Oculto' : 'Exibindo'}
                />
                  </div>

                  <div className="config-dashboard-item" style={{ marginLeft: '2rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                    <div className="config-dashboard-item-content">
                      <div className="config-dashboard-item-header">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Fluxo de Caixa</h4>
                      </div>
                      <p className="config-dashboard-item-description" style={{ fontSize: '0.85rem' }}>
                        Link para gestão de fluxo de caixa
                      </p>
                    </div>
                <ToggleSwitch
                  checked={sidebarSettings.showFluxoCaixa ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showFluxoCaixa: !(sidebarSettings.showFluxoCaixa ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showFluxoCaixa ?? false) ? 'Oculto' : 'Exibindo'}
                />
                  </div>

                  <div className="config-dashboard-item" style={{ marginLeft: '2rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                    <div className="config-dashboard-item-content">
                      <div className="config-dashboard-item-header">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Orçamentos</h4>
                      </div>
                      <p className="config-dashboard-item-description" style={{ fontSize: '0.85rem' }}>
                        Link para gestão de orçamentos
                      </p>
                    </div>
                <ToggleSwitch
                  checked={sidebarSettings.showOrcamento ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showOrcamento: !(sidebarSettings.showOrcamento ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showOrcamento ?? false) ? 'Oculto' : 'Exibindo'}
                />
                  </div>

                  <div className="config-dashboard-item" style={{ marginLeft: '2rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                    <div className="config-dashboard-item-content">
                      <div className="config-dashboard-item-header">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Ingredientes</h4>
                      </div>
                      <p className="config-dashboard-item-description" style={{ fontSize: '0.85rem' }}>
                        Link para gestão de ingredientes
                      </p>
                    </div>
                <ToggleSwitch
                  checked={sidebarSettings.showIngredientes ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showIngredientes: !(sidebarSettings.showIngredientes ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showIngredientes ?? false) ? 'Oculto' : 'Exibindo'}
                />
                  </div>

                  <div className="config-dashboard-item" style={{ marginLeft: '2rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                    <div className="config-dashboard-item-content">
                      <div className="config-dashboard-item-header">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Receitas</h4>
                      </div>
                      <p className="config-dashboard-item-description" style={{ fontSize: '0.85rem' }}>
                        Link para gestão de receitas
                      </p>
                    </div>
                <ToggleSwitch
                  checked={sidebarSettings.showReceitas ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showReceitas: !(sidebarSettings.showReceitas ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showReceitas ?? false) ? 'Oculto' : 'Exibindo'}
                />
                  </div>
                </>
              )}

              {/* Análises */}
              <div className="config-dashboard-item">
                <div className="config-dashboard-item-content">
                  <div className="config-dashboard-item-header">
                    <h3 className="config-dashboard-item-title">Análises</h3>
                    <Tooltip content="Exibe a seção Análises na barra lateral">
                      <span className="tooltip-icon">ⓘ</span>
                    </Tooltip>
                  </div>
                  <p className="config-dashboard-item-description">
                    Mostra a seção Análises com seus itens de navegação
                  </p>
                </div>
                <ToggleSwitch
                  checked={sidebarSettings.showAnalises ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showAnalises: !(sidebarSettings.showAnalises ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showAnalises ?? false) ? 'Oculto' : 'Exibindo'}
                />
              </div>

              {/* Itens das Análises */}
              {!(sidebarSettings.showAnalises ?? false) && (
                <>
                  <div className="config-dashboard-item" style={{ marginLeft: '2rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                    <div className="config-dashboard-item-content">
                      <div className="config-dashboard-item-header">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Custos</h4>
                      </div>
                      <p className="config-dashboard-item-description" style={{ fontSize: '0.85rem' }}>
                        Link para análise de custos
                      </p>
                    </div>
                <ToggleSwitch
                  checked={sidebarSettings.showCustos ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showCustos: !(sidebarSettings.showCustos ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showCustos ?? false) ? 'Oculto' : 'Exibindo'}
                />
                  </div>

                  <div className="config-dashboard-item" style={{ marginLeft: '2rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                    <div className="config-dashboard-item-content">
                      <div className="config-dashboard-item-header">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Simulador</h4>
                      </div>
                      <p className="config-dashboard-item-description" style={{ fontSize: '0.85rem' }}>
                        Link para simulador de receitas
                      </p>
                    </div>
                <ToggleSwitch
                  checked={sidebarSettings.showSimulador ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showSimulador: !(sidebarSettings.showSimulador ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showSimulador ?? false) ? 'Oculto' : 'Exibindo'}
                />
                  </div>

                  <div className="config-dashboard-item" style={{ marginLeft: '2rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                    <div className="config-dashboard-item-content">
                      <div className="config-dashboard-item-header">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Lucratividade</h4>
                      </div>
                      <p className="config-dashboard-item-description" style={{ fontSize: '0.85rem' }}>
                        Link para análise de lucratividade
                      </p>
                    </div>
                <ToggleSwitch
                  checked={sidebarSettings.showLucratividade ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showLucratividade: !(sidebarSettings.showLucratividade ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showLucratividade ?? false) ? 'Oculto' : 'Exibindo'}
                />
                  </div>

                  <div className="config-dashboard-item" style={{ marginLeft: '2rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                    <div className="config-dashboard-item-content">
                      <div className="config-dashboard-item-header">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Custos Fixos</h4>
                      </div>
                      <p className="config-dashboard-item-description" style={{ fontSize: '0.85rem' }}>
                        Link para gestão de custos fixos
                      </p>
                    </div>
                <ToggleSwitch
                  checked={sidebarSettings.showCustosFixos ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showCustosFixos: !(sidebarSettings.showCustosFixos ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showCustosFixos ?? false) ? 'Oculto' : 'Exibindo'}
                />
                  </div>

                  <div className="config-dashboard-item" style={{ marginLeft: '2rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                    <div className="config-dashboard-item-content">
                      <div className="config-dashboard-item-header">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Pricing</h4>
                      </div>
                      <p className="config-dashboard-item-description" style={{ fontSize: '0.85rem' }}>
                        Link para gestão de precificação
                      </p>
                    </div>
                <ToggleSwitch
                  checked={sidebarSettings.showPricing ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showPricing: !(sidebarSettings.showPricing ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showPricing ?? false) ? 'Oculto' : 'Exibindo'}
                />
                  </div>

                  <div className="config-dashboard-item" style={{ marginLeft: '2rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                    <div className="config-dashboard-item-content">
                      <div className="config-dashboard-item-header">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Sensibilidade</h4>
                      </div>
                      <p className="config-dashboard-item-description" style={{ fontSize: '0.85rem' }}>
                        Link para análise de sensibilidade
                      </p>
                    </div>
                <ToggleSwitch
                  checked={sidebarSettings.showSimulacao ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showSimulacao: !(sidebarSettings.showSimulacao ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showSimulacao ?? false) ? 'Oculto' : 'Exibindo'}
                />
                  </div>
                </>
              )}

              {/* Operação */}
              <div className="config-dashboard-item">
                <div className="config-dashboard-item-content">
                  <div className="config-dashboard-item-header">
                    <h3 className="config-dashboard-item-title">Operação</h3>
                    <Tooltip content="Exibe a seção Operação na barra lateral">
                      <span className="tooltip-icon">ⓘ</span>
                    </Tooltip>
                  </div>
                  <p className="config-dashboard-item-description">
                    Mostra a seção Operação com seus itens de navegação
                  </p>
                </div>
                <ToggleSwitch
                  checked={sidebarSettings.showOperacao ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showOperacao: !(sidebarSettings.showOperacao ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showOperacao ?? false) ? 'Oculto' : 'Exibindo'}
                />
              </div>

              {/* Itens da Operação */}
              {!(sidebarSettings.showOperacao ?? false) && (
                <>
                  <div className="config-dashboard-item" style={{ marginLeft: '2rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                    <div className="config-dashboard-item-content">
                      <div className="config-dashboard-item-header">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Estoque</h4>
                      </div>
                      <p className="config-dashboard-item-description" style={{ fontSize: '0.85rem' }}>
                        Link para gestão de estoque
                      </p>
                    </div>
                <ToggleSwitch
                  checked={sidebarSettings.showEstoque ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showEstoque: !(sidebarSettings.showEstoque ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showEstoque ?? false) ? 'Oculto' : 'Exibindo'}
                />
                  </div>

                  <div className="config-dashboard-item" style={{ marginLeft: '2rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                    <div className="config-dashboard-item-content">
                      <div className="config-dashboard-item-header">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Encomendas</h4>
                      </div>
                      <p className="config-dashboard-item-description" style={{ fontSize: '0.85rem' }}>
                        Link para gestão de encomendas/pedidos
                      </p>
                    </div>
                <ToggleSwitch
                  checked={sidebarSettings.showVendas ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showVendas: !(sidebarSettings.showVendas ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showVendas ?? false) ? 'Oculto' : 'Exibindo'}
                />
                  </div>

                  <div className="config-dashboard-item" style={{ marginLeft: '2rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                    <div className="config-dashboard-item-content">
                      <div className="config-dashboard-item-header">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Usuários</h4>
                      </div>
                      <p className="config-dashboard-item-description" style={{ fontSize: '0.85rem' }}>
                        Link para cadastro e gerenciamento de usuários
                      </p>
                    </div>
                <ToggleSwitch
                  checked={sidebarSettings.showUsuarios ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showUsuarios: !(sidebarSettings.showUsuarios ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showUsuarios ?? false) ? 'Oculto' : 'Exibindo'}
                />
                  </div>

                  <div className="config-dashboard-item" style={{ marginLeft: '2rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                    <div className="config-dashboard-item-content">
                      <div className="config-dashboard-item-header">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Relatórios</h4>
                      </div>
                      <p className="config-dashboard-item-description" style={{ fontSize: '0.85rem' }}>
                        Link para relatórios do sistema
                      </p>
                    </div>
                <ToggleSwitch
                  checked={sidebarSettings.showRelatorios ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showRelatorios: !(sidebarSettings.showRelatorios ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showRelatorios ?? false) ? 'Oculto' : 'Exibindo'}
                />
                  </div>

                  <div className="config-dashboard-item" style={{ marginLeft: '2rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                    <div className="config-dashboard-item-content">
                      <div className="config-dashboard-item-header">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Configurações</h4>
                      </div>
                      <p className="config-dashboard-item-description" style={{ fontSize: '0.85rem' }}>
                        Link para página de configurações
                      </p>
                    </div>
                <ToggleSwitch
                  checked={sidebarSettings.showConfig ?? false}
                  onChange={() => {
                    const newSettings = { ...sidebarSettings, showConfig: !(sidebarSettings.showConfig ?? false) }
                    saveSidebarSettings(newSettings)
                  }}
                  label={(sidebarSettings.showConfig ?? false) ? 'Oculto' : 'Exibindo'}
                />
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )
    }

    if (activeTab === 'cabecalho') {
      return (
        <div
          id="config-panel-cabecalho"
          role="tabpanel"
          aria-labelledby="config-tab-cabecalho"
          className="config-tab-panel"
        >
          <section className="config-section">
            <h2 className="config-section-title">Cabeçalho</h2>
            <p className="config-section-description">
              Configure o cabeçalho exibido no topo da tela Home.
            </p>
            <div className="config-dashboard-settings">
              <div className="config-dashboard-item">
                <div className="config-dashboard-item-content">
                  <div className="config-dashboard-item-header">
                    <h3 className="config-dashboard-item-title">Ocultar cabeçalho</h3>
                    <Tooltip content="Quando ativado, esconde o topo (topbar) e o cabeçalho da Home">
                      <span className="tooltip-icon">ⓘ</span>
                    </Tooltip>
                  </div>
                  <p className="config-dashboard-item-description">
                    Ative para não exibir nenhuma parte do cabeçalho
                  </p>
                </div>
                <ToggleSwitch
                  checked={dashboardSettings.showHeader}
                  onChange={() => {
                    const newSettings = { ...dashboardSettings, showHeader: !dashboardSettings.showHeader }
                    saveDashboardSettings(newSettings)
                  }}
                  label={dashboardSettings.showHeader ? 'Oculto' : 'Exibindo'}
                />
              </div>
            </div>
          </section>
        </div>
      )
    }

    if (activeTab === 'tela-home') {
      return (
        <div
          id="config-panel-tela-home"
          role="tabpanel"
          aria-labelledby="config-tab-tela-home"
          className="config-tab-panel"
        >
          <section className="config-section">
            <h2 className="config-section-title">Tela Home</h2>
            <p className="config-section-description">
              Configure quais seções devem ser exibidas na tela inicial (Dashboard).
            </p>
            <div className="config-dashboard-settings">
              <div className="config-dashboard-item">
                <div className="config-dashboard-item-content">
                  <div className="config-dashboard-item-header">
                    <h3 className="config-dashboard-item-title">Painel de Status</h3>
                    <Tooltip content="Exibe informações sobre refeições pendentes e custos estimados">
                      <span className="tooltip-icon">ⓘ</span>
                    </Tooltip>
                  </div>
                  <p className="config-dashboard-item-description">
                    Mostra o resumo do dia com refeições pendentes e custos estimados
                  </p>
                </div>
                <ToggleSwitch
                  checked={dashboardSettings.showStatusPanel}
                  onChange={() => {
                    const newSettings = { ...dashboardSettings, showStatusPanel: !dashboardSettings.showStatusPanel }
                    saveDashboardSettings(newSettings)
                  }}
                  label={dashboardSettings.showStatusPanel ? 'Oculto' : 'Exibindo'}
                />
              </div>

              <div className="config-dashboard-item">
                <div className="config-dashboard-item-content">
                  <div className="config-dashboard-item-header">
                    <h3 className="config-dashboard-item-title">Oportunidades de Negócio</h3>
                    <Tooltip content="Exibe insights sobre lucratividade das receitas">
                      <span className="tooltip-icon">ⓘ</span>
                    </Tooltip>
                  </div>
                  <p className="config-dashboard-item-description">
                    Mostra análises de lucro e oportunidades de negócio com suas receitas
                  </p>
                </div>
                <ToggleSwitch
                  checked={dashboardSettings.showBusinessInsights}
                  onChange={() => {
                    const newSettings = { ...dashboardSettings, showBusinessInsights: !dashboardSettings.showBusinessInsights }
                    saveDashboardSettings(newSettings)
                  }}
                  label={dashboardSettings.showBusinessInsights ? 'Oculto' : 'Exibindo'}
                />
              </div>

              <div className="config-dashboard-item">
                <div className="config-dashboard-item-content">
                  <div className="config-dashboard-item-header">
                    <h3 className="config-dashboard-item-title">Seção de Refeições</h3>
                    <Tooltip content="Exibe a lista de refeições planejadas e em andamento">
                      <span className="tooltip-icon">ⓘ</span>
                    </Tooltip>
                  </div>
                  <p className="config-dashboard-item-description">
                    Mostra as refeições do dia com status, ingredientes e custos
                  </p>
                </div>
                <ToggleSwitch
                  checked={dashboardSettings.showMealSection}
                  onChange={() => {
                    const newSettings = { ...dashboardSettings, showMealSection: !dashboardSettings.showMealSection }
                    saveDashboardSettings(newSettings)
                  }}
                  label={dashboardSettings.showMealSection ? 'Oculto' : 'Exibindo'}
                />
              </div>

              <div className="config-dashboard-item">
                <div className="config-dashboard-item-content">
                  <div className="config-dashboard-item-header">
                    <h3 className="config-dashboard-item-title">Pedidos em Preparo</h3>
                    <Tooltip content="Exibe a lista de pedidos que estão sendo preparados na cozinha para entrega">
                      <span className="tooltip-icon">ⓘ</span>
                    </Tooltip>
                  </div>
                  <p className="config-dashboard-item-description">
                    Mostra os pedidos em preparo com status fazer e finalizado
                  </p>
                </div>
                <ToggleSwitch
                  checked={dashboardSettings.showOrdersInPreparation}
                  onChange={() => {
                    const newSettings = { ...dashboardSettings, showOrdersInPreparation: !dashboardSettings.showOrdersInPreparation }
                    saveDashboardSettings(newSettings)
                  }}
                  label={dashboardSettings.showOrdersInPreparation ? 'Oculto' : 'Exibindo'}
                />
              </div>
            </div>
          </section>
        </div>
      )
    }

    if (activeTab === 'tela-caixa') {
      return (
        <div
          id="config-panel-tela-caixa"
          role="tabpanel"
          aria-labelledby="config-tab-tela-caixa"
          className="config-tab-panel"
        >
          <section className="config-section">
            <h2 className="config-section-title">Tela Caixa</h2>
            <p className="config-section-description">
              Configurações da tela de PDV (Caixa). Em breve você poderá personalizar comportamentos e preferências específicas.
            </p>
            <div className="config-backup-banner" style={{ marginTop: '0.5rem' }}>
              <div className="config-backup-icon">🧾</div>
              <div className="config-backup-content">
                <h3 className="config-backup-title">Em desenvolvimento</h3>
                <p className="config-backup-description">
                  Esta seção foi criada para centralizar configurações do PDV.
                </p>
              </div>
            </div>
          </section>
        </div>
      )
    }

    if (activeTab === 'tela-fluxo-caixa') {
      return (
        <div
          id="config-panel-tela-fluxo-caixa"
          role="tabpanel"
          aria-labelledby="config-tab-tela-fluxo-caixa"
          className="config-tab-panel"
        >
          <section className="config-section">
            <h2 className="config-section-title">Tela Fluxo de Caixa</h2>
            <p className="config-section-description">
              Configure quais seções devem ser exibidas na tela de Fluxo de Caixa.
            </p>

            <div className="config-dashboard-settings">
              <div className="config-dashboard-item">
                <div className="config-dashboard-item-content">
                  <div className="config-dashboard-item-header">
                    <h3 className="config-dashboard-item-title">Status do Caixa</h3>
                    <Tooltip content="Exibe o topo com status (aberto/fechado), saldo atual e ação de abrir/fechar caixa">
                      <span className="tooltip-icon">ⓘ</span>
                    </Tooltip>
                  </div>
                  <p className="config-dashboard-item-description">
                    Mostra o bloco principal com saldo e status do caixa
                  </p>
                </div>
                <ToggleSwitch
                  checked={cashflowPageSettings.showStatusSection}
                  onChange={() => {
                    const newSettings = {
                      ...cashflowPageSettings,
                      showStatusSection: !cashflowPageSettings.showStatusSection
                    }
                    saveCashflowPageSettings(newSettings)
                  }}
                  label={cashflowPageSettings.showStatusSection ? 'Oculto' : 'Exibindo'}
                />
              </div>

              <div className="config-dashboard-item">
                <div className="config-dashboard-item-content">
                  <div className="config-dashboard-item-header">
                    <h3 className="config-dashboard-item-title">Resumo Financeiro</h3>
                    <Tooltip content="Exibe o bloco com Entradas, Saídas, Resultado do período e Saldo final">
                      <span className="tooltip-icon">ⓘ</span>
                    </Tooltip>
                  </div>
                  <p className="config-dashboard-item-description">
                    Mostra os 4 cards compactos do resumo
                  </p>
                </div>
                <ToggleSwitch
                  checked={cashflowPageSettings.showSummarySection}
                  onChange={() => {
                    const newSettings = {
                      ...cashflowPageSettings,
                      showSummarySection: !cashflowPageSettings.showSummarySection
                    }
                    saveCashflowPageSettings(newSettings)
                  }}
                  label={cashflowPageSettings.showSummarySection ? 'Oculto' : 'Exibindo'}
                />
              </div>

              <div className="config-dashboard-item">
                <div className="config-dashboard-item-content">
                  <div className="config-dashboard-item-header">
                    <h3 className="config-dashboard-item-title">Detalhes do Caixa</h3>
                    <Tooltip content="Exibe o accordion com detalhes da sessão (abertura/fechamento, lucro médio por venda e orçamento)">
                      <span className="tooltip-icon">ⓘ</span>
                    </Tooltip>
                  </div>
                  <p className="config-dashboard-item-description">
                    Mostra o bloco colapsável “Detalhes da Sessão de Caixa”
                  </p>
                </div>
                <ToggleSwitch
                  checked={cashflowPageSettings.showDetailsSection}
                  onChange={() => {
                    const newSettings = {
                      ...cashflowPageSettings,
                      showDetailsSection: !cashflowPageSettings.showDetailsSection
                    }
                    saveCashflowPageSettings(newSettings)
                  }}
                  label={cashflowPageSettings.showDetailsSection ? 'Oculto' : 'Exibindo'}
                />
              </div>

              <div className="config-dashboard-item">
                <div className="config-dashboard-item-content">
                  <div className="config-dashboard-item-header">
                    <h3 className="config-dashboard-item-title">Movimentações</h3>
                    <Tooltip content="Exibe a tabela operacional de movimentações e os botões de filtros e adicionar despesa">
                      <span className="tooltip-icon">ⓘ</span>
                    </Tooltip>
                  </div>
                  <p className="config-dashboard-item-description">
                    Mostra a lista/tabela de entradas e saídas
                  </p>
                </div>
                <ToggleSwitch
                  checked={cashflowPageSettings.showMovementsSection}
                  onChange={() => {
                    const newSettings = {
                      ...cashflowPageSettings,
                      showMovementsSection: !cashflowPageSettings.showMovementsSection
                    }
                    saveCashflowPageSettings(newSettings)
                  }}
                  label={cashflowPageSettings.showMovementsSection ? 'Oculto' : 'Exibindo'}
                />
              </div>
            </div>
          </section>
        </div>
      )
    }

    return (
      <div
        id="config-panel-backup"
        role="tabpanel"
        aria-labelledby="config-tab-backup"
        className="config-tab-panel"
      >
        <section className="config-section">
          <h2 className="config-section-title">Backup / Restauração</h2>
          <p className="config-section-description">
            Exporte todos os dados do sistema para um arquivo e restaure quando necessário.
          </p>
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

  return (
    <div className="page config-page">
      <div className="config-tabs-area">
        <div className="config-tabs" role="tablist" aria-label="Seções das configurações">
          <button
            id="config-tab-geral"
            type="button"
            role="tab"
            className={`config-tab ${activeTab === 'geral' ? 'active' : ''}`}
            aria-selected={activeTab === 'geral'}
            aria-controls="config-panel-geral"
            onClick={() => setActiveTab('geral')}
          >
            Geral
          </button>
          <button
            id="config-tab-barra-lateral"
            type="button"
            role="tab"
            className={`config-tab ${activeTab === 'barra-lateral' ? 'active' : ''}`}
            aria-selected={activeTab === 'barra-lateral'}
            aria-controls="config-panel-barra-lateral"
            onClick={() => setActiveTab('barra-lateral')}
          >
            Barra Lateral
          </button>
          <button
            id="config-tab-cabecalho"
            type="button"
            role="tab"
            className={`config-tab ${activeTab === 'cabecalho' ? 'active' : ''}`}
            aria-selected={activeTab === 'cabecalho'}
            aria-controls="config-panel-cabecalho"
            onClick={() => setActiveTab('cabecalho')}
          >
            Cabeçalho
          </button>
          <button
            id="config-tab-tela-home"
            type="button"
            role="tab"
            className={`config-tab ${activeTab === 'tela-home' ? 'active' : ''}`}
            aria-selected={activeTab === 'tela-home'}
            aria-controls="config-panel-tela-home"
            onClick={() => setActiveTab('tela-home')}
          >
            Tela Home
          </button>
          <button
            id="config-tab-tela-caixa"
            type="button"
            role="tab"
            className={`config-tab ${activeTab === 'tela-caixa' ? 'active' : ''}`}
            aria-selected={activeTab === 'tela-caixa'}
            aria-controls="config-panel-tela-caixa"
            onClick={() => setActiveTab('tela-caixa')}
          >
            Tela Caixa
          </button>
          <button
            id="config-tab-tela-fluxo-caixa"
            type="button"
            role="tab"
            className={`config-tab ${activeTab === 'tela-fluxo-caixa' ? 'active' : ''}`}
            aria-selected={activeTab === 'tela-fluxo-caixa'}
            aria-controls="config-panel-tela-fluxo-caixa"
            onClick={() => setActiveTab('tela-fluxo-caixa')}
          >
            Tela Fluxo de Caixa
          </button>
          <button
            id="config-tab-backup"
            type="button"
            role="tab"
            className={`config-tab ${activeTab === 'backup' ? 'active' : ''}`}
            aria-selected={activeTab === 'backup'}
            aria-controls="config-panel-backup"
            onClick={() => setActiveTab('backup')}
          >
            Backup
          </button>
        </div>

        {renderActiveTabPanel()}
      </div>
    </div>
  )
}
