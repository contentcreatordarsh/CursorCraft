# CursorCraft

**Master Cursor. Secure it. Scale it.** — an unofficial, open-source community guide to using the [Cursor](https://cursor.com) AI code editor securely and cost-effectively, plus free, fully client-side tools.

**Live site:** [https://cursorcraft.falling-hall-ac41.workers.dev/](https://cursorcraft.falling-hall-ac41.workers.dev/)

> Local-first · Your code & keys never leave your browser · Open source

---

## The problem

Cursor is easy to adopt and easy to misuse. Secrets get pasted into prompts, context gets sprayed at expensive models, and MCP servers run with far more privilege than they need. The fixes are well understood but scattered across docs, blog posts, and tribal knowledge.

## The solution

CursorCraft collects the practices that make AI-assisted development **fast, safe, and affordable** into one credible playbook — six senior-level guides — and pairs it with a tool that audits your real configuration:

- **The playbook** — mental model, feature tour, best practices, **security** (the centerpiece), **cost optimization**, and **enterprise rollout**.
- **The Config Analyzer** — paste your `.cursorignore`, `.cursor/rules`, `mcp.json`, and `settings.json` and get a prioritized report of security risks and cost leaks, each with a plain-English explanation and a concrete fix.

### Screenshot

> _Placeholder — add a screenshot or GIF of the hero and the Config Analyzer here (`docs/screenshot.png`)._

---

## Local-first security promise

CursorCraft practices the security it teaches:

- **No backend secret handling.** The site is statically generated; there is no server that receives or stores your config, keys, or code. The Config Analyzer is **100% client-side**.
- **No telemetry on your code or keys.** Nothing you paste is transmitted, logged, or analyzed remotely.
- **In-memory only.** Inputs live in in-memory state for the life of the page — never written to `localStorage`, `sessionStorage`, cookies, or any cache.
- **Verifiable.** Open the network tab while you run an audit (no requests carry your data), or go offline and confirm it still works. Read every line here.

The repository also **dogfoods** the advice: it ships a strong [`.cursorignore`](./.cursorignore) and a [`.cursor/rules`](./.cursor/rules/cursorcraft.mdc) file encoding security and convention guardrails.

---

## Built in Cursor

This project was, fittingly, **built in Cursor** — using the same workflow it documents: spec-first prompts, small reviewed diffs, conventions encoded as rules, and a curated `.cursorignore`.

---

## Tech stack

- **[Astro](https://astro.build)** (`output: 'static'`) with **TypeScript (strict)**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **React** (`@astrojs/react`) for interactive islands only (the Config Analyzer)
- **MDX content collections** for the guides
- **Shiki** for code highlighting (Astro built-in)
- Self-hosted **Geist** / **Geist Mono** fonts (preloaded)
- SEO: per-page meta + Open Graph/Twitter, JSON-LD, `@astrojs/sitemap`, `robots.txt`, RSS

---

## Local development

Requires Node 18+ (developed on Node 22).

```bash
npm install
npm run dev      # start the dev server at http://localhost:4321
npm run build    # build static output to ./dist
npm run preview  # preview the production build locally
npm run check    # astro + TypeScript type checking
```

---

## Deploying to Cloudflare

CursorCraft is fully static, so **no adapter is needed**. It is currently deployed on Cloudflare at:

**https://cursorcraft.falling-hall-ac41.workers.dev/**

### Cloudflare Pages (Git-connected)

1. Push this repo to GitHub/GitLab.
2. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git** and select the repo.
3. Set the build configuration:
   - **Framework preset:** `Astro`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Deploy. Cloudflare serves the static files from its edge.

After your first deploy, update the production URL in:

- `site` in [`astro.config.mjs`](./astro.config.mjs)
- `url` in [`src/config/site.ts`](./src/config/site.ts)
- the `Sitemap:` line in [`public/robots.txt`](./public/robots.txt)

> Prefer Wrangler? You can also run `npx wrangler pages deploy dist` after `npm run build`.

---

## Project structure

```
src/
  components/        UI design system + Header/Footer + analyzer island
    analyzer/        ConfigAnalyzer.tsx (React island, client-side audit)
    ui/              Button, Card, Callout, CodeBlock, Badge, Icon, ...
    seo/             JsonLd
  content/guides/    MDX guides (content collection)
  layouts/           BaseLayout (SEO, fonts, header/footer)
  lib/
    analyzer/        types, rules, engine, example (the audit logic)
    jsonld.ts        structured-data builders
    og.ts            OG image SVG template
  pages/             routes (home, learn, tools, security, about, 404, rss, og)
  styles/global.css  Tailwind theme + design tokens
public/
  fonts/             self-hosted Geist woff2 (preloaded)
  og/                default OG image
.cursor/rules/       project rules (dogfooding)
.cursorignore        strong baseline ignore (dogfooding)
```

---

## Contributing

Corrections, sharper guidance, and new local-first tool ideas are welcome. Content correctness and security are the top priorities. Open an issue or PR.

---

## Disclaimer

CursorCraft is an **independent, community-run project**. It is **not affiliated with, endorsed by, or sponsored by Anysphere** (the makers of Cursor) or the Cursor product. "Cursor" and related marks belong to their respective owners. Cursor's behavior changes over time — always confirm specifics against the official Cursor documentation.

## License

[MIT](./LICENSE) © The CursorCraft community
