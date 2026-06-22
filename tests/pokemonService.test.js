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
