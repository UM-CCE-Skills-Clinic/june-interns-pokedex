import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from './config/index.js';
import routes from './routes/index.js';

// ============================================
// ES MODULE PATH SETUP
// ============================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// EXPRESS APP SETUP
// ============================================

const app = express();
const { port: PORT, nodeEnv } = config;

// ============================================
// MIDDLEWARE
// ============================================

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(join(__dirname, '../public')));

// ============================================
// VIEW ENGINE
// ============================================

// Configure EJS as view engine
app.set('view engine', 'ejs');

// Set views directory path
app.set('views', join(__dirname, 'views'));

// ============================================
// VIEW HELPERS (available in every template)
// ============================================

// Pokémon type colors for UI
app.locals.typeColors = {
  normal: '#9099a1',
  fire: '#ff9c54',
  water: '#4d90d5',
  electric: '#f3d23b',
  grass: '#63bb5b',
  ice: '#74cec0',
  fighting: '#ce4069',
  poison: '#ab6ac8',
  ground: '#d97746',
  flying: '#8fa8dd',
  psychic: '#f97176',
  bug: '#90c12c',
  rock: '#c7b78b',
  ghost: '#5269ad',
  dragon: '#0a6dc4',
  dark: '#5a5366',
  steel: '#5a8ea1',
  fairy: '#ec8fe6'
};

// ============================================
// ROUTES
// ============================================

// Mount all application routes
app.use('/', routes);

// ============================================
// ERROR HANDLERS
// ============================================

// 404 handler for unknown routes
app.use((_req, res) => {
  res.status(404).render('error', {
    message: 'Page not found',
    error: 'The page you are looking for does not exist.'
  });
});

// 500 handler for server errors
app.use((err, _req, res, _next) => {
  res.status(500).render('error', {
    message: 'Something went wrong',
    error: err.message
  });
});

// ============================================
// START SERVER
// ============================================

// Only start server outside test environment
if (nodeEnv !== 'test') {
  app.listen(PORT, () => {
    console.log(`Pokedex server running at http://localhost:${PORT}`);
  });
}

export default app;
