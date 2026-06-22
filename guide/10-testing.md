# 10 - Testing

Now that the app exists (Part 09), let's prove it works with automated tests. We use **Jest** as the test runner and **Supertest** to send fake HTTP requests to our Express app — no real server or network required.

> **Order matters:** we wrote `src/app.js` in Part 09 first, *then* we test it here. The API tests import that app directly.

---

## Our Testing Strategy

We test each layer by **mocking the layer beneath it**. That keeps tests fast and removes the network entirely:

| Test file | What it tests | What it mocks |
|-----------|---------------|---------------|
| `tests/pokemonService.test.js` | The service's business logic | the **repository** |
| `tests/api.test.js` | Routes + controllers (HTTP) | the **service** |

Because the project uses ES Modules (`"type": "module"`), we mock with `jest.unstable_mockModule(...)` and then `await import(...)` the module under test. The `test` script already enables this via `--experimental-vm-modules`.

---

## Step 1: Test the Service Layer

1. Create a new file `tests/pokemonService.test.js`

2. Add this code:

```javascript
import { jest } from '@jest/globals';

// Mock the repository layer so the service is tested in isolation (no network).
jest.unstable_mockModule('../src/repositories/pokemonRepository.js', () => ({
  getAllPokemon: jest.fn(),
  getPokemonByNameOrId: jest.fn(),
  getPokemonSpecies: jest.fn(),
  searchPokemon: jest.fn(),
  getPokemonTypes: jest.fn(),
  getPokemonByType: jest.fn()
}));

const repo = await import('../src/repositories/pokemonRepository.js');
const service = await import('../src/services/pokemonService.js');

const rawPikachu = {
  id: 25,
  name: 'pikachu',
  height: 4, // decimeters
  weight: 60, // hectograms
  sprites: {
    front_default: 'sprite.png',
    other: { 'official-artwork': { front_default: 'artwork.png' } }
  },
  types: [{ slot: 1, type: { name: 'electric' } }],
  abilities: [
    { ability: { name: 'static' }, is_hidden: false },
    { ability: { name: 'lightning-rod' }, is_hidden: true }
  ],
  stats: [
    { base_stat: 35, stat: { name: 'hp' } },
    { base_stat: 55, stat: { name: 'attack' } },
    { base_stat: 40, stat: { name: 'defense' } },
    { base_stat: 50, stat: { name: 'special-attack' } },
    { base_stat: 50, stat: { name: 'special-defense' } },
    { base_stat: 90, stat: { name: 'speed' } }
  ]
};

const rawSpecies = {
  flavor_text_entries: [
    { language: { name: 'en' }, flavor_text: 'When\nseveral of\fthese gather,\rlightning.' },
    { language: { name: 'fr' }, flavor_text: 'french text' }
  ],
  genera: [{ language: { name: 'en' }, genus: 'Mouse Pokémon' }],
  color: { name: 'yellow' },
  capture_rate: 190,
  base_happiness: 50
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getPokemonDetails', () => {
  test('formats raw data into a display-ready object', async () => {
    repo.getPokemonByNameOrId.mockResolvedValue(rawPikachu);
    repo.getPokemonSpecies.mockResolvedValue(rawSpecies);

    const result = await service.getPokemonDetails('pikachu');

    expect(result).toMatchObject({
      id: 25,
      name: 'pikachu',
      displayName: 'Pikachu',
      image: 'artwork.png',
      sprite: 'sprite.png',
      types: ['electric'],
      height: 0.4, // decimeters -> meters
      weight: 6, // hectograms -> kilograms
      genus: 'Mouse Pokémon',
      captureRate: 190,
      baseHappiness: 50,
      totalStats: 320
    });
  });

  test('formats stat names and abilities (incl. hidden flag)', async () => {
    repo.getPokemonByNameOrId.mockResolvedValue(rawPikachu);
    repo.getPokemonSpecies.mockResolvedValue(rawSpecies);

    const result = await service.getPokemonDetails('pikachu');

    expect(result.stats).toContainEqual({ name: 'Sp. Atk', value: 50 });
    expect(result.stats[0]).toEqual({ name: 'HP', value: 35 });
    expect(result.abilities).toEqual([
      { name: 'Static', isHidden: false },
      { name: 'Lightning Rod', isHidden: true }
    ]);
  });

  test('cleans control characters out of the description', async () => {
    repo.getPokemonByNameOrId.mockResolvedValue(rawPikachu);
    repo.getPokemonSpecies.mockResolvedValue(rawSpecies);

    const result = await service.getPokemonDetails('pikachu');

    expect(result.description).toBe('When several of these gather, lightning.');
  });

  test('returns null when the Pokemon does not exist', async () => {
    repo.getPokemonByNameOrId.mockResolvedValue(null);

    const result = await service.getPokemonDetails('missingno');

    expect(result).toBeNull();
    expect(repo.getPokemonSpecies).not.toHaveBeenCalled();
  });

  test('still returns data when species lookup fails (species is optional)', async () => {
    repo.getPokemonByNameOrId.mockResolvedValue(rawPikachu);
    repo.getPokemonSpecies.mockRejectedValue(new Error('boom'));

    const result = await service.getPokemonDetails('pikachu');

    expect(result.displayName).toBe('Pikachu');
    expect(result.description).toBe('No description available.');
    expect(result.genus).toBe('Unknown');
  });
});

describe('getAllPokemon', () => {
  test('returns a page of detailed Pokemon with pagination metadata', async () => {
    repo.getAllPokemon.mockResolvedValue({
      count: 100,
      results: [{ name: 'pikachu' }, { name: 'pikachu' }]
    });
    repo.getPokemonByNameOrId.mockResolvedValue(rawPikachu);
    repo.getPokemonSpecies.mockResolvedValue(rawSpecies);

    const result = await service.getAllPokemon(2, 20);

    // page 2, limit 20 -> offset (2 - 1) * 20 = 20
    expect(repo.getAllPokemon).toHaveBeenCalledWith(20, 20);
    expect(result.pokemon).toHaveLength(2);
    expect(result).toMatchObject({
      totalCount: 100,
      currentPage: 2,
      totalPages: 5,
      hasNextPage: true,
      hasPrevPage: true
    });
  });
});

describe('searchPokemon', () => {
  test('returns empty result for a blank query', async () => {
    const result = await service.searchPokemon('   ');
    expect(result).toEqual({ pokemon: [], totalCount: 0 });
    expect(repo.getPokemonByNameOrId).not.toHaveBeenCalled();
  });

  test('returns a single result on an exact match', async () => {
    repo.getPokemonByNameOrId.mockResolvedValue(rawPikachu);
    repo.getPokemonSpecies.mockResolvedValue(rawSpecies);

    const result = await service.searchPokemon('pikachu');

    expect(result.totalCount).toBe(1);
    expect(result.pokemon[0].displayName).toBe('Pikachu');
    expect(repo.searchPokemon).not.toHaveBeenCalled();
  });

  test('falls back to a partial-name search when there is no exact match', async () => {
    repo.getPokemonByNameOrId
      .mockResolvedValueOnce(null) // exact-match attempt
      .mockResolvedValue(rawPikachu); // detail lookups
    repo.getPokemonSpecies.mockResolvedValue(rawSpecies);
    repo.searchPokemon.mockResolvedValue({
      count: 2,
      results: [{ name: 'pikachu' }, { name: 'pikachu' }]
    });

    const result = await service.searchPokemon('pika');

    expect(repo.searchPokemon).toHaveBeenCalledWith('pika');
    expect(result.totalCount).toBe(2);
    expect(result.pokemon).toHaveLength(2);
  });
});

describe('getPokemonTypes', () => {
  test('removes special types and formats display names', async () => {
    repo.getPokemonTypes.mockResolvedValue([
      { name: 'electric' },
      { name: 'unknown' },
      { name: 'shadow' }
    ]);

    const result = await service.getPokemonTypes();

    expect(result).toEqual([{ name: 'electric', displayName: 'Electric' }]);
  });
});

describe('getPokemonByType', () => {
  test('returns null when the type is not found', async () => {
    repo.getPokemonByType.mockResolvedValue(null);
    const result = await service.getPokemonByType('notatype');
    expect(result).toBeNull();
  });

  test('paginates the Pokemon belonging to a type', async () => {
    const list = Array.from({ length: 25 }, () => ({ name: 'pikachu' }));
    repo.getPokemonByType.mockResolvedValue(list);
    repo.getPokemonByNameOrId.mockResolvedValue(rawPikachu);
    repo.getPokemonSpecies.mockResolvedValue(rawSpecies);

    const result = await service.getPokemonByType('electric', 1, 20);

    expect(result.pokemon).toHaveLength(20);
    expect(result).toMatchObject({
      type: 'electric',
      totalCount: 25,
      currentPage: 1,
      totalPages: 2,
      hasNextPage: true,
      hasPrevPage: false
    });
  });
});
```

