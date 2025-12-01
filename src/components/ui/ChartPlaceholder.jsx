import PropTypes from 'prop-types'
import './ChartPlaceholder.css'

export function ChartPlaceholder({ title, type, description }) {
  return (
    <div className="chart-placeholder">
      <header>
        <span>{title}</span>
        <span className="chart-type">{type}</span>
      </header>
      <div className="chart-placeholder-body">
        <div className="chart-placeholder-visual" aria-hidden="true">
          <div className="chart-bar bar-1" />
          <div className="chart-bar bar-2" />
          <div className="chart-bar bar-3" />
          <div className="chart-bar bar-4" />
        </div>
        {description ? <p>{description}</p> : null}
      </div>
    </div>
  )
}

ChartPlaceholder.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  description: PropTypes.string
}

ChartPlaceholder.defaultProps = {
  description: 'Gráfico em desenvolvimento'
}

