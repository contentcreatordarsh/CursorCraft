# Security Policy

CursorCraft is a static, local-first site. We take security seriously — especially because the project teaches Cursor security practices.

## Supported versions

| Version | Supported |
| --- | --- |
| `main` (latest deploy) | Yes |
| Older tags / forks | Best effort |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security problems.**

1. Email or DM the maintainers via [GitHub Security Advisories](https://github.com/contentcreatordarsh/CursorCraft/security/advisories/new) (preferred), or open a private report if that is unavailable.
2. Include steps to reproduce, impact, and any suggested fix.
3. We aim to acknowledge within **72 hours** and share a remediation timeline for confirmed issues.

## Scope

**In scope**

- The CursorCraft site, tools, and build pipeline (XSS, secret leakage, unintended network exfiltration of user-pasted config).
- The config audit script (`scripts/audit-cursor-config.mts`) and GitHub Action (`.github/actions/cursor-config-audit`).
- Supply-chain issues in dependencies that affect production builds.

**Out of scope**

- Cursor editor or Anysphere product vulnerabilities (report to Cursor directly).
- User misconfiguration of their own `.cursor` files — the Config Analyzer is designed to help surface those risks.
- Denial-of-service against the public static site hosted on Cloudflare.

## Design principles (what we will not “fix”)

These are intentional product choices, not bugs:

- **Client-side tools** run entirely in the browser; pasted config is not sent to a CursorCraft server because there is no application backend.
- **Guide progress** and **theme** use opt-in / preference `localStorage` only — never user file contents or API keys.
- **Security checklist** progress is in-memory only for the page session.

## Safe harbor

We appreciate responsible disclosure. We will not pursue legal action against researchers who follow this policy and avoid privacy violations, data destruction, or service disruption.