3. Save the file

---

## Step 2: Test the API and View Routes

1. Create a new file `tests/api.test.js`

2. Add this code:

```javascript
import { jest } from '@jest/globals';
import request from 'supertest';

// Run in test mode so app.js does not start a listening server.
process.env.NODE_ENV = 'test';

// Mock the service layer so routes/controllers are tested without network calls.
jest.unstable_mockModule('../src/services/pokemonService.js', () => ({
  getAllPokemon: jest.fn(),
  getPokemonDetails: jest.fn(),
  searchPokemon: jest.fn(),
  getPokemonTypes: jest.fn(),
  getPokemonByType: jest.fn()
}));

const service = await import('../src/services/pokemonService.js');
const { default: app } = await import('../src/app.js');

const samplePokemon = {
  id: 25,
  name: 'pikachu',
  displayName: 'Pikachu',
  image: 'artwork.png',
  sprite: 'sprite.png',
  types: ['electric'],
  height: 0.4,
  weight: 6,
  abilities: [{ name: 'Static', isHidden: false }],
  stats: [
    { name: 'HP', value: 35 },
    { name: 'Speed', value: 90 }
  ],
  totalStats: 125,
  description: 'An electric mouse.',
  genus: 'Mouse Pokémon',
  captureRate: 190,
  baseHappiness: 50
};

const emptyListing = {
  pokemon: [],
  totalCount: 0,
  currentPage: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('API routes (JSON)', () => {
  test('GET /api/pokemon returns a paginated listing', async () => {
    service.getAllPokemon.mockResolvedValue({ ...emptyListing, totalCount: 100 });

    const res = await request(app).get('/api/pokemon?page=2&limit=20');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalCount).toBe(100);
    expect(service.getAllPokemon).toHaveBeenCalledWith(2, 20);
  });

  test('GET /api/pokemon/:nameOrId returns a single Pokemon', async () => {
    service.getPokemonDetails.mockResolvedValue(samplePokemon);

    const res = await request(app).get('/api/pokemon/pikachu');

    expect(res.status).toBe(200);
    expect(res.body.data.displayName).toBe('Pikachu');
  });

  test('GET /api/pokemon/:nameOrId returns 404 when not found', async () => {
    service.getPokemonDetails.mockResolvedValue(null);

    const res = await request(app).get('/api/pokemon/missingno');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/pokemon/search is matched before the :nameOrId route', async () => {
    service.searchPokemon.mockResolvedValue({ pokemon: [samplePokemon], totalCount: 1 });

    const res = await request(app).get('/api/pokemon/search?q=pika');

    expect(res.status).toBe(200);
    expect(service.searchPokemon).toHaveBeenCalledWith('pika');
    expect(service.getPokemonDetails).not.toHaveBeenCalled();
  });

  test('GET /api/types returns the type list', async () => {
    service.getPokemonTypes.mockResolvedValue([{ name: 'electric', displayName: 'Electric' }]);

    const res = await request(app).get('/api/types');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test('GET /api/types/:type returns 404 for an unknown type', async () => {
    service.getPokemonByType.mockResolvedValue(null);

    const res = await request(app).get('/api/types/notatype');

    expect(res.status).toBe(404);
  });

  test('returns 500 with a JSON error envelope when the service throws', async () => {
    service.getAllPokemon.mockRejectedValue(new Error('upstream down'));

    const res = await request(app).get('/api/pokemon');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, error: 'upstream down' });
  });
});

describe('View routes (HTML)', () => {
  test('GET / renders the home page', async () => {
    service.getAllPokemon.mockResolvedValue(emptyListing);
    service.getPokemonTypes.mockResolvedValue([{ name: 'electric', displayName: 'Electric' }]);

    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('Discover every Pokémon');
  });

  test('GET /pokemon/:nameOrId renders the detail page', async () => {
    service.getPokemonDetails.mockResolvedValue(samplePokemon);

    const res = await request(app).get('/pokemon/pikachu');

    expect(res.status).toBe(200);
    expect(res.text).toContain('Pikachu');
    expect(res.text).toContain('Base stats');
  });

  test('GET /pokemon/:nameOrId renders a 404 error page when not found', async () => {
    service.getPokemonDetails.mockResolvedValue(null);

    const res = await request(app).get('/pokemon/missingno');

    expect(res.status).toBe(404);
    expect(res.text).toContain('Pokemon not found');
  });

  test('unknown routes render the 404 error page', async () => {
    const res = await request(app).get('/this/does/not/exist');

    expect(res.status).toBe(404);
    expect(res.text).toContain('Page not found');
  });
});
```

