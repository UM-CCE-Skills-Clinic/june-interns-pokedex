# Pokedex App - Beginner's Guide

Welcome to the Pokedex App tutorial! This guide will walk you through building a complete web application using Node.js and Express.js.

## What We're Building

A Pokedex web application that:

- Displays a paginated list of Pokemon
- Shows detailed information about each Pokemon (with animated stat bars)
- Allows searching Pokemon by name or ID
- Filters Pokemon by type
- Provides both HTML pages and JSON API endpoints

## Technologies Used

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime for server-side code |
| **Express.js** | Web framework for handling HTTP requests |
| **EJS** | Template engine for rendering HTML pages |
| **Tailwind CSS (Play CDN)** | Utility-first styling — loaded from a CDN, no build step |
| **Axios** | HTTP client for making API requests |
| **PokeAPI** | External API providing Pokemon data |
| **Jest + Supertest** | Testing the service and HTTP layers |

## Prerequisites

Before starting, make sure you have:

1. **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
2. **Git** - [Download here](https://git-scm.com/)
3. **A GitHub account** - [Sign up here](https://github.com/)
4. **A code editor** - We recommend [VS Code](https://code.visualstudio.com/)
5. **Basic knowledge of:**
   - JavaScript (variables, functions, async/await)
   - HTML and CSS basics
   - Command line/terminal usage

## How to Verify Installation

Open your terminal and run:

```bash
node --version
npm --version
git --version
```

You should see version numbers displayed. If not, install the missing tools first.

## Guide Structure

This guide is split into the following sections. **Follow them in order — each section builds on the previous one, and nothing should be skipped.**

| Part | Topic | Description |
|------|-------|-------------|
| 01 | Project Setup | Fork, clone, and set up the project |
| 02 | Architecture | Understand the layered architecture pattern |
| 03 | Configuration | Set up environment variables and config |
| 04 | Repository Layer | Build the data access layer for PokeAPI |
| 05 | Service Layer | Create business logic and data transformation |
| 06 | Controller Layer | Handle HTTP requests and responses |
| 07 | Routes | Set up URL routing |
| 08 | Views | Create EJS templates styled with Tailwind CSS |
| 09 | App Entry Point | Create `src/app.js` to wire everything together |
| 10 | Testing | Write tests and verify everything works |
| 11 | Running the App | Start, use, and ship the application |

> **Important — build order:** We create the application entry point (`src/app.js`) in **Part 09**, *before* we write tests in **Part 10**. You cannot test an app that doesn't exist yet, so the entry point always comes first.

## What's Already Set Up

The repository comes with these files pre-configured:

```
inter-workshop/
├── guide/              # This tutorial
├── tests/              # You will create test files here in Part 10
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
├── .prettierrc         # Code formatting config
├── eslint.config.js    # Linting rules
├── jest.config.js      # Test runner config
├── package.json        # Dependencies and scripts
└── package-lock.json   # Locked dependency versions
```

You will be creating the `src/` directory (your application code) and a `public/` directory (for static assets) as you follow the guide.

## Key Concepts You'll Learn

### 1. Layered Architecture

We'll use a clean separation of concerns:

```
Routes → Controllers → Services → Repositories → External API
```

Each layer has a specific job, making the code easier to understand, test, and maintain.

### 2. Server-Side Rendering

Unlike single-page applications (SPAs), this app renders HTML on the server using EJS templates. The browser receives complete HTML pages.

### 3. Utility-First Styling with Tailwind

Instead of writing a separate CSS file, we style directly in our EJS markup using Tailwind utility classes, loaded from the Tailwind **Play CDN**. There is no build step — a single `<script>` tag in the page `<head>` is all it takes.

### 4. RESTful API Design

We'll create both:
- **View routes** - Return HTML pages for browsers
- **API routes** - Return JSON data for programmatic access

### 5. External API Integration

We'll learn how to:
- Make HTTP requests to external APIs
- Handle API responses and errors
- Transform data for our application's needs

## Commit Message Format

When committing your work, follow the **Conventional Commits** format:

```
<type>: <description>
```

> **Where does my student info go?** Not in the commit — it goes in your **Pull Request description** at the very end (Part 11). The submission pipeline reads four fields from the PR body: `First Name`, `Last Name`, `Program`, and `UMindanao Email` (which must be a `@umindanao.edu.ph` address). The repo's PR template already lays these out for you.

### Commit Types

| Type | When to Use |
|------|-------------|
| `feat` | Adding a new feature |
| `fix` | Fixing a bug |
| `docs` | Documentation changes |
| `style` | Code formatting (no logic changes) |
| `refactor` | Code restructuring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

### Example Commit Message

```
feat: add pokemon search functionality
```

## Tips for Beginners

1. **Type the code yourself** - Don't just copy-paste. Typing helps you learn.
2. **Read the comments** - They explain what each part does.
3. **Experiment** - Try changing things to see what happens.
4. **Use `console.log()`** - Print values to understand data flow.
5. **Don't skip steps** - Each section builds on the previous one.
6. **Commit often** - Save your progress with meaningful commits.

## Getting Help

If you get stuck:

1. Check for typos in your code
2. Make sure all files are saved
3. Restart your server after making changes
4. Read error messages carefully - they often tell you what's wrong

## Ready to Start?

Let's begin with [01 - Project Setup](./01-project-setup.md)!
