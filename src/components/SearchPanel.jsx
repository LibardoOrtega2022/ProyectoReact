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
          <h1>POKEDEX</h1>
          <p className="intro">
            Busca por nombre o número, filtra por tipo o generación y recorre los
            resultados por páginas.
          </p>
        </div>
        <span className="results-pill">{totalResults.toLocaleString('es-ES')} resultados</span>
      </div>

      <form className="search-bar" onSubmit={onSearchSubmit}>
        <label className="sr-only" htmlFor="pokemon-search">
          Buscar Pokémon
        </label>
        <input
          id="pokemon-search"
          type="text"
          autoComplete="off"
          spellCheck="false"
          value={searchInput}
          onChange={(event) => onSearchInputChange(event.target.value)}
          placeholder="Ej: pikachu o 25"
        />
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
    </section>
  )
}
