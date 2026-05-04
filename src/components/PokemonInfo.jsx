import { useEffect, useState } from "react"
import { fetchPokemonGender, fetchPokemonLocations } from "../api/pokemon-details"
import { formatDisplayName } from "../api/pokeapi"

export default function PokemonInfo({ pokemonName }) {
  const [gender, setGender] = useState(null)
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!pokemonName) return

    let active = true

    async function loadInfo() {
      setLoading(true)

      try {
        const [genderData, locationsData] = await Promise.all([
          fetchPokemonGender(pokemonName),
          fetchPokemonLocations(pokemonName),
        ])

        if (!active) return

        setGender(genderData)
        setLocations(locationsData)
      } catch {
        // Silently fail
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadInfo()
    return () => {
      active = false
    }
  }, [pokemonName])

  if (loading) {
    return <div className="pokemon-info">Cargando informaci�n...</div>
  }

  return (
    <div className="pokemon-info">
      {gender && (
        <div className="info-section">
          <h4>G�nero</h4>
          {gender.genderless ? (
            <p>Sin g�nero definido</p>
          ) : (
            <div className="gender-ratio">
              <div className="gender-bar">
                <div
                  className="gender-male"
                  style={{ width: gender.maleRate + "%" }}
                  title={"Macho: " + gender.maleRate.toFixed(1) + "%"}
                >
                  {gender.maleRate > 10 && <span>? {gender.maleRate.toFixed(0)}%</span>}
                </div>
                <div
                  className="gender-female"
                  style={{ width: gender.femaleRate + "%" }}
                  title={"Hembra: " + gender.femaleRate.toFixed(1) + "%"}
                >
                  {gender.femaleRate > 10 && <span>? {gender.femaleRate.toFixed(0)}%</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {locations.length > 0 && (
        <div className="info-section">
          <h4>Localidades ({locations.length})</h4>
          <div className="locations-list">
            {locations.slice(0, 10).map((loc, idx) => (
              <div key={idx} className="location-item">
                <div className="location-name">{formatDisplayName(loc.location)}</div>
                <div className="location-method">
                  {formatDisplayName(loc.method)}
                  {loc.chance !== "�" && <span className="location-chance">{loc.chance}%</span>}
                </div>
              </div>
            ))}
            {locations.length > 10 && (
              <div className="location-more">... y {locations.length - 10} m�s localidades</div>
            )}
          </div>
        </div>
      )}

      {locations.length === 0 && (
        <div className="info-section">
          <p>No hay informaci�n de localidades disponible.</p>
        </div>
      )}
    </div>
  )
}

