import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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

  // Log quando o usuário muda
  useEffect(() => {
    console.log('👤 AuthProvider: Estado do usuário mudou:', { user, isAuthenticated: !!user })
  }, [user])

  useEffect(() => {
    let isMounted = true
    let timeoutId

    // Timeout de segurança para evitar carregamento infinito
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Timeout na verificação de sessão - usando fallback')
        // Usar localStorage como fallback
        const savedUser = localStorage.getItem('fooddiddo_current_user')
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser))
          } catch (error) {
            console.error('Erro ao carregar usuário do localStorage:', error)
            localStorage.removeItem('fooddiddo_current_user')
          }
        }
        setIsLoading(false)
      }
    }, 3000) // 3 segundos de timeout

    // Verificar localStorage primeiro (mais rápido)
    const checkLocalStorage = () => {
      const savedUser = localStorage.getItem('fooddiddo_current_user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          if (isMounted) {
            setUser(userData)
            setIsLoading(false)
            return true // Usuário encontrado no localStorage
          }
        } catch (error) {
          console.error('Erro ao carregar usuário do localStorage:', error)
          localStorage.removeItem('fooddiddo_current_user')
        }
      }
      return false // Usuário não encontrado no localStorage
    }

    // Verificar sessão ativa no Supabase
    const checkSession = async () => {
      try {
        // Primeiro verificar localStorage
        if (checkLocalStorage()) {
          return // Usuário já carregado do localStorage
        }

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!isMounted) return

        if (error) {
          console.error('Erro ao verificar sessão:', error)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          // Buscar dados do perfil do usuário
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            console.error('Erro ao buscar perfil:', profileError)
          }

          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: profile?.name || session.user.email.split('@')[0],
            created_at: session.user.created_at
          }

          if (isMounted) {
            setUser(userData)
            localStorage.setItem('fooddiddo_current_user', JSON.stringify(userData))
          }
        }
      } catch (error) {
        console.error('Erro na verificação de sessão:', error)
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId)
          setIsLoading(false)
        }
      }
    }

    // Verificar localStorage primeiro
    if (!checkLocalStorage()) {
      // Se não encontrou no localStorage, verificar Supabase
      checkSession()
    }

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        if (event === 'SIGNED_OUT') {
          setUser(null)
          localStorage.removeItem('fooddiddo_current_user')
        } else if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: profile?.name || session.user.email.split('@')[0],
            created_at: session.user.created_at
          }

          setUser(userData)
          localStorage.setItem('fooddiddo_current_user', JSON.stringify(userData))
        }
      }
    )

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const login = (userData) => {
    console.log('🔐 AuthProvider: Fazendo login...')
    setUser(userData)
    setIsLoading(false) // Garantir que não fique em loading
    localStorage.setItem('fooddiddo_current_user', JSON.stringify({
      id: userData.id,
      name: userData.name,
      email: userData.email
    }))
    console.log('✅ AuthProvider: Login concluído')
  }

  const logout = async () => {
    console.log('🔐 AuthProvider: Iniciando logout...')
    
    // APENAS LOCALSTORAGE - SEM SUPABASE
    console.log('🧹 AuthProvider: Limpando dados locais...')
    setUser(null)
    localStorage.removeItem('fooddiddo_current_user')
    
    // IMPORTANTE: Resetar o estado de loading para evitar tela de carregamento infinita
    setIsLoading(false)
    
    console.log('✅ AuthProvider: Logout finalizado')
  }

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  }

  // Mostrar loading enquanto verifica autenticação
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
