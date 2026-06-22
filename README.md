# 🔴 Pokedex App — Build It Yourself

A hands-on tutorial for building a **Pokedex web application** with Node.js and Express.js using a clean **layered architecture**. You learn by building: the application source code is **not included** — you create it yourself, step by step, by following the guide.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=flat&logo=express&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-Templates-b4ca65?style=flat)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CDN-38bdf8?style=flat&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

---

## 📚 Start Here — The Guide

> ### 👉 **[Open the Guide → Part 00: Introduction](guide/00-introduction.md)**
>
> This is the heart of the project. The guide walks you through building the **entire** app from an empty folder to a finished, tested application — in order, with nothing skipped.

| Part | Topic                      | Link                                           |
| ---- | -------------------------- | ---------------------------------------------- |
| 00   | Introduction               | [Read](guide/00-introduction.md)               |
| 01   | Project Setup              | [Read](guide/01-project-setup.md)              |
| 02   | Understanding Architecture | [Read](guide/02-understanding-architecture.md) |
| 03   | Configuration              | [Read](guide/03-configuration.md)              |
| 04   | Building the Repository    | [Read](guide/04-building-the-repository.md)    |
| 05   | Building the Service       | [Read](guide/05-building-the-service.md)       |
| 06   | Building the Controller    | [Read](guide/06-building-the-controller.md)    |
| 07   | Building the Routes        | [Read](guide/07-building-the-routes.md)        |
| 08   | Building the Views         | [Read](guide/08-building-the-views.md)         |
| 09   | App Entry Point            | [Read](guide/09-building-the-app.md)           |
| 10   | Testing                    | [Read](guide/10-testing.md)                    |
| 11   | Running the App            | [Read](guide/11-running-the-app.md)            |

> ℹ️ **No `src/` folder?** That's intentional. You'll create every file in `src/` as you work through Parts 01–11. By the end you'll have a complete, running Pokedex.

---

## ✨ What You'll Build

- 📋 Paginated list of Pokemon
- 🔍 Search Pokemon by name or ID
- 🏷️ Filter Pokemon by type
- 📄 Detailed Pokemon pages with full stats
- 🌐 RESTful JSON API endpoints
- 🎨 Server-side rendered views (EJS) styled with Tailwind CSS

## 🛠️ Tech Stack

| Technology             | Purpose                               |
| ---------------------- | ------------------------------------- |
| **Node.js**            | JavaScript runtime                    |
| **Express.js**         | Web framework                         |
| **EJS**                | Template engine                       |
| **Tailwind CSS (CDN)** | Utility-first styling — no build step |
| **Axios**              | HTTP client                           |
| **PokeAPI**            | Pokemon data source                   |
| **Jest + Supertest**   | Testing framework                     |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm (comes with Node.js)

### Set up your workspace

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/interns-pokedex.git
   cd interns-pokedex
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

4. **Open the guide and start building**

   👉 **[guide/00-introduction.md](guide/00-introduction.md)**

> The app can only run after you've built `src/` by following the guide. Once you reach **Part 09**, `npm run dev` will start the server at `http://localhost:3000`.

## 📜 Available Scripts

> These become available as you build the app in the guide.

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm start`            | Start the production server              |
| `npm run dev`          | Start development server with hot reload |
| `npm test`             | Run tests with coverage                  |
| `npm run lint`         | Check code for linting errors            |
| `npm run lint:fix`     | Fix linting errors automatically         |
| `npm run format`       | Format code with Prettier                |
| `npm run format:check` | Check code formatting                    |

---

## 🏗️ Project Architecture

You'll build the app following a **layered architecture** pattern:

```
Routes → Controllers → Services → Repositories → External API (PokeAPI)
```

The `src/` structure you create as you follow the guide:

```
src/
├── app.js              # Application entry point (Part 09)
├── config/             # Configuration files
├── controllers/        # HTTP request handlers
├── repositories/       # Data access layer
├── routes/             # URL routing
├── services/           # Business logic
└── views/              # EJS templates (styled with Tailwind CDN)

public/                 # Static assets (styling via Tailwind CDN — no CSS build)
```

## 🧪 Testing

In **[Part 10](guide/10-testing.md)** you'll write and run the test suite:

```bash
npm test
```

The tests cover:

- API endpoints (`tests/api.test.js`)
- Service layer (`tests/pokemonService.test.js`)

---

## 📄 License

This project is licensed under the MIT License.

---

**Happy Coding! 🎮**
