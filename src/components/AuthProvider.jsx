import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se há um nome salvo no localStorage
    const savedUser = localStorage.getItem('fooddiddo_user_name')
    if (savedUser) {
      const userData = {
        id: `user_${Date.now()}`,
        name: savedUser,
        created_at: new Date().toISOString()
      }
      setUser(userData)
    }
    setIsLoading(false)
  }, [])

  const login = (userName) => {
    if (!userName || !userName.trim()) {
      return
    }
    
    const userData = {
      id: `user_${Date.now()}`,
      name: userName.trim(),
      created_at: new Date().toISOString()
    }
    
    setUser(userData)
    localStorage.setItem('fooddiddo_user_name', userName.trim())
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('fooddiddo_user_name')
  }

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  }

  // Mostrar loading enquanto verifica
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-content">
          <div className="auth-loading-spinner"></div>
          <p className="auth-loading-text">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
