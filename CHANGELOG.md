# Changelog — HakiSense 3.0 Frontend

## 2026-06-04 — Flesh out .gitignore

**Task:** Write a proper `.gitignore` for the frontend repo.

**Changed:**
- `.gitignore` — expanded the Vite default to a complete set for this Vite + React + TS (npm) project: kept deps/build/logs/env/editor/OS rules and added `*.tsbuildinfo`, `.eslintcache`, `coverage`/`*.lcov`, `.vite` cache, `build`, Yarn PnP, `Thumbs.db`, `*.pem`, and temp dirs. `.env.example` stays tracked; `public/tickers.json`, `data/`, `scripts/`, `components.json`, and `package-lock.json` are intentionally NOT ignored. Verified nothing that should be ignored is currently git-tracked, so no untracking needed.

**Unchanged:** all source. **Execution model:** unchanged. **New dependencies:** none.

## 2026-06-04 — Restore the gentle float on the hero ticker pills

**Task:** The ticker pills (RELIANCE/TCS/INFY/HDFCBANK) used to slowly wiggle; they'd gone static. Bring the float back.

**Changed:**
- `src/pages/Landing.tsx` — re-added a looping `gsap.to` float to each `.stock-ticker` (`y: -5`, `sine.inOut`, `yoyo`, `repeat: -1`, `duration 2.4 + i*0.3`, `delay 1.5 + i*0.2`). The per-pill timing is slightly desynced so the row feels alive; the delay starts the float after the entrance fade-in so the two tweens don't fight over `y`. (This bob was removed earlier when the pills wrapped into a messy multi-row layout; in the current tidy single row it reads as a gentle drift, not scatter.)

**Unchanged:** everything else in the hero, theming, layout. **Execution model:** unchanged. **New dependencies:** none.

## 2026-06-04 — Light-theme hero photo + smooth-scroll the hero cue

**Task:** (1) Use the new `hero-bg-light-theme.png` as the light-theme hero backdrop, mirroring how dark uses `hero-bg.jpg`. (2) The "See what's inside" link jumped to the section; make it glide.

**Changed:**
- `src/pages/Landing.tsx`:
  - Backdrop — added `<img src="/hero-bg-light-theme.png">` (bright sunrise-city skyline) shown only in light (`block dark:hidden`); kept the dark `hero-bg.jpg`. Replaced the light-only `hero-aurora` div with the photo. The mute overlay now applies in both themes so dark text stays legible over the busy image: `bg-background/85` (light) · `dark:bg-background/80` (dark unchanged). Vignette kept.
  - Scroll cue — the "See what's inside" `<a href="#how">` now intercepts the click and calls `scrollIntoView({ block: "start", behavior: "smooth" })` (falls back to `"auto"` under `prefers-reduced-motion`; `href` retained as a no-JS fallback). Because the hero is pinned, the glide plays the hero's drift-out parallax on the way down.

**Unchanged:** dark hero backdrop, `PublicLayout`/`ProtectedLayout` light auroras, theming engine, all other links. **Execution model:** unchanged. **New dependencies:** none.

**Note:** `hero-bg-light-theme.png` is 2.7 MB — worth exporting to WebP/JPG (~200–400 KB) later for faster load.

## 2026-06-03 — Revert hero preview; restore the centered hero with more spacing

**Task:** The dossier-preview recompose was not wanted. Revert it, bring back the previous centered hero, and just add breathing room between the elements.

**Changed:**
- Deleted `src/components/landing/HeroPreview.tsx`.
- `src/pages/Landing.tsx` — restored the previous centered search-first hero (eyebrow pill → one-line headline → search + "Try" chips → ticker row → scroll cue) and the pinned scroll-out parallax. Widened the vertical rhythm so it breathes: eyebrow→headline `mb-10` (was `mb-7`), headline→search `mt-12` (was `mt-8`), search-block gap `gap-5` (was `gap-4`), search→tickers `mt-14` (was `mt-10`), scroll cue `mt-14`. Restored the `TICKERS` const + `TrendingUp`/`TrendingDown` imports; removed the `HeroPreview` import. The ticker row no longer uses a hardcoded `opacity-0` class — it fades in via a GSAP `from` tween, so it's never left invisible.

**Unchanged:** nav, below-fold sections, footer, palette, theming, HeroSearch. **Execution model:** unchanged. **New dependencies:** none.

## 2026-06-03 — Hero recompose: balanced & breathing, anchored by a product preview

**Task:** The minimal hero read as hollow — a cramped cluster (eyebrow/headline/search/chips) floating in a huge empty page, the ticker row not rendering (it relied on a delayed JS fade that left it invisible), and the scroll cue stranded in the void. Make it balanced, breathing, and professional.

