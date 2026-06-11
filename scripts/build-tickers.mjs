// Build the static ticker index the in-app search loads. Identity fields ONLY —
// symbol, name, sector/exchange. No prices, no recommendations. Source order is
// preserved (it's importance-ranked, so the biggest names surface first as "Popular").
//
// Two markets, selected by `--market=us|in` (default us):
//   us → data/us_universe.json  ({ "AAPL": { name, exchange, cik }, … })  → public/tickers.us.json
//   in → data/Tickers.csv       (Name,Ticker,Sub-Sector)                  → public/tickers.in.json
//
// Run: npm run build:tickers:us   ·   npm run build:tickers:in
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")

const marketArg = process.argv.find((a) => a.startsWith("--market="))
const market = (marketArg ? marketArg.split("=")[1] : "us").toLowerCase()
if (market !== "us" && market !== "in") {
  throw new Error(`Unknown --market="${market}". Expected "us" or "in".`)
}

/** Minimal RFC-4180-ish CSV parser: handles quoted fields, embedded commas, and "" escapes. */
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ""
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ",") {
      row.push(field)
      field = ""
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else {
      field += c
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

/** US: data/us_universe.json — keyed by symbol, importance-ordered; sector ← exchange. */
function buildUs() {
  const src = resolve(root, "data/us_universe.json")
  const data = JSON.parse(readFileSync(src, "utf8"))
  const out = []
  for (const [symbol, meta] of Object.entries(data)) {
    const sym = (symbol ?? "").trim().toUpperCase()
    const name = (meta?.name ?? "").trim()
    const sector = (meta?.exchange ?? "").trim()
    if (!sym || !name) continue
    out.push({ symbol: sym, name, sector })
  }
  return out
}

/** IN: data/Tickers.csv (Name,Ticker,Sub-Sector). */
function buildIn() {
  const src = resolve(root, "data/Tickers.csv")
  const rows = parseCsv(readFileSync(src, "utf8"))
  const [header, ...body] = rows
  // Resolve columns by name so a reordered CSV still works.
  const cols = header.map((h) => h.trim().toLowerCase())
  const iName = cols.indexOf("name")
  const iTicker = cols.indexOf("ticker")
  const iSector = cols.indexOf("sub-sector")
  if (iName < 0 || iTicker < 0) {
    throw new Error(`Tickers.csv must have Name and Ticker columns; got: ${header.join(", ")}`)
  }
  const seen = new Set()
  const out = []
  for (const r of body) {
    const symbol = (r[iTicker] ?? "").trim().toUpperCase()
    const name = (r[iName] ?? "").trim()
    const sector = iSector >= 0 ? (r[iSector] ?? "").trim() : ""
    if (!symbol || !name) continue
    if (seen.has(symbol)) continue // keep first (highest-importance) occurrence
    seen.add(symbol)
    out.push({ symbol, name, sector })
  }
  return out
}

const out = market === "us" ? buildUs() : buildIn()
const OUT = resolve(root, `public/tickers.${market}.json`)
writeFileSync(OUT, JSON.stringify(out))
console.log(`Wrote ${out.length} ${market.toUpperCase()} tickers → ${OUT}`)
