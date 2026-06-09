# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

공아요 (gongayo) — "공부를 아시나요?" An AI-powered study-analysis service for Korean students: analyzes wrong answers, maps weak topics to recommended lectures, and predicts university admission likelihood. UI text and code comments are in Korean.

## Commands

```bash
npm run dev        # Vite dev server on http://localhost:5173
node server.js     # Local AI proxy on http://localhost:3001 (REQUIRED for AI features in dev)
npm run build      # Production build → dist/
npm run preview    # Preview the production build
```

There is no test suite, linter, or formatter configured.

**For AI features to work locally you must run BOTH `node server.js` and `npm run dev` together.** Vite proxies `/api` → `localhost:3001` (see `vite.config.js`), and `server.js` is what actually forwards requests to Anthropic.

## Environment

Copy `.env.example` → `.env.local` and fill in keys. Note the two different variable names for the same key depending on runtime:
- `VITE_ANTHROPIC_API_KEY` — read by `server.js` (local dev).
- `ANTHROPIC_API_KEY` — read by `api/ai.js` (Vercel serverless, production).

`.env.local` is gitignored. Supabase keys are listed in `.env.example` but are not yet wired into any code.

## Architecture — read this first

This repo contains **two separate front ends** plus **two interchangeable AI backends**. This split is the main thing to understand before editing.

### Two front ends (currently disconnected)
1. **`index.html`** — a large (~50KB), fully standalone vanilla-JS marketing/landing page with all CSS and JS inlined. It has its own interactive "체험" (try-it) quiz feature that calls the AI directly. **It does NOT contain a `<div id="root">` or import `/src/main.jsx`**, so it does not mount the React app. Because Vite uses `index.html` as its entry point, this landing page is what `npm run dev` / `npm run build` actually serves.
2. **`src/` React SPA** — a separate React 18 app (`main.jsx` → `App.jsx`) that is **not referenced by the current `index.html`** and is therefore effectively orphaned in the current build. `App.jsx` is a manual tab router (no react-router): state in `App.jsx` holds a single `studentData` object passed down to four pages — `Dashboard`, `ExamAnalyzer` (the core feature), `WeaknessMap`, `UnivPredictor` — with `Nav` switching the active page by index.

When asked to change "the site," confirm which front end is meant. To actually serve the React app, `index.html` would need a `#root` div and a `<script type="module" src="/src/main.jsx">`.

### Two AI backends (same contract)
Both expose `POST /api/ai`, set permissive CORS, and forward to `https://api.anthropic.com/v1/messages` using model `claude-sonnet-4-20250514` and `anthropic-version: 2023-06-01`. Keep them in sync when changing the AI contract:
- **`server.js`** — local dev only. Plain Node `http` server, manually parses `VITE_ANTHROPIC_API_KEY` out of `.env.local`. Does **not** forward a `system` prompt.
- **`api/ai.js`** — Vercel serverless function. Reads `ANTHROPIC_API_KEY` from env and **does** forward `system`.

Client code calls the relative path `/api/ai` so the same code works against either backend (Vite proxy in dev, Vercel routing in prod).

## Deployment

Vercel. Build output is `dist/`. Set the API key as `ANTHROPIC_API_KEY` in the Vercel dashboard. `api/ai.js` is auto-deployed as a serverless function.

## Gotchas

- **`vite.config.js` declares `export default` three times.** Only the last one (the `/api` proxy config) takes effect; the earlier `build.outDir: 'dist'` override is dead. Consolidate into a single config object if you touch this file — and verify the `react()` plugin and proxy are both present in the surviving export.
- `dfsa/` is an empty stray directory.
