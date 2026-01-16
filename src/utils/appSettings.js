const APP_SETTINGS_KEY = 'appSettings'

export function getAppSettings() {
  try {
    const raw = localStorage.getItem(APP_SETTINGS_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return {
      currency: parsed?.currency ?? 'BRL',
      language: parsed?.language ?? 'pt-BR',
      backupEmail: parsed?.backupEmail ?? '',
      autoBackup: parsed?.autoBackup ?? false
    }
  } catch {
    return {
      currency: 'BRL',
      language: 'pt-BR',
      backupEmail: '',
      autoBackup: false
    }
  }
}

export function setAppSettings(nextSettings) {
  const merged = { ...getAppSettings(), ...(nextSettings || {}) }
  localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(merged))
  window.dispatchEvent(new CustomEvent('appSettingsChanged', { detail: merged }))
  return merged
}

export function subscribeAppSettings(listener) {
  const handler = (event) => listener?.(event?.detail)
  window.addEventListener('appSettingsChanged', handler)
  return () => window.removeEventListener('appSettingsChanged', handler)
}

