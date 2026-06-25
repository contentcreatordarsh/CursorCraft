export const SITE = {
  name: 'CursorCraft',
  shortDescription:
    'An unofficial community guide to mastering, securing, and scaling the Cursor AI code editor.',
  longDescription:
    'CursorCraft teaches engineering teams how to get the most out of the Cursor AI code editor with a strong focus on security and cost discipline. Local-first, open source, zero secret handling.',
  url: 'https://cursorcraft.falling-hall-ac41.workers.dev',
  defaultOgImage: '/og/default.png',
  locale: 'en_US',
  themeColor: '#0a0a0b',
  github: 'https://github.com/contentcreatordarsh/CursorCraft',
  twitter: '@cursorcraft',
  author: 'The CursorCraft community',
} as const;

export const NAV_LINKS = [
  { label: 'Learn', href: '/learn' },
  { label: 'Tools', href: '/tools' },
  { label: 'Security', href: '/security' },
  { label: 'About', href: '/about' },
] as const;

export const TOOLS_LINKS = [
  { label: 'Config Analyzer', href: '/tools/config-analyzer' },
  { label: 'Rules Generator', href: '/tools/rules-generator' },
  { label: 'Rules Templates', href: '/tools/rules-templates' },
  { label: 'Policy Pack', href: '/tools/policy-pack' },
  { label: 'MCP Visualizer', href: '/tools/mcp-visualizer' },
  { label: 'Security Checklist', href: '/tools/security-checklist' },
  { label: 'Usage Insights', href: '/tools/usage-insights' },
] as const;

export const TRUST_LINE = 'Local-first · Your code & keys never leave your browser · Open source';
