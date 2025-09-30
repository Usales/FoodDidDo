import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './Auth.css'

const Register = ({ onRegister, onSwitchToLogin, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Função para verificar se o email já existe usando a função SQL
  const checkEmailExists = async (email) => {
    try {
      // Usar a função SQL para verificar se email existe
      const { data, error } = await supabase
        .rpc('check_email_exists', { email_to_check: email })
      
      if (error) {
        console.error('Erro ao verificar email:', error)
        // Se a função não existir, tentar método alternativo
        return await checkEmailExistsFallback(email)
      }
      
      return data || false
    } catch (error) {
      console.error('Erro ao verificar email:', error)
      // Fallback para método alternativo
      return await checkEmailExistsFallback(email)
    }
  }

  // Método alternativo caso a função SQL não esteja disponível
  const checkEmailExistsFallback = async (email) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao verificar email (fallback):', error)
        return false
      }
      
      return !!data
    } catch (error) {
      console.error('Erro ao verificar email (fallback):', error)
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Verificar se o email já existe antes de tentar criar
      const emailExists = await checkEmailExists(formData.email)
      if (emailExists) {
        setErrors({ general: 'O email já está em uso. Tente fazer login ou use outro email.' })
        setIsLoading(false)
        return
      }

      // Validação adicional: tentar reset de senha para verificar se email existe
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: 'http://localhost:3000/reset-password'
      })
      
      // Se não deu erro de "email não encontrado", pode ser que o email já existe
      if (!resetError || !resetError.message.includes('not found')) {
        // Verificar novamente se realmente existe
        const doubleCheck = await checkEmailExists(formData.email)
        if (doubleCheck) {
          setErrors({ general: 'O email já está em uso. Tente fazer login ou use outro email.' })
          setIsLoading(false)
          return
        }
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name.trim()
          }
        }
      })

      if (authError) {
        console.error('Erro do Supabase Auth:', authError)
        
        if (authError.message.includes('already registered') || 
            authError.message.includes('User already registered') ||
            authError.message.includes('duplicate key value') ||
            authError.message.includes('already exists') ||
            authError.message.includes('email address is already registered') ||
            authError.message.includes('already been registered')) {
          setErrors({ general: 'O email já está em uso. Tente fazer login ou use outro email.' })
        } else if (authError.message.includes('Invalid email')) {
          setErrors({ general: 'Email inválido. Verifique se o email está correto.' })
        } else if (authError.message.includes('Password should be at least')) {
          setErrors({ general: 'A senha deve ter pelo menos 6 caracteres.' })
        } else if (authError.message.includes('Signup is disabled')) {
          setErrors({ general: 'Cadastro temporariamente desabilitado. Tente novamente mais tarde.' })
        } else {
          setErrors({ general: `Erro ao criar conta: ${authError.message}` })
        }
        setIsLoading(false)
        return
      }

      if (authData.user) {
        // Tentar criar perfil do usuário na tabela profiles (opcional)
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authData.user.id,
                name: formData.name.trim(),
                email: formData.email.trim(),
                created_at: new Date().toISOString()
              }
            ])

          if (profileError) {
            console.warn('Aviso: Não foi possível criar perfil na tabela profiles:', profileError.message)
          }
        } catch (error) {
          console.warn('Aviso: Tabela profiles não existe ou não está acessível:', error.message)
        }

        // Salvar dados do usuário logado
        const userData = {
          id: authData.user.id,
          email: authData.user.email,
          name: formData.name.trim(),
          created_at: authData.user.created_at
        }

        localStorage.setItem('fooddiddo_current_user', JSON.stringify(userData))
        onRegister(userData)
      }
    } catch (error) {
      console.error('Erro no cadastro:', error)
      setErrors({ general: 'Erro ao criar conta. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <div className="auth-logo">
            <h2>Criar conta</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="auth-body">
          <form className="auth-form" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Nome completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`auth-input ${errors.name ? 'error' : ''}`}
                placeholder="Seu nome completo"
                disabled={isLoading}
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`auth-input ${errors.email ? 'error' : ''}`}
                placeholder="seu@email.com"
                disabled={isLoading}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`auth-input ${errors.password ? 'error' : ''}`}
                placeholder="Mínimo 6 caracteres"
                disabled={isLoading}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar senha</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Digite a senha novamente"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            <div className="auth-actions">
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </div>
          </form>

          <div className="auth-footer">
            <p>
              Já tem uma conta?{' '}
              <button 
                className="auth-switch-btn" 
                onClick={onSwitchToLogin}
                disabled={isLoading}
              >
                Faça login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
