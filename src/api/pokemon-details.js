/**
 * Fetches gender ratio for a Pokémon species.
 * Returns: { maleRate: 0-100, femaleRate: 0-100, genderless: boolean }
 */
export async function fetchPokemonGender(pokemonIdOrName) {
  try {
    const data = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${encodeURIComponent(pokemonIdOrName)}`
    ).then((r) => r.json())
    const genderRate = data.gender_rate ?? -1

    if (genderRate === -1) {
      return { maleRate: 0, femaleRate: 0, genderless: true }
    }

    // genderRate is on a scale of 0-8: 0 = 100% male, 8 = 100% female
    const femalePercentage = (genderRate / 8) * 100
    const malePercentage = 100 - femalePercentage

    return { maleRate: malePercentage, femaleRate: femalePercentage, genderless: false }
  } catch {
    return { maleRate: 0, femaleRate: 0, genderless: true }
  }
}

/**
 * Fetches location areas where a Pokémon can be found.
 * Returns an array of location objects with area names.
 */
export async function fetchPokemonLocations(pokemonName) {
  try {
    const data = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(pokemonName)}/encounters`
    ).then((r) => r.json())

    return data.map((encounter) => ({
      location: encounter.location_area?.name || 'Unknown',
      method: encounter.version_details?.[0]?.encounter_method?.name || 'Unknown',
      chance: encounter.version_details?.[0]?.chance || '—',
    }))
  } catch {
    return []
  }
}

/**
 * Fetches regions where a Pokémon is available based on game generations.
 * Simplified implementation that maps generations to regions.
 */
export async function fetchPokemonRegions(pokemonName) {
  const generationToRegion = {
    'generation-i': 'Kanto',
    'generation-ii': 'Johto',
    'generation-iii': 'Hoenn',
    'generation-iv': 'Sinnoh',
    'generation-v': 'Unova',
    'generation-vi': 'Kalos',
    'generation-vii': 'Alola',
    'generation-viii': 'Galar',
    'generation-ix': 'Paldea',
  }

  try {
    const data = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${encodeURIComponent(pokemonName)}`
    ).then((r) => r.json())

    const generation = data.generation?.name || null
    const region = generation ? generationToRegion[generation] : null

    return region ? [region] : []
  } catch {
    return []
  }
}

/**
 * Gets all available regions with their generation IDs.
 */
export const REGIONS = [
  { id: 'generation-i', name: 'Kanto' },
  { id: 'generation-ii', name: 'Johto' },
  { id: 'generation-iii', name: 'Hoenn' },
  { id: 'generation-iv', name: 'Sinnoh' },
  { id: 'generation-v', name: 'Unova' },
  { id: 'generation-vi', name: 'Kalos' },
  { id: 'generation-vii', name: 'Alola' },
  { id: 'generation-viii', name: 'Galar' },
  { id: 'generation-ix', name: 'Paldea' },
]

/**
 * Fetches all Pokémon names from a specific region (generation).
 * Returns an array of Pokémon names.
 */
export async function fetchPokemonByRegion(generationId) {
  try {
    const data = await fetch(
      `https://pokeapi.co/api/v2/generation/${encodeURIComponent(generationId)}`
    ).then((r) => r.json())

    return (data.pokemon_species || []).map((p) => p.name)
  } catch {
    return []
  }
}

/**
 * Fetches all Pokémon names found in a specific location.
 * Returns an array of Pokémon names.
 */
export async function fetchPokemonByLocation(locationName) {
  try {
    const data = await fetch(
      `https://pokeapi.co/api/v2/location-area/${encodeURIComponent(locationName)}`
    ).then((r) => r.json())

    const pokemonNames = new Set()
    (data.pokemon_encounters || []).forEach((enc) => {
      if (enc.pokemon?.name) {
        pokemonNames.add(enc.pokemon.name)
      }
    })

    return Array.from(pokemonNames)
  } catch {
    return []
  }
}

/**
 * Fetches all available location areas.
 * Returns an array of location area names.
 */
export async function fetchAllLocations() {
  try {
    const data = await fetch(`https://pokeapi.co/api/v2/location-area?limit=1000`).then((r) =>
      r.json()
    )

    return (data.results || []).map((loc) => loc.name)
  } catch {
    return []
  }
}
