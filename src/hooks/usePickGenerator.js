import { useState, useCallback } from 'react'
import { STRATEGIES } from '../utils/strategies.js'

export function usePickGenerator(config) {
  const [strategyId, setStrategyId] = useState('smartRandom')
  const [lines, setLines] = useState([])
  const [count, setCount] = useState(5)

  const generate = useCallback(() => {
    const strategy = STRATEGIES.find(s => s.id === strategyId)
    if (!strategy) return
    const generated = []
    const seen = new Set()
    let attempts = 0
    while (generated.length < count && attempts < count * 20) {
      attempts++
      const line = strategy.fn(config)
      const key = [...line.main, line.bonus].join('-')
      if (!seen.has(key)) {
        seen.add(key)
        generated.push(line)
      }
    }
    setLines(generated)
  }, [strategyId, count, config.id])

  const clear = useCallback(() => setLines([]), [])

  return { strategyId, setStrategyId, lines, count, setCount, generate, clear }
}
