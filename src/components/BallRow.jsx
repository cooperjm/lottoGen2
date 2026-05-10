import { Ball } from './Ball.jsx'
import { checkLine } from '../utils/matchChecker.js'

export function BallRow({ line, gameId, winningNumbers = null, index }) {
  const result = winningNumbers ? checkLine(line, winningNumbers, gameId) : null

  return (
    <div className="ball-row">
      <span className="ball-row__index">#{index + 1}</span>
      <div className="ball-row__main">
        {line.main.map(n => (
          <Ball
            key={n}
            number={n}
            gameId={gameId}
            matched={result ? result.matchedMain.includes(n) : null}
          />
        ))}
      </div>
      <span className="ball-row__divider" aria-hidden="true">·</span>
      <Ball
        number={line.bonus}
        isBonus
        gameId={gameId}
        matched={result ? result.bonusMatched : null}
      />
      {result && (
        <span className={`ball-row__prize${result.prize ? ' ball-row__prize--win' : ''}`}>
          {result.prize ?? 'No prize'}
        </span>
      )}
    </div>
  )
}
