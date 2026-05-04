import { useEffect, useRef, useState } from 'react'

// Emojis/iconos para cada tipo de Pokémon
const TYPE_ICONS = {
  normal: '◯',
  fire: '🔥',
  water: '💧',
  grass: '🌿',
  electric: '⚡',
  ice: '❄️',
  fighting: '👊',
  poison: '☠️',
  ground: '⛰️',
  flying: '🪶',
  psychic: '🔮',
  bug: '🐛',
  rock: '🪨',
  ghost: '👻',
  dragon: '🐉',
  dark: '🌙',
  steel: '⚙️',
  fairy: '✨',
}

// Emojis para rareza
const RARITY_ICONS = {
  'Común': '⭐',
  'Poco común': '⭐⭐',
  'Raro': '⭐⭐⭐',
  'Muy raro': '⭐⭐⭐⭐',
  'Legendario': '👑',
  'Extremadamente raro': '💎',
}

/**
 * Filter dropdown menu positioned at the top right
 */
// Translate generation slug to Spanish friendly label
function translateGeneration(value, fallback) {
  const map = {
    'generation-i': 'Primera generación',
    'generation-ii': 'Segunda generación',
    'generation-iii': 'Tercera generación',
    'generation-iv': 'Cuarta generación',
    'generation-v': 'Quinta generación',
    'generation-vi': 'Sexta generación',
    'generation-vii': 'Séptima generación',
    'generation-viii': 'Octava generación',
    'generation-ix': 'Novena generación',
  }

  return map[value] || fallback || value
}

export default function FilterDropdown({
  generationOptions,
  onClearFilters,
  onGenerationChange,
  onRarityChange,
  onTypeChange,
  selectedGeneration,
  selectedRarity,
  selectedType,
  typeOptions,
  loading,
  totalResults,
  // controlled externally when passed
  controlledOpen,
  onClose,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const firstControlRef = useRef(null)

  const isControlled = typeof controlledOpen === 'boolean'
  const open = isControlled ? controlledOpen : isOpen

  // Autofocus first control whenever dropdown opens.
  useEffect(() => {
    if (!open) {
      return
    }

    const focusTimer = requestAnimationFrame(() => {
      firstControlRef.current?.focus()
    })

    return () => {
      cancelAnimationFrame(focusTimer)
    }
  }, [open])

  // Close dropdown when clicking/touching outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isControlled) {
          onClose?.()
        } else {
          setIsOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isControlled, onClose])

  const hasActiveFilters = selectedType || selectedGeneration || selectedRarity

  function handleClear() {
    onClearFilters()
    if (isControlled) {
      onClose?.()
    } else {
      setIsOpen(false)
    }
  }

  function handleClose() {
    if (isControlled) {
      onClose?.()
    } else {
      setIsOpen(false)
    }
  }

  return (
    <div
      className={`filter-dropdown-container ${isControlled ? 'filter-dropdown-container--controlled' : ''}`}
      ref={dropdownRef}
    >
      {/* If parent controls open state, hide the internal toggle button */}
      {!isControlled && (
        <button
          className="filter-dropdown-button"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          disabled={loading}
          title="Abrir filtros"
        >
          <span className="filter-icon">⚙️</span>
          {hasActiveFilters && <span className="filter-badge">{[selectedType, selectedGeneration, selectedRarity].filter(Boolean).length}</span>}
        </button>
      )}

      {open && (
        <div className="filter-dropdown-menu">
          <div className="filter-dropdown-header">
            <h3>Filtros</h3>
            <button
              className="filter-close-btn"
              type="button"
              onClick={handleClose}
              title="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="filter-dropdown-content">
            {/* Type Filter */}
            <div className="filter-section">
              <label className="filter-section-title">Tipo</label>
              <div className="filter-options">
                <button
                  ref={firstControlRef}
                  className={`filter-option ${!selectedType ? 'active' : ''}`}
                  onClick={() => onTypeChange('')}
                  type="button"
                  disabled={loading}
                >
                  Todos
                </button>
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`filter-option ${selectedType === option.value ? 'active' : ''}`}
                    onClick={() => onTypeChange(option.value)}
                    type="button"
                    disabled={loading}
                    title={option.label}
                  >
                    <span className="filter-option-icon">
                      {TYPE_ICONS[option.value.toLowerCase()] || '◯'}
                    </span>
                    <span className="filter-option-text">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generation Filter */}
            <div className="filter-section">
              <label className="filter-section-title">Generación</label>
              <div className="filter-options">
                <button
                  className={`filter-option ${!selectedGeneration ? 'active' : ''}`}
                  onClick={() => onGenerationChange('')}
                  type="button"
                  disabled={loading}
                >
                  Todas
                </button>
                {generationOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`filter-option ${selectedGeneration === option.value ? 'active' : ''}`}
                    onClick={() => onGenerationChange(option.value)}
                    type="button"
                    disabled={loading}
                    title={option.label}
                  >
                    {translateGeneration(option.value, option.label)}
                  </button>
                ))}
              </div>
            </div>

            {/* Rarity Filter */}
            <div className="filter-section">
              <label className="filter-section-title">Rareza</label>
              <div className="filter-options">
                <button
                  className={`filter-option ${!selectedRarity ? 'active' : ''}`}
                  onClick={() => onRarityChange('')}
                  type="button"
                  disabled={loading}
                >
                  Todas
                </button>
                {['Común', 'Poco común', 'Raro', 'Muy raro', 'Legendario', 'Extremadamente raro'].map((rarity) => (
                  <button
                    key={rarity}
                    className={`filter-option ${selectedRarity === rarity ? 'active' : ''}`}
                    onClick={() => onRarityChange(rarity)}
                    type="button"
                    disabled={loading}
                  >
                    <span className="filter-option-icon">{RARITY_ICONS[rarity]}</span>
                    <span className="filter-option-text">{rarity}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Results summary */}
            <div className="filter-results-summary">
              <span>Resultados: <strong>{totalResults}</strong></span>
            </div>

            {/* Clear button */}
            {hasActiveFilters && (
              <button
                className="filter-clear-button"
                onClick={handleClear}
                type="button"
                disabled={loading}
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
