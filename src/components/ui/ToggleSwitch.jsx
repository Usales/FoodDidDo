import PropTypes from 'prop-types'
import './ToggleSwitch.css'

export function ToggleSwitch({ checked, onChange, label, disabled = false }) {
  return (
    <label className={`toggle-switch ${disabled ? 'toggle-switch--disabled' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="toggle-switch-input"
      />
      <span className="toggle-switch-slider" />
      {label && <span className="toggle-switch-label">{label}</span>}
    </label>
  )
}

ToggleSwitch.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool
}

