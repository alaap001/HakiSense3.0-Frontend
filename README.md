# HakiSense 3.0 — Frontend

React 19 + Vite 7 + TypeScript web app for the HakiSense equity-research engine.
Enter a ticker, watch the research stream live, and read the rendered dossier.

> **Hard product rule (mirrors the backend gate): research, NOT recommendations —
> no BUY / HOLD / SELL.**

## Stack

- **React 19 / Vite 7 / TypeScript** — app shell + build.
- **Tailwind CSS v3** + **shadcn/ui** (Radix) — the ported 2.0 design system
  (violet/dark "fintech" palette, glass surfaces). Theme tokens live in
  `src/index.css`; palette/fonts in `tailwind.config.js`.
- **React Router 7** + **TanStack Query 5** — routing + data (wired in later phases).
- **@supabase/supabase-js** — auth (Phase C).
- **react-markdown + remark-gfm** — render the report / metric markdown (Phase D).

## Develop (two terminals)

```bash
# Terminal 1 — backend (from HakiSense-3.0-Backend)
pip install -e ".[server]"
hakisense-serve                 # http://localhost:7777  (Swagger at /docs)

# Terminal 2 — this app
npm install                     # needs Node 20.19+ or 22.12+
cp .env.example .env            # fill in Supabase keys when you reach Phase C
npm run dev                     # http://localhost:5173
```

The app calls `/agentos/*`, which the Vite dev proxy forwards to
`http://localhost:7777` (see `vite.config.ts`), so there's no CORS to fight in dev.

## Build / lint

```bash
npm run build                   # tsc -b && vite build
npm run lint
```

## Market (US / India)

The whole app targets one equities market, selected by `VITE_MARKET` in `.env`:

- `us` (default) — USD pricing, NYSE/Nasdaq, US example tickers, the US universe.
- `in` — INR pricing, NSE, Indian example tickers, the NSE universe.

This is the single source of truth in `src/lib/market.ts` (`MARKET`, `formatMoney`,
`formatNumber`); components read from it instead of hard-coding `$`/`₹` or `NYSE`/`NSE`.
After changing the market, regenerate the ticker index for it (below) and restart Vite.

## Ticker search

The in-app search (⌘K / Ctrl+K palette, the Dashboard combobox, and the public-landing
"Search stocks" button) is fully client-side. It loads `public/tickers.<market>.json` —
an identity-only index (symbol, company name, sector/exchange; **no prices, no
recommendations**) generated from:

- **US** — `data/us_universe.json` (NYSE + Nasdaq, ~7.6k names; mirrored from the backend `db/`)
- **India** — `data/Tickers.csv` (the NSE list, ~5.7k names)

To regenerate after editing a source:

```bash
npm run build:tickers:us        # data/us_universe.json → public/tickers.us.json
npm run build:tickers:in        # data/Tickers.csv      → public/tickers.in.json
```

Both `public/tickers.*.json` files are committed so production builds don't need the
sources. Selecting a result routes to `/dashboard?ticker=SYMBOL` (signed-out users sign
in first, then land prefilled). The engine accepts any ticker, so a free-typed symbol
still runs even if it isn't in the list.

## Theming (light / dark)

The app ships a **light** theme (aesthetic off-white, the default) and the original
**dark** theme (violet-noir). Switch between them in **Settings → Appearance**; the
choice is saved to `localStorage` (`hakisense:theme`) and applied before first paint
(inline script in `index.html`) to avoid a flash.

Theming is pure CSS variables: `:root` holds the light palette, `.dark` (toggled on
`<html>` by `ThemeProvider`) holds the dark palette. Tailwind colors map to those vars —
`text-text-primary`/`-secondary`, `text-brand[-strong]` (readable accent), `border-hairline[-strong]`,
`bg-surface[-strong]`, `bg-panel`, plus shadcn's `bg-background`/`bg-card`/`bg-popover`/… —
so components are theme-agnostic. Use these tokens (not raw `white/…`, `black/…`, or
`violet-300` text) for any new UI so it works in both themes.

## Status

- **Phase B (done):** scaffold + ported 2.0 design system + dev proxy. The landing
  page is a styled placeholder proving the design system renders.
- **Next:** Phase C (Supabase auth + AgentOS API client + SSE streaming hook),
  Phase D (Desk dossier renderer), Phase E (pages, history, real landing).

See `../HAKISENSE-3.0-PLAN.md` for the full multi-phase plan.
