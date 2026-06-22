# 11 - Running the App

Congratulations! You've built a complete Pokedex application — all layers, the views, the entry point (`src/app.js` from Part 09), and a passing test suite (Part 10). Let's run it for real and ship it.

---

## Step 1: Start the Development Server

1. Run the development server (auto-restarts on file changes):

```bash
npm run dev
```

2. You should see:

```
[nodemon] starting `node src/app.js`
Pokedex server running at http://localhost:3000
```

3. Open your browser to `http://localhost:3000`

> Prefer a plain start without auto-reload? Use `npm start`.

---

## Step 2: Explore the Three Main Pages

The app delivers the three pages from the project brief, plus type filtering:

1. **View All Pokemon** — the home page grid at `http://localhost:3000`. Use the **Previous / Next** buttons to page through.

2. **Search Pokemon** — type a name or ID in the header search box (try `pikachu` or `25`) and press Enter. You'll land on `/search?q=...`.

3. **View a Pokemon with all its stats** — click any card to open its detail page (e.g. `http://localhost:3000/pokemon/pikachu`), with description, height/weight, abilities, and animated base-stat bars.

4. **Filter by Type** (bonus) — click a colored type chip to see only that type, e.g. `/type/electric`.

Try an unknown Pokemon too, like `http://localhost:3000/pokemon/notreal` — you should get the friendly error page with the Pokéball.

---

## Step 3: Try the JSON API

The same data is available as JSON. Open a second terminal:

**Windows (PowerShell):**
```powershell
Invoke-RestMethod http://localhost:3000/api/pokemon
Invoke-RestMethod http://localhost:3000/api/pokemon/pikachu
Invoke-RestMethod "http://localhost:3000/api/pokemon/search?q=char"
Invoke-RestMethod http://localhost:3000/api/types
Invoke-RestMethod http://localhost:3000/api/types/electric
```

**Mac/Linux (curl):**
```bash
curl http://localhost:3000/api/pokemon
curl http://localhost:3000/api/pokemon/pikachu
curl "http://localhost:3000/api/pokemon/search?q=char"
curl http://localhost:3000/api/types
curl http://localhost:3000/api/types/electric
```

Each returns a JSON envelope shaped like `{ "success": true, "data": ... }`.

---

## Step 4: Run the Final Checks

1. Stop the dev server (`Ctrl+C`).

2. Run all quality gates together:

```bash
npm run lint && npm run format:check && npm test
```

3. Everything should pass — lint clean, formatting clean, all tests green.

> When you open your Pull Request, GitHub Actions runs the **Project Submission Pipeline** workflow. It first checks your PR description for the required student info, then runs the same gates as above (lint → format → test) plus a build check that boots the app.

---

## Step 5: Commit Your Progress

1. Stage your changes:

```bash
git add .
```

2. Commit with the conventional format:

```bash
git commit -m "docs: finalize pokedex application"
```

3. Your personal details don't go in the commit — they go in the **Pull Request description** (Step 7), which is what the submission pipeline checks.

---

## Step 6: Push Your Branch

1. Push your branch to GitHub:

```bash
git push -u origin your-lastname/pokedex-pull-request
```

2. Replace the branch name with your actual one, e.g.:

```bash
git push -u origin dela-cruz/pokedex-pull-request
```

---

## Step 7: Create a Pull Request

1. Go to the original repository on GitHub.

2. Click **Pull Requests** → **New Pull Request** → **compare across forks**.

3. Select:
   - Base repository: the original repo, base branch: `main`
   - Head repository: your fork, compare branch: your branch

4. The repository ships a **Pull Request template**, so the description box is already filled in for you. You only need to set the title and complete the **Student Information** section.

**Title:**
```
<Your Last Name>/pokedex-pull-request
```

**Student Information** — replace each value with your own. Keep the labels **exactly** as shown (the pipeline reads them character-for-character), and use your real `@umindanao.edu.ph` address:
```
First Name: Juan
Last Name: Dela Cruz
Program: BS Computer Science
UMindanao Email: j.delacruz.123456@umindanao.edu.ph
```

> ⚠️ **All four fields are required.** If any is missing — or the email isn't a `@umindanao.edu.ph` address — the **PR Info Check** fails and the rest of the pipeline won't run. Note the exact spelling: `First Name`, `Last Name`, `Program`, and `UMindanao Email` (capital `U` and `M`).

5. Click **Create Pull Request**.

---

## Final Project Structure

Your completed project should look like this:

```
inter-workshop/
├── guide/
├── public/                       # Static assets (empty unless you add any)
├── src/
│   ├── app.js                    # Entry point (Part 09)
│   ├── config/
│   │   └── index.js
│   ├── controllers/
│   │   └── pokemonController.js
│   ├── repositories/
│   │   └── pokemonRepository.js
│   ├── routes/
│   │   ├── index.js
│   │   └── pokemonRoutes.js
│   ├── services/
│   │   └── pokemonService.js
│   └── views/
│       ├── error.ejs
│       ├── index.ejs
│       ├── pokemon.ejs
│       └── partials/
│           ├── card.ejs
│           ├── footer.ejs
│           └── header.ejs
├── tests/
│   ├── api.test.js
│   └── pokemonService.test.js
├── .env
├── .env.example
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── jest.config.js
├── package.json
└── package-lock.json
```

---

## What You've Learned

- Setting up a Node.js project with Express
- Layered architecture (Routes → Controllers → Services → Repositories)
- Server-side rendering with EJS templates
- Utility-first styling with Tailwind CSS via the Play CDN
- Making HTTP requests with Axios
- Environment configuration with dotenv
- Testing with Jest and Supertest (including ES Module mocking)
- Git workflow with conventional commits

---

## Troubleshooting

### "Cannot find module" Error

```bash
npm install
```

### "Port 3000 is already in use"

Change the port in `.env`:
```
PORT=3001
```

### The page loads but has no styling

The Tailwind Play CDN needs internet access — make sure you're online, and check the browser console for a blocked `cdn.tailwindcss.com` request.

### Tests failing

1. Re-check file paths and names.
2. Verify every function is exported.
3. Run `npm run lint:fix` and `npm run format`.

---

## Conclusion

You've built a complete full-stack web application — a layered Express backend, server-rendered EJS views styled with Tailwind, a JSON API, and a passing test suite. The patterns you learned here apply to many kinds of projects. Keep building!

Happy coding!
