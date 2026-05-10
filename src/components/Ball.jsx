import { getTier } from '../utils/strategies.js'
import { MM_MAIN_FREQ } from '../constants/megamillions.js'
import { PB_MAIN_FREQ } from '../constants/powerball.js'

function getStats(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length
  const std = Math.sqrt(arr.reduce((t, f) => t + (f - mean) ** 2, 0) / arr.length)
  return { mean, std }
}

const MM_STATS = getStats(MM_MAIN_FREQ)
const PB_STATS = getStats(PB_MAIN_FREQ)

export function Ball({ number, isBonus = false, gameId, matched = null }) {
  let colorVar = '--ball-bg'

  if (matched === true) {
    colorVar = '--ball-matched'
  } else if (matched === false) {
    // dimmed — handled via opacity
  } else if (!isBonus) {
    const freq = gameId === 'megamillions'
      ? MM_MAIN_FREQ[number - 1]
      : PB_MAIN_FREQ[number - 1]
    const stats = gameId === 'megamillions' ? MM_STATS : PB_STATS
    const tier = getTier(freq, stats.mean, stats.std)
    const tierMap = { hot: '--ball-hot', warm: '--ball-warm', avg: '--ball-avg', cool: '--ball-cool', cold: '--ball-cold' }
    colorVar = tierMap[tier]
  } else {
    colorVar = gameId === 'megamillions' ? '--ball-bonus-mm' : '--ball-bonus-pb'
  }

  return (
    <span
      className={`ball${matched === false ? ' ball--missed' : ''}`}
      style={{ '--ball-color': `var(${colorVar})` }}
      aria-label={`${isBonus ? 'Bonus ball' : 'Ball'} ${number}`}
    >
      {number}
    </span>
  )
}
