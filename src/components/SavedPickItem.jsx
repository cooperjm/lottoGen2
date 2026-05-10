import { useState, useRef } from 'react'
import { toPng } from 'html-to-image'
import { BallRow } from './BallRow.jsx'
import { STRATEGIES } from '../utils/strategies.js'
import { checkLine } from '../utils/matchChecker.js'

export function SavedPickItem({ pickSet, gameId, onDelete, onAutoCheck }) {
  const [expanded, setExpanded] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [exporting, setExporting] = useState(false)
  const cardRef = useRef(null)

  const strategyLabel = STRATEGIES.find(s => s.id === pickSet.strategy)?.label ?? pickSet.strategy
  const isPending = pickSet.status === 'pending'

  function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    onDelete(pickSet.id)
  }

  async function handleExport() {
    if (!cardRef.current || exporting) return
    setExporting(true)
    // Expand lines for the capture if not already open
    const wasExpanded = expanded
    if (!wasExpanded) setExpanded(true)

    // Wait a frame for the DOM to update with expanded lines
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        // Exclude action buttons from the image
        filter: node => !node.classList?.contains('no-export'),
        style: { borderRadius: '10px' },
      })
      const link = document.createElement('a')
      link.download = `${pickSet.label.replace(/\s+/g, '-')}-picks.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export failed', err)
    } finally {
      if (!wasExpanded) setExpanded(false)
      setExporting(false)
    }
  }

  const bestMatch = pickSet.winningNumbers
    ? pickSet.lines
        .map(line => checkLine(line, pickSet.winningNumbers, gameId))
        .reduce((best, result) => {
          const score = result.matchedMain.length * 10 + (result.bonusMatched ? 1 : 0)
          return score > best.score ? { score, result } : best
        }, { score: -1, result: null }).result
    : null

  return (
    <div ref={cardRef} className={`pick-card${isPending ? '' : ' pick-card--checked'}`}>
      <div className="pick-card__header">
        <div className="pick-card__meta">
          <span className="pick-card__label">{pickSet.label}</span>
          <span className={`pick-card__status${isPending ? ' pick-card__status--pending' : ' pick-card__status--checked'}`}>
            {isPending ? 'Pending draw' : 'Results in'}
          </span>
        </div>
        <div className="pick-card__badges">
          <span className="badge">{strategyLabel}</span>
          <span className="badge">{pickSet.lines.length} lines</span>
        </div>
      </div>

      {!isPending && bestMatch && (
        <div className="pick-card__summary">
          Best match: {bestMatch.matchedMain.length} main{bestMatch.bonusMatched ? ' + Bonus' : ''}
        </div>
      )}

      {isPending && (
        <div className="pick-card__actions no-export">
          <button className="btn btn--sm btn--outline" onClick={onAutoCheck}>
            Auto-check
          </button>
        </div>
      )}

      <button className="pick-card__expand no-export" onClick={() => setExpanded(e => !e)}>
        {expanded ? '▲ Hide lines' : `▼ Show ${pickSet.lines.length} lines`}
      </button>

      {expanded && (
        <div className="pick-card__lines">
          {pickSet.lines.map((line, i) => (
            <BallRow
              key={i}
              index={i}
              line={line}
              gameId={gameId}
              winningNumbers={pickSet.winningNumbers}
            />
          ))}
        </div>
      )}

      <div className="pick-card__footer">
        <span className="pick-card__date">Saved {new Date(pickSet.savedAt).toLocaleDateString()}</span>
        <div className="pick-card__footer-actions no-export">
          <button
            className="btn btn--sm btn--outline"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Saving…' : '↓ Export'}
          </button>
          <button
            className={`btn btn--sm${confirming ? ' btn--danger' : ' btn--ghost'}`}
            onClick={handleDelete}
            onBlur={() => setConfirming(false)}
          >
            {confirming ? 'Confirm delete' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
