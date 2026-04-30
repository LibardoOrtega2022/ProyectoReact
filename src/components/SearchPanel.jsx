/**
 * Hero section that holds the main search controls and result count.
 */
export default function SearchPanel({
  loading,
  onRandomPokemon,
  onSearchInputChange,
  onSearchSubmit,
  searchInput,
  totalResults,
}) {
  return (
    <section className="panel panel--hero">
      <div className="panel-heading panel-heading--hero">
        <div>
          <p className="eyebrow">PokéAPI + React</p>
          <h1>Pokédex</h1>
          <p className="intro">
            Explora criaturas, descubre rarezas y filtra por tipo o generación en una
            experiencia visual más viva.
          </p>
        </div>
        <span className="results-pill">{totalResults.toLocaleString('es-ES')} resultados</span>
      </div>

      <form className="search-bar" onSubmit={onSearchSubmit}>
        <label className="sr-only" htmlFor="pokemon-search">
          Buscar Pokémon
        </label>
        <div className="search-bar__input-wrap">
          <span className="search-bar__icon" aria-hidden="true">
            POKEDEX
          </span>
          <input
            id="pokemon-search"
            type="text"
            autoComplete="off"
            spellCheck="false"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Ej: pikachu o 25"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Buscar'}
        </button>
      </form>

      <div className="actions-row">
        <button type="button" className="secondary" onClick={onRandomPokemon} disabled={loading}>
          Pokémon aleatorio
        </button>
        <span className="hint">Prueba con charizard, bulbasaur o 150.</span>
      </div>

      <div className="quick-tags" aria-hidden="true">
        <span>Top: pikachu</span>
        <span>Top: mew</span>
        <span>Top: garchomp</span>
      </div>
    </section>
  )
}
