import { formatDisplayName, getPokemonArtworkUrl } from '../api/pokeapi'

function formatMetric(value, unit) {
  return `${(value / 10).toFixed(1)} ${unit}`
}

export default function PokemonCard({ pokemon }) {
  const topStats = pokemon.stats.slice(0, 4)

  return (
    <article className="pokemon-card">
      <div className="pokemon-card__media">
        <span className="pokemon-card__id">#{String(pokemon.id).padStart(3, '0')}</span>
        <img src={getPokemonArtworkUrl(pokemon)} alt={pokemon.name} loading="lazy" />
      </div>

      <div className="pokemon-card__body">
        <div className="pokemon-card__title-row">
          <div>
            <p className="eyebrow">Pokémon</p>
            <h3 className="pokemon-card__title">{formatDisplayName(pokemon.name)}</h3>
          </div>
          <div className="pokemon-card__types">
            {pokemon.types.map(({ type }) => (
              <span key={type.name} className="type-pill">
                {formatDisplayName(type.name)}
              </span>
            ))}
          </div>
        </div>

        <div className="pokemon-card__meta">
          <div>
            <span>Altura</span>
            <strong>{formatMetric(pokemon.height, 'm')}</strong>
          </div>
          <div>
            <span>Peso</span>
            <strong>{formatMetric(pokemon.weight, 'kg')}</strong>
          </div>
        </div>

        <div className="pokemon-card__stats">
          {topStats.map(({ stat, base_stat }) => (
            <div key={stat.name} className="card-stat">
              <span>{formatDisplayName(stat.name)}</span>
              <strong>{base_stat}</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
