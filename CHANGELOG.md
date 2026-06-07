# Changelog — HakiSense 3.0 Frontend

## 2026-06-07 — FIX: Refresh usage after a research run completes

**Task:** After a full dossier debits a research credit (now charged on first-time runs incl. cache hits — see backend), the Dashboard usage strip/card showed stale counts (the `["billing","me"]` query was never invalidated, only `["runs"]`).

**Changed:**
- `src/pages/Dashboard.tsx` — the `phase==="done"` effect now also invalidates `["billing","me"]`, so the usage strip and Plan & usage card re-read `GET /api/billing/me` the moment a run finishes.

**Unchanged:** all billing logic/data (backend-owned), chat credit display.
**Verification:** `tsc -b` rc=0; `eslint src/pages/Dashboard.tsx` rc=0.
**Execution model:** unchanged. **Breaking changes:** none. **New dependencies:** none.

## 2026-06-07 — FEAT: Surface plan + credit/research usage on Dashboard, Profile & nav

**Task:** Let users see — outside of Settings — what plan they're on, how many chat credits / research they've used and have left, and whether they should upgrade.

**Added:**
- `src/components/billing/usage.ts` — `usageState(used, limit)` helper (remaining / pct / low / out / capped); single source for meter math.
- `src/components/billing/PlanPill.tsx` — plan-accent pill (free neutral, Pro brand, Ultra spark), shared across nav/card/strip.
- `src/components/billing/UsageMeter.tsx` — labeled monthly-usage bar: "N left" headline + "x of y used" caption, brand→warn→neg as it runs low/empty.
- `src/components/billing/PlanUsageCard.tsx` — canonical "Plan & usage" card (plan, renewal/reset line, both meters, Upgrade/Manage CTA); hides meters when usage isn't tracked (dev).
- `src/components/billing/UsageStrip.tsx` — compact Dashboard strip: research + credits remaining, plan pill, Upgrade nudge when free or low; renders nothing when unmetered.

**Changed:**
- `src/pages/Dashboard.tsx` — `<UsageStrip/>` under the header so research limits show before a free user clicks Run.
- `src/pages/Profile.tsx` — added `<PlanUsageCard/>` (previously had no plan/usage at all).
- `src/pages/Settings.tsx` — replaced the in-file `PlanBillingCard`/`UsageRow` with the shared `<PlanUsageCard/>` (refactor, no behavior change; removes the duplicate so all surfaces stay consistent).
- `src/components/AppNav.tsx` — plan pill in the account-dropdown label + a "Plan & billing" item linking to `/billing`. Pill reads the JWT claim via `useEntitlements` (no extra fetch).

**Unchanged:** backend, Supabase, Razorpay, all metering/gating logic and limits — data already came from `useBilling()`/`GET /api/billing/me`. No usage-reset date is fabricated (paid renewal uses the existing `current_period_end`).
**Verification:** `tsc -b` rc=0; `eslint` rc=0 on all new/changed files. (Pre-existing, untouched `Profile.tsx:23` `set-state-in-effect` lint error is unrelated.)
**Execution model:** unchanged. **Breaking changes:** none. **New dependencies:** none.

## 2026-06-07 — FEAT (Phase 4/4): Admin pricing editor + Ultra-aware admin panel

**Task:** Admin UI to edit Free/Pro/Ultra pricing, limits, copy and features live (no redeploy), backed by the Phase-2 `GET/PATCH /api/admin/plans`. Plus making the admin panel `ultra`-aware.

**Added:**
- `src/components/admin/AdminPlansEditor.tsx` — per-plan form (name/tagline/CTA/lead, research & credit limits + display labels, monthly ₹/mo + quarterly ₹/3mo + optional list price, popular/active/journal-AI toggles, features as one-per-line text where `* ` = a highlighted feature). Prices are entered in ₹ and the charge (`amount_paise`), per-month figure, `billed` line and `discount` are derived on save. Editing invalidates the public `["plans"]` + `["billing","me"]` caches so the landing/usage reflect changes.

**Changed:**
- `src/lib/admin.ts` — `adminPlans()` (GET) + `adminUpdatePlan()` (PATCH); `adminSetPlan` typed to `AdminPlan`.
- `src/hooks/useAdmin.ts` — `useAdminPlans()` + `useUpdatePlan()`; `useSetPlan` accepts `ultra`.
- `src/pages/Admin.tsx` — new **Pricing** tab → `AdminPlansEditor`.
- `src/pages/AdminUserDetail.tsx` — binary Pro/Free toggle replaced with a 3-way free/pro/ultra selector (the backend grant now writes the authoritative subscription, not just the claim).
- `src/components/admin/AdminOverview.tsx` + `src/components/admin/widgets.tsx` (`PlanBadge`) + `src/types/admin.ts` — `ultra` plan everywhere; overview shows `ultra · pro · free`.

**Unchanged:** all non-admin surfaces; the admin guard (`app_metadata.role === "admin"`).
**Verification:** `tsc -b` rc=0 + `eslint` rc=0 on all touched files.
**Execution model:** unchanged. **Breaking changes:** none. **New dependencies:** none.

## 2026-06-07 — FEAT (Phase 3/4): Billing UI — backend-driven pricing, Razorpay checkout, usage + 402 handling

