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

function getTypeIcon(typeName) {
  const icons = {
    normal: '⚪',
    fire: '🔥',
    water: '💧',
    electric: '⚡',
    grass: '🌿',
    ice: '❄',
    fighting: '✊',
    poison: '☠',
    ground: '⛰',
    flying: '🪽',
    psychic: '🔮',
    bug: '🐞',
    rock: '🪨',
    ghost: '👻',
    dragon: '🐉',
    dark: '🌑',
    steel: '⚙',
    fairy: '✨',
  }

  return icons[typeName] ?? '•'
}

function getPrimaryTypeTheme(primaryType) {
  const typeThemes = {
    normal: { accent: '#a8a29e', surface: 'rgba(168, 162, 158, 0.12)', strong: '#78716c' },
    fire: { accent: '#ff6a00', surface: 'rgba(255, 106, 0, 0.22)', strong: '#b33f00' },
    water: { accent: '#2ea3ff', surface: 'rgba(46, 163, 255, 0.12)', strong: '#0f67b0' },
    electric: { accent: '#ffd038', surface: 'rgba(255, 208, 56, 0.22)', strong: '#a67f00' },
    grass: { accent: '#22c55e', surface: 'rgba(34, 197, 94, 0.18)', strong: '#15803d' },
    ice: { accent: '#9fefff', surface: 'rgba(159, 239, 255, 0.14)', strong: '#0b7b9a' },
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

function getRarityBadgeLabel(rarityLabel) {
  const labels = {
    Legendario: 'LEGENDARIO',
    'Extremadamente raro': 'EXT. RARO',
    'Muy raro': 'MUY RARO',
    'Raro': 'RARO',
    'Poco común': 'POCO COMÚN',
    'Común': 'COMÚN',
  }

  return labels[rarityLabel] || rarityLabel || ''
}

function getRarityBadgeVariant(rarityLabel) {
  const variants = {
    Legendario: 'legendary',
    'Extremadamente raro': 'extreme',
    'Muy raro': 'very-rare',
    'Raro': 'rare',
    'Poco común': 'uncommon',
    'Común': 'common',
  }

  return variants[rarityLabel] || 'common'
}

/**
 * Detailed Pokémon card with animated artwork, stats, abilities and metadata.
 */
export default function PokemonCard({ pokemon }) {
  const [weaknesses, setWeaknesses] = useState([])
  const [resistances, setResistances] = useState([])
  const [rarityLabel, setRarityLabel] = useState(null)
  const totalStats = getTotalStats(pokemon.stats)
  const primaryType = pokemon.types[0]?.type.name ?? 'normal'
  const primaryTypeIcon = getTypeIcon(primaryType)
  const typeTheme = getPrimaryTypeTheme(primaryType)
  const hpStat = pokemon.stats.find(({ stat }) => stat.name === 'hp')?.base_stat ?? 0
  const attackStat = pokemon.stats.find(({ stat }) => stat.name === 'attack')?.base_stat ?? 0
  const heightLabel = formatMetric(pokemon.height, 'm')
  const weightLabel = formatMetric(pokemon.weight, 'kg')
  const attackName = formatDisplayName(pokemon.moves[0]?.move.name ?? primaryType)
  const attackDescription = pokemon.moves[0]
    ? 'Movimiento registrado en PokéAPI.'
    : 'Sin movimientos registrados en la PokéAPI.'
  const retreatCost = Math.min(4, Math.max(1, Math.round((pokemon.weight || 10) / 40)))

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

        const resistanceList = Object.entries(multiplier)
          .map(([name, mult]) => ({ name, multiplier: mult }))
          .filter((w) => w.multiplier > 0 && w.multiplier < 1)
          .sort((a, b) => a.multiplier - b.multiplier)

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
        setResistances(resistanceList)
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
      data-rarity={rarityLabel || ''}
      style={{
        '--pokemon-accent': typeTheme.accent,
        '--pokemon-surface': typeTheme.surface,
        '--pokemon-strong': typeTheme.strong,
      }}
    >
      <div className="pokemon-card__shell">
        <header className="pokemon-card__header">
          {rarityLabel ? (
            <h3 className={`pokemon-card__rarity pokemon-card__rarity--${getRarityBadgeVariant(rarityLabel)}`} title={rarityLabel}>
              {getRarityBadgeLabel(rarityLabel)}
            </h3>
          ) : (
            <span className="pokemon-card__rarity pokemon-card__rarity--empty" aria-hidden="true">
              &nbsp;
            </span>
          )}

          <span className="pokemon-card__title">{formatDisplayName(pokemon.name)}</span>

          <div className="pokemon-card__hp" aria-label={`PS ${hpStat}`}>
            <span className="pokemon-card__hp-label">PS</span>
            <strong>{hpStat}</strong>
          </div>
        </header>

        <div className="pokemon-card__art-frame">
          <div className="pokemon-card__art-surface" aria-hidden="true" />
          <img
            className="pokemon-card__sprite"
            src={getPokemonArtworkUrl(pokemon)}
            alt={pokemon.name}
            loading="lazy"
          />
          <div className="pokemon-card__art-badge" aria-hidden="true">
            <span>{primaryTypeIcon}</span>
          </div>
        </div>

        <div className="pokemon-card__info-strip" aria-label="Datos rápidos del Pokémon">
          <div className="pokemon-card__info-chip">
            <span>N.º</span>
            <strong>{String(pokemon.id).padStart(3, '0')}</strong>
          </div>
          <div className="pokemon-card__info-chip">
            <span>Altura</span>
            <strong>{heightLabel}</strong>
          </div>
          <div className="pokemon-card__info-chip">
            <span>Peso</span>
            <strong>{weightLabel}</strong>
          </div>
        </div>

        <section className="pokemon-card__attack-panel">
          <div className="pokemon-card__attack-energy" aria-hidden="true">
            {pokemon.types.map(({ type }) => (
              <span key={type.name}>{getTypeIcon(type.name)}</span>
            ))}
          </div>
          <div className="pokemon-card__attack-copy">
            <div className="section-title-row">
              <h4>{attackName}</h4>
              <strong>{attackStat || Math.max(10, Math.round(totalStats / 4))}</strong>
            </div>
            <p>{attackDescription}</p>
          </div>
        </section>

        <section className="pokemon-card__footer-row">
          <div className="pokemon-card__footer-pill">
            <span>Debilidad</span>
            <strong>
              {weaknesses.length === 0
                ? 'Ninguna'
                : weaknesses.map((w) => (
                    <span key={w.name} className="pokemon-card__inline-type">
                      <i aria-hidden="true">{getTypeIcon(w.name)}</i>
                      <em>x{w.multiplier}</em>
                    </span>
                  ))}
            </strong>
          </div>
          <div className="pokemon-card__footer-pill">
            <span>Resistencia</span>
            <strong>
              {resistances.length === 0
                ? 'Sin datos'
                : resistances.slice(0, 2).map((r) => (
                    <span key={r.name} className="pokemon-card__inline-type pokemon-card__inline-type--resist">
                      <i aria-hidden="true">{getTypeIcon(r.name)}</i>

                      <em>x{r.multiplier}</em>
                    </span>
                  ))}
            </strong>
          </div>
          <div className="pokemon-card__footer-pill">
            <span>Retirada</span>
            <strong>
              {Array.from({ length: retreatCost }).map((_, index) => (
                <span key={index} className="pokemon-card__retreat-energy" aria-hidden="true">
                  {primaryTypeIcon}
                </span>
              ))}
            </strong>
          </div>
        </section>
      </div>
    </article>
  )
}
