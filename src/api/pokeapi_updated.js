const API_BASE = 'https://pokeapi.co/api/v2'
const pokemonCache = new Map()
const typeCache = new Map()
const speciesCache = new Map()

/**
 * Fetches JSON from PokéAPI and surfaces a readable error when the request fails.
 */
async function requestJson(path) {
  const response = await fetch(`${API_BASE}${path}`)

  if (!response.ok) {
    throw new Error('No se pudo conectar con la PokéAPI.')
  }

  return response.json()
}

/**
 * Converts a slug into a human-readable title.
 */
export function formatDisplayName(value) {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

/**
 * Returns the best artwork URL available for a Pokémon entry.
 */
export function getPokemonArtworkUrl(pokemon) {
  return pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || ''
}

/**
 * Fetches and caches a single Pokémon detail payload.
 */
async function fetchPokemonDetail(name) {
  if (pokemonCache.has(name)) {
    return pokemonCache.get(name)
  }

  const data = await requestJson(`/pokemon/${encodeURIComponent(name)}`)
  pokemonCache.set(name, data)
  return data
}

/**
 * Loads detailed Pokémon records for a page of results in parallel.
 */
export async function fetchPokemonDetailsByNames(names) {
  return Promise.all(names.map((name) => fetchPokemonDetail(name)))
}

/**
 * Builds the full Pokédex catalog used by the listing and random search.
 */
export async function fetchPokemonCatalog() {
  const data = await requestJson('/pokemon?limit=2000&offset=0')
  return data.results.map((pokemon, index) => ({
    id: index + 1,
    name: pokemon.name,
    url: pokemon.url,
  }))
}

/**
 * Loads type options for the filter panel.
 */
export async function fetchPokemonTypeOptions() {
  const data = await requestJson('/type')

  return data.results
    .filter(({ name }) => !['unknown', 'shadow', 'stellar'].includes(name))
    .map(({ name }) => ({
      label: formatDisplayName(name),
      value: name,
    }))
}

/**
 * Loads generation options for the filter panel.
 */
export async function fetchPokemonGenerationOptions() {
  const data = await requestJson('/generation')

  return data.results.map(({ name }) => ({
    label: formatDisplayName(name),
    value: name,
  }))
}

/**
 * Returns every Pokémon name that matches a given type.
 */
export async function fetchPokemonNamesByType(typeName) {
  const data = await requestJson(`/type/${encodeURIComponent(typeName)}`)
  return data.pokemon.map(({ pokemon }) => pokemon.name)
}

/**
 * Returns every Pokémon species name that belongs to a generation.
 */
export async function fetchPokemonNamesByGeneration(generationName) {
  const data = await requestJson(`/generation/${encodeURIComponent(generationName)}`)
  return data.pokemon_species.map(({ name }) => name)
}

/**
 * Fetches and caches a type payload (damage_relations, etc.)
 */
export async function fetchTypeData(typeName) {
  if (typeCache.has(typeName)) return typeCache.get(typeName)
  const data = await requestJson(`/type/${encodeURIComponent(typeName)}`)
  typeCache.set(typeName, data)
  return data
}

/**
 * Fetches and caches a species payload (capture_rate, legendary flag, etc.)
 */
export async function fetchSpeciesData(speciesNameOrId) {
  if (speciesCache.has(speciesNameOrId)) return speciesCache.get(speciesNameOrId)
  const data = await requestJson(`/pokemon-species/${encodeURIComponent(speciesNameOrId)}`)
  speciesCache.set(speciesNameOrId, data)
  return data
}
