import { useEffect, useState } from 'react'
import { formatDisplayName, getPokemonArtworkUrl, fetchTypeData, fetchSpeciesData } from '../api/pokeapi'

/**
 * Formats PokéAPI metric values into readable units.
 */
function formatMetric(value, unit) {
  return `${(value / 10).toFixed(1)} ${unit}`
}

/**
 * Sums all base stats for a quick power snapshot.
 */
function getTotalStats(stats) {
  return stats.reduce((total, { base_stat }) => total + base_stat, 0)
}

/**
 * Converts a stat value into a percentage width for the progress bar.
 */
function getStatWidth(baseStat) {
  return `${Math.min((baseStat / 255) * 100, 100)}%`
}

function getMetricIcon(metric) {
  const icons = {
    height: '↕',
    weight: '⚖',
    experience: '★',
    power: '⚡',
  }

  return icons[metric] ?? '•'
}

function getPrimaryTypeTheme(primaryType) {
  const typeThemes = {
    normal: { accent: '#a8a29e', surface: 'rgba(168, 162, 158, 0.16)', strong: '#78716c' },
    fire: { accent: '#f97316', surface: 'rgba(249, 115, 22, 0.18)', strong: '#c2410c' },
    water: { accent: '#3b82f6', surface: 'rgba(59, 130, 246, 0.18)', strong: '#1d4ed8' },
    electric: { accent: '#eab308', surface: 'rgba(234, 179, 8, 0.18)', strong: '#a16207' },
    grass: { accent: '#22c55e', surface: 'rgba(34, 197, 94, 0.18)', strong: '#15803d' },
    ice: { accent: '#22d3ee', surface: 'rgba(34, 211, 238, 0.18)', strong: '#0891b2' },
    fighting: { accent: '#ef4444', surface: 'rgba(239, 68, 68, 0.18)', strong: '#b91c1c' },
    poison: { accent: '#a855f7', surface: 'rgba(168, 85, 247, 0.18)', strong: '#7e22ce' },
    ground: { accent: '#d97706', surface: 'rgba(217, 119, 6, 0.18)', strong: '#92400e' },
    flying: { accent: '#38bdf8', surface: 'rgba(56, 189, 248, 0.18)', strong: '#0284c7' },
    psychic: { accent: '#ec4899', surface: 'rgba(236, 72, 153, 0.18)', strong: '#be185d' },
    bug: { accent: '#84cc16', surface: 'rgba(132, 204, 22, 0.18)', strong: '#4d7c0f' },
    rock: { accent: '#ca8a04', surface: 'rgba(202, 138, 4, 0.18)', strong: '#854d0e' },
    ghost: { accent: '#6366f1', surface: 'rgba(99, 102, 241, 0.18)', strong: '#4338ca' },
    dragon: { accent: '#0ea5e9', surface: 'rgba(14, 165, 233, 0.18)', strong: '#0369a1' },
    dark: { accent: '#334155', surface: 'rgba(51, 65, 85, 0.18)', strong: '#111827' },
    steel: { accent: '#94a3b8', surface: 'rgba(148, 163, 184, 0.18)', strong: '#475569' },
    fairy: { accent: '#f472b6', surface: 'rgba(244, 114, 182, 0.18)', strong: '#db2777' },
  }

  return typeThemes[primaryType] || typeThemes.normal
}

/**
 * Detailed Pokémon card with animated artwork, stats, abilities and metadata.
 */
