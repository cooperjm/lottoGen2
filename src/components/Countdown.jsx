import { useCountdown } from '../hooks/useCountdown.js'

export function Countdown({ config }) {
  const { timeLeft, nextDrawLabel } = useCountdown(config)

  return (
    <div className="countdown-block">
      <div className="countdown-label">Next Drawing</div>
      <div className="countdown-date">{nextDrawLabel}</div>
      <div className="countdown-timer">{timeLeft || '—'}</div>
      <a
        className="jackpot-link"
        href={config.officialUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        View current jackpot →
      </a>
    </div>
  )
}
