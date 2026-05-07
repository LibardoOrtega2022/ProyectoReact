/**
 * Display a formatted move detail card
 */
import {
  getSpanishEffect,
  getSpanishTypeName,
  getSpanishDamageClass,
} from '../api/pokeapi'

export default function MoveDetail({ move }) {
  if (!move) return null

  const type = getSpanishTypeName(move.type?.name)
  const power = move.power !== null ? move.power : '—'
  const accuracy = move.accuracy !== null ? `${move.accuracy}%` : '—'
  const pp = move.pp || '—'
  const priority = move.priority || 0
  const category = getSpanishDamageClass(move.damage_class?.name)
  const effectData = getSpanishEffect(move.effect_entries)

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
        <dd className="effect-text">
          {effectData.text}
          {!effectData.isSpanish && effectData.languageCode && (
            <small style={{
              display: 'block',
              marginTop: '6px',
              fontSize: '0.85em',
              color: '#666',
              fontStyle: 'italic',
            }}>
              📌 Traducción del API ({effectData.languageCode.toUpperCase()})
            </small>
          )}
        </dd>
      </dl>
    </div>
  )
}