**Changed:**
- `src/components/landing/HeroPreview.tsx` — NEW: a clean, on-brand "glimpse of the product" — a framed app-window dossier card built from the app's own tokens/vocabulary (a Thesis pillar with an evidence-strength bar, Bull/Bear/Fact findings each marked "cited", a Coverage indicator). Deliberately no price targets / BUY-SELL. (Did **not** use `public/dashboard.jpg` — it's off-brand "FINANCIUS PRO" AI-render art showing Portfolio/Top Movers/Gain, i.e. the recommendation framing the product rejects.)
- `src/pages/Landing.tsx` — recomposed the hero with a real spacing scale (natural top-down flow: `pt-28/32` … `mt-6` … `mt-9` … `mt-16`, instead of a small clump vertically-centered in a `min-h-screen` void). Headline is one line with presence (`text-4xl`/`sm:text-5xl`). The search stays the action; `HeroPreview` anchors the composition and fills the lower half. Removed the buggy invisible floating-ticker row (and the `TICKERS` const + `TrendingUp`/`TrendingDown` imports). Simplified GSAP: dropped the pinned scroll-out parallax + ticker tweens; the entrance now uses `from` tweens (so nothing is invisible if JS lags) and includes the preview; below-fold reveals kept.

**Unchanged:** the eyebrow pill, search + "Try" chips, scroll cue, below-fold sections, nav, footer, palette, theming. **Execution model:** unchanged. **Breaking changes:** the pinned hero-scroll parallax is removed (intentional). **New dependencies:** none.

## 2026-06-03 — Hero clean-up pass: less text, search as the clear focal point

**Task:** The centered hero was still cluttered — the giant 3-line uppercase headline dominated the viewport (pushing the search down) and the floating ticker pills read as scattered. Make it genuinely clean. Direction chosen by the developer: keep one calm headline line, drop the paragraph.

**Changed:**
- `src/pages/Landing.tsx` — replaced the huge `text-hero` 3-line uppercase headline with a single modest sentence-case line (`See what others miss in the filings`, `text-3xl`/`sm:text-4xl`, gradient on "others miss"). Removed the 3-line value-prop paragraph entirely (the eyebrow pill + search placeholder carry the message). Tightened vertical spacing so the search sits near center as the focal point. Slimmed the ticker pills into one tidy row of 4 (`rounded-full`, `text-[11px]`) and **removed the per-item bob** — that desynced float is what made them look scattered; they now just fade in. Simplified the GSAP entrance accordingly (dropped the dead `.hero-sub` tween + headline stagger; faster ticker fade-in).

**Unchanged:** the eyebrow pill, the search field + "Try" chips, the scroll cue, below-fold sections, nav, footer, palette, theming. **Execution model:** unchanged. **New dependencies:** none.

## 2026-06-03 — Redesign the hero: centered, search-first

**Task:** The hero was cluttered (3-line paragraph + two buttons + a busy globe card with floating tickers, chips, chart overlay and glows + the new search) with no clear "do this first". Make search the single obvious path and calm the composition. Direction chosen by the developer: centered, search-first.

**Changed:**
- `src/pages/Landing.tsx` — replaced the two-column hero with a single centered column: an eyebrow pill (`Research, not recommendations` = the "why"), the headline (unchanged), one concise sub-line, the `HeroSearch` field as the lone primary action with clickable example chips (`Try: RELIANCE · TCS · INFY`, open the palette), a calm 5-ticker glimpse strip, and a quiet "See what's inside ↓" scroll cue. Removed the right-side globe card, the two CTA buttons, and the redundant chart overlay/chips. Reworked the GSAP block to match (dropped the dead `.hero-card`/`.hero-img`/`.chart-line` tweens; the whole `.hero-inner` now drifts up + fades on the pinned scroll-out; added eyebrow + scroll-cue reveals; kept the ticker stagger/bob). Swapped the unused `Play` import for `ChevronDown`; added `useTickerSearch` for the example chips.
- `src/components/landing/HeroSearch.tsx` — simplified the placeholder to `Search any listed Indian stock…` (the example tickers now live in the chips).

**Unchanged:** below-fold sections (How it works / dossier / approach / CTA), nav, footer, the palette + ⌘K shortcut, theming. **Execution model:** unchanged. **New dependencies:** none.

## 2026-06-03 — Move stock search from the landing nav into the hero

**Task:** The ⌘K search button sat in the landing nav, taking up space. Put a prominent search bar front-and-center in the hero so it's the obvious way in.

**Changed:**
- `src/components/landing/HeroSearch.tsx` — NEW: a large search field (icon + enticing placeholder + ⌘K hint + arrow). It's a button styled as an input; clicking it (or ⌘K) opens the existing global ticker palette via `useTickerSearch().openSearch()` — no duplicated search logic, navigation to the dossier is unchanged. Carries the `hero-cta` class so it inherits the hero's GSAP entrance + scroll-out animations.
- `src/pages/Landing.tsx` — render `<HeroSearch />` in the hero left column, above the CTA buttons.
- `src/components/landing/LandingNav.tsx` — removed `<SearchTrigger />` and its now-unused import; search is gone from the public nav entirely (per request).

**Unchanged:** `TickerSearchProvider` / `TickerSearchDialog` (the palette), the global ⌘K shortcut, `AppNav` (dashboard nav keeps its search), `SearchTrigger` (still used by `AppNav`). **Execution model:** unchanged. **New dependencies:** none.

## 2026-06-03 — Remove in-page scroll links from the landing header

**Task:** Drop the "How it works", "Dossier", "Approach" nav links — they only scrolled the page and added clutter.

