import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/repositories/pokemonRepository.js', () => ({
  getAllPokemon: jest.fn(),
  getPokemonByNameOrId: jest.fn(),
  getPokemonSpecies: jest.fn(),
  searchPokemon: jest.fn(),
  getPokemonTypes: jest.fn(),
  getPokemonByType: jest.fn()
}));

const pokemonRepository = await import('../src/repositories/pokemonRepository.js');
const pokemonService = await import('../src/services/pokemonService.js');

const rawPikachu = {
  id: 25,
  name: 'pikachu',
  sprites: {
    front_default: 'sprite.png',
    other: {
      'official-artwork': {
        front_default: 'artwork.png'
      }
    }
  },
  types: [{ type: { name: 'electric' } }],
  height: 4,
  weight: 60,
  abilities: [{ ability: { name: 'static' }, is_hidden: false }],
  stats: [
    { base_stat: 35, stat: { name: 'hp' } },
    { base_stat: 90, stat: { name: 'speed' } }
  ]
};

const rawSpecies = {
  flavor_text_entries: [
    {
      language: { name: 'en' },
      flavor_text: 'When several of these Pokemon gather, their electricity builds.'
    }
  ],
  genera: [{ language: { name: 'en' }, genus: 'Mouse Pokemon' }],
  color: { name: 'yellow' },
  capture_rate: 190,
  base_happiness: 50
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('pokemonService', () => {
  test('getPokemonDetails formats repository data for display', async () => {
    pokemonRepository.getPokemonByNameOrId.mockResolvedValue(rawPikachu);
    pokemonRepository.getPokemonSpecies.mockResolvedValue(rawSpecies);

    const result = await pokemonService.getPokemonDetails('pikachu');

    expect(result).toMatchObject({
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
      description: 'When several of these Pokemon gather, their electricity builds.',
      genus: 'Mouse Pokemon',
      color: 'yellow',
      captureRate: 190,
      baseHappiness: 50
    });
  });

  test('getPokemonDetails returns null when the repository cannot find a Pokemon', async () => {
    pokemonRepository.getPokemonByNameOrId.mockResolvedValue(null);

    await expect(pokemonService.getPokemonDetails('missingno')).resolves.toBeNull();
    expect(pokemonRepository.getPokemonSpecies).not.toHaveBeenCalled();
  });

  test('getAllPokemon returns pagination metadata and filters missing details', async () => {
    pokemonRepository.getAllPokemon.mockResolvedValue({
      count: 2,
      results: [{ name: 'pikachu' }, { name: 'missingno' }]
    });
    pokemonRepository.getPokemonByNameOrId
      .mockResolvedValueOnce(rawPikachu)
      .mockResolvedValueOnce(null);
    pokemonRepository.getPokemonSpecies.mockResolvedValue(rawSpecies);

    const result = await pokemonService.getAllPokemon(1, 2);

    expect(pokemonRepository.getAllPokemon).toHaveBeenCalledWith(2, 0);
    expect(result.pokemon).toHaveLength(1);
    expect(result.totalCount).toBe(2);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPrevPage).toBe(false);
  });

  test('searchPokemon returns an empty result for blank queries', async () => {
    await expect(pokemonService.searchPokemon('   ')).resolves.toEqual({
      pokemon: [],
      totalCount: 0
    });
    expect(pokemonRepository.getPokemonByNameOrId).not.toHaveBeenCalled();
  });

  test('getPokemonTypes removes special types and formats display names', async () => {
    pokemonRepository.getPokemonTypes.mockResolvedValue([
      { name: 'electric' },
      { name: 'unknown' },
      { name: 'shadow' },
      { name: 'special-attack' }
    ]);

    await expect(pokemonService.getPokemonTypes()).resolves.toEqual([
      { name: 'electric', displayName: 'Electric' },
      { name: 'special-attack', displayName: 'Special Attack' }
    ]);
  });
});
