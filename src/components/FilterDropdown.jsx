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
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasActiveFilters = selectedType || selectedGeneration || selectedRarity

  function handleClear() {
    onClearFilters()
    setIsOpen(false)
  }

  return (
    <div className="filter-dropdown-container" ref={dropdownRef}>
      <button
        className="filter-dropdown-button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        title="Abrir filtros"
      >
        <span className="filter-icon">⚙️</span>
        {hasActiveFilters && <span className="filter-badge">{[selectedType, selectedGeneration, selectedRarity].filter(Boolean).length}</span>}
      </button>

      {isOpen && (
        <div className="filter-dropdown-menu">
          <div className="filter-dropdown-header">
            <h3>Filtros</h3>
            <button
              className="filter-close-btn"
              onClick={() => setIsOpen(false)}
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
                  className={`filter-option ${!selectedType ? 'active' : ''}`}
                  onClick={() => onTypeChange('')}
                  disabled={loading}
                >
                  Todos
                </button>
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`filter-option ${selectedType === option.value ? 'active' : ''}`}
                    onClick={() => onTypeChange(option.value)}
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
                  disabled={loading}
                >
                  Todas
                </button>
                {generationOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`filter-option ${selectedGeneration === option.value ? 'active' : ''}`}
                    onClick={() => onGenerationChange(option.value)}
                    disabled={loading}
                  >
                    {option.label}
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
                  disabled={loading}
                >
                  Todas
                </button>
                {['Común', 'Poco común', 'Raro', 'Muy raro', 'Legendario', 'Extremadamente raro'].map((rarity) => (
                  <button
                    key={rarity}
                    className={`filter-option ${selectedRarity === rarity ? 'active' : ''}`}
                    onClick={() => onRarityChange(rarity)}
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
