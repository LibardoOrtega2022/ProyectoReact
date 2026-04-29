/**
 * Builds a compact page selector with ellipses for large result sets.
 */
function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) {
    items.push('...-start')
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page)
  }

  if (end < totalPages - 1) {
    items.push('...-end')
  }

  items.push(totalPages)
  return items
}

/**
 * Pagination controls for browsing the current Pokédex page.
 */
export default function Pagination({ currentPage, onPageChange, totalPages }) {
  if (totalPages <= 1) {
    return null
  }

  const pageItems = buildPageItems(currentPage, totalPages)

  return (
    <nav className="pagination" aria-label="Paginación de resultados">
      <button type="button" className="pagination__nav" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Anterior
      </button>

      {pageItems.map((item) =>
        typeof item === 'string' ? (
          <span key={item} className="pagination__ellipsis">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={item === currentPage ? 'pagination__page pagination__page--active' : 'pagination__page'}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        )
      )}

      <button type="button" className="pagination__nav" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Siguiente
      </button>
    </nav>
  )
}
