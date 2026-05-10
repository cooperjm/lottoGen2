import { useState, useEffect, useCallback } from 'react'

export const MAX_PICKS = 20

export function useSavedPicks(config) {
  const [picks, setPicks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(config.storageKey) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(config.storageKey, JSON.stringify(picks))
  }, [picks, config.storageKey])

  const addPickSet = useCallback((lines, strategy, drawDate, drawLabel) => {
    setPicks(prev => {
      if (prev.length >= MAX_PICKS) return prev
      const set = {
        id: crypto.randomUUID(),
        game: config.id,
        label: drawLabel,
        savedAt: new Date().toISOString(),
        strategy,
        drawDate,
        status: 'pending',
        winningNumbers: null,
        lines,
      }
      return [set, ...prev]
    })
  }, [config.id])

  const removePickSet = useCallback((id) => {
    setPicks(prev => prev.filter(p => p.id !== id))
  }, [])

  const updatePickSet = useCallback((id, updates) => {
    setPicks(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  return {
    picks,
    addPickSet,
    removePickSet,
    updatePickSet,
    isAtCapacity: picks.length >= MAX_PICKS,
  }
}
