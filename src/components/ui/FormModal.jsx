import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import './FormModal.css'

export function FormModal({ isOpen, title, description, onClose, children, footer, isExpanded = false }) {
  // Impede scroll da página atrás quando o modal estiver aberto
  useEffect(() => {
    if (!isOpen) return undefined

    const body = document.body
    const root = document.documentElement

    const prevOverflow = body.style.overflow
    const prevPaddingRight = body.style.paddingRight

    // Compensa a largura da scrollbar para evitar "pular" layout
    const scrollbarWidth = window.innerWidth - root.clientWidth

    body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPaddingRight
    }
  }, [isOpen])

  // Fechar com ESC
  useEffect(() => {
    if (!isOpen) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const modalContent = (
    <div
      className="form-modal-backdrop"
      role="presentation"
      onClick={(event) => {
        // Fecha apenas quando clicar fora do modal (no backdrop)
        if (event.target === event.currentTarget) onClose()
      }}
    >
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
          <button className="form-modal-close" type="button" onClick={() => onClose()}>
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

