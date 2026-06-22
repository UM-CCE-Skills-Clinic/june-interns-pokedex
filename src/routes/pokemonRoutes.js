import { Router } from 'express';
import * as pokemonController from '../controllers/pokemonController.js';

const router = Router();

// ============================================
// VIEW ROUTES (Return HTML)
// ============================================

// Home page - list all Pokemon
router.get('/', pokemonController.getHomePage);

// Search Pokemon
router.get('/search', pokemonController.searchPokemon);

// Filter by type
router.get('/type/:type', pokemonController.getPokemonByType);

// Pokemon detail page
router.get('/pokemon/:nameOrId', pokemonController.getPokemonDetails);

// ============================================
// VIEW ROUTES (Return HTML)
// ============================================

// Home page - list all Pokemon
router.get('/', pokemonController.getHomePage);

// Search Pokemon
router.get('/search', pokemonController.searchPokemon);

// Filter by type
router.get('/type/:type', pokemonController.getPokemonByType);

// Pokemon detail page
router.get('/pokemon/:nameOrId', pokemonController.getPokemonDetails);

export default router;