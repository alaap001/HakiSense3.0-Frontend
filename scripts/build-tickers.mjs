// Convert data/Tickers.csv (Name,Ticker,Sub-Sector) into public/tickers.json,
// the static index the in-app ticker search loads. Identity fields ONLY —
// no prices, no recommendations. CSV order is preserved (it's importance-ranked,
// so the biggest names surface first as "Popular"). Run: npm run build:tickers
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const SRC = resolve(root, "data/Tickers.csv")
const OUT = resolve(root, "public/tickers.json")

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

const text = readFileSync(SRC, "utf8")
const rows = parseCsv(text)
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

writeFileSync(OUT, JSON.stringify(out))
console.log(`Wrote ${out.length} tickers → ${OUT}`)