**Task:** Frontend for Free/Pro/Ultra billing — fetch pricing from the backend, run real Razorpay Standard Checkout, show usage, and handle "out of credits / over limit" + the Ultra-only journal gate. Pairs with the Phase-2 backend.

**Added:**
- `src/lib/razorpay.ts` — lazy `checkout.js` loader + typed `openCheckout` (success/dismiss/failure callbacks); `CheckoutDismissed` for user-cancel.
- `src/lib/billing.ts` — billing API client (`getPlans`, `getBillingMe`, `createOrder`, `verifyPayment`) + types (`PlanRow`/`BillingMe`/…); throws `ApiError` on failure.
- `src/hooks/usePlans.ts` — public pricing query. `src/hooks/useBilling.ts` — `useBilling` (plan + usage snapshot) and `useUpgrade` (order → checkout → verify → `refreshSession` → invalidate).
- `src/pages/Billing.tsx` — `/billing` page (protected): current plan + credit/research usage bars, cycle toggle, plan cards with Razorpay buy buttons, success/error notices, dismiss handled silently.

**Changed:**
- `src/lib/agentos.ts` — new exported `ApiError` (status + backend `detail`); `startResearch`/`startChat`/`startTradeAnalysis` now throw it (so 402/403 carry the friendly upgrade text).
- `src/components/landing/sections/PricingSection.tsx` — renders from `usePlans()` (maps `billing_plans` rows → the existing card shape; static `TIERS` kept as fallback); paid CTAs → `/billing?tier=&cycle=` when authed, `/signup` otherwise; footer copy updated (billing is live).
- `src/hooks/useEntitlements.ts` + `src/types/journal.ts` — `Plan` gains `ultra`; entitlements expose `isPro`(=pro|ultra)/`isUltra`/`isPaid`; `canUseAi` is now **Ultra-only**.
- `src/components/journal/AiTradeReview.tsx` — gate switched to `canUseAi` (Ultra). `src/components/journal/UpgradeGate.tsx` — copy → Ultra, button now links to `/billing?tier=ultra`.
- `src/hooks/useChat.ts` + `src/hooks/useResearchRun.ts` — expose `limitReached` (set on `ApiError` 402); chat drops the optimistic empty bubble on error.
- `src/components/dossier/TickerChat.tsx` + `src/pages/Dashboard.tsx` — on `limitReached`, show an "Upgrade" link to `/billing` next to the error.
- `src/pages/Settings.tsx` — new "Plan & billing" card (current plan + usage bars + Manage/Upgrade → `/billing`).
- `src/App.tsx` — `/billing` route under `ProtectedLayout`.
- `src/lib/admin.ts` + `src/hooks/useAdmin.ts` — `adminSetPlan` / `useSetPlan` accept `ultra`.

**Unchanged:** the SSE chat/research stream contracts and journal CRUD; the supabase client (anon key only — no service_role in the browser); the Razorpay `key_id` is returned by the order endpoint, so no `VITE_RAZORPAY_*` env var is required.
**Verification:** `tsc -b` rc=0 + `eslint` rc=0 on all touched files.
**Execution model:** unchanged. **Breaking changes:** journal AI is now Ultra-only (was Pro). **New dependencies:** none (checkout.js is loaded at runtime, not bundled).

## 2026-06-07 — LandingNav: add "How it works" link

**Task:** The top nav only had "Pricing"; add "How it works" (→ the Walkthrough section) like the footer has.

**Changed:**
- `src/components/landing/LandingNav.tsx` — added a ghost "How it works" → `/#how` link before "Pricing" (mirrors the footer order). Same treatment as the Pricing link (hidden on `<sm`, ghost, `text-text-secondary`); uses the existing ScrollManager hash-scroll.

**Unchanged:** Footer (already had the link), the sections, all other nav.
**Verification:** `tsc --noEmit` rc=0 + `eslint` rc=0.
**Execution model:** unchanged. **Breaking changes:** none. **New dependencies:** none.

## 2026-06-07 — Landing Pricing act: selectable cards + loaded content + quarterly-first pricing

**Task:** Cards looked sparse; make them feel generous, click-to-select (Pro default), and push quarterly billing to drive the sale.

**Changed:**
- `src/components/landing/sections/PricingSection.tsx` — presentation only:
  - **Selectable cards** — the three tiers are now a `role="radiogroup"` of `role="radio"` cards; click / Enter / Space selects one (default **Pro**). The selected card gets the emerald hero emphasis (ring + glow + fade-in tint + raised + filled CTA + "Selected" chip + gradient price); the others relax to an outline CTA. UI-only — billing isn't wired, so a later Stripe phase just reads the choice. The select transition animates only margin/shadow/border/background (never transform/opacity, which the GSAP `[data-reveal]` entrance drives), and the raise uses margin, not transform.
  - **Loaded content** — added a 2-up quota strip per card (Dossiers/mo + Chat credits: 1/200, 30/3,000, 150/25,000) and expanded feature lists to 6–7 app-grounded capabilities each (full dossiers — scenarios/valuation/financials/coverage, Qdrant retrieval, cited ask-the-stock chat, journal analytics, AI trade review, history, priority/early access), under an "Everything in Free/Pro, plus" lead. More padding. Cards now read full.
  - **Quarterly-first** — default billing cycle is **quarterly**, and prices show **per-month** for both cycles, so switching to quarterly visibly drops the headline (Pro ₹999→₹820/mo, Ultra ₹2,999→₹1,961/mo) with "₹X billed every 3 months" + the bigger "Save 45%/66%" badge. Added a "SAVE 66%" flag on the Quarterly toggle and a dynamic nudge line.

