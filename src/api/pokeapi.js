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
 * Returns the primary artwork URL for a Pokémon entry.
 * Prefer official artwork, fallback to front_default.
 */
export function getPokemonArtworkUrl(pokemon) {
  return pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || ''
}

/**
 * Returns an array of artwork URLs in priority order for fallback handling.
 * If the primary URL fails to load, the app can try the next one in sequence.
 */
export function getPokemonArtworkUrlWithFallbacks(pokemon) {
  const urls = []
  const pokemonName = pokemon.name.toLowerCase()

  // 1. Official artwork from PokéAPI (best quality, but sometimes slow)
  if (pokemon.sprites.other?.['official-artwork']?.front_default) {
    urls.push(pokemon.sprites.other['official-artwork'].front_default)
  }

  // 2. jsDelivr CDN mirror of PokéAPI sprites (fast and reliable)
  urls.push(`https://cdn.jsdelivr.net/npm/pokémon-icons@2.0.0/sprites/pokemon/other/official-artwork/${pokemon.id}.png`)

  // 3. Alternate jsDelivr CDN source
  urls.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`)

  // 4. PokéAPI front default sprite
  if (pokemon.sprites.front_default) {
    urls.push(pokemon.sprites.front_default)
  }

  // 5. Pokémon Showdown alternative sprite (reliable fallback)
  urls.push(`https://raw.githubusercontent.com/smogon/pokemon-showdown/master/public/sprites/pokemon/${pokemonName}.png`)

  // 6. Alternative jsDelivr source for standard sprite
  urls.push(`https://cdn.jsdelivr.net/npm/pokémon-icons@2.0.0/sprites/pokemon/${pokemon.id}.png`)

  return urls.filter((url) => url) // Remove empty strings
}

/**
 * Generates an SVG placeholder for a Pokémon when all images fail to load.
 * Shows Pokémon ID and name as fallback.
 */
export function getPokemonPlaceholderSvg(pokemon) {
  const pokemonId = String(pokemon.id).padStart(3, '0')
  const pokemonName = pokemon.name.toUpperCase()

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23f5f5f5' width='200' height='200'/%3E%3Ccircle cx='100' cy='60' r='35' fill='%23ddd'/%3E%3Ctext x='100' y='140' text-anchor='middle' font-size='18' font-weight='bold' fill='%23666'%3E%23${pokemonId}%3C/text%3E%3Ctext x='100' y='165' text-anchor='middle' font-size='12' fill='%23999'%3E${pokemonName}%3C/text%3E%3C/svg%3E`
}

/**
 * Fetches and caches a single Pokémon detail payload.
 */
