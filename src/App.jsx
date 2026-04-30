import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  fetchPokemonCatalog,
  fetchPokemonDetailsByNames,
  fetchPokemonGenerationOptions,
  fetchPokemonNamesByGeneration,
  fetchPokemonNamesByRarity,
  fetchPokemonNamesByType,
  fetchPokemonTypeOptions,
} from './api/pokeapi'
import FilterDropdown from './components/FilterDropdown'
import Pagination from './components/Pagination'
import PokemonGrid from './components/PokemonGrid'
import SearchPanel from './components/SearchPanel'

const PAGE_SIZE = 12

function intersectNames(sourceNames, allowedNames) {
  const allowed = new Set(allowedNames)
  return sourceNames.filter((name) => allowed.has(name))
}

/**
 * Combines search text and active filters into the list of visible Pokémon names.
 */
function buildFilteredNames(
  catalog,
  searchTerm,
  selectedType,
  typeMatches,
  selectedGeneration,
  generationMatches,
  selectedRarity,
  rarityMatches,
) {
  let filteredNames = catalog.map((pokemon) => pokemon.name)

  if (searchTerm) {
    filteredNames = filteredNames.filter((name) => name.includes(searchTerm))
  }

  if (selectedType) {
    if (typeMatches === null) {
      return []
    }

    const typeMatchSet = new Set(typeMatches)
    filteredNames = filteredNames.filter((name) => typeMatchSet.has(name))
  }

  if (selectedGeneration) {
    if (generationMatches === null) {
      return []
    }

    const generationMatchSet = new Set(generationMatches)
    filteredNames = filteredNames.filter((name) => generationMatchSet.has(name))
  }

  if (selectedRarity) {
    if (rarityMatches === null) {
      return []
    }

    const rarityMatchSet = new Set(rarityMatches)
    filteredNames = filteredNames.filter((name) => rarityMatchSet.has(name))
  }

  return filteredNames
}

