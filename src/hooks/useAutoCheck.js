import { useCallback } from 'react'
import { parseDrawResult } from '../utils/matchChecker.js'

export function useAutoCheck(config, picks, updatePickSet) {
  const check = useCallback(async () => {
    const pending = picks.filter(p => p.status === 'pending')
    if (pending.length === 0) return

    try {
      const res = await fetch(
        `${config.apiEndpoint}?$order=draw_date%20DESC&$limit=100`,
        config.appToken ? { headers: { 'X-App-Token': config.appToken } } : {}
      )
      if (!res.ok) return
      const draws = await res.json()

      for (const pickSet of pending) {
        const match = draws.find(d => d.draw_date.slice(0, 10) === pickSet.drawDate)
        if (!match) continue
        const winningNumbers = parseDrawResult(match, config)
        updatePickSet(pickSet.id, { winningNumbers, status: 'checked' })
      }
    } catch {
      // silently fail — manual entry still available
    }
  }, [picks, config.id, updatePickSet])

  return { check }
}
