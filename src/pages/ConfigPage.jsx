import { useState, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAppStore } from '../stores/appStore'
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
    setSettings((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleThemeChange = (event) => {
    const newTheme = event.target.value
    setTheme(newTheme)
  }

  const handleToggleAutoBackup = () => {
    setSettings((prev) => ({ ...prev, autoBackup: !prev.autoBackup }))
  }

  const handleBackup = () => {
    try {
      const backupData = exportData()
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
      alert('✅ Backup exportado com sucesso! O arquivo foi salvo no seu computador.')
    } catch (error) {
      console.error('Erro ao exportar backup:', error)
      alert('❌ Erro ao exportar backup. Tente novamente.')
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
          restoreData(backupData)
          alert('✅ Dados restaurados com sucesso! A página será recarregada.')
          // Recarregar a página para aplicar as mudanças
          window.location.reload()
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
    <div className="config-page">
      {/* Seção 1: Estado Atual */}
      <section className="config-current-state">
        <h2>Estado Atual</h2>
        <div className="config-state-grid">
          <div className="config-state-card">
            <span>Moeda padrão</span>
            <strong>{getCurrencyLabel(settings.currency)}</strong>
          </div>
          <div className="config-state-card">
            <span>Idioma</span>
            <strong>{getLanguageLabel(settings.language)}</strong>
          </div>
          <div className="config-state-card">
            <span>Tema atual</span>
            <strong>{theme === 'light' ? 'Claro' : 'Escuro'}</strong>
          </div>
        </div>
      </section>

      {/* Seção 2: Preferências Gerais */}
      <section className="config-preferences">
        <h2>Preferências Gerais</h2>
        <div className="config-preferences-grid">
          <div className="config-input-wrapper">
            <label className="config-input-label">
              Moeda
              <span className="config-tooltip">
                ⓘ
                <span className="config-tooltip-content">
                  Selecione a moeda padrão para exibição de valores monetários
                </span>
              </span>
            </label>
            <select value={settings.currency} onChange={handleChange('currency')}>
              <option value="BRL">Real (R$)</option>
              <option value="USD">Dólar (US$)</option>
            </select>
          </div>

          <div className="config-input-wrapper">
            <label className="config-input-label">
              Idioma
              <span className="config-tooltip">
                ⓘ
                <span className="config-tooltip-content">
                  Escolha o idioma de interface do sistema
                </span>
              </span>
            </label>
            <select value={settings.language} onChange={handleChange('language')}>
              <option value="pt-BR">Português</option>
              <option value="en-US">Inglês</option>
            </select>
          </div>

          <div className="config-input-wrapper">
            <label className="config-input-label">
              Tema
              <span className="config-tooltip">
                ⓘ
                <span className="config-tooltip-content">
                  Escolha entre tema claro ou escuro para melhor conforto visual
                </span>
              </span>
            </label>
            <select value={theme} onChange={handleThemeChange}>
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>

          <div className="config-input-wrapper">
            <label className="config-input-label">
              E-mail para backup
              <span className="config-tooltip">
                ⓘ
                <span className="config-tooltip-content">
                  E-mail onde você receberá os backups automáticos dos seus dados
                </span>
              </span>
            </label>
            <input
              type="email"
              value={settings.backupEmail}
              onChange={handleChange('backupEmail')}
              placeholder="exemplo@empresa.com"
            />
          </div>
        </div>

        <div className="config-backup-actions">
          <button className="config-backup-btn" type="button" onClick={handleBackup}>
            Fazer backup
          </button>
          <button className="config-restore-btn" type="button" onClick={handleRestore}>
            Restaurar arquivo
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

      {/* Seção 3: Backup Automático */}
      <section className="config-backup-section">
        <div className="config-backup-banner">
          <div className="config-backup-icon">📦</div>
          <div className="config-backup-content">
            <h3>Backup automático</h3>
            <p>Habilite o envio semanal para proteger seus dados financeiros.</p>
          </div>
          <div className="config-backup-action">
            {settings.autoBackup ? (
              <div className="config-toggle-wrapper">
                <div className="config-toggle active" onClick={handleToggleAutoBackup}>
                  <div className="config-toggle-handle"></div>
                </div>
                <span className="config-toggle-label">Ativado</span>
              </div>
            ) : (
              <button className="config-backup-activate-btn" type="button" onClick={handleActivateAutoBackup}>
                Ativar automação
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

