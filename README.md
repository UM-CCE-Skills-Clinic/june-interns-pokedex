# 🔴 Pokedex App

A Pokedex web application built with Node.js and Express.js, featuring a layered architecture pattern. This project serves as a learning resource for understanding modern web development practices.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=flat&logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

## ✨ Features

- 📋 Paginated list of Pokemon
- 🔍 Search Pokemon by name
- 🏷️ Filter Pokemon by type
- 📄 Detailed Pokemon information pages
- 🌐 RESTful JSON API endpoints
- 🎨 Server-side rendered HTML views with EJS

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework |
| **EJS** | Template engine |
| **Axios** | HTTP client |
| **PokeAPI** | Pokemon data source |
| **Jest** | Testing framework |

## 📚 Documentation

**👉 [Start the Guide](docs/guide/00-introduction.md)**

This project includes a comprehensive step-by-step guide for building the application:

| Part | Topic | Link |
|------|-------|------|
| 00 | Introduction | [Read](docs/guide/00-introduction.md) |
| 01 | Project Setup | [Read](docs/guide/01-project-setup.md) |
| 02 | Understanding Architecture | [Read](docs/guide/02-understanding-architecture.md) |
| 03 | Configuration | [Read](docs/guide/03-configuration.md) |
| 04 | Building the Repository | [Read](docs/guide/04-building-the-repository.md) |
| 05 | Building the Service | [Read](docs/guide/05-building-the-service.md) |
| 06 | Building the Controller | [Read](docs/guide/06-building-the-controller.md) |
| 07 | Building the Routes | [Read](docs/guide/07-building-the-routes.md) |
| 08 | Building the Views | [Read](docs/guide/08-building-the-views.md) |
| 09 | Styling | [Read](docs/guide/09-styling.md) |
| 10 | Testing | [Read](docs/guide/10-testing.md) |
| 11 | Running the App | [Read](docs/guide/11-running-the-app.md) |

## 🚀 Quick Start

### Prerequisites

- Node.js (version 18 or higher)
- npm (comes with Node.js)

### Installation

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

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the production server |
| `npm run dev` | Start development server with hot reload |
| `npm test` | Run tests with coverage |
| `npm run lint` | Check code for linting errors |
| `npm run lint:fix` | Fix linting errors automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

## 🏗️ Project Architecture

This project follows a **layered architecture** pattern:

```
Routes → Controllers → Services → Repositories → External API (PokeAPI)
```

```
src/
├── app.js              # Application entry point
├── config/             # Configuration files
├── controllers/        # HTTP request handlers
├── repositories/       # Data access layer
├── routes/             # URL routing
├── services/           # Business logic
└── views/              # EJS templates

public/
└── css/                # Stylesheets
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Tests are located in the `tests/` directory and cover:
- API endpoints (`api.test.js`)
- Repository layer (`pokemonRepository.test.js`)
- Service layer (`pokemonService.test.js`)

## 📄 License

This project is licensed under the MIT License.

---

**Happy Coding! 🎮**