**Changed:** `src/components/landing/LandingNav.tsx` — removed the `LINKS` array and the desktop link row; tidied the actions group's now-redundant `md:ml-7`. The section anchors (`#how`, `#dossier`, `#approach`) remain, so the hero's "See what's inside" button still scrolls.

**Unchanged:** Landing sections/ids, logo, search, theme toggle, auth buttons. **Execution model:** unchanged. **New dependencies:** none.

## 2026-06-03 — Add a theme toggle to the nav bars (landing + app)

**Task:** Theme could only be switched in Settings — unreachable from the landing/public pages, so there was no way to see the dark landing.

**Changed:**
- `src/components/ThemeToggle.tsx` — NEW: a small sun/moon icon button wired to `useTheme().toggleTheme()` (shows the icon of the theme it switches to).
- `src/components/landing/LandingNav.tsx` — added `<ThemeToggle />` to the nav (covers Landing + all public pages).
- `src/components/AppNav.tsx` — added `<ThemeToggle />` to the app nav so the quick switch is available everywhere, not just Settings.

**Unchanged:** the Settings → Appearance control (kept), theming engine, all logic. **Execution model:** unchanged. **New dependencies:** none.

## 2026-06-03 — Fix: semantic colors + gradient unreadable in light theme

**Task:** In light mode the green "Bull" / red "Bear" badges, the amber gate-detector text, and the `text-gradient` headings were too pale to read (screenshots). They were fine in dark.

**Cause:** these were the colors left untouched by the theme refactor — fixed Tailwind palette shades (`emerald/rose/amber-300/400`) and a light violet gradient, all tuned for dark surfaces, so they wash out on white.

**Changed:**
- `src/index.css` — added theme-aware semantic tokens `--pos` / `--neg` / `--warn` (dark = bright emerald/rose/amber-400; light = deep, readable emerald-700 / rose-600 / amber-700) to both `:root` and `.dark`. Made `.text-gradient` theme-aware: deep saturated violets (`#5B21B6→#7C3AED`) on light, the original bright gradient kept under `.dark .text-gradient`.
- `tailwind.config.js` — added `pos` / `neg` / `warn` colors (alpha-aware).
- **Sweep across 9 dossier files + Landing** — `emerald-*`→`pos`, `rose-*`→`neg`, `amber-*`→`warn` (preserving `text/bg/border` prefix and any `/opacity`), so bull/bear/fact findings, scenario bars, red-flag cards, gate detectors/anomalies, coverage map, and the hero up/down tickers all read in both themes.

**Unchanged:** dark theme appearance (token dark values match the original shades), all logic, `violet-*` bar fills. **Execution model:** unchanged. **New dependencies:** none.

## 2026-06-03 — Fix: light theme looked flat/dull on app pages (depth + atmosphere)

**Task:** Dashboard / RunView (and other app + public pages) looked dull and flat in light theme — cards didn't stand out (screenshots).

**Cause:** the light background (`~99%` white) and the glass cards (white) were nearly the same color, so cards had no separation and the page read as a uniform white wash. (Dark theme avoids this — its bg is far darker than its cards.)

**Changed (light theme only; dark untouched):**
- `src/index.css` — retuned the light palette so white cards lift off the canvas: `--background` `250 40% 99%`→`250 30% 96%` (soft cool "paper"), `--secondary`/`--muted`/`--border` nudged darker for visible buttons/hairlines, glass made more solid + a tighter drop shadow (`--glass-bg` 0.75→0.86, `--card-glass-shadow` → defined lift), `--hairline`/`--surface` bumped for definition. Added `.app-aurora` (subtle violet top halo).
- `src/components/ProtectedLayout.tsx`, `src/components/site/PublicLayout.tsx` — added a light-only `.app-aurora` layer (`dark:hidden`, `fixed top-0 h-[55vh] z-0`) so app/public pages have gentle atmosphere instead of a flat void; wrapped ProtectedLayout's `Outlet` in `relative z-10` so content paints above it.

**Unchanged:** dark theme appearance, all logic, page structure/copy. **Execution model:** unchanged. **New dependencies:** none.

## 2026-06-03 — Fix: Landing/hero looked washed-out in light theme

**Task:** In the new light theme, the Landing page looked muddy and the cards washed-out (screenshots).

**Cause:** the Landing backdrop is a fixed dark city-skyline photo (`/hero-bg.jpg`) with a `bg-background/80` overlay. In light theme the ~80% off-white overlay let the dark photo bleed through as a gray wash, killing contrast for the glass cards on top.

**Changed:**
- `src/pages/Landing.tsx` — made the fixed backdrop theme-aware: the city photo + dark overlay now render **only in dark** (`hidden dark:block`); in **light** a new `.hero-aurora` layer (`dark:hidden`) shows a soft violet aurora over the off-white paper. Dark theme is unchanged.
- `src/index.css` — added `.hero-aurora` (layered violet radial gradients); strengthened light-theme glass for definition (`--glass-bg` 0.70→0.75, `--glass-border` 0.08→0.10, `--card-glass-shadow` → tighter lift + close ambient shadow). Dark glass values unchanged.

**Unchanged:** dark theme appearance, all logic, the hero finance-preview card and its image. **Execution model:** unchanged. **New dependencies:** none.