export async function fetchPokemonDetail(name) {
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

/**
 * Maps species flags/capture rate to a user-facing rarity label.
 */
export function getRarityLabelFromSpecies(species) {
  if (!species) {
    return null
  }

  if (species.is_legendary || species.is_mythical) {
    return 'Legendario'
  }

  const capture = species.capture_rate ?? 0
  if (capture >= 200) return 'Común'
  if (capture >= 100) return 'Poco común'
  if (capture >= 50) return 'Raro'
  if (capture >= 11) return 'Muy raro'
  return 'Extremadamente raro'
}

/**
 * Returns Pokémon names that match a rarity label, using chunked requests
 * to keep API traffic smoother.
 */
export async function fetchPokemonNamesByRarity(names, rarityLabel) {
  if (!rarityLabel) {
    return names
  }

  const matchedNames = []
  const chunkSize = 12

  function delay(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  for (let index = 0; index < names.length; index += chunkSize) {
    const chunk = names.slice(index, index + chunkSize)
    const speciesList = await Promise.all(chunk.map((name) => fetchSpeciesData(name)))

    speciesList.forEach((species, speciesIndex) => {
      if (getRarityLabelFromSpecies(species) === rarityLabel) {
        matchedNames.push(chunk[speciesIndex])
      }
    })

    // Small pacing pause to keep requests smoother and UI more responsive.
    if (index + chunkSize < names.length) {
      await delay(18)
    }
  }

  return matchedNames
}

/**
 * Fetch list of all abilities (names) - cached simple call
 */
export async function fetchAbilityList() {
  const data = await requestJson('/ability?limit=1000')
  return data.results.map((r) => r.name)
}

/**
 * Fetch list of all moves (names)
 */
export async function fetchMoveList() {
  const data = await requestJson('/move?limit=2000')
  return data.results.map((r) => r.name)
}

/**
 * Fetch full move detail
 */
export async function fetchMoveDetail(moveName) {
  return requestJson(`/move/${encodeURIComponent(moveName)}`)
}

/**
 * Fetch full ability detail
 */
export async function fetchAbilityDetail(abilityName) {
  return requestJson(`/ability/${encodeURIComponent(abilityName)}`)
}

/**
 * Translation maps for move and ability details from PokéAPI
 */
const typeTranslations = {
  normal: 'Normal',
  fire: 'Fuego',
  water: 'Agua',
  electric: 'Eléctrico',
  grass: 'Planta',
  ice: 'Hielo',
  fighting: 'Lucha',
  poison: 'Veneno',
  ground: 'Tierra',
  flying: 'Volador',
  psychic: 'Psíquico',
  bug: 'Bicho',
  rock: 'Roca',
  ghost: 'Fantasma',
  dragon: 'Dragón',
  dark: 'Siniestro',
  steel: 'Acero',
  fairy: 'Hada',
  unknown: 'Desconocido',
  shadow: 'Sombra',
}

const damageClassTranslations = {
  physical: 'Físico',
  special: 'Especial',
  status: 'Estado',
}

/**
 * Extracts the effect description from a move or ability with language metadata.
 * Note: PokéAPI typically provides effect_entries only in English ('en') and French ('fr') for moves/abilities.
 * Spanish translations are not available from the API.
 * 
 * Returns: { text: string, languageCode: string, isSpanish: boolean }
 * Fallback chain: Spanish (if available) → English → French → any available → default message
 */
export function getSpanishEffect(effectEntries) {
  if (!Array.isArray(effectEntries) || effectEntries.length === 0) {
    return {
      text: 'Sin descripción disponible',
      languageCode: null,
      isSpanish: false,
    }
  }

  // First priority: Spanish (es) - though typically not available for effects
  const spanishEntry = effectEntries.find((entry) => entry.language?.name === 'es')
  if (spanishEntry?.effect) {
    return {
      text: spanishEntry.effect,
      languageCode: 'es',
      isSpanish: true,
    }
  }

  // Second priority: English (en) - most commonly available
  const englishEntry = effectEntries.find((entry) => entry.language?.name === 'en')
  if (englishEntry?.effect) {
    return {
      text: englishEntry.effect,
      languageCode: 'en',
      isSpanish: false,
    }
  }

  // Third priority: French (fr) - sometimes available
  const frenchEntry = effectEntries.find((entry) => entry.language?.name === 'fr')
  if (frenchEntry?.effect) {
    return {
      text: frenchEntry.effect,
      languageCode: 'fr',
      isSpanish: false,
    }
  }

  // Last resort: take first available entry
  if (effectEntries[0]?.effect) {
    return {
      text: effectEntries[0].effect,
      languageCode: effectEntries[0].language?.name || null,
      isSpanish: false,
    }
  }

  return {
    text: 'Sin descripción disponible',
    languageCode: null,
    isSpanish: false,
  }
}

/**
 * Translates a Pokémon type name to Spanish.
 */
export function getSpanishTypeName(typeName) {
  const normalized = (typeName || 'unknown').toLowerCase()
  return typeTranslations[normalized] || formatDisplayName(normalized)
}

/**
 * Translates a damage class (physical/special/status) to Spanish.
 */
export function getSpanishDamageClass(damageClassName) {
  const normalized = (damageClassName || 'status').toLowerCase()
  return damageClassTranslations[normalized] || formatDisplayName(normalized)
}

/**
 * Translates an ability name (formats and translates if known).
 * Ability names from PokéAPI are already lowercase with hyphens.
 */
export function getSpanishAbilityName(abilityName) {
  return formatDisplayName(abilityName || 'Unknown')
}
