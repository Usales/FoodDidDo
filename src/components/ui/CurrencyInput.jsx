import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { getAppSettings, subscribeAppSettings } from '../../utils/appSettings'
import './InputControls.css'

export function CurrencyInput({ label, value, onChange, name, placeholder, disabled }) {
  const [appSettings, setAppSettingsState] = useState(() => getAppSettings())
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => subscribeAppSettings(setAppSettingsState), [])

  const locale = appSettings?.language || 'pt-BR'
  const currency = appSettings?.currency || 'BRL'

  const normalizedNumericValue = useMemo(() => {
    if (value === '' || value === null || value === undefined) return ''
    const num = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
    return Number.isNaN(num) ? '' : num
  }, [value])

  const formatForLocale = (num) => {
    if (num === '' || num === null || num === undefined) return ''
    if (typeof num !== 'number' || Number.isNaN(num)) return ''
    // Input deve mostrar só o número (sem "R$"), mas com separadores do locale
    return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
  }

  const parseFromLocale = (raw) => {
    const cleaned = String(raw ?? '').trim().replace(/[^\d.,-]/g, '')
    if (!cleaned) return ''

    // pt-BR: "," decimal e "." milhar
    if (currency === 'BRL' && locale === 'pt-BR') {
      let s = cleaned.replace(/\./g, '') // remove milhares
      const lastComma = s.lastIndexOf(',')
      if (lastComma !== -1) {
        s = s.slice(0, lastComma).replace(/,/g, '') + '.' + s.slice(lastComma + 1).replace(/,/g, '')
      } else {
        s = s.replace(/,/g, '')
      }
      const num = Number(s)
      return Number.isNaN(num) ? '' : num
    }

    // fallback: "." decimal e "," milhar
    let s = cleaned.replace(/,/g, '')
    const num = Number(s)
    return Number.isNaN(num) ? '' : num
  }

  // Mantém o texto exibido sincronizado com o valor externo, exceto durante edição.
  useEffect(() => {
    if (isFocused) return
    if (normalizedNumericValue === '') {
      setDisplayValue('')
      return
    }
    setDisplayValue(formatForLocale(normalizedNumericValue))
  }, [isFocused, normalizedNumericValue, locale, currency])

  const handleChange = (event) => {
    const raw = event.target.value
    setDisplayValue(raw)
    if (raw === '') {
      onChange('')
      return
    }
    const parsed = parseFromLocale(raw)
    if (parsed !== '') onChange(parsed)
  }

  return (
    <label className="input-control">
      <span>{label}</span>
      <input
        type="text"
        name={name}
        inputMode="decimal"
        placeholder={placeholder ?? (currency === 'BRL' ? '0,00' : '0.00')}
        value={displayValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false)
          const parsed = parseFromLocale(displayValue)
          setDisplayValue(parsed === '' ? '' : formatForLocale(parsed))
        }}
        disabled={disabled}
      />
    </label>
  )
}

CurrencyInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool
}

CurrencyInput.defaultProps = {
  value: '',
  name: undefined,
  placeholder: undefined,
  disabled: false
}

