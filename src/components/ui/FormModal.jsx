import PropTypes from 'prop-types'
import './FormModal.css'

export function FormModal({ isOpen, title, description, onClose, children, footer }) {
  if (!isOpen) return null

  return (
    <div className="form-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="form-modal-header">
          <div>
            <h2 id="form-modal-title">{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button className="form-modal-close" type="button" onClick={onClose}>
            ✕
          </button>
        </header>
        <section className="form-modal-body">{children}</section>
        {footer ? <footer className="form-modal-footer">{footer}</footer> : null}
      </div>
    </div>
  )
}

FormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node
}

FormModal.defaultProps = {
  description: null,
  footer: null
}

