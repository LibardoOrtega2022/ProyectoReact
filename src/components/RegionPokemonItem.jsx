export default function RegionPokemonItem({ pokemonName }) {
  return (
    <li className="region-pokemon-list-item">
      <div className="region-pokemon-content">
        <span className="region-pokemon-name">{pokemonName}</span>
      </div>
    </li>
  )
}
