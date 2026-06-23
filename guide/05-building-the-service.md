# 05 - Building the Service Layer

The service layer contains your business logic. It takes raw data from repositories and transforms it into exactly what your application needs.

---

## What is a Service?

Think of a service as a chef:
- Raw ingredients come in (data from repository)
- The chef processes them (formatting, combining, calculating)
- A finished dish comes out (clean, usable data)

The service is the **only** layer that talks to the repository. Controllers will talk to the service.

---

## Step 1: Understand the Data Transformation

The PokeAPI returns data like this:

```javascript
{
  name: "pikachu",
  height: 4,        // In decimeters!
  weight: 60,       // In hectograms!
  types: [
    { slot: 1, type: { name: "electric", url: "..." } }
  ]
}
```

But we want data like this:

```javascript
{
  name: "pikachu",
  displayName: "Pikachu",   // Capitalized!
  height: 0.4,              // In meters!
  weight: 6.0,              // In kilograms!
  types: ["electric"]        // Simple array!
}
```

---

## Step 2: Create the Service File

1. Create a new file `src/services/pokemonService.js`

2. Add the imports at the top:

```javascript
import * as pokemonRepository from '../repositories/pokemonRepository.js';
import { config } from '../config/index.js';
```

3. Save the file

---

## Step 3: Add Helper Functions

1. Add these helper functions for formatting names:

```javascript
/**
 * "mr-mime" -> "Mr Mime"
 */
const formatName = (name) => {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatStatName = (name) => {
  const statNames = {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    speed: 'Speed'
  };
  return statNames[name] || formatName(name);
};
```

2. Save the file

---

## Step 4: Add the formatPokemonData Function

This is the heart of the service. It merges the Pokemon data and the (optional) species data into one clean object the views can render directly.

1. Add this function:

```javascript
/**
 * Transform raw PokeAPI data into a display-ready object.
 */
const formatPokemonData = (pokemon, species = null) => {
  const description =
    species?.flavor_text_entries
      ?.find((entry) => entry.language.name === 'en')
      ?.flavor_text?.replace(/[\f\n\r]/g, ' ') || 'No description available.';

  const genus = species?.genera?.find((g) => g.language.name === 'en')?.genus || 'Unknown';

  const stats = pokemon.stats.map((s) => ({
    name: formatStatName(s.stat.name),
    value: s.base_stat
  }));

  const totalStats = stats.reduce((sum, s) => sum + s.value, 0);

  return {
    id: pokemon.id,
    name: pokemon.name,
    displayName: formatName(pokemon.name),

    image:
      pokemon.sprites?.other?.['official-artwork']?.front_default ||
      pokemon.sprites?.front_default ||
      '',
    sprite: pokemon.sprites?.front_default || '',

    types: pokemon.types.map((t) => t.type.name),

    height: pokemon.height / 10, // decimeters -> meters
    weight: pokemon.weight / 10, // hectograms -> kilograms

    abilities: pokemon.abilities.map((a) => ({
      name: formatName(a.ability.name),
      isHidden: a.is_hidden
    })),

    stats,
    totalStats,

    description,
    genus,
    color: species?.color?.name || 'gray',
    captureRate: species?.capture_rate || 0,
    baseHappiness: species?.base_happiness || 0
  };
};
```

2. Save the file

### Why the `?.` everywhere?

The `?.` is **optional chaining**. Species data is optional, and some sprites can be missing. Optional chaining lets us safely read deep properties without crashing if something along the way is `null` or `undefined`. We also clean control characters (`\f`, `\n`, `\r`) out of the description so it reads as one tidy sentence.

---

## Step 5: Add getPokemonDetails Function

1. Add this exported function:

```javascript
/**
 * Get a single, fully-formatted Pokemon. Returns null if not found.
 */
export const getPokemonDetails = async (nameOrId) => {
  const pokemon = await pokemonRepository.getPokemonByNameOrId(nameOrId);
  if (!pokemon) {
    return null; // Not found
  }

  let species = null;
  try {
    species = await pokemonRepository.getPokemonSpecies(pokemon.id);
  } catch {
    // Species data is optional - continue without it.
  }

  return formatPokemonData(pokemon, species);
};
```

2. Save the file

---

## Step 6: Add getAllPokemon Function

1. Add this function with pagination:

