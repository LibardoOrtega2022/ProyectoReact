# myreactapp — Pokédex (React + Vite)

Proyecto SPA construido con React + Vite: una Pokédex ligera con búsqueda, filtros y un panel de "Regiones y Localidades".

Resumen rápido
- Interfaz de búsqueda y filtrado por tipo, generación y rareza.
- Panel de listas con pestaña "Regiones y Localidades" que permite filtrar Pokémon por región o por localidad.
- Visualización de información adicional por Pokémon (género y localidades) sin modificar las tarjetas principales.

Estructura principal
- `src/` — código fuente React
	- `api/` — wrappers y utilidades para PokéAPI (`pokeapi.js`, `pokemon-details.js`)
	- `components/` — componentes UI (p. ej. `PokemonGrid`, `PokemonInfo`, `RegionPokemonItem`)
	- `App.jsx`, `main.jsx`, `App.css`
- `public/` — assets públicos

Funciones clave
- `fetchPokemonGender`, `fetchPokemonLocations`, `fetchPokemonByRegion`, `fetchPokemonByLocation`, `fetchAllLocations` en `src/api/pokemon-details.js`.
- Buscador de localidades con dropdown filtrable y scroll optimizado.
- Lista compacta de Pokémon por filtro que muestra únicamente nombre (sin clickable) y soporte para imagen (fallback cuando sea necesario).

Cómo ejecutar (desarrollo)
1. Instalar dependencias:

```bash
npm install
```

2. Levantar servidor de desarrollo:

```bash
npm run dev
```

3. Construir para producción:

```bash
npm run build
```

Notas de desarrollo
- El panel de regiones usa `REGIONS` (mapeo a generaciones) y `fetchPokemonByRegion` para obtener nombres.
- El input de localidad muestra nombres formateados (p. ej. `cerulean-city-area` → "Cerulean City Area") pero guarda el identificador crudo para las llamadas a la API.
- CSS principal está en `src/App.css` y contiene estilos para los paneles y el dropdown de localidades.

Problemas conocidos
- Para ejecutar localmente necesitas tener `npm`/Node.js en el sistema (el proyecto no arranca si `npm` no está instalado en la máquina).

Contribuir
- Abrir una rama, crear PR con cambios claros y pruebas mínimas.

Licencia
- Repositorio sin licencia explícita (añadir `LICENSE` si corresponde).

Contacto
- Preguntas o cambios de UI: describir el comportamiento deseado y abrir una issue/PR.
