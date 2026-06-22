# 08 - Building Views with EJS + Tailwind CSS

Views are the HTML templates that display data to users. We use **EJS** (Embedded JavaScript) as our template engine and **Tailwind CSS** (via the Play CDN) for styling.

---

## What is EJS?

EJS lets you embed JavaScript in HTML:

```html
<!-- Regular HTML -->
<h1>Hello World</h1>

<!-- EJS with dynamic content -->
<h1>Hello <%= userName %></h1>
```

## EJS Syntax

| Syntax | Purpose | Example |
|--------|---------|---------|
| `<%= %>` | Output (escaped) | `<%= pokemon.name %>` |
| `<%- %>` | Output (unescaped) | `<%- include('header') %>` |
| `<% %>` | JavaScript logic | `<% if (condition) { %>` |

---

## How we style: Tailwind via the Play CDN

Instead of writing a `style.css` file, we add a single `<script src="https://cdn.tailwindcss.com"></script>` to the page `<head>`. Tailwind then reads the utility classes in our HTML (like `flex`, `rounded-2xl`, `text-slate-900`) and generates the CSS on the fly — no build step required.

Two helpful details we rely on:

1. **Inline `tailwind.config`** — right after the CDN script we can extend the theme (fonts, brand colors, animations).
2. **Pokemon type colors** — there are 18 types. Rather than hand-writing 18 classes, we keep a `typeColors` map (created in Part 09 on `app.locals`) and apply colors with an inline `style="background-color: ..."`. This always works, even with the CDN's just-in-time class scanning.

> **Heads up:** The Play CDN is perfect for learning and prototyping. For a production deployment you would later swap it for a compiled Tailwind build.

---

## Step 1: Create the Header Partial

The header holds the `<head>` (including the Tailwind CDN + config), a decorative background, the sticky top navigation, and the always-available search box. It opens the `<main>` wrapper that every page lives inside.

1. Create a new file `src/views/partials/header.ejs`

2. Add this code:

```html
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><%= typeof pageTitle !== 'undefined' ? pageTitle : 'Pokédex' %></title>
  <meta name="description" content="A modern Pokédex — browse, search and inspect every Pokémon and its stats." />

  <!-- Tailwind CSS (Play CDN) -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif']
          },
          colors: {
            brand: {
              50: '#fff1f2',
              100: '#ffe0e3',
              400: '#f4566b',
              500: '#e3284a',
              600: '#cc163a',
              700: '#a8112f'
            }
          },
          boxShadow: {
            card: '0 1px 2px rgba(16,24,40,.04), 0 8px 24px -8px rgba(16,24,40,.18)',
            lift: '0 18px 40px -12px rgba(16,24,40,.28)'
          },
          keyframes: {
            'fade-up': {
              '0%': { opacity: '0', transform: 'translateY(10px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' }
            },
            float: {
              '0%,100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-8px)' }
            }
          },
          animation: {
            'fade-up': 'fade-up .5s ease both',
            float: 'float 6s ease-in-out infinite'
          }
        }
      }
    };
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
    rel="stylesheet"
  />
  <link
    rel="icon"
    href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='%23e3284a'/%3E%3Cpath d='M2 50h96' stroke='%23111' stroke-width='8'/%3E%3Ccircle cx='50' cy='50' r='14' fill='%23fff' stroke='%23111' stroke-width='8'/%3E%3C/svg%3E"
  />

  <style>
    body { font-feature-settings: 'cv11', 'ss01'; }
    /* Smooth, on-load animation for stat bars */
    .stat-bar { transition: width 1s cubic-bezier(.22,1,.36,1); }
    /* Hide the scrollbar on the horizontal type filter */
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body class="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-brand-100">
  <!-- Decorative background -->
  <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div class="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-brand-100 blur-3xl opacity-60"></div>
    <div class="absolute top-1/3 -left-24 h-80 w-80 rounded-full bg-sky-100 blur-3xl opacity-60"></div>
  </div>

  <header class="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
    <div class="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
      <a href="/" class="group flex items-center gap-2.5">
        <span class="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-b from-brand-500 to-brand-600 shadow-card ring-2 ring-white">
          <span class="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-slate-900/80"></span>
          <span class="relative h-3 w-3 rounded-full bg-white ring-[3px] ring-slate-900/80"></span>
        </span>
        <span class="text-lg font-extrabold tracking-tight text-slate-900">
          Poké<span class="text-brand-600">dex</span>
        </span>
      </a>

      <form action="/search" method="GET" class="ml-auto w-full max-w-md">
        <div class="group relative">
          <svg class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
          <input
            type="text"
            name="q"
            value="<%= typeof searchQuery !== 'undefined' ? searchQuery : '' %>"
            placeholder="Search Pokémon by name or ID…"
            autocomplete="off"
            class="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
          />
        </div>
      </form>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
```