## 2026-06-03 — Add light + dark themes with a toggle (light is default)

**Task:** Add a polished light theme alongside the existing dark theme, with a switch in Settings; default to an aesthetic off-white, keep the violet-noir dark as the second option.

**Approach:** Tokenized every theme-dependent color as a CSS variable that flips on a `.dark` class (`:root` = light, `.dark` = the original dark values, preserved verbatim). Most of the UI flips for free; the rest was a mechanical sweep of inline dark-only utilities to the new tokens.

**Changed:**
- `src/index.css` — split palette into `:root` (light) + `.dark` (dark); added derived tokens (`--hairline[-strong]`, `--surface[-strong]`, `--panel`, `--brand[-strong]`, `--glass-*`, `--card-glass-shadow`, `--vignette`, `--grain-opacity`, `--btn-secondary-*`); rewrote `.glass`/`.glass-strong`/`.card-glass`/`.btn-secondary`/`.micro-label`/`.vignette`/`.grain` to read from vars.
- `tailwind.config.js` — retargeted `text.primary`/`text.secondary` to `hsl(var(--foreground|--muted-foreground) / <alpha-value>)`; added `brand[.strong]`, `hairline[.strong]`, `surface[.strong]`, `panel` colors; added `<alpha-value>` to `background` + `popover` (so translucent frosted headers/dropdowns keep their opacity now that they use CSS-var colors instead of hex).
- `index.html` — pre-paint inline script applies the saved theme (`hakisense:theme`) before first paint to avoid FOUC. Default light.
- `src/contexts/ThemeContext.tsx` — NEW: `ThemeProvider` + `useTheme()` (`theme`/`setTheme`/`toggleTheme`), localStorage-persisted, toggles `.dark` on `<html>`.
- `src/main.tsx` — wrapped the app in `<ThemeProvider>` (outermost).
- `src/pages/Settings.tsx` — new "Appearance" card (Light/Dark segmented control).
- **Sweep across 32 UI files** (components + pages) — replaced inline dark-only utilities with theme tokens: `border-white/*`→`border-hairline[-strong]`, `bg-white/*`→`bg-surface[-strong]`, `text-violet-{300,200}`→`text-brand`, `text-violet-100`→`text-brand-strong`, `bg-dark[-200][/xx]`→`bg-background`/`bg-popover`, `bg-black/{40,30}`→`bg-panel`, `bg-black/20`→`bg-surface`. (The modal scrim `bg-black/50` was deliberately kept — a dark backdrop is correct in both themes. `text-white` on the violet/destructive buttons and the `bg-violet/*` accent tints were left as-is — they read fine on both.)

**Unchanged:** all logic/types/lib/hooks/AuthContext, App route map, the violet brand gradient + `.btn-primary`, and the shadcn primitives' own pre-existing `/opacity` usages. **Execution model:** unchanged (CSS-var + React context). **Breaking changes:** none. **New dependencies:** none.

**Verify:** `npm run dev` → app loads light; Settings → Appearance toggles dark/light; eyeball Landing, Dashboard (run console + live feed + Recent runs), a RunView dossier, Login, and the ⌘K palette in both themes; reload to confirm persistence with no flash.

## 2026-06-03 — Clean up Recent runs (dedupe by ticker, hide thesis-less runs)

**Task:** Recent runs showed many duplicate AFFLE entries, most with no thesis/dossier ("AFFLE —") — bad UX.

**Cause:** the backend saves a run record per execution and `/api/runs` returns all of them with no dedup or status; intake-only / gate-blocked runs have an empty `headline`, so they rendered as bare "—" rows.

**Changed:** `src/pages/Dashboard.tsx` — derive `visibleRuns` (useMemo): keep one card per ticker (API is newest-first, so newest wins) and only runs that produced a thesis (non-empty `headline`); intake-only / empty / thesis-less runs are hidden. Reworded the empty state ("No completed dossiers yet — run a Scope or Full research above").

**Unchanged:** backend, run flow, RunView, types. **Execution model:** unchanged. **New dependencies:** none.

**Note:** intake-only runs (company data but no thesis) are intentionally hidden from Recent runs. Optional follow-up if wanted: enrich `/api/runs` with a derived `status` (dossier|blocked|intake) for status badges + server-side dedup, and stop persisting empty runs.

## 2026-06-03 — Fix: Dashboard ticker dropdown rendered behind Recent runs

**Task:** The combobox suggestion list appeared *behind* the Recent-runs history items.

**Cause:** `.card-glass` uses `backdrop-filter`, which creates a stacking context — trapping the dropdown's `z-30` inside the run-console card, so the later-in-DOM history `<section>` painted over the part of the dropdown that overflows the card.

