import PokemonCard from './PokemonCard'

/**
 * Responsive grid that renders the current page of detailed Pokémon cards.
 */
export default function PokemonGrid({
  loading,
  loadingFilters,
  pagePokemon,
  totalPages,
  totalResults,
  currentPage,
}) {
  const isEmpty = !loading && (totalResults === 0 || pagePokemon.length === 0)

  return (
    <section className="panel results-panel">
      <div className="results-panel__header">
        <div>
          <p className="eyebrow">Resultados</p>
          <h2>{loadingFilters ? 'Aplicando filtros...' : 'Lista de Pokémon'}</h2>
          <p className="panel-subtitle">
            {totalResults.toLocaleString('es-ES')} Pokémon coinciden con tu búsqueda.
          </p>
        </div>
        <div className="results-meta">
          <span>{pagePokemon.length} en esta página</span>
          <span>
            Página {currentPage} de {totalPages}
          </span>
        </div>
      </div>

      {loading || loadingFilters ? (
        <div className="pokemon-grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="pokemon-card skeleton-card" aria-hidden="true">
              <div className="pokemon-card__shell">
                <div className="skeleton-header">
                  <div className="skeleton-rarity" />
                  <div className="skeleton-title" />
                  <div className="skeleton-hp" />
                </div>

                <div className="pokemon-card__art-frame">
                  <div className="skeleton-art" />
                </div>

                <div className="pokemon-card__info-strip">
                  <div className="skeleton-chip" />
                  <div className="skeleton-chip" />
                  <div className="skeleton-chip" />
                </div>

                <div className="pokemon-card__attack-panel">
                  <div className="skeleton-energy" />
                  <div className="skeleton-attack">
                    <div className="skeleton-line short" />
                    <div className="skeleton-line" />
                  </div>
                </div>

                <div className="pokemon-card__footer-row">
                  <div className="skeleton-pill" />
                  <div className="skeleton-pill" />
                  <div className="skeleton-pill" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <div className="empty-state empty-state--wide">
          <p>No hay Pokémon para mostrar con esos filtros.</p>
        </div>
      ) : (
        <div className="pokemon-grid">
          {pagePokemon.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      )}
    </section>
  )
}
