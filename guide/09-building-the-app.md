# 09 - Building the App Entry Point

Every layer is ready: config, repository, service, controller, routes, and views. Now we create the file that **wires them all together** — `src/app.js`.

> **Why now (before testing)?** Our tests in Part 10 import this Express app and send fake HTTP requests to it. The app must exist first. This is the natural build order: create the entry point, *then* test it.

---

## What the Entry Point Does

`src/app.js` is responsible for:

1. Creating the Express application
2. Registering middleware (JSON/form parsing, static files)
3. Configuring EJS as the view engine
4. Registering shared **view helpers** (the `typeColors` map our templates rely on)
5. Mounting the routes
6. Handling 404 and 500 errors
7. Starting the server (except during tests)

---

## Step 1: Create the File and Imports

1. Create a new file `src/app.js`

2. Add the imports and `__dirname` setup:

```javascript
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from './config/index.js';
import routes from './routes/index.js';

// ES Modules don't have __dirname by default — recreate it.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const { port: PORT, nodeEnv } = config;
```

3. Save the file

---

## Step 2: Register Middleware

1. Add this below the imports:

```javascript
// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, '../public')));
```

2. Save the file

| Middleware | Purpose |
|------------|---------|
| `express.json()` | Parse JSON request bodies |
| `express.urlencoded()` | Parse HTML form submissions |
| `express.static()` | Serve files from `public/` |

---

## Step 3: Configure the View Engine

1. Add this:

```javascript
// ============================================
// VIEW ENGINE
// ============================================
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
```

2. Save the file

This tells Express to render `.ejs` files from `src/views` whenever we call `res.render('index', ...)`.

---

## Step 4: Register View Helpers (typeColors)

Remember in Part 08 our templates used `typeColors[type]` to color badges, chips, and cards. Anything placed on `app.locals` is automatically available in **every** template, so this is the perfect home for that map.

1. Add this:

```javascript
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
```

2. Save the file

> Each value is a hex color. There are exactly 18 entries — one per Pokemon type. The fallback `'#9099a1'` in the templates covers anything unexpected.

---

## Step 5: Mount the Routes

1. Add this:

```javascript
// ============================================
// ROUTES
// ============================================
app.use('/', routes);
```

2. Save the file

---

## Step 6: Add the Error Handlers

These must come **after** the routes. The first catches any URL that didn't match a route (404). The second catches errors thrown anywhere in the app (500).

1. Add this:

```javascript
// ============================================
// ERROR HANDLERS
// ============================================
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Page not found',
    error: 'The page you are looking for does not exist.'
  });
});

app.use((err, _req, res, _next) => {
  res.status(500).render('error', {
    message: 'Something went wrong',
    error: err.message
  });
});
```

2. Save the file

> The unused parameters are named `_req` and `_next` (with a leading underscore) on purpose — our ESLint config ignores arguments that start with `_`. Express also *requires* the error handler to declare all four parameters so it knows it is an error handler.

---

## Step 7: Start the Server (and Export the App)

1. Add this at the very bottom:

```javascript
// ============================================
// START SERVER
// ============================================
if (nodeEnv !== 'test') {
  app.listen(PORT, () => {
    console.log(`Pokedex server running at http://localhost:${PORT}`);
  });
}

export default app;
```

2. Save the file

### Why the `if (nodeEnv !== 'test')` guard?

When our tests import this file, we **do not** want a real server listening on a port — that would leave the process hanging. The guard skips `app.listen()` in test mode, while `export default app` lets Supertest drive the app directly. This is exactly what makes Part 10 possible.

---

## Step 8: Verify Your Complete File

`src/app.js` should now, in order: import everything, register middleware, set up EJS, define `app.locals.typeColors`, mount routes, add the 404 + 500 handlers, conditionally start the server, and `export default app`.

A quick sanity check — start the server once:

```bash
npm run dev
```

You should see:

```
Pokedex server running at http://localhost:3000
```

Open `http://localhost:3000` in your browser. The Pokédex should load! Press `Ctrl+C` to stop the server. (We'll do a full walkthrough in Part 11.)

---

## Step 9: Commit Your Progress

1. Stage your changes:

```bash
git add .
```

2. Commit with the conventional format:

```bash
git commit -m "feat: add express application entry point"
```

---

## What's Next?

The app exists and runs. Now let's prove it's correct by writing automated tests.

Next: [10 - Testing](./10-testing.md)
