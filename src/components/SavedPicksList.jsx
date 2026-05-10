import { SavedPickItem } from './SavedPickItem.jsx'
import { useAutoCheck } from '../hooks/useAutoCheck.js'

export function SavedPicksList({ config, picks, onDelete, updatePickSet }) {
  const { check } = useAutoCheck(config, picks, updatePickSet)

  if (picks.length === 0) {
    return (
      <div className="empty-state">
        <p>No saved picks yet — generate some lines above.</p>
      </div>
    )
  }

  return (
    <div className="saved-picks">
      <div className="saved-picks__header">
        <h2 className="section-title">Saved Picks</h2>
        <span className="saved-picks__count">{picks.length} / 20</span>
      </div>
      <div className="saved-picks__list">
        {picks.map(p => (
          <SavedPickItem
            key={p.id}
            pickSet={p}
            gameId={config.id}
            onDelete={onDelete}
            onAutoCheck={check}
          />
        ))}
      </div>
    </div>
  )
}
