/**
 * Hero section that holds the main search controls and result count.
 */
import { useEffect, useState } from 'react'

export default function SearchPanel({
  loading,
  onRandomPokemon,
  onSearchInputChange,
  onSearchSubmit,
  searchInput,
  totalResults,
  catalog = [],
}) {
  const quickTags = ['pikachu', 'mew', 'garchomp', 'charizard', 'bulbasaur']

  // Local input state with debounce to reduce upstream updates
  const [localInput, setLocalInput] = useState(searchInput || '')
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)

  useEffect(() => {
    setLocalInput(searchInput || '')
  }, [searchInput])

  useEffect(() => {
    const id = setTimeout(() => {
      onSearchInputChange(localInput)
    }, 250)
    return () => clearTimeout(id)
  }, [localInput, onSearchInputChange])

  function handleQuick(tag) {
    setLocalInput(tag)
    onSearchInputChange(tag)
    // call submit after input update
    setTimeout(() => onSearchSubmit({ preventDefault: () => {} }), 0)
  }

  const filteredSuggestions = (localInput ? catalog.filter((n) => n.includes(localInput.toLowerCase())) : []).slice(0, 6)

  function handleKeyDown(e) {
    if (!suggestionsOpen || filteredSuggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((i) => Math.min(i + 1, filteredSuggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0) {
        const pick = filteredSuggestions[highlightIndex]
        setLocalInput(pick)
        onSearchInputChange(pick)
        setSuggestionsOpen(false)
        setHighlightIndex(-1)
        setTimeout(() => onSearchSubmit({ preventDefault: () => {} }), 0)
      }
    } else if (e.key === 'Escape') {
      setSuggestionsOpen(false)
      setHighlightIndex(-1)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSearchInputChange(localInput)
    setSuggestionsOpen(false)
    setHighlightIndex(-1)
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

      <form className="search-bar" onSubmit={handleSubmit} role="search">
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
          <div style={{ position: 'relative' }}>
            <input
              id="pokemon-search"
              className="search-input"
              type="text"
              autoComplete="off"
              spellCheck="false"
              value={localInput}
              onChange={(event) => {
                setLocalInput(event.target.value)
                setSuggestionsOpen(true)
                setHighlightIndex(-1)
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setSuggestionsOpen(true)}
              placeholder="Ej: pikachu o 25"
            />

            {suggestionsOpen && filteredSuggestions.length > 0 && (
              <ul className="search-suggestions" role="listbox">
                {filteredSuggestions.map((s, idx) => (
                  <li
                    key={s}
                    className={idx === highlightIndex ? 'highlight' : ''}
                    onMouseDown={(e) => {
                      // use onMouseDown to avoid blur before click
                      e.preventDefault()
                      setLocalInput(s)
                      onSearchInputChange(s)
                      setSuggestionsOpen(false)
                      setHighlightIndex(-1)
                      setTimeout(() => onSearchSubmit({ preventDefault: () => {} }), 0)
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

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