3. Save the file

> Notice the guard `typeof searchQuery !== 'undefined'`. The header is shared by every page, but only the list page passes `searchQuery`. The guard keeps the detail and error pages from crashing.

---

## Step 2: Create the Footer Partial

1. Create a new file `src/views/partials/footer.ejs`

2. Add this code:

```html
  </main>

  <footer class="mt-12 border-t border-slate-200/70 bg-white/60">
    <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
      <p>
        Built with a layered Express + EJS architecture.
      </p>
      <p>
        Data from
        <a href="https://pokeapi.co/" target="_blank" rel="noopener" class="font-semibold text-brand-600 hover:text-brand-700">PokéAPI</a>
      </p>
    </div>
  </footer>
</body>
</html>
```

3. Save the file

---

## Step 3: Create the Card Partial

A single Pokemon card appears many times on the grid, so we extract it into its own partial. It receives one `poke` object and reads the global `typeColors` map.

1. Create a new file `src/views/partials/card.ejs`

2. Add this code:

```html
<%
  const primary = poke.types[0] || 'normal';
  const c = typeColors[primary] || '#9099a1';
%>
<a
  href="/pokemon/<%= poke.name %>"
  class="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition duration-300 hover:-translate-y-1.5 hover:shadow-lift focus:outline-none focus:ring-4 focus:ring-brand-100"
>
  <!-- Type-tinted image stage -->
  <div class="relative isolate flex h-40 items-center justify-center overflow-hidden"
       style="background: radial-gradient(120% 120% at 50% 0%, <%= c %>33 0%, <%= c %>14 45%, transparent 70%);">
    <span class="absolute -right-6 -top-6 select-none text-[7rem] font-black leading-none text-slate-900/[0.04]">
      <%= String(poke.id).padStart(3, '0') %>
    </span>
    <span class="absolute left-3 top-3 rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold tabular-nums text-slate-500 ring-1 ring-slate-200 backdrop-blur">
      #<%= String(poke.id).padStart(3, '0') %>
    </span>
    <img
      src="<%= poke.image || poke.sprite %>"
      alt="<%= poke.displayName %>"
      loading="lazy"
      class="relative z-10 h-32 w-32 object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.18)] transition duration-300 group-hover:scale-110"
    />
  </div>

  <div class="flex flex-1 flex-col gap-2.5 p-4">
    <h3 class="text-base font-bold tracking-tight text-slate-900"><%= poke.displayName %></h3>
    <div class="flex flex-wrap gap-1.5">
      <% poke.types.forEach((type) => { %>
        <span
          class="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm"
          style="background-color: <%= typeColors[type] || '#9099a1' %>;"
        ><%= type %></span>
      <% }); %>
    </div>
  </div>
</a>
```

3. Save the file

> The `<%= c %>33` / `<%= c %>14` trick appends an alpha value to a hex color (e.g. `#e3284a` + `33` → a translucent tint), giving each card a subtle type-colored glow.

---

## Step 4: Create the Index Page (list / search / type filter)

This one template powers three views — the full list, search results, and the type filter — because all three render a grid of cards. The controller tells it which mode it is in via `searchQuery` and `selectedType`.

