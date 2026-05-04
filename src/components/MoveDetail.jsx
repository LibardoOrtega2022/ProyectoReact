/**
 * Display a formatted move detail card
 */
export default function MoveDetail({ move }) {
  if (!move) return null

  const type = move.type?.name || 'unknown'
  const power = move.power !== null ? move.power : '—'
  const accuracy = move.accuracy !== null ? `${move.accuracy}%` : '—'
  const pp = move.pp || '—'
  const priority = move.priority || 0
  const category = move.damage_class?.name || 'unknown'
  const effect = move.effect_entries?.[0]?.effect || 'Sin descripción disponible'

  return (
    <div className="detail-card move-detail">
      <h4>
        <span className="detail-tag" style={{ background: '#60a5fa' }}>{type}</span>
        {move.name}
      </h4>
      <dl>
        <dt>Categoría:</dt>
        <dd>{category}</dd>
        <dt>Poder:</dt>
        <dd>{power}</dd>
        <dt>Precisión:</dt>
        <dd>{accuracy}</dd>
        <dt>PP:</dt>
        <dd>{pp}</dd>
        <dt>Prioridad:</dt>
        <dd>{priority > 0 ? `+${priority}` : priority}</dd>
        <dt>Efecto:</dt>
        <dd className="effect-text">{effect}</dd>
      </dl>
    </div>
  )
}