```javascript
/**
 * Paginated list of Pokemon with full details for each entry.
 */
export const getAllPokemon = async (page = 1, limit = config.pagination.defaultLimit) => {
  const offset = (page - 1) * limit;
  const data = await pokemonRepository.getAllPokemon(limit, offset);

  const pokemonWithDetails = await Promise.all(
    data.results.map((pokemon) => getPokemonDetails(pokemon.name))
  );

  return {
    pokemon: pokemonWithDetails.filter((p) => p !== null),
    totalCount: data.count,
    currentPage: page,
    totalPages: Math.ceil(data.count / limit),
    hasNextPage: offset + limit < data.count,
    hasPrevPage: page > 1
  };
};
```

2. Save the file

We `filter((p) => p !== null)` so a single broken entry can never crash the whole page.

---

## Step 7: Add searchPokemon Function

1. Add this search function:

```javascript
/**
 * Search by name. Tries an exact match first, then a partial-name search.
 */
export const searchPokemon = async (query) => {
  if (!query || query.trim().length === 0) {
    return { pokemon: [], totalCount: 0 };
  }

  const exactMatch = await pokemonRepository.getPokemonByNameOrId(query);
  if (exactMatch) {
    const formatted = await getPokemonDetails(query);
    return {
      pokemon: formatted ? [formatted] : [],
      totalCount: formatted ? 1 : 0
    };
  }

  const searchResults = await pokemonRepository.searchPokemon(query);

  const pokemonWithDetails = await Promise.all(
    searchResults.results.slice(0, 20).map((pokemon) => getPokemonDetails(pokemon.name))
  );

  return {
    pokemon: pokemonWithDetails.filter((p) => p !== null),
    totalCount: searchResults.count
  };
};
```

2. Save the file

---

## Step 8: Add Type Functions

1. Add these functions for working with types:

```javascript
/**
 * All selectable types (special types removed), formatted for display.
 */
const hiddenTypes = ['unknown', 'shadow', 'stellar'];

export const getPokemonTypes = async () => {
  const types = await pokemonRepository.getPokemonTypes();

  return types
    .filter((t) => !hiddenTypes.includes(t.name))
    .map((t) => ({ name: t.name, displayName: formatName(t.name) }));
};

/**
 * Paginated list of Pokemon for a given type. Returns null if type not found.
 */
export const getPokemonByType = async (
  typeName,
  page = 1,
  limit = config.pagination.defaultLimit
) => {
  const pokemonList = await pokemonRepository.getPokemonByType(typeName);
  if (!pokemonList) {
    return null; // Type not found
  }

  const offset = (page - 1) * limit;
  const paginatedList = pokemonList.slice(offset, offset + limit);

  const pokemonWithDetails = await Promise.all(
    paginatedList.map((pokemon) => getPokemonDetails(pokemon.name))
  );

  return {
    pokemon: pokemonWithDetails.filter((p) => p !== null),
    type: typeName,
    totalCount: pokemonList.length,
    currentPage: page,
    totalPages: Math.ceil(pokemonList.length / limit),
    hasNextPage: offset + limit < pokemonList.length,
    hasPrevPage: page > 1
  };
};
```

2. Save the file

---

## Step 9: Verify Your Complete File

Your `src/services/pokemonService.js` should now export:
- `getPokemonDetails(nameOrId)`
- `getAllPokemon(page, limit)`
- `searchPokemon(query)`
- `getPokemonTypes()`
- `getPokemonByType(typeName, page, limit)`

(`formatName`, `formatStatName`, and `formatPokemonData` stay private — they are not exported.)

---

## Understanding Key Concepts

### Promise.all for Parallel Requests

```javascript
const pokemonWithDetails = await Promise.all(
  data.results.map((pokemon) => getPokemonDetails(pokemon.name))
);
```

`Promise.all()` runs multiple async operations in parallel - much faster than sequential!

### Pagination Formula

```
Page 1: Items 1-20   (offset: 0)
Page 2: Items 21-40  (offset: 20)
Page 3: Items 41-60  (offset: 40)

Formula: offset = (page - 1) * limit
```

---

## Summary

| Function | Purpose | Returns |
|----------|---------|---------|
| `getPokemonDetails(nameOrId)` | Get formatted Pokemon data | Pokemon object or `null` |
| `getAllPokemon(page, limit)` | Paginated list with details | `{ pokemon, pagination... }` |
| `searchPokemon(query)` | Search by name | `{ pokemon, totalCount }` |
| `getPokemonTypes()` | List all types | Array of types |
| `getPokemonByType(type, page)` | Pokemon by type | `{ pokemon, pagination... }` |

---

## Step 10: Commit Your Progress

1. Stage your changes:

```bash
git add .
```

2. Commit with the conventional format:

```bash
git commit -m "feat: add pokemon service for business logic"
```

---

## What's Next?

Now let's build the controllers that use these services.

Next: [06 - Building the Controller Layer](./06-building-the-controller.md)
