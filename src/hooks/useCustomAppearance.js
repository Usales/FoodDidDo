import { useState, useEffect } from 'react'

const APPEARANCE_SETTINGS_KEY = 'fooddiddo_appearance'

const defaultAppearance = {
  sidebarColor: '',
  topbarColor: '',
  backgroundColor: '',
  lightColors: '',
  mediumColors: '',
  logoUrl: '/images_/2.png'
}

export function useCustomAppearance() {
  const [appearance, setAppearance] = useState(() => {
    try {
      const saved = localStorage.getItem(APPEARANCE_SETTINGS_KEY)
      if (saved) {
        return { ...defaultAppearance, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.error('Erro ao carregar aparência:', error)
    }
    return defaultAppearance
  })

  // Salvar no localStorage quando mudar
  useEffect(() => {
    try {
      localStorage.setItem(APPEARANCE_SETTINGS_KEY, JSON.stringify(appearance))
      applyAppearance(appearance)
    } catch (error) {
      console.error('Erro ao salvar aparência:', error)
    }
  }, [appearance])

  // Aplicar aparência ao carregar
  useEffect(() => {
    applyAppearance(appearance)
  }, [])

  const updateAppearance = (updates) => {
    setAppearance((prev) => ({ ...prev, ...updates }))
  }

  const resetAppearance = () => {
    setAppearance(defaultAppearance)
    applyAppearance(defaultAppearance)
  }

  return {
    appearance,
    updateAppearance,
    resetAppearance
  }
}

function applyAppearance(appearance) {
  // Disparar evento para atualizar cores e logo no MainLayout
  window.dispatchEvent(new CustomEvent('appearanceChanged', { detail: appearance }))
}
