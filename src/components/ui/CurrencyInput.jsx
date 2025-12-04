import PropTypes from 'prop-types'
import './InputControls.css'

export function CurrencyInput({ label, value, onChange, name, placeholder, disabled }) {
  const handleChange = (event) => {
    const rawValue = event.target.value
    if (rawValue === '') {
      onChange('')
      return
    }

    const numericValue = Number(rawValue)
    if (!Number.isNaN(numericValue)) {
      onChange(numericValue)
    }
  }

  return (
    <label className="input-control">
      <span>{label}</span>
      <input
        type="number"
        name={name}
        inputMode="decimal"
        placeholder={placeholder ?? 'R$ 0,00'}
        value={value}
        onChange={handleChange}
        step="0.01"
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

