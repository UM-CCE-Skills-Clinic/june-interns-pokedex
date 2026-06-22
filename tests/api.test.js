import { jest } from '@jest/globals';
import request from 'supertest';

// Mock the pokemon service
const mockPokemonService = {
  getAllPokemon: jest.fn(),
  getPokemonDetails: jest.fn(),
  searchPokemon: jest.fn(),
  getPokemonTypes: jest.fn(),
  getPokemonByType: jest.fn()
};

jest.unstable_mockModule('../src/services/pokemonService.js', () => mockPokemonService);

// Import app after mocking
const { default: app } = await import('../src/app.js');

describe('Pokemon API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/pokemon', () => {
    it('should return pokemon list with pagination', async () => {
      const mockData = {
        pokemon: [
          { id: 1, name: 'bulbasaur', displayName: 'Bulbasaur', types: ['grass', 'poison'] }
        ],
        totalCount: 1000,
        currentPage: 1,
        totalPages: 50,
        hasNextPage: true,
        hasPrevPage: false
      };
      mockPokemonService.getAllPokemon.mockResolvedValue(mockData);

      const response = await request(app).get('/api/pokemon');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.pokemon).toHaveLength(1);
      expect(response.body.data.currentPage).toBe(1);
    });

    it('should accept page and limit query params', async () => {
      const mockData = {
        pokemon: [],
        totalCount: 1000,
        currentPage: 2,
        totalPages: 100,
        hasNextPage: true,
        hasPrevPage: true
      };
      mockPokemonService.getAllPokemon.mockResolvedValue(mockData);

      const response = await request(app).get('/api/pokemon?page=2&limit=10');

      expect(response.status).toBe(200);
      expect(mockPokemonService.getAllPokemon).toHaveBeenCalledWith(2, 10);
    });

    it('should return 500 on service error', async () => {
      mockPokemonService.getAllPokemon.mockRejectedValue(new Error('Service error'));

      const response = await request(app).get('/api/pokemon');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/pokemon/:nameOrId', () => {
    it('should return pokemon details by name', async () => {
      const mockPokemon = {
        id: 25,
        name: 'pikachu',
        displayName: 'Pikachu',
        types: ['electric'],
        stats: []
      };
      mockPokemonService.getPokemonDetails.mockResolvedValue(mockPokemon);

      const response = await request(app).get('/api/pokemon/pikachu');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('pikachu');
    });

    it('should return pokemon details by id', async () => {
      const mockPokemon = {
        id: 25,
        name: 'pikachu',
        displayName: 'Pikachu',
        types: ['electric']
      };
      mockPokemonService.getPokemonDetails.mockResolvedValue(mockPokemon);

      const response = await request(app).get('/api/pokemon/25');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(25);
    });

    it('should return 404 for non-existent pokemon', async () => {
      mockPokemonService.getPokemonDetails.mockResolvedValue(null);

      const response = await request(app).get('/api/pokemon/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 500 on service error', async () => {
      mockPokemonService.getPokemonDetails.mockRejectedValue(new Error('Service error'));

      const response = await request(app).get('/api/pokemon/pikachu');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/pokemon/search', () => {
    it('should search pokemon by query', async () => {
      const mockData = {
        pokemon: [{ id: 25, name: 'pikachu', displayName: 'Pikachu', types: ['electric'] }],
        totalCount: 1
      };
      mockPokemonService.searchPokemon.mockResolvedValue(mockData);

      const response = await request(app).get('/api/pokemon/search?q=pika');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.pokemon).toHaveLength(1);
      expect(mockPokemonService.searchPokemon).toHaveBeenCalledWith('pika');
    });

    it('should return empty results for no matches', async () => {
      mockPokemonService.searchPokemon.mockResolvedValue({
        pokemon: [],
        totalCount: 0
      });

      const response = await request(app).get('/api/pokemon/search?q=xyz123');

      expect(response.status).toBe(200);
      expect(response.body.data.pokemon).toHaveLength(0);
    });

    it('should handle missing query parameter', async () => {
      mockPokemonService.searchPokemon.mockResolvedValue({
        pokemon: [],
        totalCount: 0
      });

      const response = await request(app).get('/api/pokemon/search');

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/types', () => {
    it('should return all pokemon types', async () => {
      const mockTypes = [
        { name: 'fire', displayName: 'Fire' },
        { name: 'water', displayName: 'Water' },
        { name: 'grass', displayName: 'Grass' }
      ];
      mockPokemonService.getPokemonTypes.mockResolvedValue(mockTypes);

      const response = await request(app).get('/api/types');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
    });

    it('should return 500 on service error', async () => {
      mockPokemonService.getPokemonTypes.mockRejectedValue(new Error('Service error'));

      const response = await request(app).get('/api/types');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/types/:type', () => {
    it('should return pokemon by type', async () => {
      const mockData = {
        pokemon: [{ id: 4, name: 'charmander', displayName: 'Charmander', types: ['fire'] }],
        type: 'fire',
        totalCount: 100,
        currentPage: 1,
        totalPages: 5
      };
      mockPokemonService.getPokemonByType.mockResolvedValue(mockData);

      const response = await request(app).get('/api/types/fire');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('fire');
    });

    it('should accept page parameter', async () => {
      const mockData = {
        pokemon: [],
        type: 'water',
        totalCount: 100,
        currentPage: 2,
        totalPages: 5
      };
      mockPokemonService.getPokemonByType.mockResolvedValue(mockData);

      const response = await request(app).get('/api/types/water?page=2');

      expect(response.status).toBe(200);
      expect(mockPokemonService.getPokemonByType).toHaveBeenCalledWith('water', 2);
    });

    it('should return 404 for non-existent type', async () => {
      mockPokemonService.getPokemonByType.mockResolvedValue(null);

      const response = await request(app).get('/api/types/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});

describe('View Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should render home page with pokemon list', async () => {
      mockPokemonService.getAllPokemon.mockResolvedValue({
        pokemon: [{ id: 1, name: 'bulbasaur', displayName: 'Bulbasaur', types: ['grass'] }],
        totalCount: 1000,
        currentPage: 1,
        totalPages: 50,
        hasNextPage: true,
        hasPrevPage: false
      });
      mockPokemonService.getPokemonTypes.mockResolvedValue([{ name: 'fire', displayName: 'Fire' }]);

      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
    });
  });

  describe('GET /pokemon/:nameOrId', () => {
    it('should render pokemon detail page', async () => {
      mockPokemonService.getPokemonDetails.mockResolvedValue({
        id: 25,
        name: 'pikachu',
        displayName: 'Pikachu',
        types: ['electric'],
        stats: [],
        abilities: [],
        description: 'Test',
        genus: 'Mouse Pokemon'
      });

      const response = await request(app).get('/pokemon/pikachu');

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
    });

    it('should render error page for non-existent pokemon', async () => {
      mockPokemonService.getPokemonDetails.mockResolvedValue(null);

      const response = await request(app).get('/pokemon/nonexistent');

      expect(response.status).toBe(404);
      expect(response.type).toBe('text/html');
    });
  });

  describe('GET /search', () => {
    it('should render search results', async () => {
      mockPokemonService.searchPokemon.mockResolvedValue({
        pokemon: [{ id: 25, name: 'pikachu', displayName: 'Pikachu', types: ['electric'] }],
        totalCount: 1
      });
      mockPokemonService.getPokemonTypes.mockResolvedValue([]);

      const response = await request(app).get('/search?q=pika');

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
    });
  });

  describe('GET /type/:type', () => {
    it('should render pokemon filtered by type', async () => {
      mockPokemonService.getPokemonByType.mockResolvedValue({
        pokemon: [{ id: 4, name: 'charmander', displayName: 'Charmander', types: ['fire'] }],
        type: 'fire',
        totalCount: 100,
        currentPage: 1,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: false
      });
      mockPokemonService.getPokemonTypes.mockResolvedValue([{ name: 'fire', displayName: 'Fire' }]);

      const response = await request(app).get('/type/fire');

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
    });

    it('should render error page for non-existent type', async () => {
      mockPokemonService.getPokemonByType.mockResolvedValue(null);
      mockPokemonService.getPokemonTypes.mockResolvedValue([]);

      const response = await request(app).get('/type/nonexistent');

      expect(response.status).toBe(404);
      expect(response.type).toBe('text/html');
    });
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');

    expect(response.status).toBe(404);
    expect(response.type).toBe('text/html');
  });
});
