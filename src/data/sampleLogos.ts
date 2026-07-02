import type { LogoEntry } from "../types/logo"
import { buildAsciiVariants } from "../utils/asciiTransform"

/**
 * Hand-authored fallback dataset so the game is fully playable even before the
 * SVG->ASCII pipeline has generated real assets. Once `npm run assets` runs,
 * logos.generated.ts is populated and takes priority (see data/logos.ts).
 */

const DOCKER = [
  "        ##  ##  ##        ",
  "        ##  ##  ##        ",
  "    ##  ##  ##  ##        ",
  "  ============================  ",
  "  \\\\      D O C K E R      //  ",
  "   \\\\====================//    ",
  "      ~~~~~~~~~~~~~~~~~~~       ",
]

const NMAP = [
  "  N   N M   M  A  PPPP  ",
  "  NN  N MM MM A A P   P ",
  "  N N N M M M AAA PPPP  ",
  "  N  NN M   M A A P     ",
  "  N   N M   M A A P     ",
  "  [ network mapper ]   ",
]

const GITHUB = [
  "        .::::::::.        ",
  "     .::::::::::::::.     ",
  "    ::::  O    O  ::::    ",
  "    ::::    <>    ::::    ",
  "     ::::::::::::::::     ",
  "       ::::    ::::       ",
  "        G I T H U B       ",
]

export const SAMPLE_LOGOS: LogoEntry[] = [
  {
    id: "docker",
    name: "Docker",
    aliases: ["docker engine"],
    category: "selfhosting-homelab",
    difficulty: "easy",
    tags: ["containers", "devops"],
    ascii: buildAsciiVariants(DOCKER, "docker"),
    hints: [
      "The most popular container runtime.",
      "Its logo is a whale carrying containers.",
      "You write a 'Dockerfile' to build images.",
    ],
    source: { provider: "manual", trademarkNote: "Docker is a trademark of Docker, Inc." },
  },
  {
    id: "nmap",
    name: "Nmap",
    aliases: ["network mapper", "nmap"],
    category: "security-networking",
    difficulty: "medium",
    tags: ["scanner", "recon", "cli"],
    ascii: buildAsciiVariants(NMAP, "nmap"),
    hints: [
      "A network scanning and discovery tool.",
      "Often used for port scanning and host discovery.",
      "Its name means 'Network Mapper'.",
    ],
    source: { provider: "manual", trademarkNote: "Nmap is a trademark of Insecure.Com LLC." },
  },
  {
    id: "github",
    name: "GitHub",
    aliases: ["git hub", "gh"],
    category: "general-it-tech",
    difficulty: "easy",
    tags: ["git", "hosting"],
    ascii: buildAsciiVariants(GITHUB, "github"),
    hints: [
      "The largest code hosting platform.",
      "Its mascot is the Octocat.",
      "Now owned by Microsoft.",
    ],
    source: { provider: "manual", trademarkNote: "GitHub is a trademark of GitHub, Inc." },
  },
]
