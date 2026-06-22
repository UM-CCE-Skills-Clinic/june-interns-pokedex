# 10 - Testing

Now that the app exists (Part 09), let's prove it works with automated tests. We use **Jest** as the test runner and **Supertest** to send fake HTTP requests to our Express app — no real server or network required.

> **Order matters:** we wrote `src/app.js` in Part 09 first, *then* we test it here. The API tests import that app directly.

---

## Our Testing Strategy

We test each layer by **mocking the layer beneath it**. That keeps tests fast and removes the network entirely:

| Test file | What it tests | What it mocks |
|-----------|---------------|---------------|
| `tests/pokemonService.test.js` | The service's business logic | the **repository** |
| `tests/api.test.js` | Routes + controllers (HTTP) | the **service** |

Because the project uses ES Modules (`"type": "module"`), we mock with `jest.unstable_mockModule(...)` and then `await import(...)` the module under test. The `test` script already enables this via `--experimental-vm-modules`.

---

## The Test Files Are Already Provided

You don't need to write any tests — the two test files already live in the `tests/` folder:

- `tests/pokemonService.test.js` — exercises the service's business logic with the repository mocked out.
- `tests/api.test.js` — exercises the routes and controllers (HTTP) with the service mocked out.

Your job is to run them and confirm everything you built in the previous parts passes. If a test fails, that's a signal that one of your files needs a fix — see [Step 2](#step-2-if-a-test-fails) below.

---

## Step 1: Run the Tests

1. Run the test command:

```bash
npm test
```

2. You should see all tests pass:

```
 PASS  tests/pokemonService.test.js
 PASS  tests/api.test.js

Test Suites: 2 passed, 2 total
Tests:       23 passed, 23 total
```

**All tests passing means your app is built correctly!**

---

## Step 2: If a Test Fails

The test name tells you which layer to check:

| Failing test | Where to look |
|--------------|---------------|
| `getPokemonDetails`, `searchPokemon`, … | `src/services/pokemonService.js` |
| `GET /api/...`, `GET /pokemon/...` | `src/routes/`, `src/controllers/`, `src/app.js` |
| `Cannot find module` | A file name or path is wrong |

Common fixes:

1. **File names / locations** — are all files exactly where the guide put them?
2. **Exports** — did you export every function?
3. **Typos** — check spelling in code and class names.

Fix the issue, then run `npm test` again. Repeat until green.

---

## Step 3: Run Code Quality Checks

1. Check for linting errors:

```bash
npm run lint
```

2. Auto-fix anything fixable:

```bash
npm run lint:fix
```

3. Check formatting:

```bash
npm run format:check
```

4. Auto-format if needed:

```bash
npm run format
```

---

## Step 4: Run Everything Together

```bash
npm run lint && npm run format:check && npm test
```

All three should complete without errors. If they do, your app is verified.

---

## Step 5: Commit Your Progress

1. Stage your changes:

```bash
git add .
```

2. Commit with the conventional format:

```bash
git commit -m "test: add service and API tests"
```

---

## What's Next?

Tests pass and the app is wired up. Let's run it for real and ship it!

Next: [11 - Running the App](./11-running-the-app.md)
