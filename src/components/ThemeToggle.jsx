import { useTheme } from '../contexts/ThemeContext'
import './ThemeToggle.css'

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <button
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      title={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
      aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      <div className="theme-toggle-icon">
        {isDarkMode ? (
          // Ícone do sol (modo claro)
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2"/>
          </svg>
        ) : (
          // Ícone da lua (modo escuro)
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        )}
      </div>
      <span className="theme-toggle-text">
        {isDarkMode ? 'Claro' : 'Escuro'}
      </span>
    </button>
  )
}

export default ThemeToggle