**Changed:** `src/pages/Dashboard.tsx` — added `relative z-20` to the run-console `<Card>` so the card (and its overflowing dropdown) stacks above the history section. Stays below the sticky `AppNav` (the Dashboard container is `z-10` under the nav's `z-20`).

**Unchanged:** TickerCombobox, the ⌘K palette (Radix-portaled, unaffected). **Execution model:** unchanged. **New dependencies:** none.

## 2026-06-03 — Client-side NSE ticker search (⌘K palette + Dashboard combobox + public search)

**Task:** Proper stock search so anyone can find tickers, like HakiSense 2.0 had.

**Changed:**
- `data/Tickers.csv` — NEW: NSE source list (5763 rows: Name, Ticker, Sub-Sector), copied into the repo.
- `scripts/build-tickers.mjs` — NEW: zero-dep, quote-safe CSV→JSON converter; preserves importance order, dedupes symbols.
- `public/tickers.json` — NEW generated index (5755 entries, ~472 KB; identity only — symbol/name/sector, no prices/recommendations). Committed so prod builds skip the CSV step.
- `src/lib/tickers.ts` — NEW: memoized lazy loader, ranked `searchTickers` (exact symbol → symbol-prefix → name word-prefix → substring), `popularTickers`, `findTicker`, recent-searches (localStorage).
- `src/hooks/useTickers.ts` — NEW: lazy-gated load hook (`enabled` defers the 472 KB fetch until search opens).
- `src/components/ui/command.tsx` — NEW: cmdk wrapper ported from 2.0, restyled to 3.0 tokens; fixed a11y (DialogTitle inside DialogContent) and forwards `shouldFilter` to the inner Command.
- `src/components/search/TickerSearchProvider.tsx` — NEW: mounts the global ⌘K/Ctrl+K palette once, exposes `openSearch()`.
- `src/components/search/TickerSearchDialog.tsx` — NEW: command palette (Recent + Popular when empty, ranked results; pre-ranked so `shouldFilter=false`). Select → `/dashboard?ticker=`.
- `src/components/search/TickerCombobox.tsx` — NEW: Dashboard autocomplete; keyboard nav; still allows free-typed symbols (Enter runs).
- `src/components/search/SearchTrigger.tsx` — NEW: reusable "Search stocks ⌘K" nav button.
- `src/main.tsx` — wrap `<App/>` in `<TickerSearchProvider>` (inside Router + AuthProvider).
- `src/components/AppNav.tsx`, `src/components/landing/LandingNav.tsx` — add `<SearchTrigger/>` (app + public search).
- `src/pages/Dashboard.tsx` — ticker `<Input>` → `<TickerCombobox>`; prefill from `?ticker=` then clear the param.
- `src/pages/Login.tsx` — post-login redirect now preserves the query string (so `?ticker=` survives the sign-in bounce).
- `package.json` — add `cmdk@^1.1.1`; add `build:tickers` script.
- `README.md` — document the search + how to regenerate `tickers.json`.

**Unchanged:** Landing hero/GSAP, dossier components, research run flow, backend (no search endpoint added — engine already accepts any ticker).
**Execution model:** unchanged (client-side only). **Breaking changes:** none. **New dependencies:** `cmdk@^1.1.1` (run `npm install`).

## 2026-06-03 — Account + marketing/legal pages (Profile, Settings, About, Privacy, Terms, Contact, 404)

**Task:** Add the profile page, settings (with profile/email/password updates), and the basic
public pages so the site looks official.

**Changed:**
- `src/lib/utils.ts` — add `getInitials()` helper (avatar fallbacks).
- `src/lib/site.ts` — NEW: `SUPPORT_EMAIL` (env `VITE_SUPPORT_EMAIL`) + `mailto()` helper.
- `src/contexts/AuthContext.tsx` — add `updateProfile/updateEmail/updatePassword` (additive; existing API unchanged).
- `src/components/AppNav.tsx` — replace name+SignOut with an avatar-triggered dropdown user menu (Profile / Settings / Sign out).
- `src/components/site/SiteFooter.tsx` — NEW shared footer (brand, research-not-advice line, Product/Company/Legal columns, auth-aware CTA).
- `src/components/site/PublicLayout.tsx` — NEW shell (LandingNav + Outlet + SiteFooter) for public marketing/legal pages.
- `src/components/site/ScrollManager.tsx` — NEW: scroll-to-top on navigation, scroll-to-hash for `/#section` links; mounted once in App.
- `src/components/site/LegalPage.tsx` — NEW shared prose shell (`LegalPage` + `LegalSection`) for Privacy/Terms.
- `src/pages/Profile.tsx` — NEW: avatar, editable display name, read-only email, member-since, copyable user id.
- `src/pages/Settings.tsx` — NEW: change email + change password forms, sign out, danger zone (deletion via support mailto — no service_role in browser).
- `src/pages/About.tsx`, `Privacy.tsx`, `Terms.tsx`, `Contact.tsx`, `NotFound.tsx` — NEW public pages (Terms carries the prominent research-not-advice disclaimer; Contact is a mailto form).
- `src/App.tsx` — add PublicLayout route group (`/about /privacy /terms /contact`, `*`→404) and `/profile`+`/settings` under ProtectedLayout; mount `<ScrollManager/>`.
- `src/components/landing/LandingNav.tsx` — section links now route home-anchored (`/#how` etc.) so they work from any page.
- `src/pages/Landing.tsx` — swap the inline `<footer>` for `<SiteFooter/>` (hero/parallax untouched).
- `.env.example` — document `VITE_SUPPORT_EMAIL`.

**Unchanged:** Landing hero/GSAP parallax, Dashboard, RunView, dossier components, ProtectedLayout, backend.
**Execution model:** unchanged. **Breaking changes:** none — unknown URLs now show a 404 instead of redirecting to /dashboard. **New dependencies:** none.

## 2026-06-02 — Tune hero parallax start (0.6 → 0.3)

**Task:** The hold before the hero parallax exit felt too long. Start the drift earlier.

**Changed:** `src/pages/Landing.tsx` — exit-tween positions moved from `0.6/0.62/0.64`
to `0.3/0.32/0.34` (hero now holds ~30% then drifts/fades over the remaining ~70%).

## 2026-06-02 — Restore hero parallax (correct timing)

**Task:** Bring back the 2.0 hero parallax scroll-out — but without the vanish-on-scroll bug.

**Diff vs original:** 2.0 positioned its exit tweens at timeline `0.6/0.62/0.64` (fire only
in the last ~40% of the pinned scroll) with an `onLeaveBack` reset; my earlier version put
them at `0`, so they fired immediately. Re-added the pinned ScrollTrigger with the original
`0.6`-based positions and the `onLeaveBack` opacity reset.

**Changed:** `src/pages/Landing.tsx` — hero pins, holds, then drifts up / slides the card
off in the last ~40% of scroll; restores on scroll-back.

**Execution model:** N/A. **New dependencies:** none. **Breaking changes:** none.

## 2026-06-02 — Fix: landing content vanished on scroll

**Task:** Bug — on the landing, all hero text/buttons/assets disappeared as soon as you
scrolled.

**Cause:** the hero's pinned scroll-out timeline positioned its fade-to-`opacity:0` tweens
at the start of the scrub range, so any scroll immediately faded the hero out while it was
pinned (this only "worked" in 2.0 because of its global scroll-snap, which we don't have).

**Changed:**
- `src/pages/Landing.tsx` — removed the pinned ScrollTrigger (`pin`/`scrub`) scroll-out
  block. The hero now scrolls away normally; content stays visible. Kept the entrance
  stagger, floating card/tickers, chart draw-on, and the below-fold scroll reveals.

**Execution model:** N/A. **New dependencies:** none. **Breaking changes:** none.

## 2026-06-02 — Landing Hero rebuilt faithful to 2.0

**Task:** The first landing Hero was flat. Rebuild it to match the original 2.0 Hero's
quality, now that the image assets are in `public/`.

**Changed:**
- `src/pages/Landing.tsx` — Hero reworked to the 2.0 composition: a fixed `hero-bg.jpg`
  backdrop (dark overlay + vignette), a big uppercase `text-hero` headline with a 3D
  rotateX-stagger GSAP entrance, a sliding glass finance card (`hero-finance.jpg`) with a
  floating bob, three floating NSE ticker chips (staggered + bob), a draw-on chart line,
  and a pinned scroll-out (ScrollTrigger pin + scrub) — all via `useGSAP` (scoped,
  auto-cleanup). On-message change vs 2.0: the literal **"BUY"** chip is replaced with an
  evidence-gated **"DOSSIER"** chip (the no-recommendations rule). Below-fold sections
  unchanged (still scroll-reveal).
- `src/components/landing/LandingNav.tsx` — brand mark now uses the real `/logo.png`
  (dropped the placeholder Sparkles icon).

**Assets:** none added by me — `public/{hero-bg,hero-finance,hero-3d,dashboard}.jpg`,
`logo.png` were already present (added by the developer).
**Execution model:** N/A (frontend). **New dependencies:** none (gsap added prior entry).
**Breaking changes:** none.

## 2026-06-02 — Phase E (landing): public marketing landing at /

**Task:** Add the public landing page and make `/` render it, completing Phase E.

**Decision (divergence from plan §9, surfaced & approved):** did NOT port the 2.0 landing
sections verbatim — their copy markets features 3.0 doesn't have (market dashboard,
pricing, "agents", stats), the Hero renders a literal "BUY" badge (violates the
no-recommendations rule), and they depend on missing image assets. Instead reused the 2.0
**design language** with on-message, research-first copy and no external images.

**Changed (new files):**
- `src/components/landing/LandingNav.tsx` — public scroll-aware top nav; brand, anchor
  links (How it works / Dossier / Approach), Sign in + Get started, or "Dashboard" when
  already authenticated (useAuth).
- `src/pages/Landing.tsx` — hero ("Deep research, not recommendations" + a design-system
  "dossier preview" mock, no image), How it works (3 steps), What's inside (6 feature
  cards tied to the real Desk), Approach band ("Research. Not recommendations."), CTA,
  footer. GSAP scroll reveals via the official `@gsap/react` `useGSAP` hook
  (`registerPlugin(useGSAP, ScrollTrigger)`, scoped, auto-cleanup, scroll-into-view —
  not the fragile pinned scroll-snap from 2.0).

