import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import './FormModal.css'

export function FormModal({ isOpen, title, description, onClose, children, footer, isExpanded = false }) {
  if (!isOpen) return null

  const modalContent = (
    <div className="form-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`form-modal ${isExpanded ? 'form-modal-expanded' : ''}`}
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
            <span>✕</span>
          </button>
        </header>
        <section className="form-modal-body">{children}</section>
        {footer ? <footer className="form-modal-footer">{footer}</footer> : null}
      </div>
    </div>
  )

  // Renderizar o modal diretamente no body usando Portal
  return createPortal(modalContent, document.body)
}

FormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  isExpanded: PropTypes.bool
}

FormModal.defaultProps = {
  description: null,
  footer: null,
  isExpanded: false
}

