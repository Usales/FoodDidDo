import PropTypes from 'prop-types'
import './InputControls.css'

export function PercentageInput({ label, value, onChange, name, placeholder }) {
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
        placeholder={placeholder ?? '0%'}
        value={value}
        onChange={handleChange}
        step="0.1"
      />
    </label>
  )
}

PercentageInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  placeholder: PropTypes.string
}

PercentageInput.defaultProps = {
  value: '',
  name: undefined,
  placeholder: undefined
}

