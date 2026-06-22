import { jest } from '@jest/globals';

// Mock the repository
const mockPokemonRepository = {
  getAllPokemon: jest.fn(),
  getPokemonByNameOrId: jest.fn(),
  getPokemonSpecies: jest.fn(),
  searchPokemon: jest.fn(),
  getPokemonTypes: jest.fn(),
  getPokemonByType: jest.fn()
};

jest.unstable_mockModule('../src/repositories/pokemonRepository.js', () => mockPokemonRepository);

// Import after mocking
const pokemonService = await import('../src/services/pokemonService.js');

describe('Pokemon Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPokemonData = {
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
    abilities: [
      { ability: { name: 'static' }, is_hidden: false },
      { ability: { name: 'lightning-rod' }, is_hidden: true }
    ],
    stats: [
      { stat: { name: 'hp' }, base_stat: 35 },
      { stat: { name: 'attack' }, base_stat: 55 }
    ]
  };

  const mockSpeciesData = {
    color: { name: 'yellow' },
    capture_rate: 190,
    base_happiness: 70,
    flavor_text_entries: [{ language: { name: 'en' }, flavor_text: 'A mouse Pokemon.' }],
    genera: [{ language: { name: 'en' }, genus: 'Mouse Pokemon' }]
  };

  describe('getPokemonDetails', () => {
    it('should return formatted pokemon details', async () => {
      mockPokemonRepository.getPokemonByNameOrId.mockResolvedValue(mockPokemonData);
      mockPokemonRepository.getPokemonSpecies.mockResolvedValue(mockSpeciesData);

      const result = await pokemonService.getPokemonDetails('pikachu');

      expect(result).toMatchObject({
        id: 25,
        name: 'pikachu',
        displayName: 'Pikachu',
        types: ['electric'],
        height: 0.4,
        weight: 6,
        color: 'yellow',
        genus: 'Mouse Pokemon'
      });
      expect(result.abilities).toHaveLength(2);
      expect(result.stats).toHaveLength(2);
    });

    it('should return null for non-existent pokemon', async () => {
      mockPokemonRepository.getPokemonByNameOrId.mockResolvedValue(null);

      const result = await pokemonService.getPokemonDetails('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle missing species data', async () => {
      mockPokemonRepository.getPokemonByNameOrId.mockResolvedValue(mockPokemonData);
      mockPokemonRepository.getPokemonSpecies.mockRejectedValue(new Error('Not found'));

      const result = await pokemonService.getPokemonDetails('pikachu');

      expect(result).toBeDefined();
      expect(result.color).toBe('gray');
      expect(result.description).toBe('No description available.');
    });
  });

  describe('getAllPokemon', () => {
    it('should return paginated pokemon list with details', async () => {
      mockPokemonRepository.getAllPokemon.mockResolvedValue({
        count: 1000,
        results: [{ name: 'pikachu', url: 'url' }]
      });
      mockPokemonRepository.getPokemonByNameOrId.mockResolvedValue(mockPokemonData);
      mockPokemonRepository.getPokemonSpecies.mockResolvedValue(mockSpeciesData);

      const result = await pokemonService.getAllPokemon(1, 20);

      expect(result.pokemon).toHaveLength(1);
      expect(result.totalCount).toBe(1000);
      expect(result.currentPage).toBe(1);
      expect(result.totalPages).toBe(50);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPrevPage).toBe(false);
    });

    it('should calculate pagination correctly', async () => {
      mockPokemonRepository.getAllPokemon.mockResolvedValue({
        count: 100,
        results: []
      });

      const result = await pokemonService.getAllPokemon(3, 10);

      expect(result.currentPage).toBe(3);
      expect(result.totalPages).toBe(10);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPrevPage).toBe(true);
    });
  });

  describe('searchPokemon', () => {
    it('should return empty results for empty query', async () => {
      const result = await pokemonService.searchPokemon('');

      expect(result.pokemon).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should return exact match when found', async () => {
      mockPokemonRepository.getPokemonByNameOrId.mockResolvedValue(mockPokemonData);
      mockPokemonRepository.getPokemonSpecies.mockResolvedValue(mockSpeciesData);

      const result = await pokemonService.searchPokemon('pikachu');

      expect(result.pokemon).toHaveLength(1);
      expect(result.pokemon[0].name).toBe('pikachu');
    });

    it('should search by partial name when no exact match', async () => {
      mockPokemonRepository.getPokemonByNameOrId.mockResolvedValue(null);
      mockPokemonRepository.searchPokemon.mockResolvedValue({
        count: 2,
        results: [{ name: 'pikachu' }, { name: 'pichu' }]
      });
      mockPokemonRepository.getPokemonByNameOrId
        .mockResolvedValueOnce(null)
        .mockResolvedValue(mockPokemonData);
      mockPokemonRepository.getPokemonSpecies.mockResolvedValue(mockSpeciesData);

      await pokemonService.searchPokemon('pik');

      expect(mockPokemonRepository.searchPokemon).toHaveBeenCalledWith('pik');
    });
  });

  describe('getPokemonTypes', () => {
    it('should return formatted types excluding unknown and shadow', async () => {
      mockPokemonRepository.getPokemonTypes.mockResolvedValue([
        { name: 'fire', url: 'url1' },
        { name: 'water', url: 'url2' },
        { name: 'unknown', url: 'url3' },
        { name: 'shadow', url: 'url4' }
      ]);

      const result = await pokemonService.getPokemonTypes();

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { name: 'fire', displayName: 'Fire' },
        { name: 'water', displayName: 'Water' }
      ]);
    });
  });

  describe('getPokemonByType', () => {
    it('should return paginated pokemon by type', async () => {
      mockPokemonRepository.getPokemonByType.mockResolvedValue([
        { name: 'charmander' },
        { name: 'charmeleon' },
        { name: 'charizard' }
      ]);
      mockPokemonRepository.getPokemonByNameOrId.mockResolvedValue(mockPokemonData);
      mockPokemonRepository.getPokemonSpecies.mockResolvedValue(mockSpeciesData);

      const result = await pokemonService.getPokemonByType('fire', 1, 2);

      expect(result.type).toBe('fire');
      expect(result.totalCount).toBe(3);
      expect(result.totalPages).toBe(2);
    });

    it('should return null for non-existent type', async () => {
      mockPokemonRepository.getPokemonByType.mockResolvedValue(null);

      const result = await pokemonService.getPokemonByType('nonexistent');

      expect(result).toBeNull();
    });
  });
});
