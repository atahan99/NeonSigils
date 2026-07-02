import type { CategoryId, LogoSource } from "../types/logo"
import { SECURITY_SOURCES } from "./logos/security"
import { SELFHOSTING_SOURCES } from "./logos/selfhosting"
import { GENERAL_SOURCES } from "./logos/general"

/**
 * Aggregated build-time source metadata for every logo, grouped by category
 * file so the dataset can grow (~100 per category) without one giant file.
 * Each entry's `sourceCandidates` is an ordered fallback chain resolved by
 * scripts/fetch-icons.ts:
 *   theSVG override -> simpleicons -> dashboard-icons -> selfhst -> manual
 *
 * The deployed game never touches these at runtime; it only reads the
 * generated ASCII in src/data/logos.generated.ts.
 */

// A brand can only live in one category. When two category files claim the
// same id, the entry whose category matches this map wins; otherwise the first
// occurrence (security -> selfhosting -> general order) is kept.
const OWNER_OVERRIDE: Record<string, CategoryId> = {
  grafana: "selfhosting-homelab",
  prometheus: "selfhosting-homelab",
  pihole: "selfhosting-homelab",
  adguardhome: "selfhosting-homelab",
  traefik: "selfhosting-homelab",
  caddy: "selfhosting-homelab",
  nginx: "selfhosting-homelab",
  zabbix: "selfhosting-homelab",
  vaultwarden: "selfhosting-homelab",
  gitlab: "general-it-tech",
  jenkins: "general-it-tech",
}

const dedupe = (sources: LogoSource[]): LogoSource[] => {
  const byId = new Map<string, LogoSource>()
  for (const source of sources) {
    const existing = byId.get(source.id)
    if (!existing) {
      byId.set(source.id, source)
      continue
    }
    const override = OWNER_OVERRIDE[source.id]
    if (override && source.category === override && existing.category !== override) {
      byId.set(source.id, source)
    }
  }
  return [...byId.values()]
}

export const LOGO_SOURCES: LogoSource[] = dedupe([
  ...SECURITY_SOURCES,
  ...SELFHOSTING_SOURCES,
  ...GENERAL_SOURCES,
])
