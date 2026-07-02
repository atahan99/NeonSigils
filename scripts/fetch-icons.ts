/**
 * fetch-icons.ts — resolve each logo source to a local SVG at build time.
 *
 * Resolver order per logo (from its `sourceCandidates` chain):
 *   1. theSVG          -> scripts/svg-thesvg/<slug>.svg  (pre-fetched via theSVG MCP)
 *   2. simpleicons     -> node_modules/simple-icons/icons/<slug>.svg  (CC0, offline)
 *   3. dashboard-icons -> homarr-labs dashboard-icons CDN (network, build-time only)
 *   4. manual          -> scripts/svg-manual/<slug>.svg
 *
 * Output: scripts/svg/<id>.svg + scripts/.cache/provenance.json
 * The runtime game never touches any of this — it only reads logos.generated.ts.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { LOGO_SOURCES } from "../src/data/logoSources"
import type { IconProvider, LogoSource } from "../src/types/logo"

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, "..")
const SVG_OUT = join(HERE, "svg")
const THESVG_DIR = join(HERE, "svg-thesvg")
const MANUAL_DIR = join(HERE, "svg-manual")
const CACHE_DIR = join(HERE, ".cache")

const LICENSE_BY_PROVIDER: Record<IconProvider, string> = {
  theSVG: "Sourced via theSVG (thesvg.org)",
  simpleicons: "CC0-1.0 (Simple Icons)",
  "dashboard-icons": "MIT (homarr-labs/dashboard-icons)",
  selfhst: "Sourced via selfh.st/icons",
  manual: "Original ASCII-friendly rendering (NeonSigils)",
}

export type Provenance = {
  id: string
  provider: IconProvider
  slug: string
  variant?: string
  license: string
  trademarkNote?: string
}

const readIfExists = (path: string): string | null =>
  existsSync(path) ? readFileSync(path, "utf8") : null

const simpleIconsPath = (slug: string): string =>
  join(ROOT, "node_modules", "simple-icons", "icons", `${slug}.svg`)

const fetchCdnSvg = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const text = await res.text()
    return text.includes("<svg") ? text : null
  } catch {
    return null
  }
}

const fetchDashboardIcon = (slug: string): Promise<string | null> =>
  fetchCdnSvg(`https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/${slug}.svg`)

const fetchSelfhstIcon = (slug: string): Promise<string | null> =>
  fetchCdnSvg(`https://cdn.jsdelivr.net/gh/selfhst/icons/svg/${slug}.svg`)

/** Try each candidate in order; return the first that resolves. */
const resolveSource = async (
  source: LogoSource,
): Promise<{ svg: string; prov: Provenance } | null> => {
  const candidates = source.sourceCandidates ?? []
  for (const c of candidates) {
    let svg: string | null = null
    if (c.provider === "theSVG") svg = readIfExists(join(THESVG_DIR, `${c.slug}.svg`))
    else if (c.provider === "simpleicons") svg = readIfExists(simpleIconsPath(c.slug))
    else if (c.provider === "dashboard-icons") svg = await fetchDashboardIcon(c.slug)
    else if (c.provider === "selfhst") svg = await fetchSelfhstIcon(c.slug)
    else if (c.provider === "manual") svg = readIfExists(join(MANUAL_DIR, `${c.slug}.svg`))

    if (svg) {
      return {
        svg,
        prov: {
          id: source.id,
          provider: c.provider,
          slug: c.slug,
          variant: c.variant,
          license: source.license ?? LICENSE_BY_PROVIDER[c.provider],
          trademarkNote: source.trademarkNote,
        },
      }
    }
  }
  return null
}

const main = async (): Promise<void> => {
  mkdirSync(SVG_OUT, { recursive: true })
  mkdirSync(CACHE_DIR, { recursive: true })

  const provenance: Provenance[] = []
  const missing: string[] = []

  for (const source of LOGO_SOURCES) {
    const resolved = await resolveSource(source)
    if (!resolved) {
      missing.push(source.id)
      console.warn(`  ✗ ${source.id}: no source resolved`)
      continue
    }
    writeFileSync(join(SVG_OUT, `${source.id}.svg`), resolved.svg, "utf8")
    provenance.push(resolved.prov)
    console.log(`  ✓ ${source.id.padEnd(16)} <- ${resolved.prov.provider} (${resolved.prov.slug})`)
  }

  writeFileSync(
    join(CACHE_DIR, "provenance.json"),
    JSON.stringify(provenance, null, 2),
    "utf8",
  )

  console.log(`\nResolved ${provenance.length}/${LOGO_SOURCES.length} logos.`)
  if (missing.length) {
    console.error(`Missing sources: ${missing.join(", ")}`)
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
