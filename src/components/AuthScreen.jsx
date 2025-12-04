import { useState } from 'react'
import Login from './Login'
import Register from './Register'
import { getEmojisForDate } from '../utils/dateEmojis'
import './AuthScreen.css'

const AuthScreen = ({ onLogin, onRegister }) => {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  
  // Obtém os emojis baseados na data atual
  const backgroundEmojis = getEmojisForDate()

  const handleShowLogin = () => {
    setShowLogin(true)
    setShowRegister(false)
  }

  const handleShowRegister = () => {
    setShowRegister(true)
    setShowLogin(false)
  }

  const handleLogin = (userData) => {
    onLogin(userData)
    setShowLogin(false)
  }

  const handleRegister = (userData) => {
    onRegister(userData)
    setShowRegister(false)
  }

  return (
    <div className="auth-screen">
      {/* Background com gradiente e elementos flutuantes */}
      <div className="auth-background">
        <div className="floating-elements">
          {backgroundEmojis.map((emoji, index) => {
            const top = Math.random() * 100; // 0% a 100% - toda a altura
            const left = Math.random() * 100; // 0% a 100% - toda a largura
            const animationType = ['floatAround1', 'floatAround2', 'floatAround3', 'floatAround4', 'floatAround5', 'floatAround6'][index % 6];
            const duration = 20 + Math.random() * 15; // 20s a 35s
            
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
            );
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

          {/* Call to action */}
          <div className="cta-section">
            <h2 className="cta-title">Pronto para começar?</h2>
            <p className="cta-subtitle">Junte-se a milhares de usuários que já transformaram sua cozinha</p>

            <div className="cta-buttons">
              <button
                className="cta-btn cta-btn-primary"
                onClick={handleShowLogin}
              >
                <span className="btn-icon">🚀</span>
                <span className="btn-text">
                  <span className="btn-title">Fazer Login</span>
                  <span className="btn-subtitle">Acesse sua conta</span>
                </span>
              </button>

              <button
                className="cta-btn cta-btn-secondary"
                onClick={handleShowRegister}
              >
                <span className="btn-icon">✨</span>
                <span className="btn-text">
                  <span className="btn-title">Criar Conta</span>
                  <span className="btn-subtitle">Comece grátis hoje</span>
                </span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="auth-footer">
            <p className="footer-text">
              Ao continuar, você concorda com nossos <a href="#" className="footer-link">Termos de Uso</a> e <a href="#" className="footer-link">Política de Privacidade</a>
            </p>
          </div>
        </div>
      </div>

      {/* Modais de autenticação */}
      {showLogin && (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={handleShowRegister}
          onClose={() => setShowLogin(false)}
        />
      )}

      {showRegister && (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={handleShowLogin}
          onClose={() => setShowRegister(false)}
        />
      )}
    </div>
  )
}

export default AuthScreen