1. Create a new file `src/views/index.ejs`

2. Add this code:

```html
<%- include('partials/header') %>

<!-- Page heading -->
<section class="animate-fade-up">
  <% if (searchQuery) { %>
    <p class="text-sm font-semibold uppercase tracking-wider text-brand-600">Search results</p>
    <div class="mt-1 flex flex-wrap items-end justify-between gap-3">
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        “<%= searchQuery %>”
      </h1>
      <a href="/" class="text-sm font-semibold text-slate-500 hover:text-brand-600">Clear search →</a>
    </div>
    <p class="mt-1 text-sm text-slate-500"><%= totalCount %> Pokémon found</p>
  <% } else if (selectedType) { %>
    <p class="text-sm font-semibold uppercase tracking-wider text-brand-600">Filtered by type</p>
    <div class="mt-1 flex flex-wrap items-end justify-between gap-3">
      <h1 class="text-2xl font-extrabold capitalize tracking-tight text-slate-900 sm:text-3xl">
        <%= selectedType %> Pokémon
      </h1>
      <a href="/" class="text-sm font-semibold text-slate-500 hover:text-brand-600">Show all →</a>
    </div>
    <p class="mt-1 text-sm text-slate-500"><%= totalCount %> Pokémon of this type</p>
  <% } else { %>
    <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
      Discover every Pokémon
    </h1>
    <p class="mt-2 max-w-2xl text-slate-500">
      Browse the National Pokédex, filter by type, or search by name and ID. Tap any Pokémon to dive into its full stats.
    </p>
  <% } %>
</section>

<!-- Type filter -->
<nav class="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
  <a
    href="/"
    class="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition <%= selectedType === '' && !searchQuery ? 'bg-slate-900 text-white shadow-card' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50' %>"
  >All</a>
  <% types.forEach((type) => { %>
    <a
      href="/type/<%= type.name %>"
      class="shrink-0 rounded-full px-4 py-2 text-sm font-semibold capitalize text-white shadow-sm ring-1 ring-black/5 transition hover:brightness-105 <%= selectedType === type.name ? 'ring-2 ring-slate-900 ring-offset-2' : '' %>"
      style="background-color: <%= typeColors[type.name] || '#9099a1' %>;"
    ><%= type.displayName %></a>
  <% }); %>
</nav>

<!-- Grid -->
<% if (pokemon && pokemon.length > 0) { %>
  <div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
    <% pokemon.forEach((poke) => { %>
      <%- include('partials/card', { poke }) %>
    <% }); %>
  </div>
<% } else { %>
  <div class="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
    <span class="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-3xl">🔍</span>
    <h2 class="mt-4 text-lg font-bold text-slate-800">No Pokémon found</h2>
    <p class="mt-1 max-w-sm text-sm text-slate-500">
      We couldn't find anything matching your query. Try a different name or browse by type.
    </p>
    <a href="/" class="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700">
      Back to all Pokémon
    </a>
  </div>
<% } %>

<!-- Pagination -->
<% if (!searchQuery && totalPages > 1) { %>
  <%
    const baseUrl = selectedType ? `/type/${selectedType}` : '/';
    const prevUrl = `${baseUrl}?page=${currentPage - 1}`;
    const nextUrl = `${baseUrl}?page=${currentPage + 1}`;
  %>
  <div class="mt-10 flex items-center justify-center gap-3">
    <% if (hasPrevPage) { %>
      <a href="<%= prevUrl %>" class="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-card ring-1 ring-slate-200 transition hover:bg-slate-50">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        Previous
      </a>
    <% } else { %>
      <span class="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl bg-white/60 px-4 py-2.5 text-sm font-semibold text-slate-300 ring-1 ring-slate-200">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        Previous
      </span>
    <% } %>

    <span class="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold tabular-nums text-white shadow-card">
      <%= currentPage %> <span class="font-normal text-slate-400">/ <%= totalPages %></span>
    </span>

    <% if (hasNextPage) { %>
      <a href="<%= nextUrl %>" class="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-card ring-1 ring-slate-200 transition hover:bg-slate-50">
        Next
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
      </a>
    <% } else { %>
      <span class="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl bg-white/60 px-4 py-2.5 text-sm font-semibold text-slate-300 ring-1 ring-slate-200">
        Next
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
      </span>
    <% } %>
  </div>
<% } %>

<%- include('partials/footer') %>
```

