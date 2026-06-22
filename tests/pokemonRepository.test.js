import { jest } from '@jest/globals';

jest.unstable_mockModule('axios', () => ({
  default: {
    get: jest.fn()
  }
}));

const axios = await import('axios');
const repo = await import('../src/repositories/pokemonRepository.js');

const mockPokemonList = {
  count: 100,
  results: [
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' }
  ]
};

const mockPikachu = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  sprites: {
    front_default: 'sprite.png',
    other: { 'official-artwork': { front_default: 'artwork.png' } }
  },
  types: [{ slot: 1, type: { name: 'electric' } }],
  abilities: [{ ability: { name: 'static' }, is_hidden: false }],
  stats: [{ base_stat: 35, stat: { name: 'hp' } }]
};

const mockSpecies = {
  flavor_text_entries: [{ language: { name: 'en' }, flavor_text: 'desc' }],
  genera: [{ language: { name: 'en' }, genus: 'Mouse Pokémon' }],
  color: { name: 'yellow' },
  capture_rate: 190,
  base_happiness: 50
};

const mockTypes = {
  results: [{ name: 'electric' }, { name: 'fire' }, { name: 'unknown' }]
};

const mockTypeDetail = {
  pokemon: [
    { pokemon: { name: 'pikachu', url: '...' } },
    { pokemon: { name: 'raichu', url: '...' } }
  ]
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getAllPokemon', () => {
  test('fetches paginated pokemon list', async () => {
    axios.default.get.mockResolvedValue({ data: mockPokemonList });

    const result = await repo.getAllPokemon(20, 0);

    expect(axios.default.get).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon', {
      params: { limit: 20, offset: 0 }
    });
    expect(result).toEqual(mockPokemonList);
  });

  test('throws on network error', async () => {
    axios.default.get.mockRejectedValue(new Error('Network error'));

    await expect(repo.getAllPokemon()).rejects.toThrow('Failed to fetch Pokemon list');
  });
});

describe('getPokemonByNameOrId', () => {
  test('returns pokemon data when found', async () => {
    axios.default.get.mockResolvedValue({ data: mockPikachu });

    const result = await repo.getPokemonByNameOrId('pikachu');

    expect(axios.default.get).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/pikachu');
    expect(result).toEqual(mockPikachu);
  });

  test('returns null on 404', async () => {
    axios.default.get.mockRejectedValue({ response: { status: 404 } });

    const result = await repo.getPokemonByNameOrId('missingno');

    expect(result).toBeNull();
  });

  test('throws on non-404 error', async () => {
    axios.default.get.mockRejectedValue(new Error('Server error'));

    await expect(repo.getPokemonByNameOrId('pikachu')).rejects.toThrow('Failed to fetch Pokemon');
  });
});

describe('getPokemonSpecies', () => {
  test('fetches species data by id', async () => {
    axios.default.get.mockResolvedValue({ data: mockSpecies });

    const result = await repo.getPokemonSpecies(25);

    expect(axios.default.get).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon-species/25');
    expect(result).toEqual(mockSpecies);
  });

  test('returns null on 404', async () => {
    axios.default.get.mockRejectedValue({ response: { status: 404 } });

    const result = await repo.getPokemonSpecies(99999);

    expect(result).toBeNull();
  });
});

describe('searchPokemon', () => {
  test('filters pokemon by name query', async () => {
    axios.default.get.mockResolvedValue({
      data: {
        count: 1000,
        results: [{ name: 'pikachu' }, { name: 'raichu' }, { name: 'charizard' }, { name: 'pichu' }]
      }
    });

    const result = await repo.searchPokemon('pik');

    expect(result.results).toHaveLength(1);
    expect(result.results[0].name).toBe('pikachu');
    expect(result.count).toBe(1);
  });

  test('is case-insensitive', async () => {
    axios.default.get.mockResolvedValue({
      data: {
        count: 1000,
        results: [{ name: 'Pikachu' }, { name: 'PIKACHU' }]
      }
    });

    const result = await repo.searchPokemon('pikachu');

    expect(result.count).toBe(2);
  });
});

describe('getPokemonTypes', () => {
  test('returns all types', async () => {
    axios.default.get.mockResolvedValue({ data: mockTypes });

    const result = await repo.getPokemonTypes();

    expect(result).toEqual(mockTypes.results);
  });
});

describe('getPokemonByType', () => {
  test('returns pokemon list for a valid type', async () => {
    axios.default.get.mockResolvedValue({ data: mockTypeDetail });

    const result = await repo.getPokemonByType('electric');

    expect(result).toEqual([
      { name: 'pikachu', url: '...' },
      { name: 'raichu', url: '...' }
    ]);
  });

  test('returns null on 404 type', async () => {
    axios.default.get.mockRejectedValue({ response: { status: 404 } });

    const result = await repo.getPokemonByType('notatype');

    expect(result).toBeNull();
  });
});
