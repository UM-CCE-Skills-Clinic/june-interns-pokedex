import express from 'express';
import { dirname, join } from 'path'; // ✨ FIXED: Added join here
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import routes from './routes/pokemonRoutes.js'; // ✨ FIXED: Imported your routes (adjust path if needed)

// ES Modules don't have __dirname by default — recreate it.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const { port: PORT, nodeEnv } = config;

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// public/ directory intentionally left empty — favicon is inlined; Tailwind is served via CDN.

// ============================================
// VIEW ENGINE
// ============================================
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// ============================================
// VIEW HELPERS (available in every template)
// ============================================
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
app.use('/', routes);

// ============================================
// ERROR HANDLERS
// ============================================
app.use((req, res) => {
  res.status(404).render('error', {
    pageTitle: 'Page Not Found',
    message: 'Page not found',
    error: 'The page you are looking for does not exist.'
  });
});

app.use((err, req, res, _next) => {
  if (req.path.startsWith('/api')) {
    return res.status(500).json({ success: false, error: err.message });
  }
  res.status(500).render('error', {
    pageTitle: 'Server Error',
    message: 'Something went wrong',
    error: err.message
  });
});

// ============================================
// START SERVER
// ============================================
if (nodeEnv !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`Pokedex server running at http://localhost:${PORT}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Is another server already running?`);
    } else {
      console.error('Server error:', err.message);
    }
    process.exit(1);
  });
}

export default app;
