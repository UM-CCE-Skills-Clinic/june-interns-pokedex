import { Router } from 'express';
import pokemonRoutes from './pokemonRoutes.js';

const router = Router();

// Mount all Pokemon routes at root
router.use('/', pokemonRoutes);

export default router;

router.get('/about', aboutController);
// Matches: /about
// Does NOT match: /about/team

router.get('/pokemon/:nameOrId', pokemonController);
// Matches: /pokemon/pikachu, /pokemon/25
// Access via: req.params.nameOrId

// CORRECT ORDER ✓
router.get('/api/pokemon/search', searchController);   // Specific first
router.get('/api/pokemon/:nameOrId', detailController); // Generic second

// WRONG ORDER ✗
router.get('/api/pokemon/:nameOrId', detailController); // Catches "search"!
router.get('/api/pokemon/search', searchController);     // Never reached!

