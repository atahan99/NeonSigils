import type { CategoryId, PlayCategoryId } from "../types/logo"

export type CategoryMeta = {
  id: CategoryId
  name: string
  shortName: string
  tagline: string
  accent: string // CSS var name for the category's neon accent
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "security-networking",
    name: "Security & Networking",
    shortName: "SEC//NET",
    tagline: "Firewalls, scanners, and the tools of the trade.",
    accent: "--neon-magenta",
  },
  {
    id: "selfhosting-homelab",
    name: "Selfhosting & Homelabbing",
    shortName: "HOMELAB",
    tagline: "Containers, dashboards, and the *arr stack.",
    accent: "--neon-green",
  },
  {
    id: "general-it-tech",
    name: "General IT / Tech",
    shortName: "GEN//TECH",
    tagline: "Languages, clouds, and everyday dev stacks.",
    accent: "--neon-cyan",
  },
]

// "mixed" is a play-only pseudo-category that draws from everything.
export const MIXED_CATEGORY = {
  id: "mixed" as const,
  name: "Mixed / Chaos",
  shortName: "CHAOS",
  tagline: "Every sigil in the archive. Maximum prestige.",
  accent: "--neon-purple",
}

const CATEGORY_MAP = new Map<CategoryId, CategoryMeta>(
  CATEGORIES.map((c) => [c.id, c]),
)

export const getCategory = (id: CategoryId): CategoryMeta => {
  const found = CATEGORY_MAP.get(id)
  if (!found) throw new Error(`Unknown category: ${id}`)
  return found
}

export const getPlayCategoryName = (id: PlayCategoryId): string =>
  id === "mixed" ? MIXED_CATEGORY.name : getCategory(id).name
