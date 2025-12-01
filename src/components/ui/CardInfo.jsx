import PropTypes from 'prop-types'
import './CardInfo.css'

const trendMap = {
  up: 'card-info-trend-up',
  down: 'card-info-trend-down',
  stable: 'card-info-trend-stable'
}

export function CardInfo({ title, value, auxiliary, trend, icon, trendLabel }) {
  return (
    <article className="card-info">
      <div className="card-info-header">
        <span className="card-info-title">{title}</span>
        {icon ? <span className="card-info-icon">{icon}</span> : null}
      </div>
      <div className="card-info-value">{value}</div>
      {auxiliary ? <div className="card-info-aux">{auxiliary}</div> : null}
      {trend && trendLabel ? (
        <span className={`card-info-trend ${trendMap[trend] ?? trendMap.stable}`}>
          {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '➤'} {trendLabel}
        </span>
      ) : null}
    </article>
  )
}

CardInfo.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  auxiliary: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  trend: PropTypes.oneOf(['up', 'down', 'stable']),
  icon: PropTypes.node,
  trendLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
}

CardInfo.defaultProps = {
  auxiliary: null,
  trend: null,
  icon: null,
  trendLabel: null
}

