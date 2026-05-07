import { useState, useEffect } from 'react'
import { fetchPokemonDetail } from '../api/pokeapi'
import PokemonCard from './PokemonCard'

/**
 * Modal that displays a PokemonCard for a given Pokémon name
 */
export default function PokemonModal({ pokemonName, onClose }) {
  const [pokemon, setPokemon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadPokemon() {
      try {
        setLoading(true)
        const data = await fetchPokemonDetail(pokemonName)
        if (active) {
          setPokemon(data)
          setError('')
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar el Pokémon')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadPokemon()
    return () => {
      active = false
    }
  }, [pokemonName])

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Detalle de ${pokemonName}`}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">×</button>
        
        {loading && <p className="modal-loading">Cargando...</p>}
        {error && <p className="modal-error">{error}</p>}
        {pokemon && (
          <div className="modal-body">
            <PokemonCard pokemon={pokemon} />
          </div>
        )}
      </div>
    </div>
  )
}
