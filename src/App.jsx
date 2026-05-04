import { useEffect, useMemo, useRef, useState } from 'react'
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
import {
  REGIONS,
  fetchPokemonByRegion,
  fetchPokemonByLocation,
  fetchAllLocations,
} from './api/pokemon-details'
import FilterDropdown from './components/FilterDropdown'
import Pagination from './components/Pagination'
import PokemonGrid from './components/PokemonGrid'
import SearchPanel from './components/SearchPanel'
import PokemonModal from './components/PokemonModal'
import MoveDetail from './components/MoveDetail'
import AbilityDetail from './components/AbilityDetail'
import RegionPokemonItem from './components/RegionPokemonItem'

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

/**
 * Format raw location id (e.g. "cerulean-city-area") into a human friendly string
 */
function formatLocationName(raw) {
  if (!raw) return ''
  return raw
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map((w) => (w.length === 0 ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ')
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
  const [activePanel, setActivePanel] = useState(null) // 'pokemon' | 'moves' | 'abilities' | null
  const [abilitiesList, setAbilitiesList] = useState([])
  const [movesList, setMovesList] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [listFilter, setListFilter] = useState('')
  const [listPage, setListPage] = useState(1)
  const LIST_PAGE_SIZE = 40
  const [selectedListItem, setSelectedListItem] = useState(null) // { type, name, detail }
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [selectedPokemonName, setSelectedPokemonName] = useState(null) // for modal

  // Region & Location filter states
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [regionPokemon, setRegionPokemon] = useState([])
  const [locationPokemon, setLocationPokemon] = useState([])
  const [allLocations, setAllLocations] = useState([])

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

  // load moves/abilities when panel changes
  useEffect(() => {
    let active = true
    async function loadLists() {
      if (!activePanel) return
      try {
        setLoadingList(true)
        if (activePanel === 'moves' && movesList.length === 0) {
          const { fetchMoveList } = await import('./api/pokeapi')
          const m = await fetchMoveList()
          if (!active) return
          setMovesList(m || [])
        }
        if (activePanel === 'abilities' && abilitiesList.length === 0) {
          const { fetchAbilityList } = await import('./api/pokeapi')
          const a = await fetchAbilityList()
          if (!active) return
          setAbilitiesList(a || [])
        }
      } catch {
        // ignore
      } finally {
        if (active) setLoadingList(false)
      }
    }

    void loadLists()
    return () => {
      active = false
    }
  }, [activePanel, movesList.length, abilitiesList.length])

  // Load locations when regions panel opens
  useEffect(() => {
    if (activePanel !== 'regions') return

    let active = true

    async function loadLocations() {
      try {
        const locations = await fetchAllLocations()
        if (!active) return
        setAllLocations(locations)
      } catch {
        // ignore
      }
    }

    void loadLocations()
    return () => {
      active = false
    }
  }, [activePanel])

  // Load pokemon when region is selected
  useEffect(() => {
    if (!selectedRegion) {
      return
    }

    let active = true

    async function loadRegionPokemon() {
      try {
        const pokemonNames = await fetchPokemonByRegion(selectedRegion)
        if (!active) return
        setRegionPokemon(pokemonNames)
      } catch {
        if (active) setRegionPokemon([])
      }
    }

    void loadRegionPokemon()
    return () => {
      active = false
    }
  }, [selectedRegion])

  // Load pokemon when location is selected
  useEffect(() => {
    if (!selectedLocation) {
      return
    }

    let active = true

    async function loadLocationPokemon() {
      try {
        const pokemonNames = await fetchPokemonByLocation(selectedLocation)
        if (!active) return
        setLocationPokemon(pokemonNames)
      } catch {
        if (active) setLocationPokemon([])
      }
    }

    void loadLocationPokemon()
    return () => {
      active = false
    }
  }, [selectedLocation])

  /**
   * Opens a panel and resets list UI state
   */
  function openPanel(panelName) {
    setActivePanel(panelName)
    setListFilter('')
    setListPage(1)
    setSelectedListItem(null)
  }

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

  // Top-menu open state for accessible submenu toggles
  const [openTopMenu, setOpenTopMenu] = useState(null) // 'pokedex' | 'community' | null
  const navRef = useRef(null)
  const submenuRefs = useRef({ pokedex: null, community: null })

  function handleNavKeyDown(e) {
    if (!openTopMenu) return
    const submenu = submenuRefs.current[openTopMenu]
    if (!submenu) return

    const focusable = Array.from(
      submenu.querySelectorAll('button, a')
    ).filter((el) => !el.hasAttribute('disabled'))

    if (focusable.length === 0) return

    const activeIndex = focusable.indexOf(document.activeElement)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (activeIndex === -1) focusable[0].focus()
        else focusable[(activeIndex + 1) % focusable.length].focus()
        break
      case 'ArrowUp':
        e.preventDefault()
        if (activeIndex === -1) focusable[focusable.length - 1].focus()
        else focusable[(activeIndex - 1 + focusable.length) % focusable.length].focus()
        break
      case 'Home':
        e.preventDefault()
        focusable[0].focus()
        break
      case 'End':
        e.preventDefault()
        focusable[focusable.length - 1].focus()
        break
      case 'Escape': {
        e.preventDefault()
        setOpenTopMenu(null)
        // return focus to the toggle
        const toggle = navRef.current.querySelector('.menu-toggle[aria-expanded="true"]')
        toggle?.focus()
        break
      }
      case 'Enter':
        if (activeIndex >= 0) {
          e.preventDefault()
          focusable[activeIndex].click()
        }
        break
      default:
        break
    }
  }

  useEffect(() => {
    function onDocClick(e) {
      if (!navRef.current) return
      if (!navRef.current.contains(e.target)) {
        setOpenTopMenu(null)
      }
    }

    function onKey(e) {
      if (e.key === 'Escape') setOpenTopMenu(null)
    }

    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

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
          <div className="menu-lists-wrap">
            <nav ref={navRef} className="top-menu" aria-label="Main navigation">
              <ul onKeyDown={handleNavKeyDown}>
                <li className="has-submenu menu-item">
                  <button
                    type="button"
                    className="menu-toggle"
                    aria-expanded={openTopMenu === 'pokedex'}
                    aria-controls="menu-pokedex"
                    onClick={() => setOpenTopMenu(openTopMenu === 'pokedex' ? null : 'pokedex')}
                  >
                    Pokédex
                  </button>

                  <ul
                    id="menu-pokedex"
                    ref={(el) => (submenuRefs.current.pokedex = el)}
                    className="submenu generations"
                    data-open={openTopMenu === 'pokedex' ? 'true' : 'false'}
                    aria-hidden={openTopMenu === 'pokedex' ? 'false' : 'true'}
                  >
                    <li>
                      <button type="button" onClick={() => { setOpenTopMenu(null); openPanel('moves')}}>Lista de movimientos</button>
                      <button type="button" onClick={() => { setOpenTopMenu(null); openPanel('abilities')}}>Lista de habilidades</button>
                      <button type="button" onClick={() => { setOpenTopMenu(null); openPanel('regions')}}>Regiones y Localidades</button>
                    </li>
                  </ul>
                </li>

                <li className="has-submenu menu-item">
                  <button
                    type="button"
                    className="menu-toggle"
                    aria-expanded={openTopMenu === 'community'}
                    aria-controls="menu-community"
                    onClick={() => setOpenTopMenu(openTopMenu === 'community' ? null : 'community')}
                  >
                    Comunidad
                  </button>

                  <ul
                    id="menu-community"
                    ref={(el) => (submenuRefs.current.community = el)}
                    className="submenu"
                    data-open={openTopMenu === 'community' ? 'true' : 'false'}
                    aria-hidden={openTopMenu === 'community' ? 'false' : 'true'}
                  >
                    <li><a href="https://www.reddit.com/r/pokemon/" target="_blank" rel="noreferrer">Foros</a></li>
                    <li><a href="https://discord.com/invite/pokemon" target="_blank" rel="noreferrer">Discord</a></li>
                  </ul>
                </li>

                <li><a href="https://bulbapedia.bulbagarden.net/" target="_blank" rel="noreferrer">Guías</a></li>
              </ul>
            </nav>

            {/* Panel area for lists triggered by the top-menu */}
            {activePanel && (
              <div className="lists-panel panel" role="dialog" aria-label="Panel de listas">
                <div className="lists-panel__head">
                  <div className="lists-panel__title">
                    <h2>
                      {activePanel === 'pokemon' && '🔍 Pokémon'}
                      {activePanel === 'moves' && '⚡ Movimientos'}
                      {activePanel === 'abilities' && '✨ Habilidades'}
                      {activePanel === 'regions' && '🌍 Regiones y Localidades'}
                    </h2>
                  </div>
                  <button
                    className="lists-panel__close"
                    onClick={() => {
                      setActivePanel(null)
                      setSelectedListItem(null)
                    }}
                    title="Cerrar panel"
                  >
                    ✕
                  </button>
                </div>

                <div className="lists-panel__body">
                  {loadingList ? (
                    <p>Cargando...</p>
                  ) : (
                    <>
                      {selectedListItem && activePanel === 'regions' && (
                        <div className="region-pokemon-detail">
                          <button 
                            className="region-pokemon-close"
                            onClick={() => setSelectedListItem(null)}
                            title="Cerrar"
                          >
                            ✕
                          </button>
                          <h3>{selectedListItem.name}</h3>
                          <img
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/pokemon/other/official-artwork/${selectedListItem.name}.png`}
                            alt={selectedListItem.name}
                            className="region-pokemon-image"
                            onError={(e) => {
                              e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/pokemon/${selectedListItem.name}.png`
                            }}
                          />
                        </div>
                      )}
                      {selectedListItem && activePanel !== 'regions' && (
                        <div className="lists-panel__detail">
                          <div className="lists-panel__detail-head">
                            <h3>{selectedListItem.name}</h3>
                            <button onClick={() => setSelectedListItem(null)}>Cerrar</button>
                          </div>
                          {activePanel === 'moves' && <MoveDetail move={selectedListItem.detail} />}
                          {activePanel === 'abilities' && <AbilityDetail ability={selectedListItem.detail} />}
                        </div>
                      )}

                      <div className="lists-panel__items">
                        {activePanel === 'regions' && (
                          <div className="region-filters">
                            <div className="region-filter-group">
                              <label className="region-filter-label">Región:</label>
                              <select
                                value={selectedRegion}
                                onChange={(e) => {
                                  setSelectedRegion(e.target.value)
                                  setSelectedLocation('')
                                  setListFilter('')
                                  setListPage(1)
                                }}
                                className="region-filter-select"
                              >
                                <option value="">Todas las regiones</option>
                                {REGIONS.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="region-filter-group">
                              <label className="region-filter-label">Localidad:</label>
                              <div className="region-location-input-wrap">
                                <input
                                  type="text"
                                  value={locationQuery}
                                  onChange={(e) => {
                                    setLocationQuery(e.target.value)
                                    setLocationDropdownOpen(true)
                                  }}
                                  onFocus={() => setLocationDropdownOpen(true)}
                                  placeholder="Busca o selecciona una localidad..."
                                  className="region-filter-select"
                                />

                                {locationDropdownOpen && (
                                  <ul className="region-locations-dropdown" role="listbox">
                                    <li
                                      className="region-location-item"
                                      onClick={() => {
                                        setSelectedLocation('')
                                        setLocationQuery('')
                                        setLocationDropdownOpen(false)
                                        setListPage(1)
                                      }}
                                    >
                                      Todas las localidades
                                    </li>
                                    {allLocations
                                      .filter((l) =>
                                        formatLocationName(l).toLowerCase().includes((locationQuery || '').toLowerCase()),
                                      )
                                      .slice(0, 100)
                                      .map((loc) => (
                                        <li
                                          key={loc}
                                          className="region-location-item"
                                          onClick={() => {
                                            setSelectedLocation(loc)
                                            setLocationQuery(formatLocationName(loc))
                                            setLocationDropdownOpen(false)
                                            setListPage(1)
                                          }}
                                        >
                                          {formatLocationName(loc)}
                                        </li>
                                      ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="lists-panel__filter-section">
                          <label className="lists-panel__filter-label">Filtrar:</label>
                          <input
                            type="search"
                            className="lists-panel__filter-input"
                            placeholder="Escribe para filtrar..."
                            value={listFilter}
                            onChange={(e) => {
                              setListFilter(e.target.value)
                              setListPage(1)
                            }}
                          />
                        </div>

                        <ul className="lists-panel__list">
                          {(() => {
                            let currentArray =
                              activePanel === 'pokemon'
                                ? catalog.map((p) => p.name)
                                : activePanel === 'moves'
                                ? movesList
                                : activePanel === 'abilities'
                                ? abilitiesList
                                : activePanel === 'regions'
                                ? selectedRegion
                                  ? regionPokemon
                                  : selectedLocation
                                  ? locationPokemon
                                  : catalog.map((p) => p.name)
                                : []

                            const lowerFilter = (listFilter || '').toLowerCase()
                            const filtered = currentArray.filter((n) => (n || '').toLowerCase().includes(lowerFilter))
                            const total = Math.max(1, Math.ceil(filtered.length / LIST_PAGE_SIZE))
                            const page = Math.min(listPage, total)
                            const start = (page - 1) * LIST_PAGE_SIZE
                            const slice = filtered.slice(start, start + LIST_PAGE_SIZE)

                            if (slice.length === 0) {
                              return (
                                <li className="lists-panel__empty">No se encontraron resultados para ese filtro.</li>
                              )
                            }

                            if (activePanel === 'regions') {
                              return slice.map((name) => (
                                <RegionPokemonItem
                                  key={name}
                                  pokemonName={name}
                                />
                              ))
                            }

                            return slice.map((name) => (
                              <li key={name} className="lists-panel__list-item">
                                <div className="lists-panel__item-head">
                                  <button
                                    className="lists-panel__item-link"
                                    type="button"
                                    onClick={async () => {
                                      if (activePanel === 'pokemon') {
                                        setSelectedPokemonName(name)
                                        return
                                      }

                                      if (activePanel === 'regions') {
                                        setSelectedListItem({ type: 'pokemon', name })
                                        return
                                      }

                                      try {
                                        setLoadingDetail(true)

                                        if (activePanel === 'moves') {
                                          const { fetchMoveDetail } = await import('./api/pokeapi')
                                          const d = await fetchMoveDetail(name)
                                          setSelectedListItem({ type: 'movimiento', name, detail: d })
                                        } else {
                                          const { fetchAbilityDetail } = await import('./api/pokeapi')
                                          const d = await fetchAbilityDetail(name)
                                          setSelectedListItem({ type: 'habilidad', name, detail: d })
                                        }
                                      } catch {
                                        // ignore
                                      } finally {
                                        setLoadingDetail(false)
                                      }
                                    }}
                                  >
                                    {name}
                                  </button>

                                  <button
                                    className="lists-panel__item-toggle"
                                    type="button"
                                    onClick={async () => {
                                      if (activePanel === 'pokemon') {
                                        setSelectedPokemonName(name)
                                        return
                                      }

                                      if (activePanel === 'regions') {
                                        setSelectedListItem({ type: 'pokemon', name })
                                        return
                                      }

                                      try {
                                        setLoadingDetail(true)

                                        if (activePanel === 'moves') {
                                          const { fetchMoveDetail } = await import('./api/pokeapi')
                                          const d = await fetchMoveDetail(name)
                                          setSelectedListItem({ type: 'movimiento', name, detail: d })
                                        } else {
                                          const { fetchAbilityDetail } = await import('./api/pokeapi')
                                          const d = await fetchAbilityDetail(name)
                                          setSelectedListItem({ type: 'habilidad', name, detail: d })
                                        }
                                      } catch {
                                        // ignore
                                      } finally {
                                        setLoadingDetail(false)
                                      }
                                    }}
                                    aria-label={`Ver detalles de ${name}`}
                                  >
                                    →
                                  </button>
                                </div>
                              </li>
                            ))
                          })()}
                        </ul>

                        <div className="lists-panel__pagination">
                          <button
                            type="button"
                            onClick={() => setListPage((p) => Math.max(1, p - 1))}
                            disabled={listPage <= 1}
                          >
                            ← Anterior
                          </button>
                          <span className="lists-panel__page">{listPage}</span>
                          <button
                            type="button"
                            onClick={() => setListPage((p) => p + 1)}
                          >
                            Siguiente →
                          </button>
                        </div>

                        {loadingDetail && <p className="lists-panel__loading">Cargando ficha...</p>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="standalone-filter">
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

          <SearchPanel
            loading={loadingCatalog || loadingPage || showFilterLoading}
            onRandomPokemon={handleRandomPokemon}
            onSearchInputChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            searchInput={searchInput}
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

      {selectedPokemonName && (
        <PokemonModal pokemonName={selectedPokemonName} onClose={() => setSelectedPokemonName(null)} />
      )}
    </main>
  )
}

export default App







