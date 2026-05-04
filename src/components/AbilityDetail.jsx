/**
 * Display a formatted ability detail card
 */
export default function AbilityDetail({ ability }) {
  if (!ability) return null

  const effect = ability.effect_entries?.find((e) => e.language?.name === 'es')?.effect ||
                ability.effect_entries?.[0]?.effect ||
                'Sin descripción disponible'
  const isHidden = ability.is_main_series

  return (
    <div className="detail-card ability-detail">
      <h4>
        {isHidden && <span className="detail-tag" style={{ background: '#f97316' }}>Oculta</span>}
        {ability.name}
      </h4>
      <dl>
        <dt>Generación:</dt>
        <dd>{ability.generation?.name || 'unknown'}</dd>
        <dt>Descripción:</dt>
        <dd className="effect-text">{effect}</dd>
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
