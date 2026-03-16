# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (root)
```bash
npm run dev      # Start Vite dev server at http://localhost:5173
npm run build    # TypeScript compile + Vite production build
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

### Backend (server/)
```bash
cd server
npm run dev      # Express API with tsx watch (hot reload)
npm run start    # Express API production mode
```

Both must run simultaneously during development. The frontend Vite dev server proxies `/api/ideas` → `http://localhost:3001` (Express), `/api/ollama` → `http://localhost:11434`, `/api/llm-studio` → `http://localhost:1234`.

## Environment Variables

Copy `.env.example` to `.env` in the root. The backend reads `.env` from the parent directory of `server/`.

```
# Frontend (Vite - must prefix VITE_)
VITE_STORAGE_BACKEND=mariadb
VITE_MARIADB_API_URL=/api
VITE_OLLAMA_ENDPOINT=http://localhost:11434
VITE_LMSTUDIO_ENDPOINT=http://localhost:1234

# Backend (Express)
MARIADB_HOST=localhost
MARIADB_PORT=3306
MARIADB_USER=ai_brainstormer_user
MARIADB_PASSWORD=<password>
MARIADB_DATABASE=ai_brainstormer
API_PORT=3001
```

## Architecture

This is a personal AI project idea generator with local LLM integration.

**Data flow:**
1. User fills `BrainstormForm` (interests, skills, time budget, goal, constraints)
2. `brainstormService` calls `llmProviderService` (Ollama or LM Studio) or falls back to template generation
3. Returns 6 scoped solo-friendly project ideas displayed in `IdeaDashboard`
4. User selects an idea → elaboration panel with detailed breakdown
5. Ideas can be exported (JSON/Markdown via `exportService`) or saved to MariaDB via Express API

**Frontend (`src/`)**
- `App.tsx` — top-level state management, orchestrates all views and modals
- `components/BrainstormForm.tsx` — user input form
- `components/IdeaDashboard.tsx` — idea cards grid + elaboration detail panel
- `components/LLMSidebar.tsx` — provider detection, model selection, temperature/token controls
- `components/SavedIdeasView.tsx` — browse/delete ideas from database
- `services/brainstormService.ts` — idea generation logic (LLM prompt + template fallback)
- `services/llmProviderService.ts` — Ollama/LM Studio auto-detection, model listing, caching (5-min localStorage cache)
- `services/persistenceService.ts` — storage abstraction layer
- `services/mariadbPersistenceService.ts` — HTTP client for Express API
- `services/exportService.ts` — JSON/Markdown export

**Backend (`server/`)**
- `index.ts` — Express app with CORS, three routes: `POST /api/ideas`, `GET /api/ideas`, `DELETE /api/ideas/:id`
- `db.ts` — MariaDB connection pool (pool limit: 5)
- `migrations/001_create_project_ideas.sql` — database schema (run manually)

**Database schema** (`project_ideas` table): `id` (UUID), `title`, `description`, `priority/effort/impact` (ENUM High/Medium/Low), `elaboration` (JSON), `context` (JSON), `created_at`, `updated_at`.

## Key Decisions

- **LLM providers**: Auto-detected at runtime; frontend talks to Ollama/LM Studio directly via Vite proxy (dev) or nginx reverse proxy (prod). No API keys required — local models only.
- **Persistence**: `VITE_STORAGE_BACKEND` controls the storage driver. Currently `mariadb` is the only implemented backend in `mariadbPersistenceService.ts`.
- **No migrations runner**: The SQL migration file must be applied manually to the MariaDB database before first use.
- **Tailwind CSS v4**: Uses the `@tailwindcss/vite` plugin, not the legacy PostCSS config approach.
