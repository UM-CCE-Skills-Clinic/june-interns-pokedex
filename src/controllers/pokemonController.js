import * as pokemonService from '../services/pokemonService.js';
import { config } from '../config/index.js';

const wrapAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const sanitizePage = (page) => {
  const p = parseInt(page, 10);
  return Number.isFinite(p) && p > 0 ? p : 1;
};

const sanitizeLimit = (limit) => {
  const l = parseInt(limit, 10);
  if (!Number.isFinite(l) || l < 1) return config.pagination.defaultLimit;
  return Math.min(l, config.pagination.maxSearchLimit);
};

const renderError = (res, status, pageTitle, message, error) => {
  res.status(status).render('error', { pageTitle, message, error });
};

// ============================================
// VIEW CONTROLLERS (Return HTML via EJS)
// ============================================

export const getHomePage = wrapAsync(async (req, res) => {
  const page = sanitizePage(req.query.page);
  const limit = sanitizeLimit(req.query.limit);

  const data = await pokemonService.getAllPokemon(page, limit);
  const types = await pokemonService.getPokemonTypes();

  res.render('index', {
    ...data,
    types,
    searchQuery: '',
    selectedType: ''
  });
});

export const getPokemonDetails = wrapAsync(async (req, res) => {
  const { nameOrId } = req.params;
  const pokemon = await pokemonService.getPokemonDetails(nameOrId);

  if (!pokemon) {
    return renderError(
      res,
      404,
      'Pokemon Not Found',
      'Pokemon not found',
      `No Pokemon found with name or ID: ${nameOrId}`
    );
  }

  res.render('pokemon', { pokemon });
});

export const searchPokemon = wrapAsync(async (req, res) => {
  const { q } = req.query;
  const types = await pokemonService.getPokemonTypes();
  const data = await pokemonService.searchPokemon(q);

  res.render('index', {
    ...data,
    types,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    searchQuery: q || '',
    selectedType: ''
  });
});

export const getPokemonByType = wrapAsync(async (req, res) => {
  const { type } = req.params;
  const page = sanitizePage(req.query.page);
  const types = await pokemonService.getPokemonTypes();
  const data = await pokemonService.getPokemonByType(type, page);

  if (!data) {
    return renderError(
      res,
      404,
      'Type Not Found',
      'Type not found',
      `No Pokemon type found: ${type}`
    );
  }

  res.render('index', {
    ...data,
    types,
    searchQuery: '',
    selectedType: type
  });
});

// ============================================
// API CONTROLLERS (Return JSON)
// ============================================

export const apiGetAllPokemon = wrapAsync(async (req, res) => {
  const page = sanitizePage(req.query.page);
  const limit = sanitizeLimit(req.query.limit);
  const data = await pokemonService.getAllPokemon(page, limit);
  res.json({ success: true, data });
});

export const apiGetPokemonDetails = wrapAsync(async (req, res) => {
  const { nameOrId } = req.params;
  const pokemon = await pokemonService.getPokemonDetails(nameOrId);

  if (!pokemon) {
    return res.status(404).json({
      success: false,
      error: `Pokemon not found: ${nameOrId}`
    });
  }

  res.json({ success: true, data: pokemon });
});

export const apiSearchPokemon = wrapAsync(async (req, res) => {
  const { q } = req.query;
  const data = await pokemonService.searchPokemon(q);
  res.json({ success: true, data });
});

export const apiGetTypes = wrapAsync(async (_req, res) => {
  const types = await pokemonService.getPokemonTypes();
  res.json({ success: true, data: types });
});

export const apiGetPokemonByType = wrapAsync(async (req, res) => {
  const { type } = req.params;
  const page = sanitizePage(req.query.page);
  const data = await pokemonService.getPokemonByType(type, page);

  if (!data) {
    return res.status(404).json({
      success: false,
      error: `Type not found: ${type}`
    });
  }

  res.json({ success: true, data });
});
