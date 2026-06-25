import type { ScoredSearchItem, SearchItem } from './types';

/** Client-side full-text search over a pre-built index (no network calls with user data). */
export function searchItems(items: SearchItem[], query: string, limit = 20): ScoredSearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return items.slice(0, limit).map((item) => ({ item, score: 0 }));
  }

  const terms = q.split(/\s+/).filter(Boolean);

  return items
    .map((item) => {
      let score = 0;
      const title = item.title.toLowerCase();
      const description = item.description.toLowerCase();
      const keywords = (item.keywords ?? []).join(' ').toLowerCase();
      const body = (item.body ?? '').toLowerCase();
      const category = item.category.toLowerCase();

      for (const term of terms) {
        if (title.includes(term)) score += 12;
        if (title.startsWith(term)) score += 8;
        if (keywords.includes(term)) score += 7;
        if (description.includes(term)) score += 5;
        if (category.includes(term)) score += 4;
        if (body.includes(term)) score += 2;
      }

      return { item, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, limit);
}
