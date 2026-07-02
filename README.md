# NeonSigils

**A cyberpunk ASCII tech-logo guessing game.**
Decode glitched glyphs from security, networking, self-hosting, homelabbing, IT, and general tech.

[![Live demo](https://img.shields.io/badge/play-live%20demo-00f5ff)](https://atahan99.github.io/NeonSigils/)
[![License: MIT](https://img.shields.io/badge/license-MIT-ff2bd6)](./LICENSE)
[![Built with Vite + React + TS](https://img.shields.io/badge/vite-react-ts-39ff14)](#tech-stack)

NeonSigils transforms familiar technology logos into distorted ASCII sigils.
Players recognize tools, platforms, frameworks, services, and brands across
security, networking, self-hosting, homelabbing, and general IT. It ships a fast
Trivia mode, a progressive-reveal Hangman mode, category-based play, difficulty
levels, run modifiers, a local leaderboard, and a neon terminal interface. It is
fully static and works offline once built.

**Play it:** https://atahan99.github.io/NeonSigils/

## Screenshots

| Home | Trivia | Hangman |
| --- | --- | --- |
| ![Home](screenshots/home.png) | ![Trivia](screenshots/trivia.png) | ![Hangman](screenshots/hangman.png) |

---

## Features

- Two game modes: **Trivia** (type the name) and **Hangman** (decode letter by letter).
- ~276 logos across three categories (~90 each) plus a **Mixed / Chaos** play option.
- Four difficulties (Easy / Medium / Hard / Expert) that genuinely change the puzzle: a per-question **countdown timer**, autocomplete generosity, Hangman lives / starting reveal / reveal-per-letter, word-length masking, and scoring multipliers.
- Run **modifiers**: **Sudden Death** (1 life), **Time Attack** (60s, endless), and a deterministic **Daily Challenge** (same sigils for everyone each day).
- Hangman shows the clean ASCII logo behind a diagonal mask that recedes only on correct letters; on Expert it slowly **re-encrypts while idle**.
- End-of-run **grade (S–D)** with perfect-run and clean-run bonuses.
- Answer normalization with alias matching, autocomplete, a second attempt, and near-miss ("1 char off") feedback.
- Hints (text, category, first-letter, multiple-choice, alias, reveal) with score penalties.
- Local leaderboard (LocalStorage) with multiple views, JSON export, and clear-with-confirm.
- Settings: sound, animation intensity, scanlines, reduced motion, autocomplete, difficulty, round length, player name.
- Cyberpunk neon design system: CRT scanlines, glitch, flicker, animated borders, monospace type.
- Accessibility: keyboard play, labelled controls, reduced-motion support, screen-reader text for ASCII art.



## Game modes

- **Trivia** — one ASCII sigil is shown; type the brand/tool name before the countdown runs out. Faster answers score more (100 / 80 / 60 / 40 by time bucket), with streak bonuses and difficulty multipliers.
- **Hangman** — guess letters to decode the sigil; correct letters recede the mask (reveal scales by difficulty) and wrong letters cost Signal Integrity and build the gallows. Solve for a base bonus plus remaining-life and fast-solve bonuses.



## Categories

- `security-networking` — Nmap, Wireshark, Burp Suite, Kali Linux, Metasploit, OWASP ZAP, Cloudflare, WireGuard, OpenVPN, pfSense.
- `selfhosting-homelab` — Docker, Portainer, Proxmox, Home Assistant, Jellyfin, Nextcloud, Pi-hole, AdGuard Home, Grafana, Uptime Kuma.
- `general-it-tech` — GitHub, GitLab, React, Next.js, Node.js, Python, TypeScript, PostgreSQL, Redis, Kubernetes.

Ships ~276 logos (~90 per category), sourced and rasterized at build time. Each
category lives in its own file under `src/data/logos/` so the set can keep growing.

## Tech stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- Plain CSS + CSS variables + CSS Modules (no UI framework)
- LocalStorage for settings and leaderboard
- Static generated TypeScript data (`src/data/logos.generated.ts`)
- Node.js build-time scripts for SVG → ASCII generation (`sharp`, `simple-icons`)
- No backend, no accounts, no network at runtime



## Local development

```bash
npm install
npm run dev        # start the dev server
npm run build      # typecheck + production build to dist/
npm run preview    # preview the production build
```



## Deployment

The build is a static `dist/` folder (Vite `base: "./"`, so it works from any
subpath). Deploy to GitHub Pages, Netlify, Vercel, or Cloudflare Pages:

```bash
npm run build
# then serve / upload the dist/ directory
```

Routing is internal state-based (no router), so no SPA redirect/404 config is needed.

## Adding new logos

1. Add an entry to `LOGO_SOURCES` in `[src/data/logoSources.ts](src/data/logoSources.ts)`:
  - `id`, `name`, `aliases`, `category`, `difficulty`, `tags`, `hints` (≥ 2), and
  - `sourceCandidates`: an ordered fallback chain, e.g.
    ```ts
    sourceCandidates: [
      { provider: "theSVG", slug: "brandslug", variant: "mono" },
      { provider: "simpleicons", slug: "brandslug" },
      { provider: "manual", slug: "brandslug" },
    ]
    ```
2. Run the asset pipeline (below).
3. Validate: `npm run validate-logos`.



## Icon sources & the resolver

Logos are resolved at **build time only** by `scripts/fetch-icons.ts`, trying
each `sourceCandidates` entry in order:

1. **theSVG** — a pre-fetched override SVG in `scripts/svg-thesvg/<slug>.svg`.
2. **Simple Icons** — the offline `simple-icons` npm package (CC0-1.0), by slug.
3. **dashboard-icons** — the homarr-labs dashboard-icons CDN (build-time fetch), for self-hosted brands.
4. **selfh.st/icons** — the selfh.st icons CDN (build-time fetch), broad self-hosted + some security coverage.
5. **manual** — a hand-authored SVG in `scripts/svg-manual/<slug>.svg` (last resort; e.g. `nmap`).

The resolved SVGs are cached in `scripts/svg/` with provenance in
`scripts/.cache/provenance.json`. The deployed game never fetches any of this.

### Using theSVG MCP during development

theSVG icons are the preferred source. During development, use the theSVG MCP
to fetch a brand's **mono** variant and save it as an override:

1. Search: `search_icons({ query: "wireshark" })` to find the slug.
2. Fetch: `get_icon({ slug: "wireshark", variant: "mono" })`.
3. Save the returned `<svg>…</svg>` to `scripts/svg-thesvg/wireshark.svg`.
4. Ensure the logo's `sourceCandidates` lists `{ provider: "theSVG", slug: "wireshark", variant: "mono" }` first.
5. Re-run the pipeline. The resolver will now prefer the theSVG asset.

Prefer `mono` (it converts to ASCII cleanly). Use `default` only if the mono
silhouette is unavailable or less recognizable. Avoid wordmark variants.

## Generating ASCII assets

```bash
npm run fetch-icons      # resolve SVGs -> scripts/svg/ + provenance
npm run generate-ascii   # rasterize (sharp) -> src/data/logos.generated.ts
npm run validate-logos   # data-integrity checks
# or all three:
npm run assets
```

Generation is deterministic (seeded by logo id), so ASCII is stable across
builds. ASCII variants produced per logo: `clean`, `glitched`, `cropped`,
`lowRes`, and `revealStages` (progressive reveal frames for Hangman). Grid width
scales with difficulty (Easy ~56 cols → Expert ~28 cols); harder logos use a
shorter, noisier character ramp.

If the pipeline has not been run, the app falls back to the hand-authored
`src/data/sampleLogos.ts` so it is always playable.

## Legal / trademark disclaimer

NeonSigils is an educational / fan-made tech-logo guessing game. All brand  
names, logos, and trademarks belong to their respective owners. NeonSigils is  
not affiliated with, endorsed by, or sponsored by any of those brands. Logos are  
transformed into ASCII art for quiz, recognition, and educational purposes.  
Per-icon license/trademark metadata is stored in each entry's `source` field  
where available. Brand logos are not used as the app icon, merchandise, or  
branding identity — NeonSigils uses its own original sigil symbol. Assets marked  
"No Derivatives" (or similar) are avoided. See the in-app **Archive / Legal**  
page for details.

## Project structure

```
neon-sigils/
  scripts/            # build-time SVG -> ASCII pipeline (dev only)
    fetch-icons.ts    # multi-source resolver
    generate-ascii.ts # sharp rasterizer -> logos.generated.ts
    validate-logo-data.ts
    lib/svgToAscii.ts
    svg-thesvg/       # theSVG MCP overrides
    svg-manual/       # hand-authored fallbacks
  src/
    components/       # layout/, game/, hangman/
    data/             # categories, logoSources, logos.generated, sampleLogos
    hooks/            # useGameSession, useSettings
    pages/            # 9 screens
    styles/           # globals / neon / animations
    types/            # logo, game, leaderboard
    utils/            # normalizeAnswer, scoring, random, hints, gameSession, ...
```

