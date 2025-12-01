import PropTypes from 'prop-types'
import './Alert.css'

const variantConfig = {
  info: { icon: 'ℹ️', className: 'alert-info' },
  success: { icon: '✅', className: 'alert-success' },
  warning: { icon: '⚠️', className: 'alert-warning' },
  danger: { icon: '🛑', className: 'alert-danger' }
}

export function Alert({ variant, title, description, action }) {
  const config = variantConfig[variant] ?? variantConfig.info

  return (
    <div className={`alert ${config.className}`}>
      <span className="alert-icon">{config.icon}</span>
      <div className="alert-content">
        {title ? <strong>{title}</strong> : null}
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="alert-action">{action}</div> : null}
    </div>
  )
}

Alert.propTypes = {
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'danger']),
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.node
}

Alert.defaultProps = {
  variant: 'info',
  title: null,
  description: null,
  action: null
}