**Unchanged:** All prices, quotas and the underlying math — quarterly is just displayed per-month. No billing wired, nothing gated/unlocked, no network calls. Nav/footer links untouched.
**Verification:** `tsc --noEmit` rc=0 + `eslint` rc=0 (incl. jsx-a11y on the radiogroup).
**Execution model:** unchanged. **Breaking changes:** none. **New dependencies:** none.

## 2026-06-07 — Landing Pricing act: visual polish (fix "dull" — depth, contrast, Pro hero)

**Task:** The pricing cards melted into the pale mint canvas (pale-on-pale, no focal point). Add depth/contrast and make Pro the clear hero.

**Changed:**
- `src/components/landing/sections/PricingSection.tsx` — presentation only:
  - Cards no longer use `.card-glass` (which hard-sets `box-shadow`/`border` and swallowed any added ring/shadow). They're now composed from Tailwind utilities — a solid `--glass-strong-bg` surface, a `border-hairline-strong` edge, `backdrop-blur-xl`, and a real drop shadow — so they lift cleanly off the mint in light **and** dark.
  - **Pro hero:** emerald-tinted surface (gradient overlay), `ring-2` + colored emerald glow shadow, a flush top-right "Most popular" tab (emerald→teal gradient, white), price rendered in `text-gradient`, and raised above its neighbours via **margin** (`lg:mt-8` on Free/Ultra) — never a transform, so it can't clobber the `[data-reveal]` GSAP entrance.
  - **Ultra:** subtle powder/sky tint to distinguish it from Free; its AI-on-Journal perk keeps the spark accent.
  - **Depth:** replaced the near-invisible `act-turn` wash with three visible emerald/powder radial blooms on a transform-free parallax wrapper (blooms self-center, no GSAP conflict).
  - **Contrast:** prices bumped to `text-5xl`, bolder discount/feature chips (now ring-bordered), headline to `text-4xl`/`sm:text-5xl`.

**Unchanged:** All prices, quotas, copy, the monthly/quarterly toggle, CTAs, and nav/footer links — byte-for-byte. No billing wired.
**Verification:** `tsc --noEmit` rc=0 + `eslint` rc=0.
**Execution model:** unchanged. **Breaking changes:** none. **New dependencies:** none.

## 2026-06-07 — Landing: early-bird Pricing act (Free / Pro / Ultra, INR, monthly + quarterly)

**Task:** The Landing scroll was missing a pricing moment — add one, themed to the narrated scroll.

**Changed:**
- `src/components/landing/sections/PricingSection.tsx` — **NEW** `#pricing` act. Three INR tiers (Free / Pro / Ultra) with a monthly ↔ quarterly toggle. Pro is the highlighted "Most popular" card (emerald ring + glow); Ultra surfaces its exclusive AI-on-Journal perk. Early-bird savings read in money-green (`pos`), keeping the brand's "rare orange" reserved for the Finale spark. Prices/quotas: Free ₹0 (1 dossier/mo · 200 chat credits · free journal forever); Pro ₹999/mo (was ₹1,491, 33% off · 30 dossiers · 3,000 credits) / ₹2,460 per quarter (45% off · ≈₹820/mo); Ultra ₹2,999/mo (was ₹5,767, 48% off · 150 dossiers · 25,000 credits · AI journal analysis) / ₹5,882 per quarter (66% off · ≈₹1,961/mo). Struck originals derived from `price ÷ (1 − discount)`; quarterly = list × 3 then the quarterly discount (Option A, approved). `data-reveal` entrance + a `data-parallax` brand bloom for depth, matching the other acts.
- `src/pages/Landing.tsx` — render `<PricingSection />` between `<PrincipleSection />` and `<FinaleSection />` (philosophy → price → closer); arc docstring updated.
- `src/components/site/SiteFooter.tsx` — added `Pricing` → `/#pricing` to the Product column.
- `src/components/landing/LandingNav.tsx` — added a `Pricing` ghost anchor (`/#pricing`, hidden on `<sm`) before the auth buttons.

**Unchanged:** No billing/Stripe wiring, no `app_metadata.plan` enforcement, no feature gated or unlocked — presentation only. All CTAs route to `/signup` (or `/dashboard` when signed in), consistent with the Finale. App-pages cascade (Batches B–D) still paused at the Dashboard checkpoint.
**Verification:** `tsc --noEmit` rc=0 + `eslint` rc=0 on all four touched files.
**Execution model:** unchanged. **Breaking changes:** none. **New dependencies:** none.

## 2026-06-07 — App polish Batch A: Dashboard migrated to the shared system (checkpoint exemplar)

**Task:** First page on the new app design system, so the shared look can be sanity-checked before cascading to the rest.

**Changed:**
- `src/pages/Dashboard.tsx` — outer wrapper → `<PageShell width="narrow">` (consistent width + staggered entrance); hand-rolled header → `<PageHeader>`; research-mode buttons → shared `<Pill>`; history loading → `<LoadingState>`; empty history → `<EmptyState>`. All research logic (`useResearchRun`, run/cancel, the live feed, result card, `?ticker=` prefill) preserved verbatim.
- Added a **documented, scoped** `eslint-disable-next-line react-hooks/set-state-in-effect` on the `?ticker=` prefill's `setTicker`. This lint violation is **pre-existing** (the committed original had the same bare `setTicker` in that effect); it must stay an effect to re-prefill when the param changes while already on `/dashboard`, so it's documented rather than restructured.

