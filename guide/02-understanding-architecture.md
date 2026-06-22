# 02 - Understanding Architecture

Before we write code, let's understand the architecture pattern we're using. This will help you understand why files are organized the way they are.

---

## The Layered Architecture

We're using a **layered architecture** pattern. Think of it like a factory assembly line where each station has one specific job:

```
┌─────────────────────────────────────────────────────────────┐
│                       User (Browser)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                          ROUTES                             │
│         Decide which controller handles each URL            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        CONTROLLERS                          │
│   Receive requests, call services, send responses           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        SERVICES                             │
│      Business logic, data transformation, validation        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        REPOSITORIES                         │
│        Data access - talk to databases or external API      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       EXTERNAL API                          │
│               PokeAPI (https://pokeapi.co)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Understand Each Layer

### Routes (`src/routes/`)

**Job:** Direct incoming requests to the right controller.

```javascript
// Example: When someone visits /pokemon/pikachu
// Routes say: "Pokemon requests? Go to pokemonController!"
router.get('/pokemon/:nameOrId', pokemonController.getPokemonDetails);
```

### Controllers (`src/controllers/`)

**Job:** Handle HTTP requests and responses.

```javascript
// Example controller function
async getPokemonDetails(req, res) {
  // 1. Get data from request (what Pokemon?)
  const { nameOrId } = req.params;

  // 2. Ask service to do the work
  const pokemon = await pokemonService.getPokemonDetails(nameOrId);

  // 3. Send response (HTML or JSON)
  res.render('pokemon', { pokemon });
}
```

### Services (`src/services/`)

**Job:** Business logic and data transformation.

```javascript
// Example service function
async getPokemonDetails(nameOrId) {
  // 1. Get raw data from repository
  const rawData = await pokemonRepository.getPokemonByNameOrId(nameOrId);

  // 2. Transform it (format names, convert units, etc.)
  const formattedData = this.formatPokemonData(rawData);

  // 3. Return clean data
  return formattedData;
}
```

### Repositories (`src/repositories/`)

**Job:** Fetch data from external sources (APIs, databases).

```javascript
// Example repository function
async getPokemonByNameOrId(nameOrId) {
  // Make HTTP request to PokeAPI
  const response = await axios.get(`${BASE_URL}/pokemon/${nameOrId}`);
  return response.data;
}
```

---

## Step 2: Understand Why We Use Layers

### 1. Separation of Concerns

Each layer has ONE job. This makes code:
- Easier to understand
- Easier to debug
- Easier to test

### 2. Maintainability

Want to switch from PokeAPI to a different API? Just change the repository - everything else stays the same!

### 3. Testability

You can test each layer independently:
- Test services without making real API calls
- Test controllers without running a server

### 4. Scalability

As your app grows, the organization stays clean.

---

## Step 3: Trace a Request Flow

When a user visits `http://localhost:3000/pokemon/pikachu`:

```
1. Browser sends GET request to /pokemon/pikachu

2. ROUTE matches the URL pattern
   └── /pokemon/:nameOrId → pokemonController.getPokemonDetails

3. CONTROLLER receives the request
   └── Extracts "pikachu" from URL
   └── Calls pokemonService.getPokemonDetails("pikachu")

4. SERVICE processes the request
   └── Calls pokemonRepository.getPokemonByNameOrId("pikachu")
   └── Also calls repository for species data
   └── Formats and combines the data

5. REPOSITORY fetches data
   └── Makes HTTP request to https://pokeapi.co/api/v2/pokemon/pikachu
   └── Returns raw JSON data

6. Data flows back up:
   └── Repository → Service (raw data)
   └── Service → Controller (formatted data)
   └── Controller → Route → Browser (HTML page)
```

---

## Step 4: Review the File Structure

```
src/
├── app.js               # Main entry point (creates Express app) — built in Part 09
├── config/
│   └── index.js         # Configuration settings
├── routes/
│   ├── index.js         # Main router
│   └── pokemonRoutes.js # Pokemon-specific routes
├── controllers/
│   └── pokemonController.js
├── services/
│   └── pokemonService.js
├── repositories/
│   └── pokemonRepository.js
└── views/
    ├── index.ejs        # Home page (list / search / type filter)
    ├── pokemon.ejs      # Detail page template
    ├── error.ejs        # Error page template
    └── partials/        # Reusable template parts
        ├── header.ejs   # <head> + Tailwind CDN + top navigation
        ├── footer.ejs   # Page footer + closing tags
        └── card.ejs     # A single Pokemon grid card
```

> **Build order note:** We build the inner layers first (config → repository → service → controller → routes → views), then create `src/app.js` in **Part 09** to wire them together. The entry point is created **before** we write any tests in Part 10.

---

## Step 5: Remember the Rules

| Layer | Folder | Responsibility |
|-------|--------|----------------|
| Routes | `src/routes/` | URL → Controller mapping |
| Controllers | `src/controllers/` | Handle requests/responses |
| Services | `src/services/` | Business logic |
| Repositories | `src/repositories/` | Data fetching |

### Important Rules

1. **Controllers call Services** (never repositories directly)
2. **Services call Repositories** (never make HTTP calls directly)
3. **Repositories handle external data** (APIs, databases)

---

## Common Questions

### Q: Can a controller call a repository directly?

**A:** Technically yes, but don't! Always go through services. This keeps your code organized and testable.

### Q: What if I need data from multiple sources?

**A:** The service layer handles this. It can call multiple repositories and combine the data.

### Q: Where do I put validation?

**A:** Basic request validation can go in controllers. Business logic validation goes in services.

---

## Commit Your Progress

This section was about understanding concepts, so there's no code to commit yet. Continue to the next section to start writing code.

---

## What's Next?

Now that you understand the architecture, let's set up our configuration.

Next: [03 - Configuration](./03-configuration.md)
