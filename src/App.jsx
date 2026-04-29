import { useEffect, useState } from 'react'
import './App.css'
import {
  fetchPokemonCatalog,
  fetchPokemonDetailsByNames,
  fetchPokemonGenerationOptions,
  fetchPokemonNamesByGeneration,
  fetchPokemonNamesByType,
  fetchPokemonTypeOptions,
} from './api/pokeapi'
import FiltersPanel from './components/FiltersPanel'
import Pagination from './components/Pagination'
import PokemonGrid from './components/PokemonGrid'
import SearchPanel from './components/SearchPanel'

const PAGE_SIZE = 12

function buildFilteredNames(
  catalog,
  searchTerm,
  selectedType,
  typeMatches,
  selectedGeneration,
  generationMatches,
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
  const [typeMatches, setTypeMatches] = useState(null)
  const [generationMatches, setGenerationMatches] = useState(null)
  const [pagePokemon, setPagePokemon] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [loadingFilters, setLoadingFilters] = useState(false)
  const [loadingPage, setLoadingPage] = useState(false)
  const [error, setError] = useState('')

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
      if (!selectedType && !selectedGeneration) {
        setTypeMatches(null)
        setGenerationMatches(null)
        setLoadingFilters(false)
        return
      }

      setLoadingFilters(true)

      try {
        const [nextTypeMatches, nextGenerationMatches] = await Promise.all([
          selectedType ? fetchPokemonNamesByType(selectedType) : Promise.resolve(null),
          selectedGeneration
            ? fetchPokemonNamesByGeneration(selectedGeneration)
            : Promise.resolve(null),
        ])

        if (!active) {
          return
        }

        setTypeMatches(nextTypeMatches)
        setGenerationMatches(nextGenerationMatches)
        setError('')
      } catch (cause) {
        if (!active) {
          return
        }

        setTypeMatches(selectedType ? [] : null)
        setGenerationMatches(selectedGeneration ? [] : null)
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
  }, [selectedType, selectedGeneration])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedType, selectedGeneration])

  const filteredNames = buildFilteredNames(
    catalog,
    searchTerm,
    selectedType,
    typeMatches,
    selectedGeneration,
    generationMatches,
  )
  const filteredNamesKey = filteredNames.join('|')
  const totalResults = filteredNames.length
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE))
  const filtersPending =
    (selectedType && typeMatches === null) || (selectedGeneration && generationMatches === null)

  useEffect(() => {
    if (loadingCatalog || filtersPending) {
      setLoadingPage(false)
      setPagePokemon([])
      return
    }

    const startIndex = (currentPage - 1) * PAGE_SIZE
    const namesForPage = filteredNames.slice(startIndex, startIndex + PAGE_SIZE)

    if (namesForPage.length === 0) {
      setLoadingPage(false)
      setPagePokemon([])
      return
    }

    let active = true
    setLoadingPage(true)
    setError('')

    async function loadPagePokemon() {
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
  }, [catalog, currentPage, filteredNamesKey, filtersPending, loadingCatalog])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  function handleSearchSubmit(event) {
    event.preventDefault()
    setSearchTerm(searchInput.trim().toLowerCase())
    setCurrentPage(1)
  }

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
    setCurrentPage(1)
  }

  function handleClearFilters() {
    setSearchInput('')
    setSearchTerm('')
    setSelectedType('')
    setSelectedGeneration('')
    setTypeMatches(null)
    setGenerationMatches(null)
    setCurrentPage(1)
    setError('')
  }

  function handlePageChange(nextPage) {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages)
    setCurrentPage(safePage)
  }

  return (
    <main className="app-shell">
      <section className="pokedex-app">
        <SearchPanel
          loading={loadingCatalog || loadingFilters || loadingPage}
          onRandomPokemon={handleRandomPokemon}
          onSearchInputChange={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          searchInput={searchInput}
          totalResults={totalResults}
        />

        <div className="controls-grid">
          <FiltersPanel
            generationOptions={generationOptions}
            loading={loadingCatalog || loadingFilters}
            onClearFilters={handleClearFilters}
            onGenerationChange={setSelectedGeneration}
            onTypeChange={setSelectedType}
            selectedGeneration={selectedGeneration}
            selectedType={selectedType}
            typeOptions={typeOptions}
          />

          <section className="panel panel--summary">
            <p className="eyebrow">Estado</p>
            <h2>{error ? 'Hay un problema' : 'Tu Pokédex está lista'}</h2>
            <p className="panel-subtitle">
              {error ||
                'Usa la búsqueda para encontrar un Pokémon y combina tipo o generación para afinar la lista.'}
            </p>
            <div className="status-cards">
              <div>
                <span>Pokémon cargados</span>
                <strong>{catalog.length.toLocaleString('es-ES')}</strong>
              </div>
              <div>
                <span>Resultados visibles</span>
                <strong>{totalResults.toLocaleString('es-ES')}</strong>
              </div>
            </div>
          </section>
        </div>

        <PokemonGrid
          currentPage={currentPage}
          loading={loadingCatalog || loadingPage}
          loadingFilters={loadingFilters}
          pagePokemon={pagePokemon}
          totalPages={totalPages}
          totalResults={totalResults}
        />

        <Pagination currentPage={currentPage} onPageChange={handlePageChange} totalPages={totalPages} />
      </section>
    </main>
  )
}

export default App
