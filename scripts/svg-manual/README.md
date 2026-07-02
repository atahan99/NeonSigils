# Manual SVG fallbacks

The last step of the icon resolver (see `scripts/fetch-icons.ts`) looks here for
`<slug>.svg` when no other source (theSVG override, Simple Icons, dashboard-icons)
carries a brand.

## How to add one

1. Create `scripts/svg-manual/<slug>.svg` where `<slug>` matches the last
   `sourceCandidates` entry with `provider: "manual"` for that logo in
   `src/data/logoSources.ts`.
2. Keep it a simple, high-coverage, **monochrome** shape (solid black fills or
   thick strokes on a transparent background). Bold shapes rasterize into far
   more legible ASCII than thin outlines.
3. Prefer a `viewBox="0 0 24 24"` for consistency with the other sources.
4. Do NOT use a brand's official logo if its license forbids derivatives.
   These manual files are original ASCII-friendly renderings, not brand assets.
5. Re-run `npm run assets` to regenerate `src/data/logos.generated.ts`.
