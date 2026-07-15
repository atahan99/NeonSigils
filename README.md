# NeonSigils

**A cyberpunk ASCII tech-logo guessing game.**
Decode glitched glyphs from security, networking, self-hosting, homelabbing, IT, and general tech.

[![Live demo](https://img.shields.io/badge/play-live%20demo-00f5ff)](https://atahan99.github.io/NeonSigils/)
[![License: MIT](https://img.shields.io/badge/license-MIT-ff2bd6)](./LICENSE)
[![Built with Vite + React + TS](https://img.shields.io/badge/vite-react-ts-39ff14)](#tech-stack)

**Play it:** [https://atahan99.github.io/NeonSigils/](https://atahan99.github.io/NeonSigils/)

## Screenshots

| Home | Trivia | Hangman |
| --- | --- | --- |
| ![Home](screenshots/home.png) | ![Trivia](screenshots/trivia.png) | ![Hangman](screenshots/hangman.png) |

## Features

- Two modes: **Trivia** (type the name) and **Hangman** (guess letter by letter)
- **333 logos** across three categories, plus Mixed / Chaos
- Four difficulties (Easy → Expert): timer, autocomplete, Hangman lives/reveal, scoring
- Run modifiers: Sudden Death, Time Attack, Daily Challenge
- Hints, alias matching, autocomplete, near-miss feedback
- Local leaderboard (export / clear) and settings (sound, motion, difficulty, etc.)
- Fully static — works offline once built
- Keyboard-friendly, labelled controls, reduced-motion support

## Categories

- `security-networking` (105) — pentest, VPN, firewall, identity (Nmap, Burp, Kali, WireGuard, …)
- `selfhosting-homelab` (90) — Docker, Proxmox, Home Assistant, Jellyfin, *arr stack, …
- `general-it-tech` (138) — languages, frameworks, cloud, Linux distros, brands, gaming

**Full icon archive (333)**

<details>
<summary><strong>Security & Networking (105)</strong></summary>

AdGuard · Aircrack-ng · Auth0 · Authelia · authentik · Bash Bunny · Binwalk · Bitdefender · Bitwarden · BloodHound · Brave · Burp Suite · Check Point · Cilium · Cisco · Cloudflare · CrowdStrike · Cryptomator · Datadog · DuckDuckGo · Duo Security · Elastic · F5 · Falco · Fastly · ffuf · Firefox · Flipper Zero · Fortinet · Ghidra · GnuPG · Gobuster · Graylog · Hack The Box · Hak5 · HAProxy · Hashcat · Headscale · John the Ripper · Juniper Networks · Kali Linux · Kaspersky · KeePassXC · Keycloak · Kibana · LastPass · Let's Encrypt · LibreWolf · Maltego · Malwarebytes · Masscan · Metasploit · MikroTik · mitmproxy · Mullvad · NetBird · Netgear · Nikto · Nmap · Nuclei · O.MG Cable · Okta · OpenSSL · OpenVPN · OpenWrt · OPNsense · OWASP ZAP · Palo Alto Networks · Parrot OS · pfSense · Proton VPN · Qualys · Qubes OS · Radare2 · Shodan · Signal · Snort · Snyk · SonarQube · SonicWall · Sophos · Splunk · sqlmap · Tails · Tailscale · Tenable · THC-Hydra · Tor · TP-Link · Trivy · TryHackMe · Twingate · Ubiquiti · USB Rubber Ducky · Vault · VirusTotal · Wazuh · WiFi Pineapple · WireGuard · Wireshark · Wiz · WPScan · YubiKey · ZeroTier · Zitadel

</details>

<details>
<summary><strong>Selfhosting & Homelabbing (90)</strong></summary>

AdGuard Home · Audiobookshelf · Bazarr · Beszel · Blocky · BookStack · BorgBackup · Caddy · Calibre-Web · CasaOS · Cloudflare Tunnel · Cockpit · Docker · Dockge · Duplicati · Eclipse Mosquitto · Emby · ESPHome · File Browser · Firefly III · Forgejo · FreshRSS · Frigate · Ghost · Gitea · Glances · Gotify · Grafana · Heimdall · Homarr · Home Assistant · Homepage · Immich · InfluxDB · Invidious · Jellyfin · Jellyseerr · Jitsi · Joplin · Kavita · Kopia · LibreNMS · Lidarr · Matomo · Mattermost · Mealie · MinIO · Navidrome · Netdata · Nextcloud · Nginx · Nginx Proxy Manager · Node-RED · ntfy · NZBGet · Obsidian · OpenMediaVault · Paperless-ngx · PhotoPrism · Pi-hole · Piwigo · Plex · Portainer · Prometheus · Prowlarr · Proxmox · qBittorrent · Radarr · Runtipi · SABnzbd · Seafile · Sonarr · Stirling PDF · Syncthing · Tautulli · Technitium DNS · Traefik · Transmission · Trilium Notes · TrueNAS · Umami · Unbound · Unraid · Uptime Kuma · Vaultwarden · Vikunja · Watchtower · Wiki.js · Zabbix · Zigbee2MQTT

</details>

<details>
<summary><strong>General IT / Tech (138)</strong></summary>

Adobe · Affinity · AlmaLinux · Amazon Web Services · AMD · Android · Angular · Ansible · Apple · Arch Linux · Astro · ASUS ROG · Atlassian · Binance · Bootstrap · Bun · C++ · CachyOS · CentOS · Coinbase · Corsair · CSS3 · Dart · DaVinci Resolve · Debian · Dell · Deno · Discord · Django · Dropbox · Elasticsearch · Elgato · Epic Games · ESLint · Express · Facebook · Fedora · Figma · Firebase · Flask · FreeBSD · Git · GitHub · GitHub Actions · GitLab · GNOME · Go · Google · Google Cloud · GraphQL · HP · HTML5 · Instagram · Intel · Java · JavaScript · Jenkins · Jira · jQuery · KDE · Kotlin · Kubernetes · Laravel · Lenovo · LinkedIn · Linux · Linux Mint · Logitech · MariaDB · Meta · Microsoft · MongoDB · MSI · MySQL · Neovim · Netflix · Netlify · Next.js · Node.js · Notion · npm · Nuxt · NVIDIA · Oculus · Oracle · PayPal · PHP · PlayStation · Podman · PostgreSQL · Prettier · Prisma · Proton · Python · PyTorch · React · Red Hat · Reddit · Redis · Redux · Rocky Linux · Ruby · Ruby on Rails · Rust · Salesforce · Samsung · Sass · Shopify · Slack · Spotify · Spring Boot · SQLite · Steam · Stripe · Supabase · Svelte · Swift · Tailwind CSS · TCL · Telegram · TensorFlow · Terraform · Tesla · TikTok · Twitch · TypeScript · Ubuntu · Valve · Vercel · Vite · Vue.js · Webpack · WhatsApp · X · Xbox · Yarn · YouTube · Zoom

</details>

## Tech stack

- Vite + React + TypeScript
- Plain CSS (variables + modules)
- LocalStorage for settings and leaderboard
- Build-time SVG → ASCII pipeline (`sharp`, `simple-icons`)
- No backend, no accounts, no network at runtime

## Local development

```bash
npm install
npm run dev        # start the dev server
npm run build      # typecheck + production build to dist/
npm run preview    # preview the production build
```

## Deployment

Static `dist/` folder (Vite `base: "./"`). Deploy to GitHub Pages, Netlify, Vercel, or Cloudflare Pages:

```bash
npm run build
# then serve / upload the dist/ directory
```

Routing is internal state — no SPA redirect/404 config needed.

## Adding logos

1. Add an entry under `src/data/logos/` (`security.ts`, `selfhosting.ts`, or `general.ts`) with `id`, `name`, `aliases`, `category`, `difficulty`, `tags`, `hints` (≥ 2), and `sourceCandidates`.
2. Run the asset pipeline (`npm run assets`).
3. Validate: `npm run validate-logos`.

Icon sources are tried in order at **build time** only (`scripts/fetch-icons.ts`):

1. **[theSVG](https://thesvg.org/)** — override in `scripts/svg-thesvg/<slug>.svg` (prefer `mono`)
2. **[Simple Icons](https://simpleicons.org/)** — offline npm package
3. **[dashboard-icons](https://github.com/homarr-labs/dashboard-icons)** — CDN (self-hosted brands)
4. **[selfh.st/icons](https://selfh.st/icons/)** — CDN
5. **manual** — hand-authored SVG in `scripts/svg-manual/`

Resolved SVGs land in `scripts/svg/`; the deployed game never fetches them.

## Generating assets

```bash
npm run fetch-icons      # resolve SVGs -> scripts/svg/
npm run generate-ascii   # rasterize -> src/data/logos.generated.ts
npm run validate-logos   # integrity checks
# or all three:
npm run assets
```

If the pipeline has not been run, the app falls back to `src/data/sampleLogos.ts`.

## Legal / trademark disclaimer

NeonSigils is an educational / fan-made tech-logo guessing game. All brand names, logos, and trademarks belong to their respective owners. NeonSigils is not affiliated with, endorsed by, or sponsored by any of those brands. Logos are transformed into ASCII art for quiz and educational purposes. See the in-app **Archive / Legal** page for details.

## Project structure

```
neon-sigils/
  scripts/          # SVG -> ASCII pipeline (dev only)
  src/
    components/     # layout, game, hangman
    data/           # categories, logos/, generated assets
    hooks/ pages/ styles/ types/ utils/
```