**Unchanged:** Behavior, routing, data, the run pipeline. Other pages (Batches B–D pending).
**Verification:** `tsc --noEmit` rc=0 + `eslint` rc=0 (Dashboard now clean, including the documented disable).
**Execution model:** unchanged. **Breaking changes:** none. **New dependencies:** none.

## 2026-06-07 — App polish Pass 1: shared design system (PageShell / PageHeader / controls / states + premium aura & entrance)

**Task:** Begin making every app page consistent + premium ("landing-flavored"). Approved approach: build shared primitives first, then cascade to the pages. This is Pass 1 — the primitives only; no page has adopted them yet (cascade is Batches A–D, next).

**Why:** the app pages were already on the emerald tokens but inconsistent — three different widths (3xl/4xl/5xl), the tab-pill `triggerClass` copy-pasted in RunView + Journal (and a third mode-pill variant in Dashboard), hand-rolled headers with drifting spacing, plain `loading…`/empty text, and flatter than the new landing.

**Changed (new shared primitives in `src/components/app/`):**
- `PageShell.tsx` — standard page frame: unified width (`narrow`/`default`/`wide`, aligned to the nav), padding, and a staggered mount entrance for its children.
- `PageHeader.tsx` — one header pattern (mono eyebrow + icon/badge, gradient title, subtitle, actions slot).
- `controls.tsx` — shared `tabTriggerClass` (dedupes the copied tab style) + `<Pill>` (the segmented control).
- `EmptyState.tsx` — polished empty state (glowing glass icon + title + hint + action).
- `LoadingState.tsx` — consistent spinner row + a `Skeleton` block.
- `StatTile.tsx` — refined metric tile (mono label + display value, pos/neg/brand tones).

**Changed (edits):**
- `src/index.css` — `.page-aura` (premium emerald+powder atmosphere, **light AND dusk**); `.app-stagger` entrance keyframes (uses `backwards` fill so no lingering transform breaks fixed/portaled children); reduced-motion disables it.
- `src/components/ProtectedLayout.tsx` — mount `.page-aura` (replaces the light-only `app-aurora`) so every gated page gets atmosphere in both themes.

**Unchanged:** No page/component has been migrated yet (Pass 2). Tokens, fonts, routes, data, logic, auth. `app-aurora` kept (still used by PublicLayout).
**Verification:** `tsc --noEmit` rc=0 + `eslint` rc=0 (new `app/` primitives + ProtectedLayout).
**Execution model:** unchanged. **Breaking changes:** none. **New dependencies:** none.

## 2026-06-07 — Landing: one continuous backdrop (true seam-free continuity) + visible parallax + tighter hero

**Task:** Screenshot review — the hero→pain transition still showed a tonal seam (hero had its own opaque sky that *ended*, pain had a darker wash), the parallax wasn't perceptible (only faint full-bleed layers moved), and the hero headline/sub were each 3 lines (too tall, no breathing room).

**Changed:**
- `src/index.css` — `.story-canvas` reworked into **one continuous page background**: a dawn (powder + emerald) anchored to the very top via px stops, settling into a flat mint that runs unbroken down the whole page — so there is *physically* no seam between acts. `.act-pain` reduced from a slate band to a barely-there cool tint (it was the grey step). `.sunset-sky` left as-is for the auth pages (now decoupled from the landing).
- `src/pages/Landing.tsx` — the canvas is now `absolute inset-0` (page-anchored, scrolls) instead of `fixed`, so the dawn lives only at the top.
- `src/components/landing/sections/HeroSection.tsx` — **removed the hero's separate sky** (it sits on the canvas dawn now → no edge to seam). Added two soft glow blobs (emerald + powder) that **parallax at different rates** for visible first-screen depth. Headline → tight **2 lines** ("Research took a weekend. / Now it takes one search.", responsive size so it doesn't overflow), sub → **2 lines**, with a larger gap (`mt-8`) for breathing room.
- `src/components/landing/sections/PainSection.tsx` — the ghost "300" is now more visible (opacity 4%→6%) with more parallax travel, so the motion clearly reads.

**Unchanged:** Arc/section order, palette tokens, fonts, count-up, walkthrough pin, auth pages (`.sunset-sky` untouched), routes, data.
**Verification:** `tsc --noEmit` rc=0 + `eslint` rc=0 (Landing + Hero + Pain). Reduced-motion still skips parallax/reveals.
**Execution model:** unchanged. **Breaking changes:** none. **New dependencies:** none.

## 2026-06-07 — Landing: drop the warm hero horizon (seamless hero→pain) + more parallax depth

**Task:** Screenshot review — the hero still ended in a warm peach/orange horizon band that broke the flow into the (now cool-green) Pain act, and the first few pages wanted more parallax depth.

