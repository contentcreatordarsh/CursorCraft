export type SearchCategory = 'Guide' | 'Tool' | 'Page';

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  href: string;
  category: SearchCategory;
  keywords?: string[];
  body?: string;
}

export interface SearchIndex {
  version: 1;
  generatedAt: string;
  items: SearchItem[];
}

export interface ScoredSearchItem {
  item: SearchItem;
  score: number;
}

export const OPEN_SEARCH_EVENT = 'cursorcraft:open-search';
