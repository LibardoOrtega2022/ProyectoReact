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
  const isEmpty = !loading && pagePokemon.length === 0

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
        <div className="empty-state empty-state--wide">
          <p>Cargando Pokédex...</p>
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
