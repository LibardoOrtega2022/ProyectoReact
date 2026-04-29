const API_BASE = 'https://pokeapi.co/api/v2'
const pokemonCache = new Map()

async function requestJson(path) {
  const response = await fetch(`${API_BASE}${path}`)

  if (!response.ok) {
    throw new Error('No se pudo conectar con la PokéAPI.')
  }

  return response.json()
}

export function formatDisplayName(value) {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function getPokemonArtworkUrl(pokemon) {
  return pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || ''
}

async function fetchPokemonDetail(name) {
  if (pokemonCache.has(name)) {
    return pokemonCache.get(name)
  }

  const data = await requestJson(`/pokemon/${encodeURIComponent(name)}`)
  pokemonCache.set(name, data)
  return data
}

export async function fetchPokemonDetailsByNames(names) {
  return Promise.all(names.map((name) => fetchPokemonDetail(name)))
}

export async function fetchPokemonCatalog() {
  const data = await requestJson('/pokemon?limit=2000&offset=0')
  return data.results.map((pokemon, index) => ({
    id: index + 1,
    name: pokemon.name,
    url: pokemon.url,
  }))
}

export async function fetchPokemonTypeOptions() {
  const data = await requestJson('/type')

  return data.results
    .filter(({ name }) => !['unknown', 'shadow'].includes(name))
    .map(({ name }) => ({
      label: formatDisplayName(name),
      value: name,
    }))
}

export async function fetchPokemonGenerationOptions() {
  const data = await requestJson('/generation')

  return data.results.map(({ name }) => ({
    label: formatDisplayName(name),
    value: name,
  }))
}

export async function fetchPokemonNamesByType(typeName) {
  const data = await requestJson(`/type/${encodeURIComponent(typeName)}`)
  return data.pokemon.map(({ pokemon }) => pokemon.name)
}

export async function fetchPokemonNamesByGeneration(generationName) {
  const data = await requestJson(`/generation/${encodeURIComponent(generationName)}`)
  return data.pokemon_species.map(({ name }) => name)
}
