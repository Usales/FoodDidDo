import { useState } from 'react'
import { Alert } from '../components/ui/Alert'
import './PageCommon.css'

export function ConfigPage() {
  const [settings, setSettings] = useState({
    currency: 'BRL',
    language: 'pt-BR',
    theme: 'light',
    backupEmail: ''
  })

  const handleChange = (field) => (event) => {
    setSettings((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleBackup = () => {
    alert('Backup em desenvolvimento. Esta ação criará uma cópia na nuvem.')
  }

  return (
    <div className="page">
      <section className="page-stack">
        <div className="summary-grid">
          <div className="summary-card">
            <span>Moeda padrão</span>
            <strong>{settings.currency}</strong>
          </div>
          <div className="summary-card">
            <span>Idioma</span>
            <strong>{settings.language}</strong>
          </div>
          <div className="summary-card">
            <span>Tema atual</span>
            <strong>{settings.theme === 'light' ? 'Claro' : 'Escuro'}</strong>
          </div>
        </div>
      </section>

      <section className="page-stack">
        <div className="page-header">
          <h2>Preferências gerais</h2>
        </div>
        <div className="page-grid">
          <label className="input-control">
            <span>Moeda</span>
            <select value={settings.currency} onChange={handleChange('currency')}>
              <option value="BRL">Real (R$)</option>
              <option value="USD">Dólar (US$)</option>
            </select>
          </label>
          <label className="input-control">
            <span>Idioma</span>
            <select value={settings.language} onChange={handleChange('language')}>
              <option value="pt-BR">Português</option>
              <option value="en-US">Inglês</option>
            </select>
          </label>
          <label className="input-control">
            <span>Tema</span>
            <select value={settings.theme} onChange={handleChange('theme')}>
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </label>
          <label className="input-control">
            <span>E-mail para backup</span>
            <input type="email" value={settings.backupEmail} onChange={handleChange('backupEmail')} placeholder="exemplo@empresa.com" />
          </label>
        </div>
        <div className="report-actions">
          <button className="primary-btn" type="button" onClick={handleBackup}>
            Fazer backup
          </button>
          <button className="ghost-btn" type="button">
            Restaurar arquivo
          </button>
        </div>
      </section>

      <section className="page-stack">
        <Alert
          variant="info"
          title="Backup automático"
          description="Habilite o envio semanal de backup para garantir a segurança dos seus dados financeiros."
        />
      </section>
    </div>
  )
}