3. Save the file

---

## Step 5: Create the Pokemon Detail Page

This is the **"view a Pokemon with all of its stats"** page: a type-colored hero with the artwork, plus description, quick facts, abilities, and animated base-stat bars.

1. Create a new file `src/views/pokemon.ejs`

2. Add this code:

```html
<%
  const primary = pokemon.types[0] || 'normal';
  const c = typeColors[primary] || '#9099a1';
  const idStr = String(pokemon.id).padStart(3, '0');
%>
<%- include('partials/header') %>

<!-- Back link -->
<a href="javascript:history.back()" class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-brand-600">
  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
  Back
</a>

<article class="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card animate-fade-up">
  <div class="grid gap-0 lg:grid-cols-[minmax(0,420px)_1fr]">
    <!-- LEFT: hero -->
    <div class="relative flex flex-col items-center justify-center gap-5 p-8 lg:p-10"
         style="background: linear-gradient(160deg, <%= c %> 0%, <%= c %>cc 55%, <%= c %>99 100%);">
      <div class="pointer-events-none absolute inset-0 opacity-30"
           style="background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,.6) 1px, transparent 0); background-size: 22px 22px;"></div>

      <div class="relative flex w-full items-center justify-between text-white">
        <span class="rounded-full bg-white/20 px-3 py-1 text-sm font-bold tabular-nums ring-1 ring-white/30 backdrop-blur">#<%= idStr %></span>
        <div class="flex flex-wrap justify-end gap-1.5">
          <% pokemon.types.forEach((type) => { %>
            <span class="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ring-white/30 backdrop-blur"><%= type %></span>
          <% }); %>
        </div>
      </div>

      <div class="relative grid place-items-center">
        <span class="absolute h-56 w-56 rounded-full bg-white/15 blur-2xl"></span>
        <img src="<%= pokemon.image || pokemon.sprite %>" alt="<%= pokemon.displayName %>"
             class="relative h-56 w-56 object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.35)] animate-float" />
      </div>

      <div class="relative text-center text-white">
        <h1 class="text-3xl font-extrabold tracking-tight drop-shadow-sm"><%= pokemon.displayName %></h1>
        <p class="mt-1 text-sm font-medium text-white/80"><%= pokemon.genus %></p>
      </div>
    </div>

    <!-- RIGHT: details -->
    <div class="flex flex-col gap-8 p-6 sm:p-8 lg:p-10">
      <!-- Description -->
      <section>
        <h2 class="text-xs font-bold uppercase tracking-widest text-slate-400">Pokédex entry</h2>
        <p class="mt-2 leading-relaxed text-slate-700"><%= pokemon.description %></p>
      </section>

      <!-- Quick facts -->
      <section class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <% const facts = [
          { label: 'Height', value: pokemon.height + ' m' },
          { label: 'Weight', value: pokemon.weight + ' kg' },
          { label: 'Capture rate', value: pokemon.captureRate },
          { label: 'Happiness', value: pokemon.baseHappiness }
        ]; %>
        <% facts.forEach((f) => { %>
          <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400"><%= f.label %></p>
            <p class="mt-1 text-lg font-bold tabular-nums text-slate-900"><%= f.value %></p>
          </div>
        <% }); %>
      </section>

      <!-- Abilities -->
      <section>
        <h2 class="text-xs font-bold uppercase tracking-widest text-slate-400">Abilities</h2>
        <div class="mt-3 flex flex-wrap gap-2">
          <% pokemon.abilities.forEach((ability) => { %>
            <span class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <%= ability.name %>
              <% if (ability.isHidden) { %>
                <span class="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-600">Hidden</span>
              <% } %>
            </span>
          <% }); %>
        </div>
      </section>

      <!-- Stats -->
      <section>
        <div class="flex items-center justify-between">
          <h2 class="text-xs font-bold uppercase tracking-widest text-slate-400">Base stats</h2>
          <span class="text-sm font-bold text-slate-900">Total <span class="tabular-nums" style="color: <%= c %>"><%= pokemon.totalStats %></span></span>
        </div>
        <div class="mt-4 space-y-3">
          <% pokemon.stats.forEach((stat) => {
            const pct = Math.min((stat.value / 255) * 100, 100);
          %>
            <div class="grid grid-cols-[72px_1fr_44px] items-center gap-3">
              <span class="text-xs font-semibold text-slate-500"><%= stat.name %></span>
              <div class="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div class="stat-bar h-full rounded-full" style="width: 0%; background-color: <%= c %>;" data-width="<%= pct %>"></div>
              </div>
              <span class="text-right text-sm font-bold tabular-nums text-slate-900"><%= stat.value %></span>
            </div>
          <% }); %>
        </div>
      </section>
    </div>
  </div>
</article>

<script>
  // Animate stat bars after paint.
  window.requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll('.stat-bar').forEach((bar) => {
        bar.style.width = bar.dataset.width + '%';
      });
    }, 80);
  });
</script>

<%- include('partials/footer') %>
```

