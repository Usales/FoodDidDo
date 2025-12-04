import { useState } from 'react'
import { getEmojisForDate } from '../utils/dateEmojis'
import './AuthScreen.css'

const NameScreen = ({ onEnter }) => {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Obtém os emojis baseados na data atual
  const backgroundEmojis = getEmojisForDate()

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('Por favor, digite seu nome')
      return
    }

    if (name.trim().length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres')
      return
    }

    setIsSubmitting(true)
    onEnter(name.trim())
  }

  const handleChange = (e) => {
    setName(e.target.value)
    if (error) {
      setError('')
    }
  }

  return (
    <div className="auth-screen">
      {/* Background com gradiente e elementos flutuantes */}
      <div className="auth-background">
        <div className="floating-elements">
          {backgroundEmojis.map((emoji, index) => {
            const top = Math.random() * 100
            const left = Math.random() * 100
            const animationType = ['floatAround1', 'floatAround2', 'floatAround3', 'floatAround4', 'floatAround5', 'floatAround6'][index % 6]
            const duration = 20 + Math.random() * 15
            
            return (
              <div 
                key={index}
                className="floating-emoji"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  animation: `${animationType} ${duration}s linear infinite`
                }}
              >
                {emoji}
              </div>
            )
          })}
        </div>
        <div className="gradient-overlay"></div>
      </div>

      {/* Conteúdo principal */}
      <div className="auth-content">
        <div className="auth-container">
          {/* Header com logo e título */}
          <div className="auth-header">
            <div className="auth-logo-container">
              <img src="/images_/2.png" alt="FoodDidDo" className="auth-logo-main" />
            </div>
            <p className="auth-subtitle">
              Transforme sua cozinha em uma experiência incrível
            </p>
          </div>

          {/* Features em grid moderno */}
          <div className="features-grid">
            <div className="feature-card feature-card-1">
              <div className="feature-icon">
                <div className="icon-bg">🍽️</div>
              </div>
              <div className="feature-content">
                <h3>Refeições Inteligentes</h3>
                <p>Planeje e organize suas refeições diárias com facilidade</p>
              </div>
            </div>

            <div className="feature-card feature-card-2">
              <div className="feature-icon">
                <div className="icon-bg">🔍</div>
              </div>
              <div className="feature-content">
                <h3>Receitas Personalizadas</h3>
                <p>Descubra receitas baseadas nos ingredientes que você tem</p>
              </div>
            </div>

            <div className="feature-card feature-card-3">
              <div className="feature-icon">
                <div className="icon-bg">📱</div>
              </div>
              <div className="feature-content">
                <h3>Interface Moderna</h3>
                <p>Design intuitivo e responsivo para todos os dispositivos</p>
              </div>
            </div>

            <div className="feature-card feature-card-4">
              <div className="feature-icon">
                <div className="icon-bg">⚡</div>
              </div>
              <div className="feature-content">
                <h3>Rápido e Eficiente</h3>
                <p>Encontre o que precisa em segundos com nossa busca inteligente</p>
              </div>
            </div>
          </div>

          {/* Formulário de entrada */}
          <div className="cta-section">
            <h2 className="cta-title">Bem-vindo ao FoodDidDo!</h2>
            <p className="cta-subtitle">Digite seu nome para começar</p>

            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {error && (
                <div className="error-message general-error" style={{ marginBottom: '1rem', width: '100%', maxWidth: '400px' }}>
                  {error}
                </div>
              )}
              
              <div style={{ marginBottom: '1.5rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <input
                  type="text"
                  value={name}
                  onChange={handleChange}
                  placeholder="Digite seu nome"
                  className="auth-input"
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '1rem 1.5rem',
                    fontSize: '1.1rem',
                    borderRadius: '12px',
                    border: error ? '2px solid #dc2626' : '2px solid var(--border-primary)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="cta-btn cta-btn-primary"
                disabled={isSubmitting || !name.trim()}
                style={{
                  opacity: (!name.trim() || isSubmitting) ? 0.6 : 1,
                  cursor: (!name.trim() || isSubmitting) ? 'not-allowed' : 'pointer'
                }}
              >
                <span className="btn-icon">🚀</span>
                <span className="btn-text">
                  <span className="btn-title">
                    {isSubmitting ? 'Entrando...' : 'Entrar'}
                  </span>
                  <span className="btn-subtitle">Comece agora</span>
                </span>
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="auth-footer">
            <p className="footer-text">
              Ao continuar, você concorda com nossos <a href="#" className="footer-link">Termos de Uso</a> e <a href="#" className="footer-link">Política de Privacidade</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NameScreen