**Changed (modified):**
- `src/App.tsx` — `/` now renders `<Landing/>` (public) instead of redirecting to
  `/dashboard`. `*` still → `/dashboard`. Gated routes unchanged.
- `package.json` — add `gsap` (^3.13.0) + `@gsap/react` (^2.1.2).

**Unchanged:** backend; the gated app (Dashboard/RunView/auth) and all Phase B–D files.
**Behavior change:** `/` shows the marketing landing; logged-in users see it with a
"Dashboard" nav CTA.
**Execution model:** N/A (frontend).
**Breaking changes:** none.
**New dependencies:** `gsap`, `@gsap/react`.

## 2026-06-02 — Phase D: Dossier renderer + markdown report/metrics

**Task:** Turn the saved Desk into the real dossier UI — structured section components
plus markdown rendering — and upgrade `/research/:sessionId` from raw JSON to tabs.

**Changed (new files in `src/components/dossier/`):**
- `MarkdownView.tsx` — react-markdown v9 + remark-gfm, styled via a `components` map
  (no typography plugin); wrapped in a `<div>` (v10-safe). Renders GFM tables/links/etc.
- `parts.tsx` — shared `EmptyState`.
- `CompanyHeader.tsx` — name, ticker, one-liner, sector, peer chips, collapsible About.
- `ThesisCard.tsx` — headline + pillars (id, statement, evidence_strength bar,
  supporting/refuting/context counts, role/status) + kill criteria.
