const TIERS = [
  { cls: 'hot',  label: 'Hot',     desc: 'Drawn significantly above average' },
  { cls: 'warm', label: 'Warm',    desc: 'Drawn above average' },
  { cls: 'avg',  label: 'Average', desc: 'Drawn near the average' },
  { cls: 'cool', label: 'Cool',    desc: 'Drawn below average' },
  { cls: 'cold', label: 'Cold',    desc: 'Significantly overdue' },
]

export function FrequencyLegend({ config }) {
  return (
    <div className="freq-legend">
      <p className="freq-legend__title">Ball colors show historical draw frequency</p>
      <div className="freq-legend__grid">
        {TIERS.map(({ cls, label, desc }) => (
          <div key={cls} className="freq-legend__item">
            <span className={`freq-legend__ball freq-legend__ball--${cls}`}>7</span>
            <div className="freq-legend__text">
              <span className="freq-legend__label">{label}</span>
              <span className="freq-legend__desc">{desc}</span>
            </div>
          </div>
        ))}
        <div className="freq-legend__item">
          <span className={`freq-legend__ball freq-legend__ball--bonus-${config.id}`}>
            {config.id === 'megamillions' ? '11' : '5'}
          </span>
          <div className="freq-legend__text">
            <span className="freq-legend__label">{config.bonusLabel}</span>
            <span className="freq-legend__desc">Always shown distinctly</span>
          </div>
        </div>
      </div>
    </div>
  )
}