3. Save the file

---

## Step 3: Run the Tests

1. Run the test command:

```bash
npm test
```

2. You should see all tests pass:

```
 PASS  tests/pokemonService.test.js
 PASS  tests/api.test.js

Test Suites: 2 passed, 2 total
Tests:       23 passed, 23 total
```

**All tests passing means your app is built correctly!**

---

## Step 4: If a Test Fails

The test name tells you which layer to check:

| Failing test | Where to look |
|--------------|---------------|
| `getPokemonDetails`, `searchPokemon`, … | `src/services/pokemonService.js` |
| `GET /api/...`, `GET /pokemon/...` | `src/routes/`, `src/controllers/`, `src/app.js` |
| `Cannot find module` | A file name or path is wrong |

Common fixes:

1. **File names / locations** — are all files exactly where the guide put them?
2. **Exports** — did you export every function?
3. **Typos** — check spelling in code and class names.

Fix the issue, then run `npm test` again. Repeat until green.

---

## Step 5: Run Code Quality Checks

1. Check for linting errors:

```bash
npm run lint
```

2. Auto-fix anything fixable:

```bash
npm run lint:fix
```

3. Check formatting:

```bash
npm run format:check
```

4. Auto-format if needed:

```bash
npm run format
```

---

## Step 6: Run Everything Together

```bash
npm run lint && npm run format:check && npm test
```

All three should complete without errors. If they do, your app is verified.

---

## Step 7: Commit Your Progress

1. Stage your changes:

```bash
git add .
```

2. Commit with the conventional format:

```bash
git commit -m "test: add service and API tests"
```

---

## What's Next?

Tests pass and the app is wired up. Let's run it for real and ship it!

Next: [11 - Running the App](./11-running-the-app.md)
