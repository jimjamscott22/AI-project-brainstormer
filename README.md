# Personal Project Idea Generator

Generate solo-friendly project ideas from your interests, skills, time budget, and constraints. The UI is built with React + Vite and currently uses a template-based generator you can swap for a local LLM.

## What it does
- Collects a short personal brief (interests, skills, time, goal, constraints).
- Produces six scoped project ideas with effort and impact signals.
- Keeps everything local by default.

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
- Update the template logic in `src/services/brainstormService.ts`.
- Adjust fields and copy in `src/components/BrainstormForm.tsx` and `src/App.tsx`.
- Replace the template generator with a local LLM call (Ollama, WebLLM, etc.) in `src/services/brainstormService.ts`.

## Build and preview
- Build for production:

```bash
npm run build
```

- Preview the build locally:

```bash
npm run preview
```
