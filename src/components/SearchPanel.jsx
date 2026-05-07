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
  const quickTags = ['pikachu', 'mew', 'garchomp', 'charizard', 'bulbasaur']

  function handleQuick(tag) {
    onSearchInputChange(tag)
    // call submit after input update
    setTimeout(() => onSearchSubmit({ preventDefault: () => {} }), 0)
  }

  return (
    <section className="panel panel--hero search-panel-relative search-hero">
      <div className="panel-heading panel-heading--hero">
        <div>
          <p className="eyebrow">PokéAPI + React</p>
          <h1>Pokédex</h1>
          <p className="intro">
            Explora criaturas, descubre rarezas y filtra por tipo o generación en una
            experiencia visual más viva.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="results-pill">{totalResults.toLocaleString('es-ES')} resultados</span>
        </div>
      </div>

      <form className="search-bar" onSubmit={onSearchSubmit} role="search">
        <label className="sr-only" htmlFor="pokemon-search">
          Buscar Pokémon
        </label>
        <div className="search-bar__input-wrap">
          <span className="search-bar__icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M21 21l-4.35-4.35" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="11" cy="11" r="6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <input
            id="pokemon-search"
            className="search-input"
            type="text"
            autoComplete="off"
            spellCheck="false"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Ej: pikachu o 25"
          />

          <button type="submit" className="primary search-submit" disabled={loading} aria-label="Buscar">
            {loading ? 'Cargando...' : 'Buscar'}
          </button>
        </div>
      </form>

      <div className="actions-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="secondary" onClick={onRandomPokemon} disabled={loading}>
            Pokémon aleatorio
          </button>
          <span className="hint">Prueba con charizard, bulbasaur o 150.</span>
        </div>

        <div className="quick-tags" aria-label="Sugerencias rápidas">
          {quickTags.map((t) => (
            <button key={t} type="button" className="quick-chip" onClick={() => handleQuick(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
