/**
 * Display a formatted ability detail card
 */
import { getSpanishEffect, getSpanishAbilityName, formatDisplayName } from '../api/pokeapi'

export default function AbilityDetail({ ability }) {
  if (!ability) return null

  const effectData = getSpanishEffect(ability.effect_entries)
  const isHidden = ability.is_main_series
  const generation = formatDisplayName(ability.generation?.name || 'unknown')

  return (
    <div className="detail-card ability-detail">
      <h4>
        {isHidden && <span className="detail-tag" style={{ background: '#f97316' }}>Oculta</span>}
        {getSpanishAbilityName(ability.name)}
      </h4>
      <dl>
        <dt>Generación:</dt>
        <dd>{generation}</dd>
        <dt>Descripción:</dt>
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
      {ability.pokemon?.slice(0, 5).length > 0 && (
        <>
          <dt>Pokémon con esta habilidad (muestra):</dt>
          <dd>
            <ul className="pokemon-list">
              {ability.pokemon.slice(0, 5).map((p) => (
                <li key={p.pokemon.name}>{p.pokemon.name}</li>
              ))}
            </ul>
          </dd>
        </>
      )}
    </div>
  )
}
