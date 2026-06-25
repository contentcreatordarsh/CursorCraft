import fs from 'node:fs';
import path from 'node:path';
import { getCollection } from 'astro:content';
import { NAV_LINKS, TOOLS_LINKS } from '@/config/site';
import type { SearchIndex, SearchItem } from './types';

/** Strip frontmatter and MDX/MD markup for plain-text indexing. */
export function stripContent(raw: string): string {
  return raw
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, ' ')
    .replace(/[#>*_~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readGuideBody(id: string): string {
  const base = path.join(process.cwd(), 'src/content/guides', id);
  for (const ext of ['.mdx', '.md']) {
    const filePath = `${base}${ext}`;
    if (fs.existsSync(filePath)) {
      return stripContent(fs.readFileSync(filePath, 'utf8')).slice(0, 6000);
    }
  }
  return '';
}

/** Build the static search index at prerender time. */
export async function buildSearchIndex(): Promise<SearchIndex> {
  const items: SearchItem[] = [];

  const guides = (await getCollection('guides')).sort((a, b) => a.data.order - b.data.order);
  for (const guide of guides) {
    items.push({
      id: `guide-${guide.id}`,
      title: guide.data.title,
      description: guide.data.description,
      href: `/learn/${guide.id}`,
      category: 'Guide',
      keywords: [...guide.data.keywords, guide.data.eyebrow],
      body: readGuideBody(guide.id),
    });
  }

  for (const tool of TOOLS_LINKS) {
    items.push({
      id: `tool-${tool.href}`,
      title: tool.label,
      description: `CursorCraft local-first tool — ${tool.label}`,
      href: tool.href,
      category: 'Tool',
      keywords: [tool.label, 'tool', 'cursor'],
    });
  }

  items.push({
    id: 'tool-rules-templates',
    title: 'Rules Templates',
    description: 'Curated .cursor/rules and .cursorignore starters for common stacks.',
    href: '/tools/rules-templates',
    category: 'Tool',
    keywords: ['templates', 'rules', 'nextjs', 'python', 'monorepo', 'fintech'],
  });

  const pages: { title: string; description: string; href: string; keywords?: string[] }[] = [
    {
      title: 'Home',
      description: 'Master Cursor. Secure it. Scale it. — community playbook and tools.',
      href: '/',
      keywords: ['cursorcraft', 'home'],
    },
    {
      title: 'Search',
      description: 'Search guides, tools, and pages across CursorCraft.',
      href: '/search',
      keywords: ['search', 'find'],
    },
    ...NAV_LINKS.map((l) => ({
      title: l.label,
      description: `CursorCraft ${l.label} section`,
      href: l.href,
      keywords: [l.label.toLowerCase()],
    })),
  ];

  for (const page of pages) {
    items.push({
      id: `page-${page.href}`,
      title: page.title,
      description: page.description,
      href: page.href,
      category: 'Page',
      keywords: page.keywords,
    });
  }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    items,
  };
}
