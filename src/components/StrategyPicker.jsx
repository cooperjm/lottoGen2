import { STRATEGIES } from '../utils/strategies.js'

export function StrategyPicker({ selected, onSelect }) {
  const active = STRATEGIES.find(s => s.id === selected)
  return (
    <div className="strategy-picker">
      <div className="strategy-buttons">
        {STRATEGIES.map(s => (
          <button
            key={s.id}
            className={`strategy-btn${selected === s.id ? ' strategy-btn--active' : ''}`}
            onClick={() => onSelect(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
      {active && <p className="strategy-desc">{active.desc}</p>}
    </div>
  )
}
