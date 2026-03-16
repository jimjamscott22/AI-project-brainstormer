# Personal Project Idea Generator

Generate solo-friendly project ideas from your interests, time budget, constraints, and explicit tech preferences. The UI is built with React + Vite and can use local LLMs for both idea generation and guided planning.

## What it does
- Collects a structured project brief: interests, goal, time budget, platform, language/framework preferences, backend expectations, and constraints.
- Produces six scoped project ideas with effort and impact signals that match the selected stack direction.
- Lets you answer follow-up planning questions and generate a concrete build plan for a chosen idea.
- Keeps everything local by default.

## Features
- **LLM Provider Management:**
  - Automatic detection of Ollama and LM Studio
  - Switch between models with a click
  - Real-time provider status monitoring
  - Cached provider discovery (5-minute cache)
  
- **Model Configuration:**
  - Adjustable temperature (0-2)
  - Adjustable max tokens (500-4000)
  - Settings persist across sessions

- **Smart Fallback:**
  - Uses local LLM when available
  - Falls back to stack-aware template generation if LLM fails
  - Error notifications with toast alerts

- **Guided Planning Mode:**
  - Asks follow-up implementation questions after you select an idea
  - Produces recommended stack, architecture summary, milestones, risks, and descoping options
  - Uses the same local LLM provider selection as idea generation, with template fallback when needed

- **Responsive Sidebar:**
  - Collapsible LLM provider panel
  - Model metadata (size, quantization)
  - Active model indicator

## Quick start
- Install dependencies:

```bash
npm install
```

- Start the dev server:

```bash
npm run dev
```

Open http://localhost:5173 in your browser (Vite default).

## Customize the generator
- Update the structured criteria, fallback templates, and planning prompts in `src/services/brainstormService.ts`.
- Adjust intake fields in `src/components/BrainstormForm.tsx`.
- Adjust UI copy and planning flow in `src/App.tsx` and `src/components/IdeaDashboard.tsx`.
- Replace or extend the local model transport in `src/services/llmProviderService.ts`.

## Build and preview

### Development Build
The dev server includes a proxy to bypass CORS issues with Ollama and LM Studio.

### Production Build

1. **Build for production:**

```bash
npm run build
```

2. **Preview the build locally:**

```bash
npm run preview
```

### Production Deployment Notes

**CORS Configuration:**
In production, the browser will make direct requests to Ollama/LM Studio. You have three options:

1. **Run LLMs with CORS enabled:**
   - Ollama: Set `OLLAMA_ORIGINS=*` environment variable before starting
   - LM Studio: Enable CORS in server settings

2. **Use a reverse proxy:**
   - Set up nginx/caddy to proxy requests and add CORS headers
   - Update `.env` file with your proxy URLs:
     ```
     VITE_OLLAMA_ENDPOINT=http://your-server.com/ollama
     VITE_LMSTUDIO_ENDPOINT=http://your-server.com/lmstudio
     ```

3. **Deploy on localhost:**
   - If serving the built app on `localhost`, CORS may not be an issue
   - Default endpoints work: `http://localhost:11434` and `http://localhost:1234`

### Environment Variables

Create a `.env` file to customize storage and LLM endpoints:

```bash
# .env
VITE_STORAGE_BACKEND=mariadb
VITE_MARIADB_API_URL=/api
VITE_OLLAMA_ENDPOINT=http://localhost:11434
VITE_LMSTUDIO_ENDPOINT=http://localhost:1234
```

These values will be used in the production build.