- `FindingsList.tsx` — polarity-colored findings with counts + expandable evidence
  (kind · locator · as_of · quote) and team/pillar/lens/status footer.
- `ScenariosCard.tsx` — bull/base/bear fair value (₹) + probability bars + drivers.
- `RedFlagsList.tsx` — severity-colored flags (category, team, description).
- `CoverageMap.tsx` — 12-lens grid with empty/touched/covered status + finding counts.
- `OpenQuestions.tsx` — "what we don't know" (text, reason, suggested specialist).
- `MetricsView.tsx` — market snapshot chips, dupont note, `tables_md` rendered as
  markdown tables, detectors fired, anomalies.
- `ReportView.tsx` — "research, not a recommendation" banner + gate verdict
  (blockers/warnings) + `report_md` via MarkdownView.
- `SynthesisView.tsx` — devil's advocate, Director's synthesis, per-team memos (markdown).

**Changed (modified):**
- `src/pages/RunView.tsx` — now `CompanyHeader` + shadcn `Tabs`
  (Report | Thesis | Findings | Valuation | Risks | Financials | Coverage | Synthesis)
  wiring each dossier component to the saved desk. Replaces the raw-JSON body.

**Unchanged:** backend; Phase B/C/E files (incl. Dashboard run console + history).
**Behavior change:** `/research/:id` renders the full dossier instead of raw JSON. Empty
slices show graceful empty states (intake-only runs still show Company + Financials).
**Execution model:** N/A (frontend).
**Breaking changes:** none.
**New dependencies:** none (react-markdown + remark-gfm declared in Phase B; first used here).

## 2026-06-02 — Phase E (auth): Supabase login + routing + route protection

**Task:** Now that the real Supabase project (HakiSense-3.0) is wired, add login/signup,
route protection, and routing/nav. (Dossier tabs remain Phase D.)

**Changed (new files):**
- `src/components/ProtectedLayout.tsx` — auth gate (spinner while resolving; redirect to
  `/login` with `state.from` when configured && not signed in; renders `<AppNav/>` +
  `<Outlet/>`). Auth-optional: runs open when Supabase isn't configured.
- `src/components/AppNav.tsx` — top bar: brand, `displayName`, sign-out.
- `src/pages/Login.tsx` — email+password via `useAuth().signIn`; redirects on session
  (effect) honoring the `from` location; ported glass styling (no gsap / hero image).
- `src/pages/Signup.tsx` — name+email+password+confirm via `signUp`; navigates if a
  session is created, else shows "check your email to confirm" (Supabase default has
  email confirmation ON).
- `src/pages/Dashboard.tsx` — the run console MOVED here from `App.tsx` + a run-history
  list via `useQuery(listRuns)` (invalidated when a run finishes); each item links to
  `/research/:sessionId`.
- `src/pages/RunView.tsx` — `/research/:sessionId`; `useQuery(getDesk)` → basic summary
  (ticker, headline, gate) + "research, not a recommendation" banner + raw JSON. Phase D
  replaces the body with the dossier tabs.

**Changed (modified):**
- `src/main.tsx` — add `<BrowserRouter>` (outside `<AuthProvider>`, inside QueryClient).
- `src/App.tsx` — now the route map: public `/login` `/signup`; protected `/dashboard`
  + `/research/:sessionId` under `<ProtectedLayout>`; `/` and `*` → `/dashboard`.

**Unchanged:** backend; Phase B design system; Phase C data layer (`lib/*`, `types/*`,
`hooks/useResearchRun`, `contexts/AuthContext`).
**Behavior change:** the app is now LOGIN-GATED (visiting `/` routes to `/login` until
signed in) because Supabase is configured. The `.env` points at the HakiSense-3.0 project.
**Execution model:** N/A (frontend).
**Breaking changes:** none.
**New dependencies:** none (react-router-dom + @tanstack/react-query added in Phase B).

## 2026-06-02 — Phase C: Auth + AgentOS client + SSE streaming hook

**Task:** Build the frontend data layer — Supabase auth, the AgentOS API client, an
SSE reader and the `useResearchRun` streaming hook — and wire a minimal working run
console so the whole pipe is testable end-to-end.