function App() {
  const [catalog, setCatalog] = useState([])
  const [typeOptions, setTypeOptions] = useState([])
  const [generationOptions, setGenerationOptions] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedGeneration, setSelectedGeneration] = useState('')
  const [selectedRarity, setSelectedRarity] = useState('')
  const [typeMatches, setTypeMatches] = useState(null)
  const [generationMatches, setGenerationMatches] = useState(null)
  const [rarityMatches, setRarityMatches] = useState(null)
  const [pagePokemon, setPagePokemon] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [loadingFilters, setLoadingFilters] = useState(false)
  const [loadingPage, setLoadingPage] = useState(false)
  const [showFilterLoading, setShowFilterLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowFilterLoading(loadingFilters)
    }, 180)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [loadingFilters])

  useEffect(() => {
    let active = true

    async function loadInitialData() {
      setLoadingCatalog(true)
      setError('')

      try {
        const [catalogData, typeData, generationData] = await Promise.all([
          fetchPokemonCatalog(),
          fetchPokemonTypeOptions(),
          fetchPokemonGenerationOptions(),
        ])

        if (!active) {
          return
        }

        setCatalog(catalogData)
        setTypeOptions(typeData)
        setGenerationOptions(generationData)
      } catch (cause) {
        if (!active) {
          return
        }

        setError(cause instanceof Error ? cause.message : 'No se pudo cargar la Pokédex.')
      } finally {
        if (active) {
          setLoadingCatalog(false)
        }
      }
    }

    void loadInitialData()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadFilterMatches() {
      if (!selectedType && !selectedGeneration && !selectedRarity) {
        setTypeMatches(null)
        setGenerationMatches(null)
        setRarityMatches(null)
        setLoadingFilters(false)
        return
      }

      setLoadingFilters(true)

      try {
        const catalogNames = catalog.map((pokemon) => pokemon.name)
        const searchedNames = searchTerm
          ? catalogNames.filter((name) => name.includes(searchTerm))
          : catalogNames

        const [nextTypeMatches, nextGenerationMatches] = await Promise.all([
          selectedType ? fetchPokemonNamesByType(selectedType) : Promise.resolve(null),
          selectedGeneration
            ? fetchPokemonNamesByGeneration(selectedGeneration)
            : Promise.resolve(null),
        ])

        let rarityBaseNames = searchedNames
        if (selectedType && nextTypeMatches) {
          rarityBaseNames = intersectNames(rarityBaseNames, nextTypeMatches)
        }
        if (selectedGeneration && nextGenerationMatches) {
          rarityBaseNames = intersectNames(rarityBaseNames, nextGenerationMatches)
        }

        const nextRarityMatches = selectedRarity
          ? await fetchPokemonNamesByRarity(rarityBaseNames, selectedRarity)
          : null

        if (!active) {
          return
        }

        setTypeMatches(nextTypeMatches)
        setGenerationMatches(nextGenerationMatches)
        setRarityMatches(nextRarityMatches)
        setError('')
      } catch (cause) {
        if (!active) {
          return
        }

        setTypeMatches(selectedType ? [] : null)
        setGenerationMatches(selectedGeneration ? [] : null)
        setRarityMatches(selectedRarity ? [] : null)
        setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los filtros.')
      } finally {
        if (active) {
          setLoadingFilters(false)
        }
      }
    }

    void loadFilterMatches()

    return () => {
      active = false
    }
  }, [catalog, searchTerm, selectedType, selectedGeneration, selectedRarity])

  const filteredNames = useMemo(
    () =>
      buildFilteredNames(
        catalog,
        searchTerm,
        selectedType,
        typeMatches,
        selectedGeneration,
        generationMatches,
        selectedRarity,
        rarityMatches,
      ),
    [
      catalog,
      generationMatches,
      rarityMatches,
      searchTerm,
      selectedGeneration,
      selectedRarity,
      selectedType,
      typeMatches,
    ],
  )

  const totalResults = filteredNames.length
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const filtersPending =
    (selectedType && typeMatches === null) ||
    (selectedGeneration && generationMatches === null) ||
    (selectedRarity && rarityMatches === null)

  useEffect(() => {
    if (loadingCatalog || filtersPending) {
      return
    }

    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE
    const namesForPage = filteredNames.slice(startIndex, startIndex + PAGE_SIZE)

    if (namesForPage.length === 0) {
      return
    }

    let active = true

    async function loadPagePokemon() {
      setLoadingPage(true)
      setError('')

      try {
        const details = await fetchPokemonDetailsByNames(namesForPage)

        if (!active) {
          return
        }

        setPagePokemon(details)
      } catch (cause) {
        if (!active) {
          return
        }

        setPagePokemon([])
        setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los Pokémon.')
      } finally {
        if (active) {
          setLoadingPage(false)
        }
      }
    }

    void loadPagePokemon()

    return () => {
      active = false
    }
  }, [filteredNames, filtersPending, loadingCatalog, safeCurrentPage])

  /**
   * Applies the current text query as the active search term.
   */
  function handleSearchSubmit(event) {
    event.preventDefault()
    setSearchTerm(searchInput.trim().toLowerCase())
    setCurrentPage(1)
  }

  /**
   * Picks a random Pokémon from the loaded catalog and resets the filters.
   */
  function handleRandomPokemon() {
    if (catalog.length === 0) {
      return
    }

    const randomPokemon = catalog[Math.floor(Math.random() * catalog.length)]
    setError('')
    setSearchInput(randomPokemon.name)
    setSearchTerm(randomPokemon.name)
    setSelectedType('')
    setSelectedGeneration('')
    setTypeMatches(null)
    setGenerationMatches(null)
    setRarityMatches(null)
    setSelectedRarity('')
    setCurrentPage(1)
  }

  /**
   * Clears the search term and every active filter in one step.
   */
  function handleClearFilters() {
    setSearchInput('')
    setSearchTerm('')
    setSelectedType('')
    setSelectedGeneration('')
    setSelectedRarity('')
    setTypeMatches(null)
    setGenerationMatches(null)
    setRarityMatches(null)
    setCurrentPage(1)
    setError('')
  }

  /**
   * Updates the selected type and clears the current results view.
   */
  function handleTypeChange(nextType) {
    setSelectedType(nextType)
    setCurrentPage(1)
  }

  /**
   * Updates the selected generation and clears the current results view.
   */
  function handleGenerationChange(nextGeneration) {
    setSelectedGeneration(nextGeneration)
    setCurrentPage(1)
  }

  /**
   * Updates the selected rarity and clears the current results view.
   */
  function handleRarityChange(nextRarity) {
    setSelectedRarity(nextRarity)
    setCurrentPage(1)
  }

  /**
   * Clamps the requested page number to the available page range.
   */
  function handlePageChange(nextPage) {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages)
    setCurrentPage(safePage)
  }

  return (
    <main className="app-shell">
      <section className="pokedex-app">
        <div className="pokedex-header">
          <SearchPanel
            loading={loadingCatalog || loadingPage || showFilterLoading}
            onRandomPokemon={handleRandomPokemon}
            onSearchInputChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            searchInput={searchInput}
            totalResults={totalResults}
          />

          <FilterDropdown
            generationOptions={generationOptions}
            loading={loadingCatalog || showFilterLoading}
            onClearFilters={handleClearFilters}
            onGenerationChange={handleGenerationChange}
            onRarityChange={handleRarityChange}
            onTypeChange={handleTypeChange}
            selectedGeneration={selectedGeneration}
            selectedRarity={selectedRarity}
            selectedType={selectedType}
            typeOptions={typeOptions}
            totalResults={totalResults}
          />
        </div>

        <PokemonGrid
          currentPage={safeCurrentPage}
          loading={loadingCatalog || loadingPage}
          loadingFilters={showFilterLoading}
          pagePokemon={pagePokemon}
          totalPages={totalPages}
          totalResults={totalResults}
        />

        <Pagination currentPage={safeCurrentPage} onPageChange={handlePageChange} totalPages={totalPages} />

        <footer className="site-footer panel">
          <div className="site-footer__brand">
            <p className="eyebrow">Entrenador digital</p>
            <h2>Pokédex Atlas</h2>
            <p>
              {error
                ? `Estado: ${error}`
                : `Catalogo activo: ${catalog.length.toLocaleString('es-ES')} Pokemon.`}
            </p>
          </div>

          <div className="site-footer__social" aria-label="Redes sociales">
            <a
              href="https://www.instagram.com/pokemon"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram de Pokemon"
            >
              IG
            </a>
            <a href="https://x.com/Pokemon" target="_blank" rel="noreferrer" aria-label="X de Pokemon">
              X
            </a>
            <a
              href="https://www.youtube.com/@pokemon"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube de Pokemon"
            >
              YT
            </a>
            <a
              href="https://github.com/PokeAPI/pokeapi"
              target="_blank"
              rel="noreferrer"
              aria-label="Repositorio de PokeAPI"
            >
              GH
            </a>
          </div>

          <p className="site-footer__copy">© 2026 Pokédex Atlas. Datos provistos por PokéAPI.</p>
        </footer>
      </section>
    </main>
  )
}

export default App
