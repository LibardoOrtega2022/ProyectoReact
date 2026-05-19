import { useEffect, useRef } from 'react'

export default function FilterDrawer({
  open,
  onClose,
  generationOptions = [],
  typeOptions = [],
  loading = false,
  selectedType,
  selectedGeneration,
  selectedRarity,
  onTypeChange,
  onGenerationChange,
  onRarityChange,
  onClearFilters,
  totalResults,
}) {
  const firstRef = useRef(null)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => firstRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  if (!open) return null

  return (
    <>
      <div className="filter-drawer__backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="filter-drawer" role="dialog" aria-modal="true" aria-label="Filtros">
      <div className="filter-drawer__inner">
        <div className="filter-drawer__head">
          <h3>Filtros</h3>
          <button className="filter-drawer__close" onClick={onClose} aria-label="Cerrar filtros">✕</button>
        </div>

        <div className="filter-drawer__section">
          <label>Tipo</label>
          <div className="filter-drawer__options">
            <button ref={firstRef} className={!selectedType ? 'active' : ''} onClick={() => onTypeChange('')} disabled={loading}>Todos</button>
            {typeOptions.map((t) => (
              <button key={t.value} className={selectedType === t.value ? 'active' : ''} onClick={() => onTypeChange(t.value)} disabled={loading}>{t.label}</button>
            ))}
          </div>
        </div>

        <div className="filter-drawer__section">
          <label>Generación</label>
          <div className="filter-drawer__options">
            <button className={!selectedGeneration ? 'active' : ''} onClick={() => onGenerationChange('')} disabled={loading}>Todas</button>
            {generationOptions.map((g) => (
              <button key={g.value} className={selectedGeneration === g.value ? 'active' : ''} onClick={() => onGenerationChange(g.value)} disabled={loading}>{g.label}</button>
            ))}
          </div>
        </div>

        <div className="filter-drawer__section">
          <label>Rareza</label>
          <div className="filter-drawer__options">
            <button className={!selectedRarity ? 'active' : ''} onClick={() => onRarityChange('')} disabled={loading}>Todas</button>
            {['Común', 'Poco común', 'Raro', 'Muy raro', 'Legendario', 'Extremadamente raro'].map((r) => (
              <button key={r} className={selectedRarity === r ? 'active' : ''} onClick={() => onRarityChange(r)} disabled={loading}>{r}</button>
            ))}
          </div>
        </div>

        <div className="filter-drawer__footer">
          <div>Resultados: <strong>{totalResults}</strong></div>
          <div className="filter-drawer__actions">
            <button onClick={onClearFilters} disabled={loading}>Limpiar</button>
            <button onClick={onClose}>Aplicar</button>
          </div>
        </div>
      </div>
      </aside>
    </>
  )
}