**Changed (new files):**
- `src/lib/supabase.ts` — guarded singleton browser client (anon/publishable key only);
  exports `isSupabaseConfigured`. **Auth is optional:** when the Supabase env vars are
  absent the app runs auth-free, mirroring the backend's opt-in JWT.
- `src/contexts/AuthContext.tsx` — `<AuthProvider>` + `useAuth()` (`getSession`,
  `onAuthStateChange`, `signIn`, `signUp`, `signOut`, `getToken`, `displayName`). Reads
  the auth user directly — no `users`-table query (drops the 2.0 dead data layer).
- `src/types/desk.ts` — full TS mirror of the backend `Desk` model (exact field names /
  literal unions, e.g. `confidence: "high"|"med"|"low"`, `supporting_finding_ids`).
- `src/types/api.ts` — `SSEEvent`, `ResearchRequest`, `SavedRun`, `RunListItem`,
  `GateReport`, `HealthStatus`.
- `src/lib/sse.ts` — `readSSE()` async generator (body reader + TextDecoder; splits on
  blank line; parses `data:` JSON). Uses fetch streaming, not `EventSource`, so the
  request can carry the Bearer header.
- `src/lib/agentos.ts` — `getHealth`, `startResearch` (JSON `POST /api/research` →
  streaming `Response`), `getDesk`, `listRuns`. Base URL `VITE_AGENTOS_URL ?? "/agentos"`.
- `src/hooks/useResearchRun.ts` — drives one run: reads the server-issued `session_id`
  from `RunStarted`, tracks `currentStep` from `StepStarted`/`StepCompleted`, appends a
  feed, fetches the dossier on `ResearchComplete` (not `WorkflowCompleted`), errors on
  `WorkflowError`; `AbortController` cancel.

**Changed (modified):**
- `src/main.tsx` — wrap `<App/>` with `<QueryClientProvider>` + `<AuthProvider>`.
- `src/App.tsx` — placeholder hero evolved into a minimal working run console (run-mode
  toggle Intake/Scope/Full, live event feed + current step, dossier-loaded summary with
  gate badge + collapsible raw JSON). Keeps the ported styling; replaced by the real
  RunConsole + dossier tabs in Phases D–E.

**Unchanged:** backend (engine + Phase A server), `HakiSense2.0-Frontend` (donor only),
all Phase B config/design-system files.
**Execution model:** N/A (frontend). The hook uses fetch + ReadableStream reader +
AbortController; no backend change.
**Breaking changes:** none.
**New dependencies:** none (supabase-js, react-router, tanstack-query were added in Phase B).

## 2026-06-02 — Phase B: Scaffold + design-system port

**Task:** Scaffold the new `HakiSense-3.0-Frontend` (React 19 / Vite 7 / TS) and port
the reusable 2.0 design system so the app builds, runs, and wears the 2.0 look.

**Changed:**
- `package.json` — new project manifest. Deps mirrored from the proven-good 2.0 set
  (React 19, Vite 7, TS 5.9, Tailwind v3, the curated Radix/shadcn deps,
  React Router 7, TanStack Query 5, @supabase/supabase-js). Added `react-markdown` +
  `remark-gfm` (new for 3.0). Dropped dead deps: `kimi-plugin-inspect-react`,
  `tw-animate-css`, and the libs only used by shadcn components we didn't port
  (recharts, cmdk, vaul, embla-carousel, react-day-picker, input-otp,
  react-resizable-panels, react-hook-form, zod, sonner, next-themes, date-fns, gsap).
- `vite.config.ts` — `@vitejs/plugin-react`, `@ -> ./src` alias, and a dev proxy
  `/agentos -> http://localhost:7777` (prefix stripped). No kimi inspect plugin.
- `tailwind.config.js`, `postcss.config.js`, `components.json`, `eslint.config.js`,
  `tsconfig*.json` — copied verbatim from 2.0 (design tokens + path alias).
- `src/index.css` — copied verbatim (font imports, HSL theme tokens, `.glass`,
  `.card-glass`, `.text-gradient`, `.btn-primary`, `.grain`, float/glow animations).
- `src/main.tsx`, `src/lib/utils.ts` (`cn`), `src/hooks/use-mobile.ts` — copied verbatim.
- `src/components/ui/*` — curated shadcn subset (button, card, input, label, badge,
  tabs, separator, scroll-area, tooltip, dropdown-menu, avatar, dialog, accordion,
  progress), copied verbatim. The rest will be pulled in per-need in Phases D/E.
- `src/App.tsx` — NEW styled placeholder hero (uses the ported design tokens +
  curated ui primitives, with a staggered load reveal) to prove the system renders.
- `index.html`, `src/vite-env.d.ts`, `.env.example`, `.gitignore`, `README.md` — new.

**Unchanged:** `HakiSense-3.0-Backend` (engine + Phase A server), `HakiSense2.0-Frontend`
(donor only — nothing modified there).
**Execution model:** N/A (frontend scaffold).
**Breaking changes:** none (new project).
**New dependencies:** `react-markdown`, `remark-gfm` (vs the reused 2.0 stack).
