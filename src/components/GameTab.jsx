import { useState } from 'react'
import { Countdown } from './Countdown.jsx'
import { StrategyPicker } from './StrategyPicker.jsx'
import { BallRow } from './BallRow.jsx'
import { SavedPicksList } from './SavedPicksList.jsx'
import { FrequencyLegend } from './FrequencyLegend.jsx'
import { usePickGenerator } from '../hooks/usePickGenerator.js'
import { useSavedPicks, MAX_PICKS } from '../hooks/useSavedPicks.js'
import { getNextDrawDate, formatDrawDate } from '../utils/nextDrawDate.js'

export function GameTab({ config }) {
  const { strategyId, setStrategyId, lines, count, setCount, generate, clear } = usePickGenerator(config)
  const { picks, addPickSet, removePickSet, updatePickSet, isAtCapacity } = useSavedPicks(config)
  const [saved, setSaved] = useState(false)

  function handleGenerate() {
    generate()
    setSaved(false)
  }

  function handleSave() {
    if (lines.length === 0 || isAtCapacity) return
    const nextDraw = getNextDrawDate(config)
    const drawDate = nextDraw.toLocaleDateString('en-CA', { timeZone: 'America/New_York' }) // YYYY-MM-DD
    const drawLabel = formatDrawDate(nextDraw)
    const ok = addPickSet(lines, strategyId, drawDate, drawLabel)
    if (ok) { setSaved(true); clear() }
  }

  return (
    <div className="game-tab">
      <Countdown config={config} />

      <section className="generator-section">
        <h2 className="section-title">Generate Picks</h2>

        <StrategyPicker selected={strategyId} onSelect={id => { setStrategyId(id); clear() }} />

        <FrequencyLegend config={config} />

        <div className="line-count">
          <label className="line-count__label">Lines to generate</label>
          <div className="line-count__controls">
            <button
              className="btn btn--icon"
              onClick={() => setCount(c => Math.max(1, c - 1))}
              aria-label="Decrease"
            >−</button>
            <span className="line-count__value">{count}</span>
            <button
              className="btn btn--icon"
              onClick={() => setCount(c => Math.min(MAX_PICKS, c + 1))}
              aria-label="Increase"
            >+</button>
          </div>
        </div>

        <button className="btn btn--primary btn--full" onClick={handleGenerate}>
          Generate {count} Line{count !== 1 ? 's' : ''}
        </button>

        {lines.length > 0 && (
          <div className="generated-lines">
              {lines.map((line, i) => (
              <BallRow key={i} index={i} line={line} gameId={config.id} />
            ))}
            <div className="generated-lines__footer">
              {isAtCapacity ? (
                <p className="capacity-warning">You have {MAX_PICKS} saved picks — delete one to save more.</p>
              ) : saved ? (
                <p className="save-success">✓ Picks saved!</p>
              ) : (
                <button className="btn btn--secondary btn--full" onClick={handleSave}>
                  Save these picks
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      <SavedPicksList
        config={config}
        picks={picks}
        onDelete={removePickSet}
        updatePickSet={updatePickSet}
      />
    </div>
  )
}