3. Save the file

> The stat bars render at `width: 0%`, then a tiny script sets each bar's width to its `data-width`. Combined with the `.stat-bar { transition: width ... }` rule in the header, that produces the "filling up" animation.

---

## Step 6: Create the Error Page

1. Create a new file `src/views/error.ejs`

2. Add this code:

```html
<%- include('partials/header') %>

<div class="flex min-h-[55vh] flex-col items-center justify-center text-center animate-fade-up">
  <!-- Pokéball -->
  <div class="relative h-28 w-28 animate-float">
    <div class="absolute inset-0 rounded-full bg-gradient-to-b from-brand-500 to-brand-600"></div>
    <div class="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 bg-slate-900"></div>
    <div class="absolute inset-0 top-1/2 rounded-b-full bg-white"></div>
    <div class="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-[6px] ring-slate-900"></div>
    <div class="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-100 ring-2 ring-slate-300"></div>
  </div>

  <h1 class="mt-8 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl"><%= message %></h1>
  <p class="mt-2 max-w-md text-slate-500"><%= error %></p>

  <a href="/" class="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700">
    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
    Back to Pokédex
  </a>
</div>

<%- include('partials/footer') %>
```

3. Save the file

---

## Step 7: Verify Your Views

You should now have these files:

```
src/views/
├── index.ejs           # Home page (list / search / type filter)
├── pokemon.ejs         # Detail page
├── error.ejs           # Error page
└── partials/
    ├── header.ejs      # <head> + Tailwind CDN + navigation
    ├── footer.ejs      # Page footer
    └── card.ejs        # A single Pokemon card
```

> You can't open these in a browser yet — they need the Express server to provide data and the `typeColors` helper. We build that next, in **Part 09**.

---

## Understanding EJS Patterns

### Including Partials

```html
<%- include('partials/header') %>
```

### Passing Data to a Partial

```html
<%- include('partials/card', { poke }) %>
```

### Loops

```html
<% pokemon.forEach((poke) => { %>
  <div><%= poke.name %></div>
<% }); %>
```

### Conditionals

```html
<% if (searchQuery) { %>
  <p>Searching for: <%= searchQuery %></p>
<% } %>
```

---

## Step 8: Commit Your Progress

1. Stage your changes:

```bash
git add .
```

2. Commit with the conventional format:

```bash
git commit -m "feat: add EJS views styled with Tailwind CSS"
```

---

## What's Next?

Our layers and templates are ready. Now let's create the application entry point (`src/app.js`) that wires everything together — **before** we test it.

Next: [09 - Building the App Entry Point](./09-building-the-app.md)