**Changed:**
- `src/index.css` — `.sunset-sky` (light + dusk): **removed the warm orange/ember horizon radial** and settled the base gradient into the page-canvas tone (`#E9F3F1` light / `#09161F` dusk) so the hero fades straight into the Pain act with no seam. (Shared class — also cools the **Login/Signup** backdrops, which is consistent with the emerald-led brand; orange now survives only in the `spark` chips.)
- `src/components/landing/sections/HeroSection.tsx` — the sky backdrop is now oversized (`-inset-y-24`) and **parallaxed** (`data-parallax`), so it drifts slower than the content for real depth on the first screen.
- `src/components/landing/sections/TurnSection.tsx` — re-centered the bloom with `m-auto` (transform-free) and **parallaxed** it, so the Turn has motion too. (Transform-based centering was avoided because GSAP's `y` would clobber it.)

**Unchanged:** Arc/section order, palette tokens, fonts, count-up + canvas work from the prior entry, walkthrough pin, routes, data.
**Verification:** `tsc --noEmit` rc=0 + `eslint` rc=0 (Hero + Turn). Reduced-motion still skips all parallax.
**Execution model:** unchanged. **Breaking changes:** none. **New dependencies:** none.

## 2026-06-07 — Landing polish: continuity canvas + count-up numbers + visible motion (Hero→Pain→Turn)

**Task:** Screenshot review of the rebuilt Landing — after the rich hero the page **hard-cut to flat grey-white** (lost continuity), the first 3 acts had no *perceptible* animation/parallax (my parallax was attached to near-invisible background washes), and the key figures sat there **stale** (no count-up, no emphasis, nothing for the eye to lock onto). Fixed all three without changing the arc.

**Changed:**
- `src/index.css` — NEW `.story-canvas`: a continuous brand backdrop (powder→emerald→mint, anchored blooms; light + dusk) so sections never fall back to flat white. **Strengthened** `.act-pain` (real cool-slate weight + a faint emerald sliver foreshadowing the Turn) and `.act-turn` (emerald bloom ~0.18→0.28 so "colour returns" actually reads). NEW `.mark` emerald highlighter for key words.
- `src/components/landing/CountUp.tsx` — NEW: scroll-triggered number counter (0→value on enter, `once`); renders the final value at rest and for reduced-motion / no-JS, so it's never blank.
- `src/pages/Landing.tsx` — mount the fixed `.story-canvas` behind a `relative z-10` content wrapper (proven layering pattern).
- `src/components/landing/sections/PainSection.tsx` — cost strip is now the visual **peak**: `card-glass` tiles, icons, big **gradient count-up** numbers (300+, ~3 days) + a glow. Added a giant ultra-faint ghost "300" that **visibly parallaxes** (the clearest "you're scrolling a story" signal), `.mark` emphasis on key phrases, and accent lines that draw down as each beat enters.
- `src/components/landing/sections/TurnSection.tsx` — stronger `sun-glow` + a scale/clip reveal on the headline so the pivot lands.

**Unchanged:** The 7-beat arc / section order, palette tokens, fonts, Tailwind config, the walkthrough pin logic, other pages, routes, data. Hero search still routes as before.
**Verification:** `tsc --noEmit` rc=0 + `eslint` rc=0 (Landing + CountUp + Pain + Turn). Reduced-motion path: numbers show final value, no parallax/reveals.
**Execution model:** unchanged (frontend). **Breaking changes:** none. **New dependencies:** none.

## 2026-06-07 — Landing: rebuilt as a story-driven scroll-journey (pain → solution → demo → payoff)

**Task:** The Landing felt cluttered and "AI-made" — a feature catalogue where the eye had no focal point. Rebuild it as a narrated, Steve-Jobs-style scroll: show the reader's pain, reveal the grand solution, walk them through a quick demo as they scroll, and close on the payoff. Less text, fewer competing images, a real emotional arc — using reveals, parallax, and one pinned scene. Palette/tokens/fonts unchanged (emerald-led system kept).

**The arc (9 catalogue sections → 7-beat journey):** Hero (one focal hook) → Pain (the real cost of research today — pages, lost weekend, money) → Turn ("so we built the analyst you could never afford", colour blooms back) → Walkthrough (the signature **pinned** demo, 4 beats the product demonstrates itself) → Journal (the free loyalty hook) → Principle (research, not recommendations) → Finale (names the pain, then takes it away → CTA).

**What was decluttered:** the hero lost ~6 competing clusters (floating mockups, 4 ticker pills, 3 trust badges, example chips) down to headline + one line + search; the 3-card "how it works" and 6-card "what's inside" grids (9 equal cards = the AI-grid tell) are gone — their substance (thesis/findings/red-flags/live) is now *shown* inside the walkthrough beats; duplicated `sun-glow` blobs and ~40% of prose removed.

**Changed:**
- `src/pages/Landing.tsx` — rebuilt as a slim composition (~415 → ~95 lines); one `useGSAP` wires page-wide `[data-reveal]` (frictionless slide-up) + `[data-parallax]` (depth), reduced-motion–gated
- `src/components/landing/sections/HeroSection.tsx` — NEW: decluttered hero, own entrance timeline + parallax-out
- `src/components/landing/sections/PainSection.tsx` — NEW: quiet/desaturated pain act (`.act-pain`), reveal + parallax, cost strip (pages / days / ₹)
- `src/components/landing/sections/TurnSection.tsx` — NEW: the grand-solution pivot, emerald `.act-turn` bloom
- `src/components/landing/sections/WalkthroughSection.tsx` — NEW: the signature scene; CSS-`sticky` pin + ScrollTrigger reading progress to advance 4 beats (card swaps in place), with a stacked reduced-motion fallback
- `src/components/landing/sections/JournalSection.tsx` — NEW: free-journal spotlight (reuses `JournalMock`)
- `src/components/landing/sections/PrincipleSection.tsx` — NEW: "research, not recommendations" trust band (honesty discipline kept)
- `src/components/landing/sections/FinaleSection.tsx` — NEW: payoff that ties back to the pain; the one deliberate `spark` chip
- `src/components/landing/mockups.tsx` — ADD `AgentReadingMock` (the "reads the filings live" beat); existing mocks reused, not changed
- `src/index.css` — ADD `.act-pain` + `.act-turn` story-act atmosphere washes (light + dusk). No token/font changes
- `src/components/site/SiteFooter.tsx` — trimmed Product links to live anchors (`/#dossier`, `/#chat` removed — those are now walkthrough beats, not standalone sections; walkthrough gets `id="how"`)

**Unchanged:** Palette tokens, fonts, Tailwind config. App/data pages, auth, routes, search behavior, backend. The hero search still opens the same ticker palette and routes exactly as before.
**Verification:** `tsc --noEmit` rc=0 + `eslint` rc=0 (Landing + all new sections + mockups + footer).
**Execution model:** unchanged (frontend; no async/concurrency touched). **Breaking changes:** none. **New dependencies:** none (gsap + ScrollTrigger already present).

## 2026-06-07 — REBALANCE: Emerald-led palette (orange demoted to a "spark")

**Task:** Feedback — the sunset build read "too orangy / AI-generated", and a finance product should lead with green. Rebalanced to an **emerald-led** palette: money-emerald is now the primary/brand workhorse (buttons, icons, active states, heading gradient, glows), powder blue stays the cool support, and orange survives **only as a rare `spark`** (its own token) — the two urgency chips, one mockup strength-bar, and a thin warm horizon line in the hero. No layout/logic changes; the token system means it cascades to every page.

**Root causes of the "orangy" feel, fixed:** (1) the warm *cream paper* itself — `--background`/`--card` cooled from warm cream to a faint mint-white, foreground/borders/glass cooled to neutral; (2) one accent on everything — the `violet` Tailwind alias + `--primary`/`--brand`/`--ring` repointed orange→**emerald**, and `.text-gradient`/`.btn-primary`/`.glow-violet*`/`.app-aurora`/`boxShadow.glow` re-greened; (3) the orange hero sky — `.sunset-sky` reworked to a cool teal-green dawn with a single thin warm horizon, `.sun-glow` → emerald-teal.

**Changed:**
- `src/index.css` — both token sets → emerald-led + cooled paper; new `--spark`/`--spark-strong` tokens; re-greened every effect class (`.text-gradient`, `.btn-primary`, `.glow-violet*`, `.app-aurora`, `.sunset-sky`, `.sun-glow`, `.hero-aurora`, `.border-violet`, scrollbar)
- `tailwind.config.js` — `violet` scale → emerald; add `spark` color; `boxShadow.glow/-lg` → emerald
- `src/pages/Landing.tsx` — the two urgency chips → `spark` (the one warm pop)
- `src/components/landing/mockups.tsx` — dossier middle strength-bar → `spark` (green/orange/rose spread)
- `src/types/journal.ts` — JSDoc color example → emerald

**Unchanged:** all layouts/logic; auth + app chrome (recolor automatically). Backend.
**Verification:** `tsc --noEmit` rc=0 + `eslint` rc=0; `spark` appears in only ~11 spots (sparing by design); no old sunset-orange hex remain outside the intentional hero-horizon rgba.
**Execution model:** unchanged. **Breaking changes:** none. **New dependencies:** none.

## 2026-06-07 — POLISH: Sunset rebrand cohesion pass (auth + app chrome)

**Task:** Complete the sunset transformation on the surfaces the global token swap recolored but didn't *elevate*. A full survey confirmed the data pages were already done (Dashboard/Journal already use the sunset `text-gradient`; `ProtectedLayout`/`PublicLayout` already paint the recolored `.app-aurora`; no off-brand built-in palette classes, no stray hexes, no old font literals anywhere). Only the auth front-door and the app nav were still on the old generic treatment.

**Changed:**
- `src/pages/Login.tsx`, `src/pages/Signup.tsx` — swapped the old two-blur-blob backdrop for the landing's crafted `.sunset-sky` + `.sun-glow` atmosphere (glass card + form untouched)
- `src/components/AppNav.tsx` — wordmark now uses the sunset `text-gradient` "Sense" + `border-brand/40` badge, matching `LandingNav`
- `src/types/journal.ts` — last literal `#7B61FF` (a JSDoc example only) → `#F4763B`

**Unchanged:** All page layouts and logic. Data-page chrome (already on-brand). Backend.
**Verification:** `tsc --noEmit` rc=0 + `eslint` rc=0; a repo-wide grep confirms **zero** literal violet hex remain in `src` (`.css`/`.ts`/`.tsx`).
**Execution model:** unchanged. **Breaking changes:** none. **New dependencies:** none.

## 2026-06-07 — FEAT: "Sunset" rebrand + Landing page rebuild

**Task:** Rebrand HakiSense from violet to a sunset palette (powder blue · sunset orange · warm white) and rebuild the Landing page — visually and copy — into a high-conversion marketing page that sells the dossier, the per-stock chatbot, and the free journal. Approved decisions: rebrand the whole app now (global tokens) · add a "Dusk" dark variant · CSS sunset gradient + product mockups · new distinctive font pairing · bold/FOMO copy.

**Theme (cascades to every page via tokens):** Redefined the full `:root` (light "Daybreak" — cream paper, dusk-navy ink, sunset-orange primary, powder-blue accent) and `.dark` (dark "Dusk" — deep navy-indigo, ember-orange + powder-blue) token sets in `index.css`. New `--sky`/`--sky-strong` tokens + a `sky` Tailwind color. The `violet` Tailwind scale is **repointed to sunset-orange hexes** so the ~34 files using `bg-violet/15`/`text-violet`/`border-violet`/`ring-violet/…` recolor for free with zero per-file edits (the name is now a misnomer — a `violet`→`sunset` source rename is a clean follow-up). Recolored the hardcoded effect classes (`.text-gradient`, `.btn-primary`, `.glow-violet*`, `.app-aurora`, `.hero-aurora`, scrollbar) and added `.sunset-sky` (the gradient backdrop), `.sun-glow` (bloom), `.glow-sky`.

**Fonts (app-wide):** display **Bricolage Grotesque**, body **Hanken Grotesk**, mono **IBM Plex Mono** (kept). Loaded via Google-Fonts `@import` — **no package added**.

**Landing:** new section flow — sunset hero (gradient sky + sun-glow + floating product mockups) → stat band → how it works → what's inside → per-stock chat spotlight → free-journal spotlight → "Research, not recommendations" approach → final CTA. GSAP entrance + mockup bob + scroll-linked parallax (no pin) + reveals. Copy is bold/FOMO; the "research, not investment advice" footer line is preserved.

**Added:**
- `src/components/landing/mockups.tsx` — `DossierMock`, `ChatMock`, `JournalMock` (pure CSS/SVG, no data, no deps)

**Changed:**
- `src/index.css` — both token sets → sunset/dusk; fonts; effect classes; new sunset atmosphere classes
- `tailwind.config.js` — `violet` scale → sunset orange; add `sky` color; fonts; `boxShadow.glow/-lg`
- `index.html` — marketing `<title>`
- `src/pages/Landing.tsx` — full rebuild (sections, copy, mockups, GSAP)
- `src/components/landing/LandingNav.tsx`, `src/components/site/SiteFooter.tsx` — sunset wordmark + footer product links

**Unchanged:** Dashboard / Journal / Admin / RunView / auth-page **layouts** (they recolor automatically through the shared tokens — deliberate per-page polish is a later task). Backend. No image assets added.
**Verification:** `tsc --noEmit` rc=0 + `eslint` rc=0 on all changed files. Developer-run: `npm run dev` → check `/` in light + dark (sunset/dusk, no violet leftovers), hero mockups animate, scroll reveals fire; `/dashboard` + `/journal` recolored cleanly; `npm run build` succeeds.
**Execution model:** unchanged. **Breaking changes:** none (visual only). **New dependencies:** none (fonts via CSS @import; GSAP already present).

## 2026-06-07 — FEAT: Admin panel (users / trades / journals / research runs)

**Task:** A staff-only admin area to manage all users, their trades and journals, and the research runs they've run — with the lever to set a user's plan. Groundwork toward dossier-as-paid.

**Architecture:** The admin pages call the backend `/api/admin/*` endpoints (service-role) — **not** Supabase directly — because they need `auth.users` data (email, plan, last sign-in) the anon key can't reach, and to keep the service key off the browser. New `src/lib/admin.ts` client mirrors `agentos.ts` (Bearer token; 403 = not admin, 503 = backend missing service key, surfaced to the UI). All data via `@tanstack/react-query` (`["admin", …]` keys). Hand-rolled tables/cards reusing the journal's look — **no new npm dependencies**.

**Gating:** `useIsAdmin()` reads server-controlled `app_metadata.role === "admin"` (NOT `user_metadata`); open-dev (no Supabase) is treated as admin to match the backend. `AdminGuard` (nested route) bounces non-admins to `/dashboard`; the backend independently enforces the same role on every call (this guard is UX, not the boundary).

**Added:**
- `src/types/admin.ts` — admin payload types (overview, user, run, trade, detail)
- `src/lib/admin.ts` — admin API client (`adminOverview/Users/User/Runs/Trades/SetPlan`)
- `src/hooks/useAdmin.ts` — `useIsAdmin` + react-query hooks + `useSetPlan` mutation
- `src/components/admin/` — `AdminGuard`, `widgets` (badges/loading/error/empty), `AdminOverview`, `AdminUsersTable`, `AdminRunsTable`, `AdminTradesTable`
- `src/pages/Admin.tsx` — Overview / Users / Research runs / Trades tabs; `src/pages/AdminUserDetail.tsx` — per-user runs+trades+strategies + plan toggle

**Changed:**
- `src/App.tsx` — `/admin` + `/admin/users/:id` under `ProtectedLayout` → `AdminGuard`
- `src/components/AppNav.tsx` — "Admin" nav link shown only to admins

**Verification:** `tsc --noEmit` + `eslint` clean. Developer-run: set your user `app_metadata.role="admin"`, re-login → Admin link appears; `/admin` lists users/trades/runs; a non-admin is redirected; the plan toggle flips a user free↔pro (effective on their next token refresh). Requires the backend `SUPABASE_SERVICE_ROLE_KEY`.
**Execution model:** unchanged. **Breaking changes:** none. **New dependencies:** none.

## 2026-06-06 — FEAT: Trade Journal (free) + Pro-gated AI trade review

**Task:** Add a full stock trade journal as a new section — free for everyone — with AI analysis as the paid tier. Manual entry, every key metric (R-multiple, planned R:R, win rate, expectancy, profit factor, max drawdown, equity curve), analytics, strategies, and a Pro-gated AI trade review.

**Architecture:** Journal data lives in **Supabase (Postgres + RLS)**; the browser does CRUD directly via the anon key (RLS is the isolation boundary; `user_id` defaults to `auth.uid()`). The paid AI review streams from the backend (`POST /api/journal/analyze`, SSE). Metrics + charts are computed client-side; charts are hand-rolled SVG and forms use the repo's manual `useState` pattern — **no new npm dependencies** (Rule 6: match existing conventions).

**Added:**
- `src/types/journal.ts` — Trade/Strategy/TradeReview row types + Plan
- `src/lib/journal/metrics.ts` — pure P&L/R-multiple/expectancy/equity-curve/drawdown math; `format.ts` — display formatters; `filters.ts` — filter state + `applyFilters`; `queries.ts` — supabase CRUD + screenshot upload/signed-URL
- `src/hooks/` — `useJournal`, `useStrategies` (react-query), `useEntitlements` (reads `app_metadata.plan`), `useTradeAnalysis` (SSE)
- `src/components/journal/` — `TradeForm`, `AddTradeDialog`, `TradeDetailDialog`, `TradeBlotter`, `StatsOverview`, `EquityCurve`, `RDistribution`, `CalendarHeatmap`, `PerformanceBreakdowns`, `StrategyManager`, `JournalFilters`, `AiTradeReview`, `UpgradeGate`
- `src/pages/Journal.tsx` — Overview / Trades / Analytics tabs
- `src/lib/agentos.ts` — `startTradeAnalysis()`; `src/types/api.ts` — `TradeAnalysisRequest` (+ SSEEvent fields)

**Changed:**
- `src/App.tsx` — `/journal` route under ProtectedLayout
- `src/components/AppNav.tsx` — primary nav (Research / Journal)
- `src/pages/RunView.tsx` — "Log a trade" button prefilling `ticker` + `research_session_id` (research→journal link)

**Entitlements:** plan read from Supabase `app_metadata.plan` (deliberately NOT `user_metadata`, which the user can edit). Free = journal + all metrics/charts; Pro = AI review. Real billing (Stripe) deferred to a later phase — "Upgrade" is informational for now.

**Verification:** `tsc -p tsconfig.app.json --noEmit` + `eslint` clean. Developer-run: `npm run dev` to exercise; `npm run build` for the production typecheck.
**Execution model:** unchanged. **Breaking changes:** none. **New dependencies:** none.

## 2026-06-06 — FEAT: TickerChat dock on the research page (streaming chat about a stock)

**Task:** After research completes for a stock, let the user open a chatbot (bottom-right of the research page) and ask questions about that ticker. Answers are grounded server-side in the dossier's thesis, metrics, and filings.

**Changed:**
- `src/types/api.ts` — added `ChatRequest{ticker, message, chat_id?}`; extended `SSEEvent` with `chat_id`/`answer`/`tool_name`.
- `src/lib/agentos.ts` — added `startChat(req, token?, signal?)`: `POST /api/chat` returning the streaming `Response` (Bearer auth), mirroring `startResearch`.
- `src/hooks/useChat.ts` — NEW. Drives one conversation over SSE: stable `chat_id` minted on first send (fresh per page visit), `messages[]`, appends `RunContent` deltas to the trailing assistant bubble, maps `ToolCallStarted` → a status line ("Reading the filings…"), reconciles on `ChatComplete`, `AbortController` to cancel.
- `src/components/dossier/TickerChat.tsx` — NEW. Floating launcher + panel matching the violet/dark system (hairline/surface/font-mono/custom-scrollbar). User bubbles right, assistant rendered via the existing `MarkdownView`, streaming status dot, dossier-aware suggested prompts, Enter-to-send, "research not advice" footer.
- `src/pages/RunView.tsx` — mounts `<TickerChat ticker={run.ticker} companyName={desk.company?.name}/>` inside the `{run && desk}` block, so it appears only once the dossier has loaded.

**Why send only the ticker:** the backend `answer_turn` already loads that ticker's saved Desk (thesis/findings/metrics/filings corpus) server-side, so the client sends only `{ticker, message, chat_id}` — simpler and safer (no client-supplied thesis to tamper with).

**Unchanged:** all other pages/components, the research-run flow, auth. **Execution model:** unchanged. **Breaking changes:** none. **New dependencies:** none (react-markdown, lucide-react, shadcn input/button already present).

**Verify (developer):** `npm run build` (typecheck + lint pass — done); `npm run dev`, open a finished run, ask "What's the core thesis?" (tokens stream), a follow-up (history resolves), and confirm signed-out users get no stream (backend 401).

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
