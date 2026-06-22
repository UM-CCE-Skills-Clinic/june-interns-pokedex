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
