/**
 * Filter panel for narrowing the Pokédex by type and generation.
 */
export default function FiltersPanel({
  generationOptions,
  onClearFilters,
  onGenerationChange,
  onTypeChange,
  selectedGeneration,
  selectedType,
  typeOptions,
  loading,
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Filtros</p>
          <h2>Reduce la lista</h2>
          <p className="panel-subtitle">
            Combina un tipo con una generación para acotar la Pokédex.
          </p>
        </div>
        <button type="button" className="ghost" onClick={onClearFilters}>
          Limpiar filtros
        </button>
      </div>

      <div className="filters-grid">
        <label className="field">
          <span>Tipo</span>
          <select
            value={selectedType}
            onChange={(event) => onTypeChange(event.target.value)}
            disabled={loading}
          >
            <option value="">Todos los tipos</option>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Generación</span>
          <select
            value={selectedGeneration}
            onChange={(event) => onGenerationChange(event.target.value)}
            disabled={loading}
          >
            <option value="">Todas las generaciones</option>
            {generationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}
