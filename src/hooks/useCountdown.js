import { useState, useEffect } from 'react'
import { getNextDrawDate, formatCountdown, formatDrawDate } from '../utils/nextDrawDate.js'

export function useCountdown(config) {
  const [nextDraw, setNextDraw] = useState(() => getNextDrawDate(config))
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    setNextDraw(getNextDrawDate(config))
  }, [config.id])

  useEffect(() => {
    function tick() {
      const ms = nextDraw - Date.now()
      if (ms <= 0) {
        setTimeLeft(formatCountdown(0))
        setNextDraw(getNextDrawDate(config))
        return
      }
      setTimeLeft(formatCountdown(ms))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [nextDraw])

  return { timeLeft, nextDrawDate: nextDraw, nextDrawLabel: formatDrawDate(nextDraw) }
}
