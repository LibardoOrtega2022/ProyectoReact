import { useEffect, useMemo, useState } from 'react'
import {
  fetchPokemonCatalog,
  fetchPokemonTypeOptions,
  fetchPokemonGenerationOptions,
  fetchPokemonNamesByType,
  fetchPokemonNamesByGeneration,
  fetchPokemonNamesByRarity,
} from '../api/pokeapi'

function intersectNames(sourceNames, allowedNames) {
  const allowed = new Set(allowedNames)
  return sourceNames.filter((name) => allowed.has(name))
}

export default function useCatalogAndFilters(pageSize = 12) {
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

  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [loadingFilters, setLoadingFilters] = useState(false)
  const [showFilterLoading, setShowFilterLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowFilterLoading(loadingFilters)
    }, 180)

    return () => clearTimeout(timeoutId)
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

        if (!active) return

        setCatalog(catalogData)
        setTypeOptions(typeData)
        setGenerationOptions(generationData)
      } catch (cause) {
        if (!active) return
        setError(cause instanceof Error ? cause.message : 'No se pudo cargar la Pokédex.')
      } finally {
        if (active) setLoadingCatalog(false)
      }
    }

    void loadInitialData()

    return () => {
      active = false
    }
  }, [])

  // Load filter matches when any filter/search changes
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
          selectedGeneration ? fetchPokemonNamesByGeneration(selectedGeneration) : Promise.resolve(null),
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

        if (!active) return

        setTypeMatches(nextTypeMatches)
        setGenerationMatches(nextGenerationMatches)
        setRarityMatches(nextRarityMatches)
        setError('')
      } catch (cause) {
        if (!active) return

        setTypeMatches(selectedType ? [] : null)
        setGenerationMatches(selectedGeneration ? [] : null)
        setRarityMatches(selectedRarity ? [] : null)
        setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los filtros.')
      } finally {
        if (active) setLoadingFilters(false)
      }
    }

    void loadFilterMatches()

    return () => {
      active = false
    }
  }, [catalog, searchTerm, selectedType, selectedGeneration, selectedRarity])

  const filteredNames = useMemo(() => {
    let names = catalog.map((p) => p.name)

    if (searchTerm) names = names.filter((n) => n.includes(searchTerm))

    if (selectedType) {
      if (typeMatches === null) return []
      const setA = new Set(typeMatches)
      names = names.filter((n) => setA.has(n))
    }

    if (selectedGeneration) {
      if (generationMatches === null) return []
      const setG = new Set(generationMatches)
      names = names.filter((n) => setG.has(n))
    }

    if (selectedRarity) {
      if (rarityMatches === null) return []
      const setR = new Set(rarityMatches)
      names = names.filter((n) => setR.has(n))
    }

    return names
  }, [catalog, searchTerm, selectedType, typeMatches, selectedGeneration, generationMatches, selectedRarity, rarityMatches])

  const totalResults = filteredNames.length
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize))
  const filtersPending =
    (selectedType && typeMatches === null) ||
    (selectedGeneration && generationMatches === null) ||
    (selectedRarity && rarityMatches === null)

  function handleRandomPokemon() {
    if (catalog.length === 0) return null
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

    return randomPokemon.name
  }

  function handleClearFilters() {
    setSearchInput('')
    setSearchTerm('')
    setSelectedType('')
    setSelectedGeneration('')
    setSelectedRarity('')
    setTypeMatches(null)
    setGenerationMatches(null)
    setRarityMatches(null)
    setError('')
  }

  function handleTypeChange(nextType) {
    setSelectedType(nextType)
  }

  function handleGenerationChange(nextGeneration) {
    setSelectedGeneration(nextGeneration)
  }

  function handleRarityChange(nextRarity) {
    setSelectedRarity(nextRarity)
  }

  return {
    catalog,
    typeOptions,
    generationOptions,
    searchInput,
    setSearchInput,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    selectedGeneration,
    setSelectedGeneration,
    selectedRarity,
    setSelectedRarity,
    typeMatches,
    generationMatches,
    rarityMatches,
    loadingCatalog,
    loadingFilters,
    showFilterLoading,
    error,
    filteredNames,
    totalResults,
    totalPages,
    filtersPending,
    handleRandomPokemon,
    handleClearFilters,
    handleTypeChange,
    handleGenerationChange,
    handleRarityChange,
  }
}