export default function PokemonCard({ pokemon }) {
  const [weaknesses, setWeaknesses] = useState([])
  const [rarityLabel, setRarityLabel] = useState(null)
  const totalStats = getTotalStats(pokemon.stats)
  const abilities = pokemon.abilities.map(({ ability }) => formatDisplayName(ability.name))
  const primaryType = pokemon.types[0]?.type.name ?? 'normal'
  const typeTheme = getPrimaryTypeTheme(primaryType)

  useEffect(() => {
    let active = true

    async function loadExtras() {
      try {
        // Fetch type data for each type the Pokémon has
        const types = pokemon.types.map((t) => t.type.name)
        const typeDatas = await Promise.all(types.map((t) => fetchTypeData(t)))

        // Combine damage relations into a map of multipliers
        const multiplier = {}

        for (const td of typeDatas) {
          td.damage_relations.double_damage_from.forEach((t) => {
            multiplier[t.name] = (multiplier[t.name] || 1) * 2
          })
          td.damage_relations.half_damage_from.forEach((t) => {
            multiplier[t.name] = (multiplier[t.name] || 1) * 0.5
          })
          td.damage_relations.no_damage_from.forEach((t) => {
            multiplier[t.name] = 0
          })
        }

        const weaknessList = Object.entries(multiplier)
          .map(([name, mult]) => ({ name, multiplier: mult }))
          .filter((w) => w.multiplier > 1)
          .sort((a, b) => b.multiplier - a.multiplier)

        // Fetch species info to determine rarity (capture_rate, legendary)
        const speciesName = pokemon.species?.name
        let rarity = null
        if (speciesName) {
          const species = await fetchSpeciesData(speciesName)
          if (species.is_legendary || species.is_mythical) {
            rarity = 'Legendario'
          } else {
            const capture = species.capture_rate ?? 0
            if (capture >= 200) rarity = 'Común'
            else if (capture >= 100) rarity = 'Poco común'
            else if (capture >= 50) rarity = 'Raro'
            else if (capture >= 11) rarity = 'Muy raro'
            else rarity = 'Extremadamente raro'
          }
        }

        if (!active) return
        setWeaknesses(weaknessList)
        setRarityLabel(rarity)
      } catch {
        // ignore extras failure silently
      }
    }

    loadExtras()
    return () => {
      active = false
    }
  }, [pokemon])

  return (
    <article
      className="pokemon-card"
      style={{
        '--pokemon-accent': typeTheme.accent,
        '--pokemon-surface': typeTheme.surface,
        '--pokemon-strong': typeTheme.strong,
      }}
    >
      <div className="pokemon-card__media">
        <div className="pokemon-card__aurora" aria-hidden="true" />
        <span className="pokemon-card__id">#{String(pokemon.id).padStart(3, '0')}</span>
        <img
          className="pokemon-card__sprite"
          src={getPokemonArtworkUrl(pokemon)}
          alt={pokemon.name}
          loading="lazy"
        />
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
              {rarityLabel && <span className="rarity-badge">{rarityLabel}</span>}
            </div>
        </div>

          <div className="pokemon-card__meta pokemon-card__meta--summary">
          <div className="pokemon-card__metric-card">
            <div className="pokemon-card__metric-head">
                {getMetricIcon('height')}
              <span>Altura</span>
            </div>
            <strong>{formatMetric(pokemon.height, 'm')}</strong>
          </div>
          <div className="pokemon-card__metric-card">
            <div className="pokemon-card__metric-head">
                {getMetricIcon('weight')}
              <span>Peso</span>
            </div>
            <strong>{formatMetric(pokemon.weight, 'kg')}</strong>
          </div>
          <div className="pokemon-card__metric-card">
            <div className="pokemon-card__metric-head">
                {getMetricIcon('experience')}
              <span>Exp. base</span>
            </div>
            <strong>{pokemon.base_experience}</strong>
          </div>
          <div className="pokemon-card__metric-card">
            <div className="pokemon-card__metric-head">
                {getMetricIcon('power')}
              <span>Poder total</span>
            </div>
            <strong>{totalStats}</strong>
          </div>
        </div>
        <section className="pokemon-card__section pokemon-card__section--weaknesses">
          <div className="section-title-row">
            <h4>Debilidades</h4>
            <span>{weaknesses.length} tipos</span>
          </div>
          <div className="weakness-list">
            {weaknesses.length === 0 ? (
              <span className="weakness-pill">Ninguna notable</span>
            ) : (
              weaknesses.map((w) => (
                <span key={w.name} className="weakness-pill">
                  {formatDisplayName(w.name)} x{w.multiplier}
                </span>
              ))
            )}
          </div>
        </section>

        <section className="pokemon-card__section">
          <div className="section-title-row">
            <h4>Habilidades</h4>
            <span>{abilities.length} activas</span>
          </div>
          <div className="ability-list">
            {abilities.map((ability) => (
              <span key={ability} className="ability-pill">
                {ability}
              </span>
            ))}
          </div>
        </section>

        <section className="pokemon-card__section">
          <div className="section-title-row">
            <h4>Estadísticas</h4>
            <span>{pokemon.stats.length} métricas</span>
          </div>
          <div className="pokemon-card__stats">
            {pokemon.stats.map(({ stat, base_stat }) => (
              <div key={stat.name} className="card-stat card-stat--bar">
                <div className="card-stat__header">
                  <span>{formatDisplayName(stat.name)}</span>
                  <strong>{base_stat}</strong>
                </div>
                <div className="card-stat__bar" aria-hidden="true">
                  <div className="card-stat__bar-fill" style={{ width: getStatWidth(base_stat) }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pokemon-card__section pokemon-card__section--moves">
          <div className="section-title-row">
            <h4>Movimientos</h4>
            <span>{pokemon.moves.length} disponibles</span>
          </div>
          <div className="move-count">
            <strong>{pokemon.moves.length}</strong>
            <span>movimientos registrados en PokéAPI</span>
          </div>
        </section>
      </div>
    </article>
  )
}
